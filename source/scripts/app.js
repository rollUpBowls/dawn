import './../../build_tools/ejected_modules/@pixelunion/shopify-variants-ui';
import rimg from './../../build_tools/ejected_modules/@pixelunion/rimg-shopify';
import ShopifySectionsManager from './../../build_tools/ejected_modules/@pixelunion/shopify-sections-manager';
import { SiteAgeGate, PageAgeGate } from './../../build_tools/ejected_modules/@pixelunion/age-gate';
import ShippingCalculator from './utilities/ShippingCalculator';

rimg.init('[data-rimg="lazy"]', { round: 1 });

const sections = new ShopifySectionsManager();

sections.register('age-gate', section => new PageAgeGate(section));

const ageGatePage = document.getElementById('age-gate-page');

if (ageGatePage) {
  new SiteAgeGate(ageGatePage);
}

// Section Shopify window.PXUTheme.theme editor events

$(document)
.on('shopify:section:reorder', function(e){

  var $target = $(e.target);
  var $parentSection = $('#shopify-section-' + e.detail.sectionId);

  if (window.PXUTheme.jsHeader.enable_overlay == true) {
    window.PXUTheme.jsHeader.unload();
    window.PXUTheme.jsHeader.updateOverlayStyle(window.PXUTheme.jsHeader.sectionUnderlayIsImage());
  }

});

$(document)
.on('shopify:section:load', function(e){
  // Shopify section as jQuery object
  var $section = $(e.target);

  // Vanilla js selection of Shopify section
  var section = document.getElementById('shopify-section-' + e.detail.sectionId);

  // Blocks within section
  var $jsSectionBlocks = $section.find('.shopify-section[class*=js]');

  var sectionObjectUrl = $section.find('[data-theme-editor-load-script]').attr('src');

  // Check classes on schema and look for js (eg. jsMap)
  for (var i = 0; i < section.classList.length; i++) {
    if (section.classList[i].substring(0, 2) === "js"){
      var triggerClass = section.classList[i];

      // Check to see if section script exists
      if (typeof window.PXUTheme[triggerClass] == 'undefined') {
        // make AJAX call to load script
        window.PXUTheme.loadScript(triggerClass, sectionObjectUrl, function () {
          window.PXUTheme[triggerClass].init($(section));
        });
      } else {
        if (window.PXUTheme[triggerClass]) {
          // console.log('Section: ' + triggerClass + ' has been loaded.')
          window.PXUTheme[triggerClass].init($(section));
        } else {
          // console.warn('Uh oh, ' + triggerClass + ' is referenced in section schema class, but can not be found. Make sure "z__' + triggerClass + '.js" and window.PXUTheme.' + triggerClass + '.init() function exists.');
        }
      }
    }
  }

  // Check classes on block element and look for js (eg. jsMap)
  if ($jsSectionBlocks.length > 0) {
    var $jsSectionBlockNames = $jsSectionBlocks.each(function () {
      for (var i = 0; i < this.classList.length; i++) {
        if (this.classList[i].substring(0, 2) === "js") {
          var triggerClass = this.classList[i];
          var $block = $('.'+ triggerClass)
          var blockUrl = $block.find('[data-theme-editor-load-script]').attr('src');

          // Check to see if section script exists
          if (typeof window.PXUTheme[triggerClass] == 'undefined') {
            // make AJAX call to load script
            window.PXUTheme.loadScript(triggerClass, blockUrl, function () {
              window.PXUTheme[triggerClass].init($block);
            });
          } else {
            if (window.PXUTheme[triggerClass]) {
              // console.log('Block: ' + triggerClass + ' has been loaded.')
              window.PXUTheme[triggerClass].init($(this));
            } else {
              // console.warn('Uh oh, ' + triggerClass + ' is referenced in block class, but can not be found. Make sure "z__' + triggerClass + '.js" and window.PXUTheme.' + triggerClass + '.init() function exists.');
            }
          }

        }
      }
    });
  }

  // Load video feature
  window.PXUTheme.video.init();

  // Scrolling animations
  window.PXUTheme.animation.init();

  // Initialize reviews
  window.PXUTheme.productReviews.init();

  // Infinite scrolling
  window.PXUTheme.infiniteScroll.init();

  // Disclosure menus
  window.PXUTheme.disclosure.enable();

  // Search
  if (window.PXUTheme.theme_settings.enable_autocomplete == true) {
    window.PXUTheme.predictiveSearch.init();
  }
  // Product review scroll
  window.PXUTheme.productReviews.productReviewScroll();

});


