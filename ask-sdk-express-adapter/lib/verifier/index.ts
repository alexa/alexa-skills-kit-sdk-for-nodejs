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

import { createAskSdkError, getRequestType } from 'ask-sdk-core';
import { RequestEnvelope } from 'ask-sdk-model';
import crypto = require ('crypto');
import { IncomingHttpHeaders } from 'http';
import * as client from 'https';
import { pki } from 'node-forge';
import * as url from 'url';
import { gte } from 'semver';

import { generateCAStore, generateCertificatesArray } from './helper';

/**
 * Provide constant value
 * For more info, check `link <https://developer.amazon.com/docs/custom-skills/host-a-custom-skill-as-a-web-service.html#checking-the-signature-of-the-request>
 */

export const REQUIRED_NODE_VERSION = "12.3.0";
const VALID_SIGNING_CERT_CHAIN_PROTOCOL: string = 'https:';
const VALID_SIGNING_CERT_CHAIN_URL_HOST_NAME: string = 's3.amazonaws.com';
const VALID_SIGNING_CERT_CHAIN_URL_PATH_PREFIX: string = '/echo.api/';
const SIGNATURE_CERT_CHAIN_URL_HEADER: string = 'SignatureCertChainUrl';
const SIGNATURE_HEADER: string = 'Signature-256';
const SIGNATURE_FORMAT: crypto.BinaryToTextEncoding = 'base64';
const CERT_CHAIN_URL_PORT: number = 443;
const CERT_CHAIN_DOMAIN = 'echo-api.amazon.com';
const CHARACTER_ENCODING = 'utf8';
const MAXIMUM_NORMAL_REQUEST_TOLERANCE_IN_MILLIS: number = 150000;
const MAXIMUM_SKILL_EVENT_TOLERANCE_IN_MILLIS: number = 3600000;
const ALEXA_SKILL_EVENT_LIST = new Set([
    'AlexaSkillEvent.SkillEnabled',
    'AlexaSkillEvent.SkillDisabled',
    'AlexaSkillEvent.SkillPermissionChanged',
    'AlexaSkillEvent.SkillPermissionAccepted',
    'AlexaSkillEvent.SkillAccountLinked'
]);

/**
 * Verifiers are run against incoming requests to verify authenticity and integrity of the request before processing
 * it.
 */
export interface Verifier {

    /**
     * Verifies an incoming request.
     *
     * @param {string} requestEnvelope The request body in string format
     * @param {IncomingHttpHeaders} headers The request headers
     */
    verify(requestEnvelope: string, headers? : IncomingHttpHeaders): Promise<void | string>;
}

/**
 * Implementation of Verifier which provides a utility method to verify the signature of a skill request.
 */
export class SkillRequestSignatureVerifier implements Verifier {
    protected certCache: Map<string, string>;
    constructor() {
        this.certCache = new Map<string, string>();
    }

    /**
     * Verifies the certificate authenticity.
     *
     * This verifier uses the crypto module pki functions to validate the signature chain in the input request.
     * The verification follows the mechanism explained here :
     * https://developer.amazon.com/docs/custom-skills/host-a-custom-skill-as-a-web-service.html#checking-the-signature-of-the-request
     * @param {string} requestEnvelope Request body of the input POST request in string format
     * @param {IncomingHttpHeaders} headers Headers of the input POST request
     */
    public async verify(requestEnvelope: string, headers: IncomingHttpHeaders): Promise<void> {
        // throw error if signature or signatureCertChainUrl are not present
        let signatureCertChainUrl: string;
        let signature: string;
        for (const key of Object.keys(headers)) {
            const keyInLowerCase = key.toLocaleLowerCase();
            if (keyInLowerCase === SIGNATURE_CERT_CHAIN_URL_HEADER.toLowerCase()) {
                signatureCertChainUrl = headers[key] as string;
            } else if (keyInLowerCase === SIGNATURE_HEADER.toLowerCase()) {
                signature = headers[key] as string;
            }
        }

        if (!signatureCertChainUrl) {
            throw createAskSdkError(
                this.constructor.name,
                'Missing Certificate for the skill request',
            );
        }
        if (!signature) {
            throw createAskSdkError(
                this.constructor.name,
                'Missing Signature for the skill request',
            );
        }
        try {
            // retrieve validated certification chain in pem format, then check if signature and request body are matched
            const pemCert: string = await this._validateUrlAndRetrieveCertChain(signatureCertChainUrl);
            this._validateRequestBody(pemCert, signature, requestEnvelope);
        } catch (err) {
            throw createAskSdkError(
                this.constructor.name,
                err.message,
            );
        }
    }

    /**
     *  Validate Url and retrieve certificate chain
     *
     *  This method validates if the URL is valid and loads
     *  the certificate chain, before returning it.
     * @private
     * @param {string} signatureCertChainUrl URL for retrieving certificate chain
     * @return {Promise<string>}
     */
    private async _validateUrlAndRetrieveCertChain(signatureCertChainUrl: string): Promise<string> {
        this._validateCertificateUrl(signatureCertChainUrl);
        const pemCert = await this._loadCertChain(signatureCertChainUrl);

        return pemCert;
    }

