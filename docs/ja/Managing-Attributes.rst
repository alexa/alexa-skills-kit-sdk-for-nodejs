**************************************
アトリビュートの管理
**************************************

SDKを使うと、さまざまなスコープでアトリビュートの保存と取得が可能になります。たとえば、アトリビュートを使って後続のリクエストで取得するデータを保存できます。また、ハンドラーの ``canHandle`` ロジックでアトリビュートを使うことで、リクエストのルーティングに影響を与えることも可能です。

アトリビュートは、キーと値で構成されます。キーは ``String`` 型で強制型、値は無制限の ``Object`` 型です。セッションアトリビュートと永続アトリビュートの場合、値は保存して後で取得できるよう、シリアライズできるデータ型である必要があります。この制限はリクエストレベルのアトリビュートには適用されません。なぜならリクエストレベルのアトリビュートは、リクエスト処理のライフサイクルが終了すると、永続的に存在しないからです。


アトリビュートのスコープ
==================================

リクエストアトリビュート
------------------------------------

リクエストアトリビュートは、1回のリクエスト処理ライフサイクルの間のみ存続します。リクエストを受信した時点では、リクエストアトリビュートは空です。また応答が生成されると破棄されます。

リクエストアトリビュートは、リクエストと応答のインターセプターと合わせて使うと便利です。たとえば、リクエストインターセプターを使って追加のデータとヘルパークラスをリクエストアトリビュートに挿入して、リクエストハンドラーから取得できるようにすることが可能です。

セッションアトリビュート
------------------------------------

セッションアトリビュートは、現在のスキルセッションが継続している間存続します。セッションアトリビュートは、すべてのセッション内リクエストで使用できます。リクエスト処理のライフサイクル中に設定されたすべてのアトリビュートはAlexaサービスに返され、同じセッションの次のリクエストで提供されます。

セッションアトリビュートで、外部ストレージソリューションを使用する必要はありません。セッションアトリビュートはセッション外のリクエストの処理では使用できません。スキルセッションがクローズされると破棄されます。

永続アトリビュート
---------------------

永続アトリビュートは、現在のセッションのライフサイクルが終了しても存続します。主要なスコープ（ユーザーID、デバイスID）、TTL、ストレージレイヤーを含む、これらのアトリビュートがどのように保存されるかは `PersistenceAdapter`_ のコンフィギュレーションによって異なります。

.. note::

  永続アトリビュートは、PersistenceAdapterを使用して `スキルのインスタンスを設定 <Configuring-Skill-Instance.html>`_ する場合にのみ使用できます。PersistenceAdapterが設定されていない場合に、AttributesManagerを呼び出して永続アトリビュートの取得と保存を行おうとするとエラーが発生します。

AttributesManager
=================

``AttributesManager`` には、ハンドラーで取得や更新を行えるアトリビュートがあります。``AttributesManager`` は、``HandlerInput`` コンテナオブジェクトからハンドラーで使用できます。``AttributesManager`` は、スキルで必要なアトリビュートと直接やり取りできるように、アトリビュートの取得と保存を行います。``AttributesManager`` の詳細については、`TypeDoc <http://ask-sdk-node-typedoc.s3-website-us-east-1.amazonaws.com/interfaces/attributesmanager.html>`_ を参照してください。

利用可能なメソッド
----------------------------------

.. code-block:: typescript

  getRequestAttributes() : {[key : string] : any};
  getSessionAttributes() : {[key : string] : any};
  getPersistentAttributes() : Promise<{[key : string] : any}>;
  setRequestAttributes(requestAttributes : {[key : string] : any}) : void;
  setSessionAttributes(sessionAttributes : {[key : string] : any}) : void;
  setPersistentAttributes(persistentAttributes : {[key : string] : any}) : void;
  savePersistentAttributes() : Promise<void>;

以下は、永続アトリビュートの取得と保存を行う方法のサンプルです

