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
import { TextUtils } from '../utils/textUtils';

export class ListItemBuilder {
    protected listItems : interfaces.display.ListItem[];

    constructor() {
        this.listItems = [];
    }

    public addItem(image : interfaces.display.Image, token : string,
                   primaryText? : interfaces.display.TextField,
                   secondaryText? : interfaces.display.TextField,
                   tertiaryText? : interfaces.display.TextField) : this {
        const listItem : interfaces.display.ListItem  = {
            token,
            image,
            textContent : TextUtils.makeTextContent(primaryText, secondaryText, tertiaryText),
        };

        this.listItems.push(listItem);

        return this;
    }

    public build() : interfaces.display.ListItem[] {
        return this.listItems;
    }
}
