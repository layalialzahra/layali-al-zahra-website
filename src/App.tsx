import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
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

const pageTitles: Record<string, string> = {
  home: 'Layali Al Zahra Beauty Lounge | Luxury Ladies Salon in Dubai',
  services: 'Beauty Services in Al Barsha, Dubai | Layali Al Zahra',
  packages: 'Beauty Packages & Deals | Layali Al Zahra Dubai',
  offers: 'Special Offers & Promotions | Layali Al Zahra Beauty Lounge',
  tips: 'Beauty Tips & Hair Care Advice | Layali Al Zahra Dubai',
  blog: 'Beauty Journal | Layali Al Zahra Dubai',
  news: 'Salon News | Layali Al Zahra Beauty Lounge',
  contact: 'Contact Us & Book Appointment | Layali Al Zahra Dubai',
  terms: 'Terms & Conditions | Layali Al Zahra Beauty Lounge',
  privacy: 'Privacy Policy | Layali Al Zahra Beauty Lounge',
  admin: 'Admin | Layali Al Zahra Beauty Lounge',
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      const hash = window.location.hash.slice(1);
      let page = hash || 'home';
      if (pathname === '/admin') page = 'admin';
      else if (pathname === '/beauty-tips') page = 'tips';
      else if (pathname.startsWith('/beauty-tips/')) page = `tip:${decodeURIComponent(pathname.slice('/beauty-tips/'.length))}`;
      else if (pathname === '/blog') page = 'blog';
      else if (pathname.startsWith('/blog/')) page = `blog:${decodeURIComponent(pathname.slice('/blog/'.length))}`;
      else if (pathname === '/news') page = 'news';
      else if (pathname.startsWith('/news/')) page = `news:${decodeURIComponent(pathname.slice('/news/'.length))}`;
      setCurrentPage(page);
      const staticTitle = pageTitles[page] || pageTitles[page.split(':')[0]];
      if (staticTitle) document.title = staticTitle;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();
    return () => { window.removeEventListener('hashchange', handleLocationChange); window.removeEventListener('popstate', handleLocationChange); };
  }, []);

  const handleNavigate = (page: string) => { window.location.hash = page; window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const renderPage = () => {
    if (currentPage.startsWith('tip:')) return <ContentDetailPage type="tip" slug={currentPage.slice(4)} />;
    if (currentPage.startsWith('blog:')) return <ContentDetailPage type="blog" slug={currentPage.slice(5)} />;
    if (currentPage.startsWith('news:')) return <ContentDetailPage type="news" slug={currentPage.slice(5)} />;
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={handleNavigate} />;
      case 'services': return <ServicesPage />;
      case 'packages': return <PackagesPage />;
      case 'offers': return <OffersPage />;
      case 'tips': return <TipsPage />;
      case 'blog': return <ContentListingPage type="blog" />;
      case 'news': return <ContentListingPage type="news" />;
      case 'contact': return <ContactPage onNavigate={handleNavigate} />;
      case 'terms': return <TermsPage />;
      case 'privacy': return <PrivacyPage />;
      case 'admin': return <AdminPage />;
      default: return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  const showHeaderFooter = currentPage !== 'admin' && currentPage !== '404' && !currentPage.startsWith('error');
  return <div className="min-h-screen">{showHeaderFooter && <Header currentPage={currentPage} onNavigate={handleNavigate} />}<main>{renderPage()}</main>{showHeaderFooter && <Footer />}{currentPage !== 'admin' && <CookieConsent />}</div>;
}
