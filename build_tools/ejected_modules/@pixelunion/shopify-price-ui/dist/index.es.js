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

var priceUITemplate = document.getElementById('price-ui').content;
var priceTemplate = document.getElementById('price-ui__price').content;
var priceRangeTemplate = document.getElementById('price-ui__price-range').content;
var unitPriceTemplate = document.getElementById('price-ui__unit-pricing').content;

function createPriceRangeFragment(priceMin, priceMax, formatter) {
  var priceRangeFragment = priceRangeTemplate.cloneNode(true);
  priceRangeFragment.querySelector('[data-price-min] [data-price]').innerHTML = formatter(priceMin);
  priceRangeFragment.querySelector('[data-price-max] [data-price]').innerHTML = formatter(priceMax);
  return priceRangeFragment;
}

function createPriceFragment(price, formatter) {
  var priceFragment = priceTemplate.cloneNode(true);
  priceFragment.querySelector('[data-price]').innerHTML = formatter(price);
  return priceFragment;
}

function createUnitPricing(variant, formatter) {
  var unitPriceContainer = unitPriceTemplate.cloneNode(true);
  var unitQuantityEl = unitPriceContainer.querySelector('[data-unit-quantity]');
  var unitPriceEl = unitPriceContainer.querySelector('[data-unit-price] [data-price]');
  var unitMeasurementEl = unitPriceContainer.querySelector('[data-unit-measurement]');
  unitQuantityEl.innerHTML = "".concat(variant.unit_price_measurement.quantity_value).concat(variant.unit_price_measurement.quantity_unit);
  unitPriceEl.innerHTML = formatter(variant.unit_price);

  if (variant.unit_price_measurement.reference_value === 1) {
    unitMeasurementEl.innerHTML = variant.unit_price_measurement.reference_unit;
  } else {
    unitMeasurementEl.innerHTML = "".concat(variant.unit_price_measurement.reference_value).concat(variant.unit_price_measurement.reference_unit);
  }

  return unitPriceContainer;
}

var PriceUI = /*#__PURE__*/function () {
  function PriceUI(el) {
    _classCallCheck(this, PriceUI);

    this._el = el;
  }

  _createClass(PriceUI, [{
    key: "load",
    value: function load(product, options) {
      var _variant$formatter$ha = _objectSpread2({
        variant: false,
        formatter: function formatter(price) {
          return price;
        },
        handler: function handler(priceUIFragment) {
          return priceUIFragment;
        }
      }, options),
          variant = _variant$formatter$ha.variant,
          formatter = _variant$formatter$ha.formatter,
          handler = _variant$formatter$ha.handler;

      this._el.classList.add('price-ui--loading');

      var priceUIFragment = handler(!variant ? this._loadProduct(product, formatter) : this._loadVariant(variant, formatter), product, options);
      this._el.innerHTML = '';

      this._el.appendChild(priceUIFragment);

      this._el.classList.remove('price-ui--loading');
    }
  }, {
    key: "_loadVariant",
    value: function _loadVariant(variant, formatter) {
      var priceUIFragment = priceUITemplate.cloneNode(true);
      var compareAtPriceEl = priceUIFragment.querySelector('[data-compare-at-price]');
      var priceEl = priceUIFragment.querySelector('[data-price]');
      var unitPricingEl = priceUIFragment.querySelector('[data-unit-pricing]');
      var isOnSale = variant.compare_at_price && variant.compare_at_price !== variant.price;

      if (isOnSale) {
        priceEl.classList.add('price--sale');

        var _priceFragment = createPriceFragment(variant.compare_at_price, formatter);

        compareAtPriceEl.appendChild(_priceFragment);
      }

      var priceFragment = createPriceFragment(variant.price, formatter);
      priceEl.appendChild(priceFragment);

      if ('unit_price' in variant) {
        var unitPricingFragment = createUnitPricing(variant, formatter);
        unitPricingEl.appendChild(unitPricingFragment);
      }

      return priceUIFragment;
    }
  }, {
    key: "_loadProduct",
    value: function _loadProduct(product, formatter) {
      var priceMin = null;
      var priceMax = null;
      var compareAtPriceMin = null;
      var compareAtPriceMax = null;
      var priceVaries = false;
      var compareAtPriceVaries = false;
      var isOnSale = false;
      product.variants.forEach(function (variant) {
        // Use variant price as compare_at_price if compare_at_price is unavailable
        var tmpCompareAtPrice = variant.compare_at_price ? variant.compare_at_price : variant.price; // Determine price min

        if (priceMin === null || variant.price < priceMin) {
          priceMin = variant.price;
        } // Determine price max


        if (priceMax === null || variant.price > priceMax) {
          priceMax = variant.price;
        } // Determine compare_at_price min


        if (compareAtPriceMin === null || tmpCompareAtPrice < compareAtPriceMin) {
          compareAtPriceMin = tmpCompareAtPrice;
        } // Determine compare_at_price max


        if (compareAtPriceMax === null || tmpCompareAtPrice > compareAtPriceMax) {
          compareAtPriceMax = tmpCompareAtPrice;
        }

        if (tmpCompareAtPrice !== variant.price) {
          isOnSale = true;
        }
      });
      priceVaries = priceMin !== priceMax;
      compareAtPriceVaries = compareAtPriceMin !== compareAtPriceMax;
      var priceUIFragment = priceUITemplate.cloneNode(true);
      var compareAtPriceEl = priceUIFragment.querySelector('[data-compare-at-price]');
      var priceEl = priceUIFragment.querySelector('[data-price]');

      if (isOnSale) {
        priceEl.classList.add('price--sale');

        if (compareAtPriceVaries) {
          var priceRangeFragment = createPriceRangeFragment(compareAtPriceMin, compareAtPriceMax, formatter);
          compareAtPriceEl.appendChild(priceRangeFragment);
        } else {
          var priceFragment = createPriceFragment(compareAtPriceMin, formatter);
          compareAtPriceEl.appendChild(priceFragment);
        }
      }

      if (priceVaries) {
        var _priceRangeFragment = createPriceRangeFragment(priceMin, priceMax, formatter);

        priceEl.appendChild(_priceRangeFragment);
      } else {
        var _priceFragment2 = createPriceFragment(priceMin, formatter);

        priceEl.appendChild(_priceFragment2);
      }

      return priceUIFragment;
    }
  }]);

  return PriceUI;
}();

