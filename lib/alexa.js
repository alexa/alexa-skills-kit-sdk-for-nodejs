'use strict';


const EventEmitter = require('events').EventEmitter;
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const attributesHelper = require('./DynamoAttributesHelper');
const responseHandlers = require('./response');

const _StateString = 'STATE';

/**
 * Class representing overall handler, to register intent listeners.
 */
class AlexaRequestEmitter extends EventEmitter {}

/**
 * alexaRequestHandler - Make handler object, and register built-in events from response.js
 * Handler object extends EventEmitter.
 *
 * @param  {Object} event    Lambda event (request body)
 * @param  {Object} context  Lambda context
 * @param  {Object} callback Lambda callback
 * @return {Object}          AlexaRequestEmitter with preregistered events registered.
 */
function alexaRequestHandler(event, context, callback) {
  const newEvent = event;
  if (!newEvent.session) {
    newEvent.session = {attributes: {}};
  } else if (!event.session.attributes) {
    newEvent.session.attributes = {};
  }

  const handler = new AlexaRequestEmitter();
  handler.setMaxListeners(Infinity);

  Object.defineProperty(handler, '_event', {
    value: newEvent,
    writable: false,
  });

  Object.defineProperty(handler, '_context', {
    value: context,
    writable: false,
  });

  Object.defineProperty(handler, '_callback', {
    value: callback,
    writable: false,
  });

  Object.defineProperty(handler, 'state', {
    value: null,
    writable: true,
    configurable: true,
  });

  Object.defineProperty(handler, 'appId', {
    value: null,
    writable: true,
  });

  Object.defineProperty(handler, 'response', {
    value: {},
    writable: true,
  });

  Object.defineProperty(handler, 'dynamoDBTableName', {
    value: null,
    writable: true,
  });

  Object.defineProperty(handler, 'saveBeforeResponse', {
    value: false,
    writable: true,
  });

  Object.defineProperty(handler, 'i18n', {
    value: i18n,
    writable: true,
  });

  Object.defineProperty(handler, 'locale', {
    value: undefined,
    writable: true,
  });

  Object.defineProperty(handler, 'resources', {
    value: undefined,
    writable: true,
  });

  Object.defineProperty(handler, 'registerHandlers', {
    value: (...args) => {
      RegisterHandlers.apply(handler, args);
    },
    writable: false,
  });

  Object.defineProperty(handler, 'execute', {
    value: () => {
      HandleLambdaEvent.call(handler);
    },
    writable: false,
  });

  Object.defineProperty(handler, 't', {
    value: function t(...args) {
      return this.i18n.t(...args);
    },
    writable: false,
  });

  handler.registerHandlers(responseHandlers);

  return handler;
}

/**
 * HandleLambdaEvent - Set up i18next translation backend, then call ValidateRequest.
 *
 * NB: this keyword must be bound to handler object.
 *
 * @return {undefined}
 */
function HandleLambdaEvent() {
  this.locale = this._event.request.locale;
  if (this.resources) {
    this.i18n.use(sprintf).init({
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      returnObjects: true,
      lng: this.locale,
      resources: this.resources,
    }, (err) => {
      if (err) {
        throw new Error(`Error initializing i18next: ${err}`);
      }
      ValidateRequest.call(this);
    });
  } else {
    ValidateRequest.call(this);
  }
}

/**
 * ValidateRequest - Check that App IDs match, get attributes from DynamoDB, then call EmitEvent.
 *
 * NB: this keyword must be bound to handler object.
 *
 * @return {undefined}
 */
