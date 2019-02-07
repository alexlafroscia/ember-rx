import { Scheduler, Subscription } from "rxjs";
import { cancel, later, run } from "@ember/runloop";

class RunLoopAction extends Subscription {
  constructor(scheduler, work) {
    super(() => cancel(this.timer));

    this.scheduler = scheduler;
    this.work = work;
  }

  schedule(state, delay) {
    if (delay) {
      this.timer = later(this, this.work, state, delay);
    } else {
      run(this, this.work, state);
    }

    return this;
  }
}

export default new Scheduler(RunLoopAction);
