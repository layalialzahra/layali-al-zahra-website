import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import OffersPage from './components/OffersPage';
import TipsPage from './components/TipsPage';
import ContactPage from './components/ContactPage';
import TermsPage from './components/TermsPage';
import AdminPage from './components/AdminPage';
import NotFoundPage from './components/NotFoundPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'home';
      setCurrentPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (page: string) => {
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'services':
        return <ServicesPage />;
      case 'offers':
        return <OffersPage />;
      case 'tips':
        return <TipsPage />;
      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;
      case 'terms':
        return <TermsPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <NotFoundPage onNavigate={handleNavigate} />;
    }
  };

  const showHeaderFooter = currentPage !== '404' && !currentPage.startsWith('error');

  return (
    <div className="min-h-screen">
      {showHeaderFooter && <Header currentPage={currentPage} onNavigate={handleNavigate} />}
      <main>{renderPage()}</main>
      {showHeaderFooter && <Footer />}
    </div>
  );
}
