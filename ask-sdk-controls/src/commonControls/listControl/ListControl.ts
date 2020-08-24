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

import { getSupportedInterfaces } from 'ask-sdk-core';
import { Intent, IntentRequest, interfaces } from "ask-sdk-model";
import i18next from 'i18next';
import _ from "lodash";
import { Strings as $ } from "../../constants/Strings";
import { Control, ControlProps, ControlState } from '../../controls/Control';
import { ControlInput } from '../../controls/ControlInput';
import { ControlResultBuilder } from '../../controls/ControlResult';
import { InteractionModelContributor } from '../../controls/mixins/InteractionModelContributor';
import { ValidationResult } from '../../controls/ValidationResult';
import { AmazonBuiltInSlotType } from '../../intents/AmazonBuiltInSlotType';
import { GeneralControlIntent, unpackGeneralControlIntent } from '../../intents/GeneralControlIntent';
import { OrdinalControlIntent, unpackOrdinalControlIntent } from "../../intents/OrdinalControlIntent";
import { SingleValueControlIntent, unpackSingleValueControlIntent } from '../../intents/SingleValueControlIntent';
import { ControlInteractionModelGenerator } from '../../interactionModelGeneration/ControlInteractionModelGenerator';
import { ModelData, SharedSlotType } from '../../interactionModelGeneration/ModelTypes';
import { ListFormatting } from '../../intl/ListFormat';
import { Logger } from "../../logging/Logger";
import { ControlResponseBuilder } from '../../responseGeneration/ControlResponseBuilder';
import { InvalidValueAct, UnusableInputValueAct, ValueChangedAct, ValueConfirmedAct, ValueDisconfirmedAct, ValueSetAct } from "../../systemActs/ContentActs";
import { ConfirmValueAct, RequestChangedValueByListAct, RequestValueByListAct } from "../../systemActs/InitiativeActs";
import { SystemAct } from '../../systemActs/SystemAct';
import { StringOrList } from '../../utils/BasicTypes';
import { DeepRequired } from '../../utils/DeepRequired';
import { InputUtil } from "../../utils/InputUtil";
import { falseIfGuardFailed, okIf, StateConsistencyError } from '../../utils/Predicates';
import { APLListItem, generateTextListDocumentForListControl } from './APL';

// TODO: feature: support "what are my choices"
// TODO: feature: voice pagination of choices.

const log = new Logger('AskSdkControls:ListControl');

/**
 * Props for a ListControl.
 */
export interface ListControlProps extends ControlProps {

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
     * List of slot-value IDs that will be presented to the user as a list.
     */
    listItemIDs: string[] | ((input: ControlInput) => string[]);

    /**
     * The maximum number of items spoken per turn.
     */
    pageSize?: number;

    /**
     * Determines if the Control must obtain a value.
     *
     * Default: `true`.
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
    prompts?: ListControlPromptProps;

    /**
     * Props to customize the reprompt fragments that will be added by
     * `this.renderAct()`.
     */
    reprompts?: ListControlPromptProps;

    /**
     * Props to customize the relationship between the control and the
     * interaction model.
     */
    interactionModel?: ListControlInteractionModelProps;

    /**
     * Props to customize the APL generated by this control.
     */
    apl?: ListControlAPLProps;
}

/**
 * ListControl validation function
 */
export type SlotValidationFunction = (state: ListControlState, input: ControlInput) => true | ValidationResult;

/**
 * Mapping of action slot values to the behaviors that this control supports.
 *
 * Behavior:
 * - This control will not handle an input if the action-slot is filled with an
 *   value whose ID is not associated with a capability.
 */
