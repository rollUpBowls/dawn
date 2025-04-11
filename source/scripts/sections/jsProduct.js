import ComplementaryProducts from './../../../build_tools/ejected_modules/@pixelunion/pxs-complementary-products';
import ShopifySurfacePickUp from './../../../build_tools/ejected_modules/@pixelunion/shopify-surface-pick-up';
import { PriceUI, PriceUIBadge } from './../../../build_tools/ejected_modules/@pixelunion/shopify-price-ui';
import AsyncView from './../../../build_tools/ejected_modules/@pixelunion/shopify-asyncview';
import RecipientForm from './../../../build_tools/ejected_modules/@pixelunion/pxs-gift-card-recipient-form';

class Product {
  static load(url) {
    return AsyncView.load(
      url, // template name
      { view: 'quickshop' }, // view name (suffix)
    );
  }

  constructor($section) {
    // Add settings from schema to current object
    this._section = $section[0];
    this._data = window.PXUTheme.getSectionData($section);

    this.stickyOffset = 20;

    // Ensure product media libraries are present
    window.Shopify.loadFeatures([
      {
        name: 'shopify-xr',
        version: '1.0',
      },
      {
        name: 'model-viewer-ui',
        version: '1.0',
      },
    ], window.PXUTheme.productMedia.setupMedia);

    const priceUIEl = $section[0].querySelector('[data-price-ui]');
    const priceUIBadgeEl = $section[0].querySelector('[data-price-ui-badge]');
    const surfacePickUpEl = $section[0].querySelector('[data-surface-pick-up]');
    const complementaryProductsEl = $section[0].querySelector('[data-complementary-products]');
    const recipientFormEl = this._section.querySelector('[data-recipient-form]');
    const collapsibleRowEl = this._section.querySelector('[data-collapsible-row]');

    if (collapsibleRowEl) {
      window.PXUTheme.collapsibleRowUtil.init();
    }
    if (recipientFormEl) {
      this.recipientForm = new RecipientForm(this._section);
    }

    this.variantSelection = $section[0].querySelector('[data-variant-selection]');

    if (this.variantSelection) {
      this.variantSelection.addEventListener(
        'variant-change',
        event => this._switchVariant(
          event.detail.product,
          event.detail.variant,
          event.detail.state,
        ),
      );

      if (surfacePickUpEl) {
        this.surfacePickUp = new ShopifySurfacePickUp(surfacePickUpEl);
        this.surfacePickUp.onModalRequest(contents => {
          Promise.all([
            this.variantSelection.getProduct(),
            this.variantSelection.getVariant(),
          ]).then(([product, variant]) => {
            const surfacePickUpModal = $section[0].querySelector('[data-surface-pick-up-modal]');
            const fragment = document.createDocumentFragment();
            const header = document.createElement('div');
            const title = document.createElement('span');
            const subtitle = document.createElement('span');

            header.classList.add('surface-pick-up__modal-header');
            title.classList.add('surface-pick-up__modal-title');
            subtitle.classList.add('surface-pick-up__modal-subtitle');

            title.innerHTML = product.title;
            subtitle.innerHTML = variant.title;

            header.appendChild(title);

            if (variant.title !== 'Default Title') {
              header.appendChild(subtitle);
            }

            fragment.appendChild(header);

            surfacePickUpModal.innerHTML = contents;
            surfacePickUpModal.insertBefore(fragment, surfacePickUpModal.firstChild);
            $.fancybox.open(
              surfacePickUpModal,
              {
                hash: false,
                infobar: false,
                toolbar: false,
                loop: true,
                smallBtn: true,
                buttons: [
                  // "zoom",
                  // "share",
                  // "slideShow",
                  // "fullScreen",
                  // "download",
                  // "thumbs",
                  // "close"
                ],
                touch: false,
                video: {
                  autoStart: false,
                },
                mobile: {
                  preventCaptionOverlap: false,
                  toolbar: true,
                },
                beforeShow: () => {
                  document.body.style.top = `-${window.scrollY}px`;
                  document.body.style.position = 'fixed';
                },
                beforeClose: () => {
                  const scrollY = document.body.style.top;
                  document.body.style.position = '';
                  document.body.style.top = '';
                  window.scrollTo(0, parseInt(scrollY || 0, 10) * -1);
                },
              },
            );
          });
        });
      }
    }

    if (priceUIEl) {
      this.priceUI = new PriceUI(priceUIEl);
    }

    if (priceUIBadgeEl) {
      this.priceUIBadge = new PriceUIBadge(priceUIBadgeEl);
    }

    this.$productGallery = $section.find('.product-gallery__main');
    const $stickyElement = $section.find('.sticky-product-scroll');

    if (this.$productGallery) {
      this.enableSlideshow(this.$productGallery);

      if (this._data.enable_zoom) {
        document.addEventListener('lazyloaded', this.enableZoom);
      }

      if (this._data.enable_product_lightbox) {
        this.enableLightbox(this.$productGallery);
      }
    }

    if (complementaryProductsEl) {
      this.complementaryProducts = new ComplementaryProducts({
        sectionEl: this._section,
        sectionId: this._data.section_id,
        productId: this._data.product.id,
        productRecommendationsRoute: window.PXUTheme.routes.product_recommendations_url,
        includeIndicatorDots: true,
        limit: this._data.product_recommendation_limit,
        arrowShape: 'M 95.04 46 21.68 46 48.18 22.8 42.91 16.78 4.96 50 42.91 83.22 48.18 77.2 21.68 54 95.04 54 95.04 46z',
      });
    }

    if ($stickyElement && window.isScreenSizeLarge() && this._data.template === 'image-scroll') {
      this.enableStickyScroll($stickyElement, this.$productGallery);
    }

    if (window.location.search === '?contact_posted=true') {
      $('.notify_form .contact-form').hide();
      $('.notify_form .contact-form').prev('.message').html(window.PXUTheme.translation.notify_form_success);
    }

    if ($('.masonry--true').length > 0) {
      window.PXUTheme.applyMasonry('.thumbnail');
    }

    if (this.variantSelection) {
      Promise.all([
        this.variantSelection.getProduct(),
        this.variantSelection.getVariant(),
        this.variantSelection.getState(),
      ]).then(([product, variant, state]) => this._switchVariant(
        product,
        variant,
        state,
      ));
    }
  }

