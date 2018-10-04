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

import { expect } from 'chai';
import { BodyTemplate1Builder } from '../../lib/templateBuilders/bodyTemplate1Builder';
import { ImageUtils } from '../../lib/utils/imageUtils';
import { TextUtils } from '../../lib/utils/textUtils';

describe('BodyTemplate1Builder', () => {
    it('should create BodyTemplate1', () => {
        const expectedBackButtonBehavior = 'VISIBLE';
        const expectedBgImage = ImageUtils.makeImage('url');
        const expectedPrimaryText = TextUtils.makePlainText('text');
        const expectedTitle = 'title';
        const expectedToken = 'token';

        const template = new BodyTemplate1Builder()
                                    .setBackButtonBehavior(expectedBackButtonBehavior)
                                    .setBackgroundImage(expectedBgImage)
                                    .setTextContent(expectedPrimaryText)
                                    .setTitle(expectedTitle)
                                    .setToken(expectedToken)
                                    .build();
        expect(template.type).to.equal('BodyTemplate1');
        expect(template.backButton).to.equal(expectedBackButtonBehavior);
        expect(template.backgroundImage).to.equal(expectedBgImage);
        expect(template.textContent.primaryText).to.equal(expectedPrimaryText);
        expect(template.token).to.equal(expectedToken);
        expect(template.title).to.equal(expectedTitle);
    });
});
