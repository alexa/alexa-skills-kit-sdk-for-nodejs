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
import { ControlResponseBuilder } from '../responseGeneration/ControlResponseBuilder';
import { InvalidValuePayload, LiteralContentPayload, ProblematicInputValuePayload, ValueChangedPayload, ValueSetPayload } from './PayloadTypes';
import { SystemAct } from './SystemAct';

/**
 * Base type for System Acts that provides 'content' or 'simple information'.
 *
 * An act is 'content' if it does not directly encourage the user to reply.
 *
 * Examples:
 *   * ApologyAct  is-a  ContentAct.  Sample prompt: "A: Sorry, my mistake."         (simple information, no encouragement to continue)
 *   * WeatherAct  is-a  ContentAct.  Sample prompt: "A: The weather will be warm."  (business content, no encouragement to continue)
 *
 * Framework behavior:
 *  * The framework requires that every turn includes exactly one InitiativeAct except for
 *    terminal turns that stop the user's session by setting `ControlResult.sessionBehavior`.
 */
export abstract class ContentAct extends SystemAct {
    constructor(control: Control){
        super(control, {takesInitiative: false});
    }
}

/**
 * Communicates that an input cannot be consumed.
 *
 * Typically, 'invalid input' means that the input cannot be consumed given the current state of the skill and the input will be ignored.
 *
 * Default rendering (en-US): "Sorry, (renderedReason)."
 *
 * Usage:
 *  * Controls should override the render and provide more detail about the specific problem by rendering
 *    the reasonCode.
 *
 * Example:
 *   * A list control offers three options but the user says "The fourth one".
 */
export class UnusableInputValueAct<T> extends ContentAct {
    public readonly payload: ProblematicInputValuePayload<T>;

    constructor(control: Control, payload: ProblematicInputValuePayload<T>) {
        super(control);
        this.payload = payload;
    }

    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        if (this.payload.renderedReason !== undefined){
            controlResponseBuilder.addPromptFragment(`Sorry, ${this.payload.renderedReason}.`);
        }
        else {
            throw new Error(`Cannot directly render UnusableInputAct as payload.renderedReason is undefined. ${this.toString()}. `
            + `Either provide a renderedReason when creating the act, or render the act in control.render() or controlManager.render()`);
        }
    }
}


/**
 * Communicates that input was received an interpreted successfully.
 *
 * Default rendering (en-US): "OK."
 *
 * Usage:
 *  * Often a more specific act (e.g. ValueSetAct) will be used to describe more
 *    precisely what was understood and acted upon.
 *  * Do not issue `AcknowledgeInputAct` if another act has been issued that
 *    also conveys that the user's input was received and interpreted successfully.
 */
export class AcknowledgeInputAct extends ContentAct {
    constructor(control: Control) {
        super(control);
    }

    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        controlResponseBuilder.addPromptFragment('OK.');
    }
}

/**
 * Communicates that a value was received and recorded.
 *
 * This act does not imply that the value is valid or otherwise meets
 * any requirements.  It merely communicates successful reception.
 *
 * This act implies that there was no significant ambiguity.  In situations were
 * ambiguity is present a more specific act should be created and issued to communicate
 * that clearly to the user.
 *
 * Default rendering (en-US): "OK, (value)".
 *
 * Usage:
 *  * If received value overrides a value previously obtained from the user
 *    it is preferable to issue a `ValueChangedAct` which is more specific to that case.
 *  * Typically issued when a Control elicits a value from the user and the
 *    user replies directly.
 *  * Also issued when the user provides data on their own initiative which
 *    can be interpreted unambiguously, e.g. "U: Send it on Thursday".
 */
export class ValueSetAct<T> extends ContentAct {
    public readonly payload: ValueSetPayload<T>;

    constructor(control: Control, payload: ValueSetPayload<T>) {
        super(control);
        this.payload = payload;
    }

    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        controlResponseBuilder.addPromptFragment(`OK, ${this.payload.value}.`);
    }
}

/**
 * Communicates that a value was received and recorded as a change to previously obtained information.
 *
 * This act does not imply that the value is valid or otherwise meets
 * any requirements.  It merely communicates successful reception.
 *
 * This act implies that there was no significant ambiguity.  In situations were
 * ambiguity is present a more specific act should be created and issued to communicate
 * that clearly to the user.
 *
 * Default rendering (en-US): "OK, updated to (value)."
 *
 * Usage:
 *  * Typically issued when a user explicitly changes a value, e.g. 'actually change it to tomorrow'.
 *  * Also issued when the user provides data on their own initiative which override previous data
 *    e.g. "U: Send it Monday" ... then later ...  "U: Send it on Thursday".
 */
export class ValueChangedAct<T> extends ContentAct {
    payload: ValueChangedPayload<T>;

    constructor(control: Control, payload: ValueChangedPayload<T>) {
        super(control);
        this.payload = payload;
    }

    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        controlResponseBuilder.addPromptFragment(`OK, updated to ${this.payload.value}.`);
    }
}



// TODO: refactor: DateRangeSetAct to be ValueSetAct<DateRangeValue>
// TODO: refactor: DateRangeChangeAct to be ValueChangeAct<DateRangeValue>

