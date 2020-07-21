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
  * Utilities for prompt generation in English
  */
export namespace EnglishGrammar {
    /**
     * Choose the article to use in English noun phrases  (a vs an)
     *
     * This is only a partial implementation.
     * See https://www.grammar.com/a-vs-an-when-to-use/
     * @param antecedent - Antecedent
     */
    export function article(antecedent: string) {
        const firstLetter = antecedent.trim()[0];
        if (["a", "e", "i", "o", "u"].includes(firstLetter)) {
            return "an";
        }
        else {
            return "a";
        }
    }

    /**
     * Render a noun in singular or plural form
     *
     * Both the singular and plural form of the noun must be supplied as arguments.
     *
     * Rule:
     *  * `1 -> singular`
     *  * `else -> plural`  (including zero)
     *
     * @param count - Count
     * @param singular - Singular form
     * @param plural - Plural form
     */
    export function renderNoun(count: number | string, singular: string, plural: string) {
        return (count === 1 || count === '1') ? singular : plural;
    }
}