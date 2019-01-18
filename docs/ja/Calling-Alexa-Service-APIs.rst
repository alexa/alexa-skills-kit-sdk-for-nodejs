************************************
AlexaサービスAPIの呼び出し
************************************

Alexa Skills Kitには、スキルエクスペリエンスをパーソナライズできる複数のサービスAPIが用意されています。SDKには、スキルのロジックからAlexa APIを簡単に呼び出すことができるサービスクライアントが含まれています。

ServiceClientFactory
====================

``ServiceClientFactory`` は、 ``HandlerInput`` コンテナオブジェクトからハンドラーで使用できます。個別のサービスクライアントの作成と ``ApiAccessToken`` および ``ApiEndpoint`` の設定を行います。

利用可能なメソッド
-----------------------

.. code-block:: typescript

  getDeviceAddressServiceClient() : deviceAddress.DeviceAddressServiceClient;
  getDirectiveServiceClient() : directive.DirectiveServiceClient;
  getListManagementServiceClient() : listManagement.ListManagementServiceClient;
  getMonetizationServiceClient() : monetization.MonetizationServiceClient;
  getUpsServiceClient() : ups.UpsServiceClient;

.. note::

  ``ServiceClientFactory`` は、``ApiClient`` を使用して `スキルのインスタンスを設定 <Configuring-Skill-Instance.html>`_ する場合にのみ使用できます。

ApiClient
=========

``ApiClient`` は、Alexaサービスに対してAPIコールを行うときに ``ServiceClientFactory`` によって使用されます。SDKを使用して、次のインターフェースに準拠する任意のカスタマイズ済み ``ApiClient`` を登録できます。

インターフェース
---------------------------

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

``ask-sdk-core`` パッケージは、 ``DefaultApiClient`` を提供します。これは、Node.jsのネイティブ ``https`` クライアントを使用したApiClientの実装です。

コンストラクターの詳細
^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    new DefaultApiClient() => object

``DefaultApiClient`` オブジェクトを構築します。このオブジェクトは、 ``ServiceClient`` が個別のAlexaサービスにAPTクラスを作成するために使用します。

DeviceAddressServiceClient
==========================

``DeviceAddressServiceClient`` は、`デバイスアドレスAPI <https://developer.amazon.com/ja/docs/custom-skills/device-address-api.html>`_ に対してユーザーのAlexaデバイスに関連付けられた所在地データを照会するために使用できます。この所在地データを使用して、スキルの主要機能を提供したり、ユーザーエクスペリエンスを向上させることができます。たとえば、スキルはこの所在地情報を使って、近くの店舗の所在地一覧を提供したり、おすすめのレストランを紹介したりすることができます。

タイプ定義
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

サンプルコード
----------------------

以下は、``DeviceAddressServiceClient`` のインスタンスを作成し、ユーザーの住所を取得するリクエストハンドラーの例です。

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

``DirectiveServiceClient`` は、 `プログレッシブ応答API <https://developer.amazon.com/ja/docs/custom-skills/send-the-user-a-progressive-response.html>`_ にディレクティブを送信するために使用できます。プログレッシブ応答を使用すると、スキルがユーザーのリクエストへの完全な応答を準備している間もユーザーの関心を引き続けることができます。

タイプ定義
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

サンプルコード
----------------------

以下は、 ``DirectiveServiceClient`` のインスタンスを作成してプログレッシブ応答を送信する関数の例です。

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

``ListManagementServiceClient`` を使用して、Alexaのデフォルトリストやユーザーが保持しているカスタムリストの読み取りや変更を行うために `リスト管理API <https://developer.amazon.com/ja/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#list-management-quick-reference>`_ にアクセスできます。

タイプ定義
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

スキル内課金サービス
-------------------------

ASK SDK for Node.jsには、 `inSkillPurchase API <https://developer.amazon.com/ja/docs/in-skill-purchase/isp-overview.html>`_ を呼び出す ``MonetizationServiceClient`` が用意されています。このAPIでは、現在のスキルに関連付けられているすべてのスキル内商品を取得し、各商品が課金可能かまたは現在のユーザーがすでに課金済みかを確認できます。次のメソッドがあります。

.. code-block:: javascript

   getInSkillProducts(locale : string, purchasable? : string, entitled? : string, productType? : string, nextToken? : string, maxResults? : number) : Promise<services.monetization.InSkillProductsResponse>
   getInSkillProduct(locale : string, productId : string) : Promise<services.monetization.InSkillProduct>

