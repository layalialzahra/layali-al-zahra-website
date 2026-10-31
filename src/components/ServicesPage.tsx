import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { legacyServicesData } from '../data/legacy-services.js';
import { loadPublicServices, loadPublicFaqs } from '../data/managed-content-public.js';
import { legacyFaqs } from '../data/legacy-faqs.js';

const phoneNumbers = [
  { label: 'Mobile 1', number: '+971 52 370 6025', link: 'tel:+971523706025' },
  { label: 'Mobile 2', number: '+971 50 614 3199', link: 'tel:+971506143199' },
  { label: 'Tel 1', number: '+971 4 347 5545', link: 'tel:+97143475545' },
  { label: 'Tel 2', number: '+971 4 357 1060', link: 'tel:+97143571060' },
];
const categoryFor = (title: string) => {
  const value = title.toLowerCase();
  if (/hair|colour|color|blow.?dry|styling|cut|keratin|treatment/.test(value)) return 'Hair';
  if (/nail|manicure|pedicure|polish|acrylic|gel/.test(value)) return 'Nails';
  if (/lash|brow|eyebrow|eyelash/.test(value)) return 'Lashes & brows';
  if (/facial|skin|cleanse|peel|aesthetic/.test(value)) return 'Skin & facials';
  if (/wax|massage|body|scrub|spa/.test(value)) return 'Body & spa';
  if (/make.?up|bridal|henna/.test(value)) return 'Makeup & occasion';
  return 'Beauty rituals';
};

