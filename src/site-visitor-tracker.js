import { auth, db } from './lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, increment, serverTimestamp, setDoc } from 'firebase/firestore';

const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';
const TZ='Africa/Nouakchott';
let recordedFor='';

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

async function recordVisitor(user){
  if(!db||!user||user.uid===OWNER_UID||recordedFor===user.uid)return;
  recordedFor=user.uid;
  const uid=user.uid;
  const day=dateKey();
  try{
    await Promise.all([
      setDoc(doc(db,'carStats',`visitor-total-${uid}`),payload(),{merge:true}),
      setDoc(doc(db,'carStats',`visitor-day-${day}-${uid}`),payload(),{merge:true}),
    ]);
  }catch(error){
    recordedFor='';
    console.warn('[MauriOne visitor tracking] write blocked',error?.code||error?.message||error);
  }
}

if(auth){
  onAuthStateChanged(auth,user=>{
    if(user)recordVisitor(user);
  });
}
