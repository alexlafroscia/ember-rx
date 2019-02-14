import { get, set } from "@ember/object";
import { assert } from "@ember/debug";
import { observeOn } from "rxjs/operators";
import { scheduler as runloopScheduler } from "ember-rx";

/**
 * This function can be applied as a decorator to a class.
 *
 * Somewhat like a Computed Property, it is passed the name of
 * another property -- a property that is an Observable. The propeperty
 * decorated will follow the most recent value emitted by the Observable.
 *
 * ```javascript
 * import Component from "@ember/component";
 * import { subscribe } from "ember-rx";
 * import currentTimeObservable from "wherever";
 *
 * export default class WithCurrentTime extends Component {
 *   currentTime$ = currentTimeObservable;
 *
 *   @subscribe('currentTime$') currentTime;
 * }
 * ```
 *
 * If you provide an initializer for the property, that value will be used
 * before a value is emitted.
 *
 * ```javascript
 * export default class DataLoader extends Component {
 *   data$ = someObservableThatMayTakeAWhile;
 *
 *   @subscribe('data$')
 *   model = [];
 * }
 * ```
 *
 * If the dependent observable is replaced, the original subscription will
 * be unsubscribed from and the new observable subscribed to automatically.
 *
 * Additionally, you can provide a function to the decorator that returns an
 * Observable. In that case, the returned Observable will be the one that values
 * are received from.
 *
 * ```javascript
 * export default class ShowLastTransition extends Component {
 *   @service router;
 *
 *   @subscribe(i => fromEvent(i.router, 'routeWillChange'))
 *   lastTransition
 * }
 * ```
 *
 * @param {string} observableKey
 */
export default function subscribe(observableKey) {
  assert(
    "Must be passed a property to listen to or function to create an observable from",
    typeof observableKey === "string" || typeof observableKey === "function"
  );

  const SUBSCRIPTION = Symbol();

  return element => {
    assert("Must decorator a `field`", element.kind === "field");

    return {
      ...element,
      finisher: klass => {
        function resetSubscription() {
          // Unsubscribe from the old observable
          if (this[SUBSCRIPTION]) {
            this[SUBSCRIPTION].unsubscribe();
          }

          // Set up the subscription to the new observable
          const observable = get(this, observableKey);
          this[SUBSCRIPTION] = observable.subscribe(value => {
            set(this, element.key, value);
          });
        }
        return class extends klass {
          init() {
            super.init(...arguments);

            let observable;

            if (typeof observableKey === "string") {
              this.addObserver(observableKey, this, resetSubscription);

              observable = get(this, observableKey);
            }

            if (typeof observableKey === "function") {
              observable = observableKey.apply(this, [this]);
            }

            observable = observable.pipe(observeOn(runloopScheduler));

            this[SUBSCRIPTION] = observable.subscribe(value => {
              set(this, element.key, value);
            });
          }

          willDestroy() {
            if (typeof observableKey === "string") {
              this.removeObserver(observableKey, this, resetSubscription);
            }

            if (this[SUBSCRIPTION]) {
              this[SUBSCRIPTION].unsubscribe();
            }

            super.willDestroy && super.willDestroy();
          }
        };
      }
    };
  };
}
