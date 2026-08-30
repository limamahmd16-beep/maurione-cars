function applyPhoneCopy(){
  document.querySelectorAll('.userAuthCard').forEach(card=>{
    const title=card.querySelector('h1')?.textContent?.trim()||'';
    if(title==='أضف رقم هاتفك'){
      const description=card.querySelector('h1 + p');
      if(description&&description.textContent!=='أدخل رقم هاتفك لإكمال حسابك.'){
        description.textContent='أدخل رقم هاتفك لإكمال حسابك.';
      }
    }
    card.querySelectorAll('input[type="tel"]').forEach(input=>{
      if(input.getAttribute('placeholder'))input.setAttribute('placeholder','');
    });
  });
}

applyPhoneCopy();
const observer=new MutationObserver(applyPhoneCopy);
observer.observe(document.getElementById('root')||document.body,{childList:true,subtree:true});
window.addEventListener('beforeunload',()=>observer.disconnect(),{once:true});
