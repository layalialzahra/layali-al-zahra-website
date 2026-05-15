import React from 'react';
  import { Sparkles } from 'lucide-react';
  import { Button } from './ui/button';

  const offersData = [
    {
      id: 1,
      title: 'Monday Offer – Acrylic Mani + Pedi',
      description: 'Treat yourself every Monday with our unbeatable acrylic manicure and pedicure combo',
      validUntil: 'Every Monday',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      badge: 'AED 105',
    },
    {
      id: 2,
      title: 'Monday Offer – Hair Wash + Blow Dry',
      description: 'Start your week looking fabulous with a luxurious wash and blow dry session',
      validUntil: 'Every Monday',
      image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      badge: 'AED 99',
    },
    {
      id: 3,
      title: 'Monday Offer – Acrylic Full Set (Color)',
      description: 'Get a stunning full set of color acrylic nails at our exclusive Monday price',
      validUntil: 'Every Monday',
      image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      badge: 'AED 269',
    },
    {
      id: 4,
      title: 'Midday Offer – Relaxing Body Massage',
      description: 'Recharge your afternoon with our soothing full body massage at a special midday price',
      validUntil: 'Midday Special',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      badge: 'AED 178.50',
    },
    {
      id: 5,
      title: 'Midday Offer – Hot Oil Head Massage',
      description: 'Unwind midday with our nourishing hot oil head massage — the perfect pick-me-up',
      validUntil: 'Midday Special',
      image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
      badge: 'AED 84',
    },
  ];

  export default function OffersPage() {
    return (
      <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="font-tangerine text-6xl md:text-8xl text-rose-900 mb-4">Special Offers</h1>
            <p className="text-gray-700 text-xl max-w-3xl mx-auto">
              Take advantage of our exclusive daily deals and treat yourself at special rates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {offersData.map((offer) => (
              <div key={offer.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
                <div className="relative h-64 overflow-hidden">
                  <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute top-4 right-4 bg-rose-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    {offer.badge}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-rose-900 mb-3">{offer.title}</h3>
                  <p className="text-gray-600 mb-4">{offer.description}</p>
                  <p className="text-amber-600 text-sm mb-4">{offer.validUntil}</p>
                  <Button
                    onClick={() => window.open('https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services', '_blank')}
                    className="w-full bg-rose-200 text-rose-900 hover:bg-amber-400 hover:text-white shadow-md"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-12 text-white">
            <h2 className="font-tangerine text-5xl md:text-6xl mb-4">Don't Miss Out on These Amazing Deals!</h2>
            <p className="text-xl mb-6 max-w-2xl mx-auto">Contact us today to book your appointment and take advantage of our special offers</p>
            <Button
              onClick={() => window.open('https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services', '_blank')}
              className="bg-rose-200 text-rose-900 hover:bg-amber-400 hover:text-white px-8 py-6 text-lg shadow-lg"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>
    );
  }
  