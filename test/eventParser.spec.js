'use strict';

const expect = require('chai').expect;
const EventParser = require('../lib/eventParser').EventParser;
const sampleRequests = require('./sampleRequests');

describe('Event Parser can parse Launch Requests', () => {
    it('should return LaunchRequest', () => {
        const request = sampleRequests.LaunchRequest;
        const result = EventParser.parseEventName(request);

        expect(result).to.equal('LaunchRequest');
    });
});

describe('Event Parser can parse Intent Requests', () => {
    it('should return the intent name', () => {
        const expectedIntent = 'RecipeIntent';
        const request = sampleRequests.IntentRequest;
        const result = EventParser.parseEventName(request);

        expect(result).to.equal(expectedIntent);
    });
});

describe('Event Parser can parse PlaybackController Requests', () => {
    it('should return the playback controller command name', () => {
        const expectedEventName = 'NextCommandIssued';
        const request = sampleRequests.PlaybackControllerRequest;
        const result = EventParser.parseEventName(request);

        expect(result).to.equal(expectedEventName);
    });
});

describe('Event Parser can parse Display Requests', () => {
    it('should return the display command name', () => {
        const expectedEventName = 'ElementSelected';
        const request = sampleRequests.DisplayElementSelectedRequest;
        const result = EventParser.parseEventName(request);

        expect(result).to.equal(expectedEventName);
    });
});

describe('Event Parser can parse SkillEvent Requests', () => {
    it('should return the display command name', () => {
        const expectedEventName = 'AlexaHouseholdListEvent.ItemsCreated';
        const request = sampleRequests.HouseholdListEvent;
        const result = EventParser.parseEventName(request);

        expect(result).to.equal(expectedEventName);
    });
});
