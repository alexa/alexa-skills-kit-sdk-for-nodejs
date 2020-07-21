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


import { IntentRequest } from "ask-sdk-model";
import i18next from 'i18next';
import _ from "lodash";
import { InputUtil, SingleValueControlIntent, StringOrList } from '../..';
import { Strings as $ } from '../../constants/Strings';
import { ContainerControl, ContainerControlProps, ContainerControlState } from '../../controls/ContainerControl';
import { ControlInput } from '../../controls/ControlInput';
import { ControlResultBuilder } from '../../controls/ControlResult';
import { InteractionModelContributor } from '../../controls/mixins/InteractionModelContributor';
import { ValidationResult } from '../../controls/ValidationResult';
import { AmazonBuiltInSlotType } from '../../intents/AmazonBuiltInSlotType';
import { ActionAndTask, ConjunctionControlIntent, generateActionTaskPairs, unpackConjunctionControlIntent } from '../../intents/ConjunctionControlIntent';
import { DateRangeControlIntent, unpackDateRangeControlIntent } from '../../intents/DateRangeControlIntent';
import { GeneralControlIntent, unpackGeneralControlIntent } from '../../intents/GeneralControlIntent';
import { unpackSingleValueControlIntent } from '../../intents/SingleValueControlIntent';
import { ControlInteractionModelGenerator } from '../../interactionModelGeneration/ControlInteractionModelGenerator';
import { ModelData, SharedSlotType } from '../../interactionModelGeneration/ModelTypes';
import { Logger } from '../../logging/Logger';
import { ControlResponseBuilder } from '../../responseGeneration/ControlResponseBuilder';
import { DateRangeChangedAct, DateRangeSetAct, InvalidValueAct, ValueConfirmedAct, ValueDisconfirmedAct } from "../../systemActs/ContentActs";
import { ConfirmValueAct, RequestValueAct } from '../../systemActs/InitiativeActs';
import { SystemAct } from '../../systemActs/SystemAct';
import { DeepRequired } from '../../utils/DeepRequired';
import { falseIfGuardFailed, okIf } from '../../utils/Predicates';
import { DateControl, DateControlPromptProps, DateValidationFunction } from '../DateControl';
import { alexaDateFormatToDate, findEdgeDateOfDateRange } from './DateHelper';
import { DateRangeControlIntentInput, generateDatesInputGroups } from './DateRangeNLUHelper';

const log = new Logger('AskSdkControls:DateRangeControl');

/**
 * Props for a ValueControl.
 */
export interface DateRangeControlProps extends ContainerControlProps {

    /**
     * Unique identifier for control instance
     */
    id: string;


    /**
     * Props for determining if the date(s) are valid.
     */
    validation?: {
        /**
         * Function(s) to determine if the state date (in isolation) is valid.
         *
         * Default: `true`, i.e. any value is valid.
         *
         * Usage:
         * - Validation functions return either `true` or a `ValidationResult`
         *   to describe what validation failed.
         * - Common validation functions for the start-date (in isolation) are
         *   defined in the `DateControlValidations` namespace which can be
         *   added directly to this prop. e.g.:
         * ```
         * valid: DateControlValidations.FUTURE_DATE_ONLY,
         * ```
         */
        startDateValid?: DateValidationFunction | DateValidationFunction[],

        /**
         * Function(s) that determine if the end date (in isolation) is valid.
         *
         * Default: `true`, i.e. any value is valid.
         *
         * Usage:
         * - Validation functions return either `true` or a `ValidationResult`
         *   to describe what validation failed.
         * - Common validation functions for the end-date (in isolation) are
         *   defined in the `DateControlValidations` namespace which can be
         *   added directly to this prop. e.g.:
         * ```
         * valid: DateControlValidations.FUTURE_DATE_ONLY,
         * ```
         */
        endDateValid?: DateValidationFunction | DateValidationFunction[],

        /**
         * Function(s) that determine if the date-range is valid.
         *
         * Default: `true`, i.e. any value is valid.
         *
         * Usage:
         * - Validation functions return either `true` or a `ValidationResult`
         *   to describe what validation failed.
         * - Common validation functions for the "date range" are defined in the
         *   `DateRangeControlValidations` namespace which can be added directly
         *   to this prop. e.g.:
         * ```
         * valid: DateRangeControlValidations.START_BEFORE_END,
         * ```
         */
        rangeValid?: DateRangeValidationFunction | DateRangeValidationFunction[]
    };

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
    prompts?: DateRangeControlPromptProps;

    /**
     * Props to customize the reprompt fragments that will be added by
     * `this.renderAct()`.
     */
    reprompts?: DateRangeControlPromptProps;


