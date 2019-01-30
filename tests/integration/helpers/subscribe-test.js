import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { setupScheduler } from "ember-rx/test-support";
import { render, clearRender } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import td from "testdouble";

module("Integration | Helper | subscribe", function(hooks) {
  setupRenderingTest(hooks);
  setupScheduler(hooks);

  hooks.beforeEach(function() {
    this.set(
      "observable",
      this.scheduler.createColdObservable("a--b", {
        a: "Some Value",
        b: "New Value"
      })
    );
  });

  test("it emits values from the observable", async function(assert) {
    await render(hbs`
      {{subscribe observable}}
    `);

    await this.scheduler.advanceTo(1);

    assert.dom().hasText("Some Value", "Emits the initial value");

    await this.scheduler.advanceTo(30);

    assert.dom().hasText("New Value", "Emits the second value");
  });

  test("it emits nothing before the observable has produced values", async function(assert) {
    await render(hbs`
      {{subscribe observable}} 
    `);

    assert.dom().hasText("", "Nothing is returned from the helper");
  });

  test("it unsubscribes when the helper is destroyed", async function(assert) {
    const subscribe = td.replace(this.observable, "subscribe");
    const subscription = td.object();

    td.when(subscribe(td.matchers.isA(Function))).thenReturn(subscription);

    await render(hbs`
      {{subscribe observable}}
    `);
    await clearRender();

    assert.verify(
      subscription.unsubscribe(),
      "Unsubscribes from the observable when the helper is destroyed"
    );
  });
});
