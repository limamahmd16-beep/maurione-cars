const STORAGE_KEY='maurione_language';
const SUPPORTED=['ar','fr','en','pt'];

const languages={
  ar:{label:'العربية',short:'AR'},
  fr:{label:'Français',short:'FR'},
  en:{label:'English',short:'EN'},
  pt:{label:'Português',short:'PT'},
};

const d=(en,fr,pt)=>({en,fr,pt});

const dictionary={
  'السوق الأول للسيارات في موريتانيا':d('Mauritania’s car marketplace','Le marché automobile de Mauritanie','O mercado automóvel da Mauritânia'),
  'الرئيسية':d('Home','Accueil','Início'),
  'بحث':d('Search','Recherche','Pesquisar'),
  'البحث':d('Search','Recherche','Pesquisa'),
  'المفضلة':d('Favorites','Favoris','Favoritos'),
  'الرسائل':d('Messages','Messages','Mensagens'),
  'حسابي':d('My account','Mon compte','Minha conta'),
  'الإشعارات':d('Notifications','Notifications','Notificações'),
  'القائمة':d('Menu','Menu','Menu'),
  'لوحة الإدارة':d('Admin dashboard','Tableau de bord','Painel administrativo'),
  'لوحة التحكم':d('Dashboard','Tableau de bord','Painel de controlo'),
  'تسجيل الخروج':d('Sign out','Se déconnecter','Terminar sessão'),
  'العودة':d('Back','Retour','Voltar'),
  'العودة إلى الموقع':d('Back to website','Retour au site','Voltar ao site'),
  'إعادة المحاولة':d('Try again','Réessayer','Tentar novamente'),
  'تعذر تحميل الصفحة':d('Could not load the page','Impossible de charger la page','Não foi possível carregar a página'),
  'حدث خطأ أثناء تشغيل الواجهة. أعد المحاولة.':d('An error occurred while starting the interface. Try again.','Une erreur est survenue lors du démarrage de l’interface. Réessayez.','Ocorreu um erro ao iniciar a interface. Tente novamente.'),
  'جارٍ فتح MauriOne...':d('Opening MauriOne...','Ouverture de MauriOne...','A abrir MauriOne...'),
  'جارٍ فتح لوحة التحكم...':d('Opening dashboard...','Ouverture du tableau de bord...','A abrir o painel...'),

  'ابحث عن سيارة...':d('Search for a car...','Rechercher une voiture...','Pesquisar um carro...'),
  'الأحدث أولًا':d('Newest first','Plus récentes','Mais recentes'),
  'الأقدم أولًا':d('Oldest first','Plus anciennes','Mais antigos'),
  'الأقل سعرًا':d('Lowest price','Prix croissant','Menor preço'),
  'الأعلى سعرًا':d('Highest price','Prix décroissant','Maior preço'),
  'أقل كم':d('Lowest mileage','Kilométrage le plus bas','Menor quilometragem'),
  'النوع':d('Type','Type','Tipo'),
  'الموقع':d('Location','Localisation','Localização'),
  'فلتر':d('Filter','Filtrer','Filtrar'),
  'السعر من':d('Min price','Prix minimum','Preço mínimo'),
  'السعر إلى':d('Max price','Prix maximum','Preço máximo'),
  'السنة من':d('Year from','Année min.','Ano mínimo'),
  'السنة إلى':d('Year to','Année max.','Ano máximo'),
  'أقصى كيلومترات':d('Max mileage','Kilométrage max.','Quilometragem máxima'),
  'الوقود':d('Fuel','Carburant','Combustível'),
  'ناقل الحركة':d('Transmission','Transmission','Transmissão'),
  'الدفع':d('Drive','Transmission intégrale','Tração'),
  'الحالة':d('Status','Statut','Estado'),
  'مميز فقط':d('Featured only','En vedette uniquement','Apenas destacados'),
  'مسح الفلاتر':d('Clear filters','Effacer les filtres','Limpar filtros'),
  'الكل':d('All','Tous','Todos'),
  'كل السنوات':d('All years','Toutes les années','Todos os anos'),
  'سيدان':d('Sedan','Berline','Sedan'),
  'بيك أب':d('Pickup','Pick-up','Pickup'),
  'كوبيه':d('Coupe','Coupé','Coupé'),
  'هاتشباك':d('Hatchback','Hayon','Hatchback'),
  'فان':d('Van','Fourgon','Carrinha'),
  'رياضية':d('Sports','Sportive','Desportivo'),
  'فاخرة':d('Luxury','Luxe','Luxo'),
  'بنزين':d('Petrol','Essence','Gasolina'),
  'ديزل':d('Diesel','Diesel','Diesel'),
  'هجين':d('Hybrid','Hybride','Híbrido'),
  'كهرباء':d('Electric','Électrique','Elétrico'),
  'أوتوماتيك':d('Automatic','Automatique','Automático'),
  'عادي':d('Manual','Manuelle','Manual'),
  'متوفرة':d('Available','Disponible','Disponível'),
  'مباعة':d('Sold','Vendue','Vendido'),
  'متوفر':d('Available','Disponible','Disponível'),
  'مباع':d('Sold','Vendu','Vendido'),
  'مميز':d('Featured','En vedette','Destaque'),
  'السنة':d('Year','Année','Ano'),
  'كم':d('km','km','km'),
  'جاري تحميل السيارات...':d('Loading cars...','Chargement des voitures...','A carregar carros...'),
  'لا توجد سيارات مطابقة.':d('No matching cars found.','Aucune voiture correspondante.','Nenhum carro correspondente.'),
  'السيارة غير موجودة':d('Car not found','Voiture introuvable','Carro não encontrado'),
  'السعر عند التواصل':d('Price on request','Prix sur demande','Preço sob consulta'),
  'واتساب':d('WhatsApp','WhatsApp','WhatsApp'),
  'تواصل عبر واتساب':d('Contact via WhatsApp','Contacter via WhatsApp','Contactar via WhatsApp'),
  'اتصال':d('Call','Appeler','Ligar'),

  'إنشاء حساب':d('Create account','Créer un compte','Criar conta'),
  'تسجيل الدخول':d('Sign in','Se connecter','Iniciar sessão'),
  'أنشئ حسابك للوصول إلى MauriOne ومتابعة السيارات.':d('Create your account to access MauriOne and follow cars.','Créez votre compte pour accéder à MauriOne et suivre les voitures.','Crie a sua conta para aceder ao MauriOne e acompanhar os carros.'),
  'مرحبًا بعودتك! سجّل دخولك لمتابعة أفضل العروض.':d('Welcome back! Sign in to follow the best offers.','Bon retour ! Connectez-vous pour suivre les meilleures offres.','Bem-vindo de volta! Inicie sessão para acompanhar as melhores ofertas.'),
  'الاسم الكامل':d('Full name','Nom complet','Nome completo'),
  'رقم الهاتف':d('Phone number','Numéro de téléphone','Número de telefone'),
  'البريد الإلكتروني':d('Email','E-mail','E-mail'),
  'كلمة المرور':d('Password','Mot de passe','Palavra-passe'),
  'إخفاء كلمة المرور':d('Hide password','Masquer le mot de passe','Ocultar palavra-passe'),
  'إظهار كلمة المرور':d('Show password','Afficher le mot de passe','Mostrar palavra-passe'),
  'نسيت كلمة المرور؟':d('Forgot password?','Mot de passe oublié ?','Esqueceu a palavra-passe?'),
  'جارٍ التنفيذ...':d('Working...','Traitement...','A processar...'),
  'إنشاء الحساب':d('Create account','Créer le compte','Criar conta'),
  'دخول':d('Sign in','Connexion','Entrar'),
  'الدخول كزائر':d('Continue as guest','Continuer en invité','Continuar como visitante'),
  'أو':d('or','ou','ou'),
  'ليس لديك حساب؟':d('Don’t have an account?','Vous n’avez pas de compte ?','Não tem uma conta?'),
  'أنشئ حسابًا':d('Create one','Créer un compte','Criar conta'),
  'لديك حساب؟':d('Already have an account?','Vous avez déjà un compte ?','Já tem uma conta?'),
  'سجّل الدخول':d('Sign in','Connectez-vous','Inicie sessão'),
  'أضف رقم هاتفك':d('Add your phone number','Ajoutez votre numéro','Adicione o seu número'),
  'رقم الهاتف مطلوب لحسابات MauriOne حتى نتمكن من التواصل معك عند الحاجة.':d('A phone number is required for MauriOne accounts.','Un numéro de téléphone est requis pour les comptes MauriOne.','É necessário um número de telefone para contas MauriOne.'),
  'حفظ ومتابعة':d('Save and continue','Enregistrer et continuer','Guardar e continuar'),
  'جارٍ الحفظ...':d('Saving...','Enregistrement...','A guardar...'),
  'هذا البريد لديه حساب بالفعل.':d('This email already has an account.','Cet e-mail possède déjà un compte.','Este e-mail já tem uma conta.'),
  'البريد الإلكتروني أو كلمة المرور غير صحيحة.':d('Incorrect email or password.','E-mail ou mot de passe incorrect.','E-mail ou palavra-passe incorretos.'),
  'كلمة المرور يجب أن تكون 6 أحرف على الأقل.':d('Password must be at least 6 characters.','Le mot de passe doit contenir au moins 6 caractères.','A palavra-passe deve ter pelo menos 6 caracteres.'),
  'البريد الإلكتروني غير صحيح.':d('Invalid email address.','Adresse e-mail invalide.','E-mail inválido.'),
  'تمت محاولات كثيرة. حاول مرة أخرى بعد قليل.':d('Too many attempts. Try again shortly.','Trop de tentatives. Réessayez plus tard.','Muitas tentativas. Tente novamente mais tarde.'),
  'أدخل رقم هاتف صحيحًا، من 7 إلى 15 رقمًا.':d('Enter a valid phone number with 7 to 15 digits.','Entrez un numéro valide de 7 à 15 chiffres.','Introduza um número válido com 7 a 15 dígitos.'),
  'تعذر حفظ رقم الهاتف الآن. حاول مرة أخرى.':d('Could not save the phone number. Try again.','Impossible d’enregistrer le numéro. Réessayez.','Não foi possível guardar o número. Tente novamente.'),
  'أدخل بريدك الإلكتروني أولًا ثم اضغط «نسيت كلمة المرور؟».':d('Enter your email first, then tap “Forgot password?”.','Entrez d’abord votre e-mail, puis « Mot de passe oublié ? ».','Introduza primeiro o e-mail e depois toque em “Esqueceu a palavra-passe?”.'),
  'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.':d('Password reset link sent to your email.','Lien de réinitialisation envoyé à votre e-mail.','Link de redefinição enviado para o seu e-mail.'),
  'لا يوجد حساب بهذا البريد الإلكتروني.':d('No account exists with this email.','Aucun compte avec cet e-mail.','Não existe conta com este e-mail.'),
  'تعذر إرسال رابط إعادة تعيين كلمة المرور.':d('Could not send the password reset link.','Impossible d’envoyer le lien de réinitialisation.','Não foi possível enviar o link de redefinição.'),

  'أنت تتصفح MauriOne كزائر. سجّل الدخول للوصول إلى إعدادات الحساب.':d('You are browsing MauriOne as a guest. Sign in to access account settings.','Vous parcourez MauriOne en invité. Connectez-vous pour accéder aux paramètres.','Está a navegar no MauriOne como visitante. Inicie sessão para aceder às definições.'),
  'تسجيل الدخول أو إنشاء حساب':d('Sign in or create account','Se connecter ou créer un compte','Iniciar sessão ou criar conta'),
  'إعدادات الحساب':d('Account settings','Paramètres du compte','Definições da conta'),
  'تعديل اسم الحساب':d('Edit account name','Modifier le nom du compte','Editar nome da conta'),
  'تغيير كلمة المرور':d('Change password','Changer le mot de passe','Alterar palavra-passe'),
  'إرسال رابط آمن إلى بريدك':d('Send a secure link to your email','Envoyer un lien sécurisé par e-mail','Enviar um link seguro por e-mail'),
  'عرض التنبيهات الأخيرة':d('View recent alerts','Voir les alertes récentes','Ver alertas recentes'),
  'المساعدة':d('Help','Aide','Ajuda'),
  'معلومات استخدام الحساب':d('Account usage information','Informations sur l’utilisation du compte','Informações de utilização da conta'),
  'سياسة الخصوصية':d('Privacy policy','Politique de confidentialité','Política de privacidade'),
  'كيف تُستخدم بيانات الحساب':d('How account data is used','Comment les données du compte sont utilisées','Como os dados da conta são utilizados'),
  'الاسم':d('Name','Nom','Nome'),
  'حفظ التعديل':d('Save changes','Enregistrer','Guardar alterações'),
  'تم حفظ الاسم بنجاح.':d('Name saved successfully.','Nom enregistré avec succès.','Nome guardado com sucesso.'),
  'تعذر حفظ التعديل الآن. حاول مرة أخرى.':d('Could not save changes. Try again.','Impossible d’enregistrer. Réessayez.','Não foi possível guardar. Tente novamente.'),
  'سيتم إرسال رابط آمن لتغيير كلمة المرور إلى بريدك الإلكتروني المسجل.':d('A secure password-change link will be sent to your registered email.','Un lien sécurisé sera envoyé à votre e-mail enregistré.','Será enviado um link seguro para o seu e-mail registado.'),

  'تسجيل دخول المالك فقط':d('Owner sign-in only','Connexion du propriétaire uniquement','Apenas acesso do proprietário'),
  'جارٍ التحقق...':d('Checking...','Vérification...','A verificar...'),
  'هذا الحساب غير مصرح له بالدخول إلى لوحة التحكم.':d('This account is not authorized to access the dashboard.','Ce compte n’est pas autorisé à accéder au tableau de bord.','Esta conta não está autorizada a aceder ao painel.'),
  'أدخل بريدك الإلكتروني أولًا.':d('Enter your email first.','Entrez d’abord votre e-mail.','Introduza primeiro o seu e-mail.'),
  'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.':d('Password reset link sent to your email.','Lien de réinitialisation envoyé à votre e-mail.','Link de redefinição enviado para o seu e-mail.'),
  'تعذر فتح لوحة التحكم':d('Could not open dashboard','Impossible d’ouvrir le tableau de bord','Não foi possível abrir o painel'),
  'حدث خطأ أثناء تحميل الواجهة.':d('An error occurred while loading the interface.','Une erreur est survenue pendant le chargement.','Ocorreu um erro ao carregar a interface.'),
  'تعذر الاتصال بخدمة تسجيل الدخول.':d('Could not connect to sign-in service.','Impossible de se connecter au service d’authentification.','Não foi possível ligar ao serviço de início de sessão.'),
  'تعذر التحقق من جلسة الدخول.':d('Could not verify the sign-in session.','Impossible de vérifier la session.','Não foi possível verificar a sessão.'),
  'إدارة السيارات':d('Car management','Gestion des voitures','Gestão de carros'),
  'مرحبًا بك':d('Welcome','Bienvenue','Bem-vindo'),
  'إجمالي السيارات':d('Total cars','Total des voitures','Total de carros'),
  'المسجلة':d('Registered','Enregistrées','Registados'),
  'المتوفرة':d('Available','Disponibles','Disponíveis'),
  'متاحة الآن':d('Available now','Disponibles maintenant','Disponíveis agora'),
  'الزوار':d('Visitors','Visiteurs','Visitantes'),
  'آخر 30 يومًا':d('Last 30 days','30 derniers jours','Últimos 30 dias'),
  'الاستفسارات':d('Inquiries','Demandes','Consultas'),
  'الجديدة':d('New','Nouvelles','Novas'),
  'إضافة سيارة':d('Add car','Ajouter une voiture','Adicionar carro'),
  'فتح الموقع':d('Open website','Ouvrir le site','Abrir site'),
  'السيارات':d('Cars','Voitures','Carros'),
  'مباعة':d('Sold','Vendue','Vendido'),
  'إرجاع':d('Restore','Rétablir','Restaurar'),
  'لا توجد سيارات بعد.':d('No cars yet.','Aucune voiture pour le moment.','Ainda não há carros.'),
  'لا توجد استفسارات حتى الآن.':d('No inquiries yet.','Aucune demande pour le moment.','Ainda não há consultas.'),
  'لا توجد بيانات زوار بعد':d('No visitor data yet','Aucune donnée visiteur','Ainda não há dados de visitantes'),
  'خروج':d('Sign out','Sortir','Sair'),

  'المستخدمون':d('Users','Utilisateurs','Utilizadores'),
  'إدارة بيانات حسابات MauriOne':d('Manage MauriOne account data','Gérer les comptes MauriOne','Gerir dados das contas MauriOne'),
  'إجمالي المستخدمين':d('Total users','Total utilisateurs','Total de utilizadores'),
  'لديهم رقم هاتف':d('With phone number','Avec téléphone','Com telefone'),
  'بدون رقم هاتف':d('Without phone number','Sans téléphone','Sem telefone'),
  'الحسابات الظاهرة':d('Visible accounts','Comptes affichés','Contas visíveis'),
  'مستخدم':d('User','Utilisateur','Utilizador'),
  'رقم مضاف':d('Phone added','Téléphone ajouté','Telefone adicionado'),
  'بدون رقم':d('No phone','Sans téléphone','Sem telefone'),
  'البريد':d('Email','E-mail','E-mail'),
  'الهاتف':d('Phone','Téléphone','Telefone'),
  'نسخ':d('Copy','Copier','Copiar'),
  'غير مضاف':d('Not added','Non ajouté','Não adicionado'),
  'إنشاء':d('Created','Créé','Criado'),
  'آخر تحديث':d('Last update','Dernière mise à jour','Última atualização'),
  'ابحث بالاسم أو البريد أو رقم الهاتف...':d('Search by name, email or phone...','Rechercher par nom, e-mail ou téléphone...','Pesquisar por nome, e-mail ou telefone...'),

  'إحصائيات الزوار':d('Visitor statistics','Statistiques des visiteurs','Estatísticas de visitantes'),
  'يشمل الزوار والحسابات المسجلة':d('Includes visitors and registered accounts','Inclut les visiteurs et les comptes inscrits','Inclui visitantes e contas registadas'),
  'زوار اليوم':d('Visitors today','Visiteurs aujourd’hui','Visitantes hoje'),
  'آخر 7 أيام':d('Last 7 days','7 derniers jours','Últimos 7 dias'),
  'إجمالي الزوار':d('Total visitors','Total visiteurs','Total de visitantes'),
  'تفاعل العملاء مع السيارات':d('Customer engagement with cars','Interaction des clients avec les voitures','Interação dos clientes com os carros'),
  'إحصائيات فعلية':d('Live statistics','Statistiques réelles','Estatísticas reais'),
  'مشاهدات السيارات':d('Car views','Vues des voitures','Visualizações dos carros'),
  'ضغطات واتساب':d('WhatsApp clicks','Clics WhatsApp','Cliques no WhatsApp'),
  'ضغطات الاتصال':d('Call clicks','Clics d’appel','Cliques de chamada'),
  'إضافات المفضلة':d('Favorite adds','Ajouts aux favoris','Adições aos favoritos'),
  'السيارات الأكثر اهتمامًا':d('Most engaged cars','Voitures les plus consultées','Carros com mais interesse'),
  'درجة الاهتمام':d('Engagement score','Score d’intérêt','Pontuação de interesse'),

  'تعديل السيارة':d('Edit car','Modifier la voiture','Editar carro'),
  'أدخل بيانات السيارة ثم احفظ':d('Enter the car details, then save','Saisissez les informations puis enregistrez','Introduza os dados do carro e guarde'),
  'عدّل البيانات ثم احفظ التغييرات':d('Edit the details, then save changes','Modifiez les informations puis enregistrez','Edite os dados e guarde as alterações'),
  'البيانات الأساسية':d('Basic information','Informations de base','Informações básicas'),
  'رقم السيارة':d('Car reference','Référence voiture','Referência do carro'),
  'الماركة':d('Brand','Marque','Marca'),
  'الموديل':d('Model','Modèle','Modelo'),
  'الفئة':d('Trim','Finition','Versão'),
  'نوع الهيكل':d('Body type','Type de carrosserie','Tipo de carroçaria'),
  'الكيلومترات':d('Mileage','Kilométrage','Quilometragem'),
  'المواصفات':d('Specifications','Caractéristiques','Especificações'),
  'السعر والحالة':d('Price and status','Prix et statut','Preço e estado'),
  'السعر (MRU)':d('Price (MRU)','Prix (MRU)','Preço (MRU)'),
  'الإعلان':d('Listing','Annonce','Anúncio'),
  'إعلان مميز':d('Featured listing','Annonce en vedette','Anúncio em destaque'),
  'بيانات البائع':d('Seller information','Informations du vendeur','Dados do vendedor'),
  'خاصة بالإدارة':d('Admin only','Administration uniquement','Apenas administração'),
  'هذه المعلومات لا تظهر للزبائن ولا تُحفظ داخل بيانات السيارة العامة.':d('This information is private to the admin and is not shown to customers.','Ces informations sont privées et ne sont pas affichées aux clients.','Estas informações são privadas da administração e não aparecem aos clientes.'),
  'اسم البائع':d('Seller name','Nom du vendeur','Nome do vendedor'),
  'رقم هاتف البائع':d('Seller phone','Téléphone du vendeur','Telefone do vendedor'),
  'واتساب البائع':d('Seller WhatsApp','WhatsApp du vendeur','WhatsApp do vendedor'),
  'الوصف':d('Description','Description','Descrição'),
  'اكتب وصف السيارة...':d('Write the car description...','Décrivez la voiture...','Escreva a descrição do carro...'),
  'صور السيارة':d('Car photos','Photos de la voiture','Fotos do carro'),
  'رفع صور السيارة':d('Upload car photos','Importer des photos','Carregar fotos do carro'),
  'لم تُرفع صور بعد.':d('No photos uploaded yet.','Aucune photo importée.','Ainda não foram carregadas fotos.'),
  'اجعلها الرئيسية':d('Set as main','Définir comme principale','Definir como principal'),
  'حذف':d('Delete','Supprimer','Eliminar'),
  'إلغاء':d('Cancel','Annuler','Cancelar'),
  'حفظ السيارة':d('Save car','Enregistrer la voiture','Guardar carro'),
  'حفظ التغييرات':d('Save changes','Enregistrer les modifications','Guardar alterações'),
  'جارٍ حفظ السيارة...':d('Saving car...','Enregistrement de la voiture...','A guardar carro...'),
  'جارٍ حفظ التغييرات...':d('Saving changes...','Enregistrement des modifications...','A guardar alterações...'),
  'خدمة رفع الصور غير مربوطة.':d('Image upload service is not connected.','Le service d’importation d’images n’est pas connecté.','O serviço de carregamento de imagens não está ligado.'),
  'اختر ملفات صور فقط.':d('Select image files only.','Sélectionnez uniquement des images.','Selecione apenas ficheiros de imagem.'),
  'حجم الصورة الواحدة يجب ألا يتجاوز 10MB.':d('Each image must be 10MB or less.','Chaque image doit faire 10 Mo maximum.','Cada imagem deve ter no máximo 10 MB.'),
  'تم رفع الصور.':d('Photos uploaded.','Photos importées.','Fotos carregadas.'),
  'أكمل الماركة والموديل والسنة والكيلومترات.':d('Complete brand, model, year and mileage.','Complétez la marque, le modèle, l’année et le kilométrage.','Preencha marca, modelo, ano e quilometragem.'),
};

