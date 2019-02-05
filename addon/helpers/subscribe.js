import BaseStreamHelper from "ember-stream-helper";

/**
 * Helper for subscribing to an `Observable` and emitting the latest value
 *
 * By passing the an observable to the helper, the last value emitted will be
 * returned. As new values are emitted, the returned value will update
 * automatically.
 *
 * `undefined` will be returned before a value is emitted.
 *
 * ```hbs
 * {{#let (subscribe model) as |latestValue|}}
 *   {{value}}
 * {{/let}}
 * ```
 */
class SubscribeHelper extends BaseStreamHelper {
  subscribe([observable]) {
    const subscription = observable.subscribe(value => {
      this.emit(value);
    });

    return () => {
      subscription.unsubscribe();
    };
  }
}

export default SubscribeHelper;
