import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpDown, Bell, CalendarDays, CarFront, Check, ChevronDown, ChevronLeft,
  ChevronRight, Eye, Fuel, Gauge, Heart, ImagePlus, LayoutDashboard, LogOut,
  MapPin, Menu, MessageCircle, Pencil, Phone, Plus, Search, Settings2,
  SlidersHorizontal, Trash2, UserRound, Users, X
} from 'lucide-react';
import { auth, db, firebaseReady } from './lib/firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc
} from 'firebase/firestore';

const contact = {
  whatsapp: import.meta.env.VITE_CARS_WHATSAPP || '',
  phone: import.meta.env.VITE_CARS_PHONE || '',
  location: import.meta.env.VITE_CARS_LOCATION || '',
};
const cloudName = import.meta.env.VITE_CARS_CLOUDINARY_CLOUD_NAME || '';
const uploadPreset = import.meta.env.VITE_CARS_CLOUDINARY_UPLOAD_PRESET || '';

const demoCars = [
  { id:'demo-1', demo:true, brand:'Range Rover', model:'Sport HSE', year:2022, mileage:45000, transmission:'أوتوماتيك', fuel:'بنزين', drive:'4x4', location:'نواكشوط', price:78500, status:'available', featured:true, description:'سيارة تجريبية لمعاينة تصميم MauriOne السيارات فقط.', images:['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=86'] },
  { id:'demo-2', demo:true, brand:'Toyota', model:'Land Cruiser GXR', year:2021, mileage:82000, transmission:'أوتوماتيك', fuel:'ديزل', drive:'4x4', location:'نواكشوط', price:54800, status:'available', featured:true, description:'بيانات تجريبية وستختفي عند إضافة السيارات الحقيقية.', images:['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=86'] },
];

const blankCar = {
  brand:'', model:'', year:'', mileage:'', transmission:'أوتوماتيك', fuel:'بنزين',
  drive:'', location:'نواكشوط', price:'', status:'available', featured:false,
  description:'', images:[]
};

function money(v){
  return Number(v)>0 ? `${new Intl.NumberFormat('en-US').format(Number(v))} MRU` : 'السعر عند التواصل';
}
function num(v){ return new Intl.NumberFormat('en-US').format(Number(v||0)); }
function go(path){ window.history.pushState({},'',path); window.dispatchEvent(new PopStateEvent('popstate')); }
function useRoute(){
  const [path,setPath]=useState(()=>window.location.pathname);
  useEffect(()=>{const h=()=>setPath(window.location.pathname);window.addEventListener('popstate',h);return()=>window.removeEventListener('popstate',h)},[]);
  return path;
}

function Brand(){
  return <button className="brandMark" onClick={()=>go('/')} aria-label="MauriOne">
    <span className="brandLatin"><b>Mauri</b><i>One</i></span>
    <span className="brandArabic">السوق الأول للسيارات في موريتانيا</span>
  </button>;
}

function Header(){
  const [open,setOpen]=useState(false);
  const user=auth?.currentUser;
  return <header className="siteHeader">
    <div className="mobileHeader">
      <button className="headerIcon notificationBtn" aria-label="الإشعارات"><Bell/><span/></button>
      <Brand/>
      <button className="headerIcon" onClick={()=>setOpen(v=>!v)} aria-label="القائمة">{open?<X/>:<Menu/>}</button>
    </div>
    {open&&<div className="mobileDrawer" dir="rtl">
      <button onClick={()=>{go('/');setOpen(false)}}>الرئيسية</button>
      <button onClick={()=>{go('/');setOpen(false);setTimeout(()=>document.getElementById('inventory')?.scrollIntoView({behavior:'smooth'}),20)}}>السيارات</button>
      <button className="drawerUser"><UserRound size={18}/>{user?.displayName||user?.email||'حسابي'}</button>
      <button onClick={()=>signOut(auth)}><LogOut size={18}/> تسجيل الخروج</button>
      <button onClick={()=>{go('/admin');setOpen(false)}}>لوحة الإدارة</button>
    </div>}
  </header>;
}

