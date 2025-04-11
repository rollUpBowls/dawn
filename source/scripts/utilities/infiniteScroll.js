window.PXUTheme.infiniteScroll = {
  init() {
    this.defaults = {
      grid: '[data-load-more--grid]',
      gridItems: '[data-load-more--grid-item]',
    };

    $('body').off('click', '[data-load-more]');
    $('body').on('click', '[data-load-more]', function (e) {
      e.preventDefault();

      const $button = $(this);
      const url = $button.attr('href');

      window.PXUTheme.infiniteScroll.loadNextPage(url, $button);
    });

    $('body').off('click', '[data-load-more-infinite]');
    $('body').on('click', '[data-load-more-infinite]', function (e) {
      window.PXUTheme.infiniteScroll.enableInfinite();

      $(this).remove();

      // Prevent link from going to next page
      e.stopPropagation();
      return false;
    });

    if ($('[data-load-infinite-scroll]').length) {
      window.PXUTheme.infiniteScroll.enableInfinite();
    }
  },
  loadNextPage(url, $button) {
    $.ajax({
      type: 'GET',
      dataType: 'html',
      url,
      beforeSend() {
        $button.addClass('is-loading');
      },
      success: data => {
        $button.removeClass('is-loading');

        const thumbnails = $(data).find(this.defaults.gridItems);
        const loadMoreButtonUrl = $(data).find('[data-load-more]').attr('href');

        $('[data-load-more]').attr('href', loadMoreButtonUrl);
        $(this.defaults.grid).first().append(thumbnails);

        // Initialize product reviews
        window.PXUTheme.productReviews.init();

        // When there are no additional pages, hide load more button
        if (typeof loadMoreButtonUrl === 'undefined') {
          $('[data-load-more]').addClass('is-hidden');
        }
      },
      error(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
        location.replace(`${location.protocol}//${location.host}`);
      },
    });
  },
  enableInfinite() {
    var infiniteScroll = new Waypoint.Infinite({
      element: $(this.defaults.grid)[0],
      items: '[data-load-more--grid-item]',
      more: '[data-load-infinite]',
      loadingClass: 'loading-in-progress',
      onBeforePageLoad() {
        $('[data-load-infinite]').removeClass('is-hidden');
      },
      onAfterPageLoad() {
        // Initialize product reviews
        window.PXUTheme.productReviews.init();
      },
    });
  },
  unload() {
    $('[data-load-more]').off();
    $('[data-load-infinite]').off();
    $('[data-load-more-infinite]').off();
  },
};
