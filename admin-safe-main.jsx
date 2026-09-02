import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/styles.css';
import './src/premium.css';
import './src/brand-fix.css';
import './src/exact.css';
import './src/dark-mode.css';
import './src/responsive-universal.css';
import './src/admin-dark-polish.css';
import {auth,db,firebaseReady} from './src/lib/firebase.js';
import {onAuthStateChanged,signInWithEmailAndPassword,signInWithCustomToken,signOut} from 'firebase/auth';
import {doc,getDoc} from 'firebase/firestore';
import AppExact from './src/AppExact.jsx';

const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';
const ALL_PERMISSIONS={dashboardView:true,analyticsView:true,carsView:true,carsCreate:true,carsEdit:true,carsMarkSold:true,carsDelete:true,usersView:true,socialExport:true};
const THEME_KEY='maurione_admin_theme';

function applyTheme(){
  let choice='system';
  try{const saved=localStorage.getItem(THEME_KEY);if(['light','dark','system'].includes(saved))choice=saved}catch{}
  const dark=choice==='dark'||(choice==='system'&&window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  const theme=dark?'dark':'light';
  document.documentElement.dataset.theme=theme;
  document.documentElement.style.colorScheme=theme;
  document.body.style.background=dark?'#0d0f12':'#fff';
}
applyTheme();

const css=`
html,body,#root{min-height:100%;margin:0}
.mxSafeAccess{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px;box-sizing:border-box;background:#f6f7f8;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.mxSafeCard{width:min(100%,430px);padding:30px 24px 24px;box-sizing:border-box;border:1px solid #e7eaee;border-radius:28px;background:#fff;box-shadow:0 20px 60px rgba(15,23,42,.10);text-align:center}
.mxSafeLogo{font-size:34px;font-weight:950;direction:ltr;letter-spacing:-1.5px;margin-bottom:24px}.mxSafeLogo b{color:#0b0d10}.mxSafeLogo i{color:#f4662d;font-style:normal}
.mxSafeCard h1{margin:0 0 7px;font-size:25px;color:#111820}.mxSafeCard p{margin:0 0 18px;color:#7c8490;font-size:13px;line-height:1.6}
.mxSafeTabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:5px;background:#f1f3f5;border-radius:13px;margin-bottom:14px}.mxSafeTabs button{height:40px;border:0;border-radius:9px;background:transparent;color:#707984;font-weight:900}.mxSafeTabs button.on{background:#fff;color:#ed642b;box-shadow:0 3px 12px rgba(15,23,42,.06)}
.mxSafeForm{display:grid;gap:11px}.mxSafeForm input{width:100%;height:50px;box-sizing:border-box;border:1px solid #dfe4e9;border-radius:14px;padding:0 14px;background:#fff;color:#12171d;font-size:16px;outline:none;text-align:left}.mxSafeForm button{height:50px;border:0;border-radius:14px;background:#f4662d;color:#fff;font-size:15px;font-weight:950}.mxSafeForm button:disabled{opacity:.55}
.mxSafeError{padding:10px 12px;border-radius:12px;background:#fff2f0;color:#9e4138;border:1px solid #efcac5;font-size:11px;line-height:1.5}
.mxSafeLoading{display:grid;gap:9px;justify-items:center;color:#6f7781}.mxSafeSpinner{width:28px;height:28px;border:3px solid #eceff2;border-top-color:#f4662d;border-radius:50%;animation:mxspin .8s linear infinite}@keyframes mxspin{to{transform:rotate(360deg)}}
html[data-theme='dark'] .mxSafeAccess{background:#0d0f12}html[data-theme='dark'] .mxSafeCard{background:#15181c;border-color:#30353c;box-shadow:0 20px 60px rgba(0,0,0,.38)}html[data-theme='dark'] .mxSafeLogo b,html[data-theme='dark'] .mxSafeCard h1{color:#f5f6f7}html[data-theme='dark'] .mxSafeCard p{color:#9ca3ad}html[data-theme='dark'] .mxSafeTabs{background:#101318}html[data-theme='dark'] .mxSafeTabs button.on{background:#252a31;color:#ff824e}html[data-theme='dark'] .mxSafeForm input{background:#111419;border-color:#343a42;color:#f5f6f7}
`;

function setContext(profile){window.__MAURIONE_ADMIN_CONTEXT__=profile||null}

async function verify(user){
  if(!user||user.isAnonymous)return null;
  if(user.uid===OWNER_UID)return{uid:user.uid,isOwner:true,displayName:user.displayName||'Proprietário',permissions:ALL_PERMISSIONS,active:true};
  const snap=await getDoc(doc(db,'admins',user.uid));
  const data=snap.exists()?snap.data():null;
  if(!data||data.type!=='staff'||data.active===false)return null;
  return{uid:user.uid,isOwner:false,displayName:data.displayName||user.displayName||data.username||'Membro da equipa',username:data.username||'',role:data.role||'Membro da equipa',permissions:{dashboardView:true,...(data.permissions||{})},active:true};
}

function loadAdminModules(profile){
  const p=profile?.permissions||{};
  import('./src/admin-permissions.js').catch(()=>{});
  if(profile?.isOwner||p.analyticsView)import('./src/admin-visitor-stats.js').catch(()=>{});
  import('./src/admin-car-page.js').catch(()=>{});
  if(profile?.isOwner||p.socialExport)import('./src/admin-social-export.js').catch(()=>{});
  if(profile?.isOwner||p.usersView)import('./src/admin-users.js').catch(()=>{});
  import('./src/admin-car-reference.js').catch(()=>{});
}

function Access(){
  const[status,setStatus]=React.useState('checking');
  const[profile,setProfile]=React.useState(null);
  const[mode,setMode]=React.useState('owner');
  const[email,setEmail]=React.useState('');
  const[username,setUsername]=React.useState('');
  const[password,setPassword]=React.useState('');
  const[busy,setBusy]=React.useState(false);
  const[error,setError]=React.useState('');

  React.useEffect(()=>{
    document.title='Painel de controlo | MauriOne';
    if(!firebaseReady||!auth||!db){setStatus('login');setError('Não foi possível iniciar a autenticação.');return}
    let alive=true,settled=false;
    const finish=async user=>{
      if(!alive)return;
      try{
        const next=await verify(user);
        if(!alive)return;
        settled=true;
        if(next){setContext(next);setProfile(next);setStatus('ready');loadAdminModules(next)}
        else{setContext(null);setStatus('login')}
      }catch(err){console.warn('ADMIN_VERIFY_FAILED',err);settled=true;if(alive){setContext(null);setStatus('login');setError('Não foi possível verificar a sessão. Inicie sessão novamente.')}}
    };
    const unsub=onAuthStateChanged(auth,user=>{void finish(user)},()=>{if(alive){settled=true;setStatus('login');setError('Não foi possível verificar a sessão.')}});
    const timer=setTimeout(()=>{
      if(!alive||settled)return;
      const current=auth.currentUser;
      if(current)void finish(current);else{setContext(null);setStatus('login');setError('A verificação demorou demasiado. Inicie sessão para continuar.')}
    },4500);
    return()=>{alive=false;clearTimeout(timer);try{unsub()}catch{}};
  },[]);

  async function submit(e){
    e.preventDefault();setBusy(true);setError('');
    try{
      if(auth.currentUser)await signOut(auth).catch(()=>{});
      let user=null;
      if(mode==='owner'){
        const c=await signInWithEmailAndPassword(auth,email.trim(),password);user=c.user;
        if(user?.uid!==OWNER_UID){await signOut(auth).catch(()=>{});throw new Error('NOT_OWNER')}
      }else{
        const r=await fetch('/api/staff-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username.trim(),password})});
        const data=await r.json().catch(()=>({}));
        if(!r.ok||!data.customToken)throw new Error(data.error||'STAFF_LOGIN_FAILED');
        const c=await signInWithCustomToken(auth,data.customToken);user=c.user;
      }
      const next=await verify(user);
      if(!next)throw new Error('NOT_ALLOWED');
      setContext(next);setProfile(next);setStatus('ready');loadAdminModules(next);
    }catch(err){
      console.warn('ADMIN_LOGIN_FAILED',err);
      const code=String(err?.message||'');
      if(code==='STAFF_AUTH_NOT_CONFIGURED')setError('O acesso da equipa ainda não está configurado no servidor.');
      else if(code==='ACCOUNT_DISABLED')setError('Esta conta está desativada.');
      else if(code==='ACCOUNT_TEMPORARILY_LOCKED')setError('A conta está temporariamente bloqueada.');
      else setError(mode==='owner'?'E-mail ou palavra-passe incorretos.':'Nome de utilizador ou palavra-passe incorretos.');
    }finally{setBusy(false)}
  }

  if(status==='checking')return <main className="mxSafeAccess"><style>{css}</style><section className="mxSafeCard"><div className="mxSafeLogo"><b>Mauri</b><i>One</i></div><div className="mxSafeLoading"><span className="mxSafeSpinner"/><strong>A verificar acesso…</strong><small>Esta verificação não ficará bloqueada.</small></div></section></main>;
  if(status==='ready'&&profile)return <><style>{css}</style><AppExact/></>;
  return <main className="mxSafeAccess"><style>{css}</style><section className="mxSafeCard"><div className="mxSafeLogo"><b>Mauri</b><i>One</i></div><h1>Painel de controlo</h1><p>Acesso seguro à administração MauriOne.</p><div className="mxSafeTabs"><button type="button" className={mode==='owner'?'on':''} onClick={()=>{setMode('owner');setError('')}}>Proprietário</button><button type="button" className={mode==='team'?'on':''} onClick={()=>{setMode('team');setError('')}}>Equipa</button></div><form className="mxSafeForm" onSubmit={submit}>{mode==='owner'?<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="E-mail" autoComplete="username" required/>:<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Nome de utilizador" autoComplete="username" required/>}<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Palavra-passe" autoComplete="current-password" required/>{error&&<div className="mxSafeError">{error}</div>}<button disabled={busy}>{busy?'A entrar…':'Entrar'}</button></form></section></main>;
}

const root=document.getElementById('root');
if(root){root.replaceChildren();ReactDOM.createRoot(root).render(<Access/>)}
