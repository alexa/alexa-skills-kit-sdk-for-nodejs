# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.14.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.12.1...v2.14.0) (2023-04-03)


### Bug Fixes

* **version:** typescript dependency ([c2756d9](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/c2756d9013c6d135b0f3562d13601a0b16905761))
* **warnings:** removed extraneous spaces ([7ad1651](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/7ad1651f1ef878630ef213dd3460474db592115d))


### Features

* **component-interface:** egress and ingress interface for ac skill components ([41f5102](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/41f51027bd2b81628f4d5485a6bedd67a63b4b4d))
* **delegation:** delegation handler for AC to IM ([06a2b2c](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/06a2b2c87d509bf879aa5a51e4b770bbc4d708b5))





# [2.13.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.12.1...v2.13.0) (2023-04-03)


### Bug Fixes

* **version:** typescript dependency ([c2756d9](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/c2756d9013c6d135b0f3562d13601a0b16905761))
* **warnings:** removed extraneous spaces ([7ad1651](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/7ad1651f1ef878630ef213dd3460474db592115d))


### Features

* **component-interface:** egress and ingress interface for ac skill components ([41f5102](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/41f51027bd2b81628f4d5485a6bedd67a63b4b4d))
* **delegation:** delegation handler for AC to IM ([06a2b2c](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/06a2b2c87d509bf879aa5a51e4b770bbc4d708b5))





## [2.12.1](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.12.0...v2.12.1) (2022-04-01)


### Bug Fixes

