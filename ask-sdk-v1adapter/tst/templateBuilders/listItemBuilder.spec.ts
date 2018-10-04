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
import { ListItemBuilder } from '../../lib/templateBuilders/listItemBuilder';
import { ImageUtils } from '../../lib/utils/imageUtils';
import { TextUtils } from '../../lib/utils/textUtils';

describe('ListItemBuilder', () => {
    it('should initialize with 0 list items', () => {
        const listItems = new ListItemBuilder().build();

        expect(listItems.length).to.equal(0);
    });

    it('should build with a single list item', () => {
        const expectedImage = ImageUtils.makeImage('url');
        const expectedToken = 'token';
        const expectedPrimaryText = TextUtils.makePlainText('text');

        const listItems = new ListItemBuilder()
                                .addItem(expectedImage, expectedToken, expectedPrimaryText)
                                .build();

        expect(listItems.length).to.equal(1);
        expect(listItems[0].image).to.equal(expectedImage);
        expect(listItems[0].token).to.equal(expectedToken);
        expect(listItems[0].textContent.primaryText).to.equal(expectedPrimaryText);

    });

    it('should build with multiple list items', () => {
        const expectedImage = ImageUtils.makeImage('url');
        const expectedToken = 'token';
        const expectedPrimaryText = TextUtils.makePlainText('text');

        const listItems = new ListItemBuilder()
                                .addItem(expectedImage, expectedToken, expectedPrimaryText)
                                .addItem(expectedImage, expectedToken, expectedPrimaryText)
                                .build();

        expect(listItems.length).to.equal(2);
    });
});