.. tabs::

  .. code-tab:: javascript

    const PersistentAttributesHandler = {
      canHandle(handlerInput) {
        return new Promise((resolve, reject) => {
          handlerInput.attributesManager.getPersistentAttributes()
            .then((attributes) => {
              resolve(attributes.foo === 'bar');
            })
            .catch((error) => {
              reject(error);
            })
        });
      },
      handle(handlerInput) {
        return new Promise((resolve, reject) => {
          handlerInput.attributesManager.getPersistentAttributes()
            .then((attributes) => {
              attributes.foo = 'bar';
              handlerInput.attributesManager.setPersistentAttributes(attributes);

              return handlerInput.attributesManager.savePersistentAttributes();
            })
            .then(() => {
              resolve(handlerInput.responseBuilder
                .speak('Persistent attributes updated!')
                .getResponse());
            })
            .catch((error) => {
              reject(error);
            });
        });
      },
    };

  .. code-tab:: typescript

    import {
      HandlerInput,
      RequestHandler,
    } from 'ask-sdk-core';
    import { Response } from 'ask-sdk-model';

    const PersistentAttributesHandler : RequestHandler = {
      async canHandle(handlerInput : HandlerInput) : Promise<boolean> {
        const persistentAttributes = await  handlerInput.attributesManager.getPersistentAttributes();

        return persistentAttributes.foo === 'bar';

      },
      async handle(handlerInput : HandlerInput) : Promise<Response> {
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        persistentAttributes.foo = 'bar';
        handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);

        await handlerInput.attributesManager.savePersistentAttributes();

        return handlerInput.responseBuilder
          .speak('Persistent attributes updated!')
          .getResponse();
      },
    };

.. note::

  スキルのパフォーマンスを高めるため、 ``AttributesManager`` は永続アトリビュートをローカルにキャッシュします。 ``setPersistentAttributes()`` は、ローカルにキャッシュされた永続アトリビュートのみを更新します。永続アトリビュートを永続レイヤーに保存するには、 ``savePersistentAttributes()`` を呼び出す必要があります。

PersistenceAdapter
==================

``PersistenceAdapter`` は、永続レイヤー（データベースやローカルファイルシステムなど）でアトリビュートを保存したり取得したりする場合に ``AttributesManager`` が使用します。SDKを使用して、次のインターフェースに準拠する任意のカスタマイズ済み ``PersistenceAdapter`` を登録できます。

インターフェース
------------------------------

.. code-block:: typescript

  interface PersistenceAdapter {
    getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : any}>;
    saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : any}) : Promise<void>;
  }

DynamoDbPersistenceAdapter
------------------------------------

``ask-sdk-dynamodb-persistence-adapter`` パッケージは、`AWS DynamoDB <https://aws.amazon.com/jp/dynamodb/?nc1=f_ls>`_ を使って ``PersistenceAdapter`` を実装した ``DynamoDbPersistenceAdapter`` を提供します

コンストラクターの詳細
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    new DynamoDbPersistenceAdapter(config = {}) => Object

``DynamoDbPersistenceAdapter`` オブジェクトを構築します。このオブジェクトは、アトリビュートオブジェクトを取得してDynamoDBテーブルに保存するために ``AttributesManager`` によって使用されます。このテーブルには2つの列があります。1つはパーティションキー、1つはアトリビュートに使用されます。 ``createTable`` コンフィギュレーションが ``true`` に設定されている場合に ``DynamoDbPersistenceAdapter`` がインスタンス化されると、SDKは指定された ``tableName`` で新しいDynamoDBテーブルを作成しようとします。

