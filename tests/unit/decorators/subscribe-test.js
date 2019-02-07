import { module, test } from "qunit";
import { setupScheduler } from "ember-rx/test-support";
import EmberObject from "@ember/object";
import Evented from "@ember/object/evented";
import { fromEvent, subscribe } from "ember-rx";

module("Unit | Decorator | subscribe", function(hooks) {
  setupScheduler(hooks);

  test("validating the argument", function(assert) {
    assert.throws(function() {
      class SomeClass extends EmberObject {
        @subscribe() noArgument;
      }

      SomeClass.create();
    }, "Throws when nothing is provided");

    assert.throws(function() {
      class SomeClass extends EmberObject {
        @subscribe(null) noArgument;
      }

      SomeClass.create();
    }, "Throws when `null` is provided");

    assert.throws(function() {
      class SomeClass extends EmberObject {
        @subscribe(1) noArgument;
      }

      SomeClass.create();
    }, "Throws when a number is provided");

    assert.throws(function() {
      class SomeClass extends EmberObject {
        @subscribe({ foo: "bar" }) noArgument;
      }

      SomeClass.create();
    }, "Throws when an object is provided");
  });

  module("property", function() {
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

  module("function", function() {
    test("it can subscribe to an observable returned from the function", function(assert) {
      class SomeClass extends EmberObject.extend(Evented) {
        @subscribe(i => fromEvent(i, "foo"))
        lastValue;
      }

      const instance = SomeClass.create();

      assert.equal(
        instance.lastValue,
        undefined,
        "Value is undefined before the observable emits a value"
      );

      instance.trigger("foo", "foo");

      assert.equal(
        instance.lastValue,
        "foo",
        "Value matches the first emitted value"
      );

      instance.trigger("foo", "bar");

      assert.equal(
        instance.lastValue,
        "bar",
        "Value matches the next emitted value"
      );
    });

    test("it binds the callback to the instance", function(assert) {
      class SomeClass extends EmberObject.extend(Evented) {
        @subscribe(function() {
          return fromEvent(this, "foo");
        })
        lastValue;
      }

      const instance = SomeClass.create();
      instance.trigger("foo", "foo");

      assert.equal(instance.lastValue, "foo", "Listened to the event");
    });

    test("can provide a default value before the observable emits a value", function(assert) {
      class SomeClass extends EmberObject.extend(Evented) {
        @subscribe(i => fromEvent(i, "foo"))
        lastValue = "initial value";
      }

      const instance = SomeClass.create();

      assert.equal(
        instance.lastValue,
        "initial value",
        "Used the initial value"
      );

      instance.trigger("foo", "foo");

      assert.equal(
        instance.lastValue,
        "foo",
        "Received a new value from the observable"
      );
    });
  });
});