const dynamicPatterns=[
  [/^جاري رفع الصورة (\d+) من (\d+)\.\.\.$/,(m,lang)=>lang==='en'?`Uploading photo ${m[1]} of ${m[2]}...`:lang==='fr'?`Importation de la photo ${m[1]} sur ${m[2]}...`:`A carregar foto ${m[1]} de ${m[2]}...`],
  [/^تمت إضافة (.+) إلى المفضلة$/,(m,lang)=>lang==='en'?`${m[1]} added to favorites`:lang==='fr'?`${m[1]} ajouté aux favoris`:`${m[1]} adicionado aos favoritos`],
  [/^تعذر إكمال العملية \((.+)\)\.$/,(m,lang)=>lang==='en'?`Could not complete the operation (${m[1]}).`:lang==='fr'?`Impossible de terminer l’opération (${m[1]}).`:`Não foi possível concluir a operação (${m[1]}).`],
  [/^إنشاء:\s*(.+)$/,(m,lang)=>`${dictionary['إنشاء'][lang]}: ${m[1]}`],
  [/^آخر تحديث:\s*(.+)$/,(m,lang)=>`${dictionary['آخر تحديث'][lang]}: ${m[1]}`],
];

const textState=new WeakMap();
const attrState=new WeakMap();
let observer=null;
let started=false;
let scheduled=false;

