/*!
 * @pixelunion/rimg v2.2.2
 * (c) 2022 Pixel Union
 */
'use strict';

/**
 * The default template render function. Turns a template string into an image
 * URL.
 *
 * @param {String} template
 * @param {Size} size
 * @returns {String}
 */
function defaultTemplateRender(template, size) {
  return template.replace('{size}', "".concat(size.width, "x").concat(size.height));
}
/**
 * @type Settings
 */


var defaults = {
  scale: 1,
  template: false,
  templateRender: defaultTemplateRender,
  max: {
    width: Infinity,
    height: Infinity
  },
  round: 32,
  placeholder: false,
  crop: null
};
/**
 * Get a data attribute value from an element, with a default fallback and
 * sanitization step.
 *
 * @param {Element} el
 *
 * @param {String} name
 *        The data attribute name.
 *
 * @param {Object} options
 *        An object holding fallback values if the data attribute does not
 *        exist. If this object doesn't have the property, we further fallback
 *        to our defaults.
 *
 * @param {Function} [sanitize]
 *        A function to sanitize the data attribute value with.
 *
 * @returns {String|*}
 */

function getData(el, name, options, sanitize) {
  var attr = "data-rimg-".concat(name);
  if (!el.hasAttribute(attr)) return options[name] || defaults[name];
  var value = el.getAttribute(attr);
  return sanitize ? sanitize(value) : value;
}
/**
 * Sanitize data attributes that represent a size (in the form of `10x10`).
 *
 * @param {String} value
 * @returns {Object} An object with `width` and `height` properties.
 */


function parseSize(value) {
  value = value.split('x');
  return {
    width: parseInt(value[0], 10),
    height: parseInt(value[1], 10)
  };
}
/**
 * Sanitize crop values to ensure they are valid, or null
 *
 * @param {String} value
 * @returns {Object} Shopify crop parameter ('top', 'center', 'bottom', 'left', 'right') or null, if an unsupported value is found
 */


function processCropValue(value) {
  switch (value) {
    case 'top':
    case 'center':
    case 'bottom':
    case 'left':
    case 'right':
      return value;

    default:
      return null;
  }
}
/**
 * Loads information about an element.
 *
 * Options can be set on the element itself using data attributes, or through
 * the `options` parameter. Data attributes take priority.
 *
 * @param {HTMLElement} el
 * @param {Settings} options
 * @returns {Item}
 */


function parseItem(el) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var isImage = el.hasAttribute('data-rimg-template');
  /**
   * @typedef {Settings} Item
   */

  return {
    el: el,
    // Type of element
    isImage: isImage,
    isBackgroundImage: isImage && el.tagName !== 'IMG',
    // Image scale
    scale: parseInt(getData(el, 'scale', options)),
    // Device density
    density: window.devicePixelRatio || 1,
    // Image template URL
    template: getData(el, 'template', options),
    templateRender: options.templateRender || defaults.templateRender,
    // Maximum image dimensions
    max: getData(el, 'max', options, parseSize),
    // Round image dimensions to the nearest multiple
    round: getData(el, 'round', options),
    // Placeholder image dimensions
    placeholder: getData(el, 'placeholder', options, parseSize),
    // Crop value; null if image is uncropped, otherwise equal to the Shopify crop parameter ('center', 'top', etc.)
    crop: getData(el, 'crop', options, processCropValue)
  };
}

/**
 * Round to the nearest multiple.
 *
 * This is so we don't tax the image server too much.
 *
 * @param {Number} size The size, in pixels.
 * @param {Number} [multiple] The multiple to round to the nearest.
 * @param {Number} [maxLimit] Maximum allowed value - value to return if rounded multiple is above this limit
 * @returns {Number}
 */
function roundSize(size) {
  var multiple = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 32;
  var maxLimit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  return size === 0 ? multiple : Math.min(Math.ceil(size / multiple) * multiple, maxLimit);
}

/**
 * Get the size of an element.
 *
 * If it is too small, it's parent element is checked, and so on. This helps
 * avoid the situation where an element doesn't have a size yet or is positioned
 * out of the layout.
 *
 * @param {HTMLElement} el
 * @return {Object} size
 * @return {Number} size.width The width, in pixels.
 * @return {Number} size.height The height, in pixels.
 */
function getElementSize(el) {
  var size = {
    width: 0,
    height: 0
  };

  while (el) {
    size.width = el.offsetWidth;
    size.height = el.offsetHeight;
    if (size.width > 20 && size.height > 20) break;
    el = el.parentNode;
  }

  return size;
}

