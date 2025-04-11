# shopify-price-ui

This library can be used anywhere the price appears in Shopify products (product page, product cards, featured product, quickshop).

## Installation

### Liquid

To install into your theme, you just need to run `npm i @pixelunion/shopify-price-ui`.

Once you have installed this package into your theme, install the following snippet in a file location accessible whenever a product is displayed. Such as `theme.liquid` or other layout files.

```liquid
{% inject '@pixelunion/shopify-price-ui/price-ui-globals' %}
```

Additionally, you may install the following two snippets in the intended rendering location for the product price, and product badge (if applicable).

```liquid
{% inject '@pixelunion/shopify-price-ui/price-ui %}
```

```liquid
{% inject '@pixelunion/shopify-price-ui/price-ui-badge %}
```

### Javascript

#### Import the PriceUI and PriceUI badge

```javascript
import {
  PriceUI,
  PriceUIBadge,
} from '@pixelunion/shopify-price-ui';
```

#### Construct new PriceUI and PriceUIBadge instances

```javascript
this.priceUI = new PriceUI(this.el.querySelector('[data-price-ui]'));
this.priceUIBadge = new PriceUIBadge(this.el.querySelector('[data-price-ui-badge]'));
```

> :warning: Ensure that you scope your queries to the intended object to avoid taking control of a different PriceUI or PriceUIBadge

#### Update the PriceUI and PriceUIBadge on variant change

```javascript
this.priceUI.load(
  product,
  {
    variant: variant,
    formatter: price => price,
    handler: (priceUIFragment, product, options) => priceUIFragment,
  }
);
this.priceUIBadge.load(
  product,
  {
    variant: variant,
    style: 'percent',
    formatter: price => price,
    handler: (priceUIBadgeFragment, product, options) => priceUIBadgeFragment,
  },
);
```

`formatter`:  is used by currency converters to modify a cents-value into a user-friendly currency format

`handler`: is used to completely overwrite the contents of the supplied fragment. This allows themes additional control for states that are not included by default

## Locales

Locale strings are provided for 12 different languages, and are copied into their respective locale files at build time.

## Templating

Included in this module is a snippet used for templating that is included at build time in your output snippets folder (typically `build/snippets`) named `price-ui-templates.liquid`.

This file can be copied locally into your source folder and modified if your theme requires more advanced templating than what is available by default.

Included below is a truncated version of the file:

```Liquid
{%- capture _price -%}<span class="money" data-price>{%- if value != blank -%}{{- value | money -}}{%- endif -%}</span>{%- endcapture -%}

{%- if template == 'price' -%}
  {{- _price -}}
{%- elsif template == 'price-percent' -%}
  <span data-price-percent>{%- if value != blank -%}{{- value -}}{%- endif -%}</span>
{%- elsif template == 'price-min' -%}
  <span class="price-min" data-price-min>{{ _price }}</span>
{%- endif -%}
```

> :warning: Liquid attributes, and data attributes must remain intact. The template file includes comments to indicate usage requirements.