  enableStickyScroll($stickyElement, $productGallery) {
    let announcementHeight = 0;
    let headerHeight = 0;

    if (typeof window.PXUTheme.jsAnnouncementBar !== 'undefined' && window.PXUTheme.jsAnnouncementBar.enable_sticky) {
      announcementHeight = $('#announcement-bar').outerHeight();
    }

    if (window.PXUTheme.theme_settings.header_layout !== 'vertical') {
      if (window.PXUTheme.jsHeader.enable_sticky) {
        headerHeight = $('#header').outerHeight();
      }
    }

    const productImages = $productGallery.data('media-count');

    // enable if more than 1 image is present

    if (productImages > 1) {
      $stickyElement.stick_in_parent({
        offset_top: announcementHeight + headerHeight + this.stickyOffset,
      });
    }
  }

  enableLightbox($productGallery) {
    $productGallery.find('.product-gallery__link').fancybox({
      beforeClose: instance => {
        const $instanceGallery = instance.$trigger.first().parents('.product-gallery__main');
        $instanceGallery.hide();
        setTimeout(() => $instanceGallery.fadeIn(100), 500);
      },
      afterClose: () => {
        setTimeout(() => {
          $productGallery.find('.is-selected a').focus();
        }, 500);
      },
    });
  }

  enableZoom() {
    const $image = $(event.target);
    const zoomSrc = $image.data('zoom-src');
    if (zoomSrc) {
      $image.wrap('<span class="zoom-container"></span>')
        .css('display', 'block')
        .parent()
        .zoom({
          url: zoomSrc,
          touch: false,
          magnify: 1,
        });
    }
  }

  disableSlideshow($section, selector) {
    let $slider;
    if ($section) {
      $slider = $section.find('.flickity-enabled');
    } else {
      $slider = $(selector);
    }

    this.$productGallery.flickity('destroy');
  }

