/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import {
    canfulfill,
    dialog,
    Directive,
    Intent,
    interfaces,
    Response,
    ui,
} from 'ask-sdk-model';
import { ResponseBuilder } from './ResponseBuilder';
import Stream = interfaces.audioplayer.Stream;
import AudioItem = interfaces.audioplayer.AudioItem;
import PlayDirective = interfaces.audioplayer.PlayDirective;
import StopDirective = interfaces.audioplayer.StopDirective;
import ClearQueueDirective = interfaces.audioplayer.ClearQueueDirective;
import RenderTemplateDirective = interfaces.display.RenderTemplateDirective;
import PlainTextHint = interfaces.display.PlainTextHint;
import HintDirective = interfaces.display.HintDirective;
import VideoItem = interfaces.videoapp.VideoItem;
import LaunchDirective = interfaces.videoapp.LaunchDirective;
import StandardCard = ui.StandardCard;
import DelegateDirective = dialog.DelegateDirective;
import ElicitSlotDirective = dialog.ElicitSlotDirective;
import ConfirmSlotDirective = dialog.ConfirmSlotDirective;
import ConfirmIntentDirective = dialog.ConfirmIntentDirective;
import AudioItemMetadata = interfaces.audioplayer.AudioItemMetadata;
import CanFulfillIntent = canfulfill.CanFulfillIntent;

/**
 * Responsible for building JSON responses using ask-sdk-model as per the Alexa skills kit interface
 * https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#response-body-syntax.
 */
