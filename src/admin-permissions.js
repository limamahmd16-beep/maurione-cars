const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';
const STYLE_ID='mx-admin-permission-style';
let observer=null;
let context=null;

function getContext(){
  const current=window.__MAURIONE_ADMIN_CONTEXT__;
  if(current&&current.uid)return current;
  return null;
}
function allowed(name){return Boolean(context?.isOwner||context?.permissions?.[name])}
function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .mxPermissionHidden{display:none!important}
    .mxStaffRoleBadge{display:inline-flex;align-items:center;justify-content:center;min-height:25px;padding:4px 9px;border-radius:999px;background:#fff1e8;color:#e85b25;font-size:9px;font-weight:900;margin-inline-start:7px}
    html[data-theme='dark'] .mxStaffRoleBadge{background:#2b1b14;color:#ff7a3d}
  `;
  document.head.appendChild(style);
}
function hide(node,yes=true){if(node)node.classList.toggle('mxPermissionHidden',Boolean(yes))}
function buttonByText(scope,text){return [...(scope?.querySelectorAll('button')||[])].filter(button=>String(button.textContent||'').includes(text))}
function apply(){
  context=getContext();
  if(!context||!document.querySelector('.mxAdmin'))return;
  ensureStyle();
  const admin=document.querySelector('.mxAdmin');
  const actions=admin.querySelector('.mxAdminActions');
  const panels=admin.querySelectorAll('.mxPanel');

  buttonByText(actions,'إضافة سيارة').forEach(node=>hide(node,!allowed('carsCreate')));
  buttonByText(admin,'إضافة سيارة').forEach(node=>{if(node.closest('.mxAdminQuick'))hide(node,!allowed('carsCreate'))});
  buttonByText(admin,'المستخدمون').forEach(node=>hide(node,!allowed('usersView')));
  admin.querySelectorAll('.mxAdminUsersButton').forEach(node=>hide(node,!allowed('usersView')));
  admin.querySelectorAll('.mxAdminVisitorStats,.mxAdminCarAnalytics,.mxAnalyticsPanel').forEach(node=>hide(node,!allowed('analyticsView')));

  if(panels[0])hide(panels[0],!allowed('carsView'));

  admin.querySelectorAll('.mxAdminList article').forEach(article=>{
    const row=article.querySelector('.mxRowButtons');
    if(!row)return;
    const buttons=[...row.querySelectorAll('button')];
    if(buttons[0])hide(buttons[0],!allowed('carsMarkSold'));
    if(buttons[1])hide(buttons[1],!allowed('carsEdit'));
    if(buttons[2])hide(buttons[2],!allowed('carsDelete'));
  });

  admin.querySelectorAll('[class*="Social"],[class*="social"]').forEach(node=>{
    if(node.tagName==='BUTTON'||node.closest('button'))hide(node.closest('button')||node,!allowed('socialExport'));
  });

  if(!context.isOwner){
    admin.querySelectorAll('.mxAdminTeamButton').forEach(node=>hide(node,true));
    const headerUser=admin.querySelector('.mxAdminHeader > div:last-child');
    if(headerUser&&!headerUser.querySelector('.mxStaffRoleBadge')){
      const badge=document.createElement('small');badge.className='mxStaffRoleBadge';badge.textContent=context.role||'موظف';headerUser.appendChild(badge);
    }
  }
}
function guard(event){
  if(!context||context.isOwner)return;
  const target=event.target instanceof Element?event.target.closest('button,a'):null;
  if(!target)return;
  const text=String(target.textContent||'');
  let needed='';
  if(text.includes('إضافة سيارة'))needed='carsCreate';
  else if(text.includes('المستخدمون'))needed='usersView';
  if(needed&&!allowed(needed)){
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.();
  }
}
function start(){
  context=getContext();
  if(!context)return setTimeout(start,80);
  apply();
  observer=new MutationObserver(apply);observer.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('click',guard,true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.addEventListener('beforeunload',()=>observer?.disconnect(),{once:true});

export {apply};
