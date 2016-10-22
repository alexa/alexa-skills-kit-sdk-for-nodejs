'use strict';
var aws = require('aws-sdk');
var mobileanalytics;

module.exports = function MobileAnalyticsHelper(options) {
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

    if (!mobileanalytics) {
        mobileanalytics = new aws.MobileAnalytics({ apiVersion: this.options.apiVersion });
    }

    this.startSession = function (sessionId) {
        this.startTimestamp = new Date().toISOString();
        this.recordEvent('_session.start', sessionId);
    };

    this.stopSession = function (sessionId) {
        this.stopTimestamp = new Date().toISOString();
        this.recordEvent('_session.stop', sessionId);
    };

    this.recordEvent = function (eventType, sessionId, attributes, metrics) {
        var event = {
            eventType: eventType,
            timestamp: new Date().toISOString(),
            attributes: attributes || {},
            session: {
                'id': sessionId
            },
            version: 'v2.0',
            metrics: metrics || {}
        };

        if (this.startTimestamp) {
            event.session.startTimestamp = this.startTimestamp;
        }

        if (this.stopTimestamp) {
            event.session.stopTimestamp = this.stopTimestamp;
            event.session.duration = new Date(event.stopTimestamp).getTime() - new Date(event.startTimestamp).getTime();            
        }


        var params = {
            clientContext: JSON.stringify(this.options.clientContext),
            events: [event]
        };

        mobileanalytics.putEvents(params, function (err, data) {
            if (err) {
                console.log('Error during MobileAnalytics putEvents:' + err);
            }
            else {
                console.log('Successful MobileAnalytics putEvents.');
            }
        })        

    };

};