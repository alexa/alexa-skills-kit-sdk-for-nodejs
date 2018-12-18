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
   :caption: REFERENCE
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

ASK SDK v2 for Node.jsを使うと、ボイラープレートコード（毎回書かなければならないお決まりのコード）を書く手間が省けます。これにより空いた時間をさまざまな機能の実装に充てることができ、人気のスキルをより簡単に作成できるようになります。

SDKでサポートされているAlexaの機能
==============================================

このセクションでは、現在SDKでサポートされているAlexaのすべての機能を紹介します。

* `Amazon Pay <https://developer.amazon.com/docs/amazon-pay/integrate-skill-with-amazon-pay.html>`__

* `Audio Player <https://developer.amazon.com/docs/custom-skills/audioplayer-interface-reference.html>`__

* `Display – 画面付きデバイス用のBodyテンプレート <https://developer.amazon.com/docs/custom-skills/create-skills-for-alexa-enabled-devices-with-a-screen.html>`__

* `Gadgets Game Engine – Echo Buttons（日本未対応） <https://developer.amazon.com/docs/custom-skills/game-engine-interface-reference.html>`__

* `Directiveサービス（プログレッシブ応答） <https://developer.amazon.com/docs/custom-skills/send-the-user-a-progressive-response.html>`__

* `メッセージ <https://developer.amazon.com/docs/smapi/send-a-message-request-to-a-skill.html>`__

* `収益化 <https://developer.amazon.com/alexa-skills-kit/make-money>`__

* `ビデオ <https://developer.amazon.com/docs/custom-skills/videoapp-interface-reference.html>`__

* `デバイスのアドレス <https://developer.amazon.com/docs/custom-skills/device-address-api.html>`__

* `リスト <https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html#alexa-lists-access>`__

* `ユーザー連絡先情報のリクエスト <https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html>`__

* `ユーザー設定情報の取得 <https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html>`_

* `アカウントリンク <https://developer.amazon.com/docs/account-linking/understand-account-linking.html>`__

* `スロットタイプ値の同義語とIDを定義する（エンティティ解決） <https://developer.amazon.com/docs/custom-skills/define-synonyms-and-ids-for-slot-type-values-entity-resolution.html>`__

* `ダイアログ管理 <https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html>`__

* `Location Services <https://developer.amazon.com/docs/custom-skills/location-services-for-alexa-skills.html>`__

* `Reminders <https://developer.amazon.com/docs/smapi/alexa-reminders-overview.html>`__

プレビュー機能
------------------

.. note::

      以下の機能は、公開プレビュー版としてリリースされます。インターフェースは今後のリリースで変更される可能性があります。

* `Connections <https://developer.amazon.com/blogs/alexa/post/7b332b32-893e-4cad-be07-a5877efcbbb4/skill-connections-preview-now-skills-can-work-together-to-help-customers-get-more-done>`__
* `Alexa Presentation Language <https://developer.amazon.com/docs/alexa-presentation-language/apl-overview.html>`__
* `無指名対話 <https://developer.amazon.com/docs/custom-skills/understand-name-free-interaction-for-custom-skills.html>`_

ガイド
======

SDKを使って開発を始めるには、以下のリソースを参照してください。

`ASK SDKのセットアップ`_
-------------------------

NPMプロジェクトに依存関係としてSDKをインストールする方法を説明します。

`初めてのスキル開発`_
-------------------------

Hello Worldサンプルをビルドする手順を詳しく説明します。

`ASK SDK移行ガイド`_
-------------------------

SDK v1からSDK v2にAlexaスキルを移行する手順を説明します。

技術文書
========

`リクエスト処理`_
-------------------------

リクエストハンドラー、例外ハンドラー、リクエストと応答のインターセプターをビルドする方法を説明します。

`応答のビルド`_
-------------------------

ResponseBuilderを使って、テキスト、カード、オーディオといった複数の要素を使用して1つの応答を構成する方法を説明します。

`アトリビュートの管理`_
-------------------------

スキルのアトリビュートを使ったスキルデータの保存と取得の方法を説明します。

`AlexaサービスAPIの呼び出し`_
-------------------------------

サービスクライアントを使ってスキルからAlexa
APIにアクセスする方法を説明します。.

`スキルビルダー`_
-------------------------

スキルインスタンスの構成と作成の方法を説明します。

フィードバック
================

Alexaの機能に関するリクエストや投票は、\ `こちら <https://alexa.uservoice.com/forums/906892-alexa-skills-developer-voice-and-vote/filters/top?category_id=322783>`__\ をご覧ください。

.. _ASK SDKのセットアップ: Setting-Up-The-ASK-SDK.html
.. _初めてのスキル開発: Developing-Your-First-Skill.html
.. _ASK SDK移行ガイド: ASK-SDK-Migration-Guide.html
.. _リクエスト処理: Processing-Request.html
.. _応答のビルド: Building-Response.html
.. _アトリビュートの管理: Managing-Attributes.html
.. _AlexaサービスAPIの呼び出し: Calling-Alexa-Service-APIs.html
.. _スキルビルダー: Configuring-Skill-Instance.html