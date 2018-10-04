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
    IntentRequest,
    ui,
} from 'ask-sdk-model';
import { expect } from 'chai';
import { HandlerInput } from '../../../lib/dispatcher/request/handler/HandlerInput';
import { BaseSkillFactory } from '../../../lib/skill/factory/BaseSkillFactory';
import { MockAlwaysFalseErrorHandler } from '../../mocks/error/MockAlwaysFalseErrorHandler';
import { MockAlwaysTrueErrorHandler } from '../../mocks/error/MockAlwaysTrueErrorHandler';
import { JsonProvider } from '../../mocks/JsonProvider';
import { MockAlwaysFalseRequestHandler } from '../../mocks/request/MockAlwaysFalseRequestHandler';
import { MockAlwaysTrueRequestHandler } from '../../mocks/request/MockAlwaysTrueRequestHandler';

describe('BaseSkillFactory', () => {
    it('should be able to add single request handler using matcher and executor', async() => {
        const skill = BaseSkillFactory.init()
            .addRequestHandler(
                'LaunchRequest',
                ({responseBuilder} : HandlerInput) => {
                return responseBuilder.speak('In LaunchRequest').getResponse();
            })
            .addRequestHandler(
                ({requestEnvelope} : HandlerInput) => {
                    return (<IntentRequest> requestEnvelope.request).intent.name === 'HelloWorldIntent';
                },
                ({responseBuilder} : HandlerInput) => {
                    return responseBuilder.speak('In HelloWorldIntent').getResponse();
                })
            .create();

        const LaunchRequestEnvelope = JsonProvider.requestEnvelope();
        LaunchRequestEnvelope.request = {
            type : 'LaunchRequest',
            requestId : null,
            timestamp : null,
            locale : null,
        };

        const HelloWorldIntent = JsonProvider.intent();
        HelloWorldIntent.name = 'HelloWorldIntent';

        const HelloWorldIntentEnvelope = JsonProvider.requestEnvelope();
        HelloWorldIntentEnvelope.request = {
            type : 'IntentRequest',
            requestId : null,
            timestamp : null,
            locale : null,
            dialogState : null,
            intent : HelloWorldIntent,
        };

        const LaunchRequestResponse = await skill.invoke(LaunchRequestEnvelope);
        const HelloWorldIntentResponse = await skill.invoke(HelloWorldIntentEnvelope);

        expect((<ui.SsmlOutputSpeech> LaunchRequestResponse.response.outputSpeech).ssml)
            .equal('<speak>In LaunchRequest</speak>');
        expect((<ui.SsmlOutputSpeech> HelloWorldIntentResponse.response.outputSpeech).ssml)
            .equal('<speak>In HelloWorldIntent</speak>');
    });

    it('should thrown an error if request handler matcher is invalid', () => {
        try {
            BaseSkillFactory.init()
                .addRequestHandler(true as any, (input : HandlerInput) => {
                    return input.responseBuilder.speak('Hello!').getResponse();
                })
                .create();
        } catch (error) {
            expect(error.message).equal('Incompatible matcher type: boolean');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should be able to add multiple request handlers', async() => {
        const skill = BaseSkillFactory.init()
            .addRequestHandlers(
                new MockAlwaysFalseRequestHandler(),
                new MockAlwaysTrueRequestHandler(),
            )
            .create();

        const requestEnvelope = JsonProvider.requestEnvelope();

        const responseEnvelope = await skill.invoke(requestEnvelope);

        expect((<ui.SsmlOutputSpeech> responseEnvelope.response.outputSpeech).ssml)
            .equal('<speak>Request received at MockAlwaysTrueRequestHandler.</speak>');
    });

    it('should be able to add multiple request interceptors with either object or function', async() => {
        const skill = BaseSkillFactory.init()
            .addRequestHandler(
                'LaunchRequest',
                (input : HandlerInput) => {
                    return input.responseBuilder.speak('Hello').getResponse();
                },
            )
            .addRequestInterceptors(
                {
                    process : (input) => {
                        const attributes = input.attributesManager.getSessionAttributes();
                        attributes.firstInterceptor = true;
                        input.attributesManager.setSessionAttributes(attributes);
                    },
                },
                {
                    process : (input) => {
                        const attributes = input.attributesManager.getSessionAttributes();
                        attributes.secondInterceptor = true;
                        input.attributesManager.setSessionAttributes(attributes);
                    },
                },
                (input) => {
                    const attributes = input.attributesManager.getSessionAttributes();
                    attributes.thirdInterceptor = true;
                    input.attributesManager.setSessionAttributes(attributes);
                },
                (input) => {
                    const attributes = input.attributesManager.getSessionAttributes();
                    attributes.fourthInterceptor = true;
                    input.attributesManager.setSessionAttributes(attributes);
                },
            )
            .create();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.request = {
            type : 'LaunchRequest',
            requestId : null,
            timestamp : null,
            locale : null,
        };

        const responseEnvelope = await skill.invoke(requestEnvelope);

        expect((<ui.SsmlOutputSpeech> responseEnvelope.response.outputSpeech).ssml)
            .equal('<speak>Hello</speak>');
        expect(responseEnvelope.sessionAttributes).deep.equal({
            firstInterceptor : true,
            secondInterceptor : true,
            thirdInterceptor : true,
            fourthInterceptor : true,
        });
    });

    it('should thrown an error if request interceptor is invalid', () => {
        try {
            BaseSkillFactory.init()
                .addRequestHandler('LaunchRequest', (input : HandlerInput) => {
                    return input.responseBuilder.speak('Hello!').getResponse();
                })
                .addRequestInterceptors(true as any)
                .create();
        } catch (error) {
            expect(error.message).equal('Incompatible executor type: boolean');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should be able to add multiple response interceptors with either object or function', async() => {
        const skill = BaseSkillFactory.init()
            .addRequestHandler('LaunchRequest', (input : HandlerInput) => {
                return input.responseBuilder.speak('Hello').getResponse();
            })
            .addResponseInterceptors(
                {
                    process : (input) => {
                        const attributes = input.attributesManager.getSessionAttributes();
                        attributes.firstInterceptor = true;
                        input.attributesManager.setSessionAttributes(attributes);
                    },
                },
                {
                    process : (input) => {
                        const attributes = input.attributesManager.getSessionAttributes();
                        attributes.secondInterceptor = true;
                        input.attributesManager.setSessionAttributes(attributes);
                    },
                },
                (input) => {
                    const attributes = input.attributesManager.getSessionAttributes();
                    attributes.thirdInterceptor = true;
                    input.attributesManager.setSessionAttributes(attributes);
                },
                (input) => {
                    const attributes = input.attributesManager.getSessionAttributes();
                    attributes.fourthInterceptor = true;
                    input.attributesManager.setSessionAttributes(attributes);
                },
            )
            .create();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.request = {
            type : 'LaunchRequest',
            requestId : null,
            timestamp : null,
            locale : null,
        };

        const responseEnvelope = await skill.invoke(requestEnvelope);

        expect((<ui.SsmlOutputSpeech> responseEnvelope.response.outputSpeech).ssml)
            .equal('<speak>Hello</speak>');
        expect(responseEnvelope.sessionAttributes).deep.equal({
            firstInterceptor : true,
            secondInterceptor : true,
            thirdInterceptor : true,
            fourthInterceptor : true,
        });
    });

    it('should thrown an error if response interceptor is invalid', () => {
        try {
            BaseSkillFactory.init()
                .addRequestHandler('LaunchRequest', (input : HandlerInput) => {
                    return input.responseBuilder.speak('Hello!').getResponse();
                })
                .addResponseInterceptors(true as any)
                .create();
        } catch (error) {
            expect(error.message).equal('Incompatible executor type: boolean');

            return;
        }

        throw new Error('should have thrown an error!');
    });

    it('should be able to add single error handle using matcher and executor', async() => {
        const skill = BaseSkillFactory.init()
            .addErrorHandler(
                (input, error) => {
                    return error.message === `Unable to find a suitable request handler.`;
                },
                (input, error) => {
                    return input.responseBuilder.speak('In ErrorHandler').getResponse();
                },
            )
            .create();

        const responseEnvelope = await skill.invoke(JsonProvider.requestEnvelope());

        expect((<ui.SsmlOutputSpeech> responseEnvelope.response.outputSpeech).ssml)
            .equal('<speak>In ErrorHandler</speak>');
    });

    it('should be able to add multiple error handlers', async() => {
        const skill = BaseSkillFactory.init()
            .addErrorHandlers(
                new MockAlwaysFalseErrorHandler(),
                new MockAlwaysTrueErrorHandler(),
            )
            .create();

        const requestEnvelope = JsonProvider.requestEnvelope();

        const responseEnvelope = await skill.invoke(requestEnvelope);

        expect((<ui.SsmlOutputSpeech> responseEnvelope.response.outputSpeech).ssml)
            .equal('<speak>AskSdk.GenericRequestDispatcher Error received at MockAlwaysTrueErrorHandler.</speak>');
    });

    it('should be able to add skill id and custom user agent', async() => {
        const config = BaseSkillFactory.init()
            .withCustomUserAgent('CustomUserAgent')
            .withSkillId('testSkillId')
            .getSkillConfiguration();

        expect(config.customUserAgent).equal('CustomUserAgent');
        expect(config.skillId).equal('testSkillId');
    });

    it('should be able to create a lambda handler', (done) => {
        const skillLambda = BaseSkillFactory.init()
            .addRequestHandler(
                'LaunchRequest',
                ({responseBuilder} : HandlerInput) => {
                    return responseBuilder.speak('In LaunchRequest').getResponse();
                },
            )
            .lambda();

        const LaunchRequestEnvelope = JsonProvider.requestEnvelope();
        LaunchRequestEnvelope.request = {
            type : 'LaunchRequest',
            requestId : null,
            timestamp : null,
            locale : null,
        };

        skillLambda(LaunchRequestEnvelope, null, (error, responseEnvelope) => {
            expect((<ui.SsmlOutputSpeech> responseEnvelope.response.outputSpeech).ssml)
                .equal('<speak>In LaunchRequest</speak>');
        });

        const wrongRequestEnvelope = JsonProvider.requestEnvelope();
        wrongRequestEnvelope.request = {
            type : 'SessionEndedRequest',
            requestId : null,
            timestamp : null,
            locale : null,
            reason : null,
        };

        skillLambda(wrongRequestEnvelope, null, (error, responseEnvelope) => {
            expect(error.message).equal(`Unable to find a suitable request handler.`);
            done();
        });
    });
});
