import React, { useState, useEffect } from 'react';
  import { motion, AnimatePresence } from 'motion/react';
  import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
  import { Button } from './ui/button';
  import { legacyHomepageReviews as reviewsData } from '../data/legacy-reviews.js';

  const servicesData = [
    {
      title: 'Hair Cuts',
      description: 'Precision cuts tailored to your style and face shape',
      image: '/hair-cuts.webp',
    },
    {
      title: 'Hair Treatments',
      description: 'Keratin, Botox, protein and luxury spa treatments for healthy hair',
      image: '/hair-treatments.webp',
    },
    {
      title: 'Hair Extensions',
      description: 'Clip, tape and stitch extensions for added length and volume',
      image: 'https://images.unsplash.com/photo-1634449571017-5fecfd26ad76?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Color & Highlights',
      description: 'Balayage, ombre, highlights and full color services by expert stylists',
      image: 'https://images.unsplash.com/photo-1707812343087-c9ff9e5abb43?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=774',
    },
    {
      title: 'Hand & Foot Care',
      description: 'Classic, French, paraffin and luxury spa manicure and pedicure',
      image: '/hand-foot-care.webp',
    },
    {
      title: 'Gelish & Gel Nails',
      description: 'Long-lasting gelish, gel extensions, BIAB and Russian manicure',
      image: '/gelish.webp',
    },
    {
      title: 'Acrylic & Nail Art',
      description: 'Full sets, refills and creative nail art in acrylic and soft gel',
      image: '/acrylic-nails.webp',
    },
    {
      title: 'Eyelash & Brow',
      description: 'Lash extensions, lifting, lamination, threading and tinting',
      image: '/eyelash-brow.webp',
    },
    {
      title: 'Hair Removal',
      description: 'Halawa, waxing and bleaching for silky smooth skin',
      image: '/hair-removal.webp',
    },
    {
      title: 'Facial & Skin',
      description: 'Hydra facials, Skyendor, Bioesthe and signature glow treatments',
      image: '/facial-skin.webp',
    },
    {
      title: 'Massage Services',
      description: 'Head, back, foot, body and Ayurvedic massages for total relaxation',
      image: '/massage-services.webp',
    },
    {
      title: 'Makeup Services',
      description: 'Day, party, evening and bridal makeup by professional artists',
      image: 'https://images.unsplash.com/photo-1614006659838-d4ca51cbd117?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=2670',
    },
    {
      title: 'Henna & Mehandi',
      description: 'Traditional and Eid henna designs for hands and hair',
      image: '/henna-mehandi.webp',
    },
    {
      title: 'Little Ladies',
      description: 'Gentle, fun beauty services specially designed for girls under 10',
      image: '/little-ladies.webp',
    },
  ];

  const packagesData = [
    {
      title: 'Beauty Package – Bud',
      description: 'A fresh introduction to our signature beauty treatments',
      validUntil: 'AED 229',
      image: '/beauty-package-bud.webp',
    },
    {
      title: 'Beauty Package – Blossom',
      description: 'Step up your glow with this popular mid-tier package',
      validUntil: 'AED 279',
      image: '/beauty-package-blossom.webp',
    },
    {
      title: 'Beauty Package – Petal',
      description: 'A curated selection of our most-loved beauty services',
      validUntil: 'AED 319',
      image: '/beauty-package-petal.webp',
    },
    {
      title: 'Beauty Package – Bloom',
      description: 'A premium full-day indulgence with our top-tier services',
      validUntil: 'AED 499',
      image: '/beauty-package-bloom.webp',
    },
    {
      title: 'Beauty Package – Flourish',
      description: 'Our ultimate luxury head-to-toe pampering session',
      validUntil: 'AED 599',
      image: '/beauty-package-flourish.webp',
    },
    {
      title: 'Gelish Mani + Pedi + Foot Massage',
      description: 'Gelish manicure, gelish pedicure and relaxing foot massage combo',
      validUntil: 'AED 300',
      image: '/gelish-mani-pedi.webp',
    },
    {
      title: 'Silk Smooth Full Glow',
      description: 'Full arms + half legs + underarms waxing combo — silky smooth',
      validUntil: 'AED 208.95',
      image: '/silk-smooth-full-glow.webp',
    },
    {
      title: 'Midday Glow – Relaxing Body Massage',
      description: 'A one-hour full body relaxation massage at a special midday price',
      validUntil: 'AED 200',
      image: '/midday-body-massage.webp',
    },
  ];

  const offersData = [
    {
      title: 'Monday Offer – Acrylic Mani + Pedi',
      description: 'Treat yourself every Monday with our unbeatable acrylic mani & pedi combo',
      validUntil: 'Every Monday – AED 105',
      image: '/monday-acrylic-mani-pedi.webp',
    },
    {
      title: 'Monday Offer – Hair Wash + Blow Dry',
      description: 'Start your week looking fabulous with a luxurious wash and blow dry',
      validUntil: 'Every Monday – AED 99',
      image: '/monday-hair-wash-blow-dry.webp',
    },
    {
      title: 'Monday Offer – Acrylic Full Set (Color)',
      description: 'Get stunning full color acrylic nails at our exclusive Monday price',
      validUntil: 'Every Monday – AED 269',
      image: '/monday-acrylic-full-set.webp',
    },
    {
      title: 'Midday Offer – Relaxing Body Massage',
      description: 'Recharge your afternoon with a soothing body massage at a special price',
      validUntil: 'Midday Special – AED 178.50',
      image: '/midday-relaxing-body-massage.webp',
    },
    {
      title: 'Midday Offer – Hot Oil Head Massage',
      description: 'Unwind midday with our nourishing hot oil head massage',
      validUntil: 'Midday Special – AED 84',
      image: '/midday-offer-hot-oil.webp',
    },
  ];

  const tipsData = [
    {
      title: 'Winter Hair Care',
      description: 'Keep your hair hydrated and healthy during dry winter months',
      image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Nail Care Essentials',
      description: 'Daily tips for maintaining beautiful, healthy nails',
      image: 'https://images.unsplash.com/photo-1633955726992-2b7c0d2d2a69?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=928',
    },
    {
      title: 'Skincare Routine',
      description: 'Essential steps for glowing, healthy skin',
      image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Makeup Application Tips',
      description: 'Professional techniques for flawless makeup',
      image: 'https://images.unsplash.com/photo-1614006659838-d4ca51cbd117?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=2670',
    },
  ];

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

  function AutoCarousel({ items, title, isReview = false, disableInitialAnimation = false }: { items: any[]; title: string; isReview?: boolean; disableInitialAnimation?: boolean }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, 4000);
      return () => clearInterval(interval);
    }, [items.length]);

    const handleNext = () => setCurrentIndex((prev) => (prev + 1) % items.length);
    const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);

    const getVisibleItems = () => (typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3);
    const [itemsToShow, setItemsToShow] = useState(3);

    useEffect(() => {
      const handleResize = () => setItemsToShow(getVisibleItems());
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
      <div className="relative">
        <h2 className="font-tangerine text-5xl md:text-7xl text-rose-900 text-center mb-12">{title}</h2>
        <div className="relative max-w-6xl mx-auto">
          <div className={`grid gap-6 ${itemsToShow === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
            <AnimatePresence mode="wait" initial={!disableInitialAnimation}>
              {Array.from({ length: itemsToShow }).map((_, offset) => {
                const index = (currentIndex + offset) % items.length;
                const item = items[index];
                return (
                  <motion.div
                    key={`${title}-${index}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, delay: offset * 0.1 }}
                    className="bg-white rounded-lg overflow-hidden shadow-lg"
                  >
                    {isReview ? (
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-rose-200 rounded-full flex items-center justify-center text-rose-700 mr-3 font-semibold">
                            {item.initials}
                          </div>
                          <div>
                            <h4 className="text-gray-900">{item.title}</h4>
                            <div className="flex text-amber-500">
                              {Array.from({ length: Number.isInteger(item.rating) ? Math.max(0, Math.min(5, item.rating)) : item.rating === null ? 0 : 5 }, (_, i) => <span key={i}>★</span>)}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    ) : (
                      <>
                        <div className="h-64 overflow-hidden">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="p-6">
                          <h3 className="text-rose-900 mb-2">{item.title}</h3>
                          <p className="text-gray-600 mb-2">{item.description}</p>
                          {item.validUntil && <p className="text-amber-600 text-sm">{item.validUntil}</p>}
                        </div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <button onClick={handlePrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-rose-100 transition-colors z-10" aria-label="Previous">
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
          </button>
          <button onClick={handleNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-rose-100 transition-colors z-10" aria-label="Next">
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
          </button>
        </div>
      </div>
    );
  }

  export default function HomePage({ onNavigate, reviews, disableInitialAnimations = false }: HomePageProps) {
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
    const eligibleReviews = publicReviews?.filter((review) => review.isPublished !== false);
    const reviewItems = eligibleReviews || [];

    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[600px]">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxvbiUyMGludGVyaW9yJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjA1MjgwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')" }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          </div>
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div>
              <h1 className="sr-only">Luxury Ladies Beauty Salon in Al Barsha 1, Dubai | Layali Al Zahra</h1>
              <h2 className="font-tangerine text-6xl md:text-8xl lg:text-9xl text-white mb-6 drop-shadow-lg">Where Beauty Meets Luxury</h2>
              <p className="text-white text-lg md:text-xl mb-8 max-w-2xl mx-auto">Experience world-class beauty services in the heart of Dubai</p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
          <div className="container mx-auto px-4">
            <AutoCarousel items={servicesData} title="Our Services" disableInitialAnimation={disableInitialAnimations} />
            <div className="text-center mt-10">
              <Button onClick={() => onNavigate('services')} className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3">
                View All Services
              </Button>
            </div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="py-20 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100">
          <div className="container mx-auto px-4">
            <AutoCarousel items={packagesData} title="Combos & Packages" disableInitialAnimation={disableInitialAnimations} />
            <div className="text-center mt-10">
              <Button onClick={() => onNavigate('packages')} className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3">
                View All Packages
              </Button>
            </div>
          </div>
        </section>

        {/* Offers Section */}
        <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
          <div className="container mx-auto px-4">
            <AutoCarousel items={offersData} title="Special Offers" disableInitialAnimation={disableInitialAnimations} />
            <div className="text-center mt-10">
              <Button onClick={() => onNavigate('offers')} className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3">
                View All Offers
              </Button>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-20 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100">
          <div className="container mx-auto px-4">
            <AutoCarousel items={tipsData} title="Beauty Tips" disableInitialAnimation={disableInitialAnimations} />
          </div>
        </section>

        {/* Reviews Section */}
        {reviewItems.length > 0 && (
          <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
            <div className="container mx-auto px-4">
              <AutoCarousel items={reviewItems} title="What Our Clients Say" isReview={true} disableInitialAnimation={disableInitialAnimations} />
            </div>
          </section>
        )}
      </div>
    );
  }
  