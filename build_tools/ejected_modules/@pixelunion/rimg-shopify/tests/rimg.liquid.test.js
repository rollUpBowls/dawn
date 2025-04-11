const Liquid = require('liquidjs');
const jsdom = require('jsdom');
const path = require('path');
const imgUrl = require('./helpers/imgUrl');
const split = require('./helpers/split');

const { JSDOM } = jsdom;
const engine = Liquid({
  root: path.resolve(__dirname, '../liquid/'),
  extname: '.liquid',
});

engine.registerFilter('img_url', imgUrl);
engine.registerFilter('split', split);

/**
 * Generates a mock image object to imitate Shopify's version.
 *
 * Defaults to:
 *  src: '//test.test/my_image.jpg',
    width: 600,
    height: 300,
 * @param {Object} properties
 *    Any properties to override defaults, or add to image object.
 *
 * @returns {Object} Shopify-style image object
 */
const image = (properties = {}) => {
  const defaults = {
    src: '//test.test/my_image.jpg',
    width: 600,
    height: 300,
  };

  const newImage = { ...defaults, ...properties };
  newImage.aspect_ratio = newImage.width / newImage.height;

  return newImage;
};

/**
 * Parses HTML markup and returns a JSDOM fragment
 * @param {String} markup
 *    HTML markup
 */
const createFragment = markup => JSDOM.fragment(markup);

/**
 * Renders the rimg liquid template
 * @param {Object} options
 *    Object containing any of the parameters supported by rimg,
 *    to be passed to the liquid template
 *
 * @returns {String} Rendered template
 */
const runRimg = (options = {}, markupCallback = createFragment) => {
  const defaults = {
    img: image(),
    // Passing all these blank values keeps results in line with Shopify's Liquid
    size: '',
    crop: '',
    class: '',
    style: '',
    blank: '',
  };

  const rimgOptions = { ...defaults, ...options };
  return engine.renderFile('rimg', rimgOptions)
    .then(markup => markupCallback(markup));
};


/**
 * @param {String} urlString
 *    String in which to search for an img_url size string
 *
 * @returns {String}
 *    Matched size string, from 0x0 to 99999x99999, or null
 */
const extractSize = urlString => urlString.match(/\d{1,5}x\d{1,5}/g)[0];


describe('With lazy loading off', () => {
  describe('when uncropped', () => {
    test('If no size provided, original image size is used', () => {
      return runRimg()
        .then((dom) => {
          const src = dom.querySelector('img').getAttribute('src');
          expect(src).toBe('//test.test/my_image_600x300.jpg?v=1234567890');
        });
    });

    test('If width is provided, height is calculated to match original image aspect ratio', () => {
      return runRimg({ size: '300x' })
        .then((dom) => {
          const src = dom.querySelector('img').getAttribute('src');
          expect(src).toBe('//test.test/my_image_300x150.jpg?v=1234567890');
        });
    });

    test('If height is provided, width is calculated to match original image aspect ratio', () => {
      return runRimg({ size: 'x100' })
        .then((dom) => {
          const src = dom.querySelector('img').getAttribute('src');
          expect(src).toBe('//test.test/my_image_200x100.jpg?v=1234567890');
        });
    });

    test('If height and width are provided, image fits within requested size and at original aspect ratio (AR > 1)', () => {
      return runRimg({ size: '300x300' })
        .then((dom) => {
          const src = dom.querySelector('img').getAttribute('src');
          expect(src).toBe('//test.test/my_image_300x150.jpg?v=1234567890');
        });
    });

    test('If height and width are provided, image fits within requested size and at original aspect ratio (AR < 1)', () => {
      return runRimg({
        img: image({ width: 300, height: 600 }),
        size: '300x300',
      })
        .then((dom) => {
          const src = dom.querySelector('img').getAttribute('src');
          expect(src).toBe('//test.test/my_image_150x300.jpg?v=1234567890');
        });
    });

    test('If sufficient resolution available, srcset contains 4 densities', () => {
      return runRimg({
        img: image({ width: 3000, height: 3000 }),
        size: '300x300',
      })
        .then((dom) => {
          const srcset = dom.querySelector('img').getAttribute('srcset');
          expect(srcset.split(',').length).toEqual(4);
        });
    });

    test('Max srcset resolution is less than max available image resolution', () => {
      const width = 1000;
      const height = 1000;

      const sizes = [
        '999x999',
        '450x450',
        '500x500',
        '250x250',
        '1000x1000',
        '1001x1001',
        '1500x1500',
        '800x100',
        '100x800',
        '1100x200',
        '200x1100',
      ];

      return Promise.all(
        sizes.map((size) => {
          return runRimg({
            img: image({ width, height }),
            size,
          })
            .then((dom) => {
              const srcset = dom.querySelector('img').getAttribute('srcset').split(',');
              const resolution = extractSize(srcset[srcset.length - 1]).split('x');
              expect(parseInt(resolution[0], 10)).toBeLessThanOrEqual(width);
              expect(parseInt(resolution[1], 10)).toBeLessThanOrEqual(height);
            });
        }),
      );
    });
  });

  describe('when cropped', () => {
    test('If height and width are provided, image matches requested aspect ratio (AR > 1)', () => {
      return runRimg({
        size: '300x300',
        crop: 'center',
      })
        .then((dom) => {
          const src = dom.querySelector('img').getAttribute('src');
          expect(src).toBe('//test.test/my_image_300x300_crop_center.jpg?v=1234567890');
        });
    });

    test('If height and width are provided, image matches requested aspect ratio (AR < 1)', () => {
      return runRimg({
        img: image({ width: 300, height: 600 }),
        size: '300x300',
        crop: 'center',
      })
        .then((dom) => {
          const src = dom.querySelector('img').getAttribute('src');
          expect(src).toBe('//test.test/my_image_300x300_crop_center.jpg?v=1234567890');
        });
    });

    test('If requested size larger than image, image limited to max res and constrained to requested aspect ratio (AR > 1)', () => {
      return runRimg({
        size: '3000x3000',
        crop: 'center',
      })
        .then((dom) => {
          const src = dom.querySelector('img').getAttribute('src');
          expect(src).toBe('//test.test/my_image_300x300_crop_center.jpg?v=1234567890');
        });
    });

    test('If requested size larger than image, image limited to max res and constrained to requested aspect ratio (AR < 1)', () => {
      return runRimg({
        img: image({ width: 300, height: 600 }),
        size: '3000x3000',
        crop: 'center',
      })
        .then((dom) => {
          const src = dom.querySelector('img').getAttribute('src');
          expect(src).toBe('//test.test/my_image_300x300_crop_center.jpg?v=1234567890');
        });
    });
  });
});

