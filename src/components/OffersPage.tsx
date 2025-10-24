import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const offersData = [
  {
    id: 1,
    title: 'New Client Special',
    description: 'Get 20% off on your first visit to our salon',
    validUntil: 'Valid until March 31, 2025',
    image: 'https://images.unsplash.com/photo-1562259920-47afc3030ba2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
    discount: '20% OFF',
  },
  {
    id: 2,
    title: 'Bridal Package Special',
    description: 'Complete bridal beauty package including makeup, hair, and nails at special rates',
    validUntil: 'Book now for 2025 weddings',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870',
    discount: 'SPECIAL RATE',
  },
  {
    id: 3,
    title: 'Hair Treatment Package',
    description: 'Book 3 hair treatment sessions and get the 4th one free',
    validUntil: 'Valid until April 30, 2025',
    image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
    discount: 'BUY 3 GET 1 FREE',
  },
  {
    id: 4,
    title: 'Manicure & Pedicure Combo',
    description: 'Get both gel manicure and pedicure for a special combo price',
    validUntil: 'Valid until March 31, 2025',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
    discount: '15% OFF',
  },
  {
    id: 5,
    title: 'Spa Day Package',
    description: 'Indulge in a full day of pampering with our exclusive spa day package',
    validUntil: 'Available all year',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
    discount: 'PACKAGE DEAL',
  },
  {
    id: 6,
    title: 'Color & Highlights Special',
    description: 'Book any color service and get a complimentary deep conditioning treatment',
    validUntil: 'Valid until May 31, 2025',
    image: 'https://images.unsplash.com/photo-1707812343087-c9ff9e5abb43?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774',
    discount: 'FREE TREATMENT',
  },
];

export default function OffersPage() {
  return (
    <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="font-tangerine text-6xl md:text-8xl text-rose-900 mb-4">
            Special Offers
          </h1>
          <p className="text-gray-700 text-xl max-w-3xl mx-auto">
            Take advantage of our exclusive deals and pamper yourself at special rates
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {offersData.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Image with Discount Badge */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-rose-500 text-white px-4 py-2 rounded-full shadow-lg">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  {offer.discount}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-rose-900 mb-3">{offer.title}</h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-amber-600 text-sm">{offer.validUntil}</p>
                </div>
                <Button
                  onClick={() =>
                    window.open(
                      'https://www.fresha.com/book-now/layali-al-zahra-ladies-saloon-ng425ap1/all-offer?share=true&pId=2674340',
                      '_blank'
                    )
                  }
                  className="w-full mt-4 bg-rose-200 text-rose-900 hover:bg-amber-400 hover:text-white shadow-md"
                >
                  Book Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-12 text-white">
          <h2 className="font-tangerine text-5xl md:text-6xl mb-4">
            Don't Miss Out on These Amazing Deals!
          </h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Contact us today to book your appointment and take advantage of our special offers
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
      </div>
    </div>
  );
}
