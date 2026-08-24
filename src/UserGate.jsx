import React, { useEffect, useState } from 'react';
import { LogIn, LogOut, UserRound, UserPlus } from 'lucide-react';
import { auth, db, firebaseReady } from './lib/firebase.js';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function UserGate({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(firebaseReady);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, nextUser => {
      setUser(nextUser || null);
      setLoading(false);
    });
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!auth) return;
    setBusy(true);
    setError('');
    try {
      if (mode === 'signup') {
        const name = form.name.trim();
        const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
        if (name) await updateProfile(cred.user, { displayName: name });
        if (db) {
          await setDoc(doc(db, 'users', cred.user.uid), {
            name,
            email: cred.user.email || form.email.trim(),
            role: 'user',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
        setUser(cred.user);
      } else {
        const cred = await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
        setUser(cred.user);
      }
    } catch (err) {
      const code = err?.code || 'auth/error';
      const messages = {
        'auth/email-already-in-use': 'هذا البريد لديه حساب بالفعل.',
        'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
        'auth/weak-password': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
        'auth/invalid-email': 'البريد الإلكتروني غير صحيح.',
      };
      setError(messages[code] || `تعذر إكمال العملية (${code}).`);
    } finally {
      setBusy(false);
    }
  }

  if (!firebaseReady) {
    return <>{children}</>;
  }

  if (loading) {
    return <main className="userAuthPage"><div className="userAuthCard">جارٍ التحقق من الحساب...</div></main>;
  }

  if (!user) {
    return <main className="userAuthPage" dir="rtl">
      <section className="userAuthCard">
        <div className="userAuthBrand"><span>MauriOne</span><small>السيارات</small></div>
        <div className="userAuthIcon">{mode === 'signup' ? <UserPlus/> : <LogIn/>}</div>
        <span className="userAuthEyebrow">حساب MauriOne السيارات</span>
        <h1>{mode === 'signup' ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h1>
        <p>لكل مستخدم حساب مستقل للوصول إلى MauriOne السيارات.</p>
        <form onSubmit={submit}>
          {mode === 'signup' && <label>الاسم الكامل<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} autoComplete="name"/></label>}
          <label>البريد الإلكتروني<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} autoComplete="email"/></label>
          <label>كلمة المرور<input type="password" minLength="6" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}/></label>
          {error && <div className="userAuthError">{error}</div>}
          <button className="userAuthPrimary" disabled={busy}>{busy ? 'جارٍ التنفيذ...' : mode === 'signup' ? 'إنشاء الحساب' : 'دخول'}</button>
        </form>
        <button className="userAuthSwitch" onClick={()=>{setMode(mode === 'login' ? 'signup' : 'login');setError('')}}>
          {mode === 'login' ? 'ليس لديك حساب؟ أنشئ حسابًا' : 'لديك حساب؟ سجّل الدخول'}
        </button>
      </section>
    </main>;
  }

  return <>
    <div className="userAccountChip" dir="rtl">
      <UserRound size={16}/>
      <span>{user.displayName || user.email}</span>
      <button onClick={()=>signOut(auth)} aria-label="تسجيل الخروج"><LogOut size={15}/></button>
    </div>
    {children}
  </>;
}
