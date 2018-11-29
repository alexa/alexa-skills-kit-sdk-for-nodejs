******************
リクエスト処理
******************

標準のリクエスト
====================

作成したスキルサービスとAlexaとの通信は、SSL/TLSを利用してHTTPを使用するリクエスト-応答メカニズムで行います。ユーザーがAlexaスキルと対話するとき、作成したサービスは、JSON本文を含むPOSTリクエストを受け取ります。このリクエスト本文には、サービスがロジックを実行してJSON形式の応答を生成するために必要なパラメーターが含まれています。Node.jsはネイティブにJSONを処理できるため、ASK SDK v2 for Node.jsではJSONのシリアル化と逆シリアル化が必要ありません。リクエスト本文のJSON構造についてのドキュメントは、\ `こちら <https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#request-format>`_\ を参照してください。

ハンドラー入力
==================

リクエストハンドラー、リクエストと応答のインターセプター、エラーハンドラーにはすべて、呼び出し時に\ ``HandlerInput``\ オブジェクトが渡されます。このオブジェクトには、リクエスト処理に有効な各種エンティティが含まれます。以下はその例です。

-  **RequestEnvelope**\ ：スキルの送信される\ `リクエスト本文 <https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#request-body-syntax>`__\ 全体を含みます。
-  **AttributesManager**\ ：リクエスト、セッション、永続アトリビュートへのアクセスを提供します。
-  **ServiceClientFactory**\ ：Alexa APIの呼び出しが可能なサービスクライアントを構築します。
-  **ResponseBuilder**\ ：応答を作成するヘルパー関数を含みます。
-  **Context**\ ：ホストコンテナが渡すオプションのcontextオブジェクトを提供します。たとえば、AWS Lambdaで実行されるスキルの場合は、AWS Lambda関数の\ `contextオブジェクト <https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html>`__\ になります。

リクエストハンドラー
--------------------

リクエストハンドラーは、受け取った1つ以上のタイプのリクエストを処理します。リクエストハンドラーの作成には、以下の\ ``RequestHandler``\ インターフェースを使います。このインターフェースは2つの関数で構成されます。

-  ``canHandle``\ は、SDKによって呼び出され、指定されたハンドラーが受け取ったリクエストを処理できるかどうかを判断します。この関数は、\ ``HandlerInput``\ オブジェクトを受け取り、リクエストを処理できる場合は\ **true**\ 、処理できない場合は\ **false**\ を返します。受信するリクエストのタイプやパラメーター、スキルのアトリビュートなど、この判断を行うための条件を選択できます。
-  ``handle``\ は、リクエストハンドラーを呼び出すときにSDKによって呼び出されます。この関数には、ハンドラーのリクエスト処理ロジックが含まれます。また、\ ``HandlerInput``\ を受け取り、\ ``Response``\ 、\ ``Promise<Response>``\ のいずれかを返します。

インターフェース
----------------

.. code:: typescript

   interface RequestHandler {
       canHandle(handlerInput: HandlerInput): Promise<boolean> | boolean;
       handle(handlerInput: HandlerInput): Promise<Response> | Response;
   }

サンプルコード
----------------------

以下は、\ ``HelloWorldIntent``\ を呼び出すことができるリクエストハンドラーの例です。

.. tabs::

  .. code-tab:: javascript

    const HelloWorldIntentHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'HelloWorldIntent';
      },
      handle(handlerInput) {
        const speechText = 'こんにちは';

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
        const speechText = 'こんにちは';

        return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      },
    };

\ ``canHandle``\ メソッドは、受け取るリクエストが\ ``IntentRequest``\ かどうかを検出し、インテント名が\ ``HelloWorldIntent``\ の場合にtrueを返します。\ ``handle``\ メソッドは、基本的な「こんにちは」という応答を生成して返します。

以下の例は、SDKを使ってリクエストハンドラーを登録する方法を示しています。

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

  SDKは、登録された順序に従いリクエストハンドラーで\ ``canHandle``\ メソッドを呼び出します。上記の例では、SDKが以下の順序でリクエストハンドラーを呼び出します。

  1. FooHandler
  2. BarHandler
  3. BazHandler

  SDKは、指定されたリクエストを処理できる最初のハンドラーを常に選択します。この例では、\ ``FooHandler``\ と\ ``BarHandler``\ の両方が特定のリクエストを処理できる場合、常に\ ``FooHandler``\ が呼び出されます。リクエストハンドラーのデザインや登録を行う際には、この点を考慮に入れてください。

