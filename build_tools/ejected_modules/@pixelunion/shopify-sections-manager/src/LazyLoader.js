/**
 * Allows a callback to be run once, when a target intersects the viewport.
 * @constructor
 * @param {Object} [options] options with which to construct the IntersectionObserver
 * @param {string} [options.rootMargin='30%'] A string which specifies a set of offsets to add to
 *                                          the root's bounding_box when calculating intersections.
 * @param {number} [options.threshold=0] Ratio of intersection required to trigger callback
 */
export default class LazyLoader {
  constructor(options) {
    const defaultOptions = {
      rootMargin: '30%',
      threshold: 0,
    };

    this.callbacks = new WeakMap();
    this._observerCallback = this._observerCallback.bind(this);
    this.observer = new IntersectionObserver(
      this._observerCallback,
      { ...defaultOptions, ...options },
    );
  }

  /**
   * Add target and callback. Callback is only run once.
   * @add
   * @param {HTMLElement} target Target element
   * @param {function} callback Callback to run when target begins intersecting
   */
  add(target, callback) {
    this.callbacks.set(target, callback);
    this.observer.observe(target);
  }

  /**
   * Remove target. Associated callback is also removed.
   * @remove
   * @param {HTMLElement} target Target element
   */
  remove(target) {
    this.observer.unobserve(target);
    this.callbacks.delete(target);
  }

  /**
   * Disconnects IntersectionObserver if active
   * @unload
   */
  unload() {
    this.observer.disconnect();
  }

  /**
   * Runs associated callbacks for each entry, then removes that entry and callback
   * @_observerCallback
   * @param {IntersectionObserverEntry[]} entries Entries to check
   * @param {InterserctionObserver} observer IntersectionObserver instance
   */
  _observerCallback(entries, observer) {
    entries.forEach(({ isIntersecting, target }) => {
      // do nothing unless target moved into state of intersection
      if (isIntersecting === true) {
        // make sure we stop observing before running the callback, so we don't
        // somehow run the callback twice if element intersects twice quickly
        observer.unobserve(target);
        const callback = this.callbacks.get(target);
        if (typeof callback === 'function') {
          callback();
        }
        this.callbacks.delete(target);
      }
    });
  }
}
