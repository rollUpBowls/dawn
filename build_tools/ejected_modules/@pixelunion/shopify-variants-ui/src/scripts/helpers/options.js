import {
  unselectedValue,
  inputTypeDropdown,
  inputTypeRadio,
  valueElementType,
} from './globals';

function setSelectedOptions(selectOptions, radioOptions, selectedOptions) {
  selectOptions.forEach(({ option }) => {
    option.value = selectedOptions[parseInt(option.dataset.variantOptionIndex, 10)];
  });

  radioOptions.forEach(({ values }) => {
    values.forEach(value => {
      value.checked = (
        value.value === selectedOptions[parseInt(value.dataset.variantOptionValueIndex, 10)]
      );
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
    const wrappers = optionEl.matches('[data-variant-option-value-wrapper]')
      ? [optionEl]
      : Array.prototype.slice.call(optionEl.querySelectorAll('[data-variant-option-value-wrapper]'));
    const optionValueEls = optionEl.matches('[data-variant-option-value]')
      ? [optionEl]
      : Array.prototype.slice.call(optionEl.querySelectorAll('[data-variant-option-value]'));

    if (!optionValueEls.length) break;

    let current = unselectedValue;

    optionValueEls.forEach(el => {
      valueMap[el.value] = {
        available: false,
        accessible: false,
      };

      if (el.value === unselectedValue) {
        valueMap[el.value].accessible = true;
      }

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
      valueMap,
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
    radio,
  };
}

function getSelectedOptions(product, selectOptions, radioOptions) {
  const options = product.options.map(() => unselectedValue);

  selectOptions.forEach(({ option }) => {
    if (option.value !== unselectedValue) {
      options[parseInt(option.dataset.variantOptionIndex, 10)] = option.value;
    }
  });

  radioOptions.forEach(({ optionValueEls }) => {
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
        };
      });
    }
  });

  return option;
}

// Returns whether the variant matches the selection filter prefix.
// // E.g. ["small", "red", "cotton"] matches ["small", "red"] but not ["small", "green"].
// // It also matches prefixes like [] and ["*", "red", "*"].
function matchesPrefix(variant, prefix) {
  if (prefix.every((v, i) => v === unselectedValue || variant.options[i] === v)) { // has to match unless it's 'not-selected', 'not-selected' matches everything
    return variant.available;
  }
}

function getVariantFromPartialSelection(variants, selection) {
  return variants.find(variant => {
    if (variant.available) {
      return selection.every((s, i) => s === unselectedValue || variant.options[i] === s)
    }
    return false;
  });
}

function updateOptions(
  product,
  selectOptions,
  radioOptions,
  selection,
  disableUnavailableOptions,
  removeUnavailableOptions,
  selectFirstAvailable,
) {
  let options = [...selectOptions, ...radioOptions];
  const { variants } = product;
  let nextAvailableVariant = null;

  options = options.map(option => getOptionsAccessibility(variants, option));
  options.sort((a, b) => a.variantOptionIndex - b.variantOptionIndex);

  if (options.length === 0) {
    return;
  }

  if (disableUnavailableOptions || removeUnavailableOptions) { // Only do this if we're disabling/hiding unavailable
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
          options[i].current = unselectedValue
        }
      }

      selection[i] = unselectedValue;
    }
  }

  // Determine which values in each option are selectable given the current selection.
  for (let i = 0; i < options.length; ++i) {
    const values = Object.keys(options[i].valueMap);

    for (let j = 0; j < values.length; ++j) { // input options
      const prefix = [...selection.slice(0, i), values[j]];
      // given the current selection (ie. green/small), do any variants match?
      // If no variants match, it disables the option value in this iteration
      // disabling 'dead end' option values
      const selectable = variants.some(v => matchesPrefix(v, prefix));
      options[i].valueMap[values[j]].available = selectable;
    }
  }

  // If 'select first available variant' is enabled and we have some 'not-selected' values,
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
    const optionValues = options.find(({ option }) => {
      if (parseInt(option.dataset.variantOptionIndex, 10) === i) {
        return true;
      }

      return false;
    });

    if (optionValues) {
      const fragment = document.createDocumentFragment();
      const { option, wrappers, optionValueEls } = optionValues;

      for (let j = optionValueEls.length - 1; j >= 0; j--) {
        const wrapper = wrappers[j];
        const optionValue = optionValueEls[j];
        const { value } = optionValue;

        const { available, accessible } = optionValues.valueMap[value];
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

      option.dataset.variantOptionChosenValue = chosenValue && chosenValue.value !== unselectedValue
        ? chosenValue.value
        : false;
    }
  }

  return selection;
}

export {
  updateOptions,
  setSelectedOptions,
  getOptions,
  getOptionsAccessibility,
  getSelectedOptions,
  getVariantFromSelectedOptions,
};
