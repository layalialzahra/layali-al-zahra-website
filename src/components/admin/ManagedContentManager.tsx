import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, FilePlus2, ImagePlus, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";

type ResourceType = "service" | "offer" | "package" | "faq";
type FieldType = "text" | "textarea" | "number" | "url" | "date" | "select" | "category-select" | "image" | "subservices" | "list";
type FieldOption = { label: string; value: string };
type Field = { key: string; label: string; type?: FieldType; required?: boolean; options?: FieldOption[] };
type RecordData = Record<string, any>;

const pageOptions: FieldOption[] = [
  { label: "Services", value: "services" },
  { label: "Offers", value: "offers" },
  { label: "Packages", value: "packages" },
];
const configs: Record<ResourceType, { title: string; singular: string; empty: string; endpoint: string; fields: Field[] }> = {
  service: {
    title: "Services", singular: "Service", empty: "No services yet", endpoint: "/api/admin/content?action=managed-services",
    fields: [
      { key: "title", label: "Title", required: true }, { key: "slug", label: "URL slug" },
      { key: "description", label: "Description", type: "textarea" }, { key: "category", label: "Category", type: "category-select" },
      { key: "imageUrl", label: "Image", type: "image" }, { key: "imageAlt", label: "Image alt text" },
      { key: "subservices", label: "Subservices", type: "subservices" }, { key: "sortOrder", label: "Display order", type: "number" },
      { key: "seoTitle", label: "SEO title" }, { key: "metaDescription", label: "Meta description", type: "textarea" },
    ],
  },
  offer: {
    title: "Offers", singular: "Offer", empty: "No offers yet", endpoint: "/api/admin/content?action=managed-offers",
    fields: [
      { key: "title", label: "Title", required: true }, { key: "slug", label: "URL slug" },
      { key: "description", label: "Description", type: "textarea" }, { key: "priceLabel", label: "Price label", required: true },
      { key: "badgeText", label: "Badge text" }, { key: "imageUrl", label: "Image", type: "image" },
      { key: "imageAlt", label: "Image alt text" },
      { key: "validityType", label: "Offer validity", type: "select", required: true, options: [
        { label: "Date range", value: "date-range" }, { label: "Recurring", value: "recurring" }, { label: "Descriptive label", value: "label" },
      ] },
      { key: "validFrom", label: "Valid from", type: "date" }, { key: "validUntil", label: "Valid until", type: "date" },
      { key: "validityLabel", label: "Validity label" }, { key: "bookingUrl", label: "Booking URL", type: "url" },
      { key: "sortOrder", label: "Display order", type: "number" }, { key: "seoTitle", label: "SEO title" },
      { key: "metaDescription", label: "Meta description", type: "textarea" },
    ],
  },
  package: {
    title: "Packages", singular: "Package", empty: "No packages yet", endpoint: "/api/admin/packages",
    fields: [
      { key: "title", label: "Title", required: true }, { key: "slug", label: "URL slug" },
      { key: "description", label: "Description", type: "textarea" }, { key: "priceLabel", label: "Price label", required: true },
      { key: "category", label: "Category" }, { key: "imageUrl", label: "Image", type: "image" },
      { key: "imageAlt", label: "Image alt text" }, { key: "includedItems", label: "Included items (one per line)", type: "list" },
      { key: "bookingUrl", label: "Booking URL", type: "url" }, { key: "sortOrder", label: "Display order", type: "number" },
      { key: "seoTitle", label: "SEO title" }, { key: "metaDescription", label: "Meta description", type: "textarea" },
    ],
  },
  faq: {
    title: "FAQs", singular: "FAQ", empty: "No FAQs yet", endpoint: "/api/admin/faqs",
    fields: [
      { key: "pageKey", label: "Page", type: "select", required: true, options: pageOptions },
      { key: "question", label: "Question", required: true }, { key: "answer", label: "Answer", type: "textarea", required: true },
      { key: "sortOrder", label: "Display order", type: "number" },
    ],
  },
};

