/*============================================================================
Product media controls
==============================================================================*/

window.PXUTheme.productMedia = {
  models: [],
  setupMedia: function() {

    const config = {
      // Default control list
      controls: [
        'zoom-in',
        'zoom-out',
        'fullscreen'
      ],
      focusOnPlay: false
    }

    $('model-viewer').each(function(index, model) {
      model = new Shopify.ModelViewerUI(model, config);
      window.PXUTheme.productMedia.models.push(model);
    })

    $('.product-gallery__model model-viewer').on('mousedown',function(){
      window.PXUTheme.productMedia.hideModelIcon(this);
    })
  },
  showModelIcon: function(slide) {
    $(slide).find('.button--poster, .model-icon-button-control').show();
  },
  hideModelIcon: function(slide) {
    $(slide).find('.button--poster, .model-icon-button-control').hide();
  }
}


