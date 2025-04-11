/**
 * Implementation of Shopify's img_url Liquid filter, for use with Liquid.js
 *
 * @param {Object} image
 *      Stand-in for a Shopify img object. See https://help.shopify.com/en/themes/liquid/objects/image
 *      for details of possible/expected properties.
 *
 * @param {String} size (optional)
 *      Shopify's image size string of the format '123x456', '123x', '456x'.
 *      Defaults to 'small', which is a 100x100 image.
 *
 * @param {String} args (optional)
 *      Crop, scale, and format can be passed by overloading the function.
 *      Property name must be passed as a parameter and property value passed as
 *      the next parameter (for compatibility with Liquid.js).
 *      ex `img_url(image, size, 'crop', 'center', 'scale', 2);`
 */

function imgUrl({ src }, size, ...args) {
  const parameters = {
    size: size || 'small',
    crop: null,
    scale: 1,
    format: 'jpg',
  };

  for (let i = 0; i < args.length; i += 2) {
    parameters[args[i]] = args[i + 1];
  }

  // will fail if no extension included but should be OK for now.
  const srcWithoutExtension = (/.*(?=\..{3,4}$)/g).exec(src)[0];

  const cropString = `${parameters.crop ? `_crop_${parameters.crop}` : ''}`;
  const scaleString = parameters.scale > 1 ? `@${parameters.scale}x` : '';
  const formatString = parameters.format === 'pjpg' ? '.progressive.jpg' : '.jpg';

  return `${srcWithoutExtension}_${parameters.size}${cropString}${scaleString}${formatString}?v=1234567890`;
}

module.exports = imgUrl;
