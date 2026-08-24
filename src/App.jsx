import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, CalendarDays, CarFront, Check, ChevronLeft, ChevronRight, Fuel,
  Gauge, ImagePlus, LogIn, LogOut, Menu, MessageCircle, Moon, Pencil, Phone,
  Plus, Search, Settings2, Sun, Trash2, X
} from 'lucide-react';
import { auth, db, firebaseReady } from './lib/firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
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
  { id:'demo-1', demo:true, brand:'Mercedes-Benz', model:'GLE 450', year:2023, mileage:18500, transmission:'أوتوماتيك', fuel:'بنزين', price:0, status:'available', description:'سيارة تجريبية لمعاينة تصميم MauriOne السيارات فقط.', images:['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1800&q=86'] },
  { id:'demo-2', demo:true, brand:'BMW', model:'X6', year:2022, mileage:32000, transmission:'أوتوماتيك', fuel:'بنزين', price:0, status:'available', description:'بيانات تجريبية وستختفي عند ربط Firebase المستقل وإضافة السيارات الحقيقية.', images:['https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1800&q=86'] },
  { id:'demo-3', demo:true, brand:'Toyota', model:'Land Cruiser', year:2021, mileage:57000, transmission:'أوتوماتيك', fuel:'ديزل', price:0, status:'sold', description:'مثال لحالة سيارة مباعة.', images:['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1800&q=86'] },
];

const blankCar = { brand:'', model:'', year:'', mileage:'', transmission:'أوتوماتيك', fuel:'بنزين', price:'', status:'available', description:'', images:[] };

function money(v){ return Number(v)>0 ? `${new Intl.NumberFormat('en-US').format(Number(v))} USD` : 'السعر عند التواصل'; }
function num(v){ return new Intl.NumberFormat('en-US').format(Number(v||0)); }
function go(path){ window.history.pushState({},'',path); window.dispatchEvent(new PopStateEvent('popstate')); }
function useRoute(){ const [path,setPath]=useState(()=>window.location.pathname); useEffect(()=>{const h=()=>setPath(window.location.pathname); window.addEventListener('popstate',h); return()=>window.removeEventListener('popstate',h)},[]); return path; }

function Brand(){ return <button className="brandMark" onClick={()=>go('/')} aria-label="MauriOne السيارات"><span className="brandLatin">MauriOne</span><span className="brandArabic">السيارات</span></button>; }

function Header({theme,setTheme}){
  const [open,setOpen]=useState(false);
  return <header className="siteHeader"><div className="container headerIn">
    <Brand/>
    <nav className={open?'nav open':'nav'}>
      <button onClick={()=>{go('/');setOpen(false)}}>الرئيسية</button>
      <button onClick={()=>{go('/');setOpen(false);setTimeout(()=>document.getElementById('inventory')?.scrollIntoView({behavior:'smooth'}),20)}}>السيارات</button>
      <button className="adminNav" onClick={()=>{go('/admin');setOpen(false)}}>الإدارة</button>
    </nav>
    <div className="headActions">
      <button className="iconBtn" onClick={()=>setTheme(theme==='light'?'dark':'light')} aria-label="تغيير الوضع">{theme==='light'?<Moon size={18}/>:<Sun size={18}/>}</button>
      <button className="iconBtn mobileMenu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
    </div>
  </div></header>;
}

function Hero(){ return <section className="hero"><div className="heroImage"/><div className="heroShade"/><div className="container heroContent">
  <span className="eyebrow">MAURIONE CARS</span>
  <h1>سيارتك القادمة<br/><em>تبدأ من هنا</em></h1>
  <p>مجموعة مختارة ومفحوصة بعناية من السيارات المستعملة بحالة ممتازة، بأسعار تنافسية وثقة كاملة</p>
  <button className="primary" onClick={()=>document.getElementById('inventory')?.scrollIntoView({behavior:'smooth'})}>تصفح السيارات <ArrowRight size={17}/></button>
</div></section>; }

