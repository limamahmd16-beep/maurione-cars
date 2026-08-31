import React,{useEffect,useMemo,useState}from'react';
import{Bell,CarFront,ChevronLeft,CircleHelp,Heart,KeyRound,LogIn,LogOut,Menu,MessageCircle,Save,Search,Settings,ShieldCheck,UserRound,X}from'lucide-react';
import{auth,db}from'./lib/firebase.js';
import{onAuthStateChanged,sendPasswordResetEmail,signOut,updateProfile}from'firebase/auth';
import{doc,serverTimestamp,setDoc}from'firebase/firestore';

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
  const[nameDraft,setNameDraft]=useState(()=>auth?.currentUser?.displayName||'');
  const[accountMessage,setAccountMessage]=useState('');
  const[accountError,setAccountError]=useState('');
  const[busy,setBusy]=useState(false);
  const[favoritesMenuOpen,setFavoritesMenuOpen]=useState(false);

  useEffect(()=>{
    if(!auth)return;
    return onAuthStateChanged(auth,u=>{
      setUser(u||null);
      setGuest(Boolean(u?.isAnonymous)||guestSession());
      setNotifications(getSavedNotifications(u?.uid));
      setNameDraft(u?.displayName||'');
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
    setFavoritesMenuOpen(false);
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

  function openAccount(){
    setFavoritesMenuOpen(false);
    setAccountMessage('');
    setAccountError('');
    setNameDraft(user?.displayName||'');
    setPanel('account');
  }

  function closeToHome(focusSearch=false){
    setFavoritesMenuOpen(false);
    setPanel(null);
    if(focusSearch)setTimeout(()=>document.querySelector('.mxSearch input')?.focus(),60);
  }

  async function saveAccount(){
    if(isGuest||!user)return requestLogin();
    const name=nameDraft.trim();
    if(!name){setAccountError('أدخل الاسم أولًا.');return}
    setBusy(true);setAccountMessage('');setAccountError('');
    try{
      await updateProfile(user,{displayName:name});
      if(db){
        await setDoc(doc(db,'users',user.uid),{name,email:user.email||'',updatedAt:serverTimestamp()},{merge:true});
      }
      setUser({...user,displayName:name});
      setAccountMessage('تم حفظ الاسم بنجاح.');
    }catch(err){setAccountError('تعذر حفظ التعديل الآن. حاول مرة أخرى.')}finally{setBusy(false)}
  }

  async function sendPasswordLink(){
    if(isGuest||!user?.email)return requestLogin();
    setBusy(true);setAccountMessage('');setAccountError('');
    try{
      await sendPasswordResetEmail(auth,user.email);
      setAccountMessage('تم إرسال رابط تغيير كلمة المرور إلى بريدك الإلكتروني.');
    }catch(err){setAccountError('تعذر إرسال رابط تغيير كلمة المرور الآن.')}finally{setBusy(false)}
  }

  useEffect(()=>{
    const clickHandler=e=>{
      const bell=e.target.closest?.('.mxBell');
      if(bell){e.preventDefault();openNotifications();return}

      const bottom=e.target.closest?.('.mxBottom button');
      if(bottom){
        const buttons=[...bottom.parentElement.querySelectorAll('button')];
        const index=buttons.indexOf(bottom);
        if(index===2){e.preventDefault();collectFavorites();return}
        if(index===4){e.preventDefault();openAccount();return}
      }

      const drawer=e.target.closest?.('.mxDrawer button');
      if(drawer){
        const buttons=[...drawer.parentElement.querySelectorAll('button')];
        const index=buttons.indexOf(drawer);
        if(index===2){
          e.preventDefault();
          openAccount();
          setTimeout(()=>document.querySelector('.mxHeaderBar .mxHeaderIcon:last-child')?.click(),0);
          return;
        }
        if(isGuest&&index===4){
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

  if(panel==='account'){
    return <div className="mxAccountPage" dir="rtl">
      <header className="mxAccountHeader">
        <button onClick={()=>setPanel(null)} aria-label="إغلاق"><X/></button>
        <div className="mxAccountBrand" dir="ltr"><b>Mauri</b><i>One</i></div>
        <span aria-hidden="true"/>
      </header>

      <main className="mxAccountBody">
        {isGuest?<section className="mxAccountGuest">
          <div className="mxAccountAvatar"><UserRound/></div>
          <h1>حسابي</h1>
          <p>أنت تتصفح MauriOne كزائر. سجّل الدخول للوصول إلى إعدادات الحساب.</p>
          <button onClick={requestLogin}><LogIn/> تسجيل الدخول أو إنشاء حساب</button>
        </section>:<>
          <section className="mxAccountProfile">
            <div className="mxAccountAvatar"><UserRound/></div>
            <div><strong>{user?.displayName||'مستخدم MauriOne'}</strong><span dir="ltr">{user?.email||'—'}</span></div>
          </section>

          <section className="mxAccountMenu">
            <button onClick={collectFavorites}><Heart/><span><strong>المفضلة</strong><small>السيارات التي حفظتها</small></span><ChevronLeft/></button>
            <button onClick={()=>{setAccountMessage('');setAccountError('');setPanel('account-settings')}}><Settings/><span><strong>إعدادات الحساب</strong><small>تعديل اسم الحساب</small></span><ChevronLeft/></button>
            <button onClick={()=>{setAccountMessage('');setAccountError('');setPanel('password')}}><KeyRound/><span><strong>تغيير كلمة المرور</strong><small>إرسال رابط آمن إلى بريدك</small></span><ChevronLeft/></button>
            <button onClick={openNotifications}><Bell/><span><strong>الإشعارات</strong><small>عرض التنبيهات الأخيرة</small></span><ChevronLeft/></button>
            <button onClick={()=>setPanel('help')}><CircleHelp/><span><strong>المساعدة</strong><small>معلومات استخدام الحساب</small></span><ChevronLeft/></button>
            <button onClick={()=>setPanel('privacy')}><ShieldCheck/><span><strong>سياسة الخصوصية</strong><small>كيف تُستخدم بيانات الحساب</small></span><ChevronLeft/></button>
          </section>

          <button className="mxAccountLogout" onClick={()=>signOut(auth)}><LogOut/> تسجيل الخروج</button>
        </>}
      </main>
    </div>
  }

  if(panel==='favorites'){
    return <div className="mxFavoritesPage" dir="rtl">
      <header className="mxHeader mxFavoritesAppHeader">
        <div className="mxHeaderBar">
          <button className="mxHeaderIcon mxBell" aria-label="الإشعارات"><Bell/><span/></button>
          <div className="mxBrand mxFavoritesAppBrand" dir="ltr"><span className="mxBrandWord"><b>Mauri</b><i>One</i></span></div>
          <button className="mxHeaderIcon" onClick={()=>setFavoritesMenuOpen(v=>!v)} aria-label="القائمة">{favoritesMenuOpen?<X/>:<Menu/>}</button>
        </div>
        {favoritesMenuOpen&&<div className="mxDrawer" dir="rtl">
          <button onClick={()=>closeToHome(false)}>الرئيسية</button>
          <button onClick={()=>closeToHome(true)}>البحث</button>
          <button><UserRound/> {user?.displayName||user?.email||'حسابي'}</button>
          <button onClick={()=>{setFavoritesMenuOpen(false);setPanel(null);window.history.pushState({},'', '/admin');window.dispatchEvent(new PopStateEvent('popstate'))}}>لوحة الإدارة</button>
          <button onClick={()=>signOut(auth)}><LogOut/> تسجيل الخروج</button>
        </div>}
      </header>

      <main className="mxFavoritesBody">
        <section className="mxFavoritesTitleBar">
          <h1>المفضلة</h1>
          <p>السيارات التي حفظتها</p>
        </section>
        {favorites.length?<div className="mxFavoriteList mxFavoriteListPage">{favorites.map(item=><button key={item.key} onClick={()=>{setPanel(null);setTimeout(()=>item.node?.click(),20)}}>{item.image?<img src={item.image} alt=""/>:<div/>}<span><strong>{item.title}</strong>{item.trim&&<small>{item.trim}</small>}<b>{item.price}</b></span></button>)}</div>:<div className="mxFavoritesEmpty"><Heart/><strong>لم تحفظ أي سيارة في المفضلة بعد.</strong></div>}
      </main>

      <nav className="mxBottom mxFavoritesBottom">
        <button onClick={()=>closeToHome(false)}><CarFront/><span>الرئيسية</span></button>
        <button onClick={()=>closeToHome(true)}><Search/><span>بحث</span></button>
        <button className="active"><Heart/><span>المفضلة</span></button>
        <button><MessageCircle/><span>الرسائل</span></button>
        <button><UserRound/><span>حسابي</span></button>
      </nav>
    </div>
  }

  const simpleTitle=panel==='account-settings'?'إعدادات الحساب':panel==='password'?'تغيير كلمة المرور':panel==='help'?'المساعدة':panel==='privacy'?'سياسة الخصوصية':null;

  return <div className="mxFunctionBackdrop" onClick={()=>setPanel(null)} dir="rtl">
    <section className="mxFunctionSheet" onClick={e=>e.stopPropagation()}>
      <button className="mxFunctionClose" onClick={()=>setPanel(panel==='account-settings'||panel==='password'||panel==='help'||panel==='privacy'?'account':null)} aria-label="إغلاق"><X/></button>

      {simpleTitle&&<h2>{simpleTitle}</h2>}

      {panel==='account-settings'&&<>
        <div className="mxFunctionIcon"><Settings/></div>
        <label className="mxAccountEditField">الاسم<input value={nameDraft} onChange={e=>setNameDraft(e.target.value)} placeholder="الاسم"/></label>
        <label className="mxAccountEditField">البريد الإلكتروني<input value={user?.email||''} readOnly dir="ltr"/></label>
        {accountMessage&&<div className="mxFunctionSuccess">{accountMessage}</div>}
        {accountError&&<div className="mxFunctionError">{accountError}</div>}
        <button className="mxFunctionPrimary" onClick={saveAccount} disabled={busy}><Save/> {busy?'جارٍ الحفظ...':'حفظ التعديل'}</button>
      </>}

      {panel==='password'&&<>
        <div className="mxFunctionIcon"><KeyRound/></div>
        <p className="mxFunctionText">سيتم إرسال رابط آمن لتغيير كلمة المرور إلى بريدك الإلكتروني المسجل.</p>
        <div className="mxAccountInfo"><span>البريد الإلكتروني</span><strong dir="ltr">{user?.email||'—'}</strong></div>
        {accountMessage&&<div className="mxFunctionSuccess">{accountMessage}</div>}
        {accountError&&<div className="mxFunctionError">{accountError}</div>}
        <button className="mxFunctionPrimary" onClick={sendPasswordLink} disabled={busy}><KeyRound/> {busy?'جارٍ الإرسال...':'إرسال رابط تغيير كلمة المرور'}</button>
      </>}

      {panel==='help'&&<>
        <div className="mxFunctionIcon"><CircleHelp/></div>
        <div className="mxFunctionText mxFunctionInfoList"><p>• استخدم «المفضلة» لحفظ السيارات التي تهمك.</p><p>• من «إعدادات الحساب» يمكنك تعديل اسمك.</p><p>• من «تغيير كلمة المرور» يمكنك طلب رابط آمن على بريدك.</p><p>• جرس الإشعارات يعرض تنبيهات حسابك داخل الموقع.</p></div>
      </>}

      {panel==='privacy'&&<>
        <div className="mxFunctionIcon"><ShieldCheck/></div>
        <div className="mxFunctionText mxFunctionInfoList"><p>تستخدم بيانات الاسم والبريد لتسجيل الدخول وإظهار معلومات الحساب.</p><p>المفضلة والإشعارات الحالية تُحفظ محليًا في متصفحك، بينما بيانات الحساب الأساسية مرتبطة بخدمة تسجيل الدخول وقاعدة البيانات.</p><p>لا تعرض صفحة السيارات بريدك الإلكتروني أو اسمك للعامة.</p></div>
      </>}

      {panel==='notifications'&&<>
        <div className="mxFunctionIcon"><Bell/></div>
        <h2>الإشعارات</h2>
        {notifications.length?<div className="mxNotificationList">{notifications.map(n=><div key={n.id}><strong>{n.text}</strong><small>{n.time}</small></div>)}</div>:<div className="mxFunctionEmpty">لا توجد إشعارات جديدة.</div>}
      </>}
    </section>
  </div>;
}