function hasArabic(value=''){return /[\u0600-\u06FF]/.test(String(value))}
function currentLanguage(){
  try{
    const saved=localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.includes(saved)?saved:'ar';
  }catch{return'ar'}
}

function translateValue(value,lang){
  if(lang==='ar')return value;
  const trimmed=String(value).trim();
  if(!trimmed)return value;
  const hit=dictionary[trimmed]?.[lang];
  if(hit){
    const lead=String(value).match(/^\s*/)?.[0]||'';
    const tail=String(value).match(/\s*$/)?.[0]||'';
    return `${lead}${hit}${tail}`;
  }
  for(const[regex,fn]of dynamicPatterns){
    const match=trimmed.match(regex);
    if(match){
      const lead=String(value).match(/^\s*/)?.[0]||'';
      const tail=String(value).match(/\s*$/)?.[0]||'';
      return `${lead}${fn(match,lang)}${tail}`;
    }
  }
  return value;
}

function ignored(node){
  const el=node?.nodeType===1?node:node?.parentElement;
  if(!el)return false;
  return Boolean(el.closest('script,style,noscript,code,pre,[data-i18n-ignore="1"]'));
}

function contextual(value,node,lang){
  const trimmed=String(value).trim();
  const parent=node?.parentElement;
  if(trimmed==='الرئيسية'&&parent?.closest('.mxACPPhotoActions')){
    return lang==='en'?'Main':lang==='fr'?'Principale':lang==='pt'?'Principal':value;
  }
  return translateValue(value,lang);
}

