'use strict';
var aws = require('aws-sdk');
var ma;

module.exports = function MobileAnalyticsHelper() {

    this._init = function(options) {
        this.options = options || {};

        if (options.appId === undefined) {
            console.log('Mobile Analytics ApplicationId must be set.');
            return null; //No need to run rest of init since appId is required
        }

        this.options.apiVersion = this.options.apiVersion || '2014-06-05';
        this.options.platform = this.options.platform || 'linux';
        this.options.clientContext = this.options.clientContext || {
            'client': {
                'client_id': this.options.clientId,
                'app_title': this.options.appTitle,
                'app_version_name': this.options.appVersionName,
                'app_version_code': this.options.appVersionCode,
                'app_package_name': this.options.appPackageName
            },
            'env': {
                'platform': this.options.platform,
                'platform_version': this.options.platformVersion,
                'model': this.options.model,
                'make': this.options.make,
                'locale': this.options.locale
            },
            'services': {
                'mobile_analytics': {
                    'app_id': this.options.appId
                }
            },
            'custom': {}
        };

        if (!ma) {
            ma = new aws.MobileAnalytics({ apiVersion: this.options.apiVersion });
        }        
    };


    this._stopSession = function (sessionId, callback) {
        console.log('Mobile Analytics - Stop Session: ' + sessionId);
        this.stopTimestamp = new Date().toISOString();

        this.recordEvent('_session.stop', sessionId, null, null, (err, data) => {
            if (callback) {
                callback(err, data);
            }
        });        
    };


    this._createEvent = function(eventType, sessionId, attributes, metrics) {
        var event = {
            eventType: eventType,
            timestamp: new Date().toISOString(),
            attributes: attributes || {},
            session: {
                'id': sessionId.substr(sessionId.length - 50)
            },
            version: 'v2.0',
            metrics: metrics || {}
        };

        if (this.startTimestamp) {
            event.session.startTimestamp = this.startTimestamp;
        }

        if (this.stopTimestamp) {
            event.session.stopTimestamp = this.stopTimestamp;
            event.session.duration = new Date(this.stopTimestamp).getTime() - new Date(this.startTimestamp).getTime();            
        }

        console.log('Mobile Analytics - Create Event: ' + eventType + ', ' + sessionId);

        return event;
    };


    this._recordRequest = function (event, callback) {

        var eventType = event.request.type;
        var isNewSession =  event.session['new'];
        var events = [];
            
        if (event.session.sessionId && isNewSession) {

            console.log('Mobile Analytics - Start Session: ' + event.session.sessionId);

            this.startTimestamp = new Date().toISOString();
            
            // Create event for session start
            var sessionStartEvent = this._createEvent('_session.start', event.session.sessionId);
            events.push(sessionStartEvent);
        }
        else {

            console.log('Mobile Analytics - Continue Session: ' + event.session.sessionId);

            if (event.session.attributes.sessionStartTimestamp) {
                this.startTimestamp = event.session.attributes.sessionStartTimestamp;
            }
        }

        // Create event for eventType
        var maAttributes = {};            

        // If event is an intent, use intent name as eventType and add slots to attributes
        if (event.request.intent) {
            eventType = event.request.intent.name;
            maAttributes.NewSession = isNewSession.toString();
        
            if (event.request.intent.slots != undefined) {
                for (var key in event.request.intent.slots) {
                    if (event.request.intent.slots.hasOwnProperty(key)) {
                        var name = event.request.intent.slots[key].name;
                        maAttributes[name] = event.request.intent.slots[key].value;
                    }
                }
            }
        }

        var customEvent = this._createEvent(eventType, event.session.sessionId, maAttributes); 
        events.push(customEvent);

        this._recordEvents(events, (err, data) => {
            if (callback) {
                callback(err, data);
            }            
        });
    };    


    this._recordEvents = function (events, callback) {
        var params = {
            clientContext: JSON.stringify(this.options.clientContext),
            events: events
        };

        ma.putEvents(params, (err, data) => {
            if (err) {
                console.log('Mobile Analytics - Error on putEvents:' + err);

                if (callback) {
                    callback(err, {});
                }
                
            }
            else {
                console.log('Mobile Analytics - Successful putEvents.');
                if (callback) {
                    callback(null, {});
                }
            }
        });    
    };


    this.recordEvent = function (eventType, sessionId, attributes, metrics, callback) {
        var events = [];

        var customEvent = this._createEvent(eventType, sessionId, attributes, metrics); 
        events.push(customEvent);

        this._recordEvents(events, (err, data) => {
            if (callback) {
                callback(err, data);
            }  
        });        
    };
};