# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.5.0"></a>
# [0.5.0](https://github.com/alexlafroscia/ember-rx/compare/v0.4.0...v0.5.0) (2019-02-08)


### Bug Fixes

* rename `fromEvent` helper function ([64b4b95](https://github.com/alexlafroscia/ember-rx/commit/64b4b95))
* use correct instance variable in `[@subscribe](https://github.com/subscribe)` example ([7f34727](https://github.com/alexlafroscia/ember-rx/commit/7f34727))


### Features

* add scheduler for Run Loop ([9a040fa](https://github.com/alexlafroscia/ember-rx/commit/9a040fa))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/alexlafroscia/ember-rx/compare/v0.3.1...v0.4.0) (2019-02-07)


### Bug Fixes

* avoid sharing values between instances with `subscribe` ([9aab01e](https://github.com/alexlafroscia/ember-rx/commit/9aab01e))


### Features

* add `fromEvent` observable ([05582f3](https://github.com/alexlafroscia/ember-rx/commit/05582f3))
* allow a callback to the `subscribe` decorator ([7ab8394](https://github.com/alexlafroscia/ember-rx/commit/7ab8394))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/alexlafroscia/ember-rx/compare/v0.3.0...v0.3.1) (2019-02-05)


### Bug Fixes

* unsubscribe from decorator when the object is destroyed ([1abd5fb](https://github.com/alexlafroscia/ember-rx/commit/1abd5fb))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/alexlafroscia/ember-rx/compare/v0.2.0...v0.3.0) (2019-01-30)


### Features

* **deps:** upgrade to latest release of RxJS ([7fddd46](https://github.com/alexlafroscia/ember-rx/commit/7fddd46))



<a name="0.2.0"></a>

# [0.2.0](https://github.com/alexlafroscia/ember-rx/compare/v0.1.0...v0.2.0) (2019-01-29)

### Bug Fixes

- remove original source of `subscribe` decorator ([a0d5959](https://github.com/alexlafroscia/ember-rx/commit/a0d5959))

### Features

- add observable source from property changes ([6b66b92](https://github.com/alexlafroscia/ember-rx/commit/6b66b92)), closes [#1](https://github.com/alexlafroscia/ember-rx/issues/1)
- add utility for getting the first value as a Promise ([f6ac06d](https://github.com/alexlafroscia/ember-rx/commit/f6ac06d)), closes [#3](https://github.com/alexlafroscia/ember-rx/issues/3)

<a name="0.1.0"></a>

# 0.1.0 (2019-01-28)

### Features

- add decorator for subscribing to an observable ([949039a](https://github.com/alexlafroscia/ember-rx/commit/949039a))
- add helper subscribes to observable ([f92e65a](https://github.com/alexlafroscia/ember-rx/commit/f92e65a))
- add route base class for observable models ([29f7c7a](https://github.com/alexlafroscia/ember-rx/commit/29f7c7a))
