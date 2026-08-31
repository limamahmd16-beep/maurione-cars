import React,{useEffect,useLayoutEffect}from'react';

const THEME_KEY='maurione_cars_theme';
const LANGUAGE_KEY='maurione_language';

const themeLabels={
  ar:{dark:'الوضع الداكن',light:'الوضع الفاتح',enableDark:'تفعيل الوضع الداكن',enableLight:'تفعيل الوضع الفاتح'},
  en:{dark:'Dark mode',light:'Light mode',enableDark:'Enable dark mode',enableLight:'Enable light mode'},
  fr:{dark:'Mode sombre',light:'Mode clair',enableDark:'Activer le mode sombre',enableLight:'Activer le mode clair'},
  pt:{dark:'Modo escuro',light:'Modo claro',enableDark:'Ativar modo escuro',enableLight:'Ativar modo claro'},
};

function currentLanguage(){
  const fromDocument=document.documentElement.dataset.maurioneLang||document.documentElement.lang;
  if(themeLabels[fromDocument])return fromDocument;
  try{
    const saved=localStorage.getItem(LANGUAGE_KEY);
    if(themeLabels[saved])return saved;
  }catch{}
  return'ar';
}

function preferredTheme(){
  try{
    const saved=localStorage.getItem(THEME_KEY);
    if(saved==='dark'||saved==='light')return saved;
  }catch{}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches?'dark':'light';
}

function applyTheme(theme,save=false){
  const next=theme==='dark'?'dark':'light';
  document.documentElement.dataset.theme=next;
  document.documentElement.style.colorScheme=next;
  document.body.style.background=next==='dark'?'#0d0f12':'#ffffff';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',next==='dark'?'#0d0f12':'#ffffff');
  if(save){try{localStorage.setItem(THEME_KEY,next)}catch{}}
  window.dispatchEvent(new CustomEvent('maurione:theme-changed',{detail:{theme:next}}));
}

function themeIcon(theme){
  return theme==='dark'
    ?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.41M17.66 6.34l1.41-1.41"/></svg>'
    :'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>';
}

function syncDrawerToggle(){
  const drawer=document.querySelector('.mxDrawer');
  if(!drawer)return;
  let button=drawer.querySelector('.mxThemeToggle');
  if(!button){
    button=document.createElement('button');
    button.type='button';
    button.className='mxThemeToggle';
    const logout=[...drawer.querySelectorAll(':scope > button')].find(b=>/تسجيل الخروج|Sign out|Se déconnecter|Terminar sessão/.test(b.textContent||''));
    drawer.insertBefore(button,logout||null);
    button.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      const current=document.documentElement.dataset.theme==='dark'?'dark':'light';
      applyTheme(current==='dark'?'light':'dark',true);
      syncDrawerToggle();
    });
  }
  const theme=document.documentElement.dataset.theme==='dark'?'dark':'light';
  const lang=currentLanguage();
  const labels=themeLabels[lang]||themeLabels.ar;
  const state=`${theme}:${lang}`;
  if(button.dataset.themeState===state)return;
  button.dataset.themeState=state;
  const target=theme==='dark'?'light':'dark';
  button.setAttribute('aria-label',target==='dark'?labels.enableDark:labels.enableLight);
  button.innerHTML=`<span class="mxThemeGlyph">${themeIcon(theme)}</span><span class="mxThemeLabel">${labels[target]}</span><span class="mxThemeSwitch" aria-hidden="true"><i></i></span>`;
}

export default function DarkModeController(){
  const initial=preferredTheme();
  useLayoutEffect(()=>{applyTheme(initial)},[]);
  useEffect(()=>{
    applyTheme(preferredTheme());
    const observer=new MutationObserver(syncDrawerToggle);
    observer.observe(document.body,{childList:true,subtree:true});
    syncDrawerToggle();
    const onTheme=()=>syncDrawerToggle();
    const onLanguage=()=>setTimeout(syncDrawerToggle,0);
    window.addEventListener('maurione:theme-changed',onTheme);
    window.addEventListener('maurione:language-change',onLanguage);
    const media=window.matchMedia?.('(prefers-color-scheme: dark)');
    const onSystem=e=>{
      let saved=null;
      try{saved=localStorage.getItem(THEME_KEY)}catch{}
      if(saved!=='dark'&&saved!=='light')applyTheme(e.matches?'dark':'light');
    };
    media?.addEventListener?.('change',onSystem);
    return()=>{
      observer.disconnect();
      window.removeEventListener('maurione:theme-changed',onTheme);
      window.removeEventListener('maurione:language-change',onLanguage);
      media?.removeEventListener?.('change',onSystem);
    };
  },[]);
  return null;
}
