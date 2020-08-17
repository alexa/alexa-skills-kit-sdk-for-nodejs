import { createAskSdkError, Skill, SkillBuilders } from 'ask-sdk-core';
import { ResponseEnvelope } from 'ask-sdk-model';
import { expect } from 'chai';
import * as express from 'express';
import * as sinon from 'sinon';
import * as request from 'supertest';
import { ExpressAdapter } from '../../lib/adapter/ExpressAdapter';
import * as util from '../../lib/util';
import { SkillRequestSignatureVerifier, TimestampVerifier, Verifier } from '../../lib/verifier';
import { DataProvider } from '../mocks/DataProvider';

describe('ExpressAdapter tests', () => {
    const skill: Skill = SkillBuilders.custom().create();

    describe('constructor', () => {
        it('should throw error when input skill is not a valid custom skill instance', () => {
            const invalidSkill = null;
            try {
                const adapter: ExpressAdapter = new ExpressAdapter(invalidSkill);
            } catch (err) {
                expect(err.name).equal('AskSdk.ExpressAdapter Error');
                expect(err.message).equal('The input skill cannot be empty');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should not have any verifier when verifySignature and verifyTimeStamp are set to false', () => {
            try {
                const verifiers: Verifier[] = [];
                const adapter: ExpressAdapter = new ExpressAdapter(skill, false, false, verifiers);
                const propertyKey: string = 'verifiers';
                expect(adapter[propertyKey]).deep.equal([]);
            } catch (err) {
                expect.fail('should not throw error');
            }
        });

        it('should by default add SkillRequestSignatureVerifier and TimestampVerifier', () => {
            try {
                const adapter: ExpressAdapter = new ExpressAdapter(skill);
                const fakeTimeStampVerifier = new TimestampVerifier();
                const fakeSignatureVerifier = new SkillRequestSignatureVerifier();
                const expectedVerifiers: Verifier[] = [fakeSignatureVerifier, fakeTimeStampVerifier];
                const propertyKey: string = 'verifiers';
                expect(adapter[propertyKey]).deep.equal(expectedVerifiers);
            } catch (err) {
                expect.fail('should not throw error');
            }
        });
    });

    describe('function getASKRequestHandlers', () => {

        afterEach(() => {
            sinon.restore();
        });

        it('should return 400 when error is verification error', (done) => {
            const adapter: ExpressAdapter = new ExpressAdapter(skill);
            const app: express.Application = express();
            app.post('/', adapter.getRequestHandlers());
            sinon.stub(util, 'asyncVerifyRequestAndDispatch').callsFake(() => {
                throw createAskSdkError('Request verification failed', 'unknownError');
            });
            // skip printing error message in console
            sinon.stub(console, 'error');
            void request(app)
                .post('/')
                .expect('Content-Type', 'text/html; charset=utf-8')
                .expect(400, done);
        });

        it('should return 500 when error is thrown from request dispatch', (done) => {
            const adapter: ExpressAdapter = new ExpressAdapter(skill);
            const app: express.Application = express();
            app.post('/', adapter.getRequestHandlers());
            sinon.stub(util, 'asyncVerifyRequestAndDispatch').callsFake(() => {
                throw createAskSdkError('Skill dispatch failed', 'unknownError');
            });
            // skip printing error message in console
            sinon.stub(console, 'error');
            void request(app)
                .post('/')
                .expect('Content-Type', 'text/html; charset=utf-8')
                .expect(500, done);
        });

        it('should return valid responseEnvelope when skill is invoked correctly', (done) => {
            const adapter: ExpressAdapter = new ExpressAdapter(skill);
            const app: express.Application = express();
            const responseEnvelope: ResponseEnvelope = DataProvider.responseEnvelope();
            app.post('/', adapter.getRequestHandlers());
            sinon.stub(util, 'asyncVerifyRequestAndDispatch').callsFake(() => Promise.resolve(responseEnvelope));
            void request(app)
                .post('/')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(responseEnvelope)
                .expect(200, done);
        });

        it('should show error when request already parsed', (done) => {
            const adapter: ExpressAdapter = new ExpressAdapter(skill);
            const app: express.Application = express();
            const responseEnvelope: ResponseEnvelope = DataProvider.responseEnvelope();
            app.use(express.json());
            app.post('/', adapter.getRequestHandlers());
            sinon.stub(util, 'asyncVerifyRequestAndDispatch').callsFake(() => Promise.resolve(responseEnvelope));
            void request(app)
                .post('/')
                .expect('Error in processing request. Do not register any parsers before using the adapter')
                .expect(500, done);
        });
    });
});
