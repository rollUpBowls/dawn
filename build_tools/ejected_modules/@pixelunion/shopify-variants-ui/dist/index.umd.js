
/*!
 * @pixelunion/shopify-variants-ui v2.1.3
 * (c) 2023 Pixel Union
 */

(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  class VariantSelection extends HTMLElement {
    static get observedAttributes() {
      return ['variant'];
    }

    constructor() {
      super();
      this._loaded = false;
      this._productFetcher = Promise.resolve(false);

      this._onMainElChange = event => {
        this.variant = event.currentTarget.value;
      };

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
      }
    }

    getProduct() {
      return this._loaded ? Promise.resolve(this._product) : this._productFetcher;
    }

    getVariant() {
      return this.getProduct().then(product => product ? product.variants.find(v => v.id.toString() === this.variant) || false : false).catch(() => false);
    }

    getState() {
      return this.getVariant().then(variant => variant ? 'selected' : this.getAttribute('variant'));
    }

    _changeVariant(value) {
      this._dispatchEvent(value).then(() => {
        this._mainEl.value = value;
      });
    }

    _fetchProduct() {
      return fetch(this.getAttribute('product-url')).then(response => response.json()).then(product => {
        this._product = product;
        return product;
      }).catch(() => {
        this._product = null;
      }).finally(() => {
        this._loaded = true;
      });
    }

    _dispatchEvent(value) {
      return this.getProduct().then(product => {
        const variant = product ? product.variants.find(v => v.id.toString() === value) || false : false;
        const state = variant ? 'selected' : value;
        const event = new CustomEvent('variant-change', {
          detail: {
            product,
            variant,
            state
          }
        });
        this.dispatchEvent(event);
      });
    }

  }

  const unselectedValue = 'not-selected';
  const unavailableValue = 'unavailable';
  const inputTypeDropdown = 'select';
  const inputTypeRadio = 'radio';
  const valueElementType = {
    select: 'option',
    radio: 'input[type="radio"]'
  };

  function setSelectedOptions(selectOptions, radioOptions, selectedOptions) {
    selectOptions.forEach(({
      option
    }) => {
      option.value = selectedOptions[parseInt(option.dataset.variantOptionIndex, 10)];
    });
    radioOptions.forEach(({
      values
    }) => {
      values.forEach(value => {
        value.checked = value.value === selectedOptions[parseInt(value.dataset.variantOptionValueIndex, 10)];
      });
    });
  }
  /*
   * @param optionsEls [Element list] : Input elements for variant options
   *
   */


  function getOptions(optionsEls) {
    const select = [];
    const radio = [];

    for (let i = 0; i < optionsEls.length; i++) {
      const optionEl = optionsEls[i]; // Options within select inputs or radio groups

      const variantOptionIndex = parseInt(optionEl.dataset.variantOptionIndex, 10);
      const valueMap = {};
      const wrappers = optionEl.matches('[data-variant-option-value-wrapper]') ? [optionEl] : Array.prototype.slice.call(optionEl.querySelectorAll('[data-variant-option-value-wrapper]'));
      const optionValueEls = optionEl.matches('[data-variant-option-value]') ? [optionEl] : Array.prototype.slice.call(optionEl.querySelectorAll('[data-variant-option-value]'));
      if (!optionValueEls.length) break;
      let current = unselectedValue;
      optionValueEls.forEach(el => {
        valueMap[el.value] = {
          available: false,
          accessible: false
        };

        if (el.hasAttribute('checked') || el.hasAttribute('selected')) {
          current = el.value;
        }
      });
      const option = {
        option: optionEl,
        variantOptionIndex,
        current,
        wrappers,
        optionValueEls,
        valueMap
      };

      if (optionValueEls[0].matches(valueElementType.select)) {
        option.type = inputTypeDropdown;
        select.push(option);
      } else if (optionValueEls[0].matches(valueElementType.radio)) {
        option.type = inputTypeRadio;
        radio.push(option);
      }
    }

    return {
      select,
      radio
    };
  }

  function getSelectedOptions(product, selectOptions, radioOptions) {
    const options = product.options.map(() => unselectedValue);
    selectOptions.forEach(({
      option
    }) => {
      if (option.value !== unselectedValue) {
        options[parseInt(option.dataset.variantOptionIndex, 10)] = option.value;
      }
    });
    radioOptions.forEach(({
      optionValueEls
    }) => {
      optionValueEls.forEach(value => {
        if (value.checked) {
          options[parseInt(value.dataset.variantOptionValueIndex, 10)] = value.value;
        }
      });
    });
    return options;
  }

  function getVariantFromSelectedOptions(variants, selectedOptions) {
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const isVariant = variant.options.every((option, index) => option === selectedOptions[index]);
      if (isVariant) return variant; // We found the variant
    }

    return false;
  }

  function getOptionsAccessibility(variants, option) {
    const optionValues = Object.keys(option.valueMap);

    if (optionValues.includes(unselectedValue)) {
      option.valueMap[unselectedValue].accessible = true;
    }

    variants.forEach(variant => {
      if (variant.available) {
        variant.options.forEach(variantOption => {
          if (optionValues.includes(variantOption)) {
            option.valueMap[variantOption].accessible = true;
          }
        });
      }
    });
    return option;
  } // Returns whether the variant matches the selection filter prefix.
  // // E.g. ["small", "red", "cotton"] matches ["small", "red"] but not ["small", "green"].
  // // It also matches prefixes like [] and ["*", "red", "*"].


  function matchesPrefix(variant, prefix) {
    if (prefix.every((v, i) => v === unselectedValue || variant.options[i] === v)) {
      // has to match unless it's 'not-selected', 'not-selected' matches everything
      return variant.available;
    }
  }

  function getVariantFromPartialSelection(variants, selection) {
    return variants.find(variant => {
      if (variant.available) {
        return selection.every((s, i) => s === unselectedValue || variant.options[i] === s);
      }

      return false;
    });
  }

  function updateOptions(product, selectOptions, radioOptions, selection, disableUnavailableOptions, removeUnavailableOptions, selectFirstAvailable) {
    let options = [...selectOptions, ...radioOptions];
    const {
      variants
    } = product;
    let nextAvailableVariant = null;
    options = options.map(option => getOptionsAccessibility(variants, option));
    options.sort((a, b) => a.variantOptionIndex - b.variantOptionIndex);

    if (options.length === 0) {
      return;
    }

    if (disableUnavailableOptions || removeUnavailableOptions) {
      // Only do this if we're disabling/hiding unavailable
      // Ensure the current selection has a match by unsetting options if necessary.
      // Does the selection match a variant? If not, unselect options starting at the last one
      while (!variants.some(v => matchesPrefix(v, selection))) {
        // Find the last set option and unset it.
        let i = selection.length - 1;

        while (i >= 0 && selection[i] === unselectedValue) {
          --i;
        }

        if (i === -1) {
          break;
        }

        if (options[i].option.value) {
          if (!selectFirstAvailable) {
            options[i].option.value = unselectedValue;
            options[i].current = unselectedValue;
          }
        }

        selection[i] = unselectedValue;
      }
    } // Determine which values in each option are selectable given the current selection.


    for (let i = 0; i < options.length; ++i) {
      const values = Object.keys(options[i].valueMap);

      for (let j = 0; j < values.length; ++j) {
        // input options
        const prefix = [...selection.slice(0, i), values[j]]; // given the current selection (ie. green/small), do any variants match?
        // If no variants match, it disables the option value in this iteration
        // disabling 'dead end' option values

        const selectable = variants.some(v => matchesPrefix(v, prefix));
        options[i].valueMap[values[j]].available = selectable;
      }
    } // If 'select first available variant' is enabled and we have some 'not-selected' values,
    // we should select options that match a variant


    if (selectFirstAvailable && selection.includes(unselectedValue)) {
      nextAvailableVariant = getVariantFromPartialSelection(variants, selection);

      if (nextAvailableVariant) {
        selection = nextAvailableVariant.options;
      }

      options.forEach(optionData => {
        const currentSelection = selection[optionData.variantOptionIndex];
        optionData.current = currentSelection;

        if (optionData.type === inputTypeDropdown) {
          optionData.option.value = currentSelection;
          optionData.optionValueEls.forEach(e => {
            e.selected = e.value === currentSelection;
          });
        } else {
          optionData.optionValueEls.forEach(e => {
            e.checked = e.value === currentSelection;
          });
        }
      });
    } else if (!selectFirstAvailable && selection.includes(unselectedValue)) {
      options.forEach(optionData => {
        // When selectFirstAvailableVariant is false, 
        // we need to manually set the 'checked' value to false for radio selections
        // because they don't have a default 'not-selected' option
        if (selection[optionData.variantOptionIndex] === unselectedValue && optionData.type !== inputTypeDropdown) {
          optionData.optionValueEls.forEach(e => {
            e.checked = false;
          });
        }
      });
    }

    for (let i = 0; i < product.options.length; i++) {
      // Corresponding select dropdown, if it exists
      const optionValues = options.find(({
        option
      }) => {
        if (parseInt(option.dataset.variantOptionIndex, 10) === i) {
          return true;
        }

        return false;
      });

      if (optionValues) {
        const fragment = document.createDocumentFragment();
        const {
          option,
          wrappers,
          optionValueEls
        } = optionValues;

        for (let j = optionValueEls.length - 1; j >= 0; j--) {
          const wrapper = wrappers[j];
          const optionValue = optionValueEls[j];
          const {
            value
          } = optionValue;
          const {
            available,
            accessible
          } = optionValues.valueMap[value];

          if (optionValue !== unselectedValue) {
            optionValue.disabled = disableUnavailableOptions && !available;
            optionValue.dataset.variantOptionAccessible = accessible;
            optionValue.dataset.variantOptionAvailable = available;

            if (!removeUnavailableOptions || accessible) {
              fragment.insertBefore(wrapper, fragment.firstElementChild);
            }
          }
        }

        option.innerHTML = '';
        option.appendChild(fragment);
        const chosenValue = optionValueEls.find(value => value.selected || value.checked);
        option.dataset.variantOptionChosenValue = chosenValue && chosenValue.value !== unselectedValue ? chosenValue.value : false;
      }
    }

    return selection;
  }

  class OptionsSelection extends HTMLElement {
    static get observedAttributes() {
      return ['variant-selection', 'disable-unavailable', 'remove-unavailable'];
    }

    static synchronize(mainOptionsSelection) {
      const mainVariantSelection = mainOptionsSelection.getVariantSelection(); // Fast return if we aren't associated with a variant selection

      if (!mainVariantSelection) return Promise.resolve(false);
      return mainOptionsSelection.getSelectedOptions().then(selectedOptions => {
        // Update all other options selects associated with the same variant ui
        const optionsSelections = document.querySelectorAll('options-selection');
        optionsSelections.forEach(optionsSelection => {
          if (optionsSelection !== mainOptionsSelection && optionsSelection.getVariantSelection() === mainVariantSelection) {
            optionsSelection.setSelectedOptions(selectedOptions);
          }
        });
      }).then(() => true);
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

      this._selectOptions.forEach(({
        option
      }) => {
        option.addEventListener('change', this._onChangeFn);

        this._events.push({
          el: option,
          fn: this._onChangeFn
        });
      });

      this._radioOptions.forEach(({
        optionValueEls
      }) => {
        optionValueEls.forEach(value => {
          value.addEventListener('change', this._onChangeFn);

          this._events.push({
            el: value,
            fn: this._onChangeFn
          });
        });
      });

      this._onOptionChange();
    }

    disconnectedCallback() {
      this._resetOptions();

      this._events.forEach(({
        el,
        fn
      }) => el.removeEventListener('change', fn));

      this._events = [];
    }

    attributeChangedCallback(name, _oldValue, newValue) {
      switch (name) {
        case 'variant-selection':
          this._associateVariantSelection(newValue);

          break;

        case 'disable-unavailable':
        case 'remove-unavailable':
          this._updateOptions(this.hasAttribute('disable-unavailable'), this.hasAttribute('remove-unavailable'), this.hasAttribute('select-first-available'));

          break;
      }
    }

    getSelectedOptions() {
      if (!this._variantSelection) return Promise.resolve(null);
      return this._variantSelection.getProduct().then(product => {
        if (!product) return null;
        return getSelectedOptions(product, this._selectOptions, this._radioOptions);
      });
    }

    getVariantSelection() {
      return this._variantSelection;
    }

    setSelectedOptions(selectedOptions) {
      setSelectedOptions(this._selectOptions, this._radioOptions, selectedOptions);
      return this._updateOptions(this.hasAttribute('disable-unavailable'), this.hasAttribute('remove-unavailable'), this.hasAttribute('select-first-available'), selectedOptions);
    }

    _associateVariantSelection(id) {
      this._variantSelection = id ? document.getElementById(id) : this.closest('variant-selection');
    }

    _updateLabels() {
      // Update any labels
      const unavailableText = this.getAttribute('data-unavailable-text');

      for (let i = 0; i < this._optionsEls.length; i++) {
        const optionsEl = this._optionsEls[i];
        let optionsNameEl = null;
        let {
          parentElement
        } = optionsEl;

        while (parentElement && !optionsNameEl) {
          const tmpOptionsNameEl = parentElement.querySelector('[data-variant-option-name]');

          if (tmpOptionsNameEl) {
            optionsNameEl = tmpOptionsNameEl;
          }

          ({
            parentElement
          } = parentElement);
        }

        if (optionsNameEl) {
          optionsNameEl.dataset.variantOptionChosenValue = optionsEl.dataset.variantOptionChosenValue;

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
      return this._updateOptions(false, false, this.hasAttribute('select-first-available'));
    }

    _updateOptions(disableUnavailableOptions, removeUnavailableOptions, selectFirstAvailable, selectedOptions = null) {
      if (!this._variantSelection) return Promise.resolve(false);
      return this._variantSelection.getProduct().then(product => {
        const updatedSelection = updateOptions(product, this._selectOptions, this._radioOptions, selectedOptions || getSelectedOptions(product, this._selectOptions, this._radioOptions), disableUnavailableOptions, removeUnavailableOptions, selectFirstAvailable); // Use the 'updated' selection in case its changed due to disabled options

        this._updateVariantSelection(product, updatedSelection);

        this._updateLabels();
      }).then(() => true);
    }

    _updateVariantSelection(product, selectedOptions) {
      if (!this._variantSelection) return;
      const variant = getVariantFromSelectedOptions(product.variants, selectedOptions);
      const isNotSelected = selectedOptions.some(option => option === unselectedValue); // Update master select

      if (variant) {
        this._variantSelection.variant = variant.id;
      } else {
        this._variantSelection.variant = isNotSelected ? unselectedValue : unavailableValue;
      }
    }

    _onOptionChange() {
      if (!this._variantSelection) return;

      this._variantSelection.getProduct().then(product => {
        if (!product) return;
        let selectedOptions = getSelectedOptions(product, this._selectOptions, this._radioOptions);

        this._updateOptions(this.hasAttribute('disable-unavailable'), this.hasAttribute('remove-unavailable'), this.hasAttribute('select-first-available'), selectedOptions);

        OptionsSelection.synchronize(this);
      });
    }

  }

  if (!customElements.get('variant-selection')) {
    customElements.define('variant-selection', VariantSelection);
  }

  if (!customElements.get('options-selection')) {
    customElements.define('options-selection', OptionsSelection);
  }

})));
