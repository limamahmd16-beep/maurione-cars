import { auth, db } from './lib/firebase.js';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { getLanguage } from './i18n.js';

const cloudName=import.meta.env.VITE_CARS_CLOUDINARY_CLOUD_NAME||'';
const uploadPreset=import.meta.env.VITE_CARS_CLOUDINARY_UPLOAD_PRESET||'';
const supportNumber=(import.meta.env.VITE_CARS_WHATSAPP||'22224200324').replace(/\D/g,'');
const supportDisplay='+222 24 20 03 24';
let currentUser=auth?.currentUser||null;
let currentPhone='';
let profileFetchUid='';
let observer=null;
let busy=false;

function cameraSvg(){
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 4 16 6h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l1.5-2h5Z"/><circle cx="12" cy="13" r="3.5"/></svg>';
}

function whatsappSvg(){
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.4-4.2A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M8.2 7.9c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .5.4l.7 1.7c.1.3.1.5-.1.7l-.6.7c-.2.2-.2.4 0 .7.6 1 1.4 1.8 2.4 2.4.3.2.5.2.7 0l.8-1c.2-.2.4-.3.7-.2l1.8.8c.3.1.5.3.5.5 0 .4-.2 1.4-.9 1.9-.6.5-1.4.8-2.3.7-1.1-.1-2.4-.5-4-1.5-2.4-1.5-4-3.9-4.1-4.1-.1-.2-1-1.3-1-2.5 0-1.2.6-1.8.8-2.1Z"/></svg>';
}

function backSvg(lang){
  const path=lang==='ar'?'M9 18l6-6-6-6':'M15 18l-6-6 6-6';
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
}

function navMarkup(){
  return `
    <button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9.5 20v-6h5v6"/></svg><span>الرئيسية</span></button>
    <button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><span>بحث</span></button>
    <button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.5 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg><span>المفضلة</span></button>
    <button type="button"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4A7 7 0 0 1 3 13V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/></svg><span>الرسائل</span></button>
    <button type="button" class="active"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><span>حسابي</span></button>
  `;
}

function supportCopy(lang){
  if(lang==='en')return{title:'Need help?',sub:'Contact us on WhatsApp',message:'Hello, I need help with MauriOne.'};
  if(lang==='fr')return{title:'Besoin d’aide ?',sub:'Contactez-nous sur WhatsApp',message:'Bonjour, j’ai besoin d’aide avec MauriOne.'};
  if(lang==='pt')return{title:'Precisa de ajuda?',sub:'Fale connosco pelo WhatsApp',message:'Olá, preciso de ajuda com o MauriOne.'};
  return{title:'هل لديك مشكلة؟',sub:'تواصل معنا عبر واتساب',message:'السلام عليكم، لدي مشكلة في MauriOne وأحتاج إلى المساعدة.'};
}

