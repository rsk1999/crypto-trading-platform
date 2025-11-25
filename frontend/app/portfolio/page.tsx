'use client';
import { useEffect, useState } from 'react';
import { portfolioAPI } from '@/lib/api';
import { Wallet } from 'lucide-react';

export default function PortfolioPage() {
    const [portfolio, setPortfolio] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const response = await portfolioAPI.get();
                setPortfolio(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching portfolio:', error);
                setLoading(false);
            }
        };

        fetchPortfolio();
        const interval = setInterval(fetchPortfolio, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-2xl text-slate-400">Loading...</div>
            </div>
        );
    }

    const holdings = portfolio?.holdings || {};
    const metrics = portfolio?.metrics || {};
    const balance = portfolio?.balance || 0;

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold mb-8 text-emerald-400">Portfolio</h1>

            {/* Balance Card */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Wallet className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-xl font-semibold text-slate-400">Available Balance</h2>
                </div>
                <p className="text-4xl font-bold text-white">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Sharpe Ratio</h3>
                    <p className="text-3xl font-bold text-white">{metrics.sharpe_ratio?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Max Drawdown</h3>
                    <p className="text-3xl font-bold text-red-400">{metrics.max_drawdown?.toFixed(1) || '0.0'}%</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Win Rate</h3>
                    <p className="text-3xl font-bold text-emerald-400">{metrics.win_rate?.toFixed(1) || '0.0'}%</p>
                </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h2 className="text-2xl font-bold mb-6">Your Holdings</h2>
                {Object.keys(holdings).length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No holdings yet. Start trading to build your portfolio!</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Coin</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-semibold">Amount</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-semibold">Price</th>
                                    <th className="text-right py-3 px-4 text-slate-400 font-semibold">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(holdings).map(([coin, data]: [string, any]) => (
                                    <tr key={coin} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                        <td className="py-4 px-4">
                                            <span className="font-semibold text-white uppercase">{coin}</span>
                                        </td>
                                        <td className="text-right py-4 px-4 text-slate-300">
                                            {data.amount.toFixed(4)}
                                        </td>
                                        <td className="text-right py-4 px-4 text-slate-300">
                                            ${data.current_price.toLocaleString()}
                                        </td>
                                        <td className="text-right py-4 px-4">
                                            <span className="font-semibold text-white">
                                                ${data.current_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Suggestions */}
            {portfolio?.suggestions && (
                <div className="mt-6 bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-xl font-bold mb-3">💡 Suggestions</h2>
                    <p className="text-slate-300">{portfolio.suggestions}</p>
                </div>
            )}

            {/* What If Calculator */}
            <div className="mt-6 bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h2 className="text-2xl font-bold mb-6">💰 What If Calculator</h2>
                <p className="text-slate-400 mb-4">
                    Calculate what your investment would be worth if you had bought at a different time.
                </p>
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Coin</label>
                        <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white">
                            <option value="bitcoin">Bitcoin</option>
                            <option value="ethereum">Ethereum</option>
                            <option value="solana">Solana</option>
                            <option value="pepe">PEPE</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Amount ($)</label>
                        <input
                            type="number"
                            placeholder="1000"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Days Ago</label>
                        <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white">
                            <option value="7">7 days</option>
                            <option value="30">30 days</option>
                            <option value="90">90 days</option>
                            <option value="365">1 year</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition-colors">
                            Calculate
                        </button>
                    </div>
                </div>
                <div className="mt-4 bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-sm text-slate-400 mb-1">Result</p>
                    <p className="text-2xl font-bold text-white">Click Calculate to see results</p>
                </div>
            </div>
        </div>
    );
}
