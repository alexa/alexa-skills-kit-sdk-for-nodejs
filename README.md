# ASK SDK for Node.js [![Build Status](https://travis-ci.org/alexa/alexa-skills-kit-sdk-for-nodejs.svg?branch=2.0.x)](https://travis-ci.org/alexa/alexa-skills-kit-sdk-for-nodejs)

*[English](README.md) | [日本語](README.ja.md)*

| Package       | NPM           |
| ------------- | ------------- |
|[ask-sdk](./ask-sdk)| [![npm](https://img.shields.io/npm/v/ask-sdk.svg)](https://www.npmjs.com/package/ask-sdk) [![npm](https://img.shields.io/npm/dt/ask-sdk.svg)](https://www.npmjs.com/package/ask-sdk)| 
|[ask-sdk-core](./ask-sdk-core)| [![npm](https://img.shields.io/npm/v/ask-sdk-core.svg)](https://www.npmjs.com/package/ask-sdk-core) [![npm](https://img.shields.io/npm/dt/ask-sdk-core.svg)](https://www.npmjs.com/package/ask-sdk-core)| 
|[ask-sdk-dynamodb-persistence-adapter](./ask-sdk-dynamodb-persistence-adapter)| [![npm](https://img.shields.io/npm/v/ask-sdk-dynamodb-persistence-adapter.svg)](https://www.npmjs.com/package/ask-sdk-dynamodb-persistence-adapter) [![npm](https://img.shields.io/npm/dt/ask-sdk-dynamodb-persistence-adapter.svg)](https://www.npmjs.com/package/ask-sdk-dynamodb-persistence-adapter)|
|[ask-sdk-v1adapter](./ask-sdk-v1adapter)|[![npm](https://img.shields.io/npm/v/ask-sdk-v1adapter.svg)](https://www.npmjs.com/package/ask-sdk-v1adapter) [![npm](https://img.shields.io/npm/dt/ask-sdk-v1adapter.svg)](https://www.npmjs.com/package/ask-sdk-v1adapter)|

The ASK SDK v2 for Node.js makes it easier for you to build highly engaging skills by allowing you to spend more time on implementing features and less writing boiler-plate code.

To help you get started more quickly with the SDK, see the following resources.

## Technical Documentation

### [Setting Up The ASK SDK](../../wiki/Setting-Up-The-ASK-SDK)
Shows how to install the SDK as a dependency in your NPM project.

### [Developing Your First Skill](../../wiki/Developing-Your-First-Skill)
Walks through step-by-step instructions for building the Hello World sample.

### [ASK SDK Migration Guide](../../wiki/ASK-SDK-Migration-Guide)
Provides instructions for migrating an Alexa skill from the SDK v1 to the SDK v2.

### [Request Processing](../../wiki/Request-Processing)
Covers how to build request handlers, exception handlers, and request and response interceptors.

### [Skill Attributes](../../wiki/Skill-Attributes)
Covers how to use skill attributes to store and retrieve skill data

### [Response Building](../../wiki/Response-Building)
Covers how to use the ResponseBuilder to compose multiple elements like text, cards, and audio into a single response.

### [Alexa Service Clients](../../wiki/Alexa-Service-Clients)
Covers how to use service clients in your skill to access Alexa APIs.

### [Skill Builders](../../wiki/Skill-Builders)
Covers how to configure and construct a skill instance.

### [Managing In-Skill Purchases](../../wiki/Managing-In-Skill-Purchases)
Covers how to manage in-skill products and the purchase experience in your skills.

## Samples

### [Hello World](https://github.com/alexa/skill-sample-nodejs-hello-world)
Sample that familiarizes you with the Alexa Skills Kit and AWS Lambda by allowing you to hear a response from Alexa when you trigger the sample.

### [Fact](https://github.com/alexa/skill-sample-nodejs-fact)
Template for a basic fact skill. You’ll provide a list of interesting facts about a topic, Alexa will select a fact at random and tell it to the user when the skill is invoked.

### [How To](https://github.com/alexa/skill-sample-nodejs-howto)
Template for a parameter-based skill called 'Minecraft Helper'. When the user asks how to craft an item in the game Minecraft, the skill provides instructions.

### [Trivia](https://github.com/alexa/skill-sample-nodejs-trivia)
Template for a trivia-style game with score keeping. Alexa asks the user multiple-choice questions and seeks a response. Correct and incorrect answers to questions are recorded.

### [Quiz Game](https://github.com/alexa/skill-sample-nodejs-quiz-game)
Template for a basic quiz game skill. Alexa quizzes the user with facts from a list you provide.

### [City Guide](https://github.com/alexa/skill-sample-nodejs-city-guide)
Template for a local recommendations skill. Alexa uses the data that you provide to offer recommendations according to the user's stated preferences.

### [Pet Match](https://github.com/alexa/skill-sample-nodejs-petmatch)
Sample skill that matches the user with a pet. Alexa prompts the user for the information it needs to determine a match. Once all of the required information is collected, the skill sends the data to an external web service that processes the data and returns the match.

### [High Low Game](https://github.com/alexa/skill-sample-nodejs-highlowgame)
Template for a basic high-low game skill. When the user guesses a number, Alexa tells the user whether the number she has in mind is higher or lower.

### [Decision Tree](https://github.com/alexa/skill-sample-nodejs-decision-tree)
Template for a basic decision tree skill. Alexa asks the user a series of questions to get to a career suggestion.

### [Device Address API](https://github.com/alexa/skill-sample-node-device-address-api)
Sample skill that shows how to request and access the configured address in the user’s device settings.

## Public Beta SDK
The available [public beta version of the ASK SDK v2 for NodeJS](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.x_public-beta) may contain one or more Alexa features that are currently in public beta and not included in the production SDK version.

## Got Feedback?
Request and vote for Alexa features [here](https://alexa.uservoice.com/forums/906892-alexa-skills-developer-voice-and-vote)!
