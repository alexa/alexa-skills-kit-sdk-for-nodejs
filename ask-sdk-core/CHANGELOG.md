# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.8.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.7.0...v2.8.0) (2020-04-01)


### Bug Fixes

* Export LambdaHandler type definition ([#615](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/615)) ([e4c2eaa](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/e4c2eaa857537c82ac909c3be09bc52d9a74a035))
* extend tslint test to cover all test files ([#588](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/588)) ([b142590](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/b142590b2d07ff141e599ee63129d81c71aa0f1c))
* fixed one type definition and some doc issues  ([#583](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/583)) ([5cc2576](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/5cc257648a8aa6cbbaca65daac8a27d02ebbc89d))


### Features

* add new util function (getRequest) ([#582](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/582)) ([a618ba9](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/a618ba92c30d1ffb0590d21d8ee6cf7e1e11ac15))
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


### Features

* add deleteAttributes to PersistenceAdapter interface and deletePersistentAttributes to AttributesManager interface ([#507](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/507)) ([e7409f1](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/e7409f1))
* add playbehavior support to response builder ([#515](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/515)) ([7a51f29](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/7a51f29))





# [2.3.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.2.0...v2.3.0) (2018-11-05)


### Features

* add support for CanFulfillIntentRequest ([f38c3d0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/f38c3d0))





# [2.2.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.1.0...v2.2.0) (2018-10-30)


### Features

* add support for Alexa Presentation Language (APL) ([bcdfec8](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/bcdfec8))





<a name="2.1.0"></a>
# [2.1.0](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.0.10...v2.1.0) (2018-10-04)


### Features

* SDK structure update ([3f52c59](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/3f52c59))




<a name="2.0.10"></a>
## [2.0.10](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.0.9...v2.0.10) (2018-09-25)




**Note:** Version bump only for package ask-sdk-core

<a name="2.0.9"></a>
## [2.0.9](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.0.8...v2.0.9) (2018-09-10)




**Note:** Version bump only for package ask-sdk-core

<a name="2.0.7"></a>
## [2.0.7](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.0.6...v2.0.7) (2018-06-22)


### Bug Fixes

* update attributes persistence behavior of ask-sdk-v1adapter ([51432df](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/51432df)), closes [#414](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/issues/414)




<a name="2.0.5"></a>
## [2.0.5](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/compare/v2.0.4...v2.0.5) (2018-05-16)


### Bug Fixes

* update execution behavior of interceptor ([352f638](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/commit/352f638))
