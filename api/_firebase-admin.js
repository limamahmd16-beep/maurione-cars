import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

export const OWNER_UID = process.env.MAURIONE_OWNER_UID || 'sC94v8XaXmUMHK6eineEy25GIst2';

function parseServiceAccount() {
  const raw = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT is not configured');
  }

  let account;
  try {
    account = JSON.parse(raw);
  } catch {
    throw new Error('FIREBASE_ADMIN_SERVICE_ACCOUNT is invalid JSON');
  }

  if (account.private_key && account.private_key.includes('\\n')) {
    account.private_key = account.private_key.replace(/\\n/g, '\n');
  }

  return account;
}

export function adminServices() {
  const app = getApps()[0] || initializeApp({ credential: cert(parseServiceAccount()) });
  return {
    auth: getAuth(app),
    db: getFirestore(app),
    FieldValue,
  };
}

export async function requireOwner(request) {
  const header = String(request.headers?.authorization || '');
  if (!header.startsWith('Bearer ')) {
    const error = new Error('UNAUTHORIZED');
    error.statusCode = 401;
    throw error;
  }

  const token = header.slice(7).trim();
  const { auth } = adminServices();
  const decoded = await auth.verifyIdToken(token, true);
  if (decoded.uid !== OWNER_UID) {
    const error = new Error('FORBIDDEN');
    error.statusCode = 403;
    throw error;
  }
  return decoded;
}

export function normalizeUsername(value = '') {
  return String(value).trim().toLocaleLowerCase('en-US');
}

export function validUsername(value = '') {
  return /^[\p{L}\p{N}._-]{3,40}$/u.test(String(value));
}

export function json(response, status, payload) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store, max-age=0');
  return response.end(JSON.stringify(payload));
}