function CarCard({car}){ return <article className="carCard" onClick={()=>go(`/cars/${encodeURIComponent(car.id)}`)}>
  <div className="cardMedia">{car.images?.[0]?<img src={car.images[0]} alt={`${car.brand} ${car.model}`}/>:<CarFront/>}<span className={car.status==='sold'?'badge sold':'badge available'}>{car.status==='sold'?'مباعة':'متوفرة'}</span>{car.demo&&<span className="demoTag">عرض تجريبي</span>}</div>
  <div className="cardBody"><span className="brandLabel">{car.brand}</span><h3>{car.model}</h3><div className="miniSpecs"><span>{car.year}</span><span>{num(car.mileage)} KM</span></div><div className="cardFoot"><strong>{money(car.price)}</strong><span>عرض التفاصيل <ChevronLeft size={15}/></span></div></div>
</article>; }

function Home({cars,loading}){
  const [f,setF]=useState({q:'',brand:'',year:'',max:''});
  const brands=[...new Set(cars.map(c=>c.brand).filter(Boolean))].sort();
  const years=[...new Set(cars.map(c=>c.year).filter(Boolean))].sort((a,b)=>b-a);
  const prices=cars.map(c=>Number(c.price||0)).filter(x=>x>0); const maxPrice=prices.length?Math.max(...prices):0;
  const shown=useMemo(()=>cars.filter(c=>{
    const txt=`${c.brand} ${c.model}`.toLowerCase();
    return (!f.q||txt.includes(f.q.toLowerCase())) && (!f.brand||c.brand===f.brand) && (!f.year||String(c.year)===f.year) && (!f.max||Number(c.price||0)===0||Number(c.price)<=Number(f.max));
  }),[cars,f]);
  return <><Hero/><section className="inventory section" id="inventory"><div className="container">
    <div className="sectionHead"><div><span className="eyebrow">المخزون الحالي</span><h2>سيارات مختارة بعناية</h2></div><p>كل سيارة لها صفحة مستقلة، صور متعددة، مواصفات واضحة، وتواصل مباشر.</p></div>
    <div className="filters"><label><Search size={17}/><input value={f.q} onChange={e=>setF({...f,q:e.target.value})} placeholder="ابحث بالماركة أو الموديل"/></label><label><select value={f.brand} onChange={e=>setF({...f,brand:e.target.value})}><option value="">كل الماركات</option>{brands.map(x=><option key={x}>{x}</option>)}</select></label><label><select value={f.year} onChange={e=>setF({...f,year:e.target.value})}><option value="">كل السنوات</option>{years.map(x=><option key={x}>{x}</option>)}</select></label><label><select value={f.max} onChange={e=>setF({...f,max:e.target.value})}><option value="">كل الأسعار</option>{maxPrice>0&&<><option value={Math.ceil(maxPrice*.4)}>حتى {money(Math.ceil(maxPrice*.4))}</option><option value={Math.ceil(maxPrice*.7)}>حتى {money(Math.ceil(maxPrice*.7))}</option><option value={maxPrice}>حتى {money(maxPrice)}</option></>}</select></label></div>
    {!firebaseReady&&<div className="notice">هذه نسخة مستقلة من MauriOne السيارات. البيانات الحالية تجريبية فقط حتى يتم إنشاء Firebase جديد خاص بهذا المشروع.</div>}
    {loading?<div className="empty">جاري تحميل السيارات...</div>:shown.length?<div className="carsGrid">{shown.map(c=><CarCard key={c.id} car={c}/>)}</div>:<div className="empty">لا توجد سيارات مطابقة.</div>}
  </div></section></>;
}

