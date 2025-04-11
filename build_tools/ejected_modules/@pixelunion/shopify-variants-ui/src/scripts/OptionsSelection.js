import {
  updateOptions,
  setSelectedOptions,
  getSelectedOptions,
  getOptions,
  getVariantFromSelectedOptions,
} from './helpers/options';

import {
  unselectedValue,
  unavailableValue,
} from './helpers/globals';

export default class OptionsSelection extends HTMLElement {
  static get observedAttributes() { return ['variant-selection', 'disable-unavailable', 'remove-unavailable']; }

  static synchronize(mainOptionsSelection) {
    const mainVariantSelection = mainOptionsSelection.getVariantSelection();

    // Fast return if we aren't associated with a variant selection
    if (!mainVariantSelection) return Promise.resolve(false);

    return mainOptionsSelection.getSelectedOptions()
      .then(selectedOptions => {
        // Update all other options selects associated with the same variant ui
        const optionsSelections = document.querySelectorAll('options-selection');

        optionsSelections.forEach(optionsSelection => {
          if (
            optionsSelection !== mainOptionsSelection
            && optionsSelection.getVariantSelection() === mainVariantSelection
          ) {
            optionsSelection.setSelectedOptions(selectedOptions);
          }
        });
      })
      .then(() => true);
  }

  constructor() {
    super();

    this.style.display = '';
    this._events = [];
    this._onChangeFn = this._onOptionChange.bind(this);

    this._optionsEls = this.querySelectorAll('[data-variant-option]');
    const options = getOptions(this._optionsEls);
    this._selectOptions = options.select;
    this._radioOptions = options.radio;

    this._associateVariantSelection(this.getAttribute('variant-selection'));
  }

  set variantSelection(value) {
    if (value) {
      this.setAttribute('variant-selection', value);
    } else {
      this.removeAttribute('variant-selection');
    }
  }

  get variantSelection() {
    return this.getAttribute('variant-selection');
  }

  connectedCallback() {
    this._optionsEls = this.querySelectorAll('[data-variant-option]');
    const options = getOptions(this._optionsEls);
    this._selectOptions = options.select;
    this._radioOptions = options.radio;
    this._associateVariantSelection(this.getAttribute('variant-selection'));

    this._selectOptions.forEach(({ option }) => {
      option.addEventListener('change', this._onChangeFn);
      this._events.push({
        el: option,
        fn: this._onChangeFn,
      });
    });

    this._radioOptions.forEach(({ optionValueEls }) => {
      optionValueEls.forEach(value => {
        value.addEventListener('change', this._onChangeFn);
        this._events.push({
          el: value,
          fn: this._onChangeFn,
        });
      });
    });

    this._onOptionChange();
  }

  disconnectedCallback() {
    this._resetOptions();
    this._events.forEach(({ el, fn }) => el.removeEventListener('change', fn));
    this._events = [];
  }

  attributeChangedCallback(name, _oldValue, newValue) {
    switch (name) {
      case 'variant-selection':
        this._associateVariantSelection(newValue);
        break;
      case 'disable-unavailable':
      case 'remove-unavailable':
        this._updateOptions(
          this.hasAttribute('disable-unavailable'),
          this.hasAttribute('remove-unavailable'),
          this.hasAttribute('select-first-available'),
        );
        break;
      default:
        break;
    }
  }

  getSelectedOptions() {
    if (!this._variantSelection) return Promise.resolve(null);

    return this._variantSelection.getProduct()
      .then(product => {
        if (!product) return null;

        return getSelectedOptions(
          product,
          this._selectOptions,
          this._radioOptions,
        );
      });
  }

  getVariantSelection() {
    return this._variantSelection;
  }

  setSelectedOptions(selectedOptions) {
    setSelectedOptions(this._selectOptions, this._radioOptions, selectedOptions);

    return this._updateOptions(
      this.hasAttribute('disable-unavailable'),
      this.hasAttribute('remove-unavailable'),
      this.hasAttribute('select-first-available'),
      selectedOptions,
    );
  }

