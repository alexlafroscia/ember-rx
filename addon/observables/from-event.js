import { fromEventPattern } from "rxjs";
import { observeOn } from "rxjs/operators";
import { scheduler as runloopScheduler } from "ember-rx";

/**
 * Create an Observable from Ember events
 *
 * Listen to any event emitted through the `Evented` mixin, creating
 * an Observable from their values.
 *
 * @param {EmberObject} subject
 * @param {string} eventName
 * @return {Observable}
 */
export default function fromEvent(subject, eventName) {
  return fromEventPattern(
    handler => {
      subject.on(eventName, subject, handler);
    },
    handler => {
      subject.off(eventName, subject, handler);
    }
  ).pipe(observeOn(runloopScheduler));
}