function FavoriteButton({id}){
  const [on,setOn]=useState(()=>{
    try{return JSON.parse(localStorage.getItem('maurione_favorites')||'[]').includes(id)}catch{return false}
  });
  function toggle(e){
    e.stopPropagation();
    let list=[];try{list=JSON.parse(localStorage.getItem('maurione_favorites')||'[]')}catch{}
    list=on?list.filter(x=>x!==id):[...new Set([...list,id])];
    localStorage.setItem('maurione_favorites',JSON.stringify(list));setOn(!on);
  }
  return <button className={on?'favoriteBtn on':'favoriteBtn'} onClick={toggle} aria-label="المفضلة"><Heart fill={on?'currentColor':'none'}/></button>;
}

function Spec({icon,label,value}){ return <div className="cardSpec">{icon}<strong>{value||'—'}</strong><small>{label}</small></div>; }

function CarCard({car}){
  const title=`${car.brand||''} ${car.model||''} ${car.year||''}`.trim();
  return <article className="carCard" onClick={()=>go(`/cars/${encodeURIComponent(car.id)}`)}>
    <div className="cardMedia">
      {car.images?.[0]?<img src={car.images[0]} alt={title}/>:<CarFront/>}
      <FavoriteButton id={car.id}/>
      <span className="photoCount">{car.images?.length||0} <ImagePlus size={14}/></span>
    </div>
    <div className="cardBody">
      <span className={car.status==='sold'?'cornerBadge sold':'cornerBadge'}>{car.status==='sold'?'مباعة':car.featured?'مميز':'متوفر'}</span>
      <h3>{title}</h3>
      <div className="trimLabel">{car.model||car.brand}</div>
      <div className="cardPrice">{money(car.price)}</div>
      <div className="cardSpecs">
        <Spec icon={<CalendarDays/>} value={car.year} label="السنة"/>
        <Spec icon={<Gauge/>} value={num(car.mileage)} label="كم"/>
        <Spec icon={<Fuel/>} value={car.fuel} label="الوقود"/>
        <Spec icon={<Settings2/>} value={car.transmission} label="ناقل الحركة"/>
        <Spec icon={<CarFront/>} value={car.drive} label="الدفع"/>
      </div>
      {car.location&&<div className="cardLocation"><MapPin size={14}/>{car.location}</div>}
    </div>
  </article>;
}

