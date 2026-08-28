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
        top: 0 !important;
        right: 0 !important;
        width: 76px !important;
        height: 28px !important;
        padding: 2px 8px 0 15px !important;
        transform: none !important;
        transform-origin: initial !important;
        border-radius: 0 22px 0 13px !important;
        clip-path: polygon(24% 0, 100% 0, 100% 100%, 0 100%) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 11.5px !important;
        line-height: 1 !important;
        font-weight: 800 !important;
        white-space: nowrap !important;
        z-index: 4 !important;
      }

      .mxCardInfo:has(.mxRibbon.mxFeaturedBadge) h3 {
        padding-top: 3px !important;
      }
    `;
  }

  function apply() {
    ensureStyle();
    document.querySelectorAll('.mxRibbon').forEach((badge) => {
      badge.classList.toggle('mxFeaturedBadge', badge.textContent.trim() === 'مميز');
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
