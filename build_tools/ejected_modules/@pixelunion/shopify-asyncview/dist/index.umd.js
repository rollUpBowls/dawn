
  /*!
   * @pixelunion/shopify-asyncview v2.0.5
   * (c) 2020 Pixel Union
  */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.shopifyAsyncview = factory());
}(this, (function () { 'use strict';

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

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var deferred = {};

  var AsyncView = /*#__PURE__*/function () {
    function AsyncView() {
      _classCallCheck(this, AsyncView);
    }

    _createClass(AsyncView, null, [{
      key: "load",

      /**
       * Load the template given by the provided URL into the provided
       * view
       *
       * @param {string} url - The url to load
       * @param {object} query - An object containing additional query parameters of the URL
       * @param {string} query.view - A required query parameter indicating which view to load
       * @param {object} [options] - Config options
       * @param {string} [options.hash] - A hash of the current page content
       */
      value: function load(url) {
        var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (!('view' in query)) {
          return Promise.reject(new Error('\'view\' not found in \'query\' parameter'));
        }

        var querylessUrl = url.replace(/\?[^#]+/, '');
        var queryParamsString = new RegExp(/.+\?([^#]+)/).exec(url);
        var queryParams = query;

        if (queryParamsString && queryParamsString.length >= 2) {
          queryParamsString[1].split('&').forEach(function (param) {
            var _param$split = param.split('='),
                _param$split2 = _slicedToArray(_param$split, 2),
                key = _param$split2[0],
                value = _param$split2[1];

            queryParams[key] = value;
          });
        } // NOTE: We're adding an additional timestamp to the query.
        // This is to prevent certain browsers from returning cached
        // versions of the url we are requesting.
        // See this PR for more info: https://github.com/pixelunion/shopify-asyncview/pull/4


        var cachebustingParams = _objectSpread2({}, queryParams, {
          _: new Date().getTime()
        });

        var hashUrl = querylessUrl.replace(/([^#]+)(.*)/, function (match, address, hash) {
          return "".concat(address, "?").concat(Object.keys(queryParams).sort().map(function (key) {
            return "".concat(key, "=").concat(encodeURIComponent(queryParams[key]));
          }).join('&')).concat(hash);
        });
        var requestUrl = querylessUrl.replace(/([^#]+)(.*)/, function (match, address, hash) {
          return "".concat(address, "?").concat(Object.keys(cachebustingParams).sort().map(function (key) {
            return "".concat(key, "=").concat(encodeURIComponent(cachebustingParams[key]));
          }).join('&')).concat(hash);
        });
        var promise = new Promise(function (resolve, reject) {
          var data;

          if (hashUrl in deferred) {
            resolve(deferred[hashUrl]);
            return;
          }

          deferred[hashUrl] = promise;

          if (options.hash) {
            data = sessionStorage.getItem(hashUrl);

            if (data) {
              var deserialized = JSON.parse(data);

              if (options.hash === deserialized.options.hash) {
                delete deferred[hashUrl];
                resolve(deserialized);
                return;
              }
            }
          }

          var xhr = new XMLHttpRequest();
          xhr.open('GET', requestUrl, true);

          xhr.onload = function () {
            var el = xhr.response;
            var newOptions = {};
            var optionsEl = el.querySelector('[data-options]');

            if (optionsEl && optionsEl.innerHTML) {
              newOptions = JSON.parse(el.querySelector('[data-options]').innerHTML);
            }

            var htmlEls = el.querySelectorAll('[data-html]');
            var newHtml = {};

            if (htmlEls.length === 1 && htmlEls[0].getAttribute('data-html') === '') {
              newHtml = htmlEls[0].innerHTML;
            } else {
              for (var i = 0; i < htmlEls.length; i++) {
                newHtml[htmlEls[i].getAttribute('data-html')] = htmlEls[i].innerHTML;
              }
            }

            var dataEls = el.querySelectorAll('[data-data]');
            var newData = {};

            if (dataEls.length === 1 && dataEls[0].getAttribute('data-data') === '') {
              newData = JSON.parse(dataEls[0].innerHTML);
            } else {
              for (var _i = 0; _i < dataEls.length; _i++) {
                newData[dataEls[_i].getAttribute('data-data')] = JSON.parse(dataEls[_i].innerHTML);
              }
            }

            if (options.hash) {
              try {
                sessionStorage.setItem(hashUrl, JSON.stringify({
                  options: newOptions,
                  data: newData,
                  html: newHtml
                }));
              } catch (error) {
                console.error(error);
              }
            }

            delete deferred[hashUrl];
            resolve({
              data: newData,
              html: newHtml
            });
          };

          xhr.onerror = function () {
            delete deferred[hashUrl];
            reject();
          };

          xhr.responseType = 'document';
          xhr.send();
        });
        return promise;
      }
    }]);

    return AsyncView;
  }();

  return AsyncView;

})));
