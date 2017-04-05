'use strict';

const EventEmitter = require('events').EventEmitter;
const util = require('util');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const attributesHelper = require('./DynamoAttributesHelper');
const responseHandlers = require('./response');

const _StateString = 'STATE';

class AlexaRequestEmitter extends EventEmitter {}

function isObject(obj) {
  return (!!obj) && (obj.constructor === Object);
}

function IsOverridden(name) {
  return this.listenerCount(name) > 1;
}

function createSSMLSpeechObject(message) {
  return {
    type: 'SSML',
    ssml: `<speak> ${message} </speak>`,
  };
}

function ResponseBuilder(self) {
  const responseObject = self.response;
  responseObject.version = '1.0';
  responseObject.response = {
    shouldEndSession: true,
  };
  responseObject.sessionAttributes = self._event.session.attributes;

  return (function buildResponse() {
    return {
      speak(speechOutput) {
        responseObject.response.outputSpeech = createSSMLSpeechObject(speechOutput);
        return this;
      },
      listen(repromptSpeech) {
        responseObject.response.reprompt = {
          outputSpeech: createSSMLSpeechObject(repromptSpeech),
        };
        responseObject.response.shouldEndSession = false;
        return this;
      },
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
      linkAccountCard() {
        responseObject.response.card = {
          type: 'LinkAccount',
        };
        return this;
      },
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
            type: 'AudioPlayer.Stop',
            clearBehavior: behavior,
          };
        }

        responseObject.response.directives = [audioPlayerDirective];
        return this;
      },
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
      audioPlayerStop() {
        const audioPlayerDirective = {
          type: 'AudioPlayer.Stop',
        };

        responseObject.response.directives = [audioPlayerDirective];
        return this;
      },
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

function EmitWithState(...args) {
  const stateArgs = args;
  if (arguments.length === 0) {
    throw new Error('EmitWithState called without arguments');
  }
  stateArgs[0] = `stateArgs[0]${this.state}`;

  if (this.listenerCount(stateArgs[0]) < 1) {
    stateArgs[0] = `Unhandled${this.state}`;
  }

  if (this.listenerCount(stateArgs[0]) < 1) {
    throw new Error(`No 'Unhandled' function defined for event: ${stateArgs[0]}`);
  }

  this.emit(...stateArgs);
}

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

function RegisterHandlers(...args) {
  for (let arg = 0; arg < args.length; arg += 1) {
    const handlerObject = args[arg];

    if (!isObject(handlerObject)) {
      throw new Error(`Argument #${arg} was not an Object`);
    }

    const eventNames = Object.keys(handlerObject);

    for (let i = 0; i < eventNames.length; i += 1) {
      if (typeof (handlerObject[eventNames[i]]) !== 'function') {
        throw new Error(`Event handler for '${eventNames[i]}' was not a function`);
      }

      let eventName = eventNames[i];

      if (handlerObject[_StateString]) {
        eventName += handlerObject[_StateString];
      }

      const localize = function localize(...localizeArgs) {
        return this.i18n.t(...localizeArgs);
      };

      const handlerContext = {
        on: this.on.bind(this),
        emit: this.emit.bind(this),
        emitWithState: EmitWithState.bind(this),
        state: this.state,
        handler: this,
        i18n: this.i18n,
        locale: this.locale,
        t: localize,
        event: this._event,
        attributes: this._event.session.attributes,
        context: this._context,
        name: eventName,
        isOverridden: IsOverridden.bind(this, eventName),
        response: ResponseBuilder(this),
      };

      this.on(eventName, handlerObject[eventNames[i]].bind(handlerContext));
    }
  }
}

function alexaRequestHandler(event, context, callback) {
  const newEvent = event;
  if (!newEvent.session) {
    newEvent.session = { attributes: {} };
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
    value: function registerHandlers(...args) {
      RegisterHandlers.apply(handler, args);
    },
    writable: false,
  });

  Object.defineProperty(handler, 'execute', {
    value: function execute() {
      HandleLambdaEvent.call(handler);
    },
    writable: false,
  });

  handler.registerHandlers(responseHandlers);

  return handler;
}

module.exports.LambdaHandler = alexaRequestHandler;
module.exports.CreateStateHandler = createStateHandler;
module.exports.StateString = _StateString;
