
/*!
 * @pixelunion/shopify-sections-manager v1.1.0
 * (c) 2021 Pixel Union
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.ShopifySectionsManager = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

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

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  /**
   * Allows a callback to be run once, when a target intersects the viewport.
   * @constructor
   * @param {Object} [options] options with which to construct the IntersectionObserver
   * @param {string} [options.rootMargin='30%'] A string which specifies a set of offsets to add to
   *                                          the root's bounding_box when calculating intersections.
   * @param {number} [options.threshold=0] Ratio of intersection required to trigger callback
   */
  var LazyLoader = /*#__PURE__*/function () {
    function LazyLoader(options) {
      _classCallCheck(this, LazyLoader);

      var defaultOptions = {
        rootMargin: '30%',
        threshold: 0
      };
      this.callbacks = new WeakMap();
      this._observerCallback = this._observerCallback.bind(this);
      this.observer = new IntersectionObserver(this._observerCallback, _objectSpread2(_objectSpread2({}, defaultOptions), options));
    }
    /**
     * Add target and callback. Callback is only run once.
     * @add
     * @param {HTMLElement} target Target element
     * @param {function} callback Callback to run when target begins intersecting
     */


    _createClass(LazyLoader, [{
      key: "add",
      value: function add(target, callback) {
        this.callbacks.set(target, callback);
        this.observer.observe(target);
      }
      /**
       * Remove target. Associated callback is also removed.
       * @remove
       * @param {HTMLElement} target Target element
       */

    }, {
      key: "remove",
      value: function remove(target) {
        this.observer.unobserve(target);
        this.callbacks["delete"](target);
      }
      /**
       * Disconnects IntersectionObserver if active
       * @unload
       */

    }, {
      key: "unload",
      value: function unload() {
        this.observer.disconnect();
      }
      /**
       * Runs associated callbacks for each entry, then removes that entry and callback
       * @_observerCallback
       * @param {IntersectionObserverEntry[]} entries Entries to check
       * @param {InterserctionObserver} observer IntersectionObserver instance
       */

    }, {
      key: "_observerCallback",
      value: function _observerCallback(entries, observer) {
        var _this = this;

        entries.forEach(function (_ref) {
          var isIntersecting = _ref.isIntersecting,
              target = _ref.target;

          // do nothing unless target moved into state of intersection
          if (isIntersecting === true) {
            // make sure we stop observing before running the callback, so we don't
            // somehow run the callback twice if element intersects twice quickly
            observer.unobserve(target);

            var callback = _this.callbacks.get(target);

            if (typeof callback === 'function') {
              callback();
            }

            _this.callbacks["delete"](target);
          }
        });
      }
    }]);

    return LazyLoader;
  }();

  function triggerInstanceEvent(instance, eventName) {
    if (instance && instance[eventName]) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      instance[eventName].apply(instance, args);
    }
  }

  function loadData(el) {
    var dataEl = el.querySelector('[data-section-data]');
    if (!dataEl) return {}; // Load data from attribute, or innerHTML

    var data = dataEl.getAttribute('data-section-data') || dataEl.innerHTML;

    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn("Sections: invalid section data found. ".concat(error.message));
      return {};
    }
  }

  var ShopifySectionsManager = /*#__PURE__*/function () {
    function ShopifySectionsManager() {
      _classCallCheck(this, ShopifySectionsManager);

      this.handlers = {};
      this.instances = {};
      this.options = {};
      this.lazyLoader = null;
      this._onSectionEvent = this._onSectionEvent.bind(this);
      document.addEventListener('shopify:section:load', this._onSectionEvent);
      document.addEventListener('shopify:section:unload', this._onSectionEvent);
      document.addEventListener('shopify:section:select', this._onSectionEvent);
      document.addEventListener('shopify:section:deselect', this._onSectionEvent);
      document.addEventListener('shopify:section:reorder', this._onSectionEvent);
      document.addEventListener('shopify:block:select', this._onSectionEvent);
      document.addEventListener('shopify:block:deselect', this._onSectionEvent);
    }
    /**
     * Stop listening for section events, and unbind all handlers.
     */


    _createClass(ShopifySectionsManager, [{
      key: "unbind",
      value: function unbind() {
        document.removeEventListener('shopify:section:load', this._onSectionEvent);
        document.removeEventListener('shopify:section:unload', this._onSectionEvent);
        document.removeEventListener('shopify:section:select', this._onSectionEvent);
        document.removeEventListener('shopify:section:deselect', this._onSectionEvent);
        document.removeEventListener('shopify:section:reorder', this._onSectionEvent);
        document.removeEventListener('shopify:block:select', this._onSectionEvent);
        document.removeEventListener('shopify:block:deselect', this._onSectionEvent); // Unload all instances

        for (var i = 0; i < this.instances.length; i++) {
          triggerInstanceEvent(this.instances[i], 'onSectionUnload');
        }

        this.handlers = {};
        this.options = {};
        this.lazyLoader.unload();
        this.lazyLoader = null;
        this.instances = {};
      }
      /**
       * Register a section handler.
       *
       * @param {string} type
       *        The section type to handle. The handler will be called for all
       *        sections with this type.
       *
       * @param {function} handler
       *        The handler function is passed information about a specific section
       *        instance. The handler is expected to return an object that will be
       *        associated with the section instance.
       *
       *        Section handlers are passed an object with the following parameters:
       *          {string} id
       *          An ID that maps to a specific section instance. Typically the
       *          section's filename for static sections, or a generated ID for
       *          dynamic sections.
       *
       *          {string} type
       *          The section type, as supplied when registered.
       *
       *          {Element} el
       *          The root DOM element for the section instance.
       *
       *          {Object} data
       *          Data loaded from the section script element. Defaults to an
       *          empty object.
       *
       *          {Function} postMessage
       *          A function that can be called to pass messages between sections.
       *          The function should be called with a message "name", and
       *          optionally some data.
       *
       * @param {object} options
       *
       * @param {boolean} options.lazy
       *     If true, sections will only be initialized after they intersect the viewport + 30% margin
       */

    }, {
      key: "register",
      value: function register(type, handler) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (this.handlers[type]) {
          console.warn("Sections: section handler already exists of type '".concat(type, "'."));
        } // Store the section handler


        this.handlers[type] = handler; // Store options

        this.options[type] = options; // Init sections for this type

        this._initSections(type);
      }
      /**
       * Initialize sections already on the page.
       */

    }, {
      key: "_initSections",
      value: function _initSections(type) {
        var _this = this;

        // Fetch all existing sections of our type on the page
        var dataEls = document.querySelectorAll("[data-section-type=\"".concat(type, "\"]"));
        if (!dataEls) return; // Create an instance for each section

        var _loop = function _loop(i) {
          var dataEl = dataEls[i];
          var el = dataEl.parentNode; // Get instance ID

          var idEl = el.querySelector('[data-section-id]');

          if (!idEl) {
            console.warn("Sections: unable to find section id for '".concat(type, "'."), el);
            return {
              v: void 0
            };
          }

          var sectionId = idEl.getAttribute('data-section-id');

          if (!sectionId) {
            console.warn("Sections: unable to find section id for '".concat(type, "'."), el);
            return {
              v: void 0
            };
          }

          if (_this.options[type] && _this.options[type].lazy) {
            if (_this.lazyLoader === null) {
              _this.lazyLoader = new LazyLoader();
            }

            _this.lazyLoader.add(el, function () {
              return _this._createInstance(sectionId, el);
            });
          } else {
            _this._createInstance(sectionId, el);
          }
        };

        for (var i = 0; i < dataEls.length; i++) {
          var _ret = _loop(i);

          if (_typeof(_ret) === "object") return _ret.v;
        }
      }
    }, {
      key: "_onSectionEvent",
      value: function _onSectionEvent(event) {
        var el = event.target;
        var _event$detail = event.detail,
            sectionId = _event$detail.sectionId,
            blockId = _event$detail.blockId;
        var instance = this.instances[sectionId];

        switch (event.type) {
          case 'shopify:section:load':
            this._createInstance(sectionId, el);

            break;

          case 'shopify:section:unload':
            triggerInstanceEvent(instance, 'onSectionUnload', {
              el: el,
              id: sectionId
            });

            if (this.lazyLoader) {
              this.lazyLoader.remove(el);
            }

            delete this.instances[sectionId];
            break;

          case 'shopify:section:select':
            triggerInstanceEvent(instance, 'onSectionSelect', {
              el: el,
              id: sectionId
            });
            break;

          case 'shopify:section:deselect':
            triggerInstanceEvent(instance, 'onSectionDeselect', {
              el: el,
              id: sectionId
            });
            break;

          case 'shopify:section:reorder':
            triggerInstanceEvent(instance, 'onSectionReorder', {
              el: el,
              id: sectionId
            });
            break;

          case 'shopify:block:select':
            triggerInstanceEvent(instance, 'onSectionBlockSelect', {
              el: el,
              id: blockId
            });
            break;

          case 'shopify:block:deselect':
            triggerInstanceEvent(instance, 'onSectionBlockDeselect', {
              el: el,
              id: blockId
            });
            break;
        }
      }
    }, {
      key: "_postMessage",
      value: function _postMessage(name, data) {
        var _this2 = this;

        Object.keys(this.instances).forEach(function (id) {
          triggerInstanceEvent(_this2.instances[id], 'onSectionMessage', name, data);
        });
      }
    }, {
      key: "_createInstance",
      value: function _createInstance(id, el) {
        var typeEl = el.querySelector('[data-section-type]');
        if (!typeEl) return;
        var type = typeEl.getAttribute('data-section-type');
        if (!type) return;
        var handler = this.handlers[type];

        if (!handler) {
          console.warn("Sections: unable to find section handler for type '".concat(type, "'."));
          return;
        }

        var data = loadData(el);

        var postMessage = this._postMessage.bind(this);

        this.instances[id] = handler({
          id: id,
          type: type,
          el: el,
          data: data,
          postMessage: postMessage
        });
      }
    }]);

    return ShopifySectionsManager;
  }();

  return ShopifySectionsManager;

})));
