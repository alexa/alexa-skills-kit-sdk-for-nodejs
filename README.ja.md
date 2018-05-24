# ASK SDK for Node.js [![Build Status](https://travis-ci.org/alexa/alexa-skills-kit-sdk-for-nodejs.svg?branch=2.0.x)](https://travis-ci.org/alexa/alexa-skills-kit-sdk-for-nodejs)

*[English](README.md) | [日本語](README.ja.md)*

| Package       | NPM           |
| ------------- | ------------- |
|[ask-sdk](./ask-sdk)| [![npm](https://img.shields.io/npm/v/ask-sdk.svg)](https://www.npmjs.com/package/ask-sdk) [![npm](https://img.shields.io/npm/dt/ask-sdk.svg)](https://www.npmjs.com/package/ask-sdk)| 
|[ask-sdk-core](./ask-sdk-core)| [![npm](https://img.shields.io/npm/v/ask-sdk-core.svg)](https://www.npmjs.com/package/ask-sdk-core) [![npm](https://img.shields.io/npm/dt/ask-sdk-core.svg)](https://www.npmjs.com/package/ask-sdk-core)| 
|[ask-sdk-dynamodb-persistence-adapter](./ask-sdk-dynamodb-persistence-adapter)| [![npm](https://img.shields.io/npm/v/ask-sdk-dynamodb-persistence-adapter.svg)](https://www.npmjs.com/package/ask-sdk-dynamodb-persistence-adapter) [![npm](https://img.shields.io/npm/dt/ask-sdk-dynamodb-persistence-adapter.svg)](https://www.npmjs.com/package/ask-sdk-dynamodb-persistence-adapter)|
|[ask-sdk-v1adapter](./ask-sdk-v1adapter)|[![npm](https://img.shields.io/npm/v/ask-sdk-v1adapter.svg)](https://www.npmjs.com/package/ask-sdk-v1adapter) [![npm](https://img.shields.io/npm/dt/ask-sdk-v1adapter.svg)](https://www.npmjs.com/package/ask-sdk-v1adapter)|

ASK SDK v2 for Node.jsを使うと、ボイラープレートコード（毎回書かなければならないお決まりのコード）を書く手間が不要になります。これにより空いた時間をさまざまな機能の実装に充てることができ、人気のスキルをより簡単に作成できるようになります。

SDKを使って開発を始めるには、以下のリソースをご覧ください。

## ガイド

### [ASK SDKのセットアップ](../../wiki/[Japanese]-Setting-Up-The-ASK-SDK)
NPMプロジェクトに依存関係としてSDKをインストールする方法を説明します。

### [初めてのスキル開発](../../wiki/[Japanese]-Developing-Your-First-Skill)
Hello Worldサンプルをビルドする手順を詳しく説明します。

### [ASK SDK移行ガイド](../../wiki/[Japanese]-ASK-SDK-Migration-Guide)
SDK v1からSDK v2にAlexaスキルを移行する手順を説明します。

### [リクエスト処理](../../wiki/[Japanese]-Request-Processing)
リクエストハンドラー、例外ハンドラー、リクエストと応答のインターセプターをビルドする方法を説明します。

### [スキルのアトリビュート](../../wiki/[Japanese]-Skill-Attributes)
スキルのアトリビュートを使ったスキルデータの保存と取得の方法を説明します。

### [応答のビルド](../../wiki/[Japanese]-Response-Building)
ResponseBuilderを使って、テキスト、カード、オーディオといった複数の要素を使用して1つの応答を構成する方法を説明します。

### [Alexaサービスクライアント](../../wiki/[Japanese]-Alexa-Service-Clients)
サービスクライアントを使ってスキルからAlexa APIにアクセスする方法を説明します。.

### [スキルビルダー](../../wiki/[Japanese]-Skill-Builders)
スキルインスタンスの構成と作成の方法を説明します。

### [スキル内課金（英語）](../../wiki/Managing-In-Skill-Purchases)
スキル内課金とスキル内での購入を管理する方法を説明します。

## サンプル

### [Hello World](https://github.com/alexa/skill-sample-nodejs-hello-world)
Alexa Skills KitとAWS Lambdaの学習に役立つサンプルです。サンプルを起動すると、Alexaからの応答を聞くことができます。

### [ファクト](https://github.com/alexa/skill-sample-nodejs-fact)
基本的な豆知識スキルのテンプレートです。トピックについての豆知識のリストを提供すると、ユーザーがスキルを呼び出したときに、Alexaがリストから豆知識をランダムに選んでユーザーに伝えます。

### [ハウツー](https://github.com/alexa/skill-sample-nodejs-howto)
「Minecraft Helper」というパラメーターベースのスキルテンプレートです。ユーザーがMinecraftでのアイテムの作成方法を尋ねると、スキルが手順を教えてくれます。

### [トリビア](https://github.com/alexa/skill-sample-nodejs-trivia)
スコアが記録されるトリビア形式のゲームテンプレートです。Alexaがユーザーに多肢選択形式の質問をし、回答を求めます。質問に対する正答と誤答が記録されます。

### [クイズゲーム](https://github.com/alexa/skill-sample-nodejs-quiz-game)
基本的なクイズゲームスキルのテンプレートです。あらかじめ提供しておいた豆知識のリストの中から、Alexaがユーザーにクイズを出します。

### [シティガイド](https://github.com/alexa/skill-sample-nodejs-city-guide)
周辺地域のおすすめ情報スキルのテンプレートです。Alexaはユーザーのリクエストに従って、開発者が提供したデータからおすすめ情報をユーザーに知らせます。

### [ペットマッチ](https://github.com/alexa/skill-sample-nodejs-petmatch)
ユーザーとペットをマッチングするサンプルスキルです。Alexaは一致するペットを見つけるのに必要な情報をユーザーに尋ねます。必要な情報をすべて収集できたら、スキルはデータを外部のウェブサービスに送信し、そこでデータが処理されてマッチングデータが返されます。

### [ハイ＆ローゲーム](https://github.com/alexa/skill-sample-nodejs-highlowgame)
基本的なハイ＆ローゲームスキルのテンプレートです。ユーザーが数字を推測し、Alexaがその数字が正解より大きいか小さいかを答えます。

### [決定木](https://github.com/alexa/skill-sample-nodejs-decision-tree)
基本的な決定木のスキルです。Alexaがユーザーに一連の質問をして、キャリアに関するアドバイスをします。

### [デバイスアドレスAPI](https://github.com/alexa/skill-sample-node-device-address-api)
ユーザーのデバイス設定で設定したアドレスをリクエストし、アドレスにリクエストするサンプルスキルです。

## フィードバック
Alexaの機能に関するリクエストや投票は、[こちら](https://alexa.uservoice.com/forums/906892-alexa-skills-developer-voice-and-vote)をご覧ください。
