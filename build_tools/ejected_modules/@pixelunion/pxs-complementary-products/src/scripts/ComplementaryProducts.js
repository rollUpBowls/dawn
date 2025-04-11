import EventHandler from './../../../events';
import AsyncView from './../../../shopify-asyncview';
import rimg from './../../../rimg-shopify';
import Flickity from 'flickity';

export default class ComplementaryProducts {
  constructor(options) {
    this.sectionEl = options.sectionEl;
    this.sectionId = options.sectionId;
    this.events = new EventHandler();
    this.productId = options.productId;
    this.includeIndicatorDots = options.includeIndicatorDots || false;
    this.recommendationsRoute = options.productRecommendationsRoute;
    this.limit = options.limit;

    const defaultArrowShape = {
      x0: 10,
      x1: 60,
      y1: 50,
      x2: 65,
      y2: 45,
      x3: 20,
    }

    this.arrowShape = options.arrowShape || defaultArrowShape;

    this.recommendationsEl = this.sectionEl.querySelector('[data-complementary-products]');
    this.loadRecommendations();
  }

  loadRecommendations() {
    const url = `${this.recommendationsRoute}?section_id=${this.sectionId}&limit=${this.limit}&product_id=${this.productId}&intent=complementary`;

    AsyncView.load(
      url,
      { view: '' },
    ).then(({ html }) => {
      if (typeof html === 'object' && Object.keys(html).length === 0) return;

      if (html.trim().length === 0) {
        this.recommendationsEl.classList.add('complementary-products--no-recommendations');
        return;
      }

      this.recommendationsEl.innerHTML = html;

      if (!rimg.instance) {
        rimg.init();
      }

      rimg.watch(this.recommendationsEl);

      const slider = this.recommendationsEl.querySelector('[data-slider]');
      const slides = this.recommendationsEl.querySelectorAll('[data-slide]');

      if (slides.length > 1) {
        this.slider = new Flickity(slider, {
          cellSelector: '[data-slide]',
          accessibility: false,
          adaptiveHeight: false,
          autoPlay: false,
          cellAlign: 'left',
          contain: true,
          imagesLoaded: true,
          pageDots: this.includeIndicatorDots,
          wrapAround: true,
          arrowShape: this.arrowShape,
        });

        this.events.register(slider, 'rimg:load', () => {
          this.slider.resize();
        })
      }
    });
  }

  unload() {
    this.slider.destroy();
  }
}
