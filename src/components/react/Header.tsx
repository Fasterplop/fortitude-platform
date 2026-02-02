import React, { useState, useEffect } from 'react';

// === COMPONENTE MODAL REUTILIZABLE (Sin cambios) ===
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  loaderText: string;
}

const ModalFrame = ({ isOpen, onClose, title, url, loaderText }: ModalProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) setIsLoading(true);
  }, [isOpen, url]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" aria-modal="true" role="dialog">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white w-full max-w-7xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-in ring-1 ring-white/20">
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shadow-sm z-20">
            <div className="flex items-center gap-4">
                <img src="/images/fortitude-logo.png" alt="Fortitude Insurance" className="h-8 w-auto object-contain" />
                <div className="hidden sm:block border-l border-gray-300 pl-4 ml-1">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{title}</h3>
                </div>
            </div>
            <button 
              onClick={onClose} 
              className="group p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-500"
              aria-label="Cerrar"
            >
                <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        <div className="flex-1 bg-gray-50 relative w-full h-full flex items-center justify-center overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                 <div className="relative w-12 h-12 mb-4">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                 </div>
                 <p className="text-gray-500 font-medium text-sm animate-pulse">{loaderText}</p>
              </div>
            )}
            
            <iframe 
              src={url}
              className="w-full h-full border-0"
              title={title}
              onLoad={() => setIsLoading(false)}
            >
              <p>Your browser is unable to display frames. Please <a href={url} target="_blank" rel="noreferrer" className="text-primary underline">click here</a> to visit the portal.</p>
            </iframe>
        </div>
      </div>
    </div>
  );
};

// === COMPONENTE PRINCIPAL HEADER ===
interface HeaderProps {
  lang: string;
}