function ValidateRequest() {
  const event = this._event;
  const context = this._context;
  const handlerAppId = this.appId;

  let requestAppId = '';
  let userId = '';

  // Long-form audio enabled skills use event.context
  if (event.context) {
    requestAppId = event.context.System.application.applicationId;
    userId = event.context.System.user.userId;
  } else if (event.session) {
    requestAppId = event.session.application.applicationId;
    userId = event.session.user.userId;
  }

  if (!handlerAppId) {
    console.log('Warning: Application ID is not set');
  }

  try {
    // Validate that this request originated from authorized source.
    if (handlerAppId && (requestAppId !== handlerAppId)) {
      console.log(`The applicationIds don't match: ${requestAppId} and ${handlerAppId}`);
      context.fail(`Invalid ApplicationId: ${handlerAppId}`);
      return;
    }

    if (this.dynamoDBTableName && (!event.session.sessionId || event.session.new)) {
      attributesHelper.get(this.dynamoDBTableName, userId, (err, data) => {
        if (err) {
          context.fail(`Error fetching user state: ${err}`);
          return;
        }
        Object.assign(this._event.session.attributes, data);
      });
    }
    EmitEvent.call(this);
  } catch (e) {
    console.log(`Unexpected exception '${e}':\n${e.stack}`);
    context.fail(e);
  }
}

/**
 * EmitEvent - Parse lambda event and emit correct event string to handler.
 *
 * NB: this keyword must be bound to handler object.
 *
 * @fires eventString based off event.request
 * @return {undefined}
 */
function EmitEvent() {
  this.state = this._event.session.attributes[_StateString] || '';

  let eventString = '';

  if (this._event.session.new && this.listenerCount(`NewSession${this.state}`) === 1) {
    eventString = 'NewSession';
  } else if (this._event.request.type === 'LaunchRequest') {
    eventString = 'LaunchRequest';
  } else if (this._event.request.type === 'IntentRequest') {
    eventString = this._event.request.intent.name;
  } else if (this._event.request.type === 'SessionEndedRequest') {
    eventString = 'SessionEndedRequest';
  } else if (this._event.request.type.substring(0, 11) === 'AudioPlayer') {
    eventString = this._event.request.type.substring(12);
  } else if (this._event.request.type.substring(0, 18) === 'PlaybackController') {
    eventString = this._event.request.type.substring(19);
  }
  eventString += this.state;

  if (this.listenerCount(eventString) < 1) {
    eventString = `Unhandled${this.state}`;
  }

  if (this.listenerCount(eventString) < 1) {
    throw new Error(`No 'Unhandled' function defined for event: ${eventString}`);
  }

  this.emit(eventString);
}

/**
 * RegisterHandlers - Add all handlers to this, adding events for each property.
 *
 * NB: this keyword must be bound to handler object.
 *
 * @param  {...Object} args  Array of all handlers to register
 * @return {undefined}
 */
function RegisterHandlers(...args) {
  args.forEach((handlerObject) => {
    if (!isObject(handlerObject)) {
      throw new Error(`Argument #${args.indexOf(handlerObject)} was not an Object.`);
    }

    const eventNames = Object.keys(handlerObject);

    eventNames.forEach((eventName) => {
      let stateEventName = eventName;

      if (typeof (handlerObject[eventName]) !== 'function') {
        throw new Error(`Event handler for '${eventName}' was not a function`);
      }

      if (handlerObject[_StateString]) {
        stateEventName += handlerObject[_StateString];
      }

      /**
       * Context that registered handlers are bound too.
       */
      const handlerContext = {
        on: this.on.bind(this),
        emit: this.emit.bind(this),
        emitWithState: EmitWithState.bind(this),
        state: this.state,
        handler: this,
        i18n: this.i18n,
        locale: this.locale,
        t: this.t,
        event: this._event,
        attributes: this._event.session.attributes,
        context: this._context,
        name: stateEventName,
        isOverridden: IsOverridden.bind(this, stateEventName),
        response: responseBuilder(this),
      };

      this.on(stateEventName, handlerObject[eventName].bind(handlerContext));
    });
  });
}

/**
 * isObject - Detect whether parameter is an object
 *
 * @param  {Object}  obj Object to check
 * @return {boolean}     If obj is an object
 */
function isObject(obj) {
  return (!!obj) && (obj.constructor === Object);
}

/**
 * IsOverridden - Detect whether one of the inbuilt listeners is overridden.
 *
 * NB:  Cannot itself differentiate between overridden and overriding event.
 *      This simply checks if there's more than one listener.
 *
 * @param  {string} name     Event name to be checked
 * @return {boolean}         If there is more than one listener for the event.
 */
