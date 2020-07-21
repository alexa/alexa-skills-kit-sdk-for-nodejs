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

import { Intent, IntentRequest } from "ask-sdk-model";
import i18next from 'i18next';
import _ from "lodash";
import { AmazonBuiltInSlotType, DeepRequired, falseIfGuardFailed, InputUtil, okIf, SingleValueControlIntent, unpackSingleValueControlIntent } from '..';
import { Strings as $ } from "../constants/Strings";
import { Control, ControlProps, ControlState } from '../controls/Control';
import { ControlInput } from '../controls/ControlInput';
import { ControlResultBuilder } from '../controls/ControlResult';
import { InteractionModelContributor } from '../controls/mixins/InteractionModelContributor';
import { ValidationResult } from '../controls/ValidationResult';
import { GeneralControlIntent, unpackGeneralControlIntent } from '../intents/GeneralControlIntent';
import { ControlInteractionModelGenerator } from '../interactionModelGeneration/ControlInteractionModelGenerator';
import { ModelData, SharedSlotType } from '../interactionModelGeneration/ModelTypes';
import { Logger } from '../logging/Logger';
import { ControlResponseBuilder } from '../responseGeneration/ControlResponseBuilder';
import { InformConfusingConfirmationAct, InformConfusingDisconfirmationAct, InvalidValueAct, ProblematicInputValueAct, ValueConfirmedAct, ValueDisconfirmedAct, ValueSetAct } from "../systemActs/ContentActs";
import { ConfirmValueAct, RequestValueAct, SuggestValueAct } from '../systemActs/InitiativeActs';
import { SystemAct } from '../systemActs/SystemAct';
import { StringOrList } from '../utils/BasicTypes';


const log = new Logger('AskSdkControls:NumberControl');


/**
 * Props for a NumberControl.
 */
export interface NumberControlProps extends ControlProps {

    /**
     * Unique identifier for control instance
     */
    id: string;

    /**
     * Function(s) that determine if the value is valid.
     *
     * Default: `true`, i.e. any value is valid.
     *
     * Usage:
     * - Validation functions return either `true` or a `ValidationResult` to
     *   describe what validation failed.
     */
    validation?: NumberValidationFunction | NumberValidationFunction[];

    /**
     * Determines if the Control must obtain a value.
     *
     * If `true`:
     *  - the Control report isReady() = false if no value has been obtained.
     *  - the control will take the initiative when given the opportunity.
     */
    required?: boolean | ((input: ControlInput) => boolean);

    /**
     * Props to customize the prompt fragments that will be added by `this.renderAct()`.
     */
    prompts?: NumberControlPromptsProps;


    /**
     * Props to customize the reprompt fragments that will be added by `this.renderAct()`.
     */
    reprompts?: NumberControlPromptsProps;

    /**
     * Whether the Control has to obtain explicit confirmation of the value.
     *
     * If `true`:
     *  - the Control will report `isReady() = false` if the value has not been
     *    explicitly confirmed as correct by user.
     *  - the Control will take the initiative when given the opportunity.
     */
    confirmationRequired?: boolean | NumberConfirmationRequireFunction;

    // TODO: feature. generalize this to "valueToSuggest"
    /**
     * List of value-pairs that are known to be frequently misunderstood by NLU
     *
     * Control behavior:
     * - If the user disaffirms one value of a pair, the other will be
     *   suggested.
     */
    ambiguousPairs?: Array<[number, number]>;

    /**
     * Props to customize the relationship between the control and the
     * interaction model.
     */
    interactionModel?: NumberControlInteractionModelProps;
}

/**
 * NumberControl validation function
 */
export type NumberValidationFunction = (state: NumberControlState, input: ControlInput) => true | ValidationResult;

/**
 * NumberControl isRequired function
 */
export type NumberConfirmationRequireFunction = (state: NumberControlState, input: ControlInput) => boolean;


/**
 * Mapping of action slot values to the behaviors that this control supports.
 *
 * Behavior:
 * - This control will not handle an input if the action-slot is filled with an
 *   value whose ID is not associated with a capability.
 */
export type NumberControlActionProps = {
    /**
     * Action slot value IDs that are associated with the "set value" capability.
     *
     * Default: ['builtin_set']
     */
    set?: string[];

    /**
     * Action slot value IDs that are associated with the "change value" capability.
     *
     * Default ['builtin_change']
     */
    change?: string[];
};

/**
 * Props associated with the interaction model.
 */
