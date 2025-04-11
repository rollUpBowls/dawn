
/*!
 * @pixelunion/age-gate v1.1.0
 * (c) 2023 Pixel Union
 */

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

var scrollLock = require('scroll-lock');
var isbot = require('isbot');
function getAge(birthdate) {
  var today = new Date();
  var age = today.getFullYear() - birthdate.getFullYear();
  var m = today.getMonth() - birthdate.getMonth();
  if (m < 0 || m === 0 && today.getDate() < birthdate.getDate()) {
    age--;
  }
  return age;
}
var SiteAgeGate = /*#__PURE__*/function () {
  function SiteAgeGate(el) {
    _classCallCheck(this, SiteAgeGate);
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
  _createClass(SiteAgeGate, [{
    key: "_open",
    value: function _open() {
      scrollLock.disablePageScroll();
      this._el.style.display = '';
    }
  }, {
    key: "_close",
    value: function _close() {
      scrollLock.enablePageScroll();
      this._el.style.display = 'none';
    }
  }, {
    key: "_onFormSubmit",
    value: function _onFormSubmit(event) {
      event.preventDefault();
      event.stopPropagation();
      var data = new FormData(event.target);
      var day = data.get('day');
      var month = data.get('month');
      var year = data.get('year');
      if (day === '' || month === '' || year === '') return;
      var age = getAge(new Date(year, month, day));
      if (age >= this._requiredAge) {
        this._close();
        sessionStorage.setItem('age-gate', age);
      } else {
        this._ageGateErrorEl.style.display = '';
      }
    }
  }]);
  return SiteAgeGate;
}();

var PageAgeGate = /*#__PURE__*/function () {
  function PageAgeGate() {
    _classCallCheck(this, PageAgeGate);
    this._ageGateEl = document.getElementById('age-gate-page');
  }
  _createClass(PageAgeGate, [{
    key: "onSectionLoad",
    value: function onSectionLoad() {
      var openEvent = new CustomEvent('age-gate:open');
      this._ageGateEl.dispatchEvent(openEvent);
    }
  }, {
    key: "onSectionSelect",
    value: function onSectionSelect() {
      var openEvent = new CustomEvent('age-gate:open');
      this._ageGateEl.dispatchEvent(openEvent);
    }
  }, {
    key: "onSectionDeselect",
    value: function onSectionDeselect() {
      var closeEvent = new CustomEvent('age-gate:close');
      this._ageGateEl.dispatchEvent(closeEvent);
    }
  }]);
  return PageAgeGate;
}();

export { PageAgeGate, SiteAgeGate };
