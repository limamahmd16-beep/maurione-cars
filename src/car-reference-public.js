import { db } from './lib/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';

const WHATSAPP=(import.meta.env.VITE_CARS_WHATSAPP||'22224200324').replace(/\D/g,'');
const cars=new Map();
let stopCars=null;
let raf=0;

function money(value){
  const n=Number(value||0);
  return n>0?`${new Intl.NumberFormat('en-US').format(n)} MRU`:'السعر عند التواصل';
}

function num(value){
  return new Intl.NumberFormat('en-US').format(Number(value||0));
}

function normalize(value=''){
  return String(value||'').trim().toUpperCase();
}

function titleFor(car){
  return `${car.brand||''} ${car.model||''} ${car.year||''}`.trim();
}

function currentCarId(){
  const match=window.location.pathname.match(/^\/cars\/([^/]+)/);
  if(!match)return '';
  try{return decodeURIComponent(match[1])}catch{return match[1]}
}

function findCarForCard(card){
  const image=card.querySelector('.mxCardImage img')?.src||'';
  const title=(card.querySelector('.mxCardInfo h3')?.textContent||'').trim();
  for(const car of cars.values()){
    const first=Array.isArray(car.images)?car.images[0]||'':'';
    if(image&&first&&image===first)return car;
    if(title&&title===titleFor(car))return car;
  }
  return null;
}

function ensureStyle(){
  if(document.getElementById('mx-car-reference-public-style'))return;
  const style=document.createElement('style');
  style.id='mx-car-reference-public-style';
  style.textContent=`
    .mxPublicCarRef{display:inline-flex;align-items:center;gap:5px;margin-top:7px;padding:5px 9px;border-radius:999px;background:#f5f6f7;color:#72777f;font-size:10px;font-weight:800;direction:rtl;width:max-content;max-width:100%}
    .mxPublicCarRef b{color:#17191d;font-size:11px;letter-spacing:.2px;direction:ltr}
    .mxDetailReference{display:inline-flex;align-items:center;gap:7px;margin:2px 0 10px;padding:7px 11px;border:1px solid #eceef1;border-radius:999px;background:#fafbfc;color:#777d86;font-size:11px;font-weight:800;width:max-content;max-width:100%}
    .mxDetailReference b{color:#ff5a12;font-size:12px;direction:ltr}
    html[data-theme='dark'] .mxPublicCarRef,html[data-theme='dark'] .mxDetailReference{background:#20242a;border-color:#30353d;color:#adb2ba}
    html[data-theme='dark'] .mxPublicCarRef b{color:#f5f6f7}
  `;
  document.head.appendChild(style);
}

function inquiryMessage(car){
  const id=car.id||currentCarId();
  const page=`${window.location.origin}/cars/${encodeURIComponent(id)}`;
  const image=Array.isArray(car.images)?car.images[0]||'':'';
  const lines=[
    'مرحبًا، أريد الاستفسار عن هذه السيارة عبر MauriOne:',
    `رقم السيارة: ${car.reference||'—'}`,
    `السيارة: ${titleFor(car)}`,
    `السعر: ${money(car.price)}`,
    `الكيلومترات: ${num(car.mileage)} كم`,
    `الوقود: ${car.fuel||'—'}`,
    `ناقل الحركة: ${car.transmission||'—'}`,
    `الدفع: ${car.drive||'—'}`,
    `الموقع: ${car.location||'—'}`,
  ];
  if(image)lines.push(`صورة السيارة: ${image}`);
  lines.push(`رابط السيارة: ${page}`);
  return lines.join('\n');
}

function decorateCards(){
  document.querySelectorAll('.mxCard').forEach(card=>{
    const car=findCarForCard(card);
    if(!car?.reference)return;
    const info=card.querySelector('.mxCardInfo');
    if(!info)return;
    let badge=info.querySelector('.mxPublicCarRef');
    if(!badge){
      badge=document.createElement('div');
      badge.className='mxPublicCarRef';
      const trim=info.querySelector('.mxTrim');
      if(trim)trim.insertAdjacentElement('afterend',badge);else info.prepend(badge);
    }
    badge.innerHTML=`<span>رقم السيارة</span><b>${String(car.reference).replace(/[<>&]/g,'')}</b>`;
  });
}

function decorateDetail(){
  const id=currentCarId();
  if(!id)return;
  const car=cars.get(id);
  if(!car)return;
  const summary=document.querySelector('.mxDetail .mxSummary');
  if(summary&&car.reference){
    let ref=summary.querySelector('.mxDetailReference');
    if(!ref){
      ref=document.createElement('div');
      ref.className='mxDetailReference';
      const h1=summary.querySelector('h1');
      if(h1)h1.insertAdjacentElement('afterend',ref);else summary.prepend(ref);
    }
    ref.innerHTML=`<span>رقم السيارة</span><b>${String(car.reference).replace(/[<>&]/g,'')}</b>`;
  }
  if(!WHATSAPP)return;
  const href=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(inquiryMessage(car))}`;
  document.querySelectorAll('.mxDetail .mxContact a.wa, body:has(.mxDetail) a.mxGlobalWhatsApp').forEach(link=>{
    link.href=href;
    link.target='_blank';
    link.rel='noreferrer';
  });
}

function render(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{
    ensureStyle();
    decorateCards();
    decorateDetail();
  });
}

if(db){
  stopCars=onSnapshot(collection(db,'cars'),snapshot=>{
    cars.clear();
    snapshot.forEach(item=>cars.set(item.id,{id:item.id,...item.data()}));
    render();
  },error=>console.warn('[MauriOne car reference] cars read failed',error?.code||error));
}

const observer=new MutationObserver(render);
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('popstate',()=>setTimeout(render,0));
window.addEventListener('beforeunload',()=>stopCars?.());
render();
