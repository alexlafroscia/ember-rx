import Route from "@ember/routing/route";
import { partition, take } from "rxjs/operators";
import { Promise as RSVPPromise } from "rsvp";

import {
  LATER_VALUE_SUBSCRIPTION,
  MOST_RECENT_VALUE,
  RESET
} from "./-private/symbols";

export default class ObservableModelRoute extends Route {
  deserialize() {
    this[RESET]();

    const observable = super.deserialize(...arguments);

    const [first, later] = observable.pipe(
      partition((_, index) => index === 0)
    );

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

    return first.pipe(take(1)).toPromise(RSVPPromise);
  }

  /**
   * Reset any state that we're hanging off the instance
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
