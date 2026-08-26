(() => {
  const SRC = 'https://cdn.shopify.com/s/files/1/0744/5967/6841/files/maurione-cars-welcome-white.png?v=1787776242';

  function applyArtwork() {
    document.querySelectorAll('img[alt="سيارات MauriOne"]').forEach((image) => {
      if (image.dataset.boundWelcome === '29') return;
      image.dataset.boundWelcome = '29';
      image.src = SRC;
      image.style.display = 'block';
      image.style.width = '100%';
      image.style.height = 'auto';
      image.style.objectFit = 'contain';
      image.style.objectPosition = 'center';
      image.style.background = '#fff';
    });
  }

  function start() {
    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(applyArtwork);
    observer.observe(root, { childList: true, subtree: true });
    applyArtwork();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();