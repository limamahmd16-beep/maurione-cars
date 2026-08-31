import { db } from './lib/firebase.js';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const cloudName = import.meta.env.VITE_CARS_CLOUDINARY_CLOUD_NAME || '';
const uploadPreset = import.meta.env.VITE_CARS_CLOUDINARY_UPLOAD_PRESET || '';
const PAGE_ID = 'mxAdminCarPage';
const STYLE_ID = 'mx-admin-car-page-style';

const blankCar = {
  reference: '',
  brand: '', model: '', trim: '', bodyType: 'سيدان', year: '', mileage: '',
  transmission: 'أوتوماتيك', fuel: 'بنزين', drive: '4x4',
  location: 'نواكشوط', price: '', status: 'available',
  featured: false, description: '', images: [],
  sellerName: '', sellerPhone: '', sellerWhatsapp: '',
};

let state = { ...blankCar };
let editingId = '';
let busy = false;
let routeToken = 0;

const css = `
  body.mxAdminCarPageOpen{overflow:hidden!important}
  #${PAGE_ID}{position:fixed;inset:0;z-index:1000000;background:#f6f7f8;display:flex;flex-direction:column;direction:rtl;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#111318}
  #${PAGE_ID} *{box-sizing:border-box}
  .mxACPHeader{flex:0 0 auto;background:#fff;border-bottom:1px solid #e8eaed;padding:calc(12px + env(safe-area-inset-top)) 16px 12px;display:grid;grid-template-columns:48px 1fr 48px;align-items:center;gap:10px;min-height:76px}
  .mxACPHeader button{width:46px;height:46px;border:1px solid #e2e5e9;border-radius:15px;background:#fff;display:grid;place-items:center;font-size:28px;line-height:1;color:#111;cursor:pointer}
  .mxACPHeaderText{text-align:center;min-width:0}.mxACPHeaderText h1{margin:0;font-size:21px;font-weight:900}.mxACPHeaderText p{margin:4px 0 0;color:#8a9098;font-size:11px}
  .mxACPHeaderSpacer{width:46px;height:46px}
  .mxACPScroll{flex:1 1 auto;overflow:auto;-webkit-overflow-scrolling:touch;padding:16px 14px 24px}
  .mxACPForm{width:min(100%,760px);margin:0 auto;display:grid;gap:13px}
  .mxACPSection{background:#fff;border:1px solid #e6e8eb;border-radius:20px;padding:16px;box-shadow:0 5px 20px rgba(15,23,42,.025)}
  .mxACPSection h2{margin:0 0 14px;font-size:16px;font-weight:900;color:#17191d}
  .mxACPGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .mxACPField{display:grid;gap:7px;min-width:0}.mxACPField.full{grid-column:1/-1}.mxACPField>span{font-size:12px;font-weight:800;color:#666d76}
  .mxACPField input,.mxACPField select,.mxACPField textarea{width:100%;border:1px solid #dfe3e8;border-radius:14px;background:#fff;color:#111318;font:600 15px inherit;outline:none;padding:0 13px}
  .mxACPField input,.mxACPField select{height:50px}.mxACPField textarea{min-height:126px;padding-top:13px;resize:vertical;line-height:1.7}
  .mxACPField input:focus,.mxACPField select:focus,.mxACPField textarea:focus{border-color:#ff8a54;box-shadow:0 0 0 3px rgba(255,90,18,.09)}
  .mxACPField input[readonly]{background:#f7f8f9;color:#e85417;font-weight:900;direction:ltr}
  .mxACPCheck{height:50px;border:1px solid #dfe3e8;border-radius:14px;display:flex;align-items:center;justify-content:space-between;padding:0 13px;background:#fff}.mxACPCheck span{font-size:13px;font-weight:800}.mxACPCheck input{width:22px;height:22px;accent-color:#ff5a12}
  .mxACPPrivate{border-color:#ffd9c8;background:#fffaf7}.mxACPPrivate h2{display:flex;align-items:center;justify-content:space-between;gap:8px}.mxACPPrivate h2 small{font-size:10px;color:#e85417;background:#fff1e9;border-radius:999px;padding:5px 8px}.mxACPPrivateNote{margin:-4px 0 13px;color:#8b8f96;font-size:10px;line-height:1.7}
  .mxACPUpload{display:flex;align-items:center;justify-content:center;gap:9px;min-height:58px;border:1.5px dashed #ffad83;border-radius:16px;background:#fff8f4;color:#e95315;font-size:14px;font-weight:900;cursor:pointer;text-align:center;padding:12px}.mxACPUpload input{display:none}
  .mxACPPhotos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:12px}.mxACPPhoto{border:1px solid #e5e7ea;border-radius:14px;overflow:hidden;background:#fff}.mxACPPhoto img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;background:#eee}.mxACPPhotoActions{display:grid;grid-template-columns:1fr 40px;gap:5px;padding:6px}.mxACPPhotoActions button{height:34px;border:0;border-radius:9px;background:#f3f4f6;color:#4b5058;font-size:10px;font-weight:800}.mxACPPhotoActions button.main{background:#fff0e8;color:#e95315}.mxACPPhotoActions button.delete{font-size:17px;color:#b42318}
  .mxACPEmptyPhotos{margin-top:10px;text-align:center;color:#9a9fa7;font-size:11px;padding:10px}
  .mxACPError{display:none;background:#fff0f0;border:1px solid #ffd0d0;color:#b42318;border-radius:13px;padding:11px 13px;font-size:12px;font-weight:800;line-height:1.6}.mxACPError.on{display:block}
  .mxACPFooter{flex:0 0 auto;background:rgba(255,255,255,.97);border-top:1px solid #e4e7ea;padding:11px 14px calc(11px + env(safe-area-inset-bottom));backdrop-filter:blur(14px)}
  .mxACPFooterInner{width:min(100%,760px);margin:0 auto;display:grid;grid-template-columns:1fr 1.5fr;gap:10px}.mxACPFooter button{height:54px;border-radius:15px;font-size:16px;font-weight:900;cursor:pointer}.mxACPCancel{border:1px solid #dfe3e8;background:#fff;color:#111}.mxACPSave{border:0;background:#ff5a12;color:#fff}.mxACPSave:disabled,.mxACPCancel:disabled{opacity:.55;cursor:not-allowed}
  .mxACPStatus{font-size:11px;color:#8d939b;margin-top:8px;text-align:center;display:none}.mxACPStatus.on{display:block}
  @media(max-width:560px){.mxACPGrid{grid-template-columns:1fr}.mxACPField.full{grid-column:auto}.mxACPPhotos{grid-template-columns:repeat(2,minmax(0,1fr))}.mxACPSection{padding:14px}.mxACPScroll{padding:13px 10px 20px}.mxACPFooter{padding-left:10px;padding-right:10px}}
`;

