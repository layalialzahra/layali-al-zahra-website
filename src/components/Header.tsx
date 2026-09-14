import React, { useState, useEffect } from 'react';
import logo from 'figma:asset/ccff0a49342c068a5e59474ff43366f8b3e86b65.png';
import { Menu, X, Instagram, Facebook, Phone } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { name: 'Home', id: 'home' },
  { name: 'Services', id: 'services' },
  { name: 'Packages', id: 'packages' },
  { name: 'Offers', id: 'offers' },
  { name: 'Tips', id: 'tips' },
  { name: 'Blog', id: 'blog' },
  { name: 'News', id: 'news' },
  { name: 'Contact', id: 'contact' },
];

const isActive = (currentPage: string, id: string) => currentPage === id || currentPage.startsWith(`${id}:`);

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsMenuOpen(false);
  };

  const bookNow = () => {
    window.open('https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services', '_blank');
    setIsMenuOpen(false);
  };

  const renderLinks = (compact = false) => navItems.map((item) => (
    <button
      key={item.id}
      onClick={() => handleNavClick(item.id)}
      className={`text-white hover:text-amber-300 transition-colors duration-300 px-2.5 ${compact ? 'py-1.5 text-sm' : 'py-2 text-sm lg:text-base'} ${
        isActive(currentPage, item.id) ? 'text-amber-300 border-b-2 border-amber-300' : ''
      }`}
    >
      {item.name}
    </button>
  ));

  return (
    <>
      <header className="bg-[#FFF8F0] shadow-md">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-wrap justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-rose-500" />
                <a href="tel:+971523706025" className="hover:text-rose-600 transition-colors">+971 52 370 6025</a>
              </div>
              <div className="flex items-center gap-3">
                <a href="https://www.instagram.com/alzahrabeauty.dubai/" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
                <a href="https://www.facebook.com/profile.php?id=61582104334753" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-5 md:py-6">
          <div className="flex flex-col items-center justify-center gap-3">
            <img src={logo} alt="Layali Al Zahra Logo" className="h-16 md:h-20 lg:h-24" />
            <h1 className="font-abhaya text-black text-xl md:text-2xl lg:text-4xl tracking-wide text-center">LAYALI AL ZAHRA BEAUTY SALON LLC</h1>
          </div>
        </div>

        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600">
          <div className="container mx-auto px-4">
            <nav className="flex items-center justify-between py-2 md:py-3">
              <div className="hidden lg:flex flex-wrap items-center justify-center gap-1 w-full">
                {renderLinks()}
                <Button onClick={bookNow} className="bg-rose-200 text-rose-900 hover:bg-amber-400 hover:text-white px-5 py-2 ml-2 shadow-sm">Book Now</Button>
              </div>
              <div className="flex lg:hidden items-center justify-between w-full">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-2" aria-label="Toggle menu">{isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
                <span className="text-white text-base uppercase tracking-wide flex-1 text-center">{navItems.find(item => isActive(currentPage, item.id))?.name || 'HOME'}</span>
                <div className="w-10" />
              </div>
            </nav>
            {isMenuOpen && (
              <div className="lg:hidden border-t border-white/15 bg-rose-600 py-3 space-y-1">
                {navItems.map(item => (
                  <button key={item.id} onClick={() => handleNavClick(item.id)} className={`block w-full text-left text-white hover:bg-rose-700 px-4 py-3 transition-colors ${isActive(currentPage, item.id) ? 'bg-rose-700 text-amber-300' : ''}`}>{item.name}</button>
                ))}
                <div className="px-4 pt-2"><Button onClick={bookNow} className="w-full bg-rose-200 text-rose-900 hover:bg-amber-400 hover:text-white shadow-sm">Book Now</Button></div>
              </div>
            )}
          </div>
        </div>
      </header>

      {isScrolled && (
        <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 shadow-lg z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2">
              <div className="hidden lg:flex items-center gap-1 w-full justify-center">{renderLinks(true)}<Button onClick={bookNow} className="bg-rose-200 text-rose-900 hover:bg-amber-400 hover:text-white px-4 py-1 text-sm shadow-sm">Book Now</Button></div>
              <div className="flex lg:hidden items-center justify-between w-full">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-2" aria-label="Toggle menu">{isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
                <span className="text-white uppercase flex-1 text-center text-sm">{navItems.find(item => isActive(currentPage, item.id))?.name || 'HOME'}</span>
                <div className="w-9" />
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
