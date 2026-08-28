(() => {
  const STYLE_ID = 'mx-featured-badge-position';

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
      .mxRibbon.mxFeaturedBadge {
        position: static !important;
        top: auto !important;
        right: auto !important;
        left: auto !important;
        width: 54px !important;
        min-width: 54px !important;
        height: 24px !important;
        padding: 0 8px !important;
        margin: -9px 0 10px 0 !important;
        align-self: flex-end !important;
        transform: none !important;
        transform-origin: initial !important;
        border-radius: 8px !important;
        clip-path: none !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 10px !important;
        line-height: 1 !important;
        font-weight: 800 !important;
        white-space: nowrap !important;
        z-index: 4 !important;
      }
    `;
  }

  function apply() {
    ensureStyle();

    document.querySelectorAll('.mxRibbon').forEach((badge) => {
      const featured = badge.textContent.trim() === 'مميز';
      badge.classList.toggle('mxFeaturedBadge', featured);
      if (!featured) return;

      const cardInfo = badge.closest('.mxCardInfo');
      const price = cardInfo?.querySelector('.mxPrice');
      if (price && price.nextElementSibling !== badge) {
        price.insertAdjacentElement('afterend', badge);
      }
    });
  }

  function start() {
    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
