import { auth, db } from './lib/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';

const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';
const STYLE_ID='mx-admin-users-style';
const PAGE_ID='mxAdminUsersPage';
let stopUsers=null;
let users=[];
let errorMessage='';
let started=false;

function esc(value=''){
  return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function dateText(value){
  try{
    const date=value?.toDate?.()||new Date(value);
    if(!date||Number.isNaN(date.getTime()))return 'غير متوفر';
    return new Intl.DateTimeFormat('ar-MR',{year:'numeric',month:'short',day:'numeric'}).format(date);
  }catch{return 'غير متوفر'}
}

function initials(name,email){
  const source=String(name||email||'M').trim();
  return esc((source[0]||'M').toUpperCase());
}

function userPhoto(user){
  return user.photoURL||user.photoUrl||user.photo||user.avatar||user.image||'';
}

function userPhone(user){
  return String(user.phone||user.phoneNumber||user.mobile||user.whatsapp||'').trim();
}

function whatsappDigits(phone=''){
  let digits=String(phone||'').replace(/\D/g,'');
  if(digits.length===8)digits=`222${digits}`;
  return digits.length>=10?digits:'';
}

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .mxAdminUsersButton{background:#fff!important;color:#15171b!important;border:1px solid #dfe3e8!important}
    .mxAdminUsersPage{position:fixed;inset:0;z-index:12000;background:#f6f7f8;color:#111;overflow:auto;direction:rtl;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .mxAdminUsersPage *{box-sizing:border-box}
    .mxAdminUsersHeader{position:sticky;top:0;z-index:4;height:84px;background:rgba(255,255,255,.97);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid #eceef1;display:grid;grid-template-columns:50px minmax(0,1fr) 50px;align-items:center;padding:8px 16px}
    .mxAdminUsersBack{width:46px;height:46px;border:1px solid #e1e4e8;border-radius:15px;background:#fff;color:#111;font-size:29px;line-height:1;display:grid;place-items:center;padding:0;cursor:pointer}
    .mxAdminUsersTitle{text-align:center;min-width:0}.mxAdminUsersTitle strong{display:block;font-size:23px;font-weight:900;letter-spacing:-.3px}.mxAdminUsersTitle span{display:block;margin-top:3px;color:#969aa1;font-size:11px}
    .mxAdminUsersBody{width:min(calc(100% - 22px),900px);margin:0 auto;padding:16px 0 34px}

    .mxAdminUsersOverview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:12px}
    .mxAdminUsersStat{min-height:74px;border:1px solid #e5e8eb;border-radius:17px;background:#fff;padding:11px 12px;display:flex;flex-direction:column;justify-content:center;gap:5px;box-shadow:0 5px 16px rgba(15,23,42,.025)}
    .mxAdminUsersStat span{font-size:10px;color:#8e939b;font-weight:700}.mxAdminUsersStat strong{font-size:22px;line-height:1;color:#15171b;font-weight:900;direction:ltr;text-align:right}
    .mxAdminUsersStat.accent{background:#fff8f4;border-color:#ffd9c5}.mxAdminUsersStat.accent strong{color:#f15b25}

    .mxAdminUsersSearch{height:54px;border:1px solid #dfe3e7;border-radius:17px;background:#fff;display:flex;align-items:center;padding:0 14px;margin-bottom:12px;box-shadow:0 6px 18px rgba(15,23,42,.03);gap:9px}
    .mxAdminUsersSearch::before{content:'⌕';font-size:25px;color:#7d828a;line-height:1;transform:rotate(-20deg)}
    .mxAdminUsersSearch input{width:100%;height:100%;border:0;outline:0;background:transparent;color:#111;font-size:15px;text-align:right;min-width:0}
    .mxAdminUsersSummary{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:0 3px 10px;color:#868b93;font-size:11px}.mxAdminUsersSummary strong{color:#111;font-size:14px}
    .mxAdminUsersList{display:grid;gap:9px}

    .mxAdminUserCard{border:1px solid #e4e7eb;border-radius:19px;background:#fff;padding:13px;box-shadow:0 7px 20px rgba(15,23,42,.03);display:grid;grid-template-columns:58px minmax(0,1fr);gap:12px;align-items:start;direction:rtl}
    .mxAdminUserAvatar{width:58px;height:58px;border-radius:17px;overflow:hidden;background:#fff3ec;border:1px solid #ffdfcf;color:#f15b25;display:grid;place-items:center;font-size:21px;font-weight:900}
    .mxAdminUserAvatar img{width:100%;height:100%;object-fit:cover;display:block}
    .mxAdminUserMain{min-width:0}
    .mxAdminUserTop{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px}
    .mxAdminUserIdentity{min-width:0}.mxAdminUserName{font-size:16px;font-weight:900;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mxAdminUserBadges{display:flex;flex-wrap:wrap;gap:5px;margin-top:5px}
    .mxAdminUserRole,.mxAdminUserPhoneState{display:inline-flex;width:max-content;max-width:100%;padding:4px 8px;border-radius:999px;font-size:9px;font-weight:800}
    .mxAdminUserRole{background:#eef9f2;color:#27814c}.mxAdminUserPhoneState{background:#f3f4f6;color:#737982}.mxAdminUserPhoneState.ok{background:#eef9f2;color:#27814c}.mxAdminUserPhoneState.missing{background:#fff2ed;color:#c64d22}

    .mxAdminUserDetails{display:grid;gap:6px}
    .mxAdminUserLine{min-height:42px;border:1px solid #eef0f2;border-radius:12px;background:#fafbfc;padding:7px 9px;display:grid;grid-template-columns:94px minmax(0,1fr) auto;align-items:center;gap:8px}
    .mxAdminUserLine>small{font-size:9px;color:#92969d}.mxAdminUserLine>span{font-size:12px;color:#202328;line-height:1.35;overflow-wrap:anywhere;min-width:0}.mxAdminUserLine>span[dir='ltr']{text-align:left}
    .mxAdminUserActions{display:flex;gap:5px;align-items:center}.mxAdminUserAction{height:30px;min-width:48px;border:1px solid #e0e3e7;border-radius:9px;background:#fff;color:#575d65;font-size:9px;font-weight:900;padding:0 8px;cursor:pointer}.mxAdminUserAction.wa{color:#168443;border-color:#cfe8d8;background:#f4fbf6;text-decoration:none;display:grid;place-items:center}
    .mxAdminUserDates{display:flex;flex-wrap:wrap;gap:5px 14px;margin-top:7px;padding:0 2px;color:#979ca3;font-size:9px}.mxAdminUserDates b{color:#6f747b;font-weight:800}

    .mxAdminUsersEmpty{min-height:170px;border:1px dashed #d9dde3;border-radius:20px;background:#fff;color:#777d86;display:grid;place-items:center;text-align:center;padding:24px;line-height:1.8}
    .mxAdminUsersError{border:1px solid #f0cbc7;background:#fff3f2;color:#9d3c34;border-radius:16px;padding:14px;line-height:1.7;font-size:13px}
    .mxAdminUsersToast{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(12px);z-index:13000;background:#17191d;color:#fff;padding:9px 14px;border-radius:999px;font-size:11px;font-weight:800;opacity:0;pointer-events:none;transition:.2s ease}.mxAdminUsersToast.on{opacity:1;transform:translateX(-50%) translateY(0)}

    @media(min-width:860px){.mxAdminUsersList{grid-template-columns:1fr 1fr}.mxAdminUsersBody{padding-top:20px}.mxAdminUserCard{height:100%}}
    @media(max-width:560px){
      .mxAdminUsersHeader{height:80px;padding-left:11px;padding-right:11px}.mxAdminUsersTitle strong{font-size:21px}
      .mxAdminUsersBody{width:calc(100% - 18px);padding-top:11px}.mxAdminUsersOverview{gap:6px}.mxAdminUsersStat{min-height:66px;padding:9px}.mxAdminUsersStat strong{font-size:20px}.mxAdminUsersStat span{font-size:9px}
      .mxAdminUserCard{grid-template-columns:52px minmax(0,1fr);padding:11px;gap:10px}.mxAdminUserAvatar{width:52px;height:52px;border-radius:15px}.mxAdminUserName{font-size:15px}
      .mxAdminUserLine{grid-template-columns:72px minmax(0,1fr);gap:6px}.mxAdminUserActions{grid-column:1/-1;justify-content:flex-start;padding-top:1px}.mxAdminUserAction{height:29px}
      .mxAdminUserDates{font-size:8.5px;gap:4px 10px}
    }
  `;
  document.head.appendChild(style);
}

function summaryHtml(filteredCount){
  const withPhone=users.filter(user=>Boolean(userPhone(user))).length;
  const withoutPhone=Math.max(0,users.length-withPhone);
  return {
    overview:`
      <div class="mxAdminUsersStat accent"><span>إجمالي المستخدمين</span><strong>${new Intl.NumberFormat('en-US').format(users.length)}</strong></div>
      <div class="mxAdminUsersStat"><span>لديهم رقم هاتف</span><strong>${new Intl.NumberFormat('en-US').format(withPhone)}</strong></div>
      <div class="mxAdminUsersStat"><span>بدون رقم هاتف</span><strong>${new Intl.NumberFormat('en-US').format(withoutPhone)}</strong></div>`,
    summary:`<span>الحسابات الظاهرة</span><strong>${new Intl.NumberFormat('en-US').format(filteredCount)}</strong>`,
  };
}

function renderList(page,query=''){
  const host=page.querySelector('.mxAdminUsersList');
  const summary=page.querySelector('.mxAdminUsersSummary');
  const overview=page.querySelector('.mxAdminUsersOverview');
  if(!host||!summary||!overview)return;

  if(errorMessage){
    overview.innerHTML='';
    summary.innerHTML='<span>تعذر تحميل القائمة</span><strong>—</strong>';
    host.innerHTML=`<div class="mxAdminUsersError">${esc(errorMessage)}</div>`;
    return;
  }

  const q=String(query||'').trim().toLowerCase();
  const filtered=users.filter(user=>{
    if(!q)return true;
    return [user.name,user.displayName,user.email,user.phone,user.phoneNumber,user.mobile,user.whatsapp,user.role,user.id].some(v=>String(v||'').toLowerCase().includes(q));
  });
  const summaryData=summaryHtml(filtered.length);
  overview.innerHTML=summaryData.overview;
  summary.innerHTML=summaryData.summary;

  if(!filtered.length){
    host.innerHTML='<div class="mxAdminUsersEmpty">لا توجد حسابات مطابقة.</div>';
    return;
  }

  host.innerHTML=filtered.map(user=>{
    const name=user.name||user.displayName||'مستخدم MauriOne';
    const email=user.email||'غير مضاف';
    const rawPhone=userPhone(user);
    const phone=rawPhone||'غير مضاف';
    const photo=userPhoto(user);
    const role=user.role==='admin'?'مدير':'مستخدم';
    const created=dateText(user.createdAt);
    const updated=dateText(user.updatedAt);
    const wa=whatsappDigits(rawPhone);
    const phoneState=rawPhone
      ?'<span class="mxAdminUserPhoneState ok">رقم مضاف</span>'
      :'<span class="mxAdminUserPhoneState missing">بدون رقم</span>';
    return `<article class="mxAdminUserCard" data-user-id="${esc(user.id)}">
      <div class="mxAdminUserAvatar">${photo?`<img src="${esc(photo)}" alt="">`:`<span>${initials(name,email)}</span>`}</div>
      <div class="mxAdminUserMain">
        <div class="mxAdminUserTop">
          <div class="mxAdminUserIdentity">
            <div class="mxAdminUserName">${esc(name)}</div>
            <div class="mxAdminUserBadges"><span class="mxAdminUserRole">${esc(role)}</span>${phoneState}</div>
          </div>
        </div>
        <div class="mxAdminUserDetails">
          <div class="mxAdminUserLine">
            <small>البريد</small><span dir="ltr">${esc(email)}</span>
            ${email!=='غير مضاف'?`<div class="mxAdminUserActions"><button type="button" class="mxAdminUserAction" data-copy="${esc(email)}">نسخ</button></div>`:''}
          </div>
          <div class="mxAdminUserLine">
            <small>الهاتف</small><span dir="ltr">${esc(phone)}</span>
            ${rawPhone?`<div class="mxAdminUserActions"><button type="button" class="mxAdminUserAction" data-copy="${esc(rawPhone)}">نسخ</button>${wa?`<a class="mxAdminUserAction wa" href="https://wa.me/${wa}" target="_blank" rel="noreferrer">واتساب</a>`:''}</div>`:''}
          </div>
        </div>
        <div class="mxAdminUserDates"><span>إنشاء: <b>${esc(created)}</b></span><span>آخر تحديث: <b>${esc(updated)}</b></span></div>
      </div>
    </article>`;
  }).join('');
}

function showToast(page,message){
  const toast=page.querySelector('.mxAdminUsersToast');
  if(!toast)return;
  toast.textContent=message;
  toast.classList.add('on');
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>toast.classList.remove('on'),1300);
}

async function copyText(value,page){
  const text=String(value||'');
  if(!text)return;
  try{
    await navigator.clipboard.writeText(text);
    showToast(page,'تم النسخ');
  }catch{
    const area=document.createElement('textarea');
    area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();
    try{document.execCommand('copy');showToast(page,'تم النسخ')}catch{showToast(page,'تعذر النسخ')}
    area.remove();
  }
}

function closePage(){
  document.getElementById(PAGE_ID)?.remove();
  if(location.pathname.startsWith('/admin/users'))history.replaceState({},'', '/admin');
}

function openPage(){
  ensureStyle();
  let page=document.getElementById(PAGE_ID);
  if(page)return;
  history.replaceState({},'', '/admin/users');
  page=document.createElement('main');
  page.id=PAGE_ID;
  page.className='mxAdminUsersPage';
  page.innerHTML=`
    <header class="mxAdminUsersHeader">
      <button type="button" class="mxAdminUsersBack" aria-label="العودة">›</button>
      <div class="mxAdminUsersTitle"><strong>المستخدمون</strong><span>إدارة بيانات حسابات MauriOne</span></div>
      <span></span>
    </header>
    <section class="mxAdminUsersBody">
      <div class="mxAdminUsersOverview"></div>
      <label class="mxAdminUsersSearch"><input type="search" placeholder="ابحث بالاسم أو البريد أو رقم الهاتف..."></label>
      <div class="mxAdminUsersSummary"><span>الحسابات الظاهرة</span><strong>0</strong></div>
      <div class="mxAdminUsersList"><div class="mxAdminUsersEmpty">جارٍ تحميل المستخدمين...</div></div>
    </section>
    <div class="mxAdminUsersToast" role="status"></div>`;
  document.body.appendChild(page);
  page.querySelector('.mxAdminUsersBack')?.addEventListener('click',closePage);
  page.querySelector('input')?.addEventListener('input',event=>renderList(page,event.target.value));
  page.addEventListener('click',event=>{
    const button=event.target instanceof Element?event.target.closest('[data-copy]'):null;
    if(button)copyText(button.dataset.copy||'',page);
  });
  renderList(page,'');
}

function ensureButton(){
  const actions=document.querySelector('.mxAdminActions');
  if(!actions||actions.querySelector('.mxAdminUsersButton'))return;
  const button=document.createElement('button');
  button.type='button';
  button.className='mxAdminUsersButton';
  button.textContent='المستخدمون';
  button.addEventListener('click',openPage);
  actions.appendChild(button);
}

function startDirectory(){
  if(started||!db||!auth?.currentUser||auth.currentUser.uid!==OWNER_UID)return;
  started=true;
  stopUsers=onSnapshot(collection(db,'users'),snapshot=>{
    errorMessage='';
    users=snapshot.docs.map(item=>({id:item.id,...item.data()})).sort((a,b)=>{
      const at=a.createdAt?.toMillis?.()||0;
      const bt=b.createdAt?.toMillis?.()||0;
      return bt-at;
    });
    const page=document.getElementById(PAGE_ID);
    if(page)renderList(page,page.querySelector('input')?.value||'');
  },error=>{
    errorMessage=error?.code==='permission-denied'
      ?'صلاحية قراءة جميع المستخدمين للمدير لم تُفعّل في Firestore بعد.'
      :'تعذر تحميل المستخدمين الآن.';
    const page=document.getElementById(PAGE_ID);
    if(page)renderList(page,page.querySelector('input')?.value||'');
  });
}

function schedule(){
  if(!document.querySelector('.mxAdmin'))return;
  ensureStyle();
  ensureButton();
  startDirectory();
  if(location.pathname.startsWith('/admin/users'))openPage();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();
const observer=new MutationObserver(schedule);
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('popstate',()=>{
  if(location.pathname.startsWith('/admin/users'))openPage();
  else document.getElementById(PAGE_ID)?.remove();
});
window.addEventListener('beforeunload',()=>stopUsers?.());
