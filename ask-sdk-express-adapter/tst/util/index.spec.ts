import { Skill, SkillBuilders } from 'ask-sdk-core';
import { RequestEnvelope, ResponseEnvelope } from 'ask-sdk-model';
import { expect } from 'chai';
import { IncomingHttpHeaders } from 'http';
import * as sinon from 'sinon';
import { asyncVerifyRequestAndDispatch } from '../../lib/util';
import { TimestampVerifier, Verifier } from '../../lib/verifier';
import { DataProvider } from '../mocks/DataProvider';

describe('util test', () => {
    describe('async function asyncVerifyRequestAndDispatch', () => {
        const httpHeaders: IncomingHttpHeaders = DataProvider.requestHeader();
        const requestBody: RequestEnvelope = DataProvider.requestEnvelope();
        const skill: Skill = SkillBuilders.custom().create();

        afterEach(() => {
            sinon.restore();
        });

        it('should throw verification failed error when any verifier throw error', async () => {
            sinon.stub(TimestampVerifier.prototype, 'verify').throws(new Error('unknownError'));
            try {
                await asyncVerifyRequestAndDispatch(httpHeaders, JSON.stringify(requestBody), skill, [new TimestampVerifier()]);
            } catch (err) {
                expect(err.name).equal('AskSdk.Request verification failed Error');
                expect(err.message).equal('unknownError');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should throw skill dispatch failed error when request dispatch fail', async () => {
            sinon.stub(skill, 'invoke').throws(new Error('unknownError'));
            try {
                await asyncVerifyRequestAndDispatch(httpHeaders, JSON.stringify(requestBody), skill, []);
            } catch (err) {
                expect(err.name).equal('AskSdk.Skill dispatch failed Error');
                expect(err.message).equal('unknownError');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should return responseEnvelope when verify and invoke execute correctly', async () => {
            const fakeResponse: ResponseEnvelope = DataProvider.responseEnvelope();
            const verifiers: Verifier[] = [];
            verifiers.push(new TimestampVerifier());
            sinon.stub(skill, 'invoke').resolves(fakeResponse);
            sinon.stub(TimestampVerifier.prototype, 'verify');
            let response: ResponseEnvelope;
            try {
                response = await asyncVerifyRequestAndDispatch(httpHeaders, JSON.stringify(requestBody), skill, verifiers);
            } catch (err) {
                expect.fail('should not throw error');
            }
            expect(response).deep.equal(fakeResponse);
        });
    });
});
