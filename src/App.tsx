import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import HomeContentShowcase from './components/HomeContentShowcase';
import ServicesPage from './components/ServicesPage';
import PackagesPage from './components/PackagesPage';
import OffersPage from './components/OffersPage';
import TipsPage from './components/TipsPage';
import ContentListingPage from './components/ContentListingPage';
import ContentDetailPage from './components/ContentDetailPage';
import ContactPage from './components/ContactPage';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import AdminPage from './components/AdminPage';
import NotFoundPage from './components/NotFoundPage';
import CookieConsent from './components/CookieConsent';
import './content.css';

const pageTitles: Record<string, string> = {
  home: 'Layali Al Zahra Beauty Lounge | Luxury Ladies Salon in Dubai', services: 'Beauty Services in Al Barsha, Dubai | Layali Al Zahra', packages: 'Beauty Packages & Deals | Layali Al Zahra Dubai', offers: 'Special Offers & Promotions | Layali Al Zahra Beauty Lounge', tips: 'Beauty Tips & Hair Care Advice | Layali Al Zahra Dubai', blog: 'Beauty Journal | Layali Al Zahra Dubai', news: 'Salon News | Layali Al Zahra Beauty Lounge', contact: 'Contact Us & Book Appointment | Layali Al Zahra Dubai', terms: 'Terms & Conditions | Layali Al Zahra Beauty Lounge', privacy: 'Privacy Policy | Layali Al Zahra Beauty Lounge', admin: 'Admin | Layali Al Zahra Beauty Lounge',
};
const cleanPath = (path: string) => path.replace(/\/+$/, '') || '/';
const routeToPage = (pathname: string, hash = '') => { const path = cleanPath(pathname); if (path === '/admin') return 'admin'; if (path === '/beauty-tips') return 'tips'; if (path.startsWith('/beauty-tips/')) return `tip:${decodeURIComponent(path.slice('/beauty-tips/'.length))}`; if (path === '/blog') return 'blog'; if (path.startsWith('/blog/')) return `blog:${decodeURIComponent(path.slice('/blog/'.length))}`; if (path === '/news') return 'news'; if (path.startsWith('/news/')) return `news:${decodeURIComponent(path.slice('/news/'.length))}`; if (path === '/services') return 'services'; if (path === '/packages') return 'packages'; if (path === '/offers') return 'offers'; if (path === '/contact') return 'contact'; if (path === '/' || path === '/home') return 'home'; return hash || '404'; };

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  useEffect(() => { const handleLocationChange = () => { const page = routeToPage(window.location.pathname, window.location.hash.slice(1)); setCurrentPage(page); const staticTitle = pageTitles[page] || pageTitles[page.split(':')[0]]; if (staticTitle) document.title = staticTitle; window.scrollTo({ top: 0, behavior: 'smooth' }); }; window.addEventListener('hashchange', handleLocationChange); window.addEventListener('popstate', handleLocationChange); handleLocationChange(); return () => { window.removeEventListener('hashchange', handleLocationChange); window.removeEventListener('popstate', handleLocationChange); }; }, []);
  useEffect(() => {
    if (currentPage !== 'admin') return;
    const style = document.createElement('style');
    style.setAttribute('data-admin-cleanup', 'true');
    style.textContent = `
      .cms-migration { display: none !important; }
      a[href*="wa.me" i], a[href*="whatsapp" i], iframe[src*="whatsapp" i],
      [id*="whatsapp" i], [class*="whatsapp" i], [aria-label*="whatsapp" i],
      [title*="whatsapp" i], [class*="joinchat" i], [class*="eapps-whatsapp" i],
      [class*="wa__btn" i] { display: none !important; visibility: hidden !important; pointer-events: none !important; }
    `;
    document.head.appendChild(style);
    return () => style.remove();
  }, [currentPage]);
  const handleNavigate = (page: string) => { const pathMap: Record<string, string> = { home: '/home', services: '/services', packages: '/packages', offers: '/offers', tips: '/beauty-tips', blog: '/blog', news: '/news', contact: '/contact' }; const path = pathMap[page]; if (path) { window.history.pushState({}, '', path); setCurrentPage(page); document.title = pageTitles[page] || document.title; window.scrollTo({ top: 0, behavior: 'smooth' }); return; } window.location.hash = page; };
  const renderPage = () => { if (currentPage.startsWith('tip:')) return <ContentDetailPage type="tip" slug={currentPage.slice(4)} />; if (currentPage.startsWith('blog:')) return <ContentDetailPage type="blog" slug={currentPage.slice(5)} />; if (currentPage.startsWith('news:')) return <ContentDetailPage type="news" slug={currentPage.slice(5)} />; switch (currentPage) { case 'home': return <><HomePage onNavigate={handleNavigate} /><HomeContentShowcase onNavigate={handleNavigate} /></>; case 'services': return <ServicesPage />; case 'packages': return <PackagesPage />; case 'offers': return <OffersPage />; case 'tips': return <TipsPage />; case 'blog': return <ContentListingPage type="blog" />; case 'news': return <ContentListingPage type="news" />; case 'contact': return <ContactPage onNavigate={handleNavigate} />; case 'terms': return <TermsPage />; case 'privacy': return <PrivacyPage />; case 'admin': return <AdminPage />; default: return <NotFoundPage onNavigate={handleNavigate} />; } };
  const showHeaderFooter = currentPage !== 'admin' && currentPage !== '404' && !currentPage.startsWith('error');
  return <div className="min-h-screen">{showHeaderFooter && <Header currentPage={currentPage} onNavigate={handleNavigate} />}<main>{renderPage()}</main>{showHeaderFooter && <Footer />}{currentPage !== 'admin' && <CookieConsent />}</div>;
}
