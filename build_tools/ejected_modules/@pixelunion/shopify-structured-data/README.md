# Shopify Structured Data

A paskit plugin to add schema.org metadata to Shopify stores.</i></p>

## Quick start

Add as a theme dependency:

    npm i --save pixelunion/shopify-structured-data

Import snippet in `layouts/theme.liquid`:

    {% include 'structured-data' %}

## Snippets

### `structured-data.liquid`

Outputs appropriate JSON-LD tags for the current template. Designed to be included from the theme's layout files.
