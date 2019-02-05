import { module, test } from "qunit";
import { visit } from "@ember/test-helpers";
import { setupApplicationTest } from "ember-qunit";
import td from "testdouble";
import { setupScheduler } from "ember-rx/test-support";
import { LATER_VALUE_SUBSCRIPTION } from "ember-rx/-private/symbols";
import { of, merge } from "rxjs";
import { delay } from "rxjs/operators";

module("Acceptance | observable model", function(hooks) {
  setupApplicationTest(hooks);
  setupScheduler(hooks);

  test("it handles multiple values over time", async function(assert) {
    this.owner.lookup("route:testing/observable-model").model = () => {
      return merge(
        of(1),
        of(2).pipe(delay(100, this.scheduler)),
        of(3).pipe(delay(200, this.scheduler))
      );
    };

    await visit("/testing/observable-model");

    assert.dom().hasText("1", "Model hook resolves with the initial value");

    await this.scheduler.advanceBy(100);

    assert.dom().hasText("2", "Model replaced with the second value");

    await this.scheduler.advanceBy(100);

    assert.dom().hasText("3", "Model replaced with the third value");
  });

  test("it takes the latest value if multiple are emitted before resolution", async function(assert) {
    this.owner.lookup("route:testing/observable-model").model = () => {
      return of(1, 2);
    };

    await visit("/testing/observable-model");

    assert.dom().hasText("2", "Model used the later value");
  });

  module("unsubscribing from later values", function(hooks) {
    hooks.beforeEach(async function(assert) {
      const route = this.owner.lookup("route:testing/observable-model");
      route.model = () => {
        return merge(of(1), of(2).pipe(delay(100, this.scheduler)));
      };

      await visit("/testing/observable-model");

      this.subscription = route[LATER_VALUE_SUBSCRIPTION];
      td.replace(this.subscription, "unsubscribe");

      assert.verify(
        this.subscription.unsubscribe(),
        { times: 0 },
        "Initialled subscribed to the observable"
      );
    });

    test("when the observer completes", async function(assert) {
      await this.scheduler.advanceBy(100);

      assert.verify(
        this.subscription.unsubscribe(),
        "Unsubscribed after completion"
      );
    });

    test("when navigating away from the route", async function(assert) {
      await visit("/");

      assert.verify(
        this.subscription.unsubscribe(),
        "Unsubscribed after navigating away from the page"
      );
    });

    test("when the model hook is refreshed", async function(assert) {
      await visit("/testing/observable-model?page=2");

      assert.verify(
        this.subscription.unsubscribe(),
        "Unsubscribed after navigating away from the page"
      );
    });
  });
});