リクエストと応答のインターセプター
==============================================

SDKは、\ ``RequestHandler``\ の実行前と実行後に実行するリクエストと応答のインターセプターをサポートします。インターセプターは、\ ``RequestInterceptor``\ インターフェースか\ ``ResponseInterceptor``\ インターフェースを使用して実装できます。

どちらのインターセプターインターフェースも、戻り値の型が\ ``void``\ である\ ``process``\ メソッドを1つ実行します。リクエストのインターセプターは\ ``HandlerInput``\ オブジェクトにアクセスでき、応答のインターセプターは\ ``HandlerInput``\ と、\ ``RequestHandler``\ によって生成されるオプションの\ ``Response``\ にアクセスできます。

インターフェース
----------------

.. code:: typescript

   interface RequestInterceptor {
       process(handlerInput: HandlerInput): Promise<void> | void;
   }

   interface ResponseInterceptor {
       process(handlerInput: HandlerInput, response?: Response): Promise<void> | void;
   }

リクエストのインターセプターは、受け取るリクエストのリクエストハンドラーが実行される直前に呼び出されます。リクエストアトリビュートは、リクエストのインターセプターがリクエストハンドラーにデータやエンティティを渡す方法を提供します。

応答のインターセプターは、リクエストハンドラーが実行された直後に呼び出されます。応答のインターセプターはリクエストハンドラーを実行して生成される出力結果にアクセスできるため、応答のサニタイズや検証といったタスクに適しています。

サンプルコード
--------------------

以下は、応答がAlexaに送信される前に永続アトリビュートのデータベースへの保存を処理する応答のインターセプターの例です。

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

以下の例は、SDKを使ってインターセプターを登録する方法を示しています。

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

  SDKは、登録された順序に従いリクエストと応答のインターセプターを実行します。上記の例では、SDKが以下の順序でインターセプターを実行します。

  1. FooRequestInterceptor
  2. BarRequestInterceptor
  3. <Request handler picked for the request>
  4. FooResponseInterceptor
  5. BarResponseInterceptor

エラーハンドラー
=====================

エラーハンドラーはリクエストハンドラーに似ていますが、リクエストではなく1つまたは複数のタイプのエラーを処理します。リクエストの処理中に未処理のエラーがスローされると、SDKがエラーハンドラーを呼び出します。

すべてのエラーハンドラーは、\ ``ErrorHandler``\ インターフェースを使用する必要があります。このインターフェースは以下の2つのメソッドで構成されています。

-  \ ``canHandle``\ は、SDKによって呼び出され、指定されたハンドラーがエラーを処理できるかどうかを判断します。ハンドラーがエラーを処理できる場合は\ ``true``\ 、処理できない場合は\ ``false``\ を返します。catch-allハンドラーを作成する場合は常にtrueを返します。
-  \ ``handle``\ は、エラーハンドラーを呼び出すときにSDKによって呼び出されます。このメソッドにはエラー処理ロジックがすべて含まれ、\ ``Response``\ または\ ``Promise<Response>``\ を返します。

インターフェース
------------------

.. code:: typescript

   interface ErrorHandler {
       canHandle(handlerInput: HandlerInput, error: Error): Promise<boolean> | boolean;
       handle(handlerInput: HandlerInput, error: Error): Promise<Response> | Response;
   }

サンプルコード
----------------------

以下は、名前が「AskSdk」で始まるエラーをすべて処理するエラーハンドラーの例です。

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

ハンドラーの\ ``canHandle``\ メソッドは、受け取るエラーの名前が「AskSdk」で始まる場合にtrueを返します。\ ``handle``\ メソッドは、ユーザーに正常なエラー応答を返します。


以下の例は、SDKを使ってエラーハンドラーを登録する方法を示しています。

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

  リクエストハンドラーと同様に、エラーハンドラーは登録された順序に従い実行されます。上記の例では、SDKが以下の順序でエラーハンドラーを呼び出します。

  1. FooErrorHandler
  2. BarErrorHandler
