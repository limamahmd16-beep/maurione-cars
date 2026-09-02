import React,{useEffect,useState}from'react';
import{createRoot}from'react-dom/client';
import{CarFront,ChevronRight,Eye,ImagePlus,Pencil,Plus,Trash2,UserRound,X}from'lucide-react';
import{db}from'./lib/firebase.js';
import{addDoc,collection,deleteDoc,doc,onSnapshot,orderBy,query,serverTimestamp,updateDoc}from'firebase/firestore';
import'./styles.css';
import'./premium.css';
import'./brand-fix.css';
import'./exact.css';
import'./dark-mode.css';
import'./responsive-universal.css';
import'./admin-dark-polish.css';

const cloudName=import.meta.env.VITE_CARS_CLOUDINARY_CLOUD_NAME||'bjlglhaw';
const uploadPreset=import.meta.env.VITE_CARS_CLOUDINARY_UPLOAD_PRESET||'maurione';
const blankCar={brand:'',model:'',trim:'',bodyType:'Sedan',year:'',mileage:'',transmission:'Automático',fuel:'Gasolina',drive:'',location:'Luanda',price:'',status:'available',featured:false,description:'',images:[]};
const num=v=>new Intl.NumberFormat('pt-AO').format(Number(v||0));
const money=v=>Number(v)>0?`${num(v)} Kz`:'Preço sob consulta';

function Brand(){return <div className="mxBrand" aria-label="MauriOne"><span className="mxBrandWord"><b>Mauri</b><i>One</i></span><span className="mxBrandSub">MauriOne Cars Angola</span></div>}

function Editor({car,onClose}){
 const[f,setF]=useState(car?{...blankCar,...car}:blankCar),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function upload(files){
  if(!files?.length)return;setBusy(true);setError('');
  try{const urls=[];for(const file of[...files]){const fd=new FormData();fd.append('file',file);fd.append('upload_preset',uploadPreset);fd.append('folder','maurione-cars');const r=await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{method:'POST',body:fd});const j=await r.json();if(!r.ok)throw new Error(j?.error?.message||'UPLOAD_FAILED');urls.push(j.secure_url)}setF(x=>({...x,images:[...(x.images||[]),...urls]}))}catch(err){setError(`Não foi possível carregar as imagens: ${err.message}`)}finally{setBusy(false)}
 }
 async function save(e){e.preventDefault();setBusy(true);setError('');const payload={brand:f.brand.trim(),model:f.model.trim(),trim:f.trim.trim(),bodyType:f.bodyType,year:Number(f.year),mileage:Number(f.mileage),transmission:f.transmission,fuel:f.fuel,drive:f.drive.trim(),location:f.location.trim(),price:Number(f.price||0),status:f.status,featured:Boolean(f.featured),description:f.description.trim(),images:f.images||[],updatedAt:serverTimestamp()};try{car?.id?await updateDoc(doc(db,'cars',car.id),payload):await addDoc(collection(db,'cars'),{...payload,createdAt:serverTimestamp()});onClose()}catch(err){setError(`Não foi possível guardar: ${err?.code||err?.message}`)}finally{setBusy(false)}}
 return <div className="mxModal"><form className="mxEditor" onSubmit={save} dir="ltr"><div className="mxEditorHead"><h2>{car?'Editar carro':'Adicionar carro'}</h2><button type="button" onClick={onClose}><X/></button></div><div className="mxEditorGrid"><label>Marca<input required value={f.brand} onChange={e=>setF({...f,brand:e.target.value})}/></label><label>Modelo<input required value={f.model} onChange={e=>setF({...f,model:e.target.value})}/></label><label>Versão<input value={f.trim} onChange={e=>setF({...f,trim:e.target.value})}/></label><label>Ano<input required type="number" value={f.year} onChange={e=>setF({...f,year:e.target.value})}/></label><label>Quilometragem<input required type="number" value={f.mileage} onChange={e=>setF({...f,mileage:e.target.value})}/></label><label>Local<input value={f.location} onChange={e=>setF({...f,location:e.target.value})}/></label><label>Preço (Kz)<input type="number" value={f.price} onChange={e=>setF({...f,price:e.target.value})}/></label><label>Estado<select value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option value="available">Disponível</option><option value="sold">Vendido</option></select></label></div><label>Descrição<textarea rows="4" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/></label><label className="mxUpload"><ImagePlus/> {busy?'A carregar...':'Carregar fotografias'}<input hidden type="file" accept="image/*" multiple onChange={e=>upload(e.target.files)}/></label>{f.images?.length>0&&<div className="mxAdminPics">{f.images.map((x,n)=><div key={`${x}-${n}`}><img src={x} alt=""/><button type="button" onClick={()=>setF({...f,images:f.images.filter((_,i)=>i!==n)})}>Eliminar</button></div>)}</div>}{error&&<div className="mxError">{error}</div>}<div className="mxEditorActions"><button type="button" onClick={onClose}>Cancelar</button><button className="primary" disabled={busy}>Guardar</button></div></form></div>
}

