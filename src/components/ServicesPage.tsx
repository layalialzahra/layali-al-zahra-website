import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { legacyServicesData } from '../data/legacy-services.js';
import { loadPublicServices, loadPublicFaqs } from '../data/managed-content-public.js';
import { legacyFaqs } from '../data/legacy-faqs.js';

const phoneNumbers = [
  { label: 'Mobile', number: '+971 52 370 6025', link: 'tel:+971523706025' },
  { label: 'Telephone', number: '+971 4 347 5545', link: 'tel:+97143475545' },
  { label: 'Telephone', number: '+971 4 357 1060', link: 'tel:+97143571060' },
];

const categoryFor = (title: string) => {
  const value = title.toLowerCase();
  if (/hair removal|wax|threading|bleach/.test(value)) return 'Skin & body';
  if (/nail|manicure|pedicure|polish|acrylic|gel/.test(value)) return 'Nails';
  if (/lash|brow|eyebrow|eyelash/.test(value)) return 'Lashes & brows';
  if (/facial|skin|cleanse|peel|aesthetic/.test(value)) return 'Skin & body';
  if (/massage|body|scrub|spa/.test(value)) return 'Wellbeing';
  if (/make.?up|bridal|henna/.test(value)) return 'Occasion';
  if (/hair|colour|color|blow.?dry|styling|cut|keratin|treatment|extension/.test(value)) return 'Hair';
  return 'Little luxuries';
};

const categoryCopy: Record<string, string> = {
  Hair: 'A considered approach to cut, colour and care. Find the finish, treatment or transformation that feels like you.',
  Nails: 'From a beautifully finished manicure to detailed extensions, discover the small details that make a difference.',
  'Lashes & brows': 'Thoughtful definition, soft enhancements and precise finishing touches, tailored to your features.',
  'Skin & body': 'Feel-good essentials and targeted care, with treatments selected to leave you feeling refreshed.',
  Wellbeing: 'Make a little room to slow down. Explore restorative massages and rituals designed around your time.',
  Occasion: 'For celebrations, meaningful moments and days when you want every detail to feel just right.',
  'Little luxuries': 'A little something for younger guests and anyone who enjoys a thoughtful finishing touch.',
};

const categoryOrder = ['Hair', 'Nails', 'Lashes & brows', 'Skin & body', 'Wellbeing', 'Occasion', 'Little luxuries'];

