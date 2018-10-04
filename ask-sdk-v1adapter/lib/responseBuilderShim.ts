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
    ResponseBuilder as ResponseHelper,
    ResponseFactory,
} from 'ask-sdk';
import {
    Directive,
    Intent,
    interfaces,
    ResponseEnvelope,
} from 'ask-sdk-model';
import { Adapter } from './adapter';

export class ResponseBuilder {

    public _responseObject : ResponseEnvelope;
    protected responseHelper : ResponseHelper;

    constructor(adapter : Adapter) {
        this._responseObject = adapter.response;
        this._responseObject.sessionAttributes = adapter._event.session.attributes;
        this.responseHelper = ResponseFactory.init().withShouldEndSession(true);
    }

    public speak(speechOutput : string) : this {
        this.responseHelper.speak(speechOutput);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public listen(repromptSpeechOutput : string) : this {
        this.responseHelper.reprompt(repromptSpeechOutput)
                            .withShouldEndSession(false);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public cardRenderer(cardTitle : string, cardContent : string, cardImage? : {[key : string] : string}) : this {
        if (cardImage && cardImage.smallImageUrl && cardImage.largeImageUrl) {
            this.responseHelper.withStandardCard(cardTitle, cardContent, cardImage.smallImageUrl, cardImage.largeImageUrl);
        } else if (cardImage && cardImage.smallImageUrl) {
            this.responseHelper.withStandardCard(cardTitle, cardContent, cardImage.smallImageUrl);
        } else if (cardImage && cardImage.largeImageUrl) {
            this.responseHelper.withStandardCard(cardTitle, cardContent, cardImage.largeImageUrl);
        } else {
            this.responseHelper.withSimpleCard(cardTitle, cardContent);
        }
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public linkAccountCard() : this {
        this.responseHelper.withLinkAccountCard();
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public askForPermissionsConsentCard(permissions : string[]) : this {
        this.responseHelper.withAskForPermissionsConsentCard(permissions);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public delegate(intent : Intent) : this {
        this.responseHelper.addDelegateDirective(intent)
                            .withShouldEndSession(false);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public elicitSlot(slotName : string, updatedIntent : Intent) : this {
        this.responseHelper.addElicitSlotDirective(slotName, updatedIntent)
                            .withShouldEndSession(false);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public confirmSlot(slotName : string, updatedIntent? : Intent) : this {
        this.responseHelper.addConfirmSlotDirective(slotName, updatedIntent)
                            .withShouldEndSession(false);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public confirmIntent(updatedIntent : Intent) : this {
        this.responseHelper.addConfirmIntentDirective(updatedIntent)
                            .withShouldEndSession(false);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public audioPlayerPlay(behavior : interfaces.audioplayer.PlayBehavior,  url : string,
                           audioToken : string, expectedPreviousToken : string,
                           offsetInMilliseconds : number) : this {
        this.responseHelper.addAudioPlayerPlayDirective(behavior, url, audioToken, offsetInMilliseconds, expectedPreviousToken);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public audioPlayerStop() : this {
        this.responseHelper.addAudioPlayerStopDirective();
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public audioPlayerClearQueue(clearBehavior : interfaces.audioplayer.ClearBehavior) : this {
        this.responseHelper.addAudioPlayerClearQueueDirective(clearBehavior);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public renderTemplate(template : interfaces.display.Template) : this {
        this.responseHelper.addRenderTemplateDirective(template);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public hint(hintText : string) : this {
        this.responseHelper.addHintDirective(hintText);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public playVideo(source : string, metadata? : {[key : string] : string}) : this {
        if (metadata) {
            this.responseHelper.addVideoAppLaunchDirective(source, metadata.title, metadata.subtitle);
        } else {
            this.responseHelper.addVideoAppLaunchDirective(source);
        }
        this.responseHelper.withShouldEndSession(undefined);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public shouldEndSession(val : boolean) : this {
        this.responseHelper.withShouldEndSession(val);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

    public _addDirective(directive : Directive) : this {
        this.responseHelper.addDirective(directive);
        this._responseObject.response = this.responseHelper.getResponse();

        return this;
    }

}
