import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import heroPhoto from '../assets/hero-layali.jpg';
import haircutPhoto from '../assets/salon-haircut.jpg';
import washPhoto from '../assets/salon-wash.jpg';
import bridalPhoto from '../assets/salon-bridal.jpg';
import finishPhoto from '../assets/salon-finish.jpg';
import makeupPhoto from '../assets/makeup.jpg';
import brandLogo from '../assets/logo-transparent.png';
import brandLogoLight from '../assets/logo-transparent-light.png';
import { legacyServicesData } from '../data/legacy-services.js';
import { loadPublicServices } from '../data/managed-content-public';
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
interface ServiceCategoryCard {
  id: string;
  name: string;
  detail: string;
  image: string;
  alt: string;
}

function mapServiceCategories(items: any[]): ServiceCategoryCard[] {
  return items.map((item) => {
    const name = String(item.title || '').trim();
    const id = String(item.id || name);
    const legacy = legacyServicesData.find((service) => service.id === id || service.title === name);
    const count = Array.isArray(item.subservices) ? item.subservices.length : 0;
    return {
      id: id || name,
      name,
      detail: count ? `${count} ${count === 1 ? 'service' : 'services'}` : '',
      image: String(item.image || legacy?.image || ''),
      alt: `${name} at Layali Al Zahra Beauty Salon`,
    };
  }).filter((service) => service.name && service.image);
}

const fallbackServiceCategories = mapServiceCategories(legacyServicesData);

