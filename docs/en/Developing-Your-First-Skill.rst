***************************
Developing Your First Skill
***************************

This guide walks you through developing your first skill with the ASK SDK v2 for Node.js.

Prerequisites
=============

-  An `Amazon Developer <https://developer.amazon.com/>`_ account. This is required to create and configure Alexa skills.
-  An `Amazon Web Services (AWS) <https://aws.amazon.com/>`_ account. This guide will walk you through hosting a skill on AWS Lambda.
-  A `NPM <https://www.npmjs.com/>`_ project with a dependency on the SDK installed as described in the `Setting up the ASK SDK v2 for Node.js <Setting-Up-The-ASK-SDK.html>`_ section. This sample skill requires either the standard SDK distribution, or if customizing your dependencies, requires that you install the support modules for the core SDK.

Writing the Skill Code
======================

The following section walks through writing the skill code handler by handler.

.. note::

  ASK SDK v2 for Node.js bundles TypeScript definition files for use in TypeScript Project. While this guide is written in context of creating an Alexa Skill using native JavaScript, the corresponding TypeScript code snippets are also provided for Reference. Please see this `link <https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html>`_ for information on getting started with a TypeScript project.

Importing Dependencies
----------------------

Create a file called ``index.js`` (``index.ts`` if you are using TypeScript. Same for section below) and paste in the following code.

.. tabs::

  .. code-tab:: javascript

    const Alexa = require('ask-sdk-core');

  .. code-tab:: typescript

    import {
      ErrorHandler,
      HandlerInput,
      RequestHandler,
      SkillBuilders,
    } from 'ask-sdk-core';
    import {
      Response,
      SessionEndedRequest,
    } from 'ask-sdk-model';

Adding Request Handlers
-----------------------------

First create the request handlers needed to handle the different types of incoming requests to your skill.

LaunchRequest Handler
^^^^^^^^^^^^^^^^^^^^^

The following code example shows how to configure a handler to be invoked when the skill receives a ``LaunchRequest``. The ``LaunchRequest`` event occurs when the skill is invoked without a specific intent.

.. tabs::

  .. code-tab:: javascript

    const LaunchRequestHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
      },
      handle(handlerInput) {
        const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      }
    };

  .. code-tab:: typescript

    const LaunchRequestHandler : RequestHandler = {
      canHandle(handlerInput : HandlerInput) : boolean {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
      },
      handle(handlerInput : HandlerInput) : Response {
        const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      },
    };

The ``canHandle`` function returns true if the incoming request is a ``LaunchRequest``. The ``handle`` function generates and returns a basic greeting response.

HelloWorldIntent Handler
^^^^^^^^^^^^^^^^^^^^^^^^

The following code example shows how to configure a handler to be invoked when the skill receives the ``HelloWorldIntent``.

Paste the following code into your ``index.js`` file, after the previous handler.

.. tabs::

  .. code-tab:: javascript

    const HelloWorldIntentHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
      },
      handle(handlerInput) {
        const speechText = 'Hello World!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      }
    };

  .. code-tab:: typescript

    const HelloWorldIntentHandler : RequestHandler = {
      canHandle(handlerInput : HandlerInput) : boolean {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
      },
      handle(handlerInput : HandlerInput) : Response {
        const speechText = 'Hello World!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      },
    };

The ``canHandle`` function detects if the incoming request is an ``IntentRequest``, and returns true if the intent name is ``HelloWorldIntent``. The ``handle`` function generates and returns a basic “Hello world” response.

HelpIntent Handler
^^^^^^^^^^^^^^^^^^

The following code example shows how to configure a handler to be invoked when the skill receives the built in intent ``AMAZON.HelpIntent``.

Paste the following code into your ``index.js`` file, after the previous handler.

.. tabs::

  .. code-tab:: javascript

    const HelpIntentHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
      },
      handle(handlerInput) {
        const speechText = 'You can say hello to me!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      }
    };

  .. code-tab:: typescript

    const HelpIntentHandler : RequestHandler = {
      canHandle(handlerInput : HandlerInput) : boolean {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
      },
      handle(handlerInput : HandlerInput) : Response {
        const speechText = 'You can say hello to me!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      },
    };

Similar to the previous handler, this handler matches an ``IntentRequest`` with the expected intent name. Basic help instructions are returned.

CancelAndStopIntent Handler
^^^^^^^^^^^^^^^^^^^^^^^^^^^

The CancelAndStopIntenthandler is similar to the HelpIntent handler, as it is also triggered by built-in intents. The following example uses a single handler to respond to two different intents, ``Amazon.CancelIntent`` and ``Amazon.StopIntent``.

Paste the following code into your ``index.js`` file, after the previous handler.

.. tabs::

  .. code-tab:: javascript

    const CancelAndStopIntentHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
            || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
      },
      handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      }
    };

  .. code-tab:: typescript

    const CancelAndStopIntentHandler : RequestHandler = {
      canHandle(handlerInput : HandlerInput) : boolean {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
            || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
      },
      handle(handlerInput : HandlerInput) : Response {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      },
    };

