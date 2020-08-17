/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import { expect } from 'chai';
import { getValueFromHeader } from '../../lib/util/Util';

describe('getValueFromHeaderByKeyName', () => {
    const MockHeader = [
        {key:"content-type", value:"application/json"},
        {key:"content-length", value:"44"},
        {key:"connection", value:"close"},
        {key:"server", value:"Server1"},
        {key:"server", value:"Server2"},
        {key:"date", value:"Wed, 27 Nov 2019 00:33:32 GMT"},
        {key:"x-amzn-requestid", value:"fakeId"},
        {key:"x-amz-date", value:"Wed, 27 Nov 2019 00:33:32 GMT"},
        {key:"x-amz-rid", value:"T5XCCNVZEVJFYHZ6A648"},
        {key:"vary", value:"Accept-Encoding,X-Amzn-CDN-Cache,X-Amzn-AX-Treatment,User-Agent"},
        {key:"x-cache", value:"Miss from cloudfront"},
        {key:"via", value:"1.1 490c6b39f412c738a30c226f07db749c.cloudfront.net (CloudFront)"},
        {key:"x-amz-cf-pop", value:"HIO51-C1"},
        {key:"x-amz-cf-id", value:"rf53XdWct4udipVWarUytHSqb_ZXS8DA2byAOILCN5ESD65XEUcCvw=="}
    ];

    it('should be able to find value by valid key', () => {
        expect(getValueFromHeader(MockHeader, 'x-amzn-requestid')).deep.equal(['fakeId']);
    });

    it('should be able to find multiple value share the same key name', () => {
        expect(getValueFromHeader(MockHeader, 'server')).deep.equal(['Server1', 'Server2']);
    });

    it('should return null when key not exist in header', () => {
        expect(getValueFromHeader(MockHeader, 'notExistKey')).deep.equal([]);
    });

    it('should return empty array when header or key is null', () => {
        expect(getValueFromHeader(null, 'notExistKey')).deep.equal([]);
        expect(getValueFromHeader(MockHeader, null)).deep.equal([]);
    });
});