export interface NumberControlInteractionModelProps {
    /**
     * Target-slot values associated with this Control.
     *
     * Targets associate utterances to a control. For example, if the user says
     * "change the time", it is parsed as a `GeneralControlIntent` with slot
     * values `action = change` and `target = time`.  Only controls that are
     * registered with the `time` target should offer to handle this intent.
     *
     * Default: ['builtin_it']
     *
     * Usage:
     * - If this prop is defined, it replaces the default; it is not additive
     *   the defaults.  To add an additional target to the defaults, copy the
     *   defaults and amend.
     * - A control can be associated with many target-slot-values, eg ['date',
     *   'startDate', 'eventStartDate', 'vacationStart']
     * - It is a good idea to associate with general targets (e.g. date) and
     *   also with specific targets (e.g. vacationStart) so that the user can
     *   say either general or specific things.  e.g. 'change the date to
     *   Tuesday', or 'I want my vacation to start on Tuesday'.
     * - The association does not have to be exclusive, and general target slot
     *   values will often be associated with many controls. In situations where
     *   there is ambiguity about what the user is referring to, the parent
     *   controls must resolve the confusion.
     * - The 'builtin_*' IDs are associated with default interaction model data
     *   (which can be extended as desired). Any other IDs will require a full
     *   definition of the allowed synonyms in the interaction model.
     *
     * Control behavior:
     * - A control will not handle an input that mentions a target that is not
     *   registered by this prop.
     *
     */
    targets?: string[];

    /**
     * Action slot-values associated to the control's capabilities.
     *
     * Action slot-values associate utterances to a control. For example, if the
     * user says "change the time", it is parsed as a `GeneralControlIntent`
     * with slot values `action = change` and `target = time`.  Only controls
     * that are registered with the `change` action should offer to handle this
     * intent.
     *
     * Usage:
     *  - This allows users to refer to an action using more domain-appropriate
     *    words. For example, a user might like to say 'show two items' rather
     *    that 'set item count to two'.  To achieve this, include the
     *    slot-value-id 'show' in the list associated with the 'set' capability
     *    and ensure the interaction-model includes an action slot value with
     *    id=show and appropriate synonyms.
     *  - The 'builtin_*' IDs are associated with default interaction model data
     *    (which can be extended as desired). Any other IDs will require a full
     *    definition of the allowed synonyms in the interaction model.
     */
    actions?: NumberControlActionProps;
}

/**
 * Props to customize the prompt fragments that will be added by `this.renderAct()`.
 */
export interface NumberControlPromptsProps {
    requestValue?: StringOrList | ((act: RequestValueAct, input: ControlInput) => StringOrList);
    confirmValue?: StringOrList | ((act: ConfirmValueAct<number>, input: ControlInput) => StringOrList);
    valueDisconfirmed?: StringOrList | ((act: ValueDisconfirmedAct<number>, input: ControlInput) => StringOrList);
    valueSet?: StringOrList | ((act: ValueSetAct<number>, input: ControlInput) => StringOrList);
    valueConfirmed?: StringOrList | ((act: ValueConfirmedAct<number>, input: ControlInput) => StringOrList);
    suggestValue?: StringOrList | ((act: SuggestValueAct<number>, input: ControlInput) => StringOrList);
    informConfusingDisconfirmation?: StringOrList | ((act: InformConfusingDisconfirmationAct<number>, input: ControlInput) => StringOrList);
    informConfusingConfirmation?: StringOrList | ((act: InformConfusingConfirmationAct<number>, input: ControlInput) => StringOrList);
    problematicInputValue?: StringOrList | ((act: ProblematicInputValueAct<number>, input: ControlInput) => StringOrList);
    invalidValue?: StringOrList | ((act: InvalidValueAct<number>, input: ControlInput) => StringOrList);
}

/**
 * State tracked by a NumberControl.
 */
export class NumberControlState implements ControlState {

    /**
     * The value, an integer.
     */
    value?: number;

    /**
     * Tracks whether the value has been explicitly confirmed by the user.
     */
    isValueConfirmed: boolean = false;

    /**
     * Tracks the last initiative act from the control
     */
    activeInitiativeAct?: string;

    /**
     * Tracks the values the user disconfirmed.
     */
    rejectedValues: number[] = [];
}

