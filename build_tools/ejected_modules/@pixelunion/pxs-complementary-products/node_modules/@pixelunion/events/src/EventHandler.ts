interface EventObject {
  el: Element,
  event: string,
  listener: EventListener
}

export default class EventHandler {
  events: EventObject[];

  constructor() {
    this.events = [];
  }

  register(el: Element, event: string, listener: EventListener) : EventObject | null {
    if (!el || !event || !listener) return null;

    this.events.push({ el, event, listener });

    el.addEventListener(event, listener);

    return { el, event, listener };
  }

  unregister({ el, event, listener }: EventObject) : EventObject | null {
    if (!el || !event || !listener) return null;

    this.events = this.events.filter(e => el !== e.el
      || event !== e.event || listener !== e.listener);

    el.removeEventListener(event, listener);

    return { el, event, listener };
  }

  unregisterAll() {
    this.events.forEach(({ el, event, listener }: EventObject) => el.removeEventListener(event, listener));
    this.events = [];
  }
}
