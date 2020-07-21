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
 * Constants for Alexa's built-in slot types.
 *
 * (This is not a complete list.)
 */
export enum AmazonBuiltInSlotType {
    DATE = 'AMAZON.DATE',
    DURATION = 'AMAZON.DURATION',
    NUMBER = 'AMAZON.NUMBER',
    FOUR_DIGIT_NUMBER = 'AMAZON.FOUR_DIGIT_NUMBER',
    ORDINAL = 'AMAZON.Ordinal',
    PHONENUMBER = 'AMAZON.PhoneNumber',
    TIME = 'AMAZON.TIME',
    SEARCH_QUERY = 'AMAZON.SearchQuery'
}