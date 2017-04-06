'use strict';

const attributesHelper = require('./DynamoAttributesHelper');

module.exports = (function() {
  return {
    /**
     * tell - Emit speechOutput to Alexa. End session.
     *        Can be overridden.
     *
     * @param  {string} speechOutput  Speech Output to emit
     * @return {undefined}
     */
    ':tell': function tell(speechOutput) {
      if (this.isOverridden()) {
        return;
      }

      this.handler.response = buildSpeechletResponse({
        sessionAttributes: this.attributes,
        output: getSSMLResponse(speechOutput),
        shouldEndSession: true,
      });
      this.emit(':responseReady');
    },

    /**
     * ask - Emit speech output and reprompt speech to Alexa. Don't end session.
     *       Can be overridden.
     *
     * @param  {string} speechOutput    Speech Output to emit
     * @param  {string} repromptSpeech  Reprompt Speech to emit
     * @return {undefined}
     */
    ':ask': function ask(speechOutput, repromptSpeech) {
      if (this.isOverridden()) {
        return;
      }
      this.handler.response = buildSpeechletResponse({
        sessionAttributes: this.attributes,
        output: getSSMLResponse(speechOutput),
        reprompt: getSSMLResponse(repromptSpeech),
        shouldEndSession: false,
      });
      this.emit(':responseReady');
    },

    /**
     * askWithCard - Emit speech output, reprompt speech, and card to Alexa. Don't end session.
     *               Can be overridden.
     *
     * @param  {string} speechOutput    Speech Output to emit
     * @param  {string} repromptSpeech  Reprompt Speech to emit
     * @param  {string} cardTitle       Title of card to emit
     * @param  {string} cardContent     Content of card to emit
     * @param  {obj}    imageObj        Image object with 'smallImageUrl' and 'largeImageUrl' properties
     * @return {undefined}
     */
    ':askWithCard': function askWithCard(speechOutput, repromptSpeech, cardTitle, cardContent, imageObj) {
      if (this.isOverridden()) {
        return;
      }

      this.handler.response = buildSpeechletResponse({
        sessionAttributes: this.attributes,
        output: getSSMLResponse(speechOutput),
        reprompt: getSSMLResponse(repromptSpeech),
        cardTitle,
        cardContent,
        cardImage: imageObj,
        shouldEndSession: false,
      });
      this.emit(':responseReady');
    },

    /**
     * tellWithCard - Emit speech output, and card to Alexa. End session.
     *                Can be overridden.
     *
     * @param  {string} speechOutput    Speech Output to emit
     * @param  {string} cardTitle       Title of card to emit
     * @param  {string} cardContent     Content of card to emit
     * @param  {obj}    imageObj        Image object with 'smallImageUrl' and 'largeImageUrl' properties
     * @return {undefined}
     */
    ':tellWithCard': function tellWithCard(speechOutput, cardTitle, cardContent, imageObj) {
      if (this.isOverridden()) {
        return;
      }

      this.handler.response = buildSpeechletResponse({
        sessionAttributes: this.attributes,
        output: getSSMLResponse(speechOutput),
        cardTitle,
        cardContent,
        cardImage: imageObj,
        shouldEndSession: true,
      });
      this.emit(':responseReady');
    },


    /**
     * tellWithLinkAccountCard - Emit speech output, and 'Link Account' card to Alexa. End session.
     *
     * @param  {string} speechOutput Speech Output to emit
     * @return {undefined}
     */
    ':tellWithLinkAccountCard': function tellWithLinkAccountCard(speechOutput) {
      if (this.isOverridden()) {
        return;
      }

      this.handler.response = buildSpeechletResponse({
        sessionAttributes: this.attributes,
        output: getSSMLResponse(speechOutput),
        cardType: 'LinkAccount',
        shouldEndSession: true,
      });
      this.emit(':responseReady');
    },

    /**
     * askWithLinkAccountCard - Emit speech output, reprompt speech, and 'Link Account' card to Alexa. Don't end session.
     *
     * @param  {string} speechOutput    Speech Output to emit
     * @param  {string} repromptSpeech  Reprompt Speech to emit
     * @return {undefined}
     */
    ':askWithLinkAccountCard': function askWithLinkAccountCard(speechOutput, repromptSpeech) {
      if (this.isOverridden()) {
        return;
      }

      this.handler.response = buildSpeechletResponse({
        sessionAttributes: this.attributes,
        output: getSSMLResponse(speechOutput),
        reprompt: getSSMLResponse(repromptSpeech),
        cardType: 'LinkAccount',
        shouldEndSession: false,
      });
      this.emit(':responseReady');
    },


    /**
     * responseReady - Emit this.handler.response to Alexa.
     *
     * TODO: Edit to use callback, rather than context.succeed.
     *
     * @return {undefined}
     */
    ':responseReady': function responseReady() {
      if (this.isOverridden()) {
        return;
      }

      if (this.handler.state) {
        this.handler.response.sessionAttributes.STATE = this.handler.state;
      }

      if (this.handler.dynamoDBTableName) {
        this.emit(':saveState');
        return;
      }

      this.context.succeed(this.handler.response);
    },


    /**
     * saveState - Save session if saveBeforeResponse is set to true, or session is about to end.
     *
     * @param  {boolean} forceSave Force a save, even if usual conditions aren't met.
     * @return {undefined}
     */
    ':saveState': function saveState(forceSave) {
      let userId = '';
      if (this.isOverridden()) {
        return;
      }

      if (forceSave && this.handler.state) {
        this.attributes.STATE = this.handler.state;
      }

      // Long-form audio enabled skills use event.context
      if (this.event.context) {
        userId = this.event.context.System.user.userId;
      } else if (this.event.session) {
        userId = this.event.session.user.userId;
      }

      if (this.saveBeforeResponse || forceSave || this.handler.response.response.shouldEndSession) {
        attributesHelper.set(this.handler.dynamoDBTableName, userId, this.attributes,
          (err) => {
            if (err) {
              this.emit(':saveStateError', err);
              return;
            }

            // To save the state when AudioPlayer Requests come without sending a response.
            if (Object.keys(this.handler.response).length === 0 && this.handler.response.constructor === Object) {
              this.handler.response = true;
            }

            this.context.succeed(this.handler.response);
          });
      } else {
        this.context.succeed(this.handler.response || true);
      }
    },


    /**
     * saveStateError - Logs error and fails, not sending response.
     *
     * @param  {type} err   Error to log
     * @return {undefined}
     */
    ':saveStateError': function saveStateError(err) {
      if (this.isOverridden()) {
        return;
      }
      console.log(`Error saving state: ${err}\n${err.stack}`);
      this.context.fail(err);
    },
  };
}());

