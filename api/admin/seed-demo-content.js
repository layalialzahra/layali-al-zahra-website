import { getDb } from '../_lib/mongodb.js';
import { requireAdmin, sameOrigin } from '../_lib/auth.js';
import { assertUniqueContentSlug, ensureContentIndexes, serializeContent, validateContentInput } from '../_lib/content.js';

const DEMO_CONTENT = [
  {
    type: 'blog', title: 'Healthy Hair in Dubai: A Simple Routine for Heat, Sun & AC', slug: 'healthy-hair-dubai-heat-sun-ac', category: 'Hair Care',
    excerpt: 'Dubai routines can expose hair to heat, sun, frequent styling and long hours in air conditioning. A simple, consistent routine can help keep hair stronger and easier to manage.',
    body: '<p>Hair care does not need to be complicated. Dermatologists recommend matching your routine to your hair type, cleansing the scalp rather than aggressively scrubbing the lengths, conditioning after washing and treating wet hair gently.</p><h2>Build the routine around your scalp and hair type</h2><p>Choose products for your hair type and wash according to how quickly your scalp becomes oily or dirty. Conditioner helps moisturise and detangle the lengths, while a wide-tooth comb can reduce unnecessary pulling when hair is wet.</p><h2>Be thoughtful with heat</h2><p>Blow dryers, flat irons and curling tools can damage hair when used excessively. When styling, use lower or medium heat where practical and pair heat styling with an appropriate heat-protective product.</p><h2>Make it realistic for Dubai life</h2><p>Keep the routine simple enough to follow after busy days, protect your hair from prolonged direct sun and pay attention to changes in dryness, breakage or scalp comfort. If you have persistent scalp or hair concerns, speak with a qualified dermatologist.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740', altText: 'Woman receiving professional hair care in a salon', tags: ['hair care', 'dubai beauty', 'hair health'], author: 'Layali Al Zahra Beauty Lounge', relatedService: 'Hair Treatments', seoTitle: 'Healthy Hair in Dubai: Heat, Sun & AC Hair Care', metaDescription: 'A practical hair-care routine for Dubai lifestyles, including gentle washing, conditioning and smarter heat styling.', status: 'published', publishDate: '2026-09-11T09:00:00Z'
  },
  {
    type: 'blog', title: 'Autumn 2026 Beauty Trends: Soft Glam, Layered Hair & Statement Nails', slug: 'autumn-2026-beauty-trends-dubai', category: 'Dubai Beauty',
    excerpt: 'The latest autumn beauty coverage is moving toward softer skin, expressive eyes, layered hair and more playful nails — ideas that can be adapted to a polished Dubai look.',
    body: '<p>Current autumn 2026 beauty coverage points toward a balance of polished simplicity and creative detail. The common thread is personalisation rather than a single prescriptive look.</p><h2>Soft, skin-first makeup</h2><p>Recent trend reports highlight sheer, healthy-looking skin, subtle blush placement and warm, softly blended eye looks. A single feature can carry the look while the rest stays understated.</p><h2>Hair with movement</h2><p>Layered cuts, face-framing shapes and modern takes on the bob are appearing strongly in current salon trend coverage. The best version of a trend is the one adapted to your face shape, hair texture and daily routine.</p><h2>More personality on the nails</h2><p>Expressive nail art is also returning to the spotlight. Sheer colour, creative French variations and statement finishes can add interest without requiring an entirely new wardrobe.</p><p>Trends are inspiration, not rules. A professional consultation can help translate a runway or editorial idea into something practical for you.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1614006659838-d4ca51cbd117?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=2670', altText: 'Professional makeup application in a beauty setting', tags: ['beauty trends', 'autumn 2026', 'makeup', 'nails'], author: 'Layali Al Zahra Beauty Lounge', relatedService: 'Makeup Services', seoTitle: 'Autumn 2026 Beauty Trends | Layali Al Zahra Dubai', metaDescription: 'A Layali Al Zahra look at autumn 2026 beauty trends across makeup, hair and nails.', status: 'published', publishDate: '2026-09-12T09:00:00Z'
  },
  {
    type: 'tip', title: 'Heat-Protect Your Hair Before Styling', slug: 'heat-protect-your-hair-before-styling', category: 'Hair Care',
    excerpt: 'A few small changes to your styling routine can reduce unnecessary heat exposure and help your hair stay smoother and healthier.',
    featuredImage: 'https://images.unsplash.com/photo-1634449571017-5fecfd26ad76?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740', altText: 'Hair styling in a professional salon', tags: ['hair care', 'heat styling', 'hair health'], author: 'Layali Al Zahra Beauty Lounge', relatedService: 'Hair Treatments',
    tip1: 'Let hair partially air-dry before using a blow dryer or hot styling tool whenever your routine allows.', tip2: 'Use a heat-protective product designed for your hair type before applying direct heat.', tip3: 'Choose a lower or medium heat setting instead of automatically using the highest temperature.', tip4: 'Keep flat irons and curling tools moving rather than repeatedly heating the same section.', tip5: 'If you notice persistent breakage, dryness or scalp concerns, consider a professional assessment instead of increasing the intensity of your styling routine.', status: 'published', publishDate: '2026-09-13T09:00:00Z'
  },
  {
    type: 'tip', title: 'A Simple Daily Sunscreen Habit for Dubai Skin', slug: 'daily-sunscreen-habit-dubai-skin', category: 'Skincare',
    excerpt: 'Consistent sun protection is one of the simplest daily habits for maintaining healthy-looking skin, especially in a bright climate like Dubai.',
    featuredImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1740', altText: 'Woman receiving a skincare treatment', tags: ['skincare', 'sun protection', 'dubai beauty'], author: 'Layali Al Zahra Beauty Lounge', relatedService: 'Facial & Skin',
    tip1: 'Choose broad-spectrum sunscreen with SPF 30 or higher and water resistance when appropriate.', tip2: 'Apply sunscreen before going outdoors so it has time to form an effective protective layer.', tip3: 'Cover commonly missed areas such as the ears, neck and the tops of the feet when they are exposed.', tip4: 'Reapply at least every two hours when outdoors, and sooner after swimming or heavy sweating.', tip5: 'Pair sunscreen with shade, clothing and other sun-protective habits for a more complete routine.', status: 'published', publishDate: '2026-09-14T07:30:00Z'
  },
  {
    type: 'news', title: 'Layali Al Zahra Launches the Beauty Journal & Tips Experience', slug: 'layali-al-zahra-beauty-journal-launch', category: 'News',
    excerpt: 'Our new Beauty Journal, Beauty Tips and Salon News experience brings useful salon content into one easy-to-browse place.',
    body: '<p>We are introducing a refreshed content experience across the Layali Al Zahra website. Visitors can now discover Beauty Journal articles, practical Beauty Tips and Salon News from the main navigation and dedicated content pages.</p><p>New stories will be published from the salon CMS and will appear automatically across the relevant public sections, including selected homepage highlights.</p><p>The goal is simple: make it easier to discover useful beauty guidance, salon updates and inspiration without losing the warm visual style of the Layali Al Zahra website.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1080', altText: 'Elegant beauty salon interior', tags: ['salon news', 'layali al zahra', 'beauty journal'], author: 'Layali Al Zahra Beauty Lounge', status: 'published', publishDate: '2026-09-14T08:00:00Z'
  },
  {
    type: 'news', title: 'September 2026 Beauty Focus: Soft Glam & Expressive Nails', slug: 'september-2026-beauty-focus-soft-glam-expressive-nails', category: 'Seasonal',
    excerpt: 'This month we are taking inspiration from the latest beauty coverage: softer makeup, warm eye tones and more expressive nail finishes.',
    body: '<p>September brings a fresh seasonal mood to beauty. Current 2026 trend coverage is highlighting soft, skin-first makeup alongside warmer blended eyes and more expressive nail looks.</p><p>At Layali Al Zahra, we see these trends as starting points for personalised looks rather than strict rules. Our stylists and beauty professionals can adapt colour, shape and finish to your features, lifestyle and occasion.</p><p>Whether you prefer an understated everyday look or a more noticeable seasonal update, a consultation is the best place to start.</p>',
    featuredImage: 'https://images.unsplash.com/photo-1633955726992-2b7c0d2d2a69?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=928', altText: 'Manicured nails in a beauty salon setting', tags: ['beauty trends', 'september 2026', 'nails', 'makeup'], author: 'Layali Al Zahra Beauty Lounge', relatedService: 'Acrylic & Nail Art', status: 'published', publishDate: '2026-09-14T09:00:00Z'
  },
];

function sendError(res, status, message) { return res.status(status).json({ success: false, message }); }

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return sendError(res, 405, 'Method not allowed'); }
  if (!sameOrigin(req)) return sendError(res, 403, 'Forbidden');
  try {
    await ensureContentIndexes();
    const db = await getDb();
    const collection = db.collection('content');
    const created = []; const skipped = [];
    for (const input of DEMO_CONTENT) {
      const data = validateContentInput(input);
      const exists = await collection.findOne({ type: data.type, slug: data.slug }, { projection: { _id: 1 } });
      if (exists) { skipped.push(`${data.type}:${data.slug}`); continue; }
      await assertUniqueContentSlug(collection, data.type, data.slug);
      const now = new Date();
      const document = { ...data, createdAt: now, updatedAt: now };
      const result = await collection.insertOne(document);
      created.push(serializeContent({ ...document, _id: result.insertedId }));
    }
    return res.status(200).json({ success: true, created: created.length, skipped: skipped.length, items: created });
  } catch (error) {
    console.error('Demo content seed failed', error);
    return sendError(res, 503, 'Demo content could not be loaded.');
  }
}
