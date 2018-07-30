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

import { RequestEnvelope } from 'ask-sdk-model';
import { Adapter } from './adapter';
import { VoicePlayerSpeakDirective } from './directives/voicePlayerSpeakDirective';
import { DeviceAddressService } from './services/deviceAddressService';
import { DirectiveService } from './services/directiveService';
import { ListManagementService } from './services/listManagementService';
import { BodyTemplate1Builder } from './templateBuilders/bodyTemplate1Builder';
import { BodyTemplate2Builder } from './templateBuilders/bodyTemplate2Builder';
import { BodyTemplate3Builder } from './templateBuilders/bodyTemplate3Builder';
import { BodyTemplate6Builder } from './templateBuilders/bodyTemplate6Builder';
import { BodyTemplate7Builder } from './templateBuilders/bodyTemplate7Builder';
import { ListItemBuilder } from './templateBuilders/listItemBuilder';
import { ListTemplate1Builder } from './templateBuilders/listTemplate1Builder';
import { ListTemplate2Builder } from './templateBuilders/listTemplate2Builder';
import { ImageUtils } from './utils/imageUtils';
import { TextUtils } from './utils/textUtils';
import { V1Handler } from './v1Handler';

export {
    Adapter,
    StateString,
    CreateStateHandler,
} from './adapter';
export { Handler } from './handler';
export { V1Handler } from './v1Handler';
export { ResponseBuilder } from './responseBuilderShim';

export function handler(event : RequestEnvelope, context : any, callback? : (err : Error, result? : any) => void) : Adapter {
    return new Adapter(event, context, callback);
}

export const templateBuilders = {
    BodyTemplate1Builder,
    BodyTemplate2Builder,
    BodyTemplate3Builder,
    BodyTemplate6Builder,
    BodyTemplate7Builder,
    ListItemBuilder,
    ListTemplate1Builder,
    ListTemplate2Builder,
};

export const services = {
    DeviceAddressService,
    DirectiveService,
    ListManagementService,
};

export const directives = {
    VoicePlayerSpeakDirective,
};

export const utils = {
    ImageUtils,
    TextUtils,
};
