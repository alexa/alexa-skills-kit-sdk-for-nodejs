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

import { RequestEnvelope } from 'ask-sdk-model';
/* tslint:disable */
export const LaunchRequest : RequestEnvelope = {
    session: {
      new: true,
      sessionId: 'amzn1.echo-api.session.[unique-value-here]',
      attributes: {
        state : '',
      },
      user: {
        userId: 'amzn1.ask.account.[unique-value-here]'
      },
      application: {
        applicationId: 'mock application id in session'
      },
    },
    version: '1.0',
    request: {
    locale: 'en-US',
    timestamp: '2016-10-27T18:21:44Z',
    type: 'LaunchRequest',
    requestId: 'amzn1.echo-api.request.[unique-value-here]',
    },
    context: {
      Display : {},
      AudioPlayer: {
        playerActivity: 'IDLE',
      },
      System: {
        apiEndpoint : 'apiEndpoint',
        device: {
          deviceId : 'mock device id',
          supportedInterfaces: {
          AudioPlayer: {},
          },
        },
        application: {
          applicationId: 'mock application id',
        },
        user: {
          userId: 'amzn1.ask.account.[unique-value-here]',
        },
      },
    },
  };

  export const LaunchRequestUserIdFalse : RequestEnvelope = {
    session: {
      new: true,
      sessionId: 'amzn1.echo-api.session.[unique-value-here]',
      attributes: {
        state : '',
      },
      user: {
        userId: 'amzn1.ask.account.[unique-value-here]'
      },
      application: {
        applicationId: 'amzn1.ask.skill.[unique-value-here]'
      },
    },
    version: '1.0',
    request: {
    locale: 'en-US',
    timestamp: '2016-10-27T18:21:44Z',
    type: 'LaunchRequest',
    requestId: 'amzn1.echo-api.request.[unique-value-here]',
    },
    context: {
      Display : {},
      AudioPlayer: {
        playerActivity: 'IDLE',
      },
      System: {
        apiEndpoint : 'apiEndpoint',
        device: {
          deviceId : 'mock device id',
          supportedInterfaces: {
          AudioPlayer: {},
          },
        },
        application: {
          applicationId: 'amzn1.ask.skill.[unique-value-here]',
        },
        user: {
          userId: 'mock user id',
        },
      },
    },
  };

export const RecipeIntentRequest : RequestEnvelope = {
    session: {
      new: false,
      sessionId: 'amzn1.echo-api.session.[unique-value-here]',
      attributes: {},
      user: {
        userId: 'amzn1.ask.account.[unique-value-here]',
      },
      application: {
        applicationId: 'amzn1.ask.skill.[unique-value-here]',
      },
    },
    version: '1.0',
    request: {
      dialogState : 'COMPLETED',
      locale: 'en-US',
      timestamp: '2016-10-27T21:06:28Z',
      type: 'IntentRequest',
      requestId: 'amzn1.echo-api.request.[unique-value-here]',
      intent: {
        confirmationStatus : 'NONE',
        slots: {
          Item: {
            name: 'Item',
            value: 'snowball',
            confirmationStatus : 'NONE',
          },
        },
        name: 'RecipeIntent',
      },
    },
    context: {
      AudioPlayer: {
        playerActivity: 'IDLE',
      },
      System: {
        apiEndpoint : 'mock api endpoint',
        device: {
          deviceId : 'mock device id',
          supportedInterfaces: {
            AudioPlayer: {},
          },
        },
        application: {
          applicationId: 'amzn1.ask.skill.[unique-value-here]',
        },
        user: {
          userId: 'amzn1.ask.account.[unique-value-here]',
        },
      },
    },
  };

export const PlaybackControllerRequest : RequestEnvelope = {
    version: 'string',
    context: {
      System: {
        apiEndpoint : 'mock api endpoint',
        application: {
          applicationId : 'mock application id',
        },
        user: {
          userId : 'amzn1.ask.account.[unique-value-here]',
        },
        device: {
          deviceId : 'mock device id',
          supportedInterfaces : {
          },
        },
      },
      AudioPlayer: {
        token: 'string',
        offsetInMilliseconds: 0,
        playerActivity: 'FINISHED',
      }
    },
    request: {
      type: 'PlaybackController.NextCommandIssued',
      requestId: 'string',
      timestamp: 'string',
      locale: 'string',
    },
  };

export const DisplayElementSelectedRequest : RequestEnvelope= {
    version: 'string',
    context: {
      System: {
        apiEndpoint : 'mock api endpoint',
        application: {
          applicationId : 'mock application id',
        },
        user: {
          userId : 'mock user id',
        },
        device: {
          deviceId : 'mock device id',
          supportedInterfaces : {},
        }
      },
      AudioPlayer: {
        token: 'string',
        offsetInMilliseconds: 0,
        playerActivity: 'FINISHED',
      },
    },
    request: {
      type: 'Display.ElementSelected',
      requestId: 'amzn1.echo-api.request.7zzzzzzzzz',
      timestamp: '2017-06-06T20:05:04Z',
      locale: 'en-US',
      token: 'getTopicName-Cookie-Contest'
    }
  };

export const SkillEnabledRequest : RequestEnvelope = {
    version: 'string',
    context: {
      System: {
        device : {
          deviceId : 'mock device id',
          supportedInterfaces : {},
        },
        application: {
          applicationId: 'string'
        },
        user: {
          userId: 'string',
        },
        apiEndpoint: 'https://api.amazonalexa.com'
      }
    },
    request: {
      type: 'AlexaSkillEvent.SkillEnabled',
      timestamp: 'string',
      requestId: 'string'
    }
  };

export const HouseholdListEvent : RequestEnvelope = {
    version: 'string',
    context: {
      System: {
        device : {
          deviceId : 'mock device id',
          supportedInterfaces : {},
        },
        application: {
          applicationId: 'string'
        },
        user: {
          userId: 'string',
          accessToken: 'string',
          permissions: {
            consentToken: 'string'
          },
        },
        apiEndpoint: 'https://api.amazonalexa.com'
      }
    },
    request: {
      type: 'AlexaHouseholdListEvent.ItemsCreated',
      timestamp: 'string',
      requestId: 'string',
      body: {
        listId : 'string',
        listItemIds : [],
      }
    }
};
