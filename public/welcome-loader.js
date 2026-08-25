(() => {
  const parts = ['00','01','02','03','04','05'];
  let artworkPromise;

  function loadArtwork() {
    if (!artworkPromise) {
      artworkPromise = Promise.all(parts.map(part =>
        fetch(`/welcome-parts/${part}.txt?v=6`, { cache: 'force-cache' }).then(response => {
          if (!response.ok) throw new Error(`welcome-part-${part}`);
          return response.text();
        })
      )).then(chunks => `data:image/webp;base64,${chunks.join('')}`);
    }
    return artworkPromise;
  }

  function applyArtwork() {
    const image = document.querySelector('.welcomeArtwork');
    if (!image || image.dataset.exactWelcome === '1') return;
    image.dataset.exactWelcome = '1';

    loadArtwork().then(src => {
      const preload = new Image();
      preload.onload = () => {
        if (!image.isConnected) return;
        image.src = src;
        image.classList.add('isReady');
      };
      preload.src = src;
    }).catch(() => {
      // Keep the existing lightweight background as a fallback.
    });
  }

  const observer = new MutationObserver(applyArtwork);
  const start = () => {
    const root = document.getElementById('root') || document.body;
    observer.observe(root, { childList: true, subtree: true });
    applyArtwork();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
