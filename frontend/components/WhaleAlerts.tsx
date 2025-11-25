'use client';
import { useEffect, useState } from 'react';
import { whaleAPI } from '@/lib/api';
import { Waves, ExternalLink, RefreshCw } from 'lucide-react';

export default function WhaleAlerts() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchWhales = async () => {
        setLoading(true);
        try {
            const response = await whaleAPI.getTransactions(10);
            if (response.data.success) {
                setTransactions(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching whale alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWhales();
        const interval = setInterval(fetchWhales, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-slate-900">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Waves className="w-5 h-5 text-blue-400" />
                    Whale Alert Tracker
                </h2>
                <button
                    onClick={fetchWhales}
                    disabled={loading}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto">
                {loading && transactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        Loading whale movements...
                    </div>
                ) : (
                    transactions.map((tx, i) => (
                        <div key={i} className="p-4 hover:bg-slate-800/50 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-white">
                                        {tx.amount >= 1000000
                                            ? `${(tx.amount / 1000000).toFixed(1)}M`
                                            : tx.amount.toLocaleString()} {tx.symbol}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                        ${(tx.amount_usd / 1000000).toFixed(1)}M
                                    </span>
                                </div>
                                <span className="text-xs text-slate-500">
                                    {new Date(tx.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-300 mt-2">
                                <div className="flex items-center gap-1 max-w-[45%]">
                                    <div className={`w-2 h-2 rounded-full ${tx.from_owner === 'Unknown' ? 'bg-slate-500' : 'bg-blue-500'}`} />
                                    <span className="truncate" title={tx.from_owner}>{tx.from_owner}</span>
                                </div>
                                <span className="text-slate-600">→</span>
                                <div className="flex items-center gap-1 max-w-[45%]">
                                    <div className={`w-2 h-2 rounded-full ${tx.to_owner === 'Unknown' ? 'bg-slate-500' : 'bg-emerald-500'}`} />
                                    <span className="truncate" title={tx.to_owner}>{tx.to_owner}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
