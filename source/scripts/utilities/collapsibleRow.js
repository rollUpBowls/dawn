window.PXUTheme.collapsibleRowUtil = {
  init: selector => {
    const headingSelector = selector || '.faq-accordion';
    const $faqHeading = $(`${headingSelector} > dt > button`);

    $(`${headingSelector} > dd`).attr('aria-hidden', true);

    $faqHeading.attr('aria-expanded', false);

    $faqHeading.off('click activate').on('click activate', e => {
      const $target = $(e.currentTarget);
      const $faqIcons = $target.find('.icon');
      const $plus = $target.find('.plus');
      const $state = $target.attr('aria-expanded') === 'false';
      $plus.toggleClass('collapsed');
      $target.attr('aria-expanded', $state);
      $target.parent().next().slideToggle(() => {
        $faqIcons.toggleClass('icon--active');
      });
      $target.parent().next().attr('aria-hidden', !$state);
      return false;
    });
  },
  unload: selector => {
    const headingSelector = selector || '.faq-accordion';
    $(`${headingSelector} > dt > button`).off('click activate');
    $(`${headingSelector} > dt > button`).off('keydown');
  },
}
