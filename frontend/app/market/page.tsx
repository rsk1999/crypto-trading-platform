'use client';
import { useEffect, useState } from 'react';
import { marketAPI } from '@/lib/api';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import WhaleAlerts from '@/components/WhaleAlerts';

export default function MarketPage() {
    const [fearGreed, setFearGreed] = useState<any>(null);
    const [topCoins, setTopCoins] = useState<any[]>([]);
    const [gainersLosers, setGainersLosers] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const [fgRes, coinsRes, moversRes] = await Promise.all([
                    marketAPI.getFearGreed(),
                    marketAPI.getTopCoins(),
                    marketAPI.getGainersLosers(),
                ]);

                if (fgRes.data.success) setFearGreed(fgRes.data.data);
                if (coinsRes.data.success) setTopCoins(coinsRes.data.data);
                if (moversRes.data.success) setGainersLosers(moversRes.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching market data:', error);
                setLoading(false);
            }
        };

        fetchMarketData();
        const interval = setInterval(fetchMarketData, 300000); // 5 minutes
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-2xl text-slate-400">Loading...</div>
            </div>
        );
    }

    const getFearGreedColor = (value: number) => {
        if (value >= 75) return 'bg-green-500';
        if (value >= 50) return 'bg-emerald-500';
        if (value >= 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold mb-8 text-emerald-400">Market Overview</h1>

            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Left Column: Metrics & Top Coins */}
                <div className="col-span-2 space-y-6">
                    {/* Fear & Greed Index */}
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <Activity className="w-6 h-6 text-emerald-400" />
                            <h2 className="text-xl font-semibold">Fear & Greed Index</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-24 h-24 rounded-full ${getFearGreedColor(fearGreed?.value || 50)} flex items-center justify-center`}>
                                <span className="text-3xl font-bold text-white">{fearGreed?.value || 50}</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{fearGreed?.classification || 'Neutral'}</p>
                                <p className="text-sm text-slate-400">Market Sentiment</p>
                            </div>
                        </div>
                    </div>

                    {/* Top Coins by Volume */}
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <h2 className="text-2xl font-bold mb-6">Top 10 Coins by Volume</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-800">
                                        <th className="text-left py-3 px-4 text-slate-400 font-semibold">Coin</th>
                                        <th className="text-right py-3 px-4 text-slate-400 font-semibold">Price</th>
                                        <th className="text-right py-3 px-4 text-slate-400 font-semibold">24h Change</th>
                                        <th className="text-right py-3 px-4 text-slate-400 font-semibold">Volume</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topCoins.map((coin: any, idx: number) => (
                                        <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    {/* <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" /> */}
                                                    <div>
                                                        {/* <div className="font-semibold text-white">{coin.name}</div> */}
                                                        <div className="font-bold text-white uppercase">{coin.symbol}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-right py-4 px-4 text-slate-300">
                                                ${coin.price?.toLocaleString() || '0'}
                                            </td>
                                            <td className={`text-right py-4 px-4 font-semibold ${coin.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {coin.change_24h >= 0 ? '+' : ''}{(coin.change_24h || 0).toFixed(2)}%
                                            </td>
                                            <td className="text-right py-4 px-4 text-slate-300">
                                                ${((coin.volume || 0) / 1000000).toFixed(2)}M
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Whale Alerts & Gainers/Losers */}
                <div className="space-y-6">
                    {/* Whale Alerts Widget */}
                    <WhaleAlerts />

                    {/* Top Gainers */}
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                            <h2 className="text-xl font-semibold">Top Gainers (24h)</h2>
                        </div>
                        <div className="space-y-3">
                            {gainersLosers?.gainers?.slice(0, 5).map((coin: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="text-slate-300 uppercase font-medium">{coin.symbol}</span>
                                    <span className="text-green-400 font-bold">+{coin.change_24h?.toFixed(2)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Losers */}
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingDown className="w-6 h-6 text-red-400" />
                            <h2 className="text-xl font-semibold">Top Losers (24h)</h2>
                        </div>
                        <div className="space-y-3">
                            {gainersLosers?.losers?.slice(0, 5).map((coin: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="text-slate-300 uppercase font-medium">{coin.symbol}</span>
                                    <span className="text-red-400 font-bold">{coin.change_24h?.toFixed(2)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