$(document)
.on('shopify:section:unload', function(e){

  // Shopify section as jQuery object
  var $section = $(e.target);

  // Vanilla js selection of Shopify section
  var section = document.getElementById('shopify-section-' + e.detail.sectionId);

  // Blocks within section
  var $jsSectionBlocks = $section.find('.shopify-section[class*=js]');

  // Check classes on schema and look for js (eg. jsMap)
  for (var i = 0; i < section.classList.length; i++) {
    if (section.classList[i].substring(0, 2) === "js"){
      var triggerClass = section.classList[i];
      if (window.PXUTheme[triggerClass]) {
        // console.log('Section: ' + triggerClass + ' is unloaded.')
        window.PXUTheme[triggerClass].unload($(section));
      } else {
        // console.warn('Uh oh, ' + triggerClass + ' is referenced in section schema class, but can not be found. Make sure "z__' + triggerClass + '.js" and window.PXUTheme.' + triggerClass + '.unload() function exists.');
      }
    }
  }

  // Check classes on block element and look for js (eg. jsMap)
  if ($jsSectionBlocks.length > 0) {
    var $jsSectionBlockNames = $jsSectionBlocks.each(function () {
      for (var i = 0; i < this.classList.length; i++) {
        if (this.classList[i].substring(0, 2) === "js") {
          var triggerClass = this.classList[i];
          if (window.PXUTheme[triggerClass]) {
            // console.log('Block: ' + triggerClass + ' is unloaded.')
            window.PXUTheme[triggerClass].unload($(this));
          } else {
            // console.warn('Uh oh, ' + triggerClass + ' is referenced in block class, but can not be found. Make sure "z__' + triggerClass + '.js" and window.PXUTheme.' + triggerClass + '.unload() function exists.');
          }

        }
      }
    });
  }

  // Scrolling animations
  window.PXUTheme.animation.unload($section);

  // QuantityBox
  window.PXUTheme.quantityBox.unload($section);

  // Infinite scrolling
  window.PXUTheme.infiniteScroll.unload($section);

  // Disclosure menus
  window.PXUTheme.disclosure.enable();

});

$(document)
.on('shopify:section:select', function(e){

  // Shopify section as jQuery object
  var $section = $(e.target);

  // Vanilla js selection of Shopify section
  var section = document.getElementById('shopify-section-' + e.detail.sectionId);

  // Force show state when section is selected in theme editor
  for (var i = 0; i < section.classList.length; i++) {
    if (section.classList[i].substring(0, 2) === "js") {
      var triggerClass = section.classList[i];
      if (window.PXUTheme[triggerClass].showThemeEditorState) {
        window.PXUTheme[triggerClass].showThemeEditorState(e.detail.sectionId, $section);
      }
    }
  }

  // Predictive search
  if (window.PXUTheme.theme_settings.enable_autocomplete == true) {
    window.PXUTheme.predictiveSearch.init();
  }

  if($('.tabs').length > 0) {
    window.PXUTheme.tabs.enableTabs();
  }

  if(isScreenSizeLarge() && window.PXUTheme.jsHeader.enable_overlay === true) {
    window.PXUTheme.jsHeader.updateOverlayStyle(window.PXUTheme.jsHeader.sectionUnderlayIsImage());
  }

  if ($('.block__recommended-products').length > 0) {
    var $productPage = $('.block__recommended-products').parents('.product-page');
    window.PXUTheme.jsRecommendedProducts.init($productPage);
  }

});