    /**
     * Props to customize the relationship between the control and the
     * interaction model.
     */
    interactionModel?: DateRangeControlInteractionModelProps;
}


/**
 * Date range validation function
 */
export type DateRangeValidationFunction = ((state: DateRangeControlState, input: ControlInput) => true | ValidationResult);

/**
 * Mapping of action slot values to the behaviors that this control supports.
 *
 * Behavior:
 * - This control will not handle an input if the action-slot is filled with an
 *   value whose ID is not associated with a capability.
 */
export interface DateRangeControlActionProps {
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
export interface DateRangeControlInteractionModelProps {
    /**
     * Target-slot values associated with this Control.
     *
     * Specific targets can be specified for the start-date, the end-date and
     * the range as a whole.
     */
    targets?: DateRangeControlTargetProps;

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
    actions?: DateRangeControlActionProps;
}

export type DateRangeControlTargetProps = {

    /**
     * Target-slot values associated with the control as a whole, i.e. the date
     * range.
     *
     * Targets associate utterances to a control. For example, if the user says
     * "change the time", it is parsed as a `GeneralControlIntent` with slot
     * values `action = change` and `target = time`.  Only controls that are
     * registered with the `time` target should offer to handle this intent.
     *
     * Default: ['builtin_date_range', 'builtin_date', 'builtin_it']
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
     */
    self?: string[]

    /**
     * Target-slot values associated with the start date in isolation.
     *
     * Targets associate utterances to a control. For example, if the user says
     * "change the time", it is parsed as a `GeneralControlIntent` with slot
     * values `action = change` and `target = time`.  Only controls that are
     * registered with the `time` target should offer to handle this intent.
     *
     * Default: ['builtin_start_date', 'builtin_date', 'builtin_it']
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
     */
    startDate?: string[],

    /**
     * Target-slot values associated with the end date in isolation.
     *
     * Targets associate utterances to a control. For example, if the user says
     * "change the time", it is parsed as a `GeneralControlIntent` with slot
     * values `action = change` and `target = time`.  Only controls that are
     * registered with the `time` target should offer to handle this intent.
     *
     * Default: ['builtin_end_date', 'builtin_date', 'builtin_it']
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
     */
    endDate?: string[],
};

/**
 * Reason codes for built-in validation rules.
 */
export enum DateRangeValidationFailReasonCode {
    /**
     * The start date must precede the end date.
     */
    START_BEFORE_END = 'startBeforeEnd',
}

/**
 * Built-in validation functions for use with DateControl
 */
export namespace DateRangeControlValidations {
    export const START_BEFORE_END: DateRangeValidationFunction = (state: DateRangeControlState, input: ControlInput): true | ValidationResult => {
        const startDate = alexaDateFormatToDate(state.startDate!);
        const endDate = alexaDateFormatToDate(state.endDate!);
        if (startDate > endDate) {
            return { reasonCode: DateRangeValidationFailReasonCode.START_BEFORE_END, renderedReason: i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_VALIDATION_FAIL_START_AFTER_END') };
        }
        return true;
    };
}


/**
 * Props to customize the prompt fragments that will be added by
 * `this.renderAct()`.
 */
export interface DateRangeControlPromptProps {
    startDate?: DateControlPromptProps,
    endDate?: DateControlPromptProps,
    requestValue?: StringOrList | ((act: RequestValueAct, input: ControlInput) => StringOrList),
    valueSet?: StringOrList | ((act: DateRangeSetAct, input: ControlInput) => StringOrList);

    valueChanged?: StringOrList | ((act: DateRangeChangedAct, input: ControlInput) => StringOrList);
    invalidValue?: StringOrList | ((act: InvalidValueAct<string>, input: ControlInput) => StringOrList),
    valueDisaffirmed?: StringOrList | ((act: ValueDisconfirmedAct<string>, input: ControlInput) => StringOrList);
    valueAffirmed?: StringOrList | ((act: ValueConfirmedAct<string>, input: ControlInput) => StringOrList);
    confirmValue?: StringOrList | ((act: ConfirmValueAct<string>, input: ControlInput) => StringOrList);
}


/**
 * State tracked by a DateRangeControl.
 */
export class DateRangeControlState extends ContainerControlState {

    // TODO: refactor: collate startDate/endDate into .value

    /**
     * The start date
     */
    startDate?: string;

    /**
     * The end date
     */
    endDate?: string;

    /**
     * The previous start date
     */
    previousStartDate?: string ;

    /**
     * The previous end date
     */
    previousEndDate?: string;

    /**
     * Tracks whether the dateRangeControl is requesting a change to the whole range.
     */
    isChangingRange: boolean = false;

    /**
     * Tracks whether the dateRangeControl is confirming the whole range.
     */
    isConfirmingRange: boolean = false;