var priceUIBadgeTemplate = document.getElementById('price-ui-badge').content;
var badgePercentSavingsTemplate = document.getElementById('price-ui-badge__percent-savings').content;
var badgePercentSavingsRangeTemplate = document.getElementById('price-ui-badge__percent-savings-range').content;
var badgeSavingsTemplate = document.getElementById('price-ui-badge__price-savings').content;
var badgeSavingsRangeTemplate = document.getElementById('price-ui-badge__price-savings-range').content;
var badgeOnSaleTemplate = document.getElementById('price-ui-badge__on-sale').content;
var badgeSoldOutTemplate = document.getElementById('price-ui-badge__sold-out').content;
var badgeInStockTemplate = document.getElementById('price-ui-badge__in-stock').content;

function createBadgeRangeFragment(savings, percent, style, formatter) {
  var badgeRangeFragment = null;

  switch (style) {
    case 'percent':
      badgeRangeFragment = badgePercentSavingsRangeTemplate.cloneNode(true);
      badgeRangeFragment.querySelector('[data-price-percent]').innerHTML = percent;
      break;

    case 'money':
      badgeRangeFragment = badgeSavingsRangeTemplate.cloneNode(true);
      badgeRangeFragment.querySelector('[data-price]').innerHTML = formatter(savings);
      break;

    default:
      badgeRangeFragment = badgeOnSaleTemplate.cloneNode(true);
      break;
  }

  return badgeRangeFragment;
}

function createBadgeSingleFragment(savings, percent, style, formatter) {
  var badgeSingleFragment = null;

  switch (style) {
    case 'percent':
      badgeSingleFragment = badgePercentSavingsTemplate.cloneNode(true);
      badgeSingleFragment.querySelector('[data-price-percent]').innerHTML = percent;
      break;

    case 'money':
      badgeSingleFragment = badgeSavingsTemplate.cloneNode(true);
      badgeSingleFragment.querySelector('[data-price]').innerHTML = formatter(savings);
      break;

    default:
      badgeSingleFragment = badgeOnSaleTemplate.cloneNode(true);
      break;
  }

  return badgeSingleFragment;
}

