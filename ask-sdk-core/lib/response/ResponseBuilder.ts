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
    canfulfill,
    Directive,
    Intent,
    interfaces,
    Response,
} from 'ask-sdk-model';
import AudioItemMetadata = interfaces.audioplayer.AudioItemMetadata;
import CanFulfillIntent = canfulfill.CanFulfillIntent;

/**
 * An interface which helps building a response.
 */
export interface ResponseBuilder {
    /**
     * Has Alexa say the provided speech to the user
     * @param {string} speechOutput
     * @returns {ResponseBuilder}
     */
    speak(speechOutput : string) : this;
    /**
     * Has alexa listen for speech from the user. If the user doesn't respond within 8 seconds
     * then has alexa reprompt with the provided reprompt speech
     * @param {string} repromptSpeechOutput
     * @returns {ResponseBuilder}
     */
    reprompt(repromptSpeechOutput : string) : this;
    /**
     * Renders a simple card with the following title and content
     * @param {string} cardTitle
     * @param {string} cardContent
     * @returns {ResponseBuilder}
     */
    withSimpleCard(cardTitle : string, cardContent : string) : this;
    /**
     * Renders a standard card with the following title, content and image
     * @param {string} cardTitle
     * @param {string} cardContent
     * @param {string} smallImageUrl
     * @param {string} largeImageUrl
     * @returns {ResponseBuilder}
     */
    withStandardCard(cardTitle : string,
                     cardContent : string,
                     smallImageUrl? : string,
                     largeImageUrl? : string) : this;
    /**
     * Renders a link account card
     * @returns {ResponseBuilder}
     */
    withLinkAccountCard() : this;
    /**
     * Renders an askForPermissionsConsent card
     * @param {string[]} permissionArray
     * @returns {ResponseBuilder}
     */
    withAskForPermissionsConsentCard(permissionArray : string[]) : this;
    /**
     * Adds a Dialog delegate directive to response
     * @param {Intent} updatedIntent
     * @returns {ResponseBuilder}
     */
    addDelegateDirective(updatedIntent? : Intent) : this;
    /**
     * Adds a Dialog elicitSlot directive to response
     * @param {string} slotToElicit
     * @param {Intent} updatedIntent
     * @returns {ResponseBuilder}
     */
    addElicitSlotDirective(slotToElicit : string, updatedIntent? : Intent) : this;
    /**
     * Adds a Dialog confirmSlot directive to response
     * @param {string} slotToConfirm
     * @param {Intent} updatedIntent
     * @returns {ResponseBuilder}
     */
    addConfirmSlotDirective(slotToConfirm : string, updatedIntent? : Intent) : this;
    /**
     * Adds a Dialog confirmIntent directive to response
     * @param {Intent} updatedIntent
     * @returns {ResponseBuilder}
     */
    addConfirmIntentDirective(updatedIntent? : Intent) : this;
    /**
     * Adds an AudioPlayer play directive
     * @param {interfaces.audioplayer.PlayBehavior} playBehavior Describes playback behavior. Accepted values:
     * REPLACE_ALL: Immediately begin playback of the specified stream, and replace current and enqueued streams.
     * ENQUEUE: Add the specified stream to the end of the current queue.
     * This does not impact the currently playing stream.
     * REPLACE_ENQUEUED: Replace all streams in the queue. This does not impact the currently playing stream.
     * @param {string} url Identifies the location of audio content at a remote HTTPS location.
     * The audio file must be hosted at an Internet-accessible HTTPS endpoint.
     * HTTPS is required, and the domain hosting the files must present a valid, trusted SSL certificate.
     * Self-signed certificates cannot be used.
     * The supported formats for the audio file include AAC/MP4, MP3, HLS, PLS and M3U. Bitrates: 16kbps to 384 kbps.
     * @param {string} token A token that represents the audio stream. This token cannot exceed 1024 characters
     * @param {number} offsetInMilliseconds The timestamp in the stream from which Alexa should begin playback.
     * Set to 0 to start playing the stream from the beginning.
     * Set to any other value to start playback from that associated point in the stream
     * @param {string} expectedPreviousToken A token that represents the expected previous stream.
     * This property is required and allowed only when the playBehavior is ENQUEUE.
     * This is used to prevent potential race conditions if requests to progress
     * through a playlist and change tracks occur at the same time.
     * @param {interfaces.audioplayer.AudioItemMetadata} audioItemMetadata Metadata that can be displayed on screen enabled devices
     * @returns {ResponseBuilder}
     */
    addAudioPlayerPlayDirective(playBehavior : interfaces.audioplayer.PlayBehavior,
                                url : string,
                                token : string,
                                offsetInMilliseconds : number,
                                expectedPreviousToken? : string,
                                audioItemMetadata? : AudioItemMetadata) : this;
    /**
     * Adds an AudioPlayer Stop directive - Stops the current audio Playback
     * @returns {ResponseBuilder}
     */
    addAudioPlayerStopDirective() : this;
    /**
     * Adds an AudioPlayer ClearQueue directive - clear the queue without stopping the currently playing stream,
     * or clear the queue and stop any currently playing stream.
     *
     * @param {interfaces.audioplayer.ClearBehavior} clearBehavior Describes the clear queue behavior.
     * Accepted values:
     * CLEAR_ENQUEUED: clears the queue and continues to play the currently playing stream
     * CLEAR_ALL: clears the entire playback queue and stops the currently playing stream (if applicable).
     * @returns {ResponseBuilder}
     */
    addAudioPlayerClearQueueDirective(clearBehavior : interfaces.audioplayer.ClearBehavior) : this;
    /**
     * Adds a Display RenderTemplate Directive
     * @param {interfaces.display.Template} template
     * @returns {ResponseBuilder}
     */
    addRenderTemplateDirective(template : interfaces.display.Template) : this;
    /**
     * Adds a hint directive - show a hint on the screen of the echo show
     * @param {string} text plain text to show on the hint
     * @returns {ResponseBuilder}
     */
    addHintDirective(text : string) : this;
    /**
     * Adds a VideoApp play directive to play a video
     *
     * @param {string} source Identifies the location of video content at a remote HTTPS location.
     * The video file must be hosted at an Internet-accessible HTTPS endpoint.
     * @param {string} title (optional) title that can be displayed on VideoApp.
     * @param {string} subtitle (optional) subtitle that can be displayed on VideoApp.
     * @returns {ResponseBuilder}
     */
    addVideoAppLaunchDirective(source : string, title? : string, subtitle? : string) : this;
    /**
     * Adds canFulfillIntent to response.
     * @param {canfulfill.CanFulfillIntent} canFulfillIntent
     * @return {ResponseBuilder}
     */
    withCanFulfillIntent(canFulfillIntent : CanFulfillIntent) : this;
    /**
     * Sets shouldEndSession value to null/false/true
     * @param {boolean} val
     * @returns {ResponseBuilder}
     */
    withShouldEndSession(val : boolean) : this;
    /**
     * Helper method for adding directives to responses
     * @param {Directive} directive the directive send back to Alexa device
     * @returns {ResponseBuilder}
     */
    addDirective(directive : Directive) : this;
    /**
     * Returns the response object
     * @returns {Response}
     */
    getResponse() : Response;
}
