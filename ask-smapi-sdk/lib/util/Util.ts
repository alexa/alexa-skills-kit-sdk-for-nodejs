/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

export declare type Header = Array<{
    key: string;
    value: string;
}>;

export function getValueFromHeader(header: Header, key: string): string[] {
    const result: string[] = [];
    if (!header || !key) {
        return result;
    }
    header.forEach((object) => {
        if (object.key === key) {
            result.push(object.value);
        }
    });

    return result;
}
