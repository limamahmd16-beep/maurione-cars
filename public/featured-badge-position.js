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
      .mxCardInfo.mxHasFeaturedBadge {
        padding-top: 50px !important;
      }

      .mxRibbon.mxFeaturedBadge {
        position: absolute !important;
        top: 0 !important;
        right: 0 !important;
        left: auto !important;
        width: 88px !important;
        min-width: 88px !important;
        height: 34px !important;
        padding: 0 12px !important;
        margin: 0 !important;
        transform: none !important;
        transform-origin: initial !important;
        border-radius: 14px 0 0 12px !important;
        clip-path: none !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 12px !important;
        line-height: 1 !important;
        font-weight: 800 !important;
        white-space: nowrap !important;
        z-index: 4 !important;
      }
    `;
  }

  function apply() {
    ensureStyle();

    document.querySelectorAll('.mxCardInfo').forEach((cardInfo) => {
      const badges = [...cardInfo.querySelectorAll('.mxRibbon')];
      const featuredBadge = badges.find((badge) => badge.textContent.trim() === 'مميز');

      cardInfo.classList.toggle('mxHasFeaturedBadge', Boolean(featuredBadge));

      badges.forEach((badge) => {
        const featured = badge === featuredBadge;
        badge.classList.toggle('mxFeaturedBadge', featured);
      });

      if (featuredBadge && cardInfo.firstElementChild !== featuredBadge) {
        cardInfo.insertBefore(featuredBadge, cardInfo.firstElementChild);
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
