import { useEffect, useMemo, useRef, useState } from 'react';
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
import { legacyPackagesData } from '../data/legacy-packages.js';
import { legacyOffersData } from '../data/legacy-offers.js';
import { loadPublicPackages, loadPublicOffers, loadPublicServices } from '../data/managed-content-public';
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
  { label: 'Packages', href: '#packages' },
  { label: 'Offers', href: '#offers' },
  { label: 'The lounge', href: '#lounge' },
  { label: 'Find us', href: '#contact' },
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

type HomePackage = (typeof legacyPackagesData)[number] & { bookingUrl?: string };
type HomeOffer = (typeof legacyOffersData)[number] & { bookingUrl?: string };

const packageCategories = (items: HomePackage[]) => [...new Set(items.map((item) => item.category))]
  .map((category) => ({ category, item: items.find((item) => item.category === category)! }))
  .filter(({ item }) => item && item.title && item.image)
  .slice(0, 5);

const mapUrl = 'https://www.google.com/maps/place/Layali+Al+Zahra+Beauty+Lounge/@25.1060274,55.1981324,18z/data=!4m6!3m5!1s0x3e5f6b605b77aaa5:0x61889b1cddafac75!8m2!3d25.1067745!4d55.1988388!16s%2Fg%2F11xzsd5pcx';

