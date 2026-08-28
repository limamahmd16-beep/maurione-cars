import { auth } from './lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

const OWNER_UID = 'sC94v8XaXmUMHK6eineEy25GIst2';
const ADMIN_PATH = '/admin';
let resolved = false;
let owner = false;

const style = document.createElement('style');
style.id = 'mx-private-admin-guard-style';
style.textContent = `
  html.mxAdminGuardPending #root{visibility:hidden!important}
  .mxDrawer button[data-private-admin-hidden="1"]{display:none!important}
`;
document.head.appendChild(style);

function isAdminPath(){
  return window.location.pathname === ADMIN_PATH || window.location.pathname.startsWith(`${ADMIN_PATH}/`);
}

function hidePublicAdminEntry(){
  document.querySelectorAll('.mxDrawer button').forEach((button)=>{
    if((button.textContent||'').trim().includes('لوحة الإدارة')){
      button.dataset.privateAdminHidden='1';
      button.style.display='none';
      button.setAttribute('aria-hidden','true');
      button.tabIndex=-1;
    }
  });
}

function leaveAdmin(){
  if(!isAdminPath()) return;
  window.history.replaceState({},'', '/');
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function apply(){
  hidePublicAdminEntry();
  if(isAdminPath()){
    if(!resolved){
      document.documentElement.classList.add('mxAdminGuardPending');
      return;
    }
    if(!owner){
      leaveAdmin();
      document.documentElement.classList.remove('mxAdminGuardPending');
      return;
    }
  }
  document.documentElement.classList.remove('mxAdminGuardPending');
}

if(isAdminPath()) document.documentElement.classList.add('mxAdminGuardPending');

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
  if(button && (button.textContent||'').trim().includes('لوحة الإدارة')){
    event.preventDefault();
    event.stopImmediatePropagation();
  }
},true);
