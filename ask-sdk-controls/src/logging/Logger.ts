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
import Debug from "debug";

const DEFAULT_LOG_LEVEL = 'error:*, warn:*';

/**
 * Logger
 *
 * This wraps the Debug object from npm 'Debug' package to provide "log-levels".
 * The log-levels are handled as top-level namespaces.
 *
 * Examples
 * ```
 * export DEBUG="error:*" -> Log 'error' messages from every module
 * export DEBUG="error:moduleA" -> Log 'error' messages for moduleA only
 * export DEBUG="error:*, warn:*, info:*, debug:*" -> Log everything
 * ```
 *
 * See https://www.npmjs.com/package/debug for more information on
 * configuration.
 *
 * When instantiated for a given "moduleName", this object provides an `error()`
 * function that logs with amended name "error:moduleName". Likewise for `warn()`,
 * `info()`, and `debug()`.
 */
export class Logger {

    moduleName: string;

    constructor(moduleName: string) {
        this.moduleName = moduleName;

        const namespace = process.env.DEBUG ?? DEFAULT_LOG_LEVEL;
        Debug.enable(namespace);
    }

    /**
     * Log a message as an "error".
     * @param message - Message
     */
    error(message: string): void {
        Debug(`error:${this.moduleName}`)(message);
    }

    /**
     * Log a message as an "warning".
     * @param message - Message
     */
    warn(message: string): void {
        Debug(`warn:${this.moduleName}`)(message);
    }

    /**
     * Log a message as an "informational" message.
     * @param message - Message
     */
    info(message: string): void {
        Debug(`info:${this.moduleName}`)(message);
    }

    /**
     * Log a message as an "low-level debug message".
     * @param message - Message
     */
    debug(message: string): void {
        Debug(`debug:${this.moduleName}`)(message);
    }
}