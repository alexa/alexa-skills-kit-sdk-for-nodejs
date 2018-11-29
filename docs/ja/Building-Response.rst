*****************
応答のビルド
*****************

標準的な応答
=================

Lambdaをスキルのエンドポイントに使用している場合は、Alexaがユーザーリクエストに応答するための応答本文を提供するだけで済みます。応答本文のJSON構造についてのドキュメントは、 `こちら <https://developer.amazon.com/ja/docs/custom-skills/request-and-response-json-reference.html#response-format>`_ を参照してください。

応答本文には、次のプロパティが含まれる場合があります：

* version
* sessionAttributes
* response

ASK SDK v2 for Node.jsを使用すると、versionとsessionAttributesを入力してくれるので、ボイラープレートコード（毎回書かなければならないお決まりのコード）を書く手間が省けるので、その分応答の作成に集中できます。

ResponseBuilder
===============

``ResponseBuilder`` には応答を作成するためのヘルパーメソッドが含まれています。 ``Response`` には複数の要素が含まれる場合があり、ヘルパーメソッドによって、各応答の要素を初期化したり設定したりする必要がなくなり、応答を生成しやすくなります。 ``ResponseBuilder`` は、 ``HandlerInput`` コンテナオブジェクトからハンドラーで使用できます。 ``ResponseBuilder`` の詳細については、 `TypeDoc <http://ask-sdk-node-typedoc.s3-website-us-east-1.amazonaws.com/classes/responsebuilder.html>`_ を参照してください。

利用可能なメソッド
----------------------------------

.. code-block:: typescript

  speak(speechOutput: string): this;
  reprompt(repromptSpeechOutput: string): this;
  withSimpleCard(cardTitle: string, cardContent: string): this;
  withStandardCard(cardTitle: string, cardContent: string, smallImageUrl?: string, largeImageUrl?: string): this;
  withLinkAccountCard(): this;
  withAskForPermissionsConsentCard(permissionArray: string[]): this;
  withCanFulfillIntent(canFulfillIntent : CanFulfillIntent) : this;
  addDelegateDirective(updatedIntent?: Intent): this;
  addElicitSlotDirective(slotToElicit: string, updatedIntent?: Intent): this;
  addConfirmSlotDirective(slotToConfirm: string, updatedIntent?: Intent): this;
  addConfirmIntentDirective(updatedIntent?: Intent): this;
  addAudioPlayerPlayDirective(playBehavior: interfaces.audioplayer.PlayBehavior, url: string, token: string, offsetInMilliseconds: number, expectedPreviousToken?: string, audioItemMetadata? : AudioItemMetadata): this;
  addAudioPlayerStopDirective(): this;
  addAudioPlayerClearQueueDirective(clearBehavior: interfaces.audioplayer.ClearBehavior): this;
  addRenderTemplateDirective(template: interfaces.display.Template): this;
  addHintDirective(text: string): this;
  addVideoAppLaunchDirective(source: string, title?: string, subtitle?: string): this;
  withShouldEndSession(val: boolean): this;
  addDirective(directive: Directive): this;
  getResponse(): Response;

以下の例は、 ``ResponseBuilder`` ヘルパーメソッドを使用して応答を作成する方法を示しています。

.. tabs::

  .. code-tab:: javascript

    const response = handlerInput.responseBuilder
      .speak('foo')
      .reprompt('bar')
      .withSimpleCard('title', 'cardText')
      .getResponse();

  .. code-tab:: typescript

    const response = handlerInput.responseBuilder
      .speak('foo')
      .reprompt('bar')
      .withSimpleCard('title', 'cardText')
      .getResponse();

.. note::

  speakとreprompt値のコンテンツはSSMLタグで囲みます。つまり、値に含まれるXMLの特殊文字はエスケープ処理をする必要があります。たとえば、 ``handlerInput.responseBuilder.speak("I like M&M's")`` では、このままでは失敗します。文字 ``&`` を ``&amp`` と記述する必要があります。他にも処理が必要な文字は、 ``<`` -> ``&lt``;、および ``>`` -> ``&gt;`` などがあります。

画像とテキストのヘルパー
============================================

ASK SDK v2 for Node.jsは以下のヘルパークラスを提供しています。これらは、Echo Showと互換性のあるスキルで広く使用されるテキストや画像の要素の作成に便利です。

ImageHelper
-----------

.. tabs::

  .. code-tab:: javascript

    const Alexa = require('ask-sdk-core');

    const myImage = new Alexa.ImageHelper()
      .withDescription('FooDescription')
      .addImageInstance('http://BarImageSource')
      .getImage();

  .. code-tab:: typescript

    import { ImageHelper } from 'ask-sdk-core';
    import { interfaces } from 'ask-sdk-model';
    import Image = interfaces.display.Image;

    const myImage : Image = new ImageHelper()
      .withDescription('FooDescription')
      .addImageInstance('http://BarImageSource')
      .getImage();

PlainTextContentHelper
----------------------

.. tabs::

  .. code-tab:: javascript

    const Alexa = require('ask-sdk-core');

    const myTextContent = new Alexa.PlainTextContentHelper()
      .withPrimaryText('Foo')
      .withSecondaryText('Bar')
      .withTertiaryText('Baz')
      .getTextContent();

  .. code-tab:: typescript

    import { PlainTextContentHelper } from 'ask-sdk-core';
    import { interfaces } from 'ask-sdk-model';
    import TextContent = interfaces.display.TextContent;

    const myTextContent : TextContent = new PlainTextContentHelper()
      .withPrimaryText('Foo')
      .withSecondaryText('Bar')
      .withTertiaryText('Baz')
      .getTextContent();


RichTextContentHelper
---------------------

.. tabs::

  .. code-tab:: javascript

    const Alexa = require('ask-sdk-core');

    const myTextContent = new Alexa.RichTextContentHelper()
      .withPrimaryText('Foo')
      .withSecondaryText('Bar')
      .withTertiaryText('Baz')
      .getTextContent();

  .. code-tab:: typescript

    import { RichTextContentHelper } from 'ask-sdk-core';
    import { interfaces } from 'ask-sdk-model';
    import TextContent = interfaces.display.TextContent;

    const myTextContent : TextContent = new RichTextContentHelper()
      .withPrimaryText('Foo')
      .withSecondaryText('Bar')
      .withTertiaryText('Baz')
      .getTextContent();