export class ResponseFactory {
    public static init() : ResponseBuilder {
        const response : Response = {};

        function isVideoAppLaunchDirectivePresent() : boolean {
            if (!response.directives) {
                return false;
            }

            for (const directive of response.directives) {
                if (directive.type === 'VideoApp.Launch') {
                    return true;
                }
            }

            return false;
        }

        function trimOutputSpeech(speechOutput : string) : string {
            if (!speechOutput) {
                return '';
            }
            const speech = speechOutput.trim();
            const length = speech.length;
            if (speech.startsWith('<speak>') && speech.endsWith('</speak>')) {
                return speech.substring(7, length - 8).trim();
            }

            return speech;
        }

        return {
            speak(speechOutput : string) : ResponseBuilder {
                response.outputSpeech = {
                    type : 'SSML',
                    ssml : '<speak>'
                           + trimOutputSpeech(speechOutput)
                           + '</speak>',
                };

                return this;
            },
            reprompt(repromptSpeechOutput : string) : ResponseBuilder {
                response.reprompt = {
                    outputSpeech : {
                        type : 'SSML',
                        ssml : '<speak>'
                               + trimOutputSpeech(repromptSpeechOutput)
                               + '</speak>',
                    },
                };

                if (!isVideoAppLaunchDirectivePresent()) {
                    response.shouldEndSession = false;
                }

                return this;
            },
            withSimpleCard(cardTitle : string, cardContent : string) : ResponseBuilder {
                response.card = {
                    type : 'Simple',
                    title : cardTitle,
                    content : cardContent,
                };

                return this;
            },
            withStandardCard(cardTitle : string, cardContent : string, smallImageUrl? : string, largeImageUrl? : string) : ResponseBuilder {
                const card : StandardCard = {
                    type : 'Standard',
                    title : cardTitle,
                    text : cardContent,
                };

                if (smallImageUrl || largeImageUrl) {
                    card.image = {};
                    if (smallImageUrl) {
                        card.image.smallImageUrl = smallImageUrl;
                    }

                    if (largeImageUrl) {
                        card.image.largeImageUrl = largeImageUrl;
                    }
                }

                response.card = card;

                return this;
            },
            withLinkAccountCard() : ResponseBuilder {
                response.card = {
                    type : 'LinkAccount',
                };

                return this;
            },
            withAskForPermissionsConsentCard(permissionArray : string[]) : ResponseBuilder {
                response.card = {
                    type : 'AskForPermissionsConsent',
                    permissions : permissionArray,
                };

                return this;
            },
            addDelegateDirective(updatedIntent? : Intent) : ResponseBuilder {
                const delegateDirective : DelegateDirective = {
                    type : 'Dialog.Delegate',
                };

                if (updatedIntent) {
                    delegateDirective.updatedIntent = updatedIntent;
                }

                this.addDirective(delegateDirective);

                return this;
            },
            addElicitSlotDirective(slotToElicit : string, updatedIntent? : Intent) : ResponseBuilder {
                const elicitSlotDirective : ElicitSlotDirective = {
                    type : 'Dialog.ElicitSlot',
                    slotToElicit,
                };

                if (updatedIntent) {
                    elicitSlotDirective.updatedIntent = updatedIntent;
                }

                this.addDirective(elicitSlotDirective);

                return this;
            },
            addConfirmSlotDirective(slotToConfirm : string, updatedIntent? : Intent) : ResponseBuilder {
                const confirmSlotDirective : ConfirmSlotDirective = {
                    type : 'Dialog.ConfirmSlot',
                    slotToConfirm,
                };

                if (updatedIntent) {
                    confirmSlotDirective.updatedIntent = updatedIntent;
                }

                this.addDirective(confirmSlotDirective);

                return this;
            },
            addConfirmIntentDirective(updatedIntent? : Intent) : ResponseBuilder {
                const confirmIntentDirective : ConfirmIntentDirective = {
                    type : 'Dialog.ConfirmIntent',
                };

                if (updatedIntent) {
                    confirmIntentDirective.updatedIntent = updatedIntent;
                }

                this.addDirective(confirmIntentDirective);

                return this;
            },
            addAudioPlayerPlayDirective(
                playBehavior : interfaces.audioplayer.PlayBehavior,
                url : string,
                token : string,
                offsetInMilliseconds : number,
                expectedPreviousToken? : string,
                audioItemMetadata? : AudioItemMetadata) : ResponseBuilder {
                const stream : Stream = {
                    url,
                    token,
                    offsetInMilliseconds,
                };

                if (expectedPreviousToken) {
                    stream.expectedPreviousToken = expectedPreviousToken;
                }

                const audioItem : AudioItem = {
                    stream,
                };

                if (audioItemMetadata) {
                    audioItem.metadata = audioItemMetadata;
                }

                const playDirective : PlayDirective = {
                    type : 'AudioPlayer.Play',
                    playBehavior,
                    audioItem,
                };

                this.addDirective(playDirective);

                return this;
            },
            addAudioPlayerStopDirective() : ResponseBuilder {
                const stopDirective : StopDirective = {
                    type : 'AudioPlayer.Stop',
                };

                this.addDirective(stopDirective);

                return this;
            },
            addAudioPlayerClearQueueDirective(clearBehavior : interfaces.audioplayer.ClearBehavior) : ResponseBuilder {
                const clearQueueDirective : ClearQueueDirective = {
                    type : 'AudioPlayer.ClearQueue',
                    clearBehavior,
                };

                this.addDirective(clearQueueDirective);

                return this;
            },
            addRenderTemplateDirective(template : interfaces.display.Template) : ResponseBuilder {
                const renderTemplateDirective : RenderTemplateDirective = {
                    type : 'Display.RenderTemplate',
                    template,
                };

                this.addDirective(renderTemplateDirective);

                return this;
            },
            addHintDirective(text : string) : ResponseBuilder {
                const hint : PlainTextHint = {
                    type : 'PlainText',
                    text,
                };

                const hintDirective : HintDirective = {
                    type : 'Hint',
                    hint,
                };

                this.addDirective(hintDirective);

                return this;
            },
            addVideoAppLaunchDirective(source : string, title? : string, subtitle? : string) : ResponseBuilder {
                const videoItem : VideoItem = {
                    source,
                };

                if (title || subtitle) {
                    videoItem.metadata = {};

                    if (title) {
                        videoItem.metadata.title = title;
                    }

                    if (subtitle) {
                        videoItem.metadata.subtitle = subtitle;
                    }
                }

                const launchDirective : LaunchDirective = {
                    type : 'VideoApp.Launch',
                    videoItem,
                };

                this.addDirective(launchDirective);

                delete response.shouldEndSession;

                return this;
            },
            withCanFulfillIntent(canFulfillIntent : CanFulfillIntent) : ResponseBuilder {
                 response.canFulfillIntent = canFulfillIntent;

                 return this;
            },
            withShouldEndSession(val : boolean) : ResponseBuilder {
                if (!isVideoAppLaunchDirectivePresent()) {
                    response.shouldEndSession = val;
                }

                return this;
            },
            addDirective(directive : Directive) : ResponseBuilder {
                if (!response.directives) {
                    response.directives = [];
                }
                response.directives.push(directive);

                return this;
            },
            getResponse() : Response {
                return response;
            },
        };
    }

    private constructor() {}
}
