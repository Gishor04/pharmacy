import React from 'react';
import { Pill, ShoppingCart, Heart, User, Sun, Eye, ZoomIn, Smile, Phone, Menu, X, Package, Tag, Mail } from 'lucide-react';
import { translations, Language } from '../translations';
import { UserRole } from '../types';

interface HeaderProps {
  currentLang: Language;
  setLang: (lang: Language) => void;
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    elderlyMode: boolean;
  };
  setAccessibility: React.Dispatch<React.SetStateAction<{
    highContrast: boolean;
    largeText: boolean;
    elderlyMode: boolean;
  }>>;
  currentView: string;
  setView: (view: string) => void;
  cartCount: number;
  wishlistCount: number;
  currentUser: { name: string; role: UserRole } | null;
  onLogout: () => void;
  openAuthModal: () => void;
}

export default function Header({
  currentLang,
  setLang,
  accessibility,
  setAccessibility,
  currentView,
  setView,
  cartCount,
  wishlistCount,
  currentUser,
  onLogout,
  openAuthModal
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const t = translations[currentLang];

  const toggleAccessibility = (key: 'highContrast' | 'largeText' | 'elderlyMode') => {
    setAccessibility(prev => {
      const next = { ...prev, [key]: !prev[key] };
      // If elderly mode is activated, auto-increase text size for convenient view
      if (key === 'elderlyMode' && next.elderlyMode) {
        next.largeText = true;
      }
      return next;
    });
  };

  const navLinks = [
    { id: 'home', label: t.navHome },
    { id: 'shop', label: t.navShop },
    { id: 'tele', label: t.navTele },
    { id: 'offers', label: t.navOffers },
    { id: 'track-order', label: t.navTrackOrder },
    { id: 'blog', label: t.navBlog },
    { id: 'contact', label: t.navContact },
  ];

  return (
    <header
      className={`w-full transition-all duration-300 shadow-sm border-b sticky top-0 z-50 ${
        accessibility.highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white text-gray-800 border-gray-100'
      }`}
      role="banner"
    >
      {/* Upper Top Info Bar */}
      <div className={`hidden md:flex justify-between items-center px-6 py-1.5 text-xs ${
        accessibility.highContrast ? 'bg-zinc-900 text-yellow-400 border-b border-yellow-400' : 'bg-[#0F6CBD] text-white'
      }`}>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 font-medium">
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.emergencyContact}: <strong className="underline">+94 (21) 222-2222</strong> (24/7 Ward)</span>
          </span>
          <span>•</span>
          <span>{t.location}: <strong>Jaffna Town Office</strong></span>
        </div>
        <div className="flex items-center space-x-6">
          <span>{t.hours}: <strong>07:30 AM - 10:00 PM</strong></span>
          <div className="flex items-center space-x-2 border-l pl-4 border-white/20" role="group" aria-label="Accessibility options">
            <button 
              onClick={() => toggleAccessibility('highContrast')}
              className={`flex items-center space-x-1 px-1.5 py-0.5 rounded transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 ${
                accessibility.highContrast ? 'bg-yellow-400 text-black font-bold' : 'hover:bg-white/10 text-white'
              }`}
              title={t.contrastMode}
              aria-label={`${t.contrastMode} - ${accessibility.highContrast ? 'Active' : 'Inactive'}`}
              aria-pressed={accessibility.highContrast}
              id="accessibility-contrast-toggle"
            >
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.contrastMode}</span>
            </button>
            <button 
              onClick={() => toggleAccessibility('largeText')}
              className={`flex items-center space-x-1 px-1.5 py-0.5 rounded transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 ${
                accessibility.largeText ? 'bg-white text-[#0F6CBD] font-bold' : 'hover:bg-white/10 text-white'
              }`}
              title={t.textSizeMode}
              aria-label={`${t.textSizeMode} - ${accessibility.largeText ? 'Active' : 'Inactive'}`}
              aria-pressed={accessibility.largeText}
              id="accessibility-zoom-toggle"
            >
              <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.textSizeMode}</span>
            </button>
            <button 
              onClick={() => toggleAccessibility('elderlyMode')}
              className={`flex items-center space-x-1 px-1.5 py-0.5 rounded transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 ${
                accessibility.elderlyMode ? 'bg-[#22A06B] text-white font-bold' : 'hover:bg-white/10 text-white'
              }`}
              title={t.elderlyMode}
              aria-label={`${t.elderlyMode} - ${accessibility.elderlyMode ? 'Active' : 'Inactive'}`}
              aria-pressed={accessibility.elderlyMode}
              id="accessibility-elderly-toggle"
            >
              <Smile className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.elderlyMode}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Brand Logo */}
        <div 
          onClick={() => { setView('home'); setMobileMenuOpen(false); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setView('home'); setMobileMenuOpen(false); } }}
          className="flex items-center space-x-2.5 cursor-pointer select-none group"
          id="brand-logo-container"
          role="link"
          tabIndex={0}
          aria-label="Gishor Pharmacy - Go to homepage"
        >
          <div className={`p-2.5 rounded-xl transition ${
            accessibility.highContrast ? 'bg-yellow-400 text-black' : 'bg-[#F5FAFF] text-[#0F6CBD] group-hover:bg-[#0F6CBD] group-hover:text-white'
          }`}>
            <Pill className="w-6 h-6 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h1 className={`font-bold tracking-tight leading-none ${
              accessibility.largeText ? 'text-2xl' : 'text-xl'
            } ${accessibility.highContrast ? 'text-yellow-400' : 'text-[#0F6CBD]'}`}>
              {t.brandName}
            </h1>
            <span className={`text-[10px] uppercase tracking-widest font-semibold block mt-0.5 ${
              accessibility.highContrast ? 'text-white' : 'text-gray-400'
            }`}>
              Jaffna Licensed Care
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1 font-medium" role="navigation" aria-label="Main navigation">
          {navLinks.map(link => {
            const isActive = currentView === link.id || (link.id === 'home' && currentView.startsWith('dashboard'));
            return (
              <button
                key={link.id}
                onClick={() => setView(link.id)}
                className={`px-3.5 py-2 rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD] ${
                  accessibility.largeText ? 'text-lg' : 'text-sm'
                } ${
                  isActive
                    ? accessibility.highContrast
                      ? 'bg-yellow-400 text-black font-extrabold'
                      : 'bg-[#F5FAFF] text-[#0F6CBD] font-semibold'
                    : accessibility.highContrast
                      ? 'text-white hover:bg-zinc-800'
                      : 'text-gray-600 hover:text-[#0F6CBD] hover:bg-gray-50'
                }`}
                id={`nav-link-${link.id}`}
                aria-label={`Navigate to ${link.label}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Translation and Actions */}
        <div className="flex items-center space-x-3">
          {/* Language Switcher */}
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700" role="group" aria-label="Language selection">
            {(['en', 'ta', 'si'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLang(lang)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F6CBD] ${
                  currentLang === lang
                    ? accessibility.highContrast
                      ? 'bg-yellow-400 text-black'
                      : 'bg-[#0F6CBD] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
                }`}
                id={`lang-switcher-${lang}`}
                aria-label={`Switch language to ${lang === 'en' ? 'English' : lang === 'ta' ? 'Tamil' : 'Sinhala'}`}
                aria-pressed={currentLang === lang}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Cart Icon */}
          <button
            onClick={() => setView('cart')}
            className={`p-2.5 rounded-lg relative transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD] ${
              accessibility.highContrast 
                ? 'border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' 
                : 'text-gray-600 hover:text-[#0F6CBD] hover:bg-[#F5FAFF]'
            }`}
            id="header-cart-button"
            title={t.btnCart}
            aria-label={`${t.btnCart} - ${cartCount} items`}
          >
            <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#DC2626] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-4 h-4 flex items-center justify-center animate-bounce" aria-hidden="true">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account Dashboard Shortcut */}
          {currentUser ? (
            <div className="flex items-center space-x-2 border-l pl-3 border-gray-200 dark:border-zinc-700">
              <button
                onClick={() => {
                  if (currentUser.role === UserRole.CUSTOMER) setView('dashboard-customer');
                  else if (currentUser.role === UserRole.PHARMACIST) setView('dashboard-pharmacist');
                  else if (currentUser.role === UserRole.ADMIN) setView('dashboard-admin');
                }}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD] ${
                  accessibility.highContrast
                    ? 'bg-yellow-400 text-black'
                    : 'bg-[#F3FCF8] text-[#22A06B] hover:bg-[#22A06B] hover:text-white'
                }`}
                id="header-dashboard-button"
                aria-label={`Open ${currentUser.role} dashboard for ${currentUser.name}`}
              >
                <User className="w-4 h-4" aria-hidden="true" />
                <span className={`hidden md:inline ${accessibility.largeText ? 'text-base' : 'text-xs'}`}>
                  {currentUser.role}: {currentUser.name.split(' ')[0]}
                </span>
              </button>
              <button
                onClick={onLogout}
                className="text-xs text-[#DC2626] font-semibold hover:underline hidden md:inline px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
                id="header-logout-button"
                aria-label="Logout from your account"
              >
                {t.btnLogout}
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD] ${
                accessibility.highContrast
                  ? 'bg-white text-black border border-black hover:bg-yellow-400'
                  : 'bg-[#0F6CBD] text-white hover:bg-[#0c599c] shadow-sm'
              }`}
              id="header-login-button"
              aria-label="Login or create an account"
            >
              <User className="w-4 h-4" aria-hidden="true" />
              <span className={accessibility.largeText ? 'text-base' : 'text-sm'}>
                {t.btnLogin}
              </span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD]"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu panel */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className={`lg:hidden px-4 pt-2 pb-6 space-y-3 transition-all ${
            accessibility.highContrast ? 'bg-black text-white border-t border-yellow-400' : 'bg-white border-t border-gray-100'
          }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col space-y-1">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => { setView(link.id); setMobileMenuOpen(false); }}
                className={`text-left px-4 py-2.5 rounded-lg font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD] ${
                  currentView === link.id
                    ? 'bg-[#F5FAFF] text-[#0F6CBD]'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                aria-label={`Navigate to ${link.label}`}
                aria-current={currentView === link.id ? 'page' : undefined}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col space-y-2">
            <div className="flex justify-between items-center px-4">
              <span className="text-xs text-gray-400">Accessibility Features</span>
            </div>
            <div className="grid grid-cols-3 gap-2 px-2" role="group" aria-label="Accessibility toggles">
              <button 
                onClick={() => toggleAccessibility('highContrast')}
                className={`py-2 text-xs font-bold rounded border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD] ${
                  accessibility.highContrast ? 'bg-yellow-400 text-black border-yellow-500' : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
                aria-label={`High contrast mode - ${accessibility.highContrast ? 'Active' : 'Inactive'}`}
                aria-pressed={accessibility.highContrast}
              >
                Contrast
              </button>
              <button 
                onClick={() => toggleAccessibility('largeText')}
                className={`py-2 text-xs font-bold rounded border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD] ${
                  accessibility.largeText ? 'bg-[#0F6CBD] text-white border-[#0c599c]' : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
                aria-label={`Large text mode - ${accessibility.largeText ? 'Active' : 'Inactive'}`}
                aria-pressed={accessibility.largeText}
              >
                Zoom Text
              </button>
              <button 
                onClick={() => toggleAccessibility('elderlyMode')}
                className={`py-2 text-xs font-bold rounded border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F6CBD] ${
                  accessibility.elderlyMode ? 'bg-[#22A06B] text-white border-[#1d8257]' : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}
                aria-label={`Elderly mode - ${accessibility.elderlyMode ? 'Active' : 'Inactive'}`}
                aria-pressed={accessibility.elderlyMode}
              >
                Elderly Mode
              </button>
            </div>
            {currentUser && (
              <button
                onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                className="w-full text-center py-2 text-xs text-[#DC2626] font-bold border border-red-100 bg-red-50 hover:bg-red-100 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#DC2626]"
                aria-label="Logout from your account"
              >
                {t.btnLogout}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
