(() => {
  const STYLE_ID = 'mx-featured-badge-position';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .mxRibbon.mxFeaturedBadge {
        top: 0 !important;
        right: 0 !important;
        width: 80px !important;
        height: 31px !important;
        padding: 0 10px 0 16px !important;
        transform: none !important;
        transform-origin: initial !important;
        border-radius: 0 22px 0 14px !important;
        clip-path: polygon(22% 0, 100% 0, 100% 100%, 0 100%) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 12px !important;
        line-height: 1 !important;
        font-weight: 800 !important;
        white-space: nowrap !important;
      }
    `;
    document.head.appendChild(style);
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