export interface ListControlActionProps {
    /**
     * Action slot value IDs that are associated with the "set value" capability.
     *
     * Default: ['builtin_set', 'builtin_select']
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
export class ListControlInteractionModelProps {
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
    actions?: ListControlActionProps;
}

/**
 * Props to customize the prompt fragments that will be added by
 * `this.renderAct()`.
 */
export class ListControlPromptProps {
    valueSet?: StringOrList | ((act: ValueSetAct<any>, input: ControlInput) => StringOrList);
    valueChanged?: StringOrList | ((act: ValueChangedAct<any>, input: ControlInput) => StringOrList);
    invalidValue?: StringOrList | ((act: InvalidValueAct<any>, input: ControlInput) => StringOrList);
    unusableInputValue?: StringOrList | ((act: UnusableInputValueAct<string>, input: ControlInput) => StringOrList);
    requestValue?: StringOrList | ((act: RequestValueByListAct, input: ControlInput) => StringOrList);
    requestChangedValue?: StringOrList | ((act: RequestChangedValueByListAct, input: ControlInput) => StringOrList);
    confirmValue?: StringOrList | ((act: ConfirmValueAct<any>, input: ControlInput) => StringOrList);
    valueConfirmed?: StringOrList | ((act: ValueConfirmedAct<any>, input: ControlInput) => StringOrList);
    valueDisconfirmed?: StringOrList | ((act: ValueDisconfirmedAct<any>, input: ControlInput) => StringOrList);
}

/**
 * Props associated with the APL produced by ListControl.
 */
export class ListControlAPLProps {
    /**
     * Determines if APL should be produced.
     *
     * Default: true
     */
    enabled?: boolean | ((input: ControlInput) => boolean);

    /**
     * The APL document to use when requesting a value
     *
     * Default: A TextListLayout document with scrollable and clickable list.
     * See
     * https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-alexa-text-list-layout.html
     */
    requestAPLDocument?: { [key: string]: any; } | ((act: RequestValueByListAct, input: ControlInput) => { [key: string]: any; });


}

/**
 * State tracked by a ListControl.
 */
export class ListControlState implements ControlState {

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

    // TODO: refactor. tracking the requestAct itself is likely simpler.
    /**
     * Index of the page of items most recently spoken.
     */
    spokenItemsPageIndex?: number;

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
    activeInitiativeAct?: string; // TODO: Store actual act
}

/**
 * A Control that obtains a single value from the user by presenting a list of
 * available options using voice and/or APL.
 *
 * The type of value to obtain is defined by `this.slotType`.
 *
 * Capabilities:
 * - Request a value
 * - Change a value
 * - Validate the value
 * - Confirm the value
 * - Speak the first few options
 * - Show all the options on APL enabled devices
 * - Selection of a value using a spoken ordinal, e.g. "The first one".
 * - Selection of a value using touch screen.
 *
 * Intents that can be handled:
 * - `GeneralControlIntent`: E.g. `"yes, update my name"`
 * - `{ValueType}_ValueControlIntent`: E.g. "no change it to Elvis".
 * - `AMAZON_ORDINAL_ValueControlIntent`: E.g. "no change it to Elvis".
 * - `AMAZON.YesIntent`, `AMAZON.NoIntent`
 *
 * APL events that can be handled:
 *  - touch events indicating selection of an item on screen.
 *
 * Limitations:
 * - This control is not compatible with the `AMAZON.SearchQuery` slot type.
 */
export class ListControl extends Control implements InteractionModelContributor {

    state: ListControlState = new ListControlState();

    private rawProps: ListControlProps;
    private props: DeepRequired<ListControlProps>;
    private handleFunc?: (input: ControlInput, resultBuilder: ControlResultBuilder) => void;
    private initiativeFunc?: (input: ControlInput, resultBuilder: ControlResultBuilder) => void;

    constructor(props: ListControlProps) {
        super(props.id);

        if (props.slotType === AmazonBuiltInSlotType.SEARCH_QUERY){
            throw new Error('AMAZON.SearchQuery cannot be used with ListControl due to the special rules regarding its use. '
             + 'Specifically, utterances that include SearchQuery must have a carrier phrase and not be comprised entirely of slot references. '
             + 'Use a custom intent to manage SearchQuery slots or create a regular slot for use with ListControl.');
        }

        this.rawProps = props;
        this.props = ListControl.mergeWithDefaultProps(props);
    }

