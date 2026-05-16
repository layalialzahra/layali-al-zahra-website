import React, { useState, useEffect } from 'react';
      import Header from './components/Header';
      import Footer from './components/Footer';
      import HomePage from './components/HomePage';
      import ServicesPage from './components/ServicesPage';
      import PackagesPage from './components/PackagesPage';
      import OffersPage from './components/OffersPage';
      import TipsPage from './components/TipsPage';
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
        contact: 'Contact Us & Book Appointment | Layali Al Zahra Dubai',
        terms: 'Terms & Conditions | Layali Al Zahra Beauty Lounge',
        privacy: 'Privacy Policy | Layali Al Zahra Beauty Lounge',
      };

      export default function App() {
        const [currentPage, setCurrentPage] = useState('home');

        useEffect(() => {
          const handleHashChange = () => {
            const hash = window.location.hash.slice(1) || 'home';
            setCurrentPage(hash);
            document.title = pageTitles[hash] || pageTitles['home'];
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            case 'packages':
              return <PackagesPage />;
            case 'offers':
              return <OffersPage />;
            case 'tips':
              return <TipsPage />;
            case 'contact':
              return <ContactPage onNavigate={handleNavigate} />;
            case 'terms':
              return <TermsPage />;
            case 'privacy':
              return <PrivacyPage />;
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
            <CookieConsent />
          </div>
        );
      }
  