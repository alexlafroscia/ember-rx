import { get, set } from "@ember/object";
import { assert } from "@ember/debug";

// const subscribe = computedDecoratorWithRequiredParams(
//   (descriptor, dependentKeys) => {
//     debugger;

//     assert(
//       "Only one dependent key can be provided to `subscribe`",
//       dependentKeys.length === 1
//     );

//     const { key } = descriptor;
//     const [observablePropertyName] = dependentKeys;

//     let unsubscribe, lastValue, lastObservable;

//     return computed(observablePropertyName, function() {
//       const observable = this.get(observablePropertyName);

//       assert(
//         `Could not find obserable at \`${observablePropertyName}\``,
//         observable
//       );

//       // This method can be called when the observable changes _or_ when
//       // the observable emits a new value. We only want to do this logic
//       // if the observable changed
//       if (observable !== lastObservable) {
//         lastObservable = observable;

//         // Clean up we already have a subscription
//         if (unsubscribe) {
//           unsubscribe();
//         }

//         const subscription = observable.subscribe(value => {
//           lastValue = value;
//           this.notifyPropertyChange(key);
//         });

//         unsubscribe = subscription.unsubscribe.bind(subscription);
//       }

//       return lastValue;
//     });
//   }
// );

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