function Home({cars,loading}){
  const [f,setF]=useState({q:'',brand:'',location:'',year:'',status:'',sort:'latest'});
  const [advanced,setAdvanced]=useState(false);
  const brands=[...new Set(cars.map(c=>c.brand).filter(Boolean))].sort();
  const locations=[...new Set(cars.map(c=>c.location).filter(Boolean))].sort();
  const years=[...new Set(cars.map(c=>c.year).filter(Boolean))].sort((a,b)=>b-a);
  const shown=useMemo(()=>{
    const out=cars.filter(c=>{
      const txt=`${c.brand||''} ${c.model||''} ${c.year||''}`.toLowerCase();
      return (!f.q||txt.includes(f.q.toLowerCase())) && (!f.brand||c.brand===f.brand) &&
        (!f.location||c.location===f.location) && (!f.year||String(c.year)===f.year) &&
        (!f.status||c.status===f.status);
    });
    return [...out].sort((a,b)=>f.sort==='year'?Number(b.year||0)-Number(a.year||0):0);
  },[cars,f]);

  return <main className="homePage" id="inventory">
    <div className="mobileHome container">
      <label className="searchBar"><input value={f.q} onChange={e=>setF({...f,q:e.target.value})} placeholder="ابحث عن سيارة..."/><Search/></label>
      <div className="filterRow">
        <label className="filterPill"><ArrowUpDown/><select value={f.sort} onChange={e=>setF({...f,sort:e.target.value})}><option value="latest">الأحدث أولًا</option><option value="year">حسب السنة</option></select></label>
        <label className="filterPill"><CarFront/><select value={f.brand} onChange={e=>setF({...f,brand:e.target.value})}><option value="">النوع</option>{brands.map(x=><option key={x}>{x}</option>)}</select><ChevronDown/></label>
        <label className="filterPill"><MapPin/><select value={f.location} onChange={e=>setF({...f,location:e.target.value})}><option value="">الموقع</option>{locations.map(x=><option key={x}>{x}</option>)}</select><ChevronDown/></label>
        <button className={advanced?'filterPill active':'filterPill'} onClick={()=>setAdvanced(v=>!v)}><SlidersHorizontal/> فلتر</button>
      </div>
      {advanced&&<div className="advancedFilters">
        <label>السنة<select value={f.year} onChange={e=>setF({...f,year:e.target.value})}><option value="">كل السنوات</option>{years.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>الحالة<select value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option value="">الكل</option><option value="available">متوفرة</option><option value="sold">مباعة</option></select></label>
        <button onClick={()=>setF({q:'',brand:'',location:'',year:'',status:'',sort:'latest'})}>مسح الفلاتر</button>
      </div>}
      {!firebaseReady&&<div className="notice">بيانات تجريبية فقط حتى يتم ربط قاعدة البيانات المستقلة.</div>}
      {loading?<div className="empty">جاري تحميل السيارات...</div>:shown.length?<div className="carsList">{shown.map(c=><CarCard key={c.id} car={c}/>)}</div>:<div className="empty">لا توجد سيارات مطابقة.</div>}
    </div>
    <MobileNav/>
  </main>;
}

function MobileNav(){
  return <nav className="mobileBottomNav">
    <button className="active" onClick={()=>go('/')}><CarFront/><span>الرئيسية</span></button>
    <button onClick={()=>document.querySelector('.searchBar input')?.focus()}><Search/><span>بحث</span></button>
    <button><Heart/><span>المفضلة</span></button>
    <button><MessageCircle/><span>الرسائل</span></button>
    <button><UserRound/><span>حسابي</span></button>
  </nav>;
}

function Detail({car}){
  const [i,setI]=useState(0),[zoom,setZoom]=useState(false);
  if(!car)return <div className="container notFound"><CarFront size={46}/><h2>السيارة غير موجودة</h2><button className="secondary" onClick={()=>go('/')}>العودة</button></div>;
  const imgs=car.images||[];
  const wa=contact.whatsapp?`https://wa.me/${contact.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`مرحبًا، أريد الاستفسار عن ${car.brand} ${car.model} ${car.year}`)}`:'';
  return <main className="detail container">
    <button className="textBtn" onClick={()=>history.back()}><ChevronRight size={17}/> العودة</button>
    <div className="detailGrid"><section><div className="galleryMain" onClick={()=>imgs[i]&&setZoom(true)}>{imgs[i]?<img src={imgs[i]} alt=""/>:<CarFront/>}</div>{imgs.length>1&&<div className="thumbs">{imgs.map((x,n)=><button className={n===i?'on':''} key={`${x}-${n}`} onClick={()=>setI(n)}><img src={x} alt=""/></button>)}</div>}</section>
    <aside className="summary"><span className="eyebrow">{car.brand}</span><h1>{car.model} {car.year}</h1><div className="detailPrice">{money(car.price)}</div><p>{car.description}</p><div className="contactBtns"><a className={wa?'contact wa':'contact disabled'} href={wa||'#'}><MessageCircle/> واتساب</a><a className={contact.phone?'contact':'contact disabled'} href={contact.phone?`tel:${contact.phone}`:'#'}><Phone/> اتصال</a></div></aside></div>
    <div className="specStrip"><div><CalendarDays/><small>السنة</small><strong>{car.year}</strong></div><div><Gauge/><small>الكيلومترات</small><strong>{num(car.mileage)} كم</strong></div><div><Settings2/><small>ناقل الحركة</small><strong>{car.transmission}</strong></div><div><Fuel/><small>الوقود</small><strong>{car.fuel}</strong></div><div><CarFront/><small>الدفع</small><strong>{car.drive||'—'}</strong></div></div>
    {zoom&&<div className="lightbox" onClick={()=>setZoom(false)}><button className="closeLb"><X/></button><img src={imgs[i]} onClick={e=>e.stopPropagation()} alt=""/><button className="prevLb" onClick={e=>{e.stopPropagation();setI((i-1+imgs.length)%imgs.length)}}><ChevronRight/></button><button className="nextLb" onClick={e=>{e.stopPropagation();setI((i+1)%imgs.length)}}><ChevronLeft/></button></div>}
  </main>;
}

function Editor({car,onClose}){
  const [f,setF]=useState(car?{...blankCar,...car}:blankCar),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function upload(files){
    if(!files?.length)return;
    if(!cloudName||!uploadPreset){setError('خدمة رفع الصور لم يتم ربطها بعد.');return}
    setBusy(true);setError('');
    try{
      const urls=[];
      for(const file of [...files]){
        const fd=new FormData();fd.append('file',file);fd.append('upload_preset',uploadPreset);fd.append('folder','maurione-cars');
        const r=await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{method:'POST',body:fd});const j=await r.json();
        if(!r.ok)throw new Error(j?.error?.message||'UPLOAD_FAILED');urls.push(j.secure_url);
      }
      setF(x=>({...x,images:[...(x.images||[]),...urls]}));
    }catch(err){setError(`تعذر رفع الصور: ${err.message}`)}finally{setBusy(false)}
  }
  function makeMain(n){const copy=[...f.images];const [x]=copy.splice(n,1);copy.unshift(x);setF({...f,images:copy})}
  async function save(e){
    e.preventDefault();setBusy(true);setError('');
    const payload={brand:f.brand.trim(),model:f.model.trim(),year:Number(f.year),mileage:Number(f.mileage),transmission:f.transmission,fuel:f.fuel,drive:f.drive.trim(),location:f.location.trim(),price:Number(f.price||0),status:f.status,featured:Boolean(f.featured),description:f.description.trim(),images:f.images||[],updatedAt:serverTimestamp()};
    try{car?.id?await updateDoc(doc(db,'cars',car.id),payload):await addDoc(collection(db,'cars'),{...payload,createdAt:serverTimestamp()});onClose()}catch(err){setError(`تعذر الحفظ: ${err?.code||err?.message}`)}finally{setBusy(false)}
  }
  return <div className="modal"><form className="editor" onSubmit={save}>
    <div className="editorHead"><h2>{car?'تعديل السيارة':'إضافة سيارة'}</h2><button type="button" onClick={onClose}><X/></button></div>
    <div className="editorGrid">
      <label>الماركة<input required value={f.brand} onChange={e=>setF({...f,brand:e.target.value})}/></label>
      <label>الموديل<input required value={f.model} onChange={e=>setF({...f,model:e.target.value})}/></label>
      <label>السنة<input required type="number" value={f.year} onChange={e=>setF({...f,year:e.target.value})}/></label>
      <label>الكيلومترات<input required type="number" value={f.mileage} onChange={e=>setF({...f,mileage:e.target.value})}/></label>
      <label>ناقل الحركة<select value={f.transmission} onChange={e=>setF({...f,transmission:e.target.value})}><option>أوتوماتيك</option><option>عادي</option></select></label>
      <label>الوقود<select value={f.fuel} onChange={e=>setF({...f,fuel:e.target.value})}><option>بنزين</option><option>ديزل</option><option>هجين</option><option>كهرباء</option></select></label>
      <label>الدفع<input value={f.drive} placeholder="4x4" onChange={e=>setF({...f,drive:e.target.value})}/></label>
      <label>الموقع<input value={f.location} onChange={e=>setF({...f,location:e.target.value})}/></label>
      <label>السعر (MRU)<input type="number" value={f.price} onChange={e=>setF({...f,price:e.target.value})}/></label>
      <label>الحالة<select value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option value="available">متوفرة</option><option value="sold">مباعة</option></select></label>
      <label className="checkLabel"><input type="checkbox" checked={Boolean(f.featured)} onChange={e=>setF({...f,featured:e.target.checked})}/> إعلان مميز</label>
    </div>
    <label className="fullLabel">الوصف<textarea rows="5" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></label>
    <label className="uploadBtn"><ImagePlus size={18}/>{busy?'جارٍ الرفع...':'رفع صور السيارة'}<input hidden type="file" accept="image/*" multiple onChange={e=>upload(e.target.files)}/></label>
    {f.images?.length>0&&<div className="adminPics">{f.images.map((x,n)=><div key={`${x}-${n}`} className={n===0?'adminPic mainPic':'adminPic'}><img src={x} alt=""/>{n===0&&<span><Check size={13}/> الرئيسية</span>}<div><button type="button" onClick={()=>makeMain(n)} disabled={n===0}>اجعلها الرئيسية</button><button type="button" onClick={()=>setF({...f,images:f.images.filter((_,i)=>i!==n)})}>حذف</button></div></div>)}</div>}
    {error&&<div className="errorBox">{error}</div>}
    <div className="editorActions"><button type="button" className="secondary" onClick={onClose}>إلغاء</button><button className="primary" disabled={busy}>حفظ السيارة</button></div>
  </form></div>;
}

