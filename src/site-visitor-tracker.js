import { initializeApp, getApps } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
} from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth as primaryAuth, firebaseConfig } from './lib/firebase.js';

const OWNER_UID='sC94v8XaXmUMHK6eineEy25GIst2';
const TZ='Africa/Nouakchott';
const VISITOR_APP_NAME='maurione-visitor-analytics';
let recording=false;
let started=false;

const visitorApp=getApps().find(app=>app.name===VISITOR_APP_NAME)
  || initializeApp(firebaseConfig,VISITOR_APP_NAME);
const visitorAuth=getAuth(visitorApp);
const visitorDb=getFirestore(visitorApp);

function report(stage,error,user){
  try{
    fetch('/api/visitor-diagnostic',{
      method:'POST',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({
        stage,
        code:error?.code||'',
        message:error?.message||'',
        anonymous:Boolean(user?.isAnonymous),
        hasUser:Boolean(user),
        ownerSession:Boolean(primaryAuth?.currentUser?.uid===OWNER_UID),
      }),
      keepalive:true,
    }).catch(()=>{});
  }catch{}
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

function payload(){
  return {
    views:0,
    whatsappClicks:0,
    phoneClicks:0,
    favoriteAdds:0,
    updatedAt:serverTimestamp(),
  };
}

async function recordVisitor(user){
  if(!visitorDb||!user||!user.isAnonymous||recording)return;
  if(primaryAuth?.currentUser?.uid===OWNER_UID){
    report('visitor-skip-owner',null,user);
    return;
  }

  const visitor=visitorId();
  const day=dateKey();
  const totalFlag=`maurione_visitor_total_v7_${visitor}`;
  const dayFlag=`maurione_visitor_day_v7_${day}_${visitor}`;
  const writes=[];
  recording=true;

  if(!hasFlag(totalFlag)){
    writes.push(
      setDoc(doc(visitorDb,'carStats',`visitor-total-${visitor}`),payload())
        .then(()=>setFlag(totalFlag))
    );
  }

  if(!hasFlag(dayFlag)){
    writes.push(
      setDoc(doc(visitorDb,'carStats',`visitor-day-${day}-${visitor}`),payload())
        .then(()=>setFlag(dayFlag))
    );
  }

  try{
    await Promise.all(writes);
    report('visitor-write-success',null,user);
  }catch(error){
    report('visitor-write-failed',error,user);
    console.warn('[MauriOne visitor tracking] write blocked',error?.code||error?.message||error);
  }finally{
    recording=false;
  }
}

async function signInVisitor(){
  try{
    report('visitor-anonymous-start',null,null);
    const cred=await signInAnonymously(visitorAuth);
    report('visitor-anonymous-success',null,cred?.user);
    if(cred?.user)await recordVisitor(cred.user);
  }catch(error){
    report('visitor-anonymous-failed',error,null);
    console.warn('[MauriOne visitor tracking] anonymous auth unavailable',error?.code||error?.message||error);
  }
}

async function startVisitorTracking(){
  if(started)return;
  started=true;
  try{await setPersistence(visitorAuth,browserLocalPersistence)}catch{}
  onAuthStateChanged(visitorAuth,user=>{
    report('visitor-auth-state',null,user);
    if(user?.isAnonymous){
      recordVisitor(user);
      return;
    }
    signInVisitor();
  });
}

if(primaryAuth){
  onAuthStateChanged(primaryAuth,user=>{
    if(user?.uid===OWNER_UID){
      report('primary-owner-skip',null,null);
      return;
    }
    startVisitorTracking();
  });
}else{
  startVisitorTracking();
}
