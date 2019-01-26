import TestScheduler from "./utils/test-scheduler";

export default function setupScheduler(hooks) {
  hooks.beforeEach(function(assert) {
    this.scheduler = new TestScheduler(assert.deepEqual.bind(assert));
  });
}
