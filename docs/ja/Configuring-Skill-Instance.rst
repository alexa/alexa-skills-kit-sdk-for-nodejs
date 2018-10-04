=================
スキルビルダー
=================

SDKには、\ ``Skill``\ インスタンスを作成する2つの\ ``SkillBuilder``\ が含まれます。どちらも、以下のヘルパー関数を含む\ ``BaseSkillBuilder``\ から拡張されたものです。

**インターフェース**

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
       getRuntimeConfiguration() : SkillConfiguration;
       create() : Skill;
       lambda() : LambdaHandler;
   }

Custom Skill Builder
--------------------

``CustomSkillBuilder``\ は、\ ``ask-sdk-core``\ と\ ``ask-sdk``\ パッケージの両方で使用できます。上の共通のヘルパー関数に加えて、\ ``CustomSkillBuilder``\ にもカスタムの\ ``PersistentAdapter``\ と\ ``ApiClient``\ を登録できる関数があります。

**インターフェース**

.. code:: typescript

   interface CustomSkillBuilder extends BaseSkillBuilder {
       withPersistenceAdapter(persistenceAdapter : PersistenceAdapter) : this;
       withApiClient(apiClient : ApiClient) : this;
   }

Standard Skill Builder
----------------------

``StandardSkillBuilder``\ は\ ``ask-sdk``\ パッケージでのみ使用できます。SDKのすべての機能を制限なしで使えるようにするために、\ ``DynamoDbPersistentAdapter``\ と\ ``DefaultApiClient``\ を使用します。また、Dynamo
DBテーブルオプションを設定するヘルパー関数も提供します。

**インターフェース**

.. code:: typescript

   interface StandardSkillBuilder extends BaseSkillBuilder {
       withTableName(tableName : string) : this;
       withAutoCreateTable(autoCreateTable : boolean) : this;
       withPartitionKeyGenerator(partitionKeyGenerator : PartitionKeyGenerator) : this;
       withDynamoDbClient(customDynamoDBClient : DynamoDB) : this;
   }

以下は、\ ``SkillBuilders``\ プロバイダーを使用してスキルビルダーを作成する方法のサンプルです。

.. code:: javascript

   const Alexa = require('ask-sdk');

   const customSkillBuilder = Alexa.SkillBuilders.custom();
   const standardSkillBuilder = Alexa.SkillBuilders.standard();