    /**
     * Tracks whether the topic of conversation is the whole range.
     */
    onFocus: boolean = true;

    /**
     * Tracks whether the range has been explicitly confirmed by the user.
     */
    isValueConfirmed: boolean = false;
}

/**
 * Categorization of "what seems to be the target" of a utterance.
 */
export enum TargetCategory {
    StartDate = 'startDate',
    EndDate = 'endDate',
    Both = 'both',
    Neither = 'neither',
    Either = 'either'
}

/**
 * Categorization of "what seems to be the target" of a utterance.
 */
export enum DateControlTarget {
    StartDate = 'startDate',
    EndDate = 'endDate'
}

/**
 * A Control that obtains a date range from the user.
 *
 * Capabilities:
 * - Request a range, or just the start/end date
 * - Change the range, or just the start/end date
 * - Validate the range or just the start/end date
 * - Confirm the range or just the start/end date
 * - Infer specific date(s) for a partially specified date(s).
 *
 * Intents that can be handled:
 * - `GeneralControlIntent`: E.g. `"yes, update my birth date"`
 * - `ConjunctionControlIntent`: E.g. `"yes, change the start and end dates"`
 * - `DateRangeControlIntent`: E.g. "no Tuesday to Saturday".
 * - `AMAZON_DATE_ValueControlIntent`: E.g. "no change it to Tuesday".
 * - `AMAZON.YesIntent`, `AMAZON.NoIntent`
 */
export class DateRangeControl extends ContainerControl implements InteractionModelContributor {

    state: DateRangeControlState;
    children: DateControl[];

    // TODO: API: the following should be private. Requires some consolidation with ContainerControl
    props: DeepRequired<DateRangeControlProps>;

    private startDateControl: DateControl;
    private endDateControl: DateControl;
    private handleFunc: ((input: ControlInput, resultBuilder: ControlResultBuilder) => void) | undefined;
    private takeInitiativeFunc: ((input: ControlInput, resultBuilder: ControlResultBuilder) => void) | undefined;

