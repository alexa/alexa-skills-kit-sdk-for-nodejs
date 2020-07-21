/*
 * Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License').
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the 'license' file accompanying this file. This file is distributed
 * on an 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import { option } from 'yargs';
import { existsSync } from 'fs';

export function argsParser(): any {
  return option({
    accessToken: {
      type: 'string',
      description: 'Access Token',
      demandOption: true,
      requiresArg: true,
    },
    skillId: {
      type: 'string',
      description: 'Skill id',
      demandOption: true,
      requiresArg: true,
    },
    handlerName: {
      type: 'string',
      description: 'Handler method to invoke in your skillEntryFile',
      demandOption: true,
      requiresArg: true,
    },
    skillEntryFile: {
      type: 'string',
      description: 'Skill entry file',
      demandOption: true,
      requiresArg: true,
    },
  })
    .check((argv) => {
      if (argv.accessToken == null) {
        console.error('Access Token cannot be null or empty.');
        return false;
      }
      return true;
    })
    .check((argv) => {
      if (argv.skillId == null) {
        console.error('Skill Id cannot be null or empty.');
        return false;
      }
      return true;
    })
    .check((argv) => {
      if (argv.handlerName == null) {
        console.error('Handler name cannot be null or empty.');
        return false;
      }
      return true;
    })
    .check((argv) => {
      if (argv.skillEntryFile == null) {
        console.error('Skill entry file cannot be null or empty.');
        return false;
      }
      if (!existsSync(argv.skillEntryFile)) {
        console.error('Skill entry file does not  exist.');
        return false;
      }
      return true;
    });
}
