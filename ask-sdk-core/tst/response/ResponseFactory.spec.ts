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
     interfaces,
 } from 'ask-sdk-model';
import { expect } from 'chai';
import { ImageHelper } from '../../lib/response/ImageHelper';
import { ResponseBuilder } from '../../lib/response/ResponseBuilder';
import { ResponseFactory } from '../../lib/response/ResponseFactory';
import { RichTextContentHelper } from '../../lib/response/RichTextContentHelper';
import { JsonProvider } from '../mocks/JsonProvider';
import PlayBehavior = interfaces.audioplayer.PlayBehavior;
import ClearBehavior = interfaces.audioplayer.ClearBehavior;
import Image = interfaces.display.Image;
import BodyTemplate1 = interfaces.display.BodyTemplate1;
import CanFulfillIntent = canfulfill.CanFulfillIntent;

describe('ResponseFactory', () => {

    it('should build response with Ssml outputSpeech', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const speechOutput = 'HelloWorld!';
        const expectResponse = {
                    outputSpeech: {
                        ssml: '<speak>' + speechOutput + '</speak>',
                        type: 'SSML',
                    },
            };

        expect(responseBuilder.speak(speechOutput).getResponse()).to.deep.equal(expectResponse);
    });

    it('should trim the outputSpeech if it already has the SSML flag', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const speechOutput = '<speak>   HelloWorld!  </speak>';
        const speechOutput2 = '  <speak>  HelloWorld! </speak>  ';
        const speechOutput3 = '<speak>HelloWorld!</speak>';
        const expectResponse = {
            outputSpeech: {
                ssml: '<speak>' + 'HelloWorld!' + '</speak>',
                type: 'SSML',
            },
        };

        expect(responseBuilder.speak(speechOutput).getResponse()).to.deep.equal(expectResponse);
        expect(responseBuilder.speak(speechOutput2).getResponse()).to.deep.equal(expectResponse);
        expect(responseBuilder.speak(speechOutput3).getResponse()).to.deep.equal(expectResponse);
    });

    it('should return empty string for trimOutputSpeech function if speechOutput is null or undefined or empty string', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const expectResponse = {
            outputSpeech: {
                ssml: '<speak>' + '</speak>',
                type: 'SSML',
            },
        };

        expect(responseBuilder.speak(null).getResponse()).to.deep.equal(expectResponse);
    });

    it('should build response with Ssml reprompt', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const speechOutput = 'HelloWorld!';
        const expectResponse = {
                reprompt : {
                    outputSpeech: {
                        ssml: '<speak>' + speechOutput + '</speak>',
                        type: 'SSML',
                    },
                },
                shouldEndSession : false,
            };

        expect(responseBuilder.reprompt(speechOutput).getResponse()).to.deep.equal(expectResponse);
    });

    it('should build response with simple card', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const cardTitle = 'Card Title';
        const cardContent = 'Card Content';
        const expectResponse = {
                card : {
                    content : cardContent,
                    title : cardTitle,
                    type : 'Simple',
                },
            };
        expect(responseBuilder.withSimpleCard(cardTitle, cardContent).getResponse()).to.deep.equal(expectResponse);
    });

    it('should build response with standard card', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const cardTitle = 'Card Title';
        const cardContent = 'Card Content';
        const largeImageUrl = 'https://url-to-large-card-image...';
        const smallImageUrl = 'https://url-to-small-card-image...';

        const expectResponse = {
                card : {
                    image: {
                        largeImageUrl: 'https://url-to-large-card-image...',
                        smallImageUrl: 'https://url-to-small-card-image...',
                    },
                    text: cardContent,
                    title : cardTitle,
                    type : 'Standard',
                },
            };
        const expectResponse2 = {
            card : {
                image: {
                    smallImageUrl: 'https://url-to-small-card-image...',
                },
                text: cardContent,
                title : cardTitle,
                type : 'Standard',
            },
        };

        const expectResponse3 = {
            card : {
                image: {
                    largeImageUrl: 'https://url-to-large-card-image...',
                },
                text: cardContent,
                title : cardTitle,
                type : 'Standard',
            },
        };

        const expectResponse4 = {
            card : {
                text: cardContent,
                title : cardTitle,
                type : 'Standard',
            },
        };

        expect(responseBuilder.withStandardCard(cardTitle, cardContent, smallImageUrl, largeImageUrl).getResponse()).to.deep.equals(expectResponse);
        expect(responseBuilder.withStandardCard(cardTitle, cardContent, smallImageUrl).getResponse()).to.deep.equals(expectResponse2);
        expect(responseBuilder.withStandardCard(cardTitle, cardContent, undefined, largeImageUrl).getResponse()).to.deep.equals(expectResponse3);
        expect(responseBuilder.withStandardCard(cardTitle, cardContent).getResponse()).to.deep.equals(expectResponse4);
    });

    it('should build response with link account card', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const expectResponse = {
            card : {
                type : 'LinkAccount',
            },
        };
        expect(responseBuilder.withLinkAccountCard().getResponse()).to.deep.equals(expectResponse);
    });

    it('should build response with permission consent card', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const permissionArray = ['permission1', 'permission2'];
        const expectResponse = {
            card : {
                permissions : permissionArray,
                type : 'AskForPermissionsConsent',
            },
        };
        expect(responseBuilder.withAskForPermissionsConsentCard(permissionArray).getResponse()).to.deep.equals(expectResponse);
    });

    it('should build response with Dialog.Delegate directive', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const expectResponse = {
            directives : [
                {
                    type: 'Dialog.Delegate',
                    updatedIntent: {
                        confirmationStatus: 'NONE',
                        name: 'intentName',
                        slots: {
                            slot1: {
                                confirmationStatus: 'NONE',
                                name: 'slot1',
                                value: 'value1',
                            },
                        },
                    },
                },
                {
                    type: 'Dialog.Delegate',
                },
            ],
        };

        const slot = JsonProvider.slot();
        slot.name = 'slot1';
        slot.value = 'value1';
        slot.confirmationStatus = 'NONE';
        delete slot.resolutions;

        const intent = JsonProvider.intent();
        intent.name = 'intentName';
        intent.slots = {
            slot1 : slot,
        };
        intent.confirmationStatus = 'NONE';

        expect(responseBuilder.addDelegateDirective(intent).addDelegateDirective().getResponse()).to.deep.equals(expectResponse);
    });

    it('should build response with Dialog.ElicitSlot Directive', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();

        const expectResponse = {
            directives : [
                {
                    slotToElicit : 'slotName',
                    type : 'Dialog.ElicitSlot',
                    updatedIntent : {
                        confirmationStatus: 'NONE',
                        name: 'intentName',
                        slots: {
                            slot1: {
                                confirmationStatus: 'NONE',
                                name: 'slot1',
                                value: 'value1',
                            },
                        },
                    },
                },
                {
                    slotToElicit : 'slotName',
                    type : 'Dialog.ElicitSlot',
                },
            ],
        };

        const slot = JsonProvider.slot();
        slot.name = 'slot1';
        slot.value = 'value1';
        slot.confirmationStatus = 'NONE';
        delete slot.resolutions;

        const intent = JsonProvider.intent();
        intent.name = 'intentName';
        intent.slots = {
            slot1 : slot,
        };
        intent.confirmationStatus = 'NONE';

        expect(responseBuilder.addElicitSlotDirective('slotName', intent).addElicitSlotDirective('slotName').getResponse()).to.deep.equals(expectResponse);
    });

    it('should build response with Dialog.ConfirmSlot directive', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const expectResponse = {
            directives : [
                {
                    slotToConfirm : 'slotName',
                    type : 'Dialog.ConfirmSlot',
                    updatedIntent : {
                        confirmationStatus: 'NONE',
                        name: 'intentName',
                        slots: {
                            slot1: {
                                confirmationStatus: 'NONE',
                                name: 'slot1',
                                value: 'value1',
                            },
                        },
                    },
                },
                {
                    slotToConfirm : 'slotName',
                    type : 'Dialog.ConfirmSlot',
                },
            ],
        };

        const slot = JsonProvider.slot();
        slot.name = 'slot1';
        slot.value = 'value1';
        slot.confirmationStatus = 'NONE';
        delete slot.resolutions;

        const intent = JsonProvider.intent();
        intent.name = 'intentName';
        intent.slots = {
            slot1 : slot,
        };
        intent.confirmationStatus = 'NONE';

        expect(responseBuilder.addConfirmSlotDirective('slotName', intent).addConfirmSlotDirective('slotName').getResponse()).to.deep.equals(expectResponse);
    });

    it('should build response with Dialog.ConfirmIntent', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const expectResponse = {
            directives : [
                {
                    type : 'Dialog.ConfirmIntent',
                    updatedIntent : {
                        confirmationStatus: 'NONE',
                        name: 'intentName',
                        slots: {
                            slot1: {
                                confirmationStatus: 'NONE',
                                name: 'slot1',
                                value: 'value1',
                            },
                        },
                    },
                },
                {
                    type : 'Dialog.ConfirmIntent',
                },
            ],
        };

        const slot = JsonProvider.slot();
        slot.name = 'slot1';
        slot.value = 'value1';
        slot.confirmationStatus = 'NONE';
        delete slot.resolutions;

        const intent = JsonProvider.intent();
        intent.name = 'intentName';
        intent.slots = {
            slot1 : slot,
        };
        intent.confirmationStatus = 'NONE';

        expect(responseBuilder.addConfirmIntentDirective(intent).addConfirmIntentDirective().getResponse()).to.deep.equals(expectResponse);
    });

    it('should build response with AudioPlayer.Play directive', () => {
        const behavior : PlayBehavior = 'ENQUEUE';
        const audioSource = 'https://url/to/audiosource';
        const audioToken = 'audio token';
        const offset = 10000;
        const previousToken = 'previous token';
        const audioItemMetadata = {
            title : 'title',
            subtitle : 'subtitle',
            art : new ImageHelper().withDescription('description').addImageInstance('fakeUrl.com').getImage(),
            backgroundImage : new ImageHelper().withDescription('description').addImageInstance('fakeUrl.com').getImage(),
        };

        const expectResponse1 = {
            directives : [
                {   audioItem : {
                        stream : {
                            expectedPreviousToken : previousToken,
                            offsetInMilliseconds : offset,
                            token : audioToken,
                            url : audioSource,
                        },
                    },
                    playBehavior : behavior,
                    type : 'AudioPlayer.Play',
                },
            ],
        };
        const expectResponse2 = {
            directives : [
                {   audioItem : {
                        stream : {
                            offsetInMilliseconds : offset,
                            token : audioToken,
                            url : audioSource,
                        },
                    },
                    playBehavior : behavior,
                    type : 'AudioPlayer.Play',
                },
            ],
        };

        const expectResponse3 = {
            directives: [
                {
                    audioItem: {
                        metadata: {
                            art: {
                                contentDescription: 'description',
                                sources: [
                                    {
                                        url: 'fakeUrl.com',
                                    },
                                ],
                            },
                            backgroundImage: {
                                contentDescription: 'description',
                                sources: [
                                    {
                                        url: 'fakeUrl.com',
                                    },
                                ],
                            },
                            subtitle: 'subtitle',
                            title: 'title',
                        },
                        stream: {
                            expectedPreviousToken: 'previous token',
                            offsetInMilliseconds: 10000,
                            token: 'audio token',
                            url: 'https://url/to/audiosource',
                        },
                    },
                    playBehavior: 'ENQUEUE',
                    type: 'AudioPlayer.Play',
                },
            ],
        };

        expect(ResponseFactory.init().addAudioPlayerPlayDirective(behavior, audioSource, audioToken, offset, previousToken).getResponse()).to.deep.equals(expectResponse1);
        expect(ResponseFactory.init().addAudioPlayerPlayDirective(behavior, audioSource, audioToken, offset).getResponse()).to.deep.equals(expectResponse2);
        expect(ResponseFactory.init().addAudioPlayerPlayDirective(behavior, audioSource, audioToken, offset, previousToken, audioItemMetadata).getResponse()).to.deep.equals(expectResponse3);
    });

    it('should build response with AudioPlayer.Stop directive', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const expectResponse = {
            directives : [
                {   type : 'AudioPlayer.Stop',
                },
            ],
        };
        expect(responseBuilder.addAudioPlayerStopDirective().getResponse()).to.deep.equals(expectResponse);
    });

    it('should build response with AudioPlayer.ClearQueue directive', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const behavior : ClearBehavior = 'CLEAR_ALL';
        const expectResponse = {
            directives : [
                {   clearBehavior : behavior,
                    type : 'AudioPlayer.ClearQueue',
                },
            ],
        };
        expect(responseBuilder.addAudioPlayerClearQueueDirective(behavior).getResponse())
        .to.deep.equals(expectResponse);
    });

    it('should build response with rendering bodyTemplate1 directive', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();

        const backgroundImage : Image = new ImageHelper()
                .withDescription('description')
                .addImageInstance('https://url/to/imagesource', 'MEDIUM', 100, 100)
                .getImage();

        const textContent = new RichTextContentHelper()
            .withPrimaryText('primary text')
            .withSecondaryText('secondary text')
            .withTertiaryText('teritiary text')
            .getTextContent();

        const displayTemplate : BodyTemplate1 = {
            type : 'BodyTemplate1',
            token : 'token',
            backButton : 'VISIBLE',
            backgroundImage,
            title : 'title',
            textContent,
        };

        const expectResponse = {
            directives : [
                {   template : {
                        backButton : 'VISIBLE',
                        backgroundImage : {
                            contentDescription : 'description',
                            sources : [
                                {
                                    heightPixels : 100,
                                    size : 'MEDIUM',
                                    url : 'https://url/to/imagesource',
                                    widthPixels : 100,
                                },
                            ],
                        },
                        textContent : {
                            primaryText : {
                                text : 'primary text',
                                type : 'RichText',
                            },
                            secondaryText : {
                                text : 'secondary text',
                                type : 'RichText',
                            },
                            tertiaryText : {
                                text : 'teritiary text',
                                type : 'RichText',
                            },
                        },
                        title : 'title',
                        token : 'token',
                        type : 'BodyTemplate1',
                },
                    type : 'Display.RenderTemplate',
                },
            ],
        };

        expect(responseBuilder.addRenderTemplateDirective(displayTemplate).getResponse())
        .to.deep.equals(expectResponse);
    });

    it('should build response with plainText hint directive', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const hintText = 'This is plainText hint';
        const expectResponse = {
            directives : [
                {
                    hint : {
                        text : hintText,
                        type : 'PlainText',
                    },
                    type : 'Hint',
                },
            ],
        };
        expect(responseBuilder.addHintDirective(hintText).getResponse()).to.deep.equals(expectResponse);
    });

    it('should build response with VideoApp.Launch directive', () => {
        const videoSource = 'https://url/to/videosource';
        const mockSubtitle = 'Secondary Title for Sample Video';
        const mockTitle = 'Title for Sample Video';
        const expectResponse = {
            directives : [
                {
                    type : 'VideoApp.Launch',
                    videoItem : {
                        metadata : {
                                        subtitle : mockSubtitle,
                                        title : mockTitle,
                                    },
                        source : videoSource,
                    },
                },
            ],
        };

        const expectResponse2 = {
            directives : [
                {
                    type : 'VideoApp.Launch',
                    videoItem : {
                        metadata : {
                                        subtitle : mockSubtitle,
                                    },
                        source : videoSource,
                    },
                },
            ],
        };

        const expectResponse3 = {
            directives : [
                {
                    type : 'VideoApp.Launch',
                    videoItem : {
                        metadata : {
                                        title : mockTitle,
                                    },
                        source : videoSource,
                    },
                },
            ],
        };

        const expectResponse4 = {
            directives : [
                {
                    type : 'VideoApp.Launch',
                    videoItem : {
                        source : videoSource,
                    },
                },
            ],
        };
        expect(ResponseFactory.init().addVideoAppLaunchDirective(videoSource, mockTitle, mockSubtitle).getResponse())
        .to.deep.equals(expectResponse);
        expect(ResponseFactory.init().addVideoAppLaunchDirective(videoSource, undefined, mockSubtitle).getResponse())
        .to.deep.equals(expectResponse2);
        expect(ResponseFactory.init().addVideoAppLaunchDirective(videoSource, mockTitle).getResponse())
        .to.deep.equals(expectResponse3);
        expect(ResponseFactory.init().addVideoAppLaunchDirective(videoSource).getResponse())
        .to.deep.equals(expectResponse4);
    });

    it('should omit shouldEndSession flag if VideoApp.LaunchDirective is added', () => {
        const videoSource = 'https://url/to/videosource';
        const mockSubtitle = 'Secondary Title for Sample Video';
        const mockTitle = 'Title for Sample Video';
        const expectResponse1 = {
            directives : [
                {
                    type : 'VideoApp.Launch',
                    videoItem : {
                        metadata : {
                            subtitle : mockSubtitle,
                            title : mockTitle,
                        },
                        source : videoSource,
                    },
                },
            ],
        };
        expect(ResponseFactory.init().withShouldEndSession(true).addVideoAppLaunchDirective(videoSource, mockTitle, mockSubtitle).getResponse())
            .to.deep.equals(expectResponse1);
        expect(ResponseFactory.init().addVideoAppLaunchDirective(videoSource, mockTitle, mockSubtitle).withShouldEndSession(true).getResponse())
            .to.deep.equals(expectResponse1);

        const speechOutput = 'HelloWorld!';
        const expectResponse2 = {
            reprompt : {
                outputSpeech: {
                    ssml: '<speak>' + speechOutput + '</speak>',
                    type: 'SSML',
                },
            },
            directives : [
                {
                    type : 'VideoApp.Launch',
                    videoItem : {
                        metadata : {
                            subtitle : mockSubtitle,
                            title : mockTitle,
                        },
                        source : videoSource,
                    },
                },
            ],
        };
        expect(ResponseFactory.init().reprompt(speechOutput).addVideoAppLaunchDirective(videoSource, mockTitle, mockSubtitle).getResponse())
            .to.deep.equals(expectResponse2);
        expect(ResponseFactory.init().addVideoAppLaunchDirective(videoSource, mockTitle, mockSubtitle).reprompt(speechOutput).getResponse())
            .to.deep.equals(expectResponse2);
    });

    it('should build response with canFulfillIntent', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const canFulfillIntent : CanFulfillIntent = {
            canFulfill : 'YES',
            slots : {
                foo : {
                    canUnderstand : 'MAYBE',
                    canFulfill : 'YES',
                },
            },
        };
        const expectedResponse = {
            canFulfillIntent,
        };

        expect(responseBuilder.withCanFulfillIntent(canFulfillIntent).getResponse()).to.deep.equals(expectedResponse);
    });

    it('should build response with shouldEndSession value', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const expectResponse = {
            shouldEndSession : true,
        };
        expect(responseBuilder.withShouldEndSession(true).getResponse()).to.deep.equals(expectResponse);
    });

    it('should build response with outputSpeech and card', () => {
        const responseBuilder : ResponseBuilder = ResponseFactory.init();
        const speechOutput = 'HelloWorld!';
        const cardTitle = 'Card Title';
        const cardContent = 'Card Content';
        const expectResponse = {
                card : {
                    content : cardContent,
                    title : cardTitle,
                    type : 'Simple',
                },
                outputSpeech: {
                    ssml: '<speak>' + speechOutput + '</speak>',
                    type: 'SSML',
                },
                shouldEndSession : false,
            };
        expect(responseBuilder
            .speak(speechOutput)
            .withSimpleCard(cardTitle, cardContent)
            .withShouldEndSession(false)
            .getResponse()).to.deep.equals(expectResponse);
    });

    it('should build response with template directive and hint directive', () => {
        const speechOutput = 'HelloWorld!';
        const backgroundImage : Image = new ImageHelper()
                .withDescription('description')
                .addImageInstance('https://url/to/imagesource', 'MEDIUM', 100, 100)
                .getImage()
                                                                    ;
        const textContent = new RichTextContentHelper()
            .withPrimaryText('primary text')
            .withSecondaryText('secondary text')
            .withTertiaryText('teritiary text')
            .getTextContent();

        const displayTemplate : BodyTemplate1 = {
            type : 'BodyTemplate1',
            token : 'token',
            backButton : 'VISIBLE',
            backgroundImage,
            title : 'title',
            textContent,
        };

        const hintText = 'This is plainText hint';
        const expectResponse = {
            outputSpeech: {
                ssml: '<speak>' + speechOutput + '</speak>',
                type: 'SSML',
            },
            reprompt : {
                outputSpeech: {
                    ssml: '<speak>' + speechOutput + '</speak>',
                    type: 'SSML',
                },
            },
            directives : [
                {   template : {
                        backButton : 'VISIBLE',
                        backgroundImage : {
                            contentDescription : 'description',
                            sources : [
                                {
                                    heightPixels : 100,
                                    size : 'MEDIUM',
                                    url : 'https://url/to/imagesource',
                                    widthPixels : 100,
                                },
                            ],
                        },
                        textContent : {
                            primaryText : {
                                text : 'primary text',
                                type : 'RichText',
                            },
                            secondaryText : {
                                text : 'secondary text',
                                type : 'RichText',
                            },
                            tertiaryText : {
                                text : 'teritiary text',
                                type : 'RichText',
                            },
                        },
                        title : 'title',
                        token : 'token',
                        type : 'BodyTemplate1',
                },
                    type : 'Display.RenderTemplate',
                },
                {
                    hint : {
                        text : hintText,
                        type : 'PlainText',
                    },
                    type : 'Hint',
                },
            ],
            shouldEndSession : false,
        };
        expect(ResponseFactory.init()
            .addRenderTemplateDirective(displayTemplate)
            .addHintDirective(hintText)
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse()).to.deep.equals(expectResponse);
        expect(ResponseFactory.init()
            .addDirective({
                type : 'Display.RenderTemplate',
                template : displayTemplate,
            })
            .addDirective({
                type : 'Hint',
                hint : {
                    type : 'PlainText',
                    text : hintText,
                },
            })
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse()).to.deep.equals(expectResponse);
    });
});
