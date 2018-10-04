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
    createAskSdkError,
    HandlerInput,
    RequestHandler,
} from 'ask-sdk';
import { Response } from 'ask-sdk-model';
import { Adapter } from './adapter';
import { EventParser } from './eventParser';

export class Handler implements RequestHandler {
    protected adapter : Adapter;
    protected targetHandlerName : string;

    constructor(adapter : Adapter) {
        this.adapter = adapter;
    }

    public canHandle(handlerInput : HandlerInput) : boolean {
        if (this.adapter._event.session && this.adapter._event.session.new
            && this.adapter.listenerCount('NewSession' + this.adapter.state) >= 1) {
            this.targetHandlerName = 'NewSession';

            return true;
        }
        this.targetHandlerName = EventParser(this.adapter._event);

        return this.adapter.listenerCount(this.targetHandlerName + this.adapter.state) >= 1
            || this.adapter.listenerCount('Unhandled' + this.adapter.state) >= 1;
    }

    public handle(handlerInput : HandlerInput) : Promise<Response> {
        return new Promise((resolve, reject) => {
            this.adapter.promiseResolve = resolve;
            try {
                if (this.adapter.listenerCount(this.targetHandlerName + this.adapter.state) >= 1) {
                    this.adapter.emit(this.targetHandlerName + this.adapter.state);
                } else if (this.adapter.listenerCount('Unhandled' + this.adapter.state) >= 1) {
                    this.adapter.emit('Unhandled' + this.adapter.state);
                } else {
                    reject(createAskSdkError(
                        this.constructor.name,
                        `In state: ${this.adapter.state}. No handler function was defined for event ${this.targetHandlerName} and no 'Unhandled' function was defined.`));
                }
            } catch (e) {
                reject(e);
            }
        });
    }
}
