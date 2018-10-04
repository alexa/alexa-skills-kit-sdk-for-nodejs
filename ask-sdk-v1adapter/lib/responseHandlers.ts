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

import { DynamoDbPersistenceAdapter } from 'ask-sdk';
import { Intent } from 'ask-sdk-model';
import { V1Handler } from './v1Handler';

let dynamoDbPersistenceAdapter : DynamoDbPersistenceAdapter;

/* tslint:disable */
export const ResponseHandlers : V1Handler = {
    ':tell'(speechOutput : string) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },

    ':ask'(speechOutput : string, repromptSpeech : string) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput).listen(repromptSpeech);
        this.emit(':responseReady');
    },

    ':askWithCard'(speechOutput : string, repromptSpeech : string, cardTitle : string, cardContent : string,
                   imageObj : {[key : string] : string}) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput)
                    .listen(repromptSpeech)
                    .cardRenderer(cardTitle, cardContent, imageObj);
        this.emit(':responseReady');
    },

    ':tellWithCard'(speechOutput : string, cardTitle : string, cardContent : string, imageObj : {[key : string] : string}) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput)
                    .cardRenderer(cardTitle, cardContent, imageObj);
        this.emit(':responseReady');
    },

    ':tellWithLinkAccountCard'(speechOutput : string) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput)
                    .linkAccountCard();
        this.emit(':responseReady');
    },

    ':askWithLinkAccountCard'(speechOutput : string, repromptSpeech : string) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput)
                    .listen(repromptSpeech)
                    .linkAccountCard();
        this.emit(':responseReady');
    },

    ':askWithPermissionCard'(speechOutput : string, repromptSpeech : string, permissions : string[]) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput)
                    .listen(repromptSpeech)
                    .askForPermissionsConsentCard(permissions);
        this.emit(':responseReady');
    },

    ':tellWithPermissionCard'(speechOutput : string, permissions : string[]) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput)
                    .askForPermissionsConsentCard(permissions);
        this.emit(':responseReady');
    },

    ':delegate'(updatedIntent : Intent) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.delegate(updatedIntent);
        this.emit(':responseReady');
    },

    ':elicitSlot'(slotName : string, speechOutput : string, repromptSpeech : string, updatedIntent : Intent) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput)
                    .listen(repromptSpeech)
                    .elicitSlot(slotName, updatedIntent);
        this.emit(':responseReady');
    },

    ':elicitSlotWithCard'(slotName : string, speechOutput : string, repromptSpeech : string, cardTitle : string, cardContent : string,
                          updatedIntent : Intent, imageObj : {[key : string] : string}) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput)
                    .listen(repromptSpeech)
                    .cardRenderer(cardTitle, cardContent, imageObj)
                    .elicitSlot(slotName, updatedIntent);
        this.emit(':responseReady');
    },

    ':confirmSlot'(slotName : string, speechOutput : string, repromptSpeech : string, updatedIntent : Intent) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput)
                    .listen(repromptSpeech)
                    .confirmSlot(slotName, updatedIntent);
        this.emit(':responseReady');
    },

    ':confirmSlotWithCard'(slotName : string, speechOutput : string, repromptSpeech : string, cardTitle : string, cardContent : string,
                           updatedIntent : Intent, imageObj : {[key : string] : string}) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput)
                    .listen(repromptSpeech)
                    .cardRenderer(cardTitle, cardContent, imageObj)
                    .confirmSlot(slotName, updatedIntent);
        this.emit(':responseReady');
    },

    ':confirmIntent'(speechOutput : string, repromptSpeech : string, updatedIntent : Intent) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput)
                    .listen(repromptSpeech)
                    .confirmIntent(updatedIntent);
        this.emit(':responseReady');
    },

    ':confirmIntentWithCard'(speechOutput : string, repromptSpeech : string, cardTitle : string, cardContent : string,
                             updatedIntent : Intent, imageObj : {[key : string] : string}) : void {
        if (this.isOverridden()) {
            return;
        }
        this.response.speak(speechOutput)
                    .listen(repromptSpeech)
                    .cardRenderer(cardTitle, cardContent, imageObj)
                    .confirmIntent(updatedIntent);
        this.emit(':responseReady');
    },

    ':responseReady'() : void {
        if (this.isOverridden()) {
            return;
        }
        if (this.handler.state) {
            this.handler.response.sessionAttributes.STATE = this.handler.state;
        }

        if (this.handler.dynamoDBTableName) {
            return this.emit(':saveState');
        }

        this.handler.promiseResolve(this.handler.response.response);
    },

    ':saveState'(forceSave : boolean) : void {
        if (this.isOverridden()) {
            return;
        }
        if (forceSave && this.handler.state) {
            this.attributes.STATE = this.handler.state;
        }
        const response = this.handler.response.response;

        if (response.shouldEndSession || forceSave || this.handler.saveBeforeResponse) {
            if (!dynamoDbPersistenceAdapter) {
                dynamoDbPersistenceAdapter = new DynamoDbPersistenceAdapter({
                    createTable : true,
                    dynamoDBClient : this.handler.dynamoDBClient,
                    partitionKeyName : 'userId',
                    attributesName : 'mapAttr',
                    tableName : this.handler.dynamoDBTableName,
                });
            }

            dynamoDbPersistenceAdapter.saveAttributes(this.event, this.attributes).then(() => {
                this.handler.promiseResolve(response);
                }).catch((error) => {
                    if (error) {
                        return this.emit(':saveStateError', error);
                    }
                });
        } else {
            this.handler.promiseResolve(response);
        }
    },

    ':saveStateError'(error : Error) : void {
        if (this.isOverridden()) {
            return;
        }

        console.log(`Error saving state: ${error}\n${error.stack}`);
        if (typeof this.callback === 'undefined') {
            this.context.fail(error);
        } else {
            this.callback(error);
        }
    },
};
