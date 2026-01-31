import React, { useState, useEffect } from 'react';

// === COMPONENTE MODAL REUTILIZABLE ===
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  loaderText: string;
}

const ModalFrame = ({ isOpen, onClose, title, url, loaderText }: ModalProps) => {
  const [isLoading, setIsLoading] = useState(true);

  // Reset loading state when url or open state changes
  useEffect(() => {
    if (isOpen) setIsLoading(true);
  }, [isOpen, url]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-7xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-scale-in ring-1 ring-white/20">
        
        {/* Header del Modal */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between shadow-sm z-20">
            <div className="flex items-center gap-4">
                {/* Logo pequeño */}
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

        {/* Iframe Container */}
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

  // URLs de configuración
  const URLS = {
    client: "https://customerservice.agentinsure.com/EzlynxCustomerService/fortitudeis/Account/LogIn",
    quote: "https://www.agentinsure.com/compare/auto-insurance-home-insurance/fortitudeis/quote.aspx"
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark' || (!storedTheme && isSystemDark)) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

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

  // Manejo de Modales
  const openModal = (type: 'client' | 'quote') => {
    setIsMenuOpen(false); // Cerrar menú si está abierto
    setActiveModal(type);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setActiveModal(null);
    document.body.style.overflow = '';
  };

  // Textos según idioma
  const t = {
    en: {
      login: 'Log In',
      insuranceHeading: 'Insurance Services',
      auto: 'Auto Insurance',
      property: 'Property Insurance',
      commercial: 'Commercial Insurance',
      companyHeading: 'Company',
      about: 'About Us',
      resources: 'Resources',
      contact: 'Contact Us',
      accountHeading: 'Client Center',
      accountLink: 'Client Portal (ID Cards & Claims)',
      quote: 'Get An Insurance Quote',
      darkMode: 'Dark Mode',
      switchLangText: 'Español',
      switchLink: '/es',
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
      companyHeading: 'Compañía',
      about: 'Nosotros',
      resources: 'Recursos',
      contact: 'Contacto',
      accountHeading: 'Centro de Clientes',
      accountLink: 'Portal de Clientes (Pagos y Reclamos)',
      quote: 'Obtener Cotización',
      darkMode: 'Modo Oscuro',
      switchLangText: 'English',
      switchLink: '/',
      modalClientTitle: 'Centro de Clientes',
      modalQuoteTitle: 'Cotización Rápida',
      loadingClient: 'Conectando al Portal de Clientes...',
      loadingQuote: 'Iniciando Motor de Cotización...'
    }
  }[lang === 'es' ? 'es' : 'en'];

  // Definición de links
  const insuranceLinks = [
    { name: t.auto, href: lang === 'es' ? '/es/auto' : '/auto' },
    { name: t.property, href: lang === 'es' ? '/es/property' : '/property' },
    { name: t.commercial, href: lang === 'es' ? '/es/commercial' : '/commercial' },
  ];

  const companyLinks = [
    { name: t.about, href: lang === 'es' ? '/es/about' : '/about' },
    { name: t.resources, href: lang === 'es' ? '/es/resources' : '/resources' },
    { name: t.contact, href: lang === 'es' ? '/es/contact' : '/contact' },
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
            
            {/* 2. LOGIN SHORTCUT -> MODAL CLIENT */}
            <button 
              onClick={() => openModal('client')}
              className="text-sm font-bold text-text-main dark:text-surface-light hover:text-primary transition-colors flex items-center gap-1 focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <span className="hidden sm:inline">{t.login}</span>
            </button>

            {/* 3. LANGUAGE SELECTOR */}
            <a 
              href={t.switchLink} 
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

      {/* === MODAL RENDER (Shared Logic) === */}
      <ModalFrame 
        isOpen={activeModal !== null}
        onClose={closeModal}
        title={activeModal === 'client' ? t.modalClientTitle : t.modalQuoteTitle}
        url={activeModal === 'client' ? URLS.client : URLS.quote}
        loaderText={activeModal === 'client' ? t.loadingClient : t.loadingQuote}
      />

      {/* DRAWER / SIDE MENU */}
      {/* Overlay del Menú */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Panel Deslizante */}
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-surface-light dark:bg-surface-card z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="flex justify-end p-4 border-b border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-primary transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Drawer Content */}
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col">
          
          {/* SECTION 1: INSURANCE */}
          <div className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {t.insuranceHeading}
          </div>
          {insuranceLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="px-6 py-3 text-lg font-bold text-text-main dark:text-surface-light border-b border-gray-50 dark:border-gray-800 hover:text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              {link.name}
            </a>
          ))}

          {/* SECTION 2: COMPANY */}
          <div className="px-6 py-2 mt-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {t.companyHeading}
          </div>
          {companyLinks.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="px-6 py-3 text-lg font-bold text-text-main dark:text-surface-light border-b border-gray-50 dark:border-gray-800 hover:text-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              {link.name}
            </a>
          ))}

           {/* SECTION 3: CLIENT CENTER -> MODAL CLIENT */}
           <div className="px-6 py-2 mt-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {t.accountHeading}
          </div>
          <button 
            onClick={() => openModal('client')}
            className="w-full text-left px-6 py-3 text-lg font-bold text-primary border-b border-gray-50 dark:border-gray-800 hover:text-primary-hover hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            {t.accountLink}
          </button>

        </nav>

        {/* Drawer Footer */}
        <div className="p-6 bg-gray-50 dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
          
          {/* BOTÓN "GET A QUOTE" -> MODAL QUOTE */}
          <button 
            onClick={() => openModal('quote')}
            className="block w-full bg-primary hover:bg-primary-hover text-text-main font-bold text-center py-4 rounded-md shadow-md text-lg mb-6 transition-colors focus:outline-none"
          >
            {t.quote}
          </button>

          <div className="flex items-center justify-between">
            <span className="font-medium text-text-main dark:text-surface-light">
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