import { module, test } from "qunit";
import td from "testdouble";
import { getSettledState, settled } from "@ember/test-helpers";
import { defer } from "rsvp";
import { from } from "rxjs";
import { delay } from "rxjs/operators";
import { scheduler as runloopScheduler } from "ember-rx";

module("Unit | Scheduler", function() {
  test("it schedules immediate work using the Runloop", async function(assert) {
    const deferred = defer();
    const observable = from(deferred.promise, runloopScheduler);
    const observer = td.function("observer");
    observable.subscribe(observer);

    deferred.resolve("resolution");

    const state = getSettledState();

    assert.ok(state.hasRunLoop, 'A run loop was started with the "work"');

    assert.verify(
      observer("resolution"),
      { times: 0 },
      "Observer not yet called"
    );

    await settled();

    assert.verify(
      observer("resolution"),
      { times: 1 },
      "Observer called once the runloop has settled"
    );
  });

  module("delayed work", function() {
    test("it schedules later work using the Runloop", async function(assert) {
      const observable = from([1]).pipe(delay(10, runloopScheduler));
      const observer = td.function("observer");
      observable.subscribe(observer);

      const state = getSettledState();

      assert.ok(
        state.hasPendingTimers,
        "Work scheduled for later in the runloop"
      );

      await settled();

      assert.verify(observer(1), "Eventually called with the scheduled work");
    });

    test("it can cancel a scheduled runloop", async function(assert) {
      const observable = from([1]).pipe(delay(10, runloopScheduler));
      const subscription = observable.subscribe(td.function("observer"));

      subscription.unsubscribe();

      const state = getSettledState();

      assert.notOk(state.hasPendingTimers, "Scheduled work has been cancelled");
    });
  });
});
