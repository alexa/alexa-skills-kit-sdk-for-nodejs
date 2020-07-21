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

// TODO: API: review if these are still required.

/**
 * Throws an Error if the guard is true.
 */
export function throwIf(guard: boolean, message: string): guard is true {
    if (guard) {
        throw new Error(message);
    }
    return true;
}

/**
 * Throws an Error if the object is undefined.
 */
export function throwIfUndefined<T>(object: T | undefined, message: string): object is T {
    if (object === undefined) {
        throw new Error(message);
    }
    return true;
}