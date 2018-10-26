************************
ASK SDK移行ガイド
************************

このガイドでは、ASK SDK v2 for Node.jsとASK SDK v1アダプターを使ってASK SDK v1 for Node.js（alexa-sdk）で開発した既存のスキルをv2 SDK（ask-sdk）に移行する手順を詳しく説明します。

後方互換性
=======================

ASK SDK v1アダプターにはASK SDK v1インターフェースとの後方互換性があるため、v1のAlexaスキルを簡単にSDK v2に移行できます。v1アダプターを使うと、v1とv2の形式でコーディングされたリクエストハンドラーを共存させることができます。これにより、既存のAlexaスキルをv2形式のリクエストハンドラーで拡張でき、同時に既存のハンドラーを都合の良いタイミングでアップデートできます。新規のスキルの場合、v2の機能を活用するために最初からASK SDK v2 for Node.jsで開発するようにしてください。

前提条件
=============

-  インストールされた標準ASK SDKモジュールとの依存関係を持つ\ `NPM <https://www.npmjs.com/>`__ プロジェクト。標準ASK SDKモジュールのインストールについては\ `ASK SDK v2 for Node.jsのセットアップ <Setting-Up-The-ASK-SDK.html>`__\ セクションを参照してください。ASK SDK v1アダプターには、標準ASK SDK v2 for Node.js配布パッケージ（ask-sdk）とのpeer依存関係があります。
-  適切なNode.js開発環境。ASK SDK v2 for Node.jsには、Node.jsのバージョン4.3.2以上が必要です。

移行の手順
===============

ASK SDK v1アダプターをプロジェクトに追加する
---------------------------------------------------

NPMプロジェクトから、以下のコマンドを実行してASK SDK v1アダプターモジュールをインストールします。

::

   npm install --save ask-sdk-v1adapter

import文をアップデートする
-----------------------------

ASK SDK v1 for Node.jsを使用するスキルコードを移植するには、\ ``alexa-sdk``\ パッケージではなく\ ``ask-sdk-v1adapter``\ パッケージからインポートする必要があります。アダプターは内部のロジック解釈を処理してASK SDK v2 for Node.jsを使用する ``Skill``\ インスタンスを作成します。

コードの以下の部分を変更します。

.. code:: javascript

   const Alexa = require('alexa-sdk');

変更後は以下のようになります。

.. code:: javascript

   const Alexa = require('ask-sdk-v1adapter');

スキルコードのこれ以外の部分は変更しません。

::

   exports.handler = function(event, context, callback) {
       const alexa = Alexa.handler(event, context, callback);
       alexa.appId = APP_ID // APP_IDは、スキルを作成したAmazon開発者コンソールで割り当てられたスキルIDのことです。
       alexa.registerHandlers(...)
       alexa.execute();
   };

v2リクエストハンドラーを追加する
----------------------------------------------------

ASK SDK v1アダプターを使用することで、v1とv2のリクエストハンドラーを共存させることができます。ただし、Alexaスキルを拡張している場合は、ASK SDK v2 for Node.jsの機能をフルに活用できるv2のリクエストハンドラーを使用することをお勧めします。

リクエストを処理できるv1ハンドラーがない場合のみ、v1のリクエストハンドラーの後にv2のリクエストハンドラーにアクセスします。そのため、v1ハンドラーをv2ハンドラーで置き換えた場合、v1ハンドラーのコードを必ず削除してください。

以下のコードサンプルでは、 ``AMAZON.HelpIntent``\ を処理できるv2リクエストハンドラーを既存の `hello worldサンプルスキル <https://github.com/alexa/skill-sample-nodejs-hello-world/tree/last-with-sdk-v1>`_ に追加しています。この例では、元のv1の\ ``AMAZON.HelpIntent`` ハンドラーが\ ``handlers``\ 定数から削除されています。

.. code:: javascript

   'use strict';
   const Alexa = require('ask-sdk-v1adapter');

   exports.handler = function(event, context, callback) {
       const alexa = Alexa.handler(event, context);
       alexa.registerHandlers(handlers);
       alexa.registerV2Handlers(HelpIntentHandler); // v2リクエストハンドラー
       alexa.execute();を登録するための新しいAPI関数
   };

   const handlers = {
       'LaunchRequest': function () {
           this.emit('こんにちは、と言ってください。');
       },
       'HelloWorldIntent': function () {
           this.emit('こんにちは');
       },
       'SayHello': function () {
           this.response.speak('こんにちは!');
           this.emit(':responseReady');
       },
       'AMAZON.CancelIntent': function () {
           this.response.speak('さようなら');
           this.emit(':responseReady');
       },
       'AMAZON.StopIntent': function () {
           this.response.speak('またね');
           this.emit(':responseReady');
       }
   };

   // HelpIntentHandlerは次のv2リクエストハンドラーインターフェースを再書き込みします
   const HelpIntentHandler = {
       canHandle : function({requestEnvelope}) {
           return requestEnvelope.request.type === 'IntentRequest'
           && requestEvelope.request.intent.name === 'AMAZON.HelpIntent';
       },
       handle : function({responseBuilder}){
           const speechOutput = 'これはご挨拶をするサンプルスキルです。';
           const reprompt = 'こんにちは、と言ってみてください。';
           return responseBuilder.speak(speechOutput)
                                 .reprompt(reprompt)
                                 .getResponse();
       },
   };
