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
import { expect } from 'chai';
import { ImageHelper } from '../../lib/response/ImageHelper';

describe('ImageHelper', () => {
    let imageHelper : ImageHelper;
    beforeEach((done) => {
        imageHelper = new ImageHelper();
        done();
    });

    it('should build an image object with one image instance', () => {
        const imageSource = 'https://url-to-image...';
        const height = 400;
        const width = 500;
        const imageSize : interfaces.display.ImageSize = 'MEDIUM';
        const description = 'description';
        const expectImage = {
            contentDescription : description,
            sources : [
                {
                    heightPixels : height,
                    size : 'MEDIUM',
                    url : imageSource,
                    widthPixels : width,
                },
            ],
        };

        expect(imageHelper.withDescription(description).addImageInstance(imageSource, imageSize, width, height).getImage())
            .to.deep.equal(expectImage);
    });

    it('should build an image object with one image instance without size', () => {
        const imageSource = 'https://url-to-image...';
        const height = 400;
        const width = 500;
        const expectImage = {
            sources : [
                {
                    heightPixels : height,
                    url : imageSource,
                    widthPixels : width,
                },
            ],
        };

        expect(imageHelper.addImageInstance(imageSource, undefined, width, height).getImage()).to.deep.equals(expectImage);
    });

    it('should build an image object with several image instances', () => {
        const imageSource1 = 'https://url-to-image...';
        const height1 = 400;
        const width1 = 500;
        const imageSize1 : interfaces.display.ImageSize = 'MEDIUM';
        const imageSource2 = 'https://url-to-image...';
        const height2 = 400;
        const width2 = 500;
        const imageSize2 : interfaces.display.ImageSize = 'MEDIUM';
        const expectImage = {
            sources : [
                {
                    heightPixels : height1,
                    size : 'MEDIUM',
                    url : imageSource1,
                    widthPixels : width1,
                },
                {
                    heightPixels : height2,
                    size : 'MEDIUM',
                    url : imageSource2,
                    widthPixels : width2,
                },
            ],
        };

        expect(imageHelper.addImageInstance(imageSource1, imageSize1, width1, height1).addImageInstance(imageSource2, imageSize2, width2, height2).getImage())
        .to.deep.equals(expectImage);
    });

    it('should build an image object with optional parameters', () => {
        const imageSource = 'https://url-to-image...';
        const expectImage = {
            sources : [
                {
                    url : imageSource,
                },
            ],
        };

        expect(imageHelper.addImageInstance(imageSource).getImage()).to.deep.equals(expectImage);
    });
});
