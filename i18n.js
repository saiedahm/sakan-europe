/* SAKAN EUROPE shared language and footer layer. All demo forms remain demo-only. */
(function () {
  "use strict";
  const LANGS = {
    ar: {label:"العربية",dir:"rtl",font:'"IBM Plex Sans Arabic", Amiri, sans-serif'},
    en: {label:"English",dir:"ltr",font:'Arial, sans-serif'},
    de: {label:"Deutsch",dir:"ltr",font:'Arial, sans-serif'},
    fr: {label:"Français",dir:"ltr",font:'Arial, sans-serif'},
    es: {label:"Español",dir:"ltr",font:'Arial, sans-serif'}
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
    if(!footer.querySelector(".sakan-legal-links")){
      const nav=document.createElement("nav");nav.className="sakan-legal-links";nav.setAttribute("aria-label","Legal links");
      nav.innerHTML='<a href="contact.html" data-ar="اتصل بنا">اتصل بنا</a><a href="privacy.html" data-ar="سياسة الخصوصية">سياسة الخصوصية</a><a href="terms.html" data-ar="الشروط والأحكام">الشروط والأحكام</a><a href="impressum.html" data-ar="إشعار قانوني">إشعار قانوني</a>';
      footer.appendChild(nav);
    }
    if(!footer.querySelector(".sakan-contact-line")){
      const line=document.createElement("div");line.className="sakan-contact-line";
      line.innerHTML='Website: SAKAN EUROPE (domain pending) <span aria-hidden="true">·</span> Email: <a href="mailto:info@digital-future.ai">info@digital-future.ai</a>';
      footer.appendChild(line);
    }
    if(!footer.querySelector(".sakan-rights")){
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
    const s=document.createElement("style");s.id="sakan-i18n-style";s.textContent='.language-switcher{font-family:inherit!important}.sakan-global-footer{border-top:1px solid #e8b34f;padding:18px 5%;text-align:center;color:#d5deec;background:linear-gradient(110deg,#03152c,#061e3b);font-size:13px}.sakan-legal-links{display:flex;gap:10px 18px;justify-content:center;align-items:center;flex-wrap:wrap;margin:8px auto 12px}.sakan-legal-links a{color:#ffda86;text-decoration:none}.sakan-legal-links a:hover{text-decoration:underline}.sakan-contact-line{margin:8px auto;direction:ltr;overflow-wrap:anywhere}.sakan-contact-line a{color:#ffda86}.sakan-rights{margin-top:9px;font-size:12px;line-height:1.8}.language-switcher:focus-visible,.sakan-legal-links a:focus-visible{outline:2px solid #ffda86;outline-offset:3px}@media(max-width:600px){.language-switcher{max-width:100%;width:auto}.sakan-contact-line{font-size:12px}}';
    document.head.appendChild(s);
  }
  function start(){addStyles();addFooter();const select=installSelector();applyLanguage(currentLang());if(select)select.value=currentLang()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
})();