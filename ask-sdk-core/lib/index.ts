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

export { AttributesManager } from './attributes/AttributesManager';
export { AttributesManagerFactory } from './attributes/AttributesManagerFactory';
export { PersistenceAdapter } from './attributes/persistence/PersistenceAdapter';
export { CustomSkillErrorHandler as ErrorHandler } from './dispatcher/error/handler/CustomSkillErrorHandler';
export { CustomSkillRequestHandler as RequestHandler } from './dispatcher/request/handler/CustomSkillRequestHandler';
export { DelegateToIntentHandler } from './dispatcher/request/handler/DelegateToIntentHandler';
export { HandlerInput } from './dispatcher/request/handler/HandlerInput';
export { CustomSkillRequestInterceptor as RequestInterceptor } from './dispatcher/request/interceptor/CustomSkillRequestInterceptor';
export { CustomSkillResponseInterceptor as ResponseInterceptor } from './dispatcher/request/interceptor/CustomSkillResponseInterceptor';
export { ImageHelper } from './response/ImageHelper';
export { PlainTextContentHelper } from './response/PlainTextContentHelper';
export { ResponseBuilder } from './response/ResponseBuilder';
export { ResponseFactory } from './response/ResponseFactory';
export { RichTextContentHelper } from './response/RichTextContentHelper';
export { TextContentHelper } from './response/TextContentHelper';
export { DefaultApiClient } from './service/DefaultApiClient';
export { CustomSkill as Skill} from './skill/CustomSkill';
export { BaseSkillBuilder } from './skill/factory/BaseSkillBuilder';
export { BaseSkillFactory, LambdaHandler } from './skill/factory/BaseSkillFactory';
export { CustomSkillBuilder } from './skill/factory/CustomSkillBuilder';
export { CustomSkillFactory } from './skill/factory/CustomSkillFactory';
export { SkillBuilders } from './skill/SkillBuilders';
export { CustomSkillConfiguration as SkillConfiguration } from './skill/CustomSkillConfiguration';
export {
    getViewportDpiGroup,
    getViewportOrientation,
    getViewportProfile,
    getViewportSizeGroup,
    ViewportDpiGroup,
    ViewportDpiGroupOrder,
    ViewportOrientation,
    ViewportProfile,
    ViewportSizeGroup,
    ViewportSizeGroupOrder
} from './util/ViewportUtils';
export {
    escapeXmlCharacters
} from './util/SsmlUtils';
export {
    getAccountLinkingAccessToken,
    getApiAccessToken,
    getDeviceId,
    getUserId,
    getDialogState,
    getSlotValueV2,
    getIntentName,
    getLocale,
    getRequest,
    getRequestType,
    getSimpleSlotValues,
    getSlot,
    getSlotValue,
    getSupportedInterfaces,
    isNewSession
} from './util/RequestEnvelopeUtils';

export {
    createAskSdkError,
    createAskSdkUserAgent,
    UserAgentManager
} from 'ask-sdk-runtime';

export {
    ComponentInterface
} from './components/ComponentInterface';

export {
    launchComponent,
    egressFromComponent
} from './util/ComponentUtils';