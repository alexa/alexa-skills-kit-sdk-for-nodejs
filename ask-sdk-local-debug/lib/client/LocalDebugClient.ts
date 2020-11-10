/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License').
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the 'license' file accompanying this file. This file is distributed
 * on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import WebSocket from 'ws';
import { SkillInvokerConfig } from '../config/SkillInvokerConfig';
import { getDynamicEndpointsRequest, getSkillResponse } from '../util/RequestResponseUtils';
import { ILocalDebugClient } from './ILocalDebugClient';

const PING_FREQUENCY_IN_MILLISECONDS = 5 * 60 * 1000;

export class LocalDebugClient implements ILocalDebugClient {
    private readonly _skillInvokerConfig: SkillInvokerConfig;

    private readonly _webSocketClient: WebSocket;

    private readonly heartbeat: NodeJS.Timeout;

    constructor(webSocketClient: WebSocket, skillInvokerConfig: SkillInvokerConfig) {
        this._skillInvokerConfig = skillInvokerConfig;
        this._webSocketClient = webSocketClient;
        this.configureClientEvents();
        this.heartbeat = setInterval(() => {
            if (this._webSocketClient.readyState === 1) {
                this._webSocketClient.ping('heartbeat');
            }
        }, PING_FREQUENCY_IN_MILLISECONDS);
    }

    private configureClientEvents(): void {
        this._webSocketClient.onopen = (event) => {
            this.connectedEvent();
        };
        this._webSocketClient.onmessage = (event) => {
            this.messageEvent(event.data);
        };
        this._webSocketClient.onerror = (event) => {
            this.errorEvent(event);
        };
        this._webSocketClient.onclose = (event) => {
            this.closeEvent(event);
        };
    }

    public connectedEvent(): void {
        console.log('*****Starting Skill Debug Session*****', '\n');
        console.log('*****Session will last for 1 hour*****', '\n');
    }

    public messageEvent(data: WebSocket.Data): void {
        console.log('Skill request', '\n', JSON.stringify(JSON.parse(data.toString()), null, 2), '\n');
        const dynamicEndpointsRequest = getDynamicEndpointsRequest(data.toString());
        getSkillResponse(dynamicEndpointsRequest, this._skillInvokerConfig, (responseString) => {
            this.sendResponse(responseString);
        });
    }

    public sendResponse(responseString: string): void {
        this._webSocketClient.send(responseString);
    }

    public errorEvent(event: WebSocket.ErrorEvent): void {
        console.error('WebSocket error:', event.message);
    }

    public closeEvent(event: WebSocket.CloseEvent): void {
        console.log('WebSocket is closed:', event);
        clearInterval(this.heartbeat);
    }
}
