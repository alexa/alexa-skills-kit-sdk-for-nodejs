***********************
ASK SDK Migration Guide
***********************

This guide provides detailed instructions on how to use the ASK SDK v1 adapter with ASK SDK v2 for Node.js to migrate existing skills developed with ASK SDK v1 for Node.js (‘alexa-sdk’) to the v2 SDK (‘ask-sdk’).

Backwards Compatibility
=======================

The ASK SDK v1 adapter simplifies migrating v1 Alexa skills to the SDK v2 by offering backwards compatibility for ASK SDK v1 interfaces. With the v1 adapter, request handlers written in v1 and v2 coding styles can run side by side. This allows you to extend existing Alexa skills with v2-style request handlers, while updating existing handlers at your own pace. For new skills, make sure to start with the ASK SDK v2 for Node.js to take advantage of the v2 features.

Prerequisites
=============

- A `NPM <https://www.npmjs.com/>`_ project with a dependency on the standard ASK SDK module installed as described in the `Setting up the ASK SDK v2 for Node.js <Setting-Up-The-ASK-SDK.html>`_ section. The ASK SDK v1 adapter has a peer dependency of the standard ASK SDK v2 for Node.js distribution (‘ask-sdk’).
- A suitable Node.js development environment. The ASK SDK v2 for Node.js requires a Node.js version above 4.3.2.

Migration Steps
===============

Adding the ASK SDK v1 Adapter to Your Project
---------------------------------------------

From within your NPM project, run the following command to install the ASK SDK v1 Adapter module:

::

  npm install --save ask-sdk-v1adapter

Updating the Import Statement
-----------------------------

To port skill code that uses ASK SDK v1 for Node.js, import from the ``ask-sdk-v1adapter`` package instead of the ``alexa-sdk`` package. The adapter handles the internal logic translation and creates ``Skill`` instance using ASK SDK v2 for Node.js.

In your code, change this:

.. code:: javascript

  const Alexa = require('alexa-sdk');

To this:

.. code:: javascript

  const Alexa = require('ask-sdk-v1adapter');

The rest of your skill code can remain the same:

.. code:: javascript

  exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID // APP_ID is your skill id which can be found in the Amazon developer console where you create the skill.
    alexa.registerHandlers(...)
    alexa.execute();
  };

Adding v2 Request Handlers
--------------------------

ASK SDK v1 adapter allows v1 and v2 request handlers to run side-by-side. However, we recommend using v2 request handlers when extending your Alexa skill as it will provide full access to ASK SDK v2 for Node.js features.

The v2 request handlers are accessed *after* v1 request handlers, and only if there is no v1 handler that can handle the request. Therefore, if you replace a v1 handler with a v2 handler, make sure to remove the code for the v1 handler. Also, it’s important to remove the ``Unhandled`` function from your v1 handler if you are adding v2 handlers. Otherwise, all event will be captured ``Unhandled`` function before they reach v2 handlers.

The following code sample shows how to add a v2 request handler that can handle the ``AMAZON.HelpIntent`` to the existing `hello world sample skill <https://github.com/alexa/skill-sample-nodejs-hello-world/tree/last-with-sdk-v1>`_. In this example, the original v1 ``AMAZON.HelpIntent`` handler has been removed from the ``handlers`` constant.

.. code:: javascript

  'use strict';
  const Alexa = require('ask-sdk-v1adapter');

  exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.registerV2Handlers(HelpIntentHandler); // New API functions for registering v2 request handlers
    alexa.execute();
  };

  const handlers = {
    'LaunchRequest': function () {
      this.emit('SayHello');
    },
    'HelloWorldIntent': function () {
      this.emit('SayHello');
    },
    'SayHello': function () {
      this.response.speak('Hello World!');
      this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
      this.response.speak('Goodbye!');
      this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
      this.response.speak('See you later!');
      this.emit(':responseReady');
    }
  };

  // HelpIntentHandler re-written following v2 request handler interface
  const HelpIntentHandler = {
    canHandle({requestEnvelope}) {
      return requestEnvelope.request.type === 'IntentRequest'
      && requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle({responseBuilder}){
      const speechOutput = 'This is the Hello World Sample Skill. ';
      const reprompt = 'Say hello, to hear me speak.';
      return responseBuilder
        .speak(speechOutput)
        .reprompt(reprompt)
        .getResponse();
    },
  };
