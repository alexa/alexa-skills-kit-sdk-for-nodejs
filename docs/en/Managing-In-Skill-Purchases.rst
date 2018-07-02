===========================
Managing In-Skill Purchases
===========================

The ASK SDK for Node.js includes a service client and helper methods for
discovering available and purchased in-skill products and for initiating
purchase and cancellation requests from within a skill.

In-Skill Purchase Service
-------------------------

The ASK SDK for Node.js provides a ``MonetizationServiceClient`` that
invokes inSkillProducts API to retrieve all in-skill products associated
with the current skill along with indications if each product is
purchasable and/or already purchased by the current customer. The
following methods are provided:

.. code:: javascript

   getInSkillProducts(locale : string, purchasable? : string, entitled? : string, productType? : string, nextToken? : string, maxResults? : number) : Promise<services.monetization.InSkillProductsResponse>
   getInSkillProduct(locale : string, productId : string) : Promise<services.monetization.InSkillProduct>

-  ``locale`` can be retrieved from the request at
   ``handlerInput.requestEnvelope.request.locale``.
-  ``purchasable`` can be provided as ``null`` to retrieve all in-skill
   products and as ``PURCHASABLE`` or ``NOT_PURCHASABLE`` to filter the
   response on purchasability.
-  ``productType`` can be provided as ``null`` to retrieve in-skill
   products of all types or as ``ENTITLEMENT`` or ``SUBSCRIPTION`` to
   filter by product type.
-  ``entitled`` can be provided as ``null`` to retrieve all in-skill
   products and as ``ENTITLED`` or ``NOT_ENTITLED`` to filter the
   response on entitlement status.
-  ``nextToken`` is required for paginated queries. ``maxResults``
   allows skills to control records retrieved per API call. The default
   page size is 100 records.
-  ``productId`` specifies the in-skill product to be retrieved.

getInSkillProducts()
~~~~~~~~~~~~~~~~~~~~

The ``getInSkillProducts`` method retrieves all associated in-skill
products for the current skill along with purchasability and entitlement
indications for each in-skill product for the current skill and
customer.

.. code:: javascript

   const Alexa = require('ask-sdk-core');

   const LaunchRequestHandler = {
     canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
     },
     handle(handlerInput) {
           console.log("In LaunchRequest");

           const locale = handlerInput.requestEnvelope.request.locale;
           const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

           return ms.getInSkillProducts(locale).then(function(result) {

               // Code to handle result.inSkillProducts goes here
               const totalProducts = result.inSkillProducts.length;
               const purchasableProducts = result.inSkillProducts.filter(record => record.purchasable == 'PURCHASABLE');
               const entitledProducts = result.inSkillProducts.filter(record => record.entitled == 'ENTITLED');

               return handlerInput.responseBuilder
                         .speak('Found total ' + result.inSkillProducts.length + ' products of which ' + purchasableProducts.length + ' are purchasable and ' + entitledProducts.length + ' are entitled.');
                         .getResponse();
             }
        }
   }

The API response contains an array of in-skill product records.

.. code:: javascript

   {
     "inSkillProducts":[
         {
             "productId": "amzn1.adg.product....",
             "referenceName": "<Product Reference Name as defined by the developer>",
             "type": "SUBSCRIPTION",               // Or ENTITLEMENT
             "name": "<locale specific product name as defined by the developer>",
             "summary": "<locale specific product summary, as provided by the developer>",
             "entitled": "ENTITLED",              // Or NOT_ENTITLED
             "purchasable": "PURCHASABLE"         // Or NOT_PURCHASABLE
         }
     ],
     "isTruncated": true,
     "nextToken": "string"
   }

getInSkillProduct()
~~~~~~~~~~~~~~~~~~~

The ``getInSkillProduct`` API retrieves the product record for a single
in-skill product identified by a given productId.

.. code:: javascript

   const Alexa = require('ask-sdk-core');

   const LaunchRequestHandler = {
     canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
     },
     handle(handlerInput) {
           console.log("In LaunchRequest");

           const locale = handlerInput.requestEnvelope.request.locale;
           const productId = 'amzn1.adg.product.<GUID>';
           const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

           return ms.getInSkillProduct(locale, productId).then(function(result) {

               // Code to handle result.inSkillProduct goes here

             }
        }
   }

The API response contains a single in-skill product record.

.. code:: javascript

   {
       "productId": "amzn1.adg.product....",
       "referenceName": "<Product Reference Name as defined by the developer>",
       "type": "SUBSCRIPTION",               // Or ENTITLEMENT
       "name": "<locale specific product name as defined by the developer>",
       "summary": "<locale specific product summary, as provided by the developer>",
       "entitled": "ENTITLED",              // Or NOT_ENTITLED
       "purchasable": "PURCHASABLE"         // Or NOT_PURCHASABLE
   }