export default function Header({ lang }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'client' | 'quote' | null>(null);
  const [isDark, setIsDark] = useState(false);
  // Estado para la URL del cambio de idioma. Valor inicial seguro para SSR.
  const [switchUrl, setSwitchUrl] = useState(lang === 'es' ? '/' : '/es');

  const URLS = {
    client: "https://customerservice.agentinsure.com/EzlynxCustomerService/fortitudeis/Account/LogIn",
    quote: "https://www.agentinsure.com/compare/auto-insurance-home-insurance/fortitudeis/quote.aspx"
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Lógica del tema oscuro
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark' || (!storedTheme && isSystemDark)) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      }

      // 2. Lógica de Mapeo de Rutas para cambio de idioma
      const currentPath = window.location.pathname.replace(/\/$/, ""); // Normalizar quitando slash final
      
      // Mapa bidireccional de rutas basado en tus archivos
      const routeMap = [
        { en: '', es: '/es' }, // Home (sin slash final por la normalización)
        { en: '/', es: '/es' }, // Home explicito
        { en: '/auto', es: '/es/auto' },
        { en: '/property', es: '/es/propiedad' },
        { en: '/commercial', es: '/es/comercial' },
        { en: '/additional-insurance', es: '/es/servicios-adicionales' },
        { en: '/about', es: '/es/nosotros' },
        { en: '/resources', es: '/es/recursos' },
        { en: '/contact', es: '/es/contacto' },
        { en: '/privacy', es: '/es/privacidad' },
        { en: '/terms', es: '/es/terminos' },
        { en: '/accessibility', es: '/es/accesibilidad' }
      ];

      const match = routeMap.find(r => r.en === currentPath || r.es === currentPath);
      
      if (match) {
        // Si encontramos la ruta en el mapa, devolvemos la opuesta
        setSwitchUrl(lang === 'es' ? (match.en || '/') : match.es);
      } else {
        // Fallback genérico: intentar reemplazar prefijos si no está en el mapa
        if (lang === 'es') {
             setSwitchUrl(currentPath.replace('/es', '') || '/');
        } else {
             setSwitchUrl(`/es${currentPath}`);
        }
      }
    }
  }, [lang]); // Se ejecuta al montar y si cambia el idioma

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const openModal = (type: 'client' | 'quote') => {
    setIsMenuOpen(false);
    setActiveModal(type);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setActiveModal(null);
    document.body.style.overflow = '';
  };

  const t = {
    en: {
      login: 'Log In',
      insuranceHeading: 'Insurance Services',
      auto: 'Auto Insurance',
      property: 'Property Insurance',
      commercial: 'Commercial Insurance',
      additional: 'Additional Insurance',
      companyHeading: 'Company',
      about: 'About Us',
      resources: 'Resources',
      contact: 'Contact Us',
      accountHeading: 'Client Center',
      accountLink: 'Client Portal (ID Cards & Claims)',
      quote: 'Get An Insurance Quote',
      darkMode: 'Dark Mode',
      switchLangText: 'Español',
      // switchLink eliminado de aquí, usamos el estado switchUrl
      modalClientTitle: 'Client Center',
      modalQuoteTitle: 'Fast Quote',
      loadingClient: 'Connecting to Client Portal...',
      loadingQuote: 'Starting Quoting Engine...'
    },
    es: {
      login: 'Ingresar',
      insuranceHeading: 'Servicios de Seguros',
      auto: 'Seguro de Auto',
      property: 'Seguro de Propiedad',
      commercial: 'Seguro Comercial',
      additional: 'Servicios Adicionales',
      companyHeading: 'Compañía',
      about: 'Nosotros',
      resources: 'Recursos',
      contact: 'Contacto',
      accountHeading: 'Centro de Clientes',
      accountLink: 'Portal de Clientes (Pagos y Reclamos)',
      quote: 'Obtener Cotización',
      darkMode: 'Modo Oscuro',
      switchLangText: 'English',
      // switchLink eliminado de aquí, usamos el estado switchUrl
      modalClientTitle: 'Centro de Clientes',
      modalQuoteTitle: 'Cotización Rápida',
      loadingClient: 'Conectando al Portal de Clientes...',
      loadingQuote: 'Iniciando Motor de Cotización...'
    }
  }[lang === 'es' ? 'es' : 'en'];

  // === ICON DEFINITIONS ===
  const icons = {
    auto: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
    ),
    property: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    ),
    commercial: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    ),
    additional: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    ),
    about: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    resources: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
    contact: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
    ),
  };

  const insuranceLinks = [
    { name: t.auto, href: lang === 'es' ? '/es/auto' : '/auto', icon: icons.auto },
    { name: t.property, href: lang === 'es' ? '/es/propiedad' : '/property', icon: icons.property },
    { name: t.commercial, href: lang === 'es' ? '/es/comercial' : '/commercial', icon: icons.commercial },
    { name: t.additional, href: lang === 'es' ? '/es/servicios-adicionales' : '/additional-insurance', icon: icons.additional },
  ];

  const companyLinks = [
    { name: t.about, href: lang === 'es' ? '/es/nosotros' : '/about', icon: icons.about },
    { name: t.resources, href: lang === 'es' ? '/es/recursos' : '/resources', icon: icons.resources },
    { name: t.contact, href: lang === 'es' ? '/es/contacto' : '/contact', icon: icons.contact },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 h-24 md:h-28 flex items-center justify-between"> 
          
          {/* 1. LOGO */}
          <a href={lang === 'es' ? '/es' : '/'} className="flex items-center">
            <img 
              src="/images/fortitude-logo.png" 
              alt="Fortitude Insurance" 
              className="h-16 md:h-24 w-auto object-contain transition-all duration-300" 
            />
          </a>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* 2. LOGIN SHORTCUT */}
            <button 
              onClick={() => openModal('client')}
              className="text-sm font-bold text-text-main dark:text-surface-light hover:text-primary transition-colors flex items-center gap-2 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <span className="hidden sm:inline">{t.login}</span>
            </button>

            {/* 3. LANGUAGE SELECTOR */}
            <a 
              href={switchUrl} 
              className="text-sm font-bold text-text-main dark:text-surface-light hover:text-primary transition-colors flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="hidden sm:inline">{t.switchLangText}</span>
              <span className="sm:hidden">{t.switchLangText.substring(0, 2).toUpperCase()}</span>
            </a>

            {/* 4. HAMBURGER MENU BUTTON */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -mr-2 text-text-main dark:text-surface-light hover:text-primary transition-colors focus:outline-none"
              aria-label="Open Menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* ... RESTO DEL CÓDIGO (ModalFrame, Menú lateral, etc) se mantiene igual ... */}
      <ModalFrame 
        isOpen={activeModal !== null}
        onClose={closeModal}
        title={activeModal === 'client' ? t.modalClientTitle : t.modalQuoteTitle}
        url={activeModal === 'client' ? URLS.client : URLS.quote}
        loaderText={activeModal === 'client' ? t.loadingClient : t.loadingQuote}
      />

      {/* DRAWER / SIDE MENU */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Panel Deslizante */}
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-xs md:max-w-sm bg-surface-light dark:bg-surface-card z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="flex justify-end p-3 md:p-4 border-b border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-1 md:p-2 text-gray-500 hover:text-primary transition-colors"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Drawer Content */}
        <nav className="flex-1 overflow-y-auto py-2 md:py-4 flex flex-col">
          
          {/* SECTION 1: INSURANCE */}
          <div className="px-5 md:px-6 py-1 md:py-2 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
            {t.insuranceHeading}
          </div>
          {insuranceLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="group px-5 md:px-6 py-2 md:py-3 text-sm md:text-lg font-semibold md:font-bold text-text-main dark:text-surface-light border-b border-gray-50 dark:border-gray-800 hover:text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
            >
              <span className="text-gray-400 group-hover:text-primary transition-colors">
                {link.icon}
              </span>
              {link.name}
            </a>
          ))}

          {/* SECTION 2: COMPANY */}
          <div className="px-5 md:px-6 py-1 md:py-2 mt-4 md:mt-6 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
            {t.companyHeading}
          </div>
          {companyLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="group px-5 md:px-6 py-2 md:py-3 text-sm md:text-lg font-semibold md:font-bold text-text-main dark:text-surface-light border-b border-gray-50 dark:border-gray-800 hover:text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
            >
              <span className="text-gray-400 group-hover:text-primary transition-colors">
                {link.icon}
              </span>
              {link.name}
            </a>
          ))}

           {/* SECTION 3: CLIENT CENTER */}
           <div className="px-5 md:px-6 py-1 md:py-2 mt-4 md:mt-6 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">
            {t.accountHeading}
          </div>
          <button 
            onClick={() => openModal('client')}
            className="w-full text-left px-5 md:px-6 py-2 md:py-3 text-sm md:text-lg font-bold text-primary border-b border-gray-50 dark:border-gray-800 hover:text-primary-hover hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3 focus:outline-none"
          >
            <span className="text-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </span>
            <span className="leading-tight">{t.accountLink}</span>
          </button>

        </nav>

        {/* Drawer Footer */}
        <div className="p-4 md:p-6 bg-gray-50 dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
          
          {/* BOTÓN "GET A QUOTE" */}
          <button 
            onClick={() => openModal('quote')}
            className="block w-full bg-primary hover:bg-primary-hover text-text-main font-bold text-center py-3 md:py-4 rounded-md shadow-md text-sm md:text-lg mb-3 md:mb-6 transition-colors focus:outline-none tracking-wide"
          >
            {t.quote}
          </button>

          <div className="flex items-center justify-between">
            <span className="font-medium text-sm md:text-base text-text-main dark:text-surface-light">
              {t.darkMode}
            </span>
            
            <button 
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isDark ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}