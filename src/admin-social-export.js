import { db } from './lib/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

const OVERLAY_ID='mxAdminSocialExport';
const STYLE_ID='mx-admin-social-export-style';
const ORANGE='#ff5a12';
let activeCar=null;
let preparedFiles=[];
let renderToken=0;
let carCache=[];
let cacheAt=0;

const css=`
body.mxSocialExportOpen{overflow:hidden!important}
.mxSocialExportButton{grid-column:1/-1!important;width:100%!important;min-height:42px!important;border:0!important;border-radius:12px!important;background:#111318!important;color:#fff!important;font-size:12px!important;font-weight:900!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;margin-top:4px!important}
#${OVERLAY_ID}{position:fixed;inset:0;z-index:1100000;background:#f5f6f7;color:#111318;direction:rtl;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;flex-direction:column}
#${OVERLAY_ID} *{box-sizing:border-box}
.mxSEHeader{flex:0 0 auto;background:#fff;border-bottom:1px solid #e6e8eb;padding:calc(12px + env(safe-area-inset-top)) 14px 12px;display:grid;grid-template-columns:48px 1fr 48px;align-items:center;gap:8px}
.mxSEBack{width:46px;height:46px;border:1px solid #e2e5e9;border-radius:15px;background:#fff;color:#111;font-size:28px}
.mxSEHeaderText{text-align:center;min-width:0}.mxSEHeaderText h1{margin:0;font-size:20px;font-weight:900}.mxSEHeaderText p{margin:4px 0 0;color:#8a9098;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mxSESpacer{width:46px;height:46px}.mxSEScroll{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:14px 12px 120px}.mxSEInner{width:min(100%,760px);margin:0 auto;display:grid;gap:13px}
.mxSECard{background:#fff;border:1px solid #e5e7ea;border-radius:20px;padding:15px;box-shadow:0 5px 20px rgba(15,23,42,.025)}.mxSECard h2{margin:0 0 6px;font-size:16px;font-weight:900}.mxSECard>p{margin:0;color:#7a8088;font-size:11px;line-height:1.7}
.mxSEPreviewWrap{background:#0b0c0e;border-radius:17px;overflow:hidden;display:grid;place-items:center;min-height:240px}.mxSEPreview{display:block;max-width:100%;max-height:65vh;width:auto;height:auto;background:#111}
.mxSEHint{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;color:#777d86;font-size:10px}.mxSECount{font-weight:900;color:#111318}
.mxSEActions{position:fixed;z-index:1100001;left:0;right:0;bottom:0;background:rgba(255,255,255,.97);border-top:1px solid #e4e7ea;padding:11px 12px calc(11px + env(safe-area-inset-bottom));backdrop-filter:blur(14px)}
.mxSEActionsInner{width:min(100%,760px);margin:0 auto;display:grid;grid-template-columns:1fr 1.35fr;gap:9px}.mxSEActions button{min-height:54px;border-radius:15px;font-size:14px;font-weight:900}.mxSEPrepare{border:1px solid #dfe3e8;background:#fff;color:#111}.mxSEShare{border:0;background:#ff5a12;color:#fff}.mxSEShare:disabled,.mxSEPrepare:disabled{opacity:.5}
.mxSEStatus{min-height:20px;text-align:center;color:#717780;font-size:11px;font-weight:700;margin-top:8px}.mxSEError{color:#b42318}
@media(max-width:520px){.mxSEScroll{padding-left:9px;padding-right:9px}.mxSECard{padding:13px}.mxSEActions{padding-left:9px;padding-right:9px}.mxSEActionsInner{grid-template-columns:1fr}.mxSEPreview{max-height:58vh}}
`;

function ensureStyle(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=css;document.head.appendChild(s)}
function clean(v=''){return String(v||'').replace(/\s+/g,' ').trim()}
function money(v){const n=Number(v||0);return n>0?`${new Intl.NumberFormat('en-US').format(n)} MRU`:'السعر عند التواصل'}
function km(v){return `${new Intl.NumberFormat('en-US').format(Number(v||0))} كم`}
function safeName(v='car'){return clean(v).replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,'-').slice(0,70)||'car'}

