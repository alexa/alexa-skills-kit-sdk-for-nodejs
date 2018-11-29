**************************
初めてのスキル開発
**************************

このガイドでは、ASK SDK v2 for Node.jsを使ったスキル開発の手順を説明します。

前提条件
========

-  `Amazon開発者 <https://developer.amazon.com/>`__\ アカウント。Alexaスキルの作成と設定に必要です。
-  `アマゾンウェブサービス（AWS） <https://aws.amazon.com/>`__\ アカウント。このガイドで、AWS Lambdaでスキルをホスティングする手順を確認できます。
-  インストールされたSDKに対応した\ `NPM <https://www.npmjs.com/>`__ プロジェクト。標準ASK SDKモジュールのインストールについては \ `ASK SDK v2 for Node.jsのセットアップ <Setting-Up-The-ASK-SDK.html>`__\ を参照してください。このサンプルスキルには、標準SDK配布パッケージが必要です。依存関係をカスタマイズしている場合は、コアSDKのサポートモジュールをインストールする必要があります。

スキルコードの記述
======================

以下のセクションでは、ハンドラーごとのスキルコードの記述について説明します。

.. note::

  ASK SDK v2 for Node.jsには、TypeScriptプロジェクトで使用するためのTypeScript定義ファイルがバンドルされています。このガイドでは、ネイティブのJavaScriptを使用したAlexaスキルの作成について説明し、それに対応したTypeScriptコードのスニペットもリファレンスとして提供します。TypeScriptプロジェクトの開始に関する情報については、こちらの\ `リンク <https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html>`_\ を参照してください。

依存関係の読み込み
------------------------------

``index.js``\ （以下のセクションでTypeScript.Sameを使用する場合は、\ ``index.ts``\ ）というファイルを作成し、以下のコードを貼り付けます。

.. tabs::

  .. code-tab:: javascript

    const Alexa = require('ask-sdk-core');

  .. code-tab:: typescript

    import {
      ErrorHandler,
      HandlerInput,
      RequestHandler,
      SkillBuilders,
    } from 'ask-sdk-core';
    import {
      Response,
      SessionEndedRequest,
    } from 'ask-sdk-model';

リクエストハンドラーの追加
-----------------------------

まず、スキルで受信するさまざまなタイプのリクエストを処理するのに必要なリクエストハンドラーを作成します。.

LaunchRequestハンドラー
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

以下は、スキルが\ ``LaunchRequest``\ を受信した時に呼び出されるハンドラーを設定するコードのサンプルです。特定のインテントなしでスキルが呼び出された場合、\ ``LaunchRequest``\ イベントが発生します。

