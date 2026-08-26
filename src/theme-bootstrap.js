const THEME_KEY='maurione_cars_theme';
let theme='light';
try{
  const saved=localStorage.getItem(THEME_KEY);
  if(saved==='dark'||saved==='light') theme=saved;
  else if(window.matchMedia?.('(prefers-color-scheme: dark)').matches) theme='dark';
}catch(_){
  if(window.matchMedia?.('(prefers-color-scheme: dark)').matches) theme='dark';
}
document.documentElement.dataset.theme=theme;
document.documentElement.style.colorScheme=theme;
