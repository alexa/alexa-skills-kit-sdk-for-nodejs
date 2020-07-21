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

import { expect } from "chai";
import { suite, test } from "mocha";
import { moveArrayItem, randomlyPick } from '../../src/utils/ArrayUtils';

suite("== ArrayUtils.randomlyPick() ==", () => {
    test("ensure distribution is reasonable", async () => {
        const array = [0, 1, 2];
        const histogram: number[] = [0, 0, 0, 0, 0, 0, 0];

        for (let i = 0; i < 30000; i++) {
            histogram[randomlyPick(array)]++;
        }

        for (let i = 0; i < array.length; i++) {
            const relativeDiff = Math.abs((histogram[0] / histogram[i]) - 1.0);
            expect(relativeDiff).lessThan(0.1); // conservative comparison to reduce false negatives
        }
    });
});

suite("== ArrayUtils.reorder() ==", () => {
    test("basics", async () => {
        const array = [0, 1, 2];
        expect(moveArrayItem([0, 1, 2, 3, 4], 1, 0)).deep.equal([1, 0, 2, 3, 4]);
        expect(moveArrayItem([0, 1, 2, 3, 4], 0, 2)).deep.equal([1, 2, 0, 3, 4]);
        expect(moveArrayItem([0, 1, 2, 3, 4], 0, 5)).deep.equal([1, 2, 3, 4, 0]);
    });
});
