import React, { useEffect, useState } from 'react';
  import { Sparkles } from 'lucide-react';
  import { Button } from './ui/button';

  import { legacyOffersData } from '../data/legacy-offers.js';
  import { loadPublicOffers, loadPublicFaqs } from '../data/managed-content-public.js';
import { legacyFaqs } from '../data/legacy-faqs.js';

  type OfferDisplay = (typeof legacyOffersData)[number] & { bookingUrl?: string };

  export default function OffersPage() {
    const [offersData, setOffersData] = useState<OfferDisplay[]>(legacyOffersData);
    const [faqs, setFaqs] = useState(legacyFaqs.offers);

    useEffect(() => {
      let active = true;
      void Promise.all([loadPublicOffers(), loadPublicFaqs("offers")]).then(([offers, loadedFaqs]) => {
        if (!active) return;
        setOffersData(offers as OfferDisplay[]);
        setFaqs(loadedFaqs as typeof legacyFaqs.offers);
      });
      return () => { active = false; };
    }, []);

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
                  <img src={offer.image} alt={offer.title + ' — special offer at Layali Al Zahra Beauty Lounge, Dubai'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
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
                    onClick={() => window.open(offer.bookingUrl || 'https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services', '_blank', 'noopener,noreferrer')}
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
          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto px-4 pb-16">
            <div className="text-center mb-8">
              <h2 className="text-rose-900 text-3xl font-semibold mb-2">Frequently Asked Questions</h2>
              <p className="text-gray-600">Common questions about our special offers and promotions in Dubai</p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="bg-white rounded-lg shadow-sm border border-rose-100">
                  <summary className="flex justify-between items-center p-5 cursor-pointer list-none font-semibold text-rose-900 hover:text-rose-700">
                    <span>{faq.q}</span>
                    <span className="ml-4 text-rose-400 flex-shrink-0 text-xl font-light select-none">&#43;</span>
                  </summary>
                  <p className="px-5 pb-5 text-gray-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
  
      </div>
    );
  }
  