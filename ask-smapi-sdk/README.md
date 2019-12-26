# ASK SMAPI SDK - Alexa Skills Management API Node.js Library

`ask-smapi-sdk` is a library for Alexa Skills Kit's Skill Management APIs (SMAPI).
Learn more about SMAPI by reviewing the SMAPI [documentation](https://developer.amazon.com/docs/smapi/smapi-overview.html).

## Getting Started

### Install NPM and the ASK CLI

1. Install NPM using the instructions provided [here](https://www.npmjs.com/get-npm). This is needed to get started with the ASK CLI, which will be used to generate Login with Amazon tokens you will need to access SMAPI.
2. Install [ask-cli](https://www.npmjs.com/package/ask-cli).

### Generate LWA (Login with Amazon) Keys

1. Create a new security profile for your Amazon Developer account by following the instructions provided [here](https://developer.amazon.com/docs/smapi/ask-cli-command-reference.html#generate-lwa-tokens).
This will generate `Client ID` and `Client Secret` keys.
2. Using the ASK CLI, run: `ask util generate-lwa-tokens`. You will be asked to provide the `Client ID` and `Client Secret` keys from the previous step. 
This will return the following JSON with a `Refresh Token`:



``` sh
{
  "access_token": "ACCESS_TOKEN",
  "refresh_token": "REFRESH_TOKEN",
  "token_type": "bearer",
  "expires_in": 3600,
  "expires_at": "2019-11-19T20:25:06.584Z"
}
```

## Usage Examples

### Install ASK SMAPI SDK from NPM

``` sh
$ npm install ask-smapi-sdk
```

### Configure SMAPI Client
Using the `Client ID`, `Client Secret` and `Refresh Token` retrieved in the previous step to configure a new SMAPI client:

#### For Node.js
```js
const Alexa = require('ask-smapi-sdk');

// specify the refreshTokenConfig with clientId, clientSecrect and refreshToken generated in the previous step
const refreshTokenConfig = {
    clientId,
    clientSecrect, 
    refreshToken
}
const smapiClient = new Alexa.StandardSmapiClientBuilder()
    .withRefreshTokenConfig(refreshTokenConfig)
    .client();
```

#### For typescript
```ts
import * as Alexa from 'ask-smapi-sdk';

// specify the refreshTokenConfig with clientId, clientSecrect and refreshToken generated in the previous step
const refreshTokenConfig : Alexa.RefreshTokenConfig = {
    clientId,
    clientSecrect, 
    refreshToken
}
const smapiClient = new Alexa.StandardSmapiClientBuilder()
    .withRefreshTokenConfig(refreshTokenConfig)
    .client();
```

### List Skills
``` js
# To only retrieve response body
smapiClient.listSkillsForVendorV1(vendorId)
    .then((response) => {
        console.log(JSON.stringify(response));
    })
    .catch((err) => {
        console.log(err.message);
        console.log(JSON.stringify(err.response));
    });
    
# To include response header and status code
smapiClient.callListSkillsForVendorV1(vendorId)
    .then((response) => {
        console.log(response.header);
    })
    .catch((err) => {
        console.log(err.message);
        console.log(JSON.stringify(err.response));
    });
```

### Get Skill Manifest

``` js
smapiClient.getSkillManifestV1(skillId, stage)
    .then((response) => {
        console.log(JSON.stringify(response));
    })
    .catch((err) => {
        console.log(err.message);
        console.log(JSON.stringify(err.response));
    });
```

For the complete list of functions, please see the SMAPI SDK reference documentation.

## Documentatiion

* [SMAPI SDK API Reference Documentation](https://ask-smapi-node-typedoc.s3.amazonaws.com/index.html)
* [SMAPI Documentation](https://developer.amazon.com/docs/smapi/smapi-overview.html)


## Opening Issues
For bug reports, feature requests and questions, we would like to hear about it. Search the [existing issues](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues) and try to make sure your problem doesn’t already exist before opening a new issue. It’s helpful if you include the version of the SDK, Node.js or browser environment and OS you’re using. Please include a stack trace and reduced repro case when appropriate, too. 

## License
This SDK is distributed under the Apache License, Version 2.0, see LICENSE for more information.