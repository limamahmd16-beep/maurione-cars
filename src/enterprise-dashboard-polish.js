const STYLE_ID='mx-enterprise-dashboard-polish-style';
const BRAND_CLASS='entMobileBrand';
let scheduled=false;

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    #mxEnterpriseAdmin .${BRAND_CLASS}{display:none;direction:ltr;align-items:center;justify-content:center;font-size:19px;font-weight:950;letter-spacing:-1px;white-space:nowrap}
    #mxEnterpriseAdmin .${BRAND_CLASS} b{color:var(--ent-text)}
    #mxEnterpriseAdmin .${BRAND_CLASS} i{color:var(--ent-orange);font-style:normal}
    #mxEnterpriseAdmin .entHero{padding:2px 0 4px}
    #mxEnterpriseAdmin .entHero h2{letter-spacing:-.4px}
    #mxEnterpriseAdmin .entKpi{transition:transform .18s ease,box-shadow .18s ease}
    #mxEnterpriseAdmin .entKpi:hover{transform:translateY(-1px)}
    #mxEnterpriseAdmin .entBars{position:relative;border-bottom:1px solid var(--ent-line);padding-bottom:12px!important}
    #mxEnterpriseAdmin .entBars:before,#mxEnterpriseAdmin .entBars:after{content:"";position:absolute;left:0;right:0;border-top:1px dashed var(--ent-line);opacity:.65;pointer-events:none}
    #mxEnterpriseAdmin .entBars:before{top:34%}
    #mxEnterpriseAdmin .entBars:after{top:67%}
    #mxEnterpriseAdmin .entBarTrack{position:relative;z-index:1}
    #mxEnterpriseAdmin .entBarCol strong,#mxEnterpriseAdmin .entBarCol span{position:relative;z-index:2}
    #mxEnterpriseAdmin .entBarCol.zero .entBar{opacity:.18;min-height:3px!important}
    #mxEnterpriseAdmin .entCardHead h3{letter-spacing:-.15px}
    #mxEnterpriseAdmin.entDashboardHome .entHeroActions .entPrimary{box-shadow:0 8px 20px rgba(245,103,43,.16)}

    @media(max-width:760px){
      #mxEnterpriseAdmin .entTopbar{display:grid!important;grid-template-columns:minmax(0,1fr) auto auto!important;align-items:center!important;column-gap:9px!important}
      #mxEnterpriseAdmin .${BRAND_CLASS}{display:flex}
      #mxEnterpriseAdmin .entTopTitle{min-width:0!important}
      #mxEnterpriseAdmin .entTopTitle h1{font-size:16px!important;line-height:1.15!important}
      #mxEnterpriseAdmin .entTopActions{display:flex!important;justify-content:flex-end!important}
      #mxEnterpriseAdmin .entTopActions>[data-action='add-car']{display:none!important}
      #mxEnterpriseAdmin .entTopActions .entMobileMenu{display:grid!important}
      #mxEnterpriseAdmin .entHero{gap:12px!important}
      #mxEnterpriseAdmin .entHero h2{font-size:21px!important;line-height:1.25!important}
      #mxEnterpriseAdmin .entHero p{font-size:10px!important;line-height:1.65!important;margin-top:6px!important}
      #mxEnterpriseAdmin .entHeroActions{grid-template-columns:1fr 1fr!important;gap:8px!important}
      #mxEnterpriseAdmin .entHeroActions button{min-height:46px!important;border-radius:13px!important;font-size:11px!important}
      #mxEnterpriseAdmin .entKpis{gap:9px!important}
      #mxEnterpriseAdmin .entKpi{padding:15px!important;min-height:116px!important;border-radius:17px!important}
      #mxEnterpriseAdmin .entKpiLabel{font-size:9px!important}
      #mxEnterpriseAdmin .entKpi strong{font-size:27px!important;margin-top:14px!important}
      #mxEnterpriseAdmin .entKpi small{font-size:8px!important;line-height:1.4!important}
      #mxEnterpriseAdmin .entCardHead{min-height:58px!important;padding:13px 15px!important}
      #mxEnterpriseAdmin .entCardHead h3{font-size:15px!important}
      #mxEnterpriseAdmin .entCardHead span{font-size:8px!important}
      #mxEnterpriseAdmin .entBars{height:205px!important;gap:6px!important;padding:16px 2px 10px!important}
      #mxEnterpriseAdmin .entBarTrack{height:148px!important}
      #mxEnterpriseAdmin .entBar{width:min(26px,68%)!important;border-radius:7px 7px 3px 3px!important}
      #mxEnterpriseAdmin .entBarCol strong{font-size:8px!important;margin-top:6px!important}
      #mxEnterpriseAdmin .entBarCol span{font-size:6.7px!important;white-space:nowrap!important}
    }
    @media(max-width:430px){
      #mxEnterpriseAdmin .${BRAND_CLASS}{font-size:17px}
      #mxEnterpriseAdmin .entTopbar{grid-template-columns:minmax(0,1fr) auto 42px!important}
      #mxEnterpriseAdmin .entTopTitle h1{font-size:14px!important}
      #mxEnterpriseAdmin .entHero h2{font-size:20px!important}
      #mxEnterpriseAdmin .entKpi{padding:13px!important;min-height:108px!important}
      #mxEnterpriseAdmin .entKpi strong{font-size:25px!important}
      #mxEnterpriseAdmin .entBars{gap:4px!important}
      #mxEnterpriseAdmin .entBar{width:min(22px,66%)!important}
    }
  `;
  document.head.appendChild(style);
}

function ensureBrand(shell){
  const topbar=shell.querySelector('.entTopbar');
  if(!topbar)return;
  let brand=topbar.querySelector(`.${BRAND_CLASS}`);
  if(!brand){
    brand=document.createElement('div');
    brand.className=BRAND_CLASS;
    brand.setAttribute('aria-label','MauriOne');
    brand.innerHTML='<b>Mauri</b><i>One</i>';
    const actions=topbar.querySelector('.entTopActions');
    if(actions)topbar.insertBefore(brand,actions);else topbar.appendChild(brand);
  }
}

function activeView(shell){
  return shell.querySelector('.entNav button.active')?.dataset.view||'dashboard';
}

function parseMonthDay(text,baseYear){
  const m=String(text||'').match(/^(\d{2})-(\d{2})$/);
  if(!m)return null;
  let year=baseYear;
  const month=Number(m[1]);
  const day=Number(m[2]);
  const now=new Date();
  if(month>now.getMonth()+1&&now.getMonth()+1===1)year-=1;
  const date=new Date(year,month-1,day);
  return Number.isNaN(date.getTime())?null:date;
}

function keyForDate(date){
  return `${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function labelForDate(date){
  try{return new Intl.DateTimeFormat('ar',{day:'numeric',month:'short'}).format(date)}catch{return keyForDate(date)}
}

function normalizeBars(container){
  if(!container||container.dataset.sevenDayReady==='1')return;
  const existing=[...container.querySelectorAll('.entBarCol')];
  if(!existing.length)return;
  const values=new Map();
  existing.forEach(col=>{
    const raw=col.querySelector('span')?.textContent?.trim()||'';
    const value=Number((col.querySelector('strong')?.textContent||'0').replace(/[^0-9.-]/g,''))||0;
    values.set(raw,value);
  });
  const today=new Date();today.setHours(12,0,0,0);
  const dates=[];
  for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);dates.push(d)}
  const max=Math.max(1,...dates.map(d=>values.get(keyForDate(d))||0));
  container.innerHTML=dates.map(d=>{
    const key=keyForDate(d);const value=values.get(key)||0;
    const height=value?Math.max(4,Math.round(value/max*100)):2;
    return `<div class="entBarCol ${value?'':'zero'}"><div class="entBarTrack"><div class="entBar" style="height:${height}%"></div></div><strong>${value}</strong><span>${labelForDate(d)}</span></div>`;
  }).join('');
  container.dataset.sevenDayReady='1';
}

function sync(){
  scheduled=false;
  const shell=document.getElementById('mxEnterpriseAdmin');
  if(!shell)return;
  ensureStyle();
  ensureBrand(shell);
  const view=activeView(shell);
  shell.classList.toggle('entDashboardHome',view==='dashboard');
  shell.querySelectorAll('.entBars').forEach(normalizeBars);
}

function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync)}

function start(){
  ensureStyle();
  schedule();
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
