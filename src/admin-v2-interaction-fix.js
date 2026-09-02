const ID='mxEnterpriseAdminV2';
const STYLE_ID='mx-admin-v2-interaction-fix-style';

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    #${ID}{
      position:relative!important;
      z-index:1000!important;
      pointer-events:auto!important;
      isolation:isolate!important;
    }
    #${ID} *{pointer-events:auto}
    #${ID} button,
    #${ID} [data-view],
    #${ID} [data-action],
    #${ID} input,
    #${ID} select{
      pointer-events:auto!important;
      touch-action:manipulation!important;
      -webkit-tap-highlight-color:rgba(239,106,50,.12);
    }
    #${ID} .v2Backdrop:not(.open){pointer-events:none!important}
    #${ID} .v2Backdrop.open{pointer-events:auto!important}
    body.mxAdminV2Active>#${ID}{width:100%!important;min-height:100dvh!important}
  `;
  document.head.appendChild(style);
}

function detachFromReact(){
  const shell=document.getElementById(ID);
  if(!shell)return false;
  ensureStyle();
  if(shell.parentElement!==document.body)document.body.appendChild(shell);
  shell.dataset.interactionReady='1';
  return true;
}

function start(){
  if(detachFromReact())return;
  const observer=new MutationObserver(()=>{
    if(detachFromReact())observer.disconnect();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),20000);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
