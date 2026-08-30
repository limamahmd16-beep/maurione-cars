import { auth, db } from './lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, increment, serverTimestamp, setDoc } from 'firebase/firestore';

const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';
const TZ='Africa/Nouakchott';
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

function hasFlag(key){
  try{return localStorage.getItem(key)==='1'}catch{return false}
}

function setFlag(key){
  try{localStorage.setItem(key,'1')}catch{}
}

async function recordVisit(user){
  if(!db||!user||recording||user.uid===OWNER_UID)return;

  const day=dateKey();
  const totalFlag=`maurione_visit_total_v3_${user.uid}`;
  const dayFlag=`maurione_visit_day_v3_${day}_${user.uid}`;
  const writes=[];
  recording=true;

  if(!hasFlag(totalFlag)){
    writes.push(
      setDoc(doc(db,'visitorStats','total'),{
        count:increment(1),
        updatedAt:serverTimestamp(),
      },{merge:true}).then(()=>setFlag(totalFlag))
    );
  }

  if(!hasFlag(dayFlag)){
    writes.push(
      setDoc(doc(db,'visitorStats',`day-${day}`),{
        count:increment(1),
        day,
        updatedAt:serverTimestamp(),
      },{merge:true}).then(()=>setFlag(dayFlag))
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

if(auth){
  onAuthStateChanged(auth,user=>{
    if(user)setTimeout(()=>recordVisit(user),250);
  });
}
