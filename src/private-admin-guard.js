const ADMIN_LABEL='لوحة التحكم';

function isAdminEntry(button){
  const value=(button?.textContent||'').trim();
  return value.includes('لوحة الإدارة')||value.includes(ADMIN_LABEL);
}

function hidePublicAdminEntry(){
  if(window.location.pathname==='/admin'||window.location.pathname.startsWith('/admin/'))return;
  document.querySelectorAll('.mxDrawer button').forEach(button=>{
    if(!isAdminEntry(button))return;
    button.style.display='none';
    button.setAttribute('aria-hidden','true');
    button.tabIndex=-1;
  });
}

let raf=0;
function schedule(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(hidePublicAdminEntry);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();

const root=document.getElementById('root');
if(root){
  const observer=new MutationObserver(schedule);
  observer.observe(root,{childList:true,subtree:true});
}
