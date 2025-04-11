/**
 * Returns true if the element is within the viewport.
 * @param {HTMLElement} el
 * @returns {Boolean}
 */
export default function inViewport(el) {
  if (!el.offsetWidth || !el.offsetHeight || !el.getClientRects().length) {
    return false;
  }

  const root = document.documentElement;
  const width = Math.min(root.clientWidth, window.innerWidth);
  const height = Math.min(root.clientHeight, window.innerHeight);
  const rect = el.getBoundingClientRect();

  return (
    rect.bottom >= 0 &&
    rect.right >= 0 &&
    rect.top <= height &&
    rect.left <= width
  );
}
