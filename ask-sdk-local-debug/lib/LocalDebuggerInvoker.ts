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

import WsClient from 'ws';
import { ClientConfigBuilder } from './builder/ClientConfigBuilder';
import { RemoteInvokerConfigBuilder } from './builder/RemoteInvokerConfigBuilder';
import { SkillInvokerConfigBuilder } from './builder/SkillInvokerConfigBuilder';
import { WebSocketClientConfigBuilder } from './builder/WebSocketClientConfigBuilder';
import { LocalDebugClient } from './client/LocalDebugClient';
import { RemoteInvokerConfig } from './config/RemoteInvokerConfig';
import { SkillInvokerConfig } from './config/SkillInvokerConfig';
import { argsParser, getHandlerFunction } from './util/ArgsParserUtils';

const { argv } = argsParser();

const clientConfig = new ClientConfigBuilder()
  .withAccessToken(argv.accessToken)
  .withHandlerName(argv.handlerName)
  .withSkillEntryFile(argv.skillEntryFile)
  .withSkillId(argv.skillId)
  .withRegion(argv.region)
  .withRemoteUrl(argv.remoteUrl)
  .build();

let skillInvokerConfig: SkillInvokerConfig;
let remoteInvokerConfig: RemoteInvokerConfig;

if (clientConfig.skillEntryFile !== '' && clientConfig.handlerName !== '') {
  skillInvokerConfig = new SkillInvokerConfigBuilder()
    .withHandler(getHandlerFunction(clientConfig.skillEntryFile, clientConfig.handlerName))
    .build();
} else if (clientConfig.remoteUrl !== '') {
  remoteInvokerConfig = new RemoteInvokerConfigBuilder()
    .withRemoteUrl(clientConfig.remoteUrl)
    .build();
}

const webSocketClientConfig = new WebSocketClientConfigBuilder()
  .withSkillId(clientConfig.skillId)
  .withAccessToken(clientConfig.accessToken)
  .withRegion(clientConfig.region)
  .build();

const webSocketClient = new WsClient(webSocketClientConfig.webSocketServerUri, {
  headers: webSocketClientConfig.headers,
});

const client = new LocalDebugClient(webSocketClient, skillInvokerConfig, remoteInvokerConfig);
