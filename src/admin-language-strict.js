const KEY='maurione_admin_language';
const STYLE_ID='mx-admin-language-strict-style';
let scheduled=false;

const PAIRS=[
['مركز الإدارة','Centro de Administração'],['لوحة التحكم','Painel de controlo'],['ملخص الأداء والعمليات','Resumo do desempenho e das operações'],['Administration Center','Centro de Administração'],['MAURIONE CARS · MAURITANIA','MAURIONE CARS · ANGOLA'],
['الإدارة','Administração'],['نظرة عامة','Visão geral'],['السيارات والمخزون','Carros e inventário'],['إدارة جميع السيارات والحالات','Gestão de todos os carros e estados'],['التحليلات والتقارير','Análises e relatórios'],['مؤشرات الزيارات وتفاعل العملاء','Indicadores de visitas e interação dos clientes'],['الفريق والصلاحيات','Equipa e permissões'],['إدارة الموظفين وأدوار الوصول','Gestão da equipa e níveis de acesso'],['إدارة أعضاء الفريق وأدوار الوصول','Gestão da equipa e níveis de acesso'],['المستخدمون','Utilizadores'],['قاعدة مستخدمي MauriOne','Base de utilizadores MauriOne'],['سجل النشاط','Registo de atividade'],['تتبع العمليات الإدارية','Acompanhamento das operações administrativas'],['الإعدادات','Definições'],['إعدادات الإدارة','Definições da administração'],['إعدادات مستقلة للوحة التحكم','Definições independentes do painel'],
['فتح الموقع','Abrir site'],['إضافة سيارة','Adicionar carro'],['إضافة السيارات','Adicionar carros'],['سيارة جديدة','Novo carro'],['التقارير','Relatórios'],['الإشعارات','Notificações'],['المالك','Proprietário'],['مالك النظام','Proprietário do sistema'],['مدير النظام','Administrador'],['الفريق','Equipa'],['عضو فريق','Membro da equipa'],['عضو الفريق','Membro da equipa'],['أعضاء الفريق','Membros da equipa'],['الشركاء','Parceiros'],['عضو الفريق / الشريك','Membro da equipa / parceiro'],['تسجيل الخروج','Terminar sessão'],['خروج','Sair'],
['مرحبًا بك','Bem-vindo'],['هذه نظرة تنفيذية مباشرة على أداء MauriOne Cars.','Esta é uma visão executiva direta do desempenho da MauriOne Cars.'],['إجمالي السيارات','Total de carros'],['إجمالي المشاهدات','Total de visualizações'],['طلبات واتساب','Pedidos via WhatsApp'],['إجمالي الزوار','Total de visitantes'],['متوفرة حاليًا','disponíveis agora'],['مشاهدات صفحات السيارات','Visualizações das páginas dos carros'],['تفاعل مباشر من العملاء','Interação direta dos clientes'],['سيارات مميزة','carros em destaque'],
['حركة الزوار','Movimento de visitantes'],['آخر 7 أيام','Últimos 7 dias'],['عرض التقرير','Ver relatório'],['ستظهر بيانات الزيارات هنا بعد جمعها.','Os dados de visitas aparecerão aqui depois de serem recolhidos.'],['تفاعل العملاء','Interação dos clientes'],['إجمالي التفاعل','Interação total'],['مشاهدات السيارات','Visualizações dos carros'],['فتح صفحات التفاصيل','Abertura das páginas de detalhe'],['واتساب','WhatsApp'],['طلبات التواصل','Pedidos de contacto'],['الاتصالات','Chamadas'],['ضغطات رقم الهاتف','Toques no número de telefone'],['المفضلة','Favoritos'],['إضافات المستخدمين','Adições dos utilizadores'],['أحدث السيارات','Carros recentes'],['إدارة المخزون','Gerir inventário'],
['السيارة','Carro'],['السعر','Preço'],['الحالة','Estado'],['الموقع','Localização'],['آخر تحديث','Última atualização'],['إجراء','Ação'],['تعديل','Editar'],['حذف','Eliminar'],['إرجاع','Repor'],['مباعة','Vendido'],['متوفرة','Disponível'],['مباع','Vendido'],['متوفر','Disponível'],['لا توجد سيارات مسجلة حتى الآن.','Ainda não existem carros registados.'],['إدارة بيانات السيارات، حالتها، أسعارها وصورها من مكان واحد.','Gira os dados, estado, preços e fotografias dos carros num único lugar.'],['ابحث بالماركة، الموديل أو الموقع...','Pesquise por marca, modelo ou localização...'],['نتيجة','resultado'],
['قراءة موحدة لسلوك الزوار ومدى اهتمامهم بالسيارات.','Uma leitura unificada do comportamento dos visitantes e do interesse pelos carros.'],['المشاهدات','Visualizações'],['كل صفحات السيارات','Todas as páginas dos carros'],['نقرات التواصل','Cliques de contacto'],['نقرات الاتصال','Cliques de chamada'],['إضافات للمفضلة','Adições aos favoritos'],['الزيارات اليومية','Visitas diárias'],['لا توجد بيانات كافية بعد.','Ainda não existem dados suficientes.'],['مؤشرات التحويل','Indicadores de conversão'],['من المشاهدة إلى التواصل','Da visualização ao contacto'],['معدل واتساب','Taxa de WhatsApp'],['من إجمالي المشاهدات','Do total de visualizações'],['معدل الاتصال','Taxa de chamadas'],['معدل الحفظ','Taxa de favoritos'],
['إدارة من يستطيع الوصول وما الذي يستطيع تنفيذه داخل النظام.','Gira quem pode aceder e o que pode executar no sistema.'],['إنشاء الموظفين، إيقاف الحسابات، وتحديد دور كل عضو.','Crie membros da equipa, desative contas e defina a função de cada membro.'],['فتح إدارة الفريق','Abrir gestão da equipa'],['الصلاحيات الدقيقة','Permissões detalhadas'],['منح صلاحيات منفصلة للمشاهدة والإضافة والتعديل والحذف والتقارير.','Atribua permissões separadas para visualizar, adicionar, editar, eliminar e consultar relatórios.'],['إدارة الصلاحيات','Gerir permissões'],['الرقابة والنشاط','Supervisão e atividade'],['متابعة العمليات الإدارية ومعرفة من قام بكل إجراء.','Acompanhe as operações administrativas e saiba quem realizou cada ação.'],
['عرض قاعدة الحسابات المسجلة في MauriOne ومعلوماتها الأساسية.','Consulte as contas registadas na MauriOne e as suas informações básicas.'],['دليل المستخدمين','Diretório de utilizadores'],['استعراض المستخدمين المسجلين والبحث بينهم وفتح بيانات التواصل المتاحة.','Consulte os utilizadores registados, pesquise e veja os contactos disponíveis.'],['فتح دليل المستخدمين','Abrir diretório de utilizadores'],
['سجل تدقيق للعمليات التي تتم داخل لوحة الإدارة.','Registo de auditoria das operações realizadas no painel.'],['آخر العمليات','Operações recentes'],['عملية مسجلة','operação registada'],['عملية إدارية','Operação administrativa'],['النظام','Sistema'],['عند بدء تسجيل العمليات ستظهر هنا تلقائيًا.','Quando o registo de operações começar, elas aparecerão aqui automaticamente.'],
['إعدادات لوحة الإدارة','Definições do painel'],['هذه الإعدادات مستقلة عن واجهة موقع الزوار.','Estas definições são independentes do site público.'],['المظهر','Aparência'],['حدد مظهر لوحة الإدارة على هذا الجهاز.','Escolha a aparência do painel neste dispositivo.'],['فاتح','Claro'],['داكن','Escuro'],['تلقائي','Automático'],['إعدادات متقدمة','Definições avançadas'],['إعدادات إظهار الإحصائيات والأقسام الإدارية الإضافية.','Definições de visibilidade das estatísticas e secções administrativas adicionais.'],['فتح الإعدادات المتقدمة','Abrir definições avançadas'],
['الحسابات المالية','Contas financeiras'],['الإدارة المالية','Gestão financeira'],['الحسابات الداخلية','Contas internas'],['خاص بالمالك','Apenas proprietário'],['ربط كل سيارة بعضو من الفريق ومتابعة المبيعات والتكلفة والمصاريف والأرباح.','Associe cada carro a um membro da equipa e acompanhe vendas, custos, despesas e lucros.'],['إجمالي المبيعات','Total de vendas'],['أسعار البيع الفعلية المسجلة','Preços de venda efetivos registados'],['المبالغ المستلمة','Montantes recebidos'],['المستلم من العملاء','Recebido dos clientes'],['صافي الربح','Lucro líquido'],['هامش الربح','Margem de lucro'],['المبالغ المتبقية','Montantes em falta'],['مستحقات العملاء غير المستلمة','Valores de clientes ainda por receber'],['السيارات والحسابات','Carros e contas'],['أعضاء الفريق والشركاء','Equipa e parceiros'],['حساب كل سيارة','Conta de cada carro'],['حساب مالي','Conta financeira'],['ابحث باسم السيارة أو رقمها أو اسم عضو الفريق...','Pesquise pelo carro, referência ou membro da equipa...'],['سعر العرض','Preço anunciado'],['التكلفة','Custo'],['المصاريف','Despesas'],['سعر البيع','Preço de venda'],['المستلم','Recebido'],['المتبقي من العميل','Em falta do cliente'],['الإجراء','Ação'],['إدارة الحساب','Gerir conta'],['قيمة السيارات المعروضة','Valor dos carros anunciados'],['إجمالي التكلفة','Custo total'],['المتبقي من العملاء','Em falta dos clientes'],['المدفوع للشريك','Pago ao parceiro'],['المتبقي للشريك','Em falta ao parceiro'],['إجمالي التكلفة مع المصاريف','Custo total com despesas'],['بدون رقم','Sem referência'],['غير مسند','Não atribuído'],['ملاحظات مالية','Notas financeiras'],['حفظ الحساب المالي','Guardar conta financeira'],['سيارة بدون اسم','Carro sem nome'],
['إضافة عضو للفريق','Adicionar membro à equipa'],['لا يوجد أي عضو في الفريق بعد.','Ainda não existe nenhum membro na equipa.'],['إنشاء أول حساب.','Criar a primeira conta.'],['جارٍ تحميل الفريق...','A carregar equipa...'],['تعذر تحميل أعضاء الفريق.','Não foi possível carregar a equipa.'],['الصلاحيات','Permissões'],['كلمة المرور','Palavra-passe'],['إيقاف','Desativar'],['تفعيل','Ativar'],['نشط','Ativo'],['موقوف','Desativado'],['بدون صلاحيات إضافية','Sem permissões adicionais'],['اسم عضو الفريق','Nome do membro da equipa'],['المسمى الوظيفي','Função'],['مثال: مسؤول المبيعات','Exemplo: Responsável de vendas'],['إنشاء الحساب','Criar conta'],['8 أحرف على الأقل','Pelo menos 8 caracteres'],['أنت فقط تستطيع تغييرها من لوحة التحكم.','Apenas o proprietário pode alterá-la no painel.'],['الإحصائيات','Estatísticas'],['عرض السيارات','Ver carros'],['إنشاء إعلان سيارة جديد','Criar um novo anúncio de carro'],['تعديل السيارات','Editar carros'],['تغيير حالة السيارة','Alterar estado do carro'],['حذف السيارات','Eliminar carros'],['عرض المستخدمين','Ver utilizadores'],['تصدير المحتوى','Exportar conteúdo'],
['إعدادات لوحة التحكم','Definições do painel'],['إغلاق','Fechar'],['هذا الإعداد خاص بلوحة الإدارة ولا يغيّر مظهر موقع الزوار.','Esta definição aplica-se apenas ao painel e não altera o site público.'],['محتوى لوحة الإدارة','Conteúdo do painel'],['إحصائيات الزوار','Estatísticas de visitantes'],['تفاعل العملاء مع السيارات','Interação dos clientes com os carros'],['يتم حفظ هذه الخيارات على هذا الجهاز للوحة الإدارة فقط.','Estas opções são guardadas neste dispositivo apenas para o painel.'],
['السنة','Ano'],['الكيلومترات','Quilometragem'],['الوقود','Combustível'],['ناقل الحركة','Transmissão'],['الدفع','Tração'],['الوصف','Descrição'],['رفع صور السيارة','Carregar fotografias do carro'],['جارٍ الرفع...','A carregar...'],['الصورة الرئيسية','Fotografia principal'],['اجعلها الرئيسية','Definir como principal'],['إلغاء','Cancelar'],['حفظ السيارة','Guardar carro'],
['بحث','Pesquisar'],['البحث','Pesquisa'],['اليوم','Hoje'],['آخر 30 يومًا','Últimos 30 dias'],['الإجمالي','Total'],['معدل التحويل','Taxa de conversão']
];

