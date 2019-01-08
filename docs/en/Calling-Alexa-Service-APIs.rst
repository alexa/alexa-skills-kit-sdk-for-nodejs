**************************
Calling Alexa Service APIs
**************************

Alexa Skills Kit provides multiple service APIs that you can use to personalize your skill experience. The SDK includes service clients which make it easy to call Alexa APIs from within your skill logic.

ServiceClientFactory
====================

The ``ServiceClientFactory`` is available to the handlers via the ``HandlerInput`` container object. It takes care of creating individual service client and configuring the ``ApiAccessToken`` and ``ApiEndpoint``.

Available Methods
-----------------

.. code-block:: typescript

  getDeviceAddressServiceClient() : deviceAddress.DeviceAddressServiceClient;
  getDirectiveServiceClient() : directive.DirectiveServiceClient;
  getListManagementServiceClient() : listManagement.ListManagementServiceClient;
  getMonetizationServiceClient() : monetization.MonetizationServiceClient;
  getUpsServiceClient() : ups.UpsServiceClient;

.. note::

	``ServiceClientFactory`` are only available when you `configure the skill instance <Configuring-Skill-Instance.html>`_ with an ``ApiClient``.

ApiClient
=========

The ``ApiClient`` is used by ``ServiceClientFactory`` when making API calls to Alexa services. You can register any customized ``ApiClient`` that conforms to the following interface with the SDK.

Interface
---------

.. code-block:: typescript

  interface ApiClient {
    invoke(request: ApiClientRequest): Promise<ApiClientResponse>;
  }

  interface ApiClientMessage {
    headers: Array<{key: string; value: string;}>;
    body?: string;
  }

  interface ApiClientRequest extends ApiClientMessage {
    url: string;
    method: string;
  }

  interface ApiClientResponse extends ApiClientMessage {
    statusCode: number;
  }

DefaultApiClient
----------------

``ask-sdk-core`` package provides a ``DefaultApiClient`` which is an implemenntation of ``ApiClient`` using the Node.js native ``https`` client.

Constructor Details
^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    new DefaultApiClient() => object

Constructs a ``DefaultApiClient`` object. This object is used by ``ServiceClient`` to make APT class to individual Alexa services.

DeviceAddressServiceClient
==========================

``DeviceAddressServiceClient`` can be used to query `Device Address API <https://developer.amazon.com/docs/custom-skills/device-address-api.html>`_  for address data associated with the customer's Alexa device. You can then use this address data to provide key functionality for the skill, or to enhance the customer experience. For example, your skill could provide a list of nearby store locations or provide restaurant recommendations using this address information

Type Definition
---------------

.. code-block:: typescript

  class DeviceAddressServiceClient {
    getCountryAndPostalCode(deviceId: string): Promise<services.deviceAddress.ShortAddress>;
    getFullAddress(deviceId: string): Promise<services.deviceAddress.Address>;
  };

  interface ShortAddress {
    countryCode?: string;
    postalCode?: string;
  }

  interface Address {
    addressLine1?: string;
    addressLine2?: string;
    addressLine3?: string;
    countryCode?: string;
    stateOrRegion?: string;
    city?: string;
    districtOrCounty?: string;
    postalCode?: string;
  }

Code Sample
-----------

The following example shows a request handler that creates an instance of the ``DeviceAddressServiceClient`` and retrieves customer's full address.

