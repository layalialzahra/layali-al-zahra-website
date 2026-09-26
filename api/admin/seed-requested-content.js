import { getDb } from '../_lib/mongodb.js';
import { requireAdmin, sameOrigin } from '../_lib/auth.js';
import { assertUniqueContentSlug, ensureContentIndexes, serializeContent, validateContentInput } from '../_lib/content.js';

const REQUESTED_CONTENT = [
  {
    type: 'news',
    title: 'Layali Al Zahra Announces 50% Off Anniversary Offer',
    slug: 'layali-al-zahra-50-off-anniversary-offer-october-2026',
    category: 'Offers',
    excerpt: 'Layali Al Zahra is celebrating with 50% off all salon services from 1 to 7 October 2026, with a minimum spend of AED 250.',
    body: '<p>There is something worth celebrating at Layali Al Zahra Beauty Lounge. From 1 to 7 October 2026, we are marking our anniversary with a special offer for our ladies: <strong>50% off all services</strong> when you spend a minimum of AED 250.</p><p>It is our way of saying thank you to the women who have trusted us with their hair, skin, nails and beauty appointments over the years. If you have been planning a new hair treatment, a fresh manicure, a facial or simply some time for yourself, this is a good week to book it.</p><h2>Anniversary offer details</h2><ul><li><strong>50% off</strong> on all services*</li><li><strong>Minimum spend:</strong> AED 250</li><li><strong>Offer period:</strong> 1 to 7 October 2026</li><li><strong>Salon:</strong> Layali Al Zahra Beauty Lounge, ladies only</li></ul><p>The offer is available for a limited period, so appointments during the anniversary week may fill quickly. Terms and conditions apply.</p><p>Ready to book? Visit <a href="https://www.layalialzahra.com/contact">www.layalialzahra.com</a> or call <strong>+971 52 370 6025</strong> or <strong>+971 4 347 5545</strong>.</p><p><small>*Terms and conditions apply.</small></p>',
    featuredImage: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1600',
    altText: 'Elegant beauty salon interior prepared for an anniversary celebration',
    tags: ['anniversary offer', '50 percent off', 'dubai beauty salon', 'ladies salon dubai', 'salon offer'],
    author: 'Layali Al Zahra Beauty Lounge',
    relatedService: 'Beauty Services',
    seoTitle: '50% Off Anniversary Offer | Layali Al Zahra Dubai',
    metaDescription: 'Celebrate with Layali Al Zahra. Get 50% off all salon services from 1 to 7 October 2026 with a minimum spend of AED 250. Terms apply.',
    socialImage: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1600',
    status: 'published',
    publishDate: '2026-09-26T09:00:00Z'
  },
  {
    type: 'blog',
    title: 'Hair Gloss vs Hair Colour: What Is the Difference?',
    slug: 'hair-gloss-vs-hair-colour',
    category: 'Hair Colour',
    excerpt: 'Hair gloss and hair colour do different jobs. Understanding the difference can help you choose between a shine and tone refresh and a more noticeable colour change.',
    body: '<p>If your hair looks a little flat, your colour has lost some of its freshness or you simply want more shine, you may hear your stylist mention a gloss. It sounds similar to hair colour, but the two services are not interchangeable.</p><h2>What does a hair gloss do?</h2><p>A gloss is generally used to refresh tone and add shine rather than create a major colour change. Depending on the formula, it can help refine unwanted warmth, revive a faded shade or give natural hair a more polished finish. It is often chosen when you want a subtle change that still looks like your own hair.</p><h2>How is that different from hair colour?</h2><p>Traditional colour can make a more noticeable change to the hair's shade. Depending on the service, colour may be used to deepen a tone, cover grey, add dimension or lighten selected areas. The right technique depends on your starting colour, hair condition and the result you want.</p><h2>Which one makes sense after your colour starts fading?</h2><p>That depends on what you are trying to correct. If the colour is still close to what you want but looks dull or slightly off in tone, a gloss may be enough to refresh it. If you want a different shade, stronger coverage or a more significant change, your stylist may recommend a colour service instead.</p><h2>Why the consultation matters</h2><p>Hair colour is not a one-size-fits-all decision. Previous colour, lightening, texture and the condition of the hair can all affect what is possible. A professional can assess the hair before recommending a service rather than treating a reference photo as a guarantee of the result.</p><h2>How to keep coloured hair looking its best</h2><p>Whatever service you choose, gentle aftercare matters. Use products suited to your hair and colour, avoid unnecessary high heat and be careful when detangling wet hair. Dermatologists also recommend limiting excessive heat because repeated high temperatures can damage the hair shaft.</p><h2>So, gloss or colour?</h2><p>Choose a gloss when your main goal is a shine and tone refresh. Consider a colour service when you want a more substantial change. If you are unsure, bring your current hair colour and your desired result to your appointment and let your stylist assess what will work best for your hair.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    altText: 'Woman with professionally coloured glossy hair in a salon setting',
    tags: ['hair gloss', 'hair colour dubai', 'hair colour', 'gloss treatment', 'hair salon dubai'],
    author: 'Layali Al Zahra Beauty Lounge',
    relatedService: 'Hair Colour',
    seoTitle: 'Hair Gloss vs Hair Colour: What Is the Difference?',
    metaDescription: 'Understand the difference between a hair gloss and hair colour, including what each service does and when a salon colour refresh may be suitable.',
    socialImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    status: 'published',
    publishDate: '2026-09-26T09:15:00Z'
  },
  {
    type: 'blog',
    title: 'A Simple Skincare Routine for Dubai Weather',
    slug: 'simple-skincare-routine-dubai-weather',
    category: 'Skincare',
    excerpt: 'A good skincare routine does not have to be complicated. Here is a simple way to approach cleansing, treatment, moisturising and sun protection in Dubai.',
    body: '<p>When you live in Dubai, your skin can move between very different environments in the same day. You may spend time in heat and sunlight outside, then move into strong air conditioning indoors. Add makeup, sweat and a busy schedule and it is easy to end up using too many products or changing your routine too often.</p><p>A simpler approach is often easier to maintain. Dermatologists generally recommend building a routine around a gentle cleanser, any treatment product you actually need, moisturiser and sunscreen.</p><h2>Morning: keep it simple</h2><p>Start with a gentle cleanser if your skin needs one. Follow with a treatment product if it is part of your routine, then moisturiser and a broad-spectrum sunscreen. The American Academy of Dermatology recommends broad-spectrum sunscreen with SPF 30 or higher. If you will be outdoors for extended periods, sun protection should not be treated as an occasional step.</p><h2>Do not over-cleanse</h2><p>A common mistake is trying to make the skin feel extremely clean by using harsh cleansers or scrubs. That can leave skin dry or irritated. If your skin is dry or sensitive, you may not need to wash your face repeatedly throughout the day. Pay attention to how your skin responds rather than copying someone else's routine.</p><h2>Moisturiser still matters in Dubai</h2><p>Heat does not automatically mean your skin does not need moisture. Air conditioning can contribute to a dry feeling, while the wrong cleanser or too much exfoliation can make the problem worse. Choose a moisturiser that feels comfortable on your skin and use it consistently.</p><h2>Be careful with exfoliation</h2><p>Exfoliation can be useful for some people, but more is not always better. If your skin is already dry, peeling, stinging or irritated, adding another exfoliating product may make things worse. Give your skin time to settle before adding more active products.</p><h2>Where a facial fits in</h2><p>A professional facial can be a useful part of a beauty routine when it is chosen around your skin's needs. It should complement your everyday care rather than replace it. If you have persistent acne, a rash, significant irritation or another ongoing skin concern, a dermatologist is the right person to assess it.</p><h2>The routine worth sticking to</h2><p>Consistency beats a complicated shelf. Cleanse gently, use the treatment products that make sense for your skin, moisturise and protect your skin from the sun. Give a new routine enough time to show how your skin responds before adding several new products at once.</p><p>If you are unsure what your skin needs before a facial or beauty treatment, a consultation with a trained professional can help you choose a more suitable approach.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    altText: 'Woman receiving a professional facial skincare treatment',
    tags: ['skincare dubai', 'skin care routine', 'facial dubai', 'dubai beauty', 'sun protection'],
    author: 'Layali Al Zahra Beauty Lounge',
    relatedService: 'Facial & Skin',
    seoTitle: 'Simple Skincare Routine for Dubai Weather',
    metaDescription: 'A practical skincare routine for Dubai weather covering cleansing, moisturising, sunscreen and when a professional facial may help.',
    socialImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740',
    status: 'published',
    publishDate: '2026-09-26T09:30:00Z'
  },
  {
    type: 'blog',
    title: 'Gel Manicure or Regular Polish: Which One Is Right for You?',
    slug: 'gel-manicure-vs-regular-polish',
    category: 'Nails',
    excerpt: 'Gel and regular polish can both give you polished-looking nails. The better choice depends on how long you want the colour to last, how you remove it and how your nails are doing between appointments.',
    body: '<p>Choosing between gel polish and regular nail polish is usually less about which one is better and more about what works for your routine. Gel is popular because it stays neat for longer, while regular polish is easier to change and does not require the same removal process.</p><h2>Why people choose gel</h2><p>Gel manicures are useful when you want a longer-lasting finish and do not want to think about chips every few days. They can be a practical option before a holiday, event or busy period when you want your nails to stay polished.</p><h2>Why regular polish still has a place</h2><p>Regular polish is simpler to remove and makes it easier to change colours often. It can also be a sensible choice if your nails are already brittle, peeling or otherwise giving you trouble. The American Academy of Dermatology notes that repeated gel manicures can contribute to brittleness, peeling and cracking in some people.</p><h2>Removal matters as much as application</h2><p>Do not pick or peel gel polish when it starts lifting. Pulling at the product can take layers of the nail with it. Professional removal is a better option. During gel removal, acetone should be limited to the fingertips rather than soaking the whole hands whenever possible.</p><h2>Give your nails a break</h2><p>If you regularly wear gel polish, consider taking breaks between applications. Moisturising the nails and cuticles can also help reduce brittleness. If your nails remain weak, painful or discoloured, it is better to pause the manicure cycle and have the problem checked.</p><h2>Pay attention to salon hygiene</h2><p>Clean tools and workstations matter. The American Academy of Dermatology recommends checking that nail tools are properly cleaned and disinfected between clients and that pedicure foot baths are thoroughly disinfected. It is completely reasonable to ask how tools are cleaned before your service.</p><h2>So which should you choose?</h2><p>Choose gel when longevity is your priority and your nails are healthy enough for the service. Choose regular polish when you want easier changes or your nails need a simpler routine. Whichever you choose, gentle removal and good nail care between appointments matter just as much as the colour on top.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1633955726992-2b7c0d2d2a69?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1400',
    altText: 'Professional manicure being completed at a beauty salon',
    tags: ['gel manicure dubai', 'manicure dubai', 'nail care', 'healthy nails', 'nail salon dubai'],
    author: 'Layali Al Zahra Beauty Lounge',
    relatedService: 'Acrylic & Nail Art',
    seoTitle: 'Gel Manicure vs Regular Polish: Which Is Right for You?',
    metaDescription: 'Compare gel manicure and regular polish, including longevity, removal, nail care and salon hygiene before your next manicure in Dubai.',
    socialImage: 'https://images.unsplash.com/photo-1633955726992-2b7c0d2d2a69?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1400',
    status: 'published',
    publishDate: '2026-09-26T09:45:00Z'
  }
];

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed');
  }
  if (!sameOrigin(req)) return sendError(res, 403, 'Forbidden');

  try {
    await ensureContentIndexes();
    const db = await getDb();
    const collection = db.collection('content');
    const created = [];
    const skipped = [];

    for (const input of REQUESTED_CONTENT) {
      const data = validateContentInput(input);
      const exists = await collection.findOne({ type: data.type, slug: data.slug }, { projection: { _id: 1 } });
      if (exists) {
        skipped.push(data.slug);
        continue;
      }
      await assertUniqueContentSlug(collection, data.type, data.slug);
      const now = new Date();
      const document = { ...data, createdAt: now, updatedAt: now };
      const result = await collection.insertOne(document);
      created.push(serializeContent({ ...document, _id: result.insertedId }));
    }

    return res.status(200).json({
      success: true,
      created: created.length,
      skipped: skipped.length,
      items: created
    });
  } catch (error) {
    console.error('Requested content seed failed', error);
    return sendError(res, 503, 'Requested content could not be added.');
  }
}
