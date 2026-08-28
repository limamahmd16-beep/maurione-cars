import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/theme-bootstrap.js';
import AppExact from './src/AppExact.jsx';
import FunctionalEnhancer from './src/functional-enhancer.jsx';
import SafeEntry from './src/SafeEntry.jsx';
import GlobalWhatsApp from './src/GlobalWhatsApp.jsx';
import DarkModeController from './src/DarkModeController.jsx';
import './src/styles.css';
import './src/premium.css';
import './src/brand-fix.css';
import './src/exact.css';
import './src/no-messages.css';
import './src/functional-enhancer.css';
import './src/auth-final.css';
import './src/guest-login.css';
import './src/auth-approved.css';
import './src/welcome.css';
import './src/whatsapp-detail.css';
import './src/navigation-refine.css';
import './src/detail-premium.css';
import './src/header-compact.css';
import './src/dark-mode.css';

const adminV2Css=`
body.mxAdminV2Page{background:#f4f5f7!important}
body.mxAdminV2Page .mxGlobalWhatsApp{display:none!important}
.mxAdminV2Page .mxAdmin{background:linear-gradient(180deg,#f6f7f9 0,#f3f4f6 100%)!important;padding-bottom:108px!important}
.mxAdminV2Page .mxAdminHeader{position:sticky!important;top:0!important;z-index:95!important;height:82px!important;padding:7px 16px!important;background:rgba(255,255,255,.94)!important;backdrop-filter:blur(18px)!important;border-bottom:1px solid #e8eaee!important}
.mxAdminV2Page .mxAdminHeader>button{width:40px!important;height:40px!important;border-radius:14px!important}
.mxAdminV2Page .mxAdminHeader .mxBrandWord{font-size:25px!important}
.mxAdminV2Page .mxAdminInner{width:min(calc(100% - 22px),860px)!important;padding-top:16px!important}
.mxAdminV2Page .mxAdminTitle{position:relative!important;padding:20px 20px 18px!important;margin-bottom:14px!important;border:1px solid #e7e9ed!important;border-radius:24px!important;background:linear-gradient(135deg,#fff 0%,#fff8f4 100%)!important;box-shadow:0 10px 30px rgba(15,23,42,.05)!important;overflow:hidden!important}
.mxAdminV2Page .mxAdminTitle:after{content:'';position:absolute;left:-24px;top:-36px;width:120px;height:120px;border-radius:50%;background:rgba(255,90,18,.055)}
.mxAdminV2Page .mxAdminTitle>span{font-size:12px!important;letter-spacing:.1px!important}
.mxAdminV2Page .mxAdminTitle h1{font-size:32px!important;margin:5px 0 4px!important}
.mxAdminV2Page .mxAdminTitle p{font-size:13px!important;margin-bottom:0!important}
.mxAdminV2Status{display:inline-flex;align-items:center;gap:7px;margin-top:13px;padding:7px 10px;border-radius:999px;background:#f0faf3;color:#16713e;font-size:11px;font-weight:800}
.mxAdminV2Status i{width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.1)}
.mxAdminV2Page .mxMetrics{gap:10px!important}
.mxAdminV2Page .mxMetric{min-height:118px!important;border-radius:22px!important;padding:15px!important;box-shadow:0 8px 22px rgba(15,23,42,.045)!important}
.mxAdminV2Page .mxMetric>span{width:46px!important;height:46px!important;border-radius:15px!important}
.mxAdminV2Page .mxMetric strong{font-size:27px!important}
.mxAdminV2Page .mxAdminActions{margin:14px 0 16px!important;gap:10px!important}
.mxAdminV2Page .mxAdminActions button{height:54px!important;border-radius:16px!important;font-size:14px!important}
.mxAdminV2Page .mxPanel{border-radius:24px!important;padding:16px!important;margin-top:14px!important;box-shadow:0 8px 26px rgba(15,23,42,.04)!important}
.mxAdminV2Page .mxPanelHead{margin-bottom:14px!important}
.mxAdminV2Page .mxPanelHead h2{font-size:19px!important}
.mxAdminV2Tools{display:grid;gap:10px;margin:-2px 0 14px}
.mxAdminV2Search{height:48px;border:1px solid #e1e4e8;border-radius:15px;background:#f9fafb;display:flex;align-items:center;gap:9px;padding:0 13px}
.mxAdminV2Search svg{width:19px;height:19px;color:#7a8089;flex:none}
.mxAdminV2Search input{width:100%;border:0!important;outline:0!important;background:transparent!important;color:#111!important;text-align:right!important;font-size:14px!important;box-shadow:none!important}
.mxAdminV2Search input::placeholder{color:#9a9fa7}
.mxAdminV2Filters{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.mxAdminV2Filters button{height:40px;border:1px solid #e2e5e9;border-radius:12px;background:#fff;color:#666c75;font-size:12px;font-weight:800}
.mxAdminV2Filters button.on{border-color:#ffb28c;background:#fff4ed;color:#ff5a12}
.mxAdminV2Page .mxAdminList{gap:10px!important}
.mxAdminV2Page .mxAdminList article{border-radius:17px!important;padding:10px!important;background:#fff!important;box-shadow:0 4px 13px rgba(15,23,42,.035)!important}
.mxAdminV2Page .mxAdminThumb{border-radius:13px!important;overflow:hidden!important}
.mxAdminV2Page .mxRowButtons button{border-radius:10px!important}
.mxAdminV2NoResults{display:none;padding:22px 12px;text-align:center;color:#8b9098;font-size:13px}
.mxAdminV2Page .mxAdminQuick{left:12px!important;right:12px!important;bottom:max(10px,env(safe-area-inset-bottom))!important;border-radius:22px!important;background:rgba(255,255,255,.96)!important;backdrop-filter:blur(18px)!important;box-shadow:0 14px 36px rgba(15,23,42,.14)!important}
@media(min-width:720px){.mxAdminV2Page .mxMetrics{grid-template-columns:repeat(4,1fr)!important}.mxAdminV2Tools{grid-template-columns:1fr 300px;align-items:center}.mxAdminV2Filters{grid-column:2}}
html[data-theme='dark'] body.mxAdminV2Page{background:#0d0f12!important}
html[data-theme='dark'] .mxAdminV2Page .mxAdmin{background:linear-gradient(180deg,#0d0f12,#111419)!important;color:#f4f5f7!important}
html[data-theme='dark'] .mxAdminV2Page .mxAdminHeader{background:rgba(15,17,21,.94)!important;border-color:#282c33!important}
html[data-theme='dark'] .mxAdminV2Page .mxAdminTitle{background:linear-gradient(135deg,#171a1f,#1c1715)!important;border-color:#2a2e35!important;box-shadow:none!important}
html[data-theme='dark'] .mxAdminV2Page .mxAdminTitle h1,html[data-theme='dark'] .mxAdminV2Page .mxPanelHead h2{color:#f7f7f8!important}
html[data-theme='dark'] .mxAdminV2Page .mxAdminTitle p{color:#a4a8af!important}
html[data-theme='dark'] .mxAdminV2Page .mxMetric,html[data-theme='dark'] .mxAdminV2Page .mxPanel,html[data-theme='dark'] .mxAdminV2Page .mxAdminList article{background:#171a1f!important;border-color:#2a2e35!important;box-shadow:none!important}
html[data-theme='dark'] .mxAdminV2Search{background:#111419!important;border-color:#2a2e35!important}
html[data-theme='dark'] .mxAdminV2Search input{color:#f6f7f8!important}
html[data-theme='dark'] .mxAdminV2Filters button{background:#171a1f;color:#b7bbc2;border-color:#30343b}
html[data-theme='dark'] .mxAdminV2Filters button.on{background:#2a1a13;color:#ff7a3d;border-color:#744026}
html[data-theme='dark'] .mxAdminV2Page .mxAdminQuick{background:rgba(20,23,28,.96)!important;border-color:#30343b!important}
`;

