const priceUIBadgeTemplate = document.getElementById('price-ui-badge').content;
const badgePercentSavingsTemplate = document.getElementById('price-ui-badge__percent-savings').content;
const badgePercentSavingsRangeTemplate = document.getElementById('price-ui-badge__percent-savings-range').content;
const badgeSavingsTemplate = document.getElementById('price-ui-badge__price-savings').content;
const badgeSavingsRangeTemplate = document.getElementById('price-ui-badge__price-savings-range').content;
const badgeOnSaleTemplate = document.getElementById('price-ui-badge__on-sale').content;
const badgeSoldOutTemplate = document.getElementById('price-ui-badge__sold-out').content;
const badgeInStockTemplate = document.getElementById('price-ui-badge__in-stock').content;

function createBadgeRangeFragment(savings, percent, style, formatter) {
  let badgeRangeFragment = null;

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
  let badgeSingleFragment = null;

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

export default class PriceUIBadge {
  constructor(el) {
    this._el = el;
  }

  load(product, options) {
    const {
      variant,
      style,
      formatter,
      handler,
    } = {
      variant: false,
      style: 'percent',
      formatter: price => price,
      handler: priceUIFragment => priceUIFragment,
      ...options,
    };
    this._el.classList.add('price-ui-badge--loading');

    const priceUIBadgeFragment = handler(
      !variant
        ? this._loadProduct(product, style, formatter)
        : this._loadVariant(variant, style, formatter),
      product,
      options,
    );

    this._el.innerHTML = '';
    this._el.appendChild(priceUIBadgeFragment);
    this._el.classList.remove('price-ui-badge--loading');
  }

  _loadVariant(variant, style, formatter) {
    const priceUIBadgeFragment = priceUIBadgeTemplate.cloneNode(true);
    const badgeEl = priceUIBadgeFragment.querySelector('[data-badge]');
    const isOnSale = variant.compare_at_price && variant.compare_at_price !== variant.price;

    if (!isOnSale) {
      const badgeInStockFragment = badgeInStockTemplate.cloneNode(true);

      badgeEl.appendChild(badgeInStockFragment);

      return priceUIBadgeFragment; // Fast return if it's not on sale
    }

    if (!variant.available) {
      const badgeSoldOutFragment = badgeSoldOutTemplate.cloneNode(true);

      badgeEl.appendChild(badgeSoldOutFragment);
    } else {
      const savings = variant.compare_at_price - variant.price;
      // Round percent to two decimal places
      const percent = Math.round((savings / variant.compare_at_price) * 100);
      const badgeSingleFragment = createBadgeSingleFragment(savings, percent, style, formatter);

      badgeEl.appendChild(badgeSingleFragment);
    }

    return priceUIBadgeFragment;
  }

  _loadProduct(product, style, formatter) {
    let isOnSale = false;
    let savingsVaries = false;
    let largestSavings = -1;
    let largestPercentSavings = 0;

    product.variants.forEach(variant => {
      let tmpCompareAtPrice = variant.compare_at_price;

      if (!variant.compare_at_price) {
        tmpCompareAtPrice = variant.price;
      }

      const tmpSavings = tmpCompareAtPrice - variant.price;

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
    });

    // Converts from a number out of 1, to a number out of 100 rounded to two decimals
    largestPercentSavings = Math.round(largestPercentSavings * 100);

    const priceUIBadgeFragment = priceUIBadgeTemplate.cloneNode(true);
    const badgeEl = priceUIBadgeFragment.querySelector('[data-badge]');

    if (!isOnSale) {
      const badgeInStockFragment = badgeInStockTemplate.cloneNode(true);

      badgeEl.appendChild(badgeInStockFragment);

      return priceUIBadgeFragment; // Fast return if it's not on sale
    }

    if (savingsVaries) {
      const badgeRangeFragment = createBadgeRangeFragment(
        largestSavings,
        largestPercentSavings,
        style,
        formatter,
      );

      badgeEl.appendChild(badgeRangeFragment);
    } else {
      const badgeSingleFragment = createBadgeSingleFragment(
        largestSavings,
        largestPercentSavings,
        style,
        formatter,
      );

      badgeEl.appendChild(badgeSingleFragment);
    }

    return priceUIBadgeFragment;
  }
}