.. tabs::

  .. code-tab:: javascript

    const GetAddressIntent = {
      canHandle(handlerInput) {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'GetAddressIntent';
      },
      async handle(handlerInput) {
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;
        const consentToken = requestEnvelope.context.System.user.permissions
            && requestEnvelope.context.System.user.permissions.consentToken;
        if (!consentToken) {
          return responseBuilder
            .speak('Please enable Location permissions in the Amazon Alexa app.')
            .withAskForPermissionsConsentCard(['read::alexa:device:all:address'])
            .getResponse();
        }

        try {
          const { deviceId } = requestEnvelope.context.System.device;
          const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
          const address = await deviceAddressServiceClient.getFullAddress(deviceId);

          console.log('Address successfully retrieved, now responding to user.');

          let response;
          if (address.addressLine1 === null && address.stateOrRegion === null) {
            response = responseBuilder
              .speak(`It looks like you don't have an address set. You can set your address from the companion app.`)
              .getResponse();
          } else {
            const ADDRESS_MESSAGE = `Here is your full address: ${address.addressLine1}, ${address.stateOrRegion}, ${address.postalCode}`;
            response = responseBuilder
              .speak(ADDRESS_MESSAGE)
              .getResponse();
          }
          return response;
        } catch (error) {
          if (error.name !== 'ServiceError') {
            const response = responseBuilder
              .speak('Uh Oh. Looks like something went wrong.')
              .getResponse();

            return response;
          }
          throw error;
        }
      },
    };

  .. code-tab:: typescript

    import {
      HandlerInput,
      RequestHandler,
    } from 'ask-sdk-core';
    import {
      Response,
      services,
    } from 'ask-sdk-model';
    import Address = services.deviceAddress.Address;

    const GetAddressIntent : RequestHandler = {
      canHandle(handlerInput : HandlerInput) : boolean {
        const { request } = handlerInput.requestEnvelope;

        return request.type === 'IntentRequest' && request.intent.name === 'GetAddressIntent';
      },
      async handle(handlerInput : HandlerInput) : Promise<Response> {
        const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;

        const consentToken = requestEnvelope.context.System.user.permissions
                             && requestEnvelope.context.System.user.permissions.consentToken;
        if (!consentToken) {
          return responseBuilder
            .speak('Please enable Location permissions in the Amazon Alexa app.')
            .withAskForPermissionsConsentCard(['read::alexa:device:all:address'])
            .getResponse();
        }
        try {
          const { deviceId } = requestEnvelope.context.System.device;
          const deviceAddressServiceClient = serviceClientFactory.getDeviceAddressServiceClient();
          const address : Address = await deviceAddressServiceClient.getFullAddress(deviceId);

          console.log('Address successfully retrieved, now responding to user.');

          let response;
          if (address.addressLine1 === null && address.stateOrRegion === null) {
            response = responseBuilder
              .speak(`It looks like you don't have an address set. You can set your address from the companion app.`)
              .getResponse();
          } else {
            const ADDRESS_MESSAGE = `Here is your full address: ${address.addressLine1}, ${address.stateOrRegion}, ${address.postalCode}`;
            response = responseBuilder
              .speak(ADDRESS_MESSAGE)
              .getResponse();
          }

          return response;
        } catch (error) {
          if (error.name !== 'ServiceError') {
            const response = responseBuilder
              .speak('Uh Oh. Looks like something went wrong.')
              .getResponse();

            return response;
          }
          throw error;
        }
      },
    };

DirectiveServiceClient
======================

``DirectiveServiceClient`` can be used to send directives to `Progressive Response API <https://developer.amazon.com/docs/custom-skills/send-the-user-a-progressive-response.html>`_. Progressive responses can be used to keep the user engaged while your skill prepares a full response to the user's request.

Type Definition
---------------

.. code-block:: typescript

  class DirectiveServiceClient {
    enqueue(sendDirectiveRequest: services.directive.SendDirectiveRequest): Promise<void>;
  }

  interface SendDirectiveRequest {
    header: services.directive.Header;
    directive: services.directive.Directive;
  }

  interface Header {
    requestId: string;
  }

  type Directive = services.directive.SpeakDirective;

  interface SpeakDirective {
    type: 'VoicePlayer.Speak';
    speech?: string;
  }

Code Sample
-----------

The following example shows a function that creates an instance of the ``DirectiveServiceClient`` and sends a progressive response.

.. tabs::

  .. code-tab:: javascript

    function callDirectiveService(handlerInput, date) {
      const requestEnvelope = handlerInput.requestEnvelope;
      const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();

      const requestId = requestEnvelope.request.requestId;
      const directive = {
        header: {
          requestId,
        },
        directive: {
          type: 'VoicePlayer.Speak',
          speech: `$Please wait while I look up information about ${date}...`,
        },
      };

      return directiveServiceClient.enqueue(directive);
    }

  .. code-tab:: typescript

    import { HandlerInput } from 'ask-sdk-core';
    import { services } from 'ask-sdk-model';
    import SendDirectiveRequest = services.directive.SendDirectiveRequest;

    function callDirectiveService(handlerInput : HandlerInput, date : string) : Promise<void> {
      const requestEnvelope = handlerInput.requestEnvelope;
      const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();

      const requestId = requestEnvelope.request.requestId;

      const directive : SendDirectiveRequest = {
          header: {
              requestId,
          },
          directive: {
              type: 'VoicePlayer.Speak',
              speech: `$Please wait while I look up information about ${date}...`,
          },
      };

      return directiveServiceClient.enqueue(directive);
    }