More information on these APIs and their usage for skill implementation
is available here: `Add In-Skill Purchases to a Custom
Skill <https://developer.amazon.com/docs/in-skill-purchase/add-isps-to-a-skill.html>`__

In-Skill Purchase Interface
---------------------------

The ASK SDK for Node.js provides the ``addDirective()`` method for
skills to initiate in-skill purchase and cancellation requests through
Alexa. Amazon systems then manage the voice interaction with customers,
handle the purchase transaction and return a status response back to the
requesting skill. Three different ``actions`` are supported using this
interface: + ``Upsell`` + ``Buy`` + ``Cancel``

More details about these ``actions`` and recommended usecases is
available here: `Add In-Skill Purchases to a Custom
Skill <https://developer.amazon.com/docs/in-skill-purchase/add-isps-to-a-skill.html>`__

Upsell
~~~~~~

Skills should initiate the Upsell action to present an in-skill
contextually when the user did not explicitly ask for it. E.g. During or
after the free content has been served. A productId and upsell message
is required to initiate the Upsell action. The upsell message allows
developers to specify how Alexa can present the in-skill product to the
user before presenting the pricing offer.

.. code:: javascript

   // In the skill flow, once a decision is made to offer an in-skill product to a
   // customer without an explicit ask from the customer

   return handlerInput.responseBuilder
       .addDirective({
           'type': 'Connections.SendRequest',
           'name': 'Upsell',
           'payload': {
                      'InSkillProduct': {
                          'productId': '<productId for the ISP which you wish to upsell>'
                      },
                      'upsellMessage': '<introductory upsell description for the in-skill product>'
            },
           'token': 'correlationToken'
       })
       .getResponse();

Buy
~~~

Skills should initiate the Buy action when a customer asks to buy a
specific in-skill product. A productId is required to initiate the Buy
action.

.. code:: javascript

   // Skills would implement a custom intent (buyProductIntent below) that captures
   // user's intent to buy an in-skill product and then initiate the Buy request to Alexa.
   // For e.g. 'Alexa, buy <product name>'

   const buyProductIntentHandler = {
     canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'buyProductIntent';
     },
     handle(handlerInput) {

           // Obtain the corresponding productId for the requested in-skill product by invoking inSkillProducts API.
           // Below, the slot variable productName is only for demonstration.

           const locale = handlerInput.requestEnvelope.request.locale;
           const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

           return ms.getInSkillProducts(locale).then(function(res) {

               const slots = handlerInput.requestEnvelope.request.intent.slots;
               const productReferenceName = slots['productName'].value;

               const product_record = res.inSkillProducts.filter(record => record.referenceName == productRef);

               if (product_record.length > 0)  {

                   return handlerInput.responseBuilder
                     .addDirective({
                         'type': 'Connections.SendRequest',
                         'name': 'Buy',
                         'payload': {
                                    'InSkillProduct': {
                                        'productId': product_record[0].productId
                                    }
                          },
                         'token': 'correlationToken'
                     })
                     .getResponse();
               }
               else  {
                   return handlerInput.responseBuilder
                     .speak('I am sorry. That product is not available for purchase')
                     .getResponse();
               }

           });
      }
   };

Cancel
~~~~~~

Skills should initiate the Cancel action when a customer asks to cancel
an existing entitlement or Subscription for a supported in-skill
product. A productId is required to initiate the Cancel action.

.. code:: javascript

   // Skills would implement a custom intent (buyIntent below) that captures
   // user's intent to buy an in-skill product and then trigger the Buy request for it.
   // For e.g. 'Alexa, buy <product name>'

   const cancelIntentHandler = {
     canHandle(handlerInput) {
       return handlerInput.requestEnvelope.request.type === 'IntentRequest'
              && handlerInput.requestEnvelope.request.intent.name === 'cancelProductIntent';
     },
     handle(handlerInput) {

           // Obtain the corresponding productId for the requested in-skill product by invoking inSkillProducts API.
           // Below, the slot variable productName is only for demonstration.

           const locale = handlerInput.requestEnvelope.request.locale;
           const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();

           return ms.getInSkillProducts(locale).then(function(res) {

               const slots = handlerInput.requestEnvelope.request.intent.slots;
               const productReferenceName = slots['productName'].value;

               const product_record = res.inSkillProducts.filter(record => record.referenceName == productReferenceName);

               if (product_record.length > 0)  {

                   return handlerInput.responseBuilder
                     .addDirective({
                         'type': 'Connections.SendRequest',
                         'name': 'Cancel',
                         'payload': {
                                    'InSkillProduct': {
                                        'productId': product_record[0].productId
                                    }
                          },
                         'token': 'correlationToken'
                     })
                     .getResponse();
               }
               else  {
                   return handlerInput.responseBuilder
                     .speak('I am sorry. I don\'t know that one.');
                     .getResponse();
               }

           });
      }
   };