    static mergeWithDefaultProps(props: ListControlProps): DeepRequired<ListControlProps> {

        const defaults: DeepRequired<ListControlProps> =
        {
            id: 'dummy',
            slotType: 'dummy',
            required: true,
            validation: [],
            pageSize: 3,
            listItemIDs: [],
            confirmationRequired: false,
            interactionModel: {
                actions: {
                    set: [$.Action.Set, $.Action.Select],
                    change: [$.Action.Change],
                },
                targets: [$.Target.Choice, $.Target.It]
            },
            prompts: {
                confirmValue: (act) => i18next.t('LIST_CONTROL_DEFAULT_PROMPT_CONFIRM_VALUE', { value: act.payload.value }),
                valueConfirmed: i18next.t('LIST_CONTROL_DEFAULT_PROMPT_VALUE_AFFIRMED'),
                valueDisconfirmed: i18next.t('LIST_CONTROL_DEFAULT_PROMPT_VALUE_DISAFFIRMED'),
                valueSet: (act) => i18next.t('LIST_CONTROL_DEFAULT_PROMPT_VALUE_SET', { value: act.payload.value }),
                valueChanged: (act) => i18next.t('LIST_CONTROL_DEFAULT_PROMPT_VALUE_CHANGED', { value: act.payload.value }),
                invalidValue: (act) => {
                    if (act.payload.renderedReason !== undefined) {
                        return i18next.t('LIST_CONTROL_DEFAULT_PROMPT_INVALID_VALUE_WITH_REASON', { value: act.payload.value, reason: act.payload.renderedReason });
                    }
                    return i18next.t('LIST_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_VALUE');
                },
                unusableInputValue: (act) => i18next.t('LIST_CONTROL_DEFAULT_PROMPT_UNUSABLE_INPUT_VALUE'),
                requestValue: (act) => i18next.t('LIST_CONTROL_DEFAULT_PROMPT_REQUEST_VALUE', { suggestions: ListFormatting.format(act.payload.choicesFromActivePage)}),
                requestChangedValue: (act) => i18next.t('LIST_CONTROL_DEFAULT_PROMPT_REQUEST_CHANGED_VALUE', { suggestions: ListFormatting.format(act.payload.choicesFromActivePage)}),
            },
            reprompts: {
                confirmValue: (act) => i18next.t('LIST_CONTROL_DEFAULT_REPROMPT_CONFIRM_VALUE', { value: act.payload.value }),
                valueConfirmed: i18next.t('LIST_CONTROL_DEFAULT_REPROMPT_VALUE_AFFIRMED'),
                valueDisconfirmed: i18next.t('LIST_CONTROL_DEFAULT_REPROMPT_VALUE_DISAFFIRMED'),
                valueSet: (act) => i18next.t('LIST_CONTROL_DEFAULT_REPROMPT_VALUE_SET', { value: act.payload.value }),
                valueChanged: (act) => i18next.t('LIST_CONTROL_DEFAULT_REPROMPT_VALUE_CHANGED', { value: act.payload.value }),
                invalidValue: (act) => {
                    if (act.payload.renderedReason !== undefined) {
                        return i18next.t('LIST_CONTROL_DEFAULT_REPROMPT_INVALID_VALUE_WITH_REASON', { value: act.payload.value, reason: act.payload.renderedReason });
                    }
                    return i18next.t('LIST_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_VALUE');
                },
                unusableInputValue: (act) => i18next.t('LIST_CONTROL_DEFAULT_REPROMPT_UNUSABLE_INPUT_VALUE'),
                requestValue: (act) => i18next.t('LIST_CONTROL_DEFAULT_REPROMPT_REQUEST_VALUE', { suggestions: ListFormatting.format(act.payload.choicesFromActivePage)}),
                requestChangedValue: (act) => i18next.t('LIST_CONTROL_DEFAULT_REPROMPT_REQUEST_CHANGED_VALUE', { suggestions: ListFormatting.format(act.payload.choicesFromActivePage)}),
            },
            apl: {
                enabled: true,
                requestAPLDocument: generateTextListDocumentForListControl()
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
            || this.isConfirmationDisAffirmed(input)
            || this.isOrdinalScreenEvent(input)
            || this.isOrdinalSelection(input);
    }

    // tsDoc - see Control
    async handle(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        if (this.handleFunc === undefined){
            log.error('ListControl: handle called but no clause matched.  are canHandle/handle out of sync?');
            const intent: Intent = (input.request as IntentRequest).intent;
            throw new Error(`${intent.name} can not be handled by ${this.constructor.name}.`);
        }

        this.handleFunc(input, resultBuilder);
        if (resultBuilder.hasInitiativeAct() !== true && this.canTakeInitiative(input) === true){
            await this.takeInitiative(input, resultBuilder);
        }
    }

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

    private handleSetWithValue(input: ControlInput, resultBuilder: ControlResultBuilder) {
        const { valueStr, erMatch } = InputUtil.getValueResolution(input);
        this.setValue(valueStr, erMatch);
        this.validateAndAddActs(input, resultBuilder, $.Action.Set);
        return;
    }

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

    private handleSetWithoutValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.askElicitationQuestion(input, resultBuilder, $.Action.Set);
        return;
    }

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

    private handleChangeWithValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const { valueStr, erMatch } = InputUtil.getValueResolution(input);
        this.setValue(valueStr, erMatch);
        this.validateAndAddActs(input, resultBuilder, $.Action.Change);
        return;
    }

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

