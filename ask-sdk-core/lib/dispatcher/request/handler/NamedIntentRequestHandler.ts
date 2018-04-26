/*
 * Copyright (c) 2018. Taimos GmbH http://www.taimos.de
 */

'use strict';

import {Response} from 'ask-sdk-model';
import {HandlerInput} from './HandlerInput';
import {RequestHandler} from './RequestHandler';

export abstract class NamedIntentRequestHandler implements RequestHandler {

    private intentNames : string[];

    constructor(...intentNames : string[]) {
        this.intentNames = intentNames;
    }

    public canHandle(handlerInput : HandlerInput) : Promise<boolean> | boolean {
        if (handlerInput.requestEnvelope.request.type === 'IntentRequest') {
            return this.intentNames.indexOf(handlerInput.requestEnvelope.request.intent.name) >= 0;
        }

        return this.intentNames.indexOf(handlerInput.requestEnvelope.request.type) >= 0;
    }

    public abstract handle(handlerInput : HandlerInput) : Promise<Response> | Response;
}
