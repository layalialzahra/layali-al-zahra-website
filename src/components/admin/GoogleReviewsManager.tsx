import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";

type Review = {
  _id: string;
  authorName: string;
  rating: number;
  reviewText: string;
  sourceCreatedAt: string;
  isPublished: boolean;
  sortOrder: number;
};
type ReviewForm = Omit<Review, "_id" | "isPublished">;
const emptyForm: ReviewForm = { authorName: "", rating: 5, reviewText: "", sourceCreatedAt: "", sortOrder: 0 };

async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.message || "The request could not be completed.");
  return data;
}
function displayDate(value?: string | null) {
  if (!value) return "Date not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Invalid date" : date.toLocaleDateString();
}

export default function GoogleReviewsManager() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [publicationFilter, setPublicationFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState<ReviewForm>(emptyForm);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await readResponse(await fetch("/api/admin/reviews?limit=100", { credentials: "include" }));
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void loadRecords(); }, [loadRecords]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) =>
      (!query || `${item.authorName} ${item.reviewText}`.toLowerCase().includes(query)) &&
      (!ratingFilter || String(item.rating) === ratingFilter) &&
      (publicationFilter === "all" || String(item.isPublished) === publicationFilter)
    );
  }, [items, publicationFilter, ratingFilter, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setFormOpen(true);
    setError("");
    setSuccess("");
  };
  const openEdit = (item: Review) => {
    setEditing(item);
    setForm({
      authorName: item.authorName || "",
      rating: item.rating || 5,
      reviewText: item.reviewText || "",
      sourceCreatedAt: String(item.sourceCreatedAt || "").slice(0, 10),
      sortOrder: item.sortOrder ?? 0,
    });
    setFormOpen(true);
    setError("");
    setSuccess("");
  };
  const setField = <K extends keyof ReviewForm>(key: K, value: ReviewForm[K]) => setForm((current) => ({ ...current, [key]: value }));

  const save = async (isPublished: boolean) => {
    setBusy(true); setError(""); setSuccess("");
    try {
      const payload = { ...form, rating: Number(form.rating), sortOrder: Number(form.sortOrder), isPublished };
      const url = editing ? `/api/admin/reviews?id=${encodeURIComponent(editing._id)}` : "/api/admin/reviews";
      const data = await readResponse(await fetch(url, {
        method: editing ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }));
      setSuccess(isPublished ? "Review saved and published." : "Review saved as draft.");
      setFormOpen(false);
      setEditing(null);
      await loadRecords();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save review.");
    } finally { setBusy(false); }
  };

  const setPublication = async (item: Review, action: "publish" | "unpublish") => {
    setBusy(true); setError(""); setSuccess("");
    try {
      await readResponse(await fetch(`/api/admin/reviews?id=${encodeURIComponent(item._id)}`, {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      }));
      setSuccess(action === "publish" ? "Review published." : "Review unpublished.");
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change review publication.");
    } finally { setBusy(false); }
  };

  const deleteReview = async (item: Review) => {
    if (!window.confirm(`Delete the review by ${item.authorName}? This cannot be undone.`)) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      await readResponse(await fetch(`/api/admin/reviews?id=${encodeURIComponent(item._id)}`, { method: "DELETE", credentials: "include" }));
      setSuccess("Review deleted.");
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete review.");
    } finally { setBusy(false); }
  };

  return <section className="managed-cms google-reviews-manager">
    <header className="managed-cms-head">
      <div><span className="cms-kicker">REPUTATION MANAGEMENT</span><h1>Manual Reviews</h1><p>Add real client reviews, choose when they publish and control their display order.</p></div>
      {!formOpen && <button type="button" className="cms-primary-button" onClick={openCreate}><Plus size={16}/> Add Review</button>}
    </header>
    {error && <div className="cms-alert error" role="alert">{error}</div>}
    {success && <div className="cms-alert success" role="status">{success}</div>}

    {formOpen && <form className="managed-editor" aria-label="Review editor" onSubmit={(event) => event.preventDefault()}>
      <div className="managed-editor-head"><div><h2>{editing ? "Edit Review" : "Add Review"}</h2><p>Only choose publish when the review is ready for the website.</p></div>
        <button type="button" className="managed-icon-button" aria-label="Close editor" onClick={() => { setFormOpen(false); setEditing(null); }}><X size={18}/></button>
      </div>
      <div className="managed-fields">
        <label className="managed-field"><span>Reviewer name</span><input required maxLength={200} value={form.authorName} onChange={(event) => setField("authorName", event.target.value)}/></label>
        <label className="managed-field"><span>Rating</span><select required value={String(form.rating)} onChange={(event) => setField("rating", Number(event.target.value))}>{[5,4,3,2,1].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? "star" : "stars"}</option>)}</select></label>
        <label className="managed-field"><span>Review date</span><input required type="date" value={form.sourceCreatedAt} onChange={(event) => setField("sourceCreatedAt", event.target.value)}/></label>
        <label className="managed-field"><span>Display order (lower appears first)</span><input required type="number" min="0" max="1000000" step="1" value={form.sortOrder} onChange={(event) => setField("sortOrder", Number(event.target.value))}/></label>
        <label className="managed-field"><span>Review text</span><textarea required maxLength={5000} rows={5} value={form.reviewText} onChange={(event) => setField("reviewText", event.target.value)}/></label>
      </div>
      <div className="managed-editor-actions">
        <button type="button" className="cms-secondary-button" disabled={busy} onClick={() => { setFormOpen(false); setEditing(null); }}>Cancel</button>
        <button type="button" className="cms-secondary-button" disabled={busy} onClick={() => void save(false)}>{busy ? <Loader2 className="cms-spin" size={15}/> : null} Save Draft</button>
        <button type="button" className="cms-primary-button" disabled={busy} onClick={() => void save(true)}>{busy ? <Loader2 className="cms-spin" size={15}/> : <Check size={16}/>} Save &amp; Publish</button>
      </div>
    </form>}

    <div className="google-review-filters">
      <label className="managed-search"><Search size={16}/><input aria-label="Search reviews" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reviewer or review text…"/></label>
      <label className="managed-filter"><span>Rating</span><select aria-label="Filter by rating" value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}><option value="">All ratings</option>{[5,4,3,2,1].map((rating) => <option key={rating} value={String(rating)}>{rating} stars</option>)}</select></label>
      <label className="managed-filter"><span>Publication</span><select aria-label="Filter by publication" value={publicationFilter} onChange={(event) => setPublicationFilter(event.target.value)}><option value="all">All reviews</option><option value="true">Published</option><option value="false">Drafts</option></select></label>
    </div>
    {loading ? <div className="managed-empty"><Loader2 className="cms-spin" size={22}/><p>Loading reviews…</p></div> :
      error && items.length === 0 ? <div className="managed-empty"><h2>Unable to load reviews</h2><button type="button" className="cms-secondary-button" onClick={() => void loadRecords()}>Retry</button></div> :
      visibleItems.length === 0 ? <div className="managed-empty"><h2>{items.length ? "No reviews match these filters" : "No reviews added yet"}</h2><p>Add a real client review to manage it here.</p></div> :
      <div className="google-review-list">{visibleItems.map((review) => <article className="google-review-record" key={review._id}>
        <div className="google-review-content">
          <div className="google-review-meta"><strong>{review.authorName}</strong><span>{"★".repeat(review.rating)} ({review.rating}/5)</span><span>{displayDate(review.sourceCreatedAt)}</span><span className={`cms-status ${review.isPublished ? "published" : "draft"}`}>{review.isPublished ? "Published" : "Draft"}</span><span>Order: {review.sortOrder}</span></div>
          <p>{review.reviewText}</p>
          <div className="managed-record-actions">
            <button type="button" className="managed-icon-button" disabled={busy} onClick={() => openEdit(review)}><Pencil size={15}/> Edit</button>
            <button type="button" className="managed-icon-button" disabled={busy} onClick={() => void setPublication(review, review.isPublished ? "unpublish" : "publish")}>{review.isPublished ? "Unpublish" : "Publish"}</button>
            <button type="button" className="managed-icon-button danger" disabled={busy} onClick={() => void deleteReview(review)}><Trash2 size={15}/> Delete</button>
          </div>
        </div>
      </article>)}</div>}
  </section>;
}
