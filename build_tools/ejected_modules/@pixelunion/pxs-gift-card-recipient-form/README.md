# Gift card recipient form

## Table of contents

- [Installation](#installation)
- [Theme settings](#theme-settings)
- [Snippets](#snippets)
- [Styles](#styles)
- [Javascript](#javascript)
- [Translations](#translations)

## Installation

To install this package in your theme, you'll need to run:

```
npm install @pixelunion/pxs-gift-card-recipient-form
```

or include it into your themes `package.json` file with:

```
"@pixelunion/pxs-gift-card-recipient-form": "^1.0.0"
```

## Theme settings

In order to display the gift card recipient form, the following theme setting must be added to the `Form` or `Buy buttons` block:

```.json
{
  "type": "checkbox",
  "id": "show_gift_card_recipient_form",
  "label": "t:sections.product.blocks.form.show_gift_card_recipient_form.label",
  "info": "t:sections.product.blocks.form.show_gift_card_recipient_form.info",
  "default": false
}
```

## Snippets

### Recipient form

The following snippet should be injected within the product form:

```.liquid
{% inject '@pixelunion/pxs-gift-card-recipient-form/recipient-form' %}
```

### Parameters

The following parameters can be assigned to customize the component:

| Variable | | Type | Description | Default |
|---|---|---|---|---|
| `form` | Required | `{Object}` | The form object. | `form` |
| `section` | Required | `{Object}` | The section object. | `section` |
| `show_recipient_form` | Required | `{Boolean}` | If true, show the gift card recipient form. | `false` |
| `show_recipient_form_placeholders` | Optional | `{Boolean}` | If true, show recipient form placeholder attributes. | `false` |
| `show_recipient_form_labels` | Optional | `{Boolean}` | If true, show recipient form input labels. | `true` |
| `show_recipient_form_max_characters_message` | Optional | `{Boolean}` | If true, show the recipient form max characters message. | `true` |
| `recipient_form_textarea_rows` | Optional | `{Number}` | A numerical value to specify the number of textarea rows. | `5` |
| `recipient_form_textarea_classes` | Optional | `{String}` | A space separated list of class names added to recipient form textarea. | `''` |
| `recipient_form_input_classes` | Optional | `{String}` | A space separated list of class names added to recipient form inputs. | `''` |
| `recipient_form_label_classes` | Optional | `{String}` | A space separated list of class names added to recipient form labels. | `''` |
| `recipient_form_label_position` | Optional | `{String}` | The recipient form input label position, either 'top', or 'bottom'. | `top` |

### Usage

```.liquid
{% liquid
  assign show_recipient_form = block.settings.show_gift_card_recipient_form
  assign show_recipient_form_placeholders = true
  assign show_recipient_form_labels = false
  assign show_recipient_form_max_characters_message = false
  assign recipient_form_textarea_rows = 6
  assign recipient_form_textarea_classes = 'Hello world'
  assign recipient_form_input_classes = 'Hello world'
  assign recipient_form_label_classes = 'Hello world'
  assign recipient_form_label_position = 'bottom'
%}

{% inject '@pixelunion/pxs-gift-card-recipient-form/recipient-form' %}
```

## Styles

Basic styles are included in this package, however, you'll need to import this file into your theme:

```.scss
@import "../../../../node_modules/@pixelunion/pxs-gift-card-recipient-form/src/styles/recipient-form.scss";
```

Please note that the file path may be slightly different depending on the theme.

### CSS variables

The following CSS variables can be used to customize the component:

| Variable | Description | Default value |
|---|---|---|
| `--recipient-disclosure-top-margin` | The disclosure top margin. | `0` |
| `--recipient-disclosure-bottom-margin` | The disclosure bottom margin. | `0` |
| `--recipient-form-field-gap` | The gap between recipient form fields. | `0` |
| `--recipient-form-label-gap` | The gap between the recipient form labels. | `0` |
| `--recipient-form-label-margin` | The margin between the disclosure label and checkbox. | `6px` |
| `--recipient-form-checkbox-width` | The recipient form checkbox width. | `12px` |
| `--recipient-form-checkbox-border-width` | The recipient form checkbox border width. | `1px` |
| `--recipient-form-checkbox-border-color` | The recipient form checkbox border color. | `#000000` |
| `--recipient-form-checkbox-border-radius` | The recipient form checkbox border radius. | `0` |
| `--recipient-form-checkbox-svg-color` | The recipient form checkbox svg color. | `inherit` |
| `--recipient-form-error-color` | The recipient form error color. | `#CC3333` |

### CSS variables (in use)

```.scss
.recipient-disclosure {
  #{"--recipient-disclosure-top-margin"}: 10px;
  #{"--recipient-disclosure-bottom-margin"}: 10px;
  #{"--recipient-form-field-gap"}: 10px;
  #{"--recipient-form-label-gap"}: 10px;
  #{"--recipient-form-label-margin"}: 10px;
  #{"--recipient-form-checkbox-width"}: 16px;
  #{"--recipient-form-checkbox-border-width"}: 2px;
  #{"--recipient-form-checkbox-border-color"}: #777777;
  #{"--recipient-form-checkbox-border-radius"}: 2px;
  #{"--recipient-form-checkbox-svg-color"}: #000000;
  #{"--recipient-form-error-color"}: #000000;
}
```

## Javascript

In order for the Gift card recipient form to function, you'll first need to import the Javascript module:

```.js
import RecipientForm from '@pixelunion/pxs-gift-card-recipient-form';
```

Once the module has been imported, you can create a new class instance:

```.js
const recipientFormEl = this.el.querySelector('[data-recipient-form]');

if (recipientFormEl) {
  this.recipientForm = new RecipientForm(this.el);
}
```

## Translations

There are a few translations included with this package that may be overwritten by the theme:

en.default.json
```.json
{
  "recipient": {
    "form": {
      "checkbox_label": "I want to send this as a gift",
      "email_label": "Recipient email",
      "email_placeholder": "Recipient email *",
      "error_message": "Email is not valid",
      "name_label": "Recipient name (optional)",
      "name_placeholder": "Recipient name (optional)",
      "message_label": "Message (optional)",
      "message_placeholder": "Message (optional)",
      "max_characters": "{{ max_characters }} characters max",
      "send_on_label": "Send on (optional)",
      "send_on_placeholder": "YYYY-MM-DD"
    }
  }
}
```

en.default.schema.json:
```.json
{
  "sections": {
    "product": {
      "blocks": {
        "form": {
          "show_gift_card_recipient_form": {
            "label": "Show recipient information form for gift card products",
            "info": "Gift card products can optionally be sent direct to a recipient along with a personal message."
          }
        }
      }
    }
  }
}
```
