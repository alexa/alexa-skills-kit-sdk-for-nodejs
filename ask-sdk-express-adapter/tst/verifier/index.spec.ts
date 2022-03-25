import { RequestEnvelope } from 'ask-sdk-model';
import { expect, assert } from 'chai';
import * as fs from 'fs';
import { IncomingHttpHeaders } from 'http';
import * as nock from 'nock';
import { pki } from 'node-forge';
import * as sinon from 'sinon';
import * as url from 'url';
import { SkillRequestSignatureVerifier, TimestampVerifier, Verifier, REQUIRED_NODE_VERSION } from '../../lib/verifier';
import * as helper from '../../lib/verifier/helper';
import { createInvalidCert, DataProvider } from '../mocks/DataProvider';
import { gte } from "semver";
import crypto = require ('crypto');
import { camelCase, capitalize } from 'lodash';

describe('TimestampVerifier', () => {
    describe('Constructor', () => {
        it('should set tolerance to maximum when input tolerance is too large', () => {
            const consoleWarnSpy = sinon.stub(console, 'warn');
            const LARGE_TOLERANCE: number = 150001;
            const verifier: Verifier = new TimestampVerifier(LARGE_TOLERANCE);
            assert.ok(consoleWarnSpy.calledOnceWith(`ask-sdk-express-adapter TimestampVerifier: Provided tolerance value ${LARGE_TOLERANCE} exceeds the maximum allowed value 150000, Maximum value will be used instead.`));
            expect(verifier['toleranceInMillis']).equal(150000);
        });

        it('should throw error when tolerance is a negative number', () => {
            try {
                const verifier: Verifier = new TimestampVerifier(-1);
            } catch (err) {
                expect(err.name).equal('AskSdk.TimestampVerifier Error');
                expect(err.message).equal('Negative tolerance values not supported');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('happy path should set tolerance accordingly', () => {
            const GOOD_TOLERANCES: number[] = [149999, 75000, 0];
            const isToleranceSet = (currentValue: number) => {
                const verifier: Verifier = new TimestampVerifier(currentValue);
                expect(verifier['toleranceInMillis']).equal(currentValue);
            };
            GOOD_TOLERANCES.every(isToleranceSet);
        });
    });

    describe('async function verify', () => {
        const verifier: Verifier = new TimestampVerifier(1000);
        const requestEnvelope: RequestEnvelope = DataProvider.requestEnvelope();
        afterEach(() => {
            sinon.restore();
        });
        it('should throw error when TimeStamp is not present in request', async () => {
            try {
                await verifier.verify(JSON.stringify(requestEnvelope));
            } catch (err) {
                expect(err.name).equal('AskSdk.TimestampVerifier Error');
                expect(err.message).equal('Timestamp is not present in request');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should throw error when TimeStamp is not valid', async () => {
            requestEnvelope.request.timestamp = '2019-05-23T18:03:54Z';
            try {
                await verifier.verify(JSON.stringify(requestEnvelope));
            } catch (err) {
                expect(err.name).equal('AskSdk.TimestampVerifier Error');
                expect(err.message).equal('Timestamp verification failed');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should not throw error when TimeStamp is valid', async () => {
            requestEnvelope.request.timestamp = '2019-05-23T00:00:00Z';
            sinon.useFakeTimers(new Date('2019-05-23T00:00:00Z'));

            try {
                await verifier.verify(JSON.stringify(requestEnvelope));
            } catch (err) {
                expect.fail(`should not throw error${ err}`);
            }
        });

        it('should throw error when skill event outside tolerance', async () => {
            requestEnvelope.request.timestamp = '2019-05-23T00:00:00Z';
            requestEnvelope.request.type = 'AlexaSkillEvent.SkillEnabled';
            sinon.useFakeTimers(new Date('2019-05-23T01:00:01Z'));
            try {
                await verifier.verify(JSON.stringify(requestEnvelope));
            } catch (err) {
                expect(err.name).equal('AskSdk.TimestampVerifier Error');
                expect(err.message).equal('Timestamp verification failed');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should not throw error when skill event is outside normal tolerance but within skill event tolerance', async () => {
            requestEnvelope.request.timestamp = '2019-05-23T00:00:00Z';
            requestEnvelope.request.type = 'AlexaSkillEvent.SkillEnabled';
            sinon.useFakeTimers(new Date('2019-05-23T01:00:00Z'));
            try {
                await verifier.verify(JSON.stringify(requestEnvelope));
            } catch (err) {
                expect.fail(`should not throw error${ err}`);
            }
        });
    });
});

describe('SkillRequestSignatureVerifier', () => {
    const verifier: Verifier = new SkillRequestSignatureVerifier();
    const signatureKey: string = 'signature-256';
    const urlKey: string = 'signaturecertchainurl';
    const testUrl: string = 'https://s3.amazonaws.com/echo.api/echo-api-cert-4.pem';
    const certUrl = url.parse(testUrl);
    const mocksDir: string = `${__dirname }/../mocks/`;
    const validPem: string = fs.readFileSync(`${mocksDir}echo-api-cert-7.pem`).toString();
    const leafPem: string = validPem.slice(validPem.indexOf('-----BEGIN CERTIFICATE-----'), validPem.indexOf('-----END CERTIFICATE-----') + 25);
    const lastPem: string = validPem.slice(validPem.lastIndexOf('-----BEGIN CERTIFICATE-----'), validPem.lastIndexOf('-----END CERTIFICATE-----') + 25);
    const rsaSha256Key: string = fs.readFileSync(`${mocksDir}rsa_sha256`).toString();
    const rsaSha256PublicKey: string = fs.readFileSync(`${mocksDir}rsa_sha256_pub`).toString();
    const publicKeyBuffer: Buffer = Buffer.from(rsaSha256PublicKey, 'utf-8');
    const validRequestEnvelope: string = JSON.stringify(DataProvider.requestEnvelope());
    const signer: crypto.Sign = crypto.createSign('RSA-SHA256');
    signer.update(validRequestEnvelope);
    const validSignature256: string = signer.sign(rsaSha256Key, 'base64');
    const invalidSignature: string = 'TEST_INVALID_SIGNATURE';

    before(function() {
        if (!gte(process.version, REQUIRED_NODE_VERSION)) {
            // skip unit tests when node version is less than required
            this.skip();
        }
    });

    beforeEach(() => {
        sinon.useFakeTimers(new Date(2019, 9, 1));
    });

    afterEach(() => {
        sinon.restore();
        nock.cleanAll();
    });

    describe('async function verify', () => {
        it('should throw error when cert chain url is not present', async () => {
            const requestBody: RequestEnvelope = DataProvider.requestEnvelope();
            const requestHeader: IncomingHttpHeaders = DataProvider.requestHeader();
            requestHeader[signatureKey] = 'foo';
            try {
                await verifier.verify(JSON.stringify(requestBody), requestHeader);
            } catch (err) {
                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('Missing Certificate for the skill request');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should throw error when signature is not present', async () => {
            const requestBody: RequestEnvelope = DataProvider.requestEnvelope();
            const requestHeader: IncomingHttpHeaders = DataProvider.requestHeader();
            requestHeader[urlKey] = 'bar';
            try {
                await verifier.verify(JSON.stringify(requestBody), requestHeader);
            } catch (err) {
                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('Missing Signature for the skill request');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should throw error when an error is thrown during the process of verification', async () => {
            const requestBody: RequestEnvelope = DataProvider.requestEnvelope();
            const requestHeader: IncomingHttpHeaders = DataProvider.requestHeader();
            requestHeader[signatureKey] = validSignature256;
            requestHeader[urlKey] = testUrl;
            sinon.stub(verifier, '_validateUrlAndRetrieveCertChain' as any).callsFake(() => {
                throw new Error('unknownError');
            });
            try {
                await verifier.verify(JSON.stringify(requestBody), requestHeader);
            } catch (err) {
                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('unknownError');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should not throw error when everything is valid', async () => {
            const requestHeader: IncomingHttpHeaders = DataProvider.requestHeader();
            requestHeader[signatureKey] = validSignature256;
            requestHeader[urlKey] = testUrl;
            nock('https://s3.amazonaws.com').get(certUrl.path).reply(200, validPem);
            sinon.stub(verifier, '_validateRequestBody' as any);
            sinon.stub(helper, 'generateCAStore').returns(pki.createCaStore([lastPem]));
            try {
                await verifier.verify(validRequestEnvelope, requestHeader);
            } catch (err) {
                expect.fail('should not throw error');
            }
        });

        it('should not throw error when header keys are in CamelCasing', async () => {
            const requestHeader: IncomingHttpHeaders = DataProvider.requestHeader();
            requestHeader[capitalize(signatureKey)] = validSignature256;
            requestHeader[camelCase(urlKey)] = testUrl;
            nock('https://s3.amazonaws.com').get(certUrl.path).reply(200, validPem);
            sinon.stub(verifier, '_validateRequestBody' as any);
            try {
                await verifier.verify(validRequestEnvelope, requestHeader);
            } catch (err) {
                expect.fail('should not throw error');
            }
        });
    });

    describe('async function _validateUrlAndRetrieveCertChain', () => {
        const functionKey: string = '_validateUrlAndRetrieveCertChain';

        it('should throw error during process to get valid cert', async () => {
            const invalidUrl: string = 'http://abc.com';
            try {
                await verifier[functionKey](invalidUrl);
            } catch (err) {
                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('SignatureCertChainUrl contains an unsupported protocol http:. Expecting https:');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should return valid cert when url is valid', async () => {
            nock('https://s3.amazonaws.com').get(certUrl.path).reply(200, validPem);
            let permCert;
            try {
                permCert = await verifier[functionKey](testUrl);
            } catch (err) {
                expect.fail(`should not throw error${ err}`);
            }
            expect(permCert).equal(validPem);
        });
    });

    describe('function _validateCertificateUrl', () => {
        const functionKey: string = '_validateCertificateUrl';
        const validUrl: string = 'https://s3.amazonaws.com/echo.api/echo-api-cert.pem';
        const validUrlWithPort: string = 'https://s3.amazonaws.com:443/echo.api/echo-api-cert.pem';
        const validUrlWithDot: string = 'https://s3.amazonaws.com/echo.api/../echo.api/echo-api-cert.pem';
        const urlWithInvalidProtocol: string = 'http://s3.amazonaws.com/echo.api/echo-api-cert.pem';
        const urlWithInvalidHostName: string = 'https://notamazon.com/echo.api/echo-api-cert.pem';
        const urlWithInvalidPath: string = 'https://s3.amazonaws.com/EcHo.aPi/echo-api-cert.pem';
        const urlWithInvalidPort: string = 'https://s3.amazonaws.com:563/echo.api/echo-api-cert.pem';

        it ('should not throw error for valid url', () => {
            try {
                verifier[functionKey](validUrl);
            } catch (err) {
                expect.fail('Cannot pass valid url');
            }
        });

        it ('should not throw error for valid url with port', () => {
            try {
                verifier[functionKey](validUrlWithPort);
            } catch (err) {
                expect.fail('Cannot pass valid url with port');
            }
        });

        it ('should not throw error for valid url with dot', () => {
            try {
                verifier[functionKey](validUrlWithDot);
            } catch (err) {
                expect.fail('Cannot pass valid url with dot');
            }
        });

        it ('should throw error for url with invalid protocol', () => {
            try {
                verifier[functionKey](urlWithInvalidProtocol);
            } catch (err) {
                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('SignatureCertChainUrl contains an unsupported protocol http:.'
                + ' Expecting https:');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it ('should throw error for url with invalid protocol', () => {
            try {
                verifier[functionKey](urlWithInvalidHostName);
            } catch (err) {
                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('SignatureCertChainUrl has invalid host name: notamazon.com.'
                + ' Expecting s3.amazonaws.com');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it ('should throw error for url with invalid protocol', () => {
            try {
                verifier[functionKey](urlWithInvalidPath);
            } catch (err) {
                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal(`SignatureCertChainUrl has invalid path: /EcHo.aPi/echo-api-cert.pem.`
                + ' Expecting the path to start with /echo.api/');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it ('should throw error for url with invalid protocol', () => {
            try {
                verifier[functionKey](urlWithInvalidPort);
            } catch (err) {
                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('SignatureCertChainUrl has invalid port: 563.'
                + ' Expecting 443');

                return;
            }
            throw new Error('should have thrown an error!');
        });
    });

    describe('async function _loadCertChain', () => {
        const propertyKey: string = 'certCache';
        const functionKey: string = '_loadCertChain';
        const testData: string = 'TEST_DATA';

        it('should return certification when url is valid and not cached', async () => {
            nock('https://s3.amazonaws.com').get(certUrl.path).reply(200, validPem);
            try {
                const pemCert: pki.Certificate = await verifier[functionKey](testUrl);
                expect(pemCert).equal(validPem);
            } catch (err) {
                expect.fail('should not throw error');
            }
        });

        it('should throw error when catch error during the process of getting cert', async () => {
            sinon.stub(verifier, '_getCertChainByUrl' as any).callsFake(() => Promise.reject(new Error('unknownError')));
            try {
                await verifier[functionKey]('invalid url');
            } catch (err) {
                expect(err.message).equal('unknownError');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should return cert stored in map when cert url is same', async () => {
            verifier[propertyKey].set(testUrl, testData);
            expect(await verifier[functionKey](testUrl)).equal(testData);
        });
    });

    describe('async function _getCertChainByUrl', () => {
        const client = require('https');
        const functionKey: string = '_getCertChainByUrl';
        const errorStatusCode: number = 400;
        const responseBody: string = 'TEST_BODY';

        it('should throw error when the statusCode is not 200', async () => {
            nock('https://s3.amazonaws.com').get(certUrl.path).reply(400);
            try {
                await verifier[functionKey](testUrl);
            } catch (err) {
                expect(err.message).equal(`Unable to load x509 certificate from URL: ${testUrl}. Response status code: ${errorStatusCode}`);

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should throw error when there is no response', async () => {
            sinon.stub(client, 'get').callsArgWith(1, null);
            try {
                await verifier[functionKey](testUrl);
            } catch (err) {
                expect(err.message).equal(`Unable to load x509 certificate from URL: ${testUrl}. Response status code: 0`);

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should return data when response is valid', async () => {
            nock('https://s3.amazonaws.com').get(certUrl.path).reply(200, responseBody);
            let data = '';
            try {
                data = await verifier[functionKey](testUrl);
            } catch (err) {
                throw new Error('should not have error');
            }
            expect(data).equal(responseBody);
        });

        it('should throw error if server return error', async () => {
            nock('https://s3.amazonaws.com').get(certUrl.path).replyWithError('UnknownError');
            try {
                await verifier[functionKey](testUrl);
            } catch (err) {
                expect(err.message).equal('UnknownError');

                return;
            }
            throw new Error('should have thrown an error!');
        });
    });

    describe('function _validateCertChain', () => {
        const functionKey: string = '_validateCertChain';

        it('should throw error when cert expired', () => {
            sinon.useFakeTimers(new Date(2022, 2, 15));
            try {
                verifier[functionKey](validPem);
            } catch (err) {
                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('Signing Certificate expired or not started');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should throw error when cert is not active', () => {
            sinon.useFakeTimers(new Date(2014, 2, 15));

            try {
                verifier[functionKey](validPem);
            } catch (err) {
                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('Signing Certificate expired or not started');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should throw error when cert is not valid for echo sdk', () => {
            sinon.useFakeTimers(new Date(2017, 4, 7));
            const extension = {
                name: 'subjectAltName',
                altNames: [{
                    value: 'http://test.com',
                }],
            };

            try {
                const invalidCert: pki.Certificate = createInvalidCert([extension]);
                const invalidPemCert: string = pki.certificateToPem(invalidCert);
                verifier[functionKey](invalidPemCert);
            } catch (err) {
                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('echo-api.amazon.com domain missing in Signature Certificate Chain.');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should throw error when node version is less than 12.3.0', () => {
            sinon.stub(process, 'version').value('10.0.0');
            try {
                verifier[functionKey](validPem);
            } catch (err) {
                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('ask-sdk-express-adapter package require node version 12.3.0 or later, your current node version is 10.0.0. Please update your node version.');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should throw error when cert chain is not valid', () => {
            sinon.useFakeTimers(new Date(2019, 9, 1));
            try {

                verifier[functionKey](leafPem + lastPem);
            } catch (err) {

                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('Certificate signature is invalid.');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should throw error when certificate chain is not trusted against CA store', () => {
            sinon.useFakeTimers(new Date(2019, 9, 1));
            sinon.stub(helper, 'generateCAStore').returns(pki.createCaStore([leafPem]));
            try {

                verifier[functionKey](validPem);
            } catch (err) {

                expect(err.name).equal('AskSdk.SkillRequestSignatureVerifier Error');
                expect(err.message).equal('Certificate is not trusted.');

                return;
            }
            throw new Error('should have thrown an error!');
        });
    });

    describe('function _validateRequestBody', () => {
        const functionKey: string = '_validateRequestBody';
        it('should throw error when catch error during the process of validating body', () => {
            try {
                verifier[functionKey](publicKeyBuffer, invalidSignature, validRequestEnvelope);
            } catch (err) {
                expect(err.message).equal('request body and signature does not match');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should throw error when a different key is used', () => {
            try {
                verifier[functionKey](leafPem, validSignature256, validRequestEnvelope);
            } catch (err) {
                expect(err.message).equal('request body and signature does not match');

                return;
            }
            throw new Error('should have thrown an error!');
        });

        it('should not throw error when signature and body match', () => {
            try {
                verifier[functionKey](publicKeyBuffer, validSignature256, validRequestEnvelope);
            } catch (err) {
                expect.fail('should not throw error');
            }
        });
    });
});
