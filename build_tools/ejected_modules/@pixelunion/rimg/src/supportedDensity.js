/**
 * Return the maximum supported density of the image, given the container.
 *
 * @param {Item} item
 * @param {Size} size
 */

export default function supportedDensity(item, size) {
  return Math.min(
    Math.min(Math.max(item.max.width / size.width, 1), item.density),
    Math.min(Math.max(item.max.height / size.height, 1), item.density),
  ).toFixed(2);
}