ListManagementServiceClient
===========================

``ListManagementServiceClient`` can be used to access the `List Management API <https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#list-management-quick-reference>`_ in order to read or modify both the Alexa default lists and any custom lists customer may have.

Type Definition
---------------

.. code-block:: typescript

  class ListManagementServiceClient {
    getListsMetadata(): Promise<services.listManagement.AlexaListsMetadata>;
    getList(listId: string, status: string): Promise<services.listManagement.AlexaList>;
    getListItem(listId: string, itemId: string): Promise<services.listManagement.AlexaListItem>;
    createList(createListRequest: services.listManagement.CreateListRequest): Promise<services.listManagement.AlexaListMetadata>;
    createListItem(listId: string, createListItemRequest: services.listManagement.CreateListItemRequest): Promise<services.listManagement.AlexaListItem>;
    updateList(listId: string, updateListRequest: services.listManagement.UpdateListRequest): Promise<services.listManagement.AlexaListMetadata>;
    updateListItem(listId: string, itemId: string, updateListItemRequest: services.listManagement.UpdateListItemRequest): Promise<services.listManagement.AlexaListItem>;
    deleteList(listId: string): Promise<void>;
    deleteListItem(listId: string, itemId: string): Promise<void>;
  }

MonetizationServiceClient
=========================

In-Skill Purchase Service
-------------------------

The ASK SDK for Node.js provides a ``MonetizationServiceClient`` that invokes `inSkillPurchase API <https://developer.amazon.com/docs/in-skill-purchase/isp-overview.html>`_  to retrieve all in-skill products associated with the current skill along with indications if each product is purchasable and/or already purchased by the current customer. The following methods are provided:

.. code-block:: javascript

   getInSkillProducts(locale : string, purchasable? : string, entitled? : string, productType? : string, nextToken? : string, maxResults? : number) : Promise<services.monetization.InSkillProductsResponse>
   getInSkillProduct(locale : string, productId : string) : Promise<services.monetization.InSkillProduct>

-  ``locale`` can be retrieved from the request at ``handlerInput.requestEnvelope.request.locale``.
-  ``purchasable`` can be provided as ``null`` to retrieve all in-skill products and as ``PURCHASABLE`` or ``NOT_PURCHASABLE`` to filter the response on purchasability.
-  ``productType`` can be provided as ``null`` to retrieve in-skill products of all types or as ``ENTITLEMENT``, ``CONSUMABLE`` or ``SUBSCRIPTION`` to filter by product type.
-  ``entitled`` can be provided as ``null`` to retrieve all in-skill products and as ``ENTITLED`` or ``NOT_ENTITLED`` to filter the response on entitlement status.
-  ``nextToken`` is required for paginated queries. ``maxResults`` allows skills to control records retrieved per API call. The default page size is 100 records.
-  ``productId`` specifies the in-skill product to be retrieved.

getInSkillProducts
^^^^^^^^^^^^^^^^^^^^

The ``getInSkillProducts`` method retrieves all associated in-skill products for the current skill along with purchasability and entitlement indications for each in-skill product for the current skill and customer.

.. code-block:: javascript

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
      });
    },
  }

The API response contains an array of in-skill product records.

.. code-block:: javascript

   {
      "inSkillProducts":[
        {
          "productId": "amzn1.adg.product....",
          "referenceName": "<Product Reference Name as defined by the developer>",
          "type": "SUBSCRIPTION",               // Or ENTITLEMENT
          "name": "<locale specific product name as defined by the developer>",
          "summary": "<locale specific product summary, as provided by the developer>",
          "entitled": "ENTITLED",              // Or NOT_ENTITLED
          "purchasable": "PURCHASABLE",        // Or NOT_PURCHASABLE
          "purchaseMode": "TEST"               // Or LIVE
          "activeEntitlementCount": 1
        }
      ],
      "isTruncated": true,
      "nextToken": "string"
    }

