// BEGIN-SNIPPET count-prop-changes-example.js
import Component from "@ember/component";
import { fromPropertyChange, subscribe } from "ember-rx";
import { scan } from "rxjs/operators";

export default class CountPropChanges extends Component {
  value = "Replace this text";

  @subscribe(i =>
    fromPropertyChange(i, "value").pipe(scan(count => count + 1, 0))
  )
  count = 0;
}
// END-SNIPPET
