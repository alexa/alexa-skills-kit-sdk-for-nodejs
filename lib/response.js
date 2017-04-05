'use strict';

const attributesHelper = require('./DynamoAttributesHelper');

// TODO: check for ssml content in card
function getSSMLResponse(message) {
  if (message == null) {
    return null;
  }
  return {
    type: 'SSML',
    speech: `<speak> ${message} </speak>`,
  };
}

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

module.exports = (function exported() {
  return {
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
    ':saveStateError': function saveStateError(err) {
      if (this.isOverridden()) {
        return;
      }
      console.log(`Error saving state: ${err}\n${err.stack}`);
      this.context.fail(err);
    },
  };
}());
