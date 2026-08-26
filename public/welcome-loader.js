(() => {
  const PRIMARY = '/maurione-welcome-approved-exact.webp?v=10';
  const FALLBACK = '/maurione-welcome-approved.webp?v=10';

  function applyArtwork() {
    const image = document.querySelector('.welcomeFullArtwork');
    if (!image || image.dataset.boundWelcome === '1') return;
    image.dataset.boundWelcome = '1';

    image.onload = () => {
      image.classList.add('isReady');
      image.dataset.loadedWelcome = '1';
    };

    image.onerror = () => {
      if (image.dataset.fallbackWelcome === '1') {
        image.classList.add('isReady');
        return;
      }
      image.dataset.fallbackWelcome = '1';
      image.src = FALLBACK;
    };

    image.src = PRIMARY;
  }

  const start = () => {
    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(applyArtwork);
    observer.observe(root, { childList: true, subtree: true });
    applyArtwork();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