describe('Sizes should be consistent', () => {
  const checkSizeConsistency = (rimgOptions = {}) => {
    const defaultRimgOptions = {
      img: image({ width: 3000, height: 3000 }),
      size: '500x500',
    };

    let size = null;
    return Promise.all([
      // standard image src and srcset 1x
      runRimg({
        ...defaultRimgOptions,
        ...rimgOptions,
      })
        .then((dom) => {
          const srcset = dom.querySelector('img').getAttribute('srcset').split(',');
          const src = dom.querySelector('img').getAttribute('src');
          if (!size) {
            size = extractSize(srcset[0]);
          }
          expect(extractSize(srcset[0])).toBe(size);
          expect(extractSize(src)).toBe(size);
        }),
      // background image
      runRimg(
        {
          ...defaultRimgOptions,
          ...rimgOptions,
          background: true,
        },
        markup => createFragment(`<div ${markup}></div>`),
      )
        .then((dom) => {
          const style = dom.querySelector('div').getAttribute('style');
          if (!size) {
            size = extractSize(style);
          }
          expect(extractSize(style)).toBe(size);
        }),
      // Lazy loading
      runRimg({
        ...defaultRimgOptions,
        ...rimgOptions,
        lazy: true,
      })
        .then((dom) => {
          const src = dom.querySelector('img').getAttribute('src');
          const srcset = dom.querySelector('img').getAttribute('srcset');

          // with lazy: true, srcset is an svg placeholder
          const srcsetWidth = srcset.match(/(?<=width=')(\d)+/i)[0];
          const srcsetHeight = srcset.match(/(?<=height=')(\d)+/i)[0];

          // also check the noscript img
          const noScriptDom = createFragment(dom.querySelector('noscript').innerHTML);
          const noScriptSrc = noScriptDom.querySelector('img').getAttribute('src');
          const noScriptSrcset = noScriptDom.querySelector('img').getAttribute('srcset').split(',');

          if (!size) {
            size = extractSize(src);
          }
          expect(extractSize(src)).toBe(size);
          expect(`${srcsetWidth}x${srcsetHeight}`).toBe(size);
          expect(extractSize(noScriptSrc)).toBe(size);
          expect(extractSize(noScriptSrcset[0])).toBe(size);
        }),
    ]);
  };

  test('When cropped, img, bg image, placeholder image and noscript img sizes match', () => {
    return Promise.all([
      checkSizeConsistency({ crop: 'center' }),
      checkSizeConsistency({
        img: image({ width: 1000, height: 300 }),
        size: '500x500',
        crop: 'center',
      }),
    ]);
  });

  test('When uncropped, img, bg image, placeholder image and noscript img sizes match', () => {
    return Promise.all([
      checkSizeConsistency(),
      checkSizeConsistency({
        img: image({ width: 1000, height: 300 }),
        size: '500x500',
      }),
    ]);
  });
});
