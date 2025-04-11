const LOCAL_STORAGE_KEY = 'pxu-shopify-surface-pick-up';
const loadingClass = 'surface-pick-up--loading';

const isNotExpired = timestamp => timestamp + 1000 * 60 * 60 >= Date.now();

const removeTrailingSlash = s => s.replace(/(.*)\/$/, '$1'); // Haversine Distance
// The haversine formula is an equation giving great-circle distances between
// two points on a sphere from their longitudes and latitudes


function calculateDistance(latitude1, longitude1, latitude2, longitude2, unitSystem) {
  const dtor = Math.PI / 180;
  const radius = unitSystem === 'metric' ? 6378.14 : 3959;
  const rlat1 = latitude1 * dtor;
  const rlong1 = longitude1 * dtor;
  const rlat2 = latitude2 * dtor;
  const rlong2 = longitude2 * dtor;
  const dlon = rlong1 - rlong2;
  const dlat = rlat1 - rlat2;
  const a = Math.sin(dlat / 2) ** 2 + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

async function getGeoLocation() {
  return new Promise((resolve, reject) => {
    const options = {
      maximumAge: 3600000,
      // 1 hour
      timeout: 5000
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({
        coords
      }) => resolve(coords), reject, options);
    } else {
      reject();
    }
  });
}

async function setLocation({
  latitude,
  longitude
}) {
  const newData = {
    latitude,
    longitude,
    timestamp: Date.now()
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
  return fetch('/localization.json', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      latitude,
      longitude
    })
  }).then(() => ({
    latitude,
    longitude
  }));
}

async function getLocation(requestLocation = false) {
  const cachedLocation = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

  if (cachedLocation && isNotExpired(cachedLocation.timestamp)) {
    return cachedLocation;
  }

  if (requestLocation) {
    return getGeoLocation().then(coords => {
      setLocation(coords); // We don't need to wait for this

      return coords;
    });
  }

  return null;
}

class SurfacePickUp {
  constructor(el, options) {
    this.el = el;
    const themeObj = window.PXUTheme || window.Theme;
    this.options = {
      root_url: themeObj && themeObj.routes && themeObj.routes.root_url || '',
      ...options
    };
    this.options.root_url = removeTrailingSlash(this.options.root_url);
    this.callbacks = [];
    this.onBtnPress = null;
    this.latestVariantId = null;
  }

  load(variantId) {
    // If no variant is available, empty element and quick-return
    if (!variantId) {
      this.el.innerHTML = '';
      return Promise.resolve(true);
    } // Because Shopify doesn't expose any `pick_up_enabled` data on the shop object, we
    // don't know if the variant might be, or is definitely not available for pick up.
    // Until we know the shop has > 0 pick up locations, we want to avoid prompting the
    // user for location data (it's annoying, and only makes sense to do if we use it).
    //
    // Instead, we have to make an initial request, check and see if any pick up locations
    // were returned, then ask for the users location, then make another request to get the
    // location-aware pick up locations.
    //
    // As far as I can tell the pick up aware locations differ only in sort order - which
    // we could do on the front end - but we're following this approach to ensure future
    // compatibility with any changes Shopify makes (maybe disabling options based on
    // user location, or whatever else).
    //
    // Shopify has indicated they will look into adding pick_up_enabled data to the shop
    // object, which which case this method can be greatly simplifed into 2 simple cases.


    this.latestVariantId = variantId;
    this.el.classList.add(loadingClass);
    return this._getData(variantId).then(data => this._injectData(data));
  }

  onModalRequest(callback) {
    if (this.callbacks.indexOf(callback) >= 0) return;
    this.callbacks.push(callback);
  }

  offModalRequest(callback) {
    this.callbacks.splice(this.callbacks.indexOf(callback));
  }

  unload() {
    this.callbacks = [];
    this.el.innerHTML = '';
  }

  _getData(variantId) {
    return new Promise(resolve => {
      const xhr = new XMLHttpRequest();
      const requestUrl = `${this.options.root_url}/variants/${variantId}/?section_id=surface-pick-up`;
      xhr.open('GET', requestUrl, true);

      xhr.onload = () => {
        const el = xhr.response;
        const embed = el.querySelector('[data-html="surface-pick-up-embed"]');
        const itemsContainer = el.querySelector('[data-html="surface-pick-up-items"]');
        const items = itemsContainer.content.querySelectorAll('[data-surface-pick-up-item]');
        resolve({
          embed,
          itemsContainer,
          items,
          variantId
        });
      };

      xhr.onerror = () => {
        resolve({
          embed: {
            innerHTML: ''
          },
          itemsContainer: {
            innerHTML: ''
          },
          items: [],
          variantId
        });
      };

      xhr.responseType = 'document';
      xhr.send();
    });
  }

  _injectData({
    embed,
    itemsContainer,
    items,
    variantId
  }) {
    if (variantId !== this.latestVariantId || items.length === 0) {
      this.el.innerHTML = '';
      this.el.classList.remove(loadingClass);
      return;
    }

    this.el.innerHTML = embed.innerHTML;
    this.el.classList.remove(loadingClass);
    let calculatedDistances = false;

    const calculateDistances = () => {
      if (calculatedDistances) return Promise.resolve();
      return getLocation(true).then(coords => {
        items.forEach(item => {
          const distanceEl = item.querySelector('[data-distance]');
          const distanceUnitEl = item.querySelector('[data-distance-unit]');
          const unitSystem = distanceUnitEl.dataset.distanceUnit;
          const itemLatitude = parseFloat(distanceEl.dataset.latitude);
          const itemLongitude = parseFloat(distanceEl.dataset.longitude);

          if (coords && isFinite(itemLatitude) && isFinite(itemLongitude)) {
            const distance = calculateDistance(coords.latitude, coords.longitude, itemLatitude, itemLongitude, unitSystem);
            distanceEl.innerHTML = distance.toFixed(1);
          } else {
            distanceEl.remove();
            distanceUnitEl.remove();
          }
        });
      }).catch(e => {
        console.log(e);
        items.forEach(item => {
          const distanceEl = item.querySelector('[data-distance]');
          const distanceUnitEl = item.querySelector('[data-distance-unit]');
          distanceEl.remove();
          distanceUnitEl.remove();
        });
      }).finally(() => {
        calculatedDistances = true;
      });
    };

    this.el.querySelector('[data-surface-pick-up-embed-modal-btn]').addEventListener('click', () => {
      calculateDistances().then(() => this.callbacks.forEach(callback => callback(itemsContainer.innerHTML)));
    });
  }

}

export default SurfacePickUp;
