const priceUITemplate = document.getElementById('price-ui').content;
const priceTemplate = document.getElementById('price-ui__price').content;
const priceRangeTemplate = document.getElementById('price-ui__price-range').content;
const unitPriceTemplate = document.getElementById('price-ui__unit-pricing').content;

function createPriceRangeFragment(priceMin, priceMax, formatter) {
  const priceRangeFragment = priceRangeTemplate.cloneNode(true);

  priceRangeFragment.querySelector('[data-price-min] [data-price]').innerHTML = formatter(priceMin);
  priceRangeFragment.querySelector('[data-price-max] [data-price]').innerHTML = formatter(priceMax);

  return priceRangeFragment;
}

function createPriceFragment(price, formatter) {
  const priceFragment = priceTemplate.cloneNode(true);

  priceFragment.querySelector('[data-price]').innerHTML = formatter(price);

  return priceFragment;
}

function createUnitPricing(variant, formatter) {
  const unitPriceContainer = unitPriceTemplate.cloneNode(true);
  const unitQuantityEl = unitPriceContainer.querySelector('[data-unit-quantity]');
  const unitPriceEl = unitPriceContainer.querySelector('[data-unit-price] [data-price]');
  const unitMeasurementEl = unitPriceContainer.querySelector('[data-unit-measurement]');

  unitQuantityEl.innerHTML = `${variant.unit_price_measurement.quantity_value}${variant.unit_price_measurement.quantity_unit}`;
  unitPriceEl.innerHTML = formatter(variant.unit_price);

  if (variant.unit_price_measurement.reference_value === 1) {
    unitMeasurementEl.innerHTML = variant.unit_price_measurement.reference_unit;
  } else {
    unitMeasurementEl.innerHTML = `${variant.unit_price_measurement.reference_value}${variant.unit_price_measurement.reference_unit}`;
  }

  return unitPriceContainer;
}

export default class PriceUI {
  constructor(el) {
    this._el = el;
  }

  load(product, options) {
    const {
      variant,
      formatter,
      handler,
    } = {
      variant: false,
      formatter: price => price,
      handler: priceUIFragment => priceUIFragment,
      ...options,
    };
    this._el.classList.add('price-ui--loading');

    const priceUIFragment = handler(
      !variant
        ? this._loadProduct(product, formatter)
        : this._loadVariant(variant, formatter),
      product,
      options,
    );

    this._el.innerHTML = '';
    this._el.appendChild(priceUIFragment);
    this._el.classList.remove('price-ui--loading');
  }

  _loadVariant(variant, formatter) {
    const priceUIFragment = priceUITemplate.cloneNode(true);
    const compareAtPriceEl = priceUIFragment.querySelector('[data-compare-at-price]');
    const priceEl = priceUIFragment.querySelector('[data-price]');
    const unitPricingEl = priceUIFragment.querySelector('[data-unit-pricing]');
    const isOnSale = variant.compare_at_price && variant.compare_at_price !== variant.price;

    if (isOnSale) {
      priceEl.classList.add('price--sale');

      const priceFragment = createPriceFragment(
        variant.compare_at_price,
        formatter,
      );

      compareAtPriceEl.appendChild(priceFragment);
    }

    const priceFragment = createPriceFragment(variant.price, formatter);

    priceEl.appendChild(priceFragment);

    if ('unit_price' in variant) {
      const unitPricingFragment = createUnitPricing(variant, formatter);

      unitPricingEl.appendChild(unitPricingFragment);
    }

    return priceUIFragment;
  }

  _loadProduct(product, formatter) {
    let priceMin = null;
    let priceMax = null;
    let compareAtPriceMin = null;
    let compareAtPriceMax = null;
    let priceVaries = false;
    let compareAtPriceVaries = false;
    let isOnSale = false;

    product.variants.forEach(variant => {
      // Use variant price as compare_at_price if compare_at_price is unavailable
      const tmpCompareAtPrice = variant.compare_at_price
        ? variant.compare_at_price
        : variant.price;

      // Determine price min
      if (priceMin === null || variant.price < priceMin) {
        priceMin = variant.price;
      }

      // Determine price max
      if (priceMax === null || variant.price > priceMax) {
        priceMax = variant.price;
      }

      // Determine compare_at_price min
      if (compareAtPriceMin === null || tmpCompareAtPrice < compareAtPriceMin) {
        compareAtPriceMin = tmpCompareAtPrice;
      }

      // Determine compare_at_price max
      if (compareAtPriceMax === null || tmpCompareAtPrice > compareAtPriceMax) {
        compareAtPriceMax = tmpCompareAtPrice;
      }

      if (tmpCompareAtPrice !== variant.price) {
        isOnSale = true;
      }
    });

    priceVaries = priceMin !== priceMax;
    compareAtPriceVaries = compareAtPriceMin !== compareAtPriceMax;

    const priceUIFragment = priceUITemplate.cloneNode(true);
    const compareAtPriceEl = priceUIFragment.querySelector('[data-compare-at-price]');
    const priceEl = priceUIFragment.querySelector('[data-price]');

    if (isOnSale) {
      priceEl.classList.add('price--sale');

      if (compareAtPriceVaries) {
        const priceRangeFragment = createPriceRangeFragment(
          compareAtPriceMin,
          compareAtPriceMax,
          formatter,
        );

        compareAtPriceEl.appendChild(priceRangeFragment);
      } else {
        const priceFragment = createPriceFragment(
          compareAtPriceMin,
          formatter,
        );

        compareAtPriceEl.appendChild(priceFragment);
      }
    }

    if (priceVaries) {
      const priceRangeFragment = createPriceRangeFragment(
        priceMin,
        priceMax,
        formatter,
      );

      priceEl.appendChild(priceRangeFragment);
    } else {
      const priceFragment = createPriceFragment(priceMin, formatter);

      priceEl.appendChild(priceFragment);
    }

    return priceUIFragment;
  }
}
