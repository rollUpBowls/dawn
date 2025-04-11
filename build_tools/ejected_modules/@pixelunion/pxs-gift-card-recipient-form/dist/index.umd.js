
/*!
 * @pixelunion/pxs-gift-card-recipient-form v1.1.0
 * (c) 2024 Pixel Union
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, global.PxsGiftCardRecipientForm = factory());
}(this, (function () { 'use strict';

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var EventHandler_1 = createCommonjsModule(function (module, exports) {
	exports.__esModule = true;
	var EventHandler = /** @class */ (function () {
	    function EventHandler() {
	        this.events = [];
	    }
	    EventHandler.prototype.register = function (el, event, listener) {
	        if (!el || !event || !listener)
	            return null;
	        this.events.push({ el: el, event: event, listener: listener });
	        el.addEventListener(event, listener);
	        return { el: el, event: event, listener: listener };
	    };
	    EventHandler.prototype.unregister = function (_a) {
	        var el = _a.el, event = _a.event, listener = _a.listener;
	        if (!el || !event || !listener)
	            return null;
	        this.events = this.events.filter(function (e) { return el !== e.el
	            || event !== e.event || listener !== e.listener; });
	        el.removeEventListener(event, listener);
	        return { el: el, event: event, listener: listener };
	    };
	    EventHandler.prototype.unregisterAll = function () {
	        this.events.forEach(function (_a) {
	            var el = _a.el, event = _a.event, listener = _a.listener;
	            return el.removeEventListener(event, listener);
	        });
	        this.events = [];
	    };
	    return EventHandler;
	}());
	exports["default"] = EventHandler;
	});

	var EventHandler = unwrapExports(EventHandler_1);

	/*!
	   * @pixelunion/animations v0.1.0
	   * (c) 2019 Pixel Union
	   * Released under the UNLICENSED license.
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
	  return Constructor;
	}

	/**
	 * Promisified version of window.requestAnimationFrame.
	 * @returns {Promise} Promise will resolve when requestAnimationFrame callback is run.
	 */
	function raf() {
	  return new Promise(function (resolve) {
	    window.requestAnimationFrame(resolve);
	  });
	}
	/**
	 * Represents an HTML element with associate states
	 */


	var Animation =
	/*#__PURE__*/
	function () {
	  /**
	   * @param {Object} options
	   * @param {HTMLElement}  options.el Target element
	   * @param {String} [options.state=initial] Initial state. This is also the default state.
	   * @param {String} [options.stateAttribute=data-revealer] Attribute name to update with state.
	   * @param {String} [options.stateChangeAttribute=data-revealer-transition] Attribute name to
	   * update with change of state.
	   * @param {String} [options.endEvent=transitionend] Event to listen for at end of state change.
	   * @param {Boolean} [options.hold=false] If true, changeAttribute will not be removed until the
	   * next state change.
	   * @param {Function} [options.onStart] Callback to execute immediate after
	   * applying stateChangeAttribute.
	   */
	  function Animation(options) {
	    _classCallCheck(this, Animation);

	    this._el = options.el;
	    this.cancelRunning = null;
	    this._state = options.state || 'initial';
	    this.initialState = this._state;
	    this.stateAttribute = options.stateAttribute || 'data-animation-state';
	    this.stateChangeAttribute = options.stateChangeAttribute || 'data-animation';
	    this.endEvent = options.endEvent || 'transitionend';
	    this.hold = !!options.hold;

	    this.onStart = options.onStart || function () {
	      /* do nothing */
	    };

	    this.activeEventHandler = null;
	  }
	  /**
	   * Returns target element
	   *
	   * @return {HTMLElement} Target element
	   */


	  _createClass(Animation, [{
	    key: "isState",

	    /**
	     * Check if a state is active
	     * @param {String} state State to compare
	     *
	     * @return {Boolean}
	     */
	    value: function isState(state) {
	      return state === this._state;
	    }
	    /**
	     * Sequences a change to a new state.
	     * @param {String} state Target state
	     *
	     * @param {Boolean} options.force Switch to final state immediately
	     *
	     * @param {Function} options.onStart Callback to execute immediately after
	     * applying stateChangeAttribute for this state change only.
	     *
	     * @param {Boolean} [options.hold=false] If true, changeAttribute will not be removed until the
	     * next state change.
	     *
	     * @return {Promise} Resolves when endEvent triggered
	     */

	  }, {
	    key: "animateTo",
	    value: function animateTo(state) {
	      var _this = this;

	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      var from = this._el.dataset[this.stateAttribute] || this._state;
	      var to = state || this.initialState;
	      var force = options.force;
	      var hold = 'hold' in options ? options.hold : this.hold;
	      return new Promise(function (resolve) {
	        if (_this.cancelRunning) {
	          _this.cancelRunning();
	        }

	        if (from === to) {
	          // Removing this here fixes some lingering attributes. But why?
	          _this._el.removeAttribute(_this.stateChangeAttribute);

	          resolve(from, null);
	          return;
	        }

	        var running = true;

	        _this.cancelRunning = function () {
	          running = false;
	          resolve(null, null);
	        };

	        _this._el.removeEventListener(_this.endEvent, _this.activeEventHandler);

	        _this.activeEventHandler = null;

	        if (force) {
	          _this._el.setAttribute(_this.stateChangeAttribute, "".concat(from, "=>").concat(to));

	          _this.onStart({
	            el: _this._el,
	            from: from,
	            to: to
	          });

	          if (typeof options.onStart === 'function') {
	            options.onStart({
	              el: _this._el,
	              from: from,
	              to: to
	            });
	          }

	          _this._el.setAttribute(_this.stateAttribute, to);

	          _this._state = to;

	          if (!hold) {
	            _this._el.removeAttribute(_this.stateChangeAttribute);
	          }

	          resolve(to, null);
	          return;
	        }

	        raf().then(function () {
	          if (!running) throw new Error('cancelled');

	          _this._el.setAttribute(_this.stateChangeAttribute, "".concat(from, "=>").concat(to));

	          _this.onStart({
	            el: _this._el,
	            from: from,
	            to: to
	          });

	          if (typeof options.onStart === 'function') {
	            options.onStart({
	              el: _this._el,
	              from: from,
	              to: to
	            });
	          }

	          return raf();
	        }).then(function () {
	          if (!running) throw new Error('cancelled');

	          _this._el.removeEventListener(_this.endEvent, _this.activeEventHandler);

	          _this.activeEventHandler = function (e) {
	            // Ignore any events bubbling up
	            if (e.target !== _this._el || !running) return;

	            _this._el.removeEventListener(_this.endEvent, _this.activeEventHandler);

	            if (!hold) {
	              _this._el.removeAttribute(_this.stateChangeAttribute);
	            }

	            resolve(to, e);
	          };

	          _this._el.addEventListener(_this.endEvent, _this.activeEventHandler);

	          _this._el.setAttribute(_this.stateAttribute, to);

	          _this._state = to;
	        })["catch"](function (error) {
	          // Only catch 'cancelled' errors.
	          if (error.message !== 'cancelled') throw error;
	        });
	      });
	    }
	    /**
	     * Remove any event listeners
	     */

	  }, {
	    key: "unload",
	    value: function unload() {
	      this._el.removeEventListener(this.endEvent, this.activeEventHandler);

	      this.activeEventHandler = null;
	    }
	  }, {
	    key: "el",
	    get: function get() {
	      return this._el;
	    }
	    /**
	     * Returns current state
	     *
	     * @return {String} Current state
	     */

	  }, {
	    key: "state",
	    get: function get() {
	      return this._state;
	    }
	  }]);

	  return Animation;
	}();

	function transition(options) {
	  return new Animation(options);
	}

	class RecipientForm {
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
	    this.fillAnimation = transition({
	      el: this.checkmark
	    });
	    this.checkAnimation = transition({
	      el: this.checkmarkCheck
	    });
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

	return RecipientForm;

})));
