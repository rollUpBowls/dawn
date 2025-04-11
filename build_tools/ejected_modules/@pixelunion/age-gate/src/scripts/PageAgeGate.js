export default class PageAgeGate {
  constructor() {
    this._ageGateEl = document.getElementById('age-gate-page');
  }

  onSectionLoad() {
    const openEvent = new CustomEvent('age-gate:open');

    this._ageGateEl.dispatchEvent(openEvent);
  }

  onSectionSelect() {
    const openEvent = new CustomEvent('age-gate:open');

    this._ageGateEl.dispatchEvent(openEvent);
  }

  onSectionDeselect() {
    const closeEvent = new CustomEvent('age-gate:close');

    this._ageGateEl.dispatchEvent(closeEvent);
  }
}
