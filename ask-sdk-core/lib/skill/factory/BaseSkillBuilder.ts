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

import { Response } from 'ask-sdk-model';
import { ErrorHandler } from '../../dispatcher/error/ErrorHandler';
import { HandlerInput } from '../../dispatcher/request/handler/HandlerInput';
import { RequestHandler } from '../../dispatcher/request/handler/RequestHandler';
import { RequestInterceptor } from '../../dispatcher/request/interceptor/RequestInterceptor';
import { ResponseInterceptor } from '../../dispatcher/request/interceptor/ResponseInterceptor';
import { Skill } from '../Skill';
import { SkillConfiguration } from '../SkillConfiguration';
import { LambdaHandler } from './BaseSkillFactory';

/**
 * An interface containing help functions to build a {@link Skill}.
 */
export interface BaseSkillBuilder {
    addRequestHandler(matcher : ((handlerInput : HandlerInput) => Promise<boolean> | boolean) | string, executor : (handlerInput : HandlerInput) => Promise<Response> | Response) : this;
    addRequestHandlers(...requestHandlers : RequestHandler[]) : this;
    addRequestInterceptors(...executors : Array<RequestInterceptor | ((handlerInput : HandlerInput) => Promise<void> | void)>) : this;
    addResponseInterceptors(...executors : Array<ResponseInterceptor | ((handlerInput : HandlerInput, response? : Response) => Promise<void> | void)>) : this;
    addErrorHandler(matcher : (handlerInput : HandlerInput, error : Error) => Promise<boolean> | boolean, executor : (handlerInput : HandlerInput, error : Error) => Promise<Response> | Response) : this;
    addErrorHandlers(...errorHandlers : ErrorHandler[]) : this;
    withCustomUserAgent(customUserAgent : string) : this;
    withSkillId(skillId : string) : this;
    getSkillConfiguration() : SkillConfiguration;
    create() : Skill;
    lambda() : LambdaHandler;
}
