=================
Response Building
=================

ResponseBuilder
---------------

The SDK includes helper functions for constructing responses. A
``Response`` may contain multiple elements, and the helper functions aid
in generating responses, reducing the need to initialize and set the
elements of each response.

**Interface**

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
       addAudioPlayerPlayDirective(playBehavior: interfaces.audioplayer.PlayBehavior, url: string, token: string, offsetInMilliseconds: number, expectedPreviousToken?: string, audioItemMetadata? : AudioItemMetadata): this;
       addAudioPlayerStopDirective(): this;
       addAudioPlayerClearQueueDirective(clearBehavior: interfaces.audioplayer.ClearBehavior): this;
       addRenderTemplateDirective(template: interfaces.display.Template): this;
       addHintDirective(text: string): this;
       addVideoAppLaunchDirective(source: string, title?: string, subtitle?: string): this;
       withShouldEndSession(val: boolean): this;
       addDirective(directive: Directive): this;
       getResponse(): Response;
   }

The following ResponseBuilder function is only available in the `public
beta
SDK <https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.x_public-beta>`__:

.. code:: typescript

   withCanFulfillIntent(canFulfillIntent : CanFulfillIntent) : this;

The following example shows how to construct a response using
``ResponseBuilder`` helper functions.

.. code:: javascript

   const handle = function(handlerInput) {
       return handlerInput.responseBuilder
           .speak('foo')
           .reprompt('bar')
           .withSimpleCard('title', 'cardText')
           .getResponse();
   }

Image and Text Helpers
----------------------

ASK SDK v2 for Node.js provides the following helper classes to help you
build text and image elements that are widely used in Echo Show
compatible skills.

**ImageHelper**

.. code:: javascript

   const Alexa = require('ask-sdk');

   const myImage = new Alexa.ImageHelper()
       .withDescription('FooDescription')
       .addImageInstance('http://BarImageSource')
       .getImage();

**PlainTextContentHelper**

.. code:: javascript

   const Alexa = require('ask-sdk');

   const myTextContent = new Alexa.PlainTextContentHelper()
       .withPrimaryText('Foo')
       .withSecondaryText('Bar')
       .withTertiaryText('Baz')
       .getTextContent();

**RichTextContentHelper**

.. code:: javascript

   const Alexa = require('ask-sdk');

   const myTextContent = new Alexa.RichTextContentHelper()
       .withPrimaryText('Foo')
       .withSecondaryText('Bar')
       .withTertiaryText('Baz')
       .getTextContent();