  enableSlideshow(selector, settings) {
    // Define variables
    const $productGallery = selector;
    const $thumbnailProductGallery = $productGallery.closest('.product-gallery').find('.product-gallery__thumbnails');

    const $slides = $productGallery.find('.product-gallery__image');
    const $thumbnails = $thumbnailProductGallery.find('.product-gallery__thumbnail');

    function autoplayVideo(videoID, $slide) {
      // Compare id to player object and only play that video
      $.each(videoPlayers, (_, player) => {
        if (player.id === videoID) {
          player.play();

          // On fullscreen toggle, focus back on the slide itself
          player.on('exitfullscreen', () => $slide.closest('.product-gallery').find('.product-gallery__thumbnails').focus());
        }
      });
    }

    function autoplayYoutubeVideo(iframeID, $slide) {
      // compare id to player object and only play that video
      $.each(videoPlayers, (_, player) => {
        if (player.playing) {
          player.pause();
        }

        if (player.media.id === iframeID) {
          player.play();

          // On fullscreen toggle, focus back on the slide itself
          player.on('exitfullscreen', () => $slide.closest('.product-gallery').find('.product-gallery__thumbnails').focus());
        }
      });
    }

    function checkForVideos() {
      $slides.each((index, slide) => {
        // Variables
        const $slide = $(slide);
        const mediaType = $slide.data('media-type') || $slide.find('[data-media-type]').data('media-type');
        let videoID = $slide.find('video').data('plyr-video-id');
        const $iframeVideo = $slide.find('iframe');
        const iframeID = $iframeVideo.attr('id');
        if ($slide.hasClass('is-selected')) {
          if (mediaType === 'video') {
            videoID = $slide.find('video').data('plyr-video-id');
            if (videoID) {
              autoplayVideo(videoID, $slide);
            }
          } else if (mediaType === 'external_video' && iframeID) {
            autoplayYoutubeVideo(iframeID, $slide);
          }
        }
      });
    }

    // Adds 'product-gallery__image' class if not present
    $productGallery.find('.gallery-cell:not(.product-gallery__image)').addClass('product-gallery__image');

    // Adds 'product-gallery__thumbnail' class if not present
    $thumbnailProductGallery.find('.gallery-cell:not(.product-gallery__thumbnail)').addClass('product-gallery__thumbnail');

    // If custom settings available, use them otherwise take settings from product templates
    const {
      thumbnails_enabled: thumbnailsEnabled,
      enable_thumbnail_slider: thumbnailsSliderEnabled,
      thumbnail_position: thumbnailsPosition,
      gallery_arrows: arrowsEnabled,
      slideshow_speed: slideshowSpeed,
      slideshow_transition: slideshowTransition,
    } = settings || this._data;

    $productGallery.on('ready.flickity', () => {
      $slides.each((index, slide) => {
        // Determine media type
        const mediaType = $(slide).data('media-type') || $(slide).find('[data-media-type]').data('media-type');
        let videoID;
        const videoLooping = $('[data-video-loop]').data('video-loop');
        const { videoPlayers } = window;

        switch (mediaType) {
          case 'external_video':
            videoID = $(slide).find('[data-plyr-video-id]').data('plyr-video-id');
            if (videoPlayers) {
              for (let i = 0; i < videoPlayers.length; i++) {
                if (videoPlayers[i].id === videoID || videoPlayers[i].media.id === videoID) {
                  videoPlayers[i].loop = videoLooping;

                  if (!$(slide).hasClass('is-selected')) {
                    videoPlayers[i].keyboard = {
                      focused: false,
                      global: false,
                    };
                  }
                }
              }
            }

            break;
          case 'video':
            videoID = $(slide).find('[data-plyr-video-id]').data('plyr-video-id');
            if (videoPlayers) {
              for (let i = 0; i < videoPlayers.length; i++) {
                if (videoPlayers[i].id === videoID || videoPlayers[i].media.id === videoID) {
                  videoPlayers[i].loop = videoLooping;

                  if (!$(slide).hasClass('is-selected')) {
                    videoPlayers[i].keyboard = {
                      focused: true,
                      global: false,
                    };
                  }
                }
              }
            }

            break;
          case 'model':
            if ($(slide).hasClass('is-selected')) { // When active slide
              if (mediaType === 'model' && window.isScreenSizeLarge()) {
                $(slide).on('mouseenter', () => $productGallery.flickity('unbindDrag'));
                $(slide).on('mouseleave', () => $productGallery.flickity('bindDrag'));
              }
            }
            break;
          default:
            break;
        }

        // Detect keyboard 'ENTER' key on slides
        $(slide).keypress(event => {
          if (event.which === 13) {
            // Bring focus to media inside selected slide
            $(slide).find('model-viewer, .product-gallery__link, .plyr').focus();
            // Run video autoplay logic if featured media is a video
            if (mediaType === 'video' || mediaType === 'external_video') {
              checkForVideos();
            }
            // Autoplay model if featured media is a model
            if (mediaType === 'model') {
              // If model container has class is-selected then play the model
              // autoplayModel(); This method does not exist
            }
          }
        });
      });
    });

    this.$productGallery.flickity({
      wrapAround: true,
      adaptiveHeight: true,
      dragThreshold: 10,
      imagesLoaded: true,
      pageDots: false,
      prevNextButtons: $productGallery.data('media-count') > 1 || $slides.length > 1,
      autoPlay: slideshowSpeed * 1000,
      fade: slideshowTransition === 'fade',
      watchCSS: this._data.template === 'image-scroll' && !$productGallery.hasClass('js-gallery-modal'), // Disables Flickity for main product gallery on image-scroll template
      arrowShape: window.arrowShape,
    });

    $productGallery.on('change.flickity', () => {
      $slides.each((index, slide) => {
        // Determine media type of current slide
        const mediaType = $(slide).data('media-type') || $(slide).find('[data-media-type]').data('media-type');

        if ($(slide).hasClass('is-selected')) { // When active slide
          switch (mediaType) {
            case 'model':
              /* On slide change, if active slide contains 3d model
              * If on desktop, on hover, unbind flickity, after hover bind flickity
              * On model play event, unbind flickity to ensure model can be interacted with
              * On model pause event, bind flickity so that slide can be swiped
              * Pause all model slides when hidden
              */

              if (window.isScreenSizeLarge()) {
                // On mouseenter event, unbind flickity
                $(slide).on('mouseenter', () => this.$productGallery.flickity('unbindDrag'));

                // On mouseleave event, bind flickity
                $(slide).on('mouseleave', () => this.$productGallery.flickity('bindDrag'));
              }

              // Listen for model pause/play events
              $(slide).find('model-viewer').on('shopify_model_viewer_ui_toggle_play', () => this.$productGallery.flickity('unbindDrag'));
              $(slide).find('model-viewer').on('shopify_model_viewer_ui_toggle_pause', () => this.$productGallery.flickity('bindDrag'));

              break;
            default:
              this.$productGallery.flickity('bindDrag');
          }
        } else {
          // When inactive slide
          switch (mediaType) {
            case 'external_video':
              // Youtube video pausing
              $.each(videoPlayers, (_, player) => player.pause());

              break;
            case 'video':
              // HTML5 video pausing
              $.each(videoPlayers, (_, player) => player.pause());

              break;
            case 'model':
              $.each(window.PXUTheme.productMedia.models, (_, model) => model.pause());
              break;
            default:
              break;
          }
        }
      });

      // Restore 3d model icons
      window.PXUTheme.productMedia.showModelIcon($productGallery);
    });

    // Checks for videos and plays them if they are the featured media
    // Autoplay logic only happens on desktop, autoplay set to off for mobile
    const $sliderArrows = $productGallery.find('.flickity-prev-next-button');

    if (($sliderArrows || $thumbnails) && window.isScreenSizeLarge()) {
      $sliderArrows.on('click', () => {
        $productGallery.on('settle.flickity', () => {
          // Find out media type of featured media slide
          const $selectedSlide = $productGallery.find('.product-gallery__image.is-selected');
          const mediaType = $selectedSlide.data('media-type') || $selectedSlide.find('[data-media-type]').data('media-type');
          const pId = ($productGallery).data('product-id');

          // Run video autoplay logic if featured media is a video
          if (mediaType === 'video' || mediaType === 'external_video') {
            checkForVideos();
          }

          // Autoplay model if featured media is a model
          if (mediaType === 'model') {
            // Sort models to get those in selected slide
            const sortedModels = [];

            $.each(window.PXUTheme.productMedia.models, (index, model) => {
              if ($(model.container).closest('.product-gallery__image').data('product-id') === pId) {
                sortedModels.push(model);
              }
            });

            // If model container has class is-selected then play the model
            $.each(sortedModels, (index, model) => {
              const $slide = $(model.container).parents('.product-gallery__image');
              if ($slide.hasClass('is-selected')) {
                model.play();
              }
            });
          }

          $productGallery.off('settle.flickity');
        });

        return false;
      });

      $thumbnails.on('click', event => {
        const index = $(event.currentTarget).index();
        this.$productGallery.flickity('select', index);

        $productGallery.on('settle.flickity', () => {
          // Find out media type of featured media slide
          const $selectedSlide = $productGallery.find('.product-gallery__image.is-selected');
          const mediaType = $selectedSlide.data('media-type') || $selectedSlide.find('[data-media-type]').data('media-type');
          const pId = ($productGallery).data('product-id');

          // Run video autoplay logic if featured media is a video
          if (mediaType === 'video' || mediaType === 'external_video') {
            checkForVideos();
          }

          // Autoplay model if featured media is a model
          if (mediaType === 'model') {
            // Sort models to get those in selected slide
            const sortedModels = [];
            $.each(window.PXUTheme.productMedia.models, (_, model) => {
              if ($(model.container).closest('.product-gallery__image').data('product-id') === pId) {
                sortedModels.push(model);
              }
            });

            // If model container has class is-selected then play the model
            $.each(sortedModels, (_, model) => {
              const $slide = $(model.container).parents('.product-gallery__image');
              if ($slide.hasClass('is-selected')) {
                model.play();
              }
            });
          }

          $productGallery.off('settle.flickity');
        });

        return false;
      });

      $thumbnails.keypress(event => {
        const index = $(event.currentTarget).index();
        if (event.which === 13) {
          this.$productGallery.flickity('select', index);

          const $selectedSlide = $productGallery.find('.product-gallery__image.is-selected');
          const pId = ($productGallery).data('product-id');

          $productGallery.on('settle.flickity', () => {
            $selectedSlide.find('model-viewer, .plyr, a').focus();
            $selectedSlide.find('[data-youtube-video]').attr('tabindex', '0');
            $productGallery.off('settle.flickity');
          });

          // Find out media type of featured media slide
          const mediaType = $selectedSlide.data('media-type');

          // Run video autoplay logic if featured media is a video
          if (mediaType === 'video' || mediaType === 'external_video') {
            checkForVideos();
          }

          // Autoplay model if featured media is a model
          if (mediaType === 'model') {
            // Sort models to get those in selected slide
            const sortedModels = [];
            $.each(window.PXUTheme.productMedia.models, (_, model) => {
              if ($(model.container).closest('.product-gallery__image').data('product-id') === pId) {
                sortedModels.push(model);
              }
            });

            // If model container has class is-selected then play the model
            $.each(sortedModels, (_, model) => {
              const $slide = $(model.container).parents('.product-gallery__image');
              if ($slide.hasClass('is-selected')) {
                model.play();
              }
            });
          }
        }
      });
    } else if (thumbnailsEnabled) {
      // If thumbnail slider is disabled, ensure thumbnails can still navigate product images
      $thumbnailProductGallery.find('.product-gallery__thumbnail').on('click', event => {
        const $currentTarget = $(event.currentTarget);
        const index = $currentTarget.index();
        this.$productGallery.flickity('selectCell', index);
      });
    }

    // Resize flickity when the slider is settled
    $productGallery.on('settle.flickity', () => this.$productGallery.flickity('resize'));

    $(window).on('load', () => this.$productGallery.flickity('resize'));

    let resizeTimer;

    $(window).on('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.$productGallery.flickity('resize'), 250);
    });

