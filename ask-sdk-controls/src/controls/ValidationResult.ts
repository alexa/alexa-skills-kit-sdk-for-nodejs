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

// The return type of all builtin controls' validation function when validation fails

/**
 * Describes what validation failure occurred.
 *
 * Usage:
 * - A reason code should be provided in situations where the reason may need
 *   context-specific rendering.
 *
 * - A rendered reason can be provided if there is no need for context-specific
 *   rendering. Rendering the reason directly during construction may simplify
 *   code in these situations.
 */
export type ValidationResult = {
    /**
     * A code representing what validation failed.
     */
    reasonCode?: string,

    /**
     * A rendered prompt fragment that can be directly included in the `Response`.
     */
    renderedReason? : string
};