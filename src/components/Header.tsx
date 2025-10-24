import React, { useState, useEffect } from 'react';
import logo from 'figma:asset/ccff0a49342c068a5e59474ff43366f8b3e86b65.png';
import { Phone, Menu, X, Instagram, Facebook } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'Offers', id: 'offers' },
    { name: 'Tips', id: 'tips' },
    { name: 'Contact', id: 'contact' },
    { name: 'Terms & Conditions', id: 'terms' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-[#FFF8F0] shadow-md">
      {/* Top Bar - Contact Info */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-wrap justify-between items-center text-sm">
            {/* Phone Numbers */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-rose-500" />
                <a href="tel:+971523706025" className="hover:text-rose-600 transition-colors">
                  +971 52 370 6025
                </a>
                <span className="text-gray-400">|</span>
                <a href="tel:+971506143199" className="hover:text-rose-600 transition-colors">
                  +971 50 614 3199
                </a>
              </div>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/alzahrabeauty.dubai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-500 hover:text-rose-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61582104334753"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-500 hover:text-rose-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Logo & Business Name */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <img src={logo} alt="Layali Al Zahra Logo" className="h-20 md:h-24" />
          <h1 className="font-abhaya text-black text-2xl md:text-3xl lg:text-4xl tracking-wide text-center">
            LAYALI AL ZAHRA BEAUTY SALON LLC
          </h1>
        </div>
      </div>

      {/* Bottom Section - Navigation */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between py-2 md:py-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-wrap items-center justify-center gap-2 md:gap-6 w-full">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-white hover:text-amber-300 transition-colors duration-300 px-4 py-2 ${
                    currentPage === item.id ? 'text-amber-300 border-b-2 border-amber-300' : ''
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <Button
                onClick={() =>
                  window.open(
                    'https://www.fresha.com/book-now/layali-al-zahra-ladies-saloon-ng425ap1/all-offer?share=true&pId=2674340',
                    '_blank'
                  )
                }
                className="bg-rose-200 text-rose-900 hover:bg-amber-400 hover:text-white px-6 py-2 ml-4 shadow-sm"
              >
                Book Now
              </Button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden items-center justify-between w-full">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <span className="text-white text-lg uppercase flex-1 text-center">
                {navItems.find(item => item.id === currentPage)?.name.toUpperCase() || 'HOME'}
              </span>
              <div className="w-10"></div>
            </div>
          </nav>

          {/* Mobile Dropdown Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-rose-600 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left text-white hover:bg-rose-700 px-4 py-3 transition-colors ${
                    currentPage === item.id ? 'bg-rose-700 text-amber-300' : ''
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <div className="px-4 pt-2">
                <Button
                  onClick={() => {
                    window.open(
                      'https://www.fresha.com/book-now/layali-al-zahra-ladies-saloon-ng425ap1/all-offer?share=true&pId=2674340',
                      '_blank'
                    );
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-rose-200 text-rose-900 hover:bg-amber-400 hover:text-white shadow-sm"
                >
                  Book Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Sticky Navigation Bar - Shows on scroll */}
    {isScrolled && (
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 shadow-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            {/* Desktop Sticky Nav */}
            <div className="hidden md:flex items-center gap-4 w-full justify-center">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-white hover:text-amber-300 transition-colors duration-300 px-3 py-2 text-sm ${
                    currentPage === item.id ? 'text-amber-300 border-b-2 border-amber-300' : ''
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <Button
                onClick={() =>
                  window.open(
                    'https://www.fresha.com/book-now/layali-al-zahra-ladies-saloon-ng425ap1/all-offer?share=true&pId=2674340',
                    '_blank'
                  )
                }
                className="bg-rose-200 text-rose-900 hover:bg-amber-400 hover:text-white px-4 py-1 text-sm shadow-sm"
              >
                Book Now
              </Button>
            </div>

            {/* Mobile Sticky Nav */}
            <div className="flex md:hidden items-center justify-between w-full">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <span className="text-white uppercase flex-1 text-center">
                {navItems.find(item => item.id === currentPage)?.name.toUpperCase() || 'HOME'}
              </span>
              <div className="w-9"></div>
            </div>
          </div>

          {/* Mobile Sticky Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden bg-rose-600 py-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`block w-full text-left text-white hover:bg-rose-700 px-4 py-2 text-sm transition-colors ${
                    currentPage === item.id ? 'bg-rose-700 text-amber-300' : ''
                  }`}
                >
                  {item.name}
                </button>
              ))}
              <div className="px-4 pt-2">
                <Button
                  onClick={() => {
                    window.open(
                      'https://www.fresha.com/book-now/layali-al-zahra-ladies-saloon-ng425ap1/all-offer?share=true&pId=2674340',
                      '_blank'
                    );
                    setIsMenuOpen(false);
                  }}
                  className="w-full bg-rose-200 text-rose-900 hover:bg-amber-400 hover:text-white shadow-sm text-sm"
                >
                  Book Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    )}
  </>
  );
}
