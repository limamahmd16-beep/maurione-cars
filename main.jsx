import React from 'react';
import ReactDOM from 'react-dom/client';

import('./src/i18n.js').then(module=>module.initI18n?.()).catch(error=>console.error('I18N_BOOT_ERROR',error));
import('./src/i18n-content-fix.js').then(module=>module.initI18nContentFix?.()).catch(error=>console.error('I18N_CONTENT_FIX_ERROR',error));

try{
  if(!window.location.pathname.startsWith('/admin')&&localStorage.getItem('maurione_admin_preview_home')==='1'){
    localStorage.removeItem('maurione_admin_preview_home');
    window.history.replaceState({},'', '/');
  }
}catch{}

const rootElement=document.getElementById('root');
const root=ReactDOM.createRoot(rootElement);
const isAdminPath=window.location.pathname==='/admin'||window.location.pathname.startsWith('/admin/');

const bootCss=`
html,body,#root{min-height:100%;margin:0;background:#fff}
.mxBootState{min-height:100vh;min-height:100dvh;display:grid;place-items:center;background:#fff;color:#777d86;direction:rtl;text-align:center;padding:24px;box-sizing:border-box;font:700 15px Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.mxBootErrorCard{width:min(100%,420px);border:1px solid #eceef1;border-radius:24px;padding:26px 22px;background:#fff;box-shadow:0 18px 50px rgba(15,23,42,.08)}
.mxBootErrorCard strong{display:block;color:#17191d;font-size:21px;margin-bottom:8px}.mxBootErrorCard span{display:block;font-weight:500;line-height:1.7}.mxBootErrorCard button{margin-top:18px;height:48px;padding:0 22px;border:0;border-radius:14px;background:#ff5a12;color:#fff;font-size:15px;font-weight:900}
`;

function BootState({admin=false}){
  return <div className="mxBootState"><style>{bootCss}</style>{admin?'جارٍ فتح لوحة التحكم...':'جارٍ فتح MauriOne...'}</div>;
}

function showBootError(error){
  console.error('MAURIONE_BOOT_ERROR',error);
  root.render(<div className="mxBootState"><style>{bootCss}</style><div className="mxBootErrorCard"><strong>تعذر تحميل الصفحة</strong><span>حدث خطأ أثناء تشغيل الواجهة. أعد المحاولة.</span><button onClick={()=>window.location.reload()}>إعادة المحاولة</button></div></div>);
}

async function loadStyles(){
  await Promise.all([
    import('./src/styles.css'),
    import('./src/premium.css'),
    import('./src/brand-fix.css'),
    import('./src/exact.css'),
    import('./src/no-messages.css'),
    import('./src/functional-enhancer.css'),
    import('./src/auth-final.css'),
    import('./src/guest-login.css'),
    import('./src/auth-approved.css'),
    import('./src/welcome.css'),
    import('./src/whatsapp-detail.css'),
    import('./src/navigation-refine.css'),
    import('./src/detail-premium.css'),
    import('./src/header-compact.css'),
    import('./src/dark-mode.css'),
  ]);
  await import('./src/responsive-universal.css');
  await import('./src/detail-viewport-fit.css');
  await import('./src/home-card-compact.css');
  await import('./src/i18n-fit.css');
  await import('./src/i18n-content-fix.css');
}

async function bootAdmin(){
  root.render(<BootState admin/>);
  await loadStyles();
  const {default:AdminEntry}=await import('./src/AdminEntry.jsx');
  root.render(<React.StrictMode><AdminEntry/></React.StrictMode>);
}

async function bootPublicSite(){
  root.render(<BootState/>);
  await Promise.all([import('./src/theme-bootstrap.js'),loadStyles()]);
  const [appModule,enhancerModule,safeModule,whatsappModule,darkModule]=await Promise.all([
    import('./src/AppExact.jsx'),
    import('./src/functional-enhancer.jsx'),
    import('./src/SafeEntry.jsx'),
    import('./src/GlobalWhatsApp.jsx'),
    import('./src/DarkModeController.jsx'),
  ]);
  const AppExact=appModule.default;
  const FunctionalEnhancer=enhancerModule.default;
  const SafeEntry=safeModule.default;
  const GlobalWhatsApp=whatsappModule.default;
  const DarkModeController=darkModule.default;

  root.render(
    <React.StrictMode>
      <SafeEntry>
        <AppExact/>
        <FunctionalEnhancer/>
      </SafeEntry>
      <DarkModeController/>
      <GlobalWhatsApp/>
    </React.StrictMode>
  );

  Promise.all([
    import('./src/private-admin-guard.js'),
    import('./src/car-analytics.js'),
    import('./src/site-visitor-tracker.js'),
    import('./src/user-profile-sync.js'),
    import('./src/phone-copy-fix.js'),
    import('./src/car-reference-public.js'),
    import('./src/home-scroll-reset.js'),
  ]).catch(error=>console.error('PUBLIC_HELPER_ERROR',error));
}

(isAdminPath?bootAdmin():bootPublicSite()).catch(showBootError);
