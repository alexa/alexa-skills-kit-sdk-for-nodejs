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
import {
    getViewportDpiGroup,
    getViewportOrientation,
    getViewportProfile,
    getViewportSizeGroup,
} from '../../lib/util/ViewportUtils';
import { JsonProvider } from '../mocks/JsonProvider';
import ViewportState = interfaces.viewport.ViewportState;

describe('ViewportUtils.ts', () => {
    it('should be able to resolve viewport orientation', () => {
        expect(getViewportOrientation(0, 1)).eq('PORTRAIT');
        expect(getViewportOrientation(1, 1)).eq('EQUAL');
        expect(getViewportOrientation(1, 0)).eq('LANDSCAPE');
    });

    it('should be able to resolve viewport size group', () => {
        expect(getViewportSizeGroup(0)).eq('XSMALL');
        expect(getViewportSizeGroup(600)).eq('SMALL');
        expect(getViewportSizeGroup(960)).eq('MEDIUM');
        expect(getViewportSizeGroup(1280)).eq('LARGE');
        expect(getViewportSizeGroup(1920)).eq('XLARGE');
        expect(() => {
            getViewportSizeGroup(-1);
        }).to.throw('unknown size group value -1');
    });

    it('should be able to resolve viewport dpi group', () => {
        expect(getViewportDpiGroup(120)).eq('XLOW');
        expect(getViewportDpiGroup(160)).eq('LOW');
        expect(getViewportDpiGroup(240)).eq('MEDIUM');
        expect(getViewportDpiGroup(320)).eq('HIGH');
        expect(getViewportDpiGroup(480)).eq('XHIGH');
        expect(getViewportDpiGroup(481)).eq('XXHIGH');
        expect(() => {
            getViewportDpiGroup(-1);
        }).throw('unknown dpi group value -1');
    });

    it('should return unknown profile if viewport is not present in the request envelope', () => {

        const requestEnvelope = JsonProvider.requestEnvelope();
        expect(getViewportProfile(requestEnvelope)).eq('UNKNOWN-VIEWPORT-PROFILE');
    });

    it('should be able to resolve viewport profile', () => {
        const requestEnvelope = JsonProvider.requestEnvelope();
        requestEnvelope.context.Viewport = {
            shape : undefined,
            currentPixelWidth : undefined,
            currentPixelHeight : undefined,
            experiences : [],
            pixelWidth : undefined,
            pixelHeight : undefined,
            dpi : undefined,
            keyboard : [],
            touch : [],
        };
        requestEnvelope.context.Viewport.shape = 'ROUND';
        requestEnvelope.context.Viewport.currentPixelHeight = 300;
        requestEnvelope.context.Viewport.currentPixelWidth = 300;
        requestEnvelope.context.Viewport.dpi = 160;
        expect(getViewportProfile(requestEnvelope)).eq('HUB-ROUND-SMALL');

        requestEnvelope.context.Viewport.shape = 'RECTANGLE';
        requestEnvelope.context.Viewport.currentPixelHeight = 600;
        requestEnvelope.context.Viewport.currentPixelWidth = 960;
        requestEnvelope.context.Viewport.dpi = 160;
        expect(getViewportProfile(requestEnvelope)).eq('HUB-LANDSCAPE-MEDIUM');

        requestEnvelope.context.Viewport.shape = 'RECTANGLE';
        requestEnvelope.context.Viewport.currentPixelHeight = 960;
        requestEnvelope.context.Viewport.currentPixelWidth = 1280;
        requestEnvelope.context.Viewport.dpi = 160;
        expect(getViewportProfile(requestEnvelope)).eq('HUB-LANDSCAPE-LARGE');

        requestEnvelope.context.Viewport.shape = 'RECTANGLE';
        requestEnvelope.context.Viewport.currentPixelHeight = 300;
        requestEnvelope.context.Viewport.currentPixelWidth = 600;
        requestEnvelope.context.Viewport.dpi = 240;
        expect(getViewportProfile(requestEnvelope)).eq('MOBILE-LANDSCAPE-SMALL');

        requestEnvelope.context.Viewport.shape = 'RECTANGLE';
        requestEnvelope.context.Viewport.currentPixelHeight = 600;
        requestEnvelope.context.Viewport.currentPixelWidth = 300;
        requestEnvelope.context.Viewport.dpi = 240;
        expect(getViewportProfile(requestEnvelope)).eq('MOBILE-PORTRAIT-SMALL');

        requestEnvelope.context.Viewport.shape = 'RECTANGLE';
        requestEnvelope.context.Viewport.currentPixelHeight = 600;
        requestEnvelope.context.Viewport.currentPixelWidth = 960;
        requestEnvelope.context.Viewport.dpi = 240;
        expect(getViewportProfile(requestEnvelope)).eq('MOBILE-LANDSCAPE-MEDIUM');

        requestEnvelope.context.Viewport.shape = 'RECTANGLE';
        requestEnvelope.context.Viewport.currentPixelHeight = 960;
        requestEnvelope.context.Viewport.currentPixelWidth = 600;
        requestEnvelope.context.Viewport.dpi = 240;
        expect(getViewportProfile(requestEnvelope)).eq('MOBILE-PORTRAIT-MEDIUM');

        requestEnvelope.context.Viewport.shape = 'RECTANGLE';
        requestEnvelope.context.Viewport.currentPixelHeight = 960;
        requestEnvelope.context.Viewport.currentPixelWidth = 1920;
        requestEnvelope.context.Viewport.dpi = 320;
        expect(getViewportProfile(requestEnvelope)).eq('TV-LANDSCAPE-XLARGE');

        requestEnvelope.context.Viewport.shape = 'RECTANGLE';
        requestEnvelope.context.Viewport.currentPixelHeight = 1920;
        requestEnvelope.context.Viewport.currentPixelWidth = 300;
        requestEnvelope.context.Viewport.dpi = 320;
        expect(getViewportProfile(requestEnvelope)).eq('TV-PORTRAIT-MEDIUM');

        requestEnvelope.context.Viewport.shape = 'RECTANGLE';
        requestEnvelope.context.Viewport.currentPixelHeight = 600;
        requestEnvelope.context.Viewport.currentPixelWidth = 960;
        requestEnvelope.context.Viewport.dpi = 320;
        expect(getViewportProfile(requestEnvelope)).eq('TV-LANDSCAPE-MEDIUM');

        requestEnvelope.context.Viewport.shape = 'ROUND';
        requestEnvelope.context.Viewport.currentPixelHeight = 600;
        requestEnvelope.context.Viewport.currentPixelWidth = 600;
        requestEnvelope.context.Viewport.dpi = 240;
        expect(getViewportProfile(requestEnvelope)).eq('UNKNOWN-VIEWPORT-PROFILE');
    });
});
