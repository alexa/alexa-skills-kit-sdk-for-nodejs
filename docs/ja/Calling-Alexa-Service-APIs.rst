=========================
Alexaサービスクライアント
=========================

SDKには、スキルのロジックからAlexa
APIを呼び出すのに使用するサービスクライアントが含まれます。

サービスクライアントは、リクエストハンドラー、例外ハンドラー、リクエストと応答のインターセプターで使用できます。
``HandlerInput``\ に含まれる\ ``ServiceClientFactory``\ により、サポートされているすべてのAlexaサービスのクライアントインスタンスを取得することができます。
``ServiceClientFactory``\ は
``ApiClient``\ を使用して\ `スキルのインスタンスを設定 <Skill-Builders.html>`__\ する場合にのみ使用できます。

以下は、リクエストハンドラーの ``handle``
関数の例です。デバイスアドレスサービスクライアントのインスタンスが作成されます。サービスクライアントインスタンスは、適切なfactory関数を呼び出すのと同じくらい簡単に作成できます。

.. code:: javascript

   const handle = async function(handlerInput) {
         const { requestEnvelope, serviceClientFactory } = handlerInput;
         const { deviceId } = requestEnvelope.context.System.device;
         const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
         const address = await deviceAddressServiceClient.getFullAddress(deviceId);
         // other handler logic goes here
   }
