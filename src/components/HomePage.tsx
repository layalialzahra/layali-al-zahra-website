import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import heroPhoto from '../assets/hero-layali.jpg';
import haircutPhoto from '../assets/salon-haircut.jpg';
import washPhoto from '../assets/salon-wash.jpg';
import bridalPhoto from '../assets/salon-bridal.jpg';
import finishPhoto from '../assets/salon-finish.jpg';
import makeupPhoto from '../assets/makeup.jpg';
import offerPortrait from '../assets/offer-editorial.jpg';
import brandLogo from '../assets/logo-transparent.png';
import brandLogoLight from '../assets/logo-transparent-light.png';
import { legacyServicesData } from '../data/legacy-services.js';
import { legacyPackagesData } from '../data/legacy-packages.js';
import { legacyOffersData } from '../data/legacy-offers.js';
import { loadPublicOffers, loadPublicPackages, loadPublicServices } from '../data/managed-content-public';
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
const packageCarouselItems = (items: HomePackage[]) => items.filter((item) => item?.title && item.image);
type HomeOffer = (typeof legacyOffersData)[number] & { bookingUrl?: string };
const offerCarouselItems = (items: HomeOffer[]) => items.filter((item) => item?.title && item.image);

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
.lz-packages { position: relative; isolation: isolate; overflow: visible; padding: clamp(20px,2.4vw,34px) max(24px,calc((100vw - 1310px)/2)) clamp(18px,2.2vw,32px); color: #fffaf7; scroll-margin-top: 30px; }
.lz-packages__heading { display: flex; justify-content: center; margin-bottom: clamp(22px,3vw,42px); text-align: center; }
.lz-packages__heading h2 { margin: 0; font-family: Georgia,'Times New Roman',serif; font-size: clamp(34px,4.3vw,56px); font-weight: 400; letter-spacing: -.05em; line-height: 1.02; }
.lz-packages__stage { position: relative; height: clamp(300px,29vw,382px); overflow: visible; perspective: 1100px; touch-action: pan-y; }
.lz-packages__circles { position: absolute; inset: 0; overflow: visible; }
.lz-package-orbit { position: absolute; top: 50%; left: 50%; display: grid; width: max-content; place-items: center; translate: -50% -50%; transform-style: preserve-3d; }
.lz-package-circle { position: relative; display: flex; width: clamp(146px,15vw,204px); aspect-ratio: 1; flex-direction: column; align-items: flex-start; justify-content: flex-end; overflow: hidden; padding: clamp(17px,2vw,26px); border: 1px solid rgba(255,250,247,.44); border-radius: 50%; background-position: center; background-size: cover; color: #fffaf7; cursor: pointer; isolation: isolate; text-align: left; box-shadow: 0 20px 48px rgba(7,4,4,.25); transition: box-shadow .35s ease,border-color .35s ease; }
.lz-package-circle[aria-current='true'] { border-color: rgba(255,250,247,.82); box-shadow: 0 28px 70px rgba(7,4,4,.36),0 0 0 1px rgba(255,250,247,.1); }
.lz-package-circle::before { position: absolute; z-index: -1; inset: 0; background: linear-gradient(0deg,rgba(18,12,11,.74),rgba(18,12,11,.12) 65%,rgba(18,12,11,.06)); content: ''; transition: opacity .5s ease; }
.lz-package-circle small { max-width: 100%; margin-bottom: 8px; color: rgba(255,250,247,.84); font-size: 8px; letter-spacing: .13em; line-height: 1.3; text-transform: uppercase; }
.lz-package-circle strong { max-width: 100%; font-family: Georgia,'Times New Roman',serif; font-size: clamp(17px,1.75vw,23px); font-weight: 400; letter-spacing: -.045em; line-height: 1.04; text-wrap: balance; }
.lz-package-circle:hover::before,.lz-package-circle:focus-visible::before { opacity: .72; }
.lz-packages__controls { display: flex; justify-content: center; gap: 14px; margin-top: 12px; }
.lz-package-arrow { display: grid; width: 48px; height: 48px; place-items: center; padding: 0; border: 1px solid rgba(255,250,247,.56); border-radius: 50%; background: transparent; color: #fffaf7; cursor: pointer; transition: width .24s ease,height .24s ease,background .24s ease,color .24s ease,border-color .24s ease; }
.lz-package-arrow svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
.lz-package-arrow:hover,.lz-package-arrow:focus-visible { width: 56px; height: 56px; margin: -4px; border-color: #f0d3bd; background: #f0d3bd; color: #2b1b17; }
.lz-offers { position: relative; display: grid; grid-template-columns: minmax(260px,.82fr) minmax(0,1.5fr); gap: clamp(26px,5vw,76px); align-items: center; overflow: hidden; padding: clamp(28px,5vw,66px) max(24px,calc((100vw - 1310px)/2)); color: #fffaf7; scroll-margin-top: 24px; }
.lz-offers__figure { position: relative; display: flex; min-width: 0; height: clamp(390px,42vw,560px); align-items: flex-end; justify-content: center; isolation: isolate; }
.lz-offers__figure::before { position: absolute; right: -12%; bottom: 5%; left: -12%; height: 66%; border-radius: 50%; background: radial-gradient(ellipse,rgba(210,153,121,.2),rgba(125,72,59,.08) 48%,transparent 72%); content: ''; filter: blur(30px); }
.lz-offers__figure img { position: relative; z-index: 1; display: block; width: 100%; height: 100%; object-fit: contain; object-position: center bottom; mix-blend-mode: screen; -webkit-mask-image: linear-gradient(to bottom,#000 0%,#000 72%,rgba(0,0,0,.82) 84%,transparent 100%),linear-gradient(to right,transparent 0%,#000 12%,#000 88%,transparent 100%); -webkit-mask-composite: source-in; mask-image: linear-gradient(to bottom,#000 0%,#000 72%,rgba(0,0,0,.82) 84%,transparent 100%),linear-gradient(to right,transparent 0%,#000 12%,#000 88%,transparent 100%); mask-composite: intersect; filter: drop-shadow(0 28px 35px rgba(8,4,4,.2)); }
.lz-offers__content { min-width: 0; }
.lz-offers__heading { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 10px 20px; margin-bottom: 24px; }
.lz-offers__heading .lz-eyebrow { margin: 0 0 9px; color: #e5c8b9; }
.lz-offers__heading h2 { margin: 0; color: #fffaf7; font-family: Georgia,'Times New Roman',serif; font-size: clamp(35px,4vw,54px); font-weight: 400; letter-spacing: -.05em; line-height: .98; }
.lz-offers__heading p { max-width: 210px; margin: 0 0 3px; color: rgba(255,250,247,.72); font-size: 11px; line-height: 1.55; }
.lz-offers__grid { display: grid; min-height: 344px; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }
.lz-offer-slot { min-width: 0; min-height: 166px; perspective: 900px; }
.lz-offer-card { position: relative; display: flex; width: 100%; min-height: 166px; height: 100%; flex-direction: column; justify-content: flex-end; overflow: hidden; padding: clamp(16px,2vw,24px); border: 1px solid rgba(255,250,247,.34); border-radius: 22px; background: linear-gradient(130deg,rgba(255,248,243,.18),rgba(48,33,30,.58)),var(--offer-image) center/cover; color: #fffaf7; text-align: left; text-decoration: none; isolation: isolate; box-shadow: 0 18px 44px rgba(8,4,4,.17),inset 0 1px rgba(255,255,255,.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); transition: border-color .3s ease,box-shadow .3s ease; }
.lz-offer-card::before { position: absolute; z-index: -1; inset: 0; background: linear-gradient(0deg,rgba(22,14,13,.8),rgba(22,14,13,.16) 78%); content: ''; }
.lz-offer-card:hover,.lz-offer-card:focus-visible { border-color: rgba(255,250,247,.78); box-shadow: 0 24px 50px rgba(8,4,4,.26),inset 0 1px rgba(255,255,255,.18); outline: none; }
.lz-offer-card__top { position: absolute; top: 14px; right: 14px; left: 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.lz-offer-card__badge,.lz-offer-card__validity { color: rgba(255,250,247,.88); font-size: 9px; letter-spacing: .1em; text-transform: uppercase; text-shadow: 0 1px 8px rgba(0,0,0,.35); }
.lz-offer-card__badge { border: 1px solid rgba(255,250,247,.52); border-radius: 999px; padding: 6px 9px; background: rgba(32,22,20,.32); backdrop-filter: blur(8px); }
.lz-offer-card__copy { display: grid; gap: 7px; }
.lz-offer-card__copy strong { max-width: 28ch; font-family: Georgia,'Times New Roman',serif; font-size: clamp(17px,1.65vw,22px); font-weight: 400; letter-spacing: -.035em; line-height: 1.06; text-wrap: balance; }
.lz-offer-card__copy span { max-width: 36ch; color: rgba(255,250,247,.76); font-size: 10px; line-height: 1.4; }
.lz-offers__controls { display: flex; justify-content: center; gap: 12px; margin-top: 18px; }
.lz-offers__arrow { display: grid; width: 44px; height: 44px; place-items: center; padding: 0; border: 1px solid rgba(255,250,247,.58); border-radius: 50%; background: rgba(255,250,247,.025); color: #fffaf7; cursor: pointer; transition: transform .24s ease,background .24s ease,border-color .24s ease,color .24s ease,box-shadow .24s ease; }
.lz-offers__arrow svg { width: 15px; height: 15px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.25; }
.lz-offers__arrow:hover,.lz-offers__arrow:focus-visible { transform: scale(1.14); border-color: #f0d3bd; background: #f0d3bd; color: #2b1b17; box-shadow: 0 0 0 4px rgba(240,211,189,.1); outline: none; }
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
.lz-footer { scroll-margin-top: 20px; padding-top: clamp(26px,4vw,54px); }
.lz-contact { display: grid; grid-template-columns: minmax(0,.86fr) minmax(420px,1.14fr); gap: clamp(34px,7vw,110px); align-items: center; padding: clamp(34px,6vw,78px); border: 1px solid rgba(255,250,247,.16); background: linear-gradient(115deg,rgba(37,25,23,.78),rgba(27,21,20,.55)),var(--lz-page-backdrop) center 48%/cover; box-shadow: 0 30px 95px rgba(0,0,0,.17); }
.lz-contact__intro { max-width: 430px; }
.lz-contact__intro .lz-eyebrow { color: #d9b6a7; }
.lz-contact__intro h2 { margin: 15px 0 18px; color: #fffaf7; font-family: Georgia,'Times New Roman',serif; font-size: clamp(42px,5.2vw,70px); font-weight: 400; letter-spacing: -.055em; line-height: .98; }
.lz-contact__intro > p { max-width: 340px; margin: 0 0 30px; color: rgba(255,250,247,.78); font-size: 13px; line-height: 1.7; }
.lz-contact__meta { display: grid; gap: 17px; }
.lz-contact__meta span,.lz-contact__meta a,.lz-contact__meta p { display: block; margin: 0; color: #fffaf7; font-size: 11px; line-height: 1.65; }
.lz-contact__meta span { margin-bottom: 4px; color: #d9b6a7; font-size: 9px; letter-spacing: .16em; text-transform: uppercase; }
.lz-contact__form { display: grid; gap: 15px; padding: clamp(22px,3.4vw,42px); border: 1px solid rgba(255,250,247,.22); background: rgba(31,24,22,.66); backdrop-filter: blur(10px); }
.lz-contact__form label { display: grid; gap: 7px; color: rgba(255,250,247,.76); font-size: 10px; letter-spacing: .04em; }
.lz-contact__form input,.lz-contact__form textarea { width: 100%; border: 0; border-bottom: 1px solid rgba(255,250,247,.36); border-radius: 0; padding: 9px 0; outline: none; background: transparent; color: #fffaf7; font: inherit; font-size: 12px; resize: vertical; }
.lz-contact__form input:focus,.lz-contact__form textarea:focus { border-color: #e3bfae; }
.lz-contact__form input::placeholder,.lz-contact__form textarea::placeholder { color: rgba(255,250,247,.43); }
.lz-contact__send { justify-self: start; min-height: 45px; margin-top: 3px; padding: 0 20px; border: 1px solid rgba(255,250,247,.72); background: transparent; color: #fffaf7; cursor: pointer; font: inherit; font-size: 10px; letter-spacing: .06em; transition: background .2s ease,color .2s ease; }
.lz-contact__send:hover { background: #f0d3bd; color: #2b1b17; }
.lz-contact__status { margin: 0; color: #f0d3bd; font-size: 11px; }
.lz-contact__success { color: #d6e6d0; }
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
  .lz-package-circle { width: clamp(146px,23vw,192px); }
  .lz-contact { grid-template-columns: minmax(0,.85fr) minmax(350px,1.15fr); gap: 36px; padding: 34px; }
  .lz-offers { grid-template-columns: minmax(220px,.72fr) minmax(0,1.28fr); gap: 24px; }
  .lz-offers__figure { height: 430px; }
  .lz-offer-slot,.lz-offer-card { min-height: 156px; }
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
  .lz-packages { padding: 19px 0 25px; }
  .lz-packages__heading { margin-bottom: 13px; }
  .lz-packages__heading h2 { font-size: clamp(31px,9vw,42px); }
  .lz-packages__stage { height: min(76vw,312px); min-height: 258px; }
  .lz-package-circle { width: min(46vw,190px); padding: 16px; }
  .lz-package-circle strong { font-size: clamp(15px,4.4vw,20px); }
  .lz-package-circle small { font-size: 7px; }
  .lz-package-arrow { width: 44px; height: 44px; }
  .lz-package-arrow:hover,.lz-package-arrow:focus-visible { width: 50px; height: 50px; }
  .lz-package-overlay { padding: 12px; }
  .lz-package-detail { width: min(420px,100%); min-height: 0; max-height: calc(100dvh - 24px); grid-template-columns: 1fr; grid-template-rows: minmax(155px,30vh) auto; overflow-y: auto; border-radius: 3px; }
  .lz-package-detail__photo { grid-row: 1; min-height: 0; max-height: 230px; }
  .lz-package-detail__copy { grid-row: 2; padding: 23px 24px 26px; }
  .lz-package-detail__copy h3 { margin: 11px 0 8px; font-size: 30px; }
  .lz-package-detail__copy p { font-size: 11px; }
  .lz-package-detail__price { margin-top: 12px; }
  .lz-package-detail__book { min-height: 40px; margin-top: 15px; }
  .lz-package-detail__close { top: 9px; right: 9px; width: 34px; height: 34px; background: rgba(31,22,20,.55); }
  .lz-offers { grid-template-columns: 1fr; gap: 3px; padding: 28px 19px 30px; }
  .lz-offers__figure { height: clamp(245px,72vw,330px); order: 0; }
  .lz-offers__figure img { object-position: center 28%; }
  .lz-offers__content { order: 1; }
  .lz-offers__heading { margin-bottom: 16px; }
  .lz-offers__heading h2 { font-size: clamp(34px,10vw,44px); }
  .lz-offers__heading p { max-width: 120px; font-size: 10px; }
  .lz-offers__grid { min-height: 317px; gap: 9px; }
  .lz-offer-slot,.lz-offer-card { min-height: 154px; }
  .lz-offer-card { padding: 14px; border-radius: 17px; }
  .lz-offer-card__top { top: 10px; right: 9px; left: 9px; flex-wrap: wrap; gap: 5px; }
  .lz-offer-card__badge,.lz-offer-card__validity { font-size: 7px; letter-spacing: .06em; }
  .lz-offer-card__badge { padding: 5px 7px; }
  .lz-offer-card__copy { gap: 5px; }
  .lz-offer-card__copy strong { font-size: clamp(15px,4.3vw,19px); }
  .lz-offer-card__copy span { font-size: 9px; }
  .lz-offers__controls { margin-top: 14px; }
  .lz-contact { grid-template-columns: 1fr; gap: 26px; padding: 26px 20px; }
  .lz-contact__intro h2 { font-size: 44px; }
  .lz-contact__intro > p { margin-bottom: 22px; font-size: 12px; }
  .lz-contact__meta { grid-template-columns: 1fr 1fr; gap: 12px; }
  .lz-contact__form { gap: 12px; padding: 20px 17px; }
  .lz-contact__form textarea { min-height: 66px; }
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
  const packageStage = useRef<HTMLDivElement>(null);
  const packageCarouselInteracted = useRef(false);
  const reducedMotion = Boolean(useReducedMotion());
  const servicesInView = useInView(serviceStage, { amount: 0.12, margin: '0px 0px -12% 0px' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [featureActive, setFeatureActive] = useState(false);
  const [featureVisible, setFeatureVisible] = useState(false);
  const [services, setServices] = useState<ServiceCategoryCard[]>(fallbackServiceCategories);
  const [packages, setPackages] = useState<HomePackage[]>(legacyPackagesData);
  const [offers, setOffers] = useState<HomeOffer[]>(legacyOffersData);
  const [selectedPackage, setSelectedPackage] = useState<HomePackage | null>(null);
  const [packageIndex, setPackageIndex] = useState(0);
  const [packageDirection, setPackageDirection] = useState(1);
  const [packageStageWidth, setPackageStageWidth] = useState(0);
  const [packagePaused, setPackagePaused] = useState(false);
  const [offerIndex, setOfferIndex] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState<{ message: string; success: boolean } | null>(null);
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
    let active = true;
    void loadPublicOffers().then((items) => {
      if (active) setOffers(items as HomeOffer[]);
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
    void loadPublicPackages().then((loadedPackages) => {
      if (!active) return;
      setPackages(loadedPackages as HomePackage[]);
    });
    return () => { active = false; };
  }, []);

  const featuredPackages = useMemo(() => packageCarouselItems(packages), [packages]);
  const featuredOffers = useMemo(() => offerCarouselItems(offers), [offers]);
  const visibleOffers = Array.from({ length: Math.min(4, featuredOffers.length) }, (_, offset) => ({
    item: featuredOffers[(offerIndex + offset + featuredOffers.length) % featuredOffers.length],
    offset,
  })).filter(({ item }) => item);

  const moveOffer = (direction: number) => {
    if (featuredOffers.length < 2) return;
    setOfferIndex((index) => (index + direction + featuredOffers.length) % featuredOffers.length);
  };

  const compactPackageCarousel = packageStageWidth > 0 && packageStageWidth <= 700;
  const packageCardCount = compactPackageCarousel ? 3 : 5;
  const packageOffsets = featuredPackages.length < packageCardCount
    ? Array.from({ length: featuredPackages.length }, (_, index) => index - Math.floor((featuredPackages.length - 1) / 2))
    : compactPackageCarousel ? [-1, 0, 1] : [-2, -1, 0, 1, 2];
  const packageStep = compactPackageCarousel ? packageStageWidth * 0.34 : Math.min(packageStageWidth * 0.2, 244);
  const visiblePackageCards = packageOffsets.map((offset) => ({
    offset,
    item: featuredPackages[(packageIndex + offset + featuredPackages.length) % featuredPackages.length],
  })).filter(({ item }) => item);

  useEffect(() => {
    const stage = packageStage.current;
    if (!stage) return;
    const measure = () => setPackageStageWidth(stage.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { setPackageIndex(0); }, [featuredPackages.length]);

  useEffect(() => {
    if (featuredPackages.length < 2 || packagePaused || reducedMotion || selectedPackage) return;
    const timer = window.setInterval(() => movePackageRef.current(1), 5600);
    return () => window.clearInterval(timer);
  }, [featuredPackages.length, packagePaused, reducedMotion, selectedPackage]);

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
  const movePackage = (direction: number) => {
    if (featuredPackages.length < 2) return;
    packageCarouselInteracted.current = true;
    setPackageDirection(direction || 1);
    setPackageIndex((index) => (index + direction + featuredPackages.length) % featuredPackages.length);
  };
  const movePackageRef = useRef(movePackage);
  movePackageRef.current = movePackage;
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
  const packagePose = (offset: number) => {
    const distance = Math.abs(offset);
    return {
      x: offset * packageStep,
      y: distance * (compactPackageCarousel ? 13 : 20),
      scale: distance === 0 ? 1 : compactPackageCarousel ? .72 : distance === 1 ? .84 : .68,
      rotateZ: compactPackageCarousel ? -offset * 2.3 : -offset * 2.8,
      rotateY: -offset * 7,
      opacity: distance === 0 ? 1 : compactPackageCarousel ? .56 : distance === 1 ? .88 : .58,
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
            <h2 id="lz-packages-title">Good things, together.</h2>
          </div>
          <div className="lz-packages__stage" ref={packageStage} role="group" aria-roledescription="carousel" aria-label="Salon packages" onMouseEnter={() => setPackagePaused(true)} onMouseLeave={() => setPackagePaused(false)} onFocus={() => setPackagePaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setPackagePaused(false); }} onKeyDown={(event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); movePackage(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); movePackage(1); } }}>
            <div className="lz-packages__circles">
              <AnimatePresence custom={packageDirection} initial={false}>
                {visiblePackageCards.map(({ offset, item }) => {
                  const itemIndex = featuredPackages.findIndex((candidate) => candidate.id === item.id);
                  const priorCenter = (packageIndex - packageDirection + featuredPackages.length) % featuredPackages.length;
                  let priorOffset = (itemIndex - priorCenter + featuredPackages.length) % featuredPackages.length;
                  if (priorOffset > Math.floor(featuredPackages.length / 2)) priorOffset -= featuredPackages.length;
                  const distance = Math.abs(offset);
                  const pose = packagePose(offset);
                  const previousPose = packagePose(priorOffset);
                  const initialPose = priorOffset > Math.max(...packageOffsets) || priorOffset < Math.min(...packageOffsets)
                    ? { ...previousPose, opacity: 0 }
                    : previousPose;
                  return <motion.div className="lz-package-orbit" key={item.id} role="listitem" aria-label={item.title} initial={packageCarouselInteracted.current ? initialPose : false} animate={pose} exit={(direction: number) => ({ x: (offset - direction) * packageStep, opacity: 0, scale: .5, transition: { duration: reducedMotion ? .01 : .42, ease: [0.22, 1, 0.36, 1] } })} transition={reducedMotion ? { duration: .01 } : { type: 'spring', stiffness: 105, damping: 20, mass: .8 }} style={{ zIndex: 10 - distance }}>
                    <motion.button className="lz-package-circle" type="button" layoutId={`layali-package-${item.id}`} onClick={() => offset === 0 ? setSelectedPackage(item) : movePackage(offset)} animate={reducedMotion ? { y: 0, rotateZ: 0 } : { y: [0, -5, 0, 4, 0], rotateZ: [0, .28, 0, -.28, 0] }} transition={reducedMotion ? { duration: .01 } : { y: { duration: 5.2, ease: 'easeInOut', repeat: Infinity, delay: itemIndex * .055 }, rotateZ: { duration: 6.3, ease: 'easeInOut', repeat: Infinity, delay: itemIndex * .055 } }} whileHover={reducedMotion ? undefined : { scale: pose.scale * 1.045, y: -8 }} whileTap={reducedMotion ? undefined : { scale: pose.scale * .98 }} aria-current={offset === 0 ? 'true' : undefined} aria-label={offset === 0 ? `View ${item.title}, ${item.price}` : `Show ${item.title} in the centre`} style={{ backgroundImage: `url("${item.image}")` }}>
                      <small>{item.category}</small><strong>{item.title}</strong>
                    </motion.button>
                  </motion.div>;
                })}
              </AnimatePresence>
            </div>
          </div>
          <div className="lz-packages__controls" aria-label="Package carousel controls">
            <button className="lz-package-arrow" type="button" onClick={() => movePackage(-1)} aria-label="Previous package"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M13 10H6m0 0 3.5-3.5M6 10l3.5 3.5" /></svg></button>
            <button className="lz-package-arrow" type="button" onClick={() => movePackage(1)} aria-label="Next package"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 10h7m0 0-3.5-3.5M14 10l-3.5 3.5" /></svg></button>
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

        {featuredOffers.length > 0 && <section className="lz-offers" id="offers" aria-labelledby="lz-offers-title" onKeyDown={(event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); moveOffer(-1); } if (event.key === 'ArrowRight') { event.preventDefault(); moveOffer(1); } }}>
          <motion.div className="lz-offers__figure" initial={reducedMotion || disableInitialAnimations ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: reducedMotion ? .01 : .75, ease: [.2,.75,.2,1] }}>
            <img src={offerPortrait} alt="Layali Al Zahra beauty campaign portrait" loading="lazy" />
          </motion.div>
          <div className="lz-offers__content">
            <motion.div className="lz-offers__heading" initial={reducedMotion || disableInitialAnimations ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: .35 }} transition={{ duration: reducedMotion ? .01 : .72, ease: [.2,.75,.2,1] }}>
              <div><p className="lz-eyebrow">A LITTLE EXTRA</p><h2 id="lz-offers-title">Good things,<br />for today.</h2></div>
              <p>Offers to make a little time for yourself.</p>
            </motion.div>
            <AnimatePresence initial={false} mode="wait">
              <motion.div key={offerIndex} className="lz-offers__grid" role="group" aria-roledescription="carousel" aria-label="Salon offers" initial={reducedMotion ? false : { opacity: 0, scale: .99 }} animate={{ opacity: 1, scale: 1 }} exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: .99 }} transition={{ duration: reducedMotion ? .01 : .28, ease: [.22,1,.36,1] }}>
                {visibleOffers.map(({ item }) => <div className="lz-offer-slot" key={item.id}>
                  <a className="lz-offer-card" href={item.bookingUrl || bookingUrl} target="_blank" rel="noreferrer" style={{ '--offer-image': `url("${item.image}")` } as React.CSSProperties}>
                    <span className="lz-offer-card__top"><span className="lz-offer-card__badge">{item.badge}</span><span className="lz-offer-card__validity">{item.validUntil}</span></span>
                    <span className="lz-offer-card__copy"><strong>{item.title.replace(/^((Monday|Midday) Offer\s*[–-]\s*)/i, '')}</strong><span>{item.description}</span></span>
                  </a>
                </div>)}
              </motion.div>
            </AnimatePresence>
            {featuredOffers.length > 1 && <div className="lz-offers__controls" aria-label="Offer carousel controls">
              <button className="lz-offers__arrow" type="button" onClick={() => moveOffer(-1)} aria-label="Previous offers"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M13 10H6m0 0 3.5-3.5M6 10l3.5 3.5" /></svg></button>
              <button className="lz-offers__arrow" type="button" onClick={() => moveOffer(1)} aria-label="Next offers"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 10h7m0 0-3.5-3.5M14 10l-3.5 3.5" /></svg></button>
            </div>}
          </div>
        </section>}

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
        <section className="lz-contact" aria-labelledby="lz-contact-title">
          <div className="lz-contact__intro">
            <img className="lz-footer__logo" src={brandLogoLight} alt="Layali Al Zahra Beauty Salon" />
            <p className="lz-eyebrow">A MOMENT, JUST FOR YOU</p>
            <h2 id="lz-contact-title">Contact us.</h2>
            <p>Tell us what you have in mind. We’ll help you find the right treatment and a time that works.</p>
            <div className="lz-contact__meta">
              <div id="lounge"><span>VISIT THE LOUNGE</span><a href={mapUrl} target="_blank" rel="noreferrer">Shop 1, Al Telal 11<br />Al Barsha 1, Dubai</a></div>
              <div><span>CALL OR WRITE</span><a href="tel:+971523706025">+971 52 370 6025</a><a href="mailto:info@layalialzahra.com">info@layalialzahra.com</a></div>
              <div><span>OPENING HOURS</span><p>Daily, 10 am to 9 pm<br />Friday, 1 pm to 8:30 pm</p></div>
              <div><span>DIRECT MESSAGE</span><a href="https://wa.me/971523706025" target="_blank" rel="noreferrer">WhatsApp</a></div>
            </div>
          </div>
          <form className="lz-contact__form" onSubmit={async (event) => {
            event.preventDefault();
            setContactSubmitting(true);
            setContactStatus(null);
            try {
              const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ access_key: '020bb06c-0030-4a16-8ce7-6c9224cd5079', subject: 'New enquiry from Layali Al Zahra website', from_name: contactForm.name, ...contactForm }),
              });
              const result = await response.json();
              if (!result.success) throw new Error('Submission failed');
              setContactStatus({ message: 'Thank you. Your message has been sent.', success: true });
              setContactForm({ name: '', email: '', message: '' });
            } catch {
              setContactStatus({ message: 'We could not send that just now. Please contact us by WhatsApp or phone.', success: false });
            } finally { setContactSubmitting(false); }
          }}>
            <label htmlFor="lz-contact-name">Your name<input id="lz-contact-name" name="name" autoComplete="name" placeholder="Name" required value={contactForm.name} onChange={(event) => setContactForm({ ...contactForm, name: event.target.value })} /></label>
            <label htmlFor="lz-contact-email">Email address<input id="lz-contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required value={contactForm.email} onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })} /></label>
            <label htmlFor="lz-contact-message">How can we help?<textarea id="lz-contact-message" name="message" rows={3} placeholder="Your message" required value={contactForm.message} onChange={(event) => setContactForm({ ...contactForm, message: event.target.value })} /></label>
            {contactStatus && <p className={`lz-contact__status${contactStatus.success ? ' lz-contact__success' : ''}`} role="status">{contactStatus.message}</p>}
            <button className="lz-contact__send" type="submit" disabled={contactSubmitting}>{contactSubmitting ? 'Sending…' : 'Send an enquiry'}</button>
          </form>
        </section>
        <div className="lz-footer__bottom"><span>© {new Date().getFullYear()} Layali Al Zahra Beauty Salon LLC</span><a href="#top">Back to the beginning</a></div>
      </footer>
    </div>
  );
}
