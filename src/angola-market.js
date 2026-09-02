const MARKET={
  code:'AO',
  country:'Angola',
  locale:'pt-AO',
  currency:'AOA',
  currencyLabel:'Kz',
  phoneCode:'244',
  primaryLanguage:'pt',
  locations:['Luanda','Kilamba','Talatona','Viana','Benfica','Cacuaco','Belas','Benguela','Lobito','Huambo','Lubango','Cabinda','Malanje','Uíge','Soyo'],
};

window.__MAURIONE_MARKET__=MARKET;
try{localStorage.setItem('maurione_market','AO')}catch{}
document.documentElement.dataset.maurioneMarket='ao';

const LEGACY_LOCATIONS=new Set(['نواكشوط','نواذيبو','روصو','أطار','كيفه']);
const LEGACY_LOCATION_TEXT={
  'نواكشوط':'Luanda',
  'نواذيبو':'Viana',
  'روصو':'Kilamba',
  'أطار':'Talatona',
  'كيفه':'Benfica',
};

function currentLanguage(){
  try{return localStorage.getItem('maurione_language')||'pt'}catch{return'pt'}
}

function replaceMarketText(value=''){
  let out=String(value||'');
  out=out.replace(/\bMRU\b/g,'Kz');
  out=out.replace(/Mauritânia/gi,'Angola');
  out=out.replace(/Mauritania/gi,'Angola');
  out=out.replace(/Mauritanie/gi,'Angola');
  out=out.replace(/موريتانيا/g,'أنغولا');
  for(const[from,to]of Object.entries(LEGACY_LOCATION_TEXT))out=out.split(from).join(to);
  return out;
}

function patchTextNode(node){
  if(!node||node.nodeType!==Node.TEXT_NODE)return;
  if(node.parentElement?.closest('script,style,noscript,code,pre,textarea'))return;
  const next=replaceMarketText(node.nodeValue||'');
  if(next!==node.nodeValue)node.nodeValue=next;
}

function isLocationSelect(select){
  if(!(select instanceof HTMLSelectElement))return false;
  if(select.name==='location')return true;
  return [...select.options].some(option=>LEGACY_LOCATIONS.has(String(option.value||option.textContent||'').trim()));
}

function locationPlaceholder(){
  const lang=currentLanguage();
  if(lang==='ar')return'الموقع';
  if(lang==='fr')return'Localisation';
  if(lang==='en')return'Location';
  return'Local';
}

function patchLocationSelect(select){
  if(!isLocationSelect(select))return;
  const current=String(select.value||'');
  const existing=[...select.options].map(option=>String(option.value||'').trim()).filter(Boolean);
  const extras=existing.filter(value=>!LEGACY_LOCATIONS.has(value)&&!MARKET.locations.includes(value));
  const desired=[...new Set([...MARKET.locations,...extras])];
  const currentValues=[...select.options].filter(o=>o.value).map(o=>o.value);
  const matches=currentValues.length===desired.length&&currentValues.every((value,index)=>value===desired[index]);
  if(!matches){
    const fragment=document.createDocumentFragment();
    const empty=document.createElement('option');empty.value='';empty.textContent=locationPlaceholder();fragment.appendChild(empty);
    desired.forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value;fragment.appendChild(option)});
    select.replaceChildren(fragment);
  }
  if(current&&desired.includes(current)){select.value=current;return}
  if(current==='نواكشوط'){
    select.value='Luanda';
    queueMicrotask(()=>select.dispatchEvent(new Event('change',{bubbles:true})));
    return;
  }
  if(!current)select.value='';
}

function normalizeAngolaNumber(raw=''){
  let digits=String(raw||'').replace(/\D/g,'');
  if(digits.startsWith('00244'))digits=digits.slice(2);
  if(digits.length===9)digits=`244${digits}`;
  return digits;
}

function patchLink(link){
  if(!(link instanceof HTMLAnchorElement))return;
  const href=link.getAttribute('href')||'';
  if(/^tel:/i.test(href)){
    const raw=href.replace(/^tel:/i,'');
    const digits=String(raw).replace(/\D/g,'');
    if(digits.length===9)link.setAttribute('href',`tel:+244${digits}`);
  }
  if(/wa\.me\//i.test(href)){
    try{
      const url=new URL(href,location.origin);
      const digits=url.pathname.replace(/\D/g,'');
      const normalized=normalizeAngolaNumber(digits);
      if(normalized&&normalized!==digits){url.pathname=`/${normalized}`;link.setAttribute('href',url.toString())}
    }catch{}
  }
}

function patchAdminUserWhatsApp(){
  document.querySelectorAll('.mxAdminUserContactRow').forEach(row=>{
    const label=String(row.querySelector('.mxAdminUserContactText small')?.textContent||'').toLowerCase();
    if(!/(telefone|phone|هاتف)/i.test(label))return;
    const phoneText=row.querySelector('.mxAdminUserContactText span')?.textContent||'';
    const local=String(phoneText).replace(/\D/g,'');
    if(local.length!==9)return;
    let actions=row.querySelector('.mxAdminUserActions');
    if(!actions){actions=document.createElement('div');actions.className='mxAdminUserActions';row.appendChild(actions)}
    if(actions.querySelector('a.wa'))return;
    const link=document.createElement('a');
    link.className='mxAdminUserAction wa';
    link.href=`https://wa.me/244${local}`;
    link.target='_blank';link.rel='noreferrer';
    link.innerHTML='<img src="/whatsapp-icon.svg?v=35" alt=""><span>WhatsApp</span>';
    actions.appendChild(link);
  });
}

function patchAttributes(root=document){
  root.querySelectorAll?.('[placeholder],[title],[aria-label]').forEach(el=>{
    for(const name of['placeholder','title','aria-label']){
      if(!el.hasAttribute(name))continue;
      const before=el.getAttribute(name)||'';
      const after=replaceMarketText(before);
      if(after!==before)el.setAttribute(name,after);
    }
  });
}

function patchHead(){
  document.title=replaceMarketText(document.title);
  document.querySelectorAll('meta[content]').forEach(meta=>{
    const before=meta.getAttribute('content')||'';
    const after=replaceMarketText(before);
    if(after!==before)meta.setAttribute('content',after);
  });
}

function patchCanvas(){
  const proto=window.CanvasRenderingContext2D?.prototype;
  if(!proto||proto.__maurioneAngolaMarket)return;
  proto.__maurioneAngolaMarket=true;
  for(const method of['fillText','strokeText']){
    const original=proto[method];
    if(typeof original!=='function')continue;
    proto[method]=function(text,...args){return original.call(this,replaceMarketText(text),...args)};
  }
}

let scheduled=false;
function apply(){
  scheduled=false;
  const lang=currentLanguage();
  document.documentElement.lang=lang==='pt'?'pt-AO':lang;
  if(lang!=='ar')document.documentElement.dir='ltr';
  document.querySelectorAll('select').forEach(patchLocationSelect);
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let node;while((node=walker.nextNode()))patchTextNode(node);
  patchAttributes(document);
  document.querySelectorAll('a[href]').forEach(patchLink);
  patchAdminUserWhatsApp();
  patchHead();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}

patchCanvas();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label','href']});
window.addEventListener('maurione:language-change',schedule);
window.addEventListener('popstate',schedule);

export {MARKET};