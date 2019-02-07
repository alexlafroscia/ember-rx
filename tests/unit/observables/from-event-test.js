import { module, test } from "qunit";
import { setupScheduler } from "ember-rx/test-support";
import td from "testdouble";
import EmberObject from "@ember/object";
import Evented from "@ember/object/evented";
import { fromEvent } from "ember-rx";

class Dummy extends EmberObject.extend(Evented) {}

module("Unit | Observables | fromEvent", function(hooks) {
  setupScheduler(hooks);

  test("it emits events when a property changes", function(assert) {
    const instance = Dummy.create();

    const observer = td.function();
    fromEvent(instance, "foo").subscribe(observer);

    instance.trigger("foo", "bar");
    instance.trigger("foo", "bax");

    assert.verify(observer("bar"), "Called for the first event");
    assert.verify(observer("bax"), "Called for the second eventt");
  });

  test("no longer emits events for changes after unsubscribe", function(assert) {
    const instance = Dummy.create();

    const observer = td.function();
    const subscription = fromEvent(instance, "foo").subscribe(observer);

    instance.trigger("foo", "bar");

    subscription.unsubscribe();

    instance.trigger("foo", "bax");

    assert.verify(observer("bar"), "Called for the first event");
    assert.verify(
      observer("bax"),
      { times: 0 },
      "Not called for the second event"
    );
  });

  test("it removed the listener when unsubscribing", function(assert) {
    const instance = Dummy.create();
    const off = td.replace(instance, "off");

    const observer = td.function();
    const subscription = fromEvent(instance, "foo").subscribe(observer);

    subscription.unsubscribe();

    assert.verify(
      off("foo", instance, td.matchers.isA(Function)),
      "Removes the event listener when unsubscribing"
    );
  });
});
