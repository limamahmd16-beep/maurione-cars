import { auth, db } from './lib/firebase.js';
import { collection, onSnapshot } from 'firebase/firestore';

const STYLE_ID='mx-admin-visitor-stats-style';
const PANEL_CLASS='mxAdminVisitorStats';
const TZ='Africa/Nouakchott';
let stopStats=null;
let started=false;
let raf=0;
const totals={today:0,last7:0,last30:0,total:0};

function num(value){
  return new Intl.NumberFormat('en-US').format(Number(value||0));
}

function dateKey(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:TZ,
    year:'numeric',
    month:'2-digit',
    day:'2-digit',
  }).formatToParts(date);
  const map=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function recentDays(count){
  const days=new Set();
  const now=Date.now();
  for(let i=0;i<count;i++)days.add(dateKey(new Date(now-(i*86400000))));
  return days;
}

function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .${PANEL_CLASS}{margin:0 0 14px;border:1px solid #e7e9ed;border-radius:22px;background:#fff;padding:16px;box-shadow:0 8px 26px rgba(15,23,42,.04)}
    .${PANEL_CLASS}Head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:12px}
    .${PANEL_CLASS}Head h2{margin:0;color:#111318;font-size:20px;font-weight:900}
    .${PANEL_CLASS}Head span{font-size:11px;color:#90959d}
    .${PANEL_CLASS}Grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
    .${PANEL_CLASS}Card{min-height:82px;border:1px solid #eceef1;border-radius:16px;background:#fafbfc;padding:12px;display:flex;flex-direction:column;justify-content:center;gap:6px}
    .${PANEL_CLASS}Card span{font-size:11px;color:#777d86;font-weight:700;line-height:1.45}
    .${PANEL_CLASS}Card strong{font-size:25px;line-height:1;color:#15171b;font-weight:900;direction:ltr;text-align:right}
    .${PANEL_CLASS}Card.accent{background:#fff7f2;border-color:#ffd8c4}
    .${PANEL_CLASS}Card.accent strong{color:#ff5a12}
    @media(max-width:620px){.${PANEL_CLASS}Grid{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);
}

function render(){
  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(()=>{
    const admin=document.querySelector('.mxAdmin');
    if(!admin)return;
    ensureStyle();

    let panel=admin.querySelector(`.${PANEL_CLASS}`);
    if(!panel){
      panel=document.createElement('section');
      panel.className=PANEL_CLASS;
      panel.innerHTML=`
        <div class="${PANEL_CLASS}Head"><h2>إحصائيات الزوار</h2><span>يشمل الزوار والحسابات المسجلة</span></div>
        <div class="${PANEL_CLASS}Grid">
          <div class="${PANEL_CLASS}Card accent" data-visitor-stat="today"><span>زوار اليوم</span><strong>0</strong></div>
          <div class="${PANEL_CLASS}Card" data-visitor-stat="last7"><span>آخر 7 أيام</span><strong>0</strong></div>
          <div class="${PANEL_CLASS}Card" data-visitor-stat="last30"><span>آخر 30 يومًا</span><strong>0</strong></div>
          <div class="${PANEL_CLASS}Card" data-visitor-stat="total"><span>إجمالي الزوار</span><strong>0</strong></div>
        </div>`;
      const actions=admin.querySelector('.mxAdminActions');
      const firstPanel=admin.querySelector('.mxPanel');
      if(actions)actions.insertAdjacentElement('afterend',panel);
      else if(firstPanel)firstPanel.insertAdjacentElement('beforebegin',panel);
      else admin.querySelector('.mxAdminInner')?.prepend(panel);
    }

    panel.querySelector('[data-visitor-stat="today"] strong').textContent=num(totals.today);
    panel.querySelector('[data-visitor-stat="last7"] strong').textContent=num(totals.last7);
    panel.querySelector('[data-visitor-stat="last30"] strong').textContent=num(totals.last30);
    panel.querySelector('[data-visitor-stat="total"] strong').textContent=num(totals.total);
  });
}

function start(){
  if(started||!db||!auth?.currentUser)return;
  if(!document.querySelector('.mxAdmin'))return;
  started=true;
  stopStats=onSnapshot(collection(db,'carStats'),snapshot=>{
    const byDay=new Map();
    let uniqueTotal=0;

    snapshot.forEach(item=>{
      const id=item.id||'';
      if(id.startsWith('visitor-total-')){
        uniqueTotal+=1;
        return;
      }
      const match=id.match(/^visitor-day-(\d{4}-\d{2}-\d{2})-/);
      if(match)byDay.set(match[1],(byDay.get(match[1])||0)+1);
    });

    const seven=recentDays(7);
    const thirty=recentDays(30);
    totals.today=byDay.get(dateKey())||0;
    totals.last7=[...byDay.entries()].reduce((sum,[day,count])=>sum+(seven.has(day)?count:0),0);
    totals.last30=[...byDay.entries()].reduce((sum,[day,count])=>sum+(thirty.has(day)?count:0),0);
    totals.total=uniqueTotal;
    render();
  },error=>{
    console.warn('[MauriOne admin visitor stats] read blocked',error?.code||error?.message||error);
    render();
  });
  render();
}

function schedule(){
  if(document.querySelector('.mxAdmin')){
    start();
    render();
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
else schedule();

const observer=new MutationObserver(schedule);
observer.observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('beforeunload',()=>stopStats?.());
