/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { v1 } from 'ask-smapi-model';
import Intent = v1.skill.interactionModel.Intent;

/**
 * Abstract base class for the "Control Intents"
 */
export abstract class BaseControlIntent {

    /**
     * Name of the intent as it will appear in the interaction model.
     *
     * Default: the class name.
     */
    name: string = this.constructor.name;


    /**
     * Generate a complete Intent object.
     */
    abstract generateIntent(): Intent;
}

