/* eslint-disable */
window.PXUTheme.predictiveSearch = {
  vars: {
    term: '',
    searchResourceType: null,
  },
  init: function() {

    this.unload();

    $('[data-show-search-trigger], [data-autocomplete-true] input').on('click touchstart', function(e) {
      if(!isScreenSizeLarge()) {
        e.stopPropagation();
        const formType = $(this).closest('form').find('[name="type"]').val();
        window.PXUTheme.predictiveSearch.showMobileSearch(formType);
      }
    });

    $('.search-form .search__fields input[type="text"], .search-form .field input[type="text"]').on('focus', e => {
      const dataSearchResourceType = e.target.closest('[data-search-resource-type]');
      if (dataSearchResourceType) {
        window.PXUTheme.predictiveSearch.vars.searchResourceType = dataSearchResourceType.getAttribute('data-search-resource-type');
      }

      // Set the cursor at the end of the input field for better UX,
      // otherwise it may be at the beginning of the input field when the input gets focus.
      const searchInputEl = e.target;
      const searchInputVal = searchInputEl.value.trim();
      searchInputEl.setSelectionRange(searchInputVal.length, searchInputVal.length);
      window.PXUTheme.predictiveSearch.getResults(searchInputVal, $(e.target.closest('.search-form')));
    });

    // Clicking outside makes the results disappear.
    $(document).on('click focusout', function(e) {
      if (window.PXUTheme.media_queries.large.matches) {
        const searchForm = $(e.target).parents('.search-form');

        if(searchForm.length === 0) {
          $('[data-autocomplete-true] .search__results-wrapper').hide();

          // This is for when the 'Vertical' header layout or the 'Search focus' header layout is in use,
          // since unlockBodyScroll won't get called in jsHeader.
          if (
            (window.PXUTheme.theme_settings.header_layout === 'vertical'
            || window.PXUTheme.theme_settings.header_layout === 'search_focus')
            && document.documentElement.classList.contains('scroll-locked')
          ) {
            window.PXUTheme.predictiveSearch.unlockBodyScroll();
          }
        }
      }
    });

    $("[data-autocomplete-true] form").on("submit", function(e) {
      const query = $(this).find('input[name="q"]').val().trim();
      if (!query) e.preventDefault();
    });

    $('[data-autocomplete-true] form').each(function() {
      const $this = $(this);
      const input = $this.find('input[name="q"]');

      const resultWrapper = `<div class="search__results-wrapper"></div>`;

      $(resultWrapper).appendTo($this);

      input.attr('autocomplete', 'off').on('input', window.PXUTheme.debounce(() => {
        window.PXUTheme.predictiveSearch.vars.term = this.querySelector('[data-q]').value.trim();
        window.PXUTheme.predictiveSearch.getResults(window.PXUTheme.predictiveSearch.vars.term, $this);
      }, 200));
    });

    window.addEventListener('resize', window.PXUTheme.debounce(() => {
      if (window.PXUTheme.theme_settings.header_layout === 'vertical') {
        window.PXUTheme.predictiveSearch.alignVerticalSearch();
      }
      this.resizeSearchResults();
    }, 150));

    document.body.addEventListener('keyup', e => this.onKeyUp(e));
  },
  onKeyUp: function(e) {
    if (e.code === 'Escape') {
      $('[data-q]').val('');
      window.PXUTheme.predictiveSearch.vars.term = '';
      window.PXUTheme.jsHeader.hideSearch();
    }
  },
  resizeSearchResults: function(inputFieldEl = document.querySelector('[data-autocomplete-true]')) {
    const innerHeight = window.innerHeight;
    const inputFieldElBottom = inputFieldEl.getBoundingClientRect().bottom;
    const offset = isScreenSizeLarge() ? 30 : 10;
    const resultsMaxHeight = `${innerHeight - inputFieldElBottom - offset}px`;
    const resultsContainerEl = inputFieldEl
      .closest('[data-autocomplete-true]')
      .querySelector('.search__results-wrapper');
    resultsContainerEl.style.setProperty('--results-max-height', resultsMaxHeight);
  },
  getResults: function(term, $this) {
    const { header_layout } = window.PXUTheme.theme_settings;

    if (term.length === 0) {
      if (header_layout === 'vertical' || header_layout === 'search_focus') {
        window.PXUTheme.predictiveSearch.unlockBodyScroll();
      }

      window.PXUTheme.predictiveSearch.clearResults();
      return;
    }

    const { searchResourceType } = window.PXUTheme.predictiveSearch.vars;
    const restrictResourceCondition = searchResourceType && ('searchResourceType' in $this[0].dataset);

    fetch(`${window.PXUTheme.routes.predictive_search_url}?q=${encodeURIComponent(term)}&section_id=predictive-search${restrictResourceCondition ? `&resources[type]=${searchResourceType}` : ''}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.status);
        }
        return response.text();
      })
      .then(text => {
        window.PXUTheme.predictiveSearch.displayResults(text, $this);

        // This is for when the 'Vertical' header layout or the 'Search focus' header layout is in use,
        // since lockBodyScroll won't get called in jsHeader (due to the search icon trigger not being present).
        // lockBodyScroll has to be called here so the overlay appears at about the same time as the results.
        if (
          (header_layout === 'vertical' || header_layout === 'search_focus')
          && $this.closest('.jsHeader').length > 0
        ) {
          window.PXUTheme.predictiveSearch.lockBodyScroll();
        }
      })
      .catch(error => {
        throw error;
      });
  },
  displayResults: function(results, $this) {
    const $fields = $this.find('.search__fields');
    const $resultsWrapper = $this.find('.search__results-wrapper');
    $resultsWrapper.show();
    $resultsWrapper.empty();
    $resultsWrapper.append(results);

    const inputFieldEls = $fields.length > 0
      ? Array.from($fields)
      : document.querySelectorAll('[data-autocomplete-true]');

    // Calculate resultsWrapper max height for header search (exclude blog sidebar)
    inputFieldEls.forEach(el => {
      if (el.closest('.search-popup__form') || el.closest('.mobile-search')) {
        this.resizeSearchResults(el);
      }
    });

    if ($this.parents('.vertical-header__content').length && window.PXUTheme.jsHeader.header_layout === 'vertical') {
      window.PXUTheme.predictiveSearch.alignVerticalSearch();
    }
  },
  clearResults: function() {
    const wrapperEls = document.querySelectorAll('.search-form .search__results-wrapper');

    wrapperEls.forEach(el => {
      // This should be more performant than `innerHTMl = ""`
      while (el.firstChild) el.removeChild(el.firstChild);
    });
  },
  showMobileSearch: function(formType, position = 0) {
    $('body').css('max-height', window.innerHeight);
    $('.mobile-search').fadeIn(200, function () {
      $(this).addClass('mobile-search--visible');
    });

    if(/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      $('.mobile-search input[data-q]').focus();
    } else {
      //Set delay to ensure focus triggers on android
      setTimeout(function() {
        $('.mobile-search input[data-q]').focus();
      }, 205);
    }

    document.body.style.position = 'fixed';
    document.body.style.top = '-' + position + 'px';
    $('.mobile-search').css('top', position)

    if (formType) {
      $('.mobile-search [name="type"]').val(formType);
    }

    $('.search-form .close-search').on('click touchstart', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.PXUTheme.predictiveSearch.hideMobileSearch(position);
      $('[data-autocomplete-true] .search__results-wrapper').hide();
    });

    $('.search-form .submit-search').on('click touchstart', function(e) {
      $(this).parents('form').submit();
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.search-form') && $('.mobile-search').is('.mobile-search--visible')) {
        window.PXUTheme.predictiveSearch.hideMobileSearch();
      }
    });
  },
  hideMobileSearch: function(position = 0) {
    $('body').css('max-height', 'none');

    document.body.style.position = '';
    document.body.style.top = '';
    window.scrollTo(0, position);

    $('.mobile-search').fadeOut(200).removeClass('mobile-search--visible');

    $('body').off('focus', '.search-form .close-search');
    $('body').off('focus', '.search-form .submit-search');

    window.PXUTheme.predictiveSearch.unlockBodyScroll();
  },
  lockBodyScroll: function() {
    document.documentElement.classList.add('scroll-locked');
    document.querySelector('[data-site-overlay]').classList.remove('site-overlay--hidden');
  },
  unlockBodyScroll: function() {
    document.documentElement.classList.remove('scroll-locked');
    document.querySelector('[data-site-overlay]').classList.add('site-overlay--hidden');
  },
  alignVerticalSearch: function() {
    const $resultsList = $('.header--vertical .search__results');
    const headerWidth = $('.header--vertical').innerWidth();
    $resultsList.parents('.search__results-wrapper').css({
      'position': 'fixed',
      'left': headerWidth,
      'top': '0'
    });
  },
  unload: function() {
    $('body').off('focus', '[data-autocomplete-true] input');
    $('input[name="q"]').off();
    $('[data-dropdown-rel="search"], [data-autocomplete-true] input').off();
    $('.search__results-wrapper').remove();
  }
}
