import rimg from './../../rimg';
import './matches';

const state = {
  init,
  watch,
  unwatch,
  load,
};

export default state;

function init(selector = '[data-rimg="lazy"]', options = {}) {
  state.selector = selector;
  state.instance = rimg(selector, options);
  state.loadedWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  // Listen for Shopify theme editor events
  document.addEventListener(
    'shopify:section:load', event => watch(event.target)
  );

  window.addEventListener(
    'resize', () => _update()
  );

  document.addEventListener(
    'shopify:section:unload', event => unwatch(event.target)
  );

  // Listen for custom events to allow themes to hook into rimg
  document.addEventListener(
    'theme:rimg:watch', event => watch(event.target)
  );

  document.addEventListener(
    'theme:rimg:unwatch', event => unwatch(event.target)
  );

  // Support custom events triggered through jQuery
  // See: https://github.com/jquery/jquery/issues/3347
  if (window.jQuery) {
    jQuery(document).on({
      'theme:rimg:watch': event => watch(event.target),
      'theme:rimg:unwatch': event => unwatch(event.target),
    });
  }
}

/**
 * Track an element, and its children.
 *
 * @param {HTMLElement} el
 */
function watch(el) {
  // Track element
  if (typeof el.matches === 'function' && el.matches(state.selector)) {
    state.instance.track(el);
  }

  // Track element's children
  state.instance.track(el.querySelectorAll(state.selector));
}

/**
 * Untrack an element, and its children
 *
 * @param {HTMLElement} el
 * @private
 */
function unwatch(el) {
  // Untrack element's children
  state.instance.untrack(el.querySelectorAll(state.selector));

  // Untrack element
  if (typeof el.matches === 'function' && el.matches(state.selector)) {
    state.instance.untrack(el);
  }
}

/**
 * Manually load an image
 *
 * @param {HTMLElement} el
 */
function load(el) {
  // Load element
  if (typeof el.matches === 'function' && el.matches(state.selector)) {
    state.instance.load(el);
  }

  // Load element's children
  state.instance.load(el.querySelectorAll(state.selector));
}

/**
 * Update an element, and its children.
 *
 * @param {HTMLElement} el
 */
function _update() {
  const currentWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

  // Return if we're not 2x smaller, or larger than the existing loading size
  if (currentWidth / state.loadedWidth > 0.5 && currentWidth / state.loadedWidth < 2) {
    return;
  }

  state.loadedWidth = currentWidth;
  state.instance.update();
}
