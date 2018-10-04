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

import { ui } from 'ask-sdk-model';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { HandlerInput } from '../../lib/dispatcher/request/handler/HandlerInput';
import { SkillBuilders } from '../../lib/skill/SkillBuilders';
import { JsonProvider } from '../mocks/JsonProvider';
import { MockAlwaysFalseRequestHandler } from '../mocks/request/MockAlwaysFalseRequestHandler';
import { MockAlwaysTrueRequestHandler } from '../mocks/request/MockAlwaysTrueRequestHandler';

describe('CustomSkill', () => {
    it('should be able to send RequestEnvelope and context to RequestDispatcher', async() => {
        const skill = SkillBuilders.custom()
            .addRequestHandlers(
                new MockAlwaysTrueRequestHandler(),
                new MockAlwaysFalseRequestHandler(),
            )
            .create();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.session.attributes = {};

        const responseEnvelope = await skill.invoke(requestEnvelope);
        const packageInfo = require('../../package.json');

        expect(responseEnvelope.sessionAttributes).deep.equal({key : 'value'});
        expect((<ui.SsmlOutputSpeech> responseEnvelope.response.outputSpeech).ssml)
            .equal('<speak>Request received at MockAlwaysTrueRequestHandler.</speak>');
        expect(responseEnvelope.userAgent).equal(`ask-node/${packageInfo.version} Node/${process.version}`);
    });

    it('should be able to return a responseEnvelope with custom user agent', async() => {
        const skill = SkillBuilders.custom()
            .addRequestHandlers(
                new MockAlwaysTrueRequestHandler(),
                new MockAlwaysFalseRequestHandler(),
            )
            .withCustomUserAgent('custom user agent')
            .create();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.session.attributes = {};

        const responseEnvelope = await skill.invoke(requestEnvelope);
        const packageInfo = require('../../package.json');

        expect(responseEnvelope.userAgent).equal(`ask-node/${packageInfo.version} Node/${process.version}` + ' ' + 'custom user agent');
        expect(responseEnvelope.sessionAttributes).deep.equal({key : 'value'});
        expect((<ui.SsmlOutputSpeech> responseEnvelope.response.outputSpeech).ssml)
            .equal('<speak>Request received at MockAlwaysTrueRequestHandler.</speak>');
    });

    it('should ignore session attributes during out of session request', async() => {
        const skill = SkillBuilders.custom()
            .addRequestHandlers(
                new MockAlwaysTrueRequestHandler(),
                new MockAlwaysFalseRequestHandler(),
            )
            .withCustomUserAgent('custom user agent')
            .create();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.session = undefined;

        const responseEnvelope = await skill.invoke(requestEnvelope);

        expect(responseEnvelope.sessionAttributes).equal(undefined);
    });

    it('should populate the ServiceClientFactory when an apiClient is provided', () => {
        const handler = <any> new MockAlwaysTrueRequestHandler();
        sinon.spy(handler, 'handle');
        const fakeApiClient = <any> { };

        const skill = SkillBuilders.custom()
            .addRequestHandlers(handler)
            .withApiClient(fakeApiClient)
            .create();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.apiAccessToken = 'test-token';
        requestEnvelope.context.System.apiEndpoint = 'test.com';

        return skill.invoke(requestEnvelope)
            .then(() => {
                const input = <HandlerInput> handler.handle.getCall(0).args[0];
                const factory = <any> input.serviceClientFactory;

                expect(input.serviceClientFactory).to.not.equal(undefined);
                expect(factory.apiConfiguration.authorizationValue).equal('test-token');
                expect(factory.apiConfiguration.apiEndpoint).equal('test.com');
                expect(factory.apiConfiguration.apiClient).equal(fakeApiClient);
            });
    });

    it('should set ServiceClientFactory as undefined when the apiClient is missing', () => {
        const handler = <any> new MockAlwaysTrueRequestHandler();
        sinon.spy(handler, 'handle');

        const skill = SkillBuilders.custom()
            .addRequestHandlers(handler)
            .create();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.apiAccessToken = 'test-token';
        requestEnvelope.context.System.apiEndpoint = 'test.com';

        return skill.invoke(requestEnvelope)
            .then(() => {
                const input = <HandlerInput> handler.handle.getCall(0).args[0];
                expect(input.serviceClientFactory).equal(undefined);
            });
    });

    it('should valid skill id against RequestEnvelope if skill id is set', async() => {
        const skill = SkillBuilders.custom()
            .addRequestHandlers(
                new MockAlwaysTrueRequestHandler(),
                new MockAlwaysFalseRequestHandler(),
            )
            .withSkillId('testId')
            .create();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.application.applicationId = 'testId';

        const responseEnvelope = await skill.invoke(requestEnvelope);

        expect((<ui.SsmlOutputSpeech> responseEnvelope.response.outputSpeech).ssml)
            .equal('<speak>Request received at MockAlwaysTrueRequestHandler.</speak>');
    });

    it('should throw an error if skill id verification failed', async() => {
        const skill = SkillBuilders.custom()
            .addRequestHandlers(
                new MockAlwaysTrueRequestHandler(),
                new MockAlwaysFalseRequestHandler(),
            )
            .withSkillId('testId')
            .create();

        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.System.application.applicationId = 'wrongId';

        try {
            await skill.invoke(requestEnvelope);
        } catch (err) {
            expect(err.name).equal('AskSdk.CustomSkill Error');
            expect(err.message).equal('CustomSkill ID verification failed!');

            return;
        }

        throw new Error('Should have thrown an error!');
    });

    it('should be able to determine if request envelope is supported type', async() => {
        const skill = SkillBuilders.custom()
            .addRequestHandlers(
                new MockAlwaysTrueRequestHandler(),
                new MockAlwaysFalseRequestHandler(),
            )
            .create();

        const requestEnvelope = JsonProvider.requestEnvelope();

        expect(skill.supports(requestEnvelope)).eq(true);
        expect(skill.supports({} as any)).eq(false);
    });
});
