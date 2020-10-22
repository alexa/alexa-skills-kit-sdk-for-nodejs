# ASK SDK Local Debug (Node.js)

ASK SDK Local Debug enables you to test your skill code locally against your skill invocations by routing requests to your developer machine. This enables you to verify changes quickly to skill code as you can test without needing to deploy skill code to Lambda.

> **NOTE:** If you have an Alexa developer account in a region outside of [North America](https://developer.amazon.com/en-US/docs/alexa/custom-skills/develop-skills-in-multiple-languages.html#h2-multiple-endpoints), there are additional prerequisites before you can test your local skill. Complete the instructions in the document [Setting Up Local Debugging in Other Regions](https://github.com/alexa/ask-toolkit-for-vscode/wiki/Setting-Up-Local-Debugging-In-Other-Regions), and then continue with the instructions that follow here.

## Installation

In your skill code folder (e.g. `lambda`), install the following dependencies along with rest of the dependencies in your package.json
```bash
npm install --save ask-sdk-model@^1.28.1
npm install --save-dev ask-sdk-local-debug
```

## Configuration

### Using with Alexa Skills Toolkit for VS Code

The [Alexa Skills Toolkit for Visual Studio](https://developer.amazon.com/en-US/docs/alexa/ask-toolkit/get-started-with-the-ask-toolkit-for-visual-studio-code.html) offers integrated support for local debugging. To get started, please review our technical documentation on how to [Test your local Alexa skill](https://developer.amazon.com/en-US/docs/alexa/ask-toolkit/vs-code-ask-skills.html#test) using VS Code.

> **NOTE:** If you have existing an ASK CLI profile, you will need to sign in again using the latest version of ASK CLI (>=2.13). Once installed, re-run `ask configure` to re-authorize your profile for local debugging.

### Using with other IDEs and Debuggers

1. To instantiate a connection to the local debugging service, execute the following from your skill’s `lambda` directory:
      ```bash
      node ./node_modules/ask-sdk-local-debug/dist/LocalDebuggerInvoker.js 
            --accessToken <ACCESS_TOKEN>
            --skillId <SKILL_ID>
            --skillEntryFile <FILE_NAME>
            --handlerName <HANDLER_NAME>
      ```
      * `ACCESS_TOKEN`:
          1. Install ASK CLI v2: `npm install ask-cli@2 -g`
          2. Generate the access token using ASK CLI: `ask util generate-lwa-tokens --scopes alexa::ask:skills:debug`
          3. You will be directed to a Login with Amazon page. Sign in and retrieve your `ACCESS_TOKEN` from the terminal.
      * `SKILL_ID`: The ID of the skill you are attempting to test or debug. Ensure that the developer account you used to generate the access token has access to this skill.
      * `FILE_NAME`: The path to your skill code's main file (typically `index.js`). This file or module contains the skill's handler function.
      * `HANDLER_NAME`: The exported handler method (typically `handler`). For an example, please see the [Hello world sample skill](https://github.com/alexa/skill-sample-nodejs-hello-world/blob/master/lambda/custom/index.js#L159). 

2. Configure your preferred IDE or other debugging tool to attach to the above process or execute directly from your preferred IDE. For example, in VS Code, the following would be included in a project's `launch.json`:
      ```json
      {
           "type": "node",
           "request": "launch",
           "name": "Skill Debug",
           "program": "${workspaceFolder}/lambda/node_modules/ask-sdk-local-debug/dist/LocalDebuggerInvoker.js",
           "args": [
                "--accessToken","<ACCESS_TOKEN>",
                "--skillId", "<SKILL_ID>",
                "--skillEntryFile", "<FILE_NAME>",
                "--handlerName" , "<HANDLER_NAME>"
            ]
      }
      ```

## Things to note

1. Local debugging is only available for a skill’s **`development`** stage.
2. A connection remains active for **1 hour**. You will need to reinstantiate the connection after this time.
3. All Alexa requests for the skill will be routed to your development machine while the connection is active. 
4. Only one connection session may be active for a given skill ID and developer account.

## Opening Issues

For bug reports, feature requests and questions, we would like to hear about it. Search the [existing issues](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues) and try to make sure your problem doesn’t already exist before opening a new issue. It’s helpful if you include the version of the SDK, Node.js or browser environment and OS you’re using. Please include a stack trace and reduced repro case when appropriate, too.

## License

This SDK is distributed under the Apache License, Version 2.0, see LICENSE for more information.
