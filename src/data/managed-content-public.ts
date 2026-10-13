import { legacyServicesData } from "./legacy-services.js";
import { legacyOffersData } from "./legacy-offers.js";
import { legacyPackagesData } from "./legacy-packages.js";
import { legacyFaqs } from "./legacy-faqs.js";

const BOOKING_URL = "https://store.zylu.co/business/layali-al-zahra-beauty-salon-llc/services";
const managedContentEnabled = import.meta.env.VITE_MANAGED_CONTENT_ENABLED === "true";

async function loadItems(endpoint: string, fallback: any[], transform: (item: any) => any, enabled = managedContentEnabled, fetchImpl: typeof fetch = globalThis.fetch): Promise<any[]> {
  if (!enabled || typeof fetchImpl !== "function") return fallback;
  try {
    const response = await fetchImpl(endpoint, { method: "GET", cache: "no-store" });
    if (!response.ok) return fallback;
    const data = await response.json();
    if (!data?.success || !Array.isArray(data.items)) return fallback;
    return data.items.map(transform);
  } catch {
    return fallback;
  }
}

export function loadPublicServices(enabled = managedContentEnabled, fetchImpl: typeof fetch = globalThis.fetch) {
  return loadItems("/api/services", legacyServicesData, (item) => {
    const slug = String(item.slug || "");
    const legacy = legacyServicesData.find((entry) => entry.id === slug);
    return {
      id: slug || legacy?.id || String(item._id),
      title: String(item.title || legacy?.title || ""),
      image: String(item.imageUrl || legacy?.image || ""),
      description: String(item.description || ""),
      subservices: Array.isArray(item.subservices) ? item.subservices.map((subservice: any) => ({
        id: String(subservice.id || subservice.name || ""),
        name: String(subservice.name || ""),
        price: String(subservice.price || ""),
        ...(subservice.description ? { description: String(subservice.description) } : {}),
        ...(subservice.bookingUrl ? { bookingUrl: String(subservice.bookingUrl) } : {}),
      })) : [],
    };
  }, enabled, fetchImpl);
}

export function loadPublicOffers(enabled = managedContentEnabled, fetchImpl: typeof fetch = globalThis.fetch) {
  return loadItems("/api/offers", legacyOffersData, (item) => {
    const slug = String(item.slug || "");
    const legacy = legacyOffersData.find((entry) => entry.title === item.title || String(entry.id) === slug);
    const validityLabel = String(item.validityLabel || legacy?.validUntil || "");
    const dateLabel = item.validFrom && item.validUntil ? `${item.validFrom} – ${item.validUntil}` : "";
    return {
      id: slug || legacy?.id || String(item._id),
      title: String(item.title || ""),
      description: String(item.description || ""),
      validUntil: validityLabel || dateLabel,
      image: String(item.imageUrl || legacy?.image || ""),
      badge: String(item.badgeText || item.priceLabel || legacy?.badge || ""),
      bookingUrl: String(item.bookingUrl || BOOKING_URL),
    };
  }, enabled, fetchImpl);
}

export function loadPublicPackages(enabled = managedContentEnabled, fetchImpl: typeof fetch = globalThis.fetch) {
  return loadItems("/api/packages", legacyPackagesData, (item) => {
    const slug = String(item.slug || "");
    const legacy = legacyPackagesData.find((entry) => entry.title === item.title || String(entry.id) === slug);
    return {
      id: slug || legacy?.id || String(item._id),
      category: String(item.category || legacy?.category || "Other"),
      title: String(item.title || ""),
      description: String(item.description || ""),
      price: String(item.priceLabel || legacy?.price || ""),
      image: String(item.imageUrl || legacy?.image || ""),
      bookingUrl: String(item.bookingUrl || BOOKING_URL),
    };
  }, enabled, fetchImpl);
}

export function loadPublicFaqs(pageKey: keyof typeof legacyFaqs, enabled = managedContentEnabled, fetchImpl: typeof fetch = globalThis.fetch) {
  const fallback = legacyFaqs[pageKey];
  return loadItems(`/api/faqs?pageKey=${encodeURIComponent(pageKey)}`, fallback, (item) => ({
    q: String(item.question || ""),
    a: String(item.answer || ""),
  }), enabled, fetchImpl);
}

export { managedContentEnabled };
