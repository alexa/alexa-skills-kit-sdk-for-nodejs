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


import { Control } from '../controls/Control';
import { ControlInput } from '../controls/ControlInput';
import { ListFormatting } from '../intl/ListFormat';
import { ControlResponseBuilder } from '../responseGeneration/ControlResponseBuilder';
import { LiteralContentPayload, RequestChangedValueByListPayload, RequestChangedValuePayload, RequestValueByListPayload, RequestValuePayload, ValueSetPayload } from './PayloadTypes';
import { SystemAct } from './SystemAct';

/**
 * Base type for System Acts that 'take the initiative'.
 *
 * An act is 'taking the initiative' if it represents a direct question or otherwise encourages the user to continue the conversation.
 *
 * Examples:
 *   * RequestValueAct  is-a  InitiativeAct.  Sample prompt: "How many ducks?"       (an explicit question requesting a response)
 *   * NextTaskAct      is-a  InitiativeAct.  Sample prompt: "Next task please."     (this is explicit encouragement to continue)
 *
 * Usage:
 *  * Introduce a new InitiativeAct for any behavior that is not precisely captured by existing acts.
 *    The is no restriction on creating as many act types as necessary for a new control or skill
 *
 *  * An InitiativeAct is not restricted to only represent initiative.  It is valid
 *    to represent both initiative and some content if they are fundamentally connected.
 *    However, it is usual to define separate acts if they can reasonably be used in isolation.
 *
 * Framework behavior:
 *  * The framework requires that every turn includes exactly one InitiativeAct except for
 *    terminal turns that stop the user's session. (by setting ControlResult.sessionBehavior)
 *
 * Remarks:
 *  * Alexa certification policy requires that each turn that leaves the microphone open clearly prompts
 *    the user to reply or continue. Hence an initiative act must always be present and rendered clearly.
 *  * If Alexa's reply doesn't not explicitly encourage the user to continue the conversation, the session must be closed.
 */
export abstract class InitiativeAct extends SystemAct {
    constructor(control: Control){
        super(control, {takesInitiative: true});
    }
}

/**
 * Asks the user to provide a value.
 *
 * Default rendering (en-US): "What value for (renderedTarget)?"
 *
 * Usage:
 *  * If the system already has a value from the user it may be preferable to issue a `RequestChangedValueAct`
 *    which is more specific to that case.
 *  * Typically issued when a Control gains the initiative for the first time and requests a value for the first time.
 */
export class RequestValueAct extends InitiativeAct {
    payload: RequestValuePayload;

    constructor(control: Control, payload?: RequestValuePayload) {
        super(control);
        this.payload = payload ?? {};

    }
    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        if (this.payload.renderedTarget !== undefined){
            controlResponseBuilder.addPromptFragment(`What value for ${this.payload.renderedTarget}.`);
        }
        else {
            throw new Error(`Cannot directly render RequestValueAct as payload.renderedTarget is undefined. ${this.toString()}. `
            + `Either provide a renderedTarget when creating the act, or render the act in control.render() or controlManager.render()`);
        }
    }
}

/**
 * Asks the user to provide a new/updated value.
 *
 * Default rendering (en-US): "What is the new value for (renderedTarget)?"
 *
 * Usage:
 *  * Typically issued in response to the user saying they want to change a value, e.g. "U: Please change the event date."
 */
export class RequestChangedValueAct extends InitiativeAct {
    payload: RequestChangedValuePayload;

    constructor(control: Control, payload: RequestChangedValuePayload) {
        super(control);
        this.payload = payload;
    }
    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        if (this.payload.renderedTarget !== undefined){
            controlResponseBuilder.addPromptFragment(`What is the new value for ${this.payload.renderedTarget}.`);
        }
        else {
            throw new Error(`Cannot directly render RequestChangedValueAct as payload.renderedTarget is undefined. ${this.toString()}. `
            + `Either provide a renderedTarget when creating the act, or render the act in control.render() or controlManager.render()`);
        }
    }
}


/**
 * Asks the user to provide a value by speaking and showing items in the form of a list.
 *
 * Default rendering (en-US): "What value for (renderedTarget)? Choices include (renderedChoices)."
 *
 * Usage:
 *  * Typically issued when a Control gains the initiative for the first time and requests a value for the first time.
 *  * If the system already has a value from the user it may be preferable to issue a `RequestChangedValueAct`
 *    which is more specific to that case.
 */
