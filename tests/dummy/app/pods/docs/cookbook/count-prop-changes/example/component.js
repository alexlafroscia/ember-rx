// BEGIN-SNIPPET count-prop-changes-example.js
import Component from "@ember/component";
import { fromPropertyChange, subscribe } from "ember-rx";
import { scan } from "rxjs/operators";

export default class CountPropChanges extends Component {
  value = "Initial Value";

  @subscribe("value$") count = 0;

  constructor() {
    super(...arguments);

    this.value$ = fromPropertyChange(this, "value").pipe(
      scan(count => count + 1, 0)
    );
  }
}
// END-SNIPPET
