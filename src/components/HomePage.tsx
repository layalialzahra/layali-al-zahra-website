import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import heroPhoto from '../assets/hero-layali.jpg';
import hairPhoto from '../assets/salon-blowout.jpg';
import haircutPhoto from '../assets/salon-haircut.jpg';
import washPhoto from '../assets/salon-wash.jpg';
import bridalPhoto from '../assets/salon-bridal.jpg';
import finishPhoto from '../assets/salon-finish.jpg';
import makeupPhoto from '../assets/makeup.jpg';
import brandLogo from '../assets/logo-transparent.png';
import brandLogoLight from '../assets/logo-transparent-light.png';
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
const menuItems = [
  { label: 'Services', href: '#services' },
  { label: 'The lounge', href: '#lounge' },
  { label: 'Find us', href: '#visit' },
];
const services = [
  { name: 'Hair', detail: 'Cut, colour and care', image: hairPhoto, alt: 'Stylist blow drying long dark hair' },
  { name: 'Skin and body', detail: 'A softer kind of reset', image: washPhoto, alt: 'Guest relaxing at the salon wash basin' },
  { name: 'Makeup', detail: 'For the days that matter', image: makeupPhoto, alt: 'Makeup artist applying blush at the salon' },
  { name: 'Bridal', detail: 'Made for your moment', image: bridalPhoto, alt: 'Stylist finishing a delicate bridal updo' },
];

function selectReviewExcerpt(text: string) {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (!normalized) return '';
  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((part) => part.trim()) || [];
  const excerpt = sentences.find((part) => part.length >= 34 && part.length <= 100) || sentences.find((part) => part.length > 18 && part.length <= 100);
  if (excerpt) return excerpt;
  if (normalized.length <= 100) return normalized;
  return `${normalized.slice(0, 97).replace(/\s+\S*$/, '')}…`;
}