The response to both intents is the same, so having a single handler reduces repetitive code.

SessionEndedRequest Handler
^^^^^^^^^^^^^^^^^^^^^^^^^^^

Although you can not return a response with any speech, card or directives after receiving a ``SessionEndedRequest``, the SessionEndedRequestHandler is a good place to put your cleanup logic.

Paste the following code into your ``index.js`` file, after the previous handler.

.. tabs::

  .. code-tab:: javascript

    const SessionEndedRequestHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
      },
      handle(handlerInput) {
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
      }
    };

  .. code-tab:: typescript

    const SessionEndedRequestHandler : RequestHandler = {
      canHandle(handlerInput : HandlerInput) : boolean {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
      },
      handle(handlerInput : HandlerInput) : Response {
        console.log(`Session ended with reason: ${(handlerInput.requestEnvelope.request as SessionEndedRequest).reason}`);

        return handlerInput.responseBuilder.getResponse();
      },
    };


Adding Error Handler
--------------------

ASK SDK v2 for Node.js brings better support for error handling, making it easy for skill to ensure a fluent user experience. Error handler is a good place to inject your error handling logic such as unhandled request, api service time out, etc. The following sample adds a catch all error handler to your skill to ensure skill returns a meaningful message in case of all errors.

Paste the following code into your ``index.js`` file, after the previous handler.

.. tabs::

  .. code-tab:: javascript

    const ErrorHandler = {
      canHandle() {
        return true;
      },
      handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
          .speak('Sorry, I can\'t understand the command. Please say again.')
          .reprompt('Sorry, I can\'t understand the command. Please say again.')
          .getResponse();
      },
    };

  .. code-tab:: typescript

    const ErrorHandler : ErrorHandler = {
      canHandle(handlerInput : HandlerInput, error : Error ) : boolean {
        return true;
      },
      handle(handlerInput : HandlerInput, error : Error) : Response {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
          .speak('Sorry, I can\'t understand the command. Please say again.')
          .reprompt('Sorry, I can\'t understand the command. Please say again.')
          .getResponse();
      },
    };


Creating the Lambda Handler
---------------------------

The Lambda handler is the entry point for your AWS Lambda function. The following code example creates a Lambda handler function to route all inbound request to your skill. The Lambda handler function creates an SDK ``Skill`` instance configured with the request handlers that you just created.

Paste the following code into your ``index.js`` file, after the previous section.

.. tabs::

  .. code-tab:: javascript

    let skill;

    exports.handler = async function (event, context) {
      console.log(`REQUEST++++${JSON.stringify(event)}`);
      if (!skill) {
        skill = Alexa.SkillBuilders.custom()
          .addRequestHandlers(
            LaunchRequestHandler,
            HelloWorldIntentHandler,
            HelpIntentHandler,
            CancelAndStopIntentHandler,
            SessionEndedRequestHandler,
          )
          .addErrorHandlers(ErrorHandler)
          .create();
      }

      const response = await skill.invoke(event, context);
      console.log(`RESPONSE++++${JSON.stringify(response)}`);

      return response;
    };

  .. code-tab:: typescript

    let skill;

    exports.handler = async (event, context) => {
      console.log(`REQUEST++++${JSON.stringify(event)}`);
      if (!skill) {
        skill = SkillBuilders.custom()
          .addRequestHandlers(
            LaunchRequestHandler,
            HelloWorldIntentHandler,
            HelpIntentHandler,
            CancelAndStopIntentHandler,
            SessionEndedRequestHandler,
          )
          .addErrorHandlers(ErrorHandler)
          .create();
      }

      const response = await skill.invoke(event, context);
      console.log(`RESPONSE++++${JSON.stringify(response)}`);

      return response;
    };

The function creates an SDK instance using the ``SkillBuilders.custom`` builder. The ``addRequestHandlers`` builder function registers the request handlers. The function is exported as the Lambda handler function.

