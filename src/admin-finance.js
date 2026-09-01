import { auth, db } from './lib/firebase.js';
import { collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';

const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';
const PAGE_ID='mxAdminFinancePage';
const STYLE_ID='mx-admin-finance-style';
const NAV_ID='mxAdminFinanceNav';

const state={cars:[],members:[],finance:[],tab:'cars',query:'',stops:[],started:false,error:''};

const moneyIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 9h10M7 15h10"/><circle cx="12" cy="12" r="2.2"/></svg>';
const backIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
const editIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>';
const carIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14l1-5-2-5H6l-2 5 1 5Z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>';
const teamIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>';

function profile(){return window.__MAURIONE_ADMIN_CONTEXT__||{}}
function isOwner(){return Boolean(profile().isOwner&&auth?.currentUser?.uid===OWNER_UID)}
function esc(value=''){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function n(value){const x=Number(value||0);return Number.isFinite(x)?x:0}
function positive(value){return Math.max(0,n(value))}
function fmt(value){return new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n(value))}
function money(value){return `${fmt(value)} MRU`}
function pct(value){return `${new Intl.NumberFormat('en-US',{minimumFractionDigits:0,maximumFractionDigits:1}).format(n(value))}%`}
function carTitle(car){return `${car.brand||''} ${car.model||''} ${car.year||''}`.trim()||'سيارة بدون اسم'}
function financeByCar(id){return state.finance.find(item=>item.id===id)||{id}}
function memberByUid(uid){return state.members.find(item=>item.id===uid)||null}
function calc(fin={}){
  const cost=positive(fin.costPrice),expenses=positive(fin.expenses),sale=positive(fin.salePrice),received=positive(fin.customerReceived),paid=positive(fin.partnerPaid);
  const totalCost=cost+expenses;
  const profit=sale-totalCost;
  const margin=totalCost>0?(profit/totalCost)*100:0;
  return {cost,expenses,sale,received,paid,totalCost,profit,margin,customerOutstanding:Math.max(0,sale-received),partnerOutstanding:Math.max(0,cost-paid)};
}
function overall(){
  return state.finance.reduce((acc,fin)=>{const c=calc(fin);acc.sales+=c.sale;acc.cost+=c.cost;acc.expenses+=c.expenses;acc.received+=c.received;acc.partnerPaid+=c.paid;acc.profit+=c.profit;acc.customerOutstanding+=c.customerOutstanding;acc.partnerOutstanding+=c.partnerOutstanding;return acc},{sales:0,cost:0,expenses:0,received:0,partnerPaid:0,profit:0,customerOutstanding:0,partnerOutstanding:0});
}
function aggregateMember(uid){
  const docs=state.finance.filter(fin=>String(fin.teamMemberUid||'')===String(uid));
  const cars=docs.map(fin=>state.cars.find(car=>car.id===fin.id)).filter(Boolean);
  const totals=docs.reduce((acc,fin)=>{const c=calc(fin);acc.sales+=c.sale;acc.cost+=c.cost;acc.expenses+=c.expenses;acc.received+=c.received;acc.partnerPaid+=c.paid;acc.profit+=c.profit;acc.customerOutstanding+=c.customerOutstanding;acc.partnerOutstanding+=c.partnerOutstanding;return acc},{sales:0,cost:0,expenses:0,received:0,partnerPaid:0,profit:0,customerOutstanding:0,partnerOutstanding:0});
  const totalCost=totals.cost+totals.expenses;
  return {...totals,totalCost,margin:totalCost>0?(totals.profit/totalCost)*100:0,cars,carsCount:cars.length,sold:cars.filter(c=>c.status==='sold').length,available:cars.filter(c=>c.status!=='sold').length,listedValue:cars.reduce((s,c)=>s+positive(c.price),0)};
}

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
  .mxFinNav svg,.mxFinPage svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  .mxFinPage{position:fixed;inset:0;z-index:24000;overflow:auto;background:#f4f6f8;color:#12161d;direction:rtl;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.mxFinPage *{box-sizing:border-box}
  .mxFinHeader{position:sticky;top:0;z-index:20;min-height:82px;padding:max(10px,env(safe-area-inset-top)) 18px 10px;background:rgba(255,255,255,.94);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid #e6e9ee;display:grid;grid-template-columns:48px minmax(0,1fr) 48px;align-items:center;gap:10px}.mxFinBack{width:44px;height:44px;border:1px solid #e1e5ea;border-radius:14px;background:#fff;color:#111820;display:grid;place-items:center;cursor:pointer}.mxFinHeaderTitle{text-align:center;min-width:0}.mxFinHeaderTitle strong{display:block;font-size:21px;font-weight:950}.mxFinHeaderTitle span{display:block;color:#8b939e;font-size:9px;margin-top:4px}.mxFinLock{width:42px;height:42px;border-radius:14px;background:#fff2ea;color:#ed642b;display:grid;place-items:center;font-size:17px;font-weight:950}
  .mxFinBody{width:min(calc(100% - 28px),1280px);margin:0 auto;padding:22px 0 46px}.mxFinHero{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:15px}.mxFinHero h2{margin:0;font-size:26px;font-weight:950;letter-spacing:-.5px}.mxFinHero p{margin:6px 0 0;color:#7f8792;font-size:11px;line-height:1.6}.mxFinBadge{padding:7px 10px;border-radius:999px;background:#fff0e8;color:#e85e28;font-size:9px;font-weight:900;white-space:nowrap}
  .mxFinKpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:12px}.mxFinKpi{min-height:118px;border:1px solid #e4e8ed;border-radius:19px;background:#fff;padding:16px;box-shadow:0 8px 28px rgba(15,23,42,.045)}.mxFinKpi span{display:block;color:#808994;font-size:9px;font-weight:800}.mxFinKpi strong{display:block;margin-top:13px;font-size:24px;font-weight:950;direction:ltr;text-align:right}.mxFinKpi small{display:block;color:#9aa1aa;font-size:8px;margin-top:7px}.mxFinKpi.profit strong{color:#168b55}.mxFinKpi.due strong{color:#c45444}.mxFinKpi.received strong{color:#e9632a}
  .mxFinTabs{display:flex;gap:7px;padding:5px;border:1px solid #e3e7ec;border-radius:15px;background:#fff;width:max-content;max-width:100%;margin-bottom:12px}.mxFinTabs button{height:39px;border:0;border-radius:10px;background:transparent;color:#757e89;font-size:11px;font-weight:900;padding:0 13px;cursor:pointer;display:flex;align-items:center;gap:6px}.mxFinTabs button.active{background:#111820;color:#fff}
  .mxFinCard{border:1px solid #e4e8ed;border-radius:20px;background:#fff;box-shadow:0 8px 28px rgba(15,23,42,.04);overflow:hidden}.mxFinCardHead{min-height:64px;padding:14px 17px;border-bottom:1px solid #edf0f3;display:flex;align-items:center;justify-content:space-between;gap:12px}.mxFinCardHead h3{margin:0;font-size:15px;font-weight:950}.mxFinCardHead span{font-size:9px;color:#8b939e}.mxFinToolbar{padding:12px 14px;border-bottom:1px solid #edf0f3}.mxFinSearch{height:48px;border:1px solid #e1e5ea;border-radius:14px;background:#f9fafb;padding:0 13px;display:flex;align-items:center;gap:8px}.mxFinSearch input{width:100%;height:100%;border:0;outline:0;background:transparent;color:#161b22;font-size:13px;text-align:right}.mxFinSearch svg{color:#89919b}
  .mxFinTableWrap{overflow:auto}.mxFinTable{width:100%;border-collapse:collapse;min-width:1040px}.mxFinTable th{padding:11px 12px;background:#fafbfc;color:#7f8792;font-size:8.5px;font-weight:900;text-align:right;white-space:nowrap}.mxFinTable td{padding:12px;border-top:1px solid #eff1f4;font-size:10.5px;vertical-align:middle;white-space:nowrap}.mxFinCar{display:grid;grid-template-columns:50px minmax(140px,1fr);gap:9px;align-items:center}.mxFinCar img,.mxFinCarImg{width:50px;height:50px;border-radius:12px;object-fit:cover;background:#f0f2f4;display:grid;place-items:center;color:#9aa1aa}.mxFinCar strong{display:block;font-size:11.5px}.mxFinCar small{display:block;color:#929aa4;font-size:8px;margin-top:4px}.mxFinMember{font-weight:900}.mxFinMuted{color:#929aa4}.mxFinProfit{font-weight:950;color:#168b55}.mxFinProfit.neg{color:#c44c43}.mxFinEdit{height:34px;border:1px solid #e1e5ea;border-radius:10px;background:#fff;color:#39414b;display:inline-flex;align-items:center;gap:5px;padding:0 9px;font-size:9px;font-weight:900;cursor:pointer}.mxFinEdit svg{width:14px;height:14px}
  .mxFinMembers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.mxFinMemberCard{border:1px solid #e4e8ed;border-radius:20px;background:#fff;padding:16px;box-shadow:0 8px 28px rgba(15,23,42,.04)}.mxFinMemberHead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:13px}.mxFinMemberHead strong{display:block;font-size:16px;font-weight:950}.mxFinMemberHead span{display:block;color:#8d959f;font-size:9px;margin-top:4px}.mxFinMemberMark{padding:6px 9px;border-radius:999px;background:#f3f5f7;color:#66707b;font-size:8px;font-weight:900}.mxFinMemberStats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.mxFinMini{border:1px solid #edf0f3;border-radius:13px;background:#fafbfc;padding:10px;min-width:0}.mxFinMini span{display:block;color:#9098a2;font-size:7.5px;margin-bottom:5px}.mxFinMini strong{display:block;font-size:12px;font-weight:950;direction:ltr;text-align:right;overflow:hidden;text-overflow:ellipsis}.mxFinMini.profit strong{color:#168b55}.mxFinMini.due strong{color:#c45444}.mxFinMemberFooter{margin-top:10px;padding-top:10px;border-top:1px solid #eff1f4;display:flex;justify-content:space-between;gap:10px;color:#858e99;font-size:8.5px}.mxFinMemberFooter b{color:#20262e}
  .mxFinEmpty,.mxFinError{margin:14px;min-height:150px;border:1px dashed #d8dde3;border-radius:17px;background:#fafbfc;display:grid;place-items:center;text-align:center;padding:22px;color:#858e99;font-size:11px;line-height:1.7}.mxFinError{border-style:solid;border-color:#efcac5;background:#fff4f3;color:#9a3f38}
  .mxFinModal{position:fixed;inset:0;z-index:25000;background:rgba(14,20,28,.48);display:grid;place-items:end center;padding:10px}.mxFinSheet{width:min(100%,720px);max-height:92dvh;overflow:auto;border-radius:24px;background:#fff;border:1px solid #e3e7ec;padding:17px;box-shadow:0 25px 80px rgba(0,0,0,.2)}.mxFinSheetHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px}.mxFinSheetHead h3{margin:0;font-size:20px;font-weight:950}.mxFinSheetHead p{margin:5px 0 0;color:#8a939d;font-size:9px}.mxFinClose{width:40px;height:40px;border:1px solid #e1e5ea;border-radius:12px;background:#f8f9fa;font-size:23px;cursor:pointer}.mxFinForm{display:grid;gap:11px}.mxFinFormGrid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.mxFinForm label{display:grid;gap:6px;color:#626b76;font-size:10px;font-weight:850}.mxFinForm input,.mxFinForm select,.mxFinForm textarea{width:100%;border:1px solid #dfe4e9;border-radius:13px;background:#fff;color:#171d24;font:inherit;outline:none;padding:0 12px}.mxFinForm input,.mxFinForm select{height:48px}.mxFinForm textarea{min-height:86px;padding-top:11px;resize:vertical}.mxFinLive{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;padding:10px;border-radius:15px;background:#f7f9fa;border:1px solid #e8ebef}.mxFinLive div{min-width:0}.mxFinLive span{display:block;color:#89929c;font-size:7.5px;margin-bottom:5px}.mxFinLive strong{display:block;font-size:11.5px;font-weight:950;direction:ltr;text-align:right;overflow:hidden;text-overflow:ellipsis}.mxFinLive .profit strong{color:#168b55}.mxFinSave{height:50px;border:0;border-radius:14px;background:#f4662d;color:#fff;font-size:13px;font-weight:950;cursor:pointer}.mxFinSave:disabled{opacity:.55}.mxFinFormError{display:none;padding:10px 12px;border-radius:12px;background:#fff2f0;color:#9e4138;border:1px solid #efcac5;font-size:10px}.mxFinFormError.on{display:block}
  html[data-theme='dark'] .mxFinPage{background:#0c0f13;color:#f3f5f7}html[data-theme='dark'] .mxFinHeader{background:rgba(13,16,20,.94);border-color:#2c323a}html[data-theme='dark'] .mxFinBack,html[data-theme='dark'] .mxFinKpi,html[data-theme='dark'] .mxFinTabs,html[data-theme='dark'] .mxFinCard,html[data-theme='dark'] .mxFinMemberCard,html[data-theme='dark'] .mxFinSheet,html[data-theme='dark'] .mxFinEdit,html[data-theme='dark'] .mxFinForm input,html[data-theme='dark'] .mxFinForm select,html[data-theme='dark'] .mxFinForm textarea{background:#15191e;color:#f3f5f7;border-color:#303740}html[data-theme='dark'] .mxFinSearch,html[data-theme='dark'] .mxFinMini,html[data-theme='dark'] .mxFinLive,html[data-theme='dark'] .mxFinTable th{background:#11151a;border-color:#2d333b;color:#f3f5f7}html[data-theme='dark'] .mxFinSearch input{color:#f3f5f7}html[data-theme='dark'] .mxFinCardHead,html[data-theme='dark'] .mxFinToolbar,html[data-theme='dark'] .mxFinTable td,html[data-theme='dark'] .mxFinMemberFooter{border-color:#292f37}html[data-theme='dark'] .mxFinTabs button.active{background:#f4672d;color:#fff}html[data-theme='dark'] .mxFinMemberFooter b{color:#f3f5f7}
  @media(max-width:900px){.mxFinKpis{grid-template-columns:1fr 1fr}.mxFinMembers{grid-template-columns:1fr}.mxFinBody{width:calc(100% - 18px)}}
  @media(max-width:560px){.mxFinHeader{min-height:76px;padding-left:9px;padding-right:9px}.mxFinHeaderTitle strong{font-size:18px}.mxFinBody{padding-top:13px}.mxFinHero{align-items:flex-start}.mxFinHero h2{font-size:22px}.mxFinKpis{gap:7px}.mxFinKpi{min-height:100px;padding:13px;border-radius:17px}.mxFinKpi strong{font-size:18px}.mxFinTabs{width:100%;display:grid;grid-template-columns:1fr 1fr}.mxFinTabs button{justify-content:center;padding:0 8px}.mxFinMemberStats{grid-template-columns:1fr 1fr}.mxFinFormGrid{grid-template-columns:1fr}.mxFinLive{grid-template-columns:1fr 1fr}.mxFinSheet{padding:14px;border-radius:20px}.mxFinBadge{display:none}}
  `;document.head.appendChild(style);
}

function ensureNav(){
  if(!isOwner())return;
  const nav=document.querySelector('#mxEnterpriseAdmin .entNav');
  if(!nav||document.getElementById(NAV_ID))return;
  const button=document.createElement('button');button.id=NAV_ID;button.className='mxFinNav';button.type='button';button.innerHTML=`${moneyIcon}<span>الحسابات المالية</span>`;button.addEventListener('click',openFinance);
  const teamButton=nav.querySelector('button[data-view="team"]');
  if(teamButton)teamButton.insertAdjacentElement('beforebegin',button);else nav.appendChild(button);
}

function startData(){
  if(state.started||!db||!isOwner())return;
  state.started=true;
  const fail=error=>{state.error=error?.code==='permission-denied'?'قواعد الحسابات المالية لم تُفعّل في Firestore بعد.':'تعذر تحميل البيانات المالية الآن.';renderPage()};
  state.stops.push(onSnapshot(collection(db,'cars'),snap=>{state.cars=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>{const at=a.createdAt?.toMillis?.()||0,bt=b.createdAt?.toMillis?.()||0;return bt-at});renderPage()},fail));
  state.stops.push(onSnapshot(collection(db,'admins'),snap=>{state.members=snap.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.type==='staff'&&x.active!==false).sort((a,b)=>String(a.displayName||'').localeCompare(String(b.displayName||''),'ar'));renderPage()},fail));
  state.stops.push(onSnapshot(collection(db,'carFinance'),snap=>{state.finance=snap.docs.map(d=>({id:d.id,...d.data()}));state.error='';renderPage()},fail));
}

function carsMarkup(){
  const q=String(state.query||'').trim().toLowerCase();
  const rows=state.cars.filter(car=>{const fin=financeByCar(car.id),member=memberByUid(fin.teamMemberUid);const hay=`${carTitle(car)} ${car.reference||''} ${car.location||''} ${member?.displayName||fin.teamMemberName||''}`.toLowerCase();return !q||hay.includes(q)});
  if(!rows.length)return '<div class="mxFinEmpty">لا توجد سيارات مطابقة.</div>';
  return `<div class="mxFinTableWrap"><table class="mxFinTable"><thead><tr><th>السيارة</th><th>عضو الفريق / الشريك</th><th>سعر العرض</th><th>التكلفة</th><th>المصاريف</th><th>سعر البيع</th><th>المستلم</th><th>المتبقي من العميل</th><th>صافي الربح</th><th>هامش الربح</th><th>الإجراء</th></tr></thead><tbody>${rows.map(car=>{const fin=financeByCar(car.id),c=calc(fin),member=memberByUid(fin.teamMemberUid),profitClass=c.profit<0?'mxFinProfit neg':'mxFinProfit';return `<tr><td><div class="mxFinCar">${car.images?.[0]?`<img src="${esc(car.images[0])}" alt="">`:`<div class="mxFinCarImg">${carIcon}</div>`}<div><strong>${esc(carTitle(car))}</strong><small>${esc(car.reference||'بدون رقم')} · ${car.status==='sold'?'مباعة':'متوفرة'}</small></div></div></td><td class="mxFinMember">${esc(member?.displayName||fin.teamMemberName||'غير مسند')}</td><td>${money(car.price)}</td><td>${money(c.cost)}</td><td>${money(c.expenses)}</td><td>${money(c.sale)}</td><td>${money(c.received)}</td><td>${money(c.customerOutstanding)}</td><td class="${profitClass}">${money(c.profit)}</td><td class="${profitClass}">${pct(c.margin)}</td><td><button class="mxFinEdit" data-fin-edit="${esc(car.id)}">${editIcon}<span>إدارة الحساب</span></button></td></tr>`}).join('')}</tbody></table></div>`;
}

function membersMarkup(){
  if(!state.members.length)return '<div class="mxFinEmpty">لا يوجد أعضاء في الفريق بعد. عند إضافة أعضاء وربط السيارات بهم ستظهر حساباتهم هنا تلقائيًا.</div>';
  return `<div class="mxFinMembers">${state.members.map(member=>{const a=aggregateMember(member.id);return `<article class="mxFinMemberCard"><div class="mxFinMemberHead"><div><strong>${esc(member.displayName||member.username||'عضو الفريق')}</strong><span>${esc(member.role||'عضو الفريق')} · ${a.carsCount} سيارة</span></div><div class="mxFinMemberMark">${a.sold} مباعة · ${a.available} متوفرة</div></div><div class="mxFinMemberStats"><div class="mxFinMini"><span>قيمة السيارات المعروضة</span><strong>${money(a.listedValue)}</strong></div><div class="mxFinMini"><span>إجمالي المبيعات</span><strong>${money(a.sales)}</strong></div><div class="mxFinMini"><span>إجمالي التكلفة</span><strong>${money(a.cost)}</strong></div><div class="mxFinMini"><span>المصاريف</span><strong>${money(a.expenses)}</strong></div><div class="mxFinMini"><span>المستلم من العملاء</span><strong>${money(a.received)}</strong></div><div class="mxFinMini due"><span>المتبقي من العملاء</span><strong>${money(a.customerOutstanding)}</strong></div><div class="mxFinMini"><span>المدفوع للشريك</span><strong>${money(a.partnerPaid)}</strong></div><div class="mxFinMini due"><span>المتبقي للشريك</span><strong>${money(a.partnerOutstanding)}</strong></div><div class="mxFinMini profit"><span>صافي الربح</span><strong>${money(a.profit)}</strong></div></div><div class="mxFinMemberFooter"><span>هامش الربح <b>${pct(a.margin)}</b></span><span>إجمالي التكلفة مع المصاريف <b>${money(a.totalCost)}</b></span></div></article>`}).join('')}</div>`;
}

function renderPage(){
  const page=document.getElementById(PAGE_ID);if(!page)return;
  const total=overall();const totalCost=total.cost+total.expenses;const margin=totalCost>0?(total.profit/totalCost)*100:0;
  const body=page.querySelector('.mxFinBody');if(!body)return;
  body.innerHTML=`<div class="mxFinHero"><div><h2>الحسابات المالية</h2><p>ربط كل سيارة بعضو من الفريق ومتابعة المبيعات والتكلفة والمصاريف والأرباح.</p></div><span class="mxFinBadge">خاص بالمالك</span></div><div class="mxFinKpis"><article class="mxFinKpi"><span>إجمالي المبيعات</span><strong>${money(total.sales)}</strong><small>أسعار البيع الفعلية المسجلة</small></article><article class="mxFinKpi received"><span>المبالغ المستلمة</span><strong>${money(total.received)}</strong><small>المستلم من العملاء</small></article><article class="mxFinKpi profit"><span>صافي الربح</span><strong>${money(total.profit)}</strong><small>هامش الربح ${pct(margin)}</small></article><article class="mxFinKpi due"><span>المبالغ المتبقية</span><strong>${money(total.customerOutstanding)}</strong><small>مستحقات العملاء غير المستلمة</small></article></div><div class="mxFinTabs"><button data-fin-tab="cars" class="${state.tab==='cars'?'active':''}">${carIcon}<span>السيارات والحسابات</span></button><button data-fin-tab="members" class="${state.tab==='members'?'active':''}">${teamIcon}<span>أعضاء الفريق والشركاء</span></button></div>${state.error?`<div class="mxFinError">${esc(state.error)}</div>`:state.tab==='cars'?`<section class="mxFinCard"><div class="mxFinCardHead"><div><h3>حساب كل سيارة</h3><span>${state.cars.length} سيارة مسجلة</span></div><span>${state.finance.length} حساب مالي</span></div><div class="mxFinToolbar"><label class="mxFinSearch"><input data-fin-search type="search" value="${esc(state.query)}" placeholder="ابحث باسم السيارة أو رقمها أو اسم عضو الفريق..."><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></label></div>${carsMarkup()}</section>`:membersMarkup()}`;
}

function openFinance(){
  if(!isOwner())return;
  ensureStyle();startData();
  let page=document.getElementById(PAGE_ID);if(page){page.remove();}
  page=document.createElement('main');page.id=PAGE_ID;page.className='mxFinPage';page.innerHTML=`<header class="mxFinHeader"><button class="mxFinBack" data-fin-close aria-label="رجوع">${backIcon}</button><div class="mxFinHeaderTitle"><strong>الإدارة المالية</strong><span>MauriOne Cars · الحسابات الداخلية</span></div><div class="mxFinLock">₨</div></header><section class="mxFinBody"></section>`;document.body.appendChild(page);
  document.getElementById(NAV_ID)?.classList.add('active');
  page.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(!target)return;if(target.closest('[data-fin-close]')){closeFinance();return}const tab=target.closest('[data-fin-tab]');if(tab){state.tab=tab.dataset.finTab||'cars';renderPage();return}const edit=target.closest('[data-fin-edit]');if(edit)openEditor(edit.dataset.finEdit||'')});
  page.addEventListener('input',event=>{const input=event.target;if(input instanceof HTMLInputElement&&input.matches('[data-fin-search]')){state.query=input.value;renderPage();const next=document.querySelector(`#${PAGE_ID} [data-fin-search]`);if(next){next.focus();next.setSelectionRange(next.value.length,next.value.length)}}});
  renderPage();
}
function closeFinance(){document.getElementById(PAGE_ID)?.remove();document.getElementById(NAV_ID)?.classList.remove('active')}

function formCalc(form){
  const values={costPrice:form.elements.costPrice?.value,expenses:form.elements.expenses?.value,salePrice:form.elements.salePrice?.value,customerReceived:form.elements.customerReceived?.value,partnerPaid:form.elements.partnerPaid?.value};const c=calc(values);
  const box=form.querySelector('.mxFinLive');if(!box)return;box.innerHTML=`<div><span>إجمالي التكلفة</span><strong>${money(c.totalCost)}</strong></div><div class="profit"><span>صافي الربح</span><strong>${money(c.profit)}</strong></div><div><span>هامش الربح</span><strong>${pct(c.margin)}</strong></div><div><span>المتبقي من العميل</span><strong>${money(c.customerOutstanding)}</strong></div>`;
}

function openEditor(carId){
  const page=document.getElementById(PAGE_ID),car=state.cars.find(x=>x.id===carId);if(!page||!car)return;
  page.querySelector('.mxFinModal')?.remove();const fin=financeByCar(carId),c=calc(fin);const modal=document.createElement('div');modal.className='mxFinModal';
  modal.innerHTML=`<section class="mxFinSheet"><div class="mxFinSheetHead"><div><h3>${esc(carTitle(car))}</h3><p>${esc(car.reference||'بدون رقم')} · سعر العرض ${money(car.price)}</p></div><button type="button" class="mxFinClose" data-fin-modal-close>×</button></div><form class="mxFinForm"><div class="mxFinFormGrid"><label>عضو الفريق / الشريك<select name="teamMemberUid"><option value="">غير مسند</option>${state.members.map(member=>`<option value="${esc(member.id)}" ${String(fin.teamMemberUid||'')===String(member.id)?'selected':''}>${esc(member.displayName||member.username||'عضو الفريق')}</option>`).join('')}</select></label><label>تكلفة السيارة / حق الشريك (MRU)<input name="costPrice" inputmode="decimal" type="number" min="0" step="1" value="${c.cost||''}" placeholder="0"></label><label>المصاريف الإضافية (MRU)<input name="expenses" inputmode="decimal" type="number" min="0" step="1" value="${c.expenses||''}" placeholder="0"></label><label>سعر البيع الفعلي (MRU)<input name="salePrice" inputmode="decimal" type="number" min="0" step="1" value="${c.sale||''}" placeholder="0"></label><label>المبلغ المستلم من العميل (MRU)<input name="customerReceived" inputmode="decimal" type="number" min="0" step="1" value="${c.received||''}" placeholder="0"></label><label>المبلغ المدفوع للشريك (MRU)<input name="partnerPaid" inputmode="decimal" type="number" min="0" step="1" value="${c.paid||''}" placeholder="0"></label></div><div class="mxFinLive"></div><label>ملاحظات مالية<textarea name="notes" maxlength="1000" placeholder="أي ملاحظة تخص هذه العملية...">${esc(fin.notes||'')}</textarea></label><div class="mxFinFormError"></div><button class="mxFinSave" type="submit">حفظ الحساب المالي</button></form></section>`;page.appendChild(modal);const form=modal.querySelector('form');formCalc(form);
  modal.addEventListener('click',event=>{if(event.target===modal||event.target.closest('[data-fin-modal-close]'))modal.remove()});
  form.addEventListener('input',()=>formCalc(form));
  form.addEventListener('submit',async event=>{event.preventDefault();if(!isOwner())return;const save=form.querySelector('.mxFinSave'),errorBox=form.querySelector('.mxFinFormError');save.disabled=true;errorBox.classList.remove('on');const member=memberByUid(form.elements.teamMemberUid.value);const payload={teamMemberUid:form.elements.teamMemberUid.value||'',teamMemberName:member?.displayName||'',costPrice:positive(form.elements.costPrice.value),expenses:positive(form.elements.expenses.value),salePrice:positive(form.elements.salePrice.value),customerReceived:positive(form.elements.customerReceived.value),partnerPaid:positive(form.elements.partnerPaid.value),notes:String(form.elements.notes.value||'').trim().slice(0,1000),updatedAt:serverTimestamp(),updatedBy:auth.currentUser.uid};if(!fin.updatedAt)payload.createdAt=serverTimestamp();try{await setDoc(doc(db,'carFinance',carId),payload,{merge:true});modal.remove()}catch(error){errorBox.textContent=error?.code==='permission-denied'?'تعذر الحفظ لأن قواعد الحسابات المالية لم تُفعّل في Firestore بعد.':'تعذر حفظ الحساب المالي. أعد المحاولة.';errorBox.classList.add('on')}finally{save.disabled=false}});
}

function boot(){
  ensureStyle();
  const observer=new MutationObserver(()=>ensureNav());observer.observe(document.documentElement,{childList:true,subtree:true});
  const timer=setInterval(()=>{ensureNav();if(isOwner()&&document.getElementById(NAV_ID))clearInterval(timer)},500);
  window.addEventListener('beforeunload',()=>{state.stops.forEach(stop=>{try{stop()}catch{}});clearInterval(timer)});
  ensureNav();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
