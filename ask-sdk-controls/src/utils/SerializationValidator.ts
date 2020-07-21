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

import { IControl } from '../controls/interfaces/IControl';
import { IControlInput } from '../controls/interfaces/IControlInput';
import { IControlManager } from '../controls/interfaces/IControlManager';
import { Logger } from '../logging/Logger';
import { attachStateToControlTree, extractStateFromControlTree } from '../runtime/ControlHandler';

const log = new Logger('AskSdkControls:SerializationValidator');

/**
 * Validates that the serialized state will survive the round-trip successfully.
 *
 * If round-trip fails, diagnostic information is printed to the console.
 * @param serializedState - Serialized state (a string in JSON format)
 * @param controlManager - Control manager
 * @param input - Input
 * @throws Error if round-trip fails.
 */
export function validateSerializedState(serializedState: string, controlManager: IControlManager, input: IControlInput): void {

    // perform deserialization
    const deserializedState = JSON.parse(serializedState);
    const rebuiltTopControl: IControl = controlManager.createControlTree(deserializedState);
    attachStateToControlTree(rebuiltTopControl, deserializedState);

    // and then re-serialize to complete the round trip
    const roundTrippedUISerialized = JSON.stringify(extractStateFromControlTree(rebuiltTopControl), null, 2);

    if (serializedState !== roundTrippedUISerialized) {
        log.info("serializedState did not survive the simulated round trip (deserialization into controlTree and re-serialization).");
        const lines1 = serializedState.split("\n");
        const lines2 = roundTrippedUISerialized.split("\n");
        if (lines1.length === lines2.length) {
            log.info("=================================================");
            for (const [i, line1] of lines1.entries()) {
                const line2 = lines2[i];
                if (line1 !== line2) {
                    log.info(`${i}: Expected: ${line1}`);
                    log.info(`${i}: Actual:   ${line2}`);
                }
            }
            log.info("=================================================");
        }
        else {
            log.info("Diff is complicated.. use a text differ on the following");
            log.info("=================================================");
            log.info(serializedState);
            log.info("=================================================");
            log.info("=================================================");
            log.info(roundTrippedUISerialized);
            log.info("=================================================");

            log.info("First diff:");
            for (const [i, line1] of lines1.entries()) {
                const line2 = lines2[i];
                if (line1 !== line2) {
                    log.info(`${i}: Expected: ${line1}`);
                    log.info(`${i}: Actual:   ${line2}`);
                    break;
                }
            }
        }

        throw new Error("Problem round-tripping JSON serialization (see logs above to obtain diff).  Do your custom controls have fromJson, new up correct type and pass all properties?");
    }
}

