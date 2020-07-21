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
 * Represents that the state of a control is not consistent and cannot be used.
 */
export class StateConsistencyError extends Error {
    constructor(message?: string) {
        super(message);
        // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = StateConsistencyError.name; // stack traces display correctly now
    }
}

/**
 * Represents that a predicate-guard expression failed.
 *
 * Purpose:
 * * This helps to write predicate functions as a linear chain of individual tests.
 */
export class GuardFailed extends Error {
    constructor(message?: string) {
        super(message);
        // see: typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = GuardFailed.name; // stack traces display correctly now
    }
}

/**
 * Does nothing if the predicate is true. Otherwise throws GuardFailed error.
 *
 * Purpose:
 * * This helps to write predicate functions as a linear chain of individual tests.
 */
export function okIf(predicate: boolean) {
    if (!predicate) {
        throw new GuardFailed('okIf failed. predicate===false.');
    }
}

/**
 * Throws a GuardFailed error if predicate is true.
 *
 * Purpose:
 * * This helps to write predicate functions as a linear chain of individual tests.
 * @param predicate - Predicate
 */
export function failIf(predicate: boolean) {
    if (predicate) {
        throw new GuardFailed('failIf triggered. predicate===true.');
    }
}

/**
 * Consumes an GuardFailed error and returns false, but otherwise rethrows.
 *
 * Purpose:
 * * This helps to write predicate functions as a linear chain of individual tests.
 *
 * @returns `false` if error is a `GuardFailed` error.
 * @throws Rethrows the error if it is not a `GuardFailed` error.
 */
export function falseIfGuardFailed(err: Error): false {
    if (err instanceof GuardFailed) {
        return false;
    }
    throw err; // otherwise rethrow
}
