import { module, test } from "qunit";
import { setupScheduler } from "ember-rx/test-support";
import EmberObject from "@ember/object";
import { subscribe } from "ember-rx";

module("Unit | Decorator | subscribe", function(hooks) {
  setupScheduler(hooks);

  class SomeClass extends EmberObject {
    @subscribe("observable") lastValue;
  }

  test("it emits the most recent value from an observable", async function(assert) {
    this.scheduler.run(helpers => {
      const i = SomeClass.create({
        observable: helpers.cold("--a--b|", {
          a: 1,
          b: 2
        })
      });

      assert.equal(i.lastValue, undefined, "Initially produces `undefined`");

      this.scheduler.advanceTo(2);

      assert.equal(i.lastValue, 1, "Produces the first value");

      this.scheduler.advanceTo(5);

      assert.equal(i.lastValue, 2, "Produces the second value");
    });
  });

  test("it can use a default value before an event is emitted", async function(assert) {
    class SomeClassWithDefault extends EmberObject {
      @subscribe("observable")
      lastValue = "replacement initial value";
    }

    this.scheduler.run(helpers => {
      const i = SomeClassWithDefault.create({
        observable: helpers.cold("--a--b|", {
          a: 1,
          b: 2
        })
      });

      assert.equal(
        i.lastValue,
        "replacement initial value",
        "Uses given initial value"
      );

      this.scheduler.advanceTo(2);

      assert.equal(i.lastValue, 1, "Replaces the given initial value");
    });
  });

  test("it can handle the dependent observable being replaced", function(assert) {
    this.scheduler.run(helpers => {
      const i = SomeClass.create({
        observable: helpers.cold("a|", {
          a: 1
        })
      });

      helpers.flush();

      assert.equal(i.lastValue, 1, "Got a value from the first observable");

      i.set(
        "observable",
        helpers.cold("b|", {
          b: 2
        })
      );

      helpers.flush();

      assert.equal(i.lastValue, 2, "Got a value from the second observable");
    });
  });

  module("unsubscribing from the observable", function() {
    test("it does not un-subscribe when the value changes", function(assert) {
      this.scheduler.run(helpers => {
        const i = SomeClass.create({
          observable: helpers.cold("--a--b", {
            a: 1,
            b: 2
          })
        });

        helpers.flush();

        assert.equal(
          i.observable.subscriptions[0].unsubscribedFrame,
          Infinity,
          "Did not unsubscribe from the observable"
        );
      });
    });

    test("it un-subscribes when the observable is replaced", function(assert) {
      this.scheduler.run(helpers => {
        const i = SomeClass.create({
          observable: helpers.cold("--a--b", {
            a: 1,
            b: 2
          })
        });

        this.scheduler.advanceTo(2);

        const originalObservable = i.observable;

        i.set(
          "observable",
          helpers.cold("c", {
            c: 3
          })
        );

        assert.equal(
          originalObservable.subscriptions[0].unsubscribedFrame,
          2,
          "Un-subscribed from the original observable"
        );
      });
    });

    test("it un-subscribes when the object is destroyed", function(assert) {
      this.scheduler.run(helpers => {
        const i = SomeClass.create({
          observable: helpers.cold("--a--b", {
            a: 1,
            b: 2
          })
        });

        this.scheduler.flush();

        i.willDestroy();

        assert.equal(
          i.observable.subscriptions[0].unsubscribedFrame,
          5,
          "Unsubscribed from the observable"
        );
      });
    });
  });
});