function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return <a className={`lz-wordmark${inverse ? ' lz-wordmark--inverse' : ''}`} href="#top" aria-label="Layali Al Zahra home">
    <img src={inverse ? brandLogoLight : brandLogo} alt="Layali Al Zahra Beauty Salon" />
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
    <a className="lz-panel-book" href={bookingUrl} target="_blank" rel="noreferrer">Book a visit</a>
    <button className="lz-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls={`lz-mobile-nav${inverse ? '-open' : ''}`}>
      <span className={`lz-menu-glyph${menuOpen ? ' lz-menu-glyph--open' : ''}`} aria-hidden="true"><i /><i /></span>
      <span>{menuOpen ? 'Close' : 'Menu'}</span>
    </button>
    {menuOpen && <nav className="lz-mobile-nav" id={`lz-mobile-nav${inverse ? '-open' : ''}`} aria-label="Mobile navigation">
      {menuItems.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
      <button onClick={() => { onNavigate('packages'); setMenuOpen(false); }}>Packages</button>
      <button onClick={() => { onNavigate('offers'); setMenuOpen(false); }}>Offers</button>
      <a href={bookingUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Book a visit</a>
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
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewPaused, setReviewPaused] = useState(false);
  const { scrollYProgress } = useScroll({ target: openingTrack, offset: ['start start', 'end end'] });
  const easedProgress = useSpring(scrollYProgress, { stiffness: 32, damping: 30, mass: 1.05 });
  const sceneProgress = useTransform(easedProgress, (value) => (reducedMotion || disableInitialAnimations ? 0 : value));
  const cardScale = useTransform(sceneProgress, [0, 0.9], [0.975, 1]);
  const cardLift = useTransform(sceneProgress, [0, 0.9], [5, 0]);
  const cardRadius = useTransform(sceneProgress, [0, 0.9], [24, 14]);
  const coverOpacity = useTransform(sceneProgress, [0, 0.42, 0.72], [1, 1, 0]);
  const coverPhotoScale = useTransform(sceneProgress, [0, 0.72], [1, 1.055]);
  const coverCopyY = useTransform(sceneProgress, [0, 0.68], [0, -18]);
  const featureOpacity = useTransform(sceneProgress, [0.46, 0.72], [0, 1]);
  const featureY = useTransform(sceneProgress, [0.44, 0.73], [24, 0]);
  const portraitOneY = useTransform(sceneProgress, [0.47, 0.74], [24, 0]);
  const portraitTwoY = useTransform(sceneProgress, [0.47, 0.76], [38, 0]);
  const portraitThreeY = useTransform(sceneProgress, [0.47, 0.78], [18, 0]);

  useMotionValueEvent(easedProgress, 'change', (value) => {
    if (!reducedMotion && !disableInitialAnimations) {
      setFeatureVisible(value > 0.45);
      setFeatureActive(value > 0.68);
    }
  });

  useEffect(() => {
    if (reviews !== undefined) { setPublicReviews(reviews); return; }
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

  const visibleReviews = (publicReviews || []).filter((review) => review.isPublished !== false && review.description.trim());
  useEffect(() => {
    setReviewIndex(0);
  }, [visibleReviews.length]);
  useEffect(() => {
    if (visibleReviews.length < 2 || reviewPaused || reducedMotion) return;
    const timer = window.setInterval(() => setReviewIndex((index) => (index + 1) % visibleReviews.length), 7000);
    return () => window.clearInterval(timer);
  }, [visibleReviews.length, reviewPaused, reducedMotion]);
  const featuredReview = visibleReviews[reviewIndex];
  const reviewExcerpt = selectReviewExcerpt(featuredReview?.description || '');
  const backgroundStyle = { '--lz-backdrop': `url(${heroPhoto})` } as React.CSSProperties;

  return (
    <div className="layali-home-page" id="top" style={backgroundStyle}>
      <section className="lz-opening-track" ref={openingTrack} aria-label="Layali Al Zahra Beauty Lounge">
        <div className="lz-opening-stage">
          <div className="lz-atmosphere" aria-hidden="true" />
          <div className="lz-atmosphere-word" aria-hidden="true">LAYALI AL ZAHRA</div>
          <motion.article className="lz-scene-card" style={{ scale: cardScale, y: cardLift, borderRadius: cardRadius }}>
            <motion.section className="lz-cover" style={{ opacity: coverOpacity, visibility: featureActive ? 'hidden' : 'visible' }} aria-hidden={featureActive}>
              <motion.img className="lz-cover__photo" src={heroPhoto} alt="A guest enjoying a quiet moment in a warm, softly lit salon" fetchpriority="high" style={{ scale: coverPhotoScale }} />
              <div className="lz-cover__shade" aria-hidden="true" />
              <PanelHeader onNavigate={onNavigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
              <motion.div className="lz-cover__copy" style={{ y: coverCopyY }}>
                <p className="lz-eyebrow">LAYALI AL ZAHRA, AL BARSHA</p>
                <h1>A little time.<br />All yours.</h1>
                <p className="lz-cover__intro">Come in as you are. Leave feeling like yourself.</p>
                <a className="lz-cover__cta" href={bookingUrl} target="_blank" rel="noreferrer">Book your visit</a>
              </motion.div>
              <a className="lz-scroll-cue" href="#services"><span>Discover the lounge</span><i aria-hidden="true" /></a>
            </motion.section>

            <motion.section className="lz-fit-panel" style={{ opacity: featureOpacity, y: featureY, visibility: featureVisible ? 'visible' : 'hidden' }} aria-hidden={!featureActive}>
              <PanelHeader onNavigate={onNavigate} inverse menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
              <div className="lz-fit-panel__body">
                <div className="lz-fit-panel__copy">
                  <p className="lz-eyebrow">MADE AROUND YOU</p>
                  <h2>Good care.<br />Your way.</h2>
                  <a className="lz-fit-panel__cta" href="#services">Explore our services</a>
                </div>
                <div className="lz-fit-panel__portraits" aria-label="Hair, skin and bridal services">
                  <motion.figure style={{ y: portraitOneY }}><img src={haircutPhoto} alt="Haircut in progress" /><figcaption>Hair</figcaption></motion.figure>
                  <motion.figure style={{ y: portraitTwoY }}><img src={finishPhoto} alt="Freshly styled blonde hair" /><figcaption>Style</figcaption></motion.figure>
                  <motion.figure style={{ y: portraitThreeY }}><img src={bridalPhoto} alt="Bridal hair detail" /><figcaption>Bridal</figcaption></motion.figure>
                </div>
              </div>
            </motion.section>
          </motion.article>
        </div>
      </section>

      <main>
        <section className="lz-services" id="services">
          <div className="lz-services__heading">
            <div><p className="lz-eyebrow">THE GOOD PART</p><h2>Choose what feels right.</h2></div>
            <button onClick={() => onNavigate('services')}>See all services</button>
          </div>
          <div className="lz-services__grid">
            {services.map((service, index) => <motion.button className={`lz-service-card lz-service-card--${index + 1}`} key={service.name} onClick={() => onNavigate('services')} initial={reducedMotion ? false : { opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.22 }} transition={{ duration: 0.72, delay: reducedMotion ? 0 : index * 0.16, ease: [0.22, 1, 0.36, 1] }}>
              <img src={service.image} alt={service.alt} loading="lazy" />
              <span className="lz-service-card__shade" aria-hidden="true" />
              <span className="lz-service-card__caption"><small>{service.detail}</small><strong>{service.name}</strong></span>
            </motion.button>)}
          </div>
        </section>

        {featuredReview && <section className="lz-review" aria-label="Guest reviews" style={{ '--lz-review-image': `url(${washPhoto})` } as React.CSSProperties} onMouseEnter={() => setReviewPaused(true)} onMouseLeave={() => setReviewPaused(false)} onFocus={() => setReviewPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setReviewPaused(false); }}>
          <div className="lz-review__scrim" aria-hidden="true" />
          <div className="lz-review__content"><p className="lz-eyebrow">KIND WORDS FROM OUR GUESTS</p>
            <AnimatePresence mode="wait">
              <motion.div key={`${reviewIndex}-${featuredReview.title}`} className="lz-review__quote" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
                <span className="lz-review__rating" aria-label={`${featuredReview.rating ?? 5} out of 5 stars`}>{'★'.repeat(Math.max(0, Math.min(5, featuredReview.rating ?? 5)))}</span>
                <blockquote>“{reviewExcerpt}”</blockquote>
                <p className="lz-review__author">{featuredReview.title}</p>
              </motion.div>
            </AnimatePresence>
            {visibleReviews.length > 1 && <div className="lz-review__controls" aria-label="Review controls"><button onClick={() => setReviewIndex((index) => (index - 1 + visibleReviews.length) % visibleReviews.length)} aria-label="Previous review">Previous</button><span>{String(reviewIndex + 1).padStart(2, '0')} / {String(visibleReviews.length).padStart(2, '0')}</span><button onClick={() => setReviewIndex((index) => (index + 1) % visibleReviews.length)} aria-label="Next review">Next</button></div>}
          </div>
        </section>}
      </main>

      <footer className="lz-footer" id="visit">
        <div className="lz-footer__top"><div><a className="lz-footer__name" href="#top">Layali Al Zahra<small>Beauty Salon LLC</small></a><p>A beauty lounge in the heart of Al Barsha.</p></div><a className="lz-footer__book" href={bookingUrl} target="_blank" rel="noreferrer">Make an appointment</a></div>
        <div className="lz-footer__details" id="lounge">
          <div><span>VISIT</span><a href="https://www.google.com/maps/place/Layali+Al+Zahra+Beauty+Lounge/@25.1060274,55.1981324,18z/data=!4m6!3m5!1s0x3e5f6b605b77aaa5:0x61889b1cddafac75!8m2!3d25.1067745!4d55.1988388!16s%2Fg%2F11xzsd5pcx" target="_blank" rel="noreferrer">Shop 1, Al Telal 11<br />Al Barsha 1, Dubai</a></div>
          <div><span>GET IN TOUCH</span><a href="tel:+971523706025">+971 52 370 6025</a><a href="mailto:info@layalialzahra.com">info@layalialzahra.com</a></div>
          <div><span>OPENING HOURS</span><p>Monday to Sunday, 10 am to 9 pm<br />Friday, 1 pm to 8:30 pm</p></div>
        </div>
        <div className="lz-footer__bottom"><span>© {new Date().getFullYear()} Layali Al Zahra Beauty Salon LLC</span><button onClick={() => onNavigate('contact')}>Contact us</button></div>
      </footer>
    </div>
  );
}

