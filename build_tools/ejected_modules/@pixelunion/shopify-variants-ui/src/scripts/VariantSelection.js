export default class VariantSelection extends HTMLElement {
  static get observedAttributes() { return ['variant']; }

  constructor() {
    super();

    this._loaded = false;
    this._productFetcher = Promise.resolve(false);
    this._onMainElChange = event => { this.variant = event.currentTarget.value; };

    const mainInputEl = this.querySelector('input[data-variants]');
    this._mainEl = mainInputEl || this.querySelector('select[data-variants]');
  }

  set variant(value) {
    if (value) {
      this.setAttribute('variant', value);
    } else {
      this.removeAttribute('variant');
    }
  }

  get variant() {
    return this.getAttribute('variant');
  }

  connectedCallback() {
    this._productFetcher = this._fetchProduct();

    const mainInputEl = this.querySelector('input[data-variants]');
    this._mainEl = mainInputEl || this.querySelector('select[data-variants]');
    this._mainEl.addEventListener('change', this._onMainElChange);
    this.variant = this._mainEl.value;
  }

  disconnectedCallback() {
    this._mainEl.removeEventListener('change', this._onMainElChange);
    this._mainEl = null;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'variant':
        this._changeVariant(newValue);
        break;
      default:
        break;
    }
  }

  getProduct() {
    return this._loaded ? Promise.resolve(this._product) : this._productFetcher;
  }

  getVariant() {
    return this.getProduct().then(product => (
      product
        ? (product.variants.find(v => v.id.toString() === this.variant) || false)
        : false
    )).catch(() => false);
  }

  getState() {
    return this.getVariant().then(variant => (variant ? 'selected' : this.getAttribute('variant')));
  }

  _changeVariant(value) {
    this._dispatchEvent(value)
      .then(() => { this._mainEl.value = value; });
  }

  _fetchProduct() {
    return fetch(this.getAttribute('product-url'))
      .then(response => response.json())
      .then(product => {
        this._product = product;

        return product;
      })
      .catch(() => {
        this._product = null;
      })
      .finally(() => { this._loaded = true; });
  }

  _dispatchEvent(value) {
    return this.getProduct().then(product => {
      const variant = product
        ? (product.variants.find(v => v.id.toString() === value) || false)
        : false;
      const state = variant ? 'selected' : value;
      const event = new CustomEvent('variant-change', {
        detail: {
          product,
          variant,
          state,
        },
      });

      this.dispatchEvent(event);
    });
  }
}
