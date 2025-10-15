import React from 'react';
import logo from 'figma:asset/ccff0a49342c068a5e59474ff43366f8b3e86b65.png';
import { Phone, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'Offers', id: 'offers' },
    { name: 'Tips', id: 'tips' },
    { name: 'Contact', id: 'contact' },
    { name: 'Terms & Conditions', id: 'terms' },
  ];

  return (
    <header className="bg-white shadow-md">
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
            
            {/* Opening Hours */}
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>Open: 10:00 AM - 9:00 PM Daily</span>
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
          <nav className="flex flex-wrap items-center justify-center gap-2 md:gap-6 py-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
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
          </nav>
        </div>
      </div>
    </header>
  );
}