/**
 * A Control that obtains a single integer from the user.
 *
 * Capabilities:
 * - Request a value
 * - Change a value
 * - Validate the value
 * - Confirm the value
 * - Suggest a value, if the user disconfirms and we know a good alternative to suggest.
 *
 * Intents that can be handled:
 * - `GeneralControlIntent`: E.g. `"yes, update my age"`
 * - `AMAZON_NUMBER_ValueControlIntent`: E.g. "no change it to three".
 * - `AMAZON.YesIntent`, `AMAZON.NoIntent`
 */
export class NumberControl extends Control implements InteractionModelContributor {
    state: NumberControlState = new NumberControlState();

    private rawProps: NumberControlProps;
    private props: DeepRequired<NumberControlProps>;
    private handleFunc?: (input: ControlInput, resultBuilder: ControlResultBuilder) => void;
    private initiativeFunc?: (input: ControlInput, resultBuilder: ControlResultBuilder) => void;

    constructor(props: NumberControlProps) {
        super(props.id);
        this.rawProps = props;
        this.props = NumberControl.mergeWithDefaultProps(props);
    }

    static mergeWithDefaultProps(props: NumberControlProps): DeepRequired<NumberControlProps> {
        const defaults: DeepRequired<NumberControlProps> = {
            id: 'placeholder',
            interactionModel: {
                actions: {
                    set: [$.Action.Set],
                    change: [$.Action.Change],
                },
                targets: [$.Target.Number, $.Target.It]
            },
            prompts: {
                requestValue: i18next.t('NUMBER_CONTROL_DEFAULT_PROMPT_REQUEST_VALUE'),
                confirmValue: (act) => i18next.t('NUMBER_CONTROL_DEFAULT_PROMPT_CONFIRM_VALUE', { value: act.payload.value }),
                valueDisconfirmed: i18next.t('NUMBER_CONTROL_DEFAULT_PROMPT_VALUE_DISAFFIRMED'),
                valueSet: (act) => i18next.t('NUMBER_CONTROL_DEFAULT_PROMPT_VALUE_SET', { value: act.payload.value }),
                valueConfirmed: i18next.t('NUMBER_CONTROL_DEFAULT_PROMPT_VALUE_AFFIRMED'),
                suggestValue: (act) => i18next.t('NUMBER_CONTROL_DEFAULT_PROMPT_SUGGEST_VALUE', { value: act.payload.value }),
                informConfusingDisconfirmation: (act) => i18next.t('NUMBER_CONTROL_DEFAULT_PROMPT_INFORM_CONFUSING_DISCONFIRMATION'),
                informConfusingConfirmation: (act) => i18next.t('NUMBER_CONTROL_DEFAULT_PROMPT_INFORM_CONFUSING_CONFIRMATION', { previousValue: act.payload.value }),
                problematicInputValue: (act) => i18next.t('NUMBER_CONTROL_DEFAULT_PROMPT_REPEAT_UNUSABLE_VALUE', { value: act.payload.value }),
                invalidValue: (act) => {
                    if (act.payload.renderedReason !== undefined) {
                        return i18next.t('NUMBER_CONTROL_DEFAULT_PROMPT_INVALID_VALUE_WITH_REASON', { value: act.payload.value, reason: act.payload.renderedReason });
                    }
                    return i18next.t('NUMBER_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_VALUE', { value: act.payload.value });
                },
            },
            reprompts: {
                requestValue: i18next.t('NUMBER_CONTROL_DEFAULT_REPROMPT_REQUEST_VALUE'),
                confirmValue: (act) => i18next.t('NUMBER_CONTROL_DEFAULT_REPROMPT_CONFIRM_VALUE', { value: act.payload.value }),
                valueDisconfirmed: i18next.t('NUMBER_CONTROL_DEFAULT_REPROMPT_VALUE_DISAFFIRMED'),
                valueSet: (act) => i18next.t('NUMBER_CONTROL_DEFAULT_REPROMPT_VALUE_SET', { value: act.payload.value }),
                valueConfirmed: i18next.t('NUMBER_CONTROL_DEFAULT_REPROMPT_VALUE_AFFIRMED'),
                suggestValue: (act) => i18next.t('NUMBER_CONTROL_DEFAULT_REPROMPT_SUGGEST_VALUE', { value: act.payload.value }),
                informConfusingDisconfirmation: (act) => i18next.t('NUMBER_CONTROL_DEFAULT_REPROMPT_INFORM_CONFUSING_DISCONFIRMATION'),
                informConfusingConfirmation: (act) => i18next.t('NUMBER_CONTROL_DEFAULT_REPROMPT_INFORM_CONFUSING_CONFIRMATION', { previousValue: act.payload.value }),
                problematicInputValue: (act) => i18next.t('NUMBER_CONTROL_DEFAULT_REPROMPT_REPEAT_UNUSABLE_VALUE', { value: act.payload.value }),
                invalidValue: (act) => {
                    if (act.payload.renderedReason !== undefined) {
                        return i18next.t('NUMBER_CONTROL_DEFAULT_REPROMPT_INVALID_VALUE_WITH_REASON', { value: act.payload.value, reason: act.payload.renderedReason });
                    }
                    return i18next.t('NUMBER_CONTROL_DEFAULT_REPROMPT_GENERAL_INVALID_VALUE', { value: act.payload.value });
                },
            },
            validation: [],
            confirmationRequired: false,
            ambiguousPairs: [[13, 30], [14, 40], [15, 50], [16, 60], [17, 70], [18, 80], [19, 90]], // TODO: generalize the default. in english it should suggest (113 <-> 130) etc.
            required: true,
        };
        return _.merge(defaults, props);
    }