    /**
     * Validate the URL containing the certificate chain
     *
     * This method validates if the URL provided adheres to the format mentioned here :
     * https://developer.amazon.com/docs/custom-skills/host-a-custom-skill-as-a-web-service.html#cert-verify-signature-certificate-url
     * @private
     * @param {string} signatureCertChainUrl URL for retrieving certificate chain
     */
    private _validateCertificateUrl(signatureCertChainUrl: string): void {
        const urlObj = url.parse(signatureCertChainUrl);

        // Validate the protocol
        const protocol: string = urlObj.protocol;
        if (protocol.toLowerCase() !== VALID_SIGNING_CERT_CHAIN_PROTOCOL) {
            throw createAskSdkError(
                this.constructor.name,
                `SignatureCertChainUrl contains an unsupported protocol ${protocol}.`
                + ` Expecting ${VALID_SIGNING_CERT_CHAIN_PROTOCOL}`,
            );
        }

        // Validate the hostname
        const hostname: string = urlObj.hostname;
        if (hostname !== VALID_SIGNING_CERT_CHAIN_URL_HOST_NAME) {
            throw createAskSdkError(
                this.constructor.name,
                `SignatureCertChainUrl has invalid host name: ${hostname}.`
                + ` Expecting ${VALID_SIGNING_CERT_CHAIN_URL_HOST_NAME}`,
            );
        }

        // Validate the path prefix
        const path: string = urlObj.pathname;
        if (!path.startsWith(VALID_SIGNING_CERT_CHAIN_URL_PATH_PREFIX)) {
            throw createAskSdkError(
                this.constructor.name,
                `SignatureCertChainUrl has invalid path: ${path}.`
                + ` Expecting the path to start with ${VALID_SIGNING_CERT_CHAIN_URL_PATH_PREFIX}`,
            );
        }

        // Validate the port uses the default of 443 for HTTPS if explicitly defined in the URL
        const port: number = Number(urlObj.port);
        if (port && port !== CERT_CHAIN_URL_PORT) {
            throw createAskSdkError(
                this.constructor.name,
                `SignatureCertChainUrl has invalid port: ${port}.`
                + ` Expecting ${CERT_CHAIN_URL_PORT}`,
            );
        }
    }

    /**
     * Load certificate chain
     *
     * This method loads the certificate chain from the certificate
     * cache. If there is a cache miss, the certificate chain is
     * loaded from the certificate URL. If certificate chain is
     * loaded from URL, validate it before return.
     * @private
     * @param {string} signatureCertChainUrl URL for retrieving certificate chain
     * @return {Promise<string>}
     */
    private async _loadCertChain(signatureCertChainUrl: string): Promise<string> {
        // try to get cert chain in cache
        if (this.certCache.has(signatureCertChainUrl)) {
            return this.certCache.get(signatureCertChainUrl);
        }
        // if there is a cache miss, load cert chain from certificate Url
        const pemCert = await this._getCertChainByUrl(signatureCertChainUrl);

        // validate the cert chain loaded from url, if it is valid, update cache
        this._validateCertChain(pemCert);
        this.certCache.set(signatureCertChainUrl, pemCert);

        return pemCert;
    }

    /**
     * Loads the certificate chain from the URL.
     *
     * This method use the validated certificate url to retrieve certificate chain
     * @private
     * @param {string} signatureCertChainUrl URL for retrieving certificate chain
     * @return {Promise<string>}
     */
    private _getCertChainByUrl(signatureCertChainUrl: string): Promise<string> {

        return new Promise<string> ((resolve, reject) => {
            const clientRequest = client.get(signatureCertChainUrl, (resp) => {
                let data: string = '';
                let statusCode: number;

                if (!resp || resp.statusCode !== 200) {
                    statusCode = resp ? resp.statusCode : 0;
                    reject(new Error(`Unable to load x509 certificate from URL: ${signatureCertChainUrl}. Response status code: ${statusCode}`));
                }
                // A chunk of data has been received.
                resp.setEncoding(CHARACTER_ENCODING);
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                // The whole response has been received.
                resp.on('end', () => {
                    resolve(data);
                });
            });

            clientRequest.on('error', (err) => {
                reject(new Error(err.message));
            });

            clientRequest.end();
        });
    }

