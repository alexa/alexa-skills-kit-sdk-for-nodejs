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

import { SessionBehavior } from '../runtime/SessionBehavior';
import { SystemAct, ISystemAct } from '../systemActs/SystemAct';
import { IControlResult } from './interfaces/IControlResult';

/**
 * Represents "what" the system should communicate to the user.
 *
 * This is the output object from the handle and initiative phases and is the
 * intermediate representation passed to the render phase.
 *
 * If the session is not being closed, the ControlResult must contain exactly
 * one `InitiativeAct`.
 */
export class ControlResult implements IControlResult {
    acts: SystemAct[];
    sessionBehavior: SessionBehavior;

    // jsDoc - see class jsDoc.
    constructor(acts: SystemAct[], sessionBehavior: SessionBehavior) {
        this.acts = acts;
        this.sessionBehavior = sessionBehavior;
    }

    // jsDoc - see Object.
    toString(): string {
        return stringifyItems(this.acts);
    }

    /**
     * Determines if the result has an initiative act.
     */
    hasInitiativeAct(): boolean {
        return controlResultHasInitiativeAct(this);
    }

}

/**
 * Builder that creates a ControlResult.
 */
export class ControlResultBuilder {
    acts: SystemAct[];
    sessionBehavior: SessionBehavior;

    constructor(acts?: SystemAct[]) {
        this.acts = acts ?? [];
        this.sessionBehavior = SessionBehavior.OPEN;
    }

    build(): ControlResult {
        return new ControlResult(this.acts, this.sessionBehavior);
    }


    /**
     * Add a system act.
     *
     * Usage:
     *  * If the session needs to be ended, also call `resultBuilder.endSession()`.
     *
     * @param act - System act.
     */
    addAct(act: SystemAct): this {
        if (this.hasInitiativeAct() && act.takesInitiative) {
            throw new Error(`Result already contains an initiative item. (If handle() produced an initiative item and takeInitiative also ran, a common issue is missing 'await').`
              + `Trying to add ${act.toString()}. Existing items: ${stringifyItems(this.acts)}`);
        }
        this.acts.push(act);
        return this;
    }


    /**
     * Force the user session to end.
     *
     * See
     * https://developer.amazon.com/en-US/docs/alexa/echo-button-skills/keep-session-open.html
     *
     * Framework behavior:
     *  * this causes the framework to call
     *    `ask-core.ResponseBuilder.withShouldEndSession(true)`.
     *
     * Skill/device behavior:
     *  * Subsequent utterances will not be routed to the skill.
     *  * A new launch command will start a fresh session.
     *
     */
    endSession(): void {
        this.sessionBehavior = SessionBehavior.END;
    }

    /**
     * Force the user session to immediately enter the idle state.
     *
     * * Framework behavior:
     *  * this causes the framework to call
     *    `ask-core.ResponseBuilder.withShouldEndSession(undefined)`.
     *
     *
     * Skill/device behavior:
     *  * The session remains alive but the microphone is closed.
     *  * The user can interact with the skill but must use the wake-word.
     */
    enterIdleState(): void {
        this.sessionBehavior = SessionBehavior.IDLE;
    }

    // jsDoc - see Object
    toString(): string {
        return stringifyItems(this.acts);
    }

    /**
     * Determines if the result has an initiative act.
     */
    hasInitiativeAct(): boolean {
        return controlResultHasInitiativeAct(this);
    }
}

function controlResultHasInitiativeAct(result: IControlResult): boolean {
    return result.acts.find((item) => item.takesInitiative) !== undefined;
}


function stringifyItems(items: ISystemAct[]) {
    const itemStrs: string[] = [];
    for (const item of items) {
        itemStrs.push(item.toString());
    }
    return `[${itemStrs.join(', ')}]`;
}