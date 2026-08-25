import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, LogIn, LogOut, Mail, UserPlus, UserRound } from 'lucide-react';
import { auth, db, firebaseReady } from './lib/firebase.js';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
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
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    setSuccess('');
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
        'auth/too-many-requests': 'تمت محاولات كثيرة. حاول مرة أخرى بعد قليل.',
      };
      setError(messages[code] || `تعذر إكمال العملية (${code}).`);
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (!auth) return;
    const email = form.email.trim();
    setError('');
    setSuccess('');
    if (!email) {
      setError('أدخل بريدك الإلكتروني أولًا ثم اضغط «نسيت كلمة المرور؟».');
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.');
    } catch (err) {
      const code = err?.code || 'auth/error';
      const messages = {
        'auth/invalid-email': 'البريد الإلكتروني غير صحيح.',
        'auth/user-not-found': 'لا يوجد حساب بهذا البريد الإلكتروني.',
        'auth/too-many-requests': 'تمت محاولات كثيرة. حاول مرة أخرى بعد قليل.',
      };
      setError(messages[code] || 'تعذر إرسال رابط إعادة تعيين كلمة المرور.');
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccess('');
    setShowPassword(false);
  }

  if (!firebaseReady) return <>{children}</>;

  if (loading) {
    return <main className="userAuthPage"><div className="userAuthLoading">جارٍ التحقق من الحساب...</div></main>;
  }

  if (!user) {
    return <main className="userAuthPage" dir="rtl">
      <div className="userAuthGlow" aria-hidden="true" />
      <div className="userAuthBackdrop" aria-hidden="true">
        <span className="userAuthCarShape" />
        <span className="userAuthDune userAuthDuneOne" />
        <span className="userAuthDune userAuthDuneTwo" />
        <span className="userAuthPalm" />
      </div>

      <div className="userAuthShell">
        <div className="userAuthBrand" aria-label="MauriOne">
          <span><b>Mauri</b><i>One</i></span>
        </div>

        <section className="userAuthCard">
          <div className="userAuthIcon">{mode === 'signup' ? <UserPlus/> : <UserRound/>}</div>
          <h1>{mode === 'signup' ? 'إنشاء حساب' : 'تسجيل الدخول'}</h1>
          <p>{mode === 'signup' ? 'أنشئ حسابك للوصول إلى MauriOne ومتابعة السيارات.' : 'مرحبًا بعودتك! سجّل دخولك لمتابعة أفضل العروض.'}</p>

          <form onSubmit={submit}>
            {mode === 'signup' && <label className="userAuthField">
              <span>الاسم الكامل</span>
              <div className="userAuthInputWrap">
                <UserRound/>
                <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} autoComplete="name" placeholder="الاسم الكامل"/>
              </div>
            </label>}

            <label className="userAuthField">
              <span>البريد الإلكتروني</span>
              <div className="userAuthInputWrap">
                <Mail/>
                <input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} autoComplete="email" placeholder="البريد الإلكتروني"/>
              </div>
            </label>

            <label className="userAuthField">
              <span>كلمة المرور</span>
              <div className="userAuthInputWrap userAuthPasswordWrap">
                <LockKeyhole/>
                <input type={showPassword ? 'text' : 'password'} minLength="6" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder="كلمة المرور"/>
                <button type="button" className="userAuthEye" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}>
                  {showPassword ? <EyeOff/> : <Eye/>}
                </button>
              </div>
            </label>

            {mode === 'login' && <button type="button" className="userAuthForgot" onClick={resetPassword} disabled={busy}>نسيت كلمة المرور؟</button>}

            {error && <div className="userAuthError">{error}</div>}
            {success && <div className="userAuthSuccess">{success}</div>}

            <button className="userAuthPrimary" disabled={busy}>
              {mode === 'login' && <LogIn/>}
              <span>{busy ? 'جارٍ التنفيذ...' : mode === 'signup' ? 'إنشاء الحساب' : 'دخول'}</span>
            </button>
          </form>

          <div className="userAuthDivider"><span>أو</span></div>
          <button className="userAuthSwitch" onClick={switchMode}>
            {mode === 'login' ? <><span>ليس لديك حساب؟</span> <b>أنشئ حسابًا</b></> : <><span>لديك حساب؟</span> <b>سجّل الدخول</b></>}
          </button>
        </section>
      </div>
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