export class RequestValueByListAct extends InitiativeAct {
    payload: RequestValueByListPayload;

    constructor(control: Control, payload: RequestValueByListPayload) {
        super(control);
        this.payload = payload;
    }
    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        if (this.payload.renderedTarget !== undefined && this.payload.renderedChoices !== undefined){
            controlResponseBuilder.addPromptFragment(`What value for ${this.payload.renderedTarget}? Choices include ${this.payload.renderedChoices}.`);
        }
        else {
            throw new Error(`Cannot directly render RequestValueByList as payload.renderedTarget and/or payload.renderedChoices is undefined. ${this.toString()}. `
            + `Either provide a renderedTarget when creating the act, or render the act in control.render() or controlManager.render()`);
        }
    }
}

/**
 * Asks the user to provide a new/updated value by speaking and showing items in the form of a list.
 *
 * Default rendering (en-US): "What is the new value for (renderedTarget)? Choices include (renderedChoices)."
 *
 * Usage:
 *  * Typically issued when a Control gains the initiative for the first time and requests a value for the first time.
 *  * If the system already has a value from the user it may be preferable to issue a `RequestChangedValueAct`
 *    which is more specific to that case.
 */
export class RequestChangedValueByListAct extends InitiativeAct {
    payload: RequestChangedValueByListPayload;

    constructor(control: Control, payload: RequestChangedValueByListPayload) {
        super(control);
        this.payload = payload;
    }
    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        if (this.payload.renderedTarget !== undefined){
            controlResponseBuilder.addPromptFragment(`What is the new value for ${this.payload.renderedTarget}? Choices include ${ListFormatting.format(this.payload.choicesFromActivePage)}.`);
        }
        else {
            throw new Error(`Cannot directly render RequestChangeValueByList as payload.renderedTarget is undefined. ${this.toString()}. `
            + `Either provide a renderedTarget when creating the act, or render the act in control.render() or controlManager.render()`);
        }
    }
}

/**
 * An initiative act that asks the user if a value is correct.
 *
 * Defaults:
 *  * The repromptFragment defaults to be identical to promptFragment.
 *
 */
export class ConfirmValueAct<T> extends InitiativeAct {
    payload: ValueSetPayload<T>;

    constructor(control: Control, payload: ValueSetPayload<T>) {
        super(control);
        this.payload = payload;
    }
    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        controlResponseBuilder.addPromptFragment(`Was that ${this.payload.value}?`);
    }
}

/**
 * An initiative act that defines literal prompt and reprompt fragments.
 *
 * Defaults:
 *  * The repromptFragment defaults to be identical to promptFragment.
 *
 * Usage:
 *  * Use LiteralInitiativeAct only in simple situations where it would be annoying
 *    to create a new custom act only to have a single way to render it.
 *  * In contrast, specific initiative acts convey information more clearly,
 *    maintain controller/view separation and can often be reused in additional scenarios.
 */
export class LiteralInitiativeAct extends InitiativeAct {
    payload: LiteralContentPayload;

    constructor(control: Control, payload: LiteralContentPayload) {
        super(control);
        this.payload = {
            promptFragment: payload.promptFragment,
            repromptFragment: payload.repromptFragment ?? payload.promptFragment
        };
    }
    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        controlResponseBuilder.addPromptFragment(this.payload.promptFragment);
        controlResponseBuilder.addRepromptFragment(this.payload.repromptFragment!);
    }
}

/**
 * An initiative act that suggests a specific value with a asks yes/no question.
 *
 * Defaults:
 *  * The repromptFragment defaults to be identical to promptFragment.
 *
 *
 */
export class SuggestValueAct<T> extends InitiativeAct {
    payload: ValueSetPayload<T>;

    constructor(control: Control, payload: ValueSetPayload<T>) {
        super(control);
        this.payload = payload;
    }
    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        // TODO: bug: change the message to i18n
        controlResponseBuilder.addPromptFragment(`Did you perhaps mean ${this.payload.value}?`);
    }
}