function ensureStyle(){
  if(document.getElementById(STYLE_ID)) return;
  const style=document.createElement('style');style.id=STYLE_ID;style.textContent=css;document.head.appendChild(style);
}

function escapeAttr(v=''){return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function value(v){return v===null||v===undefined?'':String(v)}

function formTemplate(isEdit){
  return `
    <header class="mxACPHeader">
      <button type="button" data-action="back" aria-label="رجوع">‹</button>
      <div class="mxACPHeaderText"><h1>${isEdit?'تعديل السيارة':'إضافة سيارة'}</h1><p>${isEdit?'عدّل البيانات ثم احفظ التغييرات':'أدخل بيانات السيارة ثم احفظ'}</p></div>
      <div class="mxACPHeaderSpacer"></div>
    </header>
    <div class="mxACPScroll">
      <form class="mxACPForm" id="mxACPForm">
        <section class="mxACPSection"><h2>البيانات الأساسية</h2><div class="mxACPGrid">
          <label class="mxACPField"><span>رقم السيارة</span><input name="reference" readonly value="${escapeAttr(value(state.reference))}" placeholder="يُنشأ تلقائيًا عند الحفظ"></label>
          <label class="mxACPField"><span>الماركة</span><input name="brand" required value="${escapeAttr(value(state.brand))}" placeholder="مثال: تويوتا"></label>
          <label class="mxACPField"><span>الموديل</span><input name="model" required value="${escapeAttr(value(state.model))}" placeholder="مثال: كامري"></label>
          <label class="mxACPField"><span>الفئة</span><input name="trim" value="${escapeAttr(value(state.trim))}" placeholder="مثال: XLE"></label>
          <label class="mxACPField"><span>نوع الهيكل</span><select name="bodyType"><option${state.bodyType==='سيدان'?' selected':''}>سيدان</option><option${state.bodyType==='SUV'?' selected':''}>SUV</option><option${state.bodyType==='بيك أب'?' selected':''}>بيك أب</option><option${state.bodyType==='كوبيه'?' selected':''}>كوبيه</option><option${state.bodyType==='هاتشباك'?' selected':''}>هاتشباك</option><option${state.bodyType==='فان'?' selected':''}>فان</option><option${state.bodyType==='رياضية'?' selected':''}>رياضية</option><option${state.bodyType==='فاخرة'?' selected':''}>فاخرة</option></select></label>
          <label class="mxACPField"><span>السنة</span><input name="year" required type="number" inputmode="numeric" value="${escapeAttr(value(state.year))}" placeholder="2024"></label>
        </div></section>
        <section class="mxACPSection"><h2>المواصفات</h2><div class="mxACPGrid">
          <label class="mxACPField"><span>الكيلومترات</span><input name="mileage" required type="number" inputmode="numeric" value="${escapeAttr(value(state.mileage))}" placeholder="0"></label>
          <label class="mxACPField"><span>ناقل الحركة</span><select name="transmission"><option${state.transmission==='أوتوماتيك'?' selected':''}>أوتوماتيك</option><option${state.transmission==='عادي'?' selected':''}>عادي</option></select></label>
          <label class="mxACPField"><span>الوقود</span><select name="fuel"><option${state.fuel==='بنزين'?' selected':''}>بنزين</option><option${state.fuel==='ديزل'?' selected':''}>ديزل</option><option${state.fuel==='هجين'?' selected':''}>هجين</option><option${state.fuel==='كهرباء'?' selected':''}>كهرباء</option></select></label>
          <label class="mxACPField"><span>الدفع</span><input name="drive" value="${escapeAttr(value(state.drive))}" placeholder="4x4"></label>
        </div></section>
        <section class="mxACPSection"><h2>السعر والحالة</h2><div class="mxACPGrid">
          <label class="mxACPField"><span>الموقع</span><input name="location" value="${escapeAttr(value(state.location))}" placeholder="نواكشوط"></label>
          <label class="mxACPField"><span>السعر (MRU)</span><input name="price" type="number" inputmode="numeric" value="${escapeAttr(value(state.price))}" placeholder="0"></label>
          <label class="mxACPField"><span>الحالة</span><select name="status"><option value="available"${state.status==='available'?' selected':''}>متوفرة</option><option value="sold"${state.status==='sold'?' selected':''}>مباعة</option></select></label>
          <label class="mxACPField"><span>الإعلان</span><div class="mxACPCheck"><span>إعلان مميز</span><input name="featured" type="checkbox"${state.featured?' checked':''}></div></label>
        </div></section>
        <section class="mxACPSection mxACPPrivate"><h2>بيانات البائع <small>خاصة بالإدارة</small></h2><div class="mxACPPrivateNote">هذه المعلومات لا تظهر للزبائن ولا تُحفظ داخل بيانات السيارة العامة.</div><div class="mxACPGrid">
          <label class="mxACPField"><span>اسم البائع</span><input name="sellerName" value="${escapeAttr(value(state.sellerName))}" placeholder="اسم البائع"></label>
          <label class="mxACPField"><span>رقم هاتف البائع</span><input name="sellerPhone" type="tel" inputmode="tel" value="${escapeAttr(value(state.sellerPhone))}" placeholder="رقم الهاتف" dir="ltr"></label>
          <label class="mxACPField full"><span>واتساب البائع</span><input name="sellerWhatsapp" type="tel" inputmode="tel" value="${escapeAttr(value(state.sellerWhatsapp))}" placeholder="رقم واتساب" dir="ltr"></label>
        </div></section>
        <section class="mxACPSection"><h2>الوصف</h2><label class="mxACPField full"><textarea name="description" placeholder="اكتب وصف السيارة...">${String(state.description||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea></label></section>
        <section class="mxACPSection"><h2>صور السيارة</h2><label class="mxACPUpload">＋ رفع صور السيارة<input id="mxACPFiles" type="file" accept="image/*" multiple></label><div id="mxACPPhotos"></div></section>
        <div class="mxACPError" id="mxACPError"></div><div class="mxACPStatus" id="mxACPStatus"></div>
      </form>
    </div>
    <footer class="mxACPFooter"><div class="mxACPFooterInner"><button type="button" class="mxACPCancel" data-action="back">إلغاء</button><button type="submit" form="mxACPForm" class="mxACPSave">${isEdit?'حفظ التغييرات':'حفظ السيارة'}</button></div></footer>`;
}

function renderPhotos(){
  const host=document.getElementById('mxACPPhotos');if(!host)return;
  host.replaceChildren();
  const images=Array.isArray(state.images)?state.images:[];
  if(!images.length){const empty=document.createElement('div');empty.className='mxACPEmptyPhotos';empty.textContent='لم تُرفع صور بعد.';host.appendChild(empty);return}
  const grid=document.createElement('div');grid.className='mxACPPhotos';
  images.forEach((src,index)=>{
    const card=document.createElement('div');card.className='mxACPPhoto';
    const img=document.createElement('img');img.src=src;img.alt='';card.appendChild(img);
    const actions=document.createElement('div');actions.className='mxACPPhotoActions';
    const main=document.createElement('button');main.type='button';main.dataset.photoMain=String(index);main.className=index===0?'main':'';main.textContent=index===0?'الرئيسية':'اجعلها الرئيسية';main.disabled=index===0;
    const del=document.createElement('button');del.type='button';del.dataset.photoDelete=String(index);del.className='delete';del.textContent='×';
    actions.append(main,del);card.appendChild(actions);grid.appendChild(card);
  });
  host.appendChild(grid);
}

function setError(message=''){
  const el=document.getElementById('mxACPError');if(!el)return;el.textContent=message;el.classList.toggle('on',Boolean(message));
}
function setStatus(message=''){
  const el=document.getElementById('mxACPStatus');if(!el)return;el.textContent=message;el.classList.toggle('on',Boolean(message));
}
function setBusy(next,message=''){
  busy=next;document.querySelectorAll(`#${PAGE_ID} button,#${PAGE_ID} input,#${PAGE_ID} select,#${PAGE_ID} textarea`).forEach(el=>{if(el.dataset.action==='back'&&next)el.disabled=true;else if(el.classList.contains('mxACPSave'))el.disabled=next});setStatus(message);
}

function readForm(){
  const form=document.getElementById('mxACPForm');if(!form)return state;
  const fd=new FormData(form);
  state={...state,
    reference:value(fd.get('reference')).trim().toUpperCase(),
    brand:value(fd.get('brand')).trim(),model:value(fd.get('model')).trim(),trim:value(fd.get('trim')).trim(),bodyType:value(fd.get('bodyType'))||'سيدان',
    year:value(fd.get('year')),mileage:value(fd.get('mileage')),transmission:value(fd.get('transmission')),
    fuel:value(fd.get('fuel')),drive:value(fd.get('drive')).trim(),location:value(fd.get('location')).trim(),
    price:value(fd.get('price')),status:value(fd.get('status'))||'available',featured:Boolean(form.elements.featured?.checked),
    sellerName:value(fd.get('sellerName')).trim(),sellerPhone:value(fd.get('sellerPhone')).trim(),sellerWhatsapp:value(fd.get('sellerWhatsapp')).trim(),
    description:value(fd.get('description')).trim(),images:Array.isArray(state.images)?state.images:[],
  };return state;
}

async function nextReference(){
  const snap=await getDocs(collection(db,'cars'));
  let max=0;let count=0;
  snap.forEach(item=>{
    count++;
    const reference=String(item.data()?.reference||'').trim().toUpperCase();
    const match=reference.match(/^M1-(\d+)$/);
    if(match)max=Math.max(max,Number(match[1]));
  });
  return `M1-${String(Math.max(max,count)+1).padStart(4,'0')}`;
}

async function uploadFiles(files){
  if(!files?.length||busy)return;
  if(!cloudName||!uploadPreset){setError('خدمة رفع الصور غير مربوطة.');return}
  const current=Array.isArray(state.images)?state.images.length:0;
  const list=[...files].filter(file=>file.type.startsWith('image/')).slice(0,Math.max(0,30-current));
  if(!list.length){setError('اختر ملفات صور فقط.');return}
  const tooLarge=list.find(file=>file.size>10*1024*1024);if(tooLarge){setError('حجم الصورة الواحدة يجب ألا يتجاوز 10MB.');return}
  readForm();setError('');setBusy(true,'جارٍ رفع الصور...');
  try{
    const urls=[];
    for(let i=0;i<list.length;i++){
      setStatus(`جارٍ رفع الصورة ${i+1} من ${list.length}...`);
      const fd=new FormData();fd.append('file',list[i]);fd.append('upload_preset',uploadPreset);fd.append('folder','maurione-cars');
      const r=await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{method:'POST',body:fd});const j=await r.json();
      if(!r.ok||!j.secure_url)throw new Error(j?.error?.message||'UPLOAD_FAILED');urls.push(j.secure_url);
    }
    state.images=[...(state.images||[]),...urls];renderPhotos();setStatus('تم رفع الصور.');setTimeout(()=>setStatus(''),1200);
  }catch(err){setError(`تعذر رفع الصور: ${err?.message||'خطأ غير معروف'}`);setStatus('')}
  finally{setBusy(false)}
}

