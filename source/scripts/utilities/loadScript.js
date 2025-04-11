window.PXUTheme.loadScript = function (name, url, callback) {
  if (window.PXUTheme[name]) {
    callback;
  } else {
    $.ajax({
      url,
      dataType: 'script',
      success: callback,
      async: false,
    });
  }
}
