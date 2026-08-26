import React from 'react';

export default function GlobalWhatsApp(){
  const number=(import.meta.env.VITE_CARS_WHATSAPP||'').replace(/\D/g,'');
  const href=number?`https://wa.me/${number}?text=${encodeURIComponent('مرحبًا، أريد الاستفسار عبر MauriOne Cars')}`:'#';
  return <>
    <a
      className={`mxGlobalWhatsApp${number?'':' disabled'}`}
      href={href}
      target={number?'_blank':undefined}
      rel={number?'noreferrer':undefined}
      aria-label="واتساب"
      onClick={e=>{if(!number)e.preventDefault()}}
    >
      <img src="/whatsapp-icon.svg?v=33" alt="" />
    </a>
    <style>{`
      .mxGlobalWhatsApp{
        position:fixed;
        right:max(18px,env(safe-area-inset-right));
        bottom:max(96px,calc(env(safe-area-inset-bottom) + 92px));
        z-index:9999;
        width:62px;
        height:62px;
        border-radius:50%;
        background:#25D366;
        display:grid;
        place-items:center;
        box-shadow:0 12px 30px rgba(37,211,102,.34);
        text-decoration:none;
        opacity:1;
        visibility:visible;
        transform:translateZ(0);
        -webkit-tap-highlight-color:transparent;
      }
      .mxGlobalWhatsApp img{width:34px;height:34px;display:block}
      .mxGlobalWhatsApp:active{transform:scale(.96)}
      .mxGlobalWhatsApp.disabled{opacity:.55}
      @media(min-width:800px){
        .mxGlobalWhatsApp{right:28px;bottom:28px;width:64px;height:64px}
        .mxGlobalWhatsApp img{width:35px;height:35px}
      }
    `}</style>
  </>;
}
