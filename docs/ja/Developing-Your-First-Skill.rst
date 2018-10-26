==================
初めてのスキル開発
==================

このガイドでは、ASK SDK v2 for
Node.jsを使ったスキル開発の手順を説明します。

前提条件
-----------

-  `Amazon開発者 <https://developer.amazon.com/>`__\ アカウント。Alexaスキルの作成と設定に必要です。
-  `アマゾンウェブサービス（AWS） <https://aws.amazon.com/>`__\ アカウント。このガイドで、AWS
   Lambdaでスキルをホスティングする手順を確認できます。
-  インストールされたSDKに対応した\ `NPM <https://www.npmjs.com/>`__
   プロジェクト。標準ASK SDKモジュールのインストールについては \ `ASK
   SDK v2 for
   Node.jsのセットアップ <Setting-Up-The-ASK-SDK.html>`__\
   を参照してください。このサンプルスキルには、標準SDK配布パッケージが必要です。依存関係をカスタマイズしている場合は、コアSDKのサポートモジュールをインストールする必要があります。

リクエストハンドラーを実装する
---------------------------------

まず、スキルで受信するさまざまなタイプのリクエストを処理するのに必要なリクエストハンドラーを作成します。

LaunchRequestハンドラー
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

以下は、スキルが\ ``LaunchRequest``\ を受信した時に呼び出されるハンドラーを設定するコードのサンプルです。特定のインテントなしでスキルが呼び出された場合、\ ``LaunchRequest``\ イベントが発生します。

``index.js``\ というファイルを作成し、以下のコードに貼り付けます。

.. code:: javascript

   const LaunchRequestHandler = {
       canHandle(handlerInput) {
           return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
       },
       handle(handlerInput) {
           const speechText = 'ようこそ、アレクサスキルキットへ。こんにちは、と言ってみてください。';

           return handlerInput.responseBuilder
               .speak(speechText)
               .reprompt(speechText)
               .withSimpleCard('Hello World', speechText)
               .getResponse();
       }
   };

受信したリクエストが\ ``LaunchRequest``\ の場合、\ ``canHandle``\ 関数はtrueを返します。\ ``handle``\ 関数は、基本的なごあいさつの応答を生成して返します。

HelloWorldIntentハンドラー
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

以下は、スキルが\ ``HelloWorldIntent``\ を受信した時に呼び出されるハンドラーを設定するコードのサンプルです。

以下のコードを\ ``index.js``\ ファイルの、前述のハンドラーの後に貼り付けます。

.. code:: javascript

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

``canHandle``\ 関数は受信するリクエストが\ ``IntentRequest``\ かどうかを検出し、インテント名が\ ``HelloWorldIntent``\ の場合にtrueを返します。
``handle``\ 関数は、「こんにちは」という応答を生成して返します。

HelpIntentハンドラー
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

以下は、スキルがビルトインインテント\ ``AMAZON.HelpIntent``\ を受信した時に呼び出されるハンドラーを設定するコードのサンプルです。

以下のコードを\ ``index.js``\ ファイルの、前述のハンドラーの後に貼り付けます。

.. code:: javascript

   const HelpIntentHandler = {
       canHandle(handlerInput) {
           return handlerInput.requestEnvelope.request.type === 'IntentRequest'
               && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
       },
       handle(handlerInput) {
           const speechText = 'こんにちは。と言ってみてください。';

           return handlerInput.responseBuilder
               .speak(speechText)
               .reprompt(speechText)
               .withSimpleCard('Hello World', speechText)
               .getResponse();
       }
   };

さきほどのハンドラー同様、このハンドラーは\ ``IntentRequest``\ を想定されるインテント名と照合します。基本のヘルプ手順が返されます。

CancelAndStopIntentハンドラー
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

CancelAndStopIntenthandlerもビルトインインテントによって呼び出されるため、HelpIntentハンドラーに似ています。以下は、1つのハンドラーを使って\ ``Amazon.CancelIntent``\ と\ ``Amazon.StopIntent``\ という2つのインテントに応答している例です。

以下のコードを\ ``index.js``\ ファイルの、前述のハンドラーの後に貼り付けます。

