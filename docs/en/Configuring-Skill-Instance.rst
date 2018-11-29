**************************
Configuring Skill Instance
**************************

Skill
=====

The ``Skill`` object is the integration of all your skill logic. It is responsible for initializing SDK utilties such as the ``AttributesManager`` and ``ServiceClientFactory`` and also kick off the request handling process.

Available Methods
-----------------

.. code-block:: javascript

  invoke(requestEnvelope : RequestEnvelope, context? : any) : Promise<ResponseEnvelope>;

Skill Builders
==============

The ``SkillBuilder`` provides helper functions for constructing the ``Skill``, setting custom user agent and create lambda integration handler. ASK SDK v2 for Node.js provides different implementations of ``SkillBuilder`` that offer different level of customization support, which is available through ``SkillBuilders`` object.

The following example shows how to create skill builders using ``SkillBuilders`` provider.

.. tabs::

  .. code-tab:: javascript

    const Alexa = require('ask-sdk');

    const customSkillBuilder = Alexa.SkillBuilders.custom();
    const standardSkillBuilder = Alexa.SkillBuilders.standard();

  .. code-tab:: typescript

    import { SkillBuilders } from 'ask-sdk';

    const customSkillBuilder = SkillBuilders.custom();
    const standardSkillBuilder = SkillBuilders.standard()

BaseSkillBuilder
----------------

``BaseSkillBuilder`` includes the most essential methods for configuring ``Skill``. It serves as the base for any future customization of the ``SkillBuilder``

Available Methods
^^^^^^^^^^^^^^^^^

.. code-block:: typescript

  addRequestHandler(matcher : ((handlerInput : HandlerInput) => Promise<boolean> | boolean) | string, executor : (handlerInput : HandlerInput) => Promise<Response> | Response) : this;
  addRequestHandlers(...requestHandlers : RequestHandler[]) : this;
  addRequestInterceptors(...executors : Array<RequestInterceptor | ((handlerInput : HandlerInput) => Promise<void> | void)>) : this;
  addResponseInterceptors(...executors : Array<ResponseInterceptor | ((handlerInput : HandlerInput, response? : Response) => Promise<void> | void)>) : this;
  addErrorHandler(matcher : (handlerInput : HandlerInput, error : Error) => Promise<boolean> | boolean, executor : (handlerInput : HandlerInput, error : Error) => Promise<Response> | Response) : this;
  addErrorHandlers(...errorHandlers : ErrorHandler[]) : this;
  withCustomUserAgent(customUserAgent : string) : this;
  withSkillId(skillId : string) : this;
  getSkillConfiguration() : SkillConfiguration;
  create() : Skill;
  lambda() : LambdaHandler;

CustomSkillBuilder
--------------------

``CustomSkillBuilder`` is available in both ``ask-sdk-core`` and ``ask-sdk`` package and includes all available methods from ``BaseSkillBuilder``. In addition, ``CustomSkillBuilder`` also provides functions that allows you to register custom ``PersistentAdapter`` and ``ApiClient``.

Available Methods
^^^^^^^^^^^^^^^^^

.. code-block:: typescript

  withPersistenceAdapter(persistenceAdapter : PersistenceAdapter) : this;
  withApiClient(apiClient : ApiClient) : this;

StandardSkillBuilder
--------------------

``StandardSkillBuilder`` is available only in the ``ask-sdk`` package and includes all available methods from ``BaseSkillBuilder``. It uses ``DynamoDbPersistenceAdapter`` and ``DefaultApiClient`` by default and provides conveninent helper methods for configuring ``DynamoDbPersistenceAdapter``.

Available Methods
^^^^^^^^^^^^^^^^^

.. code-block:: typescript

  withTableName(tableName : string) : this;
  withAutoCreateTable(autoCreateTable : boolean) : this;
  withPartitionKeyGenerator(partitionKeyGenerator : PartitionKeyGenerator) : this;
  withDynamoDbClient(customDynamoDBClient : DynamoDB) : this;
