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
    .mxPublicCarRef{display:block;margin:8px 0 9px;color:#747982;font-size:11px;line-height:1;font-weight:900;letter-spacing:.45px;direction:ltr;text-align:right;width:100%}
    .mxDetailReference{display:block;margin:7px 0 8px;color:#747982;font-size:12px;line-height:1;font-weight:900;letter-spacing:.5px;direction:ltr;text-align:right;width:100%}
    html[data-theme='dark'] .mxPublicCarRef,html[data-theme='dark'] .mxDetailReference{color:#b7bbc2}
    @media (display-mode:standalone) and (max-width:560px){
      .mxDetailReference{margin:5px 0 6px;font-size:11px;line-height:1}
    }
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
    const price=info.querySelector('.mxPrice');
    let ref=info.querySelector('.mxPublicCarRef');
    if(!ref){
      ref=document.createElement('div');
      ref.className='mxPublicCarRef';
    }
    ref.textContent=String(car.reference||'');
    if(price&&price.nextElementSibling!==ref)price.insertAdjacentElement('afterend',ref);
    else if(!price&&!ref.isConnected)info.appendChild(ref);
  });
}

function decorateDetail(){
  const id=currentCarId();
  if(!id)return;
  const car=cars.get(id);
  if(!car)return;
  const summary=document.querySelector('.mxDetail .mxSummary');
  if(summary&&car.reference){
    const price=summary.querySelector('.mxDetailPrice');
    let ref=summary.querySelector('.mxDetailReference');
    if(!ref){
      ref=document.createElement('div');
      ref.className='mxDetailReference';
    }
    ref.textContent=String(car.reference||'');
    if(price&&price.nextElementSibling!==ref)price.insertAdjacentElement('afterend',ref);
    else if(!price&&!ref.isConnected)summary.appendChild(ref);
  }
  if(!WHATSAPP)return;
  const href=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(inquiryMessage(car))}`;
  document.querySelectorAll('.mxDetail .mxContact a.wa, body:has(.mxDetail) a.mxGlobalWhatsApp').forEach(link=>{
    if(link.getAttribute('href')!==href)link.href=href;
    if(link.target!=='_blank')link.target='_blank';
    if(link.rel!=='noreferrer')link.rel='noreferrer';
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
