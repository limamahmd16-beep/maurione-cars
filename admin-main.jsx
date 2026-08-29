import React from 'react';
import ReactDOM from 'react-dom/client';
import AppExact from './src/AppExact.jsx';
import './src/styles.css';
import './src/premium.css';
import './src/brand-fix.css';
import './src/exact.css';
import './src/dark-mode.css';
import './src/private-admin-guard.js';
import './src/admin-insights-v3.js';

function AdminCrashBoundary({children}){
  const [error,setError]=React.useState(null);
  React.useEffect(()=>{
    const onError=(event)=>setError(event?.error||new Error(event?.message||'ADMIN_ERROR'));
    const onReject=(event)=>setError(event?.reason instanceof Error?event.reason:new Error(String(event?.reason||'ADMIN_ERROR')));
    window.addEventListener('error',onError);
    window.addEventListener('unhandledrejection',onReject);
    return()=>{
      window.removeEventListener('error',onError);
      window.removeEventListener('unhandledrejection',onReject);
    };
  },[]);

  if(error){
    return <main dir="rtl" style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#fff',fontFamily:'Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <section style={{width:'min(100%,430px)',padding:26,border:'1px solid #eceef1',borderRadius:24,boxShadow:'0 18px 50px rgba(15,23,42,.08)',textAlign:'center'}}>
        <div style={{fontSize:30,fontWeight:900,direction:'ltr',marginBottom:18}}><span style={{color:'#111'}}>Mauri</span><span style={{color:'#ff5a12'}}>One</span></div>
        <h1 style={{fontSize:23,margin:'0 0 10px',color:'#111'}}>تعذر فتح لوحة التحكم</h1>
        <p style={{margin:'0 0 18px',color:'#747982',lineHeight:1.7,fontSize:14}}>حدث خطأ في تشغيل اللوحة. أعد تحميل الصفحة مرة واحدة.</p>
        <button onClick={()=>window.location.reload()} style={{width:'100%',height:50,border:0,borderRadius:14,background:'#ff5a12',color:'#fff',fontSize:16,fontWeight:900}}>إعادة التحميل</button>
      </section>
    </main>;
  }
  return children;
}

const root=document.getElementById('root');
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AdminCrashBoundary>
      <AppExact />
    </AdminCrashBoundary>
  </React.StrictMode>
);