function IsOverridden(name) {
  return this.listenerCount(name) > 1;
}

/**
 * ResponseBuilder - Form closure used to manually build responses.
 *
 * @param  {Object} self  Object to take response from, and set response too
 * @return {Object}       Object with methods to create your own response
 */
function responseBuilder(self) {
  const responseObject = self.response;
  responseObject.version = '1.0';
  responseObject.response = {
    shouldEndSession: true,
  };
  responseObject.sessionAttributes = self._event.session.attributes;

  return (function buildResponse() {
    return {

      /**
       * speak - Set speechOutput of responseObject to given string
       *
       * @param  {string} speechOutput  String to output
       * @return {Object}               this, to make methods chainable
       */
      speak(speechOutput) {
        responseObject.response.outputSpeech = createSSMLSpeechObject(speechOutput);
        return this;
      },

      /**
       * listen - Set repromptSpeech of responseObject to given string.
       *          Set shouldEndSession to false.
       *
       * @param  {string} repromptSpeech  String to remprompt
       * @return {Object}                 this, to make methods chainable
       */
      listen(repromptSpeech) {
        responseObject.response.reprompt = {
          outputSpeech: createSSMLSpeechObject(repromptSpeech),
        };
        responseObject.response.shouldEndSession = false;
        return this;
      },

      /**
       * cardRenderer - Set card property of responseObject using parameters
       *
       * @param  {string} cardTitle   Title of card
       * @param  {string} cardContent Content of card
       * @param  {Object} cardImage   Image object for card
       * @return {Object}             this, to make methods chainable
       */
      cardRenderer(cardTitle, cardContent, cardImage) {
        const card = {
          type: 'Simple',
          title: cardTitle,
          content: cardContent,
        };

        if (cardImage && (cardImage.smallImageUrl || cardImage.largeImageUrl)) {
          card.type = 'Standard';
          card.image = {};

          delete card.content;
          card.text = cardContent;

          if (cardImage.smallImageUrl) {
            card.image.smallImageUrl = cardImage.smallImageUrl;
          }

          if (cardImage.largeImageUrl) {
            card.image.largeImageUrl = cardImage.largeImageUrl;
          }
        }

        responseObject.response.card = card;
        return this;
      },

      /**
       * linkAccountCard - Set type of card property to Link Account Card.
       *
       * @return {Object}  this, to make functions chainable
       */
      linkAccountCard() {
        responseObject.response.card = {
          type: 'LinkAccount',
        };
        return this;
      },

      /**
       * audioPlayer - Set up audio player directive, using any directive type.
       *
       * @param  {string} directiveType         Type of directive: 'play', 'stop', or 'clearqueue'
       * @param  {string} behavior              Playback behaviour: 'REPLACE_ALL', 'ENQUEUE', or 'REPLACE_ENQUEUED'
       * @param  {string} url                   URL of audio stream
       * @param  {string} token                 Opaque token representing audio stream
       * @param  {string} expectedPreviousToken Opaque token representing previous audio stream
       * @param  {string} offsetInMilliseconds  Timestamp at which Alexa should start playback
       * @return {Object}                       this, to make functions chainable
       */
      audioPlayer(directiveType, behavior, url, token, expectedPreviousToken, offsetInMilliseconds) {
        let audioPlayerDirective;
        if (directiveType === 'play') {
          audioPlayerDirective = {
            type: 'AudioPlayer.Play',
            playBehavior: behavior,
            audioItem: {
              stream: {
                url,
                token,
                expectedPreviousToken,
                offsetInMilliseconds,
              },
            },
          };
        } else if (directiveType === 'stop') {
          audioPlayerDirective = {
            type: 'AudioPlayer.Stop',
          };
        } else {
          audioPlayerDirective = {
            type: 'AudioPlayer.ClearQueue',
            clearBehavior: behavior,
          };
        }

        responseObject.response.directives = [audioPlayerDirective];
        return this;
      },

      /**
       * audioPlayerPlay - Set up audio player directive, using 'AudioPlayer.Play' directive type.
       *
       * @param  {string} behavior              Playback behaviour: 'REPLACE_ALL', 'ENQUEUE', or 'REPLACE_ENQUEUED'
       * @param  {string} url                   URL of audio stream
       * @param  {string} token                 Opaque token representing audio stream
       * @param  {string} expectedPreviousToken Opaque token representing previous audio stream
       * @param  {string} offsetInMilliseconds  Timestamp at which Alexa should start playback
       * @return {Object}                       this, to make functions chainable
       */
      audioPlayerPlay(behavior, url, token, expectedPreviousToken, offsetInMilliseconds) {
        const audioPlayerDirective = {
          type: 'AudioPlayer.Play',
          playBehavior: behavior,
          audioItem: {
            stream: {
              url,
              token,
              expectedPreviousToken,
              offsetInMilliseconds,
            },
          },
        };

        responseObject.response.directives = [audioPlayerDirective];
        return this;
      },

      /**
       * audioPlayerStop - Set up audio player directive, using 'AudioPlayer.Stop' as directive type.
       *
       * @return {Object} this, to make functions chainable
       */
      audioPlayerStop() {
        const audioPlayerDirective = {
          type: 'AudioPlayer.Stop',
        };

        responseObject.response.directives = [audioPlayerDirective];
        return this;
      },

      /**
       * audioPlayerClearQueue - Set up audio player directive, using 'AudioPlayer.ClearQueue' as directive type.
       *
       * @param  {string} clearBehavior Clear Behaviour: either 'CLEAR_ENQUEUED' or 'CLEAR_ALL'
       * @return {Object}               this, to make functions chainable
       */
      audioPlayerClearQueue(clearBehavior) {
        const audioPlayerDirective = {
          type: 'AudioPlayer.ClearQueue',
          clearBehavior,
        };

        responseObject.response.directives = [audioPlayerDirective];
        return this;
      },
    };
  }());
}