    static mergeWithDefaultProps(props: DateRangeControlProps): DeepRequired<DateRangeControlProps> {
        const defaults: DeepRequired<DateRangeControlProps> = {
            id: 'uninitialized',
            validation: {
                startDateValid: [],
                endDateValid: [],
                rangeValid: []
            },
            required: true,
            confirmationRequired: false,
            interactionModel: {
                targets: {
                    startDate: [$.Target.StartDate, $.Target.Date, $.Target.It],
                    endDate: [$.Target.EndDate, $.Target.Date, $.Target.It],
                    self: [$.Target.Date, $.Target.DateRange, $.Target.It]
                },
                actions: {
                    set: [$.Action.Set],
                    change: [$.Action.Change]
                },
            },
            prompts: {
                startDate: {
                    confirmValue: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_CONFIRM_START_DATE', { value: act.payload.value }),
                    valueAffirmed: i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_START_DATE_AFFIRMED'),
                    valueDisaffirmed: i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_START_DATE_DISAFFIRMED'),
                    valueSet: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_START_DATE_SET', { value: act.payload.value }),
                    valueChanged: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_START_DATE_CHANGED', { value: act.payload.value }),
                    invalidValue: (act) => {
                        if (act.payload.renderedReason !== undefined) {
                            return i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_INVALID_START_WITH_REASON', { reason: act.payload.renderedReason });
                        }
                        return i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_DATE');
                    },
                    requestValue: i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_REQUEST_START_DATE'),
                    requestChangedValue: i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_REQUEST_CHANGED_START_DATE'),
                },
                endDate: {
                    confirmValue: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_CONFIRM_END_DATE', { value: act.payload.value }),
                    valueAffirmed: i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_END_DATE_AFFIRMED'),
                    valueDisaffirmed: i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_END_DATE_DISAFFIRMED'),
                    valueSet: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_END_DATE_SET', { value: act.payload.value }),
                    valueChanged: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_END_DATE_CHANGED', { value: act.payload.value }),
                    invalidValue: (act) => {
                        if (act.payload.renderedReason !== undefined) {
                            return i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_INVALID_END_WITH_REASON', { reason: act.payload.renderedReason });
                        }
                        return i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_DATE');
                    },
                    requestValue: i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_REQUEST_END_DATE'),
                    requestChangedValue: i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_REQUEST_CHANGED_END_DATE'),
                },
                requestValue: (act: RequestValueAct) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_REQUEST_VALUE'),
                valueSet: (act: DateRangeSetAct) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_VALUE_SET', { start: act.startDate, end: act.endDate }),
                valueChanged: (act: DateRangeChangedAct) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_VALUE_CHANGED', { start: act.startDate, end: act.endDate }),
                invalidValue: (act: InvalidValueAct<string>) => {
                    if (act.payload.renderedReason !== undefined) {
                        return i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_INVALID_VALUE_WITH_REASON', { reason: act.payload.renderedReason });
                    }
                    return i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_VALUE');
                },
                valueAffirmed: i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_VALUE_AFFIRMED'),
                valueDisaffirmed: i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_VALUE_DISAFFIRMED'),
                confirmValue: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_PROMPT_CONFIRM_VALUE', { value: act.payload.value }),
            },
            reprompts: {
                startDate: {
                    confirmValue: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_CONFIRM_START_DATE', { value: act.payload.value }),
                    valueAffirmed: i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_START_DATE_AFFIRMED'),
                    valueDisaffirmed: i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_START_DATE_DISAFFIRMED'),
                    valueSet: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_START_DATE_SET', { value: act.payload.value }),
                    valueChanged: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_START_DATE_CHANGED', { value: act.payload.value }),
                    invalidValue: (act) => {
                        if (act.payload.reasonCode !== undefined) {
                            return i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_INVALID_START_WITH_REASON', { reason: act.payload.reasonCode });
                        }
                        return i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_GENERAL_INVALID_DATE');
                    },
                    requestValue: i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_REQUEST_START_DATE'),
                    requestChangedValue: i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_REQUEST_CHANGED_START_DATE'),
                },
                endDate: {
                    confirmValue: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_CONFIRM_END_DATE', { value: act.payload.value }),
                    valueAffirmed: i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_END_DATE_AFFIRMED'),
                    valueDisaffirmed: i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_END_DATE_DISAFFIRMED'),
                    valueSet: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_END_DATE_SET', { value: act.payload.value }),
                    valueChanged: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_END_DATE_CHANGED', { value: act.payload.value }),
                    invalidValue: (act) => {
                        if (act.payload.reasonCode !== undefined) {
                            return i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_INVALID_END_WITH_REASON', { reason: act.payload.reasonCode });
                        }
                        return i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_GENERAL_INVALID_DATE');
                    },
                    requestValue: i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_REQUEST_END_DATE'),
                    requestChangedValue: i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_REQUEST_CHANGED_END_DATE'),
                },
                requestValue: (act: RequestValueAct) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_REQUEST_VALUE'),
                valueSet: (act: DateRangeSetAct) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_VALUE_SET', { start: act.startDate, end: act.endDate }),
                valueChanged: (act: DateRangeChangedAct) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_VALUE_CHANGED', { start: act.startDate, end: act.endDate }),
                invalidValue: (act: InvalidValueAct<string>) => {
                    if (act.payload.reasonCode !== undefined) {
                        return i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_INVALID_VALUE_WITH_REASON', { reason: act.payload.reasonCode });
                    }
                    return i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_GENERAL_INVALID_VALUE');
                },
                valueAffirmed: i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_VALUE_AFFIRMED'),
                valueDisaffirmed: i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_VALUE_DISAFFIRMED'),
                confirmValue: (act) => i18next.t('DATE_RANGE_CONTROL_DEFAULT_REPROMPT_CONFIRM_VALUE', { value: act.payload.value }),
            },
        };

        return _.mergeWith(defaults, props);
    }

    constructor(props: DateRangeControlProps) {
        super(props);
        this.state = new DateRangeControlState();
        this.props = DateRangeControl.mergeWithDefaultProps(props);
        this.startDateControl = new DateControl({
            id: `${this.props.id}_startDate`,
            interactionModel: {
                targets: this.props.interactionModel.targets.startDate
            },
            prompts: this.props.prompts.startDate,
            validation: this.props.validation.startDateValid,
            required: this.props.required,
            confirmationRequired: this.props.confirmationRequired
        });
        this.endDateControl = new DateControl({
            id: `${this.props.id}_endDate`,
            interactionModel: {
                targets: this.props.interactionModel.targets.endDate
            },
            prompts: this.props.prompts.endDate,
            validation: this.props.validation.endDateValid,
            required: this.props.required,
            confirmationRequired: this.props.confirmationRequired
        });
        this.addChild(this.startDateControl)
            .addChild(this.endDateControl);
    }

    // tsDoc - see Control
    async canHandle(input: ControlInput): Promise<boolean> {
        return await this.canHandleForFocus(input) || this.canHandleForNoFocus(input);
    }