function Detail({car}){
  const [i,setI]=useState(0),[zoom,setZoom]=useState(false); if(!car)return <div className="container notFound"><CarFront size={46}/><h2>السيارة غير موجودة</h2><button className="secondary" onClick={()=>go('/')}>العودة</button></div>;
  const imgs=car.images||[]; const wa=contact.whatsapp?`https://wa.me/${contact.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`مرحبًا، أريد الاستفسار عن ${car.brand} ${car.model} ${car.year}`)}`:'';
  return <main className="detail container"><button className="textBtn" onClick={()=>history.back()}><ChevronRight size={17}/> العودة</button><div className="detailGrid"><section><div className="galleryMain" onClick={()=>imgs[i]&&setZoom(true)}>{imgs[i]?<img src={imgs[i]} alt=""/>:<CarFront/>}</div>{imgs.length>1&&<div className="thumbs">{imgs.map((x,n)=><button className={n===i?'on':''} key={`${x}-${n}`} onClick={()=>setI(n)}><img src={x} alt=""/></button>)}</div>}</section><aside className="summary"><span className="eyebrow">{car.brand}</span><h1>{car.model}</h1><div className="detailPrice">{money(car.price)}</div><p>{car.description}</p><div className="contactBtns"><a className={wa?'contact wa':'contact disabled'} href={wa||'#'}><MessageCircle/> واتساب</a><a className={contact.phone?'contact':'contact disabled'} href={contact.phone?`tel:${contact.phone}`:'#'}><Phone/> اتصال</a></div></aside></div><div className="specStrip"><div><CalendarDays/><small>السنة</small><strong>{car.year}</strong></div><div><Gauge/><small>الكيلومترات</small><strong>{num(car.mileage)} KM</strong></div><div><Settings2/><small>ناقل الحركة</small><strong>{car.transmission}</strong></div><div><Fuel/><small>الوقود</small><strong>{car.fuel}</strong></div></div>{zoom&&<div className="lightbox" onClick={()=>setZoom(false)}><button className="closeLb"><X/></button><img src={imgs[i]} onClick={e=>e.stopPropagation()} alt=""/><button className="prevLb" onClick={e=>{e.stopPropagation();setI((i-1+imgs.length)%imgs.length)}}><ChevronRight/></button><button className="nextLb" onClick={e=>{e.stopPropagation();setI((i+1)%imgs.length)}}><ChevronLeft/></button></div>}</main>;
}

function AdminLogin(){ const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false); async function submit(e){e.preventDefault();setBusy(true);setError('');try{await signInWithEmailAndPassword(auth,email.trim(),password)}catch(err){setError(`تعذر تسجيل الدخول (${err?.code||'error'})`)}finally{setBusy(false)}} return <main className="adminLogin"><section className="loginCard"><Brand/><div className="loginIcon"><LogIn/></div><h1>دخول الإدارة</h1>{!firebaseReady?<div className="notice">لم يتم ربط Firebase بعد. سننشئ Firebase جديدًا خاصًا بـMauriOne السيارات ولن نستخدم أي مشروع قديم.</div>:<form onSubmit={submit}><label>البريد الإلكتروني<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>كلمة المرور<input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<div className="errorBox">{error}</div>}<button className="primary" disabled={busy}>{busy?'جارٍ الدخول...':'دخول آمن'}</button></form>}<button className="textBtn" onClick={()=>go('/')}>العودة للموقع</button></section></main>; }

