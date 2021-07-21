# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.11.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.10.2...v2.11.0) (2021-07-21)

**Note:** Version bump only for package ask-sdk-express-adapter





## [2.10.2](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.10.0...v2.10.2) (2021-03-16)


### Bug Fixes

* deprecate ssl-root-cas and switch to use tls.rootCertificates to… ([#686](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/686)) ([8217a3f](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/8217a3f38ce1cba9d6b5b9d2488902cf12322cb7))





# [2.10.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.9.0...v2.10.0) (2020-10-08)


### Bug Fixes

* fix the github action workflow and compilation making relative require fail issue ([#658](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/658)) ([895c88e](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/895c88e8bd875488a62966680a3d9d8eb2bcd9ea))
* update rootDir to point to the right root dir in tsconfig file in tst ([66ca284](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/66ca284e13ed1dc881a13d69a399035eb4725e28))
* Updated all packages .npmignore files ([de76a18](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/de76a18bcd21c6a411ddd72a09064e6d8b00c6ae))
* Updated all packages package.json ([#656](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/656)) ([c27c3e6](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/c27c3e6842834d0fea365613da7f3598955b558f))


### Features

* Add special timestamp verification for skill event requests ([#651](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/651)) ([9b0dd9f](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/9b0dd9fbd0169e140be09ed3dfda2e30772dd0af))
* eslint migration and fixes, github actions workflows and updates on package.json for ask-sdk-express-adapter ([e944476](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/e94447697fe0b93f7dc35bd201ac40b02ec7a811))
* Update root package.json to fix doc generation ([4bf482b](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/4bf482bb889fc9b93ad8d0afe8725862c5690f24))





# Change Log

# 2.1.0 (2020-05-07)

This release contains the following changes : 

- Add certificate chain validation by using node-forge pacakge.

# 2.0.1 (2020-01-22)

This release contains the following changes : 

- Case-insensitive header value retrieval for request verification. [604](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/604)