.. tabs::

  .. code-tab:: javascript

    const LaunchRequestHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
      },
      handle(handlerInput) {
        const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      }
    };

  .. code-tab:: typescript

    const LaunchRequestHandler : RequestHandler = {
      canHandle(handlerInput : HandlerInput) : boolean {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
      },
      handle(handlerInput : HandlerInput) : Response {
        const speechText = 'Welcome to the Alexa Skills Kit, you can say hello!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      },
    };

受信したリクエストが\ ``LaunchRequest``\ の場合、\ ``canHandle``\ 関数はtrueを返します。\ ``handle``\ 関数は、基本的なあいさつの応答を生成して返します。

HelloWorldIntentハンドラー
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

以下は、スキルが\ ``HelloWorldIntent``\ を受信した時に呼び出されるハンドラーを設定するコードのサンプルです。

以下のコードを\ ``index.js``\ ファイルの、前述のハンドラーの後に貼り付けます。

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

``canHandle``\ 関数は受信するリクエストが\ ``IntentRequest``\ かどうかを検出し、インテント名が\ ``HelloWorldIntent``\ の場合にtrueを返します。\ ``handle``\ 関数は、基本的な「こんにちは」という応答を生成して返します。

HelpIntentハンドラー
^^^^^^^^^^^^^^^^^^^^^^

以下は、スキルがビルトインインテント\ ``AMAZON.HelpIntent``\ を受信した時に呼び出されるハンドラーを設定するコードのサンプルです。

以下のコードを\ ``index.js``\ ファイルの、前述のハンドラーの後に貼り付けます。

.. tabs::

  .. code-tab:: javascript

    const HelpIntentHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
      },
      handle(handlerInput) {
        const speechText = 'You can say hello to me!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      }
    };

  .. code-tab:: typescript

    const HelpIntentHandler : RequestHandler = {
      canHandle(handlerInput : HandlerInput) : boolean {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
      },
      handle(handlerInput : HandlerInput) : Response {
        const speechText = 'You can say hello to me!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      },
    };

さきほどのハンドラー同様、このハンドラーは\ ``IntentRequest``\ を想定されるインテント名と照合します。基本のヘルプ手順が返されます。

CancelAndStopIntentハンドラー
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

CancelAndStopIntentハンドラーもビルトインインテントによって呼び出されるため、HelpIntentハンドラーに似ています。以下は、1つのハンドラーを使って\ ``Amazon.CancelIntent``\ と\ ``Amazon.StopIntent``\ という2つのインテントに応答している例です。

以下のコードを\ ``index.js``\ ファイルの、前述のハンドラーの後に貼り付けます。

.. tabs::

  .. code-tab:: javascript

    const CancelAndStopIntentHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
            || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
      },
      handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      }
    };

  .. code-tab:: typescript

    const CancelAndStopIntentHandler : RequestHandler = {
      canHandle(handlerInput : HandlerInput) : boolean {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
            || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
      },
      handle(handlerInput : HandlerInput) : Response {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
          .speak(speechText)
          .withSimpleCard('Hello World', speechText)
          .getResponse();
      },
    };

両方のインテントに対する応答は同じであるため、1つのハンドラーにすることで重複するコードを減らせます。

SessionEndedRequestハンドラー
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``SessionEndedRequest``\ を受信した後は音声、カード、ディレクティブを使った応答を返すことはできませんが、クリーンアップロジックを追加するにはSessionEndedRequestハンドラーが最適な場所です

以下のコードを\ ``index.js``\ ファイルの、前述のハンドラーの後に貼り付けます。

.. tabs::

  .. code-tab:: javascript

    const SessionEndedRequestHandler = {
      canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
      },
      handle(handlerInput) {
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
      }
    };

  .. code-tab:: typescript

    const SessionEndedRequestHandler : RequestHandler = {
      canHandle(handlerInput : HandlerInput) : boolean {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
      },
      handle(handlerInput : HandlerInput) : Response {
        console.log(`Session ended with reason: ${(handlerInput.requestEnvelope.request as SessionEndedRequest).reason}`);

        return handlerInput.responseBuilder.getResponse();
      },
    };


エラーハンドラーの追加
----------------------------------------

ASK SDK v2 for Node.jsはエラー処理が簡単で、スムーズなユーザーエクスペリエンスを実現するスキルが作成しやすくなります。エラーハンドラーは、未処理のリクエストやAPIサービスのタイムアウトなどのエラー処理ロジックを組み込むのに最適です。以下の例では、catch allエラーハンドラーをスキルに追加して、すべてのエラーに対してスキルが意味のあるメッセージを返すようにしています。

以下のコードを\ ``index.js``\ ファイルの、前述のハンドラーの後に貼り付けます。

.. tabs::

  .. code-tab:: javascript

    const ErrorHandler = {
      canHandle() {
        return true;
      },
      handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
          .speak('Sorry, I can\'t understand the command. Please say again.')
          .reprompt('Sorry, I can\'t understand the command. Please say again.')
          .getResponse();
      },
    };

  .. code-tab:: typescript

    const ErrorHandler : ErrorHandler = {
      canHandle(handlerInput : HandlerInput, error : Error ) : boolean {
        return true;
      },
      handle(handlerInput : HandlerInput, error : Error) : Response {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
          .speak('Sorry, I can\'t understand the command. Please say again.')
          .reprompt('Sorry, I can\'t understand the command. Please say again.')
          .getResponse();
      },
    };


