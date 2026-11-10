import { useEffect, useState } from 'react';
import hairPhoto from '../assets/haircolor.jpg';
import skinPhoto from '../assets/spa.jpg';
import bridalPhoto from '../assets/bridal.jpg';
import './homepage-editorial.css';

export interface HomePageReview {
  title: string;
  initials: string;
  description: string;
  image?: string;
  isPublished?: boolean;
  rating?: number | null;
}

interface HomePageProps {
  onNavigate: (page: string) => void;
  reviews?: HomePageReview[];
  disableInitialAnimations?: boolean;
}

const bookingUrl = 'https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services';
const services = [
  { name: 'Hair', descriptor: 'Cut · colour · care', image: hairPhoto, alt: 'Hair colour being applied in a salon' },
  { name: 'Skin', descriptor: 'Facials · massage', image: skinPhoto, alt: 'A guest enjoying a facial treatment' },
  { name: 'Occasion', descriptor: 'Bridal · makeup', image: bridalPhoto, alt: 'Bridal hair and makeup styling' },
];

function Brand() {
  return <a className="lz-brand" href="#top" aria-label="Layali Al Zahra, home">
    <img src="/logo.png" alt="Layali Al Zahra Beauty Salon" />
  </a>;
}

export default function HomePage({ onNavigate, reviews, disableInitialAnimations = false }: HomePageProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [publicReviews, setPublicReviews] = useState<HomePageReview[] | undefined>(reviews);

  useEffect(() => {
    if (reviews !== undefined) {
      setPublicReviews(reviews);
      return;
    }
    let active = true;
    fetch('/api/published-google-reviews')
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        const items = Array.isArray(data.items) ? data.items : [];
        setPublicReviews(items.map((item: any) => {
          const title = typeof item.authorName === 'string' && item.authorName.trim() ? item.authorName.trim() : 'Client';
          const initials = title.split(/\s+/).slice(0, 2).map((part: string) => part[0] || '').join('').toUpperCase();
          return { title, initials, description: String(item.reviewText || ''), rating: Number.isInteger(item.rating) ? item.rating : null, isPublished: true };
        }));
      })
      .catch(() => { if (active) setPublicReviews([]); });
    return () => { active = false; };
  }, [reviews]);

  const featuredReview = publicReviews?.find((review) => review.isPublished !== false && review.description.trim());
  const reviewText = featuredReview?.description.trim() || '';
  const reviewExcerpt = reviewText.length > 205 ? `${reviewText.slice(0, 202).replace(/\s+\S*$/, '')}…` : reviewText;
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={`layali-home-page${disableInitialAnimations ? ' is-still' : ''}`} id="top">
      <header className="lz-header">
        <Brand />
        <nav className="lz-nav" aria-label="Main navigation">
          <a href="#services">Services</a>
          <a href="#salon">The salon</a>
          <a href="#visit">Visit us</a>
          <button onClick={() => onNavigate('packages')}>Packages</button>
          <button onClick={() => onNavigate('offers')}>Offers</button>
        </nav>
        <a className="lz-book lz-book--header" href={bookingUrl} target="_blank" rel="noreferrer">Book a visit <span aria-hidden="true">↗</span></a>
        <button className="lz-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="lz-mobile-nav">
          {menuOpen ? 'Close' : 'Menu'}
        </button>
        {menuOpen && <nav className="lz-mobile-nav" id="lz-mobile-nav" aria-label="Mobile navigation">
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#salon" onClick={closeMenu}>The salon</a>
          <a href="#visit" onClick={closeMenu}>Visit us</a>
          <button onClick={() => { onNavigate('packages'); closeMenu(); }}>Packages</button>
          <button onClick={() => { onNavigate('offers'); closeMenu(); }}>Offers</button>
          <a href={bookingUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>Book a visit ↗</a>
        </nav>}
      </header>

      <main>
        <section className="lz-hero" aria-label="Layali Al Zahra Beauty Lounge">
          <div className="lz-hero__image">
            <img src={hairPhoto} alt="A stylist applying colour to a guest's hair" decoding="async" />
            <span className="lz-hero__image-index" aria-hidden="true">LAYALI&nbsp; / &nbsp;01</span>
          </div>
          <div className="lz-hero__copy">
            <p className="lz-eyebrow">LAYALI AL ZAHRA · BEAUTY LOUNGE</p>
            <h1>Beauty.<br /><em>Made personal.</em></h1>
            <p className="lz-hero__services">Hair, skin, nails &amp; body care.</p>
            <a className="lz-book" href={bookingUrl} target="_blank" rel="noreferrer">Reserve your visit <span aria-hidden="true">↗</span></a>
          </div>
          <a className="lz-hero__scroll" href="#services"><span>Discover the salon</span><i aria-hidden="true" /></a>
        </section>

        <section className="lz-services" id="services">
          <div className="lz-section-top"><p className="lz-eyebrow">THE LAYALI EXPERIENCE</p><button onClick={() => onNavigate('services')}>All services <span aria-hidden="true">↗</span></button></div>
          <div className="lz-services__heading"><h2>Find your<br /><em>feel-good.</em></h2><p>Considered care, from the first hello to the final touch.</p></div>
          <div className="lz-service-grid">
            {services.map((service, index) => <button className="lz-service-card" key={service.name} onClick={() => onNavigate('services')}>
              <span className="lz-service-card__image"><img src={service.image} alt={service.alt} loading="lazy" /></span>
              <span className="lz-service-card__meta"><span><strong>{service.name}</strong><small>{service.descriptor}</small></span><i aria-hidden="true">↗</i></span>
            </button>)}
          </div>
        </section>

        <section className="lz-salon" id="salon">
          <div className="lz-salon__picture"><img src={skinPhoto} alt="A calming facial treatment at the lounge" loading="lazy" /></div>
          <div className="lz-salon__copy"><p className="lz-eyebrow">A PLACE TO PAUSE</p><h2>A little space<br />to feel <em>like you.</em></h2><a className="lz-text-link" href="#visit">Come find us <span aria-hidden="true">↗</span></a></div>
        </section>

        {featuredReview && <section className="lz-review" aria-label="Guest review">
          <div className="lz-review__stars" aria-label={`${featuredReview.rating || 5} out of 5 stars`}>{'★'.repeat(Math.max(0, Math.min(5, featuredReview.rating ?? 5)))}</div>
          <blockquote>“{reviewExcerpt}”</blockquote>
          <p>{featuredReview.title}</p>
        </section>}
      </main>

      <footer className="lz-footer" id="visit">
        <div className="lz-footer__main"><Brand /><div className="lz-footer__message"><p>We’ll save you a seat.</p><a className="lz-footer__book" href={bookingUrl} target="_blank" rel="noreferrer">Book your visit <span aria-hidden="true">↗</span></a></div></div>
        <div className="lz-footer__details">
          <div><span>FIND US</span><a href="https://www.google.com/maps/place/Layali+Al+Zahra+Beauty+Lounge/@25.1060274,55.1981324,18z/data=!4m6!3m5!1s0x3e5f6b605b77aaa5:0x61889b1cddafac75!8m2!3d25.1067745!4d55.1988388!16s%2Fg%2F11xzsd5pcx" target="_blank" rel="noreferrer">Shop 1, Al Telal 11, Al Barsha 1, Dubai ↗</a></div>
          <div><span>CALL</span><a href="tel:+971523706025">+971 52 370 6025</a><a href="mailto:info@layalialzahra.com">info@layalialzahra.com</a></div>
          <div><span>HOURS</span><p>Daily, 10 am – 9 pm<br />Friday, 1 pm – 8:30 pm</p></div>
        </div>
        <div className="lz-footer__bottom"><span>© {new Date().getFullYear()} Layali Al Zahra Beauty Salon LLC</span><span>Dubai</span></div>
      </footer>
    </div>
  );
}

