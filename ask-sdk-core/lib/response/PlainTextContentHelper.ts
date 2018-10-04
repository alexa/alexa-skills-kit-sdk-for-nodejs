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

import { interfaces } from 'ask-sdk-model';
import { TextContentHelper } from './TextContentHelper';
import TextContent = interfaces.display.TextContent;

/**
 * Responsible for building plain text content object using ask-sdk-model in Alexa skills kit display interface
 * https://developer.amazon.com/docs/custom-skills/display-interface-reference.html#textcontent-object-specifications.
 */
export class PlainTextContentHelper extends TextContentHelper {
    constructor() {
        super();
    }

    /**
     * @returns {interfaces.display.TextContent}
     */
    public getTextContent() : interfaces.display.TextContent {
        const textContent : TextContent = {};

        if (this.primaryText) {
            textContent.primaryText = {
                type : 'PlainText',
                text : this.primaryText,
            };
        }

        if (this.secondaryText) {
            textContent.secondaryText = {
                type : 'PlainText',
                text : this.secondaryText,
            };
        }

        if (this.tertiaryText) {
            textContent.tertiaryText = {
                type : 'PlainText',
                text : this.tertiaryText,
            };
        }

        return textContent;
    }
}
