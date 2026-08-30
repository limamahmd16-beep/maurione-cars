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
  .mxAdminAccess{min-height:100vh;min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;background:#f7f7f8;direction:rtl;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  .mxAdminAccessCard{width:min(100%,420px);box-sizing:border-box;background:#fff;border:1px solid #e8eaee;border-radius:20px;padding:28px 22px 22px;box-shadow:0 8px 30px rgba(15,23,42,.07);text-align:center}
  .mxAdminAccessLogo{direction:ltr;font-size:32px;line-height:1;font-weight:900;letter-spacing:-1.5px;margin-bottom:24px}.mxAdminAccessLogo b{color:#090909}.mxAdminAccessLogo i{color:#ff5a12;font-style:normal}
  .mxAdminAccessCard h1{margin:0 0 6px;color:#111318;font-size:24px;font-weight:900}.mxAdminAccessCard p{margin:0 0 21px;color:#7a8089;font-size:13px;line-height:1.7}
  .mxAdminAccessForm{display:grid;gap:10px}.mxAdminAccessForm input{height:50px;box-sizing:border-box;border:1px solid #dfe3e8;border-radius:12px;background:#fff;color:#111;padding:0 14px;font-size:16px;text-align:right;outline:none}.mxAdminAccessForm input:focus{border-color:#ff7a3d;box-shadow:0 0 0 3px rgba(255,90,18,.08)}
  .mxAdminAccessForm button,.mxAdminRetry{height:50px;border:0;border-radius:12px;background:#ff5a12;color:#fff;font-size:15px;font-weight:900;cursor:pointer}.mxAdminAccessForm button:disabled{opacity:.6}
  .mxAdminAccessError{min-height:22px;margin-top:10px;color:#c62828;font-size:13px;font-weight:700;line-height:1.6}.mxAdminAccessSuccess{min-height:22px;margin-top:10px;color:#16713e;font-size:13px;font-weight:700;line-height:1.6}
  .mxAdminAccessLinks{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:10px}.mxAdminAccessLinks button,.mxAdminAccessLinks a{border:0;background:none;padding:5px;color:#747a83;font-size:12px;text-decoration:none;cursor:pointer}
  .mxAdminBoot{min-height:100vh;min-height:100dvh;display:grid;place-items:center;background:#fff;color:#777d86;direction:rtl;font:700 15px Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}

  /* Simple private admin dashboard. Public MauriOne styles are untouched. */
  .mxAdmin{min-height:100vh!important;background:#f7f7f8!important;padding-bottom:28px!important}
  .mxAdmin .mxAdminHeader{height:68px!important;min-height:68px!important;padding:0 16px!important;background:#fff!important;border-bottom:1px solid #eceef1!important;box-shadow:none!important}
  .mxAdmin .mxAdminHeader .mxBrandSub{display:none!important}
  .mxAdmin .mxAdminHeader .mxBrandWord{font-size:25px!important}
  .mxAdmin .mxAdminHeader>div:last-child span{display:none!important}
  .mxAdmin .mxAdminInner{width:min(100% - 28px,720px)!important;margin:0 auto!important;padding:20px 0 0!important}
  .mxAdmin .mxAdminTitle{margin:0 0 16px!important;padding:0!important}
  .mxAdmin .mxAdminTitle>span,.mxAdmin .mxAdminTitle>p{display:none!important}
  .mxAdmin .mxAdminTitle h1{margin:0!important;font-size:24px!important;line-height:1.25!important;color:#17191d!important}
  .mxAdmin .mxAdminTitle h1::after{content:'إدارة السيارات';display:block;margin-top:5px;color:#858b94;font-size:13px;font-weight:600}

  .mxAdmin .mxMetrics{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;margin:0 0 12px!important}
  .mxAdmin .mxMetric{min-height:76px!important;padding:13px!important;border:1px solid #e8eaee!important;border-radius:14px!important;background:#fff!important;box-shadow:none!important}
  .mxAdmin .mxMetric:nth-child(n+3){display:none!important}
  .mxAdmin .mxMetric>span{width:36px!important;height:36px!important;border-radius:10px!important}
  .mxAdmin .mxMetric strong{font-size:22px!important}
  .mxAdmin .mxMetric em{display:none!important}

  .mxAdmin .mxAdminActions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;margin:0 0 14px!important}
  .mxAdmin .mxAdminActions button{height:48px!important;border-radius:12px!important;box-shadow:none!important;font-size:14px!important}
  .mxAdmin .mxAdminActions button:first-child{background:#ff5a12!important;color:#fff!important;border-color:#ff5a12!important}
  .mxAdmin .mxAdminActions button:last-child{background:#fff!important;color:#25282d!important;border:1px solid #e2e5e9!important}

  .mxAdmin .mxPanel{margin:0!important;padding:0!important;border:1px solid #e8eaee!important;border-radius:16px!important;background:#fff!important;box-shadow:none!important;overflow:hidden!important}
  .mxAdmin .mxPanel:nth-of-type(n+2){display:none!important}
  .mxAdmin .mxPanelHead{padding:14px 15px!important;border-bottom:1px solid #eef0f2!important;margin:0!important}
  .mxAdmin .mxPanelHead h2{font-size:17px!important;margin:0!important}
  .mxAdmin .mxPanelHead span{font-size:12px!important}
  .mxAdmin .mxAdminList{display:grid!important;gap:0!important}
  .mxAdmin .mxAdminList article{display:grid!important;grid-template-columns:68px minmax(0,1fr) auto!important;align-items:center!important;gap:11px!important;padding:12px 14px!important;border:0!important;border-bottom:1px solid #f0f1f3!important;border-radius:0!important;background:#fff!important;box-shadow:none!important}
  .mxAdmin .mxAdminList article:last-child{border-bottom:0!important}
  .mxAdmin .mxAdminThumb{width:68px!important;height:58px!important;border-radius:10px!important;overflow:hidden!important}
  .mxAdmin .mxAdminThumb img{width:100%!important;height:100%!important;object-fit:cover!important}
  .mxAdmin .mxAdminInfo{min-width:0!important}
  .mxAdmin .mxAdminInfo strong{display:block!important;font-size:14px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .mxAdmin .mxAdminInfo span{font-size:11px!important;color:#8a9098!important}
  .mxAdmin .mxAdminInfo b{font-size:13px!important;color:#ff5a12!important}
  .mxAdmin .mxState{grid-column:3!important;grid-row:1!important;font-size:10px!important;padding:5px 8px!important;border-radius:999px!important;align-self:start!important}
  .mxAdmin .mxRowButtons{grid-column:2 / 4!important;display:flex!important;justify-content:flex-end!important;gap:7px!important;margin-top:-2px!important}
  .mxAdmin .mxRowButtons button{height:34px!important;min-width:34px!important;padding:0 10px!important;border-radius:9px!important;box-shadow:none!important}
  .mxAdmin .mxRowButtons button svg{width:16px!important;height:16px!important}
  .mxAdmin .mxAdminQuick,.mxAdmin .mxAnalyticsPanel{display:none!important}

  .mxAdmin .mxModal{background:rgba(15,23,42,.28)!important;backdrop-filter:none!important}
  .mxAdmin .mxEditor{width:min(100% - 20px,620px)!important;max-height:calc(100dvh - 20px)!important;border-radius:16px!important;box-shadow:0 12px 40px rgba(15,23,42,.14)!important;padding:18px!important}
  .mxAdmin .mxEditorHead{margin-bottom:14px!important}
  .mxAdmin .mxEditorHead h2{font-size:20px!important}
  .mxAdmin .mxEditorGrid{gap:10px!important}
  .mxAdmin .mxEditor label{font-size:12px!important}
  .mxAdmin .mxEditor input,.mxAdmin .mxEditor select,.mxAdmin .mxEditor textarea{border-radius:10px!important;border-color:#e0e3e7!important;box-shadow:none!important}
  .mxAdmin .mxUpload{border-radius:11px!important}
  .mxAdmin .mxEditorActions button{height:46px!important;border-radius:11px!important}

  @media(max-width:520px){
    .mxAdmin .mxAdminInner{width:calc(100% - 20px)!important;padding-top:14px!important}
    .mxAdmin .mxAdminHeader{height:62px!important;min-height:62px!important;padding:0 10px!important}
    .mxAdmin .mxAdminTitle h1{font-size:21px!important}
    .mxAdmin .mxAdminActions{grid-template-columns:1fr!important}
    .mxAdmin .mxAdminList article{grid-template-columns:62px minmax(0,1fr) auto!important;padding:11px!important;gap:9px!important}
    .mxAdmin .mxAdminThumb{width:62px!important;height:54px!important}
    .mxAdmin .mxEditor{width:calc(100% - 12px)!important;max-height:calc(100dvh - 12px)!important;border-radius:14px!important;padding:14px!important}
    .mxAdmin .mxEditorGrid{grid-template-columns:1fr!important}
  }
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
  return <AdminErrorBoundary><style>{css}</style><AppExact/></AdminErrorBoundary>;
}
