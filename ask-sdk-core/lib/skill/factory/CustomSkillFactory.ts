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
import { PersistenceAdapter } from '../../attributes/persistence/PersistenceAdapter';
import { CustomSkillConfiguration } from '../CustomSkillConfiguration';
import { BaseSkillFactory } from './BaseSkillFactory';
import { CustomSkillBuilder } from './CustomSkillBuilder';
import ApiClient = services.ApiClient;

/**
 * Provider for {@link CustomSkillBuilder}
 */
export class CustomSkillFactory {
    public static init() : CustomSkillBuilder {
        let thisPersistenceAdapter : PersistenceAdapter;
        let thisApiClient : ApiClient;

        const baseSkillBuilder = BaseSkillFactory.init();

        return {
            ...<CustomSkillBuilder> baseSkillBuilder,
            getSkillConfiguration() : CustomSkillConfiguration {
                const skillConfiguration = baseSkillBuilder.getSkillConfiguration();

                return {
                    ...skillConfiguration,
                    persistenceAdapter : thisPersistenceAdapter,
                    apiClient : thisApiClient,
                };
            },
            withPersistenceAdapter(persistenceAdapter : PersistenceAdapter) : CustomSkillBuilder {
                thisPersistenceAdapter = persistenceAdapter;

                return this;
            },
            withApiClient(apiClient : ApiClient) : CustomSkillBuilder {
                thisApiClient = apiClient;

                return this;
            },
        };
    }

    private constructor() {}
}
