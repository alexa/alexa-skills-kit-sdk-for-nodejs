*****************
Building Response
*****************

Standard Response
=================

If you are using the lambda as your skill endpoint, you are only responsible for providing the response body in order for Alexa to respond to a customer request. The documentation on the JSON structure of the response body can be found `here <https://developer.amazon.com/docs/custom-skills/request-and-response-json-reference.html#response-format>`_.

A response body may contains the following properties:

* version
* sessionAttributes
* response

ASK SDK v2 for Node.js helps filling the version and sessionAttributes so you can focus on building the response instead of writing boilerplate code.

ResponseBuilder
===============

The ``ResponseBuilder`` includes helper methods for constructing the response. A ``Response`` may contain multiple elements, and the helper methods aid in generating responses, reducing the need to initialize and set the elements of each response. ``ResponseBuilder`` is available to handlers via the ``HandlerInput`` container object. The detailed description of ``ResponseBuilder`` can be found in the `TypeDoc <http://ask-sdk-node-typedoc.s3-website-us-east-1.amazonaws.com/classes/responsebuilder.html>`_

Available Methods
-----------------

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

The following example shows how to construct a response using
``ResponseBuilder`` helper methods.

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

  The contents of the speak and reprompt values get wrapped in SSML tags. This means that any special XML characters within the value need to be escape coded. For example, ``handlerInput.responseBuilder.speak("I like M&M's")`` will cause a failure because the ``&`` character needs to be encoded as ``&amp``;. Other characters that need to be encoded include: ``<`` ``->`` ``&lt;``, and ``>`` ``->`` ``&gt;``.

Image and Text Helpers
======================

ASK SDK v2 for Node.js provides the following helper classes to help you build text and image elements that are widely used in Echo Show compatible skills.

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

