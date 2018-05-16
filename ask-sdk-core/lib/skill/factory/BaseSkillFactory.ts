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

import {
    IntentRequest,
    RequestEnvelope,
    Response,
} from 'ask-sdk-model';
import { DefaultErrorMapper } from '../../dispatcher/error/DefaultErrorMapper';
import { ErrorHandler } from '../../dispatcher/error/ErrorHandler';
import { DefaultHandlerAdapter } from '../../dispatcher/request/handler/DefaultHandlerAdapter';
import { DefaultRequestHandlerChain } from '../../dispatcher/request/handler/DefaultRequestHandlerChain';
import { HandlerInput } from '../../dispatcher/request/handler/HandlerInput';
import { RequestHandler } from '../../dispatcher/request/handler/RequestHandler';
import { RequestInterceptor } from '../../dispatcher/request/interceptor/RequestInterceptor';
import { ResponseInterceptor } from '../../dispatcher/request/interceptor/ResponseInterceptor';
import { DefaultRequestMapper } from '../../dispatcher/request/mapper/DefaultRequestMapper';
import { createAskSdkError } from '../../util/AskSdkUtils';
import { Skill } from '../Skill';
import { SkillConfiguration } from '../SkillConfiguration';
import { BaseSkillBuilder } from './BaseSkillBuilder';

/**
 * Type definition of LambdaHandler which contains inputs received in lambda function.
 *  https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html.
 */
export type LambdaHandler = (
    requestEnvelope : RequestEnvelope,
    context : any,
    callback : (err : Error, result? : any) => void) => void;

export class BaseSkillFactory {
    public static init() : BaseSkillBuilder {
        const thisRequestHandlerChains : DefaultRequestHandlerChain[] = [];
        const thisRequestInterceptors : RequestInterceptor[] = [];
        const thisResponseInterceptors : ResponseInterceptor[] = [];
        const thisErrorHandlers : ErrorHandler[] = [];
        let thisCustomUserAgent : string;
        let thisSkillId : string;

        return {
            addRequestHandler(
                matcher : ((handlerInput : HandlerInput) => Promise<boolean> | boolean) | string,
                executor : (handlerInput : HandlerInput) => Promise<Response> | Response,
                ) : BaseSkillBuilder {
                let canHandle : (handlerInput : HandlerInput) => Promise<boolean> | boolean;

                switch (typeof matcher) {
                    case 'string' : {
                        canHandle = ({ requestEnvelope } : HandlerInput) => {
                            return matcher === (
                                   requestEnvelope.request.type === 'IntentRequest'
                                       ? (<IntentRequest> requestEnvelope.request).intent.name
                                       : requestEnvelope.request.type
                            );
                        };
                        break;
                    }
                    case 'function' : {
                        canHandle = <((handlerInput : HandlerInput) => Promise<boolean> | boolean)> matcher;
                        break;
                    }
                    default : {
                        throw createAskSdkError(
                            'SkillBuilderError',
                            `Matcher must be of type string or function, got: ${typeof matcher}!`);
                    }
                }
                thisRequestHandlerChains.push(new DefaultRequestHandlerChain({
                    requestHandler : {
                        canHandle,
                        handle : executor,
                    },
                }));

                return this;
            },
            addRequestHandlers(...requestHandlers : RequestHandler[]) : BaseSkillBuilder {
                for ( const requestHandler of requestHandlers ) {
                    thisRequestHandlerChains.push(new DefaultRequestHandlerChain({
                        requestHandler,
                    }));
                }

                return this;
            },
            addRequestInterceptors(...executors : Array<RequestInterceptor | ((handlerInput : HandlerInput) => Promise<void> | void)>) : BaseSkillBuilder {
                for ( const executor of executors ) {
                    switch (typeof executor) {
                        case 'object' : {
                            thisRequestInterceptors.push(<RequestInterceptor> executor);
                            break;
                        }
                        case 'function' : {
                            thisRequestInterceptors.push({
                                process : <((handlerInput : HandlerInput) => Promise<void> | void)> executor,
                            });
                            break;
                        }
                        default : {
                            throw createAskSdkError(
                                'SkillBuilderError',
                                `Executor must be of type Object(RequestInterceptor) or function, got: ${typeof executor}`);
                        }
                    }
                }

                return this;
            },
            addResponseInterceptors(...executors : Array<ResponseInterceptor | ((handlerInput : HandlerInput, response? : Response) => Promise<void> | void)>) : BaseSkillBuilder {
                for ( const executor of executors ) {
                    switch (typeof executor) {
                        case 'object' : {
                            thisResponseInterceptors.push(<ResponseInterceptor> executor);
                            break;
                        }
                        case 'function' : {
                            thisResponseInterceptors.push({
                                process : <((handlerInput : HandlerInput, response? : Response) => Promise<void> | void)> executor,
                            });
                            break;
                        }
                        default : {
                            throw createAskSdkError(
                                'SkillBuilderError',
                                `Executor must be of type Object(ResponseInterceptor) or function, got: ${typeof executor}`);
                        }
                    }
                }

                return this;
            },
            addErrorHandler(
                matcher : (handlerInput : HandlerInput, error : Error) => Promise<boolean> | boolean,
                executor : (handlerInput : HandlerInput, error : Error) => Promise<Response> | Response,
                ) : BaseSkillBuilder {

                thisErrorHandlers.push({
                    canHandle : matcher,
                    handle : executor,
                });

                return this;
            },
            addErrorHandlers(...errorHandlers : ErrorHandler[]) : BaseSkillBuilder {
                thisErrorHandlers.push(...errorHandlers);

                return this;
            },
            withCustomUserAgent(customUserAgent : string) : BaseSkillBuilder {
                thisCustomUserAgent = customUserAgent;

                return this;
            },
            withSkillId(skillId : string) : BaseSkillBuilder {
                thisSkillId = skillId;

                return this;
            },
            getSkillConfiguration() : SkillConfiguration {
                const requestMapper = new DefaultRequestMapper({
                    requestHandlerChains : thisRequestHandlerChains,
                });

                const errorMapper = thisErrorHandlers.length
                    ? new DefaultErrorMapper({
                        errorHandlers : thisErrorHandlers,
                    })
                    : undefined;

                return {
                    requestMappers : [requestMapper],
                    handlerAdapters : [new DefaultHandlerAdapter()],
                    errorMapper,
                    requestInterceptors : thisRequestInterceptors,
                    responseInterceptors : thisResponseInterceptors,
                    customUserAgent : thisCustomUserAgent,
                    skillId : thisSkillId,
                };
            },
            create() : Skill {
                return new Skill(this.getSkillConfiguration());
            },
            lambda() : LambdaHandler {
                const skill = new Skill(this.getSkillConfiguration());

                return (event : RequestEnvelope, context : any, callback : (err : Error, result? : any) => void) => {
                    skill.invoke(event, context)
                        .then((response) => {
                            callback(null, response);
                        })
                        .catch((err) => {
                            callback(err, null);
                        });
                };
            },
        };
    }

    private constructor() {}
}
