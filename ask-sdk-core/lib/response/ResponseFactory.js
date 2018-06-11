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
'use strict';
exports.__esModule = true;
/**
 * Responsible for building JSON responses using ask-sdk-model as per the Alexa skills kit interface
 * https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference#response-body-syntax.
 */
var ResponseFactory = /** @class */ (function () {
    function ResponseFactory() {
    }
    ResponseFactory.init = function () {
        var response = {};
        function isVideoAppLaunchDirectivePresent() {
            if (!response.directives) {
                return false;
            }
            for (var _i = 0, _a = response.directives; _i < _a.length; _i++) {
                var directive = _a[_i];
                if (directive.type === 'VideoApp.Launch') {
                    return true;
                }
            }
            return false;
        }
        function trimOutputSpeech(speechOutput) {
            if (!speechOutput) {
                return '';
            }
            var speech = speechOutput.trim();
            var length = speech.length;
            if (speech.startsWith('<speak>') && speech.endsWith('</speak>')) {
                return speech.substring(7, length - 8).trim();
            }
            return speech;
        }
        return {
            speak: function (speechOutput) {
                response.outputSpeech = {
                    type: 'SSML',
                    ssml: '<speak>'
                        + trimOutputSpeech(speechOutput)
                        + '</speak>'
                };
                return this;
            },
            reprompt: function (repromptSpeechOutput) {
                response.reprompt = {
                    outputSpeech: {
                        type: 'SSML',
                        ssml: '<speak>'
                            + trimOutputSpeech(repromptSpeechOutput)
                            + '</speak>'
                    }
                };
                if (!isVideoAppLaunchDirectivePresent()) {
                    response.shouldEndSession = false;
                }
                return this;
            },
            withSimpleCard: function (cardTitle, cardContent) {
                response.card = {
                    type: 'Simple',
                    title: cardTitle,
                    content: cardContent
                };
                return this;
            },
            withStandardCard: function (cardTitle, cardContent, smallImageUrl, largeImageUrl) {
                var card = {
                    type: 'Standard',
                    title: cardTitle,
                    text: cardContent
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
            withLinkAccountCard: function () {
                response.card = {
                    type: 'LinkAccount'
                };
                return this;
            },
            withAskForPermissionsConsentCard: function (permissionArray) {
                response.card = {
                    type: 'AskForPermissionsConsent',
                    permissions: permissionArray
                };
                return this;
            },
            addDelegateDirective: function (updatedIntent) {
                var delegateDirective = {
                    type: 'Dialog.Delegate'
                };
                if (updatedIntent) {
                    delegateDirective.updatedIntent = updatedIntent;
                }
                this.addDirective(delegateDirective);
                return this;
            },
            addElicitSlotDirective: function (slotToElicit, updatedIntent) {
                var elicitSlotDirective = {
                    type: 'Dialog.ElicitSlot',
                    slotToElicit: slotToElicit
                };
                if (updatedIntent) {
                    elicitSlotDirective.updatedIntent = updatedIntent;
                }
                this.addDirective(elicitSlotDirective);
                return this;
            },
            addConfirmSlotDirective: function (slotToConfirm, updatedIntent) {
                var confirmSlotDirective = {
                    type: 'Dialog.ConfirmSlot',
                    slotToConfirm: slotToConfirm
                };
                if (updatedIntent) {
                    confirmSlotDirective.updatedIntent = updatedIntent;
                }
                this.addDirective(confirmSlotDirective);
                return this;
            },
            addConfirmIntentDirective: function (updatedIntent) {
                var confirmIntentDirective = {
                    type: 'Dialog.ConfirmIntent'
                };
                if (updatedIntent) {
                    confirmIntentDirective.updatedIntent = updatedIntent;
                }
                this.addDirective(confirmIntentDirective);
                return this;
            },
            addAudioPlayerPlayDirective: function (playBehavior, url, token, offsetInMilliseconds, expectedPreviousToken, audioItemMetadata) {
                var stream = {
                    url: url,
                    token: token,
                    offsetInMilliseconds: offsetInMilliseconds
                };
                if (expectedPreviousToken) {
                    stream.expectedPreviousToken = expectedPreviousToken;
                }
                var audioItem = {
                    stream: stream
                };
                if (audioItemMetadata) {
                    audioItem.metadata = audioItemMetadata;
                }
                var playDirective = {
                    type: 'AudioPlayer.Play',
                    playBehavior: playBehavior,
                    audioItem: audioItem
                };
                this.addDirective(playDirective);
                return this;
            },
            addAudioPlayerStopDirective: function () {
                var stopDirective = {
                    type: 'AudioPlayer.Stop'
                };
                this.addDirective(stopDirective);
                return this;
            },
            addAudioPlayerClearQueueDirective: function (clearBehavior) {
                var clearQueueDirective = {
                    type: 'AudioPlayer.ClearQueue',
                    clearBehavior: clearBehavior
                };
                this.addDirective(clearQueueDirective);
                return this;
            },
            addRenderTemplateDirective: function (template) {
                var renderTemplateDirective = {
                    type: 'Display.RenderTemplate',
                    template: template
                };
                this.addDirective(renderTemplateDirective);
                return this;
            },
            addHintDirective: function (text) {
                var hint = {
                    type: 'PlainText',
                    text: text
                };
                var hintDirective = {
                    type: 'Hint',
                    hint: hint
                };
                this.addDirective(hintDirective);
                return this;
            },
            addVideoAppLaunchDirective: function (source, title, subtitle) {
                var videoItem = {
                    source: source
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
                var launchDirective = {
                    type: 'VideoApp.Launch',
                    videoItem: videoItem
                };
                this.addDirective(launchDirective);
                delete response.shouldEndSession;
                return this;
            },
            withShouldEndSession: function (val) {
                if (!isVideoAppLaunchDirectivePresent()) {
                    response.shouldEndSession = val;
                }
                return this;
            },
            addDirective: function (directive) {
                if (!response.directives) {
                    response.directives = [];
                }
                response.directives.push(directive);
                return this;
            },
            getResponse: function () {
                return response;
            }
        };
    };
    return ResponseFactory;
}());
exports.ResponseFactory = ResponseFactory;
