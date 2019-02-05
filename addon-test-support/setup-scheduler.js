import TestScheduler from "./utils/test-scheduler";

/**
 * Sets up an [`ExtendedTestScheduler`](/docs/api/modules/ember-rx/test-support/utils/test-scheduler~ExtendedTestScheduler)
 * instance on the test context to help create an observable that can be
 * controlled remotely.
 *
 * ```javascript
 * import { setupScheduler } from 'ember-rx/test-support';
 *
 * module('Some Module', function(hooks) {
 *   setupScheduler(hooks);
 *
 *   test('Some Test', function(assert) {
 *     const testObservable = this.scheduler.createColdObservable('--a--b|', {
 *       a: 1,
 *       b: 2
 *     });
 *   });
 * });
 * ```
 *
 * @param {object} hooks
 * @returns {void}
 */
export default function setupScheduler(hooks) {
  hooks.beforeEach(function(assert) {
    this.scheduler = new TestScheduler(assert.deepEqual.bind(assert));
  });
}
