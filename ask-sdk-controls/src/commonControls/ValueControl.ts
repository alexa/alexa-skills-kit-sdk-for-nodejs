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
import { Strings as $ } from "../constants/Strings";
import { Control, ControlProps, ControlState } from '../controls/Control';
import { ControlInput } from '../controls/ControlInput';
import { ControlResultBuilder } from '../controls/ControlResult';
import { ControlStateDiagramming } from '../controls/mixins/ControlStateDiagramming';
import { InteractionModelContributor } from '../controls/mixins/InteractionModelContributor';
import { ValidationResult } from '../controls/ValidationResult';
import { AmazonBuiltInSlotType } from '../intents/AmazonBuiltInSlotType';
import { GeneralControlIntent, unpackGeneralControlIntent } from '../intents/GeneralControlIntent';
import { SingleValueControlIntent, unpackSingleValueControlIntent } from '../intents/SingleValueControlIntent';
import { ControlInteractionModelGenerator } from '../interactionModelGeneration/ControlInteractionModelGenerator';
import { ModelData } from '../interactionModelGeneration/ModelTypes';
import { Logger } from "../logging/Logger";
import { ControlResponseBuilder } from '../responseGeneration/ControlResponseBuilder';
import { InvalidValueAct, ValueChangedAct, ValueConfirmedAct, ValueDisconfirmedAct, ValueSetAct } from "../systemActs/ContentActs";
import { ConfirmValueAct, RequestChangedValueAct, RequestValueAct } from "../systemActs/InitiativeActs";
import { SystemAct } from '../systemActs/SystemAct';
import { StringOrList } from '../utils/BasicTypes';
import { DeepRequired } from '../utils/DeepRequired';
import { InputUtil } from "../utils/InputUtil";
import { falseIfGuardFailed, okIf } from '../utils/Predicates';

const log = new Logger('AskSdkControls:ValueControl');

/**
 * Props for a ValueControl.
 */
export interface ValueControlProps extends ControlProps {

    /**
     * Unique identifier for control instance
     */
    id: string;

    /**
     * Slot type for the value that this control collects.
     *
     * Usage:
     * - The slot type defines the set of expected value items.
     * - NLU will, on occasion, accept novel slot value and mark them as
     *   ER_NO_MATCH.  If you only want to accept values that are explicitly
     *   defined add a validation function to test `this.state.erMatch`
     */
    slotType: string;

    /**
     * Function(s) that determine if the value is valid.
     *
     * Default: `true`, i.e. any value is valid.
     *
     * Usage:
     * - Validation functions return either `true` or a `ValidationResult` to
     *   describe what validation failed.
     */
    validation?: SlotValidationFunction | SlotValidationFunction[];

    /**
     * Determines if the Control must obtain a value.
     *
     * If `true`:
     *  - the Control report isReady() = false if no value has been obtained.
     *  - the control will take the initiative when given the opportunity.
     */
    required?: boolean | ((input: ControlInput) => boolean);

    /**
     * Whether the Control has to obtain explicit confirmation of the value.
     *
     * If `true`:
     *  - the Control will report `isReady() = false` if the value has not been
     *    explicitly confirmed as correct by user.
     *  - the Control will take the initiative when given the opportunity.
     */
    confirmationRequired?: boolean | ((input: ControlInput) => boolean);

    /**
     * Props to customize the prompt fragments that will be added by
     * `this.renderAct()`.
     */
    prompts?: ValueControlPromptProps;

    /**
     * Props to customize the reprompt fragments that will be added by
     * `this.renderAct()`.
     */
    reprompts?: ValueControlPromptProps;

    /**
     * Props to customize the relationship between the control and the
     * interaction model.
     */
    interactionModel?: ValueControlInteractionModelProps;
}

/**
 * ValueControl validation function
 */
export type SlotValidationFunction = (state: ValueControlState, input: ControlInput) => true | ValidationResult;

/**
 * Mapping of action slot values to the behaviors that this control supports.
 *
 * Behavior:
 * - This control will not handle an input if the action-slot is filled with an
 *   value whose ID is not associated with a capability.
 */