/**
 * createSpeechObject - Form SSML object from parameter object.
 *
 * @param  {Object} optionsParam  Object with 'type' and 'speech' properties.
 * @return {Object}               SSML object containg message.
 */
function createSpeechObject(optionsParam) {
  if (optionsParam && optionsParam.type === 'SSML') {
    return {
      type: optionsParam.type,
      ssml: optionsParam.speech,
    };
  }
  return {
    type: optionsParam.type || 'PlainText',
    text: optionsParam.speech || optionsParam,
  };
}

/**
 * buildSpeechletResponse - Generate full speechlet response using options object.
 *
 * @param  {Object} options Object with properties to use in response.
 * @return {Object}         Response object with all parameters
 */
function buildSpeechletResponse(options) {
  const alexaResponse = {
    outputSpeech: createSpeechObject(options.output),
    shouldEndSession: options.shouldEndSession,
  };

  if (options.reprompt) {
    alexaResponse.reprompt = {
      outputSpeech: createSpeechObject(options.reprompt),
    };
  }

  if (options.cardTitle && options.cardContent) {
    alexaResponse.card = {
      type: 'Simple',
      title: options.cardTitle,
      content: options.cardContent,
    };

    if (options.cardImage && (options.cardImage.smallImageUrl || options.cardImage.largeImageUrl)) {
      alexaResponse.card.type = 'Standard';
      alexaResponse.card.image = {};

      delete alexaResponse.card.content;
      alexaResponse.card.text = options.cardContent;

      if (options.cardImage.smallImageUrl) {
        alexaResponse.card.image.smallImageUrl = options.cardImage.smallImageUrl;
      }

      if (options.cardImage.largeImageUrl) {
        alexaResponse.card.image.largeImageUrl = options.cardImage.largeImageUrl;
      }
    }
  } else if (options.cardType === 'LinkAccount') {
    alexaResponse.card = {
      type: 'LinkAccount',
    };
  }

  const returnResult = {
    version: '1.0',
    response: alexaResponse,
  };

  if (options.sessionAttributes) {
    returnResult.sessionAttributes = options.sessionAttributes;
  }
  return returnResult;
}

/**
 * getSSMLResponse - Form SSML Object from string.
 * String is wrapped in <speak> tags.
 *
 * NB: Cannot detect SSML-specific characters, so they must be escaped with backslash.
 *
 * @param  {string} message String to wrap
 * @return {Object}         SSML object containing wrapped string
 */
function getSSMLResponse(message) {
  if (message == null) {
    return null;
  }
  return {
    type: 'SSML',
    speech: `<speak> ${message} </speak>`,
  };
}
