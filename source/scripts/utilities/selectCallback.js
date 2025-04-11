function selectCallback(productEl, product, variant, state) {
  const $product = $(productEl);
  const $notifyForm = $('.product__notify-form', $product);
  const $productForm = $('.product_form, .shopify-product-form', $product);
  const variantInventory = $productForm.data('variant-inventory');
  const $productFormInput = $productForm.find('.quantity-input');

  const $notifyFormInputs = $('.notify_form__inputs');
  const notifyEmail = window.PXUTheme.translation.notify_form_email;
  const notifyEmailValue = window.PXUTheme.translation.contact_email;
  const notifySend = window.PXUTheme.translation.notify_form_send;

  const notifyUrl = $notifyFormInputs.data('url');
  let notifyMessage = '';
  let notifyEmailInput = '';

  if (variant) {
    if (variant.title != null) {
      // Escape variant titles
      const variantTitle = variant.title.toLowerCase() === 'default title' ? variant.name.replace(/"/g, '&quot;') : variant.title.replace(/"/g, '&quot;');
      notifyMessage = `${window.PXUTheme.translation.email_content}${variantTitle} | ${notifyUrl}?variant=${variant.id}`;
    }
  } else {
    notifyMessage = `${window.PXUTheme.translation.email_content} | ${notifyUrl}`;
  }

  if ($notifyFormInputs.hasClass('customer--true')) {
    notifyEmailInput = `<input required type="email" class="notify_email input" name="contact[email]" id="contact[email]" placeholder="${notifyEmail}" value="${window.PXUTheme.translation.customer_email}" />`;
  } else {
    notifyEmailInput = `<input required type="email" class="notify_email input" name="contact[email]" id="contact[email]" placeholder="${notifyEmail}" value="${notifyEmailValue}" />`;
  }

  const notifyFormHTML = `
    <input type="hidden" name="challenge" value="false" />
    <input type="hidden" name="contact[body]" class="notify_form_message" data-body="${notifyMessage}" value="${notifyMessage}" />
    <div class="field has-addons">
      <div class="control">
        ${notifyEmailInput}
      </div>
      <div class="control">
        <input class="action_button button" type="submit" value="${notifySend}" />
      </div>
    </div>`;

  // Image Variant feature
  if (variant && variant.featured_image && $product.is(':visible')) {
    const $sliders = $('.product-gallery__main, .js-gallery-modal', $product);
    $sliders.each((_index, value) => {
      const $slider = $(value);
      const $sliderInstance = $slider.data('flickity');
      const index = $(`img[data-image-id=${variant.featured_media.id}]`).data('index');
      if ($slider.is(':visible') && $sliderInstance !== undefined) {
        $sliderInstance.select(index, false, true);
      }
    });
  }

  // Emits custom event
  const $selectDropdown = $productForm.find('[data-variant-selector]');
  $selectDropdown.trigger('selectedVariantChanged');

  $('.cart-warning', $product).text('');

  if (variant) {
    $('.sku', $product).text(variant.sku);
    $('.notify_form_message', $product).attr('value', `${$('.notify_form_message', $product).data('body')} - ${variant.title}`);
  }

  if (variant && variant.available) {
    const variantWithInventory = {
      ...variant,
      ...(variantInventory ? variantInventory.find(v => v.id === variant.id) || {} : {}),
    };

    if (
      variantWithInventory.inventory_management
      && variantWithInventory.inventory_quantity > 0
    ) {
      if (window.PXUTheme.theme_settings.display_inventory_left) {
        let itemsLeftText = window.PXUTheme.translation.product_count_other;
        if (variantWithInventory.inventory_quantity === 1) {
          itemsLeftText = window.PXUTheme.translation.product_count_one;
        }

        const inventoryThreshold = window.PXUTheme.theme_settings.inventory_threshold;
        if (variantWithInventory.inventory_quantity <= inventoryThreshold) {
          $('.items_left', $product).html(`${variantWithInventory.inventory_quantity} ${itemsLeftText}`);
        } else {
          $('.items_left', $product).html('');
        }
      }
      if (variantWithInventory.inventory_policy === 'deny') {
        $('[data-max-inventory-management]', $product).attr('max', variantWithInventory.inventory_quantity);

        // Check to see if quantity selector should be disabled based on inventory remaining
        window.PXUTheme.quantityBox.updateQuantityControls($productFormInput);
      }
    } else {
      $('.items_left', $product).text('');
      $('[data-max-inventory-management]', $product).removeAttr('max');
    }

    $('.sold_out', $product).text('');

    $('[data-add-to-cart-trigger]', $product)
      .removeClass('disabled')
      .removeAttr('disabled')
      .attr('data-options-unselected', null)
      .find('span:not(.icon)')
      .text($('[data-add-to-cart-trigger]', $product).data('label'));

    // Initialize shopify payment buttons
    if (Shopify.PaymentButton) {
      Shopify.PaymentButton.init();
    }

    $('.shopify-payment-button', $product).show();
    $('.purchase-details__quantity', $product).show();

    $notifyForm.hide();
    $notifyFormInputs.empty();
    $notifyFormInputs.append(notifyFormHTML);

    if (window.PXUTheme.currencyConverter) {
      window.PXUTheme.currencyConverter.convertCurrencies();
    }
  } else {
    const message = variant
      ? window.PXUTheme.translation.soldOut
      : window.PXUTheme.translation.unavailable;

    $('.items_left', $product).text('');
    $('[data-max-inventory-management]', $product).removeAttr('max');
    $('.sold_out', $product).text(message);

    $('[data-add-to-cart-trigger]', $product)
      .addClass('disabled')
      .attr('disabled', 'disabled')
      .attr('data-options-unselected', null)
      .find('span:not(.icon)')
      .text(message);

    $('.shopify-payment-button', $product).hide();
    $('.purchase-details__quantity', $product).hide();

    $notifyForm.hide();
    $notifyFormInputs.empty();
    if (variant && !variant.available) {
      $notifyForm.fadeIn();
      $notifyFormInputs.empty();
      $notifyFormInputs.append(notifyFormHTML);
    }
  }
}

window.selectCallback = selectCallback;