/**
 * Communicates that a date range was received and recorded.
 *
 * This act does not imply that the value is valid or otherwise meets
 * any requirements.  It merely communicates successful reception.
 *
 * This act implies that there was no significant ambiguity.  In situations were
 * ambiguity is present a more specific act should be created and issued to communicate
 * that clearly to the user.
 *
 * Default rendering (en-US): "OK, (value)".
 *
 * Usage:
 *  * If received value overrides a value previously obtained from the user
 *    it is preferable to issue a `ValueChangedAct` which is more specific to that case.
 *  * Typically issued when a Control elicits a value from the user and the
 *    user replies directly.
 *  * Also issued when the user provides data on their own initiative which
 *    can be interpreted unambiguously, e.g. "U: Send it on Thursday".
 */
export class DateRangeSetAct extends ContentAct {
    public readonly startDate: string | undefined;
    public readonly endDate: string | undefined;

    constructor(control: Control, start: string | undefined, end: string | undefined) {
        super(control);
        this.startDate = start;
        this.endDate = end;
    }

    render(input: ControlInput, responseBuilder: ControlResponseBuilder): void {
        throw new Error('This is not intended to be called. Rendering is controlled by the Control itself.');
    }
}

/**
 * Communicates that a date range was received and recorded as a change to previously obtained information.
 *
 * This act does not imply that the value is valid or otherwise meets
 * any requirements.  It merely communicates successful reception.
 *
 * This act implies that there was no significant ambiguity.  In situations were
 * ambiguity is present a more specific act should be created and issued to communicate
 * that clearly to the user.
 *
 * Default rendering (en-US): "OK, updated to (value)."
 *
 * Usage:
 *  * Typically issued when a user explicitly changes a value, e.g. 'actually change it to tomorrow'.
 *  * Also issued when the user provides data on their own initiative which override previous data
 *    e.g. "U: Send it Monday" ... then later ...  "U: Send it on Thursday".
 */
export class DateRangeChangedAct extends ContentAct {
    public readonly startDate: string | undefined;
    public readonly endDate: string | undefined;
    public readonly priorStartDate: string | undefined;
    public readonly priorEndDate: string | undefined;

    constructor(control: Control, start: string | undefined, end: string | undefined, priorStart: string | undefined, priorEnd: string | undefined) {
        super(control);
        this.startDate = start;
        this.priorStartDate = priorStart;
        this.endDate = end;
        this.priorEndDate = priorEnd;
    }

    render(input: ControlInput, responseBuilder: ControlResponseBuilder): void {
        throw new Error('This is not intended to be called. Rendering is controlled by the Control itself.');
    }
}

/**
 * Communicates that a value is invalid.
 *
 * Typically, 'invalid' means that a value cannot be used in business functions with the implication that it
 * must be corrected or retracted before the user can complete their task.
 *
 * Note that a value can become invalid due to external causes as the validation rules can access other controls and context.
 *
 * Default rendering (en-US): "Sorry, (renderedReason)."
 *
 * Usage:
 *  * Controls should override the render and provide more detail about the specific problem by rendering
 *    the reasonCode.
 */
export class InvalidValueAct<T> extends ContentAct {
    public readonly payload: InvalidValuePayload<T>;

    constructor(control: Control, payload: InvalidValuePayload<T>) {
        super(control);
        this.payload = payload;
    }

    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        if (this.payload.renderedReason !== undefined){
            controlResponseBuilder.addPromptFragment(`Sorry, ${this.payload.renderedReason}.`);
        }
        else {
            throw new Error(`Cannot directly render InvalidValueAct as payload.renderedReason is undefined. ${this.toString()}. `
            + `Either provide a renderedReason when creating the act, or render the act in control.render() or controlManager.render()`);
        }
    }
}

/**
 * Communicates that a value has been positively confirmed.
 *
 * Default rendering (en-US): "Great."
 *
 * Usage:
 *  * Typically issued when the system issued a ConfirmValueAct and received an `affirm` in reply.
 *  * May also be issued in cases where the user repeats a value which is interpreted as confirmation.
 *
 * Example:
 * ```
 * "A: Did you say three?"    ConfirmValueAct
 * "U: Yes"                   GeneralControlIntent( feedback = affirm )
 * "A: Great. <initiative>."  ValueConfirmedAct, <InitiativeAct>
 * ```
 */
export class ValueConfirmedAct<T> extends ContentAct {
    payload: ValueSetPayload<T>;
    constructor(control: Control, payload: ValueSetPayload<T>) {
        super(control);
        this.payload = payload;
    }

    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        controlResponseBuilder.addPromptFragment('Great.');
    }
}

/**
 * Communicates that a value has been disconfirmed.
 *
  * Default rendering (en-US): "My mistake."
 *
 * Usage:
 *  * Typically issued when the system issued a ConfirmValueAct and received a `disaffirm` in reply.
 *  * Also issued when the users realizes that a value is incorrect and corrects it directly "No, that should be three"
 *
 * Example:
 * ```
 * "A: Did you say three?"         ConfirmValueAct
 * "U: No."                        GeneralControlIntent( feedback = disaffirm )
 * "A: My mistake. <initiative>."  ValueDisconfirmedAct, <InitiativeAct>
 * ```
 */
