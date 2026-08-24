import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase.js';

const OWNER_UID = 'sC94v8XaXmUMHK6eineEy25GIst2';

export default function AdminUidHelper(){
  const [info,setInfo]=useState({user:null,status:'checking'});
  useEffect(()=>{
    if(!auth || window.location.pathname !== '/admin') return;
    return onAuthStateChanged(auth, async user=>{
      if(!user){ setInfo({user:null,status:'signed-out'}); return; }
      try{
        const ref=doc(db,'admins',user.uid);
        let snap=await getDoc(ref);
        if(!snap.exists() && user.uid===OWNER_UID){
          try{
            await setDoc(ref,{role:'admin',createdAt:serverTimestamp()},{merge:true});
            snap=await getDoc(ref);
            if(snap.exists()){
              setInfo({user,status:'created'});
              setTimeout(()=>window.location.reload(),500);
              return;
            }
          }catch(err){
            setInfo({user,status:err?.code||'bootstrap-failed'});
            return;
          }
        }
        setInfo({user,status:snap.exists()?'exists':'missing'});
      }catch(err){
        setInfo({user,status:err?.code||'error'});
      }
    });
  },[]);
  if(window.location.pathname !== '/admin' || !info.user) return null;
  const uid=info.user.uid;
  const ok=info.status==='exists'||info.status==='created';
  return <div dir="rtl" style={{position:'fixed',zIndex:99999,left:12,right:12,bottom:12,maxWidth:680,margin:'auto',background:'#11100e',color:'#fff',border:'1px solid #9d7549',padding:'12px 14px',boxShadow:'0 12px 35px rgba(0,0,0,.35)',fontFamily:'system-ui'}}>
    <div style={{fontWeight:800,marginBottom:6}}>فحص حساب الإدارة</div>
    <div style={{fontSize:12,opacity:.8,marginBottom:4}}>UID الحقيقي للحساب:</div>
    <div style={{fontFamily:'monospace',fontSize:13,wordBreak:'break-all',padding:'8px',background:'#1d1a16',border:'1px solid #332a20'}}>{uid}</div>
    <div style={{marginTop:7,fontSize:13}}>حالة الإدارة: <b>{ok?'جاهزة ✅':info.status==='missing'?'وثيقة admins غير موجودة ❌':info.status}</b></div>
    {!ok&&uid===OWNER_UID&&<div style={{marginTop:6,fontSize:12,opacity:.85}}>بعد نشر قواعد Firestore الجديدة، حدّث هذه الصفحة وسيتم إنشاء صلاحية الإدارة تلقائيًا.</div>}
    <button onClick={()=>navigator.clipboard?.writeText(uid)} style={{marginTop:8,padding:'8px 14px',border:'1px solid #9d7549',background:'#9d7549',color:'#fff',fontWeight:700}}>نسخ UID</button>
  </div>;
}
