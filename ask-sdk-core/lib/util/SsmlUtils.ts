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

/**
 * return the string with all invalid XML characters escaped
 * @param input
 */
export function escapeXmlCharacters(input : string) : string {
    const invalidXmlCharactersMapping = {
        '&' : '&amp;',
        '<' : '&lt;',
        '>' : '&gt;',
        '"' : '&quot;',
        "'" : '&apos;',
    };

    const invalidXmlCharactersMappingReverse = Object.keys(invalidXmlCharactersMapping).reduce(
        /* eslint-disable-next-line */
        (obj : object, key : string) => {
            obj[invalidXmlCharactersMapping[key]] = key;

            return obj;
        },
        {},
    );

    // sanitize any already escaped character to ensure they are not escaped more than once
    const sanitizedInput = input.replace(/&amp;|&lt;|&gt;|&quot;|&apos;]/g, (c) => invalidXmlCharactersMappingReverse[c]);

    return sanitizedInput.replace(/[&'"><]/g, (c) => invalidXmlCharactersMapping[c]);
}
