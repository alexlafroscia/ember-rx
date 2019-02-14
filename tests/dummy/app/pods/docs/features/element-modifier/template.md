# Element Modifier

This addon provides an Element Modifier that can be used to capture events from DOM elements using RxJS's [`fromEvent`][rxjs-from-event]. This allows you to subscribe to events using an RxJS observer.

> Note: To use this feature, you'll need either Ember 3.8+ or the [element modifier polyfill][polyfill].

## Basic Usage

You can subscribe to events from the DOM element using the `from-event` element modifier. It is passed an event to listen to and an observer definition.

```js
import Component from "@ember/component";

export default class MyComponent extends Component {
  onClickEvent() {
    console.log("Click event received");
  }
}
```

```hbs
<button {{from-event 'click' this.onClickEvent}}>
  Click me!
</button>
```

## Providing an operator

If you want to pipe the events through an operator, you can also provide an additional argument to `from-event`. An operator can be placed between the event name and the observer to apply it to the observable.

```js
import Component from "@ember/component";
import { filter } from "rxjs/operators";

export default class MyComponent extends Component {
  everyOtherClick() {
    return filter((_event, index) => index % 2 === 0);
  }

  onClickEvent() {
    console.log("Click event received");
  }
}
```

```hbs
<button {{from-event 'click' this.everyOtherClick this.onClickEvent}}>
  Click me!
</button>
```

Because the events will be piped through the operator, only every other event will be logged.

## Using a Subject

If you want to multi-cast to different observers, you can also pass a [Subject][rxjs-subject] to `from-event`. Since Subjects are observers, this behavior "just works"!

```js
import Component from "@ember/component";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";

export default class MyComponent extends Component {
  constructor() {
    super(...arguments);

    this.clickSubject = new Subject();

    this.clickSubject.subscribe(() => {
      console.log("Logged on every click");
    });

    this.clickSubject
      .pipe(filter((_event, index) => index % 2 === 0))
      .subscribe(() => {
        console.log("Logged on every other click");
      });
  }
}
```

```hbs
<button {{from-event 'click' this.clickSubject}}>
  Click me!
</button>
```

[rxjs-from-event]: https://rxjs.dev/api/index/function/fromEvent
[rxjs-subject]: https://rxjs.dev/guide/subject
[polyfill]: https://github.com/rwjblue/ember-modifier-manager-polyfill
