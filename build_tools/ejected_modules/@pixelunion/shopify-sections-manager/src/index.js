import LazyLoader from './LazyLoader';

function triggerInstanceEvent(instance, eventName, ...args) {
  if (instance && instance[eventName]) {
    instance[eventName](...args);
  }
}

function loadData(el) {
  const dataEl = el.querySelector('[data-section-data]');
  if (!dataEl) return {};

  // Load data from attribute, or innerHTML
  const data = dataEl.getAttribute('data-section-data') || dataEl.innerHTML;

  try {
    return JSON.parse(data);
  } catch (error) {
    console.warn(`Sections: invalid section data found. ${error.message}`);
    return {};
  }
}

export default class ShopifySectionsManager {
  constructor() {
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
  unbind() {
    document.removeEventListener('shopify:section:load', this._onSectionEvent);
    document.removeEventListener('shopify:section:unload', this._onSectionEvent);
    document.removeEventListener('shopify:section:select', this._onSectionEvent);
    document.removeEventListener('shopify:section:deselect', this._onSectionEvent);
    document.removeEventListener('shopify:section:reorder', this._onSectionEvent);
    document.removeEventListener('shopify:block:select', this._onSectionEvent);
    document.removeEventListener('shopify:block:deselect', this._onSectionEvent);

    // Unload all instances
    for (let i = 0; i < this.instances.length; i++) {
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
  register(type, handler, options = {}) {
    if (this.handlers[type]) {
      console.warn(`Sections: section handler already exists of type '${type}'.`);
    }

    // Store the section handler
    this.handlers[type] = handler;

    // Store options
    this.options[type] = options;

    // Init sections for this type
    this._initSections(type);
  }

  /**
   * Initialize sections already on the page.
   */
  _initSections(type) {
    // Fetch all existing sections of our type on the page
    const dataEls = document.querySelectorAll(`[data-section-type="${type}"]`);
    if (!dataEls) return;

    // Create an instance for each section
    for (let i = 0; i < dataEls.length; i++) {
      const dataEl = dataEls[i];
      const el = dataEl.parentNode;

      // Get instance ID
      const idEl = el.querySelector('[data-section-id]');

      if (!idEl) {
        console.warn(`Sections: unable to find section id for '${type}'.`, el);
        return;
      }

      const sectionId = idEl.getAttribute('data-section-id');
      if (!sectionId) {
        console.warn(`Sections: unable to find section id for '${type}'.`, el);
        return;
      }

      if (this.options[type] && this.options[type].lazy) {
        if (this.lazyLoader === null) {
          this.lazyLoader = new LazyLoader();
        }
        this.lazyLoader.add(el, () => this._createInstance(sectionId, el));
      } else {
        this._createInstance(sectionId, el);
      }
    }
  }

  _onSectionEvent(event) {
    const el = event.target;
    const { sectionId, blockId } = event.detail;
    const instance = this.instances[sectionId];

    switch (event.type) {
      case 'shopify:section:load':
        this._createInstance(sectionId, el);
        break;

      case 'shopify:section:unload':
        triggerInstanceEvent(instance, 'onSectionUnload', { el, id: sectionId });
        if (this.lazyLoader) {
          this.lazyLoader.remove(el);
        }
        delete this.instances[sectionId];
        break;

      case 'shopify:section:select':
        triggerInstanceEvent(instance, 'onSectionSelect', { el, id: sectionId });
        break;

      case 'shopify:section:deselect':
        triggerInstanceEvent(instance, 'onSectionDeselect', { el, id: sectionId });
        break;

      case 'shopify:section:reorder':
        triggerInstanceEvent(instance, 'onSectionReorder', { el, id: sectionId });
        break;

      case 'shopify:block:select':
        triggerInstanceEvent(instance, 'onSectionBlockSelect', { el, id: blockId });
        break;

      case 'shopify:block:deselect':
        triggerInstanceEvent(instance, 'onSectionBlockDeselect', { el, id: blockId });
        break;

      default:
        break;
    }
  }

  _postMessage(name, data) {
    Object.keys(this.instances).forEach((id) => {
      triggerInstanceEvent(this.instances[id], 'onSectionMessage', name, data);
    });
  }

  _createInstance(id, el) {
    const typeEl = el.querySelector('[data-section-type]');
    if (!typeEl) return;

    const type = typeEl.getAttribute('data-section-type');
    if (!type) return;

    const handler = this.handlers[type];
    if (!handler) {
      console.warn(`Sections: unable to find section handler for type '${type}'.`);
      return;
    }

    const data = loadData(el);
    const postMessage = this._postMessage.bind(this);

    this.instances[id] = handler({id, type, el, data, postMessage});
  }
}
