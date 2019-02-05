import { partition, take } from "rxjs/operators";
import { Promise as RSVPPromise } from "rsvp";

/**
 * Converts an `Observable` into a `Promise` and an `Observable`
 *
 * The `Promise` will resolve with the first value from the `Observable`. The
 * `Observable` will emit all future values.
 *
 * @param {Observable} observable
 * @return {[Promise, Observable]}
 */
export default function firstToPromise(observable) {
  const [first, later] = observable.pipe(partition((_, index) => index === 0));

  return [first.pipe(take(1)).toPromise(RSVPPromise), later];
}
