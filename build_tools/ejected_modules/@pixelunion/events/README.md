# Pixel Union Events

This is a library to help us manage our event listeners. It's intended to help us get away from using jquery and to ensure events are added to the dom correctly. It also helps so that we don't have to save or maintain variables or references to the different event listeners manually.

## Installation

First, you will need to [authenticate to the GitHub package registry](https://help.github.com/en/articles/configuring-npm-for-use-with-github-package-registry).

Then you will be able to install the package into your project.

```
npm install @pixelunion/events@0.0.0
```

## Usage

Then you will be able to use the handler on any class.

```
import EventHandler from '@pixelunion/events';

export default class SomeClass {
  constructor() {
    this.events = new EventHandler();
  }
}
```

### Register Event

Once you've set up your object on the class you will be able to register event listeners using the `register` command;

```
const myButton = document.querySelector('.button');

this.buttonClicked = (e) => {
  // event behaviour
}

this.events.register(myButton, 'click', () => this.buttonClicked());
```

This is basically equivalent to the following:

```
myButton.addEventListener('click', () => this.buttonClick());
```

### Unregister Event

You can `unregister` a specific event if you no longer need that event.

```
this.savedEvent = this.events.register(myButton, 'click', () => this.buttonClicked());

...

this.events.unregister(this.savedEvent);
```

This is basically equivalent to the following, with the exception that the event wouldn't be removed because the listener is an anonymous function!

```
myButton.removeEventListener('click', () => this.buttonClick());`
```

### Unregister All Events

You can also unregister all event listeners from the given EventHandler by calling `unregisterAll`.

```
this.events.unregisterAll();
```
