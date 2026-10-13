/* SAKAN EUROPE shared language and footer layer. All demo forms remain demo-only. */
(function () {
  "use strict";
  const LANGS = {
    ar: {label:"العربية",dir:"rtl",font:'"IBM Plex Sans Arabic", Amiri, sans-serif'},
    en: {label:"English",dir:"ltr",font:'Arial, sans-serif'},
    de: {label:"Deutsch",dir:"ltr",font:'Arial, sans-serif'},
    fr: {label:"Français",dir:"ltr",font:'Arial, sans-serif'},
    es: {label:"Español",dir:"ltr",font:'Arial, sans-serif'},
    ru: {label:"Русский",dir:"ltr",font:'Arial, sans-serif'}
  };
  const D = {
    "الرئيسية":{en:"Home",de:"Startseite",fr:"Accueil",es:"Inicio"},
    "العقارات":{en:"Properties",de:"Immobilien",fr:"Biens immobiliers",es:"Inmuebles"},
    "للبيع":{en:"For sale",de:"Kaufen",fr:"À vendre",es:"En venta"},
    "للإيجار":{en:"For rent",de:"Mieten",fr:"À louer",es:"En alquiler"},
    "الدول والمدن":{en:"Countries & cities",de:"Länder & Städte",fr:"Pays et villes",es:"Países y ciudades"},
    "من نحن":{en:"About us",de:"Über uns",fr:"À propos",es:"Sobre nosotros"},
    "اتصل بنا":{en:"Contact",de:"Kontakt",fr:"Contact",es:"Contacto"},
    "الأسئلة الشائعة":{en:"FAQ",de:"Häufige Fragen",fr:"FAQ",es:"Preguntas frecuentes"},
    "سياسة الخصوصية":{en:"Privacy policy",de:"Datenschutzerklärung",fr:"Confidentialité",es:"Privacidad"},
    "الشروط والأحكام":{en:"Terms & conditions",de:"AGB",fr:"Conditions générales",es:"Términos y condiciones"},
    "تسجيل الدخول":{en:"Log in",de:"Anmelden",fr:"Connexion",es:"Iniciar sesión"},
    "إنشاء حساب":{en:"Create account",de:"Konto erstellen",fr:"Créer un compte",es:"Crear cuenta"},
    "سكن أوروبا":{en:"SAKAN EUROPE",de:"SAKAN EUROPE",fr:"SAKAN EUROPE",es:"SAKAN EUROPE"},
    "ابحث عن عقارك المثالي":{en:"Find your ideal property",de:"Finden Sie Ihre Wunschimmobilie",fr:"Trouvez le bien idéal",es:"Encuentra tu propiedad ideal"},
    "في أوروبا":{en:"in Europe",de:"in Europa",fr:"en Europe",es:"en Europa"},
    "اكتشف أفضل الشقق والمنازل والاستثمارات العقارية":{en:"Discover apartments, homes and real-estate investments",de:"Entdecken Sie Wohnungen, Häuser und Immobilieninvestitionen",fr:"Découvrez appartements, maisons et investissements immobiliers",es:"Descubre pisos, casas e inversiones inmobiliarias"},
    "الدولة":{en:"Country",de:"Land",fr:"Pays",es:"País"},
    "اختر الدولة":{en:"Choose a country",de:"Land auswählen",fr:"Choisir un pays",es:"Elige un país"},
    "المدينة أو المنطقة":{en:"City or area",de:"Stadt oder Region",fr:"Ville ou région",es:"Ciudad o zona"},
    "اختر المدينة أو المنطقة":{en:"Choose a city or area",de:"Stadt oder Region auswählen",fr:"Choisir une ville ou région",es:"Elige ciudad o zona"},
    "نوع العقار":{en:"Property type",de:"Immobilientyp",fr:"Type de bien",es:"Tipo de inmueble"},
    "أي نوع":{en:"Any type",de:"Alle Typen",fr:"Tous types",es:"Cualquier tipo"},
    "البيع أو الإيجار":{en:"Sale or rent",de:"Kauf oder Miete",fr:"Vente ou location",es:"Venta o alquiler"},
    "البيع والإيجار":{en:"Sale and rent",de:"Kauf und Miete",fr:"Vente et location",es:"Venta y alquiler"},
    "الميزانية القصوى (€)":{en:"Maximum budget (€)",de:"Maximales Budget (€)",fr:"Budget maximum (€)",es:"Presupuesto máximo (€)"},
    "ابحث":{en:"Search",de:"Suchen",fr:"Rechercher",es:"Buscar"},
    "استكشف العقارات في أوروبا":{en:"Explore properties in Europe",de:"Immobilien in Europa entdecken",fr:"Explorez l’immobilier en Europe",es:"Explora inmuebles en Europa"},
    "عقارات موثوقة":{en:"Trusted properties",de:"Vertrauenswürdige Immobilien",fr:"Biens de confiance",es:"Inmuebles fiables"},
    "من وكلاء ومعلنين":{en:"From agents and advertisers",de:"Von Maklern und Anbietern",fr:"D’agents et d’annonceurs",es:"De agentes y anunciantes"},
    "بحث آمن وموثوق":{en:"Safe, reliable search",de:"Sichere, zuverlässige Suche",fr:"Recherche sûre et fiable",es:"Búsqueda segura y fiable"},
    "تجربة بحث سهلة":{en:"An easy search experience",de:"Einfache Suche",fr:"Une recherche facile",es:"Una búsqueda sencilla"},
    "دعم متعدد اللغات":{en:"Multilingual support",de:"Mehrsprachiger Support",fr:"Assistance multilingue",es:"Asistencia multilingüe"},
    "على مدار الساعة":{en:"Around the clock",de:"Rund um die Uhr",fr:"À toute heure",es:"Todo el día"},
    "فرص استثمارية مميزة":{en:"Special investment opportunities",de:"Besondere Anlagechancen",fr:"Opportunités d’investissement",es:"Oportunidades de inversión"},
    "في أفضل الأسواق الأوروبية":{en:"In leading European markets",de:"In Europas Top-Märkten",fr:"Sur les meilleurs marchés européens",es:"En los principales mercados europeos"},
    "تفاصيل العقار ←":{en:"Property details →",de:"Details →",fr:"Détails →",es:"Detalles →"},
    "شقة فاخرة في قلب برلين":{en:"Luxury apartment in central Berlin",de:"Luxuswohnung im Herzen Berlins",fr:"Appartement de luxe au cœur de Berlin",es:"Piso de lujo en el centro de Berlín"},
    "شقة بإطلالة بحرية رائعة":{en:"Apartment with a beautiful sea view",de:"Wohnung mit herrlichem Meerblick",fr:"Appartement avec vue sur mer",es:"Piso con magníficas vistas al mar"},
    "فيلا حديثة مع حديقة خاصة":{en:"Modern villa with a private garden",de:"Moderne Villa mit Privatgarten",fr:"Villa moderne avec jardin privé",es:"Villa moderna con jardín privado"},
    "للبيع":{en:"For sale",de:"Zu verkaufen",fr:"À vendre",es:"En venta"},
    "للإيجار":{en:"For rent",de:"Zu vermieten",fr:"À louer",es:"En alquiler"},
    "برلين - ألمانيا":{en:"Berlin, Germany",de:"Berlin, Deutschland",fr:"Berlin, Allemagne",es:"Berlín, Alemania"},
    "برشلونة - إسبانيا":{en:"Barcelona, Spain",de:"Barcelona, Spanien",fr:"Barcelone, Espagne",es:"Barcelona, España"},
    "أمستردام - هولندا":{en:"Amsterdam, Netherlands",de:"Amsterdam, Niederlande",fr:"Amsterdam, Pays-Bas",es:"Ámsterdam, Países Bajos"},
    "شهر":{en:"month",de:"Monat",fr:"mois",es:"mes"},
    "مرحبًا بعودتك":{en:"Welcome back",de:"Willkommen zurück",fr:"Bon retour",es:"Bienvenido de nuevo"},
    "تسجيل الدخول إلى حساب سكن أوروبا.":{en:"Sign in to your SAKAN EUROPE account.",de:"Melden Sie sich bei Ihrem SAKAN-EUROPE-Konto an.",fr:"Connectez-vous à votre compte SAKAN EUROPE.",es:"Inicia sesión en tu cuenta de SAKAN EUROPE."},
    "البريد الإلكتروني":{en:"Email address",de:"E-Mail-Adresse",fr:"Adresse e-mail",es:"Correo electrónico"},
    "كلمة المرور":{en:"Password",de:"Passwort",fr:"Mot de passe",es:"Contraseña"},
    "ليس لديك حساب؟":{en:"Don't have an account?",de:"Noch kein Konto?",fr:"Pas encore de compte ?",es:"¿No tienes una cuenta?"},
    "أنشئ حسابك في سكن أوروبا":{en:"Create your SAKAN EUROPE account",de:"Erstellen Sie Ihr SAKAN-EUROPE-Konto",fr:"Créez votre compte SAKAN EUROPE",es:"Crea tu cuenta de SAKAN EUROPE"},
    "الاسم الكامل":{en:"Full name",de:"Vollständiger Name",fr:"Nom complet",es:"Nombre completo"},
    "نوع الحساب":{en:"Account type",de:"Kontotyp",fr:"Type de compte",es:"Tipo de cuenta"},
    "متابعة التسجيل":{en:"Continue registration",de:"Registrierung fortsetzen",fr:"Continuer l’inscription",es:"Continuar registro"},
    "اتصل بنا":{en:"Contact us",de:"Kontakt",fr:"Contactez-nous",es:"Contáctanos"},
    "سياسة الخصوصية":{en:"Privacy policy",de:"Datenschutzerklärung",fr:"Politique de confidentialité",es:"Política de privacidad"},
    "الشروط والأحكام":{en:"Terms and conditions",de:"Allgemeine Geschäftsbedingungen",fr:"Conditions générales",es:"Términos y condiciones"},
    "إشعار قانوني":{en:"Legal notice",de:"Impressum",fr:"Mentions légales",es:"Aviso legal"},
    "جميع الحقوق محفوظة لـ Sakan Europe. 2026 ©":{en:"© 2026 SAKAN EUROPE. All rights reserved.",de:"© 2026 SAKAN EUROPE. Alle Rechte vorbehalten.",fr:"© 2026 SAKAN EUROPE. Tous droits réservés.",es:"© 2026 SAKAN EUROPE. Todos los derechos reservados."},
    "© 2026 SAKAN EUROPE — سكن أوروبا":{en:"© 2026 SAKAN EUROPE. All rights reserved.",de:"© 2026 SAKAN EUROPE. Alle Rechte vorbehalten.",fr:"© 2026 SAKAN EUROPE. Tous droits réservés.",es:"© 2026 SAKAN EUROPE. Todos los derechos reservados."},
    "البحث عن العقارات":{en:"Search properties",de:"Immobilien suchen",fr:"Rechercher des biens",es:"Buscar inmuebles"},
    "العودة إلى الرئيسية":{en:"Back to home",de:"Zur Startseite",fr:"Retour à l’accueil",es:"Volver al inicio"},
    "اكتشف العقارات في أوروبا":{en:"Explore properties in Europe",de:"Immobilien in Europa entdecken",fr:"Explorez l’immobilier en Europe",es:"Explora inmuebles en Europa"},
    "الاسم":{en:"Name",de:"Name",fr:"Nom",es:"Nombre"},
    "موضوع الرسالة":{en:"Message subject",de:"Betreff",fr:"Objet du message",es:"Asunto"},
    "الرسالة":{en:"Message",de:"Nachricht",fr:"Message",es:"Mensaje"},
    "مراجعة الرسالة":{en:"Review message",de:"Nachricht prüfen",fr:"Vérifier le message",es:"Revisar mensaje"},
    "سياسة الخصوصية":{en:"Privacy policy",de:"Datenschutzerklärung",fr:"Politique de confidentialité",es:"Política de privacidad"},
    "الشروط والأحكام":{en:"Terms & conditions",de:"AGB",fr:"Conditions générales",es:"Términos y condiciones"},
    "مسودة أولية للمراجعة القانونية":{en:"Initial draft for legal review",de:"Entwurf zur rechtlichen Prüfung",fr:"Projet initial à faire vérifier juridiquement",es:"Borrador inicial para revisión legal"},
    "الإشعار القانوني (Impressum)":{en:"Legal notice (Impressum)",de:"Impressum",fr:"Mentions légales",es:"Aviso legal"},
    "معلومات الجهة المشغّلة":{en:"Operator information",de:"Angaben zum Betreiber",fr:"Informations sur l’exploitant",es:"Información del operador"},
    "ملاحظات مهمة":{en:"Important notes",de:"Wichtige Hinweise",fr:"Remarques importantes",es:"Notas importantes"},
    "هذه صفحة إعداد أولي للمشروع، وليست إشعارًا قانونيًا مكتملًا. يجب استكمال البيانات الصحيحة للجهة التي ستشغّل الموقع قبل نشره للجمهور.":{en:"This is an initial project page, not a complete legal notice. Complete the real operator details before public launch.",de:"Dies ist eine vorbereitete Projektseite und kein vollständiges Impressum. Ergänzen Sie vor dem öffentlichen Start die korrekten Betreiberangaben.",fr:"Cette page est une ébauche et non une mention légale complète. Complétez les informations réelles de l’exploitant avant la mise en ligne publique.",es:"Esta página es un borrador, no un aviso legal completo. Complete los datos reales del operador antes del lanzamiento público."},
    "الاسم القانوني:":{en:"Legal name:",de:"Rechtlicher Name:",fr:"Nom légal :",es:"Nombre legal:"},
    "العنوان البريدي:":{en:"Postal address:",de:"Postanschrift:",fr:"Adresse postale :",es:"Dirección postal:"},
    "الممثل المخوّل:":{en:"Authorized representative:",de:"Vertretungsberechtigte Person:",fr:"Représentant autorisé :",es:"Representante autorizado:"},
    "البريد الإلكتروني للتواصل:":{en:"Contact email:",de:"Kontakt-E-Mail:",fr:"E-mail de contact :",es:"Correo de contacto:"},
    "الموقع/المشروع:":{en:"Website/project:",de:"Website/Projekt:",fr:"Site/projet :",es:"Sitio/proyecto:"},
    "هذه مسودة عامة وليست استشارة قانونية.":{en:"This is a general draft, not legal advice.",de:"Dies ist ein allgemeiner Entwurf und keine Rechtsberatung.",fr:"Il s’agit d’un projet général, pas d’un conseil juridique.",es:"Este es un borrador general, no asesoramiento jurídico."}
  };
  // Expanded, page-specific built-in translations used by the shared language selector.
  Object.assign(D, {
  "باقات راقية لعقاراتك وأعمالك": {
    "en": "Premium plans for your property and business",
    "de": "Exklusive Pakete für Immobilien und Unternehmen",
    "fr": "Des forfaits premium pour vos biens et votre entreprise",
    "es": "Planes premium para su propiedad y negocio"
  },
  "اختر الباقة التي تناسب احتياجك. الأسعار التالية أسعار إطلاق مقترحة لأغراض التخطيط، ويمكن تعديلها قبل نشر الخدمة التجارية. لا يتم خصم أي مبلغ من هذه الصفحة.": {
    "en": "Choose the plan that suits your needs. These are proposed launch prices for planning and may change before commercial launch. This page does not charge any amount.",
    "de": "Wählen Sie das passende Paket. Die folgenden Preise sind unverbindliche Startpreise zur Planung und können vor dem kommerziellen Start geändert werden. Auf dieser Seite wird kein Betrag abgebucht.",
    "fr": "Choisissez le forfait adapté à vos besoins. Ces prix de lancement sont indicatifs et peuvent changer avant le lancement commercial. Aucun paiement n’est prélevé sur cette page.",
    "es": "Elija el plan adecuado. Estos precios de lanzamiento son orientativos y pueden cambiar antes del lanzamiento comercial. Esta página no cobra ningún importe."
  },
  "للأفراد والملاك": {
    "en": "For individuals and property owners",
    "de": "Für Privatpersonen und Eigentümer",
    "fr": "Pour les particuliers et propriétaires",
    "es": "Para particulares y propietarios"
  },
  "الباقة الأساسية": {
    "en": "Basic plan",
    "de": "Basispaket",
    "fr": "Forfait Essentiel",
    "es": "Plan básico"
  },
  "حتى إعلانين عقاريين نشطين": {
    "en": "Up to 2 active property listings",
    "de": "Bis zu 2 aktive Immobilienanzeigen",
    "fr": "Jusqu’à 2 annonces immobilières actives",
    "es": "Hasta 2 anuncios inmobiliarios activos"
  },
  "صفحة عرض قياسية": {
    "en": "Standard listing page",
    "de": "Standard-Anzeigenseite",
    "fr": "Page d’annonce standard",
    "es": "Página de anuncio estándar"
  },
  "إدارة أساسية للإعلانات": {
    "en": "Basic listing management",
    "de": "Einfache Anzeigenverwaltung",
    "fr": "Gestion de base des annonces",
    "es": "Gestión básica de anuncios"
  },
  "دعم عبر البريد الإلكتروني": {
    "en": "Email support",
    "de": "E-Mail-Support",
    "fr": "Assistance par e-mail",
    "es": "Soporte por correo electrónico"
  },
  "اختيار الباقة": {
    "en": "Choose plan",
    "de": "Paket auswählen",
    "fr": "Choisir le forfait",
    "es": "Elegir plan"
  },
  "الأكثر توازنًا": {
    "en": "Best balance",
    "de": "Ausgewogenes Angebot",
    "fr": "Le plus équilibré",
    "es": "La opción más equilibrada"
  },
  "الباقة الاحترافية": {
    "en": "Professional plan",
    "de": "Professional-Paket",
    "fr": "Forfait Professionnel",
    "es": "Plan profesional"
  },
  "حتى 15 إعلانًا نشطًا": {
    "en": "Up to 15 active listings",
    "de": "Bis zu 15 aktive Anzeigen",
    "fr": "Jusqu’à 15 annonces actives",
    "es": "Hasta 15 anuncios activos"
  },
  "تمييز إعلان واحد كل شهر": {
    "en": "One featured listing each month",
    "de": "Eine hervorgehobene Anzeige pro Monat",
    "fr": "Une annonce mise en avant par mois",
    "es": "Un anuncio destacado cada mes"
  },
  "إحصاءات مشاهدات أساسية": {
    "en": "Basic view statistics",
    "de": "Grundlegende Aufrufstatistiken",
    "fr": "Statistiques de consultation de base",
    "es": "Estadísticas básicas de visitas"
  },
  "صفحة تعريف للمالك أو الوكيل": {
    "en": "Profile page for an owner or agent",
    "de": "Profilseite für Eigentümer oder Makler",
    "fr": "Page de profil du propriétaire ou de l’agent",
    "es": "Página de perfil del propietario o agente"
  },
  "للمكاتب العقارية": {
    "en": "For real estate agencies",
    "de": "Für Immobilienbüros",
    "fr": "Pour les agences immobilières",
    "es": "Para agencias inmobiliarias"
  },
  "باقة الأعمال": {
    "en": "Business plan",
    "de": "Business-Paket",
    "fr": "Forfait Entreprise",
    "es": "Plan empresarial"
  },
  "حتى 60 إعلانًا نشطًا": {
    "en": "Up to 60 active listings",
    "de": "Bis zu 60 aktive Anzeigen",
    "fr": "Jusqu’à 60 annonces actives",
    "es": "Hasta 60 anuncios activos"
  },
  "ملف شركة وعلامة تجارية": {
    "en": "Company profile and branding",
    "de": "Firmenprofil und Markenauftritt",
    "fr": "Profil d’entreprise et identité de marque",
    "es": "Perfil de empresa e identidad de marca"
  },
  "إبراز حتى 5 إعلانات": {
    "en": "Feature up to 5 listings",
    "de": "Bis zu 5 Anzeigen hervorheben",
    "fr": "Mettre en avant jusqu’à 5 annonces",
    "es": "Destacar hasta 5 anuncios"
  },
  "تقارير أداء موسّعة": {
    "en": "Extended performance reports",
    "de": "Erweiterte Leistungsberichte",
    "fr": "Rapports de performance détaillés",
    "es": "Informes de rendimiento ampliados"
  },
  "ملاحظة مهمة:": {
    "en": "Important note:",
    "de": "Wichtiger Hinweis:",
    "fr": "Remarque importante :",
    "es": "Nota importante:"
  },
  "هذه باقات مقترحة وليست عروضًا تجارية مفعّلة بعد. الأسعار قبل الضرائب إن وجبت، ويجب تحديد شروط التجديد والإلغاء والاسترداد والضرائب بوضوح قبل تفعيل الدفع.": {
    "en": "These are proposed plans, not active commercial offers. Prices exclude applicable taxes. Renewal, cancellation, refund and tax terms must be clearly defined before payments are enabled.",
    "de": "Dies sind vorgeschlagene Pakete und noch keine aktiven kommerziellen Angebote. Preise verstehen sich gegebenenfalls zuzüglich Steuern. Bedingungen zu Verlängerung, Kündigung, Erstattung und Steuern müssen vor Aktivierung der Zahlung klar festgelegt werden.",
    "fr": "Ces forfaits sont proposés à titre indicatif et ne constituent pas encore des offres commerciales actives. Les taxes applicables peuvent s’ajouter. Les conditions de renouvellement, d’annulation, de remboursement et de fiscalité doivent être précisées avant l’activation des paiements.",
    "es": "Estos planes son propuestas y aún no son ofertas comerciales activas. Los precios no incluyen los impuestos aplicables. Las condiciones de renovación, cancelación, reembolso e impuestos deben definirse claramente antes de habilitar los pagos."
  },
  "مساحات إعلانية للشركات والمطوّرين": {
    "en": "Advertising space for companies and developers",
    "de": "Werbeflächen für Unternehmen und Projektentwickler",
    "fr": "Espaces publicitaires pour entreprises et promoteurs",
    "es": "Espacios publicitarios para empresas y promotores"
  },
  "مساحة مميزة لشركات العقارات والبناء الحديث، المطوّرين، ومشاريع الإسكان والتصميم الداخلي.": {
    "en": "Premium visibility for real estate and modern construction companies, developers, housing projects and interior design.",
    "de": "Exklusive Präsenz für Immobilien- und moderne Bauunternehmen, Projektentwickler, Wohnprojekte und Innenarchitektur.",
    "fr": "Une visibilité privilégiée pour les entreprises immobilières et de construction moderne, les promoteurs, les projets résidentiels et la décoration intérieure.",
    "es": "Visibilidad destacada para empresas inmobiliarias y de construcción moderna, promotores, proyectos residenciales y diseño de interiores."
  },
  "إعلان عقاري مميز": {
    "en": "Featured property listing",
    "de": "Hervorgehobene Immobilienanzeige",
    "fr": "Annonce immobilière à la une",
    "es": "Anuncio inmobiliario destacado"
  },
  "إبراز عقار واحد في نتائج البحث مع شارة مميزة.": {
    "en": "Feature one property in search results with a highlighted badge.",
    "de": "Eine Immobilie mit Hervorhebungskennzeichnung in den Suchergebnissen präsentieren.",
    "fr": "Mettre un bien en avant dans les résultats avec un badge spécial.",
    "es": "Destacar una propiedad en los resultados con una insignia especial."
  },
  "اختيار الإعلان": {
    "en": "Choose advertising",
    "de": "Anzeige auswählen",
    "fr": "Choisir la publicité",
    "es": "Elegir anuncio"
  },
  "إعلان شركة": {
    "en": "Company advertisement",
    "de": "Unternehmensanzeige",
    "fr": "Publicité d’entreprise",
    "es": "Anuncio de empresa"
  },
  "بطاقة شركة تشمل الشعار والنبذة والرابط ووسائل التواصل.": {
    "en": "Company card with logo, description, website and contact details.",
    "de": "Unternehmensprofil mit Logo, Beschreibung, Website und Kontaktdaten.",
    "fr": "Fiche entreprise avec logo, description, site web et coordonnées.",
    "es": "Ficha de empresa con logotipo, descripción, sitio web y datos de contacto."
  },
  "حملة مطوّر عقاري": {
    "en": "Real estate developer campaign",
    "de": "Kampagne für Immobilienentwickler",
    "fr": "Campagne de promoteur immobilier",
    "es": "Campaña de promotor inmobiliario"
  },
  "مساحة بارزة لمشروع بناء حديث أو مجمّع سكني أو مشروع استثماري.": {
    "en": "Prominent placement for a modern construction project, residential complex or investment project.",
    "de": "Prominente Platzierung für ein modernes Bauprojekt, Wohnkomplex oder Anlageprojekt.",
    "fr": "Emplacement privilégié pour un projet de construction moderne, un complexe résidentiel ou un investissement.",
    "es": "Espacio destacado para un proyecto de construcción moderno, complejo residencial o inversión."
  },
  "تُراجع جميع الإعلانات قبل النشر. لا تضمن الباقة بيع العقار أو الحصول على عملاء، ويجب أن تكون الصور وبيانات العقار وحقوق استخدامها صحيحة.": {
    "en": "All ads are reviewed before publication. A plan does not guarantee a sale or leads. Property details, images and usage rights must be accurate.",
    "de": "Alle Anzeigen werden vor der Veröffentlichung geprüft. Ein Paket garantiert weder einen Verkauf noch Kundenkontakte. Immobiliendaten, Bilder und Nutzungsrechte müssen korrekt sein.",
    "fr": "Toutes les annonces sont vérifiées avant publication. Un forfait ne garantit ni vente ni prospects. Les informations, images et droits d’utilisation doivent être exacts.",
    "es": "Todos los anuncios se revisan antes de publicarse. Un plan no garantiza ventas ni clientes potenciales. Los datos, imágenes y derechos de uso deben ser correctos."
  },
  "مساحة راقية لشركتك ومشروعك": {
    "en": "Premium visibility for your company and project",
    "de": "Exklusive Präsenz für Ihr Unternehmen und Projekt",
    "fr": "Une visibilité premium pour votre entreprise et votre projet",
    "es": "Visibilidad premium para su empresa y proyecto"
  },
  "اعرض شركتك العقارية، مشروع البناء الحديث، المجمع السكني أو خدمات التصميم والتطوير أمام المهتمين بالعقارات في أوروبا.": {
    "en": "Present your real estate company, modern construction project, residential complex or design and development services to people interested in European property.",
    "de": "Präsentieren Sie Ihr Immobilienunternehmen, modernes Bauprojekt, Wohnkomplex oder Ihre Design- und Entwicklungsleistungen Menschen, die sich für Immobilien in Europa interessieren.",
    "fr": "Présentez votre agence immobilière, projet de construction moderne, complexe résidentiel ou services de conception et de développement aux personnes intéressées par l’immobilier européen.",
    "es": "Presente su empresa inmobiliaria, proyecto de construcción moderno, complejo residencial o servicios de diseño y desarrollo a personas interesadas en inmuebles europeos."
  },
  "تمييز إعلان عقار واحد.": {
    "en": "Feature one property listing.",
    "de": "Eine Immobilienanzeige hervorheben.",
    "fr": "Mettre en avant une annonce immobilière.",
    "es": "Destacar un anuncio inmobiliario."
  },
  "بطاقة شركة": {
    "en": "Company profile",
    "de": "Unternehmensprofil",
    "fr": "Fiche entreprise",
    "es": "Perfil de empresa"
  },
  "ملف تعريفي وشعار وروابط الشركة.": {
    "en": "Company profile, logo and links.",
    "de": "Unternehmensprofil, Logo und Links.",
    "fr": "Profil, logo et liens de l’entreprise.",
    "es": "Perfil, logotipo y enlaces de la empresa."
  },
  "حملة مشروع تطوير": {
    "en": "Development project campaign",
    "de": "Kampagne für ein Entwicklungsprojekt",
    "fr": "Campagne de projet immobilier",
    "es": "Campaña de proyecto de desarrollo"
  },
  "مساحة بارزة لمشاريع البناء والتطوير الحديثة.": {
    "en": "Prominent placement for modern construction and development projects.",
    "de": "Prominente Platzierung für moderne Bau- und Entwicklungsprojekte.",
    "fr": "Emplacement privilégié pour les projets modernes de construction et de développement.",
    "es": "Espacio destacado para proyectos modernos de construcción y desarrollo."
  },
  "طلب معلومات إعلانية": {
    "en": "Request advertising information",
    "de": "Werbeinformationen anfordern",
    "fr": "Demander des informations publicitaires",
    "es": "Solicitar información publicitaria"
  },
  "اسم الشركة": {
    "en": "Company name",
    "de": "Firmenname",
    "fr": "Nom de l’entreprise",
    "es": "Nombre de la empresa"
  },
  "نوع النشاط": {
    "en": "Business type",
    "de": "Tätigkeitsbereich",
    "fr": "Type d’activité",
    "es": "Tipo de actividad"
  },
  "وكالة عقارية": {
    "en": "Real estate agency",
    "de": "Immobilienagentur",
    "fr": "Agence immobilière",
    "es": "Agencia inmobiliaria"
  },
  "شركة بناء حديث": {
    "en": "Modern construction company",
    "de": "Modernes Bauunternehmen",
    "fr": "Entreprise de construction moderne",
    "es": "Empresa de construcción moderna"
  },
  "مطوّر عقاري": {
    "en": "Property developer",
    "de": "Immobilienentwickler",
    "fr": "Promoteur immobilier",
    "es": "Promotor inmobiliario"
  },
  "تصميم داخلي": {
    "en": "Interior design",
    "de": "Innenarchitektur",
    "fr": "Design d’intérieur",
    "es": "Diseño de interiores"
  },
  "خدمات عقارية أخرى": {
    "en": "Other real estate services",
    "de": "Sonstige Immobiliendienstleistungen",
    "fr": "Autres services immobiliers",
    "es": "Otros servicios inmobiliarios"
  },
  "تفاصيل الطلب": {
    "en": "Request details",
    "de": "Details zur Anfrage",
    "fr": "Détails de la demande",
    "es": "Detalles de la solicitud"
  },
  "مراجعة الطلب": {
    "en": "Review request",
    "de": "Anfrage prüfen",
    "fr": "Vérifier la demande",
    "es": "Revisar solicitud"
  },
  "هذا نموذج واجهة فقط؛ لا يُرسل بيانات إلى الخادم حتى إعداد خدمة البريد.": {
    "en": "This is a frontend-only form; it does not send data to a server until an email service is configured.",
    "de": "Dieses Formular ist nur eine Oberfläche und sendet keine Daten an einen Server, bis ein E-Mail-Dienst eingerichtet ist.",
    "fr": "Ce formulaire est uniquement visuel ; aucune donnée n’est envoyée au serveur tant qu’aucun service e-mail n’est configuré.",
    "es": "Este formulario es solo visual; no envía datos al servidor hasta que se configure un servicio de correo."
  },
  "إتمام الطلب بأمان": {
    "en": "Complete your order securely",
    "de": "Bestellung sicher abschließen",
    "fr": "Finaliser votre commande en toute sécurité",
    "es": "Complete su pedido de forma segura"
  },
  "واجهة الدفع التجريبية — لن يتم تحصيل أي مبلغ في هذه النسخة.": {
    "en": "Demo checkout — no payment will be collected in this version.",
    "de": "Test-Kasse — in dieser Version wird keine Zahlung eingezogen.",
    "fr": "Paiement de démonstration — aucun montant ne sera prélevé dans cette version.",
    "es": "Pago de demostración: no se cobrará ningún importe en esta versión."
  },
  "اشتراك تجريبي": {
    "en": "Demo subscription",
    "de": "Testabonnement",
    "fr": "Abonnement de démonstration",
    "es": "Suscripción de demostración"
  },
  "اختر طريقة الدفع": {
    "en": "Choose a payment method",
    "de": "Zahlungsmethode auswählen",
    "fr": "Choisissez un moyen de paiement",
    "es": "Elija un método de pago"
  },
  "بطاقة بنكية": {
    "en": "Bank card",
    "de": "Bankkarte",
    "fr": "Carte bancaire",
    "es": "Tarjeta bancaria"
  },
  "الدفع عبر حساب PayPal عند التفعيل": {
    "en": "Pay through PayPal when enabled",
    "de": "Zahlung über PayPal nach Aktivierung",
    "fr": "Paiement via PayPal après activation",
    "es": "Pagar con PayPal cuando esté activado"
  },
  "تحويل بنكي": {
    "en": "Bank transfer",
    "de": "Banküberweisung",
    "fr": "Virement bancaire",
    "es": "Transferencia bancaria"
  },
  "متابعة إلى الدفع": {
    "en": "Continue to payment",
    "de": "Weiter zur Zahlung",
    "fr": "Continuer vers le paiement",
    "es": "Continuar al pago"
  },
  "التحويل البنكي غير مفعّل بعد.": {
    "en": "Bank transfer is not enabled yet.",
    "de": "Banküberweisung ist noch nicht aktiviert.",
    "fr": "Le virement bancaire n’est pas encore activé.",
    "es": "La transferencia bancaria aún no está activada."
  },
  "سيتم عرض اسم المستفيد وIBAN ومرجع الدفع هنا بعد إدخال بيانات الحساب البنكي الرسمي والتحقق منها. لا تحول أي مبلغ بناءً على هذه المعاينة.": {
    "en": "The beneficiary name, IBAN and payment reference will appear here after official bank details are entered and verified. Do not transfer money based on this demo.",
    "de": "Name des Empfängers, IBAN und Zahlungsreferenz werden hier angezeigt, sobald die offiziellen Bankdaten eingetragen und geprüft wurden. Überweisen Sie aufgrund dieser Demo kein Geld.",
    "fr": "Le bénéficiaire, l’IBAN et la référence de paiement seront affichés ici après saisie et vérification des coordonnées bancaires officielles. N’effectuez aucun virement sur la base de cette démo.",
    "es": "El beneficiario, IBAN y referencia aparecerán aquí después de introducir y verificar los datos bancarios oficiales. No realice transferencias basándose en esta demostración."
  },
  "Stripe لم يُربط بعد.": {
    "en": "Stripe is not connected yet.",
    "de": "Stripe ist noch nicht verbunden.",
    "fr": "Stripe n’est pas encore connecté.",
    "es": "Stripe aún no está conectado."
  },
  "PayPal لم يُربط بعد.": {
    "en": "PayPal is not connected yet.",
    "de": "PayPal ist noch nicht verbunden.",
    "fr": "PayPal n’est pas encore connecté.",
    "es": "PayPal aún no está conectado."
  },
  "الخصوصية": {
    "en": "Privacy",
    "de": "Datenschutz",
    "fr": "Confidentialité",
    "es": "Privacidad"
  },
  "الشروط": {
    "en": "Terms",
    "de": "AGB",
    "fr": "Conditions",
    "es": "Condiciones"
  },
  "الباقات والأسعار": {
    "en": "Plans & pricing",
    "de": "Pakete & Preise",
    "fr": "Forfaits et tarifs",
    "es": "Planes y precios"
  },
  "إعلانات الشركات": {
    "en": "Business advertising",
    "de": "Unternehmenswerbung",
    "fr": "Publicité des entreprises",
    "es": "Publicidad empresarial"
  },
  "الرئيسية": {
    "en": "Home",
    "de": "Startseite",
    "fr": "Accueil",
    "es": "Inicio"
  },
  "العقارات": {
    "en": "Properties",
    "de": "Immobilien",
    "fr": "Biens immobiliers",
    "es": "Inmuebles"
  },
  "سكن أوروبا": {
    "en": "SAKAN EUROPE",
    "de": "SAKAN EUROPE",
    "fr": "SAKAN EUROPE",
    "es": "SAKAN EUROPE"
  },
  "اتصل بنا": {
    "en": "Contact",
    "de": "Kontakt",
    "fr": "Contact",
    "es": "Contacto"
  },
  "البريد الإلكتروني": {
    "en": "Email address",
    "de": "E-Mail-Adresse",
    "fr": "Adresse e-mail",
    "es": "Correo electrónico"
  },
  "الاسم": {
    "en": "Name",
    "de": "Name",
    "fr": "Nom",
    "es": "Nombre"
  },
  "الرسالة": {
    "en": "Message",
    "de": "Nachricht",
    "fr": "Message",
    "es": "Mensaje"
  },
  "سياسة الخصوصية": {
    "en": "Privacy policy",
    "de": "Datenschutzerklärung",
    "fr": "Politique de confidentialité",
    "es": "Política de privacidad"
  },
  "الشروط والأحكام": {
    "en": "Terms and conditions",
    "de": "Allgemeine Geschäftsbedingungen",
    "fr": "Conditions générales",
    "es": "Términos y condiciones"
  },
  "الإشعار القانوني": {
    "en": "Legal notice",
    "de": "Impressum",
    "fr": "Mentions légales",
    "es": "Aviso legal"
  },
  "جميع الحقوق محفوظة لـ Sakan Europe. 2026 ©": {
    "en": "© 2026 SAKAN EUROPE. All rights reserved.",
    "de": "© 2026 SAKAN EUROPE. Alle Rechte vorbehalten.",
    "fr": "© 2026 SAKAN EUROPE. Tous droits réservés.",
    "es": "© 2026 SAKAN EUROPE. Todos los derechos reservés."
  }
});


  // Russian interface translations for shared navigation and the most-used page content.
  Object.assign(D, {
  "الرئيسية": {ru:"Главная"},
  "العقارات": {ru:"Недвижимость"},
  "للبيع": {ru:"Продажа"},
  "للإيجار": {ru:"Аренда"},
  "الدول والمدن": {ru:"Страны и города"},
  "من نحن": {ru:"О нас"},
  "اتصل بنا": {ru:"Контакты"},
  "الأسئلة الشائعة": {ru:"Часто задаваемые вопросы"},
  "سياسة الخصوصية": {ru:"Политика конфиденциальности"},
  "الشروط والأحكام": {ru:"Условия использования"},
  "تسجيل الدخول": {ru:"Войти"},
  "إنشاء حساب": {ru:"Создать аккаунт"},
  "سكن أوروبا": {ru:"SAKAN EUROPE"},
  "ابحث عن عقارك المثالي": {ru:"Найдите недвижимость своей мечты"},
  "في أوروبا": {ru:"в Европе"},
  "اكتشف أفضل الشقق والمنازل والاستثمارات العقارية": {ru:"Откройте для себя квартиры, дома и инвестиционную недвижимость"},
  "الدولة": {ru:"Страна"},
  "اختر الدولة": {ru:"Выберите страну"},
  "المدينة أو المنطقة": {ru:"Город или район"},
  "اختر المدينة أو المنطقة": {ru:"Выберите город или район"},
  "نوع العقار": {ru:"Тип недвижимости"},
  "أي نوع": {ru:"Любой тип"},
  "البيع أو الإيجار": {ru:"Продажа или аренда"},
  "البيع والإيجار": {ru:"Продажа и аренда"},
  "الميزانية القصوى (€)": {ru:"Максимальный бюджет (€)"},
  "ابحث": {ru:"Поиск"},
  "استكشف العقارات في أوروبا": {ru:"Исследуйте недвижимость в Европе"},
  "عقارات موثوقة": {ru:"Надёжные объекты недвижимости"},
  "من وكلاء ومعلنين": {ru:"От агентств и рекламодателей"},
  "بحث آمن وموثوق": {ru:"Безопасный и надёжный поиск"},
  "تجربة بحث سهلة": {ru:"Удобный поиск"},
  "دعم متعدد اللغات": {ru:"Многоязычная поддержка"},
  "على مدار الساعة": {ru:"Круглосуточно"},
  "فرص استثمارية مميزة": {ru:"Особые инвестиционные возможности"},
  "في أفضل الأسواق الأوروبية": {ru:"На ведущих рынках Европы"},
  "تفاصيل العقار ←": {ru:"Подробнее об объекте →"},
  "شقة فاخرة في قلب برلين": {ru:"Роскошная квартира в центре Берлина"},
  "شقة بإطلالة بحرية رائعة": {ru:"Квартира с прекрасным видом на море"},
  "فيلا حديثة مع حديقة خاصة": {ru:"Современная вилла с частным садом"},
  "برلين - ألمانيا": {ru:"Берлин, Германия"},
  "برشلونة - إسبانيا": {ru:"Барселона, Испания"},
  "أمستردام - هولندا": {ru:"Амстердам, Нидерланды"},
  "شهر": {ru:"месяц"},
  "مرحبًا بعودتك": {ru:"С возвращением"},
  "تسجيل الدخول إلى حساب سكن أوروبا.": {ru:"Войдите в свой аккаунт SAKAN EUROPE."},
  "البريد الإلكتروني": {ru:"Электронная почта"},
  "كلمة المرور": {ru:"Пароль"},
  "ليس لديك حساب؟": {ru:"Нет аккаунта?"},
  "أنشئ حسابك في سكن أوروبا": {ru:"Создайте аккаунт SAKAN EUROPE"},
  "الاسم الكامل": {ru:"Полное имя"},
  "نوع الحساب": {ru:"Тип аккаунта"},
  "متابعة التسجيل": {ru:"Продолжить регистрацию"},
  "العودة إلى الرئيسية": {ru:"На главную"},
  "اكتشف العقارات في أوروبا": {ru:"Откройте для себя недвижимость в Европе"},
  "الاسم": {ru:"Имя"},
  "موضوع الرسالة": {ru:"Тема сообщения"},
  "الرسالة": {ru:"Сообщение"},
  "مراجعة الرسالة": {ru:"Проверить сообщение"},
  "الإشعار القانوني": {ru:"Юридическая информация"},
  "الإشعار القانوني (Impressum)": {ru:"Юридическая информация (Impressum)"},
  "الخصوصية": {ru:"Конфиденциальность"},
  "الشروط": {ru:"Условия"},
  "الباقات والأسعار": {ru:"Тарифы и цены"},
  "إعلانات الشركات": {ru:"Реклама для компаний"},
  "باقات راقية لعقاراتك وأعمالك": {ru:"Премиальные тарифы для вашей недвижимости и бизнеса"},
  "للأفراد والملاك": {ru:"Для частных лиц и владельцев недвижимости"},
  "الباقة الأساسية": {ru:"Базовый тариф"},
  "حتى إعلانين عقاريين نشطين": {ru:"До 2 активных объявлений о недвижимости"},
  "صفحة عرض قياسية": {ru:"Стандартная страница объявления"},
  "إدارة أساسية للإعلانات": {ru:"Основное управление объявлениями"},
  "دعم عبر البريد الإلكتروني": {ru:"Поддержка по электронной почте"},
  "اختيار الباقة": {ru:"Выбрать тариф"},
  "الأكثر توازنًا": {ru:"Оптимальный выбор"},
  "الباقة الاحترافية": {ru:"Профессиональный тариф"},
  "حتى 15 إعلانًا نشطًا": {ru:"До 15 активных объявлений"},
  "تمييز إعلان واحد كل شهر": {ru:"Одно выделенное объявление в месяц"},
  "إحصاءات مشاهدات أساسية": {ru:"Основная статистика просмотров"},
  "صفحة تعريف للمالك أو الوكيل": {ru:"Профиль владельца или агента"},
  "للمكاتب العقارية": {ru:"Для агентств недвижимости"},
  "باقة الأعمال": {ru:"Бизнес-тариф"},
  "حتى 60 إعلانًا نشطًا": {ru:"До 60 активных объявлений"},
  "ملف شركة وعلامة تجارية": {ru:"Профиль компании и фирменный стиль"},
  "إبراز حتى 5 إعلانات": {ru:"Выделение до 5 объявлений"},
  "تقارير أداء موسّعة": {ru:"Расширенные отчёты об эффективности"},
  "ملاحظة مهمة:": {ru:"Важное примечание:"},
  "مسودة أولية للمراجعة القانونية": {ru:"Предварительный вариант для юридической проверки"},
  "معلومات الجهة المشغّلة": {ru:"Информация об операторе"},
  "ملاحظات مهمة": {ru:"Важные замечания"},
  "الاسم القانوني:": {ru:"Юридическое имя:"},
  "العنوان البريدي:": {ru:"Почтовый адрес:"},
  "الممثل المخوّل:": {ru:"Уполномоченный представитель:"},
  "البريد الإلكتروني للتواصل:": {ru:"Контактная электронная почта:"},
  "الموقع/المشروع:": {ru:"Сайт / проект:"},
  "هذه مسودة عامة وليست استشارة قانونية.": {ru:"Это общий проект текста, а не юридическая консультация."},
  "Kontakt": {ru:"Контакты"},
  "معلومات الدفع": {ru:"Платёжная информация"},
  "Stripe لم يُربط بعد.": {ru:"Stripe ещё не подключён."},
  "PayPal لم يُربط بعد.": {ru:"PayPal ещё не подключён."},
  "التحويل البنكي غير مفعّل بعد.": {ru:"Банковский перевод пока не активирован."},
  "متابعة إلى الدفع": {ru:"Перейти к оплате"},
  "اختر الباقة التي تناسب احتياجك. الأسعار التالية أسعار إطلاق مقترحة لأغراض التخطيط، ويمكن تعديلها قبل نشر الخدمة التجارية. لا يتم خصم أي مبلغ من هذه الصفحة.": {ru:"Выберите подходящий тариф. Указанные цены являются предварительными и могут измениться до коммерческого запуска. На этой странице деньги не списываются."},
  "هذه باقات مقترحة وليست عروضًا تجارية مفعّلة بعد. الأسعار قبل الضرائب إن وجبت، ويجب تحديد شروط التجديد والإلغاء والاسترداد والضرائب بوضوح قبل تفعيل الدفع.": {ru:"Это предварительные тарифы, а не действующие коммерческие предложения. До включения оплаты необходимо определить налоги, продление, отмену и возврат средств."}
  });

  const STORE = "sakan-europe-language";
  function currentLang(){try{return localStorage.getItem(STORE)||"ar"}catch(_){return "ar"}}
  function translateText(text, lang) {
    const raw=text; const key=raw.replace(/\s+/g," ").trim();
    if(!key || lang==="ar") return raw;
    const item=D[key]; if(!item || !item[lang]) return raw;
    const leading=(raw.match(/^\s*/)||[""])[0], trailing=(raw.match(/\s*$/)||[""])[0];
    return leading+item[lang]+trailing;
  }
  function installSelector(){
    const old=document.querySelector(".language-switcher");
    if(old) return old;
    const select=document.createElement("select");
    select.className="language-switcher"; select.setAttribute("aria-label","Select language");
    select.style.cssText="min-width:108px;max-width:145px;padding:8px 10px;border:1px solid #e8b34f;border-radius:9px;background:#061e3b;color:#fff;font:inherit;cursor:pointer";
    Object.entries(LANGS).forEach(([code,info])=>{const op=document.createElement("option");op.value=code;op.textContent=info.label;select.appendChild(op)});
    const homeActions=document.querySelector(".header-actions");
    const top=document.querySelector(".top");
    if(homeActions){const legacy=homeActions.querySelector(".lang");if(legacy)legacy.replaceWith(select);else homeActions.prepend(select)}
    else if(top){top.appendChild(select)}
    else document.body.prepend(select);
    select.value=currentLang();
    select.addEventListener("change",()=>{try{localStorage.setItem(STORE,select.value)}catch(_){};applyLanguage(select.value)});
    return select;
  }
  function addFooter(){
    let footer=document.querySelector("footer");
    if(!footer){footer=document.createElement("footer");document.body.appendChild(footer)}
    footer.classList.add("sakan-global-footer");
    /* Keep one footer only: preserve the page's own footer navigation when it exists. */
    if(!footer.querySelector(".sakan-legal-links") && !footer.querySelector(".footer-links") && !footer.querySelector("a[href=\"contact.html\"]") && !footer.querySelector("a[href=\"privacy.html\"]") && !footer.querySelector("a[href=\"terms.html\"]")){
      const nav=document.createElement("nav");nav.className="sakan-legal-links";nav.setAttribute("aria-label","Legal links");
      nav.innerHTML='<a href="contact.html" data-ar="اتصل بنا">اتصل بنا</a><a href="privacy.html" data-ar="سياسة الخصوصية">سياسة الخصوصية</a><a href="terms.html" data-ar="الشروط والأحكام">الشروط والأحكام</a><a href="impressum.html" data-ar="إشعار قانوني">إشعار قانوني</a><a href="pricing.html">الباقات والأسعار</a><a href="advertising.html">إعلانات الشركات</a>';
      footer.appendChild(nav);
    }
    if(!footer.querySelector(".sakan-contact-line") && !footer.querySelector("a[href^=\"mailto:\"]")){
      const line=document.createElement("div");line.className="sakan-contact-line";
      line.innerHTML='Website: SAKAN EUROPE (domain pending) <span aria-hidden="true">·</span> Email: <a href="mailto:info@digital-future.ai">info@digital-future.ai</a>';
      footer.appendChild(line);
    }
    if(!footer.querySelector(".sakan-rights") && !footer.textContent.includes("© 2026")){
      const rights=document.createElement("div");rights.className="sakan-rights";
      rights.textContent="© 2026 SAKAN EUROPE — جميع الحقوق محفوظة. العلامة والتصميم والمحتوى محفوظة الحقوق.";
      footer.appendChild(rights);
    }
  }
  function applyLanguage(lang){
    if(!LANGS[lang]) lang="ar";
    document.documentElement.lang=lang;
    document.documentElement.dir=LANGS[lang].dir;
    document.documentElement.style.setProperty("--sakan-font",LANGS[lang].font);
    const select=document.querySelector(".language-switcher");if(select)select.value=lang;
    document.querySelectorAll("[data-ar]").forEach(el=>{const ar=el.getAttribute("data-ar");el.textContent=(D[ar]&&D[ar][lang])||ar});
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(node=>{if(node.parentElement&&node.parentElement.closest("script,style,select,option,textarea,input,svg"))return;
      if(!node.__sakanOriginal) node.__sakanOriginal=node.nodeValue;
      node.nodeValue=translateText(node.__sakanOriginal,lang);
    });
    document.querySelectorAll("[placeholder]").forEach(el=>{if(!el.dataset.sakanPlaceholder)el.dataset.sakanPlaceholder=el.placeholder;el.placeholder=translateText(el.dataset.sakanPlaceholder,lang)});
    document.querySelectorAll("[aria-label]").forEach(el=>{if(!el.dataset.sakanAria)el.dataset.sakanAria=el.getAttribute("aria-label");el.setAttribute("aria-label",translateText(el.dataset.sakanAria,lang))});
    const title=document.querySelector("title");if(title){if(!title.dataset.sakanTitle)title.dataset.sakanTitle=title.textContent;title.textContent=translateText(title.dataset.sakanTitle,lang)}
    const switcher=document.querySelector(".language-switcher");if(switcher)switcher.value=lang;
  }
  function addStyles(){
    if(document.getElementById("sakan-i18n-style"))return;
    const s=document.createElement("style");s.id="sakan-i18n-style";s.textContent='.language-switcher{font-family:inherit!important}#sakan-legal-modal{display:none;position:fixed;inset:0;z-index:99999;align-items:center;justify-content:center;padding:18px}#sakan-legal-modal.is-open{display:flex}.sakan-modal-shade{position:absolute;inset:0;background:rgba(0,7,18,.82);backdrop-filter:blur(7px)}.sakan-modal-card{position:relative;width:min(920px,96vw);height:min(82vh,760px);background:#04172f;border:2px solid #e8b34f;border-radius:20px;box-shadow:0 24px 80px #000b;padding:48px 12px 12px;overflow:hidden}.sakan-modal-card iframe{width:100%;height:100%;border:1px solid #b88b42;border-radius:11px;background:#03152e}.sakan-modal-close{position:absolute;top:8px;inset-inline-end:10px;width:34px;height:34px;border:1px solid #e8b34f;border-radius:50%;background:#092747;color:#ffda86;font-size:25px;line-height:1;cursor:pointer}.sakan-modal-close:focus-visible{outline:2px solid #ffda86;outline-offset:3px}.sakan-global-footer{border-top:1px solid #e8b34f;padding:18px 5%;text-align:center;color:#d5deec;background:linear-gradient(110deg,#03152c,#061e3b);font-size:13px}.sakan-legal-links{display:flex;gap:10px 18px;justify-content:center;align-items:center;flex-wrap:wrap;margin:8px auto 12px}.sakan-legal-links a{color:#ffda86;text-decoration:none}.sakan-legal-links a:hover{text-decoration:underline}.sakan-contact-line{margin:8px auto;direction:ltr;overflow-wrap:anywhere}.sakan-contact-line a{color:#ffda86}.sakan-rights{margin-top:9px;font-size:12px;line-height:1.8}.language-switcher:focus-visible,.sakan-legal-links a:focus-visible{outline:2px solid #ffda86;outline-offset:3px}@media(max-width:600px){.language-switcher{max-width:100%;width:auto}.sakan-contact-line{font-size:12px}}';
    document.head.appendChild(s);
  }

  function installLegalModal(){
    if(document.getElementById("sakan-legal-modal")) return;
    const shell=document.createElement("div");shell.id="sakan-legal-modal";shell.setAttribute("role","dialog");shell.setAttribute("aria-modal","true");shell.setAttribute("aria-label","Legal information");
    shell.innerHTML='<div class="sakan-modal-shade" data-modal-close="true"></div><section class="sakan-modal-card"><button type="button" class="sakan-modal-close" aria-label="Close legal information" data-modal-close="true">×</button><iframe title="Legal information" loading="lazy"></iframe></section>';
    document.body.appendChild(shell);
    function close(){shell.classList.remove("is-open");shell.querySelector("iframe").src="about:blank";document.body.style.overflow="";}
    shell.querySelectorAll("[data-modal-close]").forEach(b=>b.addEventListener("click",close));
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&shell.classList.contains("is-open"))close()});
    document.addEventListener("click",e=>{
      const a=e.target.closest('a[href="privacy.html"],a[href="terms.html"],a[href="impressum.html"]');
      if(!a)return;
      if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
      e.preventDefault();shell.querySelector("iframe").src=a.getAttribute("href");shell.classList.add("is-open");document.body.style.overflow="hidden";shell.querySelector("button").focus();
    });
  }
  function installAboutModal(){
    if(document.getElementById("sakan-about-modal"))return;
    const shell=document.createElement("div");shell.id="sakan-about-modal";shell.setAttribute("role","dialog");shell.setAttribute("aria-modal","true");
    shell.setAttribute("aria-label","About SAKAN EUROPE");
    shell.innerHTML='<div class="sakan-modal-shade" data-about-close="true"></div><section class="sakan-about-card"><button type="button" class="sakan-modal-close" aria-label="Close" data-about-close="true">×</button><img class="sakan-about-logo" src="sakan-europe-logo.png" alt="SAKAN EUROPE"><div class="sakan-about-kicker">SAKAN EUROPE</div><h2 data-about-title>من نحن</h2><p data-about-copy>تسعى منصة سكن أوروبا إلى أن تكون مساحة موثوقة تجمع المجتمع المدني والشركات والأفراد، وتساعد كل من يبحث عن الاستقرار والسكن الراقي على استكشاف الخيارات العقارية في أوروبا بسهولة ووضوح. نؤمن بأن العثور على منزل مناسب خطوة مهمة نحو بداية مطمئنة، وبأن التواصل الواضح والمعلومات المنظمة يساهمان في بناء علاقات أفضل بين الباحثين عن السكن والملاك والجهات العقارية.</p><p class="sakan-about-signature">SAKAN EUROPE — سكن واستقرار وفرص أفضل</p></section>';
    document.body.appendChild(shell);
    const copy={
      ar:{title:"من نحن",body:"تسعى منصة سكن أوروبا إلى أن تكون مساحة موثوقة تجمع المجتمع المدني والشركات والأفراد، وتساعد كل من يبحث عن الاستقرار والسكن الراقي على استكشاف الخيارات العقارية في أوروبا بسهولة ووضوح. نؤمن بأن العثور على منزل مناسب خطوة مهمة نحو بداية مطمئنة، وبأن التواصل الواضح والمعلومات المنظمة يساهمان في بناء علاقات أفضل بين الباحثين عن السكن والملاك والجهات العقارية.",sign:"SAKAN EUROPE — سكن واستقرار وفرص أفضل"},
      en:{title:"About us",body:"SAKAN EUROPE aims to be a trusted space serving communities, businesses and individuals. We help people seeking stability and quality housing explore real-estate options across Europe with greater clarity and ease. We believe finding the right home is an important step toward a secure new beginning, and that clear information and respectful communication help connect home seekers, owners and property professionals.",sign:"SAKAN EUROPE — Home, stability and better opportunities"},
      de:{title:"Über uns",body:"SAKAN EUROPE möchte ein verlässlicher Anlaufpunkt für die Zivilgesellschaft, Unternehmen und Privatpersonen sein. Wir unterstützen Menschen, die Stabilität und hochwertiges Wohnen suchen, dabei, Immobilienangebote in Europa übersichtlich und unkompliziert zu entdecken. Wir sind überzeugt, dass ein passendes Zuhause ein wichtiger Schritt in einen sicheren neuen Lebensabschnitt ist und klare Informationen den Austausch zwischen Wohnungssuchenden, Eigentümern und Immobilienprofis fördern.",sign:"SAKAN EUROPE — Zuhause, Stabilität und neue Chancen"},
      fr:{title:"À propos",body:"SAKAN EUROPE souhaite être un espace de confiance au service de la société civile, des entreprises et des particuliers. Nous aidons celles et ceux qui recherchent la stabilité et un logement de qualité à découvrir plus facilement les possibilités immobilières en Europe. Nous pensons qu’un logement adapté est une étape importante vers un nouveau départ serein et que des informations claires favorisent les échanges entre candidats au logement, propriétaires et professionnels de l’immobilier.",sign:"SAKAN EUROPE — Logement, stabilité et nouvelles possibilités"},
      es:{title:"Quiénes somos",body:"SAKAN EUROPE quiere ser un espacio de confianza al servicio de la sociedad civil, las empresas y los particulares. Ayudamos a quienes buscan estabilidad y una vivienda de calidad a explorar opciones inmobiliarias en Europa de forma clara y sencilla. Creemos que encontrar un hogar adecuado es un paso importante hacia un nuevo comienzo seguro y que la información clara favorece la relación entre quienes buscan vivienda, propietarios y profesionales inmobiliarios.",sign:"SAKAN EUROPE — Hogar, estabilidad y nuevas oportunidades"},
      ru:{title:"О нас",body:"SAKAN EUROPE стремится стать надёжной платформой для гражданского общества, компаний и частных лиц. Мы помогаем тем, кто ищет стабильность и качественное жильё, удобно и понятно знакомиться с предложениями недвижимости по всей Европе. Мы верим, что подходящий дом — важный шаг к спокойному и уверенному будущему, а открытая информация и уважительное общение помогают объединять людей, ищущих жильё, владельцев и специалистов рынка недвижимости.",sign:"SAKAN EUROPE — Дом, стабильность и новые возможности"}
    };
    function render(){const lang=currentLang();const t=copy[lang]||copy.ar;shell.querySelector("[data-about-title]").textContent=t.title;shell.querySelector("[data-about-copy]").textContent=t.body;shell.querySelector(".sakan-about-signature").textContent=t.sign;shell.querySelector(".sakan-modal-close").setAttribute("aria-label",lang==="ru"?"Закрыть":lang==="de"?"Schließen":lang==="fr"?"Fermer":lang==="es"?"Cerrar":"إغلاق");}
    function close(){shell.classList.remove("is-open");document.body.style.overflow="";}
    shell.querySelectorAll("[data-about-close]").forEach(b=>b.addEventListener("click",close));
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&shell.classList.contains("is-open"))close()});
    document.addEventListener("click",e=>{const a=e.target.closest('a[href="#about"]');if(!a)return;e.preventDefault();render();shell.classList.add("is-open");document.body.style.overflow="hidden";shell.querySelector("button").focus();});
    const s=document.createElement("style");s.textContent='#sakan-about-modal{display:none;position:fixed;inset:0;z-index:100000;align-items:center;justify-content:center;padding:18px}#sakan-about-modal.is-open{display:flex}.sakan-about-card{position:relative;width:min(700px,95vw);max-height:86vh;overflow:auto;padding:42px clamp(22px,5vw,48px) 32px;text-align:center;color:#f7f9ff;background:radial-gradient(ellipse at top,#10365c 0,#061b35 60%,#03152e 100%);border:2px solid #e8b34f;border-radius:24px;box-shadow:0 25px 90px #000c,0 0 0 5px #e8b34f20}.sakan-about-logo{width:88px;height:88px;object-fit:cover;border-radius:50%;border:2px solid #e8b34f;box-shadow:0 0 18px #e8b34f66}.sakan-about-kicker{margin:13px 0 4px;color:#ffda86;letter-spacing:3px;font:700 13px Arial,sans-serif;direction:ltr}.sakan-about-card h2{margin:8px 0 15px;color:#ffda86;font:700 32px Georgia,serif}.sakan-about-card p{font:18px/2.05 Georgia,serif;text-align:start;margin:0 0 14px}.sakan-about-card .sakan-about-signature{font:600 14px/1.8 Arial,sans-serif;text-align:center;color:#ffda86;margin:18px 0 0}.sakan-about-card .sakan-modal-close{position:absolute;top:12px;inset-inline-end:12px}@media(max-width:480px){.sakan-about-card{padding:42px 19px 24px}.sakan-about-card h2{font-size:27px}.sakan-about-card p{font-size:16px;line-height:1.9}.sakan-about-logo{width:72px;height:72px}}';document.head.appendChild(s);
  }
  function start(){addStyles();addFooter();installLegalModal();installAboutModal();const select=installSelector();applyLanguage(currentLang());if(select)select.value=currentLang()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();