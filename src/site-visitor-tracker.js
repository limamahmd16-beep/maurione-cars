import { auth, db } from './lib/firebase.js';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, increment, serverTimestamp, setDoc } from 'firebase/firestore';

const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';
const TZ='Africa/Nouakchott';
let recording=false;
let guestAuthAttempted=false;

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

function guestMode(){
  try{return sessionStorage.getItem('maurione_guest')==='1'}catch{return false}
}

function payload(){
  return {
    views:increment(0),
    whatsappClicks:increment(0),
    phoneClicks:increment(0),
    favoriteAdds:increment(0),
    updatedAt:serverTimestamp(),
  };
}

async function recordVisitor(user){
  if(!db||!user||recording||user.uid===OWNER_UID)return;

  const visitor=visitorId();
  const day=dateKey();
  const totalFlag=`maurione_visitor_total_v4_${visitor}`;
  const dayFlag=`maurione_visitor_day_v4_${day}_${visitor}`;
  const writes=[];
  recording=true;

  if(!hasFlag(totalFlag)){
    writes.push(
      setDoc(doc(db,'carStats',`visitor-total-${visitor}`),payload(),{merge:true})
        .then(()=>setFlag(totalFlag))
    );
  }

  if(!hasFlag(dayFlag)){
    writes.push(
      setDoc(doc(db,'carStats',`visitor-day-${day}-${visitor}`),payload(),{merge:true})
        .then(()=>setFlag(dayFlag))
    );
  }

  try{
    await Promise.all(writes);
  }catch(error){
    console.warn('[MauriOne visitor tracking] write blocked',error?.code||error?.message||error);
  }finally{
    recording=false;
  }
}

async function ensureGuestAuth(){
  if(!auth||auth.currentUser||guestAuthAttempted||!guestMode())return;
  guestAuthAttempted=true;
  try{
    const cred=await signInAnonymously(auth);
    if(cred?.user)recordVisitor(cred.user);
  }catch(error){
    guestAuthAttempted=false;
    console.warn('[MauriOne visitor tracking] anonymous auth unavailable',error?.code||error?.message||error);
  }
}

if(auth){
  onAuthStateChanged(auth,user=>{
    if(user){
      recordVisitor(user);
      return;
    }
    setTimeout(ensureGuestAuth,300);
  });
  window.addEventListener('pageshow',()=>setTimeout(ensureGuestAuth,300));
}
