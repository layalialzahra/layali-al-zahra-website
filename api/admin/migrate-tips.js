import { getDb } from "../_lib/mongodb.js";
import { requireAdmin, sameOrigin } from "../_lib/auth.js";
import { ensureContentIndexes, validateContentInput, serializeContent } from "../_lib/content.js";

const EXISTING_TIPS = [
  { title: "Dubai Hard Water & Your Hair", excerpt: "Dubai's tap water has one of the highest mineral contents in the region — up to 500 mg/L of dissolved calcium and magnesium. These minerals coat the hair shaft, causing dullness, brittleness, and colour fading much faster than normal. If your hair feels rough or your colour is not lasting between visits, hard water is very likely the reason.", image: "/tip-hard-water-hair.webp", tips: ["Use a chelating or clarifying shampoo once a week to strip mineral deposits from the hair shaft", "Always follow a clarifying wash with a deep conditioning mask — mineral buildup dehydrates the cuticle", "Fit a vitamin C or KDF shower filter to your bathroom — widely available in Dubai, and the difference is noticeable within weeks", "If your hair is colour-treated, book a bond-rebuilding treatment (Olaplex or Fiber Plex) every 6-8 weeks to counteract mineral damage", "A final rinse of 1 tablespoon apple cider vinegar in 500ml cool water removes residue and restores natural shine"] },
  { title: "UAE Summer Sun: Protecting Your Hair Outdoors", excerpt: "Dubai's summer UV index regularly hits 10-11 (Extreme), with temperatures exceeding 45 degrees Celsius from June through September. Direct sun exposure bleaches colour-treated hair, breaks down keratin bonds, and leaves hair dry and porous — whether you are commuting, at the beach, or walking between malls.", image: "/tip-summer-hair-protection.webp", tips: ["Apply a UV-filter leave-in spray or serum before stepping outdoors — look for benzophenone-4 or UV-absorbing silicones on the label", "A lightweight silk or satin-lined scarf is one of the most effective sun shields for your hair and scalp", "Schedule colour treatments and keratin sessions between October and April — summer UV accelerates colour fading by up to 40%", "Always rinse hair with cool water after sun exposure, never hot", "Deep condition weekly during summer; the combination of heat, sea salt, chlorine, and AC makes hair particularly prone to breakage"] },
  { title: "AC Culture & Dry Skin: A Dubai Reality", excerpt: "Most Dubai residents spend over 90% of their time in air-conditioned spaces. AC systems drop indoor humidity to 20-30%, continuously pulling moisture from the skin. This causes tightness, flakiness, and accelerated fine lines — compounded by Dubai's already low natural outdoor humidity outside the summer peak.", image: "/tip-ac-skin-care.webp", tips: ["Switch from gel-based cleansers to cream or oil cleansers — they clean without stripping the skin moisture barrier", "Apply hyaluronic acid serum onto slightly damp skin before moisturising — it needs water present to draw moisture into the skin", "Place a cold-air humidifier in your bedroom; keeping humidity at 45-55% overnight makes a visible difference to both skin and hair", "Carry a thermal facial mist (such as Avene or La Roche-Posay Thermal Water) for a midday refresh on long office days", "Drink 2.5-3 litres of water daily — the AC environment accelerates fluid loss even without physical exercise"] },
  { title: "Sandstorm Season: Skin & Hair Recovery", excerpt: "Dubai experiences dust storms (shamal winds) most frequently from March through May, and occasionally in autumn. Fine desert sand and grit settle on hair, block pores, and cause microscopic abrasion on the skin. A single sandstorm can undo a full week of careful skincare if you are not prepared.", image: "/tip-sandstorm-recovery.webp", tips: ["Double-cleanse your face after any dusty day — an oil cleanser first dissolves particles in pores, followed by a water-based cleanser", "Cover hair with a scarf or tie it in a loose bun before going outdoors in dusty conditions — open hair lets fine sand penetrate deep to the scalp", "Follow any dusty day with a clarifying shampoo wash, then a hydrating mask to restore moisture", "Avoid waxing, threading, or chemical facial treatments within 24 hours of heavy dust exposure — skin is already sensitised", "Change your pillowcase more often during sandstorm season to prevent re-depositing particles onto freshly cleaned skin overnight"] },
  { title: "Eid & Festive Season Beauty: Plan Ahead in Dubai", excerpt: "Eid Al Fitr and Eid Al Adha are the two busiest periods of the year for beauty salons across Dubai. Demand for henna (Mehandi), bridal makeup, blowouts, and full-body waxing surges in the days before Eid. Knowing how to time your bookings and treatments means you look your absolute best without last-minute stress.", image: "/tip-eid-bridal-prep.webp", tips: ["Book your salon appointment 2-3 weeks before Eid — slots fill within days of the date announcement each year", "Traditional henna should be applied 24-48 hours before the occasion for the deepest colour; freshly applied henna will still appear orange on the day", "Get waxing done 48-72 hours before any event so redness and sensitivity fully subside", "Keratin and protein hair treatments need 7-10 days to fully settle — plan these ahead, then book a blow dry closer to the occasion", "Brides: always do a full trial session (makeup, hair, and henna) at least 4 weeks before the wedding"] },
  { title: "Chlorine & Sea Salt: Hair Care Through Pool Season", excerpt: "From April through October, swimming is one of the most common leisure activities in Dubai. Chlorinated pool water strips the hair's natural oils and colour pigment, while sea salt from beach visits causes dehydration and tangling. Blonde and colour-treated hair is especially vulnerable — but the right routine prevents most of the damage.", image: "/tip-pool-chlorine-hair.webp", tips: ["Thoroughly wet your hair with fresh water before entering any pool — pre-saturated hair absorbs significantly less chlorinated water", "Apply a thin coat of coconut or argan oil through the hair before swimming to create a barrier against chlorine absorption", "Rinse immediately after swimming and use a swimmer's clarifying shampoo to remove chlorine and mineral deposits", "Deep condition once a week throughout the pool season — a leave-in treatment or coconut oil mask left overnight works well", "For colour-treated hair, book a protein bond treatment (such as Olaplex) monthly during heavy swimming periods to prevent breakage"] }
];

