import React, { useState, useEffect } from 'react';

interface HeaderProps {
  lang: string;
}

export default function Header({ lang }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Sincronizar estado del tema al montar
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

  // Textos según idioma
  const t = {
    en: {
      login: 'Log In',
      insuranceHeading: 'Insurance Services', // CAMBIO REALIZADO
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
      switchLink: '/es'
    },
    es: {
      login: 'Ingresar',
      insuranceHeading: 'Servicios de Seguros', // CAMBIO REALIZADO
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
      switchLink: '/'
    }
  }[lang === 'es' ? 'es' : 'en'];

  // Definición de grupos de navegación para el Drawer
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
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          
          {/* 1. LOGO */}
          <a href={lang === 'es' ? '/es' : '/'} className="flex items-center">
            <img src="/images/fortitude-logo.png" alt="Fortitude Insurance" className="h-10 w-auto object-contain" />
          </a>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* 2. LOGIN SHORTCUT */}
            <a 
              href={lang === 'es' ? '/es/account' : '/account'} 
              className="text-sm font-bold text-text-main dark:text-surface-light hover:text-primary transition-colors flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <span className="hidden sm:inline">{t.login}</span>
            </a>

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

      {/* DRAWER / SIDE MENU */}
      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-in Panel */}
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

           {/* SECTION 3: CLIENT CENTER */}
           <div className="px-6 py-2 mt-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {t.accountHeading}
          </div>
          <a 
            href={lang === 'es' ? '/es/account' : '/account'} 
            className="px-6 py-3 text-lg font-bold text-primary border-b border-gray-50 dark:border-gray-800 hover:text-primary-hover hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            {t.accountLink}
          </a>

        </nav>

        {/* Drawer Footer */}
        <div className="p-6 bg-gray-50 dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
          
          <a 
            href={lang === 'es' ? '/es/quote' : '/quote'} 
            className="block w-full bg-primary hover:bg-primary-hover text-text-main font-bold text-center py-4 rounded-md shadow-md text-lg mb-6 transition-colors"
          >
            {t.quote}
          </a>

          <div className="flex items-center justify-between">
            {/* Solo texto simple sin iconos extra */}
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