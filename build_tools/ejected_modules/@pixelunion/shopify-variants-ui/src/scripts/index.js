import VariantSelection from './VariantSelection';
import OptionsSelection from './OptionsSelection';

if (!customElements.get('variant-selection')) {
  customElements.define('variant-selection', VariantSelection);
}

if (!customElements.get('options-selection')) {
  customElements.define('options-selection', OptionsSelection);
}
