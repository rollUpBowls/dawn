# shopify-variants-ui

This library can be used anywhere the product appears (product page, featured product, quickshop).

## Installation

### Liquid

To install into your theme, you just need to run `npm i @pixelunion/shopify-variants-ui`.

Once you have installed this package into your theme, install the following snippet in a file location accessible whenever a product form is displayed.

```liquid
{% assign variant_selection_id = 'variant-selection-id' %}
{% assign style = 'select' %}
{% assign product = product %}
{% assign selected_variant = variant %}
{% assign enable_swatches = settings.enable_swatches %}
{% assign swatches_shape = settings.swatches_shape %}
{% assign swatches_option_trigger = settings.swatches_option_trigger %}
{% assign swatches_option_style = settings.swatches_option_style %}
{% assign swatches_product_page_size = settings.swatches_product_page_size %}
{% assign swatches_custom_colors = settings.swatches_custom_colors %}
{% assign swatch_file_type = 'assets' %} // Or 'files' (depending how the theme is setup) Default: 'assets'
{% inject '@pixelunion/shopify-variants-ui/variant-selection' %}
```

Additionally, you may install the following snippet in the intended rendering location for the product options controls.

```liquid
{% assign variant_selection_id = 'variant-selection-id' %}
{% inject '@pixelunion/shopify-variants-ui/options-selection' %}
```

> The options-selection web component is capable of remotely controlling a form based on the variant-selection attribute, which refers
> to the variant-selection web component's ID.

**Warning!**
Take care to ensure that variant_selection_id will not result in duplicate IDs on the page at once! Duplicated IDs will cause unpredicable results.

### Javascript

#### Import the Javascript

```javascript
import '@pixelunion/shopify-variants-ui';
```

> Variants UI uses web components, making it only necessary to import the self executing code

#### List to variant changes, request product or variant

```javascript
const variantSelection = document.querySelector('[data-variant-selection]');

variantSelection.addEventListener('variant-change', event => console.log(event.detail.variant));
variantSelection.getProduct().then(product => console.log(product));
variantSelection.getVariant().then(variant => console.log(variant));
```

## Locales

Locale strings are provided for 12 different languages, and are copied into their respective locale files at build time.

## Templating

Included in this module are two snippets used for templating that is included at build
time in your output snippets folder (typically `build/snippets`) named `options-radios.liquid` and `options-select.liquid`.

These file can be copied locally into your source folder and modified if your theme requires more advanced templating than what is available by default.

> :warning: Liquid attributes, and data attributes must remain intact. The template file includes comments to indicate usage requirements.
