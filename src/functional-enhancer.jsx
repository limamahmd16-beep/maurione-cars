import React,{useEffect,useMemo,useState}from'react';
import{Bell,Heart,LogIn,LogOut,UserRound,X}from'lucide-react';
import{auth}from'./lib/firebase.js';
import{onAuthStateChanged,signOut}from'firebase/auth';

function getSavedNotifications(uid){
  try{return JSON.parse(localStorage.getItem(`maurione_notifications_${uid||'guest'}`)||'[]')}catch{return[]}
}
function saveNotifications(uid,list){
  try{localStorage.setItem(`maurione_notifications_${uid||'guest'}`,JSON.stringify(list.slice(0,30)))}catch{}
}
function guestSession(){try{return sessionStorage.getItem('maurione_guest')==='1'}catch{return false}}

export default function FunctionalEnhancer(){
  const[user,setUser]=useState(()=>auth?.currentUser||null);
  const[panel,setPanel]=useState(null);
  const[notifications,setNotifications]=useState(()=>getSavedNotifications(auth?.currentUser?.uid));
  const[favorites,setFavorites]=useState([]);
  const[guest,setGuest]=useState(()=>guestSession()||Boolean(auth?.currentUser?.isAnonymous));

  useEffect(()=>{
    if(!auth)return;
    return onAuthStateChanged(auth,u=>{
      setUser(u||null);
      setGuest(Boolean(u?.isAnonymous)||guestSession());
      setNotifications(getSavedNotifications(u?.uid));
    });
  },[]);

  const isGuest=guest||!user||Boolean(user?.isAnonymous);
  const unread=useMemo(()=>notifications.some(n=>!n.read),[notifications]);

  function collectFavorites(){
    const items=[...document.querySelectorAll('.mxCard')]
      .filter(card=>card.querySelector('.mxFav.on'))
      .map((card,index)=>({
        key:index,
        node:card,
        title:card.querySelector('.mxCardInfo h3')?.textContent?.trim()||'سيارة',
        trim:card.querySelector('.mxTrim')?.textContent?.trim()||'',
        price:card.querySelector('.mxPrice')?.textContent?.trim()||'',
        image:card.querySelector('.mxCardImage img')?.getAttribute('src')||''
      }));
    setFavorites(items);
    setPanel('favorites');
  }

  function addFavoriteNotification(title){
    const next=[{id:Date.now(),text:`تمت إضافة ${title||'السيارة'} إلى المفضلة`,read:false,time:new Date().toLocaleString('ar')},...notifications];
    setNotifications(next);
    saveNotifications(user?.uid,next);
  }

  function openNotifications(){
    const next=notifications.map(n=>({...n,read:true}));
    setNotifications(next);
    saveNotifications(user?.uid,next);
    setPanel('notifications');
  }

  function requestLogin(){
    setPanel(null);
    window.dispatchEvent(new CustomEvent('maurione:show-auth'));
  }

  useEffect(()=>{
    const clickHandler=e=>{
      const bell=e.target.closest?.('.mxBell');
      if(bell){e.preventDefault();openNotifications();return}

      const bottom=e.target.closest?.('.mxBottom button');
      if(bottom){
        const text=bottom.textContent||'';
        if(text.includes('المفضلة')){e.preventDefault();collectFavorites();return}
        if(text.includes('حسابي')){e.preventDefault();setPanel('account');return}
      }

      const drawer=e.target.closest?.('.mxDrawer button');
      if(drawer){
        const text=drawer.textContent||'';
        const buttons=[...drawer.parentElement.querySelectorAll('button')];
        if(buttons.indexOf(drawer)===2){
          e.preventDefault();
          setPanel('account');
          setTimeout(()=>document.querySelector('.mxHeaderBar .mxHeaderIcon:last-child')?.click(),0);
          return;
        }
        if(isGuest&&text.includes('تسجيل الخروج')){
          e.preventDefault();e.stopPropagation();requestLogin();return;
        }
      }

      const fav=e.target.closest?.('.mxFav');
      if(fav){
        const card=fav.closest('.mxCard');
        const title=card?.querySelector('.mxCardInfo h3')?.textContent?.trim();
        setTimeout(()=>{
          if(fav.classList.contains('on')) addFavoriteNotification(title);
          if(panel==='favorites') collectFavorites();
        },20);
      }

      const quick=e.target.closest?.('.mxAdminQuick button');
      if(quick){
        const text=quick.textContent||'';
        if(text.includes('الاستفسارات')){
          const target=[...document.querySelectorAll('.mxPanel')].find(p=>p.textContent?.includes('الاستفسارات'));
          if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'})}
        }
      }
    };
    document.addEventListener('click',clickHandler,true);
    return()=>document.removeEventListener('click',clickHandler,true);
  },[panel,notifications,user,isGuest]);

  useEffect(()=>{
    const applyBadge=()=>{
      const dot=document.querySelector('.mxBell span');
      if(dot)dot.style.display=unread?'block':'none';
    };
    applyBadge();
    const observer=new MutationObserver(applyBadge);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[unread]);

  if(!panel)return null;

  return <div className="mxFunctionBackdrop" onClick={()=>setPanel(null)} dir="rtl">
    <section className="mxFunctionSheet" onClick={e=>e.stopPropagation()}>
      <button className="mxFunctionClose" onClick={()=>setPanel(null)} aria-label="إغلاق"><X/></button>

      {panel==='account'&&<>
        <div className="mxFunctionIcon"><UserRound/></div>
        <h2>حسابي</h2>
        {isGuest?<>
          <p className="mxGuestAccountText">أنت تتصفح MauriOne كزائر. يمكنك تسجيل الدخول أو إنشاء حساب في أي وقت.</p>
          <button className="mxFunctionPrimary" onClick={requestLogin}><LogIn/> تسجيل الدخول</button>
        </>:<>
          <div className="mxAccountInfo"><span>الاسم</span><strong>{user?.displayName||'مستخدم MauriOne'}</strong><span>البريد الإلكتروني</span><strong dir="ltr">{user?.email||'—'}</strong></div>
          <button className="mxFunctionPrimary" onClick={()=>signOut(auth)}><LogOut/> تسجيل الخروج</button>
        </>}
      </>}

      {panel==='notifications'&&<>
        <div className="mxFunctionIcon"><Bell/></div>
        <h2>الإشعارات</h2>
        {notifications.length?<div className="mxNotificationList">{notifications.map(n=><div key={n.id}><strong>{n.text}</strong><small>{n.time}</small></div>)}</div>:<div className="mxFunctionEmpty">لا توجد إشعارات جديدة.</div>}
      </>}

      {panel==='favorites'&&<>
        <div className="mxFunctionIcon"><Heart/></div>
        <h2>المفضلة</h2>
        {favorites.length?<div className="mxFavoriteList">{favorites.map(item=><button key={item.key} onClick={()=>{setPanel(null);setTimeout(()=>item.node?.click(),20)}}>{item.image?<img src={item.image} alt=""/>:<div/>}<span><strong>{item.title}</strong>{item.trim&&<small>{item.trim}</small>}<b>{item.price}</b></span></button>)}</div>:<div className="mxFunctionEmpty">لم تحفظ أي سيارة في المفضلة بعد.</div>}
      </>}
    </section>
  </div>;
}