const AR_PT=new Map(PAIRS);
const PT_AR=new Map(PAIRS.map(([ar,pt])=>[pt,ar]));
const PARTIAL=[...PAIRS].sort((a,b)=>Math.max(b[0].length,b[1].length)-Math.max(a[0].length,a[1].length));
const MONTHS=[['يناير','jan.'],['فبراير','fev.'],['مارس','mar.'],['أبريل','abr.'],['مايو','mai.'],['يونيو','jun.'],['يوليو','jul.'],['أغسطس','ago.'],['سبتمبر','set.'],['أكتوبر','out.'],['نوفمبر','nov.'],['ديسمبر','dez.']];

function lang(){try{return localStorage.getItem(KEY)==='ar'?'ar':'pt'}catch{return'pt'}}
function preserve(raw,next){const lead=String(raw).match(/^\s*/)?.[0]||'',tail=String(raw).match(/\s*$/)?.[0]||'';return lead+next+tail}
function dynamic(s,target){
 let m;
 if(target==='pt'){
  if((m=s.match(/^مرحبًا[،,]?\s*(.+)$/)))return `Bem-vindo, ${m[1]}`;
  if((m=s.match(/^(\d+)\s+متوفرة حاليًا$/)))return `${m[1]} disponíveis agora`;
  if((m=s.match(/^(\d+)\s+سيارات مميزة$/)))return `${m[1]} carros em destaque`;
  if((m=s.match(/^(\d+)\s+سيارة في النظام\s*·\s*(\d+)\s+مباعة$/)))return `${m[1]} carros no sistema · ${m[2]} vendidos`;
  if((m=s.match(/^(\d+)\s+نتيجة$/)))return `${m[1]} resultados`;
  if((m=s.match(/^(\d+)\s+عملية مسجلة$/)))return `${m[1]} operações registadas`;
 }else{
  if((m=s.match(/^Bem-vindo[،,]?\s*(.+)$/i)))return `مرحبًا، ${m[1]}`;
  if((m=s.match(/^(\d+)\s+disponíveis agora$/i)))return `${m[1]} متوفرة حاليًا`;
  if((m=s.match(/^(\d+)\s+carros em destaque$/i)))return `${m[1]} سيارات مميزة`;
  if((m=s.match(/^(\d+)\s+carros no sistema\s*·\s*(\d+)\s+vendidos$/i)))return `${m[1]} سيارة في النظام · ${m[2]} مباعة`;
  if((m=s.match(/^(\d+)\s+resultados?$/i)))return `${m[1]} نتيجة`;
  if((m=s.match(/^(\d+)\s+operaç(?:ão|ões) registad(?:a|as)$/i)))return `${m[1]} عملية مسجلة`;
 }
 return null;
}
function translate(raw,target=lang()){
 const original=String(raw??'');const s=original.trim();if(!s)return original;
 const dyn=dynamic(s,target);if(dyn)return preserve(original,dyn);
 let out=s;
 if(target==='pt'){
  if(AR_PT.has(out))out=AR_PT.get(out);
  else{
   for(const [ar,pt] of PARTIAL)if(out.includes(ar))out=out.split(ar).join(pt);
   for(const [ar,pt] of MONTHS)if(out.includes(ar))out=out.split(ar).join(pt);
  }
  out=out.replace(/\bMRU\b/g,'Kz').replace(/MAURITANIA|Mauritânia/gi,'ANGOLA');
 }else{
  if(PT_AR.has(out))out=PT_AR.get(out);
  else{
   for(const [ar,pt] of PARTIAL)if(out.includes(pt))out=out.split(pt).join(ar);
   for(const [ar,pt] of MONTHS)if(out.includes(pt))out=out.split(pt).join(ar);
  }
  out=out.replace(/\bMRU\b/g,'Kz').replace(/MAURITANIA|Mauritânia/gi,'أنغولا').replace(/MAURIONE CARS · ANGOLA/gi,'MAURIONE CARS · أنغولا');
 }
 return out===s?original:preserve(original,out);
}
function ignored(node){const el=node?.nodeType===1?node:node?.parentElement;return !el||Boolean(el.closest('script,style,noscript,code,pre,[data-i18n-ignore="1"]'))}
function patchNode(node,target){
 if(!node||ignored(node))return;
 if(node.nodeType===3){const next=translate(node.nodeValue,target);if(next!==node.nodeValue)node.nodeValue=next;return}
 if(node.nodeType!==1)return;
 for(const a of ['placeholder','title','aria-label'])if(node.hasAttribute(a)){const now=node.getAttribute(a)||'';const next=translate(now,target);if(next!==now)node.setAttribute(a,next)}
 for(const child of node.childNodes)patchNode(child,target);
}
function ensureStyle(){
 if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
 #mxEnterpriseAdmin .mxStrictLang{display:flex;gap:6px;padding:9px;margin-bottom:7px}
 #mxEnterpriseAdmin .mxStrictLang button{flex:1;height:34px;border:1px solid rgba(255,255,255,.12);border-radius:9px;background:rgba(255,255,255,.05);color:#9da4af;font-size:10px;font-weight:900;cursor:pointer}
 #mxEnterpriseAdmin .mxStrictLang button.active{background:rgba(245,103,43,.16);border-color:rgba(245,103,43,.35);color:#ff834e}
 html[data-admin-lang='pt'] #mxEnterpriseAdmin{direction:ltr!important;grid-template-columns:272px minmax(0,1fr)!important}
 html[data-admin-lang='pt'] #mxEnterpriseAdmin .entSidebar{grid-column:1!important}
 html[data-admin-lang='pt'] #mxEnterpriseAdmin .entMain{grid-column:2!important}
 html[data-admin-lang='pt'] #mxEnterpriseAdmin .entNav button,html[data-admin-lang='pt'] #mxEnterpriseAdmin .entTopTitle,html[data-admin-lang='pt'] #mxEnterpriseAdmin .entHero,html[data-admin-lang='pt'] #mxEnterpriseAdmin th,html[data-admin-lang='pt'] #mxEnterpriseAdmin td{text-align:left!important}
 html[data-admin-lang='ar'] #mxEnterpriseAdmin{direction:rtl!important;grid-template-columns:minmax(0,1fr) 272px!important}
 html[data-admin-lang='ar'] #mxEnterpriseAdmin .entSidebar{grid-column:2!important}
 html[data-admin-lang='ar'] #mxEnterpriseAdmin .entMain{grid-column:1!important}
 html[data-admin-lang='ar'] #mxEnterpriseAdmin .entNav button,html[data-admin-lang='ar'] #mxEnterpriseAdmin .entTopTitle,html[data-admin-lang='ar'] #mxEnterpriseAdmin .entHero,html[data-admin-lang='ar'] #mxEnterpriseAdmin th,html[data-admin-lang='ar'] #mxEnterpriseAdmin td{text-align:right!important}
 @media(max-width:960px){
  html[data-admin-lang] #mxEnterpriseAdmin{display:block!important;grid-template-columns:none!important}
  html[data-admin-lang] #mxEnterpriseAdmin .entMain{display:block!important;width:100%!important;grid-column:auto!important}
  html[data-admin-lang='pt'] #mxEnterpriseAdmin .entSidebar{left:0!important;right:auto!important;transform:translateX(-105%)!important;box-shadow:20px 0 50px rgba(0,0,0,.26)!important}
  html[data-admin-lang='pt'] #mxEnterpriseAdmin.menuOpen .entSidebar{transform:translateX(0)!important}
  html[data-admin-lang='ar'] #mxEnterpriseAdmin .entSidebar{right:0!important;left:auto!important;transform:translateX(105%)!important;box-shadow:-20px 0 50px rgba(0,0,0,.26)!important}
  html[data-admin-lang='ar'] #mxEnterpriseAdmin.menuOpen .entSidebar{transform:translateX(0)!important}
 }
 `;document.head.appendChild(s)
}
function ensurePicker(target){
 const bottom=document.querySelector('#mxEnterpriseAdmin .entSidebarBottom');if(!bottom)return;
 let box=bottom.querySelector('.mxStrictLang');if(!box){box=document.createElement('div');box.className='mxStrictLang';box.dataset.i18nIgnore='1';box.innerHTML='<button type="button" data-strict-lang="pt">PT</button><button type="button" data-strict-lang="ar">العربية</button>';bottom.prepend(box)}
 box.querySelectorAll('[data-strict-lang]').forEach(b=>b.classList.toggle('active',b.dataset.strictLang===target));
}
function apply(){scheduled=false;ensureStyle();const target=lang();document.documentElement.lang=target==='ar'?'ar':'pt-AO';document.documentElement.dir=target==='ar'?'rtl':'ltr';document.documentElement.dataset.adminLang=target;document.documentElement.dataset.maurioneLang=target;patchNode(document.body,target);ensurePicker(target);document.title=target==='ar'?'لوحة التحكم | MauriOne':'Painel de controlo | MauriOne'}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}
function setLang(next){if(!['pt','ar'].includes(next))return;try{localStorage.setItem(KEY,next)}catch{};schedule();window.dispatchEvent(new CustomEvent('maurione:admin-language-change',{detail:{lang:next}}))}
document.addEventListener('click',e=>{const b=e.target.closest('[data-strict-lang],[data-admin-lang]');if(!b)return;const next=b.dataset.strictLang||b.dataset.adminLang;if(next)setLang(next)},true);
window.addEventListener('storage',e=>{if(e.key===KEY)schedule()});
window.addEventListener('maurione:language-change',schedule);
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label','class']});
apply();
