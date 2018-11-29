******************
Processing Request
******************

Standard Request
================

Alexa communicates with the skill service via a request-response mechanism using HTTP over SSL/TLS. When a user interacts with an Alexa skill, your service receives a POST request containing a JSON body. The request body contains the parameters necessary for the service to perform its logic and generate a JSON-formatted response. Since Node.js can handle JSON natively, ASK SDK v2 for Node.js doesn't need to do JSON serialization and deserialization. The documentation on JSON structure of the request body can be found `here <https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#request-format>`_.

Handler Input
=============

Request handlers, request and response interceptors, and error handlers are all passed a ``HandlerInput`` object when invoked. This object exposes various entities useful in request processing, including:

-  **RequestEnvelope**: Contains the entire `request body <https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#request-body-syntax>`_ sent to skill
-  **ResponseBuilder**: Contains helper methods to build responses. See `Building Response <Building-Response.html>`_ section for more information.
-  **AttributesManager**: Provides access to request, session, and persistent attributes. See `Managing Attributes <Managing-Attributes.html>`_ section for more information.
-  **ServiceClientFactory**: Constructs service clients capable of calling Alexa APIs. See `Calling Alexa Service APIs <Calling-Alexa-Service-APIs.html>`_ section for more information.
-  **Context**: Provides an optional context object passed in by the host container. For example, for skills running on AWS Lambda, this is the `context object <https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html>`_ for the AWS Lambda method.

Request Handlers
================

Request handlers are responsible for handling one or more types of incoming requests. You can create request handlers by following the ``RequestHandler`` interface, which consists of two methods:

-  ``canHandle`` is called by the SDK to determine if the given handler is capable of processing the incoming request. This method accepts ``HandlerInput`` object and returns **true** if the handler can handle the request, or **false** otherwise. You can choose the conditions on which to base this determination, including the type or parameters of the incoming request, or skill attributes.
-  ``handle`` is called by the SDK when invoking the request handler. This method contains the handler’s request processing logic, accepts ``HandlerInput`` and returns a ``Response`` or ``Promise<Response>``.

Interface
---------

.. code:: typescript

   interface RequestHandler {
       canHandle(handlerInput: HandlerInput): Promise<boolean> | boolean;
       handle(handlerInput: HandlerInput): Promise<Response> | Response;
   }

Code Sample
-----------

The following example shows a request handler that can handle the ``HelloWorldIntent``.

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

    import {
        HandlerInput,
        RequestHandler,
    } from 'ask-sdk-core';
    import { Response } from 'ask-sdk-model';

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

The ``canHandle`` method detects if the incoming request is an ``IntentRequest`` and returns true if the intent name is ``HelloWorldIntent``. The ``handle`` method generates and returns a basic “Hello World” response.

The following example shows how to register request handlers with the SDK:

.. tabs::

  .. code-tab:: javascript

    const Alexa = require('ask-sdk-core');

    const skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        FooHandler,
        BarHandler,
        BazHandler)
      .create();

  .. code-tab:: typescript

    import { SkillBuilders } from 'ask-sdk-core';

    const skill = SkillBuilders.custom()
      .addRequestHandlers(
        FooHandler,
        BarHandler,
        BazHandler)
       .create();


.. note::

  The SDK calls the ``canHandle`` method on its request handlers in the order in which they were registered. In the example above, the SDK calls request handlers in the following order:

  1. FooHandler
  2. BarHandler
  3. BazHandler

  The SDK always chooses the first handler that is capable of handling a given request. In this example, if both ``FooHandler`` and ``BarHandler`` are capable of handling a particular request, ``FooHandler`` is always invoked. Keep this in mind when designing and registering request handlers.

Request and Response Interceptors
=================================

The SDK supports request and response interceptors that execute before and after ``RequestHandler`` execution, respectively. You can implement interceptors by following the ``RequestInterceptor`` interface or the ``ResponseInterceptor`` interface.

Both interceptor interfaces expose a single ``process`` method with a ``void`` return type. Request interceptors have access to the ``HandlerInput`` object, while response interceptors have access to the ``HandlerInput`` as well as the optional ``Response`` produced by the ``RequestHandler``.

Interface
---------

.. code:: typescript

   interface RequestInterceptor {
       process(handlerInput: HandlerInput): Promise<void> | void;
   }

   interface ResponseInterceptor {
       process(handlerInput: HandlerInput, response?: Response): Promise<void> | void;
   }

Request interceptors are invoked immediately before execution of the request handler for an incoming request. Request attributes provide a way for request interceptors to pass data and entities on to request handlers.

Response interceptors are invoked immediately after execution of the request handler. Because response interceptors have access to the output generated from execution of the request handler, they are ideal for tasks such as response sanitization and validation.

Code Sample
-----------

The following example shows a response interceptor that handles saving persistent attributes to database before the response is sent to Alexa.

