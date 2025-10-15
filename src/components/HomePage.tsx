import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const servicesData = [
  {
    title: 'Hair Treatments',
    description: 'Premium hair care treatments for healthy, shiny hair',
    image: 'https://images.unsplash.com/photo-1605980625982-b128a7e7fde2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwdHJlYXRtZW50JTIwc2Fsb258ZW58MXx8fHwxNzYwNDI2NTkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    title: 'Hair Extensions',
    description: 'Add length and volume with our premium extensions',
    image: 'https://images.unsplash.com/photo-1677319378211-06f6a50b49bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwZXh0ZW5zaW9ucyUyMGx1eHVyeXxlbnwxfHx8fDE3NjA1MjI5NTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    title: 'Color & Highlights',
    description: 'Expert coloring services for a stunning look',
    image: 'https://images.unsplash.com/photo-1623104086040-35e17b8a8819?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwY29sb3IlMjBoaWdobGlnaHRzfGVufDF8fHx8MTc2MDQ0NTc5Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    title: 'Nail Services',
    description: 'Professional manicure and pedicure services',
    image: 'https://images.unsplash.com/photo-1731644139982-b75487df663e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5pY3VyZSUyMHBlZGljdXJlJTIwbHV4dXJ5fGVufDF8fHx8MTc2MDUyMjk1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    title: 'Facial Treatments',
    description: 'Rejuvenating facial treatments for glowing skin',
    image: 'https://images.unsplash.com/photo-1559185590-879c66a55254?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNpYWwlMjB0cmVhdG1lbnQlMjBzcGF8ZW58MXx8fHwxNzYwNTE2OTM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    title: 'Makeup Services',
    description: 'Professional makeup for any occasion',
    image: 'https://images.unsplash.com/photo-1698181842513-2179d5f8bc65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBhcnRpc3QlMjBiZWF1dHl8ZW58MXx8fHwxNzYwNDg4NjcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

const offersData = [
  {
    title: 'New Client Special',
    description: '20% off your first visit to our salon',
    validUntil: 'Valid until March 31, 2025',
    image: 'https://images.unsplash.com/photo-1759142235060-3191ee596c81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWF1dHklMjBzYWxvbiUyMGludGVyaW9yfGVufDF8fHx8MTc2MDUyMjk1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    title: 'Bridal Package Special',
    description: 'Complete bridal beauty package at special rates',
    validUntil: 'Book now for 2025 weddings',
    image: 'https://images.unsplash.com/photo-1758473083855-b8385ab7b1e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGVjaWFsJTIwb2NjYXNpb24lMjBtYWtldXB8ZW58MXx8fHwxNzYwNDUzMTE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    title: 'Hair Treatment Package',
    description: 'Book 3 sessions and get the 4th one free',
    validUntil: 'Valid until April 30, 2025',
    image: 'https://images.unsplash.com/photo-1605980625982-b128a7e7fde2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwdHJlYXRtZW50JTIwc2Fsb258ZW58MXx8fHwxNzYwNDI2NTkwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    title: 'Manicure & Pedicure Combo',
    description: 'Special combo price for gel manicure and pedicure',
    validUntil: 'Valid until March 31, 2025',
    image: 'https://images.unsplash.com/photo-1731644139982-b75487df663e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5pY3VyZSUyMHBlZGljdXJlJTIwbHV4dXJ5fGVufDF8fHx8MTc2MDUyMjk1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

const tipsData = [
  {
    title: 'Winter Hair Care',
    description: 'Keep your hair hydrated and healthy during dry winter months',
    image: 'https://images.unsplash.com/photo-1647004692483-c5d942fe1137?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjB0aXBzJTIwc2tpbmNhcmV8ZW58MXx8fHwxNzYwNTIyOTYwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    title: 'Nail Care Essentials',
    description: 'Daily tips for maintaining beautiful, healthy nails',
    image: 'https://images.unsplash.com/photo-1731644139982-b75487df663e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5pY3VyZSUyMHBlZGljdXJlJTIwbHV4dXJ5fGVufDF8fHx8MTc2MDUyMjk1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    title: 'Skincare Routine',
    description: 'Essential steps for glowing, healthy skin',
    image: 'https://images.unsplash.com/photo-1559185590-879c66a55254?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNpYWwlMjB0cmVhdG1lbnQlMjBzcGF8ZW58MXx8fHwxNzYwNTE2OTM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    title: 'Makeup Application Tips',
    description: 'Professional techniques for flawless makeup',
    image: 'https://images.unsplash.com/photo-1698181842513-2179d5f8bc65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBhcnRpc3QlMjBiZWF1dHl8ZW58MXx8fHwxNzYwNDg4NjcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

interface HomePageProps {
  onNavigate: (page: string) => void;
}

function AutoCarousel({ items, title }: { items: any[]; title: string }) {
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

  return (
    <div className="relative">
      <h2 className="font-tangerine text-5xl md:text-7xl text-rose-900 text-center mb-12">
        {title}
      </h2>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {[0, 1, 2].map((offset) => {
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white rounded-full p-3 shadow-lg hover:bg-rose-100 transition-colors hidden lg:block"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6 text-rose-500" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white rounded-full p-3 shadow-lg hover:bg-rose-100 transition-colors hidden lg:block"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6 text-rose-500" />
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
