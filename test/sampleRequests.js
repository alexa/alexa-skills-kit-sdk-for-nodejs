const LaunchRequest = {
  "session": {
    "new": true,
    "sessionId": "amzn1.echo-api.session.[unique-value-here]",
    "attributes": {},
    "user": {
      "userId": "amzn1.ask.account.[unique-value-here]"
    },
    "application": {
      "applicationId": "amzn1.ask.skill.[unique-value-here]"
    }
  },
  "version": "1.0",
  "request": {
    "locale": "en-US",
    "timestamp": "2016-10-27T18:21:44Z",
    "type": "LaunchRequest",
    "requestId": "amzn1.echo-api.request.[unique-value-here]"
  },
  "context": {
    "AudioPlayer": {
      "playerActivity": "IDLE"
    },
    "System": {
      "device": {
        "supportedInterfaces": {
          "AudioPlayer": {}
        }
      },
      "application": {
        "applicationId": "amzn1.ask.skill.[unique-value-here]"
      },
      "user": {
        "userId": "amzn1.ask.account.[unique-value-here]"
      }
    }
  }
};

const IntentRequest = {
  "session": {
    "new": false,
    "sessionId": "amzn1.echo-api.session.[unique-value-here]",
    "attributes": {},
    "user": {
      "userId": "amzn1.ask.account.[unique-value-here]"
    },
    "application": {
      "applicationId": "amzn1.ask.skill.[unique-value-here]"
    }
  },
  "version": "1.0",
  "request": {
    "locale": "en-US",
    "timestamp": "2016-10-27T21:06:28Z",
    "type": "IntentRequest",
    "requestId": "amzn1.echo-api.request.[unique-value-here]",
    "intent": {
      "slots": {
        "Item": {
          "name": "Item",
          "value": "snowball"
        }
      },
      "name": "RecipeIntent"
    }
  },
  "context": {
    "AudioPlayer": {
      "playerActivity": "IDLE"
    },
    "System": {
      "device": {
        "supportedInterfaces": {
          "AudioPlayer": {}
        }
      },
      "application": {
        "applicationId": "amzn1.ask.skill.[unique-value-here]"
      },
      "user": {
        "userId": "amzn1.ask.account.[unique-value-here]"
      }
    }
  }
};

const PlaybackControllerRequest = {
  "version": "string",
  "context": {
    "System": {
      "application": {},
      "user": {},
      "device": {}
    },
    "AudioPlayer": {
      "token": "string",
      "offsetInMilliseconds": 0,
      "playerActivity": "string"
    }
  },
  "request": {
    "type": "PlaybackController.NextCommandIssued",
    "requestId": "string",
    "timestamp": "string",
    "locale": "string"
  }
};

const DisplayElementSelectedRequest = {
  "version": "string",
  "context": {
    "System": {
      "application": {},
      "user": {},
      "device": {}
    },
    "AudioPlayer": {
      "token": "string",
      "offsetInMilliseconds": 0,
      "playerActivity": "string"
    }
  },
  "request": {
    "type": "Display.ElementSelected",
    "requestId": "amzn1.echo-api.request.7zzzzzzzzz",
    "timestamp": "2017-06-06T20:05:04Z",
    "locale": "en-US",
    "token": "getTopicName-Cookie-Contest"
  }
};

const SkillEnabledRequest = {
  "version": "string",
  "context": {
    "System": {
      "application": {
        "applicationId": "string"
      },
      "user": {
        "userId": "string",
        "consentToken": "string"
      },
      "apiEndpoint": "https://api.amazonalexa.com"
    }
  },
  "request": {
    "type": "AlexaSkillEvent.SkillEnabled",
    "timestamp": "string",
    "requestId": "string"
  }
};

const HouseholdListEvent = {
  "version": "string",
  "context": {
    "System": {
      "application": {
        "applicationId": "string"
      },
      "user": {
        "userId": "string",
        "accessToken": "string",
        "permissions": {
          "consentToken": "string"
        }
      },
      "apiEndpoint": "https://api.amazonalexa.com"
    }
  },
  "request": {
    "type": "AlexaHouseholdListEvent.ItemsCreated",
    "timestamp": "string",
    "requestId": "string",
    "body": {
      "listId" : "string",
      "listItemIds" : []
    }
  }
};

module.exports.LaunchRequest = LaunchRequest;
module.exports.IntentRequest = IntentRequest;
module.exports.PlaybackControllerRequest = PlaybackControllerRequest;
module.exports.DisplayElementSelectedRequest = DisplayElementSelectedRequest;
module.exports.SkillEnabledRequest = SkillEnabledRequest;
module.exports.HouseholdListEvent = HouseholdListEvent;