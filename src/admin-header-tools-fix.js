const STYLE_ID='mx-admin-header-tools-fix-style';
const SETTINGS_CLASS='mxAdminSettingsButton';

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .mxAdminHeader .mxAdminUserTools{
      display:flex!important;
      align-items:center!important;
      justify-content:flex-start!important;
      gap:8px!important;
      min-width:0!important;
      white-space:nowrap!important;
    }
    .mxAdminHeader .mxAdminUserTools .${SETTINGS_CLASS}{
      position:static!important;
      inset:auto!important;
      left:auto!important;
      right:auto!important;
      top:auto!important;
      bottom:auto!important;
      transform:none!important;
      width:44px!important;
      height:44px!important;
      min-width:44px!important;
      min-height:44px!important;
      flex:0 0 44px!important;
      margin:0!important;
      z-index:auto!important;
    }
    @media(max-width:620px){
      .mxAdminHeader .mxAdminUserTools>span{
        display:none!important;
      }
      .mxAdminHeader .mxAdminUserTools{
        gap:6px!important;
      }
      .mxAdminHeader .mxAdminUserTools .${SETTINGS_CLASS}{
        width:42px!important;
        height:42px!important;
        min-width:42px!important;
        min-height:42px!important;
        flex-basis:42px!important;
      }
    }
  `;
  document.head.appendChild(style);
}

function fixHeader(){
  ensureStyle();
  const header=document.querySelector('.mxAdmin .mxAdminHeader');
  const button=header?.querySelector(`.${SETTINGS_CLASS}`);
  if(!header||!button)return;

  const userBox=[...header.children].find(node=>node.tagName==='DIV'&&!node.classList.contains('mxBrand'));
  if(!userBox)return;

  userBox.classList.add('mxAdminUserTools');
  if(button.parentElement!==userBox)userBox.appendChild(button);
}

function start(){
  fixHeader();
  const observer=new MutationObserver(fixHeader);
  observer.observe(document.documentElement,{childList:true,subtree:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
else start();
