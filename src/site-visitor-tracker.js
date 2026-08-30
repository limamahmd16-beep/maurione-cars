import { auth, db } from './lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';
const TZ='Africa/Nouakchott';
let authResolved=false;
let recording=false;

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

function randomId(){
  try{
    if(globalThis.crypto?.randomUUID)return globalThis.crypto.randomUUID().replace(/-/g,'');
    if(globalThis.crypto?.getRandomValues){
      const bytes=new Uint8Array(16);
      globalThis.crypto.getRandomValues(bytes);
      return [...bytes].map(value=>value.toString(16).padStart(2,'0')).join('');
    }
  }catch{}
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2,18)}`;
}

function visitorId(){
  const key='maurione_visitor_id';
  try{
    let value=localStorage.getItem(key)||'';
    if(!value){
      value=randomId();
      localStorage.setItem(key,value);
    }
    return value;
  }catch{
    return randomId();
  }
}

function hasFlag(key){
  try{return localStorage.getItem(key)==='1'}catch{return false}
}

function setFlag(key){
  try{localStorage.setItem(key,'1')}catch{}
}

function visitPayload(visitor,type,day=''){
  return {
    visitorId:visitor,
    type,
    day,
    createdAt:serverTimestamp(),
  };
}

async function recordVisit(){
  if(!db||recording)return;
  if(auth?.currentUser?.uid===OWNER_UID)return;

  const visitor=visitorId();
  if(!visitor)return;

  const day=dateKey();
  const totalFlag='maurione_visitor_total_recorded_v2';
  const dayFlag=`maurione_visitor_day_recorded_v2_${day}`;
  const writes=[];
  recording=true;

  if(!hasFlag(totalFlag)){
    writes.push(
      setDoc(doc(db,'visitorStats',`total-${visitor}`),visitPayload(visitor,'total'))
        .then(()=>setFlag(totalFlag))
    );
  }

  if(!hasFlag(dayFlag)){
    writes.push(
      setDoc(doc(db,'visitorStats',`day-${day}-${visitor}`),visitPayload(visitor,'day',day))
        .then(()=>setFlag(dayFlag))
    );
  }

  if(!writes.length){
    recording=false;
    return;
  }

  try{
    await Promise.all(writes);
  }catch(error){
    console.warn('[MauriOne visitor tracking] write blocked',error?.code||error?.message||error);
  }finally{
    recording=false;
  }
}

function scheduleRecord(){
  if(auth&&!authResolved)return;
  setTimeout(recordVisit,250);
}

if(auth){
  onAuthStateChanged(auth,()=>{
    authResolved=true;
    scheduleRecord();
  });
}else{
  authResolved=true;
  scheduleRecord();
}

window.addEventListener('pageshow',scheduleRecord);