$(document)
.on('shopify:section:deselect', function(e){

  // Shopify section as jQuery object
  var $section = $(e.target);

  // Vanilla js selection of Shopify section
  var section = document.getElementById('shopify-section-' + e.detail.sectionId);

  // Force hide state when section is selected in theme editor
  for (var i = 0; i < section.classList.length; i++) {
    if (section.classList[i].substring(0, 2) === "js") {
      var triggerClass = section.classList[i];
      if (window.PXUTheme[triggerClass].showThemeEditorState) {
        window.PXUTheme[triggerClass].hideThemeEditorState(e.detail.sectionId, $(section));
      }
    }
  }

});

// Block Shopify window.PXUTheme.theme editor events

$(document)
.on('shopify:block:select', function(e){

  var blockId = e.detail.blockId;
  var $parentSection = $('#shopify-section-' + e.detail.sectionId);
  var $block = $('#shopify-section-' + blockId);

  if($('.jsFeaturedPromos').length > 0) {
    window.PXUTheme.jsFeaturedPromos.blockSelect($parentSection, blockId);
  }

  if($('.jsSlideshowWithText').length > 0) {
    window.PXUTheme.jsSlideshowWithText.blockSelect($parentSection, blockId);
  }

  if ($('.jsSlideshowClassic').length > 0) {
    window.PXUTheme.jsSlideshowClassic.blockSelect($parentSection, blockId);
  }

  if($('.jsTestimonials').length > 0) {
    window.PXUTheme.jsTestimonials.blockSelect($parentSection, blockId);
  }

  if ($('.jsGrid').length > 0) {
    window.PXUTheme.jsGrid.blockSelect($parentSection, blockId);
  }

  // Sidebar collection multi-tag filter
  if ($block.hasClass('sidebar__block')) {
    var $toggleBtn = $block.find('[data-sidebar-block__toggle="closed"]');
    if ($toggleBtn) {
      window.PXUTheme.jsSidebar.openSidebarBlock($toggleBtn);
    }
  }

  // Predictive search
  if (window.PXUTheme.theme_settings.enable_autocomplete == true) {
    window.PXUTheme.predictiveSearch.init();
  }

  // Scrolling animations
  window.PXUTheme.animation.init();
});

$(document)
.on('shopify:block:deselect', function(e){

  var $block = $('#shopify-section-' + e.detail.blockId);

  if ($block.hasClass('sidebar__block')) {
    var $toggleBtn = $block.find('[data-sidebar-block__toggle="open"]');
    if ($toggleBtn) {
      window.PXUTheme.jsSidebar.closeSidebarBlock($toggleBtn);
    }
  }

});

$(document)
.on('shopify:block:load', function(e){



});

