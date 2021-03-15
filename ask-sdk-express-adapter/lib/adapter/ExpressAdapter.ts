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

import { createAskSdkError, Skill } from 'ask-sdk-core';
import { ResponseEnvelope } from 'ask-sdk-model';
import { text } from 'body-parser';
import { RequestHandler } from 'express';
import { asyncVerifyRequestAndDispatch } from '../util';
import { SkillRequestSignatureVerifier, TimestampVerifier, Verifier } from '../verifier';

/**
 * Express adapter class
 */
export class ExpressAdapter {
    protected skill: Skill;
    protected verifiers: Verifier[];

    /**
     * Constructor
     *
     * @param {Skill} skill ask-sdk-core custom skill instance
     * @param {boolean} verifySignature boolean flag decide if certificate signature verifier is needed
     * @param {boolean} verifyTimeStamp boolean flag decide if timestamp verifier is needed
     * @param {Verifier[]} verifiers Array of user customized Verifier instances
     */
    constructor(skill: Skill, verifySignature: boolean = true,
                verifyTimeStamp: boolean = true, verifiers: Verifier[] = []) {
        this.skill = skill;
        this.verifiers = verifiers;
        if (!this.skill) {
            throw createAskSdkError(
                this.constructor.name,
                'The input skill cannot be empty',
            );
        }
        skill.appendAdditionalUserAgent('ask-express-adapter');
        if (verifySignature) {
            verifiers.push(new SkillRequestSignatureVerifier());
        }
        if (verifyTimeStamp) {
            verifiers.push(new TimestampVerifier());
        }
    }

    /**
     * Get pre-defined request handlers
     *
     * This function return an array of pre-defined request handlers
     * which are supposed to be registered on users' express application, including:
     * 1: text parser 2: async function to get response envelope after verification, then send result back
     * Example usage: app.post('/', new ExpressAdapter(skill).getASKRequestHandler());
     */
    public getRequestHandlers(): RequestHandler[] {
        const requestHandlers: RequestHandler[] = [];
        requestHandlers.push(
            (req, res, next) => {
                if (req.body) {
                    res.statusCode = 500;
                    res.send('Error in processing request. Do not register any parsers before using the adapter');

                    return;
                }
                next();
            },
        );
        requestHandlers.push(text({
            type: '*/*',
        }));
        requestHandlers.push(
            async (req, res) => {
                try {
                    const responseEnvelope: ResponseEnvelope = await asyncVerifyRequestAndDispatch(req.headers, req.body, this.skill, this.verifiers);
                    res.json(responseEnvelope);
                } catch (err) {
                    res.statusCode = err.name === 'AskSdk.Request verification failed Error' ? 400 : 500;
                    res.send(`${err.name}, ${err.message}`);
                }
            },
        );

        return requestHandlers;
    }

}
