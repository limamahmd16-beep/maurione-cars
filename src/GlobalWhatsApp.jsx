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
      <img src="/whatsapp-icon.svg?v=34" alt="" />
    </a>
    <style>{`
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
      .mxGlobalWhatsApp img{
        width:27px;
        height:27px;
        display:block;
        opacity:1!important;
      }
      .mxGlobalWhatsApp:active{transform:scale(.96)}
      .mxGlobalWhatsApp.disabled{
        opacity:1!important;
        filter:none!important;
      }
      @media(min-width:800px){
        .mxGlobalWhatsApp{right:24px;bottom:24px;width:52px;height:52px;min-width:52px;min-height:52px}
        .mxGlobalWhatsApp img{width:28px;height:28px}
      }
    `}</style>
  </>;
}