    if (thumbnailsEnabled === true && thumbnailsSliderEnabled === true && $slides.length > 1) {
      // If desktop determine which slider we build
      if (window.isScreenSizeLarge()) {
        if (thumbnailsPosition === 'right-thumbnails' || thumbnailsPosition === 'left-thumbnails') {
          $thumbnailProductGallery.addClass('vertical-slider-enabled');

          const navCellHeight = $thumbnails.height();
          const navHeight = $thumbnailProductGallery.height();

          // Resize thumbnail gallery

          $(window).on('load', () => {
            const $productGalleryHeight = $productGallery.height();
            $thumbnailProductGallery.css('max-height', $productGalleryHeight);
          });

          $(window).on('resize', () => {
            this.$productGallery.flickity('resize');
            const $productGalleryHeight = $productGallery.height();
            $thumbnailProductGallery.css('max-height', $productGalleryHeight);
          });

          $productGallery.on('change.flickity', () => {
            this.$productGallery.flickity('resize');
            const $productGalleryHeight = $productGallery.height();
            $thumbnailProductGallery.css('max-height', $productGalleryHeight);
          });

          $productGallery.on('select.flickity', () => {
            // set selected nav cell
            const flkty = $productGallery.data('flickity');
            if (flkty) {
              $thumbnailProductGallery.find('.is-nav-selected').removeClass('is-nav-selected');
              const $selected = $thumbnails.eq(flkty.selectedIndex).addClass('is-nav-selected');

              // scroll nav
              const scrollY = (
                $selected.position().top
                + $thumbnailProductGallery.scrollTop()
                - (navHeight + navCellHeight)
                / 2
              );
              $thumbnailProductGallery.animate({
                scrollTop: scrollY,
              });
            }
          });
        } else {
          $thumbnailProductGallery.flickity({
            cellAlign: 'center',
            contain: true,
            groupCells: '80%',
            imagesLoaded: true,
            pageDots: false,
            prevNextButtons: $thumbnails.length > 5 ? arrowsEnabled : false,
            asNavFor: this._data.template === 'image-scroll' && window.isScreenSizeLarge() ? '' : $productGallery[0],
            arrowShape: window.arrowShape,
          });

          // Resize flickity when the slider is settled
          $thumbnailProductGallery.on('settle.flickity', () => $thumbnailProductGallery.flickity('resize'));
          $(window).on('load', () => $thumbnailProductGallery.flickity('resize'));
        }
      } else {
        // Otherwise create standard thumbnail slider
        $thumbnailProductGallery.flickity({
          cellAlign: 'center',
          contain: true,
          groupCells: '80%',
          imagesLoaded: true,
          pageDots: false,
          prevNextButtons: $thumbnails.length > 5,
          asNavFor: this._data.template === 'image-scroll' && window.isScreenSizeLarge() ? '' : $productGallery[0],
          arrowShape: window.arrowShape,
        });
      }
    }
  }

  scrollSelectedImage(variant) {
    let headerHeight = 0;
    let announceHeight = 0;

    // Get header height is sticky enabled
    if (window.PXUTheme.jsHeader.enable_sticky === true && window.PXUTheme.theme_settings.header_layout !== 'vertical') {
      headerHeight = window.PXUTheme.jsHeader.getHeaderHeight();
    }

    // Get announcement height is sticky enabled
    if (
      typeof window.PXUTheme.jsAnnouncementBar !== 'undefined'
      && window.PXUTheme.jsAnnouncementBar.enable_sticky === true
      && window.PXUTheme.theme_settings.header_layout !== 'vertical'
    ) {
      announceHeight = window.PXUTheme.jsAnnouncementBar.getAnnouncementHeight();
    }

    // Add values
    const totalHeight = headerHeight + announceHeight + this.stickyOffset;

    window.PXUTheme.scrollToTop($(`[data-index="${variant}"]`), totalHeight);
  }

  unload($section) {
    $('.selector-wrapper select', $section).unwrap();
    this.disableSlideshow($section);
    $('[data-variant-selector]').off();
    document.removeEventListener('lazyloaded', this.enableZoom);

    const collapsibleRowEl = this._section.querySelector('[data-collapsible-row]');
    if (collapsibleRowEl) {
      window.PXUTheme.collapsibleRowUtil.unload();
    }
  }
  
  _switchVariant(product, variant, state) {
    window.selectCallback(
      this._section.querySelector(`.product-${product.id}`),
      product,
      variant,
      state,
    );

    if (this.priceUI) {
      const formatter = price => (
        price === 0
          ? window.PXUTheme.translation.free_price_text
          : Shopify.formatMoney(price, $('body').data('money-format'))
      );

      this.priceUI.load(
        product,
        {
          variant,
          formatter,
          handler: (priceUIFragment, p, { variant: v }) => {
            if (state === 'unavailable') {
              return document.createDocumentFragment();
            }

            if (v && v.available) {
              const shopPayInstallmentsTemplate = this._section.querySelector('[data-shop-pay-installments-template] shopify-payment-terms');
              let shopPayInstallEl = null;

              if (shopPayInstallmentsTemplate) {
                shopPayInstallEl = shopPayInstallmentsTemplate.cloneNode(true);
                shopPayInstallEl.setAttribute('variant-id', variant.id);
              }

              if (this._data.display_savings && v.compare_at_price > v.price) {
                const span = document.createElement('span');

                span.classList.add('sale', 'savings');
                span.innerHTML = `${window.PXUTheme.translation.product_savings} ${Math.round(parseFloat(((v.compare_at_price - v.price) * 100) / v.compare_at_price, 10))}% (<span class="money">${formatter(v.compare_at_price - v.price)}</span>)`;
                priceUIFragment.appendChild(span);
              }

              if (shopPayInstallEl) {
                priceUIFragment.appendChild(shopPayInstallEl);
              }
            }

            // Convert all elements if currency converter is enabled
            if (window.PXUTheme.currencyConverter) {
              const moneyEls = priceUIFragment.querySelectorAll('.money');

              for (let i = 0; i < moneyEls.length; i++) {
                window.PXUTheme.currencyConverter.update(moneyEls[i]);
              }
            }

            return priceUIFragment;
          },
        },
      );
    }

    if (this.priceUIBadge) {
      this.priceUIBadge.load(
        product,
        {
          variant,
          formatter: price => price,
          style: '',
          handler: () => {
            const fragment = document.createDocumentFragment();
            const sticker = this.priceUIBadge._el.parentNode;
            const stickerText = document.createElement('span');

            stickerText.classList.add('thumbnail-sticker__text');

            let text;

            if (variant && variant.available) {
              if (variant.compare_at_price > variant.price) {
                sticker.classList.remove('thumbnail-sticker--hidden');
                if (sticker.classList.contains('thumbnail-sticker--sold-out')) {
                  sticker.classList.replace('thumbnail-sticker--sold-out', 'thumbnail-sticker--sale');
                } else {
                  sticker.classList.add('thumbnail-sticker--sale');
                }
                text = window.PXUTheme.translation.sale;
              } else {
                sticker.classList.add('thumbnail-sticker--hidden');
                text = '';
              }
            } else if (variant && !variant.available) {
              sticker.classList.remove('thumbnail-sticker--hidden');
              if (sticker.classList.contains('thumbnail-sticker--sale')) {
                sticker.classList.replace('thumbnail-sticker--sale', 'thumbnail-sticker--sold-out');
              } else {
                sticker.classList.add('thumbnail-sticker--sold-out');
              }
              text = window.PXUTheme.translation.sold_out;
            }

            stickerText.innerHTML = text;
            fragment.appendChild(stickerText);
            return fragment;
          },
        },
      );
    }

    if (this.surfacePickUp) {
      this.surfacePickUp.load(variant ? variant.id : null);
    }

    if (this._section.classList.contains('product-template') && product.variants.length > 1 && !window.Shopify.designMode) {
      this._updateHistory(variant);
    }

    // Using variant.featured_media and not variant.featured_image to account for positions of
    // non-image media such as videos too.
    if (this._data.template === 'image-scroll' && variant.featured_media) {
      const imagePosition = variant.featured_media.position - 1;
      this.scrollSelectedImage(imagePosition);
    }
  }

  _updateHistory(variant) {
    const url = new URL(window.location);
    if (variant.id) url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url);
  }
}

