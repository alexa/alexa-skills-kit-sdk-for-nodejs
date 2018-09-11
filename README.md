<p align="center">
  <img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/avs/docs/ux/branding/mark1._TTH_.png">
  <br/>
  <h1 align="center">Alexa Skills Kit SDK for Node.js</h1>
  <p align="center"><a href="https://travis-ci.org/alexa/alexa-skills-kit-sdk-for-nodejs"><img src="https://travis-ci.org/alexa/alexa-skills-kit-sdk-for-nodejs.svg?branch=2.0.x"></a></p>
</p>

*[English](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/blob/2.0.x/README.md) | [日本語](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/blob/2.0.x/README.ja.md)*

The ASK SDK v2 for Node.js makes it easier for you to build highly engaging skills by allowing you to spend more time on implementing features and less writing boiler-plate code.

## Package Versions

| Package       | NPM           |
| ------------- | ------------- |
|[ask-sdk](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk)| [![npm](https://img.shields.io/npm/v/ask-sdk.svg)](https://www.npmjs.com/package/ask-sdk) [![npm](https://img.shields.io/npm/dt/ask-sdk.svg)](https://www.npmjs.com/package/ask-sdk)|
|[ask-sdk-core](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk-core)| [![npm](https://img.shields.io/npm/v/ask-sdk-core.svg)](https://www.npmjs.com/package/ask-sdk-core) [![npm](https://img.shields.io/npm/dt/ask-sdk-core.svg)](https://www.npmjs.com/package/ask-sdk-core)|
|[ask-sdk-dynamodb-persistence-adapter](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk-dynamodb-persistence-adapter)| [![npm](https://img.shields.io/npm/v/ask-sdk-dynamodb-persistence-adapter.svg)](https://www.npmjs.com/package/ask-sdk-dynamodb-persistence-adapter) [![npm](https://img.shields.io/npm/dt/ask-sdk-dynamodb-persistence-adapter.svg)](https://www.npmjs.com/package/ask-sdk-dynamodb-persistence-adapter)|
|[ask-sdk-s3-persistence-adapter](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk-s3-persistence-adapter)| [![npm](https://img.shields.io/npm/v/ask-sdk-s3-persistence-adapter.svg)](https://www.npmjs.com/package/ask-sdk-s3-persistence-adapter) [![npm](https://img.shields.io/npm/dt/ask-sdk-s3-persistence-adapter.svg)](https://www.npmjs.com/package/ask-sdk-s3-persistence-adapter)|
|[ask-sdk-v1adapter](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk-v1adapter)|[![npm](https://img.shields.io/npm/v/ask-sdk-v1adapter.svg)](https://www.npmjs.com/package/ask-sdk-v1adapter) [![npm](https://img.shields.io/npm/dt/ask-sdk-v1adapter.svg)](https://www.npmjs.com/package/ask-sdk-v1adapter)|

To help you get started more quickly with the SDK, see the following resources.

## Technical Documentation

| Language | Documentation |
| -------- | ------------- |
| [English](https://ask-sdk-for-nodejs.readthedocs.io/en/latest/) | [![Documentation Status](https://readthedocs.org/projects/ask-sdk-for-nodejs/badge/?version=latest)](https://ask-sdk-for-nodejs.readthedocs.io/en/latest/?badge=latest) |
| [日本語](https://ask-sdk-for-nodejs.readthedocs.io/ja/latest/) | [![Documentation Status](https://readthedocs.org/projects/ask-sdk-for-nodejs-japanese/badge/?version=latest)](https://ask-sdk-for-nodejs.readthedocs.io/ja/latest/?badge=latest) |

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

### [Audio Player](https://github.com/alexa/skill-sample-nodejs-audio-player)
Project that demonstrates how to use the audio player for skills.

## Public Beta SDK
The available [public beta version of the ASK SDK v2 for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.x_public-beta) may contain one or more Alexa features that are currently in public beta and not included in the production SDK version.

## Other Language Alexa Skills Kit SDKs
<a href="https://github.com/amzn/alexa-skills-kit-java"><img src="https://github.com/konpa/devicon/raw/master/icons/java/java-original.svg?sanitize=true" width="25px" /> Alexa Skills Kit SDK for Java</a>

<a href="https://github.com/alexa-labs/alexa-skills-kit-sdk-for-python"><img src="https://github.com/konpa/devicon/blob/master/icons/python/python-original.svg?sanitize=true" width="25px" /> Alexa Skills Kit SDK for Python</a>

## Got Feedback?
Request and vote for Alexa features [here](https://alexa.uservoice.com/forums/906892-alexa-skills-developer-voice-and-vote)!