-  ``locale`` は、 ``handlerInput.requestEnvelope.request.locale`` のリクエストから取得できます。
-  ``purchasable`` には、すべてのスキル内商品を取得する場合は ``null`` 、課金可能かどうかに関する応答をフィルターする場合は ``PURCHASABLE`` または ``NOT_PURCHASABLE`` を指定できます。
-  ``productType`` には、すべてのタイプのスキル内商品を取得する場合は ``null`` 、商品タイプでフィルターする場合は ``ENTITLEMENT`` 、``CONSUMABLE`` 、または ``SUBSCRIPTION`` を指定できます。
-  ``entitled`` には、すべてのスキル内商品を取得する場合は ``null`` 、非消費型アイテムのステータスに関する応答をフィルターする場合は ``ENTITLED`` または ``NOT_ENTITLED`` を指定できます。
-  ``nextToken`` は複数ページのクエリーの場合は必須です。 ``maxResults`` ではスキルでAPI呼び出しごとに取得されるレコードの数を制御できます。デフォルトのページサイズは100レコードです。
-  ``productId`` には取得するスキル内商品を指定します。

getInSkillProducts
^^^^^^^^^^^^^^^^^^^^

``getInSkillProducts`` メソッドは、現在のスキルに関連付けられているすべてのスキル内商品を取得し、現在のスキルとユーザーについて各スキル内商品の課金可能性と非消費型アイテムのステータスを示します。

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

API応答にはスキル内商品レコードの配列が含まれます。

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

``getInSkillProduct`` APIは指定されたproductIdで識別される単一のスキル内商品の商品レコードを取得します。

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

API応答には単一のスキル内商品レコードが含まれます。

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

スキル実装でのこれらのAPIとその使い方の詳細については、こちらを参照してください。 `カスタムスキルへのスキル内課金の追加 <https://developer.amazon.com/ja/docs/in-skill-purchase/add-isps-to-a-skill.html>`_

スキル内課金のインターフェース（日本未対応）
-----------------------------------------------

ASK SDK for Node.jsには、スキルでAlexaからスキル内課金とキャンセルのリクエストを開始するための ``addDirective()`` メソッドが用意されています。Amazonシステムはユーザーとの音声による対話を管理し、課金取引を処理して、ステータス応答をリクエスト元のスキルに返します。このインターフェースを使用して、 ``Upsell`` 、``Buy`` 、``Cancel`` の3つのアクションがサポートされます。

これらのアクションと推奨されるユースケースの詳細については、こちらを参照してください。 `カスタムスキルへのスキル内課金の追加 <https://developer.amazon.com/ja/docs/in-skill-purchase/add-isps-to-a-skill.html>`_

Upsell
^^^^^^

スキルは、ユーザーが明示的にコンテキストをリクエストしなかった場合にスキルのコンテキストを提供するためにUpsellアクションを開始する必要があります。たとえば、無料のコンテンツが提供されている間または後です。Upsellアクションを開始するには、製品IDとアップセルメッセージが必要です。アップセルメッセージを使って、開発者はAlexaで価格を提示する前にユーザーにスキル内商品を提示する方法を指定できます。

.. code-block:: javascript

  // スキルフローでは、ユーザーから明示的な依頼なしで
  // スキル内製品を提供するために意思決定がなされた場合

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

スキルは、ユーザーが特定のスキル内商品の課金をリクエストしたときにBuyアクションを開始します。Buyアクションを開始するには、製品IDが必要です。

.. code-block:: javascript

  // スキル内製品を購入するためにユーザーのインテントをキャプチャするカスタムインテント
  // （buyProductIntent below）を実装し、次にAlexaに対してBuyリクエストを開始します。
  // 例：'アレクサ、<product name>を買って'

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

スキルは、ユーザーがサポートされているスキル内商品の既存の非消費型アイテムまたはサブスクリプションのキャンセルをリクエストしたときにCancelアクションを開始します。Cancelアクションを開始するには、製品IDが必要です。

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

``UpsServiceClient`` を使用して、 `AlexaユーザープロフィールAPI <https://developer.amazon.com/ja/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html>`_ に対してユーザーの連絡先情報を照会したり、`Alexaユーザー設定API <https://developer.amazon.com/ja/docs/smapi/alexa-settings-api-reference.html>`_ に対してユーザーのタイムゾーン設定、長さの単位、および温度の単位を照会できます。

タイプ定義
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

``ReminderManagementServiceClient`` を使用して、スキルからリマインダーを作成、管理するために `Alexa Reminders API <https://developer.amazon.com/docs/smapi/alexa-reminders-api-reference.html>`_ をクエリーすることができます。

タイプ定義
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