function Editor({car,onClose}){
  const [f,setF]=useState(car?{...blankCar,...car}:blankCar),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function upload(files){ if(!files?.length)return; if(!cloudName||!uploadPreset){setError('Cloudinary المستقل لم يتم ربطه بعد.');return} setBusy(true);setError('');try{const urls=[];for(const file of [...files]){const fd=new FormData();fd.append('file',file);fd.append('upload_preset',uploadPreset);fd.append('folder','maurione-cars');const r=await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{method:'POST',body:fd});const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||'UPLOAD_FAILED');urls.push(j.secure_url)}setF(x=>({...x,images:[...(x.images||[]),...urls]}))}catch(err){setError(`تعذر رفع الصور: ${err.message}`)}finally{setBusy(false)}}
  function makeMain(n){const copy=[...f.images];const [x]=copy.splice(n,1);copy.unshift(x);setF({...f,images:copy})}
  async function save(e){e.preventDefault();setBusy(true);setError('');const payload={brand:f.brand.trim(),model:f.model.trim(),year:Number(f.year),mileage:Number(f.mileage),transmission:f.transmission,fuel:f.fuel,price:Number(f.price||0),status:f.status,description:f.description.trim(),images:f.images||[],updatedAt:serverTimestamp()};try{car?.id?await updateDoc(doc(db,'cars',car.id),payload):await addDoc(collection(db,'cars'),{...payload,createdAt:serverTimestamp()});onClose()}catch(err){setError(`تعذر الحفظ: ${err?.code||err?.message}`)}finally{setBusy(false)}}
  return <div className="modal"><form className="editor" onSubmit={save}><div className="editorHead"><h2>{car?'تعديل السيارة':'إضافة سيارة'}</h2><button type="button" onClick={onClose}><X/></button></div><div className="editorGrid"><label>الماركة<input required value={f.brand} onChange={e=>setF({...f,brand:e.target.value})}/></label><label>الموديل<input required value={f.model} onChange={e=>setF({...f,model:e.target.value})}/></label><label>السنة<input required type="number" value={f.year} onChange={e=>setF({...f,year:e.target.value})}/></label><label>الكيلومترات<input required type="number" value={f.mileage} onChange={e=>setF({...f,mileage:e.target.value})}/></label><label>ناقل الحركة<select value={f.transmission} onChange={e=>setF({...f,transmission:e.target.value})}><option>أوتوماتيك</option><option>عادي</option></select></label><label>الوقود<select value={f.fuel} onChange={e=>setF({...f,fuel:e.target.value})}><option>بنزين</option><option>ديزل</option><option>هجين</option><option>كهرباء</option></select></label><label>السعر (USD)<input type="number" value={f.price} onChange={e=>setF({...f,price:e.target.value})}/></label><label>الحالة<select value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option value="available">متوفرة</option><option value="sold">مباعة</option></select></label></div><label className="fullLabel">الوصف<textarea rows="5" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></label><label className="uploadBtn"><ImagePlus size={18}/>{busy?'جارٍ الرفع...':'رفع صور السيارة'}<input hidden type="file" accept="image/*" multiple onChange={e=>upload(e.target.files)}/></label>{f.images?.length>0&&<div className="adminPics">{f.images.map((x,n)=><div key={`${x}-${n}`} className={n===0?'adminPic mainPic':'adminPic'}><img src={x} alt=""/>{n===0&&<span><Check size={13}/> الرئيسية</span>}<div><button type="button" onClick={()=>makeMain(n)} disabled={n===0}>اجعلها الرئيسية</button><button type="button" onClick={()=>setF({...f,images:f.images.filter((_,i)=>i!==n)})}>حذف</button></div></div>)}</div>}{error&&<div className="errorBox">{error}</div>}<div className="editorActions"><button type="button" className="secondary" onClick={onClose}>إلغاء</button><button className="primary" disabled={busy}>حفظ السيارة</button></div></form></div>;
}

