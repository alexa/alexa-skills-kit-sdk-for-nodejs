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

import { ui, Intent, interfaces, Directive, Response, dialog, canfulfill } from "ask-sdk-model";
import { ResponseBuilder } from 'ask-sdk-core';


/**
 * A specialized ResponseBuilder for use with Controls framework
 *
 * This differs from the the regular @see ResponseBuilder in a couple of ways:
 * 1. The prompt and reprompt can be built up incrementally via
 *    `addPromptFragment()` and `addRepromptFragment()`
 * 2. `.withShouldEndSession()` is disabled as the information should be
 *    provided via see `ControlResultBuilder` during `Control.handle()` and
 *    `Control.takeInitiative()`
 */
export class ControlResponseBuilder implements ResponseBuilder {
    coreBuilder: ResponseBuilder;

    private promptFragments: string[] = [];
    private promptPlayBehavior?: ui.PlayBehavior;
    private repromptFragments: string[] = [];
    private repromptPlayBehavior?: ui.PlayBehavior;

    private displayUsed: boolean;

    constructor(responseBuilder: ResponseBuilder) {
        this.coreBuilder = responseBuilder;
    }

    /**
     * Determines if a 'display or APL' directive has been added to the response.
     */
    isDisplayUsed(): boolean {
        return this.displayUsed;
    }

    /**
     * Sets the displayUsed flag to indicate if the Response includes content
     * for the device display.
     *
     * Note: calling `.withSimpleCard()`, `.withStandardCard()`,
     * `.addAPLRenderDocumentDirective()` or
     * `.addDirective(type=Alexa.Presentation)` sets this to `true`
     * automatically.
     *
     * Usage:
     *  * If you wish to keep existing APL active on device without resending,
     *    call this to communicate that the screen remains 'in use'.
     *  * Use this if the auto-detection does not work for some directive.
     */
    setDisplayUsed(used: boolean = true): void {
        this.displayUsed = used;
    }

    /**
     * Build the response.
     */
    build(): Response {
        const prompt = this.getPrompt();
        const reprompt = this.getReprompt();

        this.coreBuilder
            .speak(prompt, this.promptPlayBehavior)
            .reprompt(reprompt, this.repromptPlayBehavior);

        return this.coreBuilder.getResponse();
    }

    /**
     * Get the complete prompt.
     *
     * Concatenates the fragments with a single space between each.
     */
    getPrompt(): string {
        return this.promptFragments.join(' ');
    }

    /**
     * Get the complete reprompt.
     *
     * Concatenates the fragments with a single space between each.
     */
    getReprompt(): string {
        return this.repromptFragments.join(' ');
    }

    /**
     * Add a fragment to the prompt.
     * @param promptFragment - Prompt fragment
     */
    addPromptFragment(promptFragment: string): this {
        this.promptFragments.push(promptFragment);
        return this;
    }

    /**
     * Add a fragment to the reprompt.
     * @param repromptFragment - Reprompt fragment
     */
    addRepromptFragment(repromptFragment: string): this {
        this.repromptFragments.push(repromptFragment);
        return this;
    }

    /**
     * Set the prompt play behavior to associate with the complete prompt.
     */
    withPromptPlayBehavior(playBehavior?: ui.PlayBehavior): this {
        if (this.promptPlayBehavior !== undefined) {
            throw new Error("Play behavior is already set");
        }
        this.promptPlayBehavior = playBehavior;
        return this;
    }

    /**
     * Set the reprompt play behavior to associate with the complete prompt.
     */
    withRepromptPlayBehavior(playBehavior?: ui.PlayBehavior): this {
        if (this.repromptPlayBehavior !== undefined) {
            throw new Error("Play behavior is already set");
        }
        this.repromptPlayBehavior = playBehavior;
        return this;
    }


    // --------------------------------------
    // pass through methods

    /**
     * Disabled.  Use addPromptFragment and withPromptPlayBehavior.
     */
    speak(speechOutput: string, playBehavior?: "ENQUEUE" | "REPLACE_ALL" | "REPLACE_ENQUEUED" | undefined): this {
        throw new Error("Use addPromptFragment and withPromptPlayBehavior instead.");
    }

