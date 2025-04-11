# Complementary Products Block

## Installation

To install this package in your theme, you'll need to run:

```
npm install @pixelunion/pxs-complementary-products
```

or include it into your themes `package.json` file with:

```
"@pixelunion/pxs-complementary-products": "3.1.0"
```

Once you've installed the package in your theme, a snippet will become available and can be injected into a section with:

```complementary-product-block.liquid
{% inject '@pixelunion/pxs-complementary-products/complementary-product-block' %}
```

## Liquid Usage

This shared component takes several liquid variables to customize the content.

All variables should be assigned or captured before calling `{% inject '@pixelunion/pxs-complementary-products/complementary-product-block' %}`.

### Complementary-product-block Snippet

| Variable | | Type | Description |
| --- | --- | --- | --- |
| `block` | Required | `{Object}` | The block object. |
| `heading` | Required | `{String}` | The heading for the block. |
| `products_per_slide` | Optional | `{Integer}` | The number of products to include on each slide. |
| `wrapper_class` | Optional | `{String}` | Classes to apply to the component wrapper. |
| `format_currency` | Optional | `{Boolean}` | If true, show price with currency. |
| `crop_thumbnails` | Optional | `{Boolean}` | If true, crop product thumbnails. |

### Complementary-product snippet

The only variable passed into this snippet from the parent snippet is `product`.

## Javascript usage

One script is included with this component:

### ComplementaryProducts.js

This script fetches and injects the product recommendations. Unlike most of our shared sections, this will be initialized by the StaticProduct class in your theme.

The class takes one JSON argument containing several properties:

| Variable | | Type | Description |
| --- | --- | --- | --- |
| sectionEl | Required | `{Element}` | The parent section element |
| sectionId | Required | `{String}` | The parent section ID |
| productId | Required | `{String}` | The product ID on which to base the recommendations |
| productRecommendationsRoute | Required | `{String}` | The route for the recommendation request, usually stored in the theme object as something like `window.Theme.routes.product_recommendations_url` or `window.PXUTheme.routes.product_recommendations_url` |
| limit | Required | `{Integer}` | The maximum number of results to fetch. Minimum `1`, maximum `10`. |
| includeIndicatorDots | Optional | `{Boolean}` | Whether to include slide indicator dots under the slider. Default: false |
| arrowShape | Optional | `{String}` | The arrow shape. Default: `{ x0: 10, x1: 60, y1: 50, x2: 65, y2: 45, x3: 20, }` |

A new instance of the class might look like this:

```js
import ComplementaryProducts from '@pixelunion/pxs-complementary-products';

export default class Product {
  constructor(section) {
    this.el = section.el;
    this.sectionId = section.id;
    this.product = this.data.product;

    const complementaryProductsEl = this.el.querySelector('[data-complementary-products]');
    if (complementaryProductsEl) {
      this.complementaryProducts = new ComplementaryProducts({
        sectionEl: this.el,
        sectionId: this.sectionId,
        productId: this.product.id,
        productRecommendationsRoute: window.Theme.routes.product_recommendations_url,
        includeIndicatorDots: true,
        limit: 6,
        arrowShape: {
          x0: 10,
          x1: 60,
          y1: 50,
          x2: 65,
          y2: 45,
          x3: 20,
        },
      });
    }
  }
}
```

## Languages

There are a few translations included with this section, which may be overridden by the theme:

```json
{
  "sections": {
    "product": {
      "blocks": {
        "complementary_products": {
          "name": "Complementary products",
          "settings": {
            "paragraph": {
              "content": "To select complementary products, add the Search & Discovery app. [Learn more](https:\/\/shopify.dev\/themes\/product-merchandising\/recommendations)"
            },
            "heading": {
              "label": "Heading"
            }
          }
        }
      }
    }
  }
}
```

## Styles

One scss file is included with the component for basic styling. You will need to import this file in your `theme.css` or build your own styles for the slider

```scss
@import "../../../node_modules/@pixelunion/pxs-complementary-products/src/styles/complementary-product";
```

**Note**: The filepath may be slightly different depending on the theme.

### CSS variables

In addition, the following variables are available for use. Note that there are a variable number of `slide items` per slide, stacked vertically (by default), each representing a single product:

| Variable | Description | Default value |
| --- | --- | --- |
| `--slide-item-padding` | Padding around the outside of the slide item/product card | 1rem |
| `--slide-item-outer-gap` | Gap between product cards which are stacked two to a slide | 1rem |
| `--slide-item-inner-gap` | Gap between the product image and the product details | 1rem |
| `--slide-item-border-color` | Color of the border around the product card / slide item | black |
| `--slide-item-border-thickness` | Thickness of the border around the product card / slide item | 1px |
| `--slider-dot-gap` | Flickity dot gap | Default: `0.5rem` |
| `--slider-dot-size` | Flickity dot size | Default: `0.5rem` |
| `--slider-dot-color` | Flickity page dot color |  #cacaca |
| `--slider-active-dot-color` | Active Flickity page dot color | #787878 |

### Usage:

You may override any of the default variable values by setting new values on `.complementary-products`.

```scss
.complementary-products {
  --slide-item-padding: 1rem;
  --slide-item-outer-gap: 1rem;
  --slide-item-inner-gap: 1rem;
  --slide-item-border-color: black;
  --slide-item-border-thickness: 1px;
  --slider-dot-gap: 1rem;
  --slider-dot-size: 1rem;
  --slider-dot-color: #cacaca;
  --slider-active-dot-color: #787878;
}
```

Individual elements may also be styled on a per-theme basis by simply adding new styles after importing the default scss file.
