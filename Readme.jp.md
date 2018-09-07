<span style="color:red"> **This version of the Alexa Skills Kit SDK is no longer supported. Please use the v2 release found [here](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)** </span>

# Alexa Skills Kit SDK for Node.js
<!-- TOC -->

- [Alexa Skills Kit SDK for Node.js](#alexa-skills-kit-sdk-for-nodejs)
    - [概要](#概要)
    - [セットアップガイド](#セットアップガイド)
    - [Getting Started: Hello Worldスキルの記述](#getting-started-hello-worldスキルの記述)
        - [基本的なプロジェクトの構造](#基本的なプロジェクトの構造)
        - [エントリポイントを設定する](#エントリポイントを設定する)
        - [ハンドラ関数を実装する](#ハンドラ関数を実装する)
    - [レスポンス vs ResponseBuilder](#レスポンス-vs-responsebuilder)
        - [Tips](#tips)
    - [標準のリクエストとレスポンス](#標準のリクエストとレスポンス)
    - [インターフェース](#インターフェース)
        - [AudioPlayerインターフェース](#audioplayerインターフェース)
        - [Dialogインターフェース](#dialogインターフェース)
            - [Delegateディレクティブ](#delegateディレクティブ)
            - [Elicit Slotディレクティブ](#elicit-slotディレクティブ)
            - [Confirm Slotディレクティブ](#confirm-slotディレクティブ)
            - [Confirm Intentディレクティブ](#confirm-intentディレクティブ)
        - [Displayインターフェース](#displayインターフェース)
        - [Playback Controllerインターフェース](#playback-controllerインターフェース)
        - [VideoAppインターフェース](#videoappインターフェース)
        - [SkillとList Events](#skillとlist-events)
    - [サービス](#サービス)
        - [Device Addressサービス](#device-addressサービス)
        - [List Managementサービス](#list-managementサービス)
        - [ディレクティブサービス](#ディレクティブサービス)
    - [機能を拡張する](#機能を拡張する)
        - [スキルの状態管理](#スキルの状態管理)
        - [DynamoDBによるスキル属性の保持](#dynamodbによるスキル属性の保持)
        - [スキルへの多言語対応の追加](#スキルへの多言語対応の追加)
        - [Device IDのサポート](#device-idのサポート)
        - [Speechcons (感嘆詞)](#speechcons-%E6%84%9F%E5%98%86%E8%A9%9E)
    - [開発環境のセットアップ](#開発環境のセットアップ)

<!-- /TOC -->

## 概要

Alexa SDKチームは、新しい **Alexa Node.js SDK** をお届けできることを誇りに思います。これは、開発者のために開発者が作成したオープンソースのAlexaスキル開発キットです。

現在のAlexaスキル開発で最も一般的な方法の1つが、Alexa Skills Kit、Node.js、AWS Lambdaを使用してスキルを作成することです。Node.jsのイベント駆動型ノンブロッキングI/OモデルはAlexaスキルに適していますし、Node.jsは世界のオープンソースライブラリの最も大きなエコシステムの1つです。さらに、AWS Lambdaは毎月最初の100万回の呼び出しが無料で、ほとんどのAlexaスキル開発者にとって満足できます。また、AWS Lambdaを使用する場合、Alexa Skills Kitは信頼できるトリガーなので、SSL証明書をあなたが管理する必要はありません。

AWS Lambda、Node.js、Alexa Skills Kitを使用したAlexaスキルの構築は、簡単な作業ではありましたが、たくさんのコードを書かなければなりませんでした。そこで、Alexa SDKチームは、Node.js用のAlexa Skills Kit SDKを作成しました。これは、一般的なつまづきを避けて、定型コードではなくスキルのロジックに集中することをお手伝いします。

新しいalexa-sdkでの私たちの目標は、不要な複雑さを避けて、あなたがスキルを素早く構築するのを助けることです。現在、このSDKは、次の機能を備えています。

- あらゆるNode.js環境に簡単にデプロイできるNPMパッケージとしてホストされています
- ビルトインのイベントを使用してAlexaのレスポンスを構築する機能
- 「catch-all」なイベントとして使えるNew SessionイベントとUnhandledイベント
- インテント処理をステートマシンベースで構築するためのヘルパー機能
- この機能で、スキルの現在の状態に基づいて異なるイベントハンドラを定義できます
- DynamoDBで属性の永続性を有効にする簡単な設定
- すべての音声出力がSSMLとして自動的にラップされます
- Lambdaイベントとコンテキストオブジェクトは、`this.event`と`this.context`を通して完全に利用できます
- ビルトイン関数を上書きすることで、状態の管理やレスポンスの構築をより柔軟な方法でおこなえます。たとえば、AWS S3に状態の属性を保存できます。

## セットアップガイド
alexa-sdkは、[Github](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs)ですぐに入手できます。あなたのNode.js環境で次のコマンドを実行して、nodeパッケージとしてデプロイできます。
```
npm install --save alexa-sdk
```
## Getting Started: Hello Worldスキルの記述
### 基本的なプロジェクトの構造
HelloWorldスキルには次のものが必要です。
- スキルに必要なすべてのパッケージをインポート、イベントの受け取り、appIdの設定、dynamoDBテーブルの設定、ハンドラ登録などをする、スキルのエントリポイント
- 各リクエストを処理するハンドラ関数

### エントリポイントを設定する
あなたのプロジェクトにエントリポイントを設定するには、単にindex.jsという名前のファイルを作成して、次の内容を追加します。
```javascript
const Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID // APP_ID とは、スキルを作成するAmazon開発者コンソールに表示されるあなたのスキルIDです。
    alexa.execute();
};
```
上のコードは、alexa-sdkをインポートして、これから作業するAlexaオブジェクトをセットアップします。

### ハンドラ関数を実装する
次に、スキルのためにイベントとインテントを処理する必要があります。alexa-sdkを使うと、関数にインテントを発火させることが簡単になります。ハンドラ関数は、先ほど作成したindex.jsファイルに実装することも、別のファイルに記述して後からインポートすることもできます。 たとえば、 'HelloWorldIntent'のハンドラを作成するには、次の2つの方法があります。
```javascript
const handlers = {
    'HelloWorldIntent' : function() {
        // レスポンスを直接返します
        this.emit(':tell', 'Hello World!');
    }
};
```
または
```javascript
const handlers = {
    'HelloWorldIntent' : function() {
        // まずresponseBuilderを使ってレスポンスを構築してから返します
        this.response.speak('Hello World!');
        this.emit(':responseReady');
    }
};
```

alexa-sdkは、responseBuilderでspeak/listenに対応するoutputSpeechレスポンスオブジェクトを生成するにあたり、tell/askレスポンス方式にしたがいます。
```javascript
this.emit(':tell', 'Hello World!'); 
this.emit(':ask', 'What would you like to do?', 'Please say that again?');
```
上のコードは、次のコードと同等です。
```javascript
this.response.speak('Hello World!');
this.emit(':responseReady');

this.response.speak('What would you like to do?')
            .listen('Please say that again?');
this.emit(':responseReady');
```
:ask/listen と :tell/speak の違いは、:tell/speakアクションの後、ユーザーがさらに入力するのを待つことなくセッションが終了することです。レスポンスを使用する方法と、responseBuilderを使用してレスポンスオブジェクトを作成する方法を、次のセクションで比較します。

ハンドラはリクエストを互いに転送できるので、ハンドラを連鎖することでより良いユーザーフローを実現できます。ここでは、LaunchRequestと (HelloWorldIntentの) IntentRequestが、両方同じ「Hello World」メッセージを返す例を示します。
```javascript
const handlers = {
    'LaunchRequest': function () {
    	this.emit('HelloWorldIntent');
	},

	'HelloWorldIntent': function () {
    	this.emit(':tell', 'Hello World!');
	}
};
```

イベントハンドラをセットアップしたら、先ほど作成したalexaオブジェクトのregisterHandlers関数を使って、イベントハンドラを登録する必要があります。そのため、index.jsファイルに次の行を追加します。

```javascript
const Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
```
一度に複数のハンドラオブジェクトの登録もできます。
```javascript
alexa.registerHandlers(handlers, handlers2, handlers3, ...);
```
上の手順を完了すると、スキルがデバイスで正しく動作するはずです。


## レスポンス vs ResponseBuilder

現在、Node.js SDKで[レスポンスオブジェクト](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#Response%20Format)を生成するには、2つの方法があります。最初の方法は、this.emit(`:${action}`, 'responseContent') の形式にしたがう構文を使用します。一般的なスキルのレスポンスについて、例の完全なリストを次に示します。

|レスポンス構文 | 説明 |
|----------------|-----------|
| this.emit(':tell',speechOutput);| [speechOutput](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#outputspeech-object)を使ったTell| 
|this.emit(':ask', speechOutput, repromptSpeech);|[speechOutput](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#outputspeech-object)と[repromptSpeech](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#reprompt-object)を使ったAsk|
|this.emit(':tellWithCard', speechOutput, cardTitle, cardContent, imageObj);| [speechOutput](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#outputspeech-object)と[standard card](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#card-object)を使ったTell|
|this.emit(':askWithCard', speechOutput, repromptSpeech, cardTitle, cardContent, imageObj);| [speechOutput](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#outputspeech-object), [repromptSpeech](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#reprompt-object)と[standard card](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#card-object)を使ったAsk|
|this.emit(':tellWithLinkAccountCard', speechOutput);| [linkAccount card](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#card-object)を使ったTell, 詳しくは[こちら](https://developer.amazon.com/ja/docs/custom-skills/link-an-alexa-user-with-a-user-in-your-system.html)をクリック|
|this.emit(':askWithLinkAccountCard', speechOutput);| [linkAccount card](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#card-object)を使ったAsk, 詳しくは[こちら](https://developer.amazon.com/ja/docs/custom-skills/link-an-alexa-user-with-a-user-in-your-system.html)をクリック|
|this.emit(':tellWithPermissionCard', speechOutput, permissionArray);| [permission card](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#session-object)を使ったTell, 詳しくは[こちら](https://developer.amazon.com/ja/docs/custom-skills/configure-permissions-for-customer-information-in-your-skill.html)をクリック|
|this.emit(':askWithPermissionCard', speechOutput, repromptSpeech, permissionArray)| [permission card](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#session-object)を使ったAsk, 詳しくは[こちら](https://developer.amazon.com/ja/docs/custom-skills/configure-permissions-for-customer-information-in-your-skill.html)をクリック|
|this.emit(':delegate', updatedIntent);|[dialog model](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)で[delegate directive](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#delegate)を使ったレスポンス |
|this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech, updatedIntent);|[dialog model](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)で[elicitSlot directive](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#elicitslot)を使ったレスポンス |
|this.emit(':elicitSlotWithCard', slotToElicit, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj);| [card](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#card-object)と[dialog model](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)の[elicitSlot directive](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#elicitslot)を使ったレスポンス |
|this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech, updatedIntent);|[dialog model](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)で[confirmSlot directive](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#confirmslot)を使ったレスポンス|
|this.emit(':confirmSlotWithCard', slotToConfirm, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj);| [card](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#card-object)と[dialog model](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)で[confirmSlot directive](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#confirmslot)を使ったレスポンス|
|this.emit(':confirmIntent', speechOutput, repromptSpeech, updatedIntent);|[dialog model](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)で[confirmIntent directive](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#confirmintent)を使ったレスポンス |
|this.emit(':confirmIntentWithCard', speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj);| [card](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#card-object)と[dialog model](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#dialog-model-required)で[confirmIntent directive](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html#confirmintent)を使ったレスポンス|
|this.emit(':responseReady');|レスポンスが構築された後、Alexaサービスに返される前に呼び出される。saveStateを呼び出す。上書きできる。|
|this.emit(':saveState', false);|this.attributesの内容と現在のハンドラの状態をDynamoDBに保存し、それより前に構築したレスポンスをAlexaサービスに送信する。異なる永続性プロバイダを使用したい場合は、上書きする。2番目の属性はオプションで、保存を強制するために'true'を設定できる。|
|this.emit(':saveStateError'); |状態の保存中にエラーが発生すると呼び出される。上書きしてエラーを処理する。|

独自のレスポンスを手動で作成するには、`this.response`を使います。`this.response`には一連の関数が含まれており、レスポンスのさまざまなプロパティを設定できます。これを使うことで、Alexa Skills Kitに組み込みのオーディオとビデオプレイヤーの機能を使えます。レスポンスを設定したら、`this.emit(':responseReady')`を呼び出すだけでAlexaにレスポンスを送れます。`this.response`内の関数も連鎖可能なので、1行の中で好きなだけ繋げて使えます。responseBuilderを使用してレスポンスを作成する例の完全なリストを次に示します。

|レスポンス構文 | 説明 |
|----------------|-----------|
|this.response.speak(speechOutput);| 最初の音声出力を[speechOutput](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#outputspeech-object)に設定する|
|this.response.listen(repromptSpeech);| 再読み上げの音声出力を[repromptSpeech](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#reprompt-object)に設定し、shouldEndSessionをfalseにする。この関数が呼び出されないかぎり、this.responseは、shouldEndSessionをtrueに設定する。|
|this.response.cardRenderer(cardTitle, cardContent, cardImage);| レスポンスとして[standard card](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#card-object)にcardTitle, cardContent, cardImageを追加する|
|this.response.linkAccountCard();| レスポンスとして[linkAccount card](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#card-object)を追加する。詳しくは[こちら](https://developer.amazon.com/ja/docs/custom-skills/link-an-alexa-user-with-a-user-in-your-system.html)をクリック|
|this.response.askForPermissionsConsentCard(permissions);| レスポンスに[perimission](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#session-object)を要求するカードを追加する。詳しくは[こちら](https://developer.amazon.com/ja/docs/custom-skills/configure-permissions-for-customer-information-in-your-skill.html)をクリック|
|this.response.audioPlayer(directiveType, behavior, url, token, expectedPreviousToken, offsetInMilliseconds);(Deprecated) | 提供されたパラメータでレスポンスに[AudioPlayer directive](https://developer.amazon.com/ja/docs/custom-skills/audioplayer-interface-reference.html)を追加する。|
|this.response.audioPlayerPlay(behavior, url, token, expectedPreviousToken, offsetInMilliseconds);| 提供されたパラメータを使用して[AudioPlayer directive](https://developer.amazon.com/ja/docs/custom-skills/audioplayer-interface-reference.html)を追加し、ディレクティブタイプとして[`AudioPlayer.Play`](https://developer.amazon.com/ja/docs/custom-skills/audioplayer-interface-reference.html#play)を設定する。|
|this.response.audioPlayerStop();| [AudioPlayer.Stop directive](https://developer.amazon.com/ja/docs/custom-skills/audioplayer-interface-reference.html#stop)を追加する|
|this.response.audioPlayerClearQueue(clearBehavior);|[AudioPlayer.ClearQueue directive](https://developer.amazon.com/ja/docs/custom-skills/audioplayer-interface-reference.html#clearqueue)を追加してディレクティブをクリアする振る舞いを設定する。|
|this.response.renderTemplate(template);| レスポンスに[Display.RenderTemplate directive](https://developer.amazon.com/ja/docs/custom-skills/display-interface-reference.html)を追加する|
|this.response.hint(hintText, hintType);| レスポンスに[Hint directive](https://developer.amazon.com/ja/docs/custom-skills/display-interface-reference.html#hint-directive)を追加する|
|this.response.playVideo(videoSource, metadata);|レスポンスに[VideoApp.Play directive](https://developer.amazon.com/ja/docs/custom-skills/videoapp-interface-reference.html#videoapp-directives)を追加する|
|this.response.shouldEndSession(bool);| shouldEndSessionを手動で設定する|

レスポンスの設定が完了したら、単に`this.emit(':responseReady')`を呼び出してレスポンスを送信してください。いくつかのレスポンスオブジェクトでレスポンスを作成する2つの例を次に示します。
```
//Example 1
this.response.speak(speechOutput)
            .listen(repromptSpeech);
this.emit(':responseReady');
//Example 2
this.response.speak(speechOutput)
            .cardRenderer(cardTitle, cardContent, cardImage)
            .renderTemplate(template)
            .hint(hintText, hintType);
this.emit(':responseReady');
```
responseBuilderにはリッチなレスポンスオブジェクトを作成できる柔軟性があるので、このメソッドを使用してレスポンスを構築することをお勧めします。

### Tips
- `:ask`, `:tell`, `:askWithCard`などのレスポンスイベントのいずれかが出力されたとき、開発者が`callback`関数を渡さなければ、Lambdaのcontext.succeed()メソッドが呼び出され、それ以上のバックグラウンドタスクの処理を直ちに停止します。未完了のあらゆる非同期ジョブは完了されず、レスポンスemit構文よりも下の行のコードは実行されません。これは、`:saveState`のようなレスポンスを返さないイベントの場合には当てはまりません。
- インテント「転送」と呼ばれる、ある状態ハンドラから別の状態ハンドラへリクエストを転送するには、`this.handler.state`を対象の状態の名前に設定する必要があります。対象の状態が "" の場合は、`this.emit("TargetHandlerName")`を呼び出します。他の状態のときは、代わりに`this.emitWithState("TargetHandlerName")`を呼び出さなければなりません。
- promptとrepromptの値の内容は、SSMLタグでラップされます。つまり、値に含まれるすべての特殊なXML文字をエスケープする必要があります。たとえば、this.emit(":ask", "I like M&M's")は、そのままだと失敗します。`&`文字を`&amp;`にエンコードする必要があるためです。エンコードする必要がある他の文字には、`<` -> `&lt;`と`>` -> `&gt;`があります。

## 標準のリクエストとレスポンス
Alexaは、HTTPSを使用するリクエスト/レスポンスの仕組みを介して、スキルサービスと通信します。ユーザーがAlexaスキルと対話すると、あなたのサービスはJSONのbodyを含むPOSTリクエストを受け取ります。リクエストbodyには、サービスがロジックを実行してJSON形式のレスポンスを生成するために必要なパラメータが含まれています。Node.jsはJSONをネイティブに処理できるので、Alexa Node.js SDKはJSONのシリアライズとデシリアライズをする必要はありません。開発者は、Alexaがユーザーのリクエストに応答するために、適切なレスポンスオブジェクトを提供する責任だけを持ちます。リクエストbodyのJSON構造に関するドキュメントは、[こちら](https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#request-format)にあります。

SpeechletResponseには、次の属性が含まれます。
- OutputSpeech
- Reprompt
- Card
- Directiveのリスト
- shouldEndSession

一例として、音声とカードの両方を含む簡単なレスポンスを次のように構築できます。

```javascript
const speechOutput = 'Hello world!';
const repromptSpeech = 'Hello again!';
const cardTitle = 'Hello World Card';
const cardContent = 'This text will be displayed in the companion app card.';
const imageObj = {
	smallImageUrl: 'https://imgs.xkcd.com/comics/standards.png',
	largeImageUrl: 'https://imgs.xkcd.com/comics/standards.png'
};
this.response.speak(speechOutput)
            .listen(repromptSpeech)
            .cardRenderer(cardTitle, cardContent, imageObj);
this.emit(':responseReady');
```


## インターフェース 

### AudioPlayerインターフェース
開発者は、(それぞれの) スキルのレスポンスに次のディレクティブを含めることができます。
- `PlayDirective`
- `StopDirective`
- `ClearQueueDirective`

オーディオのストリームに`PlayDirective`を使用する例を次に示します。
```javascript
const handlers = {
    'LaunchRequest' : function() {
        const speechOutput = 'Hello world!';
        const behavior = 'REPLACE_ALL';
        const url = 'https://url/to/audiosource';
        const token = 'myMusic';
        const expectedPreviousToken = 'expectedPreviousStream';
        const offsetInMilliseconds = 10000;
        this.response.speak(speechOutput)
                    .audioPlayerPlay(behavior, url, token, expectedPreviousToken, offsetInMilliseconds);
        this.emit(':responseReady');
    }
};
```
上の例では、Alexaはまず`speechOutput`を発声してからオーディオを再生しようとします。

[AudioPlayer](https://developer.amazon.com/ja/docs/custom-skills/audioplayer-interface-reference.html)インターフェースを利用するスキルを構築する場合、`playback`状態への変更を通知するために、スキルに`playback`リクエストが送信されます。それぞれのイベントに対してハンドラ関数を実装できます。
```javascript
const handlers = {
    'AudioPlayer.PlaybackStarted' : function() {
    	console.log('Alexa begins playing the audio stream');
    },
    'AudioPlayer.PlaybackFinished' : function() {
    	console.log('The stream comes to an end');
    },
    'AudioPlayer.PlaybackStopped' : function() {
    	console.log('Alexa stops playing the audio stream');
    },
    'AudioPlayer.PlaybackNearlyFinished' : function() {
    	console.log('The currently playing stream is nearly complate and the device is ready to receive a new stream');
    },
    'AudioPlayer.PlaybackFailed' : function() {
    	console.log('Alexa encounters an error when attempting to play a stream');
    }
};
```

`AudioPlayer`インターフェースについての追加のドキュメントは、[こちら](https://developer.amazon.com/ja/docs/custom-skills/audioplayer-interface-reference.html)にあります。

注意: `imgObj`に関する仕様については、[こちら](https://developer.amazon.com/ja/docs/custom-skills/include-a-card-in-your-skills-response.html#creating-a-home-card-to-display-text-and-an-image)を参照してください。

### Dialogインターフェース
`Dialog`インターフェースは、スキルとユーザーの間で複数のターンを持つ会話を管理するディレクティブを提供します。ユーザーの要求を満たすために必要な情報をユーザーに質問するために、このディレクティブを使用できます。[Dialog Interface](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/dialog-interface-reference)と[スキルビルダー](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/ask-define-the-vui-with-gui)のドキュメントを参照してください。

`this.event.request.dialogState`を使って、現在の`dialogState`にアクセスできます。

#### Delegateディレクティブ
ユーザーとの対話で次のターンを処理するコマンドをAlexaに送信します。このディレクティブは、スキルがダイアログモデルを使っていて、ダイアログの現在のステータス (`dialogState`) が`STARTED`または`IN_PROGRESS`の場合に使用できます。`dialogState`が`COMPLETED`の場合は、このディレクティブを出力できません。

`this.emit(':delegate')`を使って、delegate directiveのレスポンスを送ることができます。
```javascript
const handlers = {
    'BookFlightIntent': function () {
        if (this.event.request.dialogState === 'STARTED') {
            let updatedIntent = this.event.request.intent;
            // Pre-fill slots: デフォルト値を持つスロットの値でインテントオブジェクトを
            // 更新してから、この更新されたインテントで :delegate を送信する。
            updatedIntent.slots.SlotName.value = 'DefaultValue';
            this.emit(':delegate', updatedIntent);
        } else if (this.event.request.dialogState !== 'COMPLETED'){
            this.emit(':delegate');
        } else {
            // すべてのスロットが入力済み (slot/intentの確認を選択した場合、確認がおこなわれる)
            handlePlanMyTripIntent();
        }
    }
};
```

#### Elicit Slotディレクティブ
ユーザーに特定のスロットの値を問い合わせるコマンドをAlexaに送信します。`slotToElicit`に取得するスロット名を指定してください。`speechOutput`にはユーザーにスロット値を問い合わせる際のpromptを指定します。

Elicit Slot ディレクティブのレスポンスを送信するために、`this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech, updatedIntent)`、または`this.emit(':elicitSlotWithCard', slotToElicit, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj)`を使えます。

`this.emit(':elicitSlotWithCard', slotToElicit, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj)`を使用する場合、`updatedIntent`と`imageObj`はオプションのパラメータです。これらを`null`に設定したり、渡さないこともできます。
```javascript
const handlers = {
    'BookFlightIntent': function () {
        const intentObj = this.event.request.intent;
        if (!intentObj.slots.Source.value) {
            const slotToElicit = 'Source';
            const speechOutput = 'Where would you like to fly from?';
            const repromptSpeech = speechOutput;
            this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        } else if (!intentObj.slots.Destination.value) {
            const slotToElicit = 'Destination';
            const speechOutput = 'Where would you like to fly to?';
            const repromptSpeech = speechOutput;
            const cardContent = 'What is the destination?';
            const cardTitle = 'Destination';
            const updatedIntent = intentObj;
            // スキルに送信されたインテントを表わすインテントオプジェクト。
            // このプロパティのセットを使用するか、必要に応じてスロット値と確認状態を変更できる。
            const imageObj = {
                smallImageUrl: 'https://imgs.xkcd.com/comics/standards.png',
                largeImageUrl: 'https://imgs.xkcd.com/comics/standards.png'
            };
            this.emit(':elicitSlotWithCard', slotToElicit, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj);
        } else {
            handlePlanMyTripIntentAllSlotsAreFilled();
        }
    }
};
```

#### Confirm Slotディレクティブ
Alexaに特定のスロットの値を確認するコマンドを送信してから、ダイアログを続行します。`slotToConfirm`で確認するスロット名を指定します。`speechOutput`にはユーザーに確認を求める際のpromptを指定します。

`this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech, updatedIntent)`、または`this.emit(':confirmSlotWithCard', slotToConfirm, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj)`を使って、Confirm Slotディレクティブのレスポンスを送信できます。

`this.emit(':confirmSlotWithCard', slotToConfirm, speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj)`を使用する場合、`updatedIntent`と`imageObj`はオプションのパラメータです。これらを`null`に設定したり、渡さないこともできます。
```javascript
const handlers = {
    'BookFlightIntent': function () {
        const intentObj = this.event.request.intent;
        if (intentObj.slots.Source.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.Source.confirmationStatus !== 'DENIED') {
                // スロット値は確認されない
                const slotToConfirm = 'Source';
                const speechOutput = 'You want to fly from ' + intentObj.slots.Source.value + ', is that correct?';
                const repromptSpeech = speechOutput;
                this.emit(':confirmSlot', slotToConfirm, speechOutput, repromptSpeech);
            } else {
                // ユーザーがスロット値の確認を拒否する
                const slotToElicit = 'Source';
                const speechOutput = 'Okay, Where would you like to fly from?';
                this.emit(':elicitSlot', slotToElicit, speechOutput, speechOutput);
            }
        } else if (intentObj.slots.Destination.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.Destination.confirmationStatus !== 'DENIED') {
                const slotToConfirm = 'Destination';
                const speechOutput = 'You would like to fly to ' + intentObj.slots.Destination.value + ', is that correct?';
                const repromptSpeech = speechOutput;
                const cardContent = speechOutput;
                const cardTitle = 'Confirm Destination';
                this.emit(':confirmSlotWithCard', slotToConfirm, speechOutput, repromptSpeech, cardTitle, cardContent);
            } else {
                const slotToElicit = 'Destination';
                const speechOutput = 'Okay, Where would you like to fly to?';
                const repromptSpeech = speechOutput;
                this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
            }
        } else {
            handlePlanMyTripIntentAllSlotsAreConfirmed();
        }
    }
};
```

#### Confirm Intentディレクティブ
インテントのためにユーザーが提供したすべての情報を確認するコマンドをAlexaに送信してから、スキルがアクションを実行します。`speechOutput`にユーザーに確認を求める際のpromptを指定します。promptにはユーザーが確認する必要があるすべての値を含めてください。

`this.emit(':confirmIntent', speechOutput, repromptSpeech, updatedIntent)`、または`this.emit(':confirmIntentWithCard', speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj)`を使って、Confirm Intentディレクティブのレスポンスを送信できます。

`this.emit(':confirmIntentWithCard', speechOutput, repromptSpeech, cardTitle, cardContent, updatedIntent, imageObj)`を使う場合、`updatedIntent`と`imageObj`はオプションのパラメータです。これらを`null`に設定したり、渡さないこともできます。
```javascript
const handlers = {
    'BookFlightIntent': function () {
        const intentObj = this.event.request.intent;
        if (intentObj.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.confirmationStatus !== 'DENIED') {
                // インテントは確認されない
                const speechOutput = 'You would like to book flight from ' + intentObj.slots.Source.value + ' to ' +
                intentObj.slots.Destination.value + ', is that correct?';
                const cardTitle = 'Booking Summary';
                const repromptSpeech = speechOutput;
                const cardContent = speechOutput;
                this.emit(':confirmIntentWithCard', speechOutput, repromptSpeech, cardTitle, cardContent);
            } else {
                // ユーザーがインテントの確認を拒否する。スロットの値が正しくない可能性がある。
                handleIntentConfimationDenial();
            }
        } else {
            handlePlanMyTripIntentAllSlotsAndIntentAreConfirmed();
        }
    }
};
```
`Dialog`インターフェースについての追加のドキュメントは、[こちら](https://developer.amazon.com/ja/docs/custom-skills/dialog-interface-reference.html)にあります。

### Displayインターフェース
幅広い表現をサポートするために、Alexaはいくつかの`Display templates`を提供しています。現在、`Display templates`には2つのカテゴリがあります。
- `BodyTemplate`は、テキストと選択できないイメージを表示します。現在5つのオプションがあります。
+ `BodyTemplate1`
+ `BodyTemplate2`
+ `BodyTemplate3`
+ `BodyTemplate6`
+ `BodyTemplate7`
- `ListTemplate`は、項目のスクロールが可能なリストと、それぞれに関連づけられたテキストとオプションの画像を表示します。これらの画像を選択可能にできます。現在2つのオプションがあります。
+ `ListTemplate1`
+ `ListTemplate2`

開発者は、スキルのレスポンスに`Display.RenderTemplate`ディレクティブを含めなければいけません。
Template Builderは、alexa-sdkのtemplateBuilders名前空間に含まれています。これらは、`Display.RenderTemplate`ディレクティブ用のJSONテンプレートを構築するヘルパーメソッドのセットを提供します。次の例では、`BodyTemplate1Builder`を使って`Body template`を構築します。

```javascript
const Alexa = require('alexa-sdk');
// ImageとTextFieldオブジェクトを作成するユーティリティメソッド
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;

// ...
'LaunchRequest' : function() {
	const builder = new Alexa.templateBuilders.BodyTemplate1Builder();

	const template = builder.setTitle('My BodyTemplate1')
							.setBackgroundImage(makeImage('http://url/to/my/img.png'))
							.setTextContent(makePlainText('Text content'))
							.build();

	this.response.speak('Rendering a body template!')
				.renderTemplate(template);
	this.emit(':responseReady');
}
```

ImageおよびTextFieldオブジェクトを構築するために、ヘルパーユーティリティメソッドを追加しました。これらは、`Alexa.utils`名前空間にあります。

```javascript
const ImageUtils = require('alexa-sdk').utils.ImageUtils;

// 単一のソースで画像をアウトプットする
ImageUtils.makeImage(url, widthPixels, heightPixels, size, description);
/**
Outputs {
    contentDescription : '<description>'
    sources : [
        {
            url : '<url>',
            widthPixels : '<widthPixels>',
            heightPixels : '<heightPixels>',
            size : '<size>'
        }
    ]
}
*/

ImageUtils.makeImages(imgArr, description);
/**
Outputs {
    contentDescription : '<description>'
    sources : <imgArr> // array of {url, size, widthPixels, heightPixels}
}
*/


const TextUtils = require('alexa-sdk').utils.TextUtils;

TextUtils.makePlainText('my plain text field');
/**
Outputs {
    text : 'my plain text field',
    type : 'PlainText'
}
*/

TextUtils.makeRichText('my rich text field');
/**
Outputs {
    text : 'my rich text field',
    type : 'RichText'
}
*/

```
次の例では、ListTemplate1BuilderとListItemBuilderを使用してListTemplate1を構築します。
```javascript
const Alexa = require('alexa-sdk');
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;
// ...
'LaunchRequest' : function() {
    const itemImage = makeImage('https://url/to/imageResource', imageWidth, imageHeight);
    const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder();
    const listTemplateBuilder = new Alexa.templateBuilders.ListTemplate1Builder();
    listItemBuilder.addItem(itemImage, 'listItemToken1', makePlainText('List Item 1'));
    listItemBuilder.addItem(itemImage, 'listItemToken2', makePlainText('List Item 2'));
    listItemBuilder.addItem(itemImage, 'listItemToken3', makePlainText('List Item 3'));
    listItemBuilder.addItem(itemImage, 'listItemToken4', makePlainText('List Item 4'));
    const listItems = listItemBuilder.build();
    const listTemplate = listTemplateBuilder.setToken('listToken')
    										.setTitle('listTemplate1')
    										.setListItems(listItems)
    										.build();
    this.response.speak('Rendering a list template!')
    			.renderTemplate(listTemplate);
    this.emit(':responseReady');
}
```

`Display.RenderTemplate`ディレクティブを (echoのような) 画面表示機能の無いデバイスに送ると、無効なディレクティブのエラーが投げられます。デバイスが特定のディレクティブをサポートしているかを確認するには、デバイスのsupportedInterfacesプロパティを確認します。

```javascript
const handler = {
    'LaunchRequest' : function() {

    this.response.speak('Hello there');

    // Display.RenderTemplateディレクティブをレスポンスに追加できる
    if (this.event.context.System.device.supportedInterfaces.Display) {
        //... TemplateBuilderを使用してmytemplateを構築する
        this.response.renderTemplate(myTemplate);
    }

    this.emit(':responseReady');
    }
};
```

ビデオの場合も同様に、VideoAppインターフェイスがデバイスでサポートされているかどうかをチェックします。

```javascript
const handler = {
    'PlayVideoIntent' : function() {

    // VideoApp.Playディレクティブをレスポンスに追加できる
    if (this.event.context.System.device.supportedInterfaces.VideoApp) {
        this.response.playVideo('http://path/to/my/video.mp4');
    } else {
        this.response.speak("The video cannot be played on your device. " +
        "To watch this video, try launching the skill from your echo show device.");
    }

        this.emit(':responseReady');
    }
};
```
`Display`インターフェースに関する追加のドキュメントは、[こちら](https://developer.amazon.com/ja/docs/custom-skills/display-interface-reference.html)にあります。

### Playback Controllerインターフェース
`PlaybackController`インターフェースは、ユーザーがデバイスのボタンやリモコンのようなプレイヤーコントロールとやり取りするときに送信されるリクエストを、スキルで処理できるようにします。これらのリクエストは、意図を表わすリクエストとして標準的である「アレクサ、次の曲」のような通常の音声による要求と異なります。スキルに`PlaybackController`リクエストを処理させるには、開発者がAlexa Node.js SDKで`PlaybackController`インターフェースを実装しなければいけません。
```javascript
const handlers = {
    'PlaybackController.NextCommandIssued' : function() {
        //スキルは、あらゆるAudioPlayerディレクティブでNextCommandIssuedに応答できる。
    },
    'PlaybackController.PauseCommandIssued' : function() {
        //スキルは、あらゆるAudioPlayerディレクティブでPauseCommandIssuedに応答できる。
    },
    'PlaybackController.PlayCommandIssued' : function() {
        //スキルは、あらゆるAudioPlayerディレクティブでPlayCommandIssuedに応答できる。
    },
    'PlaybackController.PreviousCommandIssued' : function() {
        //スキルは、あらゆるAudioPlayerディレクティブでPreviousCommandIssuedに応答できる。
    },
    'System.ExceptionEncountered' : function() {
        //スキルは、System.ExceptionEncounteredにレスポンスを返せない。
    }
};
```
`PlaybackController`インターフェースについての追加のドキュメントは、[こちら](https://developer.amazon.com/ja/docs/custom-skills/playback-controller-interface-reference.html)にあります。


### VideoAppインターフェース
Echo Showでネイティブビデオファイルをストリーミングするには、開発者は`VideoApp.Launch`ディレクティブを送信する必要があります。Alexa Node.js SDKは、responseBuilderにJSONレスポンスオブジェクトを構築するための関数を提供します。
ビデオをストリーミングする例を次に示します。
```javascript
//...
'LaunchRequest' : function() {
    const videoSource = 'https://url/to/videosource';
    const metadata = {
    	'title': 'Title for Sample Video',
    	'subtitle': 'Secondary Title for Sample Video'
    };
    this.response.playVideo(videoSource metadata);
    this.emit(':responseReady');
}
```
`VideoApp`インターフェースに関する追加のドキュメントは、[こちら](https://developer.amazon.com/ja/docs/custom-skills/videoapp-interface-reference.html)にあります。

### SkillとList Events
Alexaスキルイベントにスキルがサブスクライブすると、イベントが発生した時にスキルは通知を受けます。

イベントをスキルがサブスクライブするには、[SMAPIでスキルにイベントを追加する](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/add-events-to-your-skill-with-smapi)に書かれている説明にしたがって、Alexaスキル管理API (SMAPI) へのアクセスを設定する必要があります。

あなたのスキルがこれらのイベントを受け取るように設定されたら、イベントが発生した時にスキルがイベントを受信するようになります。デフォルトのイベントハンドラにイベント名を追加することで、動作を指定できます。

```javascript
const handlers = {
    'AlexaSkillEvent.SkillEnabled' : function() {
        const userId = this.event.context.System.user.userId;
        console.log(`skill was enabled for user: ${userId}`);
    },
    'AlexaHouseholdListEvent.ItemsCreated' : function() {
        const listId = this.event.request.body.listId;
        const listItemIds = this.event.request.body.listItemIds;
        console.log(`The items: ${JSON.stringify(listItemIds)} were added to list ${listId}`);
    },
    'AlexaHouseholdListEvent.ListCreated' : function() {
        const listId = this.event.request.body.listId;
        console.log(`The new list: ${JSON.stringify(listId)} was created`);
    }
    //...
};

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.registerHandlers(handlers);
    alexa.execute();
};
```

スキルイベントをサブスクライブするプロセスを説明するために[サンプルスキルとウォークスルー](https://github.com/Alexa/alexa-cookbook/tree/master/context/skill-events)を作成しました。

## サービス

### Device Addressサービス

Alexa NodeJS SDKは、Device Address APIを利用してユーザーのデバイスアドレス情報を取得する```DeviceAddressService```ヘルパークラスを提供します。現在、次の方法が提供されています。

```javascript
getFullAddress(deviceId, apiEndpoint, token)
getCountryAndPostalCode(deviceId, apiEndpoint, token)
```
リクエストの`this.event.context.System.apiEndpoint`と`this.event.context.System.user.permissions.consentToken`から、パラメータ`apiEndpoint`と`token`をそれぞれ取得できます。

また、``deviceId``はリクエストの``this.event.context.System.device.deviceId``から取得できます。

```javascript
const Alexa = require('alexa-sdk');

'DeviceAddressIntent': function () {
    if (this.event.context.System.user.permissions) {
        const token = this.event.context.System.user.permissions.consentToken;
        const apiEndpoint = this.event.context.System.apiEndpoint;
        const deviceId = this.event.context.System.device.deviceId;

        const das = new Alexa.services.DeviceAddressService();
        das.getFullAddress(deviceId, apiEndpoint, token)
        .then((data) => {
            this.response.speak('<address information>');
            console.log('Address get: ' + JSON.stringify(data));
            this.emit(':responseReady');
        })
        .catch((error) => {
            this.response.speak('I\'m sorry. Something went wrong.');
            this.emit(':responseReady');
            console.log(error.message);
        });
    } else {
        this.response.speak('Please grant skill permissions to access your device address.');
        this.emit(':responseReady');
    }
}
```


### List Managementサービス

Alexaのユーザーは、Alexa to-doとAlexaショッピングの2つのデフォルトリストにアクセスできます。さらに、Alexaのユーザーは、リストをサポートするスキルでカスタムリストを作成し、管理できます。

Alexa NodeJS SDKは、開発者がAlexaのデフォルトリストとカスタムリストをより簡単に管理するスキルを作成できるように、```ListManagementService```ヘルパークラスを提供します。現在、次のメソッドが提供されています。

````javascript
getListsMetadata(token)
createList(listObject, token)
getList(listId, itemStatus, token)
updateList(listId, listObject, token)
deleteList(listId, token)
createListItem(listId, listItemObject, token)
getListItem(listId, itemId, token)
updateListItem(listId, itemId, listItemObject, token)
deleteListItem(listId, itemId, token)
````

``token``は、リクエストの``this.event.context.System.user.permissions.consentToken``から取得できます。

``listId``は、``GetListsMetadata``を呼び出すことで取得できます。
``itemId``は、``GetList``を呼び出すことで取得できます。

````javascript
const Alexa = require('alexa-sdk');

function getListsMetadata(token) {
    const lms = new Alexa.services.ListManagementService();
    lms.getListsMetadata(token)
    .then((data) => {
        console.log('List retrieved: ' + JSON.stringify(data));
        this.context.succeed();
    })
    .catch((error) => {
        console.log(error.message);
    });
};
````

### ディレクティブサービス

`enqueue(directive, endpoint, token)`

スキルの実行中に、Alexaデバイスへディレクティブを非同期に返します。現在のところ、SSML (MP3オーディオを含む) とプレーンテキスト出力形式の両方がサポートされているspeakディレクティブだけを受け付けます。ディレクティブは、スキルがアクティブな場合にだけ、元のデバイスに返すことができます。リクエストの`this.event.context.System.apiEndpoint`と`this.event.context.System.apiAccessToken`から、パラメータ`apiEndpoint`と`token`をそれぞれ取得できます。
- レスポンスの音声は、600文字以内に制限する必要があります。
- SSMLで参照されるすべてのオーディオスニペットは、30秒以内に制限する必要があります。
- スキルがディレクティブサービスを通して送信できるディレクティブの数に制限はありません。必要に応じて、スキルは実行ごとに複数のリクエストを送信できます。
- ディレクティブサービスには重複排除の処理が含まれておらず、ユーザが同じディレクティブを複数回受け取る可能性があるため、リトライ処理はおすすめしません。

```javascript
const Alexa = require('alexa-sdk');

const handlers = {
    'SearchIntent' : function() {
        const requestId = this.event.request.requestId;
        const token = this.event.context.System.apiAccessToken;
        const endpoint = this.event.context.System.apiEndpoint;
        const ds = new Alexa.services.DirectiveService();

        const directive = new Alexa.directives.VoicePlayerSpeakDirective(requestId, "Please wait...");
        const progressiveResponse = ds.enqueue(directive, endpoint, token)
        .catch((err) => {
            // APIエラーを捕捉してスキルの処理を続ける
        });
        const serviceCall = callMyService();

        Promise.all([progressiveResponse, serviceCall])
        .then(() => {
            this.response.speak('I found the following results');
            this.emit(':responseReady');
        });
    }
};

```

## 機能を拡張する

### スキルの状態管理

alexa-sdkは、入ってきたインテントを状態マネージャーを使用して正しい関数ハンドラにルーティングします。状態は、スキルの現在の状態を示す文字列としてセッション属性に格納されます。インテントハンドラを定義するときに状態文字列をインテント名に追加することで、ビルトインのインテントルーティングをエミュレートできますが、alexa-sdkはそれをするのに役立ちます。

SDKでの状態管理の仕組みを説明する例として、サンプルスキル[highlowgame](https://github.com/alexa/skill-sample-nodejs-highlowgame/blob/master/lambda/custom/index.js)を見てみましょう。このスキルで、ユーザーは数字を推測して、Alexaはその数字が大きいか低いかを伝えます。また、ユーザーが何回プレイしたかも伝えます。このスキルは、'start'と'guess'の2つの状態を持っています。
```javascript
const states = {
	GUESSMODE: '_GUESSMODE', // ユーザーは数字を推測する。
	STARTMODE: '_STARTMODE' // ユーザーにゲームの開始または再開をうながす。
};
```

newSessionHandlersのNewSessionハンドラは、スキルが受け取ったインテントまたは起動要求のハンドラに先立って実行されます。

```javascript
const newSessionHandlers = {
    'NewSession': function() {
        if(Object.keys(this.attributes).length === 0) { // スキルが初めて呼び出されたのかを確認する
            this.attributes['endedSessionCount'] = 0;
            this.attributes['gamesPlayed'] = 0;
        }
        this.handler.state = states.STARTMODE;
        this.response.speak('Welcome to High Low guessing game. You have played '
                        + this.attributes['gamesPlayed'].toString() + ' times. Would you like to play?')
                    .listen('Say yes to start the game or no to quit.');
        this.emit(':responseReady');
    }
};
```
新しいセッションが開始された時、`this.handler.state`を`STARTMODE`に設定するだけでスキルの状態がスキルのセッション属性に自動的に保持されます。オプションで、DynamoDBテーブルを設定すれば、セッションをまたいで保持されます。

`NewSession`は素晴らしいcatch-allの動作をする良いエントリーポイントですが、必須ではないことに留意してください。`NewSession`は、その名前を持つハンドラが定義されている場合にだけ呼び出されます。ビルトインの永続化を使用していれば、定義した各状態毎に独自の`NewSession`ハンドラを持つことができます。上の例では、柔軟性を持たせるために、`states.STARTMODE`と`states.GUESSMODE`の両方に異なる`NewSession`の動作を定義しました。

スキルのさまざまな状態に対応するインテントを定義するには、`Alexa.CreateStateHandler`関数を使用する必要があります。ここに定義されたインテントハンドラは、スキルが特定の状態にある時だけ機能することで、さらに大きな柔軟性をもたらします。

たとえば、上で定義した`GUESSMODE`状態の時に、質問に応答しているユーザーに対処したいとします。これは、次のようにStateHandlerを使って実現できます。
```javascript
const guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {

'NewSession': function () {
    this.handler.state = '';
    this.emitWithState('NewSession'); // STARTMODEモードのNewSessionハンドラと同等
},

'NumberGuessIntent': function() {
    const guessNum = parseInt(this.event.request.intent.slots.number.value);
    const targetNum = this.attributes['guessNumber'];

    console.log('user guessed: ' + guessNum);

    if(guessNum > targetNum){
        this.emit('TooHigh', guessNum);
    } else if( guessNum < targetNum){
        this.emit('TooLow', guessNum);
    } else if (guessNum === targetNum){
        // コールバックでアロー関数を使うことで、正しい'this'コンテキストを保持する
        this.emit('JustRight', () => {
            this.response.speak(guessNum.toString() + 'is correct! Would you like to play a new game?')
                        .listen('Say yes to start a new game, or no to end the game.');
            this.emit(':responseReady');
        });
    } else {
        this.emit('NotANum');
    }
},

'AMAZON.HelpIntent': function() {
    this.response.speak('I am thinking of a number between zero and one hundred, try to guess and I will tell you' +
    ' if it is higher or lower.')
                .listen('Try saying a number.');
    this.emit(':responseReady');
},

'SessionEndedRequest': function () {
    console.log('session ended!');
    this.attributes['endedSessionCount'] += 1;
    this.emit(':saveState', true); // :saveStateを呼んで、セッション属性をDynamoDBに保持する
},

'Unhandled': function() {
    this.response.speak('Sorry, I didn\'t get that. Try saying a number.')
                .listen('Try saying a number.');
    this.emit(':responseReady');
}
});
```

一方で、スキルの状態がSTARTMODEの場合のStateHandlerは以下のように定義することができます：

```javascript
const startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {

    'NewSession': function () {
        this.emit('NewSession'); // newSessionHandlers内のハンドラを使う
    },

    'AMAZON.HelpIntent': function() {
        const message = 'I will think of a number between zero and one hundred, try to guess and I will tell you if it' +
        ' is higher or lower. Do you want to start the game?';
        this.response.speak(message)
                    .listen(message);
        this.emit(':responseReady');
    },

    'AMAZON.YesIntent': function() {
        this.attributes['guessNumber'] = Math.floor(Math.random() * 100);
        this.handler.state = states.GUESSMODE;
        this.response.speak('Great! ' + 'Try saying a number to start the game.')
                    .listen('Try saying a number.');
        this.emit(':responseReady');
    },

    'AMAZON.NoIntent': function() {
        this.response.speak('Ok, see you next time!');
        this.emit(':responseReady');
    },

    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.attributes['endedSessionCount'] += 1;
        this.emit(':saveState', true);
    },

    'Unhandled': function() {
        const message = 'Say yes to continue, or no to end the game.';
        this.response.speak(message)
                    .listen(message);
        this.emit(':responseReady');
    }
});
```
この状態で 'yes'または'no'という応答には意味がないため、`AMAZON.YesIntent`と`AMAZON.NoIntent`が`guessModeHandlers`オブジェクトの中に定義されていないことを確認してください。それらのインテントは、`Unhandled`ハンドラによって捕捉されます。

また、両方の状態で`NewSession`と`Unhandled`の動作が違うことに気づいたでしょうか。このゲームでは、`newSessionHandlers`オブジェクトに定義された`NewSession`ハンドラを呼び出すことで、状態を'reset'します。この定義を省略することもできます。そうした場合、alexa-sdkは、現在の状態のインテントハンドラを呼び出します。`alexa.execute()`を呼び出す前に、状態ハンドラを登録することを忘れないでください。登録を忘れると、状態ハンドラが見つけられなくなります。

セッションを終了すると属性は自動的に保存されますが、ユーザーがセッションを終了した場合は強制的に保存するために`:saveState`イベント (`this.emit(':saveState', true)`) を発行しなければいけません。ユーザーが「中止」と言ったりタイムアウトしたりしてセッションを終了した時に呼び出される`SessionEndedRequest`ハンドラで、これを行う必要があります。上の例を見てください。

明示的に状態をリセットしたい場合は、次のコードが有効です。
```javascript
this.handler.state = '' // this.handler.stateの削除は、参照エラーを引き起こす可能性がある
delete this.attributes['STATE'];
```

### DynamoDBによるスキル属性の保持

セッション属性値を後で使うためにストレージに保存したいと思う場合が多いでしょう。alexa-sdkは[Amazon DynamoDB](https://aws.amazon.com/dynamodb/) (NoSQLデータベースサービス) と直接統合されているため、たった1行のコードでこれを実現できます。

alexa.executeを呼び出す前に、DynamoDBテーブルの名前をalexaオブジェクトに設定するだけです。
```javascript
exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = appId;
    alexa.dynamoDBTableName = 'YourTableName'; // これだけでOK!
    alexa.registerHandlers(State1Handlers, State2Handlers);
    alexa.execute();
};
```

その後、値を設定するには、alexaオブジェクトのattributesプロパティを単に呼び出します。もう`put`関数や`get`関数は不要です!
```javascript
this.attributes['yourAttribute'] = 'value';
```

事前に[テーブルを手動で作成する](http://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/SampleData.CreateTables.html)か、Lambda関数にDynamoDBの[テーブル作成を許可する](http://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/APIReference/API_CreateTable.html)ことで、自動的に実行されます。最初の呼び出しで、テーブルが作成されるまでに1〜2分かかることだけを覚えておいてください。手動でテーブルを作成する場合、主キーは"userId"という文字列値でなければいけません。

注意: Lambdaでスキルをホストし、DynamoDBでスキル属性を保持することを選んだ場合は、Lambda関数の実行ロールにDynamoDBへのアクセス権限を含めてください。

### スキルへの多言語対応の追加
ここでHello Worldの例を見てみましょう。ユーザー対応するすべての言語の文字列を次の形式で定義します。
```javascript
const languageStrings = {
    'en-GB': {
        'translation': {
            'SAY_HELLO_MESSAGE' : 'Hello World!'
        }
    },
    'en-US': {
        'translation': {
            'SAY_HELLO_MESSAGE' : 'Hello World!'
        }
    },
    'de-DE': {
        'translation': {
            'SAY_HELLO_MESSAGE' : 'Hallo Welt!'
        }
    }
};
```

alexa-sdkで文字列の国際化機能を有効にするには、上で作成したオブジェクトにリソースを設定します。
```javascript
exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    // 文字列の国際化 (i18n) 機能を有効にするため、リソースオブジェクトを設定する。
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
```

言語文字列の定義と有効化を完了したら、this.t()関数を使ってこれらの文字列にアクセスできます。文字列は、入ってきたリクエストのlocaleと一致する言語で表示されます。
```javascript
const handlers = {
    'LaunchRequest': function () {
        this.emit('SayHello');
    },
    'HelloWorldIntent': function () {
        this.emit('SayHello');
    },
    'SayHello': function () {
        this.response.speak(this.t('SAY_HELLO_MESSAGE'));
        this.emit(':responseReady');
    }
};
```
多言語でのスキルの開発とデプロイについて、さらに詳しい情報は[こちら](https://developer.amazon.com/ja/docs/custom-skills/develop-skills-in-multiple-languages.html)を参照してください。

### Device IDのサポート
ユーザーがAlexaスキルを有効化すると、スキルは、ユーザーのAlexaデバイスに関連づけられたアドレスデータを使用するためのユーザー許可を取得できます。このアドレスデータを使用して、スキルに重要な機能を提供したり、ユーザー体験を強化したりできます。

`deviceId`は、各リクエストのコンテキストオブジェクトを通して公開され、任意のインテントハンドラから`this.event.context.System.device.deviceId`を通してアクセスできます。スキルでユーザーのデバイスアドレスを使うためにdeviceIdとAddress APIを利用する方法については、[Address API サンプルスキル](https://github.com/alexa/skill-sample-node-device-address-api)を参照してください。

### Speechcons (感嘆詞)

[Speechcons](https://developer.amazon.com/ja/docs/custom-skills/speechcon-reference-interjections-japanese.html)は、Alexaがより表現力豊かに発音する特殊な単語とフレーズです。出力するテキストにSSMLマークアップを入れるだけで使えます。

* `this.emit(':tell', 'あなたが教えてくれたAlexaスキルを見ると、わたしはときどき <say-as interpret-as="interjection">やれやれ</say-as> と言わざるをえません。');`
* `this.emit(':tell', '<say-as interpret-as="interjection">いらっしゃいませ</say-as><break time="1s"/> これはただの一例です。');`

## 開発環境のセットアップ

- 要件
- Gulp と mocha  ```npm install -g gulp mocha```
- npm installを実行して必要なものを用意する
- テストやlintを実行するためにgulpを実行する

Alexa Skills Kitを開始する方法の詳細は、次の追加のドキュメントを参照してください。

[Alexa Dev Chat Podcast](http://bit.ly/alexadevchat)

[Alexa Training with Big Nerd Ranch](https://developer.amazon.com/public/community/blog/tag/Big+Nerd+Ranch)

[Alexa Skills Kit (ASK)](https://developer.amazon.com/ja/alexa-skills-kit)

[Alexa Developer Forums](https://forums.developer.amazon.com/forums/category.jspa?categoryID=48)

[Training for the Alexa Skills Kit](https://developer.amazon.com/alexa-skills-kit/alexa-skills-developer-training)

-Dave ( [@TheDaveDev](http://twitter.com/thedavedev))
