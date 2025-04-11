import EventHandler from './../../../events';
import { transition } from '@pixelunion/animations';

export default class RecipientForm {
  constructor(el) {
    this.el = el;
    this.events = new EventHandler();

    this.recipientForm = this.el.querySelector('[data-recipient-form]');
    this.recipientFormInputs = this.el.querySelectorAll('[data-recipient-form-input]');
    this.recipientFormEmailInput = this.el.querySelector('[data-recipient-form-email-input]');

    this.disclosure = this.el.querySelector('[data-recipient-disclosure]');
    this.disclosureCheckbox = this.el.querySelector('[data-recipient-disclosure-checkbox]');

    this.checkmark = this.disclosure.querySelector('.checkmark');
    this.checkmarkCheck = this.disclosure.querySelector('.checkmark__check');
    this.fillAnimation = transition({ el: this.checkmark });
    this.checkAnimation = transition({ el: this.checkmarkCheck });

    this.events.register(this.recipientForm, 'keydown', event => this._onKeydown(event));
    this.events.register(this.disclosure, 'toggle', () => this._onToggle());
    this.events.register(this.disclosureCheckbox, 'change', () => this._onChange());
  }

  _onChange() {
    this.disclosure.open = this.disclosureCheckbox.checked;
  }

  _onKeydown(event) {
    // Prevent input form submission
    if (event.key === 'Enter' && event.target.matches('[data-recipient-form-input]')) {
      event.preventDefault();
    }
  }

  _onToggle() {
    if (this.disclosure.open) {
      this._showRecipientForm();
    } else {
      this._hideRecipientForm();
    }
  }

  _showRecipientForm() {
    if (this.checkmark && this.checkmarkCheck) {
      this.fillAnimation.animateTo('checked');
      this.checkAnimation.animateTo('checked');
    }

    this.disclosureCheckbox.checked = true;
    this.recipientFormEmailInput.required = true;
  }

  _hideRecipientForm() {
    if (this.checkmark && this.checkmarkCheck) {
      this.fillAnimation.animateTo('unchecked');
      this.checkAnimation.animateTo('unchecked');
    }

    this.disclosureCheckbox.checked = false;
    this.recipientFormEmailInput.required = false;

    this._resetRecipientForm();
  }

  _resetRecipientForm() {
    this.recipientFormInputs.forEach(el => {
      el.value = '';

      if (el.classList.contains('form-field-filled')) {
        el.classList.remove('form-field-filled');
      }
    });

    if (this.recipientForm.classList.contains('recipient-form--has-errors')) {
      this.recipientForm.classList.remove('recipient-form--has-errors');
    }
  }
}