export default function ServicesPage() {
  const [servicesData, setServicesData] = useState(legacyServicesData);
  const [faqs, setFaqs] = useState(legacyFaqs.services);
  const [selectedService, setSelectedService] = useState<(typeof legacyServicesData)[0] | null>(null);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All services');
  const [searchQuery, setSearchQuery] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);
  const moveCarousel = (direction: -1 | 1) => { const track = carouselRef.current; if (!track) return; const card = track.querySelector<HTMLElement>('.lz-card'); const distance = card ? card.offsetWidth + 22 : track.clientWidth * 0.8; track.scrollBy({ left: direction * distance, behavior: 'smooth' }); };

  useEffect(() => {
    let active = true;
    void Promise.all([loadPublicServices(), loadPublicFaqs('services')]).then(([services, loadedFaqs]) => {
      if (!active) return;
      setServicesData(services as typeof legacyServicesData);
      setFaqs(loadedFaqs as typeof legacyFaqs.services);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const root = document.querySelector('.lz-services-page');
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const targets = root.querySelectorAll('.lz-intro, .lz-card, .lz-ritual, .lz-faq, .lz-last-cta');
    targets.forEach((target) => target.classList.add('lz-reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('lz-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [servicesData.length]);

  const categories = useMemo(() => ['All services', ...Array.from(new Set(servicesData.map((service) => categoryFor(service.title))))], [servicesData]);
  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return servicesData.filter((service) => {
      const matchesCategory = activeCategory === 'All services' || categoryFor(service.title) === activeCategory;
      const matchesQuery = !query || service.title.toLowerCase().includes(query) || service.subservices.some((item) => item.name.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [servicesData, activeCategory, searchQuery]);

  const bookUrl = 'https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services';
  const whatsappUrl = 'https://wa.me/971523706025?text=Hi!%20I%E2%80%99d%20like%20to%20book%20an%20appointment%20at%20Layali%20Al%20Zahra%20Beauty%20Lounge.%20Could%20you%20please%20share%20the%20available%20slots%20and%20details%3F';

  return (
    <div className="lz-services-page min-h-screen overflow-hidden bg-[#17120f] text-[#f3eadc]">
      <style>{`
        .lz-services-page{--lz-bg:#17120f;--lz-panel:#241a14;--lz-panel-2:#302219;--lz-cream:#f3eadc;--lz-muted:#c5b7a6;--lz-gold:#c8a77d;position:relative;width:100%;overflow:hidden;background:#17120f!important;color:#f3eadc!important;font-family:Montserrat,Arial,sans-serif}
        .lz-services-page,.lz-services-page *{box-sizing:border-box}
        .lz-services-page .lz-hero{position:relative;isolation:isolate;display:flex;align-items:center;min-height:clamp(560px,66vw,760px);background:#201710!important;overflow:hidden}
        .lz-services-page .lz-hero>img{position:absolute!important;inset:0!important;z-index:-2!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center 42%;opacity:.62;transform:scale(1.025);animation:lzHeroDrift 18s ease-in-out infinite alternate}
        .lz-services-page .lz-hero>div.absolute{position:absolute;inset:0;z-index:-1}
        .lz-services-page .lz-hero>div.absolute:first-of-type{background:linear-gradient(90deg,rgba(13,10,8,.92) 0%,rgba(13,10,8,.65) 43%,rgba(13,10,8,.08) 100%)}
        .lz-services-page .lz-hero>div.absolute:nth-of-type(2){background:linear-gradient(0deg,#17120f 0%,transparent 27%,rgba(15,10,8,.1) 100%)}
        .lz-services-page .lz-hero h1,.lz-services-page .lz-intro h2,.lz-services-page .lz-ritual h2,.lz-services-page .lz-faq h2,.lz-services-page .lz-last-cta h2{font-family:Georgia,'Times New Roman',serif!important;font-weight:400!important;letter-spacing:-.045em}
        .lz-services-page .lz-hero h1{font-size:clamp(3.7rem,7.8vw,7.3rem)!important;line-height:.94!important;color:#f3eadc!important}
        .lz-services-page .lz-hero h1 em,.lz-services-page h2 em{color:#c8a77d!important}
        .lz-services-page .lz-hero p{max-width:540px;color:#dfd1c1!important;line-height:1.85}
        .lz-services-page .lz-intro{background:#17120f!important;padding:82px 24px 44px!important;text-align:center}
        .lz-services-page .lz-intro h2{font-size:clamp(2.5rem,5vw,4.7rem)!important;line-height:1.05!important;color:#f3eadc!important}
        .lz-services-page .lz-intro p{color:#c5b7a6!important}
        .lz-services-page .lz-tools{position:sticky;top:0;z-index:30;background:rgba(23,18,15,.96)!important;border-color:rgba(226,202,171,.2)!important;backdrop-filter:blur(18px);box-shadow:0 12px 28px rgba(0,0,0,.12)}
        .lz-services-page .lz-tools button{font-family:Montserrat,Arial,sans-serif}
        .lz-services-page .lz-tools input{color:#f3eadc!important}
        .lz-services-page .lz-menu{background:#17120f!important;padding-top:36px!important}
        .lz-services-page .lz-carousel-track{display:flex;gap:22px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:5px 2px 24px;scrollbar-width:none;-ms-overflow-style:none}.lz-services-page .lz-carousel-track::-webkit-scrollbar{display:none}.lz-services-page .lz-card{display:flex!important;flex:0 0 calc((100% - 44px)/3)!important;flex-direction:column!important;min-width:0;overflow:hidden;background:linear-gradient(145deg,#302219,#1d1510)!important;border:1px solid rgba(226,202,171,.2)!important;border-radius:2px!important;box-shadow:0 8px 26px rgba(0,0,0,.12);scroll-snap-align:start;transition:transform .45s cubic-bezier(.2,.7,.2,1),border-color .35s,box-shadow .35s;animation:lzCardIn .7s both}
        .lz-services-page .lz-card:hover{transform:translateY(-7px)!important;border-color:rgba(200,167,125,.72)!important;box-shadow:0 22px 46px rgba(0,0,0,.3)}
        .lz-services-page .lz-card-image{position:relative!important;display:block!important;height:clamp(190px,21vw,270px)!important;min-height:190px!important;overflow:hidden!important;background:#30241c!important}
        .lz-services-page .lz-card-image img{position:absolute!important;inset:0!important;display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;opacity:1!important;filter:saturate(.78) contrast(1.03);transition:transform .85s cubic-bezier(.2,.7,.2,1),filter .5s}
        .lz-services-page .lz-card:hover .lz-card-image img{transform:scale(1.07)!important;filter:saturate(.98) contrast(1.05)}
        .lz-services-page .lz-card-image>div{position:absolute;inset:0;pointer-events:none;background:linear-gradient(0deg,rgba(14,10,8,.12),transparent 45%)}
        .lz-services-page .lz-card>div:last-child{display:flex;flex:1;flex-direction:column;padding:22px!important}
        .lz-services-page .lz-card h3{margin:0;font-family:Georgia,'Times New Roman',serif!important;font-size:clamp(1.35rem,2vw,1.8rem)!important;line-height:1.13!important;font-weight:400!important;color:#f3eadc!important}
        .lz-services-page .lz-card>div:last-child>div{color:#c5b7a6!important}
        .lz-services-page .lz-card button{color:#d7b58a!important;border:0;background:none;padding:0;font:500 11px Montserrat,Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase}
        .lz-services-page .lz-card button:hover{color:#f0d2a8!important}
        .lz-services-page .lz-ritual{background:#211711!important;border-color:rgba(226,202,171,.2)!important}
        .lz-services-page .lz-ritual img{display:block;width:100%;height:clamp(300px,40vw,480px)!important;object-fit:cover;filter:saturate(.78);box-shadow:0 24px 60px rgba(0,0,0,.25)}
        .lz-services-page .lz-ritual h2{font-size:clamp(2.6rem,5vw,4.6rem)!important;line-height:1.02!important;color:#f3eadc!important}
        .lz-services-page .lz-ritual p,.lz-services-page .lz-ritual .text-sm{color:#c5b7a6!important}
        .lz-services-page .lz-faq{background:#17120f!important}
        .lz-services-page .lz-faq h2{font-size:clamp(2.6rem,5vw,4.4rem)!important;color:#f3eadc!important}
        .lz-services-page .lz-faq summary{list-style:none;color:#f3eadc!important;transition:color .2s}
        .lz-services-page .lz-faq summary::-webkit-details-marker{display:none}
        .lz-services-page .lz-faq summary:hover{color:#d7b58a!important}
        .lz-services-page .lz-faq details p{color:#c5b7a6!important}
        .lz-services-page .lz-last-cta{background:radial-gradient(ellipse at 50% 0%,rgba(127,83,49,.3),transparent 62%),linear-gradient(115deg,#35251a,#1b1410)!important;border-color:rgba(226,202,171,.2)!important}
        .lz-services-page .lz-last-cta h2{font-size:clamp(2.7rem,5vw,4.8rem)!important;color:#f3eadc!important}
        .lz-services-page .lz-last-cta p{color:#c5b7a6!important}
        .lz-services-page .lz-reveal{opacity:0;transform:translateY(28px);transition:opacity .8s ease,transform .8s cubic-bezier(.2,.7,.2,1)}
        .lz-services-page .lz-reveal.lz-visible{opacity:1;transform:translateY(0)}
        @keyframes lzHeroDrift{from{transform:scale(1.025) translate3d(0,0,0)}to{transform:scale(1.09) translate3d(-1%,1%,0)}}
        @keyframes lzCardIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:900px){.lz-services-page .lz-card{flex-basis:calc((100% - 22px)/2)!important}}
        @media(max-width:760px){
          .lz-services-page .lz-hero{min-height:590px!important;align-items:flex-end!important}
          .lz-services-page .lz-hero>img{object-position:58% center;opacity:.48}
          .lz-services-page .lz-hero>div.absolute:first-of-type{background:linear-gradient(0deg,rgba(13,10,8,.96),rgba(13,10,8,.55) 58%,rgba(13,10,8,.18))}
          .lz-services-page .lz-hero h1{font-size:clamp(3.3rem,13vw,5rem)!important}
          .lz-services-page .lz-intro{padding:60px 18px 30px!important}
          .lz-services-page .lz-card{display:flex!important;flex:0 0 min(82vw,340px)!important;min-height:0!important}
          .lz-services-page .lz-card-image{height:205px!important;min-height:205px!important}
          .lz-services-page .lz-card>div:last-child{padding:18px!important}
          .lz-services-page .lz-card h3{font-size:1.35rem!important}
          .lz-services-page .lz-ritual img{height:280px!important}
        }
        @media(prefers-reduced-motion:reduce){.lz-services-page .lz-hero>img,.lz-services-page .lz-card,.lz-services-page .lz-reveal{animation:none!important;transition:none!important;transform:none!important}.lz-services-page .lz-reveal{opacity:1!important}}
      `}</style>
      <section className="lz-hero relative isolate flex min-h-[570px] items-end bg-[#201710] md:min-h-[620px] md:items-center">
        {servicesData[0]?.image && <img className="absolute inset-0 -z-20 h-full w-full object-cover object-center opacity-45" src={servicesData[0].image} alt="" aria-hidden="true" fetchPriority="high" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#100d0b]/95 via-[#100d0b]/65 to-[#100d0b]/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#17120f] via-transparent to-[#17120f]/10" />
        <div className="mx-auto w-full max-w-7xl px-5 pb-12 pt-28 md:px-8 md:pb-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-3 text-xs uppercase tracking-[.24em] text-[#c8a77d] before:h-px before:w-7 before:bg-current">Layali Al Zahra · Dubai</span>
            <h1 className="mt-7 font-serif text-5xl font-normal leading-[.98] tracking-[-.045em] sm:text-6xl md:text-8xl">Your moment.<br /><em className="text-[#c8a77d]">Your ritual.</em></h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#d6c9ba] md:text-lg">Thoughtfully chosen beauty rituals, delivered with care. Discover the services that help you feel polished, restored and entirely yourself.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="inline-flex min-h-12 items-center rounded-full border border-[#c8a77d] bg-[#c8a77d] px-6 text-sm font-medium text-[#1c140e] transition hover:bg-[#e0c29b]" href="#lz-service-menu">Explore services</a>
              <a className="inline-flex min-h-12 items-center rounded-full border border-[#f3eadc]/40 bg-white/5 px-6 text-sm transition hover:border-[#c8a77d]" href={bookUrl} target="_blank" rel="noreferrer">Book an appointment</a>
            </div>
            
          </div>
        </div>
      </section>

      <section className="lz-intro px-5 pb-10 pt-20 text-center md:pb-12 md:pt-28">
        <div className="mx-auto max-w-3xl"><span className="inline-flex items-center gap-3 text-xs uppercase tracking-[.24em] text-[#c8a77d] before:h-px before:w-7 before:bg-current">The service edit</span>
          <h2 className="mt-5 font-serif text-4xl font-normal leading-tight tracking-[-.04em] md:text-6xl">A little time, <em className="text-[#c8a77d]">just for you.</em></h2>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-[#c5b7a6]">From everyday essentials to special-occasion finishing touches, find your service and explore the options available at our Al Barsha salon.</p>
        </div>
      </section>

      <div id="lz-service-menu" className="lz-tools sticky top-0 z-20 border-y border-[#e2caab]/20 bg-[#17120f]/95 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 md:px-8">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter services by category">
            {categories.map((category) => <button key={category} type="button" aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)} className={'min-h-10 shrink-0 rounded-full border px-4 text-xs transition ' + (activeCategory === category ? 'border-[#f3eadc] bg-[#f3eadc] text-[#211711]' : 'border-[#e2caab]/20 text-[#cbbdad] hover:border-[#c8a77d] hover:text-[#f3eadc]')}>{category}</button>)}
          </div>
          <label className="flex w-full items-center gap-3 border-b border-[#f3eadc]/25 py-2 text-[#c5b7a6] md:ml-auto md:max-w-xs"><Search size={17} aria-hidden="true" /><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Find a service…" aria-label="Search services" className="w-full bg-transparent text-sm text-[#f3eadc] outline-none placeholder:text-[#9d8e7e]" /></label>
        </div>
      </div>

      <section className="lz-menu px-4 pb-20 pt-8 md:px-8 md:pb-28"><div className="mx-auto max-w-7xl">
        <div className="lz-carousel-heading">
          <div><p className="text-[10px] uppercase tracking-[.2em] text-[#c8a77d]">{activeCategory === 'All services' ? 'The service collection' : activeCategory}</p><p className="mt-2 text-xs text-[#a99a89]">{filteredServices.length} services to explore</p></div>
          <div className="lz-carousel-controls" aria-label="Carousel controls"><button type="button" onClick={() => moveCarousel(-1)} aria-label="Previous services">Previous</button><button type="button" onClick={() => moveCarousel(1)} aria-label="Next services">Next</button></div>
        </div>
        <div ref={carouselRef} className="lz-carousel-track" aria-label="Salon services carousel">
          {filteredServices.map((service) => <article key={service.id} className="lz-card group">
            <div className="lz-card-image"><img src={service.image} alt={service.title + ' at Layali Al Zahra Beauty Salon in Dubai'} loading="lazy" /><div /></div>
            <div><h3>{service.title}</h3><div className="mt-3 mb-5 text-xs">{service.subservices.length} {service.subservices.length === 1 ? 'treatment' : 'treatments'} available</div>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e2caab]/20 pt-4"><span className="text-[10px] uppercase tracking-[.12em] text-[#a99a89]">Explore category</span><button type="button" onClick={() => setSelectedService(service)} aria-label={'View ' + service.title + ' services'}>View services</button></div>
            </div>
          </article>)}
          {filteredServices.length === 0 && <div className="min-w-full border border-[#e2caab]/20 px-5 py-14 text-center text-[#c5b7a6]"><p>No services match that search.</p><button type="button" className="mt-3 text-sm text-[#c8a77d]" onClick={() => { setSearchQuery(''); setActiveCategory('All services'); }}>Clear filters</button></div>}
        </div>
      </div></section>

      <section className="lz-ritual border-y border-[#e2caab]/20 bg-[#211711] px-5 py-16 md:px-8 md:py-24"><div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2 md:gap-14">
        {servicesData[1]?.image && <img className="h-72 w-full object-cover saturate-75 md:order-2 md:h-[440px]" src={servicesData[1].image} alt="A beauty service at Layali Al Zahra Beauty Lounge" loading="lazy" />}
        <div><span className="inline-flex items-center gap-3 text-xs uppercase tracking-[.24em] text-[#c8a77d] before:h-px before:w-7 before:bg-current">The Layali experience</span><h2 className="mt-5 font-serif text-4xl font-normal leading-tight tracking-[-.04em] md:text-6xl">Beauty, with room to <em className="text-[#c8a77d]">breathe.</em></h2>
          <p className="mt-5 max-w-lg leading-8 text-[#c5b7a6]">Your visit should feel as considered as the result. Our team is here to help you choose the right service, understand your options and make time for yourself.</p>
          <div className="mt-6 space-y-3 text-sm leading-7 text-[#d2c3b1]"><p>Thoughtful care, tailored to your needs.</p><p>A welcoming team, ready to help you choose.</p></div>
          <a className="mt-8 inline-flex min-h-12 items-center rounded-full border border-[#c8a77d] bg-[#c8a77d] px-6 text-sm font-medium text-[#1c140e] transition hover:bg-[#e0c29b]" href={bookUrl} target="_blank" rel="noreferrer">Find your appointment</a>
        </div>
      </div></section>

      <section className="lz-faq px-5 py-16 md:px-8 md:py-24"><div className="mx-auto max-w-4xl">
        <div className="mb-9 text-center"><span className="inline-flex items-center gap-3 text-xs uppercase tracking-[.24em] text-[#c8a77d] before:h-px before:w-7 before:bg-current">Good to know</span><h2 className="mt-5 font-serif text-4xl font-normal md:text-6xl">Before your visit</h2><p className="mt-3 text-sm text-[#c5b7a6]">Helpful answers to make planning your appointment easier.</p></div>
        <div className="border-t border-[#e2caab]/20">{faqs.map((faq, index) => <details key={index} className="group border-b border-[#e2caab]/20"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 font-serif text-lg marker:hidden sm:text-xl">{faq.q}<span className="text-xl text-[#c8a77d] transition group-open:rotate-45">+</span></summary><p className="max-w-3xl pb-6 pr-8 text-sm leading-7 text-[#c5b7a6]">{faq.a}</p></details>)}</div>
      </div></section>

      <section className="lz-last-cta border-t border-[#e2caab]/20 bg-gradient-to-br from-[#35251a] to-[#1b1410] px-5 py-16 text-center md:px-8 md:py-24"><div className="mx-auto max-w-3xl">
        <span className="inline-flex items-center gap-3 text-xs uppercase tracking-[.24em] text-[#c8a77d] before:h-px before:w-7 before:bg-current">Your time starts here</span><h2 className="mt-5 font-serif text-4xl font-normal leading-tight tracking-[-.04em] md:text-6xl">Make space for <em className="text-[#c8a77d]">yourself.</em></h2><p className="mx-auto mt-4 max-w-xl leading-7 text-[#c5b7a6]">Choose your service online or reach out to our team if you would like help finding the right one.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><a className="inline-flex min-h-12 items-center rounded-full border border-[#c8a77d] bg-[#c8a77d] px-5 text-sm font-medium text-[#1c140e] transition hover:bg-[#e0c29b]" href={bookUrl} target="_blank" rel="noreferrer">Book now</a><button type="button" className="inline-flex min-h-12 items-center rounded-full border border-[#f3eadc]/40 px-5 text-sm transition hover:border-[#c8a77d]" onClick={() => setShowPhoneDialog(true)}>Contact us</button><a className="inline-flex min-h-12 items-center rounded-full border border-[#f3eadc]/40 px-5 text-sm transition hover:border-[#c8a77d]" href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a><a className="inline-flex min-h-12 items-center rounded-full border border-[#f3eadc]/40 px-5 text-sm transition hover:border-[#c8a77d]" href="https://drive.google.com/file/d/1nakcllVMlJWBZr5ZLhyQuw2W2Ua93ZF0/view?usp=sharing" target="_blank" rel="noreferrer">Price list</a></div>
      </div></section>

      <Dialog open={!!selectedService} onOpenChange={(open) => { if (!open) setSelectedService(null); }}><DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto"><DialogHeader><DialogTitle className="text-[#c8a77d] text-center mb-2">{selectedService?.title}</DialogTitle><DialogDescription className="text-center">Explore the available services and pricing.</DialogDescription></DialogHeader>
        {selectedService && <div><img src={selectedService.image} alt={selectedService.title + ' at Layali Al Zahra'} className="w-full h-56 object-cover rounded-md mb-5" /><div className="space-y-2">{selectedService.subservices.map((subservice, index) => <div key={index} className="flex justify-between items-start gap-4 p-4 bg-[#2a2019] rounded-md"><span className="text-[#f3eadc]">{subservice.name}</span><span className="text-[#d7b58a] whitespace-nowrap">{subservice.price}</span></div>)}</div><div className="mt-5 text-center"><a className="inline-flex items-center gap-2 rounded-full bg-[#c8a77d] px-6 py-3 text-[#211711]" href={bookUrl} target="_blank" rel="noreferrer">Book this service</a></div></div>}
      </DialogContent></Dialog>
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}><DialogContent><DialogHeader><DialogTitle className="text-[#c8a77d] text-center mb-3">Contact Layali Al Zahra</DialogTitle><DialogDescription className="text-center">Choose the number that works best for you.</DialogDescription></DialogHeader><div className="space-y-2">{phoneNumbers.map((phone) => <a key={phone.link} href={phone.link} className="flex items-center justify-between gap-4 p-4 bg-[#2a2019] rounded-md hover:bg-[#35251a] transition-colors"><span className="text-[#e4d8c8]">{phone.label}</span><span className="text-rose-700">{phone.number}</span></a>)}</div></DialogContent></Dialog>
    </div>
  );
}