  _associateVariantSelection(id) {
    this._variantSelection = id
      ? document.getElementById(id)
      : this.closest('variant-selection');
  }

  _updateLabels() {
    // Update any labels
    const unavailableText = this.getAttribute('data-unavailable-text');
    for (let i = 0; i < this._optionsEls.length; i++) {
      const optionsEl = this._optionsEls[i];
      let optionsNameEl = null;
      let { parentElement } = optionsEl;
      while (parentElement && !optionsNameEl) {
        const tmpOptionsNameEl = parentElement.querySelector('[data-variant-option-name]');

        if (tmpOptionsNameEl) {
          optionsNameEl = tmpOptionsNameEl;
        }

        ({ parentElement } = parentElement);
      }

      if (optionsNameEl) {
        optionsNameEl
          .dataset
          .variantOptionChosenValue = optionsEl.dataset.variantOptionChosenValue;

        if (optionsEl.dataset.variantOptionChosenValue !== 'false') {
          optionsNameEl.innerHTML = optionsNameEl.dataset.variantOptionName;
          const optionNameValueSpan = optionsNameEl.querySelector('span');

          if (optionNameValueSpan) {
            optionNameValueSpan.innerHTML = optionsEl.dataset.variantOptionChosenValue;
          }
        } else {
          optionsNameEl.innerHTML = optionsNameEl.dataset.variantOptionChooseName;
        }
      }

      if (!this.hasAttribute('disable-unavailable')) {
        const selectOptions = optionsEl.querySelectorAll('option');
        selectOptions.forEach(option => {
          let optionLabel = option.innerHTML.replace(`- ${unavailableText}`, '');

          if (option.dataset.variantOptionAvailable === 'false' && option.value !== unselectedValue) {
            optionLabel = `${optionLabel} - ${unavailableText}`;
          }

          option.innerHTML = optionLabel;
        });
      }
    }
  }

  _resetOptions() {
    return this._updateOptions(
      false,
      false,
      this.hasAttribute('select-first-available'),
    );
  }

  _updateOptions(
    disableUnavailableOptions,
    removeUnavailableOptions,
    selectFirstAvailable,
    selectedOptions = null,
  ) {
    if (!this._variantSelection) return Promise.resolve(false);

    return this._variantSelection.getProduct()
      .then(product => {
        const updatedSelection = updateOptions(
          product,
          this._selectOptions,
          this._radioOptions,
          selectedOptions || getSelectedOptions(
            product,
            this._selectOptions,
            this._radioOptions,
          ),
          disableUnavailableOptions,
          removeUnavailableOptions,
          selectFirstAvailable,
        );

        // Use the 'updated' selection in case its changed due to disabled options
        this._updateVariantSelection(product, updatedSelection);
        this._updateLabels();
      })
      .then(() => true);
  }

  _updateVariantSelection(product, selectedOptions) {
    if (!this._variantSelection) return;

    const variant = getVariantFromSelectedOptions(
      product.variants,
      selectedOptions,
    );

    const isNotSelected = selectedOptions.some(option => option === unselectedValue);

    // Update master select
    if (variant) {
      this._variantSelection.variant = variant.id;
    } else {
      this._variantSelection.variant = isNotSelected ? unselectedValue : unavailableValue;
    }
  }

  _onOptionChange() {
    if (!this._variantSelection) return;

    this._variantSelection.getProduct()
      .then(product => {
        if (!product) return;

        let selectedOptions = getSelectedOptions(
          product,
          this._selectOptions,
          this._radioOptions,
        );

        this._updateOptions(
          this.hasAttribute('disable-unavailable'),
          this.hasAttribute('remove-unavailable'),
          this.hasAttribute('select-first-available'),
          selectedOptions,
        );

        OptionsSelection.synchronize(this);
      });
  }
}