Lambdaハンドラーを作成する
---------------------------

Lambdaハンドラーは、AWS Lambda関数のエントリーポイントとなります。以下は、スキルが受信するすべてのリクエストのルーティングを行うLambdaハンドラー関数のコードサンプルです。Lambdaハンドラー関数は、作成したリクエストハンドラーを使用して設定されたSDKの\ ``Skill``\ インスタンスを作成します。

以下のコードを\ ``index.js``\ ファイルの、前述のセクションの後に貼り付けます。

.. tabs::

  .. code-tab:: javascript

    let skill;

    exports.handler = async function (event, context) {
      console.log(`REQUEST++++${JSON.stringify(event)}`);
      if (!skill) {
        skill = Alexa.SkillBuilders.custom()
          .addRequestHandlers(
            LaunchRequestHandler,
            HelloWorldIntentHandler,
            HelpIntentHandler,
            CancelAndStopIntentHandler,
            SessionEndedRequestHandler,
          )
          .addErrorHandlers(ErrorHandler)
          .create();
      }

      const response = await skill.invoke(event, context);
      console.log(`RESPONSE++++${JSON.stringify(response)}`);

      return response;
    };

  .. code-tab:: typescript

    let skill;

    exports.handler = async (event, context) => {
      console.log(`REQUEST++++${JSON.stringify(event)}`);
      if (!skill) {
        skill = SkillBuilders.custom()
          .addRequestHandlers(
            LaunchRequestHandler,
            HelloWorldIntentHandler,
            HelpIntentHandler,
            CancelAndStopIntentHandler,
            SessionEndedRequestHandler,
          )
          .addErrorHandlers(ErrorHandler)
          .create();
      }

      const response = await skill.invoke(event, context);
      console.log(`RESPONSE++++${JSON.stringify(response)}`);

      return response;
    };

関数は、\ ``SkillBuilders.custom``\ ビルダーを使用してSDKインスタンスを作成します。\ ``addRequestHandlers``\ ビルダー関数はリクエストハンドラーを登録します。関数は、Lambdaハンドラー関数としてエクスポートされます。

また、ASK SDK v2 for Node.jsで提供されるlambdaビルダー関数を使って、\ ``Skill``\ のインスタンスを呼び出して応答を返す\ ``Lambda``\ ハンドラー関数を簡単に作成することもできます。以下の例を参照してください。

.. tabs::

  .. code-tab:: javascript

    exports.handler = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler)
      .addErrorHandlers(ErrorHandler)
      .lambda();

  .. code-tab:: typescript

    exports.handler = SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .addErrorHandlers(ErrorHandler)
      .lambda();

スキルパッケージを作成する
==========================

スキルのコードが完成したら、スキルパッケージを作成できます。スキルをAWS Lambdaにアップロードするには、スキルファイルと\ ``node_modules``\ フォルダーを含むzipファイルを作成します。すべてのプロジェクトファイルは、プロジェクトフォルダーでは\ **なく**\ 、ファイルを直接圧縮するようにしてください。

スキルをAWS Lambdaにアップロードする
===========================================

スキルに適切なロールでAWS Lambda関数を作成する手順については、\ `カスタムスキルをAWS Lambda関数としてホスティングする <https://developer.amazon.com/docs/custom-skills/host-a-custom-skill-as-an-aws-lambda-function.html>`_\ を参照してください。関数作成時には、一から作成オプションを選択し、ランタイムとしてNode.js 8.10を選択します。

AWS Lambda関数を作成しトリガーとして「Alexa Skills Kit」を設定したら、前のステップで作成した.zipファイルをアップロードします。ハンドラーはデフォルトの\ ``index.handler``\ のままにします。最後に、AWS Lambda関数のARNをコピーします。このARNはAmazon開発者コンソールでスキルを設定する際に必要となります。