const serviceCarouselStyles = `
.layali-home-active { position: relative; isolation: isolate; background: transparent !important; }
.layali-home-page { position: relative; isolation: isolate; overflow: visible; background: transparent; }
.layali-home-page::before { position: fixed; z-index: 0; inset: -32px; background-image: linear-gradient(0deg,rgba(35,22,20,.76),rgba(48,29,25,.57)),radial-gradient(ellipse at 50% 38%,rgba(149,90,70,.24),transparent 64%),var(--lz-page-backdrop); background-position: center,center,center 46%; background-size: cover,cover,cover; background-repeat: no-repeat; content: ''; filter: blur(27px) saturate(.8); transform: scale(1.08); pointer-events: none; }
.layali-home-page > .lz-opening-track,.layali-home-page > main,.layali-home-page > .lz-footer { position: relative; z-index: 1; }
.lz-opening-track { height: 112svh; }
.lz-opening-track { background: transparent; }
.lz-opening-stage { background: transparent; }
.lz-opening-stage::after { background: transparent; }
.lz-opening-stage > .lz-atmosphere { display: none; }
@media (min-width: 701px) { .lz-cover__copy { top: 44%; } }
.lz-services { position: relative; isolation: isolate; overflow: visible; padding-top: clamp(24px,2.5vw,38px); padding-bottom: clamp(30px,4vw,58px); background: transparent; color: #fffaf7; }
.lz-services::before,.lz-services::after { display: none; }
.lz-services__heading,.lz-services__carousel { position: relative; z-index: 1; }
.lz-services__heading .lz-eyebrow { color: rgba(255,250,247,.76); }
.lz-services__heading h2 { color: #fffaf7; }
.lz-services__heading button { color: #fffaf7; border-color: rgba(255,250,247,.5); }
.lz-services__carousel { position: relative; border: 0 !important; outline: 0 !important; background: transparent !important; box-shadow: none !important; }
.lz-services__carousel::before,.lz-services__carousel::after { display: none !important; }
.lz-services { overflow-x: clip; padding-top: clamp(18px,2vw,30px); padding-bottom: clamp(22px,3vw,42px); }
.lz-services__heading { padding-bottom: 10px; }
.lz-services__stage { --service-card-width: clamp(140px,12.2vw,232px); position: relative; display: block; width: 100vw; max-width: none; height: clamp(430px,38vw,500px); overflow: visible; margin-left: calc(50% - 50vw); padding: 0; border: 0 !important; border-radius: 0; outline: 0; background: transparent !important; box-shadow: none; perspective: 1800px; perspective-origin: 50% 45%; isolation: isolate; -webkit-mask-image: linear-gradient(90deg,transparent 0,#000 4%,#000 96%,transparent 100%); mask-image: linear-gradient(90deg,transparent 0,#000 4%,#000 96%,transparent 100%); }
.lz-services__stage::before,.lz-services__stage::after { display: none; }
.lz-service-slot { position: absolute; inset: 0; display: grid; width: auto; place-items: center; pointer-events: none; transform-style: preserve-3d; will-change: transform,opacity; }
.lz-service-card { position: relative; display: block; width: var(--service-card-width); aspect-ratio: .62; overflow: hidden; padding: 0; border: 1px solid rgba(255,248,241,.3); border-radius: 16px; background: #5a423d; color: #fffaf7; cursor: pointer; isolation: isolate; pointer-events: auto; text-align: left; box-shadow: 0 22px 48px rgba(8,5,4,.32); transition: border-color .35s ease,filter .35s ease; }
.lz-service-slot[data-offset='0'] .lz-service-card { box-shadow: 0 18px 40px rgba(8,5,4,.2); }
.lz-service-card:hover,.lz-service-card:focus-visible { border-color: rgba(255,248,241,.72); filter: brightness(1.06); }
.lz-service-card__photo,.lz-service-card__shade { position: absolute; inset: 0; width: 100%; height: 100%; }
.lz-service-card__photo { z-index: -2; display: block; object-fit: cover; object-position: center; transform: scale(1.03); transition: transform 1.35s cubic-bezier(.22,1,.36,1),filter .8s ease; }
.lz-service-card:hover .lz-service-card__photo,.lz-service-card:focus-visible .lz-service-card__photo { transform: scale(1.1); }
.lz-service-card__shade { z-index: -1; background: linear-gradient(0deg,rgba(20,13,12,.72),rgba(20,13,12,.1) 40%,rgba(20,13,12,.02)),linear-gradient(90deg,rgba(20,13,12,.1),transparent 72%); }
.lz-service-card__caption { position: absolute; right: clamp(13px,1.7vw,24px); bottom: clamp(18px,2vw,29px); left: clamp(13px,1.7vw,24px); display: flex; flex-direction: column; gap: 8px; color: #fffaf7; text-shadow: 0 2px 14px rgba(0,0,0,.36); }
.lz-service-card__caption small { color: rgba(255,250,247,.84); font-size: 9px; letter-spacing: .12em; text-transform: uppercase; }
.lz-service-card__caption strong { font-family: Georgia,'Times New Roman',serif; font-size: clamp(17px,1.8vw,25px); font-weight: 400; letter-spacing: -.045em; line-height: 1.02; text-wrap: balance; }
.lz-service-slot[data-offset='0'] .lz-service-card__caption strong { font-size: clamp(24px,2.5vw,36px); }
.lz-services__controls { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 2px; }
.lz-service-arrow { position: relative; display: grid; width: 44px; height: 44px; flex: none; place-items: center; padding: 0; border: 1px solid rgba(255,250,247,.62); border-radius: 50%; background: rgba(255,250,247,.025); color: #fffaf7; cursor: pointer; transform: scale(1); transition: color .25s ease,background .25s ease,border-color .25s ease,box-shadow .25s ease,transform .25s ease; }
.lz-service-arrow--previous,.lz-service-arrow--next { width: 44px; height: 44px; }
.lz-service-arrow svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.2; }
.lz-service-arrow:hover,.lz-service-arrow:focus-visible { z-index: 1; transform: scale(1.14); border-color: #fffaf7; background: rgba(255,250,247,.18); box-shadow: 0 0 0 4px rgba(255,250,247,.08),0 8px 24px rgba(8,5,4,.2); color: #fffaf7; outline: none; }
.lz-review { min-height: 410px; height: 410px; padding-top: 36px; padding-bottom: 36px; background: transparent; }
.lz-review::before { background: none; filter: none; transform: none; }
.lz-review__scrim { background: transparent; }
.lz-review__content > .lz-eyebrow { flex: none; margin: 0 0 34px !important; }
.lz-review__quote { flex: none; height: 230px; }
.lz-review__rating { flex: none; margin: 0 0 10px; }
.lz-footer { background: transparent; }
.lz-packages { position: relative; isolation: isolate; overflow: visible; padding: clamp(26px,3vw,44px) max(24px,calc((100vw - 1310px)/2)) clamp(30px,4vw,56px); color: #fffaf7; scroll-margin-top: 30px; }
.lz-packages__heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: clamp(28px,4vw,54px); }
.lz-packages__heading .lz-eyebrow,.lz-packages__offer-title { color: rgba(255,250,247,.7); }
.lz-packages__heading h2 { margin: 12px 0 0; font-family: Georgia,'Times New Roman',serif; font-size: clamp(32px,4.3vw,56px); font-weight: 400; letter-spacing: -.05em; line-height: 1.02; }
.lz-packages__heading p { max-width: 260px; margin: 0 0 3px; color: rgba(255,250,247,.76); font-size: 12px; line-height: 1.6; }
.lz-packages__circles { display: grid; grid-template-columns: repeat(5,minmax(0,1fr)); align-items: center; justify-items: center; gap: clamp(12px,2.4vw,34px); }
.lz-package-orbit { display: grid; width: 100%; place-items: center; }
.lz-package-circle { position: relative; display: flex; width: clamp(142px,15vw,204px); aspect-ratio: 1; flex-direction: column; align-items: flex-start; justify-content: flex-end; overflow: hidden; padding: clamp(17px,2vw,26px); border: 1px solid rgba(255,250,247,.44); border-radius: 50%; background-position: center; background-size: cover; color: #fffaf7; cursor: pointer; isolation: isolate; text-align: left; box-shadow: 0 20px 48px rgba(7,4,4,.25); }
.lz-package-circle::before { position: absolute; z-index: -1; inset: 0; background: linear-gradient(0deg,rgba(18,12,11,.74),rgba(18,12,11,.12) 65%,rgba(18,12,11,.06)); content: ''; transition: opacity .5s ease; }
.lz-package-orbit:nth-child(even) { transform: translateY(22px); }
.lz-package-circle small { max-width: 100%; margin-bottom: 8px; color: rgba(255,250,247,.84); font-size: 8px; letter-spacing: .13em; line-height: 1.3; text-transform: uppercase; }
.lz-package-circle strong { max-width: 100%; font-family: Georgia,'Times New Roman',serif; font-size: clamp(17px,1.75vw,23px); font-weight: 400; letter-spacing: -.045em; line-height: 1.04; text-wrap: balance; }
.lz-package-circle:hover::before,.lz-package-circle:focus-visible::before { opacity: .72; }
.lz-packages__offers { display: grid; grid-template-columns: auto minmax(0,1fr); align-items: center; gap: 28px; margin-top: clamp(46px,6vw,82px); padding-top: 22px; border-top: 1px solid rgba(255,250,247,.2); scroll-margin-top: 26px; }
.lz-packages__offer-title { min-width: 125px; font-size: 9px; letter-spacing: .15em; text-transform: uppercase; }
.lz-packages__offer-list { display: flex; justify-content: flex-end; gap: 14px; }
.lz-packages__offer { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 5px; padding-left: 14px; border-left: 1px solid rgba(255,250,247,.24); }
.lz-packages__offer strong { overflow: hidden; color: #fffaf7; font-family: Georgia,'Times New Roman',serif; font-size: 15px; font-weight: 400; text-overflow: ellipsis; white-space: nowrap; }
.lz-packages__offer span { color: rgba(255,250,247,.7); font-size: 10px; }
.lz-package-overlay { position: fixed; z-index: 100; inset: 0; display: grid; place-items: center; padding: 22px; background: rgba(19,13,12,.34); backdrop-filter: blur(18px) saturate(.78); -webkit-backdrop-filter: blur(18px) saturate(.78); }
.lz-package-detail { position: relative; display: grid; width: min(850px,100%); min-height: min(390px,calc(100dvh - 44px)); max-height: min(430px,calc(100dvh - 44px)); grid-template-columns: 1fr .94fr; overflow: hidden; border: 1px solid rgba(255,250,247,.38); border-radius: 4px; background: #2d211f; color: #fffaf7; box-shadow: 0 32px 100px rgba(0,0,0,.42); }
.lz-package-detail__copy { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: clamp(28px,5vw,58px); }
.lz-package-detail__copy .lz-eyebrow { color: #d8bcb1; }
.lz-package-detail__copy h3 { margin: 16px 0 13px; font-family: Georgia,'Times New Roman',serif; font-size: clamp(30px,4vw,48px); font-weight: 400; letter-spacing: -.05em; line-height: 1.02; }
.lz-package-detail__copy p { max-width: 330px; margin: 0; color: rgba(255,250,247,.78); font-size: 12px; line-height: 1.65; }
.lz-package-detail__price { margin-top: 18px; color: #e8c7b7; font-size: 13px; letter-spacing: .04em; }
.lz-package-detail__book { display: inline-flex; min-height: 44px; align-items: center; margin-top: 24px; padding: 0 16px; border: 1px solid rgba(255,250,247,.7); color: #fffaf7; font-size: 11px; transition: background .25s ease,color .25s ease; }
.lz-package-detail__book:hover { background: #fffaf7; color: #281d1b; }
.lz-package-detail__photo { width: 100%; height: 100%; min-height: 330px; object-fit: cover; }
.lz-package-detail__close { position: absolute; z-index: 2; top: 12px; right: 12px; display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid rgba(255,250,247,.65); border-radius: 50%; background: rgba(31,22,20,.25); color: #fffaf7; cursor: pointer; font-size: 23px; line-height: 1; }
.lz-footer { scroll-margin-top: 20px; padding-top: 46px; }
.lz-footer__contact-title { margin: 0 0 8px; color: #fffaf7; font-family: Georgia,'Times New Roman',serif; font-size: clamp(25px,3.3vw,42px); font-weight: 400; letter-spacing: -.045em; }
.lz-footer__top > div { display: grid; grid-template-columns: 70px minmax(190px,auto) minmax(180px,1fr); align-items: center; column-gap: 20px; }
.lz-footer__logo { display: block; width: 66px; height: 62px; object-fit: contain; }
.lz-footer__top > div > p { max-width: 260px; margin: 0 0 2px; }
.lz-footer__details { grid-template-columns: 1.2fr 1.15fr 1fr 1fr; }
.lz-footer__social { display: inline-block !important; margin-top: 7px !important; color: #e6c9bd !important; }
html { scroll-behavior: smooth; }
@media (max-width: 1000px) {
  .lz-services__stage { --service-card-width: min(26vw,238px); height: 410px; }
  .lz-service-slot[data-offset='-2'] .lz-service-card,.lz-service-slot[data-offset='2'] .lz-service-card { visibility: hidden; }
  .lz-packages__circles { grid-template-columns: repeat(3,minmax(0,1fr)); row-gap: 26px; }
  .lz-package-orbit:nth-child(even) { transform: translateY(0); }
  .lz-package-orbit:nth-child(2),.lz-package-orbit:nth-child(5) { transform: translateY(18px); }
  .lz-package-circle { width: clamp(150px,23vw,200px); }
  .lz-footer__details { grid-template-columns: repeat(2,minmax(0,1fr)); }
}
@media (max-width: 700px) {
  .lz-opening-track { height: 112svh; }
  .lz-cover__copy { right: 16px; left: 16px; }
  .lz-services { padding: 20px 0 30px; }
  .lz-services__heading { padding-right: 20px; padding-left: 20px; }
  .lz-services__stage { --service-card-width: min(50vw,210px); height: clamp(335px,90vw,372px); }
  .lz-service-card { border-radius: 13px; }
  .lz-service-card__caption { right: 17px; bottom: 22px; left: 17px; gap: 7px; }
  .lz-service-card__caption strong { font-size: clamp(22px,6vw,27px); }
  .lz-service-slot[data-offset='0'] .lz-service-card__caption strong { font-size: clamp(25px,7vw,30px); }
  .lz-services__controls { margin-top: 8px; }
  .lz-packages { padding: 24px 20px 36px; }
  .lz-packages__heading { align-items: flex-start; flex-direction: column; gap: 10px; margin-bottom: 24px; }
  .lz-packages__heading h2 { font-size: clamp(31px,9vw,42px); }
  .lz-packages__heading p { max-width: 280px; }
  .lz-packages__circles { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px 8px; }
  .lz-package-orbit:nth-child(2),.lz-package-orbit:nth-child(5) { transform: none; }
  .lz-package-orbit:nth-child(even) { transform: translateY(20px); }
  .lz-package-circle { width: min(42vw,174px); padding: 16px; }
  .lz-package-circle strong { font-size: clamp(15px,4.4vw,20px); }
  .lz-package-circle small { font-size: 7px; }
  .lz-packages__offers { grid-template-columns: 1fr; gap: 13px; margin-top: 42px; }
  .lz-packages__offer-list { justify-content: flex-start; overflow-x: auto; padding-bottom: 4px; }
  .lz-packages__offer { min-width: 145px; }
  .lz-package-overlay { padding: 12px; }
  .lz-package-detail { width: min(420px,100%); min-height: 0; max-height: calc(100dvh - 24px); grid-template-columns: 1fr; grid-template-rows: minmax(155px,30vh) auto; overflow-y: auto; border-radius: 3px; }
  .lz-package-detail__photo { grid-row: 1; min-height: 0; max-height: 230px; }
  .lz-package-detail__copy { grid-row: 2; padding: 23px 24px 26px; }
  .lz-package-detail__copy h3 { margin: 11px 0 8px; font-size: 30px; }
  .lz-package-detail__copy p { font-size: 11px; }
  .lz-package-detail__price { margin-top: 12px; }
  .lz-package-detail__book { min-height: 40px; margin-top: 15px; }
  .lz-package-detail__close { top: 9px; right: 9px; width: 34px; height: 34px; background: rgba(31,22,20,.55); }
  .lz-footer__top > div { display: grid; grid-template-columns: 50px minmax(0,1fr); align-items: center; gap: 10px 13px; }
  .lz-footer__logo { width: 48px; height: 48px; }
  .lz-footer__top > div > p { grid-column: 1 / -1; margin: 0; }
  .lz-footer__contact-title { font-size: 29px; }
  .lz-footer__details { grid-template-columns: 1fr 1fr; gap: 18px 14px; }
  .lz-review { height: 380px; min-height: 380px; padding: 34px 22px; }
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

function PanelHeader({ inverse = false, menuOpen, setMenuOpen }: {
  inverse?: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}) {
  return <div className={`lz-panel-header${inverse ? ' lz-panel-header--inverse' : ''}`}>
    <Wordmark inverse={inverse} />
    <nav className="lz-panel-nav" aria-label="Main navigation">
      {menuItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
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
      <a href={bookingUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Book a visit</a>
    </motion.nav>}
    </AnimatePresence>
  </div>;
}

export default function HomePage({ onNavigate, reviews, disableInitialAnimations = false }: HomePageProps) {
  const openingTrack = useRef<HTMLElement>(null);
  const serviceStage = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());
  const servicesInView = useInView(serviceStage, { amount: 0.12, margin: '0px 0px -12% 0px' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [featureActive, setFeatureActive] = useState(false);
  const [featureVisible, setFeatureVisible] = useState(false);
  const [services, setServices] = useState<ServiceCategoryCard[]>(fallbackServiceCategories);
  const [packages, setPackages] = useState<HomePackage[]>(legacyPackagesData);
  const [offers, setOffers] = useState<HomeOffer[]>(legacyOffersData);
  const [selectedPackage, setSelectedPackage] = useState<HomePackage | null>(null);
  const [publicReviews, setPublicReviews] = useState<HomePageReview[] | undefined>(reviews);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewPaused, setReviewPaused] = useState(false);
  const [reviewDirection, setReviewDirection] = useState(1);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [serviceDirection, setServiceDirection] = useState(1);
  const [servicePaused, setServicePaused] = useState(false);
  const [serviceRevealPlayed, setServiceRevealPlayed] = useState(false);
  const [serviceStageWidth, setServiceStageWidth] = useState(0);
  const compactServiceStage = serviceStageWidth > 0 && serviceStageWidth <= 1000;
  const serviceOffsets = compactServiceStage ? [-2, -1, 0, 1, 2] : services.length >= 9 ? [-4, -3, -2, -1, 0, 1, 2, 3, 4] : services.length >= 7 ? [-3, -2, -1, 0, 1, 2, 3] : services.length >= 5 ? [-2, -1, 0, 1, 2] : services.map((_, index) => index - Math.floor((services.length - 1) / 2));
  const serviceStep = serviceStageWidth * (serviceStageWidth <= 700 ? 0.44 : compactServiceStage ? 0.27 : 0.132);
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
    if (!selectedPackage) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedPackage(null); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedPackage]);

  useEffect(() => {
    let active = true;
    void Promise.all([loadPublicPackages(), loadPublicOffers()]).then(([loadedPackages, loadedOffers]) => {
      if (!active) return;
      setPackages(loadedPackages as HomePackage[]);
      setOffers(loadedOffers as HomeOffer[]);
    });
    return () => { active = false; };
  }, []);

  const featuredPackages = useMemo(() => packageCategories(packages), [packages]);

  useEffect(() => {
    const stage = serviceStage.current;
    if (!stage) return;
    const measure = () => setServiceStageWidth(stage.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
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
      moveServiceRef.current(1);
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
  const moveServiceRef = useRef(moveService);
  moveServiceRef.current = moveService;
  const featuredReview = visibleReviews[reviewIndex];
  const reviewExcerpt = selectReviewExcerpt(featuredReview?.description || '');
  const backgroundStyle = { '--lz-backdrop': `url(${heroPhoto})`, '--lz-page-backdrop': `url(${washPhoto})` } as React.CSSProperties;
  const servicePose = (offset: number) => {
    const distance = Math.abs(offset);
    const opacity = compactServiceStage ? (distance <= 1 ? (distance === 0 ? 1 : 0.86) : 0) : distance <= 2 ? (distance === 0 ? 1 : 0.94 - distance * 0.04) : distance === 3 ? 0.62 : 0;
    return {
      x: offset * serviceStep,
      y: compactServiceStage ? distance * 9 : distance * 13,
      scale: compactServiceStage ? (distance === 0 ? 1 : 0.78) : distance === 0 ? 1 : distance === 1 ? 0.9 : distance === 2 ? 0.78 : distance === 3 ? 0.65 : 0.52,
      rotateY: compactServiceStage ? -offset * 12 : -offset * 9,
      rotateZ: compactServiceStage ? -offset * 1.2 : -offset * 1.7,
      opacity,
    };
  };

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
              <PanelHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
              <motion.div className="lz-cover__copy" style={{ y: coverCopyY }}>
                <p className="lz-eyebrow">LAYALI AL ZAHRA, AL BARSHA</p>
                <h1>A little time.<br />All yours.</h1>
                <p className="lz-cover__intro">Come in as you are. Leave feeling like yourself.</p>
                <a className="lz-cover__cta" href={bookingUrl} target="_blank" rel="noreferrer">Book your visit</a>
              </motion.div>
            </motion.section>

            <motion.section className="lz-fit-panel" style={{ opacity: featureOpacity, y: featureY, visibility: featureVisible ? 'visible' : 'hidden' }} aria-hidden={!featureActive}>
              <PanelHeader inverse menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
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
          <style>{serviceCarouselStyles}</style>
          <motion.div className="lz-services__heading" initial={reducedMotion || disableInitialAnimations ? false : { opacity: 0, y: 26 }} animate={servicesInView ? { opacity: 1, y: 0 } : reducedMotion || disableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }} transition={{ duration: 0.9, ease: [0.2, 0.75, 0.2, 1] }}>
            <div><p className="lz-eyebrow">THE GOOD PART</p><h2>Choose what feels right.</h2></div>
            <button onClick={() => onNavigate('services')}>See all services</button>
          </motion.div>
          {visibleServiceCards.length > 0 && <motion.div className="lz-services__carousel" role="group" aria-roledescription="carousel" aria-label="Service categories" initial={reducedMotion || disableInitialAnimations ? false : { opacity: 0, y: 55 }} animate={servicesInView ? { opacity: 1, y: 0 } : reducedMotion || disableInitialAnimations ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }} transition={{ duration: 0.88, delay: 0.08, ease: [0.2, 0.75, 0.2, 1] }} onMouseEnter={() => setServicePaused(true)} onMouseLeave={() => setServicePaused(false)} onFocus={() => setServicePaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setServicePaused(false); }} onKeyDown={(event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); moveService(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); moveService(1); } }}>
            <div className="lz-services__stage" ref={serviceStage}>
              {visibleServiceCards.map(({ service, offset, index }) => {
                const pose = servicePose(offset);
                const floatDelay = Math.abs(offset) * 0.2 + (index % 3) * 0.12;
                const entryOffset = serviceRevealPlayed && Math.abs(offset) === (compactServiceStage ? 2 : 3) && Math.sign(offset) === serviceDirection ? offset + serviceDirection : offset;
                const initialPose = serviceRevealPlayed
                  ? { ...pose, x: entryOffset * serviceStep, opacity: entryOffset === offset ? pose.opacity : 0 }
                  : { ...pose, y: 72, scale: 0.78, opacity: 0, rotateY: -offset * 4, rotateZ: 0 };
                return <motion.div className="lz-service-slot" data-offset={offset} key={service.id} initial={reducedMotion || disableInitialAnimations ? false : initialPose} animate={servicesInView ? pose : reducedMotion || disableInitialAnimations ? pose : { ...pose, y: pose.y + 18, opacity: 0 }} transition={{ x: { duration: reducedMotion ? 0.01 : 0.46, ease: [0.22, 1, 0.36, 1] }, y: { duration: reducedMotion ? 0.01 : 0.52, ease: [0.22, 1, 0.36, 1] }, scale: { duration: reducedMotion ? 0.01 : 0.52, ease: [0.22, 1, 0.36, 1] }, rotateY: { duration: reducedMotion ? 0.01 : 0.52, ease: [0.22, 1, 0.36, 1] }, rotateZ: { duration: reducedMotion ? 0.01 : 0.52, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: reducedMotion ? 0.01 : 0.4, ease: [0.22, 1, 0.36, 1] } }}>
                  <motion.button className="lz-service-card" type="button" tabIndex={Math.abs(offset) > (compactServiceStage ? 1 : 3) ? -1 : 0} onClick={() => { if (offset === 0) onNavigate('services'); else { setServiceDirection(Math.sign(offset)); setServiceIndex((index) => (index + offset + services.length) % services.length); } }} aria-current={offset === 0 ? 'true' : undefined} aria-label={offset === 0 ? `Explore ${service.name} services` : `Bring ${service.name} to the centre`}
                    animate={reducedMotion ? { y: 0, rotateZ: 0 } : { y: [0, -6, 0, 6, 0], rotateZ: [0, 0.4, 0, -0.4, 0] }}
                    transition={reducedMotion ? { duration: 0.01 } : { y: { duration: 5.2, ease: 'easeInOut', repeat: Infinity, delay: floatDelay }, rotateZ: { duration: 6.2, ease: 'easeInOut', repeat: Infinity, delay: floatDelay } }}
                    whileHover={reducedMotion ? undefined : { y: -10, scale: 1.035, transition: { duration: 0.24, ease: [0.2, 0.75, 0.2, 1] } }}
                    whileFocus={reducedMotion ? undefined : { y: -7, scale: 1.02 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.985 }}>
                    <img className="lz-service-card__photo" src={service.image} alt={service.alt} loading="lazy" />
                    <span className="lz-service-card__shade" aria-hidden="true" />
                    <span className="lz-service-card__caption">{service.detail && <small>{service.detail}</small>}<strong>{service.name}</strong></span>
                  </motion.button>
                </motion.div>;
              })}
            </div>
            {services.length > 1 && <div className="lz-services__controls" aria-label="Carousel controls">
              <button className="lz-service-arrow lz-service-arrow--previous" type="button" onClick={() => moveService(-1)} aria-label="Previous service category"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M13 10H6m0 0 3.5-3.5M6 10l3.5 3.5" /></svg></button>
              <button className="lz-service-arrow lz-service-arrow--next" type="button" onClick={() => moveService(1)} aria-label="Next service category"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 10h7m0 0-3.5-3.5M14 10l-3.5 3.5" /></svg></button>
            </div>}
          </motion.div>}
        </section>

        <section className="lz-packages" id="packages" aria-labelledby="lz-packages-title">
          <div className="lz-packages__heading">
            <div><p className="lz-eyebrow">A LITTLE MORE TO LOVE</p><h2 id="lz-packages-title">Good things, together.</h2></div>
            <p>Thoughtful combinations for the days you want to make more of.</p>
          </div>
          <div className="lz-packages__circles" role="list" aria-label="Package collections">
            {featuredPackages.map(({ category, item }, index) => <motion.div className="lz-package-orbit" key={`${category}-${item.id}`} role="listitem" animate={reducedMotion ? { y: 0 } : { y: [0, index % 2 ? -7 : -10, 0, index % 2 ? 6 : 8, 0] }} transition={reducedMotion ? { duration: .01 } : { duration: 6.2 + (index % 3) * .7, delay: index * .32, ease: 'easeInOut', repeat: Infinity }}>
              <motion.button className="lz-package-circle" type="button" layoutId={`layali-package-${item.id}`} onClick={() => setSelectedPackage(item)} whileHover={reducedMotion ? undefined : { scale: 1.045, y: -5 }} whileTap={reducedMotion ? undefined : { scale: .98 }} aria-label={`View ${item.title}, ${item.price}`} style={{ backgroundImage: `url("${item.image}")` }}>
                <small>{category}</small><strong>{item.title}</strong>
              </motion.button>
            </motion.div>)}
          </div>
          <div className="lz-packages__offers" id="offers">
            <div className="lz-packages__offer-title">A little extra</div>
            <div className="lz-packages__offer-list">
              {offers.slice(0, 3).map((offer) => <div className="lz-packages__offer" key={offer.id}><strong>{offer.title.replace(/^Monday Offer – |^Midday Offer – /, '')}</strong><span>{offer.badge || offer.validUntil}</span></div>)}
            </div>
          </div>
        </section>

        <AnimatePresence>
          {selectedPackage && <motion.div className="lz-package-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? .01 : .3 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPackage(null); }}>
            <motion.div className="lz-package-detail" layoutId={`layali-package-${selectedPackage.id}`} transition={{ type: 'spring', stiffness: 210, damping: 27, mass: .9 }} role="dialog" aria-modal="true" aria-labelledby="lz-package-detail-title">
              <button className="lz-package-detail__close" type="button" aria-label="Close package details" onClick={() => setSelectedPackage(null)}>×</button>
              <div className="lz-package-detail__copy">
                <p className="lz-eyebrow">{selectedPackage.category}</p>
                <h3 id="lz-package-detail-title">{selectedPackage.title}</h3>
                <p>{selectedPackage.description}</p>
                <strong className="lz-package-detail__price">{selectedPackage.price}</strong>
                <a className="lz-package-detail__book" href={selectedPackage.bookingUrl || bookingUrl} target="_blank" rel="noreferrer">Book this package</a>
              </div>
              <img className="lz-package-detail__photo" src={selectedPackage.image} alt={`${selectedPackage.title} at Layali Al Zahra Beauty Salon`} />
            </motion.div>
          </motion.div>}
        </AnimatePresence>

        {featuredReview && <section className="lz-review" aria-label="Guest reviews" onMouseEnter={() => setReviewPaused(true)} onMouseLeave={() => setReviewPaused(false)} onFocus={() => setReviewPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setReviewPaused(false); }}>
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

      <footer className="lz-footer" id="contact">
        <div className="lz-footer__top" id="visit"><div><img className="lz-footer__logo" src={brandLogoLight} alt="Layali Al Zahra Beauty Salon" /><div><a className="lz-footer__name" href="#top">Layali Al Zahra<small>Beauty Salon LLC</small></a><p className="lz-footer__contact-title">A good visit starts here.</p></div><p>Thoughtful beauty care in Al Barsha, Dubai.</p></div><a className="lz-footer__book" href={bookingUrl} target="_blank" rel="noreferrer">Make an appointment</a></div>
        <div className="lz-footer__details" id="lounge">
          <div><span>COME BY</span><a href={mapUrl} target="_blank" rel="noreferrer">Shop 1, Al Telal 11<br />Near Westzone Supermarket<br />Al Barsha 1, Dubai</a></div>
          <div><span>CALL OR WRITE</span><a href="tel:+971523706025">+971 52 370 6025</a><a href="tel:+97143475545">+971 4 347 5545</a><a href="tel:+97143571060">+971 4 357 1060</a><a href="mailto:info@layalialzahra.com">info@layalialzahra.com</a></div>
          <div><span>OPENING HOURS</span><p>Monday to Sunday<br />10 am to 9 pm</p><p>Friday<br />1 pm to 8:30 pm</p></div>
          <div><span>STAY IN TOUCH</span><a href="https://wa.me/971523706025" target="_blank" rel="noreferrer">WhatsApp</a><a className="lz-footer__social" href="https://www.instagram.com/alzahrabeauty.dubai/" target="_blank" rel="noreferrer">Instagram</a></div>
        </div>
        <div className="lz-footer__bottom"><span>© {new Date().getFullYear()} Layali Al Zahra Beauty Salon LLC</span><a href="#top">Back to the beginning</a></div>
      </footer>
    </div>
  );
}

