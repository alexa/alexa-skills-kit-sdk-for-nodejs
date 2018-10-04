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

import { services } from 'ask-sdk-model';

export class VoicePlayerSpeakDirective implements services.directive.SendDirectiveRequest {
    public directive : services.directive.Directive;
    public header : services.directive.Header;

    constructor(id : string, speechContent : string) {
        this.directive = {
            speech: speechContent,
            type: 'VoicePlayer.Speak',
        };
        this.header = {
            requestId : id,
        };
    }
}
