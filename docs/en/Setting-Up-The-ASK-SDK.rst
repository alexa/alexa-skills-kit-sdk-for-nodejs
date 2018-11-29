**********************
Setting Up the ASK SDK
**********************

This guide describes how to use the ASK SDK v2 for Node.js in your project.

Prerequisites
=============

-  An `NPM <https://www.npmjs.com/>`_ project. For information on how to set up a NPM project, please see `this <https://docs.npmjs.com/getting-started/creating-node-modules>`_.
-  A suitable Node.js development environment. The ASK SDK v2 for Node.js requires Node 4.3.2 or above.

Adding the ASK SDK to Your Project
==================================

To use the ASK SDK v2 for Node.js in your project, install it as a NPM module. You can choose to install the standard SDK distribution or the core SDK module with selective add-on packages. The standard SDK distribution is the easiest way to quickly get up and running with the SDK. It includes the core SDK module, the model package, and the module for the Amazon DynamoDB persistence adapter that enables storing skill attributes in DynamoDB.

Installing Standard ASK SDK Distribution
----------------------------------------

From within your NPM project, run the following commands to install the standard ASK SDK v2 for Node.js distribution:

::

   npm install --save ask-sdk

Installing Core SDK Module Only
-------------------------------

If you do not need everything in the ``ask-sdk`` module, you can install the core modules and expand with individual add-on packages later. From within your NPM project, run the following commands to install the core ASK SDK v2 for Node.js distribution:

**Model (required as peer dependency of ask-sdk-core)**

::

   npm install --save ask-sdk-model

**Core SDK**

::

   npm install --save ask-sdk-core

Installing Add-on ASK SDK Modules
---------------------------------

Add-on packages implement SDK functionality such as ``PersistenceAdapter``. You can selectively install modules on top of the core SDK module to expand the capability of your skill.

**Amazon DynamoDB Persistence Adapter**

::

   npm install --save ask-sdk-dynamodb-persistence-adapter

**Amazon S3 Persistence Adapter**

::

   npm install --save ask-sdk-s3-persistence-adapter

Next Steps
==========

Now that you’ve added the SDK to your project, you’re ready to begin developing a skill. Proceed to the next section, `Developing Your First Skill <Developing-Your-First-Skill.html>`_, for instructions on getting started with a basic skill.
