const ADMIN_THEME_KEY='maurione_admin_theme';
const ADMIN_VISITOR_STATS_KEY='maurione_admin_show_visitor_stats';
const ADMIN_CAR_STATS_KEY='maurione_admin_show_car_stats';
const STYLE_ID='mx-admin-settings-style';
const BUTTON_CLASS='mxAdminSettingsButton';
const OVERLAY_CLASS='mxAdminSettingsOverlay';
let started=false;
let observer=null;

function read(key,fallback){
  try{
    const value=localStorage.getItem(key);
    return value===null?fallback:value;
  }catch{return fallback}
}
function write(key,value){try{localStorage.setItem(key,String(value))}catch{}}
function systemDark(){return Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches)}
function themeChoice(){
  const saved=read(ADMIN_THEME_KEY,'system');
  return ['light','dark','system'].includes(saved)?saved:'system';
}
function resolvedTheme(){
  const choice=themeChoice();
  return choice==='system'?(systemDark()?'dark':'light'):choice;
}
function applyTheme(){
  const theme=resolvedTheme();
  document.documentElement.dataset.theme=theme;
  document.documentElement.dataset.adminThemeChoice=themeChoice();
  document.documentElement.style.colorScheme=theme;
  document.body.style.background=theme==='dark'?'#0d0f12':'#f6f7f8';
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',theme==='dark'?'#0d0f12':'#ffffff');
}
function enabled(key){return read(key,'1')!=='0'}
function applyVisibility(){
  const showVisitors=enabled(ADMIN_VISITOR_STATS_KEY);
  const showCars=enabled(ADMIN_CAR_STATS_KEY);
  document.documentElement.dataset.adminVisitorStats=showVisitors?'1':'0';
  document.documentElement.dataset.adminCarStats=showCars?'1':'0';
  document.querySelectorAll('.mxAdminVisitorStats').forEach(node=>node.style.setProperty('display',showVisitors?'':'none','important'));
  document.querySelectorAll('.mxAdminCarAnalytics,.mxAnalyticsPanel').forEach(node=>node.style.setProperty('display',showCars?'':'none','important'));
}
function iconGear(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V20.3h-3v-.09a1.7 1.7 0 0 0-1.03-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.55-1.03H5.3v-3h.15A1.7 1.7 0 0 0 7 9.94a1.7 1.7 0 0 0-.34-1.88L6.6 8l2.12-2.12.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.7 4.7V4.6h3v.1a1.7 1.7 0 0 0 1.03 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06L19.8 8l-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.55 1.03h.15v3h-.15A1.7 1.7 0 0 0 19.4 15Z"/></svg>'}
function ensureStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .${BUTTON_CLASS}{width:44px!important;height:44px!important;border:1px solid #e1e4e8!important;border-radius:13px!important;background:#fff!important;color:#23262b!important;display:grid!important;place-items:center!important;padding:0!important;cursor:pointer!important;box-shadow:none!important;flex:none!important}
    .${BUTTON_CLASS} svg{width:21px!important;height:21px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important}
    .${OVERLAY_CLASS}{position:fixed!important;inset:0!important;z-index:99999!important;background:rgba(15,23,42,.34)!important;display:grid!important;place-items:end center!important;padding:16px!important;box-sizing:border-box!important;direction:rtl!important;font-family:Arial,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
    .mxAdminSettingsSheet{width:min(100%,560px)!important;max-height:min(86dvh,760px)!important;overflow:auto!important;background:#fff!important;border:1px solid #e7e9ed!important;border-radius:24px!important;box-shadow:0 22px 70px rgba(15,23,42,.18)!important;padding:20px!important;box-sizing:border-box!important}
    .mxAdminSettingsHead{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;margin-bottom:18px!important}
    .mxAdminSettingsHead h2{margin:0!important;font-size:22px!important;color:#17191d!important;font-weight:900!important}
    .mxAdminSettingsClose{width:40px!important;height:40px!important;border-radius:12px!important;border:1px solid #e2e5e9!important;background:#f7f8f9!important;color:#23262b!important;font-size:24px!important;line-height:1!important;cursor:pointer!important}
    .mxAdminSettingsSection{border-top:1px solid #eceef1!important;padding:16px 0!important}
    .mxAdminSettingsSection:first-of-type{border-top:0!important;padding-top:0!important}
    .mxAdminSettingsSection h3{margin:0 0 6px!important;font-size:15px!important;color:#24272c!important}
    .mxAdminSettingsSection p{margin:0 0 12px!important;color:#8a9099!important;font-size:12px!important;line-height:1.6!important}
    .mxAdminThemeChoices{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}
    .mxAdminThemeChoice{min-height:46px!important;border:1px solid #e1e4e8!important;border-radius:13px!important;background:#fafbfc!important;color:#30343a!important;font-size:13px!important;font-weight:800!important;cursor:pointer!important}
    .mxAdminThemeChoice.active{background:#fff4ed!important;border-color:#ff9a69!important;color:#f05a1a!important}
    .mxAdminSettingRow{min-height:60px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;border:1px solid #e7e9ed!important;border-radius:15px!important;padding:10px 13px!important;margin-top:8px!important;box-sizing:border-box!important;background:#fafbfc!important}
    .mxAdminSettingRow strong{display:block!important;font-size:14px!important;color:#25282d!important}
    .mxAdminSettingRow small{display:block!important;margin-top:3px!important;color:#969ca5!important;font-size:10px!important}
    .mxAdminSwitch{width:46px!important;height:26px!important;border:0!important;border-radius:999px!important;background:#d6d9de!important;padding:3px!important;position:relative!important;cursor:pointer!important;flex:none!important;transition:.2s!important}
    .mxAdminSwitch i{display:block!important;width:20px!important;height:20px!important;border-radius:50%!important;background:#fff!important;box-shadow:0 1px 4px rgba(0,0,0,.18)!important;transition:.2s!important}
    .mxAdminSwitch.on{background:#ff6426!important}.mxAdminSwitch.on i{transform:translateX(20px)!important}
    .mxAdminSettingsNote{margin-top:14px!important;padding:11px 13px!important;border-radius:13px!important;background:#f7f8f9!important;color:#7d838c!important;font-size:11px!important;line-height:1.6!important}
    html[data-theme='dark'] .${BUTTON_CLASS}{background:#1b1f24!important;border-color:#333840!important;color:#f4f5f7!important}
    html[data-theme='dark'] .${OVERLAY_CLASS}{background:rgba(0,0,0,.68)!important}
    html[data-theme='dark'] .mxAdminSettingsSheet{background:#15181c!important;border-color:#2c3138!important;box-shadow:0 22px 70px rgba(0,0,0,.5)!important}
    html[data-theme='dark'] .mxAdminSettingsHead h2,html[data-theme='dark'] .mxAdminSettingsSection h3,html[data-theme='dark'] .mxAdminSettingRow strong{color:#f5f6f7!important}
    html[data-theme='dark'] .mxAdminSettingsClose,html[data-theme='dark'] .mxAdminThemeChoice,html[data-theme='dark'] .mxAdminSettingRow{background:#111419!important;border-color:#343a42!important;color:#dfe2e6!important}
    html[data-theme='dark'] .mxAdminThemeChoice.active{background:#2b1b14!important;border-color:#8b4729!important;color:#ff7a3d!important}
    html[data-theme='dark'] .mxAdminSettingsSection{border-color:#2b3037!important}
    html[data-theme='dark'] .mxAdminSettingsSection p,html[data-theme='dark'] .mxAdminSettingRow small{color:#969da7!important}
    html[data-theme='dark'] .mxAdminSettingsNote{background:#111419!important;color:#969da7!important}
    @media(max-width:520px){.${OVERLAY_CLASS}{padding:8px!important}.mxAdminSettingsSheet{border-radius:20px!important;padding:16px!important}.mxAdminThemeChoices{grid-template-columns:1fr!important}}
  `;
  document.head.appendChild(style);
}
function closeSettings(){document.querySelector(`.${OVERLAY_CLASS}`)?.remove()}
function renderSettings(){
  closeSettings();
  ensureStyle();
  const overlay=document.createElement('div');
  overlay.className=OVERLAY_CLASS;
  const choice=themeChoice();
  const showVisitors=enabled(ADMIN_VISITOR_STATS_KEY);
  const showCars=enabled(ADMIN_CAR_STATS_KEY);
  overlay.innerHTML=`
    <section class="mxAdminSettingsSheet" role="dialog" aria-modal="true" aria-label="إعدادات لوحة التحكم">
      <div class="mxAdminSettingsHead"><h2>إعدادات لوحة التحكم</h2><button class="mxAdminSettingsClose" type="button" aria-label="إغلاق">×</button></div>
      <div class="mxAdminSettingsSection">
        <h3>المظهر</h3><p>هذا الإعداد خاص بلوحة الإدارة ولا يغيّر مظهر موقع الزوار.</p>
        <div class="mxAdminThemeChoices">
          <button class="mxAdminThemeChoice ${choice==='light'?'active':''}" data-admin-theme="light" type="button">فاتح</button>
          <button class="mxAdminThemeChoice ${choice==='dark'?'active':''}" data-admin-theme="dark" type="button">داكن</button>
          <button class="mxAdminThemeChoice ${choice==='system'?'active':''}" data-admin-theme="system" type="button">تلقائي</button>
        </div>
      </div>
      <div class="mxAdminSettingsSection">
        <h3>محتوى لوحة الإدارة</h3><p>اختر الأقسام التي تريد ظهورها في الصفحة الرئيسية للوحة التحكم.</p>
        <div class="mxAdminSettingRow"><div><strong>إحصائيات الزوار</strong><small>اليوم، 7 أيام، 30 يومًا، والإجمالي</small></div><button class="mxAdminSwitch ${showVisitors?'on':''}" data-admin-setting="visitors" type="button" aria-pressed="${showVisitors}"><i></i></button></div>
        <div class="mxAdminSettingRow"><div><strong>تفاعل العملاء مع السيارات</strong><small>المشاهدات، واتساب، الاتصال، والمفضلة</small></div><button class="mxAdminSwitch ${showCars?'on':''}" data-admin-setting="cars" type="button" aria-pressed="${showCars}"><i></i></button></div>
      </div>
      <div class="mxAdminSettingsNote">يتم حفظ هذه الخيارات على هذا الجهاز للوحة الإدارة فقط.</div>
    </section>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click',event=>{
    if(event.target===overlay||event.target.closest('.mxAdminSettingsClose')){closeSettings();return}
    const themeButton=event.target.closest('[data-admin-theme]');
    if(themeButton){
      write(ADMIN_THEME_KEY,themeButton.dataset.adminTheme);
      applyTheme();
      renderSettings();
      return;
    }
    const setting=event.target.closest('[data-admin-setting]');
    if(setting){
      const key=setting.dataset.adminSetting==='visitors'?ADMIN_VISITOR_STATS_KEY:ADMIN_CAR_STATS_KEY;
      write(key,enabled(key)?'0':'1');
      applyVisibility();
      renderSettings();
    }
  });
}
function ensureButton(){
  const admin=document.querySelector('.mxAdmin');
  const header=admin?.querySelector('.mxAdminHeader');
  if(!header||header.querySelector(`.${BUTTON_CLASS}`))return;
  ensureStyle();
  const button=document.createElement('button');
  button.type='button';
  button.className=BUTTON_CLASS;
  button.setAttribute('aria-label','إعدادات لوحة التحكم');
  button.title='إعدادات لوحة التحكم';
  button.innerHTML=iconGear();
  button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();renderSettings()});
  header.appendChild(button);
}
function sync(){applyTheme();applyVisibility();ensureButton()}
function start(){
  if(started)return;started=true;sync();
  observer=new MutationObserver(sync);observer.observe(document.documentElement,{childList:true,subtree:true});
  const media=window.matchMedia?.('(prefers-color-scheme: dark)');
  const onMedia=()=>{if(themeChoice()==='system')applyTheme()};
  try{media?.addEventListener('change',onMedia)}catch{try{media?.addListener(onMedia)}catch{}}
  window.addEventListener('beforeunload',()=>observer?.disconnect(),{once:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();

export {applyTheme,applyVisibility,renderSettings};
