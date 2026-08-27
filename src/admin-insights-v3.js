const STYLE_ID='mx-admin-v3-style';
const PAGE='mxAdminV3Page';

const css=`
body.${PAGE}{background:#f4f5f7!important}
body.${PAGE} .mxGlobalWhatsApp{display:none!important}
.${PAGE} .mxAdminInner{width:min(calc(100% - 22px),900px)!important}
.mxAdminV3Overview{margin:14px 0 4px;border:1px solid #e7e9ed;border-radius:24px;background:#fff;padding:16px;box-shadow:0 8px 26px rgba(15,23,42,.04)}
.mxAdminV3OverviewHead{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:13px}
.mxAdminV3OverviewHead h2{margin:0;font-size:18px;color:#111318}
.mxAdminV3OverviewHead span{font-size:11px;color:#90959d}
.mxAdminV3Grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.mxAdminV3Card{min-height:92px;border:1px solid #eceef1;border-radius:17px;background:#fafbfc;padding:13px;display:flex;flex-direction:column;justify-content:center;gap:4px}
.mxAdminV3Card span{font-size:11px;color:#777d86;font-weight:700}
.mxAdminV3Card strong{font-size:20px;line-height:1.15;color:#15171b;font-weight:900;direction:ltr;text-align:right}
.mxAdminV3Card em{font-size:10px;color:#9a9fa7;font-style:normal}
.mxAdminV3Card.accent{background:#fff7f2;border-color:#ffd8c4}
.mxAdminV3Card.accent strong{color:#ff5a12}
.mxAdminV3Progress{height:6px;background:#eceff2;border-radius:999px;overflow:hidden;margin-top:5px}
.mxAdminV3Progress i{display:block;height:100%;background:#ff5a12;border-radius:inherit}
.mxAdminV3Shortcuts{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0 0}
.mxAdminV3Shortcuts button{height:43px;border:1px solid #e5e7eb;border-radius:13px;background:#fff;color:#4b5058;font-size:11px;font-weight:800}
.mxAdminV3Shortcuts button.primary{background:#ff5a12;color:#fff;border-color:#ff5a12}
.mxAdminV3Badge{display:inline-flex;align-items:center;gap:6px;margin-top:11px;padding:7px 10px;border-radius:999px;background:#effaf3;color:#16713e;font-size:10px;font-weight:800}
.mxAdminV3Badge:before{content:'';width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 0 4px rgba(34,197,94,.10)}
@media(min-width:720px){.mxAdminV3Grid{grid-template-columns:repeat(4,minmax(0,1fr))}.mxAdminV3Shortcuts{width:420px}}
html[data-theme='dark'] body.${PAGE}{background:#0d0f12!important}
html[data-theme='dark'] .${PAGE} .mxAdminV3Overview{background:#171a1f;border-color:#2a2e35;box-shadow:none}
html[data-theme='dark'] .${PAGE} .mxAdminV3OverviewHead h2{color:#f7f7f8}
html[data-theme='dark'] .${PAGE} .mxAdminV3Card{background:#111419;border-color:#2b2f36}
html[data-theme='dark'] .${PAGE} .mxAdminV3Card span{color:#a8adb5}
html[data-theme='dark'] .${PAGE} .mxAdminV3Card strong{color:#f4f5f7}
html[data-theme='dark'] .${PAGE} .mxAdminV3Card.accent{background:#2a1a13;border-color:#6a3923}
html[data-theme='dark'] .${PAGE} .mxAdminV3Card.accent strong{color:#ff7a3d}
html[data-theme='dark'] .${PAGE} .mxAdminV3Progress{background:#30343b}
html[data-theme='dark'] .${PAGE} .mxAdminV3Shortcuts button{background:#171a1f;border-color:#30343b;color:#d3d6db}
html[data-theme='dark'] .${PAGE} .mxAdminV3Shortcuts button.primary{background:#ff5a12;color:#fff;border-color:#ff5a12}
`;

function numberFromText(text=''){
  const cleaned=String(text).replace(/[^0-9]/g,'');
  return cleaned?Number(cleaned):0;
}
function money(v){
  if(!v)return '0 MRU';
  return `${new Intl.NumberFormat('en-US').format(Math.round(v))} MRU`;
}
function text(el,value){if(el&&el.textContent!==String(value))el.textContent=String(value)}

