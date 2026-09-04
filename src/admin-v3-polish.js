const STYLE_ID='admin-v3-polish-style';
const DIGIT_MAP={
  '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9',
  '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9'
};

function latinDigits(value=''){
  return String(value).replace(/[٠-٩۰-۹]/g,d=>DIGIT_MAP[d]||d);
}

function normalizeDigits(root=document){
  const scope=root instanceof Element||root instanceof Document?root:document;
  const start=scope instanceof Document?scope.body:scope;
  if(!start)return;
  if(start.nodeType===Node.TEXT_NODE){
    const next=latinDigits(start.nodeValue||'');
    if(next!==start.nodeValue)start.nodeValue=next;
    return;
  }
  const walker=document.createTreeWalker(start,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    if(node.parentElement?.closest('script,style'))continue;
    const next=latinDigits(node.nodeValue||'');
    if(next!==node.nodeValue)node.nodeValue=next;
  }
  start.querySelectorAll?.('input[placeholder],input[value],option').forEach(el=>{
    if(el.hasAttribute?.('placeholder')){
      const current=el.getAttribute('placeholder')||'';
      const next=latinDigits(current);
      if(next!==current)el.setAttribute('placeholder',next);
    }
  });
}

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .a3{
      --a3-shadow:0 10px 32px rgba(15,23,42,.055);
      --a3-shadow-dark:0 14px 36px rgba(0,0,0,.18);
    }
    html[data-theme='dark'] .a3{--a3-shadow:var(--a3-shadow-dark)}
    .a3-top{
      min-height:78px!important;
      height:auto!important;
      padding-top:max(0px,env(safe-area-inset-top))!important;
      box-shadow:0 1px 0 rgba(148,163,184,.04);
    }
    .a3-title h1{font-size:20px!important;letter-spacing:-.25px;line-height:1.25}
    .a3-title p{font-size:10px!important;line-height:1.45}
    .a3-content{padding-top:26px!important}
    .a3-hero{margin-bottom:20px!important;gap:18px!important}
    .a3-hero h2{font-size:27px!important;letter-spacing:-.5px;line-height:1.25}
    .a3-hero p{font-size:12px!important;line-height:1.7!important;max-width:720px}
    .a3-actions{gap:10px!important}
    .a3-actions .a3-btn{min-height:52px;border-radius:15px!important;padding-inline:18px!important}
    .a3-btn{transition:transform .14s ease,box-shadow .14s ease,border-color .14s ease}
    .a3-btn:active,.a3-mini:active,.a3-nav button:active{transform:scale(.975)}
    .a3-btn.primary{box-shadow:0 9px 20px rgba(239,106,50,.18)}
    .a3-kpis{gap:13px!important}
    .a3-kpi,.a3-card,.a3-setting,.a3-feature,.a3-person{
      box-shadow:var(--a3-shadow);
      border-color:color-mix(in srgb,var(--a-line) 88%,transparent)!important;
    }
    .a3-kpi{
      border-radius:22px!important;
      padding:19px!important;
      min-height:145px!important;
      background:linear-gradient(160deg,color-mix(in srgb,var(--a-card) 97%,white 3%),var(--a-card))!important;
    }
    html[data-theme='dark'] .a3-kpi{
      background:linear-gradient(160deg,#171c22,#14181d)!important;
    }
    .a3-kpi-top{font-size:11px!important;align-items:flex-start;gap:12px}
    .a3-kpi-top>span{line-height:1.55;max-width:72%}
    .a3-kpi i{
      width:46px!important;height:46px!important;border-radius:15px!important;
      font-size:20px!important;border:1px solid color-mix(in srgb,var(--a-line) 70%,transparent);
    }
    .a3-kpi strong{
      font-size:38px!important;line-height:1!important;margin-top:19px!important;
      letter-spacing:-1px;font-variant-numeric:tabular-nums lining-nums;
      font-feature-settings:'tnum' 1,'lnum' 1;
    }
    .a3-kpi small{font-size:10px!important;line-height:1.5;margin-top:10px!important}
    .a3-grid{gap:14px!important;margin-top:14px!important}
    .a3-card{border-radius:22px!important}
    .a3-card-head{min-height:74px!important;padding:17px 20px!important}
    .a3-card-head h3{font-size:20px!important;letter-spacing:-.25px;line-height:1.25}
    .a3-card-head span{font-size:10px!important;margin-top:6px!important}
    .a3-card-body{padding:20px!important}
    .a3-bars{height:250px!important;gap:9px!important}
    .a3-track{height:188px!important;border-bottom-color:color-mix(in srgb,var(--a-line) 80%,transparent)!important}
    .a3-bar{width:38px!important;max-width:72%!important;border-radius:10px 10px 4px 4px!important;box-shadow:0 8px 18px rgba(239,106,50,.14)}
    .a3-bar-col b{font-size:11px!important;margin-top:8px!important;font-variant-numeric:tabular-nums lining-nums}
    .a3-bar-col span{font-size:9px!important;margin-top:5px!important;font-variant-numeric:tabular-nums lining-nums;direction:ltr;unicode-bidi:isolate}
    .a3-eng{gap:10px!important}
    .a3-eng-row{min-height:62px!important;border-radius:16px!important;padding:11px 12px!important}
    .a3-eng-row i{width:42px!important;height:42px!important;border-radius:13px!important}
    .a3-eng-row strong{font-size:12px!important}
    .a3-eng-row small{font-size:9px!important;line-height:1.45}
    .a3-eng-row b{font-size:18px!important;font-variant-numeric:tabular-nums lining-nums}
    .a3-table td,.a3-table th,.a3-badge,.a3-person small,.a3-person strong{
      font-variant-numeric:tabular-nums lining-nums;
      font-feature-settings:'tnum' 1,'lnum' 1;
    }
    .a3-search{border-radius:15px!important;box-shadow:var(--a3-shadow)}
    .a3-search input{height:50px!important;font-size:14px!important}
    .a3-person{border-radius:18px!important;padding:16px!important}
    .a3-setting{border-radius:20px!important;padding:20px!important}
    .a3-sheet{border-radius:26px!important}
    .a3-form input,.a3-form select,.a3-form textarea{font-variant-numeric:tabular-nums lining-nums}
    @media(max-width:900px){
      .a3-top{min-height:76px!important;padding-inline:14px!important}
      .a3-title h1{font-size:18px!important}
      .a3-title p{font-size:10px!important}
      .a3-content{width:calc(100% - 24px)!important;padding-top:22px!important;padding-bottom:84px!important}
      .a3-hero{gap:14px!important;margin-bottom:18px!important}
      .a3-hero h2{font-size:25px!important}
      .a3-hero p{font-size:12px!important}
      .a3-actions{grid-template-columns:1fr 1fr!important;gap:10px!important}
      .a3-actions .a3-btn{min-height:56px!important;border-radius:16px!important;font-size:15px!important}
      .a3-kpis{gap:11px!important}
      .a3-kpi{min-height:150px!important;padding:17px!important;border-radius:21px!important}
      .a3-kpi i{width:44px!important;height:44px!important}
      .a3-kpi strong{font-size:36px!important;margin-top:20px!important}
      .a3-kpi small{font-size:10px!important}
      .a3-grid{gap:14px!important;margin-top:14px!important}
      .a3-card{border-radius:22px!important}
      .a3-card-head{min-height:76px!important;padding:17px 18px!important}
      .a3-card-head h3{font-size:21px!important}
      .a3-card-body{padding:18px!important}
      .a3-bars{height:265px!important;gap:7px!important}
      .a3-track{height:198px!important}
      .a3-bar{width:34px!important}
      .a3-bar-col b{font-size:11px!important}
      .a3-bar-col span{font-size:9px!important}
    }
    @media(max-width:430px){
      .a3-content{width:calc(100% - 20px)!important}
      .a3-kpi{min-height:142px!important;padding:15px!important}
      .a3-kpi-top{font-size:10px!important}
      .a3-kpi strong{font-size:33px!important}
      .a3-kpi i{width:41px!important;height:41px!important}
      .a3-card-head h3{font-size:19px!important}
      .a3-bars{height:245px!important}
      .a3-track{height:180px!important}
      .a3-bar{width:30px!important}
    }
  `;
  document.head.appendChild(style);
}

let queued=false;
function scheduleNormalize(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{
    queued=false;
    const root=document.querySelector('.a3');
    if(root)normalizeDigits(root);
  });
}

function start(){
  ensureStyle();
  scheduleNormalize();
  const observer=new MutationObserver(scheduleNormalize);
  observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  window.addEventListener('beforeunload',()=>observer.disconnect(),{once:true});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
