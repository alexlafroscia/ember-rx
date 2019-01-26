import BaseStreamHelper from "ember-stream-helper";

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
