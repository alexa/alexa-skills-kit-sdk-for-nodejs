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
import { PersistenceAdapter } from '../../../lib/attributes/persistence/PersistenceAdapter';

export class MockPersistenceAdapter implements PersistenceAdapter {
    public getCounter : number = 0;
    public saveCounter : number = 0;

    private partitionKey : string = 'userId';
    private savedAttributes : {[key : string] : any} = {
        key_1 : 'v1',
        key_2 : 'v2',
        state : 'mockState',
    };

    public async getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : any}> {
        this.getCounter++;

        const id = requestEnvelope.context.System.user.userId;

        if (id === this.partitionKey) {
            return this.savedAttributes;
        }

        throw new Error('Resource Not Found');
    }

    public async saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : any}) : Promise<void> {
        this.saveCounter ++;

        const id = requestEnvelope.context.System.user.userId;

        if (id === this.partitionKey) {
            this.savedAttributes = attributes;

            return;
        }

        throw new Error('Maximum Capacity Reached');
    }

    public async deleteAttributes(requestEnvelope : RequestEnvelope) : Promise<void> {
        const id = requestEnvelope.context.System.user.userId;

        if (id === this.partitionKey) {
            this.savedAttributes = {};
        }
    }

    public resetCounter() : void {
        this.getCounter = 0;
        this.saveCounter = 0;
    }
}
