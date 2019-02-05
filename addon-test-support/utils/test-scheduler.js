import { TestScheduler } from "rxjs/testing";
import { settled } from "@ember/test-helpers";

/**
 * This extends the base `TestScheduler` with some additional methods that
 * were present in an older version of RxJS but that were removed in later
 * versions. These methods help manipulate "time" in the `TestScheduler`,
 * which can be useful when testing integration with Ember.
 *
 * Additionally, I added some feature to better integrate with Ember, like
 * the ability to wait for the runloop to complete after the scheduler moves
 * forward in time.
 *
 * This class does not need to be instantiated directly; an instance will be
 * provided for you by [`setupScheduler`](/docs/api/modules/ember-rx/test-support).
 *
 * See the [Rx.TestScheduler](https://rxjs.dev/api/testing/TestScheduler) documentation
 * for other available methods and information.
 *
 * @extends {Rx.TestScheduler}
 * @hide
 */
class ExtendedTestScheduler extends TestScheduler {
  constructor() {
    super();

    this._flushing = false;
  }

  /** @hide */
  get isFlushing() {
    return this._flushing;
  }

  /**
   * Advance to the final frame
   *
   * The resulting `Promise` can be awaited to determine when the runloop
   * has settled.
   *
   * @returns {Promise}
   */
  flush() {
    super.flush(...arguments);

    return settled();
  }

  /**
   * Advance "time" in the scheduler by a certain number of frames
   *
   * The resulting `Promise` can be awaited to determine when the runloop
   * has settled.
   *
   * @param {number} byFrame
   * @returns {Promise}
   */
  advanceBy(byFrame) {
    if (byFrame < 0) {
      throw new Error("Argument out of range");
    }

    if (byFrame === 0) {
      return;
    }

    const toFrame = this.frame + byFrame;
    return this.advanceTo(toFrame);
  }

  /**
   * Advance "time" in the scheduler to a specific frame
   *
   * The resulting `Promise` can be awaited to determine when the runloop
   * has settled.
   *
   * @param {number} toFrame
   * @returns {Promise}
   */
  advanceTo(toFrame) {
    if (toFrame < 0 || toFrame < this.frame) {
      throw new Error("Argument out of range");
    }

    this.flushUntil(toFrame);
    this.frame = toFrame;

    return settled();
  }

  /** @hide */
  peek() {
    const { actions } = this;
    return actions && actions.length > 0 ? actions[0] : null;
  }

  /** @hide */
  flushUntil(toFrame = this.maxFrames) {
    if (this.isFlushing) {
      return;
    }

    this._flushing = true;

    const { actions } = this;
    let error;
    let action = null;

    while (
      this.isFlushing &&
      (action = this.peek()) &&
      action.delay <= toFrame
    ) {
      const action = actions.shift();
      this.frame = action.delay;

      if ((error = action.execute(action.state, action.delay))) {
        break;
      }
    }

    this._flushing = false;

    if (error) {
      while ((action = actions.shift())) {
        action.unsubscribe();
      }
      throw error;
    }
  }
}

export default ExtendedTestScheduler;
