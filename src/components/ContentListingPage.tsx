import React, { useEffect, useState } from 'react';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

type ContentType = 'blog' | 'news';
type Item = { _id: string; type: ContentType; title: string; slug: string; excerpt?: string; featuredImage?: string; altText?: string; category?: string; publishDate?: string | null; tags?: string[]; };

const pageCopy = {
  blog: { title: 'Beauty Journal', eyebrow: 'Layali Al Zahra', subtitle: 'Beauty, hair and salon advice created for life in Dubai and the UAE.', empty: 'No articles are published yet.', action: 'Read article' },
  news: { title: 'Salon News', eyebrow: 'What’s happening at Layali Al Zahra', subtitle: 'The latest updates, announcements and beauty stories from our salon.', empty: 'No news is published yet.', action: 'Read update' },
};

export default function ContentListingPage({ type }: { type: ContentType }) {
  const [items, setItems] = useState<Item[]>([]); const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [total, setTotal] = useState(0); const [loading, setLoading] = useState(true); const [loadingMore, setLoadingMore] = useState(false); const [error, setError] = useState('');
  const copy = pageCopy[type];

  const load = async (nextPage = 1) => {
    const append = nextPage > 1;
    append ? setLoadingMore(true) : setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/content?type=${type}&page=${nextPage}&limit=12`, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error('Unable to load content');
      setItems(prev => append ? [...prev, ...(data.items || [])] : (data.items || []));
      setPage(data.page || nextPage); setPages(data.pages || 1); setTotal(data.total || 0);
    } catch { setError('Content is temporarily unavailable.'); }
    finally { append ? setLoadingMore(false) : setLoading(false); }
  };

  useEffect(() => { setItems([]); setPage(1); setPages(1); load(1); }, [type]);

  return <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 py-12 pb-20">
    <div className="container mx-auto px-4">
      <div className="mb-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">{copy.eyebrow}</p>
        <h1 className="mt-2 font-tangerine text-6xl text-rose-900 md:text-8xl">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-3xl text-lg text-gray-700">{copy.subtitle}</p>
        {!loading && !error && total > 0 && <p className="mt-2 text-sm text-gray-500">{total} {type === 'news' ? 'updates' : 'articles'}</p>}
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-rose-700" /></div> : error ? <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-lg"><p className="font-medium text-rose-900">{error}</p><button type="button" onClick={() => load(1)} className="mt-4 text-sm font-medium text-rose-800 underline">Try again</button></div> : items.length === 0 ? <div className="mx-auto max-w-2xl rounded-2xl bg-white p-10 text-center shadow-lg"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50"><Sparkles className="h-6 w-6 text-rose-600" /></div><p className="mt-5 font-medium text-rose-900">{copy.empty}</p><p className="mt-2 text-sm text-gray-600">New content will appear here automatically when it is published from the CMS.</p></div> : <>
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => <motion.article key={item._id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.05 }} className="group overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <a href={`/${type}/${item.slug}`} className="block">
              <div className="relative h-64 overflow-hidden bg-rose-100">{item.featuredImage ? <img loading="lazy" src={item.featuredImage} alt={item.altText || item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="flex h-full items-center justify-center text-rose-700">Layali Al Zahra</div>}<div className="absolute left-4 top-4 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-lg">{item.category || (type === 'news' ? 'News' : 'Beauty')}</div></div>
              <div className="p-6"><div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">{item.publishDate && <time dateTime={item.publishDate}>{new Date(item.publishDate).toLocaleDateString()}</time>}{item.tags?.slice(0, 2).map(tag => <span key={tag} className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-800">#{tag}</span>)}</div><h2 className="mt-3 text-xl font-semibold text-rose-900">{item.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{item.excerpt || ''}</p><span className="mt-5 inline-flex items-center text-sm font-medium text-rose-800">{copy.action}<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span></div>
            </a>
          </motion.article>)}
        </div>
        {page < pages && <div className="mt-12 flex justify-center"><button type="button" onClick={() => load(page + 1)} disabled={loadingMore} className="inline-flex min-w-36 items-center justify-center rounded-full bg-rose-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60">{loadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{loadingMore ? 'Loading…' : 'Load more'}</button></div>}
      </>}
    </div>
  </div>;
}
