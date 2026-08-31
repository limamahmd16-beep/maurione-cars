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
    .mxAdminUsersPage{position:fixed;inset:0;z-index:12000;background:#f4f5f7;color:#101216;overflow:auto;direction:rtl;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .mxAdminUsersPage *{box-sizing:border-box}

    .mxAdminUsersHeader{position:sticky;top:0;z-index:6;height:82px;background:rgba(255,255,255,.96);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid rgba(220,223,228,.8);display:grid;grid-template-columns:50px minmax(0,1fr) 50px;align-items:center;padding:8px 14px}
    .mxAdminUsersBack{width:46px;height:46px;border:1px solid #e1e4e8;border-radius:16px;background:#fff;color:#111;font-size:30px;line-height:1;display:grid;place-items:center;padding:0;cursor:pointer;box-shadow:0 5px 14px rgba(15,23,42,.035)}
    .mxAdminUsersTitle{text-align:center;min-width:0}.mxAdminUsersTitle strong{display:block;font-size:23px;font-weight:950;letter-spacing:-.5px}.mxAdminUsersTitle span{display:block;margin-top:4px;color:#9a9ea5;font-size:11px}

    .mxAdminUsersBody{width:min(calc(100% - 20px),940px);margin:0 auto;padding:14px 0 34px}
    .mxAdminUsersOverview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}
    .mxAdminUsersStat{position:relative;overflow:hidden;min-height:78px;border:1px solid #e4e7eb;border-radius:19px;background:#fff;padding:12px 13px;display:flex;flex-direction:column;justify-content:center;gap:6px;box-shadow:0 7px 22px rgba(15,23,42,.025)}
    .mxAdminUsersStat::after{content:'';position:absolute;width:44px;height:44px;border-radius:50%;left:-14px;bottom:-18px;background:#f1f2f4}
    .mxAdminUsersStat span{position:relative;z-index:1;font-size:10px;color:#858a92;font-weight:800}.mxAdminUsersStat strong{position:relative;z-index:1;font-size:24px;line-height:1;color:#14161a;font-weight:950;direction:ltr;text-align:right}
    .mxAdminUsersStat.accent{background:linear-gradient(145deg,#fff9f5,#fff);border-color:#ffd5bf}.mxAdminUsersStat.accent strong{color:#f15b25}.mxAdminUsersStat.accent::after{background:#fff0e7}
    .mxAdminUsersStat.good{background:linear-gradient(145deg,#f8fdf9,#fff)}.mxAdminUsersStat.good strong{color:#24834b}.mxAdminUsersStat.good::after{background:#edf8f0}

    .mxAdminUsersToolbar{position:sticky;top:82px;z-index:5;padding:8px 0 7px;background:linear-gradient(to bottom,rgba(244,245,247,.98) 72%,rgba(244,245,247,0))}
    .mxAdminUsersSearch{height:56px;border:1px solid #dfe3e7;border-radius:18px;background:#fff;display:flex;align-items:center;padding:0 14px;box-shadow:0 8px 24px rgba(15,23,42,.035);gap:10px}
    .mxAdminUsersSearchIcon{width:30px;height:30px;display:grid;place-items:center;color:#858b94;flex:none}.mxAdminUsersSearchIcon::before{content:'⌕';font-size:27px;line-height:1;transform:rotate(-18deg)}
    .mxAdminUsersSearch input{width:100%;height:100%;border:0;outline:0;background:transparent;color:#15171b;font-size:15px;text-align:right;min-width:0}
    .mxAdminUsersSearch input::placeholder{color:#a0a4aa}
    .mxAdminUsersClear{display:none;width:30px;height:30px;border:0;border-radius:10px;background:#f2f3f5;color:#747a82;font-size:18px;cursor:pointer;flex:none}.mxAdminUsersClear.on{display:grid;place-items:center}
    .mxAdminUsersSummary{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:2px 4px 8px;color:#888d94;font-size:11px}.mxAdminUsersSummary strong{color:#17191d;font-size:14px;font-weight:900}

    .mxAdminUsersList{display:grid;gap:9px}
    .mxAdminUserCard{position:relative;border:1px solid #e3e6ea;border-radius:21px;background:#fff;padding:13px;box-shadow:0 8px 26px rgba(15,23,42,.03);display:grid;grid-template-columns:54px minmax(0,1fr);gap:11px;align-items:start;direction:rtl;overflow:hidden}
    .mxAdminUserCard::before{content:'';position:absolute;top:0;right:0;width:4px;height:100%;background:#f15b25;opacity:.8}
    .mxAdminUserAvatar{width:54px;height:54px;border-radius:17px;overflow:hidden;background:linear-gradient(145deg,#fff7f1,#fff0e6);border:1px solid #ffdcc9;color:#ef5b27;display:grid;place-items:center;font-size:20px;font-weight:950;box-shadow:inset 0 0 0 1px rgba(255,255,255,.7)}
    .mxAdminUserAvatar img{width:100%;height:100%;object-fit:cover;display:block}
    .mxAdminUserMain{min-width:0}

    .mxAdminUserHead{display:flex;align-items:flex-start;justify-content:space-between;gap:9px;margin-bottom:9px}
    .mxAdminUserIdentity{min-width:0}.mxAdminUserName{font-size:16px;font-weight:950;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.15px}
    .mxAdminUserBadges{display:flex;flex-wrap:wrap;gap:5px;margin-top:5px}
    .mxAdminUserBadge{display:inline-flex;align-items:center;width:max-content;max-width:100%;padding:4px 8px;border-radius:999px;font-size:9px;font-weight:900;white-space:nowrap}
    .mxAdminUserBadge.role{background:#f1f3f5;color:#686e76}.mxAdminUserBadge.ok{background:#edf8f0;color:#267d49}.mxAdminUserBadge.missing{background:#fff1eb;color:#bf4b24}

    .mxAdminUserContact{display:grid;gap:6px}
    .mxAdminUserContactRow{min-height:44px;border:1px solid #eef0f2;border-radius:13px;background:#fafbfc;padding:7px 8px 7px 10px;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px}
    .mxAdminUserContactText{min-width:0}.mxAdminUserContactText small{display:block;margin-bottom:3px;color:#9a9ea5;font-size:8.5px;font-weight:700}.mxAdminUserContactText span{display:block;color:#1d2024;font-size:12px;line-height:1.35;overflow-wrap:anywhere}.mxAdminUserContactText span[dir='ltr']{text-align:left}
    .mxAdminUserActions{display:flex;gap:5px;align-items:center;flex:none}
    .mxAdminUserAction{height:30px;min-width:43px;border:1px solid #dde1e5;border-radius:10px;background:#fff;color:#565c64;font-size:9px;font-weight:950;padding:0 8px;cursor:pointer;display:grid;place-items:center;text-decoration:none}
    .mxAdminUserAction.wa{color:#177e46;border-color:#cfe9d8;background:#f2fbf5}
    .mxAdminUserAction:active{transform:scale(.97)}

    .mxAdminUserFooter{margin-top:8px;padding:7px 2px 0;border-top:1px solid #f0f1f3;display:flex;flex-wrap:wrap;justify-content:space-between;gap:5px 10px;color:#a0a4aa;font-size:8.5px}.mxAdminUserFooter b{color:#71767e;font-weight:800}

    .mxAdminUsersEmpty{min-height:170px;border:1px dashed #d8dce1;border-radius:21px;background:#fff;color:#787e86;display:grid;place-items:center;text-align:center;padding:24px;line-height:1.8}
    .mxAdminUsersError{border:1px solid #efc9c5;background:#fff3f2;color:#983b34;border-radius:17px;padding:14px;line-height:1.7;font-size:13px}
    .mxAdminUsersToast{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(12px);z-index:13000;background:#17191d;color:#fff;padding:9px 14px;border-radius:999px;font-size:11px;font-weight:850;opacity:0;pointer-events:none;transition:.18s ease;box-shadow:0 8px 24px rgba(0,0,0,.16)}.mxAdminUsersToast.on{opacity:1;transform:translateX(-50%) translateY(0)}

    @media(min-width:860px){.mxAdminUsersList{grid-template-columns:1fr 1fr}.mxAdminUsersBody{padding-top:18px}.mxAdminUserCard{height:100%}}
    @media(max-width:560px){
      .mxAdminUsersHeader{height:78px;padding-left:10px;padding-right:10px}.mxAdminUsersToolbar{top:78px}.mxAdminUsersTitle strong{font-size:21px}.mxAdminUsersTitle span{font-size:10px}
      .mxAdminUsersBody{width:calc(100% - 16px);padding-top:10px}.mxAdminUsersOverview{gap:6px}.mxAdminUsersStat{min-height:70px;padding:10px;border-radius:17px}.mxAdminUsersStat strong{font-size:21px}.mxAdminUsersStat span{font-size:8.8px}
      .mxAdminUsersSearch{height:52px;border-radius:16px}.mxAdminUserCard{grid-template-columns:49px minmax(0,1fr);padding:11px 10px 11px 12px;gap:9px;border-radius:18px}.mxAdminUserAvatar{width:49px;height:49px;border-radius:15px}.mxAdminUserName{font-size:15px}
      .mxAdminUserContactRow{min-height:42px;padding:6px 7px}.mxAdminUserContactText span{font-size:11.5px}.mxAdminUserAction{height:29px;min-width:41px;padding:0 7px}
      .mxAdminUserFooter{font-size:8px}
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
      <div class="mxAdminUsersStat good"><span>لديهم رقم هاتف</span><strong>${new Intl.NumberFormat('en-US').format(withPhone)}</strong></div>
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
    const phoneBadge=rawPhone
      ?'<span class="mxAdminUserBadge ok">رقم مضاف</span>'
      :'<span class="mxAdminUserBadge missing">بدون رقم</span>';

    return `<article class="mxAdminUserCard" data-user-id="${esc(user.id)}">
      <div class="mxAdminUserAvatar">${photo?`<img src="${esc(photo)}" alt="">`:`<span>${initials(name,email)}</span>`}</div>
      <div class="mxAdminUserMain">
        <div class="mxAdminUserHead">
          <div class="mxAdminUserIdentity">
            <div class="mxAdminUserName">${esc(name)}</div>
            <div class="mxAdminUserBadges"><span class="mxAdminUserBadge role">${esc(role)}</span>${phoneBadge}</div>
          </div>
        </div>

        <div class="mxAdminUserContact">
          <div class="mxAdminUserContactRow">
            <div class="mxAdminUserContactText"><small>البريد الإلكتروني</small><span dir="ltr">${esc(email)}</span></div>
            ${email!=='غير مضاف'?`<div class="mxAdminUserActions"><button type="button" class="mxAdminUserAction" data-copy="${esc(email)}">نسخ</button></div>`:''}
          </div>
          <div class="mxAdminUserContactRow">
            <div class="mxAdminUserContactText"><small>رقم الهاتف</small><span dir="ltr">${esc(phone)}</span></div>
            ${rawPhone?`<div class="mxAdminUserActions"><button type="button" class="mxAdminUserAction" data-copy="${esc(rawPhone)}">نسخ</button>${wa?`<a class="mxAdminUserAction wa" href="https://wa.me/${wa}" target="_blank" rel="noreferrer">واتساب</a>`:''}</div>`:''}
          </div>
        </div>

        <div class="mxAdminUserFooter"><span>إنشاء: <b>${esc(created)}</b></span><span>آخر تحديث: <b>${esc(updated)}</b></span></div>
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
    area.value=text;
    area.style.position='fixed';
    area.style.opacity='0';
    document.body.appendChild(area);
    area.select();
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
      <div class="mxAdminUsersToolbar">
        <label class="mxAdminUsersSearch"><span class="mxAdminUsersSearchIcon"></span><input type="search" placeholder="ابحث بالاسم أو البريد أو رقم الهاتف..."><button type="button" class="mxAdminUsersClear" aria-label="مسح البحث">×</button></label>
      </div>
      <div class="mxAdminUsersSummary"><span>الحسابات الظاهرة</span><strong>0</strong></div>
      <div class="mxAdminUsersList"><div class="mxAdminUsersEmpty">جارٍ تحميل المستخدمين...</div></div>
      <div class="mxAdminUsersToast"></div>
    </section>`;
  document.body.appendChild(page);

  const input=page.querySelector('.mxAdminUsersSearch input');
  const clear=page.querySelector('.mxAdminUsersClear');
  page.querySelector('.mxAdminUsersBack')?.addEventListener('click',closePage);
  input?.addEventListener('input',event=>{
    clear?.classList.toggle('on',Boolean(event.target.value));
    renderList(page,event.target.value);
  });
  clear?.addEventListener('click',()=>{
    if(!input)return;
    input.value='';
    clear.classList.remove('on');
    renderList(page,'');
    input.focus();
  });
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
    if(page)renderList(page,page.querySelector('.mxAdminUsersSearch input')?.value||'');
  },error=>{
    errorMessage=error?.code==='permission-denied'
      ?'صلاحية قراءة جميع المستخدمين للمدير لم تُفعّل في Firestore بعد.'
      :'تعذر تحميل المستخدمين الآن.';
    const page=document.getElementById(PAGE_ID);
    if(page)renderList(page,page.querySelector('.mxAdminUsersSearch input')?.value||'');
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
