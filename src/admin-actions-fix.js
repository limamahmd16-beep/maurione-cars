function shell(){return document.getElementById('mxEnterpriseAdmin')}
function hiddenAdmin(){return document.querySelector('body.mxEnterpriseActive .mxAdmin')||document.querySelector('.mxAdmin')}
function hiddenActions(){return hiddenAdmin()?.querySelector('.mxAdminInner .mxAdminActions')||hiddenAdmin()?.querySelector('.mxAdminActions')}
function originalAdd(){const box=hiddenActions();if(!box)return null;return [...box.querySelectorAll('button')].find(b=>/إضافة سيارة|Adicionar carro/i.test(String(b.textContent)))||box.querySelector('button')}
function originalRow(index){return hiddenAdmin()?.querySelectorAll('.mxAdminInner .mxAdminList article')[Number(index)]||hiddenAdmin()?.querySelectorAll('.mxAdminList article')[Number(index)]||null}
function originalRowButton(type,index){const row=originalRow(index);if(!row)return null;const buttons=[...row.querySelectorAll('.mxRowButtons button')];return type==='toggle'?buttons[0]:type==='edit'?buttons[1]:type==='delete'?buttons[2]:null}
function outside(selector){return [...document.querySelectorAll(selector)].find(el=>!el.closest('#mxEnterpriseAdmin'))||null}
function click(el){if(!el)return false;el.click();return true}

document.addEventListener('click',async event=>{
 const target=event.target.closest('#mxEnterpriseAdmin [data-action]');if(!target)return;
 const action=target.dataset.action;
 let handled=false;
 if(action==='add-car')handled=click(originalAdd());
 else if(action==='edit-car')handled=click(originalRowButton('edit',target.dataset.index));
 else if(action==='toggle-car')handled=click(originalRowButton('toggle',target.dataset.index));
 else if(action==='delete-car')handled=click(originalRowButton('delete',target.dataset.index));
 else if(action==='team-manager'){
  try{await import('./admin-team-manager.js')}catch{}
  handled=click(outside('.mxAdminTeamButton'));
 }
 else if(action==='users-manager'){
  try{await import('./admin-users.js')}catch{}
  handled=click(outside('.mxAdminUsersButton'));
 }
 else if(action==='settings'||action==='legacy-settings')handled=click(outside('.mxAdminSettingsButton'));
 if(handled){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation?.()}
},true);

window.addEventListener('maurione:admin-language-change',()=>{
 const s=shell();if(!s)return;const active=s.querySelector('.entNav button.active');active?.click();
});