function slugify(value) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120); }
function sendError(res, status, message) { return res.status(status).json({ success: false, message }); }

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return sendError(res, 405, "Method not allowed"); }
  if (!sameOrigin(req)) return sendError(res, 403, "Forbidden");

  try {
    await ensureContentIndexes();
    const db = await getDb();
    const collection = db.collection("content");
    const results = [];
    const now = new Date();

    for (const tip of EXISTING_TIPS) {
      const slug = slugify(tip.title);
      const existing = await collection.findOne({ type: "tip", slug });
      if (existing) {
        results.push({ title: tip.title, status: "skipped", item: serializeContent(existing) });
        continue;
      }
      const input = validateContentInput({ type: "tip", title: tip.title, slug, excerpt: tip.excerpt, featuredImage: tip.image, altText: `${tip.title} — beauty tip for Dubai and UAE residents`, category: "Dubai Beauty", tags: ["Dubai", "UAE", "Beauty Tips"], tip1: tip.tips[0], tip2: tip.tips[1], tip3: tip.tips[2], tip4: tip.tips[3], tip5: tip.tips[4], status: "draft", publishDate: null }, false);
      const document = { ...input, status: "draft", publishDate: null, createdAt: now, updatedAt: now };
      const result = await collection.insertOne(document);
      results.push({ title: tip.title, status: "migrated", item: serializeContent({ ...document, _id: result.insertedId }) });
    }

    return res.status(200).json({ success: true, migrated: results.filter((item) => item.status === "migrated").length, skipped: results.filter((item) => item.status === "skipped").length, results });
  } catch (error) {
    if (error?.code === 11000) return sendError(res, 409, "A migrated tip already exists");
    console.error("Tip migration failed", error);
    return sendError(res, 503, "Content migration unavailable");
  }
}