getInSkillProduct
^^^^^^^^^^^^^^^^^^^

The ``getInSkillProduct`` API retrieves the product record for a single in-skill product identified by a given productId.

.. code-block:: javascript

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
      });
    },
  }

The API response contains a single in-skill product record.

.. code-block:: javascript

   {
       "productId": "amzn1.adg.product....",
       "referenceName": "<Product Reference Name as defined by the developer>",
       "type": "SUBSCRIPTION",               // Or ENTITLEMENT
       "name": "<locale specific product name as defined by the developer>",
       "summary": "<locale specific product summary, as provided by the developer>",
       "entitled": "ENTITLED",              // Or NOT_ENTITLED
       "purchasable": "PURCHASABLE",        // Or NOT_PURCHASABLE
       "purchaseMode": "TEST"               // Or LIVE
       "activeEntitlementCount": 1
   }

More information on these APIs and their usage for skill implementation is available here: `Add In-Skill Purchases to a Custom Skill <https://developer.amazon.com/docs/in-skill-purchase/add-isps-to-a-skill.html>`__

In-Skill Purchase Interface
---------------------------

The ASK SDK for Node.js provides the ``addDirective()`` method for skills to initiate in-skill purchase and cancellation requests through Alexa. Amazon systems then manage the voice interaction with customers, handle the purchase transaction and return a status response back to the requesting skill. Three different ``actions`` are supported using this interface: + ``Upsell`` + ``Buy`` + ``Cancel``

More details about these ``actions`` and recommended usecases is available here: `Add In-Skill Purchases to a Custom Skill <https://developer.amazon.com/docs/in-skill-purchase/add-isps-to-a-skill.html>`__

Upsell
^^^^^^

Skills should initiate the Upsell action to present an in-skill contextually when the user did not explicitly ask for it. E.g. During or after the free content has been served. A productId and upsell message is required to initiate the Upsell action. The upsell message allows developers to specify how Alexa can present the in-skill product to the user before presenting the pricing offer.

.. code-block:: javascript

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
^^^

Skills should initiate the Buy action when a customer asks to buy a specific in-skill product. A productId is required to initiate the Buy action.

.. code-block:: javascript

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
        else {
          return handlerInput.responseBuilder
            .speak('I am sorry. That product is not available for purchase')
            .getResponse();
        }
      });
    }
  };

Cancel
^^^^^^

Skills should initiate the Cancel action when a customer asks to cancel an existing entitlement or Subscription for a supported in-skill product. A productId is required to initiate the Cancel action.

.. code-block:: javascript

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

UpsServiceClient
================

``UpsServiceClient`` can be used to query `Alexa Customer Profile API <https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html>`_ for customer contact information and `Alexa Customer Settings API <https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html>`_ for customer preferences of time zone, distance measuring and temperature measurement unit.

Type Definition
---------------

.. code-block:: typescript

  class UpsServiceClient {
    getProfileEmail(): Promise<string>;
    getProfileGivenName(): Promise<string>;
    getProfileMobileNumber(): Promise<services.ups.PhoneNumber>;
    getProfileName(): Promise<string>;
    getSystemDistanceUnits(deviceId: string): Promise<services.ups.DistanceUnits>;
    getSystemTemperatureUnit(deviceId: string): Promise<services.ups.TemperatureUnit>;
    getSystemTimeZone(deviceId: string): Promise<string>;
  }

ReminderManagementServiceClient
===============================

``ReminderManagementServiceClient`` can be used to query `Alexa Reminders API <https://developer.amazon.com/docs/smapi/alexa-reminders-api-reference.html>`_ to create and manage reminders from your skill.

Type Definition
---------------

.. code-block:: typescript

    class ReminderManagementServiceClient extends BaseServiceClient {
      deleteReminder(alertToken: string): Promise<void>;
      getReminder(alertToken: string): Promise<services.reminderManagement.GetReminderResponse>;
      updateReminder(alertToken: string, reminderRequest: services.reminderManagement.ReminderRequest): Promise<services.reminderManagement.ReminderResponse>;
      deleteReminders(): Promise<void>;
      getReminders(): Promise<services.reminderManagement.GetRemindersResponse>;
      createReminder(reminderRequest: services.reminderManagement.ReminderRequest): Promise<services.reminderManagement.ReminderResponse>;
    }
