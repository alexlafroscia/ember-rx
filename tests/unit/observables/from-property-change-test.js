import { module, test } from "qunit";
import { setupScheduler } from "ember-observable/test-support";
import td from "testdouble";
import EmberObject from "@ember/object";
import { fromPropertyChange } from "ember-observable";

class Dummy extends EmberObject {
  foo = "foo";
}

module("Unit | Observables | fromPropertyChange", function(hooks) {
  setupScheduler(hooks);

  test("it emits events when a property changes", function(assert) {
    const instance = Dummy.create();

    const observer = td.function();
    fromPropertyChange(instance, "foo").subscribe(observer);

    instance.set("foo", "bar");
    instance.set("foo", "bax");

    assert.verify(observer("bar"), "Called for the first change");
    assert.verify(observer("bax"), "Called for the second change");
  });

  test("no longer emits events for changes after unsubscribe", function(assert) {
    const instance = Dummy.create();

    const observer = td.function();
    const subscription = fromPropertyChange(instance, "foo").subscribe(
      observer
    );

    instance.set("foo", "bar");

    subscription.unsubscribe();

    instance.set("foo", "bax");

    assert.verify(observer("bar"), "Called for the first change");
    assert.verify(
      observer("bax"),
      { times: 0 },
      "Not called for the second change"
    );
  });
});
