import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/styles.css';
import './src/premium.css';
import './src/brand-fix.css';
import './src/exact.css';
import './src/dark-mode.css';

const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';

const pageStyle={minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#fff',fontFamily:'Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',boxSizing:'border-box'};
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
  @media(max-width:520px){
    .mxAdminInner{width:min(calc(100% - 18px),760px)!important}
    .mxAdminActions{grid-template-columns:1fr!important}
  }
`;

function Logo(){
  return <div style={{fontSize:34,lineHeight:1,fontWeight:900,direction:'ltr',marginBottom:28,letterSpacing:'-1.5px'}}><span style={{color:'#090909'}}>Mauri</span><span style={{color:'#ff5a12'}}>One</span></div>;
}

function AdminAccess({children}){
  const [state,setState]=React.useState({loading:true,allowed:false});
  const [email,setEmail]=React.useState('');
  const [password,setPassword]=React.useState('');
  const [busy,setBusy]=React.useState(false);
  const [error,setError]=React.useState('');
  const servicesRef=React.useRef(null);

  React.useEffect(()=>{
    let active=true;
    let unsubscribe=()=>{};

    document.title='لوحة التحكم | MauriOne';
    document.documentElement.dataset.theme='light';
    document.documentElement.style.colorScheme='light';
    document.body.style.background='#fff';

    (async()=>{
      try{
        const [firebaseModule,authModule]=await Promise.all([
          import('./src/lib/firebase.js'),
          import('firebase/auth')
        ]);
        if(!active)return;
        const {auth,firebaseReady}=firebaseModule;
        if(!firebaseReady||!auth){
          setState({loading:false,allowed:false});
          setError('تعذر الاتصال بخدمة تسجيل الدخول.');
          return;
        }
        servicesRef.current={auth,...authModule};
        unsubscribe=authModule.onAuthStateChanged(auth,user=>{
          if(!active)return;
          const allowed=Boolean(user&&!user.isAnonymous&&user.uid===OWNER_UID);
          setState({loading:false,allowed});
        },()=>{
          if(!active)return;
          setState({loading:false,allowed:false});
          setError('تعذر التحقق من جلسة تسجيل الدخول.');
        });
      }catch(err){
        console.error('MauriOne admin auth bootstrap failed',err);
        if(!active)return;
        setState({loading:false,allowed:false});
        setError('تعذر تشغيل خدمة تسجيل الدخول. أعد تحميل الصفحة.');
      }
    })();

    return()=>{
      active=false;
      try{unsubscribe()}catch{}
    };
  },[]);

  React.useEffect(()=>{
    if(!state.allowed)return;
    document.body.classList.remove('mxAdminV3Page');
    document.getElementById('mx-admin-v3-style')?.remove();
    document.querySelectorAll('.mxAdminV3Overview').forEach(node=>node.remove());
    import('./src/admin-visitor-stats.js').catch(error=>console.warn('Admin visitor stats failed',error));
    import('./src/admin-car-page.js').catch(error=>console.warn('Admin car page failed',error));
    import('./src/admin-social-export.js').catch(error=>console.warn('Admin social exporter failed',error));
    import('./src/admin-users.js').catch(error=>console.warn('Admin user directory failed',error));
  },[state.allowed]);

  async function submit(event){
    event.preventDefault();
    const services=servicesRef.current;
    if(!services){
      setError('خدمة تسجيل الدخول لم تجهز بعد. أعد المحاولة.');
      return;
    }
    const {auth,signInWithEmailAndPassword,signOut}=services;
    setBusy(true);
    setError('');
    try{
      if(auth.currentUser&&auth.currentUser.uid!==OWNER_UID){
        await signOut(auth);
      }
      const credential=await signInWithEmailAndPassword(auth,email.trim(),password);
      if(credential.user?.uid!==OWNER_UID){
        await signOut(auth);
        throw new Error('NOT_OWNER');
      }
      setState({loading:false,allowed:true});
    }catch(err){
      setError(err?.message==='NOT_OWNER'?'هذا الحساب غير مصرح له بالدخول.':'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    }finally{
      setBusy(false);
    }
  }

  if(state.loading){
    return <main dir="rtl" style={pageStyle}><section style={cardStyle}><Logo/><h1 style={{fontSize:24,margin:'0 0 8px',color:'#111'}}>لوحة التحكم</h1><p style={{margin:0,color:'#777d86',fontSize:14}}>جارٍ تشغيل لوحة التحكم...</p></section></main>;
  }

  if(!state.allowed){
    return <main dir="rtl" style={pageStyle}>
      <section style={cardStyle}>
        <Logo/>
        <h1 style={{fontSize:26,margin:'0 0 8px',color:'#111',fontWeight:900}}>لوحة التحكم</h1>
        <p style={{margin:'0 0 24px',color:'#777d86',fontSize:14,lineHeight:1.7}}>تسجيل دخول المالك فقط</p>
        <form onSubmit={submit} style={{display:'grid',gap:12}}>
          <input aria-label="البريد الإلكتروني" type="email" autoComplete="username" placeholder="البريد الإلكتروني" value={email} onChange={e=>setEmail(e.target.value)} required style={inputStyle}/>
          <input aria-label="كلمة المرور" type="password" autoComplete="current-password" placeholder="كلمة المرور" value={password} onChange={e=>setPassword(e.target.value)} required style={inputStyle}/>
          <button type="submit" disabled={busy} style={{...buttonStyle,opacity:busy?0.65:1}}>{busy?'جارٍ التحقق...':'تسجيل الدخول'}</button>
        </form>
        <div style={{minHeight:22,marginTop:10,color:'#c62828',fontSize:13,fontWeight:700}}>{error}</div>
        <a href="/" style={{display:'inline-block',marginTop:8,color:'#737982',fontSize:13,textDecoration:'none'}}>العودة إلى الموقع</a>
      </section>
    </main>;
  }

  return <><style>{simpleAdminCss}</style>{children}</>;
}

const AdminApp=React.lazy(()=>import('./src/AppExact.jsx'));

class AdminCrashBoundary extends React.Component{
  constructor(props){super(props);this.state={error:null};}
  static getDerivedStateFromError(error){return{error};}
  componentDidCatch(error){console.error('MauriOne admin render failed',error);}
  render(){
    if(this.state.error){
      return <main dir="rtl" style={pageStyle}>
        <section style={cardStyle}>
          <Logo/>
          <h1 style={{fontSize:23,margin:'0 0 10px',color:'#111'}}>تعذر فتح لوحة التحكم</h1>
          <p style={{margin:'0 0 18px',color:'#747982',lineHeight:1.7,fontSize:14}}>تعذر تحميل مكوّن من اللوحة. اضغط إعادة التحميل.</p>
          <button onClick={()=>window.location.reload()} style={buttonStyle}>إعادة التحميل</button>
        </section>
      </main>;
    }
    return this.props.children;
  }
}

function DashboardLoader(){
  return <main dir="rtl" style={pageStyle}><section style={cardStyle}><Logo/><h1 style={{fontSize:24,margin:'0 0 8px',color:'#111'}}>لوحة التحكم</h1><p style={{margin:0,color:'#777d86',fontSize:14}}>جارٍ تحميل بيانات اللوحة...</p></section></main>;
}

const root=document.getElementById('root');
if(root){
  root.replaceChildren();
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AdminCrashBoundary>
        <AdminAccess>
          <React.Suspense fallback={<DashboardLoader/>}>
            <AdminApp/>
          </React.Suspense>
        </AdminAccess>
      </AdminCrashBoundary>
    </React.StrictMode>
  );
}
