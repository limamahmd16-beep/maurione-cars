const ID='mxEnterpriseAdminV2';
const STYLE_ID='mx-admin-v2-interaction-fix-style';

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    body.mxAdminV2Active{
      overflow:hidden!important;
      overscroll-behavior:none!important;
    }
    body.mxAdminV2Active .mxAdmin{
      position:static!important;
      inset:auto!important;
      width:auto!important;
      min-height:0!important;
      overflow:visible!important;
      transform:none!important;
    }
    #${ID}{
      position:fixed!important;
      inset:0!important;
      width:100vw!important;
      height:100dvh!important;
      min-height:0!important;
      overflow-y:auto!important;
      overflow-x:hidden!important;
      -webkit-overflow-scrolling:touch!important;
      overscroll-behavior-y:contain!important;
      z-index:10000!important;
      pointer-events:auto!important;
      isolation:isolate!important;
      touch-action:pan-y!important;
    }
    #${ID} button,
    #${ID} [data-view],
    #${ID} [data-action],
    #${ID} input,
    #${ID} select{
      pointer-events:auto!important;
      touch-action:manipulation!important;
      -webkit-tap-highlight-color:rgba(239,106,50,.12)!important;
      position:relative;
      z-index:1;
    }
    #${ID} .v2Backdrop:not(.open){pointer-events:none!important}
    #${ID} .v2Backdrop.open{pointer-events:auto!important}
    .mxAdminV2Active .mxAdmin>.mxModal{z-index:50000!important;pointer-events:auto!important}
    .mxAdminTeamPage,.mxAdminUsersPage,#mxAdminFinancePage{z-index:60000!important}
  `;
  document.head.appendChild(style);
}

function markReady(){
  const shell=document.getElementById(ID);
  if(!shell)return false;
  ensureStyle();
  shell.dataset.interactionReady='1';
  return true;
}

function start(){
  if(markReady())return;
  const observer=new MutationObserver(()=>{
    if(markReady())observer.disconnect();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),20000);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
