import approvedWelcomeImage from './welcome-approved-image.js';

function applyApprovedWelcomeArtwork(){
  const image=document.querySelector('.welcomeArtwork');
  if(!image) return;
  if(image.getAttribute('src')!==approvedWelcomeImage){
    image.setAttribute('src',approvedWelcomeImage);
  }
}

if(typeof document!=='undefined'){
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyApprovedWelcomeArtwork,{once:true});
  else applyApprovedWelcomeArtwork();

  const observer=new MutationObserver(applyApprovedWelcomeArtwork);
  observer.observe(document.documentElement,{childList:true,subtree:true});
}
