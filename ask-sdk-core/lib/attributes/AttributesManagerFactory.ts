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
import { createAskSdkError } from 'ask-sdk-runtime';
import { AttributesManager } from './AttributesManager';
import { PersistenceAdapter } from './persistence/PersistenceAdapter';

/**
 * Provider for attributes that can be stored on three levels: request, session and persistence.
 */
export class AttributesManagerFactory {
    public static init(options : {
        requestEnvelope : RequestEnvelope,
        persistenceAdapter? : PersistenceAdapter,
    }) : AttributesManager {
        if (!options.requestEnvelope) {
            throw createAskSdkError(
                'AttributesManagerFactory',
                'RequestEnvelope cannot be null or undefined!',
            );
        }

        let thisRequestAttributes : {[key : string] : any} = {};
        let thisSessionAttributes : {[key : string] : any} = options.requestEnvelope.session
                                                           ? options.requestEnvelope.session.attributes
                                                             ? JSON.parse(JSON.stringify(options.requestEnvelope.session.attributes))
                                                             : {}
                                                           : undefined;
        let thisPersistentAttributes : {[key : string] : any};
        let persistentAttributesSet = false;

        return {
            getRequestAttributes() : {[key : string] : any} {
                return thisRequestAttributes;
            },
            getSessionAttributes() : {[key : string] : any} {
                if (!options.requestEnvelope.session) {
                    throw createAskSdkError(
                        'AttributesManager',
                        'Cannot get SessionAttributes from out of session request!');
                }

                return thisSessionAttributes;
            },
            async getPersistentAttributes() : Promise<{[key : string] : any}> {
                if (!options.persistenceAdapter) {
                    throw createAskSdkError(
                        'AttributesManager',
                        'Cannot get PersistentAttributes without PersistenceManager');
                }

                if (!persistentAttributesSet) {
                    thisPersistentAttributes = await options.persistenceAdapter.getAttributes(options.requestEnvelope);
                    persistentAttributesSet = true;
                }

                return thisPersistentAttributes;
            },
            setRequestAttributes(requestAttributes : {[key : string] : any}) : void {
                thisRequestAttributes = requestAttributes;
            },
            setSessionAttributes(sessionAttributes : {[key : string] : any}) : void {
                if (!options.requestEnvelope.session) {
                    throw createAskSdkError(
                        'AttributesManager',
                        'Cannot set SessionAttributes to out of session request!');
                }

                thisSessionAttributes = sessionAttributes;
            },
            setPersistentAttributes(persistentAttributes : {[key : string] : any}) : void {
                if (!options.persistenceAdapter) {
                    throw createAskSdkError(
                        'AttributesManager',
                        'Cannot set PersistentAttributes without persistence adapter!');
                }

                thisPersistentAttributes = persistentAttributes;
                persistentAttributesSet = true;
            },
            async savePersistentAttributes() : Promise<void> {
                if (!options.persistenceAdapter) {
                    throw createAskSdkError(
                        'AttributesManager',
                        'Cannot save PersistentAttributes without persistence adapter!');
                }

                if (persistentAttributesSet) {
                    await options.persistenceAdapter.saveAttributes(options.requestEnvelope, thisPersistentAttributes);
                }
            },
        };
    }

    private constructor() {}
}