var PriceUIBadge = /*#__PURE__*/function () {
  function PriceUIBadge(el) {
    _classCallCheck(this, PriceUIBadge);

    this._el = el;
  }

  _createClass(PriceUIBadge, [{
    key: "load",
    value: function load(product, options) {
      var _variant$style$format = _objectSpread2({
        variant: false,
        style: 'percent',
        formatter: function formatter(price) {
          return price;
        },
        handler: function handler(priceUIFragment) {
          return priceUIFragment;
        }
      }, options),
          variant = _variant$style$format.variant,
          style = _variant$style$format.style,
          formatter = _variant$style$format.formatter,
          handler = _variant$style$format.handler;

      this._el.classList.add('price-ui-badge--loading');

      var priceUIBadgeFragment = handler(!variant ? this._loadProduct(product, style, formatter) : this._loadVariant(variant, style, formatter), product, options);
      this._el.innerHTML = '';

      this._el.appendChild(priceUIBadgeFragment);

      this._el.classList.remove('price-ui-badge--loading');
    }
  }, {
    key: "_loadVariant",
    value: function _loadVariant(variant, style, formatter) {
      var priceUIBadgeFragment = priceUIBadgeTemplate.cloneNode(true);
      var badgeEl = priceUIBadgeFragment.querySelector('[data-badge]');
      var isOnSale = variant.compare_at_price && variant.compare_at_price !== variant.price;

      if (!isOnSale) {
        var badgeInStockFragment = badgeInStockTemplate.cloneNode(true);
        badgeEl.appendChild(badgeInStockFragment);
        return priceUIBadgeFragment; // Fast return if it's not on sale
      }

      if (!variant.available) {
        var badgeSoldOutFragment = badgeSoldOutTemplate.cloneNode(true);
        badgeEl.appendChild(badgeSoldOutFragment);
      } else {
        var savings = variant.compare_at_price - variant.price; // Round percent to two decimal places

        var percent = Math.round(savings / variant.compare_at_price * 100);
        var badgeSingleFragment = createBadgeSingleFragment(savings, percent, style, formatter);
        badgeEl.appendChild(badgeSingleFragment);
      }

      return priceUIBadgeFragment;
    }
  }, {
    key: "_loadProduct",
    value: function _loadProduct(product, style, formatter) {
      var isOnSale = false;
      var savingsVaries = false;
      var largestSavings = -1;
      var largestPercentSavings = 0;
      product.variants.forEach(function (variant) {
        var tmpCompareAtPrice = variant.compare_at_price;

        if (!variant.compare_at_price) {
          tmpCompareAtPrice = variant.price;
        }

        var tmpSavings = tmpCompareAtPrice - variant.price;

        if (largestSavings !== 0 && tmpSavings !== largestSavings) {
          savingsVaries = true;
        }

        if (tmpSavings > 0) {
          isOnSale = true;

          if (tmpSavings > largestSavings) {
            largestSavings = tmpSavings;
            largestPercentSavings = tmpSavings / tmpCompareAtPrice;
          }
        }
      }); // Converts from a number out of 1, to a number out of 100 rounded to two decimals

      largestPercentSavings = Math.round(largestPercentSavings * 100);
      var priceUIBadgeFragment = priceUIBadgeTemplate.cloneNode(true);
      var badgeEl = priceUIBadgeFragment.querySelector('[data-badge]');

      if (!isOnSale) {
        var badgeInStockFragment = badgeInStockTemplate.cloneNode(true);
        badgeEl.appendChild(badgeInStockFragment);
        return priceUIBadgeFragment; // Fast return if it's not on sale
      }

      if (savingsVaries) {
        var badgeRangeFragment = createBadgeRangeFragment(largestSavings, largestPercentSavings, style, formatter);
        badgeEl.appendChild(badgeRangeFragment);
      } else {
        var badgeSingleFragment = createBadgeSingleFragment(largestSavings, largestPercentSavings, style, formatter);
        badgeEl.appendChild(badgeSingleFragment);
      }

      return priceUIBadgeFragment;
    }
  }]);

  return PriceUIBadge;
}();

export { PriceUI, PriceUIBadge };