function AdminDashboardV2(){
  React.useEffect(()=>{
    let query='';
    let status='all';
    let raf=0;

    if(!document.getElementById('mx-admin-v2-style')){
      const style=document.createElement('style');
      style.id='mx-admin-v2-style';
      style.textContent=adminV2Css;
      document.head.appendChild(style);
    }

    const setText=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text};

    const applyFilter=()=>{
      const list=document.querySelector('.mxAdmin .mxAdminList');
      if(!list)return;
      const rows=[...list.querySelectorAll(':scope > article')];
      let visible=0;
      rows.forEach(row=>{
        const text=(row.textContent||'').toLowerCase();
        const sold=Boolean(row.querySelector('.mxState.sold'));
        const matchText=!query||text.includes(query.toLowerCase());
        const matchStatus=status==='all'||(status==='sold'&&sold)||(status==='available'&&!sold);
        const show=matchText&&matchStatus;
        row.style.display=show?'':'none';
        if(show)visible++;
      });
      const panel=list.closest('.mxPanel');
      const count=panel?.querySelector('.mxPanelHead span');
      if(count)setText(count,String(visible));
      const empty=panel?.querySelector('.mxAdminV2NoResults');
      if(empty)empty.style.display=rows.length&&visible===0?'block':'none';
    };

    const enhance=()=>{
      const admin=document.querySelector('.mxAdmin');
      document.body.classList.toggle('mxAdminV2Page',Boolean(admin));
      if(!admin)return;

      const title=admin.querySelector('.mxAdminTitle');
      if(title&&!title.querySelector('.mxAdminV2Status')){
        const statusEl=document.createElement('div');
        statusEl.className='mxAdminV2Status';
        statusEl.innerHTML='<i></i><span>لوحة التحكم متصلة</span>';
        title.appendChild(statusEl);
      }

      const metrics=[...admin.querySelectorAll('.mxMetric')];
      const rows=[...admin.querySelectorAll('.mxAdminList > article')];
      const sold=rows.filter(row=>row.querySelector('.mxState.sold')).length;
      if(metrics[2]){
        setText(metrics[2].querySelector('small'),'المباعة');
        setText(metrics[2].querySelector('strong'),String(sold));
        setText(metrics[2].querySelector('em'),'تم بيعها');
      }
      if(metrics[3]){
        const inquiryPanel=[...admin.querySelectorAll('.mxPanel')].find(p=>(p.querySelector('h2')?.textContent||'').includes('الاستفسارات'));
        const raw=inquiryPanel?.querySelector('.mxPanelHead span')?.textContent||'0';
        const n=(raw.match(/\d+/)||['0'])[0];
        setText(metrics[3].querySelector('small'),'الاستفسارات');
        setText(metrics[3].querySelector('strong'),n);
        setText(metrics[3].querySelector('em'),'تحتاج للمتابعة');
      }

      const carPanel=[...admin.querySelectorAll('.mxPanel')].find(p=>(p.querySelector('h2')?.textContent||'').trim()==='السيارات');
      if(carPanel&&!carPanel.querySelector('.mxAdminV2Tools')){
        const tools=document.createElement('div');
        tools.className='mxAdminV2Tools';
        tools.innerHTML=`<label class="mxAdminV2Search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg><input type="search" placeholder="ابحث عن سيارة..." aria-label="البحث في السيارات"></label><div class="mxAdminV2Filters"><button type="button" data-status="all" class="on">الكل</button><button type="button" data-status="available">المتوفرة</button><button type="button" data-status="sold">المباعة</button></div>`;
        const head=carPanel.querySelector('.mxPanelHead');
        head?.insertAdjacentElement('afterend',tools);
        const input=tools.querySelector('input');
        input?.addEventListener('input',e=>{query=e.target.value.trim();applyFilter()});
        tools.querySelectorAll('[data-status]').forEach(button=>button.addEventListener('click',()=>{
          status=button.dataset.status||'all';
          tools.querySelectorAll('[data-status]').forEach(b=>b.classList.toggle('on',b===button));
          applyFilter();
        }));
        const noResults=document.createElement('div');
        noResults.className='mxAdminV2NoResults';
        noResults.textContent='لا توجد سيارات مطابقة للبحث.';
        carPanel.appendChild(noResults);
      }
      applyFilter();
    };

    const schedule=()=>{
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(enhance);
    };
    enhance();
    const observer=new MutationObserver(schedule);
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    window.addEventListener('popstate',schedule);
    return()=>{
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('popstate',schedule);
      document.body.classList.remove('mxAdminV2Page');
    };
  },[]);
  return null;
}

const isPrivateAdminPath=window.location.pathname==='/admin'||window.location.pathname.startsWith('/admin/');

// The private control panel bypasses the public welcome/auth gate completely.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isPrivateAdminPath ? (
      <AppExact />
    ) : (
      <SafeEntry>
        <AppExact />
        <FunctionalEnhancer />
      </SafeEntry>
    )}
    <DarkModeController />
    <AdminDashboardV2 />
    {!isPrivateAdminPath && <GlobalWhatsApp />}
  </React.StrictMode>
);