例
""""

.. tabs::

  .. code-tab:: javascript

    const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');

    const dynamoDbPersistenceAdapter = new DynamoDbPersistenceAdapter({ tableName : 'FooTable' })

  .. code-tab:: typescript

    import { PersistenceAdapter } from 'ask-sdk-core';
    import { DynamoDbPersistenceAdapter } from 'ask-sdk-dynamodb-persistence-adapter';

    const dynamoDbPersistenceAdapter : PersistenceAdapter = new DynamoDbPersistenceAdapter({ tableName : 'FooTable' });

コンフィギュレーションオプション
""""""""""""""""""""""""""""""""""""""""""""""""""""""

* **tableName** （文字列） - 使用するDynamoDBテーブルの名前です。
* **partitionKeyName** （文字列） - 任意です。パーティションキー列の名前です。指定されない場合、デフォルトの ``"id"`` になります。
* **attributesName** （文字列） - 任意です。アトリビュート列の名前です。指定されない場合、デフォルトの ``"attributes"`` になります。
* **createTable** （ブール値） - 任意です。``true`` に設定すると、テーブルが存在しない場合に ``DynamoDbPersistenceAdapter`` によって自動的に作成されます。指定されない場合、デフォルトの ``false`` になります。
* **partitionKeyGenerator** （関数） - 任意です。 ``RequestEnvelope`` を使ってパーティションキーを生成するときに使用される関数です。デフォルトでは、 ``userId`` を使ってパーティションキーを生成します。
* **dynamoDBClient** (`AWS.DynamoDB <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html>`_ ) - 任意です。AWS DynamoDBテーブルのクエリーに使用する ``DynamoDBClient`` です。ここにカスタムコンフィギュレーションを使った ``DynamoDBClient`` を挿入できます。デフォルトでは、 ``new AWS.DynamoDB({apiVersion : 'latest'})`` が使用されます。

メソッドの詳細
^^^^^^^^^^^^^^

``getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : any}>``
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

``getAttributes`` 操作により、DynamoDBテーブルからアトリビュートが取得されます。 ``RequestEnvelope`` オブジェクトを取り込んで ``PartitionKeyGenerator`` に渡し、パーティションキーが生成されます。その後、 ``attributesName`` に関連したキーを持つDynamoDBから返されたアトリビュートを取得します。対応するパーティションキーが見つからない場合、 ``getAttributes`` は空のオブジェクトを返します。

``saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : any}) : Promise<void>``
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

``saveAttributes`` 操作では、 ``RequestEnvelope`` から生成されたパーティションキーを使用してDynamoDBテーブルにアトリビュートを保存します。 ``convertEmptyValues`` を ``true`` に設定した ``DynamoDBDocumentClient`` を使用します。これは、アトリビュートオブジェクト内のすべての ``""`` 、 ``null`` 、 ``undefined`` の値が変換されるようにするためです。

S3PersistenceAdapter
--------------------

``ask-sdk-s3-persistence-adapter`` パッケージは、`AWS S3 <https://aws.amazon.com/jp/s3/>`_ を使って ``PersistenceAdapter`` を実装した ``S3PersistenceAdapter`` を提供します。

.. note::

  Amazon S3では既存オブジェクトへの更新に対して `結果整合性 <https://docs.aws.amazon.com/ja_jp/AmazonS3/latest/dev/Introduction.html>`_ を提供するため、スキルで書き込み後の読み込み整合性が必要とする場合は永続アトリビュートに `DynamoDbPersistenceAdapter`_ を使用することをおすすめします。

コンストラクターの詳細
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    new S3PersistenceAdapter(config = {}) => Object

``S3PersistenceAdapter`` オブジェクトを構築します。このオブジェクトは、アトリビュートオブジェクトを取得してS3バケットに保存するために ``AttributesManager`` によって使用されます。アトリビュートオブジェクトは、オブジェクトキーのファイル名を持つ個別のファイルとして表わされます。

例
""""""""

.. tabs::

  .. code-tab:: javascript

    const { S3PersistenceAdapter } = require('ask-sdk-s3-persistence-adapter');

    const S3PersistenceAdapter = new S3PersistenceAdapter({ bucketName : 'FooBucket' })

  .. code-tab:: typescript

    import { PersistenceAdapter } from 'ask-sdk-core';
    import { S3PersistenceAdapter } from 'ask-sdk-dynamodb-persistence-adapter';

    const S3PersistenceAdapter : PersistenceAdapter = new S3PersistenceAdapter({ bucketName : 'FooBucket' });

コンフィギュレーションオプション
""""""""""""""""""""""""""""""""""""""""""

* **bucketName** （文字列） - 使用するS3バケットの名前です。
* **objectKeyGenerator** （関数） - 任意です。 ``RequestEnvelope`` を使ってオブジェクトキーを生成するために使用される関数です。デフォルトでは、 ``userId`` を使ってオブジェクトキーを生成します。
* **s3Client** (`AWS.S3 <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html>`_)  - 任意です。AWS S3バケットのクエリーに使用される ``S3Client`` です。ここにカスタムコンフィギュレーションを使った ``S3Client`` を挿入できます。デフォルトでは、 ``new AWS.S3({apiVersion : 'latest'})`` が使用されます。
* **pathPrefix** （文字列） - 生成されたオブジェクトキーに追加されるプレフィックスの値です。s3でファイルシステム構造を模倣するために使用されます。デフォルトは空の文字列です。

メソッドの詳細
^^^^^^^^^^^^^^

``getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : any}>``
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

``getAttributes`` 操作により、S3バケットからアトリビュートが取得されます。 ``RequestEnvelope`` オブジェクトを取り込んで ``ObjectKeyGenerator`` に渡し、オブジェクトキーが生成されます。その後、S3バケットから返されたアトリビュートを取得します。対応するオブジェクトキーが見つからない場合、またはオブジェクトにbodyデータがない場合、``getAttributes`` は空のオブジェクトを返します。

``saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : any}) : Promise<void>``
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

``saveAttributes`` 操作では、``RequestEnvelope`` から生成されたオブジェクトキーを使用してS3バケットにアトリビュートを保存します。
