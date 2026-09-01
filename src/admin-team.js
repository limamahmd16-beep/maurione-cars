import { auth } from './lib/firebase.js';

const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';
const STYLE_ID='mx-admin-team-style';
const PAGE_ID='mxAdminTeamPage';
const BUTTON_CLASS='mxAdminTeamButton';

const PERMISSIONS=[
  ['analyticsView','الإحصائيات','مشاهدة إحصائيات الزوار وتفاعل العملاء'],
  ['carsView','عرض السيارات','مشاهدة بيانات السيارات داخل الإدارة'],
  ['carsCreate','إضافة السيارات','إنشاء إعلان سيارة جديد'],
  ['carsEdit','تعديل السيارات','تعديل جميع بيانات السيارة وصورها'],
  ['carsMarkSold','تغيير حالة السيارة','تحديد السيارة كمباعة أو إرجاعها كمتوفرة'],
  ['carsDelete','حذف السيارات','حذف إعلان السيارة نهائيًا'],
  ['usersView','عرض المستخدمين','مشاهدة قائمة مستخدمي الموقع وبيانات التواصل'],
  ['socialExport','تصدير المحتوى','استخدام أدوات تصدير الإعلان ومحتوى الشبكات الاجتماعية'],
];

let staff=[];
let busy=false;
let observer=null;

