const STYLE_ID='mx-enterprise-navigation-fix-style';
const BACK_ID='mxEnterpriseBack';
let lastActiveKey='';
const stack=[];
let syncing=false;

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    #mxEnterpriseAdmin .entTopbar{padding-top:env(safe-area-inset-top);min-height:82px;height:auto!important}
    #mxEnterpriseAdmin .entTopTitle{flex:1;min-width:0}
    #mxEnterpriseAdmin .entTopTitle h1{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    #mxEnterpriseAdmin .entTopActions{flex:none}
    #${BACK_ID}{height:42px;min-width:42px;border:1px solid var(--ent-line);border-radius:12px;background:var(--ent-card);color:var(--ent-text);display:none;align-items:center;justify-content:center;gap:7px;padding:0 12px;font-size:11px;font-weight:900;cursor:pointer;flex:none}
    #${BACK_ID}.show{display:flex}
    #${BACK_ID} svg{width:18px!important;height:18px!important}
    #mxEnterpriseAdmin .entNav button{min-height:48px}
    #mxEnterpriseAdmin .entIconButton,#mxEnterpriseAdmin .entPrimary,#mxEnterpriseAdmin .entSecondary,#mxEnterpriseAdmin .entMini{touch-action:manipulation}
    #mxEnterpriseAdmin .entTableWrap{-webkit-overflow-scrolling:touch;scrollbar-width:thin}
    #mxEnterpriseAdmin .entContent{scroll-margin-top:92px}
    @media(max-width:760px){
      #mxEnterpriseAdmin .entTopbar{min-height:72px;padding:calc(8px + env(safe-area-inset-top)) 12px 8px!important;gap:8px!important}
      #${BACK_ID}{width:42px;min-width:42px;padding:0;font-size:0;border-radius:12px}
      #${BACK_ID} svg{width:21px!important;height:21px!important}
      #mxEnterpriseAdmin .entTopActions{gap:6px!important}
      #mxEnterpriseAdmin .entIconButton,#mxEnterpriseAdmin .entPrimary,#mxEnterpriseAdmin .entSecondary{min-width:42px;min-height:42px}
      #mxEnterpriseAdmin .entContent{width:calc(100% - 16px)!important;padding-top:12px!important}
      #mxEnterpriseAdmin .entHeroActions{display:grid!important;grid-template-columns:1fr 1fr!important;width:100%}
      #mxEnterpriseAdmin .entHeroActions>*{width:100%!important;min-width:0!important}
      #mxEnterpriseAdmin .entSectionToolbar{flex-direction:column!important;align-items:stretch!important}
      #mxEnterpriseAdmin .entSearch{width:100%!important;max-width:none!important}
      #mxEnterpriseAdmin .entCard{max-width:100%;overflow:hidden}
    }
    @media(max-width:430px){
      #mxEnterpriseAdmin .entTopTitle h1{font-size:15px!important}
      #mxEnterpriseAdmin .entKpis{grid-template-columns:1fr 1fr!important}
      #mxEnterpriseAdmin .entKpi{min-width:0!important}
    }
  `;
  document.head.appendChild(style);
}

function navButtons(){return [...document.querySelectorAll('#mxEnterpriseAdmin .entNav button')];}
function activeButton(){return navButtons().find(b=>b.classList.contains('active'))||null;}
function keyFor(button){
  if(!button)return '';
  const buttons=navButtons();
  return button.dataset.view||button.dataset.section||button.getAttribute('data-key')||String(buttons.indexOf(button));
}
function dashboardButton(){return navButtons()[0]||null;}
function titleFor(button){return (button?.textContent||'').trim();}
function buttonByKey(key){return navButtons().find(b=>keyFor(b)===String(key))||null;}

function ensureBack(){
  const shell=document.getElementById('mxEnterpriseAdmin');
  const topbar=shell?.querySelector('.entTopbar');
  if(!topbar)return null;
  ensureStyle();
  let back=document.getElementById(BACK_ID);
  if(!back){
    back=document.createElement('button');
    back.id=BACK_ID;
    back.type='button';
    back.setAttribute('aria-label','رجوع');
    back.title='رجوع';
    back.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg><span>رجوع</span>';
    back.addEventListener('click',goBack);
    topbar.prepend(back);
  }
  return back;
}

function closeMobileMenu(){
  const shell=document.getElementById('mxEnterpriseAdmin');
  shell?.classList.remove('menuOpen');
}

function currentKey(){return keyFor(activeButton());}

function navigateTo(key,{fromPop=false}={}){
  const target=buttonByKey(key);
  if(!target)return false;
  target.click();
  closeMobileMenu();
  requestAnimationFrame(()=>{
    document.querySelector('#mxEnterpriseAdmin .entContent')?.scrollIntoView({block:'start'});
    if(!fromPop)sync();
  });
  return true;
}

function goBack(){
  const modal=document.querySelector('.mxTeamModal');
  if(modal){modal.querySelector('.mxTeamClose')?.click();return}
  const teamPage=document.getElementById('mxAdminTeamPage');
  if(teamPage){teamPage.querySelector('.mxTeamBack')?.click();return}
  const previous=stack.pop();
  if(previous&&navigateTo(previous,{fromPop:true}))return;
  const dashboard=dashboardButton();
  if(dashboard&&!dashboard.classList.contains('active'))dashboard.click();
  closeMobileMenu();
}

function sync(){
  if(syncing)return;
  syncing=true;
  requestAnimationFrame(()=>{
    syncing=false;
    const shell=document.getElementById('mxEnterpriseAdmin');
    if(!shell)return;
    const back=ensureBack();
    const active=activeButton();
    const dashboard=dashboardButton();
    const key=keyFor(active);
    if(back)back.classList.toggle('show',Boolean(active&&dashboard&&active!==dashboard));
    if(active){
      active.setAttribute('aria-current','page');
      navButtons().filter(b=>b!==active).forEach(b=>b.removeAttribute('aria-current'));
    }
    if(key&&lastActiveKey&&key!==lastActiveKey&&!stack.length){
      // Keep a sane fallback when a section was opened programmatically.
      stack.push(keyFor(dashboard));
    }
    lastActiveKey=key||lastActiveKey;
  });
}

function onNavClick(event){
  const button=event.target.closest('#mxEnterpriseAdmin .entNav button');
  if(!button)return;
  const current=activeButton();
  const currentKeyValue=keyFor(current);
  const nextKey=keyFor(button);
  if(current&&current!==button&&currentKeyValue&&nextKey!==currentKeyValue){
    if(stack[stack.length-1]!==currentKeyValue)stack.push(currentKeyValue);
  }
  closeMobileMenu();
  setTimeout(sync,0);
}

function onKey(event){
  if(event.key!=='Escape')return;
  const modal=document.querySelector('.mxTeamModal');
  if(modal){modal.querySelector('.mxTeamClose')?.click();return}
  const teamPage=document.getElementById('mxAdminTeamPage');
  if(teamPage){teamPage.querySelector('.mxTeamBack')?.click();return}
  const shell=document.getElementById('mxEnterpriseAdmin');
  if(shell?.classList.contains('menuOpen')){closeMobileMenu();return}
  if(activeButton()&&activeButton()!==dashboardButton())goBack();
}

function start(){
  ensureStyle();
  document.addEventListener('click',onNavClick,true);
  document.addEventListener('keydown',onKey);
  const observer=new MutationObserver(sync);
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  sync();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
