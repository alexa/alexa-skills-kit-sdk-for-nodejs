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

ASK SDK v2 for Node.jsを使うと、ボイラープレートコード（毎回書かなければならないお決まりのコード）を書く手間が不要になります。これにより空いた時間をさまざまな機能の実装に充てることができ、人気のスキルをより簡単に作成できるようになります。

SDKを使って開発を始めるには、以下のリソースをご覧ください。

ガイド
=========

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