    // tsDoc - see Control
    canHandle(input: ControlInput): boolean {
        return this.canHandleForEmptyStateValue(input)
            || this.canHandleForExistingStateValue(input);
    }

    // tsDoc - see Control
    async handle(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        log.debug(`NumberControl[${this.id}]: handle(). Entering`);

        const intent: Intent = (input.request as IntentRequest).intent;
        if (this.handleFunc === undefined) {
            throw new Error(`${intent.name} can not be handled by ${this.constructor.name}.`);
        }

        this.handleFunc(input, resultBuilder);

        if (!resultBuilder.hasInitiativeAct() && this.canTakeInitiative(input)) {
            return this.takeInitiative(input, resultBuilder);
        }
    }

    // tsDoc - see Control
    canTakeInitiative(input: ControlInput): boolean {
        return this.wantsToElicitValue(input)
            || this.wantsToFixInvalidValue(input)
            || this.wantsToConfirmValue(input);
    }

    // tsDoc - see Control
    takeInitiative(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        if (this.initiativeFunc === undefined) {
            const errorMsg = 'NumberControl: takeInitiative called but this.initiativeFunc is not set. canTakeInitiative() should be called first to set this.initiativeFunc.';
            log.error(errorMsg);
            throw new Error(errorMsg);
        }
        this.initiativeFunc(input, resultBuilder);
    }

