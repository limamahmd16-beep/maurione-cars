const PROJECT_ID = process.env.VITE_CARS_FIREBASE_PROJECT_ID || 'maurione-cars';

export default async function handler(req, res) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(PROJECT_ID)}/databases/(default)/documents/cars?pageSize=1`;
    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));
    res.status(200).json({
      status: response.status,
      ok: response.ok,
      error: data?.error?.status || data?.error?.message || null,
      readable: Boolean(response.ok),
      documentCount: Array.isArray(data?.documents) ? data.documents.length : 0,
    });
  } catch (error) {
    res.status(200).json({ status: 0, ok: false, error: String(error?.message || error), readable: false, documentCount: 0 });
  }
}
