(() => {
  const clean = (value) => (value || '').replace(/\s+/g, ' ').trim();

  function whatsappNumber(link) {
    const href = link?.getAttribute('href') || '';
    const match = href.match(/(?:wa\.me\/|[?&]phone=)(\d+)/i);
    return match?.[1] || '';
  }

  function readCarDetails() {
    const detail = document.querySelector('.mxDetail');
    if (!detail) return null;

    const brand = clean(detail.querySelector('.mxSummary > span')?.textContent);
    const title = clean(detail.querySelector('.mxSummary h1')?.textContent);
    const price = clean(detail.querySelector('.mxDetailPrice')?.textContent);
    const image = detail.querySelector('.mxThumbs button:first-child img')?.src
      || detail.querySelector('.mxGallery img')?.src
      || '';

    const specs = {};
    detail.querySelectorAll('.mxDetailSpecs .mxSpec').forEach((item) => {
      const label = clean(item.querySelector('small')?.textContent);
      const value = clean(item.querySelector('strong')?.textContent);
      if (label) specs[label] = value;
    });

    const sharePath = window.location.pathname.startsWith('/cars/')
      ? window.location.pathname.replace(/^\/cars\//, '/share/car/')
      : window.location.pathname;
    const shareUrl = new URL(`${window.location.origin}${sharePath}`);
    const carName = clean(`${brand} ${title}`);
    if (carName) shareUrl.searchParams.set('n', carName);
    if (price) shareUrl.searchParams.set('p', price);
    if (image) shareUrl.searchParams.set('i', image);
    if (specs['كم']) shareUrl.searchParams.set('m', specs['كم']);
    if (specs['الوقود']) shareUrl.searchParams.set('f', specs['الوقود']);
    if (specs['ناقل الحركة']) shareUrl.searchParams.set('tr', specs['ناقل الحركة']);

    return { brand, title, price, adUrl: shareUrl.toString(), specs };
  }

  function buildMessage(car) {
    const lines = [
      'مرحبًا، أريد الاستفسار عن هذه السيارة في MauriOne:',
      '',
      `🚗 السيارة: ${clean(`${car.brand} ${car.title}`)}`,
      car.price ? `💰 السعر: ${car.price}` : '',
      car.specs['السنة'] ? `📅 السنة: ${car.specs['السنة']}` : '',
      car.specs['كم'] ? `🛣️ الكيلومترات: ${car.specs['كم']} كم` : '',
      car.specs['الوقود'] ? `⛽ الوقود: ${car.specs['الوقود']}` : '',
      car.specs['ناقل الحركة'] ? `⚙️ ناقل الحركة: ${car.specs['ناقل الحركة']}` : '',
      car.specs['الدفع'] ? `🚙 الدفع: ${car.specs['الدفع']}` : '',
      '',
      '🔗 رابط الإعلان على MauriOne:',
      car.adUrl,
    ];
    return lines.filter((line, index, array) => line !== '' || (index > 0 && array[index - 1] !== '')).join('\n').trim();
  }

  function apply() {
    const car = readCarDetails();
    if (!car) return;

    const links = [
      ...document.querySelectorAll('.mxDetail .mxContact a.wa'),
      ...document.querySelectorAll('a.mxGlobalWhatsApp'),
    ];

    let fallbackNumber = '';
    for (const link of links) {
      fallbackNumber = whatsappNumber(link) || fallbackNumber;
    }
    if (!fallbackNumber) return;

    const message = buildMessage(car);
    links.forEach((link) => {
      const number = whatsappNumber(link) || fallbackNumber;
      const nextHref = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
      if (link.getAttribute('href') !== nextHref) link.setAttribute('href', nextHref);
      if (link.target !== '_blank') link.target = '_blank';
      if (link.rel !== 'noreferrer') link.rel = 'noreferrer';
    });
  }

  function start() {
    apply();
    const root = document.getElementById('root') || document.body;
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
    window.addEventListener('popstate', () => setTimeout(apply, 0));
    document.addEventListener('click', (event) => {
      if (event.target.closest?.('.mxDetail .mxContact a.wa, a.mxGlobalWhatsApp, .mxThumbs button')) {
        setTimeout(apply, 0);
      }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
