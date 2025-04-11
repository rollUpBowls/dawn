# Age gate

This repository contains the code required to create a site-wide and page-based age gate for Shopify themes.

## Installation

To install into your theme, you just need to run `npm i @pixelunion/age-gate`.

Once you have installed this package into your theme, a snippet will be available and can be included into a section with `{% inject '@pixelunion/age-gate/age-gate' %}`. Any of the parameters will need to be captured or assigned before injecting.

## Liquid Usage

## Theme settings

These settings must be added to the settings_schema.json file.

```json
  {
    "name": "t:settings_schema.age_gate.name",
    "settings": [
      {
        "type": "checkbox",
        "id": "enable_age_gate_site_wide",
        "label": "t:settings_schema.age_gate.enable_site_wide.label",
        "default": false
      },
      {
        "type": "number",
        "id": "age_gate_site_wide_min_age",
        "label": "t:settings_schema.age_gate.minimum_age.label",
        "default": 18
      },
      {
        "type": "text",
        "id": "age_gate_heading",
        "label": "t:settings_schema.age_gate.heading.label",
        "default": "Age Verification"
      },
      {
        "type": "text",
        "id": "age_gate_description",
        "label": "t:settings_schema.age_gate.description.label",
        "default": "Please enter your date of birth for full access."
      },
      {
        "type": "checkbox",
        "id": "show_age_gate_logo",
        "label": "t:settings_schema.age_gate.show_logo.label",
        "default": true,
        "info": "t:settings_schema.age_gate.show_logo.info"
      }
    ]
  }
```

## Javascript

No Javascript is included with this section, but the sections manager script tag is included for any themes that may need it.

## Locales

No translations are included with this section.
