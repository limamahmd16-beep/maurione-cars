(() => {
  const SRC = '/showroom-720.jpg?v=26';

  function applyArtwork() {
    document.querySelectorAll('img[alt="سيارات MauriOne"]').forEach((image) => {
      if (image.dataset.boundWelcome === '26') return;
      image.dataset.boundWelcome = '26';
      image.src = SRC;
      image.style.display = 'block';
      image.style.width = '100%';
      image.style.height = 'auto';
      image.style.objectFit = 'contain';
      image.style.objectPosition = 'center';
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