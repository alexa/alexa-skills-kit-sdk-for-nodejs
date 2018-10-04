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

import { ResponseEnvelope } from 'ask-sdk-model';
import { expect } from 'chai';
import { Adapter } from '../lib/adapter';
import { ResponseBuilder } from '../lib/responseBuilderShim';
import { LaunchRequest } from './mock/mockSampleRequest';

const mockContext = {
    succeed : (responseEnvelope : ResponseEnvelope) => {
        // do something
    },
    fail : (error : Error) => {
        // do something
    },
};
const adapter = new Adapter(LaunchRequest, mockContext);
describe('ResponseBuilder Tests', () => {
    let responseBuilder;
    beforeEach(() => {
        responseBuilder = new ResponseBuilder(adapter);
    });

    it('should record speech on response object', () => {
        const expectedSpeech = 'hello world';
        const result = responseBuilder.speak(expectedSpeech);

        expect(result._responseObject.response.outputSpeech.ssml).to.contain(expectedSpeech);
        expect(result._responseObject.response.shouldEndSession).to.equal(true);
    });

    it('should not end session if asked to listen', () => {
        const expectedReprompt = 'my reprompt';
        const result = responseBuilder.listen(expectedReprompt);

        expect(result._responseObject.response.reprompt.outputSpeech.ssml).to.contain('my reprompt');
        expect(result._responseObject.response.shouldEndSession).to.equal(false);
    });

    it('should make a card', () => {
        const expectedTitle = 'my reprompt';
        const result = responseBuilder.cardRenderer(expectedTitle, '', {});

        expect(result._responseObject.response.card.title).to.contain(expectedTitle);
    });

    it('should make a link account card', () => {
        const result = responseBuilder.linkAccountCard();

        expect(result._responseObject.response.card.type).to.equal('LinkAccount');
    });

    it('should make a askForPermissionsConsent card', () => {
        const expectedPermission = ['read::alexa:device:all:address'];
        const result = responseBuilder.askForPermissionsConsentCard(expectedPermission);

        expect(result._responseObject.response.card.type).to.equal('AskForPermissionsConsent');
        expect(result._responseObject.response.card.permissions[0]).to.equal(expectedPermission[0]);
    });

    it('should create a delegate directive', () => {
        const result = responseBuilder.delegate({});

        expect(result._responseObject.response.directives.length).to.equal(1);
        expect(result._responseObject.response.directives[0].type).to.equal('Dialog.Delegate');
        expect(result._responseObject.response.shouldEndSession).to.equal(false);
    });

    it('should create a elicitSlot directive', () => {
        const result = responseBuilder.elicitSlot('', {});

        expect(result._responseObject.response.directives.length).to.equal(1);
        expect(result._responseObject.response.directives[0].type).to.equal('Dialog.ElicitSlot');
        expect(result._responseObject.response.shouldEndSession).to.equal(false);
    });

    it('should create a confirmSlot directive', () => {
        const result = responseBuilder.confirmSlot('', {});

        expect(result._responseObject.response.directives.length).to.equal(1);
        expect(result._responseObject.response.directives[0].type).to.equal('Dialog.ConfirmSlot');
        expect(result._responseObject.response.shouldEndSession).to.equal(false);
    });

    it('should create a confirmIntent directive', () => {
        const result = responseBuilder.confirmIntent({});

        expect(result._responseObject.response.directives.length).to.equal(1);
        expect(result._responseObject.response.directives[0].type).to.equal('Dialog.ConfirmIntent');
        expect(result._responseObject.response.shouldEndSession).to.equal(false);
    });

    it('should create audioPlayer directive on play', () => {
        const result = responseBuilder.audioPlayerPlay('', '', '', '', '');

        expect(result._responseObject.response.directives.length).to.equal(1);
        expect(result._responseObject.response.directives[0].type).to.equal('AudioPlayer.Play');
    });

    it('should create audioPlayer directive on stop', () => {
        const result = responseBuilder.audioPlayerStop();

        expect(result._responseObject.response.directives.length).to.equal(1);
        expect(result._responseObject.response.directives[0].type).to.equal('AudioPlayer.Stop');
    });

    it('should create audioPlayer directive on clearQueue', () => {
        const result = responseBuilder.audioPlayerClearQueue('');

        expect(result._responseObject.response.directives.length).to.equal(1);
        expect(result._responseObject.response.directives[0].type).to.equal('AudioPlayer.ClearQueue');
    });

    it('should create rendertemplate directive', () => {
        const result = responseBuilder.renderTemplate({});

        expect(result._responseObject.response.directives.length).to.equal(1);
        expect(result._responseObject.response.directives[0].type).to.equal('Display.RenderTemplate');
    });

    it('should add two directives in response', () => {
        const result = responseBuilder.renderTemplate({}).hint('hint text');

        expect(result._responseObject.response.directives.length).to.equal(2);
        expect(result._responseObject.response.directives[0].type).to.equal('Display.RenderTemplate');
        expect(result._responseObject.response.directives[1].type).to.equal('Hint');
    });

    it('should create hint directive', () => {
        const result = responseBuilder.hint('hint text');

        expect(result._responseObject.response.directives.length).to.equal(1);
        expect(result._responseObject.response.directives[0].type).to.equal('Hint');
        expect(result._responseObject.response.directives[0].hint.type).to.equal('PlainText');
    });

    it('should create videoapp directive', () => {
        const result = responseBuilder.playVideo('url');

        expect(result._responseObject.response.directives.length).to.equal(1);
        expect(result._responseObject.response.directives[0].type).to.equal('VideoApp.Launch');
    });

    it('should remove shouldEndSession when specifying videoApp directive', () => {
        const result = responseBuilder.playVideo('url');

        expect(result._responseObject.response.shouldEndSession).to.equal(undefined);
    });
});