    private handleChangeWithoutValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.askElicitationQuestion(input, resultBuilder, $.Action.Change);
        return;
    }

    private isBareValue(input: ControlInput): any {
        try {
            okIf(InputUtil.isIntent(input, SingleValueControlIntent.intentName(this.props.slotType)));
            const { feedback, action, target, valueStr, valueType } = unpackSingleValueControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.feedbackIsUndefined(feedback));
            okIf(InputUtil.actionIsUndefined(action));
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.valueStrDefined(valueStr));
            okIf(InputUtil.valueTypeMatch(valueType, this.props.slotType));
            this.handleFunc = this.handleBareValue;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }


    private handleBareValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const { valueStr, erMatch } = InputUtil.getValueResolution(input);
        this.setValue(valueStr, erMatch);
        this.validateAndAddActs(input, resultBuilder, this.state.elicitationAction ?? $.Action.Set);
        return;
    }

    private isConfirmationAffirmed(input: ControlInput): any {
        try {
            okIf(InputUtil.isBareYes(input));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            this.handleFunc = this.handleConfirmationAffirmed;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleConfirmationAffirmed(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.activeInitiativeAct = undefined;
        this.state.isValueConfirmed = true;
        resultBuilder.addAct(
            new ValueConfirmedAct(this, { value: this.state.value })
        );
    }

    private isConfirmationDisAffirmed(input: ControlInput): any {
        try {
            okIf(InputUtil.isBareNo(input));
            okIf(this.state.activeInitiativeAct === 'ConfirmValueAct');
            this.handleFunc = this.handleConfirmationDisAffirmed;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleConfirmationDisAffirmed(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.isValueConfirmed = false;
        this.state.activeInitiativeAct = undefined;
        resultBuilder.addAct(new ValueDisconfirmedAct(this, {value: this.state.value}));

        const allChoices = this.getChoicesList(input);
        if (allChoices === null) {
            throw new Error('ListControl.listItemIDs is null');
        }
        const choicesFromActivePage = this.getChoicesFromActivePage(allChoices);
        resultBuilder.addAct(new RequestValueByListAct(this, {choicesFromActivePage, allChoices}));
    }

    private isOrdinalScreenEvent(input: ControlInput) {
        try {
            okIf(InputUtil.isAPLUserEventWithMatchingControlId(input, this.id));
            this.handleFunc = this.handleOrdinalScreenEvent;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }

    private handleOrdinalScreenEvent(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const onScreenChoices = this.getChoicesList(input);
        if (onScreenChoices === null) {
            throw new StateConsistencyError('OrdinalScreenEvent received but no known list values.');
        }

        const ordinal = (input.request as interfaces.alexa.presentation.apl.UserEvent).arguments![1];
        if (ordinal < 0 || ordinal > onScreenChoices.length) {
            throw new StateConsistencyError(`APL Ordinal out of range. ordinal=${ordinal} valueList=${onScreenChoices}`);
        }
        const value = onScreenChoices[ordinal - 1];
        this.setValue(value, true);

        // feedback
        resultBuilder.addAct(new ValueSetAct(this, { value }));
        return;
    }

    private isOrdinalSelection(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isIntent(input, OrdinalControlIntent.name));
            const { feedback, action, target, 'AMAZON.Ordinal': value} = unpackOrdinalControlIntent((input.request as IntentRequest).intent);
            okIf(InputUtil.feedbackIsMatchOrUndefined(feedback, [$.Feedback.Affirm, $.Feedback.Disaffirm]));
            okIf(InputUtil.actionIsMatchOrUndefined(action, this.props.interactionModel.actions.set));
            okIf(InputUtil.targetIsMatchOrUndefined(target, this.props.interactionModel.targets));
            okIf(InputUtil.valueStrDefined(value));
            this.handleFunc = this.handleOrdinalSelection;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }

    private handleOrdinalSelection(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const allChoices = this.getChoicesList(input);
        const spokenChoices = this.getChoicesFromActivePage(allChoices);
        const {'AMAZON.Ordinal': valueStr} = unpackOrdinalControlIntent((input.request as IntentRequest).intent);

        const value = valueStr !== undefined ? Number.parseInt(valueStr!, 10) : undefined;
        if (value !== undefined && value <= spokenChoices.length){
            this.setValue(spokenChoices[value - 1], true);
            resultBuilder.addAct(new ValueSetAct(this, { value: this.state.value }));
            return;
        }
        resultBuilder.addAct(
            new UnusableInputValueAct(this, {value, reasonCode: 'OrdinalOutOfRange', renderedReason: 'I don\'t know which you mean.' })
        );
        return;
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

    /**
     * Clear the state of this control.
     */
    clear() {
        this.state = new ListControlState();
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
            const errorMsg = 'ListControl: takeInitiative called but this.initiativeFunc is not set. canTakeInitiative() should be called first to set this.initiativeFunc.';
            log.error(errorMsg);
            throw new Error(errorMsg);
        }
        this.initiativeFunc(input, resultBuilder);
        return;
    }

    private wantsToConfirmValue(input: ControlInput): boolean {
        if (this.state.value !== undefined && this.state.isValueConfirmed === false && this.evaluateBooleanProp(this.props.confirmationRequired, input)){
            this.initiativeFunc = this.confirmValue;
            return true;
        }
        return false;
    }

    private confirmValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.activeInitiativeAct = 'ConfirmValueAct';
        resultBuilder.addAct(new ConfirmValueAct(this, { value: this.state.value }));
    }

    private wantsToFixInvalidValue(input: ControlInput): boolean {
        if (this.state.value !== undefined && this.validate(input) !== true){
            this.initiativeFunc = this.fixInvalidValue;
            return true;
        }
        return false;
    }

    private fixInvalidValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.validateAndAddActs(input, resultBuilder, $.Action.Change);
    }

    private wantsToElicitValue(input: ControlInput): boolean {
        if (this.state.value === undefined && this.evaluateBooleanProp(this.props.required, input)){
            this.initiativeFunc = this.elicitValue;
            return true;
        }
        return false;
    }

    private elicitValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.askElicitationQuestion(input, resultBuilder, $.Action.Set);
    }

    private validateAndAddActs(input: ControlInput, resultBuilder: ControlResultBuilder, elicitationAction: string): void {
        this.state.elicitationAction = elicitationAction;
        const validationResult: true | ValidationResult = this.validate(input);
        if (validationResult === true) {
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
            resultBuilder.addAct(new InvalidValueAct<string>(
                this,
                {
                    value: this.state.value!,
                    reasonCode: validationResult.reasonCode,
                    renderedReason: validationResult.renderedReason
                })
            );
            this.askElicitationQuestion(input, resultBuilder, elicitationAction);
        }
        return;
    }

    private validate(input: ControlInput): true | ValidationResult {
        const listOfValidationFunc: SlotValidationFunction[] = typeof(this.props.validation) === 'function' ? [this.props.validation] : this.props.validation;
        for (const validationFunction of listOfValidationFunc) {
            const validationResult: true | ValidationResult = validationFunction(this.state, input);
            if (validationResult !== true) {
                log.debug(`ListControl.validate(): validation failed. Reason: ${JSON.stringify(validationResult, null, 2)}.`);
                return validationResult;
            }
        }
        return true;
    }

    private askElicitationQuestion(input: ControlInput, resultBuilder: ControlResultBuilder, elicitationAction: string) {
        this.state.elicitationAction = elicitationAction;
        const allChoices = this.getChoicesList(input);
        if (allChoices === null) {
            throw new Error('ListControl.listItemIDs is null');
        }

        const choicesFromActivePage = this.getChoicesFromActivePage(allChoices);
        switch (elicitationAction) {
            case $.Action.Set:
                resultBuilder.addAct(new RequestValueByListAct(this, {choicesFromActivePage, allChoices}));
                return;
            case $.Action.Change:
                resultBuilder.addAct(
                    new RequestChangedValueByListAct(this, {currentValue: this.state.value!, choicesFromActivePage, allChoices})
                );
                return;
            default:
                throw new Error(`Unhandled. Unknown elicitationAction: ${elicitationAction }`);
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

    private getChoicesList(input: ControlInput): string[] {
        const slotIds: string[] = (typeof this.props.listItemIDs === 'function')
            ? this.props.listItemIDs.call(this, input)
            : this.props.listItemIDs;
        return slotIds;
    }

    private getChoicesFromActivePage(allChoices: string[]): string[] {
        const start = this.getPageIndex();
        const end = start + this.props.pageSize;
        return allChoices.slice(start, end);
    }

    private getPageIndex(): number {
        if (this.state.spokenItemsPageIndex === undefined) {
            this.state.spokenItemsPageIndex = 0;
        }
        return this.state.spokenItemsPageIndex;
    }

    // tsDoc - see Control
    renderAct(act: SystemAct, input: ControlInput, builder: ControlResponseBuilder): void {

        if (act instanceof RequestValueByListAct || act instanceof RequestChangedValueByListAct) {

            const prompt = act instanceof RequestValueByListAct
                ? this.evaluatePromptProp(act, this.props.prompts.requestValue, input)
                : this.evaluatePromptProp(act, this.props.prompts.requestChangedValue, input);
            const reprompt = act instanceof RequestValueByListAct
                ? this.evaluatePromptProp(act, this.props.reprompts.requestValue, input)
                : this.evaluatePromptProp(act, this.props.reprompts.requestChangedValue, input);

            builder.addPromptFragment(this.evaluatePromptProp(act, prompt, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, reprompt, input));

            if (this.evaluateBooleanProp(this.props.apl.enabled, input)) {
                const itemsArray: APLListItem[] = [];
                for (const choice of act.payload.allChoices) {
                    itemsArray.push({
                        primaryText: choice
                    });
                }

                // If APL is defined in act & users' device support APL
                if (getSupportedInterfaces(input.handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
                    const aplDataSource = {
                        textListData: {
                            controlId: this.id,
                            headerTitle: i18next.t('LIST_CONTROL_DEFAULT_APL_HEADER_TITLE'),
                            items: itemsArray,
                        }
                    };
                    // TODO: apl merging / combination strategy
                    builder.addAPLRenderDocumentDirective('Token', this.props.apl.requestAPLDocument, aplDataSource);
                }
            }
        }

        else if (act instanceof UnusableInputValueAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.unusableInputValue, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.unusableInputValue, input));
        }

        else if (act instanceof InvalidValueAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.invalidValue, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.invalidValue, input));
        }

        else if (act instanceof ValueSetAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueSet, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueSet, input));
        }

        else if (act instanceof ValueChangedAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueChanged, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueChanged, input));
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
        generator.addControlIntent(new GeneralControlIntent(), imData);
        generator.addControlIntent(new SingleValueControlIntent(this.props.slotType), imData);
        generator.addControlIntent(new OrdinalControlIntent(), imData);
        generator.addYesAndNoIntents();

        if (this.props.interactionModel.targets.includes($.Target.Choice)) {
            generator.addValuesToSlotType(SharedSlotType.TARGET, i18next.t('LIST_CONTROL_DEFAULT_SLOT_VALUES_TARGET_CHOICE', { returnObjects: true }));
        }

        if (this.props.interactionModel.actions.set.includes($.Action.Select)) {
            generator.addValuesToSlotType(SharedSlotType.ACTION, i18next.t('LIST_CONTROL_DEFAULT_SLOT_VALUES_ACTION_SELECT', { returnObjects: true }));
        }
    }

    // tsDoc - see InteractionModelContributor
    getTargetIds() {
        return this.props.interactionModel.targets;
    }

    // TODO: feature: use slot elicitation when requesting.
}
