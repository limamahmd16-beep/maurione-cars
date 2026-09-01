const REAL_SELECTOR='.mxAdminHeader > .mxAdminSettingsButton[data-admin-header-settings="1"]';
const SENTINEL_CLASS='mxAdminSettingsButton';
const STYLE_ID='mx-admin-settings-position-style';
let raf=0;

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .mxAdminHeader{position:relative!important}
    .mxAdminHeader > .mxAdminSettingsButton[data-admin-header-settings="1"]{
      position:absolute!important;
      left:max(78px,calc(env(safe-area-inset-left,0px) + 78px))!important;
      top:50%!important;
      transform:translateY(-50%)!important;
      width:46px!important;
      height:46px!important;
      min-height:46px!important;
      padding:0!important;
      margin:0!important;
      border:1px solid #e1e4e8!important;
      border-radius:14px!important;
      background:#fff!important;
      color:#25282d!important;
      display:grid!important;
      place-items:center!important;
      z-index:25!important;
      box-shadow:none!important;
      font-size:0!important;
    }
    .mxAdminHeader > .mxAdminSettingsButton[data-admin-header-settings="1"] span{display:none!important}
    .mxAdminHeader > .mxAdminSettingsButton[data-admin-header-settings="1"] svg{
      width:22px!important;height:22px!important;fill:none!important;stroke:currentColor!important;
      stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important;
    }
    .mxAdminActions > .mxAdminSettingsButton[data-admin-settings-sentinel="1"]{display:none!important}
    html[data-theme='dark'] .mxAdminHeader > .mxAdminSettingsButton[data-admin-header-settings="1"]{
      background:#1b1f24!important;border-color:#343a42!important;color:#f4f5f7!important;
    }
    @media(max-width:520px){
      .mxAdminHeader > .mxAdminSettingsButton[data-admin-header-settings="1"]{
        left:max(72px,calc(env(safe-area-inset-left,0px) + 72px))!important;
        width:44px!important;height:44px!important;min-height:44px!important;border-radius:13px!important;
      }
    }
  `;
  document.head.appendChild(style);
}

function placeSettings(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{
    const header=document.querySelector('.mxAdmin .mxAdminHeader');
    const actions=document.querySelector('.mxAdmin .mxAdminActions');
    if(!header||!actions)return;
    ensureStyle();

    let real=document.querySelector(REAL_SELECTOR);
    const actionButton=[...actions.querySelectorAll('button.mxAdminSettingsButton')]
      .find(node=>node.dataset.adminSettingsSentinel!=='1');

    if(!real&&actionButton){
      real=actionButton;
      real.dataset.adminHeaderSettings='1';
      real.title='إعدادات لوحة التحكم';
      header.appendChild(real);
    }

    if(real&&real.parentElement!==header)header.appendChild(real);

    let sentinel=actions.querySelector('.mxAdminSettingsButton[data-admin-settings-sentinel="1"]');
    if(!sentinel){
      sentinel=document.createElement('span');
      sentinel.className=SENTINEL_CLASS;
      sentinel.dataset.adminSettingsSentinel='1';
      sentinel.hidden=true;
      actions.appendChild(sentinel);
    }

    actions.querySelectorAll('button.mxAdminSettingsButton').forEach(button=>{
      if(button!==real)button.remove();
    });
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',placeSettings,{once:true});
else placeSettings();

const observer=new MutationObserver(placeSettings);
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('resize',placeSettings,{passive:true});
