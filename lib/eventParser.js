'use strict';

class EventParser {
    /**
     * Parses an Alexa request and returns the corresponding name of the handler
     * that should be used to handle the request.
     * @static
     * @param {Object} event
     * @returns string
     * @memberof EventParser
     */
    static parseEventName(event) {
        const requestType = event.request.type;
        // intent requests get routed to handler with intent name
        if(requestType === 'IntentRequest') {
            return event.request.intent.name;
        } else if(requestType.startsWith('Display.') ||
                  requestType.startsWith('AudioPlayer.') ||
                  requestType.startsWith('PlaybackController.')) {
            // legacy cases, for backwards compatibility
            return requestType.split('.')[1];
        } else {
            // future: handler names will correspond directly to event name
            return requestType;
        }
    }
}

module.exports.EventParser = EventParser;