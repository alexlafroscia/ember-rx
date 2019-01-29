import { fromEventPattern } from "rxjs";
import { get } from "@ember/object";

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
  );
}
