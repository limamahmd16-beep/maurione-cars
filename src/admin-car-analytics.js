import { auth, db } from './lib/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';

const STYLE_ID='mx-admin-car-analytics-style';
const PANEL_CLASS='mxAdminCarAnalytics';
const stats=new Map();
const cars=new Map();
let started=false;
let stopStats=null;
let stopCars=null;
let raf=0;

function num(value){
  return new Intl.NumberFormat('en-US').format(Number(value||0));
}

function score(row){
  return Number(row.whatsappClicks||0)*5+
    Number(row.phoneClicks||0)*4+
    Number(row.favoriteAdds||0)*2+
    Number(row.views||0);
}

function escapeHtml(value){
  return String(value||'').replace(/[&<>'"]/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[ch]));
}

function labelFor(id){
  const car=cars.get(id);
  if(!car)return id;
  return `${car.brand||''} ${car.model||''} ${car.year||''}`.trim()||id;
}

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .${PANEL_CLASS}{margin:0 0 14px;border:1px solid #e7e9ed;border-radius:22px;background:#fff;padding:16px;box-shadow:0 8px 26px rgba(15,23,42,.04)}
    .${PANEL_CLASS}Head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:12px}
    .${PANEL_CLASS}Head h2{margin:0;color:#111318;font-size:20px;font-weight:900}. ${PANEL_CLASS}Head span{font-size:11px;color:#90959d}
    .${PANEL_CLASS}Grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
    .${PANEL_CLASS}Card{min-height:82px;border:1px solid #eceef1;border-radius:16px;background:#fafbfc;padding:12px;display:flex;flex-direction:column;justify-content:center;gap:6px}
    .${PANEL_CLASS}Card span{font-size:11px;color:#777d86;font-weight:700;line-height:1.45}. ${PANEL_CLASS}Card strong{font-size:25px;line-height:1;color:#15171b;font-weight:900;direction:ltr;text-align:right}
    .${PANEL_CLASS}Card.accent{background:#fff7f2;border-color:#ffd8c4}. ${PANEL_CLASS}Card.accent strong{color:#ff5a12}
    .${PANEL_CLASS}Rank{margin-top:14px;padding-top:13px;border-top:1px solid #eef0f2}. ${PANEL_CLASS}Rank h3{margin:0 0 9px;font-size:14px;color:#22252a}
    .${PANEL_CLASS}Rows{display:grid;gap:7px}. ${PANEL_CLASS}Row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid #eceef1;border-radius:14px;padding:10px;background:#fff}
    .${PANEL_CLASS}Row strong{display:block;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#202328}. ${PANEL_CLASS}Row small{display:block;margin-top:3px;color:#91969e;font-size:9.5px}
    .${PANEL_CLASS}Chips{display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end}. ${PANEL_CLASS}Chips b{font-size:9px;padding:5px 7px;border-radius:999px;background:#f4f5f7;color:#666d76;white-space:nowrap}. ${PANEL_CLASS}Chips b.wa{background:#edf9f1;color:#168443}
    .${PANEL_CLASS}Empty{padding:16px 8px;text-align:center;color:#9297a0;font-size:12px}
    @media(max-width:620px){.${PANEL_CLASS}Grid{grid-template-columns:1fr 1fr}. ${PANEL_CLASS}Row{grid-template-columns:1fr}. ${PANEL_CLASS}Chips{justify-content:flex-start}}
  `.replaceAll('. mx','.mx');
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
        <div class="${PANEL_CLASS}Head"><h2>تفاعل العملاء مع السيارات</h2><span>إحصائيات فعلية</span></div>
        <div class="${PANEL_CLASS}Grid">
          <div class="${PANEL_CLASS}Card" data-car-stat="views"><span>مشاهدات السيارات</span><strong>0</strong></div>
          <div class="${PANEL_CLASS}Card accent" data-car-stat="whatsapp"><span>ضغطات واتساب</span><strong>0</strong></div>
          <div class="${PANEL_CLASS}Card" data-car-stat="phone"><span>ضغطات الاتصال</span><strong>0</strong></div>
          <div class="${PANEL_CLASS}Card" data-car-stat="favorites"><span>إضافات المفضلة</span><strong>0</strong></div>
        </div>
        <div class="${PANEL_CLASS}Rank"><h3>السيارات الأكثر اهتمامًا</h3><div class="${PANEL_CLASS}Rows"></div></div>`;
      const visitorPanel=admin.querySelector('.mxAdminVisitorStats');
      const actions=admin.querySelector('.mxAdminActions');
      if(visitorPanel)visitorPanel.insertAdjacentElement('afterend',panel);
      else if(actions)actions.insertAdjacentElement('afterend',panel);
      else admin.querySelector('.mxAdminInner')?.prepend(panel);
    }

    const rows=[...stats.entries()]
      .filter(([id])=>cars.has(id))
      .map(([id,data])=>({id,...data}));

    const total=rows.reduce((acc,row)=>{
      acc.views+=Number(row.views||0);
      acc.whatsapp+=Number(row.whatsappClicks||0);
      acc.phone+=Number(row.phoneClicks||0);
      acc.favorites+=Number(row.favoriteAdds||0);
      return acc;
    },{views:0,whatsapp:0,phone:0,favorites:0});

    panel.querySelector('[data-car-stat="views"] strong').textContent=num(total.views);
    panel.querySelector('[data-car-stat="whatsapp"] strong').textContent=num(total.whatsapp);
    panel.querySelector('[data-car-stat="phone"] strong').textContent=num(total.phone);
    panel.querySelector('[data-car-stat="favorites"] strong').textContent=num(total.favorites);

    const list=panel.querySelector(`.${PANEL_CLASS}Rows`);
    const ranked=rows.filter(row=>score(row)>0).sort((a,b)=>score(b)-score(a)).slice(0,6);
    if(!ranked.length){
      list.innerHTML=`<div class="${PANEL_CLASS}Empty">ستظهر البيانات هنا بعد أول تفاعل مع السيارات.</div>`;
      return;
    }

    list.innerHTML=ranked.map(row=>`
      <div class="${PANEL_CLASS}Row">
        <div><strong>${escapeHtml(labelFor(row.id))}</strong><small>درجة الاهتمام: ${num(score(row))}</small></div>
        <div class="${PANEL_CLASS}Chips">
          <b>${num(row.views)} مشاهدة</b>
          <b class="wa">${num(row.whatsappClicks)} واتساب</b>
          <b>${num(row.phoneClicks)} اتصال</b>
          <b>${num(row.favoriteAdds)} مفضلة</b>
        </div>
      </div>`).join('');
  });
}

function start(){
  if(started||!db||!auth?.currentUser||!document.querySelector('.mxAdmin'))return;
  started=true;

  stopStats=onSnapshot(collection(db,'carStats'),snapshot=>{
    stats.clear();
    snapshot.forEach(item=>{
      if(!item.id.startsWith('visitor-'))stats.set(item.id,item.data()||{});
    });
    render();
  },error=>console.warn('[MauriOne admin car analytics] stats read blocked',error?.code||error));

  stopCars=onSnapshot(collection(db,'cars'),snapshot=>{
    cars.clear();
    snapshot.forEach(item=>cars.set(item.id,item.data()||{}));
    render();
  },error=>console.warn('[MauriOne admin car analytics] cars read blocked',error?.code||error));

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
window.addEventListener('beforeunload',()=>{stopStats?.();stopCars?.();});