/**
 * createSSMLSpeechObject - Form SSML Object from string.
 *                          String is wrapped in <speak> tags.
 *
 * NB: Can't detect SSML-specific characters; they must be escaped with `\`.
 *
 * @param  {string} message String to wrap
 * @return {Object}         SSML object containing wrapped string
 */
function createSSMLSpeechObject(message) {
  return {
    type: 'SSML',
    ssml: `<speak> ${message} </speak>`,
  };
}

/**
 * createStateHandler - Make a handler, and sets its _StateString property.
 *
 * _StateString is detected by RegisterHandlers and appended to all event names.
 *
 * @param  {string} state State to become _StateString
 * @param  {Object} obj   Handler object
 * @return {Object}       Handler with _StateString property
 */
function createStateHandler(state, obj) {
  let stateObj = obj;
  if (!stateObj) {
    stateObj = {};
  }

  Object.defineProperty(stateObj, _StateString, {
    value: state || '',
  });

  return stateObj;
}


/**
 * EmitWithState - Emit intent to any state handler, using this.handler.state as state
 *
 * NB: Must be bound to correct handler.
 *
 * @param  {string} intent   Name of 'intent' event to emit
 * @param  {...Object} args  Other arguments to be emitted.
 * @return {undefined}
 */
function EmitWithState(intent, ...args) {
  let stateIntent = intent;
  if (!intent) {
    throw new Error('EmitWithState called without intent');
  }
  stateIntent = `${stateIntent}${this.state}`;

  if (this.listenerCount(stateIntent) < 1) {
    stateIntent = `Unhandled${this.state}`;
  }

  if (this.listenerCount(stateIntent) < 1) {
    throw new Error(`No 'Unhandled' function defined for event: ${stateIntent}`);
  }

  this.emit(stateIntent, args);
}


module.exports.LambdaHandler = alexaRequestHandler;
module.exports.CreateStateHandler = createStateHandler;
module.exports.StateString = _StateString;
