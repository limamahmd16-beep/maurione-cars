(() => {
  const parts = ['00','01','02','03','04a','04b','04c','05'];

  const artworkPromise = Promise.all(parts.map(part =>
    fetch(`/welcome-parts/${part}.txt?v=8`, { cache: 'force-cache' }).then(response => {
      if (!response.ok) throw new Error(`welcome-part-${part}`);
      return response.text();
    })
  )).then(chunks => `data:image/webp;base64,${chunks.join('')}`);

  function applyArtwork() {
    const image = document.querySelector('.welcomeArtwork');
    if (!image || image.dataset.exactWelcome === '1') return;
    image.dataset.exactWelcome = '1';

    artworkPromise.then(src => {
      const preload = new Image();
      preload.decoding = 'async';
      preload.onload = () => {
        if (!image.isConnected) return;
        image.src = src;
        image.classList.add('isReady');
      };
      preload.src = src;
    }).catch(() => {
      image.dataset.exactWelcome = '0';
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
