import { get } from "@ember/object";
import { fromEventPattern } from "rxjs";
import { observeOn } from "rxjs/operators";
import { scheduler as runloopScheduler } from "ember-rx";

/**
 * Create an Observable from the values of a property.
 *
 * Each time the property changes, the new value will be emitted from the
 * Observable. This can be thought of as a replacement for manually using
 * `addObserver` and `removeObserver` from Ember's API.
 *
 * @param {EmberObject} subject
 * @param {string} property
 * @return {Observable}
 */
export default function fromPropertyChange(subject, property) {
  return fromEventPattern(
    handler => {
      subject.addObserver(property, subject, handler);
    },
    handler => {
      subject.removeObserver(property, subject, handler);
    },
    (instance, prop) => {
      return get(instance, prop);
    }
  ).pipe(observeOn(runloopScheduler));
}
