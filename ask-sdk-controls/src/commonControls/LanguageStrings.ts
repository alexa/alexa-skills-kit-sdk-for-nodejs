import { Resource } from 'i18next';

import { Logger } from "../logging/Logger";
import { SharedSlotType } from '../interactionModelGeneration/ModelTypes';
import { Strings as $ } from '../constants/Strings';

const log = new Logger('AskSdkControls:i18n');

/**
 * Localized data for built-ins.
 *
 * Contains prompts, reprompts, APL strings, and interaction model data.
 */
export const systemResource: Resource = {
    en: {
        translation: {
            // DateControl Runtime
            DATE_CONTROL_DEFAULT_PROMPT_VALUE_SET: 'OK.',
            DATE_CONTROL_DEFAULT_PROMPT_VALUE_CHANGED: 'Changed from {{old}} to {{new}}.',
            DATE_CONTROL_DEFAULT_PROMPT_INVALID_VALUE_WITH_REASON: 'Sorry but that\'s not a valid date because {{reason}}.',
            DATE_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_VALUE: 'Sorry, invalid Date.',
            DATE_CONTROL_DEFAULT_PROMPT_REQUEST_VALUE: 'What date?',
            DATE_CONTROL_DEFAULT_PROMPT_REQUEST_CHANGED_VALUE: 'What should I change it to?',
            DATE_CONTROL_DEFAULT_PROMPT_VALIDATION_FAIL_PAST_DATE_ONLY: 'the date cannot be greater than today',
            DATE_CONTROL_DEFAULT_PROMPT_VALIDATION_FAIL_FUTURE_DATE_ONLY: 'the date cannot be less than today',
            DATE_CONTROL_DEFAULT_PROMPT_CONFIRM_VALUE: 'Was that {{value}}?',
            DATE_CONTROL_DEFAULT_PROMPT_VALUE_AFFIRMED: 'Great.',
            DATE_CONTROL_DEFAULT_PROMPT_VALUE_DISAFFIRMED: 'My mistake.',

            DATE_CONTROL_DEFAULT_REPROMPT_VALUE_SET: 'OK.',
            DATE_CONTROL_DEFAULT_REPROMPT_VALUE_CHANGED: 'Changed from {{old}} to {{new}}.',
            DATE_CONTROL_DEFAULT_REPROMPT_INVALID_VALUE_WITH_REASON: 'Sorry but that\'s not a valid date because {{reason}}.',
            DATE_CONTROL_DEFAULT_REPROMPT_GENERAL_INVALID_VALUE: 'Sorry, invalid Date.',
            DATE_CONTROL_DEFAULT_REPROMPT_REQUEST_VALUE: 'What date?',
            DATE_CONTROL_DEFAULT_REPROMPT_REQUEST_CHANGED_VALUE: 'What should I change it to?',
            DATE_CONTROL_DEFAULT_REPROMPT_VALIDATION_FAIL_PAST_DATE_ONLY: 'the date cannot be greater than today',
            DATE_CONTROL_DEFAULT_REPROMPT_VALIDATION_FAIL_FUTURE_DATE_ONLY: 'the date cannot be less than today',
            DATE_CONTROL_DEFAULT_REPROMPT_CONFIRM_VALUE: 'Was that {{value}}?',
            DATE_CONTROL_DEFAULT_REPROMPT_VALUE_AFFIRMED: 'Great.',
            DATE_CONTROL_DEFAULT_REPROMPT_VALUE_DISAFFIRMED: 'My mistake.',
            // DateControl BuildTime
            DATE_CONTROL_DEFAULT_SLOT_VALUES_TARGET_DATE: {
                id: $.Target.Date,
                name: {
                    value: 'date',
                    synonyms: [
                        'date',
                        'the date',
                        'day',
                        'the day',
                    ]
                }
            },

            // NumberControl Runtime
            NUMBER_CONTROL_DEFAULT_PROMPT_VALUE_SET: 'Ok. Value set to {{value}}.',
            NUMBER_CONTROL_DEFAULT_PROMPT_INVALID_VALUE_WITH_REASON: 'Sorry but that\'s not a valid choice because {{reason}}.',
            NUMBER_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_VALUE: 'Sorry but that\'s not a valid choice.',
            NUMBER_CONTROL_DEFAULT_PROMPT_REQUEST_VALUE: 'What number?',
            NUMBER_CONTROL_DEFAULT_PROMPT_REQUEST_CHANGED_VALUE: 'What should I change it to?',
            NUMBER_CONTROL_DEFAULT_PROMPT_REPEAT_UNUSABLE_VALUE: 'I\'m really sorry but I heard {{value}} again.',
            NUMBER_CONTROL_DEFAULT_PROMPT_VALUE_AFFIRMED: 'Great.',
            NUMBER_CONTROL_DEFAULT_PROMPT_VALUE_DISAFFIRMED: 'My mistake.',
            NUMBER_CONTROL_DEFAULT_PROMPT_CONFIRM_VALUE: 'Was that {{value}}?',
            NUMBER_CONTROL_DEFAULT_PROMPT_SUGGEST_VALUE: 'Did you perhaps mean {{value}}?',
            NUMBER_CONTROL_DEFAULT_PROMPT_INFORM_CONFUSING_DISCONFIRMATION: 'Sorry you disagreed but with the same number.',
            NUMBER_CONTROL_DEFAULT_PROMPT_INFORM_CONFUSING_CONFIRMATION: 'Sorry the previous value is {{previousValue}}, but you confirmed to a different number.',
            NUMBER_CONTROL_DEFAULT_REPROMPT_VALUE_SET: 'Ok. Value set to {{value}}.',
            NUMBER_CONTROL_DEFAULT_REPROMPT_INVALID_VALUE_WITH_REASON: 'Sorry but that\'s not a valid choice because {{reason}}.',
            NUMBER_CONTROL_DEFAULT_REPROMPT_GENERAL_INVALID_VALUE: 'Sorry but that\'s not a valid choice.',
            NUMBER_CONTROL_DEFAULT_REPROMPT_REQUEST_VALUE: 'What number?',
            NUMBER_CONTROL_DEFAULT_REPROMPT_REQUEST_CHANGED_VALUE: 'What should I change it to?',
            NUMBER_CONTROL_DEFAULT_REPROMPT_REPEAT_UNUSABLE_VALUE: 'I\'m really sorry but I heard {{value}} again.',
            NUMBER_CONTROL_DEFAULT_REPROMPT_VALUE_AFFIRMED: 'Great.',
            NUMBER_CONTROL_DEFAULT_REPROMPT_VALUE_DISAFFIRMED: 'My mistake.',
            NUMBER_CONTROL_DEFAULT_REPROMPT_CONFIRM_VALUE: 'Was that {{value}}?',
            NUMBER_CONTROL_DEFAULT_REPROMPT_SUGGEST_VALUE: 'Did you perhaps mean {{value}}?',
            NUMBER_CONTROL_DEFAULT_REPROMPT_INFORM_CONFUSING_DISCONFIRMATION: 'Sorry you disagreed but with the same number.',
            NUMBER_CONTROL_DEFAULT_REPROMPT_INFORM_CONFUSING_CONFIRMATION: 'Sorry the previous value is {{previousValue}}, but you confirmed to a different number.',

            // NumberControl BuildTime
            NUMBER_CONTROL_DEFAULT_SLOT_VALUES_TARGET_NUMBER: {
                id: $.Target.Number,
                name: {
                    value: 'number',
                    synonyms: [
                        'the number',
                    ]
                }
            },

            // ValueControl Runtime
            VALUE_CONTROL_DEFAULT_PROMPT_VALUE_SET: 'OK, {{value}}.',
            VALUE_CONTROL_DEFAULT_PROMPT_VALUE_CHANGED: 'OK, I changed it to {{value}}.',
            VALUE_CONTROL_DEFAULT_PROMPT_INVALID_VALUE_WITH_REASON: 'Sorry, {{value}} is not a valid choice because {{reason}}.',
            VALUE_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_VALUE: 'Sorry, {{value}} is not a valid choice.',
            VALUE_CONTROL_DEFAULT_PROMPT_REQUEST_VALUE: 'What should i set it to?',
            VALUE_CONTROL_DEFAULT_PROMPT_REQUEST_CHANGED_VALUE: 'What should I change it to?',
            VALUE_CONTROL_DEFAULT_PROMPT_CONFIRM_VALUE: 'Was that {{value}}?',
            VALUE_CONTROL_DEFAULT_PROMPT_VALUE_AFFIRMED: 'Great.',
            VALUE_CONTROL_DEFAULT_PROMPT_VALUE_DISAFFIRMED: 'My mistake.',
            VALUE_CONTROL_DEFAULT_REPROMPT_VALUE_SET: 'OK, {{value}}.',
            VALUE_CONTROL_DEFAULT_REPROMPT_VALUE_CHANGED: 'OK, I changed it to {{value}}.',
            VALUE_CONTROL_DEFAULT_REPROMPT_INVALID_VALUE_WITH_REASON: 'Sorry, {{value}} is not a valid choice because {{reason}}.',
            VALUE_CONTROL_DEFAULT_REPROMPT_GENERAL_INVALID_VALUE: 'Sorry, {{value}} is not a valid choice.',
            VALUE_CONTROL_DEFAULT_REPROMPT_REQUEST_VALUE: 'What should i set it to?',
            VALUE_CONTROL_DEFAULT_REPROMPT_REQUEST_CHANGED_VALUE: 'What should I change it to?',
            VALUE_CONTROL_DEFAULT_REPROMPT_CONFIRM_VALUE: 'Was that {{value}}?',
            VALUE_CONTROL_DEFAULT_REPROMPT_VALUE_AFFIRMED: 'Great.',
            VALUE_CONTROL_DEFAULT_REPROMPT_VALUE_DISAFFIRMED: 'My mistake.',

            // ListControl Runtime
            LIST_CONTROL_DEFAULT_PROMPT_VALUE_SET: 'OK, {{value}}.',
            LIST_CONTROL_DEFAULT_PROMPT_VALUE_CHANGED: 'OK, I changed it to {{value}}.',
            LIST_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_VALUE: 'Sorry, {{value}} is not a valid choice.',
            LIST_CONTROL_DEFAULT_PROMPT_INVALID_VALUE_WITH_REASON: 'Sorry, {{value}} is not a valid choice because {{reason}}.',
            LIST_CONTROL_DEFAULT_PROMPT_UNUSABLE_INPUT_VALUE: 'Sorry, I\'m not sure how to do that.',
            LIST_CONTROL_DEFAULT_PROMPT_REQUEST_VALUE: 'What is your selection? Some suggestions are {{suggestions}}.',
            LIST_CONTROL_DEFAULT_PROMPT_REQUEST_CHANGED_VALUE: 'What should I change it to? Some suggestions are {{suggestions}}.',
            LIST_CONTROL_DEFAULT_PROMPT_CONFIRM_VALUE: 'Was that {{value}}?',
            LIST_CONTROL_DEFAULT_PROMPT_VALUE_AFFIRMED: 'Great.',
            LIST_CONTROL_DEFAULT_PROMPT_VALUE_DISAFFIRMED: 'My mistake.',
            LIST_CONTROL_DEFAULT_REPROMPT_VALUE_SET: 'OK, {{value}}.',
            LIST_CONTROL_DEFAULT_REPROMPT_VALUE_CHANGED: 'OK, I changed it to {{value}}.',
            LIST_CONTROL_DEFAULT_REPROMPT_GENERAL_INVALID_VALUE: 'Sorry, {{value}} is not a valid choice.',
            LIST_CONTROL_DEFAULT_REPROMPT_INVALID_VALUE_WITH_REASON: 'Sorry, {{value}} is not a valid choice because {{reason}}.',
            LIST_CONTROL_DEFAULT_REPROMPT_UNUSABLE_INPUT_VALUE: 'Sorry, I\'m not sure how to do that.',
            LIST_CONTROL_DEFAULT_REPROMPT_REQUEST_VALUE: 'What is your selection? Some suggestions are {{suggestions}}.',
            LIST_CONTROL_DEFAULT_REPROMPT_REQUEST_CHANGED_VALUE: 'What should I change it to? Some suggestions are {{suggestions}}.',
            LIST_CONTROL_DEFAULT_REPROMPT_CONFIRM_VALUE: 'Was that {{value}}?',
            LIST_CONTROL_DEFAULT_REPROMPT_VALUE_AFFIRMED: 'Great.',
            LIST_CONTROL_DEFAULT_REPROMPT_VALUE_DISAFFIRMED: 'My mistake.',
            LIST_CONTROL_DEFAULT_APL_HEADER_TITLE: 'Please select...',
            // ListControl BuildTime
            LIST_CONTROL_DEFAULT_SLOT_VALUES_TARGET_CHOICE: {
                id: $.Target.Choice,
                name: {
                    value: 'choice',
                    synonyms: [
                        'my choice',
                        "selection",
                        "my selection"
                    ]
                }
            },
            LIST_CONTROL_DEFAULT_SLOT_VALUES_ACTION_SELECT: {
                id: $.Action.Select,
                name: {
                    value: 'select',
                    synonyms: [
                        "select",
                        "choose",
                        "take",
                        "pick"
                    ]
                }
            },

            // DateRangeControl Runtime
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_START_DATE_SET: 'Got it. The start date is {{value}}.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_START_DATE_CHANGED: 'Got it. The start date is changed to {{value}}.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_REQUEST_START_DATE: 'What is the start date you want?',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_REQUEST_CHANGED_START_DATE: 'What should I change the start date to?',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_CONFIRM_START_DATE: 'Was that {{value}}?',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_START_DATE_AFFIRMED: 'Great.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_START_DATE_DISAFFIRMED: 'My mistake.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_END_DATE_SET: 'Got it. The end date is {{value}}.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_END_DATE_CHANGED: 'Got it. The end date is changed to {{value}}.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_REQUEST_END_DATE: 'What is the end date you want?',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_REQUEST_CHANGED_END_DATE: 'What should I change the end date to?',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_CONFIRM_END_DATE: 'Was that {{value}}?',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_END_DATE_AFFIRMED: 'Great.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_END_DATE_DISAFFIRMED: 'My mistake.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_REQUEST_VALUE: 'What is the start date and end date you want?',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_VALUE_SET: 'Got it. The start date is {{start}} and the end date is {{end}}.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_VALUE_CHANGED: 'Got it. The start date is changed to {{start}} and the end date is changed to {{end}}.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_INVALID_START_WITH_REASON: 'Sorry but that\'s not a valid start date because {{reason}}.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_INVALID_END_WITH_REASON: 'Sorry but that\'s not a valid end date because {{reason}}.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_INVALID_VALUE_WITH_REASON: 'Sorry, invalid range because {{reason}}.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_DATE: 'Sorry, invalid date.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_GENERAL_INVALID_VALUE: 'Sorry, invalid range.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_VALIDATION_FAIL_START_AFTER_END: 'start date can not be greater than end date',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_VALUE_AFFIRMED: 'Great.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_VALUE_DISAFFIRMED: 'My mistake.',
            DATE_RANGE_CONTROL_DEFAULT_PROMPT_CONFIRM_VALUE: 'Was that {{value}}?',

            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_START_DATE_SET: 'Got it. The start date is {{value}}.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_START_DATE_CHANGED: 'Got it. The start date is changed to {{value}}.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_REQUEST_START_DATE: 'What is the start date you want?',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_REQUEST_CHANGED_START_DATE: 'What should I change the start date to?',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_CONFIRM_START_DATE: 'Was that {{value}}?',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_START_DATE_AFFIRMED: 'Great.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_START_DATE_DISAFFIRMED: 'My mistake.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_END_DATE_SET: 'Got it. The end date is {{value}}.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_END_DATE_CHANGED: 'Got it. The end date is changed to {{value}}.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_REQUEST_END_DATE: 'What is the end date you want?',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_REQUEST_CHANGED_END_DATE: 'What should I change the end date to?',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_CONFIRM_END_DATE: 'Was that {{value}}?',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_END_DATE_AFFIRMED: 'Great.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_END_DATE_DISAFFIRMED: 'My mistake.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_REQUEST_VALUE: 'What is the start date and end date you want?',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_VALUE_SET: 'Got it. The start date is {{start}} and the end date is {{end}}.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_VALUE_CHANGED: 'Got it. The start date is changed to {{start}} and the end date is changed to {{end}}.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_INVALID_START_WITH_REASON: 'Sorry but that\'s not a valid start date because {{reason}}.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_INVALID_END_WITH_REASON: 'Sorry but that\'s not a valid end date because {{reason}}.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_INVALID_VALUE_WITH_REASON: 'Sorry, invalid range because {{reason}}.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_GENERAL_INVALID_DATE: 'Sorry, invalid date.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_GENERAL_INVALID_VALUE: 'Sorry, invalid range.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_VALIDATION_FAIL_START_AFTER_END: 'start date can not be greater than end date',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_VALUE_AFFIRMED: 'Great.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_VALUE_DISAFFIRMED: 'My mistake.',
            DATE_RANGE_CONTROL_DEFAULT_REPROMPT_CONFIRM_VALUE: 'Was that {{value}}?',

            DATE_RANGE_CONTROL_DEFAULT_STATE_VALUE_FOR_START_AND_END: '{{start}} to {{end}}',
            // DateRangeControl BuildTime
            DATE_RANGE_CONTROL_DEFAULT_SLOT_VALUES_TARGET_START_DATE: {
                id: $.Target.StartDate,
                name: {
                    value: 'startDate',
                    synonyms: [
                        'start date',
                        'the start date',
                        'starting date',
                        'the starting date',
                        'start',  // TODO: consider hoisting to a target called "start".
                        'the start',
                    ]
                }
            },
            DATE_RANGE_CONTROL_DEFAULT_SLOT_VALUES_TARGET_END_DATE: {
                id: $.Target.EndDate,
                name: {
                    value: 'endDate',
                    synonyms: [
                        'end date',
                        'the end date',
                        'ending date',
                        'the ending date',
                        'end', // TODO: consider hoisting to a target called "end".
                        'the end',
                    ]
                }
            },
            DATE_RANGE_CONTROL_DEFAULT_SLOT_VALUES_TARGET_DATE_RANGE: {
                id: $.Target.DateRange,
                name: {
                    value: 'dateRange',
                    synonyms: [
                        'date range',
                        'the date range',
                        'dates',
                        'the dates',
                    ]
                }
            },

            // ControlIntent Samples

            /*
            * ConjunctionControlIntent is for controls that accept multiple values
            * It will likely be replaced when support for multi-value slots is added.
            */
            CONJUNCTION_CONTROL_INTENT_SAMPLES: [
                "{action} {target.a} {conjunction} {target.b}",                                      // {change} {start} {and} {end}
                "{feedback} {action} {target.a} {conjunction} {target.b}",                           // {yes} {change} {start} {and} {end}

                "{head} {action} {target.a} {conjunction} {target.b}",                               // {just} {change} {start} {and} {end}
                "{action} {target.a} {conjunction} {target.b} {tail}",                               // {change} {start} {and} {end} {please}
                "{feedback} {action} {target.a} {conjunction} {target.b} {tail}",                    // {yes} {change} {start} {and} {end} {please}
                "{head} {action} {target.a} {conjunction} {target.b} {tail}",                        // {just} {change} {start} {and} {end} {please}
            ],

            /*
            * Example values for AMAZON.DATE (see https://developer.amazon.com/en-US/docs/alexa/custom-skills/slot-type-reference.html#date)
            *  "tomorrow"
            *  "monday" | "next monday"
            *  "last monday"
            *  "may first"
            *  "next week"
            *  "next month"
            *  "next weekend"
            *  "last weekend"
            *  "christmas day"
            */
            DATE_CONTROL_INTENT_SAMPLES: [
                "{AMAZON.DATE}",                                                      // {monday}

                "{action} {preposition} {AMAZON.DATE}",                               // {set} {to} {monday}
                "{action} {target} {preposition} {AMAZON.DATE}",                      // {set} {delivery} {to} {monday}
                "{target} {preposition} {AMAZON.DATE}",                               // {delivery} {should be} {monday}

                "{feedback} {AMAZON.DATE}",                                           // {yes} {monday}
                "{feedback} {preposition} {AMAZON.DATE}",                             // {yes} {to} {monday}
                "{feedback} {action} {preposition} {AMAZON.DATE}",                    // {yes} {set} {to} {monday}
                "{feedback} {action} {target} {preposition} {AMAZON.DATE}",           // {yes} {set} {delivery} {to} {monday}
                "{feedback} {target} {preposition} {AMAZON.DATE}",                    // {yes} {delivery} {should be} {monday}

                "{head} {AMAZON.DATE}",                                               // {I want} {monday}
                "{head} {action} {preposition} {AMAZON.DATE}",                        // {just} {set} {to} {monday}
                "{head} {action} {target} {preposition} {AMAZON.DATE}",               // {You can} {change} {delivery} {to be} {monday}
                "{head} {target} {preposition} {AMAZON.DATE}",                        // {I want} {delivery} {to be} {monday}

                "{AMAZON.DATE} {tail}",                                               // {monday} {please}
                "{preposition} {AMAZON.DATE} {tail}",                                 // {to} {monday} {please}
                "{action} {preposition} {AMAZON.DATE} {tail}",                        // {set} {to} {monday} {please}
                "{action} {target} {preposition} {AMAZON.DATE} {tail}",               // {set} {delivery} {to} {monday} {thanks}
                "{target} {preposition} {AMAZON.DATE} {tail}",                        // {delivery} {should be} {monday} {thanks}

                "{feedback} {AMAZON.DATE} {tail}",                                    // {yes} {monday} {will be great}
                "{feedback} {preposition} {AMAZON.DATE} {tail}",                      // {yes} {to} {monday} {please}
                "{feedback} {action} {preposition} {AMAZON.DATE} {tail}",             // {yes} {set} {to} {monday} {please}
                "{feedback} {action} {target} {preposition} {AMAZON.DATE} {tail}",    // {yes} {set} {delivery} {to} {monday} {thanks}
                "{feedback} {target} {preposition} {AMAZON.DATE} {tail}",             // {yes} {delivery} {is} {monday} {thanks}

                "{head} {AMAZON.DATE} {tail}",                                        // {Just} {monday} {please}
                "{head} {preposition} {AMAZON.DATE} {tail}",                          // {Just} {to} {monday} {thanks}
                "{head} {action} {preposition} {AMAZON.DATE} {tail}",                 // {I want to} {change} {to} {monday} {thanks}
                "{head} {target} {preposition} {AMAZON.DATE} {tail}",                 // {I need} {delivery} {to be} {monday} {thanks}
                "{head} {action} {target} {preposition} {AMAZON.DATE} {tail}",        // {You can} {change} {delivery} {to be} {monday} {thanks}
            ],

            // Note: every sample should have two dates.  For utterances with zero or one date use SimpleControlIntent or DateControlIntent.
            DATE_RANGE_CONTROL_INTENT_SAMPLES: [
                "{AMAZON.DATE.a} {conjunction} {AMAZON.DATE.b}",                                // {monday} {and} {friday}
                "{AMAZON.DATE.a} {preposition.b} {AMAZON.DATE.b}",                              // {monday} {to} {friday}
                "{preposition.a} {AMAZON.DATE.a} {preposition.b} {AMAZON.DATE.b}",              // {from} {monday} {to} {friday}
                "between {AMAZON.DATE.a} and {AMAZON.DATE.b}",                                  // between {monday} and {friday}
                "{action} {preposition.a} {AMAZON.DATE.a} {conjunction} {AMAZON.DATE.b}",       // {set} {to} {monday} {and} {friday}
                "{action} {preposition.a} {AMAZON.DATE.a} {preposition.b} {AMAZON.DATE.b}",     // {change} {to} {monday} {to} {friday}
                "{action} between {AMAZON.DATE.a} and {AMAZON.DATE.b}",                         // {set} between {monday} and {friday}
                "{action} {target} {preposition.a} {AMAZON.DATE.a} {preposition.b} {AMAZON.DATE.b}", // {change} {blackout} {to} {monday} {to} {friday}
                "{action} {target} between {AMAZON.DATE.a} and {AMAZON.DATE.b}",                     // {set} {blackout} between {monday} and {friday}
                "{action} {target.a} {preposition.a} {AMAZON.DATE.a} {conjunction} {target.b} {preposition.b} {AMAZON.DATE.b}", // {change} {start} {to} {monday} and {end} {to} {friday}

                "{feedback} {AMAZON.DATE.a} {conjunction} {AMAZON.DATE.b}",                      // {yes} {monday} {and} {friday}
                "{feedback} {AMAZON.DATE.a} {preposition.b} {AMAZON.DATE.b}",                    // {yes} {monday} {to} {friday}
                "{feedback} {preposition.a} {AMAZON.DATE.a} {preposition.b} {AMAZON.DATE.b}",    // {yes} {from} {monday} {to} {friday}
                "{feedback} between {AMAZON.DATE.a} and {AMAZON.DATE.b}",                        // {yes} between {monday} and {friday}

                "{head} {AMAZON.DATE.a} {conjunction} {AMAZON.DATE.b}",                          // {I think} {monday} {and} {friday}
                "{head} {AMAZON.DATE.a} {preposition.b} {AMAZON.DATE.b}",                        // {I think} {monday} {to} {friday}
                "{head} {preposition.a} {AMAZON.DATE.a} {preposition.b} {AMAZON.DATE.b}",        // {I think} {from} {monday} {to} {friday}
                "{head} between {AMAZON.DATE.a} and {AMAZON.DATE.b}",                            // {I think} between {monday} and {friday}

                "{AMAZON.DATE.a} {conjunction} {AMAZON.DATE.b} {tail}",                          // {monday} {and} {friday} {please}
                "{AMAZON.DATE.a} {preposition.b} {AMAZON.DATE.b} {tail}",                        // {monday} {to} {friday} {please}
                "{preposition.a} {AMAZON.DATE.a} {preposition.b} {AMAZON.DATE.b} {tail}",        // {from} {monday} {to} {friday} {please}
                "between {AMAZON.DATE.a} and {AMAZON.DATE.b} {tail}",                            // between {monday} and {friday} {please}

                "{head} {AMAZON.DATE.a} {conjunction} {AMAZON.DATE.b} {tail}",                   // {I think} {monday} {and} {friday} {thanks}
                "{head} {AMAZON.DATE.a} {preposition.b} {AMAZON.DATE.b} {tail}",                 // {I think} {monday} {to} {friday} {thanks}
                "{head} {preposition.a} {AMAZON.DATE.a} {preposition.b} {AMAZON.DATE.b} {tail}", // {I think} {from} {monday} {to} {friday} {thanks}
                "{head} between {AMAZON.DATE.a} and {AMAZON.DATE.b} {tail}",                     // {I think} between {monday} and {friday} {thanks}
            ],

            /*
             * For consideration:
             *   * trailing feedback, e.g.  "{action} {is correct}"  | "{it} {is correct}"
             *     Currently this type of trailing feedback is captured using {tail} and it is not used by control logic.
             *     A complication is that users might say "yes it is correct"
             *         - simple slot capture can't handle non-adjacent words
             *         - We don't really want to deal with two separate feedback slots and have to reconcile them.
             *         - So for now only the leading feedback is 'active' and we typically ignore the tail slot.
             */
            GENERAL_CONTROL_INTENT_SAMPLES: [
                // "{feedback}",                         // {Yes}  // For bare feedback utterances, use specific simple intents, eg AMAZON.YesIntent.
                "{feedback} {action}",                   // {No}, {delete}
                "{feedback} {action} {target}",          // {Yes}, {change} {the delivery date}
                "{feedback} {tail}",                     // {Yes}, {thanks}
                "{feedback} {action} {tail}",            // {Yes} {review} {would be great}
                "{feedback} {action} {target} {tail}",   // {Yes} {review} {the delivery date} {please}
                // "{action}",                           // For bare action utterances, use specific simple intents to be compatible with existing ecosystem.
                "{action} {target}",                     // {change} {start date}
                "{head} {action}",                       // {just} {delete}
                "{head} {action} {target}",              // {just} {delete} {it}
                "{action} {tail}",                       // {delete} {is correct}
                "{action} {target} {tail}",              // {update} {my address} {please}
                "{head} {action} {tail}",                // {go ahead and} {delete} {thanks}
                "{head} {action} {target} {tail}",       // {go ahead and} {delete} {the item} {thanks}
            ],

            NUMBER_CONTROL_INTENT_SAMPLES: [
                "{AMAZON.NUMBER}",                                                   // {three}

                "{action} {AMAZON.NUMBER}",                                          // {add} {three}
                "{action} {preposition} {AMAZON.NUMBER}",                            // {set} {to} {three}
                "{action} {target} {preposition} {AMAZON.NUMBER}",                   // {set} {quantity} {to} {three}
                "{target} {preposition} {AMAZON.NUMBER}",                            // {quantity} {is} {three}

                "{feedback} {AMAZON.NUMBER}",                                        // {yes} {three}
                "{feedback} {action} {AMAZON.NUMBER}",                               // {yes} {add} {three}
                "{feedback} {preposition} {AMAZON.NUMBER}",                          // {yes} {to} {three}
                "{feedback} {action} {preposition} {AMAZON.NUMBER}",                 // {yes} {set} {to} {three}
                "{feedback} {action} {target} {preposition} {AMAZON.NUMBER}",        // {yes} {set} {quantity} {to} {three}
                "{feedback} {target} {preposition} {AMAZON.NUMBER}",                 // {yes} {quantity} {should be} {three}

                "{head} {AMAZON.NUMBER}",                                            // {I want} {three}
                "{head} {action} {AMAZON.NUMBER}",                                   // {just} {add} {three}
                "{head} {action} {preposition} {AMAZON.NUMBER}",                     // {just} {set} {to} {three}
                "{head} {action} {target} {preposition} {AMAZON.NUMBER}",            // {You can} {change} {quantity} {to be} {three}
                "{head} {target} {preposition} {AMAZON.NUMBER}",                     // {I want} {quantity} {to be} {three}

                "{AMAZON.NUMBER} {tail}",                                            // {three} {please}
                "{preposition} {AMAZON.NUMBER} {tail}",                              // {to} {three} {please}
                "{action} {preposition} {AMAZON.NUMBER} {tail}",                     // {set} {to} {three} {please}
                "{action} {target} {preposition} {AMAZON.NUMBER} {tail}",            // {set} {quantity} {to} {three} {thanks}
                "{target} {preposition} {AMAZON.NUMBER} {tail}",                     // {quantity} {should be} {three} {thanks}

                "{feedback} {AMAZON.NUMBER} {tail}",                                 // {yes} {three} {will be great}
                "{feedback} {preposition} {AMAZON.NUMBER} {tail}",                   // {yes} {to} {three} {please}
                "{feedback} {action} {AMAZON.NUMBER} {tail}",                        // {yes} {add} {three} {please}
                "{feedback} {action} {preposition} {AMAZON.NUMBER} {tail}",          // {yes} {set} {to} {three} {please}
                "{feedback} {action} {target} {preposition} {AMAZON.NUMBER} {tail}", // {yes} {set} {quantity} {to} {three} {thanks}
                "{feedback} {target} {preposition} {AMAZON.NUMBER} {tail}",          // {yes} {quantity} {is} {three} {thanks}

                "{head} {AMAZON.NUMBER} {tail}",                                     // {Just} {three} {please}
                "{head} {preposition} {AMAZON.NUMBER} {tail}",                       // {Just} {to} {three} {thanks}
                "{head} {action} {AMAZON.NUMBER} {tail}",                            // {I want to} {add} {three} {thanks}
                "{head} {action} {preposition} {AMAZON.NUMBER} {tail}",              // {I want to} {change} {to} {three} {thanks}
                "{head} {target} {preposition} {AMAZON.NUMBER} {tail}",              // {I need} {quantity} {to be} {three} {thanks}
                "{head} {action} {target} {preposition} {AMAZON.NUMBER} {tail}",     // {You can} {change} {quantity} {to be} {three} {thanks}
            ],

            ORDINAL_CONTROL_INTENT_SAMPLES: [
                "{AMAZON.Ordinal}",                                                   // {first}
                "{preposition} {AMAZON.Ordinal}",                                     // {the} {first}
                "{AMAZON.Ordinal} one",                                               // {first} one
                "{preposition} {AMAZON.Ordinal} one",                                 // {the} {first} one

                "{action} {AMAZON.Ordinal}",                                          // {select} {first}
                "{action} {preposition} {AMAZON.Ordinal}",                            // {select} {the} {first}
                "{action} {preposition} {AMAZON.Ordinal} one",                        // {select} {the} {first} one
                "{action} {target} {preposition} {AMAZON.Ordinal}",                   // {Move} {Bob} {to} {second}
                "{target} {preposition} {AMAZON.Ordinal}",                            // {Bob} {is} {first}

                "{feedback} {AMAZON.Ordinal}",                                        // {yes} {first}
                "{feedback} {preposition} {AMAZON.Ordinal}",                          // {yes} {the} {first}
                "{feedback} {AMAZON.Ordinal} one",                                    // {yes} {first} one
                "{feedback} {preposition} {AMAZON.Ordinal} one",                      // {yes} {the} {first} one
                "{feedback} {action} {AMAZON.Ordinal}",                               // {yes} {select} {first}
                "{feedback} {action} {preposition} {AMAZON.Ordinal}",                 // {yes} {select} {the} {first}
                "{feedback} {action} {preposition} {AMAZON.Ordinal} one",             // {yes} {select} {the} {first} one
                "{feedback} {action} {target} {preposition} {AMAZON.Ordinal}",        // {yes} {Move} {Bob} {to} {second}
                "{feedback} {target} {preposition} {AMAZON.Ordinal}",                 // {yes} {Bob} {is} {first}

                "{head} {preposition} {AMAZON.Ordinal}",                              // {I want} {the} {first}
                "{head} {preposition} {AMAZON.Ordinal} one",                          // {I want} {the} {first} one
                "{head} {action} {preposition} {AMAZON.Ordinal}",                     // {just} {select} {the} {first}
                "{head} {action} {target} {preposition} {AMAZON.Ordinal}",            // {You can} {change} {Bob} {to be} {first}
                "{head} {target} {preposition} {AMAZON.Ordinal}",                     // {I need} {Bob} {to go} {first}

                "{AMAZON.Ordinal} {tail}",                                            // {first} {please}
                "{preposition} {AMAZON.Ordinal} {tail}",                              // {the} {first} {please}
                "{AMAZON.Ordinal} one {tail}",                                        // {first} one {please}
                "{preposition} {AMAZON.Ordinal} one {tail}",                          // {the} {first} one {please}
                "{action} {AMAZON.Ordinal} {tail}",                                   // {select} {first} {please}
                "{action} {target} {preposition} {AMAZON.Ordinal} {tail}",            // {Move} {Bob} {to} {second} {thanks}
                "{target} {preposition} {AMAZON.Ordinal} {tail}",                     // {Bob} {is} {first} {thanks}

                "{feedback} {AMAZON.Ordinal} {tail}",                                 // {yes} {first} {will be great}
                "{feedback} {preposition} {AMAZON.Ordinal} {tail}",                   // {yes} {the} {first} {please}
                "{feedback} {AMAZON.Ordinal} one {tail}",                             // {yes} {first} one {please}
                "{feedback} {preposition} {AMAZON.Ordinal} one {tail}",               // {yes} {the} {first} one {please}
                "{feedback} {action} {AMAZON.Ordinal} {tail}",                        // {yes} {select} {first} {please}
                "{feedback} {action} {preposition} {AMAZON.Ordinal} {tail}",          // {yes} {select} {the} {first} {please}
                "{feedback} {action} {preposition} {AMAZON.Ordinal} one {tail}",      // {yes} {select} {the} {first} one {please}
                "{feedback} {action} {target} {preposition} {AMAZON.Ordinal} {tail}", // {yes} {Move} {Bob} {to} {second} {thanks}
                "{feedback} {target} {preposition} {AMAZON.Ordinal} {tail}",          // {yes} {Bob} {is} {first} {thanks}

                "{head} {AMAZON.Ordinal} {tail}",                                     // {Just} {first} {please}
                "{head} {preposition} {AMAZON.Ordinal} {tail}",                       // {I want} {the} {first} {thanks}
                "{head} {preposition} {AMAZON.Ordinal} one {tail}",                   // {I want} {the} {first} {one} {thanks}
                "{head} {action} {preposition} {AMAZON.Ordinal} {tail}",              // {I want to} {change} {the} {first} {thanks}
                "{head} {action} {preposition} {AMAZON.Ordinal} one {tail}",          // {I want to} {change} {the} {first} one {thanks}
                "{head} {target} {preposition} {AMAZON.Ordinal} {tail}",              // {I need} {Bob} {to go} {first} {thanks}
                "{head} {action} {target} {preposition} {AMAZON.Ordinal} {tail}",     // {You can} {change} {Bob} {to be} {first} {thanks}
            ],

            SINGLE_VALUE_CONTROL_INTENT_SAMPLES: [

                "[[valueSlotType]]",                                                   // {Apples}, assuming 'apples' matches a value of the slotType.

                "{action} [[valueSlotType]]",                                          // {select} {apples}
                "{action} {preposition} [[valueSlotType]]",                            // {change} {to} {apples}
                "{action} {target} {preposition} [[valueSlotType]]",                   // {change} {my choice} {to} {apples}
                "{target} {preposition} [[valueSlotType]]",                            // {my favorite fruit} {is} {apples}

                "{feedback} [[valueSlotType]]",                                        // {yes} {apples}
                "{feedback} {action} [[valueSlotType]]",                               // {yes} {add} {apples}
                "{feedback} {preposition} [[valueSlotType]]",                          // {yes} {to} {apples}
                "{feedback} {action} {preposition} [[valueSlotType]]",                 // {yes} {change} {to} {apples}
                "{feedback} {action} {target} {preposition} [[valueSlotType]]",        // {yes} {set} {my choice} {to} {apples}
                "{feedback} {target} {preposition} [[valueSlotType]]",                 // {yes} {my choice} {is} {three}

                "{head} [[valueSlotType]]",                                            // {I want} {apples}
                "{head} {action} [[valueSlotType]]",                                   // {just} {add} {apples}
                "{head} {action} {preposition} [[valueSlotType]]",                     // {just} {set} {to} {apples}
                "{head} {action} {target} {preposition} [[valueSlotType]]",            // {You can} {change} {my choice} {to be} {apples}
                "{head} {target} {preposition} [[valueSlotType]]",                     // {I want} {it} {to be} {apples}

                "[[valueSlotType]] {tail}",                                            // {apples} {please}
                "{preposition} [[valueSlotType]] {tail}",                              // {to} {apples} {please}
                "{action} {preposition} [[valueSlotType]] {tail}",                     // {set} {to} {apples} {please}
                "{action} {target} {preposition} [[valueSlotType]] {tail}",            // {set} {it} {to} {apples} {thanks}
                "{target} {preposition} [[valueSlotType]] {tail}",                     // {it} {should be} {apples} {thanks}

                "{feedback} [[valueSlotType]] {tail}",                                 // {yes} {apples} {will be great}
                "{feedback} {preposition} [[valueSlotType]] {tail}",                   // {yes} {to} {apples} {please}
                "{feedback} {action} [[valueSlotType]] {tail}",                        // {yes} {add} {apples} {please}
                "{feedback} {action} {preposition} [[valueSlotType]] {tail}",          // {yes} {set} {to} {apples} {please}
                "{feedback} {action} {target} {preposition} [[valueSlotType]] {tail}", // {yes} {change} {my choice} {to} {apples} {thanks}
                "{feedback} {target} {preposition} [[valueSlotType]] {tail}",          // {yes} {my choice} {is} {apples} {thanks}

                "{head} [[valueSlotType]] {tail}",                                     // {Just} {apples} {please}
                "{head} {preposition} [[valueSlotType]] {tail}",                       // {Just} {to} {apples} {thanks}
                "{head} {action} [[valueSlotType]] {tail}",                            // {I want to} {add} {apples} {thanks}
                "{head} {action} {preposition} [[valueSlotType]] {tail}",              // {I want to} {change} {to} {apples} {thanks}
                "{head} {target} {preposition} [[valueSlotType]] {tail}",              // {I need} {it} {to be} {apples} {thanks}
                "{head} {action} {target} {preposition} [[valueSlotType]] {tail}",     // {You can} {change} {it} {to be} {apples} {thanks}
            ],


            // Shared Slot Type values
            SHARED_SLOT_TYPES_FEEDBACK: {
                name: SharedSlotType.FEEDBACK,
                values: [
                    {
                        id: $.Feedback.Affirm,
                        name: {
                            value: 'affirm',
                            synonyms: [
                                "yes I do",
                                "okay",
                                "kay",
                                "k",
                                "yes",
                                "yup",
                                "yep",
                                "yes",
                                "ya",
                                "yes I want",
                                "yes I need",
                                "yes I said",
                                "yes that's right",
                                "that's correct",
                                "ah yes",
                                "affirmative",
                                "makes sense",
                                "right",
                                "sounds good",
                                "sure",
                                "that's right",
                                "totally",
                                "works for me",
                                "yeah",
                                "yeah ok",
                                "yes ok",
                                "yes that's good",
                                "yes sure",
                                "yes good",
                                "yes exactly",
                                "exactly",
                                "yes I do",
                                "absolutely",
                                "yes absolutely",
                                "fine",
                                "yes fine",


                            ]
                        }
                    },
                    {
                        id: $.Feedback.Disaffirm,
                        name: {
                            value: 'disaffirm',
                            synonyms: [
                                "no",
                                "no no",
                                "no no no",
                                "no no no no",
                                "no I want",
                                "no I said",
                                "no not that",
                                "not even close",
                                "nope",
                                "incorrect",
                                "you misunderstood",
                                "you have it wrong",
                                "that's wrong",
                                "thats wrong",
                                "wrong",
                                "absolutely not",
                                "I don't think so",
                                "naw",
                                "naw",
                                "negative",
                                "never",
                                "no alexa",
                                "no amazon",
                                "no incorrect",
                                "no that's wrong",
                                "no it's not",
                                "definitely not",
                                "no definitely not",
                                "not ever",
                                "oh no",
                                "ohh no",
                                "o no no",
                                "please no",
                                "that's not what I want",
                                "that was totally wrong",
                                "that is totally wrong",
                                "that is wrong",
                            ]
                        }
                    },
                ]
            },

            SHARED_SLOT_TYPES_HEAD: {
                name: SharedSlotType.HEAD,
                values: [
                    {
                        id: $.Head,
                        name: {
                            value: 'head',
                            synonyms: [
                                "I",
                                "I'll",
                                "please",
                                "thanks",
                                "thank you",
                                "I will",
                                "I want",
                                "I choose",
                                "I want you to",
                                "I want you to just",
                                "I need",
                                "I need you to",
                                "I need you to just",
                                "I think",
                                "I think just",
                                "I think I want",
                                "I think I need",
                                "I think you can",
                                "I think you can just",
                                "I think that",
                                "I'm pretty sure",
                                "I'm pretty sure that",
                                "I am pretty sure",
                                "I am pretty sure that",
                                "I believe",
                                "I believe that",
                                "You can",
                                "You can just",
                                "You can just go ahead and",
                                "You should",
                                "You should just",
                                "Just",
                                "Go ahead and",
                                "Just go ahead",
                                "Just go ahead and",
                            ]
                        }
                    }
                ]
            },

            SHARED_SLOT_TYPES_TAIL:     {
                name: SharedSlotType.TAIL,
                values: [
                    {
                        id: $.Tail,
                        name: {
                            value: 'tail',
                            synonyms: [
                                "please",
                                "thanks",
                                "please thanks",
                                "will be fine",
                                "will be fine thanks",
                                "is good",
                                "is good thanks",
                                "will be good",
                                "will be good thanks",
                                "is plenty",
                                "is plenty thanks",
                                "will be plenty",
                                "will be plenty thanks",
                                "is great",
                                "is great thanks",
                                "will be great",
                                "will be great thanks",
                                "will work",
                                "will work thanks",
                                "is correct",
                                "is correct thanks",
                                "is right",
                                "is right thanks",
                                "at a time"
                            ]
                        }
                    }
                ]
            },

            SHARED_SLOT_TYPES_CONJUNCTION: {
                name: SharedSlotType.CONJUNCTION,
                values: [
                    {
                        id: $.Conjunction,
                        name: {
                            value: 'conjunction',
                            synonyms: [
                                "and",
                                "and then",
                                "then",
                                "and also"
                            ]
                        }
                    }
                ]
            },

            SHARED_SLOT_TYPES_PREPOSITION: {
                name: SharedSlotType.PREPOSITION,
                values: [
                    {
                        id: $.Preposition,
                        name: {
                            value: 'preposition',
                            synonyms: [
                                "the",
                                "to",
                                "to the",
                                "to be",
                                "to go",
                                "in",
                                "in to",
                                "into",
                                "is",
                                "equal to",
                                "to be equal to",
                                "also",
                                "to also be",
                                "to be also",
                                "from",
                                "until"
                            ]
                        }
                    }
                ]
            },

            SHARED_SLOT_TYPES_ACTION: {
                name: SharedSlotType.ACTION,
                values: [
                    {
                        id: $.Action.Set,
                        name: {
                            value: 'set',
                            synonyms: [
                                "set",
                                "assign",
                                "make",
                                "will be",
                                "must be",
                                "must be set to",
                                "must be equal to",
                                "should be",
                                "should be",
                                "should be set to",
                                "should be equal to",
                                "needs to be",
                                "needs to be set to",
                            ]
                        }
                    },
                    {
                        id: $.Action.Change,
                        name: {
                            value: 'change',
                            synonyms: [
                                "update",
                                "move",
                                "alter",
                                "change",
                                "switch",
                                "should be",
                                "should be changed to",
                                "should be changed",
                                "should be updated to",
                                "should be updated",
                                "should be altered to",
                                "should be altered",
                                "needs to be changed to",
                                "needs to be changed",
                                "needs to be updated to",
                                "needs to be updated",
                                "needs to be altered to",
                                "needs to be altered"
                            ]
                        }
                    },
                ]
            },

            SHARED_SLOT_TYPES_TARGET: {
                name: SharedSlotType.TARGET,
                values: [
                    {
                        id: $.Target.It,
                        name: {
                            value: 'it',
                            synonyms: [
                                'it',
                                "this",
                                "that"
                            ]
                        }
                    },
                ]
            },
        }
    }
};