function Metric({icon,label,value,note}){ return <div className="metricCard"><span className="metricIcon">{icon}</span><div><small>{label}</small><strong>{value}</strong><em>{note}</em></div></div>; }

function Admin({cars}){
  const [state,setState]=useState({loading:firebaseReady,user:null,allowed:false,error:''});
  const [edit,setEdit]=useState(null),[creating,setCreating]=useState(false);
  useEffect(()=>{
    if(!auth){setState({loading:false,user:null,allowed:false,error:''});return}
    return onAuthStateChanged(auth,async user=>{
      if(!user){setState({loading:false,user:null,allowed:false,error:''});return}
      try{const snap=await getDoc(doc(db,'admins',user.uid));setState({loading:false,user,allowed:snap.exists(),error:''})}
      catch(err){setState({loading:false,user,allowed:false,error:err?.code||'permission-denied'})}
    });
  },[]);
  if(!firebaseReady||(!state.loading&&!state.user)) return <div className="adminDenied"><p>سجّل الدخول أولًا.</p></div>;
  if(state.loading) return <div className="adminDenied">جارٍ التحقق...</div>;
  if(!state.allowed) return <div className="adminDenied"><h1>هذا الحساب ليس مديرًا</h1><button onClick={()=>signOut(auth)}>تسجيل الخروج</button></div>;

  async function remove(c){if(confirm(`حذف ${c.brand} ${c.model} نهائيًا؟`))await deleteDoc(doc(db,'cars',c.id))}
  async function toggle(c){await updateDoc(doc(db,'cars',c.id),{status:c.status==='sold'?'available':'sold',updatedAt:serverTimestamp()})}
  const available=cars.filter(c=>c.status!=='sold').length;

  return <main className="adminPage">
    <div className="adminMobileHeader"><button onClick={()=>go('/')}><ChevronRight/></button><Brand/><div className="adminProfile"><span>{state.user?.displayName||'مدير النظام'}</span><UserRound/></div></div>
    <div className="adminWrap container">
      <div className="dashboardTitle"><span>لوحة التحكم</span><h1>مرحبًا بك</h1><p>ملخص سريع لإدارة MauriOne Cars</p></div>
      <div className="metricsGrid">
        <Metric icon={<CarFront/>} label="إجمالي الإعلانات" value={cars.length} note="السيارات المسجلة"/>
        <Metric icon={<Check/>} label="السيارات المتوفرة" value={available} note="متاحة الآن"/>
        <Metric icon={<Eye/>} label="الزوار" value="—" note="يُربط لاحقًا بالتحليلات"/>
        <Metric icon={<MessageCircle/>} label="الاستفسارات" value="—" note="يُربط عند تفعيل الرسائل"/>
      </div>
      <div className="adminPrimaryActions">
        <button className="primary" onClick={()=>setCreating(true)}><Plus/> إضافة سيارة</button>
        <button className="secondary" onClick={()=>go('/')}><Eye/> فتح الموقع</button>
      </div>
      <section className="adminPanel">
        <div className="panelHead"><h2>آخر السيارات</h2><span>{cars.length} سيارة</span></div>
        <div className="adminList">{cars.length?cars.slice(0,8).map(c=><article className="adminRow" key={c.id}>
          {c.images?.[0]?<img src={c.images[0]} alt=""/>:<div className="ph"><CarFront/></div>}
          <div className="rowInfo"><strong>{c.brand} {c.model}</strong><span>{c.year} · {num(c.mileage)} كم</span><b>{money(c.price)}</b></div>
          <span className={c.status==='sold'?'state sold':'state available'}>{c.status==='sold'?'مباعة':'متوفرة'}</span>
          <div className="rowBtns"><button onClick={()=>toggle(c)}>{c.status==='sold'?'إرجاع':'مباعة'}</button><button onClick={()=>setEdit(c)}><Pencil size={15}/></button><button className="danger" onClick={()=>remove(c)}><Trash2 size={15}/></button></div>
        </article>):<div className="empty">لا توجد سيارات بعد.</div>}</div>
      </section>
      <section className="adminPanel analyticsPlaceholder"><div className="panelHead"><h2>الزوار خلال آخر 30 يومًا</h2><span>التحليلات</span></div><div className="emptyChart"><Eye/><strong>سيظهر مخطط الزوار هنا</strong><p>بعد ربط خدمة التحليلات سنعرض العدد الحقيقي بدون بيانات وهمية.</p></div></section>
      <section className="adminPanel inquiriesPanel"><div className="panelHead"><h2>أحدث الاستفسارات</h2><span>0 جديد</span></div><div className="empty">لا توجد استفسارات حتى الآن.</div></section>
      <div className="adminQuick">
        <button onClick={()=>setCreating(true)}><Plus/>إضافة سيارة</button>
        <button><Users/>المستخدمون</button>
        <button><MessageCircle/>الاستفسارات</button>
        <button onClick={()=>signOut(auth)}><LogOut/>تسجيل الخروج</button>
      </div>
    </div>
    {(creating||edit)&&<Editor car={edit} onClose={()=>{setCreating(false);setEdit(null)}}/>}
  </main>;
}

