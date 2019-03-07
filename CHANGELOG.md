# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
