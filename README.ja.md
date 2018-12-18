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

## SDKでサポートされているAlexaの機能

- [Amazon Pay](https://developer.amazon.com/docs/amazon-pay/integrate-skill-with-amazon-pay.html)
- [Audio Player](https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html)
- [Display – 画面付きデバイス用のBodyテンプレート](https://developer.amazon.com/docs/custom-skills/create-skills-for-alexa-enabled-devices-with-a-screen.html)
- [Gadgets Game Engine – Echo Buttons（日本未対応）](https://developer.amazon.com/docs/custom-skills/game-engine-interface-reference.html)
- [Directiveサービス（プログレッシブ応答）](https://developer.amazon.com/docs/custom-skills/send-the-user-a-progressive-response.html)
- [メッセージ](https://developer.amazon.com/docs/smapi/send-a-message-request-to-a-skill.html)
- [収益化](https://developer.amazon.com/alexa-skills-kit/make-money)
- [ビデオ](https://developer.amazon.com/docs/custom-skills/videoapp-interface-reference.html)
- [デバイスのアドレス](https://developer.amazon.com/docs/custom-skills/device-address-api.html)
- [リスト](https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#alexa-lists-access)
- [ユーザー連絡先情報のリクエスト](https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html)
- [ユーザー設定情報の取得](https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html)
- [アカウントリンク](https://developer.amazon.com/docs/account-linking/understand-account-linking.html)
- [スロットタイプ値の同義語とIDを定義する（エンティティ解決）](https://developer.amazon.com/docs/custom-skills/define-synonyms-and-ids-for-slot-type-values-entity-resolution.html)
- [ダイアログ管理](https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html)
- [Location Services](https://developer.amazon.com/docs/custom-skills/location-services-for-alexa-skills.html)
- [Reminders](https://developer.amazon.com/docs/smapi/alexa-reminders-overview.html)

### プレビュー機能

以下の機能は、公開プレビュー版としてリリースされます。インターフェースは今後のリリースで変更される可能性があります。

- [Connections](https://developer.amazon.com/blogs/alexa/post/7b332b32-893e-4cad-be07-a5877efcbbb4/skill-connections-preview-now-skills-can-work-together-to-help-customers-get-more-done)
- [Alexa Presentation Language](https://developer.amazon.com/docs/alexa-presentation-language/apl-overview.html)
- [無指名対話](https://developer.amazon.com/docs/custom-skills/understand-name-free-interaction-for-custom-skills.html)

## 技術資料

| 言語 | ドキュメント |
| -------- | ------------- |
| [English](https://ask-sdk-for-nodejs.readthedocs.io/en/latest/) | [![Documentation Status](https://readthedocs.org/projects/ask-sdk-for-nodejs/badge/?version=latest)](https://ask-sdk-for-nodejs.readthedocs.io/en/latest/?badge=latest) |
| [日本語](https://ask-sdk-for-nodejs.readthedocs.io/ja/latest/) | [![Documentation Status](https://readthedocs.org/projects/ask-sdk-for-nodejs-japanese/badge/?version=latest)](https://ask-sdk-for-nodejs.readthedocs.io/ja/latest/?badge=latest) |

## サンプル

SDKは、ネイティブのAlexa JSONのリクエストと応答ではなく、モデルクラスで処理します。これらのモデルクラスはRequestおよびResponse JSONスキーマを使用して[developer docs](https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html)から生成します。これらのモデルクラスのソースコードは[こちら](https://github.com/alexa/alexa-apis-for-nodejs)にあります。

### サンプル

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

## その他の言語のAlexa Skills Kit SDK
<a href="https://github.com/amzn/alexa-skills-kit-java"><img src="https://github.com/konpa/devicon/raw/master/icons/java/java-original.svg?sanitize=true" width="25px" /> Alexa Skills Kit SDK for Java</a>

<a href="https://github.com/alexa-labs/alexa-skills-kit-sdk-for-python"><img src="https://github.com/konpa/devicon/blob/master/icons/python/python-original.svg?sanitize=true" width="25px" /> Alexa Skills Kit SDK for Python</a>

## Got Feedback?
Alexaの機能に関するリクエストや投票は、[こちら](https://alexa.uservoice.com/forums/906892-alexa-skills-developer-voice-and-vote/filters/top?category_id=322783)をご覧ください。
