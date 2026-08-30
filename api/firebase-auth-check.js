const API_KEY = process.env.VITE_CARS_FIREBASE_API_KEY || 'AIzaSyAWQ20xw0QoVwCSXLa1Mq-cJeiTIebEwnk';

export default async function handler(req, res) {
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(API_KEY)}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'referer': 'https://maurione-cars.vercel.app/',
        'origin': 'https://maurione-cars.vercel.app',
      },
      body: JSON.stringify({ returnSecureToken: true }),
    });
    const data = await response.json().catch(() => ({}));
    res.status(200).json({
      status: response.status,
      ok: response.ok,
      error: data?.error?.message || null,
      hasToken: Boolean(data?.idToken),
    });
  } catch (error) {
    res.status(200).json({ status: 0, ok: false, error: String(error?.message || error), hasToken: false });
  }
}
