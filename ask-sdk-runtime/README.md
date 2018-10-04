ASK SDK Runtime package contains generic components and implementations of ASK SDK v2 for Node.js.

## What is ASK SDK v2 for Node.js

The ASK SDK v2 for Node.js is an open-source Alexa Skill Development Kit. ASK SDK v2 for Node.js makes it easier for you to build highly engaging skills, by allowing you to spend more time on implementing features and less on writing boiler-plate code.

## Installing
To use the ASK SDK Runtime pacakge, simply run the following command in terminal: 

```
npm install --save ask-sdk-runtime
```

## Usage and Getting Started

You can find a getting started guide [here](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/wiki).

## Usage with TypeScript
The Core SDK package for Node.js bundles TypeScript definition files for use in TypeScript projects and to support tools that can read .d.ts files. Our goal is to keep these TypeScript definition files updated with each release for any public api.

### Pre-requisites
Before you can begin using these TypeScript definitions with your project, you need to make sure your project meets a few of these requirements:
- Use TypeScript v2.x
- Includes the TypeScript definitions for node. You can use npm to install this by typing the following into a terminal window:

```
npm install --save-dev @types/node
```

### In Node.js
To use the TypeScript definition files within a Node.js project, simply import ask-sdk-core as below:

In a TypeScript file:

```typescript
import * as Runtime from 'ask-sdk-runtime';
```

In a JavaScript file:

```javascript
const Runtime = require('ask-sdk-runtime');
```

## Opening Issues
For bug reports, feature requests and questions, we would like to hear about it. Search the [existing issues](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues) and try to make sure your problem doesn’t already exist before opening a new issue. It’s helpful if you include the version of the SDK, Node.js or browser environment and OS you’re using. Please include a stack trace and reduced repro case when appropriate, too. 

## License
This SDK is distributed under the Apache License, Version 2.0, see LICENSE for more information.
