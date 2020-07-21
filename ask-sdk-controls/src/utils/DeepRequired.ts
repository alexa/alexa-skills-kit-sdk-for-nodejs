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

/**
 * A type that changes all optional properties to be required, recursively.
 *
 * Function types are not rewritten as that would change their formal-argument
 * types.
 */

export type DeepRequired<T> =
    // eslint-disable-next-line @typescript-eslint/ban-types
    T extends Function ?
        T :
        {
            [k in keyof T]-?: DeepRequired<T[k]>;
        };