    // tsDoc - see Control
    renderAct(act: SystemAct, input: ControlInput, builder: ControlResponseBuilder) {
        if (act instanceof RequestValueAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.requestValue, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.requestValue, input));
            const slotElicitation = generateSlotElicitation();
            builder.addElicitSlotDirective(slotElicitation.slotName, slotElicitation.intent);
        }

        else if (act instanceof ConfirmValueAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.confirmValue, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.confirmValue, input));
        }

        else if (act instanceof ValueDisconfirmedAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueDisconfirmed, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueDisconfirmed, input));
        }

        else if (act instanceof ValueSetAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueSet, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueSet, input));
        }

        else if (act instanceof ValueConfirmedAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueConfirmed, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueConfirmed, input));
        }

        else if (act instanceof SuggestValueAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.suggestValue, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.suggestValue, input));
        }

        else if (act instanceof InformConfusingConfirmationAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.informConfusingConfirmation, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.informConfusingConfirmation, input));
        }

        else if (act instanceof InformConfusingDisconfirmationAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.informConfusingDisconfirmation, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.informConfusingDisconfirmation, input));
        }

        else if (act instanceof ProblematicInputValueAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.problematicInputValue, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.problematicInputValue, input));
        }

        else if (act instanceof InvalidValueAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.invalidValue, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.invalidValue, input));
        }

        else {
            this.throwUnhandledActError(act);
        }
    }

    // tsDoc - see Control
    updateInteractionModel(generator: ControlInteractionModelGenerator, imData: ModelData) {
        generator.addControlIntent(new GeneralControlIntent(), imData);
        generator.addControlIntent(new SingleValueControlIntent(AmazonBuiltInSlotType.NUMBER), imData);
        generator.addYesAndNoIntents();

        if (this.props.interactionModel.targets.includes($.Target.Number)) {
            generator.addValuesToSlotType(SharedSlotType.TARGET, i18next.t('NUMBER_CONTROL_DEFAULT_SLOT_VALUES_TARGET_NUMBER', { returnObjects: true }));
        }
    }

    // tsDoc - see InteractionModelContributor
    getTargetIds(): string[] {
        return this.props.interactionModel.targets;
    }


    /**
     * Directly set the value.
     *
     * @param value - Value, either an integer or a string that can be parsed as a integer.
     */
    setValue(value: string | number) {
        this.state.value = typeof value === 'string' ? Number.parseInt(value!, 10) : value;
    }

    /**
     * Clear the state of this control.
     */
    clear() {
        this.state = new NumberControlState();
    }

    private canHandleForEmptyStateValue(input: ControlInput): boolean {
        try {
            okIf(this.state.value === undefined);

            if (InputUtil.isIntent(input, GeneralControlIntent.name)){
                const { action, target } = unpackGeneralControlIntent((input.request as IntentRequest).intent);
                okIf(InputUtil.actionIsMatchOrUndefined(action, [...this.props.interactionModel.actions.set, ...this.props.interactionModel.actions.change]));
                okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));

                this.handleFunc = this.handleLastQuestionEmptyAndValueNotExisting;
                return true;
            }
            else if (InputUtil.isSingleValueControlIntent(input, AmazonBuiltInSlotType.NUMBER)){
                const { action, target } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
                okIf(InputUtil.actionIsMatchOrUndefined(action, [...this.props.interactionModel.actions.set, ...this.props.interactionModel.actions.change]));
                okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
                this.handleFunc = this.handleLastQuestionEmptyAndValueExisting;
                return true;
            }
            return false;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleLastQuestionEmptyAndValueNotExisting(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        resultBuilder.addAct(
            new RequestValueAct(this)
        );
    }

    private handleLastQuestionEmptyAndValueExisting(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const { action, valueStr } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
        this.setValue(valueStr);
        this.commonHandlerWhenValueChanged(action ?? $.Action.Set, input, resultBuilder);
    }

    private canHandleForExistingStateValue(input: ControlInput): boolean {
        try {
            okIf(this.state.value !== undefined);
            return this.isValueInRejectedValues(input)
                || this.isBareNoWhenConfirmingValue(input)
                || this.isFeedbackNoAndValueUndefinedWhenConfirmingValue(input)
                || this.isFeedbackNoAndValueNotChangedWhenConfirmingValue(input)
                || this.isFeedbackNoAndValueChangedWhenConfirmingValue(input)
                || this.isBareYesConfirmingValue(input)
                || this.isFeedbackYesAndValueChangedWhenConfirmingValue(input)
                || this.isFeedbackYesAndValueNotChangedWhenConfirmingValue(input)
                || this.isFeedbackYesAndValueUndefinedWhenConfirmingValue(input)
                || this.isFeedbackUndefinedAndValueNotChangedWhenConfirmingValue(input)
                || this.isFeedbackUndefinedAndValueChangedWhenConfirmingValue(input)
                || this.isTargetsMatchWithoutFeedbackNorValueWhenConfirmingValue(input);
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private isValueInRejectedValues(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isSingleValueControlIntent(input, AmazonBuiltInSlotType.NUMBER));
            const { action, target, valueStr } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.actionIsMatchOrUndefined(action, [...this.props.interactionModel.actions.set, ...this.props.interactionModel.actions.change]));
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(this.state.rejectedValues.includes(Number.parseInt(valueStr, 10)));
            this.handleFunc = this.handleValueExistsInRejectedValues;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleValueExistsInRejectedValues(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const { valueStr } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
        this.setValue(valueStr);
        resultBuilder.addAct(
            new ProblematicInputValueAct(this, { reasonCode: 'ValuePreviouslyRejected', value: this.state.value })
        );
        resultBuilder.addAct(
            new RequestValueAct(this)
        );
    }

    private isBareNoWhenConfirmingValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isBareNo(input));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            this.handleFunc = this.handleFeedbackNoAndWithoutValueWhenConfirmingValue;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private isFeedbackNoAndValueUndefinedWhenConfirmingValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isIntent(input, GeneralControlIntent.name));
            const { feedback, action, target } = unpackGeneralControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.actionIsMatchOrUndefined(action, [...this.props.interactionModel.actions.set, ...this.props.interactionModel.actions.change]));
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.feedbackIsFalse(feedback));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            this.handleFunc = this.handleFeedbackNoAndWithoutValueWhenConfirmingValue;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleFeedbackNoAndWithoutValueWhenConfirmingValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.activeInitiativeAct = undefined;
        resultBuilder.addAct(
            new ValueDisconfirmedAct(this, {value: this.state.value!})
        );
        this.commonHandlerWhenValueRejected(input, resultBuilder);
    }

    private isFeedbackNoAndValueNotChangedWhenConfirmingValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isSingleValueControlIntent(input, AmazonBuiltInSlotType.NUMBER));
            const { action, target, feedback, valueStr } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.actionIsMatchOrUndefined(action, [...this.props.interactionModel.actions.set, ...this.props.interactionModel.actions.change]));
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.feedbackIsFalse(feedback));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            okIf(this.state.value === Number.parseInt(valueStr, 10));
            this.handleFunc = this.handleFeedbackNoAndValueNotChangedWhenConfirmingValue;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleFeedbackNoAndValueNotChangedWhenConfirmingValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.activeInitiativeAct = undefined;
        resultBuilder.addAct(
            new InformConfusingDisconfirmationAct(this, { value: this.state.value!, reasonCode: 'DisconfirmedWithSameValue' })
        );
        this.commonHandlerWhenValueRejected(input, resultBuilder);
    }

    private isFeedbackNoAndValueChangedWhenConfirmingValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isSingleValueControlIntent(input, AmazonBuiltInSlotType.NUMBER));
            const { feedback, action, target, valueStr } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.actionIsMatchOrUndefined(action, [...this.props.interactionModel.actions.set, ...this.props.interactionModel.actions.change]));
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.feedbackIsFalse(feedback));
            okIf(InputUtil.valueStrDefined(valueStr));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            okIf(this.state.value !== Number.parseInt(valueStr, 10));
            this.handleFunc = this.handleFeedbackNoAndValueChangedWhenConfirmingValue;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleFeedbackNoAndValueChangedWhenConfirmingValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const { action, valueStr } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
        this.setValue(valueStr);
        this.commonHandlerWhenValueChanged(action ?? $.Action.Set, input, resultBuilder);
    }

    private isFeedbackYesAndValueChangedWhenConfirmingValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isSingleValueControlIntent(input, AmazonBuiltInSlotType.NUMBER));
            const { feedback, action, target, valueStr } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.actionIsMatchOrUndefined(action, [...this.props.interactionModel.actions.set, ...this.props.interactionModel.actions.change]));
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.feedbackIsTrue(feedback));
            okIf(InputUtil.valueStrDefined(valueStr));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            okIf(this.state.value !== Number.parseInt(valueStr, 10));
            this.handleFunc = this.handleFeedbackYesAndValueChangedWhenConfirmingValue;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleFeedbackYesAndValueChangedWhenConfirmingValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const { action, valueStr } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
        const previousValue = this.state.value;
        this.setValue(valueStr);
        resultBuilder.addAct(
            new InformConfusingConfirmationAct(this, { value: previousValue, reasonCode: 'ConfirmedWithDifferentValue' })
        );
        this.state.activeInitiativeAct = 'ConfirmValueAct';
        resultBuilder.addAct(
            new ConfirmValueAct(this, { value: this.state.value })
        );
    }

    private isBareYesConfirmingValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isBareYes(input));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            this.handleFunc = this.handleFeedbackYesAndValueNotChangedOrUndefinedWhenConfirmingValue;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private isFeedbackYesAndValueNotChangedWhenConfirmingValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isSingleValueControlIntent(input, AmazonBuiltInSlotType.NUMBER));
            const { feedback, action, target, valueStr } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.actionIsMatchOrUndefined(action, [...this.props.interactionModel.actions.set, ...this.props.interactionModel.actions.change]));
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.feedbackIsTrue(feedback));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            okIf(this.state.value === Number.parseInt(valueStr, 10));
            this.handleFunc = this.handleFeedbackYesAndValueNotChangedOrUndefinedWhenConfirmingValue;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private isFeedbackYesAndValueUndefinedWhenConfirmingValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isIntent(input, GeneralControlIntent.name));
            const { feedback, action, target } = unpackGeneralControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.actionIsMatchOrUndefined(action, [...this.props.interactionModel.actions.set, ...this.props.interactionModel.actions.change]));
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.feedbackIsTrue(feedback));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            this.handleFunc = this.handleFeedbackYesAndValueNotChangedOrUndefinedWhenConfirmingValue;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleFeedbackYesAndValueNotChangedOrUndefinedWhenConfirmingValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.isValueConfirmed = true;
        this.state.activeInitiativeAct = undefined;
        resultBuilder.addAct(
            new ValueConfirmedAct(this, { value: this.state.value })
        );
    }

    private isFeedbackUndefinedAndValueNotChangedWhenConfirmingValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isSingleValueControlIntent(input, AmazonBuiltInSlotType.NUMBER));
            const { feedback, action, target, valueStr } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.actionIsMatchOrUndefined(action, [...this.props.interactionModel.actions.set, ...this.props.interactionModel.actions.change]));
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.feedbackIsUndefined(feedback));
            okIf(InputUtil.valueStrDefined(valueStr));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            okIf(this.state.value === Number.parseInt(valueStr, 10));
            this.handleFunc = this.handleFeedbackYesAndValueUndefinedWhenConfirmingValue;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleFeedbackYesAndValueUndefinedWhenConfirmingValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.isValueConfirmed = true;
        this.state.activeInitiativeAct = undefined;
        resultBuilder.addAct(
            new ValueConfirmedAct(this, { value: this.state.value })
        );
    }

    private isFeedbackUndefinedAndValueChangedWhenConfirmingValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isSingleValueControlIntent(input, AmazonBuiltInSlotType.NUMBER));
            const { feedback, action, target, valueStr } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.actionIsMatchOrUndefined(action, [...this.props.interactionModel.actions.set, ...this.props.interactionModel.actions.change]));
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.feedbackIsUndefined(feedback));
            okIf(InputUtil.valueStrDefined(valueStr));
            okIf(this.state.value !== Number.parseInt(valueStr, 10));
            this.handleFunc = this.handleFeedbackUndefinedAndValueChangedWhenConfirmingValue;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleFeedbackUndefinedAndValueChangedWhenConfirmingValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const { action, valueStr } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
        this.setValue(valueStr);
        this.commonHandlerWhenValueChanged(action ?? $.Action.Set, input, resultBuilder);
    }

    private isTargetsMatchWithoutFeedbackNorValueWhenConfirmingValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isIntent(input, GeneralControlIntent.name));
            const { feedback, action, target } = unpackGeneralControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.feedbackIsUndefined(feedback));
            okIf(InputUtil.actionIsMatchOrUndefined(action, [...this.props.interactionModel.actions.set, ...this.props.interactionModel.actions.change]));
            okIf(InputUtil.targetIsMatch(target, _.without(this.props.interactionModel.targets, $.Target.It)));
            this.handleFunc = this.handleTargetMatchWithoutFeedbackNorValueWhenConfirmingValue;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleTargetMatchWithoutFeedbackNorValueWhenConfirmingValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        resultBuilder.addAct(
            new RequestValueAct(this)
        );
    }

    private commonHandlerWhenValueChanged(action: string, input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const validationResult = this.validateNumber(input);
        if (validationResult !== true) {
            this.state.rejectedValues.push(this.state.value!);
            resultBuilder.addAct(
                new InvalidValueAct(this, { value: this.state.value!, renderedReason: validationResult.renderedReason })
            );
            resultBuilder.addAct(
                new RequestValueAct(this)
            );
        }
        else if (!this.isConfirmationRequired(input)) {
            this.state.isValueConfirmed = true;
            this.state.activeInitiativeAct = undefined;
            resultBuilder.addAct(
                new ValueSetAct(this, { value: this.state.value })
            );
        }
        else {
            this.state.activeInitiativeAct = 'ConfirmValueAct';
            resultBuilder.addAct(
                new ConfirmValueAct(this, { value: this.state.value })
            );
        }
    }

    /* TODO: bug: User's action has to be used in this function to form the response
     * prompt, need to define action in the related payloadType This will fix
     * the following: U: No, {change} the value please A: What value do you want
     * to {change} to?
     */
    private commonHandlerWhenValueRejected(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.rejectedValues.push(this.state.value!);
        const ambiguousPartner = this.getAmbiguousPartner(this.state.value!);
        if (ambiguousPartner !== undefined && !this.state.rejectedValues.includes(ambiguousPartner)) {
            const previousValue = this.state.value;
            this.state.value = ambiguousPartner;
            const validationResult = this.validateNumber(input);
            if (validationResult === true) {
                // this is to confirm from users for the suggestedValue
                this.state.activeInitiativeAct = 'ConfirmValueAct';
                resultBuilder.addAct(
                    new SuggestValueAct(this, { value: this.state.value })
                );
            }
            else {
                this.state.value = previousValue;
                resultBuilder.addAct(
                    new RequestValueAct(this)
                );
            }
        }
        else {
            resultBuilder.addAct(
                new RequestValueAct(this)
            );
        }
    }

    private wantsToElicitValue(input: ControlInput): boolean {
        if (this.evaluateBooleanProp(this.props.required, input) && this.state.value === undefined) {
            this.initiativeFunc = this.elicitValue;
            return true;
        }
        return false;
    }

    private elicitValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        resultBuilder.addAct(new RequestValueAct(this));
    }

    private wantsToFixInvalidValue(input: ControlInput): boolean {
        if (!this.evaluateBooleanProp(this.props.required, input) || this.state.value === undefined) {
            return false;
        }
        const validationResult: true | ValidationResult = this.validateNumber(input);
        if (validationResult === true) {
            return false;
        }

        this.initiativeFunc = this.fixInvalidValue;
        return true;
    }

    private fixInvalidValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const validationResult = this.validateNumber(input);
        resultBuilder.addAct(new InvalidValueAct(this, {
            value: this.state.value!,
            reasonCode: 'ValueInvalid',
            renderedReason: (validationResult as ValidationResult).renderedReason
        }));
        resultBuilder.addAct(new RequestValueAct(this));
    }

    private wantsToConfirmValue(input: ControlInput): boolean {
        if (!this.evaluateBooleanProp(this.props.required, input) || this.state.value === undefined) {
            return false;
        }
        if (this.state.isValueConfirmed || !this.isConfirmationRequired(input)) {
            return false;
        }

        this.initiativeFunc = this.confirmValue;
        return true;
    }

    private confirmValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.activeInitiativeAct = 'ConfirmValueAct';
        resultBuilder.addAct(new ConfirmValueAct(this, { value: this.state.value }));
    }

    private validateNumber(input: ControlInput): true | ValidationResult {
        const listOfValidationFunc: NumberValidationFunction[] = typeof(this.props.validation) === 'function' ? [this.props.validation] : this.props.validation;
        for (const validationFunction of listOfValidationFunc) {
            const validationResult: boolean | ValidationResult = validationFunction(this.state, input);
            if (validationResult !== true) {
                log.debug(`NumberControl.validate(): validation failed. Reason: ${JSON.stringify(validationResult, null, 2)}.`);
                return validationResult;
            }
        }
        return true;
    }

    private isConfirmationRequired(input: ControlInput) {
        if (typeof this.props.confirmationRequired === 'function') {
            return this.props.confirmationRequired(this.state, input);
        }
        else if (typeof this.props.confirmationRequired === 'boolean') {
            return this.props.confirmationRequired;
        }
        else {
            return true; // by default confirmation is required
        }
    }

    private getAmbiguousPartner(value?: number): number | undefined {
        const pairs = this.props.ambiguousPairs;

        for (const pair of pairs) {
            if (pair[0] === value) {
                return pair[1];
            }
            else if (pair[1] === value) {
                return pair[0];
            }
        }
        return undefined;
    }
}

/**
 * Creates an elicit-slot directive for the provided slotType.
 *
 * - The intent specified is a `AMAZON_NUMBER_ValueControlIntent`
 * - The slot specified is the `slotType` slot.
 *
 * @param slotType - Slot type
 */
function generateSlotElicitation(): { intent: Intent, slotName: string } {
    const intent: Intent = {
        name: SingleValueControlIntent.intentName(AmazonBuiltInSlotType.NUMBER),
        slots: {
            "AMAZON.NUMBER": { name: "AMAZON.NUMBER", value: '', confirmationStatus: 'NONE' },
            "feedback": { name: "feedback", value: '', confirmationStatus: 'NONE' },
            "action": { name: "action", value: '', confirmationStatus: 'NONE' },
            "target": { name: "target", value: '', confirmationStatus: 'NONE' },
            "head": { name: "head", value: '', confirmationStatus: 'NONE' },
            "tail": { name: "tail", value: '', confirmationStatus: 'NONE' },
            "preposition": { name: "preposition", value: '', confirmationStatus: 'NONE' },
        },
        confirmationStatus: "NONE"
    };

    return {
        intent,
        slotName: AmazonBuiltInSlotType.NUMBER
    };
}
