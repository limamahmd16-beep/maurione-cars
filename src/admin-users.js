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

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .mxAdminUsersButton{background:#fff!important;color:#15171b!important;border:1px solid #dfe3e8!important}
    .mxAdminUsersPage{position:fixed;inset:0;z-index:12000;background:#f6f7f8;color:#111;overflow:auto;direction:rtl;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .mxAdminUsersHeader{position:sticky;top:0;z-index:4;height:92px;background:rgba(255,255,255,.97);backdrop-filter:blur(16px);border-bottom:1px solid #eceef1;display:grid;grid-template-columns:52px minmax(0,1fr) 52px;align-items:center;padding:10px 16px}
    .mxAdminUsersBack{width:48px;height:48px;border:1px solid #e3e6ea;border-radius:15px;background:#fff;color:#111;font-size:30px;line-height:1;display:grid;place-items:center;padding:0}
    .mxAdminUsersTitle{text-align:center;min-width:0}.mxAdminUsersTitle strong{display:block;font-size:24px;font-weight:900}.mxAdminUsersTitle span{display:block;margin-top:4px;color:#8a8f97;font-size:12px}
    .mxAdminUsersBody{width:min(calc(100% - 22px),760px);margin:0 auto;padding:18px 0 34px}
    .mxAdminUsersSearch{height:54px;border:1px solid #e0e3e7;border-radius:17px;background:#fff;display:flex;align-items:center;padding:0 15px;margin-bottom:14px;box-shadow:0 6px 18px rgba(15,23,42,.035)}
    .mxAdminUsersSearch input{width:100%;height:100%;border:0;outline:0;background:transparent;color:#111;font-size:15px;text-align:right}
    .mxAdminUsersSummary{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:0 2px 12px;color:#777d86;font-size:12px}.mxAdminUsersSummary strong{color:#111;font-size:16px}
    .mxAdminUsersList{display:grid;gap:10px}
    .mxAdminUserCard{border:1px solid #e6e8ec;border-radius:20px;background:#fff;padding:14px;box-shadow:0 7px 22px rgba(15,23,42,.035);display:grid;grid-template-columns:64px minmax(0,1fr);gap:13px;align-items:start;direction:rtl}
    .mxAdminUserAvatar{width:64px;height:64px;border-radius:18px;overflow:hidden;background:#fff3ec;border:1px solid #ffe0d1;color:#ff5a12;display:grid;place-items:center;font-size:23px;font-weight:900}
    .mxAdminUserAvatar img{width:100%;height:100%;object-fit:cover;display:block}
    .mxAdminUserInfo{min-width:0;display:grid;gap:7px}.mxAdminUserName{font-size:17px;font-weight:900;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mxAdminUserMeta{display:grid;grid-template-columns:1fr 1fr;gap:7px}.mxAdminUserMeta div{min-width:0;border:1px solid #eff0f2;border-radius:12px;background:#fafbfc;padding:8px 10px;display:grid;gap:3px}
    .mxAdminUserMeta small{font-size:10px;color:#92969d}.mxAdminUserMeta span{font-size:12px;color:#24272b;line-height:1.4;overflow-wrap:anywhere}
    .mxAdminUserRole{display:inline-flex;width:max-content;max-width:100%;padding:5px 9px;border-radius:999px;background:#eef9f2;color:#27814c;font-size:10px;font-weight:800}
    .mxAdminUsersEmpty{min-height:180px;border:1px dashed #d9dde3;border-radius:20px;background:#fff;color:#777d86;display:grid;place-items:center;text-align:center;padding:24px;line-height:1.8}
    .mxAdminUsersError{border:1px solid #f0cbc7;background:#fff3f2;color:#9d3c34;border-radius:16px;padding:14px;line-height:1.7;font-size:13px}
    @media(max-width:540px){.mxAdminUsersHeader{height:84px}.mxAdminUsersBody{width:calc(100% - 18px);padding-top:12px}.mxAdminUserCard{grid-template-columns:58px minmax(0,1fr);padding:12px}.mxAdminUserAvatar{width:58px;height:58px;border-radius:16px}.mxAdminUserMeta{grid-template-columns:1fr}.mxAdminUserName{font-size:16px}}
  `;
  document.head.appendChild(style);
}

function userPhoto(user){
  return user.photoURL||user.photoUrl||user.photo||user.avatar||user.image||'';
}
function userPhone(user){
  return user.phone||user.phoneNumber||user.mobile||user.whatsapp||'';
}

function renderList(page,query=''){
  const host=page.querySelector('.mxAdminUsersList');
  const summary=page.querySelector('.mxAdminUsersSummary');
  if(!host||!summary)return;

  if(errorMessage){
    summary.innerHTML='<span>تعذر تحميل القائمة</span><strong>—</strong>';
    host.innerHTML=`<div class="mxAdminUsersError">${esc(errorMessage)}</div>`;
    return;
  }

  const q=String(query||'').trim().toLowerCase();
  const filtered=users.filter(user=>{
    if(!q)return true;
    return [user.name,user.email,user.phone,user.phoneNumber,user.role,user.id].some(v=>String(v||'').toLowerCase().includes(q));
  });
  summary.innerHTML=`<span>الحسابات المسجلة</span><strong>${new Intl.NumberFormat('en-US').format(filtered.length)}</strong>`;

  if(!filtered.length){
    host.innerHTML='<div class="mxAdminUsersEmpty">لا توجد حسابات مطابقة.</div>';
    return;
  }

  host.innerHTML=filtered.map(user=>{
    const name=user.name||user.displayName||'مستخدم MauriOne';
    const email=user.email||'غير مضاف';
    const phone=userPhone(user)||'غير مضاف';
    const photo=userPhoto(user);
    const role=user.role==='admin'?'مدير':'مستخدم';
    const created=dateText(user.createdAt);
    const updated=dateText(user.updatedAt);
    return `<article class="mxAdminUserCard">
      <div class="mxAdminUserAvatar">${photo?`<img src="${esc(photo)}" alt="">`:`<span>${initials(name,email)}</span>`}</div>
      <div class="mxAdminUserInfo">
        <div class="mxAdminUserName">${esc(name)}</div>
        <span class="mxAdminUserRole">${esc(role)}</span>
        <div class="mxAdminUserMeta">
          <div><small>البريد الإلكتروني</small><span dir="ltr">${esc(email)}</span></div>
          <div><small>رقم الهاتف</small><span dir="ltr">${esc(phone)}</span></div>
          <div><small>تاريخ إنشاء الحساب</small><span>${esc(created)}</span></div>
          <div><small>آخر تحديث للملف</small><span>${esc(updated)}</span></div>
        </div>
      </div>
    </article>`;
  }).join('');
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
      <div class="mxAdminUsersTitle"><strong>المستخدمون</strong><span>بيانات حسابات MauriOne</span></div>
      <span></span>
    </header>
    <section class="mxAdminUsersBody">
      <label class="mxAdminUsersSearch"><input type="search" placeholder="ابحث بالاسم أو البريد أو الهاتف..."></label>
      <div class="mxAdminUsersSummary"><span>الحسابات المسجلة</span><strong>0</strong></div>
      <div class="mxAdminUsersList"><div class="mxAdminUsersEmpty">جارٍ تحميل المستخدمين...</div></div>
    </section>`;
  document.body.appendChild(page);
  page.querySelector('.mxAdminUsersBack')?.addEventListener('click',closePage);
  page.querySelector('input')?.addEventListener('input',event=>renderList(page,event.target.value));
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