function translateTextNode(node,lang){
  if(!node||node.nodeType!==3||ignored(node))return;
  const now=node.nodeValue||'';
  let state=textState.get(node);
  if(!state){state={original:now,last:null};textState.set(node,state)}
  else if(now!==state.last&&hasArabic(now))state.original=now;
  const next=lang==='ar'?state.original:contextual(state.original,node,lang);
  if(now!==next){node.nodeValue=next;state.last=next}else state.last=now;
}

function translateAttribute(el,name,lang){
  if(!el||ignored(el)||!el.hasAttribute(name))return;
  let map=attrState.get(el);if(!map){map={};attrState.set(el,map)}
  const now=el.getAttribute(name)||'';
  let state=map[name];
  if(!state){state={original:now,last:null};map[name]=state}
  else if(now!==state.last&&hasArabic(now))state.original=now;
  const next=lang==='ar'?state.original:translateValue(state.original,lang);
  if(now!==next){el.setAttribute(name,next);state.last=next}else state.last=now;
}

function translateElement(el,lang){
  if(!el||el.nodeType!==1||ignored(el))return;
  if(el.tagName==='OPTION'){
    if(!el.hasAttribute('value')){
      const original=(textState.get(el.firstChild)?.original||el.textContent||'').trim();
      if(original)el.setAttribute('value',original);
    }
  }
  for(const name of['placeholder','aria-label','title'])translateAttribute(el,name,lang);
  for(const child of el.childNodes){
    if(child.nodeType===3)translateTextNode(child,lang);
    else if(child.nodeType===1)translateElement(child,lang);
  }
}

