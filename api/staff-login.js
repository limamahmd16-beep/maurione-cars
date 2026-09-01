import bcrypt from 'bcryptjs';
import { adminServices, json, normalizeUsername, validUsername } from './_firebase-admin.js';

const MAX_FAILED = 5;
const LOCK_MS = 15 * 60 * 1000;

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return json(response, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const username = normalizeUsername(request.body?.username || '');
    const password = String(request.body?.password || '');

    if (!validUsername(username) || password.length < 1 || password.length > 200) {
      return json(response, 400, { ok: false, error: 'INVALID_CREDENTIALS' });
    }

    const { auth, db, FieldValue } = adminServices();
    const credentialRef = db.collection('staffCredentials').doc(username);
    const credentialSnap = await credentialRef.get();

    if (!credentialSnap.exists) {
      await new Promise(resolve => setTimeout(resolve, 250));
      return json(response, 401, { ok: false, error: 'INVALID_CREDENTIALS' });
    }

    const credential = credentialSnap.data() || {};
    const lockedUntilMs = credential.lockedUntil?.toMillis?.() || 0;
    if (lockedUntilMs > Date.now()) {
      return json(response, 429, { ok: false, error: 'ACCOUNT_TEMPORARILY_LOCKED' });
    }

    const matches = await bcrypt.compare(password, String(credential.passwordHash || ''));
    if (!matches) {
      const failed = Number(credential.failedAttempts || 0) + 1;
      const update = {
        failedAttempts: failed >= MAX_FAILED ? 0 : failed,
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (failed >= MAX_FAILED) {
        update.lockedUntil = new Date(Date.now() + LOCK_MS);
      }
      await credentialRef.set(update, { merge: true });
      return json(response, 401, { ok: false, error: 'INVALID_CREDENTIALS' });
    }

    if (credential.active === false || !credential.uid) {
      return json(response, 403, { ok: false, error: 'ACCOUNT_DISABLED' });
    }

    const adminRef = db.collection('admins').doc(credential.uid);
    const adminSnap = await adminRef.get();
    if (!adminSnap.exists) {
      return json(response, 403, { ok: false, error: 'ACCOUNT_DISABLED' });
    }

    const profile = adminSnap.data() || {};
    if (profile.type !== 'staff' || profile.active === false) {
      return json(response, 403, { ok: false, error: 'ACCOUNT_DISABLED' });
    }

    await credentialRef.set({
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    const token = await auth.createCustomToken(credential.uid, {
      maurioneStaff: true,
      staffRole: String(profile.role || 'staff').slice(0, 50),
    });

    return json(response, 200, {
      ok: true,
      customToken: token,
      staff: {
        uid: credential.uid,
        displayName: profile.displayName || '',
        username: profile.username || username,
        role: profile.role || 'staff',
        permissions: profile.permissions || {},
      },
    });
  } catch (error) {
    console.error('[MauriOne staff login]', error);
    const configurationError = String(error?.message || '').includes('FIREBASE_ADMIN_SERVICE_ACCOUNT');
    return json(response, configurationError ? 503 : 500, {
      ok: false,
      error: configurationError ? 'STAFF_AUTH_NOT_CONFIGURED' : 'STAFF_LOGIN_FAILED',
    });
  }
}
