(() => {
  const VERSION = '49';

  function getSource(gallery) {
    const original = [...gallery.querySelectorAll('img')].find((img) => !img.dataset.mxPrimaryClone);
    if (!original) return '';
    return original.currentSrc || original.src || original.getAttribute('src') || '';
  }

  function restoreGallery(gallery) {
    const src = getSource(gallery);
    if (!src) return;

    gallery.style.setProperty('position', 'relative', 'important');
    gallery.style.setProperty('overflow', 'hidden', 'important');
    gallery.style.setProperty('background-image', 'none', 'important');

    let clone = gallery.querySelector('img[data-mx-primary-clone="1"]');
    if (!clone) {
      clone = document.createElement('img');
      clone.dataset.mxPrimaryClone = '1';
      clone.alt = '';
      clone.setAttribute('aria-hidden', 'true');
      gallery.appendChild(clone);
    }

    if (clone.src !== src) clone.src = src;

    clone.style.setProperty('position', 'absolute', 'important');
    clone.style.setProperty('inset', '0', 'important');
    clone.style.setProperty('width', '100%', 'important');
    clone.style.setProperty('height', '100%', 'important');
    clone.style.setProperty('max-width', '100%', 'important');
    clone.style.setProperty('max-height', '100%', 'important');
    clone.style.setProperty('display', 'block', 'important');
    clone.style.setProperty('object-fit', 'contain', 'important');
    clone.style.setProperty('object-position', 'center', 'important');
    clone.style.setProperty('opacity', '1', 'important');
    clone.style.setProperty('visibility', 'visible', 'important');
    clone.style.setProperty('z-index', '5', 'important');
    clone.style.setProperty('pointer-events', 'none', 'important');
    clone.style.setProperty('margin', '0', 'important');
    clone.style.setProperty('transform', 'none', 'important');
  }

  function apply() {
    document.querySelectorAll('.mxDetail .mxGallery').forEach(restoreGallery);
  }

  function start() {
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => requestAnimationFrame(apply));
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'class']
    });

    document.addEventListener('click', (event) => {
      if (event.target.closest('.mxThumbs button')) schedule();
    }, true);

    window.addEventListener('popstate', schedule);
    apply();
    window.__maurioneDetailPhotoRestore = VERSION;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