export class ValueDisconfirmedAct<T> extends ContentAct {
    payload: ValueSetPayload<T>;
    constructor(control: Control, payload: ValueSetPayload<T>) {
        super(control);
        this.payload = payload;
    }

    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        controlResponseBuilder.addPromptFragment('My mistake.');
    }
}

/**
 * Communicates that a confusing value confirmation was received.
 *
 * Default rendering (en-US): "I'm confused whether you want (value1) or (value2)."
 *
 * Usage:
 *  * Typically issued when the system issued a ConfirmValueAct and received an `affirm` in reply with a different value .
 *
 * Example:
 * ```
 * "A: Did you say three?"             ConfirmValueAct
 * "U: Yes, four"                      AMAZON_NUMBER_ValueControlIntent( feedback = affirm, AMAZON.NUMBER = 4 )
 * "A: I'm confused... <initiative>."  ValueConfirmedAct, <InitiativeAct>
 * ```
 */
export class InformConfusingConfirmationAct<T> extends ContentAct {
    payload: ProblematicInputValuePayload<T>;
    constructor(control: Control, payload: ProblematicInputValuePayload<T>) {
        super(control);
        this.payload = payload;
    }

    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        controlResponseBuilder.addPromptFragment(`I'm confused whether you want ${this.control.state.value} or ${this.payload.value}.`);
    }
}

/**
 * Communicates that a confusing value disconfirmation was received.
 *
 * Default rendering (en-US): "I'm confused whether you want (value) or not."
 *
 * Usage:
 *  * Typically issued when the system issued a ConfirmValueAct and received an `disaffirm` in reply with the mentioned value repeated.
 *
 * Example:
 * ```
 * "A: Did you say three?"             ConfirmValueAct
 * "U: No, three"                      AMAZON_NUMBER_ValueControlIntent( feedback = affirm, AMAZON.NUMBER = 4 )
 * "A: I'm confused... <initiative>."  ValueConfirmedAct, <InitiativeAct>
 * ```
 */
export class InformConfusingDisconfirmationAct<T> extends ContentAct {
    payload: InvalidValuePayload<T>;
    constructor(control: Control, payload: ProblematicInputValuePayload<T>) {
        super(control);
        this.payload = payload;
    }

    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        controlResponseBuilder.addPromptFragment(`I'm confused whether you want ${this.control.state.value} or not.`);
    }
}

/**
 * Communicates that a value was received which is considered to be problematic.
 *
 * Default rendering (en-US): "I'm really sorry but I heard (value) again."
 *
 * Usage:
 *  * Typically issued if the user has already disconfirmed that value but we hear it again.
 *
 * "U: three"
 * "A: Did you say three?"
 * "U: No"
 * "A: My mistake, how many would you like?"
 * "U: three"
 * "A: I'm really sorry but I heard three again."
 */
export class ProblematicInputValueAct<T> extends ContentAct {
    payload: ProblematicInputValuePayload<T>;
    constructor(control: Control, payload: ProblematicInputValuePayload<T>) {
        super(control);
        this.payload = payload;
    }

    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        controlResponseBuilder.addPromptFragment(`I'm really sorry but I heard ${this.payload.value} again.`);
    }
}

/**
 * Communicates that the user's input could not be understood.
 *
 * Default rendering (en-US): "Sorry I didn't understand that."
 *
 * Usage:
 * * Typically issued in response to AMAZON.FallbackIntent.
 * * May also be issued as a generic response when an input doesn't make any
 *   sense given the state of the skill.
 *
 * Example 1:
 * "U: <gibberish>"  AMAZON.FallbackIntent
 * "A: Sorry I didn't understand that."
 *
 * Example 2:
 * "U: change Bob to Frank" ... but no Control is tracking a value of "Bob"
 * "A: Sorry I didn't understand that."
 */
export class NonUnderstandingAct extends ContentAct {
    constructor(control: Control) {
        super(control);
    }

    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        controlResponseBuilder.addPromptFragment('Sorry I didn\'t understand that.');
    }
}

/**
 * Communicates that the skill was launched.
 *
 * Default rendering (en-US): "Welcome."
 */
export class LaunchAct extends ContentAct {
    constructor(control: Control) {
        super(control);
    }

    render(input: ControlInput, controlResponseBuilder: ControlResponseBuilder): void {
        controlResponseBuilder.addPromptFragment('Welcome.');
    }
}



/**
 * Communicates an arbitrary message to the user.
 *
 * Default:
 *  * The repromptFragment defaults to be identical to promptFragment.
 *
 * Usage:
 *  * Use LiteralContentAct only in simple situations where it would be annoying
 *    to create a new custom act only to have a single way to render it.
 *  * In contrast, specific content acts convey information more clearly,
 *    maintain controller/view separation and can often be reused in additional scenarios.
 *
 */
export class LiteralContentAct extends ContentAct {
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