    // tsDoc - see Control
    async handle(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {

        log.debug(`DateRangeControl[${this.id}]: handle(). Entering`);

        // update the priorStartDate and priorEndDate before new operation
        this.updatePrior();

        // Calling handle function to make changes to state values
        if (this.handleFunc) {
            return this.handleFunc(input, resultBuilder);
        }

        // If can't handle by DateRangeControl itself, let children handle it and update state values
        await this.handleByChild(input, resultBuilder);
        const newStartDate = this.getStartDateFromChild();
        const newEndDate = this.getEndDateFromChild();
        this.setStartDate(newStartDate);
        this.setEndDate(newEndDate);
        this.state.onFocus = false;

        // After child handle the request and child has no question
        // ask DateRangeControl whether the value is ready
        if (!resultBuilder.hasInitiativeAct() && await this.canTakeInitiative(input)) {
            if (this.takeInitiativeFunc !== undefined) {
                this.takeInitiativeFunc(input, resultBuilder);
            }
        }
    }

    // tsDoc - see Control
    updateInteractionModel(generator: ControlInteractionModelGenerator, imData: ModelData) {
        generator.addControlIntent(new GeneralControlIntent(), imData);
        generator.addControlIntent(new ConjunctionControlIntent(), imData);
        generator.addControlIntent(new DateRangeControlIntent(), imData);
        generator.addControlIntent(new SingleValueControlIntent(AmazonBuiltInSlotType.DATE), imData);
        generator.addYesAndNoIntents();

        if (this.props.interactionModel.targets.self.includes($.Target.Date)) {
            generator.addValuesToSlotType(SharedSlotType.TARGET, i18next.t('DATE_CONTROL_DEFAULT_SLOT_VALUES_TARGET_DATE', { returnObjects: true }));
        }
        if (this.props.interactionModel.targets.self.includes($.Target.DateRange)) {
            generator.addValuesToSlotType(SharedSlotType.TARGET, i18next.t('DATE_RANGE_CONTROL_DEFAULT_SLOT_VALUES_TARGET_DATE_RANGE', { returnObjects: true }));
        }
        if (this.props.interactionModel.targets.startDate.includes($.Target.StartDate)) {
            generator.addValuesToSlotType(SharedSlotType.TARGET, i18next.t('DATE_RANGE_CONTROL_DEFAULT_SLOT_VALUES_TARGET_START_DATE', { returnObjects: true }));
        }
        if (this.props.interactionModel.targets.endDate.includes($.Target.EndDate)) {
            generator.addValuesToSlotType(SharedSlotType.TARGET, i18next.t('DATE_RANGE_CONTROL_DEFAULT_SLOT_VALUES_TARGET_END_DATE', { returnObjects: true }));
        }
    }

    // tsDoc - see InteractionModelContributor
    getTargetIds(): string[] {

        return this.props.interactionModel.targets.self;
    }

    private getStartDateFromChild(): string | undefined {

        return this.startDateControl.state.value;
    }

    private getEndDateFromChild(): string | undefined {

        return this.endDateControl.state.value;
    }

    private setStartDate(date: string | undefined): void {

        this.startDateControl.state.value = date;
        this.state.startDate = date;

        // Clean open question once a value set
        this.state.isChangingRange = false;
    }

    private setEndDate(date: string | undefined): void {

        this.endDateControl.state.value = date;
        this.state.endDate = date;

        // Clean open question once a value set
        this.state.isChangingRange = false;
    }

    private async canHandleForFocus(input: ControlInput): Promise<boolean> {
        try {
            okIf(this.state.onFocus === true);

            // When the focus is on parent itself
            // give the parent priority to handle the request
            return this.isTwoValueInput(input)
            || this.isDateInterpretedAsDateRange(input)
            || this.isChangeBoth(input)
            || this.isChangeRange(input)
            || this.isConfirmationAffirmed(input)
            || this.isConfirmationDisAffirmed(input)
            || this.canHandleByChild(input);
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }

    }

    private async canHandleForNoFocus(input: ControlInput): Promise<boolean> {
        try {
            okIf(this.state.onFocus === false);

            // When the focus is on children
            // give children priority to handle the request
            return await this.canHandleByChild(input)
            || this.isTwoValueInput(input)
            || this.isDateInterpretedAsDateRange(input)
            || this.isChangeBoth(input)
            || this.isChangeRange(input)
            || this.isConfirmationAffirmed(input)
            || this.isConfirmationDisAffirmed(input);
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }

    }

    /**
     * Test if the input has both start date and end date provided
     */
    private isTwoValueInput(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isIntent(input, DateRangeControlIntent.name));
            const intent = (input.request as IntentRequest).intent;
            const unpackedSlots = unpackDateRangeControlIntent(intent);
            if (unpackedSlots.target !== undefined) {
                okIf(InputUtil.targetIsMatchOrUndefined(unpackedSlots.target, this.props.interactionModel.targets.self));
            } else {
                okIf(InputUtil.targetIsMatchOrUndefined(unpackedSlots["target.a"], this.props.interactionModel.targets.startDate) || InputUtil.targetIsMatchOrUndefined(unpackedSlots["target.a"], this.props.interactionModel.targets.endDate));
                okIf(InputUtil.targetIsMatchOrUndefined(unpackedSlots["target.b"], this.props.interactionModel.targets.startDate) || InputUtil.targetIsMatchOrUndefined(unpackedSlots["target.b"], this.props.interactionModel.targets.endDate));
            }
            const inputGroups: DateRangeControlIntentInput[] = generateDatesInputGroups(this.props, unpackedSlots);
            for (const inputGroup of inputGroups) {
                okIf(InputUtil.valueStrDefined(inputGroup.value));
                okIf(InputUtil.actionIsSetOrUndefined(inputGroup.action, this.props.interactionModel.actions.set) || InputUtil.actionIsMatch(inputGroup.action, this.props.interactionModel.actions.change));
                okIf(inputGroup.target === TargetCategory.StartDate || inputGroup.target === TargetCategory.EndDate);
            }
            this.handleFunc = this.handleTwoValueInput;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleTwoValueInput(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const intent = (input.request as IntentRequest).intent;
        const unpackedSlots = unpackDateRangeControlIntent(intent);
        const inputGroups: DateRangeControlIntentInput[] = generateDatesInputGroups(this.props, unpackedSlots);
        for (const inputGroup of inputGroups) {
            if (inputGroup.target === TargetCategory.StartDate) {
                this.setStartDate(findEdgeDateOfDateRange(inputGroup.value, true));
            } else if (inputGroup.target === TargetCategory.EndDate) {
                this.setEndDate(findEdgeDateOfDateRange(inputGroup.value, false));
            }
        }
        // reset the confirmation flag to false
        this.state.isValueConfirmed = false;
        this.state.onFocus = true;
        if (this.wantsToConfirmRange(input)) {
            this.confirmValue(input, resultBuilder);
            return;
        }
        this.ackDateRangeValueChanged(resultBuilder);
        if (this.wantsToCorrectRange(input)) {
            this.correctRange(input, resultBuilder);
        }
    }

    /**
     * Determine whether the input single date value should be considered as date range
     *
     * The DateRangeControl will regard a single value input as date range when there's no clear target and
     * when the DateRangeControl itself is under focus
     * E.G. 'set range to 2018', where 2018 will be regarded as a range and both start date and end date will be set to 2018
     */
    private isDateInterpretedAsDateRange(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isSingleValueControlIntent(input, AmazonBuiltInSlotType.DATE));
            const intent = (input.request as IntentRequest).intent;
            const unpackedSlots = unpackSingleValueControlIntent(intent);
            okIf(InputUtil.targetIsMatchOrUndefined(unpackedSlots.target, this.props.interactionModel.targets.self));
            okIf(InputUtil.actionIsMatchOrUndefined(unpackedSlots.action, this.props.interactionModel.actions.set) || InputUtil.actionIsMatchOrUndefined(unpackedSlots.action, this.props.interactionModel.actions.change));

            this.handleFunc = this.handleDateRangeInput;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleDateRangeInput(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const intent = (input.request as IntentRequest).intent;
        const { valueStr } = unpackSingleValueControlIntent(intent);
        this.setStartDate(findEdgeDateOfDateRange(valueStr, true));
        this.setEndDate(findEdgeDateOfDateRange(valueStr, false));
        this.state.isValueConfirmed = false;
        this.state.onFocus = true;
        if (this.wantsToConfirmRange(input)) {
            this.confirmValue(input, resultBuilder);
            return;
        }
        this.ackDateRangeValueChanged(resultBuilder);
        if (this.wantsToCorrectRange(input)) {
            this.correctRange(input, resultBuilder);
        }
    }

    /**
     * Determine whether the input action is targeting both start date and end date
     *
     * E.G. 'Change start date and end date'
     */
    private isChangeBoth(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isIntent(input, ConjunctionControlIntent.name));
            const intent = (input.request as IntentRequest).intent;
            const unpackedSlots = unpackConjunctionControlIntent(intent);
            okIf(InputUtil.feedbackIsMatchOrUndefined(unpackedSlots.feedback, [$.Feedback.Affirm, $.Feedback.Disaffirm]));
            const inputs: ActionAndTask[] = generateActionTaskPairs(unpackedSlots);
            for (const input of inputs) {
                okIf(InputUtil.targetIsMatchOrUndefined(input.target, this.props.interactionModel.targets.startDate) || InputUtil.targetIsMatchOrUndefined(input.target, this.props.interactionModel.targets.endDate));
                okIf(InputUtil.actionIsSetOrUndefined(input.action, this.props.interactionModel.actions.set) || InputUtil.actionIsMatch(input.action, this.props.interactionModel.actions.change));
            }
            this.handleFunc = this.handleChangeValue;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }

