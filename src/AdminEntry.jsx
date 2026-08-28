import React, { useEffect, useState } from 'react';
import AppExact from './AppExact.jsx';
import { auth, firebaseReady } from './lib/firebase.js';
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

const OWNER_UID = 'sC94v8XaXmUMHK6eineEy25GIst2';

const css = `
  html,body,#root{min-height:100%;margin:0;background:#f7f7f8}
  .mxAdminAccess{min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;background:linear-gradient(180deg,#fff 0%,#f6f7f9 100%);direction:rtl;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  .mxAdminAccessCard{width:min(100%,420px);box-sizing:border-box;background:#fff;border:1px solid #e8eaee;border-radius:28px;padding:30px 24px 24px;box-shadow:0 20px 60px rgba(15,23,42,.10);text-align:center}
  .mxAdminAccessLogo{direction:ltr;font-size:35px;line-height:1;font-weight:900;letter-spacing:-1.7px;margin-bottom:26px}.mxAdminAccessLogo b{color:#090909}.mxAdminAccessLogo i{color:#ff5a12;font-style:normal}
  .mxAdminAccessCard h1{margin:0 0 8px;color:#111318;font-size:26px;font-weight:900}.mxAdminAccessCard p{margin:0 0 23px;color:#7a8089;font-size:14px;line-height:1.7}
  .mxAdminAccessForm{display:grid;gap:12px}.mxAdminAccessForm input{height:52px;box-sizing:border-box;border:1px solid #dfe3e8;border-radius:15px;background:#fff;color:#111;padding:0 15px;font-size:16px;text-align:right;outline:none}.mxAdminAccessForm input:focus{border-color:#ff7a3d;box-shadow:0 0 0 3px rgba(255,90,18,.10)}
  .mxAdminAccessForm button,.mxAdminRetry{height:52px;border:0;border-radius:15px;background:#ff5a12;color:#fff;font-size:16px;font-weight:900;cursor:pointer}.mxAdminAccessForm button:disabled{opacity:.6}
  .mxAdminAccessError{min-height:22px;margin-top:10px;color:#c62828;font-size:13px;font-weight:700;line-height:1.6}.mxAdminAccessSuccess{min-height:22px;margin-top:10px;color:#16713e;font-size:13px;font-weight:700;line-height:1.6}
  .mxAdminAccessLinks{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:12px}.mxAdminAccessLinks button,.mxAdminAccessLinks a{border:0;background:none;padding:5px;color:#747a83;font-size:12px;text-decoration:none;cursor:pointer}
  .mxAdminBoot{min-height:100vh;min-height:100dvh;display:grid;place-items:center;background:#fff;color:#777d86;direction:rtl;font:700 15px Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
`;

function AccessScreen({ initialError = '' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!auth) return;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (credential.user?.uid !== OWNER_UID) {
        await signOut(auth);
        setError('هذا الحساب غير مصرح له بالدخول إلى لوحة التحكم.');
      }
    } catch (err) {
      const code = err?.code || '';
      if (code === 'auth/too-many-requests') setError('تمت محاولات كثيرة. حاول مرة أخرى بعد قليل.');
      else setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    const value = email.trim();
    setError('');
    setSuccess('');
    if (!value) {
      setError('أدخل بريدك الإلكتروني أولًا.');
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, value);
      setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.');
    } catch {
      setError('تعذر إرسال رابط إعادة تعيين كلمة المرور.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="mxAdminAccess">
    <style>{css}</style>
    <section className="mxAdminAccessCard">
      <div className="mxAdminAccessLogo"><b>Mauri</b><i>One</i></div>
      <h1>لوحة التحكم</h1>
      <p>تسجيل دخول المالك فقط</p>
      <form className="mxAdminAccessForm" onSubmit={submit}>
        <input type="email" autoComplete="username" inputMode="email" placeholder="البريد الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input type="password" autoComplete="current-password" placeholder="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="submit" disabled={busy}>{busy?'جارٍ التحقق...':'تسجيل الدخول'}</button>
      </form>
      {error && <div className="mxAdminAccessError">{error}</div>}
      {success && <div className="mxAdminAccessSuccess">{success}</div>}
      <div className="mxAdminAccessLinks">
        <button type="button" onClick={resetPassword} disabled={busy}>نسيت كلمة المرور؟</button>
        <a href="/">العودة إلى الموقع</a>
      </div>
    </section>
  </main>;
}

class AdminErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={failed:false}}
  static getDerivedStateFromError(){return{failed:true}}
  componentDidCatch(error){console.error('ADMIN_RENDER_ERROR',error)}
  render(){
    if(!this.state.failed)return this.props.children;
    return <main className="mxAdminAccess"><style>{css}</style><section className="mxAdminAccessCard"><div className="mxAdminAccessLogo"><b>Mauri</b><i>One</i></div><h1>تعذر فتح لوحة التحكم</h1><p>حدث خطأ أثناء تحميل الواجهة.</p><button className="mxAdminRetry" onClick={()=>window.location.reload()}>إعادة المحاولة</button></section></main>;
  }
}

export default function AdminEntry(){
  const [state,setState]=useState({loading:true,user:null,error:''});

  useEffect(()=>{
    document.title='لوحة التحكم | MauriOne';
    document.documentElement.dataset.theme='light';
    document.documentElement.style.colorScheme='light';
    document.body.style.background='#fff';

    if(!firebaseReady||!auth){
      setState({loading:false,user:null,error:'تعذر الاتصال بخدمة تسجيل الدخول.'});
      return undefined;
    }

    return onAuthStateChanged(auth,async user=>{
      if(user?.isAnonymous){
        try{await signOut(auth)}catch{}
        setState({loading:false,user:null,error:''});
        return;
      }
      if(user && user.uid!==OWNER_UID){
        try{await signOut(auth)}catch{}
        setState({loading:false,user:null,error:'هذا الحساب غير مصرح له بالدخول إلى لوحة التحكم.'});
        return;
      }
      setState({loading:false,user:user||null,error:''});
    },()=>setState({loading:false,user:null,error:'تعذر التحقق من جلسة الدخول.'}));
  },[]);

  if(state.loading)return <div className="mxAdminBoot"><style>{css}</style>جارٍ فتح لوحة التحكم...</div>;
  if(!state.user)return <AccessScreen initialError={state.error}/>;
  return <AdminErrorBoundary><AppExact/></AdminErrorBoundary>;
}
