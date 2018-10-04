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

export class BodyTemplate1Builder {
    protected template : interfaces.display.BodyTemplate1;

    constructor() {
        this.template = { type : 'BodyTemplate1' };
    }

    public setTextContent(primaryText? : interfaces.display.TextField,
                          secondaryText? : interfaces.display.TextField,
                          tertiaryText? : interfaces.display.TextField) : this {

        this.template.textContent = TextUtils.makeTextContent(primaryText, secondaryText, tertiaryText);

        return this;
    }

    public setTitle(title : string) : this {
        this.template.title = title;

        return this;
    }

    public setToken(token : string) : this {
        this.template.token = token;

        return this;
    }

    public setBackgroundImage(image : interfaces.display.Image) : this {
       this.template.backgroundImage = image;

       return this;
    }

    public setBackButtonBehavior(backButtonBehavior : interfaces.display.BackButtonBehavior) : this {
        this.template.backButton = backButtonBehavior;

        return this;
    }

    public build() : interfaces.display.BodyTemplate1 {
        return this.template;
    }
}
