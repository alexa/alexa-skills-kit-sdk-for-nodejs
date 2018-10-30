/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License').
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the 'license' file accompanying this file. This file is distributed
 * on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import {
    interfaces,
    RequestEnvelope,
} from 'ask-sdk-model';
import { createAskSdkError } from 'ask-sdk-runtime';
import Shape = interfaces.viewport.Shape;

export type ViewportProfile =
    'HUB-ROUND-SMALL' |
    'HUB-LANDSCAPE-MEDIUM' |
    'HUB-LANDSCAPE-LARGE' |
    'MOBILE-LANDSCAPE-SMALL' |
    'MOBILE-PORTRAIT-SMALL' |
    'MOBILE-LANDSCAPE-MEDIUM' |
    'MOBILE-PORTRAIT-MEDIUM' |
    'TV-LANDSCAPE-XLARGE' |
    'TV-PORTRAIT-MEDIUM' |
    'TV-LANDSCAPE-MEDIUM'|
    'UNKNOWN-VIEWPORT-PROFILE';

export type ViewportOrientation =
    'EQUAL' |
    'LANDSCAPE' |
    'PORTRAIT';

export type ViewportSizeGroup =
    'XSMALL' |
    'SMALL' |
    'MEDIUM' |
    'LARGE' |
    'XLARGE';

export type ViewportDpiGroup =
    'XLOW' |
    'LOW' |
    'MEDIUM' |
    'HIGH' |
    'XHIGH' |
    'XXHIGH';

export const ViewportSizeGroupOrder : ViewportSizeGroup[] = [ 'XSMALL', 'SMALL', 'MEDIUM', 'LARGE', 'XLARGE'];

export const ViewportDpiGroupOrder : ViewportDpiGroup[] = [ 'XLOW', 'LOW', 'MEDIUM', 'HIGH', 'XHIGH', 'XXHIGH'];

/**
 * return the {@link ViewportOrientation} of given width and height value
 * @param {number} width
 * @param {number} height
 * @return {ViewportOrientation}
 */
export function getViewportOrientation(width : number, height : number) : ViewportOrientation {
    return width > height
           ? 'LANDSCAPE'
           : width < height
             ? 'PORTRAIT'
             : 'EQUAL';
}

/**
 * return the {@link ViewportSizeGroup} of given size value
 * @param {number} size
 * @return {ViewportSizeGroup}
 */
export function getViewportSizeGroup(size : number) : ViewportSizeGroup {
    if (isBetween(size, 0, 600)) {
        return 'XSMALL';
    } else if (isBetween(size, 600, 960)) {
        return 'SMALL';
    } else if (isBetween(size, 960, 1280)) {
        return 'MEDIUM';
    } else if (isBetween(size, 1280, 1920)) {
        return 'LARGE';
    } else if (isBetween(size, 1920, Number.MAX_VALUE)) {
        return 'XLARGE';
    }

    throw createAskSdkError('ViewportUtils.ts', `unknown size group value ${size}`);
}

/**
 * return the {@link ViewportDpiGroup} of given dpi value
 * @param {number} dpi
 * @return {ViewportDpiGroup}
 */
export function getViewportDpiGroup(dpi : number) : ViewportDpiGroup {
    if (isBetween(dpi, 0, 121)) {
        return 'XLOW';
    } else if (isBetween(dpi, 121, 161)) {
        return 'LOW';
    } else if (isBetween(dpi, 161, 241)) {
        return 'MEDIUM';
    } else if (isBetween(dpi, 241, 321)) {
        return 'HIGH';
    } else if (isBetween(dpi, 321, 481)) {
        return 'XHIGH';
    } else if (isBetween(dpi, 481, Number.MAX_VALUE)) {
        return 'XXHIGH';
    }

    throw createAskSdkError('ViewportUtils.ts', `unknown dpi group value ${dpi}`);
}

/**
 * check if target number is within the range of [min, max);
 * @param {number} target
 * @param {number} min
 * @param {number} max
 * @return {boolean}
 */
function isBetween(target : number, min : number, max : number) : boolean {
    return target >= min && target < max;
}

/**
 * return the {@link ViewportProfile} of given request envelope
 * @param {RequestEnvelope} requestEnvelope
 * @return {ViewportProfile}
 */