/**
 * Return the maximum supported density of the image, given the container.
 *
 * @param {Item} item
 * @param {Size} size
 */
function supportedDensity(item, size) {
  return Math.min(Math.min(Math.max(item.max.width / size.width, 1), item.density), Math.min(Math.max(item.max.height / size.height, 1), item.density)).toFixed(2);
}

/**
 * Trigger a custom event.
 *
 * Note: this approach is deprecated, but still required to support older
 * browsers such as IE 10.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
 *
 * @param {HTMLElement} el
 *        The element to trigger the event on.
 *
 * @param {String} name
 *        The event name.
 *
 * @returns {Boolean}
 *          True if the event was canceled.
 */
function trigger(el, name) {
  var event = document.createEvent('Event');
  event.initEvent(name, true, true);
  return !el.dispatchEvent(event);
}

/**
 * Set the image URL on the element. Supports background images and `srcset`.
 *
 * @param {Item} item
 * @param {Size} size
 * @param {Boolean} isPlaceholder
 */

function setImage(item, size, isPlaceholder, onLoad) {
  var render = item.templateRender;
  var density = isPlaceholder ? 1 : supportedDensity(item, size);
  var round = isPlaceholder ? 1 : item.round; // Calculate the final display size, taking into account the image's
  // maximum dimensions.

  var targetWidth = size.width * density;
  var targetHeight = size.height * density;
  var displaySize;

  if (item.crop) {
    displaySize = {
      width: roundSize(targetWidth, round, item.max.width),
      height: roundSize(targetHeight, round, item.max.height)
    };
  } else {
    // Shopify serves images clamped by the requested dimensions (fitted to the smallest dimension).
    // To get the desired and expected pixel density we need to request cover dimensions (fitted to largest dimension).
    // This isn't a problem with cropped images which are served at the exact dimension requested.
    var containerAspectRatio = size.width / size.height;
    var imageAspectRatio = item.max.width / item.max.height;

    if (containerAspectRatio > imageAspectRatio) {
      // fit width
      displaySize = {
        width: roundSize(targetWidth, round, item.max.width),
        height: roundSize(targetWidth / imageAspectRatio, round, item.max.height)
      };
    } else {
      // fit height
      displaySize = {
        width: roundSize(targetHeight * imageAspectRatio, round, item.max.width),
        height: roundSize(targetHeight, round, item.max.height)
      };
    }
  }

  var url = render(item.template, displaySize); // On load callback

  var image = new Image();
  image.onload = onLoad;
  image.src = url; // Set image

  if (item.isBackgroundImage) {
    item.el.style.backgroundImage = "url('".concat(url, "')");
  } else {
    item.el.setAttribute('srcset', "".concat(url, " ").concat(density, "x"));
  }
}
/**
 * Load the image, set loaded status, and trigger the load event.
 *
 * @fires rimg:load
 * @fires rimg:error
 * @param {Item} item
 * @param {Size} size
 */


function loadFullImage(item, size) {
  var el = item.el;
  setImage(item, size, false, function (event) {
    if (event.type === 'load') {
      el.setAttribute('data-rimg', 'loaded');
    } else {
      el.setAttribute('data-rimg', 'error');
      trigger(el, 'rimg:error');
    }

    trigger(el, 'rimg:load');
  });
}
/**
 * Load in a responsive image.
 *
 * Sets the image's `srcset` attribute to the final image URLs, calculated based
 * on the actual size the image is being shown at.
 *
 * @fires rimg:loading
 *        The image URLs have been set and we are waiting for them to load.
 *
 * @fires rimg:loaded
 *        The final image has loaded.
 *
 * @fires rimg:error
 *        The final image failed loading.
 *
 * @param {Item} item
 */


