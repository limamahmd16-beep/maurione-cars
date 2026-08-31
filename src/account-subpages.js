let observer=null;
let notificationsFromAccount=false;

function accountButton(){
  const bottom=document.querySelector('.mxBottom');
  if(!bottom)return null;
  const buttons=[...bottom.querySelectorAll('button')];
  return buttons[4]||buttons[buttons.length-1]||null;
}

function returnToAccount(){
  const button=accountButton();
  if(button){
    button.click();
    return;
  }
  document.querySelector('.mxFunctionClose')?.click();
}

function kindOf(sheet){
  if(sheet.querySelector('.mxAccountEditField'))return 'settings';
  if(sheet.querySelector('.mxAccountInfo'))return 'password';
  if(sheet.querySelector('.mxNotificationList')||sheet.querySelector('.mxFunctionEmpty'))return 'notifications';
  return null;
}

function backSvg(){
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';
}

function cleanupSubpageArtifacts(activeBackdrop=null){
  document.querySelectorAll('.mxAccountSubHeader').forEach(header=>{
    if(!activeBackdrop||header.parentElement!==activeBackdrop)header.remove();
  });

  document.querySelectorAll('.mxFunctionBackdrop.mxAccountSubPage').forEach(backdrop=>{
    if(backdrop===activeBackdrop)return;
    backdrop.classList.remove('mxAccountSubPage');
    delete backdrop.dataset.mxAccountSubKind;
    backdrop.querySelector('.mxFunctionSheet')?.classList.remove('mxAccountSubSheet');
  });
}

function enhanceSubpage(){
  const backdrop=document.querySelector('.mxFunctionBackdrop');
  const sheet=backdrop?.querySelector('.mxFunctionSheet');
  if(!backdrop||!sheet){
    cleanupSubpageArtifacts();
    return;
  }

  const kind=kindOf(sheet);
  if(!kind){
    cleanupSubpageArtifacts();
    return;
  }

  cleanupSubpageArtifacts(backdrop);

  backdrop.classList.add('mxAccountSubPage');
  sheet.classList.add('mxAccountSubSheet');
  backdrop.dataset.mxAccountSubKind=kind;

  if(backdrop.querySelector(':scope > .mxAccountSubHeader'))return;

  const header=document.createElement('header');
  header.className='mxAccountHeader mxAccountSubHeader';
  header.innerHTML=`
    <button type="button" class="mxAccountSubBack" aria-label="العودة">${backSvg()}</button>
    <div class="mxAccountBrand" dir="ltr"><b>Mauri</b><i>One</i></div>
    <span aria-hidden="true"></span>
  `;
  header.addEventListener('click',event=>event.stopPropagation());
  header.querySelector('.mxAccountSubBack')?.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    if(kind==='notifications'&&!notificationsFromAccount){
      sheet.querySelector('.mxFunctionClose')?.click();
      return;
    }
    returnToAccount();
  });
  backdrop.prepend(header);
}

function trackOrigins(event){
  const accountMenuButton=event.target.closest?.('.mxAccountMenu>button');
  if(accountMenuButton){
    const buttons=[...accountMenuButton.parentElement.children];
    if(buttons.indexOf(accountMenuButton)===3)notificationsFromAccount=true;
    return;
  }
  if(event.target.closest?.('.mxBell')&&!event.target.closest?.('.mxAccountPage')){
    notificationsFromAccount=false;
  }
}

export function initAccountSubpages(){
  if(observer)return;
  document.addEventListener('click',trackOrigins,true);
  observer=new MutationObserver(enhanceSubpage);
  observer.observe(document.body,{childList:true,subtree:true});
  enhanceSubpage();
}
