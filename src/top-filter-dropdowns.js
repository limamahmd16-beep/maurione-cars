let activeMenu=null;
let outsideBound=false;

function clamp(value,min,max){return Math.max(min,Math.min(max,value))}

function closeMenu(){
  if(!activeMenu)return;
  activeMenu.menu.remove();
  activeMenu.button.setAttribute('aria-expanded','false');
  activeMenu=null;
}

function selectedText(select){
  return select.options?.[select.selectedIndex]?.textContent?.trim()||'';
}

function syncButton(select,button){
  const text=selectedText(select);
  if(text)button.textContent=text;
}

function openMenu(select,button){
  if(activeMenu?.select===select){closeMenu();return}
  closeMenu();

  const menu=document.createElement('div');
  menu.className='mxTopFilterMenu';
  menu.setAttribute('role','listbox');
  menu.dataset.i18nIgnore='1';

  [...select.options].forEach(option=>{
    const item=document.createElement('button');
    item.type='button';
    item.className='mxTopFilterMenuItem';
    item.textContent=(option.textContent||'').trim();
    item.dataset.value=option.value;
    item.setAttribute('role','option');
    const chosen=option.value===select.value;
    item.classList.toggle('active',chosen);
    item.setAttribute('aria-selected',chosen?'true':'false');
    if(chosen){
      const tick=document.createElement('span');
      tick.className='mxTopFilterTick';
      tick.textContent='✓';
      item.appendChild(tick);
    }
    item.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      select.value=option.value;
      select.dispatchEvent(new Event('change',{bubbles:true}));
      button.textContent=(option.textContent||'').trim();
      closeMenu();
    });
    menu.appendChild(item);
  });

  document.body.appendChild(menu);
  const rect=button.closest('.mxCustomTopFilter')?.getBoundingClientRect()||button.getBoundingClientRect();
  const viewportWidth=document.documentElement.clientWidth||window.innerWidth;
  const width=Math.min(218,viewportWidth-24);
  menu.style.width=`${width}px`;
  menu.style.left=`${clamp(rect.left+rect.width/2-width/2,12,viewportWidth-width-12)}px`;
  menu.style.top=`${rect.bottom+8}px`;

  requestAnimationFrame(()=>{
    if(!menu.isConnected)return;
    const menuRect=menu.getBoundingClientRect();
    const viewportHeight=window.innerHeight||document.documentElement.clientHeight;
    const bottomSafe=88;
    if(menuRect.bottom>viewportHeight-bottomSafe){
      const above=rect.top-menuRect.height-8;
      if(above>12)menu.style.top=`${above}px`;
      else menu.style.maxHeight=`${Math.max(170,viewportHeight-rect.bottom-bottomSafe-12)}px`;
    }
  });

  button.setAttribute('aria-expanded','true');
  activeMenu={select,button,menu};
}

function enhanceSelect(select){
  if(!select||select.dataset.mxTopEnhanced==='1')return;
  const label=select.closest('.mxFilters>label');
  if(!label)return;

  select.dataset.mxTopEnhanced='1';
  select.classList.add('mxNativeTopSelect');
  label.classList.add('mxCustomTopFilter');

  const button=document.createElement('button');
  button.type='button';
  button.className='mxTopFilterButton';
  button.setAttribute('aria-haspopup','listbox');
  button.setAttribute('aria-expanded','false');
  button.dataset.i18nIgnore='1';
  syncButton(select,button);
  select.before(button);

  button.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    openMenu(select,button);
  });

  select.addEventListener('change',()=>requestAnimationFrame(()=>syncButton(select,button)));
}

function enhance(){
  const filters=document.querySelector('.mxFilters');
  if(!filters)return;
  [...filters.children].forEach(child=>{
    if(child.tagName!=='LABEL')return;
    const select=child.querySelector(':scope > select');
    if(select)enhanceSelect(select);
  });
}

function syncAll(){
  document.querySelectorAll('.mxNativeTopSelect').forEach(select=>{
    const button=select.parentElement?.querySelector(':scope > .mxTopFilterButton');
    if(button)syncButton(select,button);
  });
}

export function initTopFilterDropdowns(){
  enhance();
  const observer=new MutationObserver(()=>{
    enhance();
    requestAnimationFrame(syncAll);
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true});

  if(!outsideBound){
    outsideBound=true;
    document.addEventListener('click',event=>{
      if(activeMenu&&!activeMenu.menu.contains(event.target)&&event.target!==activeMenu.button)closeMenu();
    },true);
    window.addEventListener('scroll',closeMenu,{passive:true});
    window.addEventListener('resize',closeMenu,{passive:true});
    window.addEventListener('popstate',closeMenu);
    window.addEventListener('maurione:language-change',()=>{
      closeMenu();
      setTimeout(syncAll,80);
    });
  }
}
