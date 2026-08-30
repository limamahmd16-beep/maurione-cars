import { auth, db } from './lib/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';

const STYLE_ID='mx-admin-visitor-stats-style';
const PANEL_CLASS='mxAdminVisitorStats';
let stopStats=null;
let started=false;
let raf=0;
const totals={views:0,whatsapp:0,favorites:0};

function num(value){
  return new Intl.NumberFormat('en-US').format(Number(value||0));
}

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .${PANEL_CLASS}{margin:0 0 14px;border:1px solid #e7e9ed;border-radius:22px;background:#fff;padding:16px;box-shadow:0 8px 26px rgba(15,23,42,.04)}
    .${PANEL_CLASS}Head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:12px}
    .${PANEL_CLASS}Head h2{margin:0;color:#111318;font-size:20px;font-weight:900}
    .${PANEL_CLASS}Head span{font-size:11px;color:#90959d}
    .${PANEL_CLASS}Grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
    .${PANEL_CLASS}Card{min-height:78px;border:1px solid #eceef1;border-radius:16px;background:#fafbfc;padding:12px;display:flex;flex-direction:column;justify-content:center;gap:5px}
    .${PANEL_CLASS}Card span{font-size:11px;color:#777d86;font-weight:700;line-height:1.45}
    .${PANEL_CLASS}Card strong{font-size:24px;line-height:1;color:#15171b;font-weight:900;direction:ltr;text-align:right}
    .${PANEL_CLASS}Card.accent{background:#fff7f2;border-color:#ffd8c4}
    .${PANEL_CLASS}Card.accent strong{color:#ff5a12}
    @media(max-width:520px){.${PANEL_CLASS}Grid{grid-template-columns:1fr 1fr}.${PANEL_CLASS}Card:first-child{grid-column:1/-1}}
  `;
  document.head.appendChild(style);
}

function render(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{
    const admin=document.querySelector('.mxAdmin');
    if(!admin)return;
    ensureStyle();

    let panel=admin.querySelector(`.${PANEL_CLASS}`);
    if(!panel){
      panel=document.createElement('section');
      panel.className=PANEL_CLASS;
      panel.innerHTML=`
        <div class="${PANEL_CLASS}Head"><h2>إحصائيات الزوار</h2><span>بيانات فعلية</span></div>
        <div class="${PANEL_CLASS}Grid">
          <div class="${PANEL_CLASS}Card" data-visitor-stat="views"><span>مشاهدات الإعلانات</span><strong>0</strong></div>
          <div class="${PANEL_CLASS}Card accent" data-visitor-stat="whatsapp"><span>ضغطات واتساب</span><strong>0</strong></div>
          <div class="${PANEL_CLASS}Card" data-visitor-stat="favorites"><span>إضافات المفضلة</span><strong>0</strong></div>
        </div>`;
      const actions=admin.querySelector('.mxAdminActions');
      const firstPanel=admin.querySelector('.mxPanel');
      if(actions)actions.insertAdjacentElement('afterend',panel);
      else if(firstPanel)firstPanel.insertAdjacentElement('beforebegin',panel);
      else admin.querySelector('.mxAdminInner')?.prepend(panel);
    }

    panel.querySelector('[data-visitor-stat="views"] strong').textContent=num(totals.views);
    panel.querySelector('[data-visitor-stat="whatsapp"] strong').textContent=num(totals.whatsapp);
    panel.querySelector('[data-visitor-stat="favorites"] strong').textContent=num(totals.favorites);
  });
}

function start(){
  if(started||!db||!auth?.currentUser)return;
  if(!document.querySelector('.mxAdmin'))return;
  started=true;
  stopStats=onSnapshot(collection(db,'carStats'),snapshot=>{
    totals.views=0;
    totals.whatsapp=0;
    totals.favorites=0;
    snapshot.forEach(item=>{
      const data=item.data()||{};
      totals.views+=Number(data.views||0);
      totals.whatsapp+=Number(data.whatsappClicks||0);
      totals.favorites+=Number(data.favoriteAdds||0);
    });
    render();
  },error=>{
    console.warn('[MauriOne admin visitor stats] read blocked',error?.code||error?.message||error);
    render();
  });
  render();
}

function schedule(){
  if(document.querySelector('.mxAdmin')){
    start();
    render();
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();

const observer=new MutationObserver(schedule);
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('beforeunload',()=>stopStats?.());
