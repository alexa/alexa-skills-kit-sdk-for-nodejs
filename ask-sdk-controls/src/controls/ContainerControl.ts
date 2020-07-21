/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */


import _ from "lodash";
import { InputUtil } from '..';
import { Logger } from '../logging/Logger';
import { Control, ControlProps, ControlState } from './Control';
import { ControlInput } from './ControlInput';
import { ControlResultBuilder } from './ControlResult';
import { IContainerControl } from './interfaces/IContainerControl';
import { ControlStateDiagramming } from './mixins/ControlStateDiagramming';

const log = new Logger('AskSdkControls:ContainerControl');



/**
 * Records the turn that a child control did something of interest.
 */
interface ChildActivityRecord {
    controlId: string;
    turnNumber: number;
}

/**
 * Container state for use in arbitration
 */
export class ContainerControlState implements ControlState {
    value?: any;
    lastHandlingControl?: ChildActivityRecord;  // TODO: naming: change to lastHandlingControlInfo | lastHandlingControlRecord
    lastInitiativeChild?: ChildActivityRecord;  // ditto.
}

export class ContainerControlProps implements ControlProps {
    id: string;
}

export class ContainerControlCompleteProps implements ControlProps {
    id: string;
}


/**
 *  A control that uses and manages child controls.
 *
 *  Default logic of `decideHandlingChild()` & `decideInitiativeChild()`:
 *   1. Choose the most-recent initiative control if is a candidate.
 *   2. Otherwise, choose the first candidate in the positional order of the
 *      `this.children` array.
 *   3. In the special case of `input = FallbackIntent`, only the most-recent
 *      initiative control is considered. If it is not a candidate, then no
 *      child is selected.
 *
 *  Usage:
 *  - Container controls can and should add high-level behaviors and respond to
 *    high-level requests such as multi-valued intents.
 *
 *  - Container controls should forward simple inputs to the child controls
 *    whenever possible in order to share the load and achieve scalable logic.
 *
 *  - Container controls should explicitly decide which child will handle an
 *    input or take the initiative in situations where there are multiple
 *    children that respond `canHandle = true` or `canTakeInitiative = true`.
 *
 */
export class ContainerControl extends Control implements IContainerControl, ControlStateDiagramming {
    state: ContainerControlState;
    children: Control[] = [];

    rawProps: ContainerControlProps;
    props: ContainerControlCompleteProps;
    selectedHandlingChild: Control | undefined;
    selectedInitiativeChild: Control | undefined;

    // jsDoc: see `Control`
    constructor(props: ContainerControlProps) {
        super(props.id);
        this.rawProps = props;
        this.props = ContainerControl.mergeWithDefaultProps(props);
        this.state = new ContainerControlState();
    }

    static mergeWithDefaultProps(props: ContainerControlProps): any {
        const defaults: ContainerControlCompleteProps =
        {
            id: 'dummy',
        };
        return _.merge(defaults, props);
    }

    /**
     * Add a control as a child.
     *
     * @param control - Control
     * @returns the container
     */
    addChild(control: Control): this {
        this.children.push(control);
        return this;
    }

    // jsDoc: see `Control`
    async canHandle(input: ControlInput): Promise<boolean> {
        return this.canHandleByChild(input);
    }

    // jsDoc: see `Control`
    async handle(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        return this.handleByChild(input, resultBuilder);
    }

    // jsDoc: see `Control`
    async canTakeInitiative(input: ControlInput): Promise<boolean> {
        return this.canTakeInitiativeByChild(input);
    }

    // jsDoc: see `Control`
    async takeInitiative(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        return this.takeInitiativeByChild(input, resultBuilder);
    }

    // jsDoc: see `ControlStateDiagramming`
    stringifyStateForDiagram(): string {
        return ''; // nothing special to report.
    }


    /**
     * Determines if a child control can handle the request.
     *
     * From the candidates that report `canHandle = true`, a winner is selected
     * by `this.decideHandlingChild(candidates)`.
     *
     * The selected "winner" is recorded in `this.selectedHandlingChild`.
     *
     * @param input - Input
     */
    async canHandleByChild(input: ControlInput): Promise<boolean> {
        const candidates = await this.gatherHandlingCandidates(input);
        this.selectedHandlingChild = await this.decideHandlingChild(candidates, input);
        if (this.selectedHandlingChild !== undefined) {
            log.debug(`${this.id} canHandleByChild=true. selectedHandlingChild = ${this.selectedHandlingChild.id}`);
            return true;
        }

        log.debug(`${this.id} canHandleByChild=false.`);
        return false;

    }

    /**
     * Delegates handling of the request to the child control selected during
     * canHandleByChild.
     *
     * @param input - Input
     * @param resultBuilder - Response builder.
     */
    async handleByChild(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        if (!this.selectedHandlingChild) {
            throw new Error('this.selectedHandlingChild is undefined. Did you call canHandle() first? Did it update this.selectedHandlingChild?');
        }

        await this.selectedHandlingChild.handle(input, resultBuilder);
        this.state.lastHandlingControl = { controlId: this.selectedHandlingChild.id, turnNumber: input.turnNumber };

        if (resultBuilder.hasInitiativeAct()){
            this.state.lastInitiativeChild = { controlId: this.selectedHandlingChild.id, turnNumber: input.turnNumber };
        }

        return;
    }