function formatPhone(value){
  const raw=String(value||'').trim();
  const digits=raw.replace(/\D/g,'');
  if(!digits)return'';
  if(digits.startsWith('222')&&digits.length===11)return`+222 ${digits.slice(3,5)} ${digits.slice(5,7)} ${digits.slice(7,9)} ${digits.slice(9,11)}`;
  if(digits.length===8)return`${digits.slice(0,2)} ${digits.slice(2,4)} ${digits.slice(4,6)} ${digits.slice(6,8)}`;
  return raw;
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

function setPhone(profile,value){
  if(!profile)return;
  const info=[...profile.children].find(el=>el.tagName==='DIV'&&!el.classList.contains('mxAccountAvatar'));
  if(!info)return;
  let line=info.querySelector('.mxAccountProfilePhone');
  const formatted=formatPhone(value);
  if(!formatted){line?.remove();return}
  if(!line){
    line=document.createElement('span');
    line.className='mxAccountProfilePhone';
    line.dir='ltr';
    info.appendChild(line);
  }
  line.textContent=formatted;
}

async function resolveStoredProfile(user,avatar,profile){
  if(!user||user.isAnonymous)return;
  if(user.photoURL)setPhoto(avatar,user.photoURL);
  if(user.phoneNumber){currentPhone=user.phoneNumber;setPhone(profile,currentPhone)}
  if(!db||profileFetchUid===user.uid)return;
  profileFetchUid=user.uid;
  try{
    const snap=await getDoc(doc(db,'users',user.uid));
    const data=snap.data()||{};
    const url=data.photoURL||data.photoUrl||'';
    const phone=data.phone||data.phoneNumber||data.mobile||data.whatsapp||'';
    if(url&&!user.photoURL)setPhoto(avatar,url);
    if(phone){currentPhone=phone;setPhone(profile,currentPhone)}
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

function enhanceHeader(page){
  const button=page.querySelector('.mxAccountHeader>button');
  if(!button)return;
  const lang=getLanguage();
  button.classList.add('mxAccountBackButton');
  button.innerHTML=backSvg(lang);
  button.setAttribute('aria-label',lang==='ar'?'العودة':lang==='en'?'Back':lang==='fr'?'Retour':'Voltar');
}

function ensureSupport(page){
  const logout=page.querySelector('.mxAccountLogout');
  if(!logout)return;
  let card=page.querySelector('.mxAccountSupport');
  if(!card){
    card=document.createElement('a');
    card.className='mxAccountSupport';
    card.target='_blank';
    card.rel='noreferrer';
    card.dataset.i18nIgnore='1';
    card.innerHTML=`<span class="mxAccountSupportIcon">${whatsappSvg()}</span><span class="mxAccountSupportCopy"><strong></strong><small></small><b dir="ltr">${supportDisplay}</b></span><span class="mxAccountSupportArrow" aria-hidden="true">›</span>`;
    logout.before(card);
  }
  const lang=getLanguage();
  const copy=supportCopy(lang);
  card.querySelector('strong').textContent=copy.title;
  card.querySelector('small').textContent=copy.sub;
  card.href=supportNumber?`https://wa.me/${supportNumber}?text=${encodeURIComponent(copy.message)}`:'#';
  card.setAttribute('aria-label',`${copy.sub} ${supportDisplay}`);
}

function sourceBottom(){
  return [...document.querySelectorAll('.mxBottom')].find(nav=>!nav.closest('.mxAccountPage')&&!nav.closest('.mxFavoritesPage'))||null;
}

function ensureBottomNav(page){
  if(page.querySelector('.mxAccountShellBottom'))return;
  const nav=document.createElement('nav');
  nav.className='mxBottom mxAccountShellBottom';
  nav.innerHTML=navMarkup();
  nav.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button)return;
    const buttons=[...nav.querySelectorAll('button')];
    const index=buttons.indexOf(button);
    if(index!==0&&index!==1)return;
    event.preventDefault();
    const source=sourceBottom();
    const target=source?.querySelectorAll('button')?.[index];
    page.querySelector('.mxAccountHeader>button')?.click();
    setTimeout(()=>target?.click(),60);
  });
  page.appendChild(nav);
}

function enhanceAccount(){
  const page=document.querySelector('.mxAccountPage');
  if(!page)return;

  const menu=page.querySelector('.mxAccountMenu');
  if(menu){
    [...menu.children].slice(4).forEach(item=>item.remove());
  }

  enhanceHeader(page);
  ensureBottomNav(page);

  const profile=page.querySelector('.mxAccountProfile');
  const avatar=profile?.querySelector('.mxAccountAvatar');
  if(!profile||!avatar||!currentUser||currentUser.isAnonymous)return;

  if(currentPhone)setPhone(profile,currentPhone);
  ensureSupport(page);

  avatar.classList.add('mxProfilePhotoEnabled');
  if(currentUser.photoURL)setPhoto(avatar,currentUser.photoURL);

  if(avatar.dataset.mxPhotoReady!=='1'){
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
    avatar.addEventListener('click',event=>{
      if(event.target===input)return;
      if(!busy)input.click();
    });
    avatar.addEventListener('keydown',event=>{
      if((event.key==='Enter'||event.key===' ')&&!busy){event.preventDefault();input.click()}
    });
    input.addEventListener('change',()=>{
      const file=input.files?.[0];
      input.value='';
      if(file)uploadPhoto(file,avatar);
    });
  }

  resolveStoredProfile(currentUser,avatar,profile);
}

export function initAccountProfileEnhancer(){
  if(observer)return;
  onAuthStateChanged(auth,user=>{
    currentUser=user||null;
    currentPhone=user?.phoneNumber||'';
    profileFetchUid='';
    setTimeout(enhanceAccount,0);
  });
  window.addEventListener('maurione:language-change',()=>setTimeout(enhanceAccount,0));
  observer=new MutationObserver(()=>enhanceAccount());
  observer.observe(document.body,{childList:true,subtree:true});
  enhanceAccount();
}
