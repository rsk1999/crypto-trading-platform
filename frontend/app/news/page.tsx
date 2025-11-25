'use client';
import { useEffect, useState } from 'react';
import { newsAPI } from '@/lib/api';
import { Newspaper, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';

export default function NewsPage() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await newsAPI.get();
                setNews(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching news:', error);
                setLoading(false);
            }
        };

        fetchNews();
        const interval = setInterval(fetchNews, 600000); // 10 minutes
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-2xl text-slate-400">Loading...</div>
            </div>
        );
    }

    const getSentimentIcon = (sentiment: string) => {
        if (sentiment === 'positive') return <ThumbsUp className="w-5 h-5 text-green-400" />;
        if (sentiment === 'negative') return <ThumbsDown className="w-5 h-5 text-red-400" />;
        return <Minus className="w-5 h-5 text-slate-400" />;
    };

    const getSentimentColor = (sentiment: string) => {
        if (sentiment === 'positive') return 'border-green-500/30 bg-green-500/5';
        if (sentiment === 'negative') return 'border-red-500/30 bg-red-500/5';
        return 'border-slate-700 bg-slate-800/30';
    };

    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <Newspaper className="w-8 h-8 text-emerald-400" />
                <h1 className="text-4xl font-bold text-emerald-400">Crypto News</h1>
            </div>

            {news.length === 0 ? (
                <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
                    <p className="text-slate-400 text-lg">No news available at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {news.map((article: any, idx: number) => (
                        <div
                            key={idx}
                            className={`bg-slate-900 p-6 rounded-xl border ${getSentimentColor(article.sentiment)} hover:border-emerald-500/30 transition-colors`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-white mb-2 hover:text-emerald-400 transition-colors">
                                        {article.title}
                                    </h2>
                                    <p className="text-slate-400 mb-4 line-clamp-2">{article.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                                        {article.source && <span>• {article.source}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getSentimentIcon(article.sentiment)}
                                    <span className="text-sm font-medium text-slate-400 capitalize">
                                        {article.sentiment}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
