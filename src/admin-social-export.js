import { db } from './lib/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

const OVERLAY_ID='mxAdminSocialExport';
const STYLE_ID='mx-admin-social-export-style';
const LOGO_ORANGE='#ff5a12';

let activeCar=null;
let activeFormat='story';
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
.mxSEBack{width:46px;height:46px;border:1px solid #e2e5e9;border-radius:15px;background:#fff;color:#111;font-size:28px;line-height:1}
.mxSEHeaderText{text-align:center;min-width:0}.mxSEHeaderText h1{margin:0;font-size:20px;font-weight:900}.mxSEHeaderText p{margin:4px 0 0;color:#8a9098;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mxSESpacer{width:46px;height:46px}
.mxSEScroll{flex:1 1 auto;overflow:auto;-webkit-overflow-scrolling:touch;padding:14px 12px 120px}
.mxSEInner{width:min(100%,760px);margin:0 auto;display:grid;gap:13px}
.mxSECard{background:#fff;border:1px solid #e5e7ea;border-radius:20px;padding:15px;box-shadow:0 5px 20px rgba(15,23,42,.025)}
.mxSECard h2{margin:0 0 6px;font-size:16px;font-weight:900}.mxSECard>p{margin:0 0 13px;color:#7a8088;font-size:11px;line-height:1.7}
.mxSEFormats{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.mxSEFormat{min-height:58px;border:1px solid #dfe3e8;border-radius:14px;background:#fff;color:#464b52;font-size:12px;font-weight:900;padding:7px}.mxSEFormat.on{border-color:#ff8a54;background:#fff4ee;color:#e95315;box-shadow:0 0 0 2px rgba(255,90,18,.07)}.mxSEFormat small{display:block;margin-top:3px;font-size:10px;font-weight:600;color:#8a9098}
.mxSEPreviewWrap{background:#0b0c0e;border-radius:17px;overflow:hidden;display:grid;place-items:center;min-height:240px}.mxSEPreview{display:block;max-width:100%;max-height:65vh;width:auto;height:auto;background:#111}
.mxSEHint{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;color:#777d86;font-size:10px}.mxSECount{font-weight:900;color:#111318}
.mxSEActions{position:fixed;z-index:1100001;left:0;right:0;bottom:0;background:rgba(255,255,255,.97);border-top:1px solid #e4e7ea;padding:11px 12px calc(11px + env(safe-area-inset-bottom));backdrop-filter:blur(14px)}
.mxSEActionsInner{width:min(100%,760px);margin:0 auto;display:grid;grid-template-columns:1fr 1.35fr;gap:9px}.mxSEActions button{min-height:54px;border-radius:15px;font-size:14px;font-weight:900}.mxSEPrepare{border:1px solid #dfe3e8;background:#fff;color:#111}.mxSEShare{border:0;background:#ff5a12;color:#fff}.mxSEShare:disabled,.mxSEPrepare:disabled{opacity:.5}
.mxSEStatus{min-height:20px;text-align:center;color:#717780;font-size:11px;font-weight:700;margin-top:8px}.mxSEError{color:#b42318}
@media(max-width:520px){.mxSEScroll{padding-left:9px;padding-right:9px}.mxSEFormats{grid-template-columns:1fr}.mxSECard{padding:13px}.mxSEActions{padding-left:9px;padding-right:9px}.mxSEActionsInner{grid-template-columns:1fr}.mxSEPreview{max-height:58vh}}
`;

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');style.id=STYLE_ID;style.textContent=css;document.head.appendChild(style);
}

function clean(value=''){return String(value||'').replace(/\s+/g,' ').trim()}
function money(value){const n=Number(value||0);return n>0?`${new Intl.NumberFormat('en-US').format(n)} MRU`:'السعر عند التواصل'}
function km(value){return `${new Intl.NumberFormat('en-US').format(Number(value||0))} كم`}
function safeName(value='car'){return clean(value).replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,'-').slice(0,70)||'car'}

async function loadCars(force=false){
  if(!force&&carCache.length&&Date.now()-cacheAt<30000)return carCache;
  const snap=await getDocs(collection(db,'cars'));
  carCache=snap.docs.map(item=>({id:item.id,...item.data(),images:Array.isArray(item.data().images)?item.data().images:[]}));
  cacheAt=Date.now();return carCache;
}

async function carForRow(row){
  const cars=await loadCars();
  const explicit=row?.dataset?.carId;if(explicit){const found=cars.find(c=>c.id===explicit);if(found)return found}
  const img=row?.querySelector('.mxAdminThumb img')?.src||'';
  const title=clean(row?.querySelector('.mxAdminInfo strong')?.textContent||'');
  const meta=clean(row?.querySelector('.mxAdminInfo span')?.textContent||'');
  let found=cars.find(c=>img&&c.images?.[0]&&img===c.images[0]);
  if(!found)found=cars.find(c=>title===clean(`${c.brand||''} ${c.model||''}`)&&String(c.year||'')&&meta.includes(String(c.year)));
  if(found&&row)row.dataset.carId=found.id;
  return found||null;
}

function injectButtons(){
  document.querySelectorAll('.mxAdminList > article').forEach(row=>{
    if(row.querySelector('.mxSocialExportButton'))return;
    const button=document.createElement('button');
    button.type='button';button.className='mxSocialExportButton';button.innerHTML='<span aria-hidden="true">▣</span><span>صور النشر</span>';
    row.appendChild(button);
  });
}

function dims(format){return format==='post'?{w:1080,h:1350}:{w:1080,h:1920}}

function roundRect(ctx,x,y,w,h,r){
  const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
}

function drawCover(ctx,img,w,h){
  const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight);const sw=w/scale,sh=h/scale;const sx=(img.naturalWidth-sw)/2,sy=(img.naturalHeight-sh)/2;
  ctx.drawImage(img,sx,sy,sw,sh,0,0,w,h);
}

function loadImage(src){
  return new Promise((resolve,reject)=>{
    const img=new Image();img.crossOrigin='anonymous';img.decoding='async';
    img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('تعذر تحميل إحدى صور السيارة.'));
    img.src=src;
  });
}

function drawBrand(ctx,w,scale=1){
  ctx.save();ctx.direction='ltr';ctx.textAlign='left';ctx.textBaseline='middle';ctx.font=`900 ${54*scale}px Arial`;
  const x=64*scale,y=76*scale;ctx.fillStyle='#fff';ctx.fillText('Mauri',x,y);const mw=ctx.measureText('Mauri').width;ctx.fillStyle=LOGO_ORANGE;ctx.fillText('One',x+mw,y);
  ctx.restore();
}

function drawPill(ctx,text,x,y,fontSize=26,padX=24,height=50,fill='rgba(0,0,0,.46)',color='#fff'){
  ctx.save();ctx.font=`800 ${fontSize}px Arial`;const width=Math.ceil(ctx.measureText(text).width)+padX*2;roundRect(ctx,x-width,y,width,height,height/2);ctx.fillStyle=fill;ctx.fill();ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction='rtl';ctx.fillText(text,x-width/2,y+height/2+1);ctx.restore();return width;
}

function drawSpec(ctx,label,value,x,y,w,h,fontScale=1){
  ctx.save();roundRect(ctx,x,y,w,h,22*fontScale);ctx.fillStyle='rgba(255,255,255,.10)';ctx.fill();ctx.direction='rtl';ctx.textAlign='right';ctx.textBaseline='alphabetic';
  ctx.fillStyle='#fff';ctx.font=`800 ${28*fontScale}px Arial`;ctx.fillText(value,x+w-24*fontScale,y+43*fontScale);
  ctx.fillStyle='rgba(255,255,255,.66)';ctx.font=`700 ${18*fontScale}px Arial`;ctx.fillText(label,x+w-24*fontScale,y+72*fontScale);ctx.restore();
}

async function renderSocialCanvas(car,imageUrl,format,canvas){
  const {w,h}=dims(format);canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');
  const img=await loadImage(imageUrl);drawCover(ctx,img,w,h);
  const gradient=ctx.createLinearGradient(0,h*.38,0,h);gradient.addColorStop(0,'rgba(0,0,0,0)');gradient.addColorStop(.52,'rgba(0,0,0,.40)');gradient.addColorStop(1,'rgba(0,0,0,.96)');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
  const topShade=ctx.createLinearGradient(0,0,0,230);topShade.addColorStop(0,'rgba(0,0,0,.58)');topShade.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=topShade;ctx.fillRect(0,0,w,250);
  drawBrand(ctx,w,1);
  const status=car.status==='sold'?'مباعة':'متوفرة';drawPill(ctx,status,w-62,52,24,24,50,car.status==='sold'?'rgba(150,35,35,.78)':'rgba(18,117,67,.82)');
  const compact=format==='post';const bottom=compact?410:535;const startY=h-bottom;
  ctx.save();ctx.direction='rtl';ctx.textAlign='right';ctx.fillStyle='#fff';ctx.textBaseline='alphabetic';
  const title=clean(`${car.brand||''} ${car.model||''} ${car.year||''}`);ctx.font=`900 ${compact?54:64}px Arial`;ctx.fillText(title,w-66,startY+78);
  if(car.trim){ctx.fillStyle='rgba(255,255,255,.72)';ctx.font=`700 ${compact?25:29}px Arial`;ctx.fillText(clean(car.trim),w-66,startY+120)}
  ctx.fillStyle=LOGO_ORANGE;ctx.font=`900 ${compact?46:56}px Arial`;ctx.fillText(money(car.price),w-66,startY+(car.trim?182:150));
  ctx.restore();
  const specs=[['السنة',String(car.year||'—')],['الكيلومترات',km(car.mileage)],['الوقود',clean(car.fuel||'—')],['ناقل الحركة',clean(car.transmission||'—')],['الدفع',clean(car.drive||'—')]];
  const gap=14,margin=66;const chipH=compact?82:94;const cols=compact?3:2;const rows=Math.ceil(specs.length/cols);const chipW=(w-margin*2-gap*(cols-1))/cols;const baseY=h-margin-rows*chipH-gap*(rows-1);
  specs.forEach((spec,i)=>{const col=i%cols,row=Math.floor(i/cols);drawSpec(ctx,spec[0],spec[1],margin+col*(chipW+gap),baseY+row*(chipH+gap),chipW,chipH,compact?.85:1)});
  ctx.save();ctx.direction='rtl';ctx.textAlign='right';ctx.fillStyle='rgba(255,255,255,.62)';ctx.font=`700 ${compact?18:20}px Arial`;const location=clean(car.location||'');if(location)ctx.fillText(location,w-66,baseY-22);ctx.restore();
  return canvas;
}

function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('تعذر إنشاء الصورة.')),'image/jpeg',.94))}

function fileBase(car){return safeName(`${car.brand||''}-${car.model||''}-${car.year||''}`)}

function setStatus(text='',error=false){const el=document.querySelector(`#${OVERLAY_ID} .mxSEStatus`);if(!el)return;el.textContent=text;el.classList.toggle('mxSEError',Boolean(error))}
function clearPrepared(){preparedFiles=[];const share=document.querySelector(`#${OVERLAY_ID} .mxSEShare`);if(share){share.disabled=true;share.textContent='حفظ / مشاركة الصور'}}

async function renderPreview(){
  if(!activeCar?.images?.length)return;const token=++renderToken;const canvas=document.querySelector(`#${OVERLAY_ID} .mxSEPreview`);if(!canvas)return;
  setStatus('جارٍ تجهيز المعاينة...');
  try{await renderSocialCanvas(activeCar,activeCar.images[0],activeFormat,canvas);if(token===renderToken)setStatus('هذه معاينة للصورة الأولى. سيُطبّق نفس التصميم على جميع الصور.')}
  catch(err){if(token===renderToken)setStatus(err?.message||'تعذر إنشاء المعاينة.',true)}
}

function overlayHtml(car){const count=car.images?.length||0;return `
<header class="mxSEHeader"><button type="button" class="mxSEBack" aria-label="رجوع">‹</button><div class="mxSEHeaderText"><h1>صور النشر</h1><p>${clean(`${car.brand||''} ${car.model||''} ${car.year||''}`)}</p></div><div class="mxSESpacer"></div></header>
<div class="mxSEScroll"><div class="mxSEInner">
<section class="mxSECard"><h2>اختر مقاس النشر</h2><p>سيُضاف شعار MauriOne والمواصفات إلى كل صورة، بدون تعديل صور السيارة الأصلية في الموقع.</p><div class="mxSEFormats"><button type="button" class="mxSEFormat on" data-format="story">TikTok / Story<small>9:16 · 1080×1920</small></button><button type="button" class="mxSEFormat" data-format="post">Facebook / WhatsApp<small>4:5 · 1080×1350</small></button></div></section>
<section class="mxSECard"><h2>المعاينة</h2><div class="mxSEPreviewWrap"><canvas class="mxSEPreview"></canvas></div><div class="mxSEHint"><span>سيتم إنشاء نسخة احترافية من كل صورة</span><span class="mxSECount">${count} صورة</span></div><div class="mxSEStatus"></div></section>
</div></div>
<footer class="mxSEActions"><div class="mxSEActionsInner"><button type="button" class="mxSEPrepare">تجهيز كل الصور</button><button type="button" class="mxSEShare" disabled>حفظ / مشاركة الصور</button></div></footer>`}

function closeOverlay(){document.getElementById(OVERLAY_ID)?.remove();document.body.classList.remove('mxSocialExportOpen');activeCar=null;preparedFiles=[];renderToken++}

function openOverlay(car){
  activeCar=car;activeFormat='story';preparedFiles=[];document.getElementById(OVERLAY_ID)?.remove();document.body.classList.add('mxSocialExportOpen');
  const root=document.createElement('div');root.id=OVERLAY_ID;root.innerHTML=overlayHtml(car);document.body.appendChild(root);renderPreview();
}

async function prepareAll(){
  if(!activeCar?.images?.length){setStatus('لا توجد صور لهذه السيارة.',true);return}
  const prepare=document.querySelector(`#${OVERLAY_ID} .mxSEPrepare`);const share=document.querySelector(`#${OVERLAY_ID} .mxSEShare`);prepare.disabled=true;share.disabled=true;preparedFiles=[];
  try{
    const files=[];for(let i=0;i<activeCar.images.length;i++){
      setStatus(`جارٍ تجهيز الصورة ${i+1} من ${activeCar.images.length}...`);const {w,h}=dims(activeFormat);const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;await renderSocialCanvas(activeCar,activeCar.images[i],activeFormat,canvas);const blob=await canvasBlob(canvas);files.push(new File([blob],`${fileBase(activeCar)}-${String(i+1).padStart(2,'0')}-${activeFormat}.jpg`,{type:'image/jpeg'}));
    }
    preparedFiles=files;share.disabled=false;share.textContent=`حفظ / مشاركة ${files.length} صور`;setStatus('الصور جاهزة. اضغط الزر البرتقالي لحفظها أو مشاركتها.');
  }catch(err){preparedFiles=[];setStatus(err?.message||'تعذر تجهيز الصور.',true)}finally{prepare.disabled=false}
}

function downloadFiles(files){files.forEach((file,index)=>setTimeout(()=>{const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000)},index*280))}

async function sharePrepared(){
  if(!preparedFiles.length)return;
  try{
    if(navigator.share&&(!navigator.canShare||navigator.canShare({files:preparedFiles}))){await navigator.share({files:preparedFiles,title:`MauriOne — ${clean(`${activeCar?.brand||''} ${activeCar?.model||''} ${activeCar?.year||''}`)}`});setStatus('تم فتح خيارات الحفظ والمشاركة.');return}
  }catch(err){if(err?.name==='AbortError')return;console.warn('MauriOne share files failed',err)}
  downloadFiles(preparedFiles);setStatus('بدأ تنزيل الصور.');
}

ensureStyle();injectButtons();
const observer=new MutationObserver(()=>injectButtons());observer.observe(document.body,{childList:true,subtree:true});

document.addEventListener('click',async event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  const social=target.closest('.mxSocialExportButton');
  if(social){event.preventDefault();event.stopPropagation();const row=social.closest('.mxAdminList > article');social.disabled=true;social.textContent='جارٍ الفتح...';try{const car=await carForRow(row);if(car)openOverlay(car);else alert('تعذر العثور على بيانات السيارة.')}catch{alert('تعذر تحميل بيانات السيارة.')}finally{social.disabled=false;social.innerHTML='<span aria-hidden="true">▣</span><span>صور النشر</span>'}return}
  if(!target.closest(`#${OVERLAY_ID}`))return;
  if(target.closest('.mxSEBack')){closeOverlay();return}
  const format=target.closest('[data-format]');if(format){activeFormat=format.dataset.format==='post'?'post':'story';document.querySelectorAll(`#${OVERLAY_ID} [data-format]`).forEach(btn=>btn.classList.toggle('on',btn.dataset.format===activeFormat));clearPrepared();renderPreview();return}
  if(target.closest('.mxSEPrepare')){prepareAll();return}
  if(target.closest('.mxSEShare')){sharePrepared();}
},true);
