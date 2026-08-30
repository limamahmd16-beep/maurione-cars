(() => {
  const DEFAULT_TITLE = 'MauriOne السيارات | معرض السيارات';
  const DEFAULT_DESCRIPTION = 'MauriOne لعرض سيارات مختارة في موريتانيا مع الصور، السعر، المواصفات والتواصل المباشر.';
  const DEFAULT_IMAGE = 'https://res.cloudinary.com/bjlglhaw/image/upload/v1788117338/maurione-app-icon.png';

  const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
  const numberFrom = (value) => {
    const normalized = clean(value).replace(/[^0-9.]/g, '');
    const number = Number(normalized || 0);
    return Number.isFinite(number) ? number : 0;
  };

  function ensureMeta(attr, key) {
    let node = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!node) {
      node = document.createElement('meta');
      node.setAttribute(attr, key);
      document.head.appendChild(node);
    }
    return node;
  }

  function setMeta(attr, key, value) {
    ensureMeta(attr, key).setAttribute('content', value);
  }

  function setCanonical(url) {
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  function setStructuredData(data) {
    let script = document.getElementById('maurione-vehicle-schema');
    if (!data) {
      script?.remove();
      return;
    }
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'maurione-vehicle-schema';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  }

  function applyBase({ title, description, image, url, type = 'website' }) {
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', 'index,follow,max-image-preview:large');
    setCanonical(url);

    setMeta('property', 'og:site_name', 'MauriOne');
    setMeta('property', 'og:locale', 'ar_MR');
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', url);

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);
  }

  function applyHome() {
    const url = `${location.origin}/`;
    applyBase({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      image: DEFAULT_IMAGE,
      url,
    });
    setStructuredData(null);
  }

  function readDetail() {
    const detail = document.querySelector('.mxDetail');
    if (!detail) return null;

    const brand = clean(detail.querySelector('.mxSummary > span')?.textContent);
    const heading = clean(detail.querySelector('.mxSummary h1')?.textContent);
    const priceText = clean(detail.querySelector('.mxDetailPrice')?.textContent);
    const image = detail.querySelector('.mxThumbs button:first-child img')?.src
      || detail.querySelector('.mxGallery img')?.src
      || DEFAULT_IMAGE;

    const specs = {};
    detail.querySelectorAll('.mxDetailSpecs .mxSpec').forEach((item) => {
      const label = clean(item.querySelector('small')?.textContent);
      const value = clean(item.querySelector('strong')?.textContent);
      if (label) specs[label] = value;
    });

    const name = clean(`${brand} ${heading}`);
    if (!name) return null;
    return { brand, heading, name, priceText, image, specs };
  }

  function applyDetail(car) {
    const url = `${location.origin}${location.pathname}`;
    const parts = [car.name];
    if (car.priceText) parts.push(`السعر ${car.priceText}`);
    if (car.specs['كم']) parts.push(`${car.specs['كم']} كم`);
    if (car.specs['الوقود']) parts.push(car.specs['الوقود']);
    if (car.specs['ناقل الحركة']) parts.push(car.specs['ناقل الحركة']);
    const description = `${parts.join(' · ')} — الصور والمواصفات والتواصل على MauriOne.`;
    const title = `${car.name} | MauriOne`;

    applyBase({ title, description, image: car.image, url, type: 'product' });
    setMeta('property', 'og:image:alt', car.name);

    const price = numberFrom(car.priceText);
    const mileage = numberFrom(car.specs['كم']);
    const yearMatch = car.heading.match(/\b(19|20)\d{2}\b/);
    const model = clean(car.heading.replace(/\b(19|20)\d{2}\b/g, ''));

    setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      name: car.name,
      url,
      image: [car.image],
      ...(car.brand ? { brand: { '@type': 'Brand', name: car.brand } } : {}),
      ...(model ? { model } : {}),
      ...(yearMatch ? { vehicleModelDate: yearMatch[0] } : {}),
      ...(mileage > 0 ? {
        mileageFromOdometer: {
          '@type': 'QuantitativeValue',
          value: mileage,
          unitCode: 'KMT',
        },
      } : {}),
      ...(car.specs['الوقود'] ? { fuelType: car.specs['الوقود'] } : {}),
      ...(car.specs['ناقل الحركة'] ? { vehicleTransmission: car.specs['ناقل الحركة'] } : {}),
      ...(price > 0 ? {
        offers: {
          '@type': 'Offer',
          priceCurrency: 'MRU',
          price,
          availability: 'https://schema.org/InStock',
          url,
        },
      } : {}),
    });
  }

  let raf = 0;
  function apply() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (location.pathname.startsWith('/cars/')) {
        const car = readDetail();
        if (car) applyDetail(car);
        else {
          applyBase({
            title: 'سيارة على MauriOne',
            description: 'شاهد تفاصيل السيارة وصورها ومواصفاتها على MauriOne.',
            image: DEFAULT_IMAGE,
            url: `${location.origin}${location.pathname}`,
          });
          setStructuredData(null);
        }
      } else {
        applyHome();
      }
    });
  }

  function start() {
    document.documentElement.lang = 'ar';
    apply();
    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['src'] });
    window.addEventListener('popstate', apply);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
