import { auth } from './lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

let observer=null;
let currentUser=null;
let scheduled=false;

function normalizedText(value=''){
  return String(value).replace(/\s+/g,' ').trim();
}

function findLegacyWelcomeLogin(){
  const labels=new Set(['تسجيل الدخول','Sign in','Se connecter','Iniciar sessão']);
  return [...document.querySelectorAll('main > section footer button')].find(button=>labels.has(normalizedText(button.textContent)));
}

function bypassLegacyWelcome(){
  if(!currentUser||currentUser.isAnonymous)return;
  const button=findLegacyWelcomeLogin();
  if(!button)return;
  const main=button.closest('main');
  if(!main||main.classList.contains('userAuthPage')||main.classList.contains('welcomeExactPage'))return;
  button.click();
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    bypassLegacyWelcome();
  });
}

export function initAuthenticatedEntryGuard(){
  if(observer)return;
  onAuthStateChanged(auth,user=>{
    currentUser=user||null;
    schedule();
  });
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{childList:true,subtree:true});
  schedule();
}