    /**
     * Determine whether the input action is targeting date range
     *
     * E.G. 'Change', 'Change date'
     */
    private isChangeRange(input: ControlInput): boolean {
        try {
            okIf(InputUtil.isIntent(input, GeneralControlIntent.name));
            const intent = (input.request as IntentRequest).intent;
            const unpackedSlots = unpackGeneralControlIntent(intent);
            okIf(InputUtil.feedbackIsMatchOrUndefined(unpackedSlots.feedback, [$.Feedback.Affirm, $.Feedback.Disaffirm]));
            okIf(InputUtil.targetIsMatchOrUndefined(unpackedSlots.target, this.props.interactionModel.targets.self));
            this.handleFunc = this.handleChangeValue;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }

    private isConfirmationAffirmed(input: ControlInput): any {
        try {
            okIf(InputUtil.isBareYes(input));
            okIf(this.state.isConfirmingRange);
            this.handleFunc = this.handleConfirmationAffirmed;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleConfirmationAffirmed(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.isValueConfirmed = true;
        this.state.isConfirmingRange = false;
        // If the date range is confirmed in parent
        // update children's status to avoid duplicate confirmation
        this.startDateControl.state.isValueConfirmed = true;
        this.endDateControl.state.isValueConfirmed = true;
        const actPayload = i18next.t('DATE_RANGE_CONTROL_DEFAULT_STATE_VALUE_FOR_START_AND_END', { start: this.state.startDate, end: this.state.endDate });
        if (this.wantsToCorrectRange(input)) {
            this.correctRange(input, resultBuilder);
            return;
        }
        resultBuilder.addAct(
            new ValueConfirmedAct(this, { value: actPayload })
        );
        this.ackDateRangeValueChanged(resultBuilder);
    }

    private isConfirmationDisAffirmed(input: ControlInput): any {
        try {
            okIf(InputUtil.isBareNo(input));
            okIf(this.state.isConfirmingRange === true);
            this.handleFunc = this.handleConfirmationDisAffirmed;
            return true;
        }
        catch (e) {
            return falseIfGuardFailed(e);
        }
    }

    private handleConfirmationDisAffirmed(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.isValueConfirmed = false;
        this.state.isConfirmingRange = false;
        const actPayload = i18next.t('DATE_RANGE_CONTROL_DEFAULT_STATE_VALUE_FOR_START_AND_END', { start: this.state.startDate, end: this.state.endDate });
        resultBuilder.addAct(new ValueDisconfirmedAct(this, {value: actPayload}));
        resultBuilder.addAct(new RequestValueAct(this));
    }

    private handleChangeValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {

        this.state.isChangingRange = true;
        this.state.onFocus = true;
        resultBuilder.addAct(new RequestValueAct(this));
    }

    // Update priorEndDate & priorStartDate
    private updatePrior(): void {
        // Only update prior if it's not in confirming range status
        if (!this.state.isConfirmingRange) {
            this.state.previousEndDate = this.state.endDate;
            this.state.previousStartDate = this.state.startDate;
        }
    }

    private ackDateRangeValueChanged(resultBuilder: ControlResultBuilder): void {
        // The DateRangeControl only ack date range changes
        // Only start date change or end date change will be handled by Child controls
        if (this.state.startDate !== undefined && this.state.endDate !== undefined && (this.state.startDate !== this.state.previousStartDate && this.state.endDate !== this.state.previousEndDate)) {
            // If it's the first time to set the value, DateRangeControl will send DateRangeSetAct
            // And when there's an old value exist, DateRangeControl will send DateRangeChangedAct
            this.state.previousStartDate !== undefined && this.state.previousEndDate !== undefined ?
                resultBuilder.addAct(new DateRangeChangedAct(this, this.state.startDate, this.state.endDate, this.state.previousStartDate, this.state.previousEndDate)) :
                resultBuilder.addAct(new DateRangeSetAct(this, this.state.startDate, this.state.endDate));
        }
    }

    private validateDateRange(input: ControlInput): true | ValidationResult {
        const listOfValidationFunc: DateRangeValidationFunction[] = typeof(this.props.validation.rangeValid) === 'function' ? [this.props.validation.rangeValid] : this.props.validation.rangeValid;
        for (const validationFunction of listOfValidationFunc) {
            const validationResult: true | ValidationResult = validationFunction(this.state, input);
            if (validationResult !== true) {
                log.debug(`DateRangeControl.validate(): validation failed. Reason: ${JSON.stringify(validationResult, null, 2)}.`);
                return validationResult;
            }
        }
        return true;
    }


    // tsDoc - see Control
    renderAct(act: SystemAct, input: ControlInput, builder: ControlResponseBuilder): void {

        if (act instanceof RequestValueAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.requestValue, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.requestValue, input));
        }

        else if (act instanceof DateRangeSetAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueSet, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueSet, input));
        }

