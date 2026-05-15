import React from 'react';
  import { Gift } from 'lucide-react';
  import { Button } from './ui/button';

  const packagesData = [
    {
      id: 1,
      category: 'Silk Smooth Waxing Combos',
      title: 'Silk Smooth Half Glow',
      description: 'Half Arms + Half Legs + Underarms — smooth, silky skin with our popular intro waxing combo',
      price: 'AED 187.95',
      image: 'https://cdn.pixabay.com/photo/2024/06/08/18/47/woman-8817391_1280.jpg',
    },
    {
      id: 2,
      category: 'Silk Smooth Waxing Combos',
      title: 'Silk Smooth Full Glow',
      description: 'Full Arms + Half Legs + Underarms — step up your smooth with this popular full-arm combo',
      price: 'AED 208.95',
      image: 'https://cdn.pixabay.com/photo/2024/06/08/18/47/woman-8817391_1280.jpg',
    },
    {
      id: 3,
      category: 'Silk Smooth Waxing Combos',
      title: 'Silk Smooth Complete Glow',
      description: 'Full Arms + Full Legs + Underarms — head-to-toe smooth for the complete glow experience',
      price: 'AED 240.45',
      image: 'https://cdn.pixabay.com/photo/2024/06/08/18/47/woman-8817391_1280.jpg',
    },
    {
      id: 4,
      category: 'Silk Smooth Waxing Combos',
      title: 'Silk Smooth Full Body Glow',
      description: 'Full body waxing (without bikini) — indulge in head-to-toe silky smoothness',
      price: 'AED 418.95',
      image: 'https://cdn.pixabay.com/photo/2024/06/08/18/47/woman-8817391_1280.jpg',
    },
    {
      id: 5,
      category: 'Silk Smooth Waxing Combos',
      title: 'Silk Smooth Full Body Glow Deluxe',
      description: 'Full body waxing including bikini — our most complete smoothing package',
      price: 'AED 523.95',
      image: 'https://cdn.pixabay.com/photo/2024/06/08/18/47/woman-8817391_1280.jpg',
    },
    {
      id: 6,
      category: 'Nail & Hair Combos',
      title: 'Gelish Mani + Pedi + Foot Massage',
      description: 'Gelish pedicure + gelish manicure + relaxing foot massage — the complete nail treat',
      price: 'AED 300',
      image: '/gelish-mani-pedi.jpg',
    },
    {
      id: 7,
      category: 'Nail & Hair Combos',
      title: 'Manicure + Pedicure + Foot Massage',
      description: 'Classic manicure + pedicure + soothing foot massage at a great combo price',
      price: 'AED 169',
      image: '/mani-pedi-foot-massage.jpg',
    },
    {
      id: 8,
      category: 'Nail & Hair Combos',
      title: 'Blow Dry + Root Color Combo',
      description: 'Root color touch-up plus a beautiful blow dry finish — look refreshed in one visit',
      price: 'AED 230',
      image: '/blow-dry-root-color.jpg',
    },
    {
      id: 9,
      category: 'Nail & Hair Combos',
      title: 'Hair Layer Cut',
      description: 'A beautiful layered cut with expert styling included',
      price: 'AED 189',
      image: '/hair-cuts.jpg',
    },
    {
      id: 10,
      category: 'Midday Glow',
      title: 'Midday Glow – Hot Oil Head Massage',
      description: 'A nourishing hot oil head massage to revive and relax during your midday break',
      price: 'AED 105',
      image: '/massage-services.jpg',
    },
    {
      id: 11,
      category: 'Midday Glow',
      title: 'Midday Glow – Basic Manicure & Pedicure',
      description: 'A quick, beautiful mani-pedi combo perfect for a midday refresh',
      price: 'AED 135',
      image: '/mani-pedi-foot-massage.jpg',
    },
    {
      id: 12,
      category: 'Midday Glow',
      title: 'Midday Glow – Head & Back Massage',
      description: 'Dual relaxation — head and back massage to melt away midday tension',
      price: 'AED 147',
      image: '/massage-services.jpg',
    },
    {
      id: 13,
      category: 'Midday Glow',
      title: 'Midday Glow – Hair Spa',
      description: 'A luxurious midday hair spa treatment to restore moisture and shine',
      price: 'AED 156',
      image: '/hair-treatments.jpg',
    },
    {
      id: 14,
      category: 'Midday Glow',
      title: 'Midday Glow – Basic Facial',
      description: 'A refreshing facial to brighten and revive your skin in the middle of your day',
      price: 'AED 188',
      image: '/midday-basic-facial.jpg',
    },
    {
      id: 15,
      category: 'Midday Glow',
      title: 'Midday Glow – Wash, Cut & Blow Dry',
      description: 'Wash, trim and blowdry combo — a complete hair refresh at midday value pricing',
      price: 'AED 198',
      image: '/midday-wash-cut-blowdry.jpg',
    },
    {
      id: 16,
      category: 'Midday Glow',
      title: 'Midday Glow – Relaxing Body Massage',
      description: 'A one-hour relaxing full body massage at an exclusive midday price',
      price: 'AED 200',
      image: '/midday-body-massage.jpg',
    },
    {
      id: 17,
      category: 'Midday Glow',
      title: 'Midday Glow – Nail Extensions',
      description: 'Get beautiful nail extensions during your midday break at a special price',
      price: 'AED 272',
      image: '/midday-nail-extensions.jpg',
    },
    {
      id: 18,
      category: 'Signature Beauty Packages',
      title: 'Beauty Package – Bud',
      description: 'A fresh introduction to our signature beauty treatments — the perfect starter package',
      price: 'AED 229',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1738',
    },
    {
      id: 19,
      category: 'Signature Beauty Packages',
      title: 'Beauty Package – Blossom',
      description: 'Step up your glow with this lovely mid-tier selection of our popular services',
      price: 'AED 279',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1738',
    },
    {
      id: 20,
      category: 'Signature Beauty Packages',
      title: 'Beauty Package – Petal',
      description: 'A curated combination of our most-loved beauty services for a complete treat',
      price: 'AED 319',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1738',
    },
    {
      id: 21,
      category: 'Signature Beauty Packages',
      title: 'Beauty Package – Bloom',
      description: 'Indulge in a premium full-day beauty experience with our most popular premium package',
      price: 'AED 499',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1738',
    },
    {
      id: 22,
      category: 'Signature Beauty Packages',
      title: 'Beauty Package – Flourish',
      description: 'Our ultimate luxury pampering session — a head-to-toe beauty transformation',
      price: 'AED 599',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1738',
    },
    {
      id: 23,
      category: 'Treatment Combos',
      title: 'Botox | Keratin | Nanoplastia | Protein',
      description: 'Choose any one of our advanced hair smoothing and strengthening treatment combos',
      price: 'AED 600',
      image: '/botox-keratin.jpg',
    },
  ];

  const categories = [...new Set(packagesData.map(p => p.category))];

  export default function PackagesPage() {
    return (
      <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="font-tangerine text-6xl md:text-8xl text-rose-900 mb-4">Combos & Packages</h1>
            <p className="text-gray-700 text-xl max-w-3xl mx-auto">
              Handpicked combinations of our best services — more value, more you
            </p>
          </div>

          {categories.map((category) => (
            <div key={category} className="mb-16">
              <h2 className="font-tangerine text-4xl md:text-5xl text-rose-800 text-center mb-8">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {packagesData.filter(p => p.category === category).map((pkg) => (
                  <div key={pkg.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group">
                    <div className="relative h-52 overflow-hidden">
                      <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute top-4 right-4 bg-rose-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold text-sm">
                        <Gift className="w-4 h-4 inline mr-1" />
                        {pkg.price}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-rose-900 mb-3 text-base font-semibold">{pkg.title}</h3>
                      <p className="text-gray-600 mb-4 text-sm">{pkg.description}</p>
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
            </div>
          ))}

          <div className="mt-8 text-center bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-12 text-white">
            <h2 className="font-tangerine text-5xl md:text-6xl mb-4">Treat Yourself to Something Special</h2>
            <p className="text-xl mb-6 max-w-2xl mx-auto">
              Book any of our packages online or contact us to find the perfect combination for you
            </p>
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
  