window.PXUTheme.jsProductClass = Product;
window.PXUTheme.jsProduct = {
  init($section) {
    this.product = new Product($section);
    return this.product;
  },
  unload($section) {
    if (this.product) {
      this.product.unload($section);
      this.product = null;
    }
  },
  relatedProducts() {
    $('.js-related-products-slider .products-slider').each((_, slider) => {
      const $relatedSlider = $(slider);

      const slideData = {
        products_per_slide: $relatedSlider.data('products-per-slide'),
        products_available: $relatedSlider.data('products-available'),
        products_limit: $relatedSlider.data('products-limit'),
        initialIndex: 0,
        cellAlign: 'left',
        wrapAround: true,
      };

      if (
        slideData.products_available > slideData.products_per_slide
        && slideData.products_limit > slideData.products_per_slide
      ) {
        slideData.wrapAround = true;
      } else {
        slideData.wrapAround = false;
      }

      if (
        slideData.products_available < slideData.products_per_slide
        || slideData.products_limit < slideData.products_per_slide
      ) {
        $relatedSlider.addClass('container is-justify-center');
        $relatedSlider.find('.gallery-cell').addClass('column');
      } else {
        $relatedSlider.flickity({
          lazyLoad: 2,
          freeScroll: true,
          imagesLoaded: true,
          draggable: true,
          cellAlign: 'center',
          wrapAround: slideData.wrapAround,
          pageDots: false,
          contain: true,
          prevNextButtons: slideData.products_limit > slideData.products_per_slide,
          initialIndex: slideData.initialIndex,
          arrowShape: window.arrowShape,
        });

        // Resize flickity when the slider is settled
        $relatedSlider.on('settle.flickity', () => $relatedSlider.flickity('resize'));

        $(window).on('load', () => $relatedSlider.flickity('resize'));
      }
    });
  },
};
