import { getLanguage } from './i18n.js';

const COPY={
  ar:{
    favorites:'المفضلة',saved:'السيارات التي حفظتها',empty:'لم تحفظ أي سيارة في المفضلة بعد.',
    home:'الرئيسية',search:'بحث',account:'حسابي',messages:'الرسائل',
    accountSettings:'إعدادات الحساب',accountSettingsSub:'تعديل اسم الحساب',
    password:'تغيير كلمة المرور',passwordSub:'إرسال رابط آمن إلى بريدك',
    notifications:'الإشعارات',notificationsSub:'عرض التنبيهات الأخيرة',
    logout:'تسجيل الخروج'
  },
  en:{
    favorites:'Favorites',saved:'Cars you saved',empty:"You haven't saved any cars yet.",
    home:'Home',search:'Search',account:'My account',messages:'Messages',
    accountSettings:'Account settings',accountSettingsSub:'Edit account name',
    password:'Change password',passwordSub:'Send a secure link to your email',
    notifications:'Notifications',notificationsSub:'View recent alerts',
    logout:'Sign out'
  },
  fr:{
    favorites:'Favoris',saved:'Voitures enregistrées',empty:"Vous n’avez encore enregistré aucune voiture.",
    home:'Accueil',search:'Recherche',account:'Mon compte',messages:'Messages',
    accountSettings:'Paramètres du compte',accountSettingsSub:'Modifier le nom du compte',
    password:'Changer le mot de passe',passwordSub:'Envoyer un lien sécurisé par e-mail',
    notifications:'Notifications',notificationsSub:'Voir les alertes récentes',
    logout:'Se déconnecter'
  },
  pt:{
    favorites:'Favoritos',saved:'Carros guardados',empty:'Ainda não guardou nenhum carro nos favoritos.',
    home:'Início',search:'Pesquisar',account:'Minha conta',messages:'Mensagens',
    accountSettings:'Definições da conta',accountSettingsSub:'Editar nome da conta',
    password:'Alterar palavra-passe',passwordSub:'Enviar um link seguro por e-mail',
    notifications:'Notificações',notificationsSub:'Ver alertas recentes',
    logout:'Terminar sessão'
  }
};

const WELCOME_TEXTS=[
  'منصة موثوقة لبيع السيارات في موريتانيا، تتيح لك استعراض السيارات المتاحة ومقارنة الأسعار والتفاصيل بسهولة.',
  'A trusted car sales platform in Mauritania, where you can browse available cars and easily compare prices and details.',
  'Une plateforme fiable de vente de voitures en Mauritanie, où vous pouvez consulter les véhicules disponibles et comparer facilement les prix et les détails.',
  'Uma plataforma fiável para venda de carros na Mauritânia, onde pode consultar os carros disponíveis e comparar facilmente preços e detalhes.'
];

let observer=null;
let scheduled=false;

function lang(){
  const value=getLanguage?.()||document.documentElement.dataset.maurioneLang||document.documentElement.lang||'ar';
  return COPY[value]?value:'ar';
}

function setText(el,value){
  if(el&&el.textContent!==value)el.textContent=value;
}

function setButtonText(button,value){
  if(!button)return;
  const node=[...button.childNodes].reverse().find(n=>n.nodeType===Node.TEXT_NODE);
  if(node){
    const next=` ${value}`;
    if(node.nodeValue!==next)node.nodeValue=next;
  }
}

function cleanupOrphans(){
  document.querySelectorAll('.mxAccountSupport').forEach(el=>{
    if(!el.closest('.mxAccountPage'))el.remove();
  });
  document.querySelectorAll('.mxAccountShellBottom').forEach(el=>{
    if(!el.closest('.mxAccountPage'))el.remove();
  });
}

function removeWelcomeDescription(){
  document.querySelectorAll('p').forEach(el=>{
    const text=(el.textContent||'').replace(/\s+/g,' ').trim();
    if(WELCOME_TEXTS.includes(text)){
      el.style.setProperty('display','none','important');
      el.setAttribute('aria-hidden','true');
    }
  });
}

function patchFavorites(){
  const page=document.querySelector('.mxFavoritesPage');
  if(!page)return;
  const c=COPY[lang()];
  setText(page.querySelector('.mxFavoritesTitleBar h1'),c.favorites);
  setText(page.querySelector('.mxFavoritesTitleBar p'),c.saved);
  setText(page.querySelector('.mxFavoritesEmpty strong'),c.empty);

  const bottom=[...page.querySelectorAll('.mxFavoritesBottom>button span')];
  const labels=[c.home,c.search,c.favorites,c.messages,c.account];
  bottom.forEach((el,index)=>{if(labels[index])setText(el,labels[index])});

  const drawer=[...page.querySelectorAll('.mxDrawer>button')];
  setText(drawer[0],c.home);
  setText(drawer[1],c.search);
  if(drawer[4])setButtonText(drawer[4],c.logout);
}

function patchAccount(){
  const page=document.querySelector('.mxAccountPage');
  if(!page)return;
  const c=COPY[lang()];
  const buttons=[...page.querySelectorAll('.mxAccountMenu>button')];
  const rows=[
    [c.favorites,c.saved],
    [c.accountSettings,c.accountSettingsSub],
    [c.password,c.passwordSub],
    [c.notifications,c.notificationsSub]
  ];
  rows.forEach((row,index)=>{
    setText(buttons[index]?.querySelector('strong'),row[0]);
    setText(buttons[index]?.querySelector('small'),row[1]);
  });
  setButtonText(page.querySelector('.mxAccountLogout'),c.logout);

  const support=page.querySelector('.mxAccountSupportCopy');
  if(support){
    const rtl=lang()==='ar';
    support.dir=rtl?'rtl':'ltr';
    support.style.textAlign=rtl?'right':'left';
  }
}

function apply(){
  cleanupOrphans();
  removeWelcomeDescription();
  patchFavorites();
  patchAccount();
}

function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(()=>{
    scheduled=false;
    apply();
  });
}

export function initUiRegressionFix(){
  if(observer)return;
  observer=new MutationObserver(schedule);
  observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('maurione:language-change',schedule);
  window.addEventListener('popstate',schedule);
  apply();
}
