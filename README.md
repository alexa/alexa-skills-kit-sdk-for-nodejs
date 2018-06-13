
# ASK SDK for Node.js (Public Beta)

This guide describes how to use the ASK SDK v2 for Node.js (public beta) in your project.

## Disclaimer

This repo contains public beta versions of the ASK SDK v2 for Node.js, which may contain one or more Alexa features that are currently available in public beta. These features may contain unexpected bugs or be subject to future breaking changes. Production skills should use non-beta versions of the ASK SDK.

## Beta Features
The following Alexa features are only available in the public beta SDK.

* Support for `CanFulfillIntentRequest`, allowing [name-free interaction for custom skills](https://developer.amazon.com/docs/custom-skills/implement-canfulfillintentrequest-for-name-free-interaction.html). Includes ResponseBuilder helper.

## Prerequisites

* An [NPM](https://www.npmjs.com/) project.
* A suitable Node.js development environment. The ASK SDK v2 for Node.js requires Node 4.3.2 or above.

## Adding the ASK SDK to Your Project

To use the ASK SDK v2 for Node.js (public beta) in your project, install it as a NPM module. You can choose to install the standard SDK distribution or the core SDK module with selective add-on packages. The standard SDK distribution is the easiest way to quickly get up and running with the SDK. It includes the core SDK module, the model package, and the module for the Amazon DynamoDB persistence adapter that enables storing skill attributes in DynamoDB.

### Installing Standard ASK SDK Distribution

From within your NPM project, run the following commands to install the standard ASK SDK v2 for Node.js (public beta) distribution:

```
npm install --save ask-sdk@beta
```

### Installing Core SDK Module Only

If you do not need everything in the `ask-sdk` module, you can install the core modules and expand with individual add-on packages later. From within your NPM project, run the following commands to install the core ASK SDK v2 for Node.js distribution:

**Model (required as peer dependency of **`ask-sdk-core`**)**

```
npm install --save ask-sdk-model@beta
```

**Core SDK**

```
npm install --save ask-sdk-core@beta
```

### Installing Add-on ASK SDK Modules

Add-on packages implement SDK functionality such as `PersistenceAdapter`. You can selectively install modules on top of the core SDK module to expand the capability of your skill.

**Amazon DynamoDB Persistence Adapter**

```
npm install --save ask-sdk-dynamodb-persistence-adapter@beta
```
