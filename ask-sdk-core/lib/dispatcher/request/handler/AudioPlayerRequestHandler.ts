/*
 * Copyright (c) 2018. Taimos GmbH http://www.taimos.de
 */

'use strict';

import {Response} from 'ask-sdk-model';
import {createAskSdkError} from '../../../util/AskSdkUtils';
import {HandlerInput} from './HandlerInput';
import {NamedIntentRequestHandler} from './NamedIntentRequestHandler';

export abstract class AudioPlayerRequestHandler extends NamedIntentRequestHandler {

    constructor() {
        super('AudioPlayer.PlaybackStarted', 'AudioPlayer.PlaybackFinished', 'AudioPlayer.PlaybackStopped', 'AudioPlayer.PlaybackNearlyFinished', 'AudioPlayer.PlaybackFailed');
    }

    public handle(handlerInput : HandlerInput) : Promise<Response> | Response {
        if (handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted') {
            return this.handlePlaybackStarted(handlerInput);
        }
        if (handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackFinished') {
            return this.handlePlaybackFinished(handlerInput);
        }
        if (handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped') {
            return this.handlePlaybackStopped(handlerInput);
        }
        if (handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackNearlyFinished') {
            return this.handlePlaybackNearlyFinished(handlerInput);
        }
        if (handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackFailed') {
            return this.handlePlaybackFailed(handlerInput);
        }
        throw createAskSdkError(
          'AudioPlayerRequestHandler',
          `Got request I cannot handle: ${JSON.stringify(handlerInput.requestEnvelope.request, null, 2)}`);
    }

    public abstract handlePlaybackStarted(handlerInput : HandlerInput) : Promise<Response> | Response;

    public abstract handlePlaybackFinished(handlerInput : HandlerInput) : Promise<Response> | Response;

    public abstract handlePlaybackStopped(handlerInput : HandlerInput) : Promise<Response> | Response;

    public abstract handlePlaybackNearlyFinished(handlerInput : HandlerInput) : Promise<Response> | Response;

    public abstract handlePlaybackFailed(handlerInput : HandlerInput) : Promise<Response> | Response;

}