export function getViewportProfile(requestEnvelope : RequestEnvelope) : ViewportProfile {
    const viewportState = requestEnvelope.context.Viewport;

    if (viewportState) {
        const currentPixelWidth = viewportState.currentPixelWidth;
        const currentPixelHeight = viewportState.currentPixelHeight;
        const dpi = viewportState.dpi;

        const shape : Shape = viewportState.shape;
        const viewportOrientation = getViewportOrientation(currentPixelWidth, currentPixelHeight);
        const viewportDpiGroup = getViewportDpiGroup(dpi);
        const pixelWidthSizeGroup = getViewportSizeGroup(currentPixelWidth);
        const pixelHeightSizeGroup = getViewportSizeGroup(currentPixelHeight);

        if (shape === 'ROUND'
            && viewportOrientation === 'EQUAL'
            && viewportDpiGroup === 'LOW'
            && pixelWidthSizeGroup === 'XSMALL'
            && pixelHeightSizeGroup === 'XSMALL'
        ) {
            return 'HUB-ROUND-SMALL';
        }

        if (shape === 'RECTANGLE'
            && viewportOrientation === 'LANDSCAPE'
            && viewportDpiGroup === 'LOW'
            && ViewportSizeGroupOrder.indexOf(pixelWidthSizeGroup) <= ViewportSizeGroupOrder.indexOf('MEDIUM')
            && ViewportSizeGroupOrder.indexOf(pixelHeightSizeGroup) <= ViewportSizeGroupOrder.indexOf('SMALL')
        ) {
            return 'HUB-LANDSCAPE-MEDIUM';
        }

        if (shape === 'RECTANGLE'
            && viewportOrientation === 'LANDSCAPE'
            && viewportDpiGroup === 'LOW'
            && ViewportSizeGroupOrder.indexOf(pixelWidthSizeGroup) >= ViewportSizeGroupOrder.indexOf('LARGE')
            && ViewportSizeGroupOrder.indexOf(pixelHeightSizeGroup) >= ViewportSizeGroupOrder.indexOf('SMALL')
        ) {
            return 'HUB-LANDSCAPE-LARGE';
        }

        if (shape === 'RECTANGLE'
            && viewportOrientation === 'LANDSCAPE'
            && viewportDpiGroup === 'MEDIUM'
            && ViewportSizeGroupOrder.indexOf(pixelWidthSizeGroup) >= ViewportSizeGroupOrder.indexOf('MEDIUM')
            && ViewportSizeGroupOrder.indexOf(pixelHeightSizeGroup) >= ViewportSizeGroupOrder.indexOf('SMALL')
        ) {
            return 'MOBILE-LANDSCAPE-MEDIUM';
        }

        if (shape === 'RECTANGLE'
            && viewportOrientation === 'PORTRAIT'
            && viewportDpiGroup === 'MEDIUM'
            && ViewportSizeGroupOrder.indexOf(pixelWidthSizeGroup) >= ViewportSizeGroupOrder.indexOf('SMALL')
            && ViewportSizeGroupOrder.indexOf(pixelHeightSizeGroup) >= ViewportSizeGroupOrder.indexOf('MEDIUM')
        ) {
            return 'MOBILE-PORTRAIT-MEDIUM';
        }

        if (shape === 'RECTANGLE'
            && viewportOrientation === 'LANDSCAPE'
            && viewportDpiGroup === 'MEDIUM'
            && ViewportSizeGroupOrder.indexOf(pixelWidthSizeGroup) >= ViewportSizeGroupOrder.indexOf('SMALL')
            && ViewportSizeGroupOrder.indexOf(pixelHeightSizeGroup) >= ViewportSizeGroupOrder.indexOf('XSMALL')
        ) {
            return 'MOBILE-LANDSCAPE-SMALL';
        }

        if (shape === 'RECTANGLE'
            && viewportOrientation === 'PORTRAIT'
            && viewportDpiGroup === 'MEDIUM'
            && ViewportSizeGroupOrder.indexOf(pixelWidthSizeGroup) >= ViewportSizeGroupOrder.indexOf('XSMALL')
            && ViewportSizeGroupOrder.indexOf(pixelHeightSizeGroup) >= ViewportSizeGroupOrder.indexOf('SMALL')
        ) {
            return 'MOBILE-PORTRAIT-SMALL';
        }

        if (shape === 'RECTANGLE'
            && viewportOrientation === 'LANDSCAPE'
            && ViewportDpiGroupOrder.indexOf(viewportDpiGroup) >= ViewportDpiGroupOrder.indexOf('HIGH')
            && ViewportSizeGroupOrder.indexOf(pixelWidthSizeGroup) >= ViewportSizeGroupOrder.indexOf('XLARGE')
            && ViewportSizeGroupOrder.indexOf(pixelHeightSizeGroup) >= ViewportSizeGroupOrder.indexOf('MEDIUM')
        ) {
            return 'TV-LANDSCAPE-XLARGE';
        }

        if (shape === 'RECTANGLE'
            && viewportOrientation === 'PORTRAIT'
            && ViewportDpiGroupOrder.indexOf(viewportDpiGroup) >= ViewportDpiGroupOrder.indexOf('HIGH')
            && pixelWidthSizeGroup === 'XSMALL'
            && pixelHeightSizeGroup === 'XLARGE'
        ) {
            return 'TV-PORTRAIT-MEDIUM';
        }

        if (shape === 'RECTANGLE'
            && viewportOrientation === 'LANDSCAPE'
            && ViewportDpiGroupOrder.indexOf(viewportDpiGroup) >= ViewportDpiGroupOrder.indexOf('HIGH')
            && pixelWidthSizeGroup === 'MEDIUM'
            && pixelHeightSizeGroup === 'SMALL'
        ) {
            return 'TV-LANDSCAPE-MEDIUM';
        }
    }

    return 'UNKNOWN-VIEWPORT-PROFILE';
}
