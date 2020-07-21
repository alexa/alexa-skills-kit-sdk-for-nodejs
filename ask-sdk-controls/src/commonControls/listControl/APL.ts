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


/*
 * For information about the TextListTemplate, see following doc:
 * https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-alexa-text-list-layout.html
 */
export interface APLListItem {
    primaryText: string;
}

export function generateTextListDocumentForListControl() {
    return {
        type: "APL",
        version: "1.3",
        import: [
            {
                name: "alexa-layouts",
                version: "1.1.0"
            }
        ],
        mainTemplate: {
            parameters: [
                "textListData"
            ],
            items: [{
                type: "AlexaTextList",
                theme: "${viewport.theme}",
                headerTitle: "${textListData.headerTitle}",
                headerDivider: true,
                headerBackButton: false,
                headerBackButtonAccessibilityLabel: "back",
                headerBackgroundColor: "transparent",
                backgroundColor: "transparent",
                backgroundScale: "best-fill",
                backgroundAlign: "center",
                backgroundBlur: false,
                hideOrdinal: false,
                primaryAction: {
                    type: "SendEvent",
                    arguments: [
                        "${textListData.controlId}",
                        "${ordinal}"
                    ]
                },
                listItems: "${textListData.items}"
            }]
        }
    };
}