function applyPseudoText(lang){
  let style=document.getElementById('mx-i18n-pseudo');
  if(!style){style=document.createElement('style');style.id='mx-i18n-pseudo';document.head.appendChild(style)}
  if(lang==='ar'){style.textContent='';return}
  const management=dictionary['إدارة السيارات'][lang];
  style.textContent=`.mxAdmin .mxAdminTitle h1::after{content:${JSON.stringify(management)}!important}`;
}

function translateTitle(lang){
  const title=document.title||'';
  if(lang==='ar')return;
  if(title==='لوحة التحكم | MauriOne')document.title=`${dictionary['لوحة التحكم'][lang]} | MauriOne`;
  else if(title==='إضافة سيارة | MauriOne')document.title=`${dictionary['إضافة سيارة'][lang]} | MauriOne`;
  else if(title==='تعديل السيارة | MauriOne')document.title=`${dictionary['تعديل السيارة'][lang]} | MauriOne`;
}

function pickerLabel(lang){return lang==='ar'?'اللغة':lang==='en'?'Language':lang==='fr'?'Langue':'Idioma'}

function ensurePicker(lang){
  const drawer=document.querySelector('.mxDrawer');
  if(!drawer||drawer.querySelector('.mxLanguagePicker'))return;
  const wrap=document.createElement('div');wrap.className='mxLanguagePicker';wrap.dataset.i18nIgnore='1';
  const title=document.createElement('div');title.className='mxLanguagePickerTitle';title.textContent=pickerLabel(lang);wrap.appendChild(title);
  const options=document.createElement('div');options.className='mxLanguagePickerOptions';
  for(const code of SUPPORTED){
    const button=document.createElement('button');button.type='button';button.dataset.lang=code;button.className=code===lang?'active':'';button.textContent=`${languages[code].short} ${languages[code].label}`;
    button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();setLanguage(code)});
    options.appendChild(button);
  }
  wrap.appendChild(options);drawer.appendChild(wrap);
}