async function loadCars(force=false){
  if(!force&&carCache.length&&Date.now()-cacheAt<30000)return carCache;
  const snap=await getDocs(collection(db,'cars'));
  carCache=snap.docs.map(x=>({id:x.id,...x.data(),images:Array.isArray(x.data().images)?x.data().images:[]}));
  cacheAt=Date.now();return carCache;
}

async function carForRow(row){
  const cars=await loadCars();
  const explicit=row?.dataset?.carId;
  if(explicit){const c=cars.find(x=>x.id===explicit);if(c)return c}
  const img=row?.querySelector('.mxAdminThumb img')?.src||'';
  const title=clean(row?.querySelector('.mxAdminInfo strong')?.textContent||'');
  const meta=clean(row?.querySelector('.mxAdminInfo span')?.textContent||'');
  let found=cars.find(c=>img&&c.images?.[0]===img);
  if(!found)found=cars.find(c=>title===clean(`${c.brand||''} ${c.model||''}`)&&String(c.year||'')&&meta.includes(String(c.year)));
  if(found&&row)row.dataset.carId=found.id;
  return found||null;
}

function injectButtons(){
  document.querySelectorAll('.mxAdminList > article').forEach(row=>{
    if(row.querySelector('.mxSocialExportButton'))return;
    const b=document.createElement('button');b.type='button';b.className='mxSocialExportButton';b.innerHTML='<span aria-hidden="true">▣</span><span>صور النشر</span>';row.appendChild(b);
  });
}

function roundRect(ctx,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath()}
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin='anonymous';img.decoding='async';img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('تعذر تحميل إحدى صور السيارة.'));img.src=src})}

function drawBrand(ctx,w,h,s){
  ctx.save();ctx.direction='ltr';ctx.textAlign='left';ctx.textBaseline='middle';
  const font=Math.max(24,54*s),x=58*s,y=72*s,padX=35*s,padY=36*s,boxW=285*s,boxH=76*s;
  ctx.font=`900 ${font}px Arial`;roundRect(ctx,padX,padY,boxW,boxH,22*s);ctx.fillStyle='rgba(0,0,0,.42)';ctx.fill();
  ctx.fillStyle='#fff';ctx.fillText('Mauri',x,y);const mw=ctx.measureText('Mauri').width;ctx.fillStyle=ORANGE;ctx.fillText('One',x+mw,y);ctx.restore();
}

function drawPill(ctx,text,w,s,fill){
  ctx.save();const font=Math.max(14,24*s);ctx.font=`800 ${font}px Arial`;const pad=24*s,height=50*s,width=Math.ceil(ctx.measureText(text).width)+pad*2,x=w-52*s,y=47*s;
  roundRect(ctx,x-width,y,width,height,height/2);ctx.fillStyle=fill;ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction='rtl';ctx.fillText(text,x-width/2,y+height/2+1);ctx.restore();
}

function drawSpec(ctx,label,value,x,y,w,h,s){
  ctx.save();roundRect(ctx,x,y,w,h,18*s);ctx.fillStyle='rgba(12,15,19,.48)';ctx.fill();ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=Math.max(1,s);ctx.stroke();ctx.direction='rtl';ctx.textAlign='right';
  ctx.fillStyle='#fff';ctx.font=`800 ${Math.max(13,26*s)}px Arial`;ctx.fillText(value,x+w-20*s,y+38*s);
  ctx.fillStyle='rgba(255,255,255,.68)';ctx.font=`700 ${Math.max(10,17*s)}px Arial`;ctx.fillText(label,x+w-20*s,y+66*s);ctx.restore();
}