.. code:: javascript

   const CancelAndStopIntentHandler = {
       canHandle(handlerInput) {
           return handlerInput.requestEnvelope.request.type === 'IntentRequest'
               && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                   || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
       },
       handle(handlerInput) {
           const speechText = 'さようなら';

           return handlerInput.responseBuilder
               .speak(speechText)
               .withSimpleCard('Hello World', speechText)
               .getResponse();
       }
   };

両方のインテントに対する応答は同じであるため、1つのハンドラーにすることで重複するコードを減らせます。

SessionEndedRequestハンドラー
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``SessionEndedRequest``\ を受信した後は音声、カード、ディレクティブを使った応答を返すことはできませんが、クリーンアップロジックを追加するにはSessionEndedRequestHandlerが最適な場所です。

以下のコードを\ ``index.js``\ ファイルの、前述のハンドラーの後に貼り付けます。

.. code:: javascript

   const SessionEndedRequestHandler = {
       canHandle(handlerInput) {
           return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
       },
       handle(handlerInput) {
           //クリーンアップロジックをここに追加しますe
           return handlerInput.responseBuilder.getResponse();
       }
   };

Errorハンドラーを追加する
------------------------------------------

ASK SDK v2 for Node.js ではエラーハンドリングが改善されており、スキルはスムーズなユーザ体験を提供できます.
ハンドルされていないリクエスト, APIタイムアウトなどに対するあなたのエラー処理ロジックを追加するには、
ErrorHandler は適した場所です。
以下のサンプルでは、すべてのエラーをキャッチするハンドラーをスキルに追加することにより、いかなる種類のエラーに対してもスキルが意味のあるメッセージを返すことを保証しています。

以下のコードを\ ``index.js``\ ファイルの、前述のハンドラーの後に貼り付けます。

.. code:: javascript

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

Lambdaハンドラーを作成する
----------------------------

Lambdaハンドラーは、AWS
Lambda関数のエントリーポイントとなります。以下は、スキルが受信するすべてのリクエストのルーティングを行うLambdaハンドラーのコードサンプルです。Lambdaハンドラー関数は、作成したリクエストハンドラーを使用して設定されたSDKの\ ``Skill``\ インスタンスを作成します。

以下のコードをindex.jsファイルの最初に追加します。コードは、これまで作成したハンドラーよりも前に追加してください。

.. code:: javascript

   'use strict';

   const Alexa = require('ask-sdk-core');
   // 標準のSDKモジュールがインストールされている場合、'ask-sdk' を使用してください

   // ハンドラーのコードはこちら

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

     return skill.invoke(event,context);
   }

関数は、\ ``SkillBuilders.custom``\ ビルダーを使用してSDKインスタンスを作成します。\ ``addRequestHandlers``\ ビルダー関数はリクエストハンドラーを登録します。関数は、Lambdaハンドラー関数としてエクスポートされます。

また、ASK SDK v2 for
Node.jsで提供される\ ``lambda``\ ビルダー関数を使って、\ ``Skill``\ のインスタンスを呼び出して応答を返すLambdaハンドラー関数を簡単に作成することもできます。以下の例を参照してください。

.. code:: javascript

   'use strict';

   const Alexa = require('ask-sdk-core');
   // 標準のSDKモジュールがインストールされている場合、'ask-sdk' を使用してください

   // ハンドラーのコードはこちら

   exports.handler = Alexa.SkillBuilders.custom()
        .addRequestHandlers(LaunchRequestHandler,
                            HelloWorldIntentHandler,
                            HelpIntentHandler,
                            CancelAndStopIntentHandler,
                            SessionEndedRequestHandler)
        .lambda();

スキルパッケージを作成する
----------------------------------------------------

スキルのコードが完成したら、スキルパッケージを作成できます。スキルをAWS
Lambdaにアップロードするには、スキルファイルと\ ``node_modules``\ フォルダーを含むzipファイルを作成します。すべてのプロジェクトファイルは、プロジェクトフォルダーでは\ **なく**\ 、ファイルを直接圧縮するようにしてください。

スキルをAWS Lambdaにアップロードする
----------------------------------------------------