    /**
     * Calls canHandle on each child control to determine the candidates for
     * delegation.
     * @param input - Input
     */
    async gatherHandlingCandidates(input: ControlInput): Promise<Control[]> {
        const candidates: Control[] = [];
        for (const child of this.children) {
            const response = await child.canHandle(input);
            if (response) {
                candidates.push(child);
            }
        }
        return candidates;
    }

    /**
     * Decides a winner from the canHandle candidates.
     *
     * The candidates should be all the child controls for which
     * `canHandle(input) = true`
     *
     * Default logic:
     *  1. Choose the  most-recent initiative control if is a candidate.
     *  2. Otherwise, choose the first candidate in the positional order of the
     *     `this.children` array.
     *  3. In the special case of input===FallbackIntent, only the most-recent
     *     initiative control is considered. If it is not a candidate, then no
     *     child is selected and this method returns undefined.
     *
     * Remarks:
     *  * The special case for FallbackIntent exists because that intent is not
     *    user-initiative -- rather it indicates a failure to understanding the
     *    user.  In cases of misunderstanding, only active controls should be
     *    considered.
     *
     * @param candidates - The child controls that reported `canHandle = true`
     * @param input - Input
     */
    async decideHandlingChild(candidates: Control[], input: ControlInput): Promise<Control | undefined> {
        if (candidates.length === 0) {
            return undefined;
        }
        if (InputUtil.isFallbackIntent(input)) {
            const last = tryGetForId(candidates, this.state.lastInitiativeChild?.controlId);
            return last ? last : undefined;
        }
        const mruMatch = tryGetForId(candidates, this.state.lastInitiativeChild?.controlId);
        return mruMatch ?? candidates[0];
    }


    /**
     * Determines if a child control can take the initiative.
     *
     * From the candidates that report `canTakeInitiative = true`, a winner is selected
     * by `this.decideInitiativeChild(candidates)`.
     *
     * The selected "winner" is recorded in `this.selectedInitiativeChild`.
     *
     * @param input - Input
     */
    async canTakeInitiativeByChild(input: ControlInput): Promise<boolean> {
        const candidates = await this.gatherInitiativeCandidates(input);
        this.selectedInitiativeChild = await this.decideInitiativeChild(candidates, input);
        if (this.selectedInitiativeChild !== undefined) {
            log.debug(`${this.id} canTakeInitiative=true. this.selectedInitiativeChild = ${this.selectedInitiativeChild.id}`);
            return true;
        }
        else {
            log.debug(`${this.id} canTakeInitiative=false. No child wants it`);
            return false;
        }
    }

    /**
     * Delegates initiative generation to the child control selected during
     * canHandleByChild.
     *
     * @param input - Input
     * @param resultBuilder - Response builder.
     */
    async takeInitiativeByChild(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        if (!this.selectedInitiativeChild) {
            throw new Error('this.selectedInitiativeChild is undefined. Did you call canTakeInitiative() first? Did it update this.selectedInitiativeChild?');
        }
        await this.selectedInitiativeChild.takeInitiative(input, resultBuilder);
        this.state.lastInitiativeChild = { controlId: this.selectedInitiativeChild.id, turnNumber: input.turnNumber };

        return;
    }

    /**
     * Calls canTakeInitiative on each child control to determine the candidates
     * for delegation.
     * @param input - Input
     */
    async gatherInitiativeCandidates(input: ControlInput): Promise<Control[]> {
        const candidates: Control[] = [];
        for (const child of this.children) {
            const response = await child.canTakeInitiative(input);
            if (response) {
                candidates.push(child);
            }
        }
        return candidates;
    }

    /**
     * Decide a winner from the canTakeInitiative candidates.
     *
     * The eligible candidates are child controls for which
     * `canTakeInitiative(input) = true`.
     *
     * Default logic:
     *  1. choose the most-recent initiative control if is a candidate.
     *  2. otherwise choose the first candidate in the positional order of the
     *     `this.children` array.
     *
     * @param candidates - The child controls that reported `canTakeInitiative = true`
     * @param input - Input
     */
    async decideInitiativeChild(candidates: Control[], input: ControlInput): Promise<Control | undefined> {
        if (candidates.length === 0) {
            return undefined;
        }
        const mruMatch = tryGetForId(candidates, this.state.lastInitiativeChild?.controlId);
        return mruMatch ?? candidates[0];
    }
}

/**
 * Returns the control with `id = childID` if it exists
 *
 * @param controls - Controls
 * @param childId - The id to match
 */
export function tryGetForId(controls: Control[], childId?: string) {
    if (childId === undefined) {
        return undefined;
    }
    return controls.find(c => c.id === childId);
}
