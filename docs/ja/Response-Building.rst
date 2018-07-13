====================
応答のビルド
====================

ResponseBuilder
---------------

SDKには応答を作成するためのヘルパー関数が含まれています。\ ``Response``\ には複数の要素が含まれる場合があり、ヘルパー関数によって応答を生成しやすくなり、各応答の要素を初期化したり設定したりする時間を削減できます。

**インターフェース**

.. code:: typescript

   interface ResponseBuilder {
       speak(speechOutput: string): this;
       reprompt(repromptSpeechOutput: string): this;
       withSimpleCard(cardTitle: string, cardContent: string): this;
       withStandardCard(cardTitle: string, cardContent: string, smallImageUrl?: string, largeImageUrl?: string): this;
       withLinkAccountCard(): this;
       withAskForPermissionsConsentCard(permissionArray: string[]): this;
       addDelegateDirective(updatedIntent?: Intent): this;
       addElicitSlotDirective(slotToElicit: string, updatedIntent?: Intent): this;
       addConfirmSlotDirective(slotToConfirm: string, updatedIntent?: Intent): this;
       addConfirmIntentDirective(updatedIntent?: Intent): this;
       addAudioPlayerPlayDirective(playBehavior: interfaces.audioplayer.PlayBehavior, url: string, token: string, offsetInMilliseconds: number, expectedPreviousToken?: string): this;
       addAudioPlayerStopDirective(): this;
       addAudioPlayerClearQueueDirective(clearBehavior: interfaces.audioplayer.ClearBehavior): this;
       addRenderTemplateDirective(template: interfaces.display.Template): this;
       addHintDirective(text: string): this;
       addVideoAppLaunchDirective(source: string, title?: string, subtitle?: string): this;
       withShouldEndSession(val: boolean): this;
       addDirective(directive: Directive): this;
       getResponse(): Response;
   }

以下の例は、ResponseBuilderヘルパー関数を使用して応答を作成する方法を示しています。

.. code:: javascript

   const handle = function(handlerInput) {
       return handlerInput.responseBuilder
           .speak('foo')
           .reprompt('bar')
           .withSimpleCard('title', 'cardText')
           .getResponse();
   }

画像とテキストのヘルパー
------------------------------

ASK SDK v2 for
Node.jsは以下のヘルパークラスを提供しています。これらは、Echo
Showと互換性のあるスキルで広く使用されるテキストや画像の要素の作成に便利です。

**``ImageHelper``**

.. code:: javascript

   const Alexa = require('ask-sdk');

   const myImage = new Alexa.ImageHelper()
       .withDescription('FooDescription')
       .addImageInstance('http://BarImageSource')
       .getImage();

**``PlainTextContentHelper``**

.. code:: javascript

   const Alexa = require('ask-sdk');

   const myTextContent = new Alexa.PlainTextContentHelper()
       .withPrimaryTexT('Foo')
       .withSecondaryText('Bar')
       .withTertiaryText('Baz')
       .getTextContent();

**``RichTextContentHelper``**

.. code:: javascript

   const Alexa = require('ask-sdk');

   const myTextContent = new Alexa.RichTextContentHelper()
       .withPrimaryTexT('Foo')
       .withSecondaryText('Bar')
       .withTertiaryText('Baz')
       .getTextContent();
