import { get, set } from "@ember/object";
import { assert } from "@ember/debug";

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
 * @param {string} observableKey
 */
export default function subscribe(observableKey) {
  assert(
    "Must be passed a property to listen to",
    typeof observableKey === "string"
  );

  const SUBSCRIPTION = Symbol();

  return ({ kind, descriptor, initializer, ...rest }) => {
    assert("Must decorator a `field`", kind === "field");

    delete descriptor.writable;

    let lastValue,
      hasEmittedValue = false;

    return {
      ...rest,
      kind: "method",
      descriptor: {
        ...descriptor,
        get() {
          if (hasEmittedValue) {
            return lastValue;
          }

          if (initializer) {
            return initializer();
          }
        },
        set(value) {
          hasEmittedValue = true;
          lastValue = value;

          // Ensure the Ember KVO knows that the subscription property
          // has updated
          if (this.notifyPropertyChange) {
            this.notifyPropertyChange(rest.key);
          }
        }
      },
      finisher: klass => {
        function resetSubscription() {
          // Unsubscribe from the old observable
          if (this[SUBSCRIPTION]) {
            this[SUBSCRIPTION].unsubscribe();
          }

          // Set up the subscription to the new observable
          const observable = get(this, observableKey);
          this[SUBSCRIPTION] = observable.subscribe(value => {
            set(this, rest.key, value);
          });
        }

        return class extends klass {
          init() {
            super.init(...arguments);

            this.addObserver(observableKey, this, resetSubscription);

            const observable = get(this, observableKey);
            this[SUBSCRIPTION] = observable.subscribe(value => {
              set(this, rest.key, value);
            });
          }

          willDestroy() {
            this.removeObserver(observableKey, this, resetSubscription);

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
