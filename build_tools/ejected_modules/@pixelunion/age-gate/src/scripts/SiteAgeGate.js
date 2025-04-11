const scrollLock = require('scroll-lock');
const isbot = require('isbot');

function getAge(birthdate) {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }

  return age;
}

export default class SiteAgeGate {
  constructor(el) {
    this._el = el;
    this._ageGateForm = el.querySelector('[data-age-gate]');
    this._ageGateErrorEl = this._ageGateForm.querySelector('[data-age-gate-error]');
    this._requiredAge = this._ageGateForm.dataset.requiredAge;
    this._el.addEventListener('age-gate:open', this._open.bind(this));
    this._el.addEventListener('age-gate:close', this._close.bind(this));
    this._ageGateForm.addEventListener('submit', this._onFormSubmit.bind(this));

    if (isbot(navigator.userAgent)) {
      this._close();
    } else if (this._el.style.display === '') {
      this._open();
    }
  }

  _open() {
    scrollLock.disablePageScroll();
    this._el.style.display = '';
  }

  _close() {
    scrollLock.enablePageScroll();
    this._el.style.display = 'none';
  }

  _onFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    const data = new FormData(event.target);
    const day = data.get('day');
    const month = data.get('month');
    const year = data.get('year');

    if (day === '' || month === '' || year === '') return;

    const age = getAge(new Date(year, month, day));

    if (age >= this._requiredAge) {
      this._close();
      sessionStorage.setItem('age-gate', age);
    } else {
      this._ageGateErrorEl.style.display = '';
    }
  }
}
