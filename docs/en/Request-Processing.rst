==================
Request Processing
==================

Request Handlers
----------------

Request handlers are responsible for handling one or more types of
incoming requests. You can create request handlers by following the
``RequestHandler`` interface, which consists of two functions:

-  ``canHandle`` is called by the SDK to determine if the given handler
   is capable of processing the incoming request. This function accepts
   ``HandlerInput`` object and returns **true** if
   the handler can handle the request, or **false** if not. You can
   choose the conditions on which to base this determination, including
   the type or parameters of the incoming request, or skill attributes.
-  ``handle`` is called by the SDK when invoking the request handler.
   This function contains the handler’s request processing logic,
   accepts ``HandlerInput`` and returns a
   ``Response`` or ``Promise<Response>``.

**Interface**

.. code:: typescript

   interface RequestHandler {
       canHandle(handlerInput: HandlerInput): Promise<boolean> | boolean;
       handle(handlerInput: HandlerInput): Promise<Response> | Response;
   }

The following example shows a request handler that can handle the
``HelloWorldIntent``.

.. code:: javascript

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

The ``canHandle`` function detects if the incoming request is an
``IntentRequest`` and returns true if the intent name is
``HelloWorldIntent``. The ``handle`` function generates and returns a
basic “Hello World” response.

The SDK calls the ``canHandle`` function on its request handlers in the
order in which they were provided to the ``Skill`` builder.

::

   const skill = Alexa.SkillBuilders.custom()
               .addRequestHandlers(FooHandler,
                                   BarHandler,
                                   BazHandler)
               .create();

In this example, the SDK calls request handlers in the following order:

1. FooHandler
2. BarHandler
3. BazHandler

The SDK always chooses the first handler that is capable of handling a
given request. In this example, if both FooHandler and BarHandler are
capable of handling a particular request, FooHandler is always invoked.
Keep this in mind when designing and registering request handlers.

Request and Response Interceptors
---------------------------------

The SDK supports request and response interceptors that execute before
and after ``RequestHandler`` execution, respectively. You can implement
interceptors by following the ``RequestInterceptor`` interface or the
``ResponseInterceptor`` interface.

Both interceptor interfaces expose a single ``process`` function with a
void return type. Request interceptors have access to the
``HandlerInput`` object, while response
interceptors have access to the ``HandlerInput`` as
well as the optional ``Response`` produced by the ``RequestHandler``.

**Interfaces**

.. code:: typescript

   interface RequestInterceptor {
       process(handlerInput: HandlerInput): Promise<void> | void;
   }

   interface ResponseInterceptor {
       process(handlerInput: HandlerInput, response?: Response): Promise<void> | void;
   }

The following example shows a response intercetpor that handles saving
persistent attributes to database before the response is sent to Alexa.

.. code:: javascript

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

Request interceptors are invoked immediately before execution of the
request handler for an incoming request. Request attributes provide a
way for request interceptors to pass data and entities on to request
handlers.

Response interceptors are invoked immediately after execution of the
request handler. Because response interceptors have access to the output
generated from execution of the request handler, they are ideal for
tasks such as response sanitization and validation.

The following example shows how to register an interceptor with the SDK
on the ``Skill`` builder:

.. code:: javascript

   const skill = Alexa.SkillBuilders.custom()
               .addRequestHandlers(FooHandler,
                                   BarHandler,
                                   BazHandler)
               .addRequestInterceptors(FooRequestInterceptor)
               .addResponseInterceptors(BarResponseInterceptor)
               .create();

Error Handlers
--------------

Error handlers are similar to request handlers, but are instead
responsible for handling one or more types of errors. They are invoked
by the SDK when an unhandled error is thrown during the course of
request processing.

All error handlers must follow the ``ErrorHandler`` interface,
consisting of the following two functions:

-  ``canHandle``, which is called by the SDK to determine if the given
   handler is capable of handling the error. This function returns
   **true** if the handler can handle the error, or **false** if not.
   Return true in all cases to create a catch-all handler.
-  ``handle``, which is called by the SDK when invoking the error
   handler. This function contains all error handling logic, and returns
   a ``Response`` or ``Promise<Response>``.

**Interface**

.. code:: typescript

   interface ErrorHandler {
       canHandle(handlerInput: HandlerInput, error: Error): Promise<boolean> | boolean;
       handle(handlerInput: HandlerInput, error: Error): Promise<Response> | Response;
   }

The following example shows an error handler that can handle any error
with name that starts with “AskSdk”.

.. code:: javascript

   const myErrorHandler = {
       canHandle(handlerInput, error) {
           return error.name.startsWith('AskSdk');
       },
       handle(handlerInput, error) {
           return handlerInput.responseBuilder
               .speak('An error was encountered while handling your request. Try again later')
               .getResponse();
       }
   }

The handler’s ``canHandle`` function returns true if the incoming error
has a name that starts with “AskSdk”. The ``handle`` function returns a
graceful error response to the user.

Like request handlers, error handlers are executed in the order in which
they were provided to the Skill.

.. _HandlerInput:

Handler Input
-------------

Request handlers, request and response interceptors, and error handlers
are all passed a ``HandlerInput`` object when invoked. This object
exposes various entities useful in request processing, including:

-  **RequestEnvelope**: Contains the entire `request
   body <https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#request-body-syntax>`__
   sent to skill.
-  **AttributesManager**: Provides access to request, session, and
   persistent attributes.
-  **ServiceClientFactory**: Constructs service clients capable of
   calling Alexa APIs.
-  **ResponseBuilder**: Contains helper function to build responses.
-  **Context**: Provides an optional, context object passed in by the
   host container. For example, for skills running on AWS Lambda, this
   is the `context
   object <https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html>`__
   for the AWS Lambda function.
