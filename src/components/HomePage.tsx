import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from './ui/button';

const servicesData = [
  {
    title: 'Hair Treatments',
    description: 'Premium hair care treatments for healthy, shiny hair',
    image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
  },
  {
    title: 'Hair Extensions',
    description: 'Add length and volume with our premium extensions',
    image: 'https://images.unsplash.com/photo-1634449571017-5fecfd26ad76?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
  },
  {
    title: 'Color & Highlights',
    description: 'Expert coloring services for a stunning look',
    image: 'https://images.unsplash.com/photo-1707812343087-c9ff9e5abb43?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774',
  },
  {
    title: 'Nail Services',
    description: 'Professional manicure and pedicure services',
    image: 'https://images.unsplash.com/photo-1633955726992-2b7c0d2d2a69?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=928',
  },
  {
    title: 'Facial Treatments',
    description: 'Rejuvenating facial treatments for glowing skin',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
  },
  {
    title: 'Makeup Services',
    description: 'Professional makeup for any occasion',
    image: 'https://images.unsplash.com/photo-1614006659838-d4ca51cbd117?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2670',
  },
];

const offersData = [
  {
    title: 'New Client Special',
    description: '20% off your first visit to our salon',
    validUntil: 'Valid until March 31, 2025',
    image: 'https://images.unsplash.com/photo-1562259920-47afc3030ba2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
  },
  {
    title: 'Bridal Package Special',
    description: 'Complete bridal beauty package at special rates',
    validUntil: 'Book now for 2025 weddings',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870',
  },
  {
    title: 'Hair Treatment Package',
    description: 'Book 3 sessions and get the 4th one free',
    validUntil: 'Valid until April 30, 2025',
    image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
  },
  {
    title: 'Manicure & Pedicure Combo',
    description: 'Special combo price for gel manicure and pedicure',
    validUntil: 'Valid until March 31, 2025',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
  },
];

const tipsData = [
  {
    title: 'Winter Hair Care',
    description: 'Keep your hair hydrated and healthy during dry winter months',
    image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
  },
  {
    title: 'Nail Care Essentials',
    description: 'Daily tips for maintaining beautiful, healthy nails',
    image: 'https://images.unsplash.com/photo-1633955726992-2b7c0d2d2a69?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=928',
  },
  {
    title: 'Skincare Routine',
    description: 'Essential steps for glowing, healthy skin',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
  },
  {
    title: 'Makeup Application Tips',
    description: 'Professional techniques for flawless makeup',
    image: 'https://images.unsplash.com/photo-1614006659838-d4ca51cbd117?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2670',
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
    }, 4000); // 4 seconds

    return () => clearInterval(interval);
  }, [items.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Determine how many items to show based on screen size
  const getVisibleItems = () => {
    // Mobile: 1 item, Desktop: 3 items
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;
  };

  const [itemsToShow, setItemsToShow] = useState(getVisibleItems());

  useEffect(() => {
    const handleResize = () => {
      setItemsToShow(getVisibleItems());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative">
      <h2 className="font-tangerine text-5xl md:text-7xl text-rose-900 text-center mb-12">
        {title}
      </h2>
      
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
                        <div className="w-12 h-12 bg-rose-200 rounded-full flex items-center justify-center text-rose-700 mr-3">
                          {item.initials}
                        </div>
                        <div>
                          <h4 className="text-gray-900">{item.title}</h4>
                          <div className="flex text-amber-500">
                            {'★★★★★'.split('').map((star, i) => (
                              <span key={i}>{star}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  ) : (
                    <>
                      <div className="h-64 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-rose-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        {item.validUntil && (
                          <p className="text-amber-600 text-sm">{item.validUntil}</p>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Navigation Arrows - Always visible on mobile */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-rose-100 transition-colors z-10"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white rounded-full p-2 md:p-3 shadow-lg hover:bg-rose-100 transition-colors z-10"
          aria-label="Next"
        >
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
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxvbiUyMGludGVyaW9yJTIwZWxlZ2FudHxlbnwxfHx8fDE3NjA1MjgwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
          <div>
            <h2 className="font-tangerine text-6xl md:text-8xl lg:text-9xl text-white mb-6 drop-shadow-lg">
              Where Beauty Meets Luxury
            </h2>
            <p className="text-white text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Experience world-class beauty services in the heart of Dubai
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
        <div className="container mx-auto px-4">
          <AutoCarousel items={servicesData} title="Our Services" />
        </div>
      </section>

      {/* Offers Section */}
      <section className="py-20 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100">
        <div className="container mx-auto px-4">
          <AutoCarousel items={offersData} title="Special Offers" />
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
        <div className="container mx-auto px-4">
          <AutoCarousel items={tipsData} title="Beauty Tips" />
        </div>
      </section>

      {/* Google Reviews Section */}
      <section className="py-20 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100">
        <div className="container mx-auto px-4">
          <AutoCarousel 
            items={[
              {
                title: 'Sarah Ahmed',
                initials: 'SA',
                description: '"Absolutely amazing service! The staff is so professional and the salon has such a luxurious feel. My hair has never looked better. Highly recommend!"',
                image: '', // Reviews don't need images
              },
              {
                title: 'Layla Khan',
                initials: 'LK',
                description: '"Best beauty salon in Al Barsha! The bridal makeup was flawless and lasted all day. Thank you for making my special day perfect!"',
                image: '',
              },
              {
                title: 'Mariam Faisal',
                initials: 'MF',
                description: '"The nail services are exceptional! Clean, hygienic, and the designs are always on point. My go-to salon for all my beauty needs."',
                image: '',
              },
              {
                title: 'Noor Ali',
                initials: 'NA',
                description: '"Wonderful experience every time I visit. The facial treatments are so relaxing and my skin feels amazing. The team really knows what they\'re doing!"',
                image: '',
              },
              {
                title: 'Fatima Hassan',
                initials: 'FH',
                description: '"Love the ambiance and professionalism. Always leave feeling pampered and beautiful. Best salon experience in Dubai!"',
                image: '',
              },
            ]} 
            title="What Our Clients Say"
            isReview={true}
          />

          <div className="text-center mt-8">
            <Button
              onClick={() =>
                window.open(
                  'https://www.google.com/search?q=Layali+Al+Zahra+Beauty+Lounge&oq=laya&gs_lcrp=EgZjaHJvbWUqCAgCEEUYJxg7MgYIABBFGDwyDQgBEC4YxwEY0QMYgAQyCAgCEEUYJxg7MgYIAxAjGCcyBwgEEC4YgAQyBwgFEAAYgAQyBwgGEAAYgAQyBggHEEUYPNIBCDMxOTVqMGo3qAIIsAIB8QX6J2FT-iaEfw&sourceid=chrome&ie=UTF-8#lrd=0x3e5f6b605b77aaa5:0x61889b1cddafac75,3,,,,',
                  '_blank'
                )
              }
              className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 text-lg"
            >
              Add your review
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action / Booking Section */}
      <section className="py-20 bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-tangerine text-5xl md:text-7xl mb-6">Book Your Appointment Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let our expert team pamper you with the finest beauty treatments
          </p>
          <Button
            onClick={() =>
              window.open(
                'https://www.fresha.com/book-now/layali-al-zahra-ladies-saloon-ng425ap1/all-offer?share=true&pId=2674340',
                '_blank'
              )
            }
            className="bg-rose-200 text-rose-900 hover:bg-amber-400 hover:text-white px-8 py-6 text-lg shadow-lg"
          >
            Book Now
          </Button>
        </div>
      </section>
    </div>
  );
}