export interface ValueControlActionProps {
    /**
     * Action slot value IDs that are associated with the "set value" capability.
     *
     * Default: ['builtin_set']
     */
    set?: string[],

    /**
     * Action slot value IDs that are associated with the "change value" capability.
     *
     * Default ['builtin_change']
     */
    change?: string[]
}

/**
 * Props associated with the interaction model.
 */
export class ValueControlInteractionModelProps {
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
    actions?: ValueControlActionProps;
}

/**
 * Props to customize the prompt fragments that will be added by
 * `this.renderAct()`.
 */
export class ValueControlPromptProps {
    valueSet?: StringOrList | ((act: ValueSetAct<any>, input: ControlInput) => StringOrList);
    valueChanged?: StringOrList | ((act: ValueChangedAct<any>, input: ControlInput) => StringOrList);
    invalidValue?: StringOrList | ((act: InvalidValueAct<any>, input: ControlInput) => StringOrList);
    requestValue?: StringOrList | ((act: RequestValueAct, input: ControlInput) => StringOrList);
    requestChangedValue?: StringOrList | ((act: RequestChangedValueAct, input: ControlInput) => StringOrList);
    confirmValue?: StringOrList | ((act: ConfirmValueAct<any>, input: ControlInput) => StringOrList);
    valueDisconfirmed?: StringOrList | ((act: ValueDisconfirmedAct<any>, input: ControlInput) => StringOrList);
    valueConfirmed?: StringOrList | ((act: ValueConfirmedAct<any>, input: ControlInput) => StringOrList);
}

/**
 * State tracked by a ValueControl.
 */
export class ValueControlState implements ControlState {

    /**
     * The value.
     *
     * If `erMatch = true` the value is a slot value ID for the slot type `this.slotType`.
     * If `erMatch = false` the value may be an arbitrary string.
     */
    value?: string;

    /**
     * Tracks whether the value is an Entity Resolution match.
     */
    erMatch?: boolean;

    /**
     * Tracks if the control is actively asking the user to set or change the value.
     */
    elicitationAction?: string;

    /**
     * Tracks whether the value has been explicitly confirmed by the user.
     */
    isValueConfirmed: boolean = false;

    /**
     * The previous value.
     */
    previousValue?: string;

    /**
     * Tracks the last initiative act from the control
     */
    activeInitiativeAct?: string;
}

/**
 * A Control that obtains a single value from the user.
 *
 * The type of value to obtain is defined by `this.slotType`.
 *
 * Capabilities:
 * - Request a value
 * - Change a value
 * - Validate the value
 * - Confirm the value
 *
 * Intents that can be handled:
 * - `GeneralControlIntent`: E.g. `"yes, update my name"`
 * - `{ValueType}_ValueControlIntent`: E.g. "no change it to Elvis".
 * - `AMAZON.YesIntent`, `AMAZON.NoIntent`
 */
export class ValueControl extends Control implements InteractionModelContributor, ControlStateDiagramming {

    state: ValueControlState = new ValueControlState();

    private rawProps: ValueControlProps;
    private props: DeepRequired<ValueControlProps>;
    private handleFunc?: (input: ControlInput, resultBuilder: ControlResultBuilder) => void;
    private initiativeFunc?: (input: ControlInput, resultBuilder: ControlResultBuilder) => void;

    constructor(props: ValueControlProps) {
        super(props.id);

        if (props.slotType === AmazonBuiltInSlotType.SEARCH_QUERY){
            throw new Error('AMAZON.SearchQuery cannot be used with ValueControl due to the special rules regarding its use. '
             + 'Specifically, utterances that include SearchQuery must have a carrier phrase and not be comprised entirely of slot references. '
             + 'Use a custom intent to manage SearchQuery slots or create a regular slot for use with ValueControl.');
        }

        this.rawProps = props;
        this.props = ValueControl.mergeWithDefaultProps(props);
    }

