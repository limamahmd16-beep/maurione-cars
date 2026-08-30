import { auth, db } from './lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

let lastSyncedUid='';

async function syncUserProfile(user){
  if(!db||!user||user.isAnonymous)return;
  const ref=doc(db,'users',user.uid);
  try{
    const snap=await getDoc(ref);
    const base={
      name:user.displayName||snap.data()?.name||'',
      email:user.email||snap.data()?.email||'',
      phone:user.phoneNumber||snap.data()?.phone||'',
      photoURL:user.photoURL||snap.data()?.photoURL||'',
      provider:user.providerData?.[0]?.providerId||snap.data()?.provider||'password',
      lastLoginAt:serverTimestamp(),
      updatedAt:serverTimestamp(),
    };
    if(!snap.exists())base.createdAt=serverTimestamp();
    await setDoc(ref,base,{merge:true});
  }catch(error){
    console.warn('MauriOne user profile sync failed',error?.code||error);
  }
}

if(auth){
  onAuthStateChanged(auth,user=>{
    if(!user||user.isAnonymous||user.uid===lastSyncedUid)return;
    lastSyncedUid=user.uid;
    syncUserProfile(user);
  });
}
