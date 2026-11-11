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
.lz-services__stage { position: relative; display: grid; min-height: clamp(470px,47vw,620px); grid-template-columns: repeat(5,minmax(0,1fr)); align-items: center; gap: clamp(9px,1.25vw,18px); overflow: hidden; padding: clamp(30px,4vw,58px) clamp(20px,3.2vw,48px) clamp(24px,3vw,42px); border: 1px solid rgba(244,232,222,.12); border-radius: 3px; background: radial-gradient(ellipse at 50% 44%,rgba(104,69,58,.23),transparent 62%),#211715; perspective: 1800px; perspective-origin: 50% 45%; isolation: isolate; }
.lz-service-slot { min-width: 0; grid-row: 1; transform-style: preserve-3d; will-change: transform; }
.lz-service-slot[data-offset='-2'] { grid-column: 1; }
.lz-service-slot[data-offset='-1'] { grid-column: 2; }
.lz-service-slot[data-offset='0'] { grid-column: 3; }
.lz-service-slot[data-offset='1'] { grid-column: 4; }
.lz-service-slot[data-offset='2'] { grid-column: 5; }
.lz-service-slot[data-offset='-2'] { z-index: 1; }
.lz-service-slot[data-offset='-1'] { z-index: 2; }
.lz-service-slot[data-offset='0'] { z-index: 4; }
.lz-service-slot[data-offset='1'] { z-index: 2; }
.lz-service-slot[data-offset='2'] { z-index: 1; }
.lz-service-card { --card-scale: .78; --card-turn: 27deg; --card-roll: -5deg; position: relative; display: block; width: 100%; height: clamp(290px,31vw,410px); overflow: hidden; padding: 0; border: 1px solid rgba(255,248,241,.24); border-radius: 16px; background: #5a423d; color: #fffaf7; cursor: pointer; isolation: isolate; text-align: left; transform: rotateY(var(--card-turn)) rotateZ(var(--card-roll)) scale(var(--card-scale)); transform-origin: 50% 56%; transition: height 1s cubic-bezier(.22,1,.36,1),transform 1.08s cubic-bezier(.2,.75,.2,1),box-shadow .8s ease,border-color .6s ease; box-shadow: 0 26px 55px rgba(8,5,4,.4); translate: 0 0; animation: lz-service-hover 5.2s ease-in-out infinite; }
.lz-service-slot[data-offset='-2'] .lz-service-card { --card-scale: .72; --card-turn: 31deg; --card-roll: -6deg; animation-delay: -1.1s; }
.lz-service-slot[data-offset='-1'] .lz-service-card { --card-scale: .88; --card-turn: 15deg; --card-roll: -2.5deg; height: clamp(330px,36vw,465px); animation-delay: -.55s; }
.lz-service-slot[data-offset='1'] .lz-service-card { --card-scale: .88; --card-turn: -15deg; --card-roll: 2.5deg; height: clamp(330px,36vw,465px); animation-delay: -.8s; }
.lz-service-slot[data-offset='2'] .lz-service-card { --card-scale: .72; --card-turn: -31deg; --card-roll: 6deg; animation-delay: -1.35s; }
.lz-service-slot[data-offset='0'] .lz-service-card { --card-scale: 1.02; --card-turn: 0deg; --card-roll: 0deg; height: clamp(390px,42vw,520px); box-shadow: 0 38px 80px rgba(8,5,4,.55); animation-delay: -.25s; }
.lz-service-card:hover,.lz-service-card:focus-visible { --card-scale: 1.045; box-shadow: 0 44px 86px rgba(8,5,4,.62); border-color: rgba(255,248,241,.52); animation-play-state: paused; }
.lz-service-card__photo,.lz-service-card__shade { position: absolute; inset: 0; width: 100%; height: 100%; }
.lz-service-card__photo { z-index: -2; display: block; object-fit: cover; object-position: center; transform: scale(1.03); transition: transform 1.35s cubic-bezier(.22,1,.36,1),filter .8s ease; }
.lz-service-card:hover .lz-service-card__photo,.lz-service-card:focus-visible .lz-service-card__photo { transform: scale(1.1); }
.lz-service-card__shade { z-index: -1; background: linear-gradient(0deg,rgba(20,13,12,.86),rgba(20,13,12,.12) 42%,rgba(20,13,12,.04)),linear-gradient(90deg,rgba(20,13,12,.12),transparent 72%); }
.lz-service-card__caption { position: absolute; right: clamp(13px,1.7vw,24px); bottom: clamp(18px,2vw,29px); left: clamp(13px,1.7vw,24px); display: flex; flex-direction: column; gap: 8px; color: #fffaf7; text-shadow: 0 2px 14px rgba(0,0,0,.36); }
.lz-service-card__caption small { color: rgba(255,250,247,.84); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
.lz-service-card__caption strong { font-family: Georgia,'Times New Roman',serif; font-size: clamp(17px,1.8vw,25px); font-weight: 400; letter-spacing: -.045em; line-height: 1.02; text-wrap: balance; }
.lz-service-slot[data-offset='0'] .lz-service-card__caption strong { font-size: clamp(24px,2.5vw,36px); }
.lz-services__controls { display: flex; justify-content: center; gap: 10px; margin-top: 15px; }
.lz-service-arrow { display: grid; width: 38px; height: 38px; place-items: center; padding: 0; border: 1px solid rgba(74,52,46,.34); border-radius: 50%; background: transparent; color: #493733; cursor: pointer; transition: color .25s ease,background .25s ease,border-color .25s ease,transform .5s cubic-bezier(.22,1,.36,1); }
.lz-service-arrow svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.35; }
.lz-service-arrow:hover { transform: scale(1.08); border-color: #493733; background: #493733; color: #fffaf7; }
@media (max-width: 1000px) {
  .lz-services__stage { min-height: 470px; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; padding: 34px 7vw 30px; }
  .lz-service-card { height: clamp(320px,42vw,440px); }
  .lz-service-slot[data-offset='0'] .lz-service-card { height: clamp(390px,48vw,500px); }
  .lz-service-slot[data-offset='-2'],.lz-service-slot[data-offset='2'] { display: none; }
  .lz-service-slot[data-offset='-1'] { grid-column: 1; }
  .lz-service-slot[data-offset='0'] { grid-column: 2; }
  .lz-service-slot[data-offset='1'] { grid-column: 3; }
}
@media (max-width: 700px) {
  .lz-services__stage { min-height: 400px; grid-template-columns: minmax(0,1fr) minmax(0,70vw) minmax(0,1fr); gap: 0; padding: 18px 0 25px; border-radius: 2px; }
  .lz-service-slot[data-offset='-1'] { grid-column: 1; }
  .lz-service-slot[data-offset='0'] { grid-column: 2; }
  .lz-service-slot[data-offset='1'] { grid-column: 3; }
  .lz-service-card { --card-scale: .84; --card-turn: 24deg; --card-roll: -3deg; height: 330px; border-radius: 13px; }
  .lz-service-slot[data-offset='1'] .lz-service-card { --card-turn: -24deg; --card-roll: 3deg; }
  .lz-service-slot[data-offset='0'] .lz-service-card { --card-scale: 1; --card-turn: 0deg; --card-roll: 0deg; height: 370px; }
  .lz-service-card__caption { right: 17px; bottom: 22px; left: 17px; gap: 7px; }
  .lz-service-card__caption strong { font-size: clamp(23px,6.7vw,32px); }
  .lz-service-slot[data-offset='0'] .lz-service-card__caption strong { font-size: clamp(28px,7.6vw,36px); }
  .lz-services__controls { margin-top: 10px; }
}
@keyframes lz-service-hover {
  0%,100% { translate: 0 0; }
  50% { translate: 0 -7px; }
}
@media (prefers-reduced-motion: reduce) {
  .lz-service-card,.lz-service-card__photo,.lz-service-arrow { transition-duration: .01ms !important; animation-duration: .01ms !important; }
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
  const [serviceRevealPlayed, setServiceRevealPlayed] = useState(false);
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
    if (servicesInView) setServiceRevealPlayed(true);
  }, [servicesInView]);

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
          <motion.div className="lz-services__heading" initial={reducedMotion || disableInitialAnimations ? false : { opacity: 0, y: 26 }} animate={servicesInView ? { opacity: 1, y: 0 } : reducedMotion || disableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }} transition={{ duration: 0.9, ease: [0.2, 0.75, 0.2, 1] }}>
            <div><p className="lz-eyebrow">THE GOOD PART</p><h2>Choose what feels right.</h2></div>
            <button onClick={() => onNavigate('services')}>See all services</button>
          </motion.div>
          {visibleServiceCards.length > 0 && <motion.div className="lz-services__carousel" role="group" aria-roledescription="carousel" aria-label="Service categories" initial={reducedMotion || disableInitialAnimations ? false : { opacity: 0, y: 55, scale: 0.94 }} animate={servicesInView ? { opacity: 1, y: 0, scale: 1 } : reducedMotion || disableInitialAnimations ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 55, scale: 0.94 }} transition={{ duration: 1.05, delay: 0.12, ease: [0.2, 0.75, 0.2, 1] }} onMouseEnter={() => setServicePaused(true)} onMouseLeave={() => setServicePaused(false)} onFocus={() => setServicePaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setServicePaused(false); }} onKeyDown={(event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); moveService(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); moveService(1); } }}>
            <div className="lz-services__stage">
              <AnimatePresence initial={false}>
                {visibleServiceCards.map(({ service, index, offset }, cardOrder) => <motion.div className="lz-service-slot" data-offset={offset} key={service.id} layout="position" initial={reducedMotion || disableInitialAnimations ? false : serviceRevealPlayed ? { x: serviceDirection * 115, rotateY: serviceDirection * -42, scale: 0.66 } : { opacity: 0, y: 84, rotateX: 14, scale: 0.72 }} animate={{ opacity: 1, y: 0, x: 0, rotateX: 0, rotateY: 0, scale: 1 }} exit={reducedMotion || disableInitialAnimations ? undefined : { x: serviceDirection * -90, rotateY: serviceDirection * 48, scale: 0.7 }} transition={{ layout: { duration: 1.12, ease: [0.2, 0.75, 0.2, 1] }, opacity: { duration: 0.52 }, y: { duration: 1.12, delay: servicesInView ? cardOrder * 0.075 : 0, ease: [0.2, 0.75, 0.2, 1] }, rotateX: { duration: 1.12, delay: servicesInView ? cardOrder * 0.075 : 0, ease: [0.2, 0.75, 0.2, 1] }, rotateY: { duration: 1.05, ease: [0.2, 0.75, 0.2, 1] }, scale: { duration: 1.05, delay: servicesInView ? cardOrder * 0.075 : 0, ease: [0.2, 0.75, 0.2, 1] } }}>
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

