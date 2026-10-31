import React, { useState } from 'react';
import logo from 'figma:asset/9817600458343764435239bfb3fefec844c082eb.png';
import { Menu, X } from 'lucide-react';

interface HeaderProps { currentPage: string; onNavigate: (page: string) => void; }

const navItems = [
  { name: 'Home', id: 'home' }, { name: 'Services', id: 'services' }, { name: 'Packages', id: 'packages' },
  { name: 'Offers', id: 'offers' }, { name: 'Tips', id: 'tips' }, { name: 'Blog', id: 'blog' }, { name: 'News', id: 'news' }, { name: 'Contact', id: 'contact' },
];
const isActive = (currentPage: string, id: string) => currentPage === id || currentPage.startsWith(`${id}:`);
const bookingUrl = 'https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services';

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleNavClick = (id: string) => { onNavigate(id); setIsMenuOpen(false); };
  const renderLinks = (mobile = false) => navItems.map((item) => (
    <button key={item.id} onClick={() => handleNavClick(item.id)}
      className={`lz-nav-link ${isActive(currentPage, item.id) ? 'is-active' : ''} ${mobile ? 'lz-mobile-link' : ''}`}
      aria-current={isActive(currentPage, item.id) ? 'page' : undefined}>{item.name}</button>
  ));

  return (
    <header className="lz-site-header">
      <style>{`
        .lz-site-header{position:relative;z-index:60;background:#17120f;color:#f3eadc;font-family:Montserrat,Arial,sans-serif}
        .lz-site-header *{box-sizing:border-box}
        .lz-site-header .lz-header-utility{height:38px;display:flex;align-items:center;justify-content:space-between;max-width:1440px;margin:auto;padding:0 5.2%;border-bottom:1px solid rgba(200,167,125,.16);font-size:11px;letter-spacing:.12em;color:#c9b9a7}
        .lz-site-header .lz-utility-right{display:none}
        .lz-site-header .lz-brand-row{min-height:108px;display:flex;align-items:center;justify-content:center;gap:20px;padding:16px 24px 14px}
        .lz-site-header .lz-brand-row img{width:auto;height:76px;max-width:120px;object-fit:contain;filter:drop-shadow(0 3px 8px rgba(0,0,0,.18))}
        .lz-site-header .lz-brand-name{margin:0;color:#f3eadc;font-family:Georgia,'Times New Roman',serif;font-size:clamp(20px,2.1vw,29px);font-weight:400;letter-spacing:.105em;line-height:1.15;text-align:left}
        .lz-site-header .lz-brand-subtitle{margin-top:7px;color:#b9a38b;font-size:9px;letter-spacing:.31em;text-transform:uppercase}
        .lz-site-header .lz-navigation{position:relative;top:auto;background:rgba(23,18,15,.97);border-top:1px solid rgba(200,167,125,.2);border-bottom:1px solid rgba(200,167,125,.28);backdrop-filter:blur(18px)}
        .lz-site-header .lz-nav-inner{min-height:58px;max-width:1440px;margin:auto;padding:0 4%;display:flex;align-items:center;justify-content:center;gap:clamp(12px,2.1vw,30px)}
        .lz-site-header .lz-desktop-links{display:flex;align-items:center;justify-content:center;gap:clamp(13px,1.55vw,23px)}
        .lz-site-header .lz-book-desktop{display:inline-flex;align-items:center;justify-content:center}
        .lz-site-header .lz-mobile-book{display:none}
        .lz-site-header .lz-nav-link{position:relative;border:0;background:none;padding:19px 2px 17px;color:#e5d9cb;font:500 12px Montserrat,Arial,sans-serif;letter-spacing:.09em;text-transform:uppercase;white-space:nowrap;transition:color .25s}
        .lz-site-header .lz-nav-link:after{content:"";position:absolute;left:0;right:100%;bottom:10px;height:1px;background:#c8a77d;transition:right .3s ease}
        .lz-site-header .lz-nav-link:hover,.lz-site-header .lz-nav-link.is-active{color:#d8b98f}
        .lz-site-header .lz-nav-link:hover:after,.lz-site-header .lz-nav-link.is-active:after{right:0}
        .lz-site-header .lz-book-button{border:1px solid #c8a77d;background:#c8a77d;color:#21170f;padding:12px 22px;font:600 10px Montserrat,Arial,sans-serif;letter-spacing:.13em;text-transform:uppercase;white-space:nowrap;transition:background .25s,color .25s,border-color .25s}
        .lz-site-header .lz-book-button:hover{background:transparent;color:#e4c69f;border-color:#e4c69f}
        .lz-site-header .lz-mobile-toggle{display:none;border:1px solid rgba(200,167,125,.35);background:transparent;color:#e7d7c5;padding:9px}
        .lz-site-header .lz-mobile-panel{display:none}
        @media(max-width:1100px){.lz-site-header .lz-nav-inner{gap:12px;padding:0 2%}.lz-site-header .lz-desktop-links{gap:12px}.lz-site-header .lz-nav-link{font-size:10px;letter-spacing:.05em}.lz-site-header .lz-book-button{padding:11px 13px}}
        @media(max-width:900px){
          .lz-site-header .lz-header-utility{height:34px;padding:0 18px;font-size:9px;letter-spacing:.08em}
          .lz-site-header .lz-brand-row{min-height:88px;gap:12px;padding:12px 18px;justify-content:center}
          .lz-site-header .lz-brand-row img{height:58px;max-width:82px}
          .lz-site-header .lz-brand-name{font-size:clamp(15px,4vw,20px);letter-spacing:.055em}
          .lz-site-header .lz-brand-subtitle{font-size:7px;letter-spacing:.2em;margin-top:5px}
          .lz-site-header .lz-nav-inner{min-height:54px;justify-content:space-between;padding:0 18px}
          .lz-site-header .lz-desktop-links,.lz-site-header .lz-book-desktop{display:none}
          .lz-site-header .lz-mobile-toggle{display:inline-flex;align-items:center;justify-content:center}
          .lz-site-header .lz-mobile-current{color:#d8b98f;font-size:10px;letter-spacing:.17em;text-transform:uppercase}
          .lz-site-header .lz-mobile-book{display:inline-flex;padding:10px 13px;font-size:9px}
          .lz-site-header .lz-mobile-panel{display:block;padding:8px 18px 20px;background:#1d1611;border-top:1px solid rgba(200,167,125,.15)}
          .lz-site-header .lz-mobile-link{display:block;width:100%;padding:13px 3px;text-align:left;border-bottom:1px solid rgba(200,167,125,.12);font-size:11px}
          .lz-site-header .lz-mobile-link:after{display:none}
          .lz-site-header .lz-mobile-panel .lz-book-button{width:100%;margin-top:16px}
        }
      `}</style>
      <div className="lz-header-utility">
        <a href="tel:+971523706025" className="hover:text-[#f3eadc] transition-colors">AL BARSHA, DUBAI <span className="mx-2 text-[#80694f]">·</span> +971 52 370 6025</a>
        
      </div>
      <div className="lz-brand-row">
        <img src={logo} alt="Layali Al Zahra" />
        <div>
          <p className="lz-brand-name">LAYALI AL ZAHRA</p>
          <p className="lz-brand-subtitle">Beauty Salon LLC · Dubai</p>
        </div>
      </div>
      <div className="lz-navigation">
        <nav className="lz-nav-inner" aria-label="Main navigation">
          <div className="lz-desktop-links">{renderLinks()}</div>
          <a className="lz-book-button lz-book-desktop" href={bookingUrl} target="_blank" rel="noopener noreferrer">Book an appointment</a>
          <button className="lz-mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMenuOpen}>
            {isMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
          <span className="lz-mobile-current">{navItems.find(item => isActive(currentPage, item.id))?.name || 'Home'}</span>
          <a className="lz-book-button lz-mobile-book" href={bookingUrl} target="_blank" rel="noopener noreferrer">Book now</a>
        </nav>
        {isMenuOpen && <div className="lz-mobile-panel">{renderLinks(true)}<a className="lz-book-button" href={bookingUrl} target="_blank" rel="noopener noreferrer">Book an appointment</a></div>}
      </div>
    </header>
  );
}
