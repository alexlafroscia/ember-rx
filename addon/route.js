import Route from "@ember/routing/route";

import {
  LATER_VALUE_SUBSCRIPTION,
  MOST_RECENT_VALUE,
  RESET
} from "./-private/symbols";
import firstToPromise from "./utils/first-to-promise";

/**
 * Base class for routes that return an `Observable` from the `model` hook,
 * rather than a `Promise`.
 *
 * The loading state for the route will be transitioned to until the Observable
 * emits its first value, just as if you had returned a `Promise`.
 *
 * Each time a new value is emitted from the returned `Observable`, the `model`
 * property on the corresponding controller will be replaced with that value.
 *
 * ```javascript
 * import { Route } from "ember-rx";
 * import { inject as service } from "@ember-decorators/service";
 *
 * export default class PostsRoute extends Route {
 *   @service apollo;
 *
 *   model() {
 *     return this.apollo.watchQuery({ query: ... });
 *   }
 * }
 * ```
 */
export default class ObservableModelRoute extends Route {
  deserialize() {
    this[RESET]();

    const observable = super.deserialize(...arguments);

    const [promiseForFirst, later] = firstToPromise(observable);

    this[LATER_VALUE_SUBSCRIPTION] = later.subscribe({
      next: value => {
        if (this.controller) {
          this.controller.set("model", value);
        } else {
          this[MOST_RECENT_VALUE] = value;
        }
      },
      complete: () => {
        this[RESET]();
      }
    });

    return promiseForFirst;
  }

  /**
   * Reset any state that we're hanging off the instance
   *
   * @hide
   */
  [RESET]() {
    if (this[LATER_VALUE_SUBSCRIPTION]) {
      this[LATER_VALUE_SUBSCRIPTION].unsubscribe();
    }
  }

  /**
   * If more than one value was emitted before the controller was
   * set up, we should take the most recent value as the model, not
   * the original one
   *
   * @hide
   * @param {Ember.Controller} controller
   * @param {any} model
   */
  setupController(controller, model) {
    if (this[MOST_RECENT_VALUE]) {
      model = this[MOST_RECENT_VALUE];

      this[MOST_RECENT_VALUE] = undefined;
    }

    super.setupController(controller, model);
  }

  resetController() {
    this[RESET]();

    super.resetController && super.resetController(...arguments);
  }

  willDestroy() {
    this[RESET]();

    super.willDestroy && super.willDestroy(...arguments);
  }
}
