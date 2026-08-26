(() => {
  const SRC = '/welcome-approved-site.svg?v=13';

  function applyArtwork() {
    document.querySelectorAll('.welcomeFullArtwork').forEach((image) => {
      if (image.dataset.boundWelcome === '13') return;
      image.dataset.boundWelcome = '13';
      image.alt = '';
      image.classList.add('isReady');
      image.src = SRC;
      image.onerror = () => {
        image.classList.add('isReady');
      };
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