function emptyForm(type: ResourceType): RecordData {
  return {
    title: "", slug: "", description: "", category: "", imageUrl: "", imageAlt: "",
    subservices: [], priceLabel: "", badgeText: "", validityType: "label", validFrom: "", validUntil: "",
    validityLabel: "", bookingUrl: "", includedItems: [], pageKey: "services", question: "", answer: "",
    sortOrder: 0, seoTitle: "", metaDescription: "", status: "draft",
  };
}
async function readResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.message || "The request could not be completed.");
  return data;
}

export default function ManagedContentManager({ type }: { type: ResourceType }) {
  const config = configs[type];
  const [items, setItems] = useState<RecordData[]>([]);
  const [form, setForm] = useState<RecordData>(() => emptyForm(type));
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [importingLegacy, setImportingLegacy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [faqPage, setFaqPage] = useState("services");
  const [serviceCategories, setServiceCategories] = useState<{ id: string | null; name: string }[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryBusy, setCategoryBusy] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (type === "faq") params.set("pageKey", faqPage);
      const data = await readResponse(await fetch(`${config.endpoint}${config.endpoint.includes("?") ? "&" : "?"}${params.toString()}`, { credentials: "include" }));
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load records.");
    } finally {
      setLoading(false);
    }
  }, [config.endpoint, faqPage, type]);

  useEffect(() => { void loadRecords(); }, [loadRecords]);

  const loadServiceCategories = useCallback(async () => {
    try {
      const data = await readResponse(await fetch("/api/admin/content?action=service-categories", { credentials: "include" }));
      setServiceCategories(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load service categories.");
    }
  }, []);
  useEffect(() => { if (type === "service") void loadServiceCategories(); }, [type, loadServiceCategories]);

  const saveCategory = async () => {
    setCategoryBusy(true); setError(""); setSuccess("");
    try {
      const method = editingCategory ? "PUT" : "POST";
      const body = editingCategory ? { oldName: editingCategory, name: categoryName } : { name: categoryName };
      await readResponse(await fetch("/api/admin/content?action=service-categories", { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));
      setSuccess(editingCategory ? "Service category updated." : "Service category added.");
      setCategoryName(""); setEditingCategory(null);
      await Promise.all([loadServiceCategories(), loadRecords()]);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save service category."); }
    finally { setCategoryBusy(false); }
  };
  const deleteCategory = async (name: string) => {
    if (!window.confirm(`Delete the service category "${name}"? Categories assigned to services cannot be deleted.`)) return;
    setCategoryBusy(true); setError(""); setSuccess("");
    try {
      await readResponse(await fetch("/api/admin/content?action=service-categories", { method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ oldName: name }) }));
      setSuccess("Service category deleted.");
      await loadServiceCategories();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to delete service category."); }
    finally { setCategoryBusy(false); }
  };

  const importExistingWebsiteContent = async () => {
    const label = type === "offer" ? "offers" : "services";
    if (!window.confirm(`Import existing website ${label} into the live CMS database? Missing ${label} will be added. Existing CMS edits will be preserved.`)) return;
    setImportingLegacy(true);
    setError("");
    setSuccess("");
    try {
      const collection = type === "offer" ? "offers" : "services";
      const response = await fetch(`/api/admin/content?action=import-legacy-content&collection=${collection}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const responseText = await response.text();
      let data: RecordData = {};
      try { data = responseText ? JSON.parse(responseText) : {}; } catch { /* Report status when the server returns a non-JSON error page. */ }
      if (!response.ok || !data.success) {
        const detail = typeof data.message === "string" && data.message.trim()
          ? data.message
          : `The import endpoint returned HTTP ${response.status}${responseText ? ` (${responseText.slice(0, 120).replace(/\s+/g, " ")})` : ""}.`;
        throw new Error(detail);
      }
      const results = data.results || {};
      const added = (key: string) => Number(results[key]?.inserted || 0);
      setSuccess(`${collection === "offers" ? "Offers" : "Services"} import complete. New records added: ${added(collection)}. Existing records were left unchanged.`);
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Content import failed.");
    } finally {
      setImportingLegacy(false);
    }
  };

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) => [item.title, item.question, item.description, item.answer, item.category, item.priceLabel]
      .some((value) => String(value || "").toLowerCase().includes(query)));
  }, [items, search]);

  const setField = (key: string, value: unknown) => setForm((current) => ({ ...current, [key]: value }));
  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm(type), pageKey: type === "faq" ? faqPage : "services" });
    setFormOpen(true);
    setError("");
    setSuccess("");
  };
  const startEdit = (item: RecordData) => {
    setEditing(item);
    setForm({ ...emptyForm(type), ...item, includedItems: Array.isArray(item.includedItems) ? item.includedItems : [], subservices: Array.isArray(item.subservices) ? item.subservices : [] });
    setFormOpen(true);
    setError("");
    setSuccess("");
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", credentials: "include", headers: { "Content-Type": file.type }, body: file });
      const data = await readResponse(response);
      setField("imageUrl", data.url);
      setSuccess("Image uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const save = async (status: "draft" | "published") => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const payload: RecordData = { ...form, status, sortOrder: Number(form.sortOrder || 0) };
      if (!String(payload.slug || "").trim()) delete payload.slug;
      if (type === "package") {
        payload.includedItems = (Array.isArray(form.includedItems) ? form.includedItems : String(form.includedItems || "").split("\n"))
          .map((value: string) => value.trim()).filter(Boolean);
      }
      if (type === "service") {
        payload.subservices = (Array.isArray(form.subservices) ? form.subservices : [])
          .filter((item: RecordData) => String(item.name || "").trim() || String(item.price || "").trim());
      }
      if (type === "offer" && form.validityType !== "date-range") {
        delete payload.validFrom;
        delete payload.validUntil;
      }
      const url = editing ? `${config.endpoint}${config.endpoint.includes("?") ? "&" : "?"}id=${encodeURIComponent(String(editing._id))}` : config.endpoint;
      const data = await readResponse(await fetch(url, {
        method: editing ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }));
      setSuccess(status === "published" ? `${config.singular} published.` : `${config.singular} saved as draft.`);
      setFormOpen(false);
      setEditing(null);
      await loadRecords();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save this record.");
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (item: RecordData, status: "draft" | "published") => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await readResponse(await fetch(`${config.endpoint}${config.endpoint.includes("?") ? "&" : "?"}id=${encodeURIComponent(String(item._id))}`, {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
      }));
      setSuccess(status === "published" ? `${config.singular} published.` : `${config.singular} unpublished.`);
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update publication status.");
    } finally {
      setBusy(false);
    }
  };

  const deleteItem = async (item: RecordData) => {
    const label = item.title || item.question || config.singular;
    if (!window.confirm(`Delete "${label}" from the website CMS? This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await readResponse(await fetch(`${config.endpoint}${config.endpoint.includes("?") ? "&" : "?"}id=${encodeURIComponent(String(item._id))}`, { method: "DELETE", credentials: "include" }));
      setSuccess(`${config.singular} deleted.`);
      await loadRecords();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete this record.");
    } finally {
      setBusy(false);
    }
  };

  const renderField = (field: Field) => {
    if (type === "offer" && ["validFrom", "validUntil"].includes(field.key) && form.validityType !== "date-range") return null;
    if (type === "offer" && field.key === "validityLabel" && form.validityType === "date-range") return null;
    const id = `managed-${type}-${field.key}`;
    if (field.type === "subservices") {
      const subservices = Array.isArray(form.subservices) ? form.subservices : [];
      return <section className="managed-subservices" key={field.key}>
        <div className="managed-subservices-head"><div><h3>Subservices and prices</h3><p>Add each service name and its display price.</p></div>
          <button type="button" className="managed-small-button" onClick={() => setField("subservices", [...subservices, { name: "", price: "" }])}><Plus size={15}/> Add subservice</button>
        </div>
        {subservices.length === 0 && <p className="managed-help">No subservices added.</p>}
        {subservices.map((item: RecordData, index: number) => <div className="managed-subservice-row" key={item.id || index}>
          <label className="managed-field"><span>Name</span><input value={item.name || ""} onChange={(event) => setField("subservices", subservices.map((row: RecordData, i: number) => i === index ? { ...row, name: event.target.value } : row))}/></label>
          <label className="managed-field"><span>Price label</span><input value={item.price || ""} placeholder="AED 99.75 / From" onChange={(event) => setField("subservices", subservices.map((row: RecordData, i: number) => i === index ? { ...row, price: event.target.value } : row))}/></label>
          <button type="button" className="managed-icon-button danger" aria-label={`Remove subservice ${index + 1}`} onClick={() => setField("subservices", subservices.filter((_: RecordData, i: number) => i !== index))}><Trash2 size={16}/></button>
        </div>)}
      </section>;
    }
    if (field.type === "image") {
      return <div className="managed-field" key={field.key}>
        <label htmlFor={id}>{field.label} URL</label>
        <input id={id} value={form[field.key] || ""} onChange={(event) => setField(field.key, event.target.value)} placeholder="https://… or /images/…"/>
        <label className="managed-upload"><ImagePlus size={16}/>{uploading ? "Uploading image…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" aria-label="Upload image file" disabled={uploading} onChange={(event) => void uploadImage(event.target.files?.[0])}/></label>
        {form[field.key] && <img className="managed-image-preview" src={form[field.key]} alt={form.imageAlt || ""}/>}
      </div>;
    }
    if (field.type === "list") {
      const value = Array.isArray(form[field.key]) ? form[field.key].join("\n") : String(form[field.key] || "");
      return <label className="managed-field" key={field.key} htmlFor={id}><span>{field.label}</span><textarea id={id} rows={4} value={value} onChange={(event) => setField(field.key, event.target.value.split("\n"))}/></label>;
    }
    if (field.type === "category-select") {
      return <label className="managed-field" key={field.key} htmlFor={id}><span>{field.label}</span><select id={id} value={form[field.key] || ""} onChange={(event) => setField(field.key, event.target.value)}><option value="">Select a category</option>{serviceCategories.map((category) => <option key={category.name} value={category.name}>{category.name}</option>)}</select></label>;
    }
    if (field.type === "select") {
      return <label className="managed-field" key={field.key} htmlFor={id}><span>{field.label}</span><select id={id} required={field.required} value={form[field.key] || ""} onChange={(event) => setField(field.key, event.target.value)}>
        {(field.options || []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select></label>;
    }
    const inputType = field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : "text";
    return <label className="managed-field" key={field.key} htmlFor={id}><span>{field.label}</span>
      {field.type === "textarea" ? <textarea id={id} rows={4} required={field.required} value={form[field.key] || ""} onChange={(event) => setField(field.key, event.target.value)}/> :
        <input id={id} type={inputType} required={field.required} value={form[field.key] ?? ""} onChange={(event) => setField(field.key, event.target.value)} step={field.type === "number" ? "1" : undefined}/>}
    </label>;
  };

  return <section className="managed-cms">
    <header className="managed-cms-head">
      <div><span className="cms-kicker">CONTENT MANAGEMENT</span><h1>{config.title}</h1><p>Create and maintain the content shown on the public website.</p></div>
      {!formOpen && <div className="managed-head-actions">{type === "offer" && <button type="button" className="cms-secondary-button" disabled={importingLegacy} onClick={() => void importExistingWebsiteContent()}>{importingLegacy ? <Loader2 className="cms-spin" size={16}/> : <FilePlus2 size={16}/>} {importingLegacy ? "Importing offers…" : "Import existing offers"}</button>}<button type="button" className="cms-primary-button" onClick={startCreate}><Plus size={17}/> Add {config.singular}</button></div>}
    </header>
    {error && <div className="cms-alert error" role="alert">{error}</div>}
    {success && <div className="cms-alert success" role="status">{success}</div>}
    {type === "service" && <section className="managed-editor service-category-manager" aria-label="Service categories"><div className="managed-editor-head"><div><h2>Service categories</h2><p>Add, rename or delete categories separately from individual services.</p></div></div><div className="managed-subservice-row"><label className="managed-field"><span>{editingCategory ? "Rename category" : "New category"}</span><input value={categoryName} maxLength={120} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name"/></label><button type="button" className="cms-primary-button" disabled={categoryBusy || !categoryName.trim()} onClick={() => void saveCategory()}>{editingCategory ? "Save category" : "Add category"}</button>{editingCategory && <button type="button" className="cms-secondary-button" disabled={categoryBusy} onClick={() => { setEditingCategory(null); setCategoryName(""); }}>Cancel</button>}</div><div className="managed-record-list">{serviceCategories.map((category) => <div className="managed-record" key={category.name}><div className="managed-record-main"><strong>{category.name}</strong></div><div className="managed-record-actions"><button type="button" className="managed-icon-button" disabled={categoryBusy} onClick={() => { setEditingCategory(category.name); setCategoryName(category.name); }}>Edit category</button><button type="button" className="managed-icon-button danger" disabled={categoryBusy} onClick={() => void deleteCategory(category.name)}>Delete category</button></div></div>)}</div></section>}
    {type === "faq" && <label className="managed-filter"><span>Filter FAQs by page</span><select aria-label="FAQ page" value={faqPage} onChange={(event) => setFaqPage(event.target.value)}>{pageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}
    {formOpen && <form className="managed-editor" aria-label={`${config.singular} editor`} onSubmit={(event) => event.preventDefault()}>
      <div className="managed-editor-head"><div><h2>{editing ? `Edit ${config.singular}` : `Add ${config.singular}`}</h2><p>Save as a draft or explicitly publish when ready.</p></div>
        <button type="button" className="managed-icon-button" aria-label="Close editor" onClick={() => { setFormOpen(false); setEditing(null); }}><X size={18}/></button>
      </div>
      <div className="managed-fields">{config.fields.map(renderField)}</div>
      <div className="managed-editor-actions">
        <button type="button" className="cms-secondary-button" disabled={busy} onClick={() => { setFormOpen(false); setEditing(null); }}>Cancel</button>
        <button type="button" className="cms-secondary-button" disabled={busy} onClick={() => void save("draft")}>{busy ? <Loader2 className="cms-spin" size={15}/> : null} Save Draft</button>
        <button type="button" className="cms-primary-button" disabled={busy} onClick={() => void save("published")}>{busy ? <Loader2 className="cms-spin" size={15}/> : <Check size={16}/>} Save &amp; Publish</button>
      </div>
    </form>}
    <div className="managed-list-toolbar">
      <label className="managed-search"><Search size={16}/><input aria-label={`Search ${config.title}`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}…`}/></label>
      <span>{visibleItems.length} {visibleItems.length === 1 ? "record" : "records"}</span>
    </div>
    {loading ? <div className="managed-empty"><Loader2 className="cms-spin" size={22}/><p>Loading {config.title.toLowerCase()}…</p></div> :
      visibleItems.length === 0 ? <div className="managed-empty"><h2>{config.empty}</h2><p>Add a record here. It will remain a draft until you publish it.</p></div> :
      <div className="managed-record-list">{visibleItems.map((item) => {
        const title = item.title || item.question || config.singular;
        const description = item.description || item.answer || item.validityLabel || item.category || "";
        const status = item.status || "draft";
        return <article className="managed-record" key={String(item._id || item.slug || title)}>
          <div className="managed-record-main"><div className="managed-record-meta"><span className={`cms-status ${status}`}>{status}</span>{type === "faq" && <span>{item.pageKey}</span>}{item.priceLabel && <strong>{item.priceLabel}</strong>}</div>
            <h2>{title}</h2>{description && <p>{description}</p>}
          </div>
          <div className="managed-record-actions">
            <button type="button" className="managed-icon-button" aria-label={`Edit ${title}`} onClick={() => startEdit(item)}><Pencil size={15}/> Edit</button>
            <button type="button" className="managed-icon-button" disabled={busy} onClick={() => void changeStatus(item, status === "published" ? "draft" : "published")}>{status === "published" ? "Unpublish" : "Publish"}</button>
            <button type="button" className="managed-icon-button danger" disabled={busy} aria-label={`Delete ${title}`} onClick={() => void deleteItem(item)}><Trash2 size={15}/> Delete</button>
          </div>
        </article>;
      })}</div>}
  </section>;
}
