// BEGIN-SNIPPET current-time-controller.js
import Controller from "@ember/controller";
import currentTimeObservable from "../../observables/current-time";

export default class IndexController extends Controller {
  currentTime = currentTimeObservable;
}
// END-SNIPPET
