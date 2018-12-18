.. toctree::
   :caption: GUIDE
   :hidden:

   Setting-Up-The-ASK-SDK
   Developing-Your-First-Skill
   ASK-SDK-Migration-Guide

.. toctree::
   :caption: TECHNICAL DOCUMENTATION
   :hidden:

   Processing-Request
   Building-Response
   Managing-Attributes
   Calling-Alexa-Service-APIs
   Configuring-Skill-Instance

.. toctree::
   :caption: TYPEDOC REFERENCE
   :hidden:

   TypeDoc <http://ask-sdk-node-typedoc.s3-website-us-east-1.amazonaws.com/>

.. toctree::
   :caption: OTHER LANGUAGE ASK SDKs
   :hidden:

   Java SDK <https://github.com/alexa/alexa-skills-kit-sdk-for-java>
   Python SDK <https://github.com/alexa-labs/alexa-skills-kit-sdk-for-python>

*******************
ASK SDK for Node.js
*******************

The ASK SDK v2 for Node.js makes it easier for you to build highly engaging skills by allowing you to spend more time implementing features and less time writing boilerplate code.

Alexa Features Supported by SDK
===================================

This section provides all the Alexa features that are currently supported in the SDK.

* `Amazon Pay <https://developer.amazon.com/docs/amazon-pay/integrate-skill-with-amazon-pay.html>`__

* `Audio Player <https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html>`__

* `Display – Body templates for devices with a screen <https://developer.amazon.com/docs/custom-skills/create-skills-for-alexa-enabled-devices-with-a-screen.html>`__

* `Gadgets Game Engine – Echo Buttons <https://developer.amazon.com/docs/custom-skills/game-engine-interface-reference.html>`__

* `Directive Service (Progressive Response) <https://developer.amazon.com/docs/custom-skills/send-the-user-a-progressive-response.html>`__

* `Messaging <https://developer.amazon.com/docs/smapi/send-a-message-request-to-a-skill.html>`__

* `Monetization <https://developer.amazon.com/alexa-skills-kit/make-money>`__

* `Video <https://developer.amazon.com/docs/custom-skills/videoapp-interface-reference.html>`__

* `Device Address <https://developer.amazon.com/docs/custom-skills/device-address-api.html>`__

* `Lists <https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#alexa-lists-access>`__

* `Request for customer contact information <https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html>`__

* `Obtain customer settings information <https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html>`_

* `Account Linking <https://developer.amazon.com/docs/account-linking/understand-account-linking.html>`__

* `Entity Resolution <https://developer.amazon.com/docs/custom-skills/define-synonyms-and-ids-for-slot-type-values-entity-resolution.html>`__

* `Dialog Management <https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html>`__

* `Location Services <https://developer.amazon.com/docs/custom-skills/location-services-for-alexa-skills.html>`__

* `Reminders <https://developer.amazon.com/docs/smapi/alexa-reminders-overview.html>`__

Preview Features
----------------

.. note::

   The following featrures are released as public preview. The interfaces might change in future releases.

* `Connections <https://developer.amazon.com/blogs/alexa/post/7b332b32-893e-4cad-be07-a5877efcbbb4/skill-connections-preview-now-skills-can-work-together-to-help-customers-get-more-done>`__
* `Alexa Presentation Language <https://developer.amazon.com/docs/alexa-presentation-language/apl-overview.html>`__
* `Name-free Interactions <https://developer.amazon.com/docs/custom-skills/understand-name-free-interaction-for-custom-skills.html>`_

Guide
=====

To help you get started with the SDK, see the following resources.

`Setting Up The ASK SDK`_
-------------------------

Shows how to install the SDK as a dependency in your NPM project.

`Developing Your First Skill`_
------------------------------

Walks through step-by-step instructions for building the Hello World sample.

`ASK SDK Migration Guide`_
--------------------------

Provides instructions for migrating an Alexa skill from the SDK v1 to the SDK v2.

Technical Documentation
=======================

`Processing Request`_
---------------------

Covers how to build request handlers, exception handlers, and request and response interceptors.

`Building Response`_
--------------------

Covers how to use the ResponseBuilder to compose multiple elements like text, cards, and audio into a single response.

`Managing Attributes`_
----------------------

Covers how to use skill attributes to store and retrieve skill data.

`Calling Alexa Service APIs`_
-----------------------------

Covers how to use service clients in your skill to access Alexa APIs.

`Configuring Skill Instance`_
-----------------------------

Covers how to configure and construct a skill instance.


Got Feedback?
=============

Request and vote for Alexa features `here <https://alexa.uservoice.com/forums/906892-alexa-skills-developer-voice-and-vote/filters/top?category_id=322783>`__!

.. _Setting Up The ASK SDK: Setting-Up-The-ASK-SDK.html
.. _Developing Your First Skill: Developing-Your-First-Skill.html
.. _ASK SDK Migration Guide: ASK-SDK-Migration-Guide.html
.. _Processing Request: Processing-Request.html
.. _Building Response: Building-Response.html
.. _Managing Attributes: Managing-Attributes.html
.. _Calling Alexa Service APIs: Calling-Alexa-Service-APIs.html
.. _Configuring Skill Instance: Configuring-Skill-Instance.html
