# Run Loop Scheduler

RxJS has the concept of a [Scheduler][rxjs-scheduler], which is can use to queue work that should happen sometime in the future. Many Observables or Operators that deal with "time" can take accept a Scheduler as an argument if you need to customize how this work is planned.

Ember also has a means for scheduling tasks in the future; the [Run Loop][run-loop]. In order to schedule events from RxJS into the Run Loop, you can leverage the scheduler provided by `ember-rx`.

```javascript
import { scheduler as runLoopScheduler } from "ember-rx";
import { interval } from "rxjs";

const observable = interval(1000, runLoopScheduler);
const subscription = observable.subscribe(val => {
  // Each emission from `interval` will be scheduled into a Run Loop
  console.log(value);
});

// Unsubscribing will cancel any scheduled-but-not-run Run Loops
subscription.unsubscribe();
```

[rxjs-scheduler]: https://rxjs.dev/guide/scheduler
[run-loop]: https://guides.emberjs.com/release/applications/run-loop/
