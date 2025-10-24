import React from 'react';
import { Lightbulb } from 'lucide-react';

const tipsData = [
  {
    id: 1,
    title: 'Winter Hair Care',
    description:
      'During dry winter months, keep your hair hydrated by using deep conditioning treatments weekly. Avoid excessive heat styling and always use a heat protectant spray.',
    image: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
    tips: [
      'Use a moisturizing shampoo and conditioner',
      'Apply hair oil or serum to seal in moisture',
      'Limit washing to 2-3 times per week',
      'Use a humidifier at home to add moisture to the air',
    ],
  },
  {
    id: 2,
    title: 'Nail Care Essentials',
    description:
      'Maintain beautiful, healthy nails with these daily care tips. Proper nail care prevents breakage and keeps your manicure looking fresh longer.',
    image: 'https://images.unsplash.com/photo-1633955726992-2b7c0d2d2a69?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=928',
    tips: [
      'Moisturize your cuticles daily with cuticle oil',
      'File nails in one direction to prevent splitting',
      'Wear gloves when doing household chores',
      'Keep nails at a manageable length',
    ],
  },
  {
    id: 3,
    title: 'Skincare Routine for Glowing Skin',
    description:
      'A consistent skincare routine is essential for maintaining healthy, radiant skin. Follow these steps morning and night for best results.',
    image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740',
    tips: [
      'Cleanse your face twice daily with a gentle cleanser',
      'Apply toner to balance skin pH',
      'Use serum targeting your specific skin concerns',
      'Always apply SPF 30+ sunscreen during the day',
      'Night cream helps repair skin while you sleep',
    ],
  },
  {
    id: 4,
    title: 'Makeup Application Tips',
    description:
      'Achieve a flawless makeup look with these professional tips. The right techniques make all the difference in creating a long-lasting, beautiful finish.',
    image: 'https://images.unsplash.com/photo-1614006659838-d4ca51cbd117?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2670',
    tips: [
      'Always start with a clean, moisturized face',
      'Use primer to help makeup last longer',
      'Blend foundation well for a natural finish',
      'Set makeup with translucent powder',
      'Invest in quality brushes for better application',
    ],
  },
  {
    id: 5,
    title: 'Hair Color Maintenance',
    description:
      'Keep your hair color vibrant and healthy between salon visits with these expert maintenance tips.',
    image: 'https://images.unsplash.com/photo-1707812343087-c9ff9e5abb43?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774',
    tips: [
      'Use color-safe shampoo and conditioner',
      'Wash hair with cool water to seal the cuticle',
      'Limit heat styling to prevent fading',
      'Apply color-protecting hair masks weekly',
      'Schedule regular touch-ups every 6-8 weeks',
    ],
  },
  {
    id: 6,
    title: 'Pre-Waxing Care',
    description:
      'Prepare your skin properly before waxing to ensure the best results and minimize discomfort.',
    image: 'https://cdn.pixabay.com/photo/2024/06/08/18/47/woman-8817391_1280.jpg',
    tips: [
      'Exfoliate skin 24 hours before waxing',
      'Ensure hair is at least 1/4 inch long',
      'Avoid sun exposure before and after waxing',
      'Stay hydrated for better results',
      'Avoid caffeine before your appointment',
    ],
  },
];

export default function TipsPage() {
  return (
    <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="font-tangerine text-6xl md:text-8xl text-rose-900 mb-4">Beauty Tips</h1>
          <p className="text-gray-700 text-xl max-w-3xl mx-auto">
            Expert advice from our professionals to help you look and feel your best
          </p>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {tipsData.map((tip) => (
            <div
              key={tip.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              {/* Image */}
              <div className="h-64 overflow-hidden relative">
                <img
                  src={tip.image}
                  alt={tip.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg">
                  <Lightbulb className="w-5 h-5 inline mr-1" />
                  Tip
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-rose-900 mb-3">{tip.title}</h3>
                <p className="text-gray-600 mb-4">{tip.description}</p>

                {/* Tips List */}
                <ul className="space-y-2">
                  {tip.tips.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-rose-500 mt-1">•</span>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
