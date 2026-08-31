let rootObserver=null;

function normalize(src=''){
  try{return new URL(src,window.location.href).href}catch{return src}
}

function decorate(box){
  if(!box||box.dataset.mxViewerReady==='1')return;
  box.dataset.mxViewerReady='1';

  const counter=document.createElement('span');
  counter.className='mxLightboxCounter';
  counter.setAttribute('aria-live','polite');
  box.appendChild(counter);

  const update=()=>{
    const current=box.querySelector(':scope > img');
    const thumbs=[...document.querySelectorAll('.mxDetail .mxThumbs img')];
    const total=Math.max(thumbs.length,current?1:0);
    let index=0;
    if(current&&thumbs.length){
      const src=normalize(current.currentSrc||current.src||current.getAttribute('src')||'');
      const found=thumbs.findIndex(img=>normalize(img.currentSrc||img.src||img.getAttribute('src')||'')===src);
      if(found>=0)index=found;
    }
    counter.textContent=`${Math.min(index+1,total||1)} / ${total||1}`;
    box.classList.toggle('single-image',total<=1);
    box.querySelector('.mxPrev')?.setAttribute('aria-label','الصورة السابقة');
    box.querySelector('.mxNext')?.setAttribute('aria-label','الصورة التالية');
    box.querySelector('.mxClose')?.setAttribute('aria-label','إغلاق الصور');
  };

  box.addEventListener('click',event=>{
    if(event.target.closest('.mxPrev,.mxNext'))setTimeout(update,0);
  });

  let startX=null,startY=null;
  box.addEventListener('touchstart',event=>{
    if(event.touches?.length!==1||event.target.closest('button'))return;
    startX=event.touches[0].clientX;
    startY=event.touches[0].clientY;
  },{passive:true});
  box.addEventListener('touchend',event=>{
    if(startX===null||!event.changedTouches?.length)return;
    const end=event.changedTouches[0];
    const dx=end.clientX-startX;
    const dy=end.clientY-startY;
    startX=null;startY=null;
    if(Math.abs(dx)<55||Math.abs(dx)<=Math.abs(dy))return;
    if(dx<0)box.querySelector('.mxNext')?.click();
    else box.querySelector('.mxPrev')?.click();
  },{passive:true});

  const image=box.querySelector(':scope > img');
  if(image){
    new MutationObserver(update).observe(image,{attributes:true,attributeFilter:['src']});
    image.addEventListener('load',update);
  }
  update();
}

function scan(){
  document.querySelectorAll('.mxLightbox').forEach(decorate);
}

export function initLightboxEnhancer(){
  if(rootObserver)return;
  scan();
  rootObserver=new MutationObserver(scan);
  rootObserver.observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
}
