====================================
Host a Custom Skill as a Web Service
====================================

You can build a custom skill for Alexa by implementing a web service that
accepts requests from and sends responses to the Alexa service in the cloud.

The web service must meet certain requirements to handle requests sent by Alexa
and adhere to the Alexa Skills Kit interface standards. For more information,
see
`Alexa Skills Kit technical documentation <https://developer.amazon.com/docs/custom-skills/host-a-custom-skill-as-a-web-service.html>`__.

ASK SDK Express Adapter
---------------------------

The Alexa Skills Kit SDK (ASK SDK) for Node provides boilerplate code for 
request and timestamp verification through the
`ask-sdk-express-adapter <https://www.npmjs.com/package/ask-sdk-express-adapter/>`__
package. This package provides the verification components by exporting
the `SkillRequestSignatureVerifier class <https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/blob/2.0.x/ask-sdk-express-adapter/lib/verifier/index.ts#L56/>`__
and `TimestampVerifier class <https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/blob/2.0.x/ask-sdk-express-adapter/lib/verifier/index.ts#L292/>`__.
Also this package provides `ExpressAdapter class <https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/blob/2.0.x/ask-sdk-express-adapter/lib/adapter/ExpressAdapter.ts#L24/>`__ 
which assembles the verification ability and skill invocation ability,
making it easier to register requestHandlers on your `express application <http://expressjs.com/en/5x/api.html#app/>`__.

Installation
~~~~~~~~~~~~

You can add the ``ask-sdk-express-adapter`` package to your skill project through NPM:
``npm install --save ask-sdk-express-adapter``.


For web application with express framework
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The `ExpressAdapter <https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/blob/2.0.x/ask-sdk-express-adapter/lib/adapter/ExpressAdapter.ts#L24/>`__
class registers the skill instance from
the ``SkillBuilder`` object, and provides a ``getRequestHandlers``
method that return an array of request handlers which can be registed
to your Express application.

You can enable or disable request or timestamp
verification for testing purposes by setting the boolean parameters
``verifySignature`` and ``verifyTimeStamp`` on the
``ExpressAdapter`` instance. You can also provide additional custom
verifiers that need to be applied on the input request before skill invocation.

Usage
~~~~~

.. tabs::

  .. code-tab:: javascript
    const Alexa = require('ask-sdk-core');
    const express = require('express');
    const { ExpressAdapter } = require('ask-sdk-express-adapter');

    const app = express();
    const skillBuilder = Alexa.SkillBuilders.custom();
    const skill = skillBuilder.create();
    const adapter = new ExpressAdapter(skill, true, true);

    app.post('/', adapter.getRequestHandlers());
    app.listen(3000);

  .. code-tab:: typescript
    import * as Alexa from 'ask-sdk-core';
    import express from 'express';
    import { ExpressAdapter } from 'ask-sdk-express-adapter';

    const app = express();
    const skillBuilder = Alexa.SkillBuilders.custom();
    const skill = skillBuilder.create();
    const adapter = new ExpressAdapter(skill, true, true);

    app.post('/', adapter.getRequestHandlers());
    app.listen(3000);


For web application without Express framework
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If you don't use Express framework, 
the `SkillRequestSignatureVerifier <https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/blob/2.0.x/ask-sdk-express-adapter/lib/verifier/index.ts#L56/>`__
and `TimestampVerifier <https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/blob/2.0.x/ask-sdk-express-adapter/lib/verifier/index.ts#L292/>`__
are provided for you to use in your web application.

Usage
~~~~~

.. tabs::

  .. code-tab:: javascript
    const Alexa = require('ask-sdk-core');
    const { SkillRequestSignatureVerifier, TimestampVerifier } = require('ask-sdk-express-adapter');

    const skillBuilder = Alexa.SkillBuilders.custom();
    const skill = skillBuilder.create();

    // This code snippet assumes you have already consumed the request body as text and headers
    try {
        await new SkillRequestSignatureVerifier().verify(textBody, requestHeaders);
        await new TimestampVerifier().verify(textBody);
    } catch (err) {
        // server return err message
    }
    const response = skill.invoke(JSON.parse(textBody));
    // server send response in Json format

  .. code-tab:: typescript
    import * as Alexa from 'ask-sdk-core';
    import { SkillRequestSignatureVerifier, TimestampVerifier } from 'ask-sdk-express-adapter';

    const skillBuilder = Alexa.SkillBuilders.custom();
    const skill = skillBuilder.create();

    // This code snippet assumes you have already consumed the request body as text and headers
    try {
        await new SkillRequestSignatureVerifier().verify(textBody, requestHeaders);
        await new TimestampVerifier().verify(textBody);
    } catch (err) {
        // server return err message
    }
    const response = skill.invoke(JSON.parse(textBody));
    // server send response in Json format