function Admin({cars}){
  const [state,setState]=useState({loading:firebaseReady,user:null,allowed:false,error:''}),[edit,setEdit]=useState(null),[creating,setCreating]=useState(false);
  useEffect(()=>{if(!auth){setState({loading:false,user:null,allowed:false,error:''});return}return onAuthStateChanged(auth,async user=>{if(!user){setState({loading:false,user:null,allowed:false,error:''});return}try{const snap=await getDoc(doc(db,'admins',user.uid));setState({loading:false,user,allowed:snap.exists(),error:''})}catch(err){setState({loading:false,user,allowed:false,error:err?.code||'permission-denied'})}})},[]);
  if(!firebaseReady||(!state.loading&&!state.user)) return <AdminLogin/>;
  if(state.loading) return <div className="adminLogin"><div className="loginCard">جارٍ التحقق...</div></div>;
  if(!state.allowed) return <div className="adminLogin"><section className="loginCard"><h1>الحساب ليس مديرًا بعد</h1><p>هذا المشروع سيستخدم مجموعة <b>admins</b> داخل Firebase الجديد الخاص بـMauriOne السيارات.</p>{state.error&&<div className="errorBox">{state.error}</div>}<button className="secondary" onClick={()=>signOut(auth)}>تسجيل الخروج</button></section></div>;
  async function remove(c){if(confirm(`حذف ${c.brand} ${c.model} نهائيًا؟`))await deleteDoc(doc(db,'cars',c.id))}
  async function toggle(c){await updateDoc(doc(db,'cars',c.id),{status:c.status==='sold'?'available':'sold',updatedAt:serverTimestamp()})}
  return <main className="adminPage"><div className="container adminWrap"><div className="adminTop"><div><span className="eyebrow">لوحة الإدارة</span><h1>إدارة السيارات</h1><p>{cars.length} سيارة في قاعدة البيانات</p></div><div className="adminTopBtns"><button className="secondary" onClick={()=>go('/')}>فتح الموقع</button><button className="secondary" onClick={()=>signOut(auth)}><LogOut size={16}/> خروج</button><button className="primary" onClick={()=>setCreating(true)}><Plus size={17}/> إضافة سيارة</button></div></div><div className="adminList">{cars.length?cars.map(c=><article className="adminRow" key={c.id}>{c.images?.[0]?<img src={c.images[0]} alt=""/>:<div className="ph"><CarFront/></div>}<div className="rowInfo"><strong>{c.brand} {c.model}</strong><span>{c.year} · {num(c.mileage)} KM · {money(c.price)}</span></div><span className={c.status==='sold'?'state sold':'state available'}>{c.status==='sold'?'مباعة':'متوفرة'}</span><div className="rowBtns"><button onClick={()=>toggle(c)}>{c.status==='sold'?'إرجاع للمتوفر':'تحديد كمباعة'}</button><button onClick={()=>setEdit(c)}><Pencil size={14}/> تعديل</button><button className="danger" onClick={()=>remove(c)}><Trash2 size={14}/> حذف</button></div></article>):<div className="empty">لا توجد سيارات بعد.</div>}</div></div>{(creating||edit)&&<Editor car={edit} onClose={()=>{setCreating(false);setEdit(null)}}/>}</main>;
}

function useCars(){const [cars,setCars]=useState(firebaseReady?[]:demoCars),[loading,setLoading]=useState(firebaseReady);useEffect(()=>{if(!db)return;const q=query(collection(db,'cars'),orderBy('createdAt','desc'));return onSnapshot(q,s=>{setCars(s.docs.map(d=>({id:d.id,...d.data(),images:Array.isArray(d.data().images)?d.data().images:[]})));setLoading(false)},()=>setLoading(false))},[]);return{cars,loading}}

export default function App(){
  const route=useRoute(); const {cars,loading}=useCars(); const [theme,setTheme]=useState(()=>localStorage.getItem('maurione_cars_theme')||'light');
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('maurione_cars_theme',theme)},[theme]);
  const isAdmin=route==='/admin'||route.startsWith('/admin/');
  let page;if(isAdmin)page=<Admin cars={firebaseReady?cars:[]}/>;else if(route.startsWith('/cars/'))page=<Detail car={cars.find(c=>c.id===decodeURIComponent(route.split('/')[2]||''))}/>;else page=<Home cars={cars} loading={loading}/>;
  return <div className="app">{!isAdmin&&<Header theme={theme} setTheme={setTheme}/>}<div className="routeStage" key={route}>{page}</div>{!isAdmin&&<footer className="footer"><div className="container"><Brand/><p>MauriOne السيارات — اختيار مدروس، تجربة واضحة، وتواصل مباشر.</p>{contact.location&&<span>{contact.location}</span>}</div></footer>}</div>;
}
