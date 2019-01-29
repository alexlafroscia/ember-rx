import { module, test } from "qunit";
import { setupScheduler } from "ember-observable/test-support";
import td from "testdouble";
import { firstToPromise } from "ember-observable";
import { Promise as RSVPPromise } from "rsvp";

module("Unit | Utils | firstToPromise", function(hooks) {
  setupScheduler(hooks);

  test("it returns an RSVP promise", function(assert) {
    const observable = this.scheduler.createHotObservable("--a--b|", {
      a: 1,
      b: 2
    });

    const [promise] = firstToPromise(observable);

    assert.ok(promise instanceof RSVPPromise, "Returns an RSVP Promise");
  });

  test("the promise resolves to the first value", async function(assert) {
    const observable = this.scheduler.createHotObservable("--a--b|", {
      a: 1,
      b: 2
    });

    const [promise] = firstToPromise(observable);

    this.scheduler.flush();

    assert.equal(await promise, 1, "Promise resolved to the first value");
  });

  test("the observable emits subsequent values", function(assert) {
    const observable = this.scheduler.createHotObservable("--a--b|", {
      a: 1,
      b: 2
    });

    const observer = td.function();
    const rest = firstToPromise(observable)[1];

    rest.subscribe(observer);

    this.scheduler.flush();

    assert.verify(observer(2), "Observable emited the second value");
    assert.verify(
      observer(),
      { ignoreExtraArgs: true, times: 1 },
      "Observable did not emit any other values"
    );
  });
});
