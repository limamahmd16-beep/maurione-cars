import { auth, db } from './lib/firebase.js';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, increment, serverTimestamp, setDoc } from 'firebase/firestore';

const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';
const TZ='Africa/Nouakchott';
let recordedFor='';
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

function payload(){
  return {
    views:increment(1),
    whatsappClicks:0,
    phoneClicks:0,
    favoriteAdds:0,
    updatedAt:serverTimestamp(),
  };
}

function storageHas(key){
  try{return localStorage.getItem(key)==='1'}catch{return false}
}

function storageSet(key){
  try{localStorage.setItem(key,'1')}catch{}
}

function isGuestMode(){
  try{return sessionStorage.getItem('maurione_guest')==='1'}catch{return false}
}

async function recordVisitor(user){
  if(!db||!user||user.uid===OWNER_UID||recordedFor===user.uid)return;
  recordedFor=user.uid;
  const uid=user.uid;
  const day=dateKey();
  const totalKey=`maurione_visitor_total_${uid}`;
  const dayKey=`maurione_visitor_day_${day}_${uid}`;
  const writes=[];

  if(!storageHas(totalKey)){
    writes.push(
      setDoc(doc(db,'carStats',`visitor-total-${uid}`),payload(),{merge:true})
        .then(()=>storageSet(totalKey))
    );
  }

  if(!storageHas(dayKey)){
    writes.push(
      setDoc(doc(db,'carStats',`visitor-day-${day}-${uid}`),payload(),{merge:true})
        .then(()=>storageSet(dayKey))
    );
  }

  if(!writes.length)return;

  try{
    await Promise.all(writes);
  }catch(error){
    recordedFor='';
    console.warn('[MauriOne visitor tracking] write blocked',error?.code||error?.message||error);
  }
}

async function ensureGuestAuth(){
  if(!auth||auth.currentUser||guestAuthAttempted||!isGuestMode())return;
  guestAuthAttempted=true;
  try{
    const cred=await signInAnonymously(auth);
    if(cred?.user)recordVisitor(cred.user);
  }catch(error){
    console.warn('[MauriOne visitor tracking] anonymous auth unavailable',error?.code||error?.message||error);
  }
}

if(auth){
  onAuthStateChanged(auth,user=>{
    if(user){
      recordVisitor(user);
      return;
    }
    setTimeout(ensureGuestAuth,350);
  });

  window.addEventListener('pageshow',()=>setTimeout(ensureGuestAuth,350));
}
