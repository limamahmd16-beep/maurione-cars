import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase.js';

export default function AdminUidHelper(){
  const [info,setInfo]=useState({user:null,status:'checking'});
  useEffect(()=>{
    if(!auth || window.location.pathname !== '/admin') return;
    return onAuthStateChanged(auth, async user=>{
      if(!user){ setInfo({user:null,status:'signed-out'}); return; }
      try{
        const snap=await getDoc(doc(db,'admins',user.uid));
        setInfo({user,status:snap.exists()?'exists':'missing'});
      }catch(err){
        setInfo({user,status:err?.code||'error'});
      }
    });
  },[]);
  if(window.location.pathname !== '/admin' || !info.user) return null;
  const uid=info.user.uid;
  return <div dir="rtl" style={{position:'fixed',zIndex:99999,left:12,right:12,bottom:12,maxWidth:680,margin:'auto',background:'#11100e',color:'#fff',border:'1px solid #9d7549',padding:'12px 14px',boxShadow:'0 12px 35px rgba(0,0,0,.35)',fontFamily:'system-ui'}}>
    <div style={{fontWeight:800,marginBottom:6}}>فحص حساب الإدارة</div>
    <div style={{fontSize:12,opacity:.8,marginBottom:4}}>UID الحقيقي للحساب:</div>
    <div style={{fontFamily:'monospace',fontSize:13,wordBreak:'break-all',padding:'8px',background:'#1d1a16',border:'1px solid #332a20'}}>{uid}</div>
    <div style={{marginTop:7,fontSize:13}}>وثيقة admins: <b>{info.status==='exists'?'موجودة ✅':info.status==='missing'?'غير موجودة ❌':info.status}</b></div>
    <button onClick={()=>navigator.clipboard?.writeText(uid)} style={{marginTop:8,padding:'8px 14px',border:'1px solid #9d7549',background:'#9d7549',color:'#fff',fontWeight:700}}>نسخ UID</button>
  </div>;
}
