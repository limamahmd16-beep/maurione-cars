(() => {
  const VERSION = '61';
  const STYLE_ID = 'mx-detail-runtime-image-style';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .mxDetail .mxGallery{
        position:relative!important;
        display:block!important;
        overflow:hidden!important;
        padding:0!important;
        border-radius:24px!important;
        background:#f5f6f7!important;
      }
      .mxDetail .mxGallery>.mxRuntimeMainPhoto{
        position:absolute!important;
        inset:0!important;
        display:block!important;
        width:100%!important;
        height:100%!important;
        min-width:100%!important;
        min-height:100%!important;
        max-width:none!important;
        max-height:none!important;
        margin:0!important;
        padding:0!important;
        object-fit:contain!important;
        object-position:center center!important;
        border:0!important;
        border-radius:24px!important;
        opacity:1!important;
        visibility:visible!important;
        transform:none!important;
        z-index:999!important;
        background:#f5f6f7!important;
      }
      @media(max-width:560px){
        .mxDetail .mxGallery,
        .mxDetail .mxGallery>.mxRuntimeMainPhoto{border-radius:23px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function selectedSource(gallery, forcedSource) {
    if (forcedSource) return forcedSource;
    const selected = document.querySelector('.mxDetail .mxThumbs button.on img');
    if (selected?.currentSrc || selected?.src) return selected.currentSrc || selected.src;
    const firstThumb = document.querySelector('.mxDetail .mxThumbs img');
    if (firstThumb?.currentSrc || firstThumb?.src) return firstThumb.currentSrc || firstThumb.src;
    const reactImage = gallery?.querySelector('img.mxMainPhoto, img:not(.mxRuntimeMainPhoto)');
    return reactImage?.currentSrc || reactImage?.src || '';
  }

  function sync(forcedSource = '') {
    ensureStyle();
    const gallery = document.querySelector('.mxDetail .mxGallery');
    if (!gallery) return;

    const src = selectedSource(gallery, forcedSource);
    if (!src) return;

    let image = gallery.querySelector(':scope > .mxRuntimeMainPhoto');
    if (!image) {
      image = document.createElement('img');
      image.className = 'mxRuntimeMainPhoto';
      image.alt = 'صورة السيارة';
      image.draggable = false;
      gallery.appendChild(image);
    }

    const absolute = new URL(src, window.location.href).href;
    if (image.src !== absolute) image.src = absolute;
    gallery.dataset.runtimeImageVersion = VERSION;
  }

  let raf = 0;
  function schedule(forcedSource = '') {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => sync(forcedSource));
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('.mxDetail .mxThumbs button');
    if (!button) return;
    const thumb = button.querySelector('img');
    const src = thumb?.currentSrc || thumb?.src || '';
    schedule(src);
  }, true);

  function start() {
    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(() => schedule());
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'class']
    });
    schedule();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
