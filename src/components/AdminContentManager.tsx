import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Copy, FilePlus2, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const API = '/api/admin/content';
const CATEGORIES = ['Hair Care','Hair Treatments','Hair Colour','Hair Extensions','Skincare','Nails','Brows & Lashes','Waxing','Dubai Beauty','UAE Beauty','Seasonal','Events','News','Offers','Announcements'];

type ContentType = 'blog' | 'tip' | 'news';
type Item = Record<string, any>;

const emptyForm = (): Item => ({ type: 'blog', title: '', slug: '', category: 'Hair Care', excerpt: '', body: '', featuredImage: '', altText: '', tags: '', author: '', relatedService: '', seoTitle: '', metaDescription: '', socialImage: '', status: 'draft', publishDate: '', tip1: '', tip2: '', tip3: '', tip4: '', tip5: '' });

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-sm font-medium">{label}</label>{children}</div>;
}

export default function AdminContentManager({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Item | null>(null);
  const [form, setForm] = useState<Item>(emptyForm());
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      const response = await fetch(`${API}?${params}`, { credentials: 'include' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load content');
      setItems(data.items || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load content'); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter]);

  const filteredItems = useMemo(() => items, [items]);
  const openNew = (type: ContentType = 'blog') => { setSelected(null); setForm({ ...emptyForm(), type }); setNotice(''); setError(''); };
  const openEdit = (item: Item) => { setSelected(item); setForm({ ...emptyForm(), ...item, tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '', publishDate: item.publishDate ? new Date(item.publishDate).toISOString().slice(0, 16) : '' }); setNotice(''); setError(''); };
  const update = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const payload = { ...form, tags: String(form.tags || '').split(',').map((x: string) => x.trim()).filter(Boolean), publishDate: form.publishDate || null };
      const response = await fetch(selected?._id ? `${API}?id=${selected._id}` : API, { method: selected?._id ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to save content');
      setNotice(selected ? 'Content updated.' : 'Content created.');
      setSelected(data.item); setForm({ ...emptyForm(), ...data.item, tags: Array.isArray(data.item.tags) ? data.item.tags.join(', ') : '', publishDate: data.item.publishDate ? new Date(data.item.publishDate).toISOString().slice(0, 16) : '' });
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save content'); } finally { setSaving(false); }
  };

  const action = async (id: string, method: string, body?: any) => {
    setError(''); setNotice('');
    const response = await fetch(`${API}?id=${id}`, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.message || 'Action failed');
    return data;
  };

  const remove = async (item: Item) => {
    if (!window.confirm(`Delete “${item.title}”? This cannot be undone.`)) return;
    try { await action(item._id, 'DELETE'); setNotice('Content deleted.'); if (selected?._id === item._id) { setSelected(null); setForm(emptyForm()); } await load(); } catch (err) { setError(err instanceof Error ? err.message : 'Delete failed'); }
  };
  const duplicate = async (item: Item) => {
    try { const data = await action(item._id, 'PUT', { duplicate: true }); setNotice('Draft copy created.'); openEdit(data.item); await load(); } catch (err) { setError(err instanceof Error ? err.message : 'Duplicate failed'); }
  };
  const togglePublish = async (item: Item) => {
    try { const data = await action(item._id, 'PUT', { status: item.status === 'published' ? 'draft' : 'published', publishDate: item.publishDate || new Date().toISOString() }); setNotice(data.item.status === 'published' ? 'Content published.' : 'Content moved to draft.'); if (selected?._id === item._id) openEdit(data.item); await load(); } catch (err) { setError(err instanceof Error ? err.message : 'Publish action failed'); }
  };

  if (selected || form.title || form.type) {
    return <div className="space-y-6">
      <div className="flex items-center justify-between gap-4"><div><Button variant="ghost" onClick={() => { setSelected(null); setForm(emptyForm()); }}><ArrowLeft className="mr-2 h-4 w-4" />Back to Content</Button><h1 className="mt-4 text-3xl font-semibold">{selected ? 'Edit Content' : 'New Content'}</h1><p className="mt-1 text-sm text-stone-500">Manage a single content item without touching code.</p></div></div>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}{notice && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700" role="status">{notice}</p>}
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Content</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Content Type"><select className="w-full rounded-md border px-3 py-2 text-sm" value={form.type} onChange={e => update('type', e.target.value)}><option value="blog">Blog Post</option><option value="tip">Beauty Tip</option><option value="news">Salon News</option></select></Field><Field label="Category"><select className="w-full rounded-md border px-3 py-2 text-sm" value={form.category} onChange={e => update('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field></div>
            <Field label="Title"><Input value={form.title} onChange={e => update('title', e.target.value)} maxLength={180} required /></Field>
            <Field label="Slug"><Input value={form.slug} onChange={e => update('slug', e.target.value)} placeholder="auto-generated-from-title" /></Field>
            <Field label={form.type === 'tip' ? 'Description' : 'Excerpt'}><Textarea value={form.excerpt} onChange={e => update('excerpt', e.target.value)} rows={3} /></Field>
            {form.type === 'tip' ? <div className="space-y-4">{[1,2,3,4,5].map(n => <Field key={n} label={`Tip ${n}`}><Textarea value={form[`tip${n}`]} onChange={e => update(`tip${n}`, e.target.value)} rows={3} /></Field>)}</div> : <Field label="Body"><Textarea value={form.body} onChange={e => update('body', e.target.value)} rows={14} placeholder="Write the main content here. Basic HTML is supported and unsafe script/event attributes are stripped server-side." /></Field>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Media & Relationships</CardTitle></CardHeader><CardContent className="space-y-4"><Field label="Featured Image URL"><Input value={form.featuredImage} onChange={e => update('featuredImage', e.target.value)} placeholder="https://..." /></Field><Field label="Image Alt Text"><Input value={form.altText} onChange={e => update('altText', e.target.value)} /></Field><Field label="Tags"><Input value={form.tags} onChange={e => update('tags', e.target.value)} placeholder="hair care, summer, tips" /></Field><Field label="Related Service"><Input value={form.relatedService} onChange={e => update('relatedService', e.target.value)} /></Field></CardContent></Card>
          <Card><CardHeader><CardTitle>SEO</CardTitle></CardHeader><CardContent className="space-y-4"><Field label="SEO Title"><Input value={form.seoTitle} onChange={e => update('seoTitle', e.target.value)} /></Field><Field label="Meta Description"><Textarea value={form.metaDescription} onChange={e => update('metaDescription', e.target.value)} rows={3} maxLength={320} /></Field><Field label="Social Image URL"><Input value={form.socialImage} onChange={e => update('socialImage', e.target.value)} /></Field></CardContent></Card>
        </div>
        <div className="space-y-6"><Card><CardHeader><CardTitle>Publishing</CardTitle></CardHeader><CardContent className="space-y-4"><Field label="Status"><select className="w-full rounded-md border px-3 py-2 text-sm" value={form.status} onChange={e => update('status', e.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></Field><Field label="Publish Date"><Input type="datetime-local" value={form.publishDate} onChange={e => update('publishDate', e.target.value)} /></Field><Field label="Author"><Input value={form.author} onChange={e => update('author', e.target.value)} /></Field><Button type="submit" className="w-full" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{selected ? 'Save Changes' : 'Create Content'}</Button></CardContent></Card></div>
      </form>
    </div>;
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><Button variant="ghost" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Dashboard</Button><h1 className="mt-4 text-3xl font-semibold">Content</h1><p className="mt-1 text-sm text-stone-500">Blog Posts, Beauty Tips and Salon News</p></div><div className="flex flex-wrap gap-2"><Button onClick={() => openNew('blog')}><Plus className="mr-2 h-4 w-4" />New Blog</Button><Button variant="outline" onClick={() => openNew('tip')}><FilePlus2 className="mr-2 h-4 w-4" />New Tip</Button><Button variant="outline" onClick={() => openNew('news')}>New News</Button></div></div>
    <div className="flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" /><Input className="pl-9" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} placeholder="Search title or excerpt" /></div><select className="rounded-md border px-3 py-2 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><option value="">All types</option><option value="blog">Blog</option><option value="tip">Beauty Tips</option><option value="news">News</option></select><select className="rounded-md border px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option></select><Button variant="outline" onClick={load}>Search</Button></div>
    {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}{notice && <p className="rounded-md bg-green-50 p-3 text-sm text-green-700" role="status">{notice}</p>}
    <Card><CardContent className="p-0">{loading ? <div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div> : filteredItems.length === 0 ? <div className="p-12 text-center"><p className="font-medium">No content yet</p><p className="mt-1 text-sm text-stone-500">Create your first Blog Post, Beauty Tip or Salon News item.</p></div> : <div className="divide-y">{filteredItems.map(item => <div key={item._id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-stone-100 px-2 py-1 text-xs font-medium">{item.type}</span><span className={`rounded-full px-2 py-1 text-xs font-medium ${item.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span>{item.category && <span className="text-xs text-stone-500">{item.category}</span>}</div><h3 className="mt-2 truncate text-lg font-medium">{item.title}</h3><p className="mt-1 text-xs text-stone-500">Updated {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button><Button size="sm" variant="outline" onClick={() => duplicate(item)}><Copy className="mr-1 h-3.5 w-3.5" />Duplicate</Button><Button size="sm" variant="outline" onClick={() => togglePublish(item)}>{item.status === 'published' ? 'Unpublish' : 'Publish'}</Button><Button size="sm" variant="outline" onClick={() => remove(item)}><Trash2 className="h-3.5 w-3.5" /></Button></div></div>)}</div>}</CardContent></Card>
  </div>;
}
