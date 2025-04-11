window.PXUTheme.applyMasonry = function (selector, gutterSize) {
  let $galleryWrapper = $('.gallery__wrapper--vertical-masonry');

  if ($galleryWrapper.length > 0) {
    $galleryWrapper.imagesLoaded().progress(function() {
      $galleryWrapper.isotope({
        layoutMode: 'masonry',
        itemSelector: selector,
        percentPosition: true,
        masonry: {
          columnWidth: selector,
          gutter: gutterSize
        }
      });
    });
  }
}

window.PXUTheme.applyHorizontalMasonry = function () {
  let $galleryWrapper = $('.gallery__wrapper--horizontal-masonry');

  $galleryWrapper.find('.gallery__item').each(function(e){
    var wrapper = $(this);
    var imgWidth,
        imgHeight;

      setTimeout(function(){
        imgWidth = wrapper.find('img').width();
        imgHeight = wrapper.find('img').height();

        wrapper.css("flex-basis", imgWidth * 200 / imgHeight);
        wrapper.css("flex-grow", imgWidth * 200 / imgHeight);
        wrapper.find("i").css("padding-bottom", imgHeight / imgWidth * 100 + '%');
      }, 100)

  });
}
