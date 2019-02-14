import Ember from "ember";
import { fromEvent } from "rxjs";

export default Ember._setModifierManager(
  () => ({
    createModifier() {
      return {
        subscription: undefined,
        element: undefined
      };
    },

    _setupSubscription(state, eventName, operatorOrObserver, maybeObserver) {
      const { element } = state;
      let operator, observer;

      if (operatorOrObserver && maybeObserver) {
        operator = operatorOrObserver;
        observer = maybeObserver;
      } else if (operatorOrObserver && !maybeObserver) {
        observer = operatorOrObserver;
      }

      let observable = fromEvent(element, eventName);

      if (operator) {
        observable = observable.pipe(operator);
      }

      state.subscription = observable.subscribe(observer);
    },

    installModifier(
      state,
      element,
      {
        positional: [eventName, operatorOrObserver, maybeObserver]
      }
    ) {
      state.element = element;

      this._setupSubscription(
        state,
        eventName,
        operatorOrObserver,
        maybeObserver
      );
    },

    updateModifier(
      state,
      {
        positional: [eventName, operatorOrSubscribe, maybeObserver]
      }
    ) {
      state.subscription.unsubscribe();

      this._setupSubscription(
        state,
        eventName,
        operatorOrSubscribe,
        maybeObserver
      );
    },

    destroyModifier({ subscription }) {
      subscription.unsubscribe();
    }
  }),
  class FromEventModifier {}
);
