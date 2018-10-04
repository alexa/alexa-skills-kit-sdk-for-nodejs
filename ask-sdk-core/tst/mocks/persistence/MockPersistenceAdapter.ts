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

    public getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : any}> {
        this.getCounter++;

        const id = requestEnvelope.context.System.user.userId;

        return new Promise<{[key : string] : any}>((resolve, reject) => {
            if (id === this.partitionKey) {
                resolve(this.savedAttributes);
            } else {
                reject(new Error('Resource Not Found'));
            }
        });
    }

    public saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : any}) : Promise<void> {
        this.saveCounter ++;

        const id = requestEnvelope.context.System.user.userId;

        return new Promise<void>((resolve, reject) => {
            // Enforce the mock DB to only have one entry capacity
            if (id === this.partitionKey) {
                this.savedAttributes = attributes;
                resolve();
            } else {
                reject(new Error('Maximum Capacity Reached'));
            }
        });
    }

    public resetCounter() : void {
        this.getCounter = 0;
        this.saveCounter = 0;
    }
}
