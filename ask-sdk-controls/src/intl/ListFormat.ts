/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

import _ from "lodash";

/**
 * Utilities for rendering lists to strings/prompts.
 */
export namespace ListFormatting {
    /**
     * Format a list with commas and a joiner word.
     *
     * Example: `formatList(['a', 'b', 'c'], 'and or') -> 'a, b, and or c'`
     *
     * This can mostly be replaced with Intl.ListFormat(style:'long', ..) once it is implemented for NodeJS.
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat
     *
     * @param arr - Array
     * @param joiner - Joiner
     */
    export function format(arr: string[], joiner = "or"): string {
        if (arr.length === 0) {
            return "(empty)";
        }
        if (arr.length === 1) {
            return arr[0];
        }
        if (arr.length === 2) {
            return `${arr[0]} ${joiner} ${arr[1]}`;
        }
        else {
            return `${_.join(_.take(arr, arr.length - 1), ", ")} ${joiner} ${arr[arr.length - 1]}`;
        }
    }
}