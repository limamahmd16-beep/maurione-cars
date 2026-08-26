(() => {
  const VERSION = '11';
  const CACHE_KEY = `maurione_welcome_artwork_${VERSION}`;
  const parts = ['00','01','02','03','04a','04b','04c','05'];
  let artworkPromise;

  function getCachedArtwork() {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached && cached.startsWith('data:image/webp;base64,') ? cached : '';
    } catch {
      return '';
    }
  }

  function cacheArtwork(src) {
    try { sessionStorage.setItem(CACHE_KEY, src); } catch {}
  }

  function loadArtwork() {
    const cached = getCachedArtwork();
    if (cached) return Promise.resolve(cached);

    if (!artworkPromise) {
      artworkPromise = Promise.all(parts.map(part =>
        fetch(`/welcome-parts/${part}.txt?v=${VERSION}`, { cache: 'force-cache' }).then(response => {
          if (!response.ok) throw new Error(`welcome-part-${part}`);
          return response.text();
        })
      )).then(chunks => {
        const base64 = chunks.map(chunk => chunk.trim()).join('');
        if (!base64.startsWith('UklG')) throw new Error('invalid-welcome-webp');
        const src = `data:image/webp;base64,${base64}`;
        cacheArtwork(src);
        return src;
      });
    }
    return artworkPromise;
  }

  function applyArtwork() {
    const image = document.querySelector('.welcomeFullArtwork');
    if (!image || image.dataset.boundWelcome === '1') return;
    image.dataset.boundWelcome = '1';

    loadArtwork().then(src => {
      const preload = new Image();
      preload.decoding = 'async';
      preload.onload = () => {
        if (!image.isConnected) return;
        image.src = src;
        image.classList.add('isReady');
        image.dataset.loadedWelcome = '1';
      };
      preload.onerror = () => {
        image.dataset.boundWelcome = '0';
        try { sessionStorage.removeItem(CACHE_KEY); } catch {}
      };
      preload.src = src;
    }).catch(() => {
      image.dataset.boundWelcome = '0';
      try { sessionStorage.removeItem(CACHE_KEY); } catch {}
    });
  }

  const start = () => {
    loadArtwork().catch(() => {});
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
