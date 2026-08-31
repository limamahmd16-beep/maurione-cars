const SUPPORTED=['ar','fr','en','pt'];
const carTextState=new WeakMap();
const genericTextState=new WeakMap();
let observer=null;
let scheduled=false;

const welcomeArabic='منصة موثوقة لبيع السيارات في موريتانيا، تتيح لك استعراض السيارات المتاحة ومقارنة الأسعار والتفاصيل بسهولة.';
const welcomeTranslations={
  en:'A trusted car sales platform in Mauritania, where you can browse available cars and easily compare prices and details.',
  fr:'Une plateforme fiable de vente de voitures en Mauritanie, où vous pouvez consulter les véhicules disponibles et comparer facilement les prix et les détails.',
  pt:'Uma plataforma fiável para venda de carros na Mauritânia, onde pode consultar os carros disponíveis e comparar facilmente preços e detalhes.'
};

const descriptionTranslations={
  'سيارة مستعمل لكن بحالة ممتاز جدا':{
    en:'Used car in excellent condition.',
    fr:'Voiture d’occasion en excellent état.',
    pt:'Carro usado em excelente estado.'
  },
  'سيارة مستعملة لكن بحالة ممتاز جدا':{
    en:'Used car in excellent condition.',
    fr:'Voiture d’occasion en excellent état.',
    pt:'Carro usado em excelente estado.'
  },
  'سيارة مستعملة لكن بحالة ممتازة جدا':{
    en:'Used car in excellent condition.',
    fr:'Voiture d’occasion en excellent état.',
    pt:'Carro usado em excelente estado.'
  }
};

const carTerms=[
  ['لاند كروزر','Land Cruiser'],['رنج روفر','Range Rover'],['لاند روفر','Land Rover'],['بي إم دبليو','BMW'],['فولكس فاجن','Volkswagen'],
  ['تويوتا','Toyota'],['كورولا','Corolla'],['كامري','Camry'],['برادو','Prado'],['راف فور','RAV4'],['يارس','Yaris'],['هايلكس','Hilux'],['فورتشنر','Fortuner'],
  ['مرسيدس','Mercedes-Benz'],['لكزس','Lexus'],['نيسان','Nissan'],['باترول','Patrol'],['هيونداي','Hyundai'],['كيا','Kia'],['فورد','Ford'],
  ['شيفروليه','Chevrolet'],['هوندا','Honda'],['مازدا','Mazda'],['ميتسوبيشي','Mitsubishi'],['بورش','Porsche'],['جيب','Jeep'],['دودج','Dodge'],
  ['تسلا','Tesla'],['بيجو','Peugeot'],['رينو','Renault'],['سوزوكي','Suzuki'],['إيسوزو','Isuzu'],['هافال','Haval'],['جيلي','Geely'],['شانجان','Changan'],['جي إم سي','GMC']
];

const compact={
  pt:{'Localização':'Local','Mais recentes':'Recentes','Gasolina':'Gasol.','Automático':'Auto.','Combustível':'Comb.','Transmissão':'Caixa'},
  fr:{'Localisation':'Lieu','Plus récentes':'Récentes','Automatique':'Auto.','Carburant':'Carbur.','Transmission':'Boîte'},
  en:{'Newest first':'Newest','Automatic':'Auto','Transmission':'Gearbox'}
};

function getLang(){
  const lang=document.documentElement.dataset.maurioneLang||document.documentElement.lang||'ar';
  return SUPPORTED.includes(lang)?lang:'ar';
}
function hasArabic(v=''){return /[\u0600-\u06FF]/.test(String(v))}
function romanize(value=''){
  let out=String(value);
  for(const[from,to]of carTerms)out=out.split(from).join(to);
  return out;
}

function patchStoredNode(node,lang,translator,stateMap){
  if(!node)return;
  const current=node.textContent||'';
  let state=stateMap.get(node);
  if(!state){state={original:current};stateMap.set(node,state)}
  else if(hasArabic(current)&&current!==state.last)state.original=current;
  const next=lang==='ar'?state.original:translator(state.original,lang);
  if(current!==next){node.textContent=next;state.last=next}else state.last=current;
}

function patchWelcome(lang){
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    const value=(node.nodeValue||'').trim();
    if(value===welcomeArabic||genericTextState.has(node)){
      patchStoredNode(node,lang,(original,l)=>welcomeTranslations[l]||original,genericTextState);
    }
  }
}

function patchWelcomeOverlay(lang){
  const stage=document.querySelector('.welcomeExactStage');
  if(!stage)return;
  let overlay=stage.querySelector(':scope > .mxWelcomeTranslatedText');
  if(lang==='ar'){
    overlay?.remove();
    return;
  }
  if(!overlay){
    overlay=document.createElement('div');
    overlay.className='mxWelcomeTranslatedText';
    overlay.dataset.i18nIgnore='1';
    stage.appendChild(overlay);
  }
  overlay.lang=lang;
  overlay.dir='ltr';
  overlay.textContent=welcomeTranslations[lang]||'';
}

function patchCarData(lang){
  document.querySelectorAll('.mxCardInfo h3,.mxTrim,.mxSummary h1,.mxSummary>span').forEach(el=>{
    if(hasArabic(el.textContent||'')||carTextState.has(el))patchStoredNode(el,lang,original=>romanize(original),carTextState);
  });
  document.querySelectorAll('.mxSummary p').forEach(el=>{
    const text=(el.textContent||'').trim();
    if(descriptionTranslations[text]||genericTextState.has(el)){
      patchStoredNode(el,lang,(original,l)=>descriptionTranslations[original.trim()]?.[l]||original,genericTextState);
    }
  });
}

function patchCompactLabels(lang){
  if(lang==='ar')return;
  const map=compact[lang]||{};
  document.querySelectorAll('.mxFilters *,.mxCard .mxSpec strong,.mxCard .mxSpec small').forEach(el=>{
    if(el.children.length)return;
    const current=(el.textContent||'').trim();
    const next=map[current];
    if(next)el.textContent=next;
  });
}

function patchWhatsApp(lang){
  const anchor=document.querySelector('.mxGlobalWhatsApp');
  if(!anchor)return;
  const number=(anchor.getAttribute('href')||'').match(/wa\.me\/(\d+)/)?.[1];
  if(!number)return;
  const messages={
    ar:'مرحبًا، أريد الاستفسار عبر MauriOne',
    en:'Hello, I would like to make an inquiry through MauriOne.',
    fr:'Bonjour, je souhaite faire une demande via MauriOne.',
    pt:'Olá, gostaria de fazer uma consulta através do MauriOne.'
  };
  anchor.href=`https://wa.me/${number}?text=${encodeURIComponent(messages[lang]||messages.ar)}`;
}

function apply(){
  const lang=getLang();
  patchWelcome(lang);
  patchWelcomeOverlay(lang);
  patchCarData(lang);
  patchCompactLabels(lang);
  patchWhatsApp(lang);
}
function schedule(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;apply()});
}

export function initI18nContentFix(){
  apply();
  observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['data-maurione-lang']});
  window.addEventListener('maurione:language-change',()=>setTimeout(apply,0));
  window.addEventListener('popstate',schedule);
}