async function save(event){
  event.preventDefault();if(busy)return;const f=readForm();setError('');
  if(!f.brand||!f.model||!f.year||f.mileage===''){setError('أكمل الماركة والموديل والسنة والكيلومترات.');return}
  setBusy(true,editingId?'جارٍ حفظ التغييرات...':'جارٍ حفظ السيارة...');
  try{
    const reference=f.reference||await nextReference();
    state.reference=reference;
    const refInput=document.querySelector(`#${PAGE_ID} input[name="reference"]`);if(refInput)refInput.value=reference;
    const payload={reference,brand:f.brand,model:f.model,trim:f.trim,bodyType:f.bodyType||'سيدان',year:Number(f.year),mileage:Number(f.mileage),transmission:f.transmission,fuel:f.fuel,drive:f.drive,location:f.location,price:Number(f.price||0),status:f.status,featured:Boolean(f.featured),description:f.description,images:f.images||[],updatedAt:serverTimestamp()};
    let carId=editingId;
    let created=false;
    if(editingId){
      await updateDoc(doc(db,'cars',editingId),payload);
    }else{
      const createdRef=await addDoc(collection(db,'cars'),{...payload,createdAt:serverTimestamp()});
      carId=createdRef.id;created=true;
    }
    try{
      await setDoc(doc(db,'carPrivate',carId),{
        reference,
        sellerName:f.sellerName,
        sellerPhone:f.sellerPhone,
        sellerWhatsapp:f.sellerWhatsapp,
        updatedAt:serverTimestamp(),
        ...(created?{createdAt:serverTimestamp()}:{})
      },{merge:true});
    }catch(privateError){
      if(created){
        editingId=carId;
        window.history.replaceState({},'',`/admin/cars/edit/${encodeURIComponent(carId)}`);
      }
      setError(`تم حفظ السيارة برقم ${reference}، لكن تعذر حفظ بيانات البائع الخاصة (${privateError?.code||'permission-denied'}). انشر قواعد carPrivate في Firestore ثم اضغط حفظ مرة أخرى.`);
      setStatus('');setBusy(false);return;
    }
    closePage(true);
  }catch(err){setError(`تعذر الحفظ: ${err?.code||err?.message||'خطأ غير معروف'}`);setStatus('');setBusy(false)}
}

