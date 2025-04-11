const deferred = {};

export default class AsyncView {
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
  static load(url, query = {}, options = {}) {
    if (!('view' in query)) {
      return Promise.reject(new Error('\'view\' not found in \'query\' parameter'));
    }

    const querylessUrl = url.replace(/\?[^#]+/, '');
    const queryParamsString = new RegExp(/.+\?([^#]+)/).exec(url);
    const queryParams = query;

    if (queryParamsString && queryParamsString.length >= 2) {
      queryParamsString[1].split('&').forEach((param) => {
        const [key, value] = param.split('=');

        queryParams[key] = value;
      });
    }

    // NOTE: We're adding an additional timestamp to the query.
    // This is to prevent certain browsers from returning cached
    // versions of the url we are requesting.
    // See this PR for more info: https://github.com/pixelunion/shopify-asyncview/pull/4
    const cachebustingParams = {
      ...queryParams,
      _: new Date().getTime(),
    };

    const hashUrl = querylessUrl.replace(/([^#]+)(.*)/, (match, address, hash) => `${address}?${Object.keys(queryParams).sort().map(key => `${key}=${encodeURIComponent(queryParams[key])}`).join('&')}${hash}`);
    const requestUrl = querylessUrl.replace(/([^#]+)(.*)/, (match, address, hash) => `${address}?${Object.keys(cachebustingParams).sort().map(key => `${key}=${encodeURIComponent(cachebustingParams[key])}`).join('&')}${hash}`);
    const promise = new Promise((resolve, reject) => {
      let data;
      if (hashUrl in deferred) {
        resolve(deferred[hashUrl]);
        return;
      }
  
      deferred[hashUrl] = promise;
  
      if (options.hash) {
        data = sessionStorage.getItem(hashUrl);
  
        if (data) {
          const deserialized = JSON.parse(data);
  
          if (options.hash === deserialized.options.hash) {
            delete deferred[hashUrl];
            resolve(deserialized);
            return;
          }
        }
      }

      const xhr = new XMLHttpRequest();

      xhr.open('GET', requestUrl, true);
      xhr.onload = () => {
        const el = xhr.response;

        let newOptions = {};
        const optionsEl = el.querySelector('[data-options]');

        if (optionsEl && optionsEl.innerHTML) {
          newOptions = JSON.parse(el.querySelector('[data-options]').innerHTML);
        }

        const htmlEls = el.querySelectorAll('[data-html]');

        let newHtml = {};

        if (htmlEls.length === 1 && htmlEls[0].getAttribute('data-html') === '') {
          newHtml = htmlEls[0].innerHTML;
        } else {
          for (let i = 0; i < htmlEls.length; i++) {
            newHtml[htmlEls[i].getAttribute('data-html')] = htmlEls[i].innerHTML;
          }
        }

        const dataEls = el.querySelectorAll('[data-data]');

        let newData = {};

        if (dataEls.length === 1 && dataEls[0].getAttribute('data-data') === '') {
          newData = JSON.parse(dataEls[0].innerHTML);
        } else {
          for (let i = 0; i < dataEls.length; i++) {
            newData[dataEls[i].getAttribute('data-data')] = JSON.parse(dataEls[i].innerHTML);
          }
        }

        if (options.hash) {
          try {
            sessionStorage.setItem(
              hashUrl,
              JSON.stringify({ options: newOptions, data: newData, html: newHtml }),
            );
          } catch (error) {
            console.error(error);
          }
        }

        delete deferred[hashUrl];
        resolve({ data: newData, html: newHtml });
      };
      xhr.onerror = () => {
        delete deferred[hashUrl];
        reject();
      };
      xhr.responseType = 'document';
      xhr.send();
    });

    return promise;
  }
}
