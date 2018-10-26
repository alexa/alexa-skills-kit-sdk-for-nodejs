*******************
Managing Attributes
*******************

The SDK allows you to store and retrieve attributes at different scopes. For example, you can use the attributes to store data that you retrieve on subsequent requests. You can also use attributes in your handler’s ``canHandle`` logic to influence request routing.

An attribute consists of a key and a value. The key is enforced as a ``String`` type and the value is an unbounded ``Object``. For session and persistent attributes, you must ensure that value types are serializable so they can be properly stored for subsequent retrieval. This restriction does not apply to request-level attributes because they do not persist outside of the request processing lifecycle.

Attributes Scopes
=================

Request attributes
------------------

Request attributes only last within a single request processing lifecycle. Request attributes are initially empty when a request comes in, and are discarded once a response has been produced.

Request attributes are useful with request and response interceptors. For example, you can inject additional data and helper classes into request attributes through a request interceptor so they are retrievable by request handlers.

Session attributes
------------------

Session attributes persist throughout the lifespan of the current skill session. Session attributes are available for use with any in-session request. Any attributes set during the request processing lifecycle are sent back to the Alexa service and provided in the next request in the same session.

Session attributes do not require the use of an external storage solution. They are not available for use when handling out-of-session requests. They are discarded once the skill session closes.

Persistent attributes
---------------------

Persistent attributes persist beyond the lifecycle of the current session. How these attributes are stored, including key scope (user ID or device ID), TTL, and storage layer depends on the configuration of the `PersistenceAdapter`_.

.. note::

  Persistent attributes are only available when you `configure the skill instance <Configuring-Skill-Instance.html>`_ with a ``PersistenceAdapter``. Calls to the ``AttributesManager`` to retrieve and save persistent attributes will throw an error if a ``PersistenceAdapter`` has not been configured.


AttributesManager
=================

The ``AttributesManager`` exposes attributes that you can retrieve and update in your handlers. ``AttributesManager`` is available to handlers via the ``HandlerInput`` container object. The ``AttributesManager`` takes care of attributes retrival and saving so that you can interact directly with attributes needed by your skill. The detailed description of ``AttributesManager`` can be found in the `TypeDoc <http://ask-sdk-node-typedoc.s3-website-us-east-1.amazonaws.com/interfaces/attributesmanager.html>`_.

Available Methods
-----------------

.. code-block:: typescript

  getRequestAttributes() : {[key : string] : any};
  getSessionAttributes() : {[key : string] : any};
  getPersistentAttributes() : Promise<{[key : string] : any}>;
  setRequestAttributes(requestAttributes : {[key : string] : any}) : void;
  setSessionAttributes(sessionAttributes : {[key : string] : any}) : void;
  setPersistentAttributes(persistentAttributes : {[key : string] : any}) : void;
  savePersistentAttributes() : Promise<void>;

The following example shows how you can retrieve and save persistent attributes.

.. tabs::

  .. code-tab:: javascript

    const PersistentAttributesHandler = {
      canHandle(handlerInput) {
        return new Promise((resolve, reject) => {
          handlerInput.attributesManager.getPersistentAttributes()
            .then((attributes) => {
              resolve(attributes.foo === 'bar');
            })
            .catch((error) => {
              reject(error);
            })
        });
      },
      handle(handlerInput) {
        return new Promise((resolve, reject) => {
          handlerInput.attributesManager.getPersistentAttributes()
            .then((attributes) => {
              attributes.foo = 'bar';
              handlerInput.attributesManager.setPersistentAttributes(attributes);

              return handlerInput.attributesManager.savePersistentAttributes();
            })
            .then(() => {
              resolve(handlerInput.responseBuilder
                .speak('Persistent attributes updated!')
                .getResponse());
            })
            .catch((error) => {
              reject(error);
            });
        });
      },
    };

  .. code-tab:: typescript

    import {
      HandlerInput,
      RequestHandler,
    } from 'ask-sdk-core';
    import { Response } from 'ask-sdk-model';

    const PersistentAttributesHandler : RequestHandler = {
      async canHandle(handlerInput : HandlerInput) : Promise<boolean> {
        const persistentAttributes = await  handlerInput.attributesManager.getPersistentAttributes();

        return persistentAttributes.foo === 'bar';

      },
      async handle(handlerInput : HandlerInput) : Promise<Response> {
        const persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes();
        persistentAttributes.foo = 'bar';
        handlerInput.attributesManager.setPersistentAttributes(persistentAttributes);

        await handlerInput.attributesManager.savePersistentAttributes();

        return handlerInput.responseBuilder
          .speak('Persistent attributes updated!')
          .getResponse();
      },
    };

.. note::

  To improve skill performance, ``AttributesManager`` caches the persistent attributes locally. ``setPersistentAttributes()`` will only update the locally cached persistent attributes. You need to call ``savePersistentAttributes()`` to save persistent attributes to the persistence layer.

PersistenceAdapter
==================

The ``PersistenceAdapter`` is used by ``AttributesManager`` when retrieving and saving attributes to persistence layer (i.e. database or local file system). You can register any customized ``PersistenceAdapter`` that conforms to the following interface with the SDK.

Interface
---------

.. code-block:: typescript

  interface PersistenceAdapter {
    getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : any}>;
    saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : any}) : Promise<void>;
  }

DynamoDbPersistenceAdapter
--------------------------

``ask-sdk-dynamodb-persistence-adapter`` package provides a ``DynamoDbPersistenceAdapter`` which is an implementation of ``PersistenceAdapter`` using `AWS DynamoDB <https://aws.amazon.com/dynamodb/>`_.

