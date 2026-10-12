import { describe, expect, it, vi } from "vitest";
import { legacyServicesData } from "../../src/data/legacy-services.js";
import { legacyOffersData } from "../../src/data/legacy-offers.js";
import { legacyPackagesData } from "../../src/data/legacy-packages.js";
import { legacyFaqs } from "../../src/data/legacy-faqs.js";
import { loadPublicServices, loadPublicOffers, loadPublicPackages, loadPublicFaqs } from "../../src/data/managed-content-public";

function jsonResponse(items: unknown[], ok = true) {
  return { ok, json: async () => ({ success: true, items }) } as Response;
}

describe("public managed-content fallback and mapping", () => {
  it("keeps legacy services when the feature flag is disabled", async () => {
    const fetchImpl = vi.fn();
    expect(await loadPublicServices(false, fetchImpl as typeof fetch)).toBe(legacyServicesData);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("maps published services while preserving legacy image paths when no CMS image is set", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse([{
      slug: "hair-cuts", title: "Hair Cuts Updated", imageUrl: "", description: "Updated description",
      subservices: [{ id: "blunt-bob", name: "Blunt Bob", price: "AED 99.75" }],
    }]));
    const result = await loadPublicServices(true, fetchImpl as typeof fetch);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Hair Cuts Updated");
    expect(result[0].image).toBe(legacyServicesData.find((item) => item.id === "hair-cuts")?.image);
    expect(result[0].subservices[0].price).toBe("AED 99.75");
  });

  it("returns no public offers or packages when all records are intentionally unpublished", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse([]));
    expect(await loadPublicOffers(true, fetchImpl as typeof fetch)).toEqual([]);
    expect(await loadPublicPackages(true, fetchImpl as typeof fetch)).toEqual([]);
  });

  it("falls back to the legacy snapshots when the public CMS API fails", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse([], false));
    expect(await loadPublicOffers(true, fetchImpl as typeof fetch)).toBe(legacyOffersData);
    expect(await loadPublicPackages(true, fetchImpl as typeof fetch)).toBe(legacyPackagesData);
  });

  it("maps FAQ records to the existing public component shape and preserves legacy FAQ on API failure", async () => {
    const fetchImpl = vi.fn()
      .mockResolvedValueOnce(jsonResponse([{ pageKey: "services", question: "New question?", answer: "New answer" }]))
      .mockResolvedValueOnce(jsonResponse([], false));
    expect(await loadPublicFaqs("services", true, fetchImpl as typeof fetch)).toEqual([{ q: "New question?", a: "New answer" }]);
    expect(await loadPublicFaqs("offers", true, fetchImpl as typeof fetch)).toBe(legacyFaqs.offers);
  });
});