    static mergeWithDefaultProps(props: ValueControlProps): DeepRequired<ValueControlProps> {

        const defaults: DeepRequired<ValueControlProps> =
        {
            id: 'dummy',
            slotType: 'dummy',
            required: true,
            validation: [],
            confirmationRequired: false,
            interactionModel: {
                actions: {
                    set: [$.Action.Set],
                    change: [$.Action.Change],
                },
                targets: [$.Target.It]
            },
            prompts: {
                confirmValue: (act) => i18next.t('VALUE_CONTROL_DEFAULT_PROMPT_CONFIRM_VALUE', { value: act.payload.value }),
                valueConfirmed: i18next.t('VALUE_CONTROL_DEFAULT_PROMPT_VALUE_AFFIRMED'),
                valueDisconfirmed: i18next.t('VALUE_CONTROL_DEFAULT_PROMPT_VALUE_DISAFFIRMED'),
                valueSet: (act) => i18next.t('VALUE_CONTROL_DEFAULT_PROMPT_VALUE_SET', { value: act.payload.value }),
                valueChanged: (act) => i18next.t('VALUE_CONTROL_DEFAULT_PROMPT_VALUE_CHANGED', { value: act.payload.value }),
                invalidValue: (act) => {
                    if (act.payload.renderedReason !== undefined) {
                        return i18next.t('VALUE_CONTROL_DEFAULT_PROMPT_INVALID_VALUE_WITH_REASON', { value: act.payload.value, reason: act.payload.renderedReason });
                    }
                    return i18next.t('VALUE_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_VALUE', { value: act.payload.value });
                },
                requestValue: () => i18next.t('VALUE_CONTROL_DEFAULT_PROMPT_REQUEST_VALUE'),
                requestChangedValue: () => i18next.t('VALUE_CONTROL_DEFAULT_PROMPT_REQUEST_CHANGED_VALUE'),
            },
            reprompts: {
                confirmValue: (act) => i18next.t('VALUE_CONTROL_DEFAULT_REPROMPT_CONFIRM_VALUE', { value: act.payload.value }),
                valueConfirmed: i18next.t('VALUE_CONTROL_DEFAULT_REPROMPT_VALUE_AFFIRMED'),
                valueDisconfirmed: i18next.t('VALUE_CONTROL_DEFAULT_REPROMPT_VALUE_DISAFFIRMED'),
                valueSet: (act) => i18next.t('VALUE_CONTROL_DEFAULT_REPROMPT_VALUE_SET', { value: act.payload.value }),
                valueChanged: (act) => i18next.t('VALUE_CONTROL_DEFAULT_REPROMPT_VALUE_CHANGED', { value: act.payload.value }),
                invalidValue: (act) => {
                    if (act.payload.renderedReason !== undefined) {
                        return i18next.t('VALUE_CONTROL_DEFAULT_REPROMPT_INVALID_VALUE_WITH_REASON', { value: act.payload.value, reason: act.payload.renderedReason });
                    }
                    return i18next.t('VALUE_CONTROL_DEFAULT_REPROMPT_GENERAL_INVALID_VALUE', { value: act.payload.value });
                },
                requestValue: () => i18next.t('VALUE_CONTROL_DEFAULT_REPROMPT_REQUEST_VALUE'),
                requestChangedValue: () => i18next.t('VALUE_CONTROL_DEFAULT_REPROMPT_REQUEST_CHANGED_VALUE'),
            }
        };

        return _.merge(defaults, props);
    }

    // tsDoc - see Control
    canHandle(input: ControlInput): boolean {
        return this.isSetWithValue(input)
            || this.isChangeWithValue(input)
            || this.isSetWithoutValue(input)
            || this.isChangeWithoutValue(input)
            || this.isBareValue(input)
            || this.isConfirmationAffirmed(input)
            || this.isConfirmationDisaffirmed(input);
    }

    // tsDoc - see Control
    async handle(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        if (this.handleFunc === undefined) {
            log.error('ValueControl: handle called but this.handleFunc is not set. canHandle() should be called first to set this.handleFunc.');
            const intent: Intent = (input.request as IntentRequest).intent;
            throw new Error(`${intent.name} can not be handled by ${this.constructor.name}.`);
        }

        this.handleFunc(input, resultBuilder);

        if (resultBuilder.hasInitiativeAct() !== true && this.canTakeInitiative(input) === true){
            await this.takeInitiative(input, resultBuilder);
        }
    }

