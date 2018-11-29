**********************
ASK SDKのセットアップ
**********************

このガイドでは、プロジェクトでASK SDK v2 for Node.jsを使用する方法を説明します。

前提条件
=============

-  `NPM <https://www.npmjs.com/>`__\ プロジェクト。
-  適切なNode.js開発環境。ASK SDK v2 for Node.jsには、Node 4.3.2以上が必要です。

ASK SDKをプロジェクトに追加する
==================================

プロジェクトでASK SDK v2 for Node.jsを使うには、NPMモジュールとしてSDKをインストールする必要があります。標準SDK配布パッケージ、SDKのコアモジュールといずれかのアドオンパッケージを選択してインストールします。すぐにセットアップして実行するには、標準SDK配布パッケージを選ぶのがもっとも簡単です。標準SDK配布パッケージには、SDKのコアモジュール、モデルパッケージ、DynamoDBにスキルのアトリビュートを格納できるようにするAmazon DynamoDB永続アダプターが含まれます。

標準ASK SDK配布パッケージをインストールする
-------------------------------------------

NPMプロジェクトから、以下のコマンドを実行して標準ASK SDK v2 for
Node.js配布パッケージをインストールします。

::

   npm install --save ask-sdk

コアSDKモジュールのみをインストールする
-------------------------------------------

``ask-sdk``\ モジュールすべてを使う必要がない場合、コアモジュールのみをインストールし、後からアドオンパッケージを個別に追加できます。NPMプロジェクトから、以下のコマンドを実行してコアASK
SDK v2 for Node.js配布パッケージをインストールします。

**モデル（ask-sdk-coreのpeer依存関係として必要）**

::

   npm install --save ask-sdk-model

**コアSDK**

::

   npm install --save ask-sdk-core

アドオンのASK SDKモジュールのインストール
-------------------------------------------

アドオンパッケージをインストールすると、\ ``PersistenceAdapter``\ などのSDK機能が実装されます。スキルの機能を拡張するには、必要に応じてモジュールを選んでコアSDKモジュールに追加インストールできます。

**Amazon DynamoDB永続アダプター**

::

   npm install --save ask-sdk-dynamodb-persistence-adapter

**Amazon S3永続アダプター**

::

   npm install --save ask-sdk-s3-persistence-adapter

次のステップ
====================

プロジェクトにSDKを追加したら、スキルの開発を開始できます。次の\ `初めてのスキル開発 <Developing-Your-First-Skill.html>`__\ セクションに進み、基本のスキル開発の手順をご覧ください。