function closePage(toAdmin=false){
  document.getElementById(PAGE_ID)?.remove();document.body.classList.remove('mxAdminCarPageOpen');
  if(toAdmin||window.location.pathname.startsWith('/admin/cars/')){window.history.pushState({},'', '/admin');window.dispatchEvent(new PopStateEvent('popstate'))}
}

function bindPage(){
  const page=document.getElementById(PAGE_ID);if(!page)return;
  page.addEventListener('click',e=>{
    const target=e.target instanceof Element?e.target:null;if(!target)return;
    if(target.closest('[data-action="back"]')){if(!busy)closePage(true);return}
    const main=target.closest('[data-photo-main]');if(main){readForm();const n=Number(main.dataset.photoMain);const copy=[...(state.images||[])];const[x]=copy.splice(n,1);copy.unshift(x);state.images=copy;renderPhotos();return}
    const del=target.closest('[data-photo-delete]');if(del){readForm();const n=Number(del.dataset.photoDelete);state.images=(state.images||[]).filter((_,i)=>i!==n);renderPhotos();}
  });
  page.querySelector('#mxACPForm')?.addEventListener('submit',save);
  page.querySelector('#mxACPFiles')?.addEventListener('change',e=>uploadFiles(e.target.files));
}

async function showRoutePage(){
  const token=++routeToken;const path=window.location.pathname;
  const isNew=path==='/admin/cars/new';const match=path.match(/^\/admin\/cars\/edit\/([^/]+)$/);
  if(!isNew&&!match){document.getElementById(PAGE_ID)?.remove();document.body.classList.remove('mxAdminCarPageOpen');return}
  ensureStyle();document.body.classList.add('mxAdminCarPageOpen');editingId='';state={...blankCar,images:[]};
  if(match){
    try{
      editingId=decodeURIComponent(match[1]);
      const snap=await getDoc(doc(db,'cars',editingId));
      if(token!==routeToken)return;
      if(!snap.exists())throw new Error('NOT_FOUND');
      state={...blankCar,...snap.data(),images:Array.isArray(snap.data().images)?snap.data().images:[]};
      try{
        const privateSnap=await getDoc(doc(db,'carPrivate',editingId));
        if(privateSnap.exists())state={...state,...privateSnap.data()};
      }catch{}
    }
    catch{if(token!==routeToken)return;window.history.replaceState({},'', '/admin');window.dispatchEvent(new PopStateEvent('popstate'));return}
  }
  let page=document.getElementById(PAGE_ID);if(!page){page=document.createElement('div');page.id=PAGE_ID;document.body.appendChild(page)}
  page.innerHTML=formTemplate(Boolean(match));bindPage();renderPhotos();document.title=`${match?'تعديل السيارة':'إضافة سيارة'} | MauriOne`;
}

