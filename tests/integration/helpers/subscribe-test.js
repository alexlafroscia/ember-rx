import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { render, clearRender, settled } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import td from "testdouble";
import { Observable } from "rxjs";

module("Integration | Helper | subscribe", function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.observable = new Observable(observer => {
      this.next = value => {
        observer.next(value);

        return settled();
      };
    });
  });

  test("it emits values from the observable", async function(assert) {
    await render(hbs`
      {{subscribe observable}}
    `);

    await this.next("Some Value");

    assert.dom().hasText("Some Value", "Emits the initial value");

    await this.next("Next Value");

    assert.dom().hasText("Next Value", "Emits additional values");
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
