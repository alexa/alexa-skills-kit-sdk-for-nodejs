****************************************************
スキルインスタンスのコンフィギュレーション
****************************************************

Skill - スキル
======================

``Skill``\ オブジェクトは、すべてのスキルロジックを統合したものです。このオブジェクトは、\ ``AttributesManager``\ や\ ``ServiceClientFactory``\ などのSDKユーティリティを初期化し、処理のリクエストを開始します。

利用可能なメソッド
--------------------------

.. code-block:: javascript

  invoke(requestEnvelope : RequestEnvelope, context? : any) : Promise<ResponseEnvelope>;

スキルビルダー
==============

``SkillBuilder``\ はスキルの作成、ユーザーエージェントのカスタマイズ、Lambda統合ハンドラーの作成に役立つ関数を提供します。ASK SDK v2 for Node.jsを使用することで、カスタマイズ可能な\ ``SkillBuilder``\ をさまざまな方法で実装できます（\ ``SkillBuilder``\ は\ ``SkillBuilders``\ オブジェクトから使用できます）。

以下は、\ ``SkillBuilders``\ プロバイダーを使用してスキルビルダーを作成する方法のサンプルです。

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

``BaseSkillBuilder``\ には、スキルの設定にもっとも重要なメソッドが含まれています。これが、\ ``SkillBuilder``\ をカスタマイズするための基礎となります。

利用可能なメソッド
^^^^^^^^^^^^^^^^^^^^^^^^^^

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
------------------

``CustomSkillBuilder``\ は\ ``ask-sdk-core``\ と\ ``ask-sdk``\ のパッケージで使用でき、これには\ ``BaseSkillBuilder``\ で使用できるすべてのメソッドが含まれています。また、\ ``CustomSkillBuilder``\ にもカスタムの\ ``PersistentAdapter``\ と\ ``ApiClient``\ を登録できる関数があります。

利用可能なメソッド
^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: typescript

  withPersistenceAdapter(persistenceAdapter : PersistenceAdapter) : this;
  withApiClient(apiClient : ApiClient) : this;

StandardSkillBuilder
--------------------

``StandardSkillBuilder``\ は\ ``ask-sdk``\ のパッケージでのみ使用でき、これには\ ``BaseSkillBuilder``\ で使用できるすべてのメソッドが含まれます。これはデフォルトで\ ``DynamoDbPersistenceAdapter``\ と\ ``DefaultApiClient``\ を使用し、\ ``DynamoDbPersistenceAdapter``\ の設定に役立つ便利なメソッドを提供します。

利用可能なメソッド
^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: typescript

  withTableName(tableName : string) : this;
  withAutoCreateTable(autoCreateTable : boolean) : this;
  withPartitionKeyGenerator(partitionKeyGenerator : PartitionKeyGenerator) : this;
  withDynamoDbClient(customDynamoDBClient : DynamoDB) : this;