    /**
     * Disabled.  Use addRepromptFragment and withRepromptPlayBehavior.
     */
    reprompt(repromptSpeechOutput: string, playBehavior?: "ENQUEUE" | "REPLACE_ALL" | "REPLACE_ENQUEUED" | undefined): this {
        throw new Error("Use addRepromptFragment and withRepromptPlayBehavior instead.");
    }
    withSimpleCard(cardTitle: string, cardContent: string): this {
        this.coreBuilder.withSimpleCard(cardTitle, cardContent);
        this.displayUsed = true;
        return this;
    }
    withStandardCard(cardTitle: string, cardContent: string, smallImageUrl?: string | undefined, largeImageUrl?: string | undefined): this {
        this.coreBuilder.withStandardCard(cardTitle, cardContent, smallImageUrl, largeImageUrl);
        this.displayUsed = true;
        return this;
    }
    withLinkAccountCard(): this {
        this.coreBuilder.withLinkAccountCard();
        return this;
    }
    withAskForPermissionsConsentCard(permissionArray: string[]): this {
        this.coreBuilder.withAskForPermissionsConsentCard(permissionArray);
        return this;
    }
    addDelegateDirective(updatedIntent?: Intent | undefined): this {
        this.coreBuilder.addDelegateDirective(updatedIntent);
        return this;
    }
    addElicitSlotDirective(slotToElicit: string, updatedIntent?: Intent | undefined): this {
        this.coreBuilder.addElicitSlotDirective(slotToElicit, updatedIntent);
        return this;
    }
    addConfirmSlotDirective(slotToConfirm: string, updatedIntent?: Intent | undefined): this {
        this.coreBuilder.addConfirmSlotDirective(slotToConfirm, updatedIntent);
        return this;
    }
    addConfirmIntentDirective(updatedIntent?: Intent | undefined): this {
        this.coreBuilder.addConfirmIntentDirective(updatedIntent);
        return this;
    }
    addAudioPlayerPlayDirective(playBehavior: ui.PlayBehavior, url: string, token: string, offsetInMilliseconds: number, expectedPreviousToken?: string | undefined, audioItemMetadata?: interfaces.audioplayer.AudioItemMetadata | undefined): this {
        this.coreBuilder.addAudioPlayerPlayDirective(playBehavior, url, token, offsetInMilliseconds, expectedPreviousToken);
        return this;
    }
    addAudioPlayerStopDirective(): this {
        this.coreBuilder.addAudioPlayerStopDirective();
        return this;
    }
    addAudioPlayerClearQueueDirective(clearBehavior: interfaces.audioplayer.ClearBehavior): this {
        this.coreBuilder.addAudioPlayerClearQueueDirective(clearBehavior);
        return this;
    }
    addRenderTemplateDirective(template: interfaces.display.Template): this {
        this.coreBuilder.addRenderTemplateDirective(template);
        this.displayUsed = true;
        return this;
    }
    addHintDirective(text: string): this {
        this.coreBuilder.addHintDirective(text);
        return this;
    }
    addVideoAppLaunchDirective(source: string, title?: string | undefined, subtitle?: string | undefined): this {
        this.coreBuilder.addVideoAppLaunchDirective(source, title, subtitle);
        return this;
    }
    withApiResponse(apiResponse: any): this {
        this.coreBuilder.withApiResponse(apiResponse);
        return this;
    }
    withCanFulfillIntent(canFulfillIntent: canfulfill.CanFulfillIntent): this {
        this.coreBuilder.withCanFulfillIntent(canFulfillIntent);
        return this;
    }
    withShouldEndSession(val: boolean): this {
        throw new Error('Do not set this here.. use methods on ControlResultBuilder instead.');
    }
    addDirective(directive: Directive): this {
        if (directive.type.startsWith('Alexa.Presentation')) {
            this.displayUsed = true;
        }
        this.coreBuilder.addDirective(directive);
        return this;
    }

    // helpers for common directives (incomplete)
    addDynamicEntitiesDirective(dynamicEntitiesDirective: dialog.DynamicEntitiesDirective) {
        this.coreBuilder.addDirective(dynamicEntitiesDirective);
    }
    addAPLRenderDocumentDirective(token?: string, document?: { [key: string]: any }, datasources?: { [key: string]: any; }, packages?: any[]) {
        this.coreBuilder.addDirective(
            {
                type: 'Alexa.Presentation.APL.RenderDocument',
                token,
                document,
                datasources,
                packages
            }
        );
        this.displayUsed = true;
    }

    /**
     * Builds and returns the complete response.
     */
    getResponse(): Response {
        return this.build();
    }
}