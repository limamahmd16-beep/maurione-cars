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
        width: 64px !important;
        min-width: 64px !important;
        height: 27px !important;
        padding: 0 5px 0 10px !important;
        transform: none !important;
        transform-origin: initial !important;
        border-radius: 0 21px 0 11px !important;
        clip-path: polygon(20% 0, 100% 0, 100% 100%, 0 100%) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 11px !important;
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