async function renderSocialCanvas(car,imageUrl,canvas){
  const img=await loadImage(imageUrl);
  const w=img.naturalWidth,h=img.naturalHeight;
  if(!w||!h)throw new Error('تعذر قراءة مقاس الصورة الأصلية.');
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');
  ctx.drawImage(img,0,0,w,h);

  const s=w/1080;
  const topH=Math.min(h*.18,210*s);
  const top=ctx.createLinearGradient(0,0,0,topH);top.addColorStop(0,'rgba(0,0,0,.38)');top.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=top;ctx.fillRect(0,0,w,topH);

  const bottomStart=h*.55;
  const bottom=ctx.createLinearGradient(0,bottomStart,0,h);bottom.addColorStop(0,'rgba(0,0,0,0)');bottom.addColorStop(.36,'rgba(0,0,0,.16)');bottom.addColorStop(1,'rgba(0,0,0,.82)');ctx.fillStyle=bottom;ctx.fillRect(0,bottomStart,w,h-bottomStart);

  drawBrand(ctx,w,h,s);
  drawPill(ctx,car.status==='sold'?'مباعة':'متوفرة',w,s,car.status==='sold'?'rgba(145,35,35,.82)':'rgba(18,117,67,.84)');

  const margin=58*s,gap=12*s,chipH=88*s,rows=2,chipW=(w-margin*2-gap)/2,baseY=h-margin-rows*chipH-gap;
  const specs=[['السنة',String(car.year||'—')],['الكيلومترات',km(car.mileage)],['الوقود',clean(car.fuel||'—')],['ناقل الحركة',clean(car.transmission||'—')]];
  specs.forEach((item,i)=>{const col=i%2,row=Math.floor(i/2);drawSpec(ctx,item[0],item[1],margin+col*(chipW+gap),baseY+row*(chipH+gap),chipW,chipH,s)});

  ctx.save();ctx.direction='rtl';ctx.textAlign='right';ctx.fillStyle=ORANGE;ctx.font=`900 ${Math.max(24,54*s)}px Arial`;ctx.fillText(money(car.price),w-margin,baseY-34*s);ctx.restore();
  return canvas;
}

function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('تعذر إنشاء الصورة.')),'image/jpeg',.94))}
function fileBase(car){return safeName(`${car.brand||''}-${car.model||''}-${car.year||''}`)}
function setStatus(text='',error=false){const el=document.querySelector(`#${OVERLAY_ID} .mxSEStatus`);if(!el)return;el.textContent=text;el.classList.toggle('mxSEError',Boolean(error))}
function clearPrepared(){preparedFiles=[];const b=document.querySelector(`#${OVERLAY_ID} .mxSEShare`);if(b){b.disabled=true;b.textContent='حفظ / مشاركة الصور'}}

async function renderPreview(){
  if(!activeCar?.images?.length)return;
  const token=++renderToken,canvas=document.querySelector(`#${OVERLAY_ID} .mxSEPreview`);if(!canvas)return;
  setStatus('جارٍ تجهيز المعاينة...');
  try{await renderSocialCanvas(activeCar,activeCar.images[0],canvas);if(token===renderToken)setStatus('المقاس النهائي مطابق تمامًا لمقاس الصورة الأصلية.')}
  catch(e){if(token===renderToken)setStatus(e?.message||'تعذر إنشاء المعاينة.',true)}
}

function overlayHtml(car){
  const count=car.images?.length||0;
  return `<header class="mxSEHeader"><button type="button" class="mxSEBack" aria-label="رجوع">‹</button><div class="mxSEHeaderText"><h1>صور النشر</h1><p>${clean(`${car.brand||''} ${car.model||''} ${car.year||''}`)}</p></div><div class="mxSESpacer"></div></header><div class="mxSEScroll"><div class="mxSEInner"><section class="mxSECard"><h2>المقاس الأصلي</h2><p>كل صورة ستبقى بنفس عرضها وارتفاعها الأصليين تمامًا. سيُضاف فقط شعار MauriOne والسعر والمواصفات الشفافة فوق الصورة.</p></section><section class="mxSECard"><h2>المعاينة</h2><div class="mxSEPreviewWrap"><canvas class="mxSEPreview"></canvas></div><div class="mxSEHint"><span>المقاس الأصلي + تصميم شفاف</span><span class="mxSECount">${count} صورة</span></div><div class="mxSEStatus"></div></section></div></div><footer class="mxSEActions"><div class="mxSEActionsInner"><button type="button" class="mxSEPrepare">تجهيز كل الصور</button><button type="button" class="mxSEShare" disabled>حفظ / مشاركة الصور</button></div></footer>`;
}