        else if (act instanceof DateRangeChangedAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueChanged, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueChanged, input));
        }

        else if (act instanceof InvalidValueAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.invalidValue, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.invalidValue, input));
        }

        else if (act instanceof ConfirmValueAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.confirmValue, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.confirmValue, input));
        }

        else if (act instanceof ValueConfirmedAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueAffirmed, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueAffirmed, input));
        }

        else if (act instanceof ValueDisconfirmedAct) {
            builder.addPromptFragment(this.evaluatePromptProp(act, this.props.prompts.valueDisaffirmed, input));
            builder.addRepromptFragment(this.evaluatePromptProp(act, this.props.reprompts.valueDisaffirmed, input));
        }

        else {
            this.throwUnhandledActError(act);
        }
    }

    // tsDoc - see Control
    async canTakeInitiative(input: ControlInput): Promise<boolean> {

        return this.needsValue(input)
            || await this.canTakeInitiativeByChild(input)
            || this.isChangingRange()
            || this.wantsToCorrectRange(input)
            || this.wantsToConfirmRange(input);
    }

    // tsDoc - see Control
    async takeInitiative(input: ControlInput, resultBuilder: ControlResultBuilder): Promise<void> {
        log.debug(`DateRangeControl[${this.id}]: takeInitiative(). Entering`);
        if (this.takeInitiativeFunc !== undefined) {
            this.takeInitiativeFunc(input, resultBuilder);
        }
    }

    private needsValue(input: ControlInput): boolean {
        try {
            okIf(this.evaluateBooleanProp(this.props.required, input));
            okIf(this.state.startDate === undefined && this.state.endDate === undefined);
            this.takeInitiativeFunc = this.requestDateRange;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }

    private requestDateRange(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.onFocus = true;
        resultBuilder.addAct(new RequestValueAct(this));
    }

    private isChangingRange(): boolean {
        try {
            okIf(this.state.isChangingRange === true);
            this.takeInitiativeFunc = this.requestDateRange;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }

    private wantsToCorrectRange(input: ControlInput): boolean {
        try {
            // Only fix range when range is set and there's no open question
            okIf(!this.needsValue(input) && !this.state.isChangingRange);
            const rangeValidationResult: true | ValidationResult = this.validateDateRange(input);
            okIf(rangeValidationResult !== true);
            this.takeInitiativeFunc = this.correctRange;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }

    private correctRange(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        const rangeValidationResult: true | ValidationResult = this.validateDateRange(input);
        this.state.onFocus = true;
        if (rangeValidationResult !== true) {
            const actPayload = i18next.t('DATE_RANGE_CONTROL_DEFAULT_STATE_VALUE_FOR_START_AND_END', { start: this.state.startDate, end: this.state.endDate });
            resultBuilder.addAct(new InvalidValueAct<string>(this, {value: actPayload, reasonCode: rangeValidationResult.reasonCode, renderedReason: rangeValidationResult.renderedReason }));
            // if the range-validation failure is due to one date changing, only request that one
            if (this.state.startDate !== this.state.previousStartDate && this.state.endDate !== this.state.previousEndDate) {
                resultBuilder.addAct(new RequestValueAct(this));
            } else if (this.state.startDate !== this.state.previousStartDate) {
                resultBuilder.addAct(new RequestValueAct(this.startDateControl));
            } else {
                resultBuilder.addAct(new RequestValueAct(this.endDateControl));
            }
            return;
        }
    }

    private wantsToConfirmRange(input: ControlInput): boolean {
        try {
            okIf(this.props.confirmationRequired === true);
            okIf(this.state.isValueConfirmed === false);
            this.takeInitiativeFunc = this.confirmValue;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }

    private confirmValue(input: ControlInput, resultBuilder: ControlResultBuilder): void {
        this.state.isConfirmingRange = true;
        const actPayload = i18next.t('DATE_RANGE_CONTROL_DEFAULT_STATE_VALUE_FOR_START_AND_END', { start: this.state.startDate, end: this.state.endDate });
        resultBuilder.addAct(new ConfirmValueAct(this, { value: actPayload }));
    }

    // tsDoc - see ContainerControl
    async canTakeInitiativeByChild(input: ControlInput): Promise<boolean> {
        try {
            okIf(await super.canTakeInitiativeByChild(input));
            this.state.onFocus = false;
            this.takeInitiativeFunc = this.takeInitiativeByChild;
            return true;
        }
        catch (e) { return falseIfGuardFailed(e); }
    }
}
