import bcrypt from 'bcryptjs';
import { adminServices, json, normalizeUsername, requireOwner, validUsername } from './_firebase-admin.js';

const PERMISSION_KEYS = [
  'dashboardView',
  'analyticsView',
  'carsView',
  'carsCreate',
  'carsEdit',
  'carsMarkSold',
  'carsDelete',
  'usersView',
  'socialExport',
];

function normalizePermissions(input = {}) {
  const result = {};
  for (const key of PERMISSION_KEYS) result[key] = Boolean(input?.[key]);
  result.dashboardView = true;
  return result;
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128;
}

function serializeStaff(doc) {
  const data = doc.data() || {};
  return {
    uid: doc.id,
    displayName: data.displayName || '',
    username: data.username || '',
    role: data.role || 'staff',
    active: data.active !== false,
    permissions: normalizePermissions(data.permissions || {}),
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
    lastLoginAt: data.lastLoginAt?.toDate?.()?.toISOString?.() || null,
  };
}

async function audit(db, FieldValue, action, actorUid, targetUid, details = {}) {
  await db.collection('adminAuditLogs').add({
    action,
    actorUid,
    targetUid: targetUid || null,
    details,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return json(response, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const owner = await requireOwner(request);
    const { auth, db, FieldValue } = adminServices();
    const action = String(request.body?.action || 'list');

    if (action === 'list') {
      const snapshot = await db.collection('admins').get();
      const staff = snapshot.docs
        .filter(doc => doc.data()?.type === 'staff')
        .map(serializeStaff)
        .sort((a, b) => String(a.displayName).localeCompare(String(b.displayName), 'ar'));
      return json(response, 200, { ok: true, staff });
    }

    if (action === 'create') {
      const displayName = String(request.body?.displayName || '').trim().slice(0, 80);
      const username = normalizeUsername(request.body?.username || '');
      const password = String(request.body?.password || '');
      const role = String(request.body?.role || 'موظف').trim().slice(0, 60) || 'موظف';
      const permissions = normalizePermissions(request.body?.permissions || {});

      if (displayName.length < 2 || !validUsername(username) || !validatePassword(password)) {
        return json(response, 400, { ok: false, error: 'INVALID_STAFF_DATA' });
      }

      const credentialRef = db.collection('staffCredentials').doc(username);
      if ((await credentialRef.get()).exists) {
        return json(response, 409, { ok: false, error: 'USERNAME_EXISTS' });
      }

      const userRecord = await auth.createUser({ displayName, disabled: false });
      const passwordHash = await bcrypt.hash(password, 12);
      const now = FieldValue.serverTimestamp();

      try {
        await db.runTransaction(async transaction => {
          transaction.set(db.collection('admins').doc(userRecord.uid), {
            type: 'staff',
            displayName,
            username,
            role,
            active: true,
            permissions,
            createdBy: owner.uid,
            createdAt: now,
            updatedAt: now,
          });
          transaction.set(credentialRef, {
            uid: userRecord.uid,
            passwordHash,
            active: true,
            failedAttempts: 0,
            lockedUntil: null,
            createdAt: now,
            updatedAt: now,
          });
        });
      } catch (error) {
        await auth.deleteUser(userRecord.uid).catch(() => {});
        throw error;
      }

      await audit(db, FieldValue, 'staff.create', owner.uid, userRecord.uid, { username, role });
      const snap = await db.collection('admins').doc(userRecord.uid).get();
      return json(response, 200, { ok: true, staff: serializeStaff(snap) });
    }

    const uid = String(request.body?.uid || '').trim();
    if (!uid) return json(response, 400, { ok: false, error: 'MISSING_UID' });

    const adminRef = db.collection('admins').doc(uid);
    const adminSnap = await adminRef.get();
    if (!adminSnap.exists || adminSnap.data()?.type !== 'staff') {
      return json(response, 404, { ok: false, error: 'STAFF_NOT_FOUND' });
    }

    const current = adminSnap.data() || {};
    const username = normalizeUsername(current.username || '');
    const credentialRef = db.collection('staffCredentials').doc(username);

    if (action === 'update') {
      const displayName = String(request.body?.displayName ?? current.displayName ?? '').trim().slice(0, 80);
      const role = String(request.body?.role ?? current.role ?? 'موظف').trim().slice(0, 60) || 'موظف';
      const permissions = normalizePermissions(request.body?.permissions ?? current.permissions ?? {});
      if (displayName.length < 2) return json(response, 400, { ok: false, error: 'INVALID_STAFF_DATA' });

      await adminRef.set({
        displayName,
        role,
        permissions,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      await auth.updateUser(uid, { displayName }).catch(() => {});
      await audit(db, FieldValue, 'staff.update', owner.uid, uid, { role, permissions });
      return json(response, 200, { ok: true, staff: serializeStaff(await adminRef.get()) });
    }

    if (action === 'resetPassword') {
      const password = String(request.body?.password || '');
      if (!validatePassword(password)) return json(response, 400, { ok: false, error: 'INVALID_PASSWORD' });
      const passwordHash = await bcrypt.hash(password, 12);
      await credentialRef.set({
        passwordHash,
        failedAttempts: 0,
        lockedUntil: null,
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      await auth.revokeRefreshTokens(uid).catch(() => {});
      await audit(db, FieldValue, 'staff.password.reset', owner.uid, uid);
      return json(response, 200, { ok: true });
    }

    if (action === 'setActive') {
      const active = Boolean(request.body?.active);
      await Promise.all([
        adminRef.set({ active, updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
        credentialRef.set({ active, updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
        auth.updateUser(uid, { disabled: !active }),
      ]);
      if (!active) await auth.revokeRefreshTokens(uid).catch(() => {});
      await audit(db, FieldValue, active ? 'staff.enable' : 'staff.disable', owner.uid, uid);
      return json(response, 200, { ok: true, staff: serializeStaff(await adminRef.get()) });
    }

    if (action === 'delete') {
      await auth.deleteUser(uid).catch(() => {});
      await Promise.all([
        adminRef.delete(),
        credentialRef.delete(),
      ]);
      await audit(db, FieldValue, 'staff.delete', owner.uid, uid, { username });
      return json(response, 200, { ok: true });
    }

    return json(response, 400, { ok: false, error: 'UNKNOWN_ACTION' });
  } catch (error) {
    console.error('[MauriOne staff manage]', error);
    const status = Number(error?.statusCode || 0) || (String(error?.message || '').includes('FIREBASE_ADMIN_SERVICE_ACCOUNT') ? 503 : 500);
    return json(response, status, {
      ok: false,
      error: status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : status === 503 ? 'STAFF_AUTH_NOT_CONFIGURED' : 'STAFF_MANAGEMENT_FAILED',
    });
  }
}