const serviceCarouselStyles = `
.lz-services__carousel { position: relative; }
.lz-services__stage { display: grid; min-height: 510px; grid-template-columns: minmax(0,.82fr) minmax(0,.98fr) minmax(0,1.13fr) minmax(0,.98fr) minmax(0,.82fr); align-items: center; gap: clamp(8px,1vw,16px); perspective: 1500px; }
.lz-service-slot { min-width: 0; grid-row: 1; transform-style: preserve-3d; }
.lz-service-slot[data-offset='-2'] { grid-column: 1; }
.lz-service-slot[data-offset='-1'] { grid-column: 2; }
.lz-service-slot[data-offset='0'] { grid-column: 3; }
.lz-service-slot[data-offset='1'] { grid-column: 4; }
.lz-service-slot[data-offset='2'] { grid-column: 5; }
.lz-service-card { --card-scale: .82; --card-turn: 11deg; --card-lift: 10px; position: relative; display: block; width: 100%; height: clamp(290px,29vw,390px); overflow: hidden; padding: 0; border: 0; border-radius: 46% 46% 7px 7px / 28% 28% 7px 7px; background: #5a423d; color: #fffaf7; cursor: pointer; isolation: isolate; text-align: left; transform: perspective(1200px) translateY(var(--card-lift)) rotateY(var(--card-turn)) scale(var(--card-scale)); transform-origin: 50% 58%; transition: height .85s cubic-bezier(.22,1,.36,1),transform .9s cubic-bezier(.22,1,.36,1),box-shadow .7s ease; box-shadow: 0 20px 44px rgba(42,28,25,.14); }
.lz-service-slot[data-offset='-1'] .lz-service-card,.lz-service-slot[data-offset='1'] .lz-service-card { --card-scale: .92; --card-turn: 5deg; --card-lift: 0px; height: clamp(340px,34vw,440px); }
.lz-service-slot[data-offset='1'] .lz-service-card { --card-turn: -5deg; }
.lz-service-slot[data-offset='0'] .lz-service-card { --card-scale: 1; --card-turn: 0deg; --card-lift: -8px; height: clamp(390px,40vw,490px); box-shadow: 0 34px 64px rgba(42,28,25,.25); }
.lz-service-card:hover,.lz-service-card:focus-visible { --card-lift: -15px; box-shadow: 0 38px 70px rgba(42,28,25,.26); }
.lz-service-card__photo,.lz-service-card__shade { position: absolute; inset: 0; width: 100%; height: 100%; }
.lz-service-card__photo { z-index: -2; display: block; object-fit: cover; object-position: center; transition: transform 1.3s cubic-bezier(.22,1,.36,1),filter .8s ease; }
.lz-service-card:hover .lz-service-card__photo,.lz-service-card:focus-visible .lz-service-card__photo { transform: scale(1.055); }
.lz-service-card__shade { z-index: -1; background: linear-gradient(0deg,rgba(24,16,15,.78),rgba(24,16,15,.08) 46%,rgba(24,16,15,.04)),linear-gradient(90deg,rgba(24,16,15,.15),transparent 65%); }
.lz-service-card__caption { position: absolute; right: clamp(13px,1.7vw,24px); bottom: clamp(18px,2vw,29px); left: clamp(13px,1.7vw,24px); display: flex; flex-direction: column; gap: 8px; color: #fffaf7; text-shadow: 0 2px 14px rgba(0,0,0,.36); }
.lz-service-card__caption small { color: rgba(255,250,247,.88); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; }
.lz-service-card__caption strong { font-family: Georgia,'Times New Roman',serif; font-size: clamp(19px,2vw,30px); font-weight: 400; letter-spacing: -.045em; line-height: 1.02; text-wrap: balance; }
.lz-service-slot[data-offset='0'] .lz-service-card__caption strong { font-size: clamp(25px,2.7vw,39px); }
.lz-services__controls { display: flex; justify-content: center; gap: 10px; margin-top: 6px; }
.lz-service-arrow { display: grid; width: 38px; height: 38px; place-items: center; padding: 0; border: 1px solid rgba(74,52,46,.34); border-radius: 50%; background: transparent; color: #493733; cursor: pointer; transition: color .25s ease,background .25s ease,border-color .25s ease,transform .5s cubic-bezier(.22,1,.36,1); }
.lz-service-arrow svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.35; }
.lz-service-arrow:hover { transform: scale(1.08); border-color: #493733; background: #493733; color: #fffaf7; }
@media (max-width: 1000px) {
  .lz-services__stage { min-height: 450px; grid-template-columns: minmax(0,1fr) minmax(0,1.12fr) minmax(0,1fr); gap: 12px; }
  .lz-service-slot[data-offset='-2'],.lz-service-slot[data-offset='2'] { display: none; }
  .lz-service-slot[data-offset='-1'] { grid-column: 1; }
  .lz-service-slot[data-offset='0'] { grid-column: 2; }
  .lz-service-slot[data-offset='1'] { grid-column: 3; }
}
@media (max-width: 700px) {
  .lz-services__stage { min-height: 420px; grid-template-columns: minmax(0,1fr) minmax(0,78vw) minmax(0,1fr); gap: 0; }
  .lz-service-slot[data-offset='-1'] { grid-column: 1; }
  .lz-service-slot[data-offset='0'] { grid-column: 2; }
  .lz-service-slot[data-offset='1'] { grid-column: 3; }
  .lz-service-card { --card-scale: 1; --card-turn: 8deg; --card-lift: 4px; height: 330px; border-radius: 43% 43% 6px 6px / 25% 25% 6px 6px; }
  .lz-service-slot[data-offset='1'] .lz-service-card { --card-turn: -8deg; }
  .lz-service-slot[data-offset='0'] .lz-service-card { --card-turn: 0deg; --card-lift: -2px; height: 385px; }
  .lz-service-card__caption { right: 16px; bottom: 21px; left: 16px; gap: 7px; }
  .lz-service-card__caption strong { font-size: clamp(24px,7vw,32px); }
  .lz-service-slot[data-offset='0'] .lz-service-card__caption strong { font-size: clamp(29px,8vw,37px); }
  .lz-services__controls { margin-top: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .lz-service-card,.lz-service-card__photo,.lz-service-arrow { transition-duration: .01ms !important; }
}
`;

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
    <button className={`lz-menu-toggle${menuOpen ? ' is-open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls={`lz-mobile-nav${inverse ? '-open' : ''}`}>
      <svg viewBox="0 0 44 34" aria-hidden="true" focusable="false">
        <defs><linearGradient id={`lz-ribbon${inverse ? '-light' : ''}`} x1="0" x2="1"><stop stopColor="#245a86" /><stop offset="1" stopColor="#c63f78" /></linearGradient></defs>
        <path d="M4 10C12 2 23 5 40 13" stroke={`url(#lz-ribbon${inverse ? '-light' : ''})`} />
        <path d="M4 18C14 26 26 25 40 18" stroke={`url(#lz-ribbon${inverse ? '-light' : ''})`} />
        <path d="M10 27C19 31 29 29 37 24" stroke={`url(#lz-ribbon${inverse ? '-light' : ''})`} />
      </svg>
    </button>
    <AnimatePresence>
    {menuOpen && <motion.nav className="lz-mobile-nav" id={`lz-mobile-nav${inverse ? '-open' : ''}`} aria-label="Mobile navigation" initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }} transition={{ duration: 0.52, ease: [0.7, 0, 0.2, 1] }}>
      {menuItems.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
      <button onClick={() => { onNavigate('packages'); setMenuOpen(false); }}>Packages</button>
      <button onClick={() => { onNavigate('offers'); setMenuOpen(false); }}>Offers</button>
      <a href={bookingUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Book a visit</a>
    </motion.nav>}
    </AnimatePresence>
  </div>;
}

export default function HomePage({ onNavigate, reviews, disableInitialAnimations = false }: HomePageProps) {
  const openingTrack = useRef<HTMLElement>(null);
  const serviceSection = useRef<HTMLElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const servicesInView = useInView(serviceSection, { once: true, amount: 0.16 });
  const [menuOpen, setMenuOpen] = useState(false);
  const [featureActive, setFeatureActive] = useState(false);
  const [featureVisible, setFeatureVisible] = useState(false);
  const [services, setServices] = useState<ServiceCategoryCard[]>(fallbackServiceCategories);
  const [publicReviews, setPublicReviews] = useState<HomePageReview[] | undefined>(reviews);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewPaused, setReviewPaused] = useState(false);
  const [reviewDirection, setReviewDirection] = useState(1);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [serviceDirection, setServiceDirection] = useState(1);
  const [servicePaused, setServicePaused] = useState(false);
  const serviceOffsets = services.length >= 5 ? [-2, -1, 0, 1, 2] : services.map((_, index) => index - Math.floor((services.length - 1) / 2));
  const visibleServiceCards = serviceOffsets.map((offset) => ({
    offset,
    index: (serviceIndex + offset + services.length) % services.length,
    service: services[(serviceIndex + offset + services.length) % services.length],
  })).filter((entry) => entry.service);
  const { scrollYProgress } = useScroll({ target: openingTrack, offset: ['start start', 'end end'] });
  const easedProgress = useSpring(scrollYProgress, { stiffness: 32, damping: 30, mass: 1.05 });
  const sceneProgress = useTransform(easedProgress, (value) => (reducedMotion || disableInitialAnimations ? 0 : value));
  const cardScale = useTransform(sceneProgress, [0, 0.9], [0.975, 1]);
  const cardLift = useTransform(sceneProgress, [0, 0.9], [5, 0]);
  const cardRadius = useTransform(sceneProgress, [0, 0.9], [24, 14]);
  const coverOpacity = useTransform(sceneProgress, [0, 0.22, 0.43], [1, 1, 0]);
  const coverPhotoScale = useTransform(sceneProgress, [0, 0.43], [1, 1.055]);
  const coverCopyY = useTransform(sceneProgress, [0, 0.4], [0, -12]);
  const featureOpacity = useTransform(sceneProgress, [0.22, 0.43], [0, 1]);
  const featureY = useTransform(sceneProgress, [0.2, 0.43], [18, 0]);
  const portraitOneY = useTransform(sceneProgress, [0.23, 0.44], [20, 0]);
  const portraitTwoY = useTransform(sceneProgress, [0.23, 0.46], [28, 0]);
  const portraitThreeY = useTransform(sceneProgress, [0.23, 0.45], [14, 0]);

  useMotionValueEvent(easedProgress, 'change', (value) => {
    if (!reducedMotion && !disableInitialAnimations) {
      setFeatureVisible(value > 0.2);
      setFeatureActive(value > 0.45);
    }
  });

  useEffect(() => {
    let active = true;
    void loadPublicServices().then((items) => {
      if (active) setServices(mapServiceCategories(items));
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    setServiceIndex(0);
  }, [services.length]);

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
  useEffect(() => {
    if (!servicesInView || services.length < 2 || servicePaused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setServiceDirection(1);
      setServiceIndex((index) => (index + 1) % services.length);
    }, 6400);
    return () => window.clearInterval(timer);
  }, [servicesInView, services.length, servicePaused, reducedMotion]);
  const moveReview = (direction: number) => {
    setReviewDirection(direction);
    setReviewIndex((index) => (index + direction + visibleReviews.length) % visibleReviews.length);
  };
  const moveService = (direction: number) => {
    setServiceDirection(direction);
    setServiceIndex((index) => (index + direction + services.length) % services.length);
  };
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
        <section className="lz-services" id="services" ref={serviceSection}>
          <style>{serviceCarouselStyles}</style>
          <motion.div className="lz-services__heading" initial={reducedMotion ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.55 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <div><p className="lz-eyebrow">THE GOOD PART</p><h2>Choose what feels right.</h2></div>
            <button onClick={() => onNavigate('services')}>See all services</button>
          </motion.div>
          {visibleServiceCards.length > 0 && <motion.div className="lz-services__carousel" role="group" aria-roledescription="carousel" aria-label="Service categories" initial={reducedMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }} onMouseEnter={() => setServicePaused(true)} onMouseLeave={() => setServicePaused(false)} onFocus={() => setServicePaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setServicePaused(false); }} onKeyDown={(event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); moveService(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); moveService(1); } }}>
            <div className="lz-services__stage">
              <AnimatePresence initial={false}>
                {visibleServiceCards.map(({ service, index, offset }) => <motion.div className="lz-service-slot" data-offset={offset} key={service.id} layout initial={reducedMotion ? false : { opacity: 0, y: 38, rotateY: serviceDirection * -14, scale: 0.88 }} animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, y: -22, rotateY: serviceDirection * 16, scale: 0.82 }} transition={{ layout: { duration: 0.92, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.62 }, y: { duration: 0.82, ease: [0.22, 1, 0.36, 1] }, rotateY: { duration: 0.92, ease: [0.22, 1, 0.36, 1] }, scale: { duration: 0.82, ease: [0.22, 1, 0.36, 1] } }}>
                  <button className="lz-service-card" type="button" onClick={() => { if (offset === 0) onNavigate('services'); else { setServiceDirection(offset > 0 ? 1 : -1); setServiceIndex(index); } }} aria-current={offset === 0 ? 'true' : undefined} aria-label={offset === 0 ? `Explore ${service.name} services` : `Bring ${service.name} to the centre`}>
                    <img className="lz-service-card__photo" src={service.image} alt={service.alt} loading="lazy" />
                    <span className="lz-service-card__shade" aria-hidden="true" />
                    <span className="lz-service-card__caption">{service.detail && <small>{service.detail}</small>}<strong>{service.name}</strong></span>
                  </button>
                </motion.div>)}
              </AnimatePresence>
            </div>
            {services.length > 1 && <div className="lz-services__controls" aria-label="Carousel controls">
              <button className="lz-service-arrow" type="button" onClick={() => moveService(-1)} aria-label="Previous service category"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5 7 10l5.5 5.5" /></svg></button>
              <button className="lz-service-arrow" type="button" onClick={() => moveService(1)} aria-label="Next service category"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7.5 4.5 5.5 5.5-5.5 5.5" /></svg></button>
            </div>}
          </motion.div>}
        </section>

        {featuredReview && <section className="lz-review" aria-label="Guest reviews" style={{ '--lz-review-image': `url(${washPhoto})` } as React.CSSProperties} onMouseEnter={() => setReviewPaused(true)} onMouseLeave={() => setReviewPaused(false)} onFocus={() => setReviewPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setReviewPaused(false); }}>
          <div className="lz-review__scrim" aria-hidden="true" />
          <div className="lz-review__content"><p className="lz-eyebrow">KIND WORDS FROM OUR GUESTS</p>
            <AnimatePresence mode="wait">
              <motion.div key={`${reviewIndex}-${featuredReview.title}`} className="lz-review__quote" initial={reducedMotion ? false : { opacity: 0, x: reviewDirection * 20 }} animate={{ opacity: 1, x: 0 }} exit={reducedMotion ? undefined : { opacity: 0, x: reviewDirection * -20 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}>
                <span className="lz-review__rating" aria-label={`${featuredReview.rating ?? 5} out of 5 stars`}>{'★'.repeat(Math.max(0, Math.min(5, featuredReview.rating ?? 5)))}</span>
                <blockquote>“{reviewExcerpt}”</blockquote>
                <p className="lz-review__author">{featuredReview.title}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          {visibleReviews.length > 1 && <><button className="lz-review__arrow lz-review__arrow--prev" onClick={() => moveReview(-1)} aria-label="Previous review">‹</button><button className="lz-review__arrow lz-review__arrow--next" onClick={() => moveReview(1)} aria-label="Next review">›</button></>}
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

