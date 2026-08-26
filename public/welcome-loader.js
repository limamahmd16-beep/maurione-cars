(() => {
  const VERSION = '12';
  const parts = ['00','01','02','03','04a','04b','04c','05'];
  let artworkPromise;
  let artworkUrl = '';

  function base64ToBlobUrl(base64) {
    const clean = base64.replace(/\s+/g, '');
    if (!clean.startsWith('UklG')) throw new Error('invalid-welcome-webp');

    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

    const blob = new Blob([bytes], { type: 'image/webp' });
    if (!blob.size) throw new Error('empty-welcome-blob');
    return URL.createObjectURL(blob);
  }

  async function fetchPart(part) {
    const url = `/welcome-parts/${part}.txt?v=${VERSION}`;
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, { cache: attempt === 0 ? 'force-cache' : 'no-store' });
        if (!response.ok) throw new Error(`welcome-part-${part}-${response.status}`);
        const text = (await response.text()).trim();
        if (!text) throw new Error(`welcome-part-${part}-empty`);
        return text;
      } catch (error) {
        lastError = error;
        if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 120 * (attempt + 1)));
      }
    }
    throw lastError || new Error(`welcome-part-${part}`);
  }

  function loadArtwork() {
    if (artworkUrl) return Promise.resolve(artworkUrl);
    if (!artworkPromise) {
      artworkPromise = Promise.all(parts.map(fetchPart)).then(chunks => {
        artworkUrl = base64ToBlobUrl(chunks.join(''));
        return artworkUrl;
      }).catch(error => {
        artworkPromise = null;
        throw error;
      });
    }
    return artworkPromise;
  }

  function applyArtwork() {
    const images = document.querySelectorAll('.welcomeFullArtwork');
    if (!images.length) return;

    loadArtwork().then(src => {
      images.forEach(image => {
        if (image.dataset.loadedWelcome === '1') return;
        image.alt = '';
        image.removeAttribute('src');
        image.onload = () => {
          image.classList.add('isReady');
          image.dataset.loadedWelcome = '1';
        };
        image.onerror = () => {
          image.classList.remove('isReady');
          image.dataset.loadedWelcome = '0';
        };
        image.src = src;
      });
    }).catch(() => {
      images.forEach(image => {
        image.alt = '';
        image.removeAttribute('src');
        image.classList.remove('isReady');
      });
    });
  }

  function start() {
    loadArtwork().catch(() => {});
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
