import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/styles.css';
import './src/premium.css';
import './src/brand-fix.css';
import './src/exact.css';
import './src/dark-mode.css';
import './src/responsive-universal.css';
import './src/admin-dark-polish.css';

const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';
const THEME_KEY='maurione_admin_theme';
const ALL_PERMISSIONS={dashboardView:true,analyticsView:true,carsView:true,carsCreate:true,carsEdit:true,carsMarkSold:true,carsDelete:true,usersView:true,socialExport:true};

function resolveTheme(){
  try{
    const saved=localStorage.getItem(THEME_KEY);
    if(saved==='dark'||saved==='light')return saved;
    if(saved==='system')return window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light';
  }catch{}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light';
}

function applyAdminTheme(){
  const theme=resolveTheme();
  document.documentElement.dataset.theme=theme;
  document.documentElement.style.colorScheme=theme;
  document.body.style.background=theme==='dark'?'#0d0f12':'#fff';
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',theme==='dark'?'#0d0f12':'#ffffff');
  const scheme=document.querySelector('meta[name="color-scheme"]');
  if(scheme)scheme.setAttribute('content','light dark');
  return theme;
}

applyAdminTheme();

const pageStyle={minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'var(--mx-admin-access-bg,#fff)',fontFamily:'Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',boxSizing:'border-box'};
const cardStyle={width:'min(100%,430px)',padding:'30px 24px 24px',border:'1px solid #eceef1',borderRadius:28,background:'#fff',boxShadow:'0 20px 60px rgba(15,23,42,.10)',textAlign:'center',boxSizing:'border-box'};
const inputStyle={boxSizing:'border-box',width:'100%',height:52,border:'1px solid #dfe3e8',borderRadius:15,padding:'0 15px',fontSize:16,background:'#fff',color:'#111',outline:'none',textAlign:'right'};
const buttonStyle={width:'100%',height:52,border:0,borderRadius:15,background:'#ff5a12',color:'#fff',fontSize:17,fontWeight:900,cursor:'pointer'};

const simpleAdminCss=`
  body{background:#f6f7f8!important}
  .mxAdminTitle,.mxMetrics,.mxAdminQuick,.mxAdminV3Overview{display:none!important}
  .mxAdminInner>.mxPanel ~ .mxPanel{display:none!important}
  .mxAdminInner{width:min(calc(100% - 22px),760px)!important;padding-bottom:32px!important}
  .mxAdminActions{margin:18px 0!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}
  .mxAdminActions button{min-height:52px!important;border-radius:16px!important}
  .mxPanel{margin-top:0!important}
  .mxPanelHead{padding-bottom:12px!important}
  .mxPanelHead h2{font-size:22px!important}
  .mxAdminList{gap:10px!important}
  .mxAdminList article{border-radius:18px!important}
  .mxAdminLoginTabs{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:5px;background:#f3f4f6;border-radius:14px;margin:0 0 17px}
  .mxAdminLoginTabs button{height:40px;border:0;border-radius:10px;background:transparent;color:#777d86;font-size:13px;font-weight:900;cursor:pointer}
  .mxAdminLoginTabs button.active{background:#fff;color:#f05e28;box-shadow:0 3px 12px rgba(15,23,42,.07)}
  .mxAdminAccessCard input[dir='ltr']{text-align:left!important}
  html[data-theme='dark']{--mx-admin-access-bg:#0d0f12}
  html[data-theme='dark'] .mxAdminAccessPage{background:#0d0f12!important}
  html[data-theme='dark'] .mxAdminAccessCard{background:#15181c!important;border-color:#30353c!important;box-shadow:0 20px 60px rgba(0,0,0,.4)!important}
  html[data-theme='dark'] .mxAdminAccessCard h1{color:#f5f6f7!important}
  html[data-theme='dark'] .mxAdminAccessCard p{color:#9ca3ad!important}
  html[data-theme='dark'] .mxAdminAccessCard input{background:#111419!important;border-color:#343a42!important;color:#f5f6f7!important}
  html[data-theme='dark'] .mxAdminLoginTabs{background:#111419!important}
  html[data-theme='dark'] .mxAdminLoginTabs button.active{background:#23272d!important;color:#ff7a3d!important;box-shadow:none!important}
  @media(max-width:520px){
    .mxAdminInner{width:min(calc(100% - 18px),760px)!important}
    .mxAdminActions{grid-template-columns:1fr!important}
  }
  @media(min-width:700px){
    .mxAdminHeader{padding-left:max(28px,calc((100vw - 1120px)/2))!important;padding-right:max(28px,calc((100vw - 1120px)/2))!important}
    .mxAdminInner{width:min(calc(100% - 56px),1040px)!important;padding-top:24px!important;padding-bottom:40px!important}
    .mxAdminActions{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}
    .mxPanel{padding:18px!important;border-radius:22px!important}
    .mxPanelHead h2{font-size:24px!important}
    .mxAdminList{gap:12px!important}
    .mxAdminList article{min-height:112px!important;padding:13px!important;border-radius:20px!important;grid-template-columns:84px minmax(0,1fr) auto!important}
    .mxAdminThumb{width:78px!important;height:78px!important;border-radius:15px!important;overflow:hidden!important}
    .mxAdminInfo strong{font-size:17px!important}
    .mxAdminInfo span{font-size:13px!important}
    .mxAdminInfo b{font-size:16px!important}
  }
  @media(min-width:1200px){.mxAdminInner{width:min(calc(100% - 80px),1120px)!important}}
`;

