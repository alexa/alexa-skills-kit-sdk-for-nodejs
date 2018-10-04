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

import { Response } from 'ask-sdk-model';
import { CustomSkillErrorHandler } from '../../dispatcher/error/handler/CustomSkillErrorHandler';
import { CustomSkillRequestHandler } from '../../dispatcher/request/handler/CustomSkillRequestHandler';
import { HandlerInput } from '../../dispatcher/request/handler/HandlerInput';
import { CustomSkillRequestInterceptor } from '../../dispatcher/request/interceptor/CustomSkillRequestInterceptor';
import { CustomSkillResponseInterceptor } from '../../dispatcher/request/interceptor/CustomSkillResponseInterceptor';
import { CustomSkill } from '../CustomSkill';
import { CustomSkillConfiguration } from '../CustomSkillConfiguration';
import { LambdaHandler } from './BaseSkillFactory';

/**
 * An interface containing help functions to build a {@link CustomSkill}.
 */
export interface BaseSkillBuilder {
    addRequestHandler(matcher : ((input : HandlerInput) => Promise<boolean> | boolean) | string, executor : (input : HandlerInput) => Promise<Response> | Response) : this;
    addRequestHandlers(...requestHandlers : CustomSkillRequestHandler[]) : this;
    addRequestInterceptors(...executors : Array<CustomSkillRequestInterceptor | ((input : HandlerInput) => Promise<void> | void)>) : this;
    addResponseInterceptors(...executors : Array<CustomSkillResponseInterceptor | ((input : HandlerInput, response? : Response) => Promise<void> | void)>) : this;
    addErrorHandler(matcher : (input : HandlerInput, error : Error) => Promise<boolean> | boolean, executor : (input : HandlerInput, error : Error) => Promise<Response> | Response) : this;
    addErrorHandlers(...errorHandlers : CustomSkillErrorHandler[]) : this;
    withCustomUserAgent(customUserAgent : string) : this;
    withSkillId(skillId : string) : this;
    getSkillConfiguration() : CustomSkillConfiguration;
    create() : CustomSkill;
    lambda() : LambdaHandler;
}
