import load from './load';
import update from './update';
import inViewport from './inViewport';

/**
 * @typedef {Object} Size
 * @property {Number} width
 * @property {Number} height
 */

/**
 * A function to turn a template string into a URL.
 *
 * @callback TemplateRenderer
 * @param {String} template
 * @param {Size} size
 * @returns {String}
 */

/**
 * @typedef {Object} Settings
 *
 * @property {String} [template]
 *           A template string used to generate URLs for an image. This allows us to
 *           dynamically load images with sizes to match the container's size.
 *
 * @property {TemplateRenderer} [templateRender]
 *           A function to turn a template string into a URL.
 *
 * @property {Size} [max]
 *           The maximum available size for the image. This ensures we don't
 *           try to load an image larger than is possible.
 * 
 * @property {Number} [scale]
 *           A number to scale the final image dimensions by. 
 *           Only applies to lazy-loaded images. Defaults to 1.
 *
 * @property {Number} [round]
 *           Round image dimensions to the nearest multiple. This is intended to
 *           tax the image server less by lowering the number of possible image
 *           sizes requested.
 *
 * @property {Size} [placeholder]
 *           The size of the lo-fi image to load before the full image.
 * 
 * @property {String} [crop]
 *           Crop value; null if image is uncropped, otherwise equal 
 *           to the Shopify crop parameter ('center', 'top', etc.).
 */

/**
 * Initialize the responsive image handler.
 *
 * @param {String|HTMLElement|NodeList} selector
 *        The CSS selector, element, or elements to track for lazy-loading.
 *
 * @param {Settings} options
 *
 * @returns {PublicApi}
 */
export default function rimg(selector = '[data-rimg="lazy"]', options = {}) {
  // Intersections
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        io.unobserve(entry.target);
        load(entry.target, options);
      }
    });
  }, {
    // Watch the viewport, with 20% vertical margins
    rootMargin: '20% 0px',
  });

  /**
   * @typedef {Object} PublicApi
   */
  const api = {
    /**
     * Track a new selector, element, or nodelist for lazy-loading.
     * @type Function
     * @param {String|HTMLElement|NodeList} selector
     */
    track(selector = '[data-rimg="lazy"]') {
      const els = querySelector(selector);

      for (let i = 0; i < els.length; i++) {
        // If an element is already in the viewport, load it right away. This
        // fixes a race-condition with dynamically added elements.
        if (inViewport(els[i])) {
          load(els[i], options);
        } else {
          io.observe(els[i]);
        }
      }
    },

    /**
     * Update element(s) that have already been loaded to force their images
     * to be recalculated.
     * @type Function
     * @param {String|HTMLElement|NodeList} selector
     */
    update(selector = '[data-rimg="loaded"]') {
      const els = querySelector(selector);
      for (let i = 0; i < els.length; i++) update(els[i], options);
    },

    /**
     * Stop tracking element(s) for lazy-loading.
     * @type Function
     * @param {String|HTMLElement|NodeList} selector
     */
    untrack(selector = '[data-rimg]') {
      const els = querySelector(selector);
      for (let i = 0; i < els.length; i++) io.unobserve(els[i]);
    },

    /**
     * Manually load images.
     * @type Function
     * @param {String|HTMLElement|NodeList} selector
     */
    load(selector = '[data-rimg]') {
      const els = querySelector(selector);
      for (let i = 0; i < els.length; i++) {
        load(els[i], options);
      }
    },

    /**
     * Unload all event handlers and observers.
     * @type Function
     */
    unload() {
      io.disconnect();
    },
  };

  // Add initial elements
  api.track(selector);

  return api;
}

/**
 * Finds a group of elements on the page.
 *
 * @param {String|HTMLElement|NodeList} selector
 * @returns {Object} An array-like object.
 */
function querySelector(selector) {
  if (typeof selector === 'string') {
    return document.querySelectorAll(selector);
  }

  if (selector instanceof HTMLElement) {
    return [selector];
  }

  if (selector instanceof NodeList) {
    return selector;
  }

  return [];
}