function AdminRoot(){
 const[cars,setCars]=useState([]),[creating,setCreating]=useState(false),[edit,setEdit]=useState(null);const profile=window.__MAURIONE_ADMIN_CONTEXT__||{};
 useEffect(()=>{const q=query(collection(db,'cars'),orderBy('createdAt','desc'));return onSnapshot(q,s=>setCars(s.docs.map(d=>({id:d.id,...d.data(),images:Array.isArray(d.data().images)?d.data().images:[]}))),()=>setCars([]))},[]);
 async function remove(c){if(confirm(`Eliminar ${c.brand||''} ${c.model||''}?`))await deleteDoc(doc(db,'cars',c.id))}
 async function toggle(c){await updateDoc(doc(db,'cars',c.id),{status:c.status==='sold'?'available':'sold',updatedAt:serverTimestamp()})}
 return <main className="mxAdmin" dir="ltr"><div className="mxAdminHeader"><button onClick={()=>location.assign('/')}><ChevronRight/></button><Brand/><div><span>{profile.displayName||'Proprietário'}</span><UserRound/></div></div><div className="mxAdminInner"><div className="mxAdminTitle"><span>Painel de controlo</span><h1>Centro de Administração</h1><p>MauriOne Cars Angola</p></div><div className="mxAdminActions"><button onClick={()=>setCreating(true)}><Plus/> Adicionar carro</button><button onClick={()=>location.assign('/')}><Eye/> Abrir site</button></div><section className="mxPanel"><div className="mxPanelHead"><h2>Carros</h2><span>{cars.length}</span></div><div className="mxAdminList">{cars.map(c=><article key={c.id}><div className="mxAdminThumb">{c.images?.[0]?<img src={c.images[0]} alt=""/>:<CarFront/>}</div><div className="mxAdminInfo"><strong>{c.brand} {c.model}</strong><span>{c.year} · {num(c.mileage)} km</span><b>{money(c.price)}</b></div><span className={c.status==='sold'?'mxState sold':'mxState'}>{c.status==='sold'?'Vendido':'Disponível'}</span><div className="mxRowButtons"><button onClick={()=>toggle(c)}>{c.status==='sold'?'Repor':'Vendido'}</button><button onClick={()=>setEdit(c)}><Pencil/></button><button onClick={()=>remove(c)}><Trash2/></button></div></article>)}</div></section></div>{(creating||edit)&&<Editor car={edit} onClose={()=>{setCreating(false);setEdit(null)}}/>}</main>
}

export default async function mountAdminRoot(){
 const root=document.getElementById('root');if(!root)throw new Error('ADMIN_ROOT_MISSING');root.replaceChildren();createRoot(root).render(<AdminRoot/>);
 await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 const profile=window.__MAURIONE_ADMIN_CONTEXT__||{};const p=profile.permissions||{};
 const modules=[import('./primary-language.js'),import('./admin-settings.js'),import('./admin-settings-position.js'),import('./admin-team.js'),import('./enterprise-navigation-fix.js'),import('./enterprise-dashboard-polish.js'),import('./admin-whatsapp-icon-fix.js'),import('./admin-finance.js'),import('./admin-terminology.js'),import('./admin-permissions.js'),import('./admin-car-page.js'),import('./admin-car-reference.js')];
 if(profile.isOwner||p.analyticsView)modules.push(import('./admin-visitor-stats.js'));if(profile.isOwner||p.socialExport)modules.push(import('./admin-social-export.js'));if(profile.isOwner||p.usersView)modules.push(import('./admin-users.js'));await Promise.allSettled(modules);
}
