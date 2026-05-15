import React, { useState, useEffect } from 'react';
  import { motion, AnimatePresence } from 'motion/react';
  import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
  import { Button } from './ui/button';

  const servicesData = [
    {
      title: 'Hair Cuts',
      description: 'Precision cuts tailored to your style and face shape',
      image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Hair Treatments',
      description: 'Keratin, Botox, protein and luxury spa treatments for healthy hair',
      image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
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
      image: 'https://images.unsplash.com/photo-1633955726992-2b7c0d2d2a69?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=928',
    },
    {
      title: 'Gelish & Gel Nails',
      description: 'Long-lasting gelish, gel extensions, BIAB and Russian manicure',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Acrylic & Nail Art',
      description: 'Full sets, refills and creative nail art in acrylic and soft gel',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Eyelash & Brow',
      description: 'Lash extensions, lifting, lamination, threading and tinting',
      image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Hair Removal',
      description: 'Halawa, waxing and bleaching for silky smooth skin',
      image: 'https://cdn.pixabay.com/photo/2024/06/08/18/47/woman-8817391_1280.jpg',
    },
    {
      title: 'Facial & Skin',
      description: 'Hydra facials, Skyendor, Bioesthe and signature glow treatments',
      image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Massage Services',
      description: 'Head, back, foot, body and Ayurvedic massages for total relaxation',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Makeup Services',
      description: 'Day, party, evening and bridal makeup by professional artists',
      image: 'https://images.unsplash.com/photo-1614006659838-d4ca51cbd117?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=2670',
    },
    {
      title: 'Henna & Mehandi',
      description: 'Traditional and Eid henna designs for hands and hair',
      image: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Little Ladies',
      description: 'Gentle, fun beauty services specially designed for girls under 10',
      image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
  ];

  const packagesData = [
    {
      title: 'Beauty Package – Bud',
      description: 'A fresh introduction to our signature beauty treatments',
      validUntil: 'AED 229',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1738',
    },
    {
      title: 'Beauty Package – Blossom',
      description: 'Step up your glow with this popular mid-tier package',
      validUntil: 'AED 279',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1738',
    },
    {
      title: 'Beauty Package – Petal',
      description: 'A curated selection of our most-loved beauty services',
      validUntil: 'AED 319',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1738',
    },
    {
      title: 'Beauty Package – Bloom',
      description: 'A premium full-day indulgence with our top-tier services',
      validUntil: 'AED 499',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1738',
    },
    {
      title: 'Beauty Package – Flourish',
      description: 'Our ultimate luxury head-to-toe pampering session',
      validUntil: 'AED 599',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1738',
    },
    {
      title: 'Gelish Mani + Pedi + Foot Massage',
      description: 'Gelish manicure, gelish pedicure and relaxing foot massage combo',
      validUntil: 'AED 300',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Silk Smooth Full Glow',
      description: 'Full arms + half legs + underarms waxing combo — silky smooth',
      validUntil: 'AED 208.95',
      image: 'https://cdn.pixabay.com/photo/2024/06/08/18/47/woman-8817391_1280.jpg',
    },
    {
      title: 'Midday Glow – Relaxing Body Massage',
      description: 'A one-hour full body relaxation massage at a special midday price',
      validUntil: 'AED 200',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
  ];

  const offersData = [
    {
      title: 'Monday Offer – Acrylic Mani + Pedi',
      description: 'Treat yourself every Monday with our unbeatable acrylic mani & pedi combo',
      validUntil: 'Every Monday – AED 105',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Monday Offer – Hair Wash + Blow Dry',
      description: 'Start your week looking fabulous with a luxurious wash and blow dry',
      validUntil: 'Every Monday – AED 99',
      image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Monday Offer – Acrylic Full Set (Color)',
      description: 'Get stunning full color acrylic nails at our exclusive Monday price',
      validUntil: 'Every Monday – AED 269',
      image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Midday Offer – Relaxing Body Massage',
      description: 'Recharge your afternoon with a soothing body massage at a special price',
      validUntil: 'Midday Special – AED 178.50',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    },
    {
      title: 'Midday Offer – Hot Oil Head Massage',
      description: 'Unwind midday with our nourishing hot oil head massage',
      validUntil: 'Midday Special – AED 84',
      image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
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

  const reviewsData = [
    {
      title: 'Shauna Haberlin',
      initials: 'SH',
      description: "My favourite salon in Dubai! Maria is the best at doing a beautiful bouncy blowdry, I go at least once a week to her! I always get my brows done here also, threading and tinting and they are perfect every single time! I recently had a nail nightmare from a previous salon and they fully listened to everything that had happened and fixed my nails perfectly! I refuse to go anywhere else for my nails now!",
      image: '',
    },
    {
      title: 'Saba Khan',
      initials: 'SK',
      description: "Had a really great experience at the salon as always! Shoba did my hair exactly how I wanted — she really listens and gets it right every time. I always feel taken care of when she's working her magic. Also a big shoutout to Ann and Veena at reception — they're always so warm, welcoming, and helpful. It just makes the whole experience even better. Highly recommend!",
      image: '',
    },
    {
      title: 'Rinu Mathew',
      initials: 'RM',
      description: "Been their customer for the longest time. Always get my nails done here as well as hair color. Friendly & efficient staff. Exceptional service. Kudos to Shobha, Maria, Hing, Donna, Mary, Nayana and not to forget super friendly Ann & Veena at the reception.... I love them all. Always feel welcomed & the best part is that they remember your preferences. Must visit Salon in Dubai.",
      image: '',
    },
    {
      title: 'Manpreet Randhawa',
      initials: 'MR',
      description: "Foot Massage — Had such a relaxing foot massage today. Mary used the right pressure and really helped ease all the tension. Walked out feeling lighter and completely refreshed. Definitely coming back! Hair cut — I've been coming to Maria for years now, and I honestly wouldn't trust anyone else with my hair. Maria just gets what I want every single time. Every haircut feels fresh, effortless, and perfectly suited to me. So grateful to have found her!",
      image: '',
    },
    {
      title: 'stephanie chamy',
      initials: 'SC',
      description: "My go to salon, always. I really recommend Donna and Mary for Mani Pedi. I have a lot of dry skin on both hands and feet, and they are so patient & make sure I only leave satisfied, happy with great looking nails. Also thank you to NaiNai for her great massage.",
      image: '',
    },
    {
      title: 'Romeena Weeraratne',
      initials: 'RW',
      description: "The staff here are all so amazing. My go to are Marie, Hin, Sohba and Seeta for everything — Friendly, so hospitable and excellent at their services.",
      image: '',
    },
    {
      title: 'Fatema Lakdawala',
      initials: 'FL',
      description: "Excellent service. Maria did a great job with my haircut. And Sita and Dona were amazing at Mani pedi. Even Marry and Le were amazing too for my moms Mani and Pedi.",
      image: '',
    },
    {
      title: 'Zainab Ayoub',
      initials: 'ZA',
      description: "I've been going to this salon for 2 years for all my hair/beauty needs. Shobha and Maria do an excellent job with hair and Naina is fantastic with threading.",
      image: '',
    },
    {
      title: 'Najla Barghout',
      initials: 'NB',
      description: "I always come to their place and cut my hair with the amazing and experienced Maria. She is always welcoming and makes me happy all the time.",
      image: '',
    },
    {
      title: 'Hima',
      initials: 'H',
      description: "I have been coming to Donna for my nails for years. She is amazing and even after 2/3 weeks the nails and paint looks new. Try it once. Highly recommended.",
      image: '',
    },
    {
      title: 'sahar ayoub',
      initials: 'SA',
      description: "Reception staffs Veena & Ann are awesome — very polite and five star service. Mary, Shobha, Sita exceptionally perfect for service — love all the girls.",
      image: '',
    },
    {
      title: 'Ksenia Kesaeva',
      initials: 'KK',
      description: "Excellent service, great products, practical location, professional attitude.",
      image: '',
    },
    {
      title: 'Cheyenne Milward',
      initials: 'CM',
      description: "Girls are always so friendly and helpful. The service is always so good and professional. Always a very warm welcome when I walk in by everyone. I have been coming to this salon for years now. Love these girls.",
      image: '',
    },
    {
      title: 'Sharon Meynert-Wrigge',
      initials: 'SM',
      description: "The staff are super. Professional and friendly. Will definitely recommend this place.",
      image: '',
    },
    {
      title: 'Maii Edarws',
      initials: 'ME',
      description: "My favorite salon. Maria and Mary are my favorite ladies there — I feel like I'm a princess there — they are like my family — professional work, good attitude, great hospitality and friendly staff.",
      image: '',
    },
  ];

  interface HomePageProps {
    onNavigate: (page: string) => void;
  }

  function AutoCarousel({ items, title, isReview = false }: { items: any[]; title: string; isReview?: boolean }) {
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
    const [itemsToShow, setItemsToShow] = useState(getVisibleItems());

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
            <AnimatePresence mode="wait">
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
                              {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
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

  export default function HomePage({ onNavigate }: HomePageProps) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative h-[600px]">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxvbiUyMGludGVyaW9yJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjA1MjgwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')" }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
          </div>
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div>
              <h2 className="font-tangerine text-6xl md:text-8xl lg:text-9xl text-white mb-6 drop-shadow-lg">Where Beauty Meets Luxury</h2>
              <p className="text-white text-lg md:text-xl mb-8 max-w-2xl mx-auto">Experience world-class beauty services in the heart of Dubai</p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
          <div className="container mx-auto px-4">
            <AutoCarousel items={servicesData} title="Our Services" />
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
            <AutoCarousel items={packagesData} title="Combos & Packages" />
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
            <AutoCarousel items={offersData} title="Special Offers" />
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
            <AutoCarousel items={tipsData} title="Beauty Tips" />
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
          <div className="container mx-auto px-4">
            <AutoCarousel items={reviewsData} title="What Our Clients Say" isReview={true} />
          </div>
        </section>
      </div>
    );
  }
  