Alternatively, ASK SDK v2 for Node.js also provides a ``lambda`` builder function for easy constructing the Lambda handler function that invokes the ``Skill`` instance and return the response. See the following example:

.. tabs::

  .. code-tab:: javascript

    exports.handler = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
      .addErrorHandlers(ErrorHandler)
      .lambda();

  .. code-tab:: typescript

    exports.handler = SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .addErrorHandlers(ErrorHandler)
      .lambda();

Creating the Skill Package
==========================

With the skill code complete, you can create the skill package. To prepare the skill for upload to AWS Lambda, create a zip file that contains the skill file plus the ``node_modules`` folder. Make sure to compress all project files directly, **NOT** the project folder.

Uploading Your Skill to AWS Lambda
==================================

Refer to `Hosting a Custom Skill as an AWS Lambda Function <https://developer.amazon.com/docs/custom-skills/host-a-custom-skill-as-an-aws-lambda-function.html>`_ for a walkthrough on creating a AWS Lambda function with the correct role for your skill. When creating the function, select the “Author from scratch” option and select the Node.js 8.10 runtime.

Once you’ve created your AWS Lambda function and configured “Alexa Skills Kit” as a trigger, upload the .zip file produced in the previous step and leave the handler as default ``index.handler``. Finally, copy the ARN for your AWS Lambda function because you’ll need it when configuring your skill in the Amazon Developer console.

Configuring and Testing Your Skill
==================================

Now that the skill code has been uploaded to AWS Lambda, you can configure the skill with Alexa. Create a new skill:

1. Navigate to the `Alexa Skills Kit Developer Console <https://developer.amazon.com/alexa/console/ask>`_ and log in.
2. Click the **Create Skill** button in the upper right.
3. Enter “HelloWorld” as your skill name and click Next.
4. For the model, select **Custom** and click **Create skill**.

Next, define the interaction model for the skill. Select the **Invocation** option from the sidebar and enter “greeter” for the **Skill Invocation Name**.

Next, add an intent called ``HelloWorldIntent`` to the interaction model. Click the **Add** button under the Intents section of the Interaction Model. Leave “Create custom intent” selected, enter “HelloWorldIntent” for the intent name, and create the intent. On the intent detail page, add some sample utterances that users can say to invoke the intent. For this example, we’ve provided the following sample utterances, but feel free to add others.

::

   say hello
   say hello world
   hello
   say hi
   say hi world
   hi
   how are you

Since ``AMAZON.CancelIntent``, ``AMAZON.HelpIntent``, and ``AMAZON.StopIntent`` are built-in Alexa intents, you do not need to provide sample utterances for them.

The Developer Console also allows you to edit the entire skill model in JSON format. Select **JSON Editor** from the sidebar. For this sample, you can use the following JSON schema.

.. code:: json

  {
    "interactionModel": {
      "languageModel": {
        "invocationName": "greeter",
        "intents": [
          {
            "name": "AMAZON.CancelIntent",
            "samples": []
          },
          {
            "name": "AMAZON.HelpIntent",
            "samples": []
          },
          {
            "name": "AMAZON.StopIntent",
            "samples": []
          },
          {
            "name": "HelloWorldIntent",
            "slots": [],
            "samples": [
              "how are you",
              "hi",
              "say hi world",
              "say hi",
              "hello",
              "say hello world",
              "say hello"
            ]
          }
        ],
        "types": []
      }
    }
  }

Once you are done editing the interaction model, be sure to save and build the model.

Next, configure the endpoint for the skill. Under **Endpoint** select **AWS Lambda ARN** and paste in the ARN of the function you created previously. The rest of the settings can be left at their default values. Click **Save Endpoints**.

At this point you can test the skill. Click **Test** in the top navigation to go to the Test page. Make sure that the **Test is enabled for this skill** option is enabled. You can use the Test page to simulate requests, in text and voice form.

Use the invocation name along with one of the sample utterances we just configured as a guide. For example, “tell greeter to say hello” should result in your skill responding with “Hello world”. You should also be able to go to the Alexa App (on your phone or at https://alexa.amazon.com) and see your skill listed under **Your Skills**. From here, you can enable the skill on your account for testing from an Alexa enabled device.

At this point, feel free to start experimenting with your intents as well as the corresponding request handlers in your skill’s code. Once you’re finished iterating, you can optionally choose to move on to the process of getting your skill certified and published so it can be used by Alexa users worldwide.
