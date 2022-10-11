# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="5.1.2"></a>
## [5.1.2](https://github.com/ember-cli/ember-ajax/compare/v5.1.1...v5.1.2) (2022-10-11)


### Bug Fixes

* resolve `ember-polyfills.deprecate-assign` deprecation warnings ([5175d40](https://github.com/ember-cli/ember-ajax/commit/5175d40))



<a name="5.0.0"></a>
## [5.0.0](https://github.com/ember-cli/ember-ajax/compare/v4.0.2...v5.0.0) (2019-03-05)


### Breaking Changes

- Update `ember-cli-babel` to v7.x
  (this requires apps to use Ember CLI 2.13 or above)

- Extend the native `Error` class instead of `EmberError`
  (fixes compatibility with Ember 3.8)

- Drop Node 4 from `engines` declaration in `package.json`
  (CI had already been running on Node 6 for a while already)


### Bug Fixes

- Restore ability to override the `ajax` service using a JS file


### Documentation

- Add "Compatibility" section to the `README` file


<a name="4.0.2"></a>
## [4.0.2](https://github.com/ember-cli/ember-ajax/compare/v4.0.1...v4.0.2) (2019-01-07)


### Bug Fixes

* **deprecation:** the new EmberObject is deprecated ([80e6e15](https://github.com/ember-cli/ember-ajax/commit/80e6e15))



<a name="4.0.1"></a>
## [4.0.1](https://github.com/ember-cli/ember-ajax/compare/v4.0.0...v4.0.1) (2018-12-10)



<a name="4.0.0"></a>
# [4.0.0](https://github.com/ember-cli/ember-ajax/compare/v3.1.2...v4.0.0) (2018-10-23)



<a name="3.1.2"></a>
## [3.1.2](https://github.com/ember-cli/ember-ajax/compare/v3.1.1...v3.1.2) (2018-10-09)


### Bug Fixes

* bump typescript to get working d.ts ([975724d](https://github.com/ember-cli/ember-ajax/commit/975724d)), closes [#388](https://github.com/ember-cli/ember-ajax/issues/388)
* is*Error type definitions ([101c357](https://github.com/ember-cli/ember-ajax/commit/101c357))
* skip instead of returning url when namespace is present in url ([fe518dc](https://github.com/ember-cli/ember-ajax/commit/fe518dc))



Changes for each version can be found as part of the [release notes on Github](https://github.com/ember-cli/ember-ajax/releases).