function enhance(){
  const admin=document.querySelector('.mxAdmin');
  document.body.classList.toggle(PAGE,Boolean(admin));
  if(!admin)return;

  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;style.textContent=css;document.head.appendChild(style);
  }

  const title=admin.querySelector('.mxAdminTitle');
  if(title&&!title.querySelector('.mxAdminV3Badge')){
    const badge=document.createElement('div');badge.className='mxAdminV3Badge';badge.textContent='النظام يعمل بشكل طبيعي';title.appendChild(badge);
  }

  const carPanel=[...admin.querySelectorAll('.mxPanel')].find(p=>(p.querySelector('h2')?.textContent||'').trim()==='السيارات');
  if(!carPanel)return;
  const rows=[...carPanel.querySelectorAll('.mxAdminList > article')];
  const total=rows.length;
  const sold=rows.filter(r=>r.querySelector('.mxState.sold')).length;
  const available=Math.max(0,total-sold);
  const values=rows.map(r=>numberFromText(r.querySelector('.mxAdminInfo b')?.textContent||'')).filter(Boolean);
  const inventoryValue=values.reduce((a,b)=>a+b,0);
  const avg=values.length?inventoryValue/values.length:0;
  const availability=total?Math.round((available/total)*100):0;

  let overview=admin.querySelector('.mxAdminV3Overview');
  if(!overview){
    overview=document.createElement('section');
    overview.className='mxAdminV3Overview';
    overview.innerHTML=`<div class="mxAdminV3OverviewHead"><h2>مؤشرات المخزون</h2><span class="mxAdminV3Updated">محدّث الآن</span></div><div class="mxAdminV3Grid"><div class="mxAdminV3Card accent" data-v3="value"><span>قيمة السيارات المعروضة</span><strong>0 MRU</strong><em>إجمالي الأسعار المسجلة</em></div><div class="mxAdminV3Card" data-v3="avg"><span>متوسط سعر السيارة</span><strong>0 MRU</strong><em>للسيارات ذات السعر</em></div><div class="mxAdminV3Card" data-v3="available"><span>نسبة السيارات المتوفرة</span><strong>0%</strong><div class="mxAdminV3Progress"><i style="width:0%"></i></div></div><div class="mxAdminV3Card" data-v3="sold"><span>السيارات المباعة</span><strong>0</strong><em>من إجمالي الإعلانات</em></div></div><div class="mxAdminV3Shortcuts"><button type="button" class="primary" data-v3-action="add">+ إضافة سيارة</button><button type="button" data-v3-action="cars">إدارة السيارات</button><button type="button" data-v3-action="site">فتح الموقع</button></div>`;
    const actions=admin.querySelector('.mxAdminActions');
    (actions||carPanel).insertAdjacentElement(actions?'afterend':'beforebegin',overview);
    overview.querySelector('[data-v3-action="add"]')?.addEventListener('click',()=>admin.querySelector('.mxAdminActions button')?.click());
    overview.querySelector('[data-v3-action="cars"]')?.addEventListener('click',()=>carPanel.scrollIntoView({behavior:'smooth',block:'start'}));
    overview.querySelector('[data-v3-action="site"]')?.addEventListener('click',()=>{window.history.pushState({},'','/');window.dispatchEvent(new PopStateEvent('popstate'))});
  }

  text(overview.querySelector('[data-v3="value"] strong'),money(inventoryValue));
  text(overview.querySelector('[data-v3="avg"] strong'),money(avg));
  text(overview.querySelector('[data-v3="available"] strong'),`${availability}%`);
  const bar=overview.querySelector('[data-v3="available"] .mxAdminV3Progress i');if(bar)bar.style.width=`${availability}%`;
  text(overview.querySelector('[data-v3="sold"] strong'),sold);

  const metrics=[...admin.querySelectorAll('.mxMetric')];
  if(metrics[0]){text(metrics[0].querySelector('strong'),total);text(metrics[0].querySelector('em'),'المسجلة')}
  if(metrics[1]){text(metrics[1].querySelector('strong'),available);text(metrics[1].querySelector('em'),'متاحة الآن')}
  if(metrics[2]){text(metrics[2].querySelector('small'),'المباعة');text(metrics[2].querySelector('strong'),sold);text(metrics[2].querySelector('em'),'تم بيعها')}
  if(metrics[3]){text(metrics[3].querySelector('small'),'نسبة التوفر');text(metrics[3].querySelector('strong'),`${availability}%`);text(metrics[3].querySelector('em'),'من المخزون')}
}

let raf=0;
function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(enhance)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
const observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
window.addEventListener('popstate',schedule);