function esc(value=''){
  return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .${BUTTON_CLASS}{background:#fff!important;color:#15171b!important;border:1px solid #dfe3e8!important}
    .${PAGE_ID}{position:fixed;inset:0;z-index:25000;overflow:auto;background:#f6f7f8;color:#15171b;direction:rtl;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .${PAGE_ID} *{box-sizing:border-box}
    .mxTeamHeader{position:sticky;top:0;z-index:5;min-height:82px;display:grid;grid-template-columns:52px 1fr 52px;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,.94);backdrop-filter:blur(18px);border-bottom:1px solid #e7e9ed}
    .mxTeamHeader h1{margin:0;text-align:center;font-size:22px;font-weight:950}.mxTeamHeader h1 small{display:block;margin-top:4px;color:#959aa2;font-size:10px;font-weight:700}
    .mxTeamBack{width:46px;height:46px;border-radius:15px;border:1px solid #e1e4e8;background:#fff;color:#17191d;font-size:28px;display:grid;place-items:center;cursor:pointer}
    .mxTeamBody{width:min(calc(100% - 18px),920px);margin:0 auto;padding:16px 0 42px}
    .mxTeamHero{border:1px solid #ffd7c3;border-radius:22px;padding:16px;background:linear-gradient(135deg,#fff6f0,#fff);margin-bottom:12px}.mxTeamHero strong{display:block;font-size:19px}.mxTeamHero p{margin:6px 0 0;color:#858a92;font-size:12px;line-height:1.7}
    .mxTeamAdd{width:100%;min-height:54px;border:0;border-radius:17px;background:#f4632c;color:#fff;font-size:15px;font-weight:900;cursor:pointer;margin-bottom:12px}
    .mxTeamList{display:grid;gap:10px}.mxTeamCard{border:1px solid #e4e7eb;border-radius:21px;background:#fff;padding:14px;box-shadow:0 8px 28px rgba(15,23,42,.035)}
    .mxTeamCardHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.mxTeamIdentity{min-width:0}.mxTeamIdentity strong{display:block;font-size:16px;font-weight:950}.mxTeamIdentity span{display:block;color:#90959d;font-size:11px;margin-top:5px;direction:ltr;text-align:right}.mxTeamRole{display:inline-flex!important;width:max-content!important;direction:rtl!important;padding:5px 9px;border-radius:999px;background:#f1f3f5;color:#676d75!important;font-size:9px!important;font-weight:900;margin-top:7px!important}
    .mxTeamStatus{padding:6px 9px;border-radius:999px;font-size:9px;font-weight:900;background:#eaf7ef;color:#247a46;white-space:nowrap}.mxTeamStatus.off{background:#fff0ec;color:#b54e2a}
    .mxTeamPerms{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px;padding-top:11px;border-top:1px solid #f0f1f3}.mxTeamPerm{padding:5px 8px;border-radius:999px;background:#f6f7f8;color:#747a82;font-size:8px;font-weight:850}.mxTeamPerm.on{background:#fff0e7;color:#e75b24}
    .mxTeamActions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-top:12px}.mxTeamActions button{min-height:39px;border:1px solid #e1e4e8;border-radius:12px;background:#fff;color:#444a51;font-size:10px;font-weight:900;cursor:pointer}.mxTeamActions button.danger{color:#b63d36;border-color:#f0cac7;background:#fff6f5}.mxTeamActions button.primary{color:#e85b25;border-color:#ffd1bc;background:#fff7f2}
    .mxTeamEmpty{min-height:180px;border:1px dashed #d9dde2;border-radius:22px;background:#fff;display:grid;place-items:center;text-align:center;color:#858b93;padding:25px;line-height:1.8}
    .mxTeamModal{position:fixed;inset:0;z-index:26000;background:rgba(15,23,42,.38);display:grid;place-items:end center;padding:10px}.mxTeamSheet{width:min(100%,620px);max-height:90dvh;overflow:auto;border-radius:24px;background:#fff;border:1px solid #e5e7eb;padding:17px}.mxTeamSheetHead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:14px}.mxTeamSheetHead h2{margin:0;font-size:20px}.mxTeamClose{width:40px;height:40px;border:1px solid #e1e4e8;border-radius:12px;background:#f7f8f9;font-size:24px;cursor:pointer}
    .mxTeamForm{display:grid;gap:10px}.mxTeamForm label{display:grid;gap:6px;color:#666c74;font-size:11px;font-weight:800}.mxTeamForm input{width:100%;height:48px;border:1px solid #dfe3e8;border-radius:14px;padding:0 13px;background:#fff;color:#17191d;font-size:14px;outline:none;text-align:right}.mxTeamForm input[dir=ltr]{text-align:left}.mxTeamHint{color:#9a9fa6;font-size:9px;line-height:1.6}
    .mxTeamPermEditor{display:grid;gap:7px;margin-top:4px}.mxTeamPermRow{min-height:59px;border:1px solid #e8eaed;border-radius:14px;background:#fafbfc;padding:9px 11px;display:flex;justify-content:space-between;align-items:center;gap:10px}.mxTeamPermText strong{display:block;font-size:12px;color:#292d32}.mxTeamPermText small{display:block;color:#969ba3;font-size:9px;margin-top:3px;line-height:1.5}.mxTeamCheck{width:23px;height:23px;accent-color:#f4632c;flex:none}
    .mxTeamSave{width:100%;height:51px;border:0;border-radius:15px;background:#f4632c;color:#fff;font-size:14px;font-weight:900;cursor:pointer;margin-top:4px}.mxTeamSave:disabled{opacity:.55}
    .mxTeamError{padding:10px 12px;border-radius:12px;background:#fff1ef;color:#a13d34;border:1px solid #efcac5;font-size:11px;line-height:1.6}
    .mxTeamPasswordBox{padding:11px 12px;border-radius:13px;background:#fff8f3;border:1px solid #ffd9c7;color:#95502f;font-size:10px;line-height:1.7}
    @media(max-width:560px){.mxTeamActions{grid-template-columns:1fr 1fr}.mxTeamBody{width:calc(100% - 14px)}.mxTeamSheet{padding:14px;border-radius:20px}}
    html[data-theme='dark'] .${PAGE_ID}{background:#0d0f12;color:#f4f5f7}html[data-theme='dark'] .mxTeamHeader{background:rgba(13,15,18,.94);border-color:#2c3138}html[data-theme='dark'] .mxTeamBack,html[data-theme='dark'] .mxTeamCard,html[data-theme='dark'] .mxTeamEmpty,html[data-theme='dark'] .mxTeamSheet,html[data-theme='dark'] .mxTeamActions button,html[data-theme='dark'] .mxTeamForm input{background:#15181c;color:#f4f5f7;border-color:#333840}html[data-theme='dark'] .mxTeamHero{background:linear-gradient(135deg,#251710,#15181c);border-color:#61311e}html[data-theme='dark'] .mxTeamPermRow{background:#111419;border-color:#30353c}html[data-theme='dark'] .mxTeamPermText strong{color:#f3f4f6}html[data-theme='dark'] .mxTeamRole,html[data-theme='dark'] .mxTeamPerm{background:#23272d;color:#a9afb8!important}
  `;
  document.head.appendChild(style);
}

async function ownerToken(){
  if(!auth?.currentUser||auth.currentUser.uid!==OWNER_UID)throw new Error('OWNER_REQUIRED');
  return auth.currentUser.getIdToken();
}

async function api(body){
  const token=await ownerToken();
  const response=await fetch('/api/staff-manage',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
    body:JSON.stringify(body),
  });
  const data=await response.json().catch(()=>({ok:false,error:'INVALID_RESPONSE'}));
  if(!response.ok||!data.ok){
    const error=new Error(data.error||'REQUEST_FAILED');
    error.code=data.error||'REQUEST_FAILED';
    throw error;
  }
  return data;
}

function permissionLabels(item){
  return PERMISSIONS.filter(([key])=>item.permissions?.[key]).map(([,label])=>label);
}

function renderList(){
  const root=document.querySelector(`#${PAGE_ID} .mxTeamList`);
  if(!root)return;
  if(!staff.length){
    root.innerHTML='<div class="mxTeamEmpty">لا يوجد أي عضو في الفريق بعد.<br>اضغط «إضافة عضو للفريق» لإنشاء أول حساب.</div>';
    return;
  }
  root.innerHTML=staff.map(item=>{
    const enabled=permissionLabels(item);
    return `<article class="mxTeamCard" data-staff-uid="${esc(item.uid)}">
      <div class="mxTeamCardHead"><div class="mxTeamIdentity"><strong>${esc(item.displayName)}</strong><span>@${esc(item.username)}</span><span class="mxTeamRole">${esc(item.role||'موظف')}</span></div><span class="mxTeamStatus ${item.active?'':'off'}">${item.active?'نشط':'موقوف'}</span></div>
      <div class="mxTeamPerms">${enabled.length?enabled.map(x=>`<span class="mxTeamPerm on">${esc(x)}</span>`).join(''):'<span class="mxTeamPerm">بدون صلاحيات إضافية</span>'}</div>
      <div class="mxTeamActions"><button class="primary" data-team-action="edit">الصلاحيات</button><button data-team-action="password">كلمة المرور</button><button data-team-action="active">${item.active?'إيقاف':'تفعيل'}</button><button class="danger" data-team-action="delete">حذف</button></div>
    </article>`;
  }).join('');
}

async function loadStaff(){
  const root=document.querySelector(`#${PAGE_ID} .mxTeamList`);
  if(root)root.innerHTML='<div class="mxTeamEmpty">جارٍ تحميل الفريق...</div>';
  try{
    const data=await api({action:'list'});
    staff=Array.isArray(data.staff)?data.staff:[];
    renderList();
  }catch(error){
    if(root)root.innerHTML=`<div class="mxTeamError">${error.code==='STAFF_AUTH_NOT_CONFIGURED'?'خدمة حسابات الفريق تحتاج تفعيل مفتاح Firebase Admin في إعدادات الخادم.':'تعذر تحميل أعضاء الفريق.'}</div>`;
  }
}

function closeModal(){document.querySelector('.mxTeamModal')?.remove()}

function permissionEditor(permissions={}){
  return `<div class="mxTeamPermEditor">${PERMISSIONS.map(([key,label,description])=>`<label class="mxTeamPermRow"><span class="mxTeamPermText"><strong>${label}</strong><small>${description}</small></span><input class="mxTeamCheck" type="checkbox" data-perm="${key}" ${permissions?.[key]?'checked':''}></label>`).join('')}</div>`;
}
function collectPermissions(scope){
  const out={dashboardView:true};
  scope.querySelectorAll('[data-perm]').forEach(input=>out[input.dataset.perm]=Boolean(input.checked));
  return out;
}

function openCreate(){
  closeModal();
  const modal=document.createElement('div');modal.className='mxTeamModal';
  modal.innerHTML=`<section class="mxTeamSheet"><div class="mxTeamSheetHead"><h2>إضافة عضو للفريق</h2><button class="mxTeamClose">×</button></div><form class="mxTeamForm">
    <label>اسم الموظف<input name="displayName" required maxlength="80" placeholder="مثال: محمد أحمد"></label>
    <label>اسم المستخدم<input name="username" dir="ltr" required minlength="3" maxlength="40" autocomplete="off" placeholder="mohamed"></label>
    <label>كلمة المرور<input name="password" dir="ltr" type="password" required minlength="8" maxlength="128" autocomplete="new-password" placeholder="8 أحرف على الأقل"><span class="mxTeamHint">الموظف لا يستطيع تغيير كلمة المرور. أنت فقط تستطيع تغييرها من لوحة التحكم.</span></label>
    <label>المسمى الوظيفي<input name="role" required maxlength="60" placeholder="مثال: مسؤول المبيعات"></label>
    <div><strong style="font-size:13px">الصلاحيات</strong>${permissionEditor({carsView:true})}</div><div class="mxTeamFormError"></div><button class="mxTeamSave">إنشاء الحساب</button>
  </form></section>`;
  document.body.appendChild(modal);
  modal.querySelector('.mxTeamClose').onclick=closeModal;
  modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
  modal.querySelector('form').onsubmit=async e=>{
    e.preventDefault();if(busy)return;busy=true;
    const form=e.currentTarget,button=form.querySelector('.mxTeamSave'),errorBox=form.querySelector('.mxTeamFormError');button.disabled=true;errorBox.innerHTML='';
    try{
      await api({action:'create',displayName:form.displayName.value,username:form.username.value,password:form.password.value,role:form.role.value,permissions:collectPermissions(form)});
      closeModal();await loadStaff();
    }catch(error){errorBox.innerHTML=`<div class="mxTeamError">${error.code==='USERNAME_EXISTS'?'اسم المستخدم مستخدم بالفعل.':error.code==='STAFF_AUTH_NOT_CONFIGURED'?'يلزم تفعيل Firebase Admin على الخادم أولًا.':'تعذر إنشاء الحساب. تحقق من البيانات وحاول مجددًا.'}</div>`}finally{busy=false;button.disabled=false}
  };
}

function openEdit(item){
  closeModal();const modal=document.createElement('div');modal.className='mxTeamModal';
  modal.innerHTML=`<section class="mxTeamSheet"><div class="mxTeamSheetHead"><h2>صلاحيات ${esc(item.displayName)}</h2><button class="mxTeamClose">×</button></div><form class="mxTeamForm"><label>اسم الموظف<input name="displayName" value="${esc(item.displayName)}" required maxlength="80"></label><label>المسمى الوظيفي<input name="role" value="${esc(item.role||'موظف')}" required maxlength="60"></label><div><strong style="font-size:13px">الصلاحيات المسموحة</strong>${permissionEditor(item.permissions||{})}</div><div class="mxTeamFormError"></div><button class="mxTeamSave">حفظ الصلاحيات</button></form></section>`;
  document.body.appendChild(modal);modal.querySelector('.mxTeamClose').onclick=closeModal;modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
  modal.querySelector('form').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('.mxTeamSave'),errorBox=form.querySelector('.mxTeamFormError');button.disabled=true;try{await api({action:'update',uid:item.uid,displayName:form.displayName.value,role:form.role.value,permissions:collectPermissions(form)});closeModal();await loadStaff()}catch{errorBox.innerHTML='<div class="mxTeamError">تعذر حفظ الصلاحيات.</div>'}finally{button.disabled=false}};
}

function openPassword(item){
  closeModal();const modal=document.createElement('div');modal.className='mxTeamModal';
  modal.innerHTML=`<section class="mxTeamSheet"><div class="mxTeamSheetHead"><h2>تغيير كلمة المرور</h2><button class="mxTeamClose">×</button></div><form class="mxTeamForm"><div class="mxTeamPasswordBox">أنت تغيّر كلمة مرور <strong>${esc(item.displayName)}</strong>. الموظف لا يملك خيار تغييرها بنفسه.</div><label>كلمة المرور الجديدة<input name="password" dir="ltr" type="password" minlength="8" maxlength="128" required autocomplete="new-password"></label><div class="mxTeamFormError"></div><button class="mxTeamSave">تغيير كلمة المرور</button></form></section>`;
  document.body.appendChild(modal);modal.querySelector('.mxTeamClose').onclick=closeModal;modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
  modal.querySelector('form').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('.mxTeamSave'),errorBox=form.querySelector('.mxTeamFormError');button.disabled=true;try{await api({action:'resetPassword',uid:item.uid,password:form.password.value});closeModal()}catch{errorBox.innerHTML='<div class="mxTeamError">تعذر تغيير كلمة المرور.</div>'}finally{button.disabled=false}};
}

async function handleCardAction(button){
  const card=button.closest('[data-staff-uid]');const item=staff.find(x=>x.uid===card?.dataset.staffUid);if(!item)return;
  const action=button.dataset.teamAction;
  if(action==='edit')return openEdit(item);
  if(action==='password')return openPassword(item);
  if(action==='active'){
    if(!confirm(item.active?`إيقاف حساب ${item.displayName}؟`:`تفعيل حساب ${item.displayName}؟`))return;
    await api({action:'setActive',uid:item.uid,active:!item.active});await loadStaff();return;
  }
  if(action==='delete'){
    if(!confirm(`حذف حساب ${item.displayName} نهائيًا؟`))return;
    await api({action:'delete',uid:item.uid});await loadStaff();
  }
}

function openPage(){
  if(auth?.currentUser?.uid!==OWNER_UID)return;
  ensureStyle();document.getElementById(PAGE_ID)?.remove();
  const page=document.createElement('main');page.id=PAGE_ID;page.className=PAGE_ID;
  page.innerHTML=`<header class="mxTeamHeader"><button class="mxTeamBack">‹</button><h1>الفريق والصلاحيات<small>المالك فقط يستطيع إدارة هذه الصفحة</small></h1><span></span></header><div class="mxTeamBody"><section class="mxTeamHero"><strong>التحكم في فريق MauriOne</strong><p>أنشئ حسابًا لكل موظف وحدد بدقة ما يستطيع رؤيته أو تعديله. لا يستطيع أي موظف تغيير كلمة مروره أو منح نفسه صلاحيات.</p></section><button class="mxTeamAdd">+ إضافة عضو للفريق</button><div class="mxTeamList"></div></div>`;
  document.body.appendChild(page);page.querySelector('.mxTeamBack').onclick=()=>page.remove();page.querySelector('.mxTeamAdd').onclick=openCreate;page.addEventListener('click',e=>{const button=e.target.closest('[data-team-action]');if(button)handleCardAction(button).catch(()=>{})});loadStaff();
}

function ensureButton(){
  if(auth?.currentUser?.uid!==OWNER_UID)return;
  const actions=document.querySelector('.mxAdmin .mxAdminActions');
  if(!actions||actions.querySelector(`.${BUTTON_CLASS}`))return;
  ensureStyle();const button=document.createElement('button');button.type='button';button.className=BUTTON_CLASS;button.textContent='الفريق والصلاحيات';button.onclick=openPage;actions.appendChild(button);
}

function sync(){if(document.querySelector('.mxAdmin'))ensureButton()}
function start(){sync();observer=new MutationObserver(sync);observer.observe(document.documentElement,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('beforeunload',()=>observer?.disconnect(),{once:true});

export { openPage };