Constructor Details
^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    new DynamoDbPersistenceAdapter(config = {}) => Object

Constructs a ``DynamoDbPersistenceAdapter`` object. This object is used by ``AttributesManager`` to retrieve and save attributes object to a DynamoDB table. The table will have two columns: one for the parition key and one for attributes. If ``createTable`` config is set to ``true``, SDK will attempt to create a new DynamoDB table with the given ``tableName`` when instantiating the ``DynamoDbPersistenceAdapter``.

Examples
""""""""

.. tabs::

  .. code-tab:: javascript

    const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');

    const dynamoDbPersistenceAdapter = new DynamoDbPersistenceAdapter({ tableName : 'FooTable' })

  .. code-tab:: typescript

    import { PersistenceAdapter } from 'ask-sdk-core';
    import { DynamoDbPersistenceAdapter } from 'ask-sdk-dynamodb-persistence-adapter';

    const dynamoDbPersistenceAdapter : PersistenceAdapter = new DynamoDbPersistenceAdapter({ tableName : 'FooTable' });

Config Options
""""""""""""""

* **tableName** (string) - The name of the DynamoDB table used.
* **partitionKeyName** (string) - Optional. The name of the partition key column. Default to ``"id"`` if not provided.
* **attributesName** (string) - Optional. The name of the attributes column. Default to ``"attributes"`` if not provided.
* **createTable** (boolean) - Optional. Set to ``true`` to have ``DynamoDbPersistenceAdapter`` automatically create the table if it does not exist. Default to ``false`` if not provided.
* **partitionKeyGenerator** (function) - Optional. The function used to generate partition key using ``RequestEnvelope``. Default to generate the partition key using the ``userId``.
* **dynamoDBClient** (`AWS.DynamoDB <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html>`_ ) - Optional. The ``DynamoDBClient`` used to query AWS DynamoDB table. You can inject your ``DynamoDBClient`` with custom configuration here. Default to use ``new AWS.DynamoDB({apiVersion : 'latest'})``.

Method Details
^^^^^^^^^^^^^^

``getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : any}>``
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

The ``getAttributes`` operation retrieves the attributes from the DynamoDB table. It takes in a ``RequestEnvelope`` object and pass it to the ``PartitionKeyGenerator`` to generate the partition key. Then it will retrieve the attributes returned from DynamoDB that has a associated key of ``attributesName``. When the corresponding partition key is not found, ``getAttributes`` will return an empty object.

``saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : any}) : Promise<void>``
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

The ``saveAttributes`` operation saves the attributes to the DynamoDB table using the partition key generated from the ``RequestEnvelope``. It uses a ``DynamoDBDocumentClient`` with ``convertEmptyValues`` set to ``true``. So that any ``""``, ``null`` or ``undefined`` values in the attributes object will be converted.

S3PersistenceAdapter
--------------------

``ask-sdk-s3-persistence-adapter`` package provides a ``S3PersistenceAdapter`` which is an implementation of ``PersistenceAdapter`` using `AWS S3 <https://aws.amazon.com/s3/>`_.

.. note::

  Because Amazon S3 provides `eventual consistency <https://docs.aws.amazon.com/AmazonS3/latest/dev/Introduction.html>`_ for updates to existing objects, we recommend using `DynamoDbPersistenceAdapter`_ for persistent attributes if your skill requires read-after-write consistency.

Constructor Details
^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    new S3PersistenceAdapter(config = {}) => Object

Constructs a ``S3PersistenceAdapter`` object. This object is used by ``AttributesManager`` to retrieve and save attributes object to a S3 bucket. Attributes object will be represented in individual files with the object key used as file name.

Examples
""""""""

.. tabs::

  .. code-tab:: javascript

    const { S3PersistenceAdapter } = require('ask-sdk-s3-persistence-adapter');

    const S3PersistenceAdapter = new S3PersistenceAdapter({ bucketName : 'FooBucket' })

  .. code-tab:: typescript

    import { PersistenceAdapter } from 'ask-sdk-core';
    import { S3PersistenceAdapter } from 'ask-sdk-dynamodb-persistence-adapter';

    const S3PersistenceAdapter : PersistenceAdapter = new S3PersistenceAdapter({ bucketName : 'FooBucket' });

Config Options
""""""""""""""

* **bucketName** (string) - The name of the S3 bucket used.
* **objectKeyGenerator** (function) - Optional. The function used to generate object key using ``RequestEnvelope``. Default to generate the object key using the ``userId``.
* **s3Client** (`AWS.S3 <https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html>`_) - Optional. The ``S3Client`` used to query AWS S3 bucket. You can inject your ``S3Client`` with custom configuration here. Default to use ``new AWS.S3({apiVersion : 'latest'})``.
* **pathPrefix** (string) - The prefix value added to the object key generated. This is used for s3 to mimic a file system structure. Default to empty string.

Method Details
^^^^^^^^^^^^^^

``getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : any}>``
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

The ``getAttributes`` operation retrieves the attributes from the S3 bucket. It takes in a ``RequestEnvelope`` object and pass it to the ``ObjectKeyGenerator`` to generate the object key. Then it will retrieve the attributes returned from S3 bucket. When the corresponding object key is not found or the object has no body data, ``getAttributes`` will return an empty object.

``saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : any}) : Promise<void>``
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

The ``saveAttributes`` operation saves the attributes to the S3 bucket using the object key generated from the ``RequestEnvelope``.
