==============
Skill Builders
==============

The SDK includes two ``SkillBuilder`` that construct the ``Skill``
instance. They both extend from the ``BaseSkillBuilder`` that contains
the following helper functions:

**Interface**

.. code:: typescript

   export interface BaseSkillBuilder {
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
   }

Custom Skill Builder
--------------------

``CustomSkillBuilder`` is avaliable in both ``ask-sdk-core`` and
``ask-sdk`` package. In addtion to the common helper function above,
``CustomSkillBuilder`` also provides functions that allows you to
register custom ``PersistentAdapter`` and ``ApiClient``.

**Interface**

.. code:: typescript

   interface CustomSkillBuilder extends BaseSkillBuilder {
       withPersistenceAdapter(persistenceAdapter : PersistenceAdapter) : this;
       withApiClient(apiClient : ApiClient) : this;
   }

Standard Skill Builder
----------------------

``StandardSkillBuilder`` is available only in the ``ask-sdk`` package.
It uses ``DynamoDbPersistenceAdapter`` and ``DefaultApiClient`` to
unlock full SDK features. It also provides helper functions for
configuring the Dynamo DB table options.

**Interface**

.. code:: typescript

   interface StandardSkillBuilder extends BaseSkillBuilder {
       withTableName(tableName : string) : this;
       withAutoCreateTable(autoCreateTable : boolean) : this;
       withPartitionKeyGenerator(partitionKeyGenerator : PartitionKeyGenerator) : this;
       withDynamoDbClient(customDynamoDBClient : DynamoDB) : this;
   }

The following example shows how to create skill builders using
``SkillBuilders`` provider.

.. code:: javascript

   const Alexa = require('ask-sdk');

   const customSkillBuilder = Alexa.SkillBuilders.custom();
   const standardSkillBuilder = Alexa.SkillBuilders.standard();
