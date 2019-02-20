// BEGIN-SNIPPET prop-history-example.js
import Component from "@ember/component";
import { fromPropertyChange, subscribe } from "ember-rx";
import { scan, throttleTime } from "rxjs/operators";

export default class CountPropChanges extends Component {
  value = "Replace this text";

  @subscribe(i =>
    fromPropertyChange(i, "value").pipe(
      throttleTime(300),
      scan((acc, v) => [...acc, v], [])
    )
  )
  valueHistory = [];
}
// END-SNIPPET
