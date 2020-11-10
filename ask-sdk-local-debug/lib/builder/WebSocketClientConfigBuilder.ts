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
import { WebSocketClientConfig } from '../config/WebSocketClientConfig';
import { RegionEndpointMapping } from '../constants/Constants';

export class WebSocketClientConfigBuilder {
  private _headers: {};

  private _skillId: string;

  private _region: string;

  public withSkillId(skillId: string): WebSocketClientConfigBuilder {
    this._skillId = skillId;

    return this;
  }

  public withRegion(region: string): WebSocketClientConfigBuilder {
    this._region = region;

    return this;
  }

  public withAccessToken(accessToken: string): WebSocketClientConfigBuilder {
    this._headers = { authorization: accessToken };

    return this;
  }

  public get webSocketServerUri(): string {
    console.log(`Region chosen: ${this._region}`);
    return `wss://${RegionEndpointMapping.get(
      this._region,
    )}/v1/skills/${
      this._skillId
    }/stages/development/connectCustomDebugEndpoint`;
  }

  public get headers(): {} {
    return this._headers;
  }

  public build(): WebSocketClientConfig {
    return new WebSocketClientConfig(this);
  }
}
