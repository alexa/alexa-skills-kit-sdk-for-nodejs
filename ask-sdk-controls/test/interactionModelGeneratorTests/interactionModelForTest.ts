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

import { v1 } from 'ask-smapi-model';
import { Strings as $ } from '../../src/constants/Strings';
import InteractionModelData = v1.skill.interactionModel.InteractionModelData;

export const jsonProvider = {
    loadMockInputFile(): InteractionModelData {
        return {
            interactionModel: {
                languageModel: {
                    invocationName: 'mock skill',
                    intents: [
                        {
                            name: "AMAZON.CancelIntent",
                            samples: []
                        },
                        {
                            name: "HelloWorldIntent",
                            slots: [],
                            samples: [
                                "sample one",
                                "sample two"
                            ]
                        }
                    ],
                    types: []
                },
                prompts: []
            }
        };
    },

    loadFromMockControls(): InteractionModelData {
        return {
            interactionModel: {
                languageModel: {
                    types: [
                        {
                            name: "feedback",
                            values: [
                                {
                                    id: $.Feedback.Affirm,
                                    name: {
                                        value: "affirm",
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
                                            "yes fine"
                                        ]
                                    }
                                },
                                {
                                    id: $.Feedback.Disaffirm,
                                    name: {
                                        value: "disaffirm",
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
                                            "that is wrong"
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            name: "head",
                            values: [
                                {
                                    id: $.Head,
                                    name: {
                                        value: "head",
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
                                            "Just go ahead and"
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            name: "tail",
                            values: [
                                {
                                    id: $.Tail,
                                    name: {
                                        value: "tail",
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
                        {
                            name: "action",
                            values: [
                                {
                                    id: $.Action.Set,
                                    name: {
                                        value: "set",
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
                                            "needs to be set to"
                                        ]
                                    }
                                },
                                {
                                    id: $.Action.Change,
                                    name: {
                                        value: "change",
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
                        {
                            name: "target",
                            values: [
                                {
                                    id: $.Target.It,
                                    name: {
                                        value: "it",
                                        synonyms: [
                                            "it",
                                            "this",
                                            "that"
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            name: "preposition",
                            values: [
                                {
                                    id: $.Preposition,
                                    name: {
                                        value: "preposition",
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
                        }
                    ],
                    intents: [
                        {
                            name: "TEST_ValueControlIntent",
                            slots: [
                                {
                                    name: "feedback",
                                    type: "feedback"
                                },
                                {
                                    name: "action",
                                    type: "action"
                                },
                                {
                                    name: "target",
                                    type: "target"
                                },
                                {
                                    name: "preposition",
                                    type: "preposition"
                                },
                                {
                                    name: "head",
                                    type: "head"
                                },
                                {
                                    name: "tail",
                                    type: "tail"
                                },
                                {
                                    name: "TEST",
                                    type: "TEST"
                                }
                            ],
                            samples: [
                                "{TEST}",
                                "{action} {TEST}",
                                "{action} {preposition} {TEST}",
                                "{action} {target} {preposition} {TEST}",
                                "{target} {preposition} {TEST}",
                                "{feedback} {TEST}",
                                "{feedback} {action} {TEST}",
                                "{feedback} {preposition} {TEST}",
                                "{feedback} {action} {preposition} {TEST}",
                                "{feedback} {action} {target} {preposition} {TEST}",
                                "{feedback} {target} {preposition} {TEST}",
                                "{head} {TEST}",
                                "{head} {action} {TEST}",
                                "{head} {action} {preposition} {TEST}",
                                "{head} {action} {target} {preposition} {TEST}",
                                "{head} {target} {preposition} {TEST}",
                                "{TEST} {tail}",
                                "{preposition} {TEST} {tail}",
                                "{action} {preposition} {TEST} {tail}",
                                "{action} {target} {preposition} {TEST} {tail}",
                                "{target} {preposition} {TEST} {tail}",
                                "{feedback} {TEST} {tail}",
                                "{feedback} {preposition} {TEST} {tail}",
                                "{feedback} {action} {TEST} {tail}",
                                "{feedback} {action} {preposition} {TEST} {tail}",
                                "{feedback} {action} {target} {preposition} {TEST} {tail}",
                                "{feedback} {target} {preposition} {TEST} {tail}",
                                "{head} {TEST} {tail}",
                                "{head} {preposition} {TEST} {tail}",
                                "{head} {action} {TEST} {tail}",
                                "{head} {action} {preposition} {TEST} {tail}",
                                "{head} {target} {preposition} {TEST} {tail}",
                                "{head} {action} {target} {preposition} {TEST} {tail}"
                            ]
                        },
                        {
                            name: "GeneralControlIntent",
                            slots: [
                                {
                                    name: "feedback",
                                    type: "feedback"
                                },
                                {
                                    name: "action",
                                    type: "action"
                                },
                                {
                                    name: "target",
                                    type: "target"
                                },
                                {
                                    name: "head",
                                    type: "head"
                                },
                                {
                                    name: "tail",
                                    type: "tail"
                                }
                            ],
                            samples: [
                                "{feedback} {action}",
                                "{feedback} {action} {target}",
                                "{feedback} {tail}",
                                "{feedback} {action} {tail}",
                                "{feedback} {action} {target} {tail}",
                                "{action} {target}",
                                "{head} {action}",
                                "{head} {action} {target}",
                                "{action} {tail}",
                                "{action} {target} {tail}",
                                "{head} {action} {tail}",
                                "{head} {action} {target} {tail}"
                            ]
                        }
                    ],
                    invocationName: "TEST_INVOCATION_NAME"
                },
                prompts: [
                    {
                        id: "Slot.Validation.564246223579.1467418044248.678461230495",
                        variations: [
                            {
                                type: "PlainText",
                                value: "This prompt is included to ensure there is a dialog model present. It is not used by skills."
                            }
                        ]
                    }
                ],
                dialog: {
                    intents: [
                        {
                            name: "GeneralControlIntent",
                            slots: [
                                {
                                    name: "feedback",
                                    type: "feedback"
                                },
                                {
                                    name: "action",
                                    type: "action"
                                },
                                {
                                    name: "target",
                                    type: "target",
                                    elicitationRequired: false,
                                    confirmationRequired: false,
                                    validations: [
                                        {
                                            type: "isNotInSet",
                                            prompt: "Slot.Validation.564246223579.1467418044248.678461230495",
                                            values: [
                                                "This prompt is included to ensure there is a dialog model present. It is not used by skills."
                                            ]
                                        }
                                    ]
                                },
                                {
                                    name: "head",
                                    type: "head"
                                },
                                {
                                    name: "tail",
                                    type: "tail"
                                }
                            ],
                            delegationStrategy: "SKILL_RESPONSE"
                        }
                    ]
                }
            }
        };
    },
    loadFromMockControlsFR(): InteractionModelData {
        return {
            interactionModel: {
                languageModel: {
                    types: [
                        {
                            name: "feedback",
                            values: []
                        },
                        {
                            name: "head",
                            values: []
                        },
                        {
                            name: "tail",
                            values: []
                        },
                        {
                            name: "action",
                            values: []
                        },
                        {
                            name: "target",
                            values: []
                        },
                        {
                            name: "preposition",
                            values: []
                        }
                    ],
                    intents: [
                        {
                            name: "TEST_ValueControlIntent",
                            slots: [
                                {
                                    name: "feedback",
                                    type: "feedback"
                                },
                                {
                                    name: "action",
                                    type: "action"
                                },
                                {
                                    name: "target",
                                    type: "target"
                                },
                                {
                                    name: "preposition",
                                    type: "preposition"
                                },
                                {
                                    name: "head",
                                    type: "head"
                                },
                                {
                                    name: "tail",
                                    type: "tail"
                                },
                                {
                                    name: "TEST",
                                    type: "TEST"
                                }
                            ],
                            samples: []
                        },
                        {
                            name: "GeneralControlIntent",
                            slots: [
                                {
                                    name: "feedback",
                                    type: "feedback"
                                },
                                {
                                    name: "action",
                                    type: "action"
                                },
                                {
                                    name: "target",
                                    type: "target"
                                },
                                {
                                    name: "head",
                                    type: "head"
                                },
                                {
                                    name: "tail",
                                    type: "tail"
                                }
                            ],
                            samples: []
                        }
                    ],
                    invocationName: "TEST_INVOCATION_NAME"
                },
                prompts: [
                    {
                        id: "Slot.Validation.564246223579.1467418044248.678461230495",
                        variations: [
                            {
                                type: "PlainText",
                                value: "This prompt is included to ensure there is a dialog model present. It is not used by skills."
                            }
                        ]
                    }
                ],
                dialog: {
                    intents: [
                        {
                            name: "GeneralControlIntent",
                            slots: [
                                {
                                    name: "feedback",
                                    type: "feedback"
                                },
                                {
                                    name: "action",
                                    type: "action"
                                },
                                {
                                    name: "target",
                                    type: "target",
                                    elicitationRequired: false,
                                    confirmationRequired: false,
                                    validations: [
                                        {
                                            type: "isNotInSet",
                                            prompt: "Slot.Validation.564246223579.1467418044248.678461230495",
                                            values: [
                                                "This prompt is included to ensure there is a dialog model present. It is not used by skills."
                                            ]
                                        }
                                    ]
                                },
                                {
                                    name: "head",
                                    type: "head"
                                },
                                {
                                    name: "tail",
                                    type: "tail"
                                }
                            ],
                            delegationStrategy: "SKILL_RESPONSE"
                        }
                    ]
                }
            }
        };
    }
};