スキルの設定とテストを行う
==================================

スキルコードをAWS Lambdaにアップロードしたら、Alexaのスキルを設定できます。新しいスキルを作成するには、

1. \ `Alexa Skills Kit開発者コンソール <https://developer.amazon.com/alexa/console/ask>`_\ に移動してログインします。
2. 右上の\ **スキルの作成**\ ボタンをクリックします。
3. スキル名として「HelloWorld」と入力します。
4. \ **カスタム**\ スキルを選択してから\ **スキルを作成**\ をクリックします。

次に、スキルの対話モデルを定義します。サイドバーの\ **呼び出し名**\ を選択し、\ **スキルの呼び出し名**\ に「ごあいさつ」を入力します。

次に、\ ``HelloWorldIntent``\ というインテントを対話モデルに追加します。対話モデルのインテントセクションの下の\ **追加**\ ボタンをクリックします。カスタムインテントを作成を選択した状態で、インテント名として「HelloWorldIntent」を入力し、インテントを作成します。インテントの詳細ページで、ユーザーがこのインテントを呼び出すのに使用できるサンプル発話をいくつか追加します。この例では、以下のサンプル発話を追加しましたが、これ以外でもかまいません。

::

  こんにちはと言って
  ハローワールドと言って
  こんにちは
  ハイと言って
  ハイワールドと言って
  ハイ
  ごきげんいかが

\ ``AMAZON.CancelIntent``\ 、\ ``AMAZON.HelpIntent``\ 、\ ``AMAZON.StopIntent``\ はAlexaのビルトインインテントのため、サンプル発話を追加する必要はありません。

開発者コンソールでは、スキルモデル全体をJSON形式で編集することもできます。サイドバーで\ **JSONエディター**\ を選択します。この例では、以下のJSONスキーマを使用できます。

.. code:: json

  {
    "interactionModel": {
      "languageModel": {
        "invocationName": "greeter",
        "intents": [
          {
            "name": "AMAZON.CancelIntent",
            "samples": []
          },
          {
            "name": "AMAZON.HelpIntent",
            "samples": []
          },
          {
            "name": "AMAZON.StopIntent",
            "samples": []
          },
          {
            "name": "HelloWorldIntent",
            "slots": [],
            "samples": [
              "ごきげんいかが",
              "ハイ",
              "ハイワールドと言って",
              "ハイと言って",
              "こんにちは",
              "ハローワールドと言って",
              "こんにちはと言って"
            ]
          }
        ],
        "types": []
      }
    }
  }

対話モデルの編集が完了したら、モデルを保存してビルドします。

次に、スキルのエンドポイントを設定します。\ **エンドポイント**\ で\ **AWS LambdaのARN**\ を選択し、さきほど作成した関数のARNを貼り付けます。残りの設定は、デフォルト値のままでかまいません。\ **エンドポイントを保存**\ をクリックします。

この時点で、スキルをテストできるようになります。上部にあるメニューで\ **テスト**\ をクリックし、テストページに移動します。\ **このスキルでは、テストは有効になっています**\ オプションがONになっていることを確認します。テストページを使って、テキストや音声でリクエストをシミュレーションできます。

呼び出し名と、さきほど設定したサンプル発話のうち1つを使います。たとえば、「アレクサ、ごあいさつを開いてこんにちはと言って」と言うと、スキルは「こんにちは」と答えるはずです。また、（スマートフォンやhttps://alexa.amazon.comで）Alexaアプリを開くと、\ **スキル一覧**\ が表示されます。ここから、Alexaが使えるデバイスでテストできるように、アカウントでスキルを有効にすることができます。

この時点で、さまざまなインテントや、スキルコードに対応するリクエストハンドラーを試してみてください。一通りのテストが完了したら、スキルの認定を申請してAlexaユーザーに公開するプロセスに進むことができます。