(() => {
  const STYLE_ID = 'mx-featured-badge-position';

  function cleanup() {
    document.getElementById(STYLE_ID)?.remove();
    document.querySelectorAll('.mxCardInfo.mxHasFeaturedBadge').forEach((cardInfo) => {
      cardInfo.classList.remove('mxHasFeaturedBadge');
    });
    document.querySelectorAll('.mxRibbon.mxFeaturedBadge').forEach((badge) => {
      badge.classList.remove('mxFeaturedBadge');
    });
  }

  function start() {
    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(cleanup);
    observer.observe(root, { childList: true, subtree: true });
    cleanup();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
