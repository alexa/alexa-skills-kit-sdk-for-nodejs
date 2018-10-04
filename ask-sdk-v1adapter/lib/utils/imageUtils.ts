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

export class ImageUtils {
    public static makeImage(url : string, widthPixels? : number, heightPixels? : number,
                            size? : interfaces.display.ImageSize, description? : string)
    : interfaces.display.Image {
        const imageInstance : interfaces.display.ImageInstance = {
            url,
            size,
            widthPixels,
            heightPixels,
        };

        const image : interfaces.display.Image = {
            sources : [imageInstance],
            contentDescription : description,
        };

        return image;
    }

    public static makeImages(imgArr : interfaces.display.ImageInstance[],
                             description? : string) : interfaces.display.Image {
        const images : interfaces.display.Image = {
            sources : imgArr,
            contentDescription : description,
        };

        return images;
    }
}