.. tabs::

  .. code-tab:: javascript

    const PersistenceSavingResponseInterceptor = {
      process(handlerInput) {
        return new Promise((resolve, reject) => {
          handlerInput.attributesManager.savePersistentAttributes()
            .then(() => {
              resolve();
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    };

  .. code-tab:: typescript

    import {
      HandlerInput,
      ResponseInterceptor,
    } from 'ask-sdk-core';

    const PersistenceSavingResponseInterceptor : ResponseInterceptor = {
      process(handlerInput : HandlerInput) : Promise<void> {
        return handlerInput.attributesManager.savePersistentAttributes();
      },
    };

The following example shows how to register interceptors with the SDK:

.. tabs::

  .. code-tab:: javascript

    const Alexa = require('ask-sdk-core');

    const skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        FooHandler,
        BarHandler,
        BazHandler)
      .addRequestInterceptors(
        FooRequestInterceptor,
        BarRequestInterceptor)
      .addResponseInterceptors(
        FooResponseInterceptor,
        BarResponseInterceptor)
      .create();

  .. code-tab:: typescript

    import { SkillBuilders } from 'ask-sdk-core';

    const skill = SkillBuilders.custom()
      .addRequestHandlers(
        FooHandler,
        BarHandler,
        BazHandler)
      .addRequestInterceptors(
        FooRequestInterceptor,
        BarRequestInterceptor)
      .addResponseInterceptors(
        FooResponseInterceptor,
        BarResponseInterceptor)
      .create();

.. note::

  The SDK executes the request and response interceptors in the order in which they were registered. In the example above, SDK executes interceptors in the following order:

  1. FooRequestInterceptor
  2. BarRequestInterceptor
  3. <Request handler picked for the request>
  4. FooResponseInterceptor
  5. BarResponseInterceptor

Error Handlers
==============

Error handlers are similar to request handlers, but are instead responsible for handling one or more types of errors. They are invoked by the SDK when an unhandled error is thrown during the course of request processing.

All error handlers must follow the ``ErrorHandler`` interface, consisting of the following two methods:

-  ``canHandle``, which is called by the SDK to determine if the given handler is capable of handling the error. This method returns **true** if the handler can handle the error, or **false** if not. Return true in all cases to create a catch-all handler.
-  ``handle``, which is called by the SDK when invoking the error handler. This method contains all error handling logic, and returns a ``Response`` or ``Promise<Response>``.

Interface
---------

.. code:: typescript

   interface ErrorHandler {
       canHandle(handlerInput: HandlerInput, error: Error): Promise<boolean> | boolean;
       handle(handlerInput: HandlerInput, error: Error): Promise<Response> | Response;
   }

Code Sample
-----------

The following example shows an error handler that can handle any error with name that starts with “AskSdk”.

.. tabs::

  .. code-tab:: javascript

    const myErrorHandler = {
      canHandle(handlerInput, error) {
        return error.name.startsWith('AskSdk');
      },
      handle(handlerInput, error) {
        return handlerInput.responseBuilder
          .speak('An error was encountered while handling your request. Try again later')
          .getResponse();
      }
    };

  .. code-tab:: typescript

    import { HandlerInput } from 'ask-sdk-core';
    import { Response } from 'ask-sdk-model';

    const myErrorHandler = {
      canHandle(handlerInput : HandlerInput, error : Error) : boolean {
        return error.name.startsWith('AskSdk');
      },
      handle(handlerInput : HandlerInput, error : Error) : Response {
        return handlerInput.responseBuilder
          .speak('An error was encountered while handling your request. Try again later')
          .getResponse();
      },
    };

The handler’s ``canHandle`` method returns true if the incoming error has a name that starts with “AskSdk”. The ``handle`` method returns a graceful error response to the user.


The following example shows how to register error handlers with the SDK:

.. tabs::

  .. code-tab:: javascript

    const Alexa = require('ask-sdk-core');

    const skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        FooHandler,
        BarHandler,
        BazHandler)
      .addRequestInterceptors(
        FooRequestInterceptor,
        BarRequestInterceptor)
      .addResponseInterceptors(
        FooResponseInterceptor,
        BarResponseInterceptor)
      .addErrorHandlers(
        FooErrorHandler,
        BarErrorHandler)
      .create();

  .. code-tab:: typescript

    import { SkillBuilders } from 'ask-sdk-core';

    const skill = SkillBuilders.custom()
      .addRequestHandlers(
        FooHandler,
        BarHandler,
        BazHandler)
      .addRequestInterceptors(
        FooRequestInterceptor,
        BarRequestInterceptor)
      .addResponseInterceptors(
        FooResponseInterceptor,
        BarResponseInterceptor)
      .addErrorHandlers(
        FooErrorHandler,
        BarErrorHandler)
      .create();

.. note::

  Like request handlers, error handlers are executed in the order in which they were registered. For the example above, the SDK calls error handlers in the following order:

  1. FooErrorHandler
  2. BarErrorHandler
