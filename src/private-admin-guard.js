import { auth } from './lib/firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const OWNER_UID = 'sC94v8XaXmUMHK6eineEy25GIst2';
const ADMIN_PATH = '/admin';
const ADMIN_LABEL = 'لوحة التحكم';
let resolved = false;
let owner = false;
let loginUi = null;

function isAdminPath(){
  return window.location.pathname === ADMIN_PATH || window.location.pathname.startsWith(`${ADMIN_PATH}/`);
}

if(isAdminPath()){
  try{ sessionStorage.setItem('maurione_guest','1'); }catch{}
  document.body?.classList.add('mxPrivateAdminPath');
}

const style = document.createElement('style');
style.id = 'mx-private-admin-guard-style';
style.textContent = `
  .mxDrawer button[data-private-admin-hidden="1"]{display:none!important}
  body.mxPrivateAdminPath .mxGlobalWhatsApp{display:none!important}
  .mxPrivateAdminLogin{position:fixed;inset:0;z-index:2147483000;background:#fff;display:flex;align-items:center;justify-content:center;padding:24px;direction:rtl;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
  .mxPrivateAdminLoginCard{width:min(100%,430px);border:1px solid #eceef1;border-radius:28px;padding:30px 24px 24px;background:#fff;box-shadow:0 20px 60px rgba(15,23,42,.10);text-align:center}
  .mxPrivateAdminLogo{font-size:34px;line-height:1;font-weight:900;direction:ltr;margin-bottom:28px;letter-spacing:-1.5px}.mxPrivateAdminLogo b{color:#090909}.mxPrivateAdminLogo i{color:#ff5a12;font-style:normal}
  .mxPrivateAdminLoginCard h1{font-size:26px;margin:0 0 8px;color:#111;font-weight:900}.mxPrivateAdminLoginCard p{margin:0 0 24px;color:#777d86;font-size:14px;line-height:1.7}
  .mxPrivateAdminLoginCard form{display:grid;gap:12px}.mxPrivateAdminLoginCard input{height:52px;border:1px solid #dfe3e8;border-radius:15px;padding:0 15px;font-size:16px;background:#fff;color:#111;outline:none;text-align:right}.mxPrivateAdminLoginCard input:focus{border-color:#ff7a3d;box-shadow:0 0 0 3px rgba(255,90,18,.10)}
  .mxPrivateAdminLoginCard button{height:52px;border:0;border-radius:15px;background:#ff5a12;color:#fff;font-size:17px;font-weight:900;cursor:pointer}.mxPrivateAdminLoginCard button:disabled{opacity:.65}
  .mxPrivateAdminError{min-height:22px;margin-top:10px;color:#c62828;font-size:13px;font-weight:700}.mxPrivateAdminBack{display:inline-block;margin-top:14px;color:#737982;font-size:13px;text-decoration:none}
`;
document.head.appendChild(style);

function isAdminEntry(button){
  const value=(button?.textContent||'').trim();
  return value.includes('لوحة الإدارة') || value.includes(ADMIN_LABEL);
}

function hidePublicAdminEntry(){
  document.querySelectorAll('.mxDrawer button').forEach((button)=>{
    if(isAdminEntry(button)){
      button.dataset.privateAdminHidden='1';
      button.style.display='none';
      button.setAttribute('aria-hidden','true');
      button.tabIndex=-1;
    }
  });
}

function setPageIdentity(){
  if(isAdminPath()){
    document.title=`${ADMIN_LABEL} | MauriOne`;
    const appleTitle=document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if(appleTitle) appleTitle.setAttribute('content',ADMIN_LABEL);
  }else{
    document.title='MauriOne السيارات | معرض السيارات';
  }
}

function removeLogin(){
  loginUi?.remove();
  loginUi=null;
}

function showLogin(message=''){
  if(!isAdminPath()) return;
  if(!loginUi){
    loginUi=document.createElement('div');
    loginUi.className='mxPrivateAdminLogin';
    loginUi.innerHTML=`<section class="mxPrivateAdminLoginCard"><div class="mxPrivateAdminLogo"><b>Mauri</b><i>One</i></div><h1>${ADMIN_LABEL}</h1><p>تسجيل دخول المالك فقط</p><form><input name="email" type="email" autocomplete="username" placeholder="البريد الإلكتروني" required><input name="password" type="password" autocomplete="current-password" placeholder="كلمة المرور" required><button type="submit">تسجيل الدخول</button></form><div class="mxPrivateAdminError"></div><a class="mxPrivateAdminBack" href="/">العودة إلى الموقع</a></section>`;
    document.body.appendChild(loginUi);
    const form=loginUi.querySelector('form');
    form.addEventListener('submit',async(event)=>{
      event.preventDefault();
      const button=form.querySelector('button');
      const error=loginUi.querySelector('.mxPrivateAdminError');
      const email=form.elements.email.value.trim();
      const password=form.elements.password.value;
      button.disabled=true;
      button.textContent='جارٍ التحقق...';
      error.textContent='';
      try{
        const credential=await signInWithEmailAndPassword(auth,email,password);
        if(credential.user?.uid!==OWNER_UID){
          await signOut(auth);
          throw new Error('NOT_OWNER');
        }
      }catch(err){
        error.textContent=err?.message==='NOT_OWNER'?'هذا الحساب غير مصرح له بالدخول.':'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      }finally{
        button.disabled=false;
        button.textContent='تسجيل الدخول';
      }
    });
  }
  const error=loginUi.querySelector('.mxPrivateAdminError');
  if(error && message) error.textContent=message;
}

function apply(){
  hidePublicAdminEntry();
  setPageIdentity();
  if(!isAdminPath()){
    document.body?.classList.remove('mxPrivateAdminPath');
    removeLogin();
    return;
  }
  document.body?.classList.add('mxPrivateAdminPath');
  if(!resolved) return;
  if(owner){
    removeLogin();
  }else{
    showLogin();
  }
}

if(auth){
  onAuthStateChanged(auth,(user)=>{
    resolved=true;
    owner=Boolean(user && !user.isAnonymous && user.uid===OWNER_UID);
    apply();
  });
}else{
  resolved=true;
  owner=false;
  apply();
}

const observer = new MutationObserver(apply);
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('popstate',apply);

document.addEventListener('click',(event)=>{
  const button=event.target.closest?.('.mxDrawer button');
  if(button && isAdminEntry(button)){
    event.preventDefault();
    event.stopImmediatePropagation();
  }
},true);

apply();