// Window ready
$(window).on('load', function() {
  var $jsSections = $('.shopify-section[class*=js]');

  // Loop through sections with js classes and load them in
  var $jsSectionNames = $jsSections.each(function () {
    for (var i = 0; i < this.classList.length; i++) {
      if (this.classList[i].substring(0, 2) === "js"){
        var triggerClass = this.classList[i];
        if (window.PXUTheme[triggerClass]) {
          // console.log('Section: ' + triggerClass + ' has been loaded.')
          window.PXUTheme[triggerClass].init($(this));
        } else {
          // console.warn('Uh oh, ' + triggerClass + ' is referenced in section schema class, but can not be found. Make sure "z__' + triggerClass + '.js" and window.PXUTheme.' + triggerClass + '.init() function exists.');
        }

      }
    }
  });

  var resizeTimer;

  // Store window width in variable
  var width = $(window).width(), height = $(window).height();

  $(window).on('resize', function(e) {

    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {

      if (!isScreenSizeLarge()){
        // When 798 or less
        window.PXUTheme.mobileMenu.init();
      } else {
        // When larger than 798
        window.PXUTheme.mobileMenu.unload();
      }

    }, 250);

  });

  //Enable plyr
  window.PXUTheme.video.init();

  // Predictive search
  if (window.PXUTheme.theme_settings.enable_autocomplete == true) {
    window.PXUTheme.predictiveSearch.init();
  }

  window.PXUTheme.dropdownMenu();

  window.PXUTheme.disclosure.enable();

  // Scrolling animations
  window.PXUTheme.animation.init();

  // QuantityBox
  window.PXUTheme.quantityBox.init();

  /* Show associated variant image on hover */
  if (window.PXUTheme.theme_settings.show_collection_swatches == true) {
    window.PXUTheme.thumbnail.enableSwatches();
  }

  /* Show secondary image on hover */
  if (window.PXUTheme.theme_settings.show_secondary_image == true) {
    window.PXUTheme.thumbnail.showVariantImage();
  }

  // Quick shop
  if (window.PXUTheme.theme_settings.enable_quickshop) {
    window.PXUTheme.thumbnail.showQuickShop();
  }

  // Currency converter
  if (window.PXUTheme.currencyConverter) {
    window.PXUTheme.currencyConverter.init();
  }

  //Infinite scrolling
  if ($('[data-custom-pagination]').length) {
    window.PXUTheme.infiniteScroll.init();
  }

  //Select event for native multi currency checkout
  $('.shopify-currency-form select').on('change', function () {
    $(this)
      .parents('form')
      .submit();
  });

  // Tabs
  if($('.tabs').length > 0) {
    window.PXUTheme.tabs.enableTabs();
  }

  // Additional checkout buttons
  if (!isScreenSizeLarge()) {
    $('.additional-checkout-buttons').addClass('additional-checkout-buttons--vertical');
  }

  // Accordion
  if($('.accordion, [data-cc-accordion]').length > 0) {
    window.PXUTheme.contentCreator.accordion.init();
  }

  // Backwards compatiblity for Flexslider
  if($('.slider, .flexslider').length > 0) {
    window.PXUTheme.contentCreator.slideshow.init();
  }

  // Responsive Video
  window.PXUTheme.responsiveVideo.init();

  // Flickity IOS Fix
  window.PXUTheme.flickityIosFix();

  // Product review scroll
  window.PXUTheme.productReviews.productReviewScroll();

  if (window.PXUTheme.theme_settings.shipping_calculator_enabled && document.querySelector('[data-shipping-calculator]')) {
    const shippingCalculator = new ShippingCalculator({ el: document.querySelector('[data-shipping-calculator]') });
  }

  // Scroll after CAPTCHA challenge for newsletter/customer form submission.
  // When not having to do the CAPTCHA challenge, the page scrolls to the form that was initially used
  // for submitting without requiring any JS. The checks below are so that that behaviour gets preserved.
  const contactFormHashes = ['#footer_contact_form', '#section_contact_form', '#password_contact_form', '#sidebar_contact_form'];
  const searchParams = new URLSearchParams(window.location.search);
  const customerPosted = searchParams.get('customer_posted');
  const hasHash = contactFormHashes.includes(window.location.hash);

  if (customerPosted === 'true' && !hasHash) {
    const el = document.querySelector('.newsletter-section') || document.querySelector('.block__newsletter');
    if (el) el.scrollIntoView();
  }
});

/*============================================================================
Slideshow arrows
==============================================================================*/

if (window.PXUTheme.theme_settings.icon_style == 'icon_solid') {
  window.arrowShape = 'M95.04 46 21.68 46 48.18 22.8 42.91 16.78 4.96 50 42.91 83.22 48.18 77.2 21.68 54 95.04 54 95.04 46z';
} else {
  window.arrowShape = 'M95,48H9.83L41,16.86A2,2,0,0,0,38.14,14L3.59,48.58a1.79,1.79,0,0,0-.25.31,1.19,1.19,0,0,0-.09.15l-.1.2-.06.2a.84.84,0,0,0,0,.17,2,2,0,0,0,0,.78.84.84,0,0,0,0,.17l.06.2.1.2a1.19,1.19,0,0,0,.09.15,1.79,1.79,0,0,0,.25.31L38.14,86A2,2,0,0,0,41,86a2,2,0,0,0,0-2.83L9.83,52H95a2,2,0,0,0,0-4Z';
}