* fix a incorrect type declaration ([860b2ad](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/860b2ada5c3da0dcda4ebc9d624066be58b655d7))
* **ask-sdk-core:** type error in util ([a55afab](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/a55afab0f6968da5e5518fc9deed2d376f9810b6)), closes [#709](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/709)





# [2.12.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.11.0...v2.12.0) (2022-01-28)


### Bug Fixes

* lint errors caused on crypto due to node versions upgrade ([61b6c1b](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/61b6c1bc5524ae4732448dfb337911c4da5cf8e3))
* updated node minimum versions for Github Actions and @types/node to fix test failures ([7636f36](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/7636f3628b26af3fce0088105bb4b6738b9299c8))


### Features

* adding A/B testing SPIs to core package ([89cf2ed](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/89cf2ed2216c7c6c7cd4fe2d9dce63aa0c17b36c))





# [2.11.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.10.2...v2.11.0) (2021-07-21)


### Bug Fixes

* updated return type of getDialogState ([ef6b97e](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/ef6b97e9deaeb902856c33e570f56da8a2ff998a))


### Features

* add util function addDirectiveToReprompt ([#694](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/694)) ([fb980db](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/fb980db2daf877bb332323f31a642dd6b325bd05))





## [2.10.2](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.10.0...v2.10.2) (2021-03-16)


### Bug Fixes

* deprecate ssl-root-cas and switch to use tls.rootCertificates to… ([#686](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/686)) ([8217a3f](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/8217a3f38ce1cba9d6b5b9d2488902cf12322cb7))
* export UserAgentManager from core ([#659](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/659)) ([b99d08d](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/b99d08df72e2b2296671d22d3d9bf6c7c030c682))
* update and fix local-debug readme ([#663](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/663)) ([9522e94](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/9522e943a893a815a17e8d3afc73589170b95395))
* update readme for local-debug ([bca8fad](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/bca8fad946d94f9b6d415272b6d7002dd0bc664d))
* update readme to fix skillId spelling ([65f65f0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/65f65f010b96c5284e4ac689a95556bf5290dd12))


### Features

* add access token support ([#673](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/673)) ([9151628](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/915162897f04425fef77498c2003c2e3b6d6216d))
* Adding support for EU and FE ([9f4b177](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/9f4b177573540dd3f159d623b2ec0f9cf766df03))





# [2.10.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.9.0...v2.10.0) (2020-10-08)


### Bug Fixes

* Add .withApiResponse() to ControlResponseBuilder ([#636](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/636)) ([752b17c](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/752b17c53acc7ad8ee5da5811a7945082a9c7e25))
* Addded new line at end of each workflows ([4f562fe](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/4f562fed06d35b65c45f9eb053e01367435db7b2))
* Addded new line at end of tsconfig.json files ([d94a1c6](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/d94a1c656484ca067d82411269283e5d1370d535))
* added commitlint and husky package config for commit rules and removed alexa-apis-for-nodejs reference ([f857438](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/f85743895090ca98813336a174d0e7e75b709b69))
* fix linting violations ([c7e23e7](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/c7e23e733c30edf2f5572516297c7cf6d9dafc28))
* fix the github action workflow and compilation making relative require fail issue ([#658](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/658)) ([895c88e](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/895c88e8bd875488a62966680a3d9d8eb2bcd9ea))
* Fix(controls) launch.json to work out-of-box in vscode ([#637](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/637)) ([24afdf8](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/24afdf87b21357e3a977d4e5ac29475e6060942a))
* removed unused dependencies from ask-sdk-control ([8120f93](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/8120f93916ccd29b86b817c43ae36aad5baea58d))
* throw if createControlTree returns undefined ([d7506e9](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/d7506e962f5f6f041c37e7feb0ec7267d38d96ec))
* Update ask-sdk-core package.json dependencies ([752d6ec](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/752d6ec309f40f42702740a9af7d646b77ea70a3))
* update rootDir to point to the right root dir in tsconfig file in tst ([66ca284](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/66ca284e13ed1dc881a13d69a399035eb4725e28))
* update SMAPI SDK Readme for generate-lwa-tokens usage ([279d96d](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/279d96dc1236bb220a00205c42fde902e2a58657))
* update the script of the mono project ([148fad2](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/148fad253df605fbc1d6c83db11668317cfc9ee5))
* Updated all packages .npmignore files ([de76a18](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/de76a18bcd21c6a411ddd72a09064e6d8b00c6ae))
* Updated all packages package.json ([#656](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/656)) ([c27c3e6](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/c27c3e6842834d0fea365613da7f3598955b558f))
* updated ControlManager responseBuilder type ([1dd13a8](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/1dd13a8d7bf145b7f5fb3026e643b99352390680))
* Updated lerna.json and use installed typedoc module ([a115b58](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/a115b58d54503846e55a6f4dade3ae36c03882dc))
* Windows failures on path separtor issue on ask-sdk-s3-persistence-adapter ([1bd1a15](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/1bd1a15ff20cbf4cba00b886c547bb8adf489199))


### Features

* Add special timestamp verification for skill event requests ([#651](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/651)) ([9b0dd9f](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/9b0dd9fbd0169e140be09ed3dfda2e30772dd0af))
* add UserAgentManager ([bc03b55](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/bc03b554e072f0ea1feffa90fa2486dcbdfcc9db))
* Adding individual workflows to be triggered on subdir changes ([c5eb69f](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/c5eb69fa487d03e7e96214c878d8f71d6a62de75))
* eslint migration and fixes, git workflows and updates on package.json for ask-sdk-dynamodb-persistence-adapter ([0e29817](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/0e298173e168e7625ae96027bfc9299a85b3283d))
* eslint migration and fixes, git workflows and updates on package.json for ask-sdk-runtime ([7265239](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/7265239581fe7aa0654f5b095f86482a60499b0a))
* eslint migration and fixes, git workflows and updates on package.json for ask-sdk-s3-persistence-adapter ([2789886](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/27898865f9f761225ca1fb1e8f0a69ef385f4dc0))
* eslint migration and fixes, github actions workflows and updates on package.json for ask-sdk ([89560a6](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/89560a6bf77f514fdb7a054a49654b20362b40f7))
* eslint migration and fixes, github actions workflows and updates on package.json for ask-sdk-express-adapter ([e944476](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/e94447697fe0b93f7dc35bd201ac40b02ec7a811))
* eslint migration and fixes, github actions workflows and updates on package.json for ask-sdk-v1adapter ([a76053a](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/a76053aa4fe72f69f173c639dfafe6a85ea6031c))
* eslint migration and fixes, github actions workflows and updates on package.json for ask-smapi-sdk ([4d3f9b2](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/4d3f9b217c553856f2c2f61990e4939625a32ceb))
* Update root package.json to fix doc generation ([4bf482b](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/4bf482bb889fc9b93ad8d0afe8725862c5690f24))





# [2.9.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.8.0...v2.9.0) (2020-07-22)


### Bug Fixes

* add chai as runtime dependency and add changelog ([dffba0f](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/dffba0f2ef2b0928ce90339586609507aea14209))
* change return type to CustomSmapiClientBuilder to fix casting issue ([#625](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/625)) ([3243768](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/324376875a908dbc205e28abddabcbc7a945e168))
* general fix on some typo and lint issues ([#633](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/633)) ([11ce407](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/11ce407b7c52f4365d9d92b4358c50c9885a8a73))
* remove readme from api doc ([655f94f](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/655f94f35b6260703d9161bb5098f1f736166d07))
* removing jsonpath dependency for ask-smapi-sdk([#624](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/624)) ([19c3cc1](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/19c3cc11a51b66ba5fcfa0c90be4c8b2b396d9b0))
* typo in readme for configure client code in ask-smapi-sdk ([#631](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/631)) ([10cf6d6](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/10cf6d615c5046825ee3bdc2edf524290212a597))


### Features

* add a defaultAttributes parameter in getPersistentAttributes ([#626](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/626)) ([5372544](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/5372544892079994978ff317dc580b2d9c4d220c))
* add ask-sdk-controls package ([fb7387c](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/fb7387cda25578102e3aee85c8a66655a7442f97))
* add ask-sdk-local-debug package ([a7c22a9](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/a7c22a965362b3173ce123d8e67d0f8b424c3b15))
* add support for custom lwa endpoint ([#617](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/617)) ([839f4ae](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/839f4ae3904bb538c5dbedd2fddbfdde5d6a2f66))





# [2.8.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.7.0...v2.8.0) (2020-04-01)


### Bug Fixes

* Export LambdaHandler type definition ([#615](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/615)) ([e4c2eaa](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/e4c2eaa857537c82ac909c3be09bc52d9a74a035))
* extend tslint test to cover all test files ([#588](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/588)) ([b142590](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/b142590b2d07ff141e599ee63129d81c71aa0f1c))
* fixed one type definition and some doc issues  ([#583](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/583)) ([5cc2576](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/5cc257648a8aa6cbbaca65daac8a27d02ebbc89d))
* Retrieve case-insensitive header values ([#605](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/605)) ([15fe574](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/15fe5744522c216adb3f740a64c60d3fe8adb594))
* update lerna.json ([4ebcf92](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/4ebcf9295ecf0fdc5ca937bba4aaf330365c92dc))


### Features

* add express adapter package ([#576](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/576)) ([5822660](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/5822660bf6914a9aac60cde55e18542b3080de93))
* add new util function (getRequest) ([#582](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/582)) ([a618ba9](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/a618ba92c30d1ffb0590d21d8ee6cf7e1e11ac15))
* Add Person ID partition key generator ([#593](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/593)) ([59002f4](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/59002f423a13fe3d59e7882d013bde40501d3f79))
* Adding ask-smapi-sdk ([#596](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/596)) ([e1ec8cd](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/e1ec8cdb3cee763768667c7468ce4ce68862c0ee))
* Implement model introspector ([#612](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/612)) ([cb57328](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/cb57328855b6095cfae5ed28cfc1f06a097e60be))
* optionally allow passing a boolean to getPersistentAttributes to cont… ([#547](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/547)) ([e62421c](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/e62421c404a5b881a613c39c8766e7d152053a34))





# [2.7.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.6.0...v2.7.0) (2019-08-01)


### Bug Fixes

* change the getSlotValue util function to return null when slot is not present ([#573](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/573)) ([1321407](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/1321407))
* export getUserId() at index.ts of both ask-sdk-core and ask-sdk([#561](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/561)) ([b4b0980](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/b4b0980))
* fixing the comment for getSlotValue util function ([#567](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/567)) ([89173bc](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/89173bc))


### Features

*  Add TypeScript Generics on the getSessionAttributes Method ([#554](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/554)) ([0824495](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/0824495))
* add appendAdditionalUserAgent function to customSkill in ask-sdk-core ([#575](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/575)) ([7bbd7a6](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/7bbd7a6))





# [2.6.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.5.2...v2.6.0) (2019-05-29)


### Features

* add getUserId util function ([f898423](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/f898423))
* Add support for the HUB_LANDSCAPE_SMALL (Echo Show 5) viewport ([#557](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/557)) ([707b0b2](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/707b0b2))





## [2.5.2](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.5.1...v2.5.2) (2019-04-24)


### Bug Fixes

* update getDeviceId to check for optional device field ([#535](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/535)) ([884a904](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/884a904)), closes [#532](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/532)





## [2.5.1](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.5.0...v2.5.1) (2019-03-08)


### Bug Fixes

* remove response factory auto escape xml character behavior. ([31ce953](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/31ce953))





# [2.5.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.4.0...v2.5.0) (2019-03-07)


### Bug Fixes

* update peer dependency of ask-sdk-model ([#526](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/526)) ([9167297](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/9167297))


### Features

* add RequestEnvelopeUtils functions ([#525](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/525)) ([14be7a8](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/14be7a8))
* auto escape invalid SSML characters ([#522](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/522)) ([7a4f215](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/7a4f215)), closes [#472](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/472)





# [2.4.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.3.0...v2.4.0) (2019-02-21)


### Bug Fixes

* update to fix a build error casued by 'aws-sdk-mock' breaking changes ([f3e380c](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/f3e380c))


### Features

* add deleteAttributes to PersistenceAdapter interface and deletePersistentAttributes to AttributesManager interface ([#507](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/507)) ([e7409f1](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/e7409f1))
* add playbehavior support to response builder ([#515](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/515)) ([7a51f29](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/7a51f29))





# [2.3.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.2.0...v2.3.0) (2018-11-05)


### Features

* add support for CanFulfillIntentRequest ([f38c3d0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/f38c3d0))





# [2.2.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.1.0...v2.2.0) (2018-10-30)


### Features

* This release adds support for APL (Public Beta). The Alexa Presentation Language (APL) enables you to build interactive voice experiences that include graphics, images, slideshows, and to customize them for different device types. ([bcdfec8](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/bcdfec8))





<a name="2.1.0"></a>
# [2.1.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.0.10...v2.1.0) (2018-10-04)


### Features

* add option to configure file name prefix in s3 persistence apdater([#467](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/467)) ([10780e0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/10780e0))
* SDK structure update ([3f52c59](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/3f52c59))




<a name="2.0.10"></a>
## [2.0.10](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.0.9...v2.0.10) (2018-09-25)


### Bug Fixes

* add ask-sdk-s3-persistence-adapter to tsconfig.json ([85aba3a](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/85aba3a))
* handle locale not being present in v1 adapter ([03321ef](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/03321ef))




<a name="2.0.9"></a>
## [2.0.9](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.0.8...v2.0.9) (2018-09-10)


### Bug Fixes

* enable consistent read on dynamodb get operation ([0c205f7](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/0c205f7))
* update aws-sdk-mock dependency ([ae26da4](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/ae26da4))




<a name="2.0.8"></a>
## [2.0.8](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.0.7...v2.0.8) (2018-07-30)


### Bug Fixes

* CreateStateHandler incorrectly update function key ([dcec7e6](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/dcec7e6)), closes [#438](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/438)




<a name="2.0.7"></a>
## [2.0.7](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.0.6...v2.0.7) (2018-06-22)


### Bug Fixes

* update attributes persistence behavior of ask-sdk-v1adapter ([51432df](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/51432df)), closes [#414](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/414)




<a name="2.0.6"></a>
## [2.0.6](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.0.5...v2.0.6) (2018-06-12)


### Bug Fixes

* make auto create table behavior more consistent ([fa826e4](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/fa826e4))




<a name="2.0.5"></a>
## [2.0.5](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.0.4...v2.0.5) (2018-05-16)


### Bug Fixes

* update execution behavior of interceptor ([352f638](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/352f638))