function useCars(){
  const [cars,setCars]=useState(firebaseReady?[]:demoCars),[loading,setLoading]=useState(firebaseReady);
  useEffect(()=>{
    if(!db)return;
    const q=query(collection(db,'cars'),orderBy('createdAt','desc'));
    return onSnapshot(q,s=>{setCars(s.docs.map(d=>({id:d.id,...d.data(),images:Array.isArray(d.data().images)?d.data().images:[]})));setLoading(false)},()=>setLoading(false));
  },[]);
  return{cars,loading};
}

export default function App(){
  const route=useRoute();
  const {cars,loading}=useCars();
  useEffect(()=>{document.documentElement.dataset.theme='light';document.documentElement.style.colorScheme='light';try{localStorage.setItem('maurione_cars_theme','light')}catch{}},[]);
  const isAdmin=route==='/admin'||route.startsWith('/admin/');
  let page;
  if(isAdmin)page=<Admin cars={firebaseReady?cars:[]}/>;
  else if(route.startsWith('/cars/'))page=<Detail car={cars.find(c=>c.id===decodeURIComponent(route.split('/')[2]||''))}/>;
  else page=<Home cars={cars} loading={loading}/>;
  return <div className="app">{!isAdmin&&<Header/>}<div className="routeStage" key={route}>{page}</div>{!isAdmin&&route.startsWith('/cars/')&&<footer className="footer"><Brand/>{contact.location&&<span>{contact.location}</span>}</footer>}</div>;
}
