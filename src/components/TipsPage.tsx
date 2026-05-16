import React from 'react';
  import { Lightbulb } from 'lucide-react';

  const tipsData = [
    {
      id: 1,
      title: "Dubai Hard Water & Your Hair",
      description:
        "Dubai's tap water has one of the highest mineral contents in the region — up to 500 mg/L of dissolved calcium and magnesium. These minerals coat the hair shaft, causing dullness, brittleness, and colour fading much faster than normal. If your hair feels rough or your colour is not lasting between visits, hard water is very likely the reason.",
      image: '/tip-hard-water-hair.webp',
      tips: [
        "Use a chelating or clarifying shampoo once a week to strip mineral deposits from the hair shaft",
        "Always follow a clarifying wash with a deep conditioning mask — mineral buildup dehydrates the cuticle",
        "Fit a vitamin C or KDF shower filter to your bathroom — widely available in Dubai, and the difference is noticeable within weeks",
        "If your hair is colour-treated, book a bond-rebuilding treatment (Olaplex or Fiber Plex) every 6-8 weeks to counteract mineral damage",
        "A final rinse of 1 tablespoon apple cider vinegar in 500ml cool water removes residue and restores natural shine",
      ],
    },
    {
      id: 2,
      title: "UAE Summer Sun: Protecting Your Hair Outdoors",
      description:
        "Dubai's summer UV index regularly hits 10-11 (Extreme), with temperatures exceeding 45 degrees Celsius from June through September. Direct sun exposure bleaches colour-treated hair, breaks down keratin bonds, and leaves hair dry and porous — whether you are commuting, at the beach, or walking between malls.",
      image: '/tip-summer-hair-protection.webp',
      tips: [
        "Apply a UV-filter leave-in spray or serum before stepping outdoors — look for benzophenone-4 or UV-absorbing silicones on the label",
        "A lightweight silk or satin-lined scarf is one of the most effective sun shields for your hair and scalp",
        "Schedule colour treatments and keratin sessions between October and April — summer UV accelerates colour fading by up to 40%",
        "Always rinse hair with cool water after sun exposure, never hot",
        "Deep condition weekly during summer; the combination of heat, sea salt, chlorine, and AC makes hair particularly prone to breakage",
      ],
    },
    {
      id: 3,
      title: "AC Culture & Dry Skin: A Dubai Reality",
      description:
        "Most Dubai residents spend over 90% of their time in air-conditioned spaces. AC systems drop indoor humidity to 20-30%, continuously pulling moisture from the skin. This causes tightness, flakiness, and accelerated fine lines — compounded by Dubai's already low natural outdoor humidity outside the summer peak.",
      image: '/tip-ac-skin-care.webp',
      tips: [
        "Switch from gel-based cleansers to cream or oil cleansers — they clean without stripping the skin moisture barrier",
        "Apply hyaluronic acid serum onto slightly damp skin before moisturising — it needs water present to draw moisture into the skin",
        "Place a cold-air humidifier in your bedroom; keeping humidity at 45-55% overnight makes a visible difference to both skin and hair",
        "Carry a thermal facial mist (such as Avene or La Roche-Posay Thermal Water) for a midday refresh on long office days",
        "Drink 2.5-3 litres of water daily — the AC environment accelerates fluid loss even without physical exercise",
      ],
    },
    {
      id: 4,
      title: "Sandstorm Season: Skin & Hair Recovery",
      description:
        "Dubai experiences dust storms (shamal winds) most frequently from March through May, and occasionally in autumn. Fine desert sand and grit settle on hair, block pores, and cause microscopic abrasion on the skin. A single sandstorm can undo a full week of careful skincare if you are not prepared.",
      image: '/tip-sandstorm-recovery.webp',
      tips: [
        "Double-cleanse your face after any dusty day — an oil cleanser first dissolves particles in pores, followed by a water-based cleanser",
        "Cover hair with a scarf or tie it in a loose bun before going outdoors in dusty conditions — open hair lets fine sand penetrate deep to the scalp",
        "Follow any dusty day with a clarifying shampoo wash, then a hydrating mask to restore moisture",
        "Avoid waxing, threading, or chemical facial treatments within 24 hours of heavy dust exposure — skin is already sensitised",
        "Change your pillowcase more often during sandstorm season to prevent re-depositing particles onto freshly cleaned skin overnight",
      ],
    },
    {
      id: 5,
      title: "Eid & Festive Season Beauty: Plan Ahead in Dubai",
      description:
        "Eid Al Fitr and Eid Al Adha are the two busiest periods of the year for beauty salons across Dubai. Demand for henna (Mehandi), bridal makeup, blowouts, and full-body waxing surges in the days before Eid. Knowing how to time your bookings and treatments means you look your absolute best without last-minute stress.",
      image: '/tip-eid-bridal-prep.webp',
      tips: [
        "Book your salon appointment 2-3 weeks before Eid — slots fill within days of the date announcement each year",
        "Traditional henna should be applied 24-48 hours before the occasion for the deepest colour; freshly applied henna will still appear orange on the day",
        "Get waxing done 48-72 hours before any event so redness and sensitivity fully subside",
        "Keratin and protein hair treatments need 7-10 days to fully settle — plan these ahead, then book a blow dry closer to the occasion",
        "Brides: always do a full trial session (makeup, hair, and henna) at least 4 weeks before the wedding",
      ],
    },
    {
      id: 6,
      title: "Chlorine & Sea Salt: Hair Care Through Pool Season",
      description:
        "From April through October, swimming is one of the most common leisure activities in Dubai. Chlorinated pool water strips the hair's natural oils and colour pigment, while sea salt from beach visits causes dehydration and tangling. Blonde and colour-treated hair is especially vulnerable — but the right routine prevents most of the damage.",
      image: '/tip-pool-chlorine-hair.webp',
      tips: [
        "Thoroughly wet your hair with fresh water before entering any pool — pre-saturated hair absorbs significantly less chlorinated water",
        "Apply a thin coat of coconut or argan oil through the hair before swimming to create a barrier against chlorine absorption",
        "Rinse immediately after swimming and use a swimmer's clarifying shampoo to remove chlorine and mineral deposits",
        "Deep condition once a week throughout the pool season — a leave-in treatment or coconut oil mask left overnight works well",
        "For colour-treated hair, book a protein bond treatment (such as Olaplex) monthly during heavy swimming periods to prevent breakage",
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
              Expert advice from our Dubai salon professionals — crafted for the UAE climate and lifestyle
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {tipsData.map((tip) => (
              <div
                key={tip.id}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={tip.image}
                    alt={tip.title + ' — beauty tip for Dubai and UAE residents'}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg">
                    <Lightbulb className="w-5 h-5 inline mr-1" />
                    Tip
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-rose-900 mb-3">{tip.title}</h3>
                  <p className="text-gray-600 mb-4">{tip.description}</p>
                  <ul className="space-y-2">
                    {tip.tips.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-rose-500 mt-1">&#8226;</span>
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
  