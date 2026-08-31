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

function icon(type){
  const common='width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  if(type==='mail')return `<svg ${common}><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>`;
  if(type==='phone')return `<svg ${common}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"></path></svg>`;
  if(type==='copy')return `<svg ${common}><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
  if(type==='search')return `<svg ${common}><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>`;
  if(type==='users')return `<svg ${common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;
  if(type==='check')return `<svg ${common}><path d="m5 12 4 4L19 6"></path></svg>`;
  if(type==='alert')return `<svg ${common}><circle cx="12" cy="12" r="9"></circle><path d="M12 8v5"></path><path d="M12 16h.01"></path></svg>`;
  return '';
}

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .mxAdminUsersButton{background:#fff!important;color:#15171b!important;border:1px solid #dfe3e8!important}
    .mxAdminUsersPage{position:fixed;inset:0;z-index:12000;background:#f7f7f8;color:#111318;overflow:auto;direction:rtl;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .mxAdminUsersPage *{box-sizing:border-box}

    .mxAdminUsersHeader{position:sticky;top:0;z-index:8;height:86px;background:rgba(255,255,255,.93);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-bottom:1px solid rgba(226,228,232,.8);display:grid;grid-template-columns:52px minmax(0,1fr) 52px;align-items:center;padding:9px 16px}
    .mxAdminUsersBack{width:48px;height:48px;border:1px solid #e1e4e8;border-radius:17px;background:#fff;color:#111318;font-size:30px;line-height:1;display:grid;place-items:center;padding:0;cursor:pointer;box-shadow:0 7px 22px rgba(15,23,42,.045)}
    .mxAdminUsersTitle{text-align:center;min-width:0}.mxAdminUsersTitle strong{display:block;font-size:23px;font-weight:950;letter-spacing:-.55px}.mxAdminUsersTitle span{display:block;margin-top:4px;color:#989ca4;font-size:10.5px;font-weight:650}

    .mxAdminUsersBody{width:min(calc(100% - 20px),960px);margin:0 auto;padding:16px 0 38px}

    .mxAdminUsersOverview{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
    .mxAdminUsersStat{position:relative;overflow:hidden;min-height:82px;border:1px solid #e5e7eb;border-radius:20px;background:#fff;padding:13px 14px;display:flex;flex-direction:column;justify-content:center;gap:7px;box-shadow:0 8px 24px rgba(15,23,42,.03)}
    .mxAdminUsersStat::after{content:'';position:absolute;width:66px;height:66px;border-radius:50%;left:-22px;bottom:-30px;background:#f2f3f5}
    .mxAdminUsersStatHead{position:relative;z-index:1;display:flex;align-items:center;gap:7px;color:#858a92}.mxAdminUsersStatIcon{width:27px;height:27px;border-radius:9px;background:#f3f4f6;display:grid;place-items:center;flex:none}.mxAdminUsersStatIcon svg{width:14px;height:14px}.mxAdminUsersStat span{font-size:9.5px;font-weight:800}
    .mxAdminUsersStat strong{position:relative;z-index:1;font-size:24px;line-height:1;color:#15171b;font-weight:950;direction:ltr;text-align:right}
    .mxAdminUsersStat.total{grid-column:1/-1;min-height:96px;background:linear-gradient(135deg,#fff7f1 0%,#fff 72%);border-color:#ffd4bd}
    .mxAdminUsersStat.total .mxAdminUsersStatIcon{background:#ffede3;color:#ec5a25}.mxAdminUsersStat.total strong{font-size:30px;color:#ee5b25}.mxAdminUsersStat.total::after{width:100px;height:100px;left:-28px;bottom:-52px;background:#fff0e7}
    .mxAdminUsersStat.good .mxAdminUsersStatIcon{background:#edf8f0;color:#277e49}.mxAdminUsersStat.good strong{color:#267d49}.mxAdminUsersStat.good::after{background:#edf8f0}
    .mxAdminUsersStat.missing .mxAdminUsersStatIcon{background:#fff1eb;color:#bd4e26}.mxAdminUsersStat.missing::after{background:#fff2ec}

    .mxAdminUsersToolbar{position:sticky;top:86px;z-index:7;padding:7px 0 8px;background:linear-gradient(to bottom,rgba(247,247,248,.98) 72%,rgba(247,247,248,0))}
    .mxAdminUsersSearch{height:56px;border:1px solid #e0e3e7;border-radius:19px;background:#fff;display:flex;align-items:center;padding:0 13px;box-shadow:0 9px 26px rgba(15,23,42,.04);gap:10px}
    .mxAdminUsersSearchIcon{width:34px;height:34px;border-radius:11px;background:#f5f6f7;color:#777d85;display:grid;place-items:center;flex:none}.mxAdminUsersSearchIcon svg{width:17px;height:17px}
    .mxAdminUsersSearch input{width:100%;height:100%;border:0;outline:0;background:transparent;color:#15171b;font-size:14.5px;text-align:right;min-width:0}.mxAdminUsersSearch input::placeholder{color:#a2a6ad}
    .mxAdminUsersClear{display:none;width:30px;height:30px;border:0;border-radius:9px;background:#f1f2f4;color:#737982;font-size:18px;cursor:pointer;flex:none}.mxAdminUsersClear.on{display:grid;place-items:center}
    .mxAdminUsersSummary{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:2px 5px 9px;color:#8b9098;font-size:10px}.mxAdminUsersSummary strong{color:#17191d;font-size:12px;font-weight:900}

    .mxAdminUsersList{display:grid;gap:9px}
    .mxAdminUserCard{position:relative;border:1px solid #e5e7eb;border-radius:22px;background:#fff;padding:14px;box-shadow:0 9px 28px rgba(15,23,42,.035);direction:rtl;overflow:hidden}
    .mxAdminUserCard::before{content:'';position:absolute;inset:0 auto 0 0;width:3px;background:linear-gradient(#ff7a3d,#ef5b25);opacity:.88}
    .mxAdminUserHead{display:grid;grid-template-columns:56px minmax(0,1fr);gap:11px;align-items:center}
    .mxAdminUserAvatar{width:56px;height:56px;border-radius:18px;overflow:hidden;background:linear-gradient(145deg,#fff7f1,#ffede2);border:1px solid #ffdac5;color:#ee5b25;display:grid;place-items:center;font-size:20px;font-weight:950;box-shadow:inset 0 0 0 1px rgba(255,255,255,.8)}
    .mxAdminUserAvatar img{width:100%;height:100%;object-fit:cover;display:block}
    .mxAdminUserIdentity{min-width:0}.mxAdminUserName{font-size:16px;font-weight:950;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.2px}
    .mxAdminUserBadges{display:flex;flex-wrap:wrap;gap:5px;margin-top:6px}.mxAdminUserBadge{display:inline-flex;align-items:center;gap:4px;width:max-content;max-width:100%;padding:4px 8px;border-radius:999px;font-size:8.7px;font-weight:900;white-space:nowrap}.mxAdminUserBadge svg{width:11px;height:11px}.mxAdminUserBadge.role{background:#f2f3f5;color:#686e76}.mxAdminUserBadge.ok{background:#edf8f0;color:#267d49}.mxAdminUserBadge.missing{background:#fff1eb;color:#bd4e26}

    .mxAdminUserContact{display:grid;gap:7px;margin-top:12px}
    .mxAdminUserContactRow{min-height:52px;border:1px solid #eef0f2;border-radius:15px;background:#fbfbfc;padding:7px 8px;display:grid;grid-template-columns:36px minmax(0,1fr) auto;align-items:center;gap:8px}
    .mxAdminUserContactIcon{width:34px;height:34px;border-radius:11px;background:#f1f3f5;color:#777d85;display:grid;place-items:center}.mxAdminUserContactIcon svg{width:16px;height:16px}
    .mxAdminUserContactText{min-width:0}.mxAdminUserContactText small{display:block;margin-bottom:3px;color:#a0a4aa;font-size:8px;font-weight:750}.mxAdminUserContactText span{display:block;color:#202328;font-size:12px;line-height:1.35;overflow-wrap:anywhere}.mxAdminUserContactText span[dir='ltr']{text-align:left}
    .mxAdminUserActions{display:flex;align-items:center;gap:5px;flex:none}
    .mxAdminUserAction{height:32px;min-width:38px;border:1px solid #e0e3e7;border-radius:10px;background:#fff;color:#5c6269;font-size:9px;font-weight:900;padding:0 8px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;text-decoration:none}.mxAdminUserAction svg{width:13px;height:13px}.mxAdminUserAction.wa{color:#177e46;border-color:#cde7d6;background:#f1faf4}.mxAdminUserAction.wa img{width:14px;height:14px;display:block}.mxAdminUserAction:active{transform:scale(.97)}

    .mxAdminUserFooter{margin-top:10px;padding-top:9px;border-top:1px solid #f0f1f3;display:flex;flex-wrap:wrap;justify-content:space-between;gap:5px 12px;color:#a0a4aa;font-size:8.3px}.mxAdminUserFooter b{color:#737880;font-weight:850}

    .mxAdminUsersEmpty{min-height:170px;border:1px dashed #d8dce1;border-radius:22px;background:#fff;color:#787e86;display:grid;place-items:center;text-align:center;padding:24px;line-height:1.8}
    .mxAdminUsersError{border:1px solid #efc9c5;background:#fff3f2;color:#983b34;border-radius:18px;padding:14px;line-height:1.7;font-size:13px}
    .mxAdminUsersToast{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom));transform:translateX(-50%) translateY(12px);z-index:13000;background:#17191d;color:#fff;padding:9px 14px;border-radius:999px;font-size:10px;font-weight:850;opacity:0;pointer-events:none;transition:.18s ease;box-shadow:0 8px 24px rgba(0,0,0,.16)}.mxAdminUsersToast.on{opacity:1;transform:translateX(-50%) translateY(0)}

    @media(min-width:860px){.mxAdminUsersOverview{grid-template-columns:1.2fr 1fr 1fr}.mxAdminUsersStat.total{grid-column:auto}.mxAdminUsersList{grid-template-columns:1fr 1fr}.mxAdminUsersBody{padding-top:19px}.mxAdminUserCard{height:100%}}
    @media(max-width:560px){
      .mxAdminUsersHeader{height:80px;padding-left:10px;padding-right:10px}.mxAdminUsersToolbar{top:80px}.mxAdminUsersTitle strong{font-size:21px}.mxAdminUsersTitle span{font-size:9.8px}
      .mxAdminUsersBody{width:calc(100% - 16px);padding-top:10px}.mxAdminUsersOverview{gap:7px}.mxAdminUsersStat{min-height:74px;padding:11px 12px;border-radius:18px}.mxAdminUsersStat.total{min-height:84px}.mxAdminUsersStat.total strong{font-size:27px}.mxAdminUsersStat strong{font-size:21px}.mxAdminUsersStat span{font-size:8.8px}
      .mxAdminUsersSearch{height:52px;border-radius:17px}.mxAdminUsersSearchIcon{width:32px;height:32px}
      .mxAdminUserCard{padding:12px;border-radius:19px}.mxAdminUserHead{grid-template-columns:51px minmax(0,1fr);gap:9px}.mxAdminUserAvatar{width:51px;height:51px;border-radius:16px}.mxAdminUserName{font-size:15px}
      .mxAdminUserContactRow{grid-template-columns:33px minmax(0,1fr) auto;min-height:49px;padding:6px 7px;gap:6px}.mxAdminUserContactIcon{width:31px;height:31px;border-radius:10px}.mxAdminUserContactText span{font-size:11.2px}.mxAdminUserAction{height:30px;min-width:34px;padding:0 7px;font-size:8.5px}
      .mxAdminUserFooter{font-size:7.9px}
    }
  `;
  document.head.appendChild(style);
}

function summaryHtml(filteredCount){
  const withPhone=users.filter(user=>Boolean(userPhone(user))).length;
  const withoutPhone=Math.max(0,users.length-withPhone);
  return {
    overview:`
      <div class="mxAdminUsersStat total">
        <div class="mxAdminUsersStatHead"><span class="mxAdminUsersStatIcon">${icon('users')}</span><span>إجمالي المستخدمين</span></div>
        <strong>${new Intl.NumberFormat('en-US').format(users.length)}</strong>
      </div>
      <div class="mxAdminUsersStat good">
        <div class="mxAdminUsersStatHead"><span class="mxAdminUsersStatIcon">${icon('check')}</span><span>لديهم رقم هاتف</span></div>
        <strong>${new Intl.NumberFormat('en-US').format(withPhone)}</strong>
      </div>
      <div class="mxAdminUsersStat missing">
        <div class="mxAdminUsersStatHead"><span class="mxAdminUsersStatIcon">${icon('alert')}</span><span>بدون رقم هاتف</span></div>
        <strong>${new Intl.NumberFormat('en-US').format(withoutPhone)}</strong>
      </div>`,
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
      ?`<span class="mxAdminUserBadge ok">${icon('check')} رقم مضاف</span>`
      :`<span class="mxAdminUserBadge missing">${icon('alert')} بدون رقم</span>`;

    return `<article class="mxAdminUserCard" data-user-id="${esc(user.id)}">
      <div class="mxAdminUserHead">
        <div class="mxAdminUserAvatar">${photo?`<img src="${esc(photo)}" alt="">`:`<span>${initials(name,email)}</span>`}</div>
        <div class="mxAdminUserIdentity">
          <div class="mxAdminUserName">${esc(name)}</div>
          <div class="mxAdminUserBadges"><span class="mxAdminUserBadge role">${esc(role)}</span>${phoneBadge}</div>
        </div>
      </div>

      <div class="mxAdminUserContact">
        <div class="mxAdminUserContactRow">
          <span class="mxAdminUserContactIcon">${icon('mail')}</span>
          <div class="mxAdminUserContactText"><small>البريد الإلكتروني</small><span dir="ltr">${esc(email)}</span></div>
          ${email!=='غير مضاف'?`<div class="mxAdminUserActions"><button type="button" class="mxAdminUserAction" data-copy="${esc(email)}">${icon('copy')}<span>نسخ</span></button></div>`:''}
        </div>
        <div class="mxAdminUserContactRow">
          <span class="mxAdminUserContactIcon">${icon('phone')}</span>
          <div class="mxAdminUserContactText"><small>رقم الهاتف</small><span dir="ltr">${esc(phone)}</span></div>
          ${rawPhone?`<div class="mxAdminUserActions"><button type="button" class="mxAdminUserAction" data-copy="${esc(rawPhone)}">${icon('copy')}<span>نسخ</span></button>${wa?`<a class="mxAdminUserAction wa" href="https://wa.me/${wa}" target="_blank" rel="noreferrer"><img src="/whatsapp-icon.svg?v=35" alt=""><span>واتساب</span></a>`:''}</div>`:''}
        </div>
      </div>

      <div class="mxAdminUserFooter"><span>إنشاء الحساب: <b>${esc(created)}</b></span><span>آخر تحديث: <b>${esc(updated)}</b></span></div>
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
      <div class="mxAdminUsersTitle"><strong>المستخدمون</strong><span>إدارة حسابات MauriOne</span></div>
      <span></span>
    </header>
    <section class="mxAdminUsersBody">
      <div class="mxAdminUsersOverview"></div>
      <div class="mxAdminUsersToolbar">
        <label class="mxAdminUsersSearch"><span class="mxAdminUsersSearchIcon">${icon('search')}</span><input type="search" placeholder="ابحث بالاسم أو البريد أو رقم الهاتف..."><button type="button" class="mxAdminUsersClear" aria-label="مسح البحث">×</button></label>
      </div>
      <div class="mxAdminUsersSummary"><span>الحسابات الظاهرة</span><strong>0</strong></div>
      <div class="mxAdminUsersList"><div class="mxAdminUsersEmpty">جارٍ تحميل المستخدمين...</div></div>
    </section>
    <div class="mxAdminUsersToast" role="status"></div>`;
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
