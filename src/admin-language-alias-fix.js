const KEY='maurione_admin_language';
const PT_AR=new Map([
['Administration Center','مركز الإدارة'],['Centro de Administração','مركز الإدارة'],['MAURIONE CARS · MAURITANIA','MAURIONE CARS · أنغولا'],['MAURIONE CARS · ANGOLA','MAURIONE CARS · أنغولا'],
['Carros','السيارات'],['Editar carro','تعديل السيارة'],['Adicionar carro','إضافة سيارة'],['Marca','الماركة'],['Modelo','الموديل'],['Versão','الفئة'],['Ano','السنة'],['Quilometragem','الكيلومترات'],['Local','الموقع'],['Preço (Kz)','السعر (Kz)'],['Estado','الحالة'],['Disponível','متوفرة'],['Vendido','مباعة'],['Descrição','الوصف'],['Carregar fotografias','رفع صور السيارة'],['A carregar...','جارٍ الرفع...'],['Eliminar','حذف'],['Cancelar','إلغاء'],['Guardar','حفظ'],['Repor','إرجاع'],['MauriOne Cars Angola','MauriOne Cars أنغولا'],['Preço sob consulta','السعر عند التواصل']
]);
const EN_PT=new Map([['Administration Center','Centro de Administração'],['MAURIONE CARS · MAURITANIA','MAURIONE CARS · ANGOLA']]);
let raf=0;
function lang(){try{return localStorage.getItem(KEY)==='ar'?'ar':'pt'}catch{return'pt'}}
function ignored(n){const e=n?.nodeType===1?n:n?.parentElement;return !e||Boolean(e.closest('script,style,noscript,code,pre,[data-i18n-ignore="1"]'))}
function convert(raw,target){const s=String(raw||'').trim();if(!s)return raw;let out=s;if(target==='ar'){if(PT_AR.has(s))out=PT_AR.get(s);else for(const [pt,ar] of PT_AR)if(out.includes(pt))out=out.split(pt).join(ar)}else{if(EN_PT.has(s))out=EN_PT.get(s);else for(const [en,pt] of EN_PT)if(out.includes(en))out=out.split(en).join(pt)}if(out===s)return raw;const a=String(raw).match(/^\s*/)?.[0]||'',b=String(raw).match(/\s*$/)?.[0]||'';return a+out+b}
function patch(n,target){if(!n||ignored(n))return;if(n.nodeType===3){const x=convert(n.nodeValue,target);if(x!==n.nodeValue)n.nodeValue=x;return}if(n.nodeType!==1)return;for(const k of ['placeholder','title','aria-label'])if(n.hasAttribute(k)){const v=n.getAttribute(k)||'',x=convert(v,target);if(x!==v)n.setAttribute(k,x)}for(const c of n.childNodes)patch(c,target)}
function run(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>patch(document.body,lang()))}
new MutationObserver(run).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']});window.addEventListener('maurione:admin-language-change',run);window.addEventListener('storage',e=>{if(e.key===KEY)run()});run();
