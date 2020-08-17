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

import { RequestEnvelope, ResponseEnvelope } from 'ask-sdk-model';
import { IncomingHttpHeaders } from 'http';
import { pki } from 'node-forge';

export const DataProvider = {
    requestHeader(): IncomingHttpHeaders {
        return {
            'content-type': null,
            'signature': null,
            'signaturecertchainurl': null,
        };
    },
    requestEnvelope(): RequestEnvelope {
        return {
            context : {
                AudioPlayer : null,
                Display : null,
                System : {
                    apiAccessToken : null,
                    apiEndpoint : null,
                    application : {
                        applicationId : null,
                    },
                    device : {
                        deviceId : null,
                        supportedInterfaces : null,
                    },
                    user : {
                        userId : null,
                    },
                },
            },
            request: {
                type : null,
                timestamp : null,
                requestId : null,
            },
            session: {
                application: {
                    applicationId: null,
                },
                attributes: null,
                new: true,
                sessionId: null,
                user: {
                    accessToken: null,
                    permissions: {
                        consentToken: null,
                    },
                    userId: null,
                },
            },
            version: '1.0',
        };
    },
    responseEnvelope(): ResponseEnvelope {
        return {
            version: '1.0',
            response: {

            },
        };
    },
};

// eslint-disable-next-line @typescript-eslint/ban-types
export function createInvalidCert(extensions: object[]): pki.Certificate {
    const keys = pki.rsa.generateKeyPair(512);
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date(2017, 4, 6);
    cert.validity.notAfter = new Date(2017, 4, 8);
    const attrs = [];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions(extensions);
    // self-sign certificate
    cert.sign(keys.privateKey);

    return cert;
}
