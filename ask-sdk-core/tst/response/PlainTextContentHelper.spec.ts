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
import { PlainTextContentHelper } from '../../lib/response/PlainTextContentHelper';

describe('PlainTextContentHelper', () => {
    let plainTextContentHelper : PlainTextContentHelper;
    beforeEach(() => {
        plainTextContentHelper = new PlainTextContentHelper();
    });

    it('should build richText content with provided parameters', () => {
        const primary = 'primaryText';
        const secondary = 'secondaryText';
        const tertiary = 'tertiaryText';
        const expectTextContent = {
            primaryText : {
                text : primary,
                type : 'PlainText',
            },
            secondaryText : {
                text : secondary,
                type : 'PlainText',
            },
            tertiaryText : {
                text : tertiary,
                type : 'PlainText',
            },
        };

        expect(plainTextContentHelper
            .withPrimaryText(primary)
            .withSecondaryText(secondary)
            .withTertiaryText(tertiary)
            .getTextContent())
        .to.deep.equals(expectTextContent);
    });

    it('should build richText content with primary text', () => {
        const primary = 'primaryText';
        const expectTextContent = {
            primaryText : {
                text : primary,
                type : 'PlainText',
            },
        };

        expect(plainTextContentHelper.withPrimaryText(primary).getTextContent())
        .to.deep.equals(expectTextContent);
    });

    it('should build richText content with optional text', () => {
        const secondary = 'secondaryText';
        const tertiary = 'tertiaryText';
        const expectTextContent = {
            secondaryText : {
                text : secondary,
                type : 'PlainText',
            },
            tertiaryText : {
                text : tertiary,
                type : 'PlainText',
            },
        };

        expect(plainTextContentHelper
            .withSecondaryText(secondary)
            .withTertiaryText(tertiary)
            .getTextContent())
        .to.deep.equals(expectTextContent);
    });
});
