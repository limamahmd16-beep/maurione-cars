const FIREBASE_API_KEY = process.env.VITE_CARS_FIREBASE_API_KEY || 'AIzaSyAWQ20xw0QoVwCSXLa1Mq-cJeiTIebEwnk';
const FIREBASE_PROJECT_ID = process.env.VITE_CARS_FIREBASE_PROJECT_ID || 'maurione-cars';
const FALLBACK_IMAGE = 'https://res.cloudinary.com/bjlglhaw/image/upload/v1788117338/maurione-app-icon.png';

let cachedToken = '';
let cachedTokenExpiresAt = 0;

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unwrap(value) {
  if (!value || typeof value !== 'object') return null;
  if ('stringValue' in value) return value.stringValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('booleanValue' in value) return Boolean(value.booleanValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('nullValue' in value) return null;
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(unwrap);
  if ('mapValue' in value) return Object.fromEntries(
    Object.entries(value.mapValue.fields || {}).map(([key, child]) => [key, unwrap(child)])
  );
  return null;
}

function decodeDocument(document) {
  return Object.fromEntries(
    Object.entries(document?.fields || {}).map(([key, value]) => [key, unwrap(value)])
  );
}

async function anonymousToken() {
  if (cachedToken && Date.now() < cachedTokenExpiresAt) return cachedToken;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(FIREBASE_API_KEY)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }),
    }
  );

  if (!response.ok) {
    throw new Error(`AUTH_${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.idToken || '';
  const expiresIn = Math.max(60, Number(data.expiresIn || 3600));
  cachedTokenExpiresAt = Date.now() + Math.max(60, expiresIn - 120) * 1000;
  return cachedToken;
}

async function fetchCar(id) {
  const token = await anonymousToken();
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(FIREBASE_PROJECT_ID)}/databases/(default)/documents/cars/${encodeURIComponent(id)}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`FIRESTORE_${response.status}`);
  return decodeDocument(await response.json());
}

function formatNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? new Intl.NumberFormat('en-US').format(number) : '';
}

function pageHtml({ car, carId, canonicalUrl, shareUrl }) {
  const name = [car?.brand, car?.model, car?.year].filter(Boolean).join(' ').trim();
  const title = name ? `${name} | MauriOne` : 'MauriOne السيارات';
  const price = Number(car?.price || 0);
  const mileage = Number(car?.mileage || 0);
  const descriptionParts = [];

  if (name) descriptionParts.push(name);
  if (price > 0) descriptionParts.push(`السعر ${formatNumber(price)} MRU`);
  if (mileage > 0) descriptionParts.push(`${formatNumber(mileage)} كم`);
  if (car?.fuel) descriptionParts.push(String(car.fuel));
  if (car?.transmission) descriptionParts.push(String(car.transmission));
  if (car?.location) descriptionParts.push(String(car.location));

  const description = descriptionParts.length
    ? `${descriptionParts.join(' · ')} — شاهد التفاصيل على MauriOne.`
    : 'شاهد تفاصيل السيارة وصورها على MauriOne.';

  const image = Array.isArray(car?.images) && car.images[0] ? car.images[0] : FALLBACK_IMAGE;
  const availability = car?.status === 'sold' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock';

  const structured = {
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    name: name || 'سيارة على MauriOne',
    url: canonicalUrl,
    image: [image],
    ...(car?.brand ? { brand: { '@type': 'Brand', name: String(car.brand) } } : {}),
    ...(car?.model ? { model: String(car.model) } : {}),
    ...(car?.year ? { vehicleModelDate: String(car.year) } : {}),
    ...(mileage > 0 ? {
      mileageFromOdometer: {
        '@type': 'QuantitativeValue',
        value: mileage,
        unitCode: 'KMT',
      },
    } : {}),
    ...(car?.fuel ? { fuelType: String(car.fuel) } : {}),
    ...(car?.transmission ? { vehicleTransmission: String(car.transmission) } : {}),
    ...(price > 0 ? {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'MRU',
        price,
        availability,
        url: canonicalUrl,
      },
    } : {}),
  };

  const safeStructured = JSON.stringify(structured).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">

  <meta property="og:site_name" content="MauriOne">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ar_MR">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:alt" content="${escapeHtml(name || 'MauriOne')}">
  <meta property="og:url" content="${escapeHtml(shareUrl)}">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">

  <script type="application/ld+json">${safeStructured}</script>
  <meta http-equiv="refresh" content="0;url=${escapeHtml(canonicalUrl)}">
</head>
<body>
  <p>جارٍ فتح السيارة على MauriOne...</p>
  <script>location.replace(${JSON.stringify(canonicalUrl)});</script>
  <noscript><a href="${escapeHtml(canonicalUrl)}">فتح الإعلان</a></noscript>
</body>
</html>`;
}

export default async function handler(req, res) {
  const carId = String(req.query?.id || '').trim();
  if (!carId || carId.length > 180 || !/^[A-Za-z0-9_-]+$/.test(carId)) {
    res.status(400).send('Invalid car id');
    return;
  }

  const forwardedHost = String(req.headers['x-forwarded-host'] || req.headers.host || 'maurione-cars.vercel.app').split(',')[0].trim();
  const forwardedProto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const origin = `${forwardedProto}://${forwardedHost}`;
  const encodedId = encodeURIComponent(carId);
  const canonicalUrl = `${origin}/cars/${encodedId}`;
  const shareUrl = `${origin}/share/car/${encodedId}`;

  try {
    const car = await fetchCar(carId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    res.setHeader('X-MauriOne-Share', car ? 'car' : 'fallback');
    res.status(200).send(pageHtml({ car, carId, canonicalUrl, shareUrl }));
  } catch (error) {
    console.error('MauriOne share preview failed', error);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.setHeader('X-MauriOne-Share', 'fallback-error');
    res.status(200).send(pageHtml({ car: null, carId, canonicalUrl, shareUrl }));
  }
}
