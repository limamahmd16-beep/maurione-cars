import React,{useEffect,useRef}from'react';

export default function GlobalWhatsApp(){
  const number=(import.meta.env.VITE_CARS_WHATSAPP||'').replace(/\D/g,'');
  const href=number?`https://wa.me/${number}?text=${encodeURIComponent('مرحبًا، أريد الاستفسار عبر MauriOne Cars')}`:'#';
  const homeRef=useRef(null);
  const buttonRef=useRef(null);

  useEffect(()=>{
    const place=()=>{
      const button=buttonRef.current;
      const home=homeRef.current;
      if(!button||!home)return;
      const specs=document.querySelector('.mxDetail .mxDetailSpecs');
      if(specs){
        if(button.previousElementSibling!==specs)specs.insertAdjacentElement('afterend',button);
      }else if(home.nextElementSibling!==button){
        home.insertAdjacentElement('afterend',button);
      }
    };
    place();
    const observer=new MutationObserver(place);
    observer.observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
    window.addEventListener('popstate',place);
    return()=>{
      observer.disconnect();
      window.removeEventListener('popstate',place);
    };
  },[]);

  return <>
    <span ref={homeRef} className="mxWhatsAppHome" aria-hidden="true" />
    <a
      ref={buttonRef}
      className={`mxGlobalWhatsApp${number?'':' disabled'}`}
      href={href}
      target={number?'_blank':undefined}
      rel={number?'noreferrer':undefined}
      aria-label="واتساب"
      onClick={e=>{if(!number)e.preventDefault()}}
    >
      <img src="/whatsapp-icon.svg?v=35" alt="" />
    </a>
    <style>{`
      .mxWhatsAppHome{display:none!important}
      .mxGlobalWhatsApp{
        position:fixed;
        right:max(16px,env(safe-area-inset-right));
        bottom:max(94px,calc(env(safe-area-inset-bottom) + 90px));
        z-index:9999;
        width:50px;
        height:50px;
        min-width:50px;
        min-height:50px;
        border-radius:50%;
        background:#25D366;
        display:grid;
        place-items:center;
        box-shadow:0 6px 16px rgba(0,0,0,.18);
        text-decoration:none;
        opacity:1!important;
        visibility:visible;
        transform:translateZ(0);
        -webkit-tap-highlight-color:transparent;
      }
      body:has(.userAuthPage) .mxGlobalWhatsApp{display:none!important}
      .mxGlobalWhatsApp img{width:27px;height:27px;display:block;opacity:1!important}
      .mxGlobalWhatsApp:active{transform:scale(.96)}
      .mxGlobalWhatsApp.disabled{opacity:1!important;filter:none!important}

      body:has(.mxDetail) .mxGlobalWhatsApp{
        position:relative!important;
        left:auto!important;
        right:auto!important;
        bottom:auto!important;
        top:auto!important;
        width:100%!important;
        max-width:100%!important;
        height:50px!important;
        min-width:0!important;
        min-height:50px!important;
        margin:0!important;
        border-radius:16px!important;
        transform:none!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:9px!important;
        background:#25D366!important;
        box-shadow:0 8px 18px rgba(37,211,102,.22)!important;
        padding:0 16px!important;
        box-sizing:border-box!important;
        z-index:30!important;
      }
      body:has(.mxDetail) .mxGlobalWhatsApp::after{
        content:'تواصل عبر واتساب';
        color:#fff;
        font-size:15px;
        line-height:1;
        font-weight:800;
        direction:rtl;
      }
      body:has(.mxDetail) .mxGlobalWhatsApp img{width:24px!important;height:24px!important;flex:none!important}
      body:has(.mxDetail) .mxGlobalWhatsApp:active{transform:scale(.985)!important}

      @media(min-width:800px){
        .mxGlobalWhatsApp{right:24px;bottom:24px;width:52px;height:52px;min-width:52px;min-height:52px}
        .mxGlobalWhatsApp img{width:28px;height:28px}
        body:has(.mxDetail) .mxGlobalWhatsApp{width:100%!important;height:52px!important;min-height:52px!important;margin:0!important}
      }
    `}</style>
  </>;
}
