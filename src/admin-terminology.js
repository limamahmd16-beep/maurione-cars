import './admin-v2-interaction-fix.js';

const REPLACEMENTS=[
  ['الموظفين','أعضاء الفريق'],
  ['الموظف','عضو الفريق'],
  ['موظفين','أعضاء الفريق'],
  ['موظف','عضو الفريق'],
];

function replaceText(value=''){
  let out=String(value||'');
  for(const [from,to] of REPLACEMENTS)out=out.split(from).join(to);
  return out;
}

function patchTextNode(node){
  if(!node||node.nodeType!==Node.TEXT_NODE)return;
  const next=replaceText(node.nodeValue||'');
  if(next!==node.nodeValue)node.nodeValue=next;
}

function patchElement(element){
  if(!(element instanceof Element))return;
  const attrs=['placeholder','title','aria-label','data-label'];
  for(const attr of attrs){
    if(!element.hasAttribute(attr))continue;
    const current=element.getAttribute(attr)||'';
    const next=replaceText(current);
    if(next!==current)element.setAttribute(attr,next);
  }
  const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode()))patchTextNode(node);
}

let queued=false;
function apply(){
  queued=false;
  patchElement(document.body);
}
function schedule(){
  if(queued)return;
  queued=true;
  requestAnimationFrame(apply);
}
function start(){
  schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label','data-label']});
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
