try{
  if('scrollRestoration' in history)history.scrollRestoration='manual';
}catch{}

let resetTimers=[];

function clearResetTimers(){
  resetTimers.forEach(id=>clearTimeout(id));
  resetTimers=[];
}

function resetHomeScroll(){
  if(window.location.pathname!=='/')return;
  clearResetTimers();

  const reset=()=>{
    if(window.location.pathname==='/'){
      window.scrollTo({top:0,left:0,behavior:'auto'});
    }
  };

  requestAnimationFrame(()=>requestAnimationFrame(reset));
  resetTimers.push(setTimeout(reset,80));
  resetTimers.push(setTimeout(reset,220));
}

window.addEventListener('popstate',resetHomeScroll);
window.addEventListener('pageshow',resetHomeScroll);

if(window.location.pathname==='/')resetHomeScroll();
