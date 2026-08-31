import { db } from './lib/firebase.js';
import { collection, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';

const STYLE_ID='mx-admin-car-reference-style';
const PANEL_ID='mxAdminCarReference';
let cars=[];
let stopCars=null;
let backfilling=false;
let raf=0;

function normalizeRef(value=''){
  return String(value||'').trim().toUpperCase().replace(/\s+/g,'');
}

function formatRef(number){
  return `M1-${String(number).padStart(4,'0')}`;
}

function escapeHtml(value=''){
  return String(value||'').replace(/[&<>'"]/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[ch]));
}

function money(value){
  const n=Number(value||0);
  return n>0?`${new Intl.NumberFormat('en-US').format(n)} MRU`:'السعر عند التواصل';
}

function num(value){
  return new Intl.NumberFormat('en-US').format(Number(value||0));
}

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    #${PANEL_ID}{margin:0 0 14px;border:1px solid #e7e9ed;border-radius:22px;background:#fff;padding:16px;box-shadow:0 8px 26px rgba(15,23,42,.04);direction:rtl}
    #${PANEL_ID} *{box-sizing:border-box}
    .mxACRHead{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:12px}.mxACRHead h2{margin:0;font-size:20px;font-weight:900;color:#111318}.mxACRHead span{font-size:11px;color:#90959d}
    .mxACRSearch{height:54px;border:1px solid #dfe3e8;border-radius:16px;background:#fafbfc;display:flex;align-items:center;padding:0 14px;gap:9px}.mxACRSearch input{width:100%;height:100%;border:0;outline:0;background:transparent;font:800 15px Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#111;text-align:right;direction:ltr}.mxACRSearch b{color:#ff5a12;font-size:12px;white-space:nowrap}
    .mxACRHint{padding:12px 3px 0;color:#8d939b;font-size:11px;line-height:1.7}
    .mxACRResult{margin-top:12px}.mxACRCard{border:1px solid #e5e8eb;border-radius:18px;overflow:hidden;background:#fff}.mxACRTop{display:grid;grid-template-columns:82px minmax(0,1fr);gap:12px;padding:12px}.mxACRTop img{width:82px;height:82px;border-radius:14px;object-fit:cover;background:#f0f1f2}.mxACRTop h3{margin:2px 0 6px;font-size:17px}.mxACRRef{display:inline-flex;padding:5px 8px;border-radius:999px;background:#fff2eb;color:#e85417;font-size:12px;font-weight:900;direction:ltr}.mxACRMeta{margin-top:7px;color:#777d86;font-size:11px;line-height:1.7}
    .mxACRPrivate{border-top:1px solid #eceef1;padding:12px;background:#fafbfc}.mxACRPrivate h4{margin:0 0 9px;font-size:13px;color:#222}.mxACRPrivateGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.mxACRPrivateItem{border:1px solid #e7e9ec;border-radius:13px;background:#fff;padding:10px;min-width:0}.mxACRPrivateItem span{display:block;color:#9297a0;font-size:9px;margin-bottom:5px}.mxACRPrivateItem strong,.mxACRPrivateItem a{display:block;color:#17191d;font-size:12px;font-weight:900;overflow-wrap:anywhere;text-decoration:none}.mxACRPrivateItem a{color:#168443}.mxACRPrivateNote{margin-top:8px;color:#9a6060;font-size:10px;line-height:1.6}
    .mxACRMatches{display:grid;gap:7px}.mxACRMatch{width:100%;min-height:48px;border:1px solid #e6e8eb;border-radius:13px;background:#fff;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 11px;cursor:pointer;text-align:right}.mxACRMatch strong{font-size:12px}.mxACRMatch b{font-size:11px;color:#ff5a12;direction:ltr}.mxACREmpty{padding:18px 8px;text-align:center;color:#9297a0;font-size:12px}
    .mxAdminRefBadge{display:inline-flex!important;width:max-content!important;margin-top:5px!important;padding:4px 7px!important;border-radius:999px!important;background:#fff2eb!important;color:#e85417!important;font-size:10px!important;font-weight:900!important;direction:ltr!important}
    @media(max-width:620px){.mxACRPrivateGrid{grid-template-columns:1fr}.mxACRTop{grid-template-columns:72px minmax(0,1fr)}.mxACRTop img{width:72px;height:72px}}
  `;
  document.head.appendChild(style);
}

function ensurePanel(){
  const admin=document.querySelector('.mxAdmin');
  if(!admin)return null;
  ensureStyle();
  let panel=document.getElementById(PANEL_ID);
  if(panel)return panel;
  panel=document.createElement('section');
  panel.id=PANEL_ID;
  panel.innerHTML=`
    <div class="mxACRHead"><h2>البحث برقم السيارة</h2><span>بيانات البائع خاصة بالإدارة</span></div>
    <label class="mxACRSearch"><b>M1</b><input id="mxACRInput" type="search" inputmode="text" autocomplete="off" placeholder="اكتب أو الصق رقم السيارة مثل M1-0001"></label>
    <div class="mxACRHint">انسخ رقم السيارة من رسالة العميل أو من الموقع، ثم الصقه هنا لعرض السيارة وبيانات البائع.</div>
    <div class="mxACRResult" id="mxACRResult"></div>`;
  const actions=admin.querySelector('.mxAdminActions');
  if(actions)actions.insertAdjacentElement('afterend',panel);
  else admin.querySelector('.mxAdminInner')?.prepend(panel);
  panel.querySelector('#mxACRInput')?.addEventListener('input',renderSearch);
  panel.addEventListener('click',event=>{
    const button=event.target instanceof Element?event.target.closest('[data-reference]'):null;
    if(!button)return;
    const input=panel.querySelector('#mxACRInput');
    if(input){input.value=button.dataset.reference||'';renderSearch();}
  });
  return panel;
}

function carTitle(car){
  return `${car.brand||''} ${car.model||''} ${car.year||''}`.trim();
}

function findCarForRow(row){
  const id=row?.dataset?.carId||'';
  if(id){const direct=cars.find(car=>car.id===id);if(direct)return direct;}
  const image=row?.querySelector('.mxAdminThumb img')?.src||'';
  const title=(row?.querySelector('.mxAdminInfo strong')?.textContent||'').trim();
  return cars.find(car=>{
    const first=Array.isArray(car.images)?car.images[0]||'':'';
    return Boolean((image&&first&&image===first)||(title&&title===`${car.brand||''} ${car.model||''}`.trim()));
  })||null;
}

function decorateRows(){
  document.querySelectorAll('.mxAdminList > article').forEach(row=>{
    const car=findCarForRow(row);
    if(!car?.reference)return;
    row.dataset.carId=car.id;
    const info=row.querySelector('.mxAdminInfo');
    if(!info)return;
    let badge=info.querySelector('.mxAdminRefBadge');
    if(!badge){badge=document.createElement('span');badge.className='mxAdminRefBadge';info.appendChild(badge);}
    badge.textContent=car.reference;
  });
}

async function showExact(car){
  const result=document.getElementById('mxACRResult');
  if(!result)return;
  result.innerHTML='<div class="mxACREmpty">جارٍ تحميل بيانات البائع...</div>';
  let privateData={};
  let privateError='';
  try{
    const snap=await getDoc(doc(db,'carPrivate',car.id));
    if(snap.exists())privateData=snap.data()||{};
  }catch(error){
    privateError=error?.code==='permission-denied'
      ?'قواعد بيانات البائع الخاصة لم تُنشر في Firestore بعد.'
      :'تعذر تحميل بيانات البائع الآن.';
  }
  const image=Array.isArray(car.images)?car.images[0]||'':'';
  const sellerName=privateData.sellerName||'غير مضاف';
  const sellerPhone=privateData.sellerPhone||'غير مضاف';
  const sellerWhatsapp=privateData.sellerWhatsapp||'غير مضاف';
  const waDigits=String(privateData.sellerWhatsapp||'').replace(/\D/g,'');
  result.innerHTML=`
    <article class="mxACRCard">
      <div class="mxACRTop">
        ${image?`<img src="${escapeHtml(image)}" alt="">`:'<div></div>'}
        <div><span class="mxACRRef">${escapeHtml(car.reference||'')}</span><h3>${escapeHtml(carTitle(car))}</h3><div class="mxACRMeta">${escapeHtml(money(car.price))} · ${escapeHtml(num(car.mileage))} كم · ${escapeHtml(car.fuel||'—')} · ${escapeHtml(car.transmission||'—')} · ${escapeHtml(car.location||'—')}</div></div>
      </div>
      <div class="mxACRPrivate">
        <h4>بيانات البائع — خاصة بالإدارة</h4>
        <div class="mxACRPrivateGrid">
          <div class="mxACRPrivateItem"><span>اسم البائع</span><strong>${escapeHtml(sellerName)}</strong></div>
          <div class="mxACRPrivateItem"><span>رقم الهاتف</span><strong dir="ltr">${escapeHtml(sellerPhone)}</strong></div>
          <div class="mxACRPrivateItem"><span>واتساب البائع</span>${waDigits?`<a dir="ltr" target="_blank" rel="noreferrer" href="https://wa.me/${waDigits}">${escapeHtml(sellerWhatsapp)}</a>`:`<strong>${escapeHtml(sellerWhatsapp)}</strong>`}</div>
        </div>
        ${privateError?`<div class="mxACRPrivateNote">${escapeHtml(privateError)}</div>`:''}
      </div>
    </article>`;
}

function renderSearch(){
  const panel=ensurePanel();
  if(!panel)return;
  const input=panel.querySelector('#mxACRInput');
  const result=panel.querySelector('#mxACRResult');
  if(!input||!result)return;
  const raw=String(input.value||'').trim();
  const q=normalizeRef(raw);
  if(!q){result.innerHTML='';return;}
  const exact=cars.find(car=>normalizeRef(car.reference)===q);
  if(exact){showExact(exact);return;}
  const lower=raw.toLowerCase();
  const matches=cars.filter(car=>normalizeRef(car.reference).includes(q)||carTitle(car).toLowerCase().includes(lower)).slice(0,6);
  if(!matches.length){result.innerHTML='<div class="mxACREmpty">لا توجد سيارة بهذا الرقم.</div>';return;}
  result.innerHTML=`<div class="mxACRMatches">${matches.map(car=>`<button type="button" class="mxACRMatch" data-reference="${escapeHtml(car.reference||'')}"><strong>${escapeHtml(carTitle(car))}</strong><b>${escapeHtml(car.reference||'—')}</b></button>`).join('')}</div>`;
}

async function backfillReferences(){
  if(backfilling||!db)return;
  const missing=cars.filter(car=>!normalizeRef(car.reference));
  if(!missing.length)return;
  backfilling=true;
  try{
    const used=new Set();
    cars.forEach(car=>{
      const match=normalizeRef(car.reference).match(/^M1-(\d+)$/);
      if(match)used.add(Number(match[1]));
    });
    missing.sort((a,b)=>{
      const at=a.createdAt?.toMillis?.()||0;
      const bt=b.createdAt?.toMillis?.()||0;
      return at-bt;
    });
    let n=1;
    for(const car of missing){
      while(used.has(n))n++;
      const reference=formatRef(n);
      used.add(n);
      await updateDoc(doc(db,'cars',car.id),{reference});
      n++;
    }
  }catch(error){
    console.warn('[MauriOne admin reference] backfill failed',error?.code||error);
  }finally{
    backfilling=false;
  }
}

function render(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{
    ensurePanel();
    decorateRows();
    renderSearch();
  });
}

if(db){
  stopCars=onSnapshot(collection(db,'cars'),snapshot=>{
    cars=snapshot.docs.map(item=>({id:item.id,...item.data()}));
    render();
    backfillReferences();
  },error=>console.warn('[MauriOne admin reference] cars read failed',error?.code||error));
}

const observer=new MutationObserver(render);
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('beforeunload',()=>stopCars?.());
render();
