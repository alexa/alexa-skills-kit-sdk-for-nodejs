======================
スキルのアトリビュート
======================

SDKを使うと、さまざまなスコープでアトリビュートの保存と取得が可能になります。たとえば、アトリビュートを使って後続のリクエストで取得するデータを保存できます。また、ハンドラーの\ ``canHandle``\ ロジックでアトリビュートを使うことで、リクエストのルーティングに影響を与えることも可能です。

アトリビュートは、キーと値で構成されます。キーは\ ``String``\ 型、値は\ ``Object``\ 型です。セッションアトリビュートと永続アトリビュートの場合、値は保存して後で取得できるよう、シリアライズできるデータ型である必要があります。この制限はリクエストレベルのアトリビュートには適用されません。なぜならリクエストレベルのアトリビュートは、リクエスト処理のライフサイクルが終了すると永続的に存在しないからです。

オブジェクトのスコープ
----------------------

リクエストアトリビュート
^^^^^^^^^^^^^^^^^^^^^^^^^

リクエストアトリビュートは、1回のリクエスト処理ライフサイクルの間のみ存続します。リクエストを受信した時点では、リクエストアトリビュートは空です。また応答が生成されると破棄されます。

リクエストアトリビュートは、リクエストと応答のインターセプターと合わせて使うと便利です。たとえば、リクエストインターセプターを使って追加のデータとヘルパークラスをリクエストアトリビュートに挿入して、リクエストハンドラーから取得できるようにすることができます。

セッションアトリビュート
^^^^^^^^^^^^^^^^^^^^^^^^^

セッションアトリビュートは、現在のスキルセッションが継続している間存続します。セッションアトリビュートは、すべてのセッション内リクエストで使用できます。リクエスト処理のライフサイクル中に設定されたすべてのアトリビュートはAlexaサービスに返され、同じセッションの次のリクエストでも提供されます。

セッションアトリビュートで、外部ストレージソリューションを使用する必要はありません。セッションアトリビュートはセッション外のリクエストの処理では使用できません。スキルセッションがクローズされると破棄されます。

永続アトリビュート
^^^^^^^^^^^^^^^^^^^^^^^^^

永続アトリビュートは、現在のセッションのライフサイクルが終了しても存続します。主要なスコープ（ユーザーID、デバイスID）、TTL、ストレージレイヤーを含む、これらのアトリビュートがどのように保存されるかはスキルのコンフィギュレーションによって異なります。

永続アトリビュートは、\ ``PersistenceAdapter``\ を使用して\ `スキルのインスタンスを設定 <Skill-Builders.html>`__\ する場合にのみ使用できます。\ ``PersistenceAdapter``\ が設定されていない場合に、\ ``AttributesManager``\ を呼び出して永続アトリビュートの取得と保存を行おうとするとエラーが発生します。\ ``AttributesManager``\ で\ ``savePersistentAttributes()``\ を呼び出して、永続レイヤーに変更を保存し直します。

PersistenceAdapter
----------------------

``PersistenceAdapter``\ は、永続レイヤー（データベースやローカルファイルシステムなど）でアトリビュートを保存したり取得したりする場合に\ ``AttributesManager``\ が使用します。\ ``ask-sdk-dynamodb-persistence-adapter``\ パッケージは、\ `AWS
DynamoDB <https://aws.amazon.com/dynamodb/>`__\ を使って\ ``PersistenceAdapter``\ を実装します。カスタマイズされたすべての\ ``PersistenceAdapter``\ は、以下のインターフェースに従う必要があります。

**インターフェース**

.. code:: typescript

   interface PersistenceAdapter {
       getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : any}>;
       saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : any}) : Promise<void>;
   }

AttributesManager
----------------------

``AttributesManager``\ には、ハンドラーで取得や更新を行えるアトリビュートがあります。\ ``AttributesManager``\ は、\ ``HandlerInput``\ コンテナオブジェクトからハンドラーで使用できます。\ ``AttributesManager``\ は、スキルで必要なアトリビュートと直接やり取りできるよう、アトリビュートの取得と保存を行います。

**インターフェース**

.. code:: typescript

   interface AttributesManager {
       getRequestAttributes() : {[key : string] : any};
       getSessionAttributes() : {[key : string] : any};
       getPersistentAttributes() : Promise<{[key : string] : any}>;
       setRequestAttributes(requestAttributes : {[key : string] : any}) : void;
       setSessionAttributes(sessionAttributes : {[key : string] : any}) : void;
       setPersistentAttributes(persistentAttributes : {[key : string] : any}) : void;
       savePersistentAttributes() : Promise<void>;
   }

以下は、永続アトリビュートの取得と保存を行う方法のサンプルです。

.. code:: javascript

   const PersistentAttributesHandler = {
       canHandle(handlerInput) {
           return new Promise((resolve, reject) => {
               handlerInput.attributesManager.getPersistentAttributes()
                   .then((attributes) => {
                       resolve(attributes['foo'] === 'bar');
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
                       attributes['foo'] = 'bar';
                       handlerInput.attributesManager.setPersistentAttributes(attributes);

                       return handlerInput.attributesManager.savePersistentAttributes();
                   })
                   .then(() => {
                       resolve(handlerInput.responseBuilder.getResponse());
                   })
                   .catch((error) => {
                           reject(error);
                   });
           });
       }
   };
