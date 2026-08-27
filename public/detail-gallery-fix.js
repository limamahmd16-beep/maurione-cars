(() => {
  const VERSION = '46';

  function applyGallery() {
    document.querySelectorAll('.mxDetail .mxGallery').forEach((gallery) => {
      const img = gallery.querySelector('img');
      if (!img) return;
      const src = img.currentSrc || img.src || img.getAttribute('src') || '';
      if (!src) return;

      if (gallery.dataset.galleryFixSrc !== src) {
        gallery.dataset.galleryFixSrc = src;
        gallery.style.setProperty('background-image', `url("${src.replace(/"/g, '%22')}")`, 'important');
      }

      gallery.style.setProperty('background-repeat', 'no-repeat', 'important');
      gallery.style.setProperty('background-position', 'center', 'important');
      gallery.style.setProperty('background-size', 'contain', 'important');
      gallery.style.setProperty('background-color', '#f6f7f8', 'important');

      img.style.setProperty('opacity', '0', 'important');
      img.style.setProperty('visibility', 'hidden', 'important');
      img.style.setProperty('pointer-events', 'none', 'important');
    });
  }

  function start() {
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyGallery);
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });

    document.addEventListener('click', (event) => {
      if (event.target.closest('.mxThumbs button')) {
        requestAnimationFrame(() => requestAnimationFrame(applyGallery));
      }
    }, true);

    window.addEventListener('popstate', schedule);
    applyGallery();
    window.__maurioneGalleryFix = VERSION;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
