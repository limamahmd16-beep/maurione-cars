function resetHomeScroll(){
  if(window.location.pathname!=='/')return;
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}));
  });
}

window.addEventListener('popstate',resetHomeScroll);
window.addEventListener('pageshow',resetHomeScroll);

if(window.location.pathname==='/')setTimeout(resetHomeScroll,0);