function Logo(){
  return <div className="mxAdminAccessLogo" style={{fontSize:34,lineHeight:1,fontWeight:900,direction:'ltr',marginBottom:28,letterSpacing:'-1.5px'}}><span style={{color:'var(--mx-logo-main,#090909)'}}>Mauri</span><span style={{color:'#ff5a12'}}>One</span></div>;
}

function AdminAccess({children}){
  const [state,setState]=React.useState({loading:true,allowed:false,profile:null});
  const [mode,setMode]=React.useState('owner');
  const [email,setEmail]=React.useState('');
  const [username,setUsername]=React.useState('');
  const [password,setPassword]=React.useState('');
  const [busy,setBusy]=React.useState(false);
  const [error,setError]=React.useState('');
  const servicesRef=React.useRef(null);

  React.useEffect(()=>{
    let active=true;
    let unsubscribe=()=>{};

    document.title='لوحة التحكم | MauriOne';
    applyAdminTheme();

    const onStorage=event=>{if(event.key===THEME_KEY)applyAdminTheme()};
    window.addEventListener('storage',onStorage);

    (async()=>{
      try{
        const [firebaseModule,authModule,firestoreModule]=await Promise.all([
          import('./src/lib/firebase.js'),
          import('firebase/auth'),
          import('firebase/firestore'),
        ]);
        if(!active)return;
        const {auth,db,firebaseReady}=firebaseModule;
        if(!firebaseReady||!auth||!db){
          setState({loading:false,allowed:false,profile:null});
          setError('تعذر الاتصال بخدمة تسجيل الدخول.');
          return;
        }
        servicesRef.current={auth,db,...authModule,...firestoreModule};

        const verifyUser=async user=>{
          if(!active)return;
          if(!user||user.isAnonymous){
            window.__MAURIONE_ADMIN_CONTEXT__=null;
            setState({loading:false,allowed:false,profile:null});
            return;
          }
          if(user.uid===OWNER_UID){
            const profile={uid:user.uid,isOwner:true,displayName:user.displayName||'المالك',permissions:ALL_PERMISSIONS,active:true};
            window.__MAURIONE_ADMIN_CONTEXT__=profile;
            setState({loading:false,allowed:true,profile});
            return;
          }
          try{
            const snap=await firestoreModule.getDoc(firestoreModule.doc(db,'admins',user.uid));
            const data=snap.exists()?snap.data():null;
            if(!data||data.type!=='staff'||data.active===false){
              await authModule.signOut(auth).catch(()=>{});
              window.__MAURIONE_ADMIN_CONTEXT__=null;
              setState({loading:false,allowed:false,profile:null});
              setError('هذا الحساب غير مفعّل للوصول إلى لوحة التحكم.');
              return;
            }
            const profile={uid:user.uid,isOwner:false,displayName:data.displayName||user.displayName||data.username||'موظف',username:data.username||'',role:data.role||'موظف',permissions:{dashboardView:true,...(data.permissions||{})},active:true};
            window.__MAURIONE_ADMIN_CONTEXT__=profile;
            setState({loading:false,allowed:true,profile});
          }catch(err){
            console.warn('Staff permission verification failed',err);
            setState({loading:false,allowed:false,profile:null});
            setError('تعذر التحقق من صلاحيات الحساب.');
          }
        };

        unsubscribe=authModule.onAuthStateChanged(auth,user=>{void verifyUser(user)},()=>{
          if(!active)return;
          setState({loading:false,allowed:false,profile:null});
          setError('تعذر التحقق من جلسة تسجيل الدخول.');
        });
      }catch(err){
        console.error('MauriOne admin auth bootstrap failed',err);
        if(!active)return;
        setState({loading:false,allowed:false,profile:null});
        setError('تعذر تشغيل خدمة تسجيل الدخول. أعد تحميل الصفحة.');
      }
    })();

    return()=>{
      active=false;
      window.removeEventListener('storage',onStorage);
      try{unsubscribe()}catch{}
    };
  },[]);

  React.useEffect(()=>{
    if(!state.allowed)return;
    document.body.classList.remove('mxAdminV3Page');
    document.getElementById('mx-admin-v3-style')?.remove();
    document.querySelectorAll('.mxAdminV3Overview').forEach(node=>node.remove());
    const permissions=state.profile?.permissions||{};
    import('./src/admin-permissions.js').catch(error=>console.warn('Admin permission UI failed',error));
    if(state.profile?.isOwner||permissions.analyticsView)import('./src/admin-visitor-stats.js').catch(error=>console.warn('Admin visitor stats failed',error));
    import('./src/admin-car-page.js').catch(error=>console.warn('Admin car page failed',error));
    if(state.profile?.isOwner||permissions.socialExport)import('./src/admin-social-export.js').catch(error=>console.warn('Admin social exporter failed',error));
    if(state.profile?.isOwner||permissions.usersView)import('./src/admin-users.js').catch(error=>console.warn('Admin user directory failed',error));
    import('./src/admin-car-reference.js').catch(error=>console.warn('Admin car reference failed',error));
  },[state.allowed,state.profile]);

  async function submit(event){
    event.preventDefault();
    const services=servicesRef.current;
    if(!services){setError('خدمة تسجيل الدخول لم تجهز بعد. أعد المحاولة.');return}
    const {auth,signInWithEmailAndPassword,signInWithCustomToken,signOut}=services;
    setBusy(true);setError('');
    try{
      if(auth.currentUser)await signOut(auth).catch(()=>{});
      if(mode==='owner'){
        const credential=await signInWithEmailAndPassword(auth,email.trim(),password);
        if(credential.user?.uid!==OWNER_UID){await signOut(auth);throw new Error('NOT_OWNER')}
      }else{
        const response=await fetch('/api/staff-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username.trim(),password})});
        const data=await response.json().catch(()=>({ok:false,error:'INVALID_RESPONSE'}));
        if(!response.ok||!data.ok||!data.customToken){
          if(data.error==='ACCOUNT_DISABLED')throw new Error('STAFF_DISABLED');
          if(data.error==='ACCOUNT_TEMPORARILY_LOCKED')throw new Error('STAFF_LOCKED');
          if(data.error==='STAFF_AUTH_NOT_CONFIGURED')throw new Error('STAFF_NOT_CONFIGURED');
          throw new Error('STAFF_INVALID');
        }
        await signInWithCustomToken(auth,data.customToken);
      }
    }catch(err){
      const code=err?.message;
      if(code==='NOT_OWNER')setError('هذا الحساب غير مصرح له كمالك.');
      else if(code==='STAFF_DISABLED')setError('تم إيقاف هذا الحساب من قِبل المالك.');
      else if(code==='STAFF_LOCKED')setError('تم قفل الحساب مؤقتًا بسبب محاولات دخول متكررة.');
      else if(code==='STAFF_NOT_CONFIGURED')setError('خدمة دخول الفريق لم تُفعّل على الخادم بعد.');
      else setError(mode==='owner'?'البريد الإلكتروني أو كلمة المرور غير صحيحة.':'اسم المستخدم أو كلمة المرور غير صحيحة.');
    }finally{setBusy(false)}
  }

  if(state.loading){
    return <main className="mxAdminAccessPage" dir="rtl" style={pageStyle}><section className="mxAdminAccessCard" style={cardStyle}><Logo/><h1 style={{fontSize:24,margin:'0 0 8px',color:'#111'}}>لوحة التحكم</h1><p style={{margin:0,color:'#777d86',fontSize:14}}>جارٍ تشغيل لوحة التحكم...</p></section></main>;
  }

  if(!state.allowed){
    return <main className="mxAdminAccessPage" dir="rtl" style={pageStyle}>
      <section className="mxAdminAccessCard" style={cardStyle}>
        <Logo/>
        <h1 style={{fontSize:26,margin:'0 0 8px',color:'#111',fontWeight:900}}>لوحة التحكم</h1>
        <p style={{margin:'0 0 18px',color:'#777d86',fontSize:14,lineHeight:1.7}}>{mode==='owner'?'دخول المالك':'دخول أعضاء الفريق'}</p>
        <div className="mxAdminLoginTabs"><button type="button" className={mode==='owner'?'active':''} onClick={()=>{setMode('owner');setError('');setPassword('')}}>المالك</button><button type="button" className={mode==='staff'?'active':''} onClick={()=>{setMode('staff');setError('');setPassword('')}}>الفريق</button></div>
        <form onSubmit={submit} style={{display:'grid',gap:12}}>
          {mode==='owner'?<input aria-label="البريد الإلكتروني" type="email" autoComplete="username" placeholder="البريد الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)} required style={inputStyle}/>:<input aria-label="اسم المستخدم" dir="ltr" type="text" autoCapitalize="none" autoCorrect="off" autoComplete="username" placeholder="اسم المستخدم" value={username} onChange={e=>setUsername(e.target.value)} required style={inputStyle}/>} 
          <input aria-label="كلمة المرور" dir="ltr" type="password" autoComplete="current-password" placeholder="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} required style={inputStyle}/>
          <button type="submit" disabled={busy} style={{...buttonStyle,opacity:busy?0.65:1}}>{busy?'جارٍ التحقق...':'تسجيل الدخول'}</button>
        </form>
        <div style={{minHeight:22,marginTop:10,color:'#c62828',fontSize:13,fontWeight:700,lineHeight:1.55}}>{error}</div>
        <a href="/" style={{display:'inline-block',marginTop:8,color:'#737982',fontSize:13,textDecoration:'none'}}>العودة إلى الموقع</a>
      </section>
    </main>;
  }

  return <><style>{simpleAdminCss}</style>{children}</>;
}

const AdminApp=React.lazy(()=>import('./src/AppExact.jsx'));

class AdminCrashBoundary extends React.Component{
  constructor(props){super(props);this.state={error:null}}
  static getDerivedStateFromError(error){return{error}}
  componentDidCatch(error){console.error('MauriOne admin render failed',error)}
  render(){
    if(this.state.error){
      return <main className="mxAdminAccessPage" dir="rtl" style={pageStyle}><section className="mxAdminAccessCard" style={cardStyle}><Logo/><h1 style={{fontSize:23,margin:'0 0 10px',color:'#111'}}>تعذر فتح لوحة التحكم</h1><p style={{margin:'0 0 18px',color:'#747982',lineHeight:1.7,fontSize:14}}>تعذر تحميل مكوّن من اللوحة. اضغط إعادة التحميل.</p><button onClick={()=>window.location.reload()} style={buttonStyle}>إعادة التحميل</button></section></main>;
    }
    return this.props.children;
  }
}

function DashboardLoader(){
  return <main className="mxAdminAccessPage" dir="rtl" style={pageStyle}><section className="mxAdminAccessCard" style={cardStyle}><Logo/><h1 style={{fontSize:24,margin:'0 0 8px',color:'#111'}}>لوحة التحكم</h1><p style={{margin:0,color:'#777d86',fontSize:14}}>جارٍ تحميل بيانات اللوحة...</p></section></main>;
}

const root=document.getElementById('root');
if(root){
  root.replaceChildren();
  ReactDOM.createRoot(root).render(
    <React.StrictMode><AdminCrashBoundary><AdminAccess><React.Suspense fallback={<DashboardLoader/>}><AdminApp/></React.Suspense></AdminAccess></AdminCrashBoundary></React.StrictMode>
  );
}