    /**
     * Validate certificate chain
     *
     * This method uses the crypto module pki functions to validate the signature chain
     * It checks if the passed in certificate chain is valid,
     * i.e it is not expired and the Alexa domain is present in the
     * SAN extensions of the certificate chain.
     * @private
     * @param {string} pemCert Certificate chain in pem format
     */
    private _validateCertChain(pemCert: string): void {
        const cert: pki.Certificate = pki.certificateFromPem(pemCert);

        // check the before/after dates on the certificate are still valid for the present time
        const now: number = new Date().getTime();
        const notAfter: number = new Date(cert.validity.notAfter).getTime();
        const notBefore: number = new Date(cert.validity.notBefore).getTime();

        if (!(now <= notAfter && now >= notBefore)) {
            throw createAskSdkError(
                this.constructor.name,
                'Signing Certificate expired or not started',
            );
        }

        // verify Echo API's hostname is specified as one of subject alternative names on the signing certificate
        const subjectAltNameExtension = cert.getExtension('subjectAltName');
        const keyName = 'altNames';
        const domainExist = (domain) => domain.value === CERT_CHAIN_DOMAIN;
        if (!subjectAltNameExtension[keyName].some(domainExist)) {
            throw createAskSdkError(
                this.constructor.name,
                `${CERT_CHAIN_DOMAIN} domain missing in Signature Certificate Chain.`,
            );
        }

        // check whether the node version is greater or equal to 12.3.0
        if (!gte(process.version, REQUIRED_NODE_VERSION)) {
            throw createAskSdkError(
                this.constructor.name,
                `ask-sdk-express-adapter package require node version ${REQUIRED_NODE_VERSION} or later, your current node version is ${process.version}. Please update your node version.`,
            );
        }

        const caStore: pki.CAStore = generateCAStore(require('tls').rootCertificates);
        const certChain: pki.Certificate[] = generateCertificatesArray(pemCert);
        // Use the pki.verifyCertificateChain function from Node-forge to
        // validate that all certificates in the chain combine to create a chain of trust to a trusted root CA certificate
        // TODO: Implement certificate revocation check which is missed in pki.verifyCertificateChain function
        try {
            pki.verifyCertificateChain(caStore, certChain);
        } catch (e) {
            throw createAskSdkError(
                this.constructor.name,
                e.message,
            );
        }

    }

    /**
     * Validate the request body hash with signature
     *
     * This method checks if the hash value of the request body
     * matches with the hash value of the signature
     * @param pemCert Certificate chain in pem format
     * @param signature Encrypted signature of the request
     * @param requestEnvelope Request body of the input POST request in string format
     */
    private _validateRequestBody(pemCert: string, signature: string, requestEnvelope: string): void {

        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(requestEnvelope, CHARACTER_ENCODING);

        if (!verifier.verify(pemCert, signature, SIGNATURE_FORMAT)) {
            throw new Error('request body and signature does not match');
        }
    }
}

/**
 * Implementation of Verifier which provides a utility method to handle
 * the request timestamp verification of the input request.
 */
export class TimestampVerifier implements Verifier {
    protected toleranceInMillis: number;
    constructor(tolerance: number = MAXIMUM_NORMAL_REQUEST_TOLERANCE_IN_MILLIS) {
        if (tolerance > MAXIMUM_NORMAL_REQUEST_TOLERANCE_IN_MILLIS) {
            console.warn(`ask-sdk-express-adapter TimestampVerifier: Provided tolerance value ${tolerance} exceeds the maximum allowed value ${MAXIMUM_NORMAL_REQUEST_TOLERANCE_IN_MILLIS}, Maximum value will be used instead.`);
            tolerance = MAXIMUM_NORMAL_REQUEST_TOLERANCE_IN_MILLIS;
        }
        if (tolerance < 0) {
            throw createAskSdkError(
                this.constructor.name,
                `Negative tolerance values not supported`,
            );
        }
        this.toleranceInMillis = tolerance;
    }
    /**
     * Verifies the certificate authenticity.
     *
     * The verify method retrieves the request timestamp and check if
     * it falls in the limit set by the tolerance, by checking with
     * the current timestamp. The verification follows the mechanism explained here :
     * https://developer.amazon.com/docs/custom-skills/host-a-custom-skill-as-a-web-service.html#checking-the-signature-of-the-request
     * @param {string} requestEnvelope Request envelope of the input POST request in string format
     * @return {Promise<void>}
     */
    public async verify(requestEnvelope: string): Promise<void> {
        const requestEnvelopeJson: RequestEnvelope = JSON.parse(requestEnvelope);
        if (!(requestEnvelopeJson.request && requestEnvelopeJson.request.timestamp)) {
            throw createAskSdkError(
                this.constructor.name,
                'Timestamp is not present in request',
            );
        }
        const requestTimeStamp = new Date(requestEnvelopeJson.request.timestamp);
        const localNow = new Date();
        if (requestTimeStamp.getTime() + this.toleranceInMillis < localNow.getTime()) {
            // If the request is a skill event, check whether the time delta exceed the maximum tolerance for skill event
            if (ALEXA_SKILL_EVENT_LIST.has(getRequestType(requestEnvelopeJson))
                && (requestTimeStamp.getTime() + MAXIMUM_SKILL_EVENT_TOLERANCE_IN_MILLIS >= localNow.getTime())
            ) {
                return;
            }
            throw createAskSdkError(
                this.constructor.name,
                'Timestamp verification failed',
            );
        }
    }
}
