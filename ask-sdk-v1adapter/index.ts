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
import { Adapter } from './lib/adapter';
import { VoicePlayerSpeakDirective } from './lib/directives/voicePlayerSpeakDirective';
import { DeviceAddressService } from './lib/services/deviceAddressService';
import { DirectiveService } from './lib/services/directiveService';
import { ListManagementService } from './lib/services/listManagementService';
import { BodyTemplate1Builder } from './lib/templateBuilders/bodyTemplate1Builder';
import { BodyTemplate2Builder } from './lib/templateBuilders/bodyTemplate2Builder';
import { BodyTemplate3Builder } from './lib/templateBuilders/bodyTemplate3Builder';
import { BodyTemplate6Builder } from './lib/templateBuilders/bodyTemplate6Builder';
import { BodyTemplate7Builder } from './lib/templateBuilders/bodyTemplate7Builder';
import { ListItemBuilder } from './lib/templateBuilders/listItemBuilder';
import { ListTemplate1Builder } from './lib/templateBuilders/listTemplate1Builder';
import { ListTemplate2Builder } from './lib/templateBuilders/listTemplate2Builder';
import { ImageUtils } from './lib/utils/imageUtils';
import { TextUtils } from './lib/utils/textUtils';
import { V1Handler } from './lib/v1Handler';

export { Adapter } from './lib/adapter';
export { Handler } from './lib/handler';
export { V1Handler } from './lib/v1Handler';
export { ResponseBuilder } from './lib/responseBuilderShim';

export const services = {
    DeviceAddressService,
    DirectiveService,
    ListManagementService,
};

export const directives = {
    VoicePlayerSpeakDirective,
};

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

export const utils = {
    ImageUtils,
    TextUtils,
};

export function handler(event : RequestEnvelope, context : any, callback? : (err : Error, result? : any) => void) : Adapter {
    if (!event.session) {
        event.session = {
            new : null,
            user : null,
            sessionId : null,
            application : null,
            attributes: {} };
    } else if (!event.session.attributes) {
        event.session.attributes = {};
    }
    const adapter = new Adapter(event, context, callback);
    adapter.setMaxListeners(Infinity);

    return adapter;
}

export function CreateStateHandler(state : string, requestHandler : V1Handler) : V1Handler {
    if (!requestHandler) {
        requestHandler = {};
    }
    for ( const eventName  of Object.keys(requestHandler)) {
        if (typeof(requestHandler[eventName]) !== 'function') {
            throw new Error(`Event handler for '${eventName}' was not a function`);
        }
        if (state) {
            const newEventName = eventName + state;
            Object.defineProperty(requestHandler, newEventName, Object.getOwnPropertyDescriptor(requestHandler, eventName));
            delete requestHandler[eventName];
        }
    }

    return requestHandler;
}
