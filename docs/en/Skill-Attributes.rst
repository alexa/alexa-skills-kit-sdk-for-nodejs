================
Skill Attributes
================

The SDK allows you to store and retrieve attributes at different scopes.
For example, you can use the attributes to store data that you retrieve
on subsequent requests. You can also use attributes in your handler’s
``canHandle`` logic to influence request routing.

An attribute consists of a key and a value. The key is enforced as a
``String`` type and the value is an unbounded ``Object``. For session
and persistent attributes, you must ensure that value types are
serializable so they can be properly stored for subsequent retrieval.
This restriction does not apply to request-level attributes because they
do not persist outside of the request processing lifecycle.

Attributes Scopes
-----------------

Request attributes
^^^^^^^^^^^^^^^^^^

Request attributes only last within a single request processing
lifecycle. Request attributes are initially empty when a request comes
in, and are discarded once a response has been produced.

Request attributes are useful with request and response interceptors.
For example, you can inject additional data and helper classes into
request attributes through a request interceptor so they are retrievable
by request handlers.

Session attributes
^^^^^^^^^^^^^^^^^^

Session attributes persist throughout the lifespan of the current skill
session. Session attributes are available for use with any in-session
request. Any attributes set during the request processing lifecycle are
sent back to the Alexa service and provided in the next request in the
same session.

Session attributes do not require the use of an external storage
solution. They are not available for use when handling out-of-session
requests. They are discarded once the skill session closes.

Persistent attributes
^^^^^^^^^^^^^^^^^^^^^

Persistent attributes persist beyond the lifecycle of the current
session. How these attributes are stored, including key scope (user ID
or device ID), TTL, and storage layer depends on the configuration of
the skill.

Persistent attributes are only available when you `configure the skill
instance <Skill-Builders.html>`__ with a ``PersistenceAdapter``. Calls to the
``AttributesManager`` to retrieve and save persistent attributes throw
an error if a ``PersistenceAdapter`` has not been configured. Call
``savePersistentAttributes()`` on the ``AttributesManager`` to save any
changes back to the persistence layer.

PersistenceAdapter
------------------

The ``PersistenceAdapter`` is used by ``AttributesManager`` when
retrieving and saving attributes to persistence layer (i.e. database or
local file system). The ``ask-sdk-dynamodb-persistence-adapter`` package
provides an implementation of ``PersistenceAdapter`` using `AWS
DynamoDB <https://aws.amazon.com/dynamodb/>`__. All customized
``PersistenceAdapter`` needs to follow the following interface.

**Interface**

.. code:: typescript

   interface PersistenceAdapter {
       getAttributes(requestEnvelope : RequestEnvelope) : Promise<{[key : string] : any}>;
       saveAttributes(requestEnvelope : RequestEnvelope, attributes : {[key : string] : any}) : Promise<void>;
   }

AttributesManager
-----------------

The ``AttributesManager`` exposes attributes that you can retrieve and
update in your handlers. ``AttributesManager`` is available to handlers
via the ``HandlerInput`` container object. The ``AttributesManager``
takes care of attributes retrieval and saving so that you can interact
directly with attributes needed by your skill.

**Interface**

.. code:: typescript

   interface AttributesManager {
       getRequestAttributes() : {[key : string] : any};
       getSessionAttributes() : {[key : string] : any};
       getPersistentAttributes() : Promise<{[key : string] : any}>;
       setRequestAttributes(requestAttributes : {[key : string] : any}) : void;
       setSessionAttributes(sessionAttributes : {[key : string] : any}) : void;
       setPersistentAttributes(persistentAttributes : {[key : string] : any}) : void;
       savePersistentAttributes() : Promise<void>;
   }

The following example shows how you can retrieve and save persistent
attributes.

.. code:: javascript

   const PersistentAttributesHandler = {
       canHandle(handlerInput) {
           return new Promise((resolve, reject) => {
               handlerInput.attributesManager.getPersistentAttributes()
                   .then((attributes) => {
                       resolve(attributes['foo'] === 'bar');
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
                       attributes['foo'] = 'bar';
                       handlerInput.attributesManager.setPersistentAttributes(attributes);

                       return handlerInput.attributesManager.savePersistentAttributes();
                   })
                   .then(() => {
                       resolve(handlerInput.responseBuilder.getResponse());
                   })
                   .catch((error) => {
                           reject(error);
                   });
           });
       }
   };
