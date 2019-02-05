# Introduction

`ember-rx` serves to provide a suite of Ember utilities for working with Observables. Specifically, it provides this functionality through integration with [RxJS][rxjs].

## Installation

You can install `ember-rx` by doing the following:

```bash
yarn add ember-rx
```

`ember-rx` allows you to import RxJS version 6 as well, thanks to [`ember-auto-import`][ember-auto-import]. The following should "just work" in your app!

```javascript
import { Observable } from "rxjs";
```

[rxjs]: https://rxjs.dev/
[ember-auto-import]: https://github.com/ef4/ember-auto-import
