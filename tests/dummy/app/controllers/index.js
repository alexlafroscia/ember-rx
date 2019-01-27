import Controller from "@ember/controller";

import currentTime from "../observables/current-time";

export default class IndexController extends Controller {
  constructor(...args) {
    super(...args);

    this.currentTime = currentTime;
  }
}
