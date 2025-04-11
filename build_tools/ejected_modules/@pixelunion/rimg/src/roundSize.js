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
export default function roundSize(size, multiple = 32, maxLimit = Infinity) {
  return size === 0 
    ? multiple 
    : Math.min(Math.ceil(size / multiple) * multiple, maxLimit);
}
