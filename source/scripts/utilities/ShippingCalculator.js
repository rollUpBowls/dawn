import { CountryProvinceSelector } from '@shopify/theme-addresses';
import EventHandler from './../../../build_tools/ejected_modules/@pixelunion/events';

export default class ShippingCalculator {
  constructor({ el }) {
    this.el = el;
    this.events = new EventHandler();
    this.rates = this.el.querySelector('[data-shipping-rates]');
    this.message = this.el.querySelector('[data-shipping-message]');
    this.zip = this.el.querySelector('[data-shipping-calculator-zipcode]');
    this.submit = this.el.querySelector('.get-rates');
    this.response = this.el.querySelector('[data-shipping-calculator-response]');
    this.countrySelect = this.el.querySelector('[data-shipping-calculator-country]');
    this.provinceSelect = this.el.querySelector('[data-shipping-calculator-province]');
    this.provinceContainer = this.el.querySelector('[data-shipping-calculator-province-container]');

    this.buildCalculator();
  }

  buildCalculator() {
    this.shippingCountryProvinceSelector = new CountryProvinceSelector(this.countrySelect.innerHTML);
    this.shippingCountryProvinceSelector
      .build(
        this.countrySelect,
        this.provinceSelect,
        {
          onCountryChange: provinces => {
            if (provinces.length) {
              this.provinceContainer.style.display = 'block';
            } else {
              this.provinceContainer.style.display = 'none';
            }

            // "Province", "State", "Region", etc. and "Postal Code", "ZIP Code", etc.
            // Even countries without provinces include a label.
            const { label, zip_label: zipLabel } = window.Countries[this.countrySelect.value];
            this.provinceContainer.querySelector('label[for="address_province"]').innerHTML = label;
            this.el.querySelector('label[for="address_zip"]').innerHTML = zipLabel;
          },
        },
      );

    this.events.register(this.submit, 'click', e => {
      e.preventDefault();
      this.getRates();
    });
  }

  getRates() {
    const shippingAddress = {};
    shippingAddress.country = this.countrySelect ? this.countrySelect.value : '';
    shippingAddress.province = this.provinceSelect ? this.provinceSelect.value : '';
    shippingAddress.zip = this.zip ? this.zip.value : '';

    const queryString = Object.keys(shippingAddress)
      .map(key => `${encodeURIComponent(`shipping_address[${key}]`)}=${encodeURIComponent(shippingAddress[key])}`)
      .join('&');

    fetch(`${window.PXUTheme.routes.cart_url}/shipping_rates.json?${queryString}`)
      .then(response => response.json())
      .then(data => this.displayRates(data));
  }

  displayRates(rates) {
    const propertyName = Object.keys(rates);
    this.clearRates();

    if (propertyName[0] === 'shipping_rates') {
      rates.shipping_rates.forEach(rate => {
        const rateLi = document.createElement('li');
        rateLi.innerHTML = `${rate.name}: ${this.formatPrice(rate.price)}`;
        this.rates.appendChild(rateLi);
      });

      if (rates.shipping_rates.length > 1) {
        this.message.innerHTML = `${window.PXUTheme.translation.additional_rates_part_1} ${rates.shipping_rates.length} ${window.PXUTheme.translation.additional_rates_part_2} ${this.zip.value}, ${this.provinceSelect.value}, ${this.countrySelect.value}, ${window.PXUTheme.translation.additional_rates_part_3} ${this.formatPrice(rates.shipping_rates[0].price)}`;
      } else {
        this.message.innerHTML = `${window.PXUTheme.translation.additional_rate} ${this.zip.value}, ${this.provinceSelect.value}, ${this.countrySelect.value}, ${window.PXUTheme.translation.additional_rate_at} ${this.formatPrice(rates.shipping_rates[0].price)}`;
      }

      this.response.classList.add('shipping-rates--display-rates');
    } else {
      this.message.innerHTML = `Error: ${propertyName[0]} ${rates[propertyName[0]]}`;
      this.response.classList.add('shipping-rates--display-error');
    }
  }

  clearRates() {
    this.response.classList.remove('shipping-rates--display-error', 'shipping-rates--display-rates');
    this.message.innerHTML = '';
    this.rates.innerHTML = '';
  }

  formatPrice(price) {
    let formattedPrice;

    if (window.PXUTheme.currency.display_format === 'money_with_currency_format') {
      formattedPrice = `<span class="money">${window.PXUTheme.currency.symbol}${price} ${window.PXUTheme.currency.iso_code}</span>`;
    } else {
      formattedPrice = `<span class="money">${window.PXUTheme.currency.symbol}${price}</span>`;
    }

    return formattedPrice;
  }

  unload() {
    this.events.unregisterAll();
  }
}
