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
 * Randomly selects one item from an array with uniform probability.
 */
export function randomlyPick<T>(input: T[]): T {
    return input[Math.floor(Math.random() * input.length)];
}

/**
 * Moves one item of an array in place and returns the mutated array.
 * @param arr - Array
 * @param from - Index of item to move
 * @param to - Index to move it to
 */
export function moveArrayItem(arr: any[], from: number, to: number): any[] {
    arr.splice(to, 0, arr.splice(from, 1)[0]);
    return arr;
}

// TODO: API: remove
/**
 * Returns `true` if the value is defined and does not appear in the array.
 * @param value - Value
 * @param array - Array
 */
export function mismatch(value: any, array: any[]): boolean {
    return (value !== undefined && !array.includes(value));
}

// TODO: API: remove
/**
 * Returns `true` if the value is undefined or appears in the array.
 * @param value - Value
 * @param array - Array
 */
export function matchIfDefined(value: any, array: any[]) {
    return (value === undefined || array.includes(value));
}
