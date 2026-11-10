import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import hairPhoto from '../assets/haircolor.jpg';
import treatmentPhoto from '../assets/hairtreatement.jpg';
import bridalPhoto from '../assets/bridal.jpg';
import skinPhoto from '../assets/spa.jpg';
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
const navItems = [
  { label: 'The salon', href: '#salon' },
  { label: 'Services', href: '#services' },
  { label: 'Visit us', href: '#visit' },
];

const rituals = [
  { name: 'Hair', note: 'Cut · colour · care', image: hairPhoto, alt: 'Colour work in progress at the salon' },
  { name: 'Skin', note: 'Facials · skin rituals', image: skinPhoto, alt: 'A facial and spa treatment' },
  { name: 'Bridal', note: 'Hair · makeup · occasion', image: bridalPhoto, alt: 'Bridal hair and makeup styling' },
  { name: 'Body', note: 'Massage · waxing · care', image: treatmentPhoto, alt: 'A hair treatment at the salon' },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return <a className={`lz-brand${compact ? ' lz-brand--compact' : ''}`} href="#top" aria-label="Layali Al Zahra, home">
    <span><strong>LAYALI AL ZAHRA</strong><small>BEAUTY LOUNGE · DUBAI</small></span>
  </a>;
}

export default function HomePage({ onNavigate, reviews, disableInitialAnimations: _disableInitialAnimations = false }: HomePageProps) {
  const openingRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedRitual, setSelectedRitual] = useState(0);
  const [publicReviews, setPublicReviews] = useState<HomePageReview[] | undefined>(reviews);
  const reduceMotion = Boolean(prefersReducedMotion);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

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

  const { scrollYProgress } = useScroll({ target: openingRef, offset: ['start start', 'end end'] });
  const pageTurn = useTransform(scrollYProgress, [0, 0.9], [0, reduceMotion ? 0 : isMobile ? -8 : -62]);
  const pageLift = useTransform(scrollYProgress, [0, 0.9], [0, reduceMotion ? 0 : -36]);
  const pageScale = useTransform(scrollYProgress, [0, 0.9], [1, reduceMotion ? 1 : 0.94]);
  const pageTilt = useTransform(scrollYProgress, [0, 0.9], [0, reduceMotion ? 0 : 2.4]);
  const selectedReview = publicReviews?.find((review) => review.isPublished !== false && review.description.trim());
  const pageArtwork = { '--lz-atmosphere': `url(${skinPhoto})`, '--lz-booking-image': `url(${treatmentPhoto})` } as CSSProperties;

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="layali-home-page" id="top" style={pageArtwork}>
      <section className="lz-opening-track" ref={openingRef} aria-label="Layali Al Zahra Beauty Lounge">
        <div className="lz-opening-stage">
          <div className="lz-opening-atmosphere" aria-hidden="true" />
          <div className="lz-under-page" aria-hidden="true">
            <div className="lz-under-page__copy">
              <span>LAYALI AL ZAHRA · AL BARSHA 1</span>
              <p>Layali<br />Al Zahra.</p>
              <small>HAIR · SKIN · NAILS · BODY</small>
            </div>
            <img src={treatmentPhoto} alt="" />
          </div>
          <motion.article
            className="lz-cover-page"
            style={{ rotateY: pageTurn, rotateX: pageTilt, y: pageLift, scale: pageScale }}
          >
            <div className="lz-cover-page__top">
              <Brand />
              <nav className="lz-desktop-nav" aria-label="Main navigation">
                {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
                <button className="lz-nav-text" onClick={() => onNavigate('packages')}>Packages</button>
                <button className="lz-nav-text" onClick={() => onNavigate('offers')}>Offers</button>
              </nav>
              <a className="lz-book lz-book--top" href={bookingUrl} target="_blank" rel="noreferrer">Book a visit</a>
              <button className="lz-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="lz-mobile-nav">
                {menuOpen ? 'Close' : 'Menu'}
              </button>
            </div>
            {menuOpen && <nav className="lz-mobile-nav" id="lz-mobile-nav" aria-label="Mobile navigation">
              {navItems.map((item) => <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}</a>)}
              <button onClick={() => { onNavigate('packages'); closeMenu(); }}>Packages</button>
              <button onClick={() => { onNavigate('offers'); closeMenu(); }}>Offers</button>
              <a href={bookingUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>Book a visit</a>
            </nav>}
            <div className="lz-cover-page__body">
              <div className="lz-cover-page__message">
                <p className="lz-kicker">A BEAUTY LOUNGE IN AL BARSHA</p>
                <h1>A beauty lounge<br />in <em>Al Barsha.</em></h1>
                <p className="lz-cover-page__subline">Hair · skin · nails · body</p>
                <a className="lz-book" href={bookingUrl} target="_blank" rel="noreferrer">Book your appointment <span aria-hidden="true">↗</span></a>
                <span className="lz-cover-page__address">AL TELAL 11 · AL BARSHA 1 · DUBAI</span>
              </div>
              <div className="lz-cover-page__portrait">
                <img src={bridalPhoto} alt="A bride with her finished hair and makeup look" fetchPriority="high" />
              </div>
            </div>
            <div className="lz-cover-page__bottom"><span>EST. IN DUBAI</span><span>SCROLL TO EXPLORE</span><span>25°06′24.4″N 55°11′55.8″E</span></div>
          </motion.article>
        </div>
      </section>

      <section className="lz-intro lz-section" id="salon">
        <div className="lz-intro__label"><span>01 / THE SALON</span><span>AL BARSHA 1, DUBAI</span></div>
        <div className="lz-intro__content">
          <h2>Come in.<br /><em>Settle in.</em></h2>
          <div className="lz-intro__aside">
            <p>A neighbourhood beauty lounge for the rituals that make a day feel like your own.</p>
            <a className="lz-underlined-link" href="#visit">Find us in Al Barsha <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="lz-intro__rule" />
      </section>

      <section className="lz-rituals lz-section" id="services">
        <div className="lz-section-heading">
          <span className="lz-kicker">02 / THE RITUALS</span>
          <h2>Care, from<br /><em>every angle.</em></h2>
        </div>
        <div className="lz-rituals__layout">
          <div className="lz-ritual-list" role="tablist" aria-label="Explore salon services">
            {rituals.map((ritual, index) => (
              <button className={`lz-ritual-row${index === selectedRitual ? ' is-selected' : ''}`} key={ritual.name} onClick={() => setSelectedRitual(index)} role="tab" aria-selected={index === selectedRitual} aria-controls="lz-ritual-image">
                <span className="lz-ritual-row__number">0{index + 1}</span>
                <span className="lz-ritual-row__name">{ritual.name}</span>
                <span className="lz-ritual-row__note">{ritual.note}</span>
                <span className="lz-ritual-row__line" aria-hidden="true" />
              </button>
            ))}
            <button className="lz-underlined-link lz-all-services" onClick={() => onNavigate('services')}>Explore all services <span aria-hidden="true">↗</span></button>
          </div>
          <div className="lz-ritual-image-wrap" id="lz-ritual-image" role="tabpanel">
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                className="lz-ritual-image"
                key={rituals[selectedRitual].name}
                initial={{ opacity: 0, rotateY: reduceMotion ? 0 : 15, x: reduceMotion ? 0 : 18 }}
                animate={{ opacity: 1, rotateY: 0, x: 0 }}
                exit={{ opacity: 0, rotateY: reduceMotion ? 0 : -10, x: reduceMotion ? 0 : -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 0.68, 0, 1] }}
              >
                <img src={rituals[selectedRitual].image} alt={rituals[selectedRitual].alt} loading="lazy" />
                <figcaption><span>LAYALI AL ZAHRA</span><span>{rituals[selectedRitual].name.toUpperCase()}</span></figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="lz-booking-band">
        <div className="lz-booking-band__image" aria-hidden="true" />
        <div className="lz-booking-band__content">
          <span className="lz-kicker">A LITTLE TIME, ALL YOUR OWN</span>
          <h2>Your chair<br /><em>is waiting.</em></h2>
          <a className="lz-book lz-book--light" href={bookingUrl} target="_blank" rel="noreferrer">Choose a service <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      {selectedReview && <section className="lz-review lz-section">
        <span className="lz-kicker">A NOTE FROM A GUEST</span>
        <blockquote>“{selectedReview.description}”</blockquote>
        <p className="lz-review__byline">{selectedReview.title}<span aria-label={`${selectedReview.rating || 5} out of 5 stars`}> · {'★'.repeat(Math.max(0, Math.min(5, selectedReview.rating ?? 5)))}</span></p>
      </section>}

      <footer className="lz-footer" id="visit">
        <div className="lz-footer__top">
          <div className="lz-footer__brand"><Brand compact /><p>Beauty lounge · Al Barsha 1, Dubai</p></div>
          <div><span className="lz-footer__label">FIND US</span><a href="https://www.google.com/maps/place/Layali+Al+Zahra+Beauty+Lounge/@25.1060274,55.1981324,18z/data=!4m6!3m5!1s0x3e5f6b605b77aaa5:0x61889b1cddafac75!8m2!3d25.1067745!4d55.1988388!16s%2Fg%2F11xzsd5pcx" target="_blank" rel="noreferrer">Shop 1, Al Telal 11<br />Al Barsha 1, Dubai <span aria-hidden="true">↗</span></a></div>
          <div><span className="lz-footer__label">CALL US</span><a href="tel:+971523706025">+971 52 370 6025</a><a href="mailto:info@layalialzahra.com">info@layalialzahra.com</a></div>
          <div><span className="lz-footer__label">OPEN DAILY</span><p>10:00 am – 9:00 pm<br />Friday · 1:00 pm – 8:30 pm</p></div>
        </div>
        <div className="lz-footer__bottom"><span>© {new Date().getFullYear()} LAYALI AL ZAHRA BEAUTY SALON LLC</span><span>AL BARSHA 1 · DUBAI</span><a href={bookingUrl} target="_blank" rel="noreferrer">BOOK AN APPOINTMENT ↗</a></div>
      </footer>
    </div>
  );
}

