import { get, set } from "@ember/object";
import { assert } from "@ember/debug";

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
            this.removeListener(observableKey, this, resetSubscription);

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
