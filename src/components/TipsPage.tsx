import React, { useEffect, useState } from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';

type Tip = { _id: string; title: string; excerpt?: string; featuredImage?: string; altText?: string; tip1?: string; tip2?: string; tip3?: string; tip4?: string; tip5?: string; };

export default function TipsPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/content?type=tip&limit=50')
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load Beauty Tips');
        return data;
      })
      .then(data => { if (active) setTips(data.items || []); })
      .catch(err => { if (active) setError(err instanceof Error ? err.message : 'Unable to load Beauty Tips'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen pt-8 pb-20 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="font-tangerine text-6xl md:text-8xl text-rose-900 mb-4">Beauty Tips</h1>
          <p className="text-gray-700 text-xl max-w-3xl mx-auto">Expert advice from our Dubai salon professionals — crafted for the UAE climate and lifestyle</p>
        </div>
        {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-rose-700" /></div> : error ? <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 text-center shadow-lg"><p className="font-medium text-rose-900">Beauty Tips are temporarily unavailable.</p><p className="mt-2 text-sm text-gray-600">Please try again shortly.</p></div> : tips.length === 0 ? <div className="mx-auto max-w-2xl rounded-lg bg-white p-8 text-center shadow-lg"><p className="font-medium text-rose-900">No Beauty Tips are published yet.</p><p className="mt-2 text-sm text-gray-600">New advice will appear here as soon as it is published.</p></div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">{tips.map(tip => {
          const steps = [tip.tip1, tip.tip2, tip.tip3, tip.tip4, tip.tip5].filter(Boolean) as string[];
          return <div key={tip._id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="h-64 overflow-hidden relative">
              {tip.featuredImage ? <img src={tip.featuredImage} alt={tip.altText || `${tip.title} — beauty tip for Dubai and UAE residents`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" /> : <div className="flex h-full items-center justify-center bg-rose-100 text-rose-800"><Lightbulb className="h-12 w-12" /></div>}
              <div className="absolute top-4 left-4 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg"><Lightbulb className="w-5 h-5 inline mr-1" />Tip</div>
            </div>
            <div className="p-6"><h3 className="text-rose-900 mb-3">{tip.title}</h3><p className="text-gray-600 mb-4">{tip.excerpt || ''}</p><ul className="space-y-2">{steps.map((item, index) => <li key={index} className="flex items-start gap-2"><span className="text-rose-500 mt-1">&#8226;</span><span className="text-gray-700 text-sm">{item}</span></li>)}</ul></div>
          </div>;
        })}</div>}
      </div>
    </div>
  );
}
