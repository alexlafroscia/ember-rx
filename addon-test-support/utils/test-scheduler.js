import { TestScheduler } from "rxjs/testing";
import { settled } from "@ember/test-helpers";

/**
 * This extends the base `TestScheduler` with some additional
 * methods that were present in an oxder version of RX but
 * that were removed in later versions. These methods help
 * manipulate "time" in the `TestScheduler`, which can be useful
 * when testing integration with Ember
 *
 * Additionally, I added some logic to help work better with Ember
 *
 * @see https://github.com/kwonoj/rxjs-testscheduler-compat/blob/master/src/TestScheduler.ts
 */
class ExtendedTestScheduler extends TestScheduler {
  constructor() {
    super();

    this._flushing = false;
  }

  get isFlushing() {
    return this._flushing;
  }

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

  advanceTo(toFrame) {
    if (toFrame < 0 || toFrame < this.frame) {
      throw new Error("Argument out of range");
    }

    this.flushUntil(toFrame);
    this.frame = toFrame;

    return settled();
  }

  peek() {
    const { actions } = this;
    return actions && actions.length > 0 ? actions[0] : null;
  }

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
