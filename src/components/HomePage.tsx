import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react';
import hairPhoto from '../assets/haircolor.jpg';
import makeupPhoto from '../assets/makeup.jpg';
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
const skinPhoto = '/facial-skin.jpg';
const menuItems = [
  { label: 'Services', href: '#services' },
  { label: 'The lounge', href: '#lounge' },
  { label: 'Visit', href: '#visit' },
];
const services = [
  { name: 'Hair', detail: 'Cut · colour · care', image: hairPhoto, alt: 'Hair colour service in progress' },
  { name: 'Skin & body', detail: 'Facials · massage', image: skinPhoto, alt: 'A facial skin treatment' },
  { name: 'Makeup', detail: 'Bridal · occasion', image: makeupPhoto, alt: 'Makeup being applied at the salon' },
  { name: 'Bridal', detail: 'Hair · makeup · nails', image: bridalPhoto, alt: 'A finished bridal hair and makeup look' },
];

function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return <a className={`lz-wordmark${inverse ? ' lz-wordmark--inverse' : ''}`} href="#top" aria-label="Layali Al Zahra home">
    <span>LAYALI AL ZAHRA</span><small>BEAUTY LOUNGE</small>
  </a>;
}

function PanelHeader({ onNavigate, inverse = false, menuOpen, setMenuOpen }: {
  onNavigate: (page: string) => void;
  inverse?: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}) {
  return <div className={`lz-panel-header${inverse ? ' lz-panel-header--inverse' : ''}`}>
    <Wordmark inverse={inverse} />
    <nav className="lz-panel-nav" aria-label="Main navigation">
      {menuItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
      <button onClick={() => onNavigate('packages')}>Packages</button>
      <button onClick={() => onNavigate('offers')}>Offers</button>
    </nav>
    <a className="lz-panel-book" href={bookingUrl} target="_blank" rel="noreferrer">Book a visit <span aria-hidden="true">↗</span></a>
    <button className="lz-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls={`lz-mobile-nav${inverse ? '-open' : ''}`}>
      {menuOpen ? 'Close' : 'Menu'}
    </button>
    {menuOpen && <nav className="lz-mobile-nav" id={`lz-mobile-nav${inverse ? '-open' : ''}`} aria-label="Mobile navigation">
      {menuItems.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
      <button onClick={() => { onNavigate('packages'); setMenuOpen(false); }}>Packages</button>
      <button onClick={() => { onNavigate('offers'); setMenuOpen(false); }}>Offers</button>
      <a href={bookingUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Book a visit ↗</a>
    </nav>}
  </div>;
}

export default function HomePage({ onNavigate, reviews, disableInitialAnimations = false }: HomePageProps) {
  const openingTrack = useRef<HTMLElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const [menuOpen, setMenuOpen] = useState(false);
  const [featureActive, setFeatureActive] = useState(false);
  const [featureVisible, setFeatureVisible] = useState(false);
  const [publicReviews, setPublicReviews] = useState<HomePageReview[] | undefined>(reviews);
  const { scrollYProgress } = useScroll({ target: openingTrack, offset: ['start start', 'end end'] });
  const sceneProgress = useTransform(scrollYProgress, (value) => (reducedMotion || disableInitialAnimations ? 0 : value));
  const cardScale = useTransform(sceneProgress, [0, 0.78], [0.91, 0.99]);
  const cardRotateY = useTransform(sceneProgress, [0, 0.62], [-4, 0]);
  const cardRotateX = useTransform(sceneProgress, [0, 0.62], [2.1, 0]);
  const cardLift = useTransform(sceneProgress, [0, 0.78], [14, 0]);
  const cardRadius = useTransform(sceneProgress, [0, 0.78], [30, 16]);
  const coverOpacity = useTransform(sceneProgress, [0, 0.27, 0.48], [1, 1, 0]);
  const featureOpacity = useTransform(sceneProgress, [0.31, 0.5], [0, 1]);
  const portraitOneY = useTransform(sceneProgress, [0.34, 0.68], [56, 0]);
  const portraitTwoY = useTransform(sceneProgress, [0.34, 0.7], [82, 0]);
  const portraitThreeY = useTransform(sceneProgress, [0.34, 0.72], [42, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (!reducedMotion && !disableInitialAnimations) {
      setFeatureVisible(value > 0.31);
      setFeatureActive(value > 0.47);
    }
  });

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
  const reviewExcerpt = reviewText.length > 170 ? `${reviewText.slice(0, 167).replace(/\s+\S*$/, '')}…` : reviewText;
  const backgroundStyle = { '--lz-backdrop': `url(${bridalPhoto})` } as React.CSSProperties;

  return (
    <div className="layali-home-page" id="top" style={backgroundStyle}>
      <section className="lz-opening-track" ref={openingTrack} aria-label="Layali Al Zahra Beauty Lounge">
        <div className="lz-opening-stage">
          <div className="lz-atmosphere" aria-hidden="true" />
          <div className="lz-atmosphere-word" aria-hidden="true">LAYALI AL ZAHRA</div>
          <motion.article
            className="lz-scene-card"
            style={{ scale: cardScale, rotateY: cardRotateY, rotateX: cardRotateX, y: cardLift, borderRadius: cardRadius }}
          >
            <motion.section className="lz-cover" style={{ opacity: coverOpacity, visibility: featureActive ? 'hidden' : 'visible' }} aria-hidden={featureActive}>
              <img className="lz-cover__photo" src={skinPhoto} alt="A guest receiving a facial skin treatment" fetchpriority="high" />
              <div className="lz-cover__shade" aria-hidden="true" />
              <PanelHeader onNavigate={onNavigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
              <div className="lz-cover__copy">
                <h1>Beauty.<br />Personalized.</h1>
                <a className="lz-cover__cta" href={bookingUrl} target="_blank" rel="noreferrer">Book your visit <span aria-hidden="true">↗</span></a>
              </div>
              <a className="lz-scroll-cue" href="#services"><span>Scroll to explore</span><i aria-hidden="true" /></a>
            </motion.section>

            <motion.section className="lz-fit-panel" style={{ opacity: featureOpacity, visibility: featureVisible ? 'visible' : 'hidden' }} aria-hidden={!featureActive}>
              <PanelHeader onNavigate={onNavigate} inverse menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
              <div className="lz-fit-panel__body">
                <div className="lz-fit-panel__copy">
                  <p className="lz-eyebrow">BEAUTY, YOUR WAY</p>
                  <h2>One size<br />doesn’t fit all.</h2>
                  <a className="lz-fit-panel__cta" href="#services">Find your service <span aria-hidden="true">↗</span></a>
                  <svg className="lz-wave" viewBox="0 0 500 52" preserveAspectRatio="none" aria-hidden="true"><path d="M0 28 C72 2 119 53 192 27 S316 3 374 29 453 45 500 20" /></svg>
                </div>
                <div className="lz-fit-panel__portraits" aria-label="Hair, skin and bridal services">
                  <motion.figure style={{ y: portraitOneY }}><img src={hairPhoto} alt="Hair colour service" /><figcaption>Hair</figcaption></motion.figure>
                  <motion.figure style={{ y: portraitTwoY }}><img src={makeupPhoto} alt="Makeup service" /><figcaption>Makeup</figcaption></motion.figure>
                  <motion.figure style={{ y: portraitThreeY }}><img src={skinPhoto} alt="Skin treatment" /><figcaption>Skin</figcaption></motion.figure>
                </div>
              </div>
            </motion.section>
          </motion.article>
        </div>
      </section>

      <main>
        <section className="lz-services" id="services">
          <div className="lz-services__top"><p className="lz-eyebrow">A FEW OF OUR FAVOURITES</p><button onClick={() => onNavigate('services')}>View all services <span aria-hidden="true">↗</span></button></div>
          <div className="lz-services__grid">
            {services.map((service) => <button className="lz-service-card" key={service.name} onClick={() => onNavigate('services')}>
              <span className="lz-service-card__image"><img src={service.image} alt={service.alt} loading="lazy" /></span>
              <span className="lz-service-card__caption"><strong>{service.name}</strong><small>{service.detail}</small><i aria-hidden="true">↗</i></span>
            </button>)}
          </div>
        </section>

        {featuredReview && <section className="lz-review" aria-label="Guest review">
          <span className="lz-review__rating">{'★'.repeat(Math.max(0, Math.min(5, featuredReview.rating ?? 5)))}</span>
          <blockquote>“{reviewExcerpt}”</blockquote>
          <p>{featuredReview.title}</p>
        </section>}
      </main>

      <footer className="lz-footer" id="visit">
        <div className="lz-footer__top"><div><Wordmark inverse /><p>Beauty, without a formula.</p></div><a className="lz-footer__book" href={bookingUrl} target="_blank" rel="noreferrer">Book your visit <span aria-hidden="true">↗</span></a></div>
        <div className="lz-footer__details" id="lounge">
          <div><span>FIND US</span><a href="https://www.google.com/maps/place/Layali+Al+Zahra+Beauty+Lounge/@25.1060274,55.1981324,18z/data=!4m6!3m5!1s0x3e5f6b605b77aaa5:0x61889b1cddafac75!8m2!3d25.1067745!4d55.1988388!16s%2Fg%2F11xzsd5pcx" target="_blank" rel="noreferrer">Shop 1, Al Telal 11 · Al Barsha 1 · Dubai ↗</a></div>
          <div><span>CALL</span><a href="tel:+971523706025">+971 52 370 6025</a><a href="mailto:info@layalialzahra.com">info@layalialzahra.com</a></div>
          <div><span>HOURS</span><p>Daily, 10 am – 9 pm<br />Friday, 1 pm – 8:30 pm</p></div>
        </div>
        <div className="lz-footer__bottom"><span>© {new Date().getFullYear()} Layali Al Zahra Beauty Salon LLC</span><button onClick={() => onNavigate('contact')}>Contact <span aria-hidden="true">↗</span></button></div>
      </footer>
    </div>
  );
}