function closeOverlay(){document.getElementById(OVERLAY_ID)?.remove();document.body.classList.remove('mxSocialExportOpen');activeCar=null;preparedFiles=[];renderToken++}
function openOverlay(car){activeCar=car;preparedFiles=[];document.getElementById(OVERLAY_ID)?.remove();document.body.classList.add('mxSocialExportOpen');const root=document.createElement('div');root.id=OVERLAY_ID;root.innerHTML=overlayHtml(car);document.body.appendChild(root);renderPreview()}

async function prepareAll(){
  if(!activeCar?.images?.length){setStatus('لا توجد صور لهذه السيارة.',true);return}
  const prepare=document.querySelector(`#${OVERLAY_ID} .mxSEPrepare`),share=document.querySelector(`#${OVERLAY_ID} .mxSEShare`);prepare.disabled=true;share.disabled=true;preparedFiles=[];
  try{
    const files=[];
    for(let i=0;i<activeCar.images.length;i++){
      setStatus(`جارٍ تجهيز الصورة ${i+1} من ${activeCar.images.length}...`);
      const canvas=document.createElement('canvas');await renderSocialCanvas(activeCar,activeCar.images[i],canvas);const blob=await canvasBlob(canvas);
      files.push(new File([blob],`${fileBase(activeCar)}-${String(i+1).padStart(2,'0')}-original.jpg`,{type:'image/jpeg'}));
    }
    preparedFiles=files;share.disabled=false;share.textContent=`حفظ / مشاركة ${files.length} صور`;setStatus('الصور جاهزة بالمقاسات الأصلية.');
  }catch(e){preparedFiles=[];setStatus(e?.message||'تعذر تجهيز الصور.',true)}finally{prepare.disabled=false}
}

function downloadFiles(files){files.forEach((file,i)=>setTimeout(()=>{const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000)},i*280))}
async function sharePrepared(){if(!preparedFiles.length)return;try{if(navigator.share&&(!navigator.canShare||navigator.canShare({files:preparedFiles}))){await navigator.share({files:preparedFiles,title:`MauriOne — ${clean(`${activeCar?.brand||''} ${activeCar?.model||''} ${activeCar?.year||''}`)}`});setStatus('تم فتح خيارات الحفظ والمشاركة.');return}}catch(e){if(e?.name==='AbortError')return}downloadFiles(preparedFiles);setStatus('بدأ تنزيل الصور.')}

ensureStyle();injectButtons();
const observer=new MutationObserver(()=>injectButtons());observer.observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',async event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const social=target.closest('.mxSocialExportButton');
  if(social){event.preventDefault();event.stopPropagation();const row=social.closest('.mxAdminList > article');social.disabled=true;social.textContent='جارٍ الفتح...';try{const car=await carForRow(row);if(car)openOverlay(car);else alert('تعذر العثور على بيانات السيارة.')}catch{alert('تعذر تحميل بيانات السيارة.')}finally{social.disabled=false;social.innerHTML='<span aria-hidden="true">▣</span><span>صور النشر</span>'}return}
  if(!target.closest(`#${OVERLAY_ID}`))return;
  if(target.closest('.mxSEBack')){closeOverlay();return}
  if(target.closest('.mxSEPrepare')){clearPrepared();prepareAll();return}
  if(target.closest('.mxSEShare'))sharePrepared();
},true);
