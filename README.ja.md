<p align="center">
  <img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/avs/docs/ux/branding/mark1._TTH_.png">
  <br/>
  <h1 align="center">Alexa Skills Kit SDK for Node.js</h1>
  <p align="center"><a href="https://travis-ci.org/alexa/alexa-skills-kit-sdk-for-nodejs"><img src="https://travis-ci.org/alexa/alexa-skills-kit-sdk-for-nodejs.svg?branch=2.0.x"></a></p>
</p>

*[English](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/blob/2.0.x/README.md) | [日本語](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/blob/2.0.x/README.ja.md)*

ASK SDK v2 for Node.jsを使うと、ボイラープレートコード（毎回書かなければならないお決まりのコード）を書く手間が不要になります。これにより空いた時間をさまざまな機能の実装に充てることができ、人気のスキルをより簡単に作成できるようになります。

## パッケージのバージョン

| Package       | NPM           |
| ------------- | ------------- |
|[ask-sdk](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk)| [![npm](https://img.shields.io/npm/v/ask-sdk.svg)](https://www.npmjs.com/package/ask-sdk) [![npm](https://img.shields.io/npm/dt/ask-sdk.svg)](https://www.npmjs.com/package/ask-sdk)|
|[ask-sdk-core](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk-core)| [![npm](https://img.shields.io/npm/v/ask-sdk-core.svg)](https://www.npmjs.com/package/ask-sdk-core) [![npm](https://img.shields.io/npm/dt/ask-sdk-core.svg)](https://www.npmjs.com/package/ask-sdk-core)|
|[ask-sdk-dynamodb-persistence-adapter](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk-dynamodb-persistence-adapter)| [![npm](https://img.shields.io/npm/v/ask-sdk-dynamodb-persistence-adapter.svg)](https://www.npmjs.com/package/ask-sdk-dynamodb-persistence-adapter) [![npm](https://img.shields.io/npm/dt/ask-sdk-dynamodb-persistence-adapter.svg)](https://www.npmjs.com/package/ask-sdk-dynamodb-persistence-adapter)|
|[ask-sdk-runtime](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk-runtime)| [![npm](https://img.shields.io/npm/v/ask-sdk-runtime.svg)](https://www.npmjs.com/package/ask-sdk-runtime) [![npm](https://img.shields.io/npm/dt/ask-sdk-runtime.svg)](https://www.npmjs.com/package/ask-sdk-runtime)|
|[ask-sdk-s3-persistence-adapter](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk-s3-persistence-adapter)| [![npm](https://img.shields.io/npm/v/ask-sdk-s3-persistence-adapter.svg)](https://www.npmjs.com/package/ask-sdk-s3-persistence-adapter) [![npm](https://img.shields.io/npm/dt/ask-sdk-s3-persistence-adapter.svg)](https://www.npmjs.com/package/ask-sdk-s3-persistence-adapter)|
|[ask-sdk-v1adapter](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk-v1adapter)|[![npm](https://img.shields.io/npm/v/ask-sdk-v1adapter.svg)](https://www.npmjs.com/package/ask-sdk-v1adapter) [![npm](https://img.shields.io/npm/dt/ask-sdk-v1adapter.svg)](https://www.npmjs.com/package/ask-sdk-v1adapter)|


SDKを使って開発を始めるには、以下のリソースをご覧ください。

## ガイド

| 言語 | 資料 |
| -------- | ------------- |
| [English](https://ask-sdk-for-nodejs.readthedocs.io/en/latest/) | [![Documentation Status](https://readthedocs.org/projects/ask-sdk-for-nodejs/badge/?version=latest)](https://ask-sdk-for-nodejs.readthedocs.io/en/latest/?badge=latest) |
| [日本語](https://ask-sdk-for-nodejs.readthedocs.io/ja/latest/) | [![Documentation Status](https://readthedocs.org/projects/ask-sdk-for-nodejs-japanese/badge/?version=latest)](https://ask-sdk-for-nodejs.readthedocs.io/ja/latest/?badge=latest) |

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
