# Shopify Asyncview

> A simple library for loading shopify templates asynchronously

## Table of contents

- [Shopify Asyncview](#shopify-asyncview)
  - [Table of contents](#table-of-contents)
  - [Quick start](#quick-start)
  - [Javascript](#javascript)
    - [`AsyncView.load(url, query, options)`](#asyncviewloadurl-query-options)
      - [Parameters](#parameters)
  - [Liquid](#liquid)

## Quick start

**Add `shopify-asyncview` as dependency**

`npm install pixelunion/shopify-asyncview`

## Javascript

### [`AsyncView.load(url, query, options)`](#asyncview-load)

Load a template asynchronously

#### Parameters

- `url` *string*: Url of template to fetch
- `query` *Object*: Query must contain a `view` parameter indicating the view to be loaded. Additional query parameters may also be included here
- `options` *Object (optional)*
- `options.hash` *String (optional)*: Hash, to be compared for cache-busting purposes. If cached content is available and hash matches, then the cached content will be returned instead of making a request to the server.

**Example without caching**

```javascript
import AsyncView from 'shopify-asyncview';

AsyncView.load(
  '/cart', // template name
  { view: 'mini' }, // view name (suffix)
)
  .then(({ html, data }) => {
    // key name 'content' is based  on the value of data-html in the template
    document.body.innerHTML = html.content;

    // Content of [data-data] element is parsed for JSON and available on the data object
    window.alert(`Your cart has ${data.item_count} item(s)!`);
  })
  .catch(() => {
    // some error handling
  });

```

**Example with caching**

If a hash object is provided, views will be cached in sessionStorage. The cache is checked before making a request to the server, and if the stored hash(s) and the hash(s) passed to `.load` match, the cached copy will be returned.

```javascript
import AsyncView from 'shopify-asyncview';

const hash = document.querySelector('[data-settings-hash]').dataset.settingsHash;

AsyncView.load(
  '/products/my-product', // url
  { view: 'ajax' }, // view name (suffix)
  { hash },
)
  .then(({ html, data }) => {
    // key name 'content' is based  on the value of data-html in the template
    document.body.innerHTML = html.content;

    // Content of [data-data] elements is parsed for JSON and available on the data object
    window.alert(`Your cart has ${data.cart.item_count} item(s)!`);
  })
  .catch(() => {
    // some error handling
  });

```

## Liquid

Any elements with `data-data="value"` will have their innerHTML parsed as json and passed as `param.data.value` to the `.then` callback.

If the first element with a `data-data` attribute has no value, the parsed content of that element will be assigned to the `param.data` key directly and any subsequent `data-data` elements will be ignored. If no `data-data` elements exist then an empty object will be returned to the callback. Otherwise, unparsable content will cause an error to be thrown.

Similarly, any elements with `data-html="value"` will get their innerHTML attached to the `param.html.value` key.

If the first element with a `data-html` attribute has no value, the innerHTML of that element will be assigned to the `param.html` key directly, and any subsequent elements with `data-html` attributes will be ignored.

**Example without caching**

`/templates/cart.mini.liquid`

```liquid
{% layout none %}

<template data-data>
  {
    "item_count": {{ cart.item_count | json }}
  }
</template>

<template data-html="content">
  {% for item in cart.items %}
    <div>{{ item.product.title }}<div>
  {% endfor %}
</template>
```

**Example with caching**

`/templates/product.ajax.liquid`

```liquid
{% layout none %}

<template data-options>
  {
    "hash": {{ settings | json | sha256 }}
  }
</template>

<template data-data="cart">
  {
    "item_count": {{ cart.item_count | json }}
  }
</template>

<template data-html="content">
  <div>{{ product.title }}</div>
</template>
```

`/templates/collection.liquid`

```liquid
<script data-settings-hash="{{ settings | json | sha256 }}"></script>
```
