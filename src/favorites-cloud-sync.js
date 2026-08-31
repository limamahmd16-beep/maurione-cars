import { auth, db, firebaseReady } from './lib/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

const FAVORITES_KEY='maurione_favorites';
const sessionKey=uid=>`maurione_favorites_cloud_ready_${uid}`;

function readLocal(){
  try{
    const value=JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]');
    return Array.isArray(value)?[...new Set(value.filter(x=>typeof x==='string'&&x))]:[];
  }catch{return[]}
}

function writeLocal(list){
  try{localStorage.setItem(FAVORITES_KEY,JSON.stringify([...new Set(list)]))}catch{}
}

function sameList(a,b){
  if(a.length!==b.length)return false;
  const aa=[...a].sort(),bb=[...b].sort();
  return aa.every((value,index)=>value===bb[index]);
}

async function pushFavorites(user,list){
  if(!db||!user||user.isAnonymous)return;
  try{
    await setDoc(doc(db,'users',user.uid),{
      favorites:[...new Set(list)],
      favoritesUpdatedAt:serverTimestamp(),
      updatedAt:serverTimestamp(),
    },{merge:true});
  }catch(error){
    console.warn('MauriOne favorites cloud save failed',error);
  }
}

async function hydrateFavorites(user){
  if(!db||!user||user.isAnonymous)return;
  const local=readLocal();
  try{
    const ref=doc(db,'users',user.uid);
    const snap=await getDoc(ref);
    const data=snap.exists()?snap.data():{};
    if(Array.isArray(data.favorites)){
      const remote=[...new Set(data.favorites.filter(x=>typeof x==='string'&&x))];
      if(!sameList(local,remote)){
        writeLocal(remote);
        let already=false;
        try{already=sessionStorage.getItem(sessionKey(user.uid))==='1'}catch{}
        if(!already){
          try{sessionStorage.setItem(sessionKey(user.uid),'1')}catch{}
          window.location.reload();
        }
      }else{
        try{sessionStorage.setItem(sessionKey(user.uid),'1')}catch{}
      }
      return;
    }
    await pushFavorites(user,local);
    try{sessionStorage.setItem(sessionKey(user.uid),'1')}catch{}
  }catch(error){
    console.warn('MauriOne favorites cloud hydrate failed',error);
  }
}

export function initFavoritesCloudSync(){
  if(!firebaseReady||!auth||!db)return()=>{};
  let currentUser=auth.currentUser||null;
  const unsubscribe=onAuthStateChanged(auth,user=>{
    currentUser=user||null;
    if(user&&!user.isAnonymous)hydrateFavorites(user);
  });

  const clickHandler=event=>{
    if(!event.target.closest?.('.mxFav'))return;
    setTimeout(()=>{
      if(currentUser&&!currentUser.isAnonymous)pushFavorites(currentUser,readLocal());
    },40);
  };
  document.addEventListener('click',clickHandler,false);

  const storageHandler=event=>{
    if(event.key!==FAVORITES_KEY)return;
    if(currentUser&&!currentUser.isAnonymous)pushFavorites(currentUser,readLocal());
  };
  window.addEventListener('storage',storageHandler);

  return()=>{
    unsubscribe?.();
    document.removeEventListener('click',clickHandler,false);
    window.removeEventListener('storage',storageHandler);
  };
}
