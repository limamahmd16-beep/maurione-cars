import { auth, db } from './lib/firebase.js';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

const cloudName=import.meta.env.VITE_CARS_CLOUDINARY_CLOUD_NAME||'';
const uploadPreset=import.meta.env.VITE_CARS_CLOUDINARY_UPLOAD_PRESET||'';
let currentUser=auth?.currentUser||null;
let observer=null;
let busy=false;

function cameraSvg(){
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 4 16 6h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1.5-2h5Z"/><circle cx="12" cy="13" r="3.5"/></svg>';
}

function setPhoto(avatar,url){
  if(!avatar)return;
  let image=avatar.querySelector(':scope > .mxProfilePhotoImage');
  if(url){
    if(!image){
      image=document.createElement('img');
      image.className='mxProfilePhotoImage';
      image.alt='';
      avatar.prepend(image);
    }
    if(image.src!==url)image.src=url;
    avatar.classList.add('has-photo');
  }else{
    image?.remove();
    avatar.classList.remove('has-photo');
  }
}

async function resolveStoredPhoto(user,avatar){
  if(!user||user.isAnonymous||!db||user.photoURL)return;
  try{
    const snap=await getDoc(doc(db,'users',user.uid));
    const url=snap.data()?.photoURL||snap.data()?.photoUrl||'';
    if(url)setPhoto(avatar,url);
  }catch{}
}

function showUploadError(avatar){
  avatar?.classList.add('is-error');
  setTimeout(()=>avatar?.classList.remove('is-error'),1500);
}

async function uploadPhoto(file,avatar){
  if(busy||!file||!currentUser||currentUser.isAnonymous)return;
  if(!file.type?.startsWith('image/')||file.size>5*1024*1024||!cloudName||!uploadPreset){
    showUploadError(avatar);
    return;
  }
  busy=true;
  avatar.classList.add('is-uploading');
  try{
    const form=new FormData();
    form.append('file',file);
    form.append('upload_preset',uploadPreset);
    const response=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,{method:'POST',body:form});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||!data?.secure_url)throw new Error('upload-failed');
    const photoURL=data.secure_url;
    await updateProfile(currentUser,{photoURL});
    if(db){
      await setDoc(doc(db,'users',currentUser.uid),{photoURL,updatedAt:serverTimestamp()},{merge:true});
    }
    setPhoto(avatar,photoURL);
  }catch(error){
    console.warn('MauriOne profile photo upload failed',error);
    showUploadError(avatar);
  }finally{
    busy=false;
    avatar.classList.remove('is-uploading');
  }
}

function enhanceAccount(){
  const page=document.querySelector('.mxAccountPage');
  if(!page)return;

  const menu=page.querySelector('.mxAccountMenu');
  if(menu){
    [...menu.children].slice(4).forEach(item=>item.remove());
  }

  const profile=page.querySelector('.mxAccountProfile');
  const avatar=profile?.querySelector('.mxAccountAvatar');
  if(!profile||!avatar||!currentUser||currentUser.isAnonymous)return;

  avatar.classList.add('mxProfilePhotoEnabled');
  if(currentUser.photoURL)setPhoto(avatar,currentUser.photoURL);

  if(avatar.dataset.mxPhotoReady==='1')return;
  avatar.dataset.mxPhotoReady='1';
  avatar.setAttribute('role','button');
  avatar.setAttribute('tabindex','0');
  avatar.setAttribute('aria-label','تغيير الصورة الشخصية');

  const input=document.createElement('input');
  input.type='file';
  input.accept='image/*';
  input.className='mxProfilePhotoInput';

  const badge=document.createElement('span');
  badge.className='mxProfilePhotoBadge';
  badge.innerHTML=cameraSvg();
  badge.setAttribute('aria-hidden','true');

  avatar.append(input,badge);
  avatar.addEventListener('click',()=>{if(!busy)input.click()});
  avatar.addEventListener('keydown',event=>{
    if((event.key==='Enter'||event.key===' ')&&!busy){event.preventDefault();input.click()}
  });
  input.addEventListener('change',()=>{
    const file=input.files?.[0];
    input.value='';
    if(file)uploadPhoto(file,avatar);
  });
  resolveStoredPhoto(currentUser,avatar);
}

export function initAccountProfileEnhancer(){
  if(observer)return;
  onAuthStateChanged(auth,user=>{
    currentUser=user||null;
    setTimeout(enhanceAccount,0);
  });
  observer=new MutationObserver(()=>enhanceAccount());
  observer.observe(document.body,{childList:true,subtree:true});
  enhanceAccount();
}