スキルに適切なロールでAWS
Lambda関数を作成する手順については、\ `カスタムスキルをAWS
Lambda関数としてホスティングする <https://developer.amazon.com/docs/custom-skills/host-a-custom-skill-as-an-aws-lambda-function.html>`__\ を参照してください。関数作成時には、「一から作成」オプションを選択し、ランタイムとしてNode.js
8.10を選択します。

AWS Lambda関数を作成しトリガーとして「Alexa Skills
Kit」を設定したら、前のステップで作成した.zipファイルをアップロードします。ハンドラーはデフォルトの\ ``index.handler``\ のままにします。最後に、AWS
Lambda関数のARNをコピーします。このARNはAmazon開発者コンソールでスキルを設定する際に必要となります。

スキルの設定とテストを行う
----------------------------------------------------

スキルコードをAWS
Lambdaにアップロードしたら、Alexaのスキルを設定できます。新しいスキルを作成するには、

1. `Alexa Skills
   Kit開発者コンソール <https://developer.amazon.com/alexa/console/ask>`__\ に移動してログインします。
2. 右上の\ **スキルの作成**\ ボタンをクリックします。
3. スキル名として「HelloWorld」と入力して\ **次へ**\ をクリックします。
4. モデルに\ **カスタム**\ を選択して\ **スキルを作成**\ をクリックします。

次に、スキルの対話モデルを定義します。サイドバーの\ **呼び出し名**\ を選択し、\ **スキルの呼び出し名**\ に「ごあいさつ」を入力します。

次に、\ ``HelloWorldIntent``\ というインテントを対話モデルに追加します。対話モデルのインテントセクションの下の\ **追加**\ ボタンをクリックします。「カスタムインテントを作成」を選択した状態で、インテント名として「HelloWorldIntent」を入力し、インテントを作成します。インテントの詳細ページで、ユーザーがこのインテントを呼び出すのに使用できるサンプル発話をいくつか追加します。この例では、以下のサンプル発話を追加しましたが、これ以外でもかまいません。

::

   こんにちはと言って
   ハロー
   こんにちは
   おはようございます
   お疲れ様です
   ごきげんいかが

``AMAZON.CancelIntent``\ 、\ ``AMAZON.HelpIntent``\ 、\ ``AMAZON.StopIntent``\ はAlexaのビルトインインテントのため、サンプル発話を追加する必要はありません。

開発者コンソールでは、スキルモデル全体をJSON形式で編集することもできます。サイドバーで\ **JSONエディター**\ を選択します。この例では、以下のJSONスキーマを使用できます。

.. code:: json

   {
     "interactionModel": {
       "languageModel": {
         "invocationName": "ごあいさつ",
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
               "こんにちは",
               "こんにちはと言って",
               "ハロー",
               "おはようございます",
               "お疲れ様です"
             ]
           }
         ],
         "types": []
       }
     }
   }

対話モデルの編集が完了したら、モデルを保存してビルドします。

次に、スキルのエンドポイントを設定します。\ **エンドポイント**\ で\ **AWS
LambdaのARN**\ を選択し、さきほど作成した関数のARNを貼り付けます。残りの設定は、デフォルト値ののままでかまいません。\ **エンドポイントを保存**\ をクリックします。

この時点で、スキルをテストできるようになります。上部にあるメニューで\ **テスト**\ をクリックし、テストページに移動します。\ **このスキルでは、テストは有効になっています**\ オプションがONになっていることを確認します。テストページを使って、テキストや音声でリクエストをシミュレーションできます。

呼び出し名と、さきほど設定したサンプル発話のうち1つを使います。たとえば、「アレクサ、ごあいさつを開いてこんにちはと言って」と言うと、スキルは「こんにちは」と答えるはずです。また、（スマートフォンや\ `alexa.amazon.co.jp <https://alexa.amazon.co.jp>`__
で）Alexaアプリを開くと、\ **スキル一覧**\ が表示されます。ここから、Alexaが使えるデバイスでテストできるように、アカウントでスキルを有効にすることができます。

この時点で、さまざまなインテントや、スキルコードに対応するリクエストハンドラーを試してみてください。一通りのテストが完了したら、スキルの認定を申請して世界中のAlexaユーザーに公開するプロセスに進ことができます。
