import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, RefreshCw, Search, Trash2 } from "lucide-react";

type Review = {
  _id: string;
  googleReviewId: string;
  authorName: string | null;
  rating: number | null;
  reviewText: string;
  sourceCreatedAt: string | null;
  isPublished: boolean;
  sortOrder: number;
};
async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.message || "The request could not be completed.");
  return data;
}
function displayDate(value?: string | null) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString();
}

export default function GoogleReviewsManager() {
  const [items, setItems] = useState<Review[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [syncAvailable, setSyncAvailable] = useState(false);
  const [syncMessage, setSyncMessage] = useState("Google Business Profile API access has not been verified. Sync is disabled.");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [publicationFilter, setPublicationFilter] = useState("all");

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (search) params.set("search", search);
      if (ratingFilter) params.set("rating", ratingFilter);
      if (publicationFilter !== "all") params.set("isPublished", publicationFilter);
      const data = await readResponse(await fetch(`/api/admin/google-reviews?${params.toString()}`, { credentials: "include" }));
      setItems(Array.isArray(data.items) ? data.items : []);
      setSyncAvailable(data.syncAvailable === true);
      if (typeof data.syncMessage === "string") setSyncMessage(data.syncMessage);
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load Google reviews.");
    } finally {
      setLoading(false);
    }
  }, [publicationFilter, ratingFilter, search]);

  useEffect(() => { void loadRecords(); }, [loadRecords]);

  const visibleItems = useMemo(() => {
    const query = searchInput.trim().toLowerCase();
    if (!query || search) return items;
    return items.filter((item) => `${item.authorName || ""} ${item.reviewText || ""}`.toLowerCase().includes(query));
  }, [items, search, searchInput]);
  const selectedSet = new Set(selectedIds);
  const allVisibleSelected = visibleItems.length > 0 && visibleItems.every((item) => selectedSet.has(item._id));

  const toggleReview = (id: string) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleAll = () => setSelectedIds((current) => allVisibleSelected
    ? current.filter((id) => !visibleItems.some((item) => item._id === id))
    : [...new Set([...current, ...visibleItems.map((item) => item._id)])]);

  const updateSelected = async (action: "publish" | "unpublish") => {
    if (!selectedIds.length) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      const data = await readResponse(await fetch("/api/admin/google-reviews", {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
      }));
      setSuccess(action === "publish" ? `${data.updated} review(s) published.` : `${data.updated} review(s) unpublished.`);
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update review publication.");
    } finally { setBusy(false); }
  };

  const deleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm("Delete the selected reviews from the local copy? The original Google review will not be modified.")) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      const data = await readResponse(await fetch("/api/admin/google-reviews", {
        method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      }));
      setSuccess(`${data.deleted} local review record(s) deleted.`);
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete local review records.");
    } finally { setBusy(false); }
  };

  const syncReviews = async () => {
    if (!syncAvailable) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      const data = await readResponse(await fetch("/api/admin/google-reviews-sync", { method: "POST", credentials: "include" }));
      setSuccess(data.message || "Google reviews synced.");
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google review sync failed.");
    } finally { setBusy(false); }
  };

  return <section className="managed-cms google-reviews-manager">
    <header className="managed-cms-head">
      <div><span className="cms-kicker">REPUTATION MANAGEMENT</span><h1>Google Reviews</h1><p>Choose which synced Google reviews appear on the website. Selecting a review never publishes it by itself.</p></div>
      <button type="button" className="cms-secondary-button" disabled={!syncAvailable || busy} onClick={() => void syncReviews}><RefreshCw size={16}/> Sync from Google</button>
    </header>
    <div className="cms-alert info" role="status">{syncMessage}</div>
    {error && <div className="cms-alert error" role="alert">{error}</div>}
    {success && <div className="cms-alert success" role="status">{success}</div>}
    <div className="google-review-filters">
      <label className="managed-search"><Search size={16}/><input aria-label="Search reviews" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") setSearch(searchInput.trim()); }} placeholder="Search reviewer or review text…"/></label>
      <button type="button" className="cms-secondary-button" onClick={() => setSearch(searchInput.trim())}>Search</button>
      <label className="managed-filter"><span>Rating</span><select aria-label="Filter by rating" value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}><option value="">All ratings</option>{[5,4,3,2,1].map((rating) => <option key={rating} value={String(rating)}>{rating} stars</option>)}</select></label>
      <label className="managed-filter"><span>Publication</span><select aria-label="Filter by publication" value={publicationFilter} onChange={(event) => setPublicationFilter(event.target.value)}><option value="all">All reviews</option><option value="true">Published</option><option value="false">Unpublished</option></select></label>
    </div>
    <div className="google-review-actions">
      <label className="google-review-select-all"><input type="checkbox" aria-label="Select all visible reviews" checked={allVisibleSelected} onChange={toggleAll} disabled={visibleItems.length === 0 || busy}/> Select all visible</label>
      <span>{selectedIds.length} selected</span>
      <div className="google-review-action-buttons">
        <button type="button" className="cms-primary-button" disabled={!selectedIds.length || busy} onClick={() => void updateSelected("publish")}><Check size={15}/> Publish Selected Reviews</button>
        <button type="button" className="cms-secondary-button" disabled={!selectedIds.length || busy} onClick={() => void updateSelected("unpublish")}>Unpublish Selected</button>
        <button type="button" className="cms-secondary-button danger" disabled={!selectedIds.length || busy} onClick={() => void deleteSelected}><Trash2 size={15}/> Delete Selected Synced Reviews</button>
      </div>
    </div>
    {loading ? <div className="managed-empty"><Loader2 className="cms-spin" size={22}/><p>Loading Google reviews…</p></div> :
      visibleItems.length === 0 ? <div className="managed-empty"><h2>No synced Google reviews yet</h2><p>Reviews will appear here after Google Business Profile access is verified and a sync completes.</p></div> :
      <div className="google-review-list">{visibleItems.map((review) => <article className="google-review-record" key={review._id}>
        <input type="checkbox" aria-label={`Select review by ${review.authorName || "reviewer name unavailable"}`} checked={selectedSet.has(review._id)} disabled={busy} onChange={() => toggleReview(review._id)}/>
        <div className="google-review-content">
          <div className="google-review-meta"><strong>{review.authorName || "Reviewer name unavailable"}</strong><span>{review.rating ? `${review.rating}/5` : "Rating unavailable"}</span><span>{displayDate(review.sourceCreatedAt)}</span><span className={`cms-status ${review.isPublished ? "published" : "draft"}`}>{review.isPublished ? "Published" : "Unpublished"}</span></div>
          <p>{review.reviewText || "No written review text was provided."}</p>
        </div>
      </article>)}</div>}
  </section>;
}
