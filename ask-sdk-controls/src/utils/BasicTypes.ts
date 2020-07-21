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
  * Either a string or an array of strings
  */
export type StringOrList = string | string[];


// TODO: API: remove or consolidate with ValidationResult / validation function types
/**
 * Either the boolean literal `true` or a string.
 *
 * Purpose:
 * - For use in validation functions that return true or an error string.
 */
export type StringOrTrue = true | string;