function goEditor(path){window.history.pushState({},'',path);window.dispatchEvent(new PopStateEvent('popstate'))}

async function idForRow(row){
  if(row?.dataset?.carId)return row.dataset.carId;
  const img=row?.querySelector('.mxAdminThumb img')?.src||'';const title=(row?.querySelector('.mxAdminInfo strong')?.textContent||'').trim();const meta=row?.querySelector('.mxAdminInfo span')?.textContent||'';
  try{
    const snap=await getDocs(collection(db,'cars'));let fallback='';
    snap.forEach(item=>{if(fallback)return;const c=item.data()||{};const first=Array.isArray(c.images)?c.images[0]||'':'';const carTitle=`${c.brand||''} ${c.model||''}`.trim();if(img&&first&&img===first)fallback=item.id;else if(title&&title===carTitle&&String(c.year||'')&&meta.includes(String(c.year)))fallback=item.id;});
    if(fallback&&row)row.dataset.carId=fallback;return fallback;
  }catch{return ''}
}

document.addEventListener('click',async event=>{
  const target=event.target instanceof Element?event.target:null;if(!target||document.getElementById(PAGE_ID))return;
  const add=target.closest('.mxAdminActions button');
  if(add&&/إضافة سيارة/.test(add.textContent||'')){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();goEditor('/admin/cars/new');return}
  const rowButtons=target.closest('.mxRowButtons');const btn=target.closest('.mxRowButtons button');
  if(btn&&rowButtons){const buttons=[...rowButtons.querySelectorAll(':scope > button')];if(buttons.indexOf(btn)===1){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();const row=btn.closest('.mxAdminList > article');const id=await idForRow(row);if(id)goEditor(`/admin/cars/edit/${encodeURIComponent(id)}`);}}
},true);

window.addEventListener('popstate',showRoutePage);
showRoutePage();