export default function ServicesPage() {
  const [servicesData, setServicesData] = useState(legacyServicesData);
  const [faqs, setFaqs] = useState(legacyFaqs.services);
  const [selectedService, setSelectedService] = useState<(typeof legacyServicesData)[0] | null>(null);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Hair');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;
    void Promise.all([loadPublicServices(), loadPublicFaqs('services')]).then(([services, loadedFaqs]) => {
      if (!active) return;
      setServicesData(services as typeof legacyServicesData);
      setFaqs(loadedFaqs as typeof legacyFaqs.services);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => categoryOrder.filter((category) => servicesData.some((service) => categoryFor(service.title) === category)), [servicesData]);
  const groupedServices = useMemo(() => servicesData.reduce<Record<string, typeof legacyServicesData>>((groups, service) => {
    const category = categoryFor(service.title);
    (groups[category] ||= []).push(service);
    return groups;
  }, {}), [servicesData]);

  const query = searchQuery.trim().toLowerCase();
  const visibleServices = useMemo(() => {
    if (query) return servicesData.filter((service) => service.title.toLowerCase().includes(query) || service.subservices.some((item) => item.name.toLowerCase().includes(query)));
    return groupedServices[activeCategory] || [];
  }, [servicesData, groupedServices, activeCategory, query]);

  const bookUrl = 'https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services';
  const whatsappUrl = 'https://wa.me/971523706025?text=Hi!%20I%E2%80%99d%20like%20to%20book%20an%20appointment%20at%20Layali%20Al%20Zahra%20Beauty%20Lounge.%20Could%20you%20please%20share%20the%20available%20slots%20and%20details%3F';
  const activeImage = visibleServices[0]?.image || servicesData[0]?.image;

  return (
    <main className="lz-services-page">
      <style>{`
        .lz-services-page{--ink:#211a16;--espresso:#211711;--paper:#eee7dc;--paper-deep:#e4dacb;--muted:#786d61;--gold:#a98255;--line:rgba(42,31,23,.18);background:var(--paper);color:var(--ink);font-family:Montserrat,Arial,sans-serif;overflow:hidden}
        .lz-services-page *{box-sizing:border-box}
        .lz-services-page .lz-editorial-hero{display:grid;grid-template-columns:minmax(0,1.02fr) minmax(380px,.98fr);min-height:650px;background:var(--paper)}
        .lz-services-page .lz-hero-copy{display:flex;flex-direction:column;justify-content:center;padding:80px clamp(28px,7vw,112px) 84px max(28px,calc((100vw - 1280px)/2))}
        .lz-services-page .lz-kicker{display:flex;align-items:center;gap:13px;color:var(--gold);font-size:10px;font-weight:600;letter-spacing:.24em;text-transform:uppercase}
        .lz-services-page .lz-kicker:before{content:"";width:32px;height:1px;background:currentColor}
        .lz-services-page .lz-hero-title{max-width:700px;margin:27px 0 23px;font-family:Georgia,'Times New Roman',serif;font-size:clamp(4.1rem,7.3vw,7.8rem);font-weight:400;letter-spacing:-.075em;line-height:.86;color:var(--ink)}
        .lz-services-page .lz-hero-title em{display:block;margin-left:.55em;color:var(--gold);font-weight:400}
        .lz-services-page .lz-hero-description{max-width:440px;color:#665b51;font-size:14px;line-height:2}
        .lz-services-page .lz-hero-actions{display:flex;align-items:center;gap:24px;margin-top:34px;flex-wrap:wrap}
        .lz-services-page .lz-primary-link{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 23px;background:var(--espresso);color:#f3eadc;text-decoration:none;font-size:10px;font-weight:600;letter-spacing:.13em;text-transform:uppercase;transition:background .25s,transform .25s}
        .lz-services-page .lz-primary-link:hover{background:#59402e;transform:translateY(-2px)}
        .lz-services-page .lz-text-link{color:var(--ink);font-size:11px;text-decoration:none;border-bottom:1px solid rgba(33,26,22,.45);padding:0 0 5px;transition:color .2s}
        .lz-services-page .lz-text-link:hover{color:var(--gold)}
        .lz-services-page .lz-hero-visual{position:relative;min-height:650px;overflow:hidden;background:#c9b9a6}
        .lz-services-page .lz-hero-visual img{width:100%;height:100%;position:absolute;inset:0;object-fit:cover;object-position:center;filter:saturate(.76);animation:lzEditorialDrift 22s ease-in-out infinite alternate}
        .lz-services-page .lz-hero-visual:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(20,14,10,.32),transparent 42%)}
        .lz-services-page .lz-image-caption{position:absolute;z-index:1;bottom:30px;left:34px;color:#fff7ed;font-size:9px;letter-spacing:.2em;text-transform:uppercase}
        .lz-services-page .lz-hero-index{position:absolute;z-index:1;top:28px;right:28px;color:rgba(255,248,238,.9);font-family:Georgia,serif;font-size:13px;letter-spacing:.12em}
        .lz-services-page .lz-explorer{padding:92px 28px 110px;background:#e4dacb}
        .lz-services-page .lz-explorer-inner{max-width:1320px;margin:0 auto}
        .lz-services-page .lz-explorer-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:30px;margin-bottom:48px;padding-bottom:28px;border-bottom:1px solid var(--line)}
        .lz-services-page .lz-explorer-heading h2{margin:14px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:clamp(3rem,5vw,5.1rem);font-weight:400;letter-spacing:-.06em;line-height:.98}
        .lz-services-page .lz-explorer-heading p{max-width:330px;margin:0;color:var(--muted);font-size:12px;line-height:1.9}
        .lz-services-page .lz-explorer-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:clamp(28px,5vw,76px);align-items:start}
        .lz-services-page .lz-category-index{position:sticky;top:24px;display:flex;flex-direction:column;border-top:1px solid var(--line)}
        .lz-services-page .lz-category-button{display:grid;grid-template-columns:27px minmax(0,1fr) 24px;align-items:center;gap:8px;min-height:59px;padding:9px 8px;border:0;border-bottom:1px solid var(--line);background:transparent;color:#786d61;text-align:left;cursor:pointer;transition:background .25s,color .25s,padding .25s}
        .lz-services-page .lz-category-button .lz-category-number{font-family:Georgia,serif;font-size:12px;color:#a18d77}
        .lz-services-page .lz-category-button .lz-category-name{font-family:Georgia,serif;font-size:17px;line-height:1.15}
        .lz-services-page .lz-category-button .lz-category-count{font-size:9px;text-align:right;color:#9c8e7e}
        .lz-services-page .lz-category-button:hover{color:var(--ink);padding-left:13px}
        .lz-services-page .lz-category-button.is-active{background:var(--espresso);color:#f0e6d8;padding-left:13px}
        .lz-services-page .lz-category-button.is-active .lz-category-number,.lz-services-page .lz-category-button.is-active .lz-category-count{color:#c6a77f}
        .lz-services-page .lz-service-stage{min-width:0;animation:lzStageIn .48s ease both}
        .lz-services-page .lz-stage-topline{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:19px}
        .lz-services-page .lz-stage-label{color:var(--gold);font-size:9px;font-weight:600;letter-spacing:.2em;text-transform:uppercase}
        .lz-services-page .lz-stage-count{color:#887a6b;font-size:10px;letter-spacing:.08em}
        .lz-services-page .lz-stage-feature{display:grid;grid-template-columns:minmax(240px,.78fr) minmax(0,1.22fr);min-height:420px;background:#f2ece3;box-shadow:0 16px 38px rgba(49,36,25,.06)}
        .lz-services-page .lz-stage-image{position:relative;min-height:420px;overflow:hidden;background:#cbbba8}
        .lz-services-page .lz-stage-image img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.78);transition:transform .8s cubic-bezier(.2,.7,.2,1)}
        .lz-services-page .lz-stage-feature:hover .lz-stage-image img{transform:scale(1.035)}
        .lz-services-page .lz-stage-image:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(18,13,10,.42),transparent 48%)}
        .lz-services-page .lz-stage-image-caption{position:absolute;z-index:1;left:24px;bottom:23px;color:#fff6eb;font-size:9px;letter-spacing:.17em;text-transform:uppercase}
        .lz-services-page .lz-stage-content{padding:clamp(25px,3.5vw,48px);min-width:0}
        .lz-services-page .lz-stage-title{margin:9px 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.5rem,4vw,4.1rem);font-weight:400;letter-spacing:-.06em;line-height:.98}
        .lz-services-page .lz-stage-description{max-width:480px;margin:0;color:#776b5e;font-size:11px;line-height:1.85}
        .lz-services-page .lz-search{display:flex;align-items:center;gap:10px;margin:23px 0 8px;padding:11px 0;border-bottom:1px solid var(--line);color:#8a7967}
        .lz-services-page .lz-search input{width:100%;border:0;outline:0;background:transparent;color:var(--ink);font:11px Montserrat,Arial,sans-serif}
        .lz-services-page .lz-search input::placeholder{color:#9b8d7d}
        .lz-services-page .lz-service-list{margin-top:11px;border-top:1px solid var(--line)}
        .lz-services-page .lz-service-row{display:grid;grid-template-columns:28px minmax(0,1fr) auto;align-items:center;gap:12px;padding:15px 0;border-bottom:1px solid var(--line)}
        .lz-services-page .lz-row-number{color:#a58c70;font-family:Georgia,serif;font-size:12px}
        .lz-services-page .lz-row-title{font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.25}
        .lz-services-page .lz-row-meta{margin-top:4px;color:#8d8174;font-size:9px;letter-spacing:.04em}
        .lz-services-page .lz-row-action{border:0;background:transparent;color:#80613e;padding:8px 0 8px 10px;font-size:9px;font-weight:600;letter-spacing:.11em;text-transform:uppercase;cursor:pointer;white-space:nowrap}
        .lz-services-page .lz-row-action:hover{color:#211711}
        .lz-services-page .lz-search-empty{padding:28px 0;color:#786d61;font-size:12px}
        .lz-services-page .lz-story{display:grid;grid-template-columns:1fr 1fr;min-height:430px;background:var(--espresso);color:#f0e6d8}
        .lz-services-page .lz-story-image{position:relative;min-height:430px;overflow:hidden}
        .lz-services-page .lz-story-image img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.7)}
        .lz-services-page .lz-story-copy{display:flex;flex-direction:column;justify-content:center;padding:clamp(36px,7vw,100px)}
        .lz-services-page .lz-story-copy h2{max-width:550px;margin:22px 0;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.8rem,5vw,5.2rem);font-weight:400;letter-spacing:-.06em;line-height:.98}
        .lz-services-page .lz-story-copy h2 em{color:#c8a77d;font-weight:400}
        .lz-services-page .lz-story-copy p{max-width:460px;color:#c8b9a7;font-size:12px;line-height:2}
        .lz-services-page .lz-faq{padding:94px 28px 100px;background:var(--paper)}
        .lz-services-page .lz-faq-inner{max-width:930px;margin:auto}
        .lz-services-page .lz-faq-heading{text-align:center;margin-bottom:42px}
        .lz-services-page .lz-faq-heading h2{margin:15px 0 9px;font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.8rem,5vw,4.6rem);font-weight:400;letter-spacing:-.06em}
        .lz-services-page .lz-faq-heading p{color:var(--muted);font-size:11px}
        .lz-services-page .lz-faq-list{border-top:1px solid var(--line)}
        .lz-services-page .lz-faq-list details{border-bottom:1px solid var(--line)}
        .lz-services-page .lz-faq-list summary{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:19px 2px;list-style:none;cursor:pointer;font-family:Georgia,serif;font-size:19px}
        .lz-services-page .lz-faq-list summary::-webkit-details-marker{display:none}
        .lz-services-page .lz-faq-list summary:after{content:"+";font-family:Montserrat,sans-serif;font-size:17px;color:var(--gold);transition:transform .25s}
        .lz-services-page .lz-faq-list details[open] summary:after{transform:rotate(45deg)}
        .lz-services-page .lz-faq-list details p{max-width:760px;margin:0;padding:0 30px 22px 2px;color:#776b5e;font-size:11px;line-height:1.9}
        .lz-services-page .lz-final-cta{display:flex;align-items:center;justify-content:space-between;gap:30px;padding:42px max(28px,calc((100vw - 1320px)/2));background:#d8c9b7}
        .lz-services-page .lz-final-cta h2{margin:10px 0 0;font-family:Georgia,serif;font-size:clamp(2.2rem,4vw,3.7rem);font-weight:400;letter-spacing:-.06em}
        .lz-services-page .lz-final-cta .lz-primary-link{flex-shrink:0}
        .lz-services-page .lz-dialog-content{background:#eee7dc!important;color:#211a16!important;border:1px solid rgba(42,31,23,.18)!important;border-radius:2px!important}
        .lz-services-page .lz-dialog-title{color:#211a16!important;font-family:Georgia,serif!important;font-size:30px!important;font-weight:400!important}
        .lz-services-page .lz-dialog-description{color:#786d61!important}
        .lz-services-page .lz-price-row{display:flex;justify-content:space-between;gap:18px;padding:13px 2px;border-bottom:1px solid var(--line);font-size:11px;color:#41372e}
        .lz-services-page .lz-price-row span:last-child{color:#80613e;white-space:nowrap}
        @keyframes lzEditorialDrift{from{transform:scale(1.02)}to{transform:scale(1.09)}}
        @keyframes lzStageIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:1000px){.lz-services-page .lz-editorial-hero{grid-template-columns:1fr .85fr}.lz-services-page .lz-hero-copy{padding:70px 38px}.lz-services-page .lz-explorer-layout{grid-template-columns:180px minmax(0,1fr);gap:25px}.lz-services-page .lz-stage-feature{grid-template-columns:1fr}.lz-services-page .lz-stage-image{min-height:260px}.lz-services-page .lz-stage-content{padding:28px}}
        @media(max-width:720px){.lz-services-page .lz-editorial-hero{grid-template-columns:1fr;min-height:0}.lz-services-page .lz-hero-copy{padding:72px 23px 48px}.lz-services-page .lz-hero-title{font-size:clamp(4rem,17vw,6.2rem)}.lz-services-page .lz-hero-visual{min-height:390px}.lz-services-page .lz-explorer{padding:66px 17px 75px}.lz-services-page .lz-explorer-heading{display:block;margin-bottom:25px;padding-bottom:20px}.lz-services-page .lz-explorer-heading p{margin-top:16px}.lz-services-page .lz-explorer-layout{display:flex;flex-direction:column;gap:22px}.lz-services-page .lz-category-index{position:static;width:100%;display:flex;flex-direction:row;overflow-x:auto;border-top:0;border-bottom:1px solid var(--line);scrollbar-width:none}.lz-services-page .lz-category-index::-webkit-scrollbar{display:none}.lz-services-page .lz-category-button{display:flex;flex:0 0 auto;min-height:48px;gap:7px;padding:8px 12px;border-bottom:0;white-space:nowrap}.lz-services-page .lz-category-button .lz-category-number{font-size:10px}.lz-services-page .lz-category-button .lz-category-name{font-family:Montserrat,Arial,sans-serif;font-size:10px;letter-spacing:.03em}.lz-services-page .lz-category-button .lz-category-count{display:none}.lz-services-page .lz-category-button.is-active{padding-left:12px}.lz-services-page .lz-service-stage{width:100%}.lz-services-page .lz-stage-feature{grid-template-columns:1fr}.lz-services-page .lz-stage-image{min-height:250px}.lz-services-page .lz-stage-content{padding:24px 20px}.lz-services-page .lz-stage-title{font-size:3rem}.lz-services-page .lz-row-title{font-size:16px}.lz-services-page .lz-story{grid-template-columns:1fr}.lz-services-page .lz-story-image{min-height:300px}.lz-services-page .lz-story-copy{padding:50px 24px 58px}.lz-services-page .lz-faq{padding:70px 20px}.lz-services-page .lz-faq-list summary{font-size:17px}.lz-services-page .lz-final-cta{align-items:flex-start;flex-direction:column;padding:36px 23px}.lz-services-page .lz-final-cta h2{font-size:2.7rem}}
        @media(prefers-reduced-motion:reduce){.lz-services-page *{animation:none!important;scroll-behavior:auto!important;transition:none!important}}
      `}</style>

      <section className="lz-editorial-hero">
        <div className="lz-hero-copy">
          <span className="lz-kicker">Layali Al Zahra · Al Barsha, Dubai</span>
          <h1 className="lz-hero-title">Beauty,<em>in your own time.</em></h1>
          <p className="lz-hero-description">A considered collection of hair, skin, nail and wellbeing rituals. Find the treatment that feels right for you, then leave the details to us.</p>
          <div className="lz-hero-actions">
            <a className="lz-primary-link" href="#lz-service-explorer">Discover the menu</a>
            <a className="lz-text-link" href={bookUrl} target="_blank" rel="noreferrer">Book an appointment</a>
          </div>
        </div>
        <div className="lz-hero-visual">
          {servicesData.find((service) => service.id === 'hair-treatments')?.image && <img src={servicesData.find((service) => service.id === 'hair-treatments')?.image} alt="A hair treatment at Layali Al Zahra Beauty Salon" fetchPriority="high" />}
          <span className="lz-hero-index">A LITTLE TIME, ENTIRELY YOURS</span>
          <span className="lz-image-caption">The Layali beauty experience</span>
        </div>
      </section>

      <section id="lz-service-explorer" className="lz-explorer">
        <div className="lz-explorer-inner">
          <div className="lz-explorer-heading">
            <div><span className="lz-kicker">The service directory</span><h2>Find your<br/>kind of care.</h2></div>
            <p>Explore by category. Each collection opens into its own considered menu, with clear options and pricing before you book.</p>
          </div>

          <div className="lz-explorer-layout">
            <nav className="lz-category-index" aria-label="Service categories">
              {categories.map((category, index) => <button key={category} type="button" className={'lz-category-button ' + (!query && activeCategory === category ? 'is-active' : '')} aria-pressed={!query && activeCategory === category} onClick={() => { setActiveCategory(category); setSearchQuery(''); }}>
                <span className="lz-category-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="lz-category-name">{category}</span>
                <span className="lz-category-count">{String((groupedServices[category] || []).length).padStart(2, '0')}</span>
              </button>)}
            </nav>

            <div className="lz-service-stage" key={query ? 'search-' + query : activeCategory}>
              <div className="lz-stage-topline"><span className="lz-stage-label">{query ? 'Search results' : 'Explore the collection'}</span><span className="lz-stage-count">{visibleServices.length} {visibleServices.length === 1 ? 'category' : 'categories'}</span></div>
              <div className="lz-stage-feature">
                <div className="lz-stage-image">
                  {activeImage && <img src={activeImage} alt={query ? 'Beauty service search result' : activeCategory + ' services at Layali Al Zahra'} />}
                  <span className="lz-stage-image-caption">{query ? 'Your search, considered' : activeCategory}</span>
                </div>
                <div className="lz-stage-content">
                  <span className="lz-kicker">{query ? 'Find a treatment' : 'The edit · ' + String(categories.indexOf(activeCategory) + 1).padStart(2, '0')}</span>
                  <h3 className="lz-stage-title">{query ? 'Your results.' : activeCategory + '.'}</h3>
                  <p className="lz-stage-description">{query ? 'Matching services from across our salon menu.' : categoryCopy[activeCategory]}</p>
                  <label className="lz-search"><Search size={15} aria-hidden="true"/><input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search treatments or services" aria-label="Search all salon services"/></label>
                  <div className="lz-service-list">
                    {visibleServices.map((service, index) => <div className="lz-service-row" key={service.id}>
                      <span className="lz-row-number">{String(index + 1).padStart(2, '0')}</span>
                      <div><div className="lz-row-title">{service.title}</div><div className="lz-row-meta">{service.subservices.length} treatments · Menu and pricing</div></div>
                      <button type="button" className="lz-row-action" onClick={() => setSelectedService(service)}>View menu</button>
                    </div>)}
                    {visibleServices.length === 0 && <div className="lz-search-empty">No matching treatments. Try another search term.</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="lz-story">
        <div className="lz-story-image">
          {servicesData.find((service) => service.id === 'massage')?.image && <img src={servicesData.find((service) => service.id === 'massage')?.image} alt="A relaxing beauty and wellbeing treatment" loading="lazy"/>}
        </div>
        <div className="lz-story-copy">
          <span className="lz-kicker">A moment that belongs to you</span>
          <h2>Good care is felt <em>in every detail.</em></h2>
          <p>From the first consultation to the finishing touch, our team is here to make your visit feel personal, considered and unhurried. Not just a service. Time well spent.</p>
          <div style={{marginTop:28}}><a className="lz-primary-link" href={bookUrl} target="_blank" rel="noreferrer">Plan your visit</a></div>
        </div>
      </section>

      <section className="lz-faq">
        <div className="lz-faq-inner">
          <div className="lz-faq-heading"><span className="lz-kicker" style={{justifyContent:'center'}}>Good to know</span><h2>Before your visit</h2><p>Helpful answers to make planning your appointment easier.</p></div>
          <div className="lz-faq-list">{faqs.map((faq, index) => <details key={index}><summary>{faq.q}</summary><p>{faq.a}</p></details>)}</div>
        </div>
      </section>

      <section className="lz-final-cta">
        <div><span className="lz-kicker">Your time starts here</span><h2>We look forward to welcoming you.</h2></div>
        <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
          <a className="lz-primary-link" href={bookUrl} target="_blank" rel="noreferrer">Book your visit</a>
          <button type="button" className="lz-text-link" onClick={() => setShowPhoneDialog(true)} style={{background:'transparent',border:0,borderBottom:'1px solid rgba(33,26,22,.45)',cursor:'pointer'}}>Speak to our team</button>
        </div>
      </section>

      <Dialog open={!!selectedService} onOpenChange={(open) => { if (!open) setSelectedService(null); }}>
        <DialogContent className="lz-dialog-content max-w-2xl max-h-[82vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="lz-dialog-title">{selectedService?.title}</DialogTitle><DialogDescription className="lz-dialog-description">Available treatments and pricing at Layali Al Zahra.</DialogDescription></DialogHeader>
          {selectedService && <div className="mt-4">
            <div className="mb-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[.15em] text-[#8b7967]"><span>{selectedService.subservices.length} treatments</span><span>Prices in AED</span></div>
            {selectedService.subservices.map((subservice, index) => <div className="lz-price-row" key={index}><span>{subservice.name}</span><span>{subservice.price}</span></div>)}
            <div className="mt-6"><a className="lz-primary-link" href={bookUrl} target="_blank" rel="noreferrer">Book this service</a></div>
          </div>}
        </DialogContent>
      </Dialog>

      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent className="lz-dialog-content">
          <DialogHeader><DialogTitle className="lz-dialog-title">Speak to our team</DialogTitle><DialogDescription className="lz-dialog-description">Choose the number that works best for you.</DialogDescription></DialogHeader>
          <div className="mt-4">{phoneNumbers.map((phone, index) => <a key={index} href={phone.link} className="lz-price-row" style={{textDecoration:'none'}}><span>{phone.label}</span><span>{phone.number}</span></a>)}</div>
          <a className="lz-text-link mt-5 inline-block" href={whatsappUrl} target="_blank" rel="noreferrer">Or message us on WhatsApp</a>
        </DialogContent>
      </Dialog>
    </main>
  );
}