function refreshPicker(lang){
  document.querySelectorAll('.mxLanguagePicker').forEach(picker=>{
    const title=picker.querySelector('.mxLanguagePickerTitle');if(title)title.textContent=pickerLabel(lang);
    picker.querySelectorAll('[data-lang]').forEach(btn=>btn.classList.toggle('active',btn.dataset.lang===lang));
  });
}

function ensureStyle(){
  if(document.getElementById('mx-i18n-style'))return;
  const style=document.createElement('style');style.id='mx-i18n-style';style.textContent=`
    .mxLanguagePicker{border-top:1px solid rgba(127,127,127,.16);margin-top:6px;padding:10px 8px 3px;display:grid;gap:8px}
    .mxLanguagePickerTitle{font-size:11px;font-weight:800;color:#8a9098;text-align:right;padding:0 4px}
    .mxLanguagePickerOptions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
    .mxLanguagePickerOptions button{height:36px!important;min-height:36px!important;border:1px solid #e3e6ea!important;border-radius:10px!important;background:#fff!important;color:#31343a!important;font-size:10px!important;font-weight:800!important;padding:0 6px!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:none!important}
    .mxLanguagePickerOptions button.active{border-color:#ffb08b!important;background:#fff5ef!important;color:#e95315!important}
  `;document.head.appendChild(style);
}

function applyLanguage(lang=currentLanguage()){
  document.documentElement.lang=lang;
  document.documentElement.dataset.maurioneLang=lang;
  translateElement(document.body,lang);
  applyPseudoText(lang);
  translateTitle(lang);
  ensurePicker(lang);
  refreshPicker(lang);
}

function scheduleApply(){
  if(scheduled)return;scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;applyLanguage(currentLanguage())});
}

export function setLanguage(lang){
  if(!SUPPORTED.includes(lang))return;
  try{localStorage.setItem(STORAGE_KEY,lang)}catch{}
  applyLanguage(lang);
  window.dispatchEvent(new CustomEvent('maurione:language-change',{detail:{language:lang}}));
}

export function getLanguage(){return currentLanguage()}

export function initI18n(){
  if(started)return;started=true;ensureStyle();applyLanguage(currentLanguage());
  observer=new MutationObserver(mutations=>{
    let needs=false;
    for(const mutation of mutations){
      if(mutation.type==='childList'||mutation.type==='characterData'||mutation.type==='attributes'){needs=true;break}
    }
    if(needs)scheduleApply();
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','aria-label','title']});
  window.addEventListener('popstate',scheduleApply);
}
