/**
 * The default template render function. Turns a template string into an image
 * URL.
 *
 * @param {String} template
 * @param {Size} size
 * @returns {String}
 */
function defaultTemplateRender(template, size) {
  return template.replace('{size}', `${size.width}x${size.height}`)
}

/**
 * @type Settings
 */
const defaults = {
  scale: 1,
  template: false,
  templateRender: defaultTemplateRender,
  max: { width: Infinity, height: Infinity},
  round: 32,
  placeholder: false,
  crop: null,
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
  const attr = `data-rimg-${name}`;
  if (!el.hasAttribute(attr)) return options[name] || defaults[name];

  const value = el.getAttribute(attr);

  return sanitize
    ? sanitize(value)
    : value;
}

/**
 * Sanitize data attributes that represent a size (in the form of `10x10`).
 *
 * @param {String} value
 * @returns {Object} An object with `width` and `height` properties.
 */
function parseSize(value) {
  value = value.split('x');
  return { width: parseInt(value[0], 10), height: parseInt(value[1], 10) };
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
export default function parseItem(el, options = {}) {
  const isImage = el.hasAttribute('data-rimg-template');

  /**
   * @typedef {Settings} Item
   */
  return {
    el,

    // Type of element
    isImage,
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
    crop: getData(el, 'crop', options, processCropValue),
  };
}
