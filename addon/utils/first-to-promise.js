import { partition, take } from "rxjs/operators";
import { Promise as RSVPPromise } from "rsvp";

export default function firstToPromise(observable) {
  const [first, later] = observable.pipe(partition((_, index) => index === 0));

  return [first.pipe(take(1)).toPromise(RSVPPromise), later];
}