function loadImage(item) {
  var el = item.el; // Already loaded?

  var status = el.getAttribute('data-rimg');
  if (status === 'loading' || status === 'loaded') return; // Is the SVG loaded?
  // In Firefox, el.complete always returns true [citation needed, may not be the case anymore, Jan/2022]
  // so we also check el.naturalWidth, which equals 0 until the image loads

  if (!item.isBackgroundImage) {
    if (el.naturalWidth === 0 || !el.complete) {
      // Wait for the load event, then call load image
      el.addEventListener('load', function cb() {
        el.removeEventListener('load', cb);
        loadImage(item);
      });
      return;
    }
  } // Trigger loading event, and stop if cancelled


  if (trigger(el, 'rimg:loading')) return; // Mark as loading

  el.setAttribute('data-rimg', 'loading'); // Get element size. This is used as the ideal display size.

  var size = getElementSize(item.el);
  size.width *= item.scale;
  size.height *= item.scale;

  if (item.placeholder) {
    // Load a placeholder image first, followed by the full image. Force the
    // element to keep its dimensions while it loads. If the image is smaller
    // than the element size, use the image's size. Density is taken into account
    // for HiDPI devices to avoid blurry images.
    if (!item.isBackgroundImage) {
      el.setAttribute('width', Math.min(Math.floor(item.max.width / item.density), size.width));
      el.setAttribute('height', Math.min(Math.floor(item.max.height / item.density), size.height));
    }

    setImage(item, item.placeholder, true, function () {
      return loadFullImage(item, size);
    });
  } else {
    loadFullImage(item, size);
  }
}

/**
 * Prepare an element to be displayed on the screen.
 *
 * Images have special logic applied to them to swap out the different sources.
 *
 * @fires rimg:enter
 *        The element is entering the viewport.
 *
 * @param {HTMLElement} el
 * @param {Settings} options
 */

function load(el, options) {
  if (!el) return;
  trigger(el, 'rimg:enter');
  var item = parseItem(el, options);

  if (item.isImage) {
    if (!item.isBackgroundImage) {
      el.setAttribute('data-rimg-template-svg', el.getAttribute('srcset'));
    }

    loadImage(item);
  }
}

/**
 * Reset an element's state so that its image can be recalculated.
 *
 * @fires rimg:update
 *        The element is being updated.
 *
 * @param {HTMLElement} el
 * @param {Settings} options
 */

function update(el, options) {
  if (!el) return;
  trigger(el, 'rimg:update');
  var item = parseItem(el, options);

  if (item.isImage) {
    if (!item.isBackgroundImage) {
      el.setAttribute('data-rimg', 'lazy');
      el.setAttribute('srcset', el.getAttribute('data-rimg-template-svg'));
    }

    loadImage(item);
  }
}

/**
 * Returns true if the element is within the viewport.
 * @param {HTMLElement} el
 * @returns {Boolean}
 */
function inViewport(el) {
  if (!el.offsetWidth || !el.offsetHeight || !el.getClientRects().length) {
    return false;
  }

  var root = document.documentElement;
  var width = Math.min(root.clientWidth, window.innerWidth);
  var height = Math.min(root.clientHeight, window.innerHeight);
  var rect = el.getBoundingClientRect();
  return rect.bottom >= 0 && rect.right >= 0 && rect.top <= height && rect.left <= width;
}

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

function rimg() {
  var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-rimg="lazy"]';
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // Intersections
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        io.unobserve(entry.target);

        load(entry.target, options);
      }
    });
  }, {
    // Watch the viewport, with 20% vertical margins
    rootMargin: '20% 0px'
  });
  /**
   * @typedef {Object} PublicApi
   */

  var api = {
    /**
     * Track a new selector, element, or nodelist for lazy-loading.
     * @type Function
     * @param {String|HTMLElement|NodeList} selector
     */
    track: function track() {
      var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-rimg="lazy"]';
      var els = querySelector(selector);

      for (var i = 0; i < els.length; i++) {
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
    update: function update$1() {
      var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-rimg="loaded"]';
      var els = querySelector(selector);

      for (var i = 0; i < els.length; i++) {
        update(els[i], options);
      }
    },

    /**
     * Stop tracking element(s) for lazy-loading.
     * @type Function
     * @param {String|HTMLElement|NodeList} selector
     */
    untrack: function untrack() {
      var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-rimg]';
      var els = querySelector(selector);

      for (var i = 0; i < els.length; i++) {
        io.unobserve(els[i]);
      }
    },

    /**
     * Manually load images.
     * @type Function
     * @param {String|HTMLElement|NodeList} selector
     */
    load: function load$1() {
      var selector = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-rimg]';
      var els = querySelector(selector);

      for (var i = 0; i < els.length; i++) {
        load(els[i], options);
      }
    },

    /**
     * Unload all event handlers and observers.
     * @type Function
     */
    unload: function unload() {
      io.disconnect();
    }
  }; // Add initial elements

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

module.exports = rimg;
