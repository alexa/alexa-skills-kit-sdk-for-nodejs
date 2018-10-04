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
import TextContent = interfaces.display.TextContent;

/**
 * An abstract class responsible for building text content object using ask-sdk-model in Alexa skills kit display interface
 * https://developer.amazon.com/docs/custom-skills/display-interface-reference.html#textcontent-object-specifications.
 */
export abstract class TextContentHelper {
    protected primaryText : string;
    protected secondaryText : string;
    protected tertiaryText : string;

    /**
     * @param {string} primaryText
     * @returns {this}
     */
    public withPrimaryText(primaryText : string) : this {
        this.primaryText = primaryText;

        return this;
    }

    /**
     * @param {string} secondaryText
     * @returns {this}
     */
    public withSecondaryText(secondaryText : string) : this {
        this.secondaryText = secondaryText;

        return this;
    }

    /**
     * @param {string} tertiaryText
     * @returns {this}
     */
    public withTertiaryText(tertiaryText : string) : this {
        this.tertiaryText = tertiaryText;

        return this;
    }

    /**
     * @returns {interfaces.display.TextContent}
     */
    public abstract getTextContent() : TextContent;
}
