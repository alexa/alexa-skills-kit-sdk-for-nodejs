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

import { expect } from 'chai';
import { EventParser } from '../lib/eventParser';
import { DisplayElementSelectedRequest,
         HouseholdListEvent,
         LaunchRequest,
         PlaybackControllerRequest,
         RecipeIntentRequest,
         SkillEnabledRequest } from './mock/mockSampleRequest';

describe('Event Parser can parse Launch Requests', () => {
    it('should return LaunchRequest', () => {
        const expectedEventName = 'LaunchRequest';
        const request = LaunchRequest;
        const result = EventParser(request);

        expect(result).to.equal(expectedEventName);
    });
});

describe('Event Parser can parse Intent Requests', () => {
    it('should return the intent name', () => {
        const expectedIntent = 'RecipeIntent';
        const request = RecipeIntentRequest;
        const result = EventParser(request);

        expect(result).to.equal(expectedIntent);
    });
});

describe('Event Parser can parse PlaybackController Requests', () => {
    it('should return the playback controller command name', () => {
        const expectedEventName = 'NextCommandIssued';
        const request = PlaybackControllerRequest;
        const result = EventParser(request);

        expect(result).to.equal(expectedEventName);
    });
});

describe('Event Parser can parse Display Requests', () => {
    it('should return the display command name', () => {
        const expectedEventName = 'ElementSelected';
        const request = DisplayElementSelectedRequest;
        const result = EventParser(request);

        expect(result).to.equal(expectedEventName);
    });
});

describe('Event Parser can parse SkillEvent Requests', () => {
    it('should return the skill event name', () => {
        const expectedEventName = 'AlexaSkillEvent.SkillEnabled';
        const request = SkillEnabledRequest;
        const result = EventParser(request);

        expect(result).to.equal(expectedEventName);
    });
});

describe('Event Parser can parse HouseholdListEvent Requests', () => {
    it('should return the HouseholdListEvent name', () => {
        const expectedEventName = 'AlexaHouseholdListEvent.ItemsCreated';
        const request = HouseholdListEvent;
        const result = EventParser(request);

        expect(result).to.equal(expectedEventName);
    });
});