    /**
     * Determine if the input is an implicit or explicit "set" with a value provided.
     *
     * Example utterance: "Set my name to Bob"
     *
     * @param input - Input
     */
    private isSetWithValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isIntent(input, SingleValueControlIntent.intentName(this.props.slotType)));
            const { feedback, action, target, valueStr, valueType } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.valueTypeMatch(valueType, this.props.slotType));
            okIf(InputUtil.valueStrDefined(valueStr));
            okIf(InputUtil.feedbackIsMatchOrUndefined(feedback, [$.Feedback.Affirm, $.Feedback.Disaffirm]));
            okIf(InputUtil.actionIsMatch(action, this.props.interactionModel.actions.set));
            this.handleFunc = this.handleSetWithValue;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }

    /**
     * Handle an implicit or explicit "set" with a value provided.
     *
     * @param input - Input
     * @param resultBuilder - ResultBuilder
     */
    private handleSetWithValue(input: ControlInput, resultBuilder: ControlResultBuilder) {
        const { valueStr, erMatch } = InputUtil.getValueResolution(input);
        this.setValue(valueStr, erMatch);
        this.validateAndAddActs(input, resultBuilder, $.Action.Set);
        return;
    }

    /**
     * Determine if the input is an implicit or explicit "set" without a value.
     *
     * Example utterance: "Set my name"
     *
     * @param input - Input
     */
    private isSetWithoutValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isIntent(input, GeneralControlIntent.name));
            const { feedback, action, target } = unpackGeneralControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.feedbackIsMatchOrUndefined(feedback, [$.Feedback.Affirm, $.Feedback.Disaffirm]));
            okIf(InputUtil.actionIsMatch(action, this.props.interactionModel.actions.set));
            this.handleFunc = this.handleSetWithoutValue;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }

    /**
     * Handle an implicit or explicit "set" without a value.
     *
     * @param input - Input
     * @param resultBuilder - Result builder
     */
    private handleSetWithoutValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.askElicitationQuestion(input, resultBuilder, $.Action.Set);
        return;
    }

    /**
     * Determine if the input is "change" with a value provided.
     *
     * Example utterance: "Change my name to bob"
     *
     * @param input - Input
     */
    private isChangeWithValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isIntent(input, SingleValueControlIntent.intentName(this.props.slotType)));
            const { feedback, action, target, valueStr, valueType } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.valueTypeMatch(valueType, this.props.slotType));
            okIf(InputUtil.valueStrDefined(valueStr));
            okIf(InputUtil.feedbackIsMatchOrUndefined(feedback, [$.Feedback.Affirm, $.Feedback.Disaffirm]));
            okIf(InputUtil.actionIsMatch(action, this.props.interactionModel.actions.change));
            this.handleFunc = this.handleChangeWithValue;
            return true;
        }

        catch (e) { return falseIfGuardFailed(e); }
    }

    /**
     * Handle an implicit or explicit "change" with a value.
     *
     * @param input - Input
     * @param resultBuilder - Result builder
     */
    private handleChangeWithValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const { valueStr, erMatch } = InputUtil.getValueResolution(input);
        this.setValue(valueStr, erMatch);
        this.validateAndAddActs(input, resultBuilder, $.Action.Change);
        return;
    }

    /**
     * Determine if the input is "change" without a value.
     *
     * Example utterance: "Change my name"
     *
     * @param input - Input
     */
    private isChangeWithoutValue(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isIntent(input, GeneralControlIntent.name));
            const { feedback, action, target } = unpackGeneralControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.feedbackIsMatchOrUndefined(feedback, [$.Feedback.Affirm, $.Feedback.Disaffirm]));
            okIf(InputUtil.actionIsMatch(action, this.props.interactionModel.actions.change));
            this.handleFunc = this.handleChangeWithoutValue;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }

    /**
     * Handle an implicit or explicit "change" without a value.
     *
     * @param input - Input
     * @param resultBuilder - Result builder
     */
    private handleChangeWithoutValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.askElicitationQuestion(input, resultBuilder, $.Action.Change);
        return;
    }


    /**
     * Determine if the input is a value without any further information.
     *
     * Example utterance: 'Bob'
     *
     * Behavior:
     *  - If the control isn't actively asking a question, it assumes the user
     *    meant "set \{value\}".
     * @param input - Input
     */
    private isBareValue(input: ControlInput): any {
        try {
            okIf(InputUtil.isIntent(input, SingleValueControlIntent.intentName(this.props.slotType)));
            const { feedback, action, target, valueStr, valueType } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.feedbackIsUndefined(feedback));
            okIf(InputUtil.actionIsUndefined(action));
            okIf(InputUtil.targetIsUndefined(target));
            okIf(InputUtil.valueStrDefined(valueStr));
            okIf(InputUtil.valueTypeMatch(valueType, this.props.slotType));
            this.handleFunc = this.handleBareValue;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }

    /**
     * Handle a bare value.
     *
     * @param input - Input
     * @param resultBuilder - Result builder
     */
    private handleBareValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const { valueStr, erMatch } = InputUtil.getValueResolution(input);
        this.setValue(valueStr, erMatch);
        this.validateAndAddActs(input, resultBuilder, this.state.elicitationAction ?? $.Action.Set);
        return;
    }

    /**
     * Determine if the input is an affirmation to an explicit confirmation question.
     *
     * Example dialog:
     * - 'A: Did you say Bob?'
     * - 'U: Yes.'
     *
     * @param input - Input
     */
    private isConfirmationAffirmed(input: ControlInput): any {
        try {
            /* TODO: feature: also handle "yes, {value}" for both expected and
             * unexpected values
             */
            okIf(InputUtil.isBareYes(input));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            this.handleFunc = this.handleConfirmationAffirmed;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    /**
     * Handle an affirmation to an explicit confirmation question.
     *
     * @param input - Input
     * @param resultBuilder - Result builder
     */
    private handleConfirmationAffirmed(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.activeInitiativeAct = undefined;
        this.state.isValueConfirmed = true;
        this.state.activeInitiativeAct = undefined;
        resultBuilder.addAct(new ValueConfirmedAct(this, { value: this.state.value }));
    }

    /**
     * Determine if the input is an affirmation to an explicit confirmation question.
     *
     * Example dialog:
     * - 'A: Did you say Bob?'
     * - 'U: No.'
     *
     * @param input - Input
     */
    private isConfirmationDisaffirmed(input: ControlInput): any {
        try {
            /* TODO: feature: also handle "no, {value}" for both expected and
             * unexpected values
             */
            okIf(InputUtil.isBareNo(input));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            this.handleFunc = this.handleConfirmationDisaffirmed;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    /**
     * Handle a disaffirmation to an explicit confirmation question.
     *
     * @param input - Input
     * @param resultBuilder - Result builder
     */
    private handleConfirmationDisaffirmed(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.isValueConfirmed = false;
        this.state.activeInitiativeAct = undefined;
        resultBuilder.addAct(new ValueDisconfirmedAct(this, {value: this.state.value}));
        resultBuilder.addAct(new RequestValueAct(this));
    }

    /**
     * Directly set the value.
     *
     * @param value - Value
     * @param erMatch - Whether the value is an ID defined for `this.slotType`
     * in the interaction model
     */
    setValue(value: string, erMatch: boolean = true) {
        this.state.previousValue = this.state.value;
        this.state.value = value;
        this.state.erMatch = erMatch;
        this.state.isValueConfirmed = false;
    }

    // TODO: naming: 'reset'?
    /**
     * Clear the state of this control.
     */
    clear() {
        this.state = new ValueControlState();
    }

    // tsDoc - see Control
    canTakeInitiative(input: ControlInput): boolean {
        return this.wantsToConfirmValue(input)
            || this.wantsToFixInvalidValue(input)
            || this.wantsToElicitValue(input);
    }

    // tsDoc - see Control
    async takeInitiative(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        if (this.initiativeFunc === undefined) {
            const errorMsg = 'ValueControl: takeInitiative called but this.initiativeFunc is not set. canTakeInitiative() should be called first to set this.initiativeFunc.';
            log.error(errorMsg);
            throw new Error(errorMsg);
        }
        this.initiativeFunc(input, resultBuilder);
        return;
    }

    /**
     * Perform validation checks and add appropriate acts to the result.
     *
     * @param input - Input
     * @param resultBuilder - Result builder
     * @param elicitationAction - The type of elicitation question that has been
     * asked.
     */
    private validateAndAddActs(input: ControlInput, resultBuilder: ControlResultBuilder, elicitationAction: string): void {
        this.state.elicitationAction = elicitationAction;
        const validationResult: true | ValidationResult = this.validate(input);
        if (typeof validationResult === 'boolean') {
            if (elicitationAction === $.Action.Change) {
                // if elicitationAction == 'change', then the previousValue must be defined.
                if (this.state.previousValue !== undefined){
                    resultBuilder.addAct(
                        new ValueChangedAct<string>(this, {previousValue: this.state.previousValue, value: this.state.value! })
                    );
                }
                else {
                    throw new Error('ValueChangedAct should only be used if there is an actual previous value');
                }
            }
            else {
                resultBuilder.addAct(new ValueSetAct(this, { value: this.state.value }));
            }
        }
        else {
            // feedback
            resultBuilder.addAct(new InvalidValueAct<string>(this, { value: this.state.value!, reasonCode: validationResult.reasonCode, renderedReason: validationResult.renderedReason }));
            this.askElicitationQuestion(input, resultBuilder, elicitationAction);
        }
        return;
    }

    /**
     * Determine if the value is valid.
     *
     * @param input - Input.
     */
    private validate(input: ControlInput): true | ValidationResult {
        const listOfValidationFunc: SlotValidationFunction[] = typeof(this.props.validation) === 'function' ? [this.props.validation] : this.props.validation;
        for (const validationFunction of listOfValidationFunc) {
            const validationResult: true | ValidationResult = validationFunction(this.state, input);
            if (validationResult !== true) {
                log.debug(`ValueControl.validate(): validation failed. Reason: ${JSON.stringify(validationResult, null, 2)}.`);
                return validationResult;
            }
        }
        return true;
    }

    /**
     * Determine if the value needs to be explicitly confirmed
     *
     * @param input - Input
     */
    private wantsToConfirmValue(input: ControlInput): boolean {
        if (this.state.value !== undefined && this.state.isValueConfirmed === false && this.evaluateBooleanProp(this.props.confirmationRequired, input)){
            this.initiativeFunc = this.confirmValue;
            return true;
        }
        return false;
    }

    /**
     * Ask the user to confirm the value.
     *
     * @param input - Input
     * @param resultBuilder - Result builder
     */
    private confirmValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.activeInitiativeAct = 'ConfirmValueAct';
        resultBuilder.addAct(new ConfirmValueAct(this, { value: this.state.value }));
    }

    /**
     * Determine if the value needs to obtain a new value because the current
     * one is invalid.
     *
     * @param input - Input
     */
    private wantsToFixInvalidValue(input: ControlInput): boolean {
        if (this.state.value !== undefined && this.validate(input) !== true){
            this.initiativeFunc = this.fixInvalidValue;
            return true;
        }
        return false;
    }

    /**
     * Ask the user to provide a new value because the current one is invalid.
     *
     * @param input - Input
     * @param resultBuilder - Result builder
     */
    private fixInvalidValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.validateAndAddActs(input, resultBuilder, $.Action.Change);
    }

    /**
     * Determine if the value should be elicited.
     *
     * @param input - Input
     */
    private wantsToElicitValue(input: ControlInput): boolean {
        if (this.state.value === undefined && this.evaluateBooleanProp(this.props.required, input)){
            this.initiativeFunc = this.elicitValue;
            return true;
        }
        return false;
    }

    /**
     * Ask the user to provide a value.
     *
     * @param input - Input
     * @param resultBuilder - Result builder
     */
    private elicitValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.askElicitationQuestion(input, resultBuilder, $.Action.Set);
    }

    /**
     * Add an elicitation act to the result.
     *
     * @param input - Input
     * @param resultBuilder - Result builder
     * @param elicitationAction - The style of elicitation to use.
     */
    private askElicitationQuestion(input: ControlInput, resultBuilder: ControlResultBuilder, elicitationAction: string) {
        this.state.elicitationAction = elicitationAction;
        switch (elicitationAction) {
            case $.Action.Set:
                resultBuilder.addAct(new RequestValueAct(this));
                return;
            case $.Action.Change:
                resultBuilder.addAct(new RequestChangedValueAct(this, {currentValue: this.state.value!}));
                return;
            default:
                throw new Error(`Unhandled. Unknown elicitationAction: ${this.state.elicitationAction}`);
        }
    }

    // tsDoc - see ControlStateDiagramming
    stringifyStateForDiagram(): string {
        let text = this.state.value ?? '<none>';
        if (this.state.elicitationAction !== undefined) {
            text += `[eliciting, ${this.state.elicitationAction}]`;
        }
        return text;
    }

    // tsDoc - see Control
    renderAct(act: SystemAct, input: ControlInput, builder: ControlResponseBuilder): void {
        if (act instanceof InvalidValueAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.invalidValue, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.invalidValue, input));
        }

        else if (act instanceof ValueSetAct) {
            // We must choose how to say the value.  The default is to assume that the Slot-type IDs are speakable.
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueSet, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueSet, input));
        }

        else if (act instanceof ValueChangedAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueChanged, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueChanged, input));
        }

        else if (act instanceof RequestValueAct || act instanceof RequestChangedValueAct) {
            const prompt = act instanceof RequestValueAct ? this.props.prompts.requestValue : this.props.prompts.requestChangedValue;
            const reprompt = act instanceof RequestChangedValueAct ? this.props.reprompts.requestValue : this.props.reprompts.requestChangedValue;

            builder.addPromptFragment(this.evaluatePromptProp(act, prompt, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, reprompt, input));

            const slotElicitation = generateSlotElicitation(this.props.slotType);
            builder.addElicitSlotDirective(slotElicitation.slotName, slotElicitation.intent);
        }

        else if (act instanceof ConfirmValueAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.confirmValue, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.confirmValue, input));
        }

        else if (act instanceof ValueConfirmedAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueConfirmed, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueConfirmed, input));
        }

        else if (act instanceof ValueDisconfirmedAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueDisconfirmed, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueDisconfirmed, input));
        }
        else {
            this.throwUnhandledActError(act);
        }
    }

    // tsDoc - see Control
    updateInteractionModel(generator: ControlInteractionModelGenerator, imData: ModelData) {
        generator.addControlIntent(new SingleValueControlIntent(this.props.slotType), imData);
        generator.addControlIntent(new GeneralControlIntent(), imData);
        generator.addYesAndNoIntents();
    }


    // tsDoc - see InteractionModelContributor
    getTargetIds(): string[] {
        return this.props.interactionModel.targets;
    }
}

/**
 * Creates an elicit-slot directive for the provided slotType.
 *
 * - The intent specified is a `{slotType}_ValueControlIntent`
 * - The slot specified is the `slotType` slot.
 *
 * @param slotType - Slot type
 */
function generateSlotElicitation(slotType: string): { intent: Intent, slotName: string } {
    const intent: Intent = {
        // TODO: refactor: use SingleValueControlIntent.intentName
        name: `${slotType}_ValueControlIntent`.replace('.', '_'),
        slots: {
            slotType: { name: slotType, value: '', confirmationStatus: 'NONE' },
            feedback: { name: "feedback", value: '', confirmationStatus: 'NONE' },
            action: { name: "action", value: '', confirmationStatus: 'NONE' },
            target: { name: "target", value: '', confirmationStatus: 'NONE' },
            head: { name: "head", value: '', confirmationStatus: 'NONE' },
            tail: { name: "tail", value: '', confirmationStatus: 'NONE' },
            assign: { name: "assign", value: '', confirmationStatus: 'NONE' },
        },
        confirmationStatus: "NONE"
    };

    return {
        intent,
        slotName: slotType
    };
}
