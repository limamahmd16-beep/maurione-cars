(() => {
  const VERSION = '62';
  const STYLE_ID = 'mx-detail-runtime-image-style';

  function ensureStyle() {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = `
      .mxDetail .mxGallery{
        position:relative!important;
        display:block!important;
        overflow:hidden!important;
        padding:0!important;
        border-radius:24px!important;
        background-color:#f5f6f7!important;
        isolation:isolate!important;
      }
      .mxDetail .mxGallery::before{
        content:""!important;
        position:absolute!important;
        inset:0!important;
        z-index:100000!important;
        display:block!important;
        pointer-events:none!important;
        border-radius:inherit!important;
        background-image:var(--mx-detail-photo,none)!important;
        background-size:contain!important;
        background-position:center center!important;
        background-repeat:no-repeat!important;
      }
      .mxDetail .mxGallery>img{
        opacity:0!important;
        visibility:hidden!important;
        pointer-events:none!important;
      }
      .mxLightbox{
        position:fixed!important;
        inset:0!important;
        z-index:200000!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:72px 16px 92px!important;
        background:rgba(0,0,0,.9)!important;
        isolation:isolate!important;
      }
      .mxLightbox::before{
        content:""!important;
        position:absolute!important;
        inset:72px 16px 92px!important;
        z-index:1!important;
        pointer-events:none!important;
        background-image:var(--mx-detail-photo,none)!important;
        background-size:contain!important;
        background-position:center center!important;
        background-repeat:no-repeat!important;
      }
      .mxLightbox>img{
        opacity:0!important;
        visibility:hidden!important;
        pointer-events:none!important;
        width:1px!important;
        height:1px!important;
        position:absolute!important;
      }
      .mxLightbox button{z-index:3!important}
      @media(max-width:560px){
        .mxDetail .mxGallery{border-radius:23px!important}
        .mxLightbox{padding:68px 10px 86px!important}
        .mxLightbox::before{inset:68px 10px 86px!important}
      }
    `;
  }

  function selectedSource(gallery, forcedSource) {
    if (forcedSource) return forcedSource;
    const selected = document.querySelector('.mxDetail .mxThumbs button.on img');
    if (selected?.currentSrc || selected?.src) return selected.currentSrc || selected.src;
    const firstThumb = document.querySelector('.mxDetail .mxThumbs img');
    if (firstThumb?.currentSrc || firstThumb?.src) return firstThumb.currentSrc || firstThumb.src;
    const reactImage = gallery?.querySelector('img.mxMainPhoto, img');
    return reactImage?.currentSrc || reactImage?.src || '';
  }

  function cssUrl(src) {
    const absolute = new URL(src, window.location.href).href;
    return `url("${absolute.replace(/\\/g,'\\\\').replace(/"/g,'\\"')}")`;
  }

  function applyPhoto(target, src) {
    if (!target || !src) return;
    target.style.setProperty('--mx-detail-photo', cssUrl(src));
    target.dataset.runtimeImageVersion = VERSION;
  }

  function sync(forcedSource = '') {
    ensureStyle();
    const gallery = document.querySelector('.mxDetail .mxGallery');
    if (!gallery) return;
    const src = selectedSource(gallery, forcedSource);
    if (!src) return;
    applyPhoto(gallery, src);
    document.querySelectorAll('.mxLightbox').forEach(lightbox => applyPhoto(lightbox, src));
  }

  let raf = 0;
  function schedule(forcedSource = '') {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => sync(forcedSource));
  }

  document.addEventListener('click', (event) => {
    const thumbButton = event.target.closest?.('.mxDetail .mxThumbs button');
    if (thumbButton) {
      const thumb = thumbButton.querySelector('img');
      schedule(thumb?.currentSrc || thumb?.src || '');
      return;
    }
    if (event.target.closest?.('.mxPrev,.mxNext')) {
      setTimeout(() => schedule(), 0);
    }
  }, true);

  function start() {
    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(() => schedule());
    observer.observe(root, {
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:['src','class']
    });
    schedule();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once:true });
  } else {
    start();
  }
})();
