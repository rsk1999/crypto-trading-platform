'use client';
import { useState } from 'react';
import { backtestAPI } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, Play, Settings } from 'lucide-react';

export default function BacktestPage() {
    const [coin, setCoin] = useState('bitcoin');
    const [strategy, setStrategy] = useState('sma_crossover');
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    // Strategy Parameters
    const [smaParams, setSmaParams] = useState({ short_period: 10, long_period: 30 });
    const [rsiParams, setRsiParams] = useState({ rsi_period: 14, oversold: 30, overbought: 70 });

    const handleRunBacktest = async () => {
        setLoading(true);
        try {
            const params = strategy === 'sma_crossover' ? smaParams : rsiParams;
            const response = await backtestAPI.run({
                coin,
                strategy,
                params,
                days
            });

            if (response.data.success) {
                setResults(response.data.data);
            } else {
                alert('Backtest failed: ' + (response.data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error running backtest:', error);
            alert('Error running backtest');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold mb-8 text-emerald-400 flex items-center gap-3">
                <Activity className="w-10 h-10" />
                Strategy Backtesting
            </h1>

            <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Configuration Panel */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-slate-400" />
                        Configuration
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Asset</label>
                            <select
                                value={coin}
                                onChange={(e) => setCoin(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                            >
                                <option value="bitcoin">Bitcoin (BTC)</option>
                                <option value="ethereum">Ethereum (ETH)</option>
                                <option value="solana">Solana (SOL)</option>
                                <option value="pepe">Pepe (PEPE)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Strategy</label>
                            <select
                                value={strategy}
                                onChange={(e) => setStrategy(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                            >
                                <option value="sma_crossover">SMA Crossover</option>
                                <option value="rsi">RSI Strategy</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Time Range (Days)</label>
                            <select
                                value={days}
                                onChange={(e) => setDays(parseInt(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                            >
                                <option value={7}>7 Days</option>
                                <option value={30}>30 Days</option>
                                <option value={90}>90 Days</option>
                                <option value={180}>180 Days</option>
                            </select>
                        </div>

                        {/* Strategy Specific Params */}
                        {strategy === 'sma_crossover' && (
                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <p className="text-sm font-semibold text-emerald-400">SMA Parameters</p>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Short Period</label>
                                    <input
                                        type="number"
                                        value={smaParams.short_period}
                                        onChange={(e) => setSmaParams({ ...smaParams, short_period: parseInt(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Long Period</label>
                                    <input
                                        type="number"
                                        value={smaParams.long_period}
                                        onChange={(e) => setSmaParams({ ...smaParams, long_period: parseInt(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                </div>
                            </div>
                        )}

                        {strategy === 'rsi' && (
                            <div className="space-y-4 pt-4 border-t border-slate-800">
                                <p className="text-sm font-semibold text-emerald-400">RSI Parameters</p>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">RSI Period</label>
                                    <input
                                        type="number"
                                        value={rsiParams.rsi_period}
                                        onChange={(e) => setRsiParams({ ...rsiParams, rsi_period: parseInt(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Oversold</label>
                                        <input
                                            type="number"
                                            value={rsiParams.oversold}
                                            onChange={(e) => setRsiParams({ ...rsiParams, oversold: parseInt(e.target.value) })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-400 mb-1">Overbought</label>
                                        <input
                                            type="number"
                                            value={rsiParams.overbought}
                                            onChange={(e) => setRsiParams({ ...rsiParams, overbought: parseInt(e.target.value) })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleRunBacktest}
                            disabled={loading}
                            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                'Running...'
                            ) : (
                                <>
                                    <Play className="w-5 h-5" />
                                    Run Backtest
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="col-span-2 space-y-6">
                    {results ? (
                        <>
                            {/* Metrics Cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                    <p className="text-sm text-slate-400">Total Profit</p>
                                    <p className={`text-2xl font-bold ${results.metrics?.total_profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        ${(results.metrics?.total_profit || 0).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {(results.metrics?.total_profit_pct || 0).toFixed(2)}% Return
                                    </p>
                                </div>
                                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                    <p className="text-sm text-slate-400">Win Rate</p>
                                    <p className="text-2xl font-bold text-blue-400">
                                        {(results.metrics?.win_rate || 0).toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {results.metrics?.profitable_trades || 0} / {results.metrics?.total_trades || 0} Trades
                                    </p>
                                </div>
                                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                    <p className="text-sm text-slate-400">Final Capital</p>
                                    <p className="text-2xl font-bold text-white">
                                        ${(results.metrics?.final_capital || 0).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Started with $10,000
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 h-[400px]">
                                <h3 className="text-lg font-bold mb-4 text-white">Performance Chart</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={results.chart_data}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis
                                            dataKey="timestamp"
                                            tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
                                            stroke="#94a3b8"
                                        />
                                        <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }}
                                            labelFormatter={(ts) => new Date(ts).toLocaleString()}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="price" stroke="#10b981" dot={false} name="Price" strokeWidth={2} />
                                        {strategy === 'sma_crossover' && (
                                            <>
                                                <Line type="monotone" dataKey="short_sma" stroke="#3b82f6" dot={false} name={`SMA ${smaParams.short_period}`} strokeWidth={1} />
                                                <Line type="monotone" dataKey="long_sma" stroke="#f59e0b" dot={false} name={`SMA ${smaParams.long_period}`} strokeWidth={1} />
                                            </>
                                        )}
                                        {strategy === 'rsi' && (
                                            <Line type="monotone" dataKey="rsi" stroke="#8b5cf6" dot={false} name="RSI" strokeWidth={1} yAxisId={1} />
                                        )}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Trade Log */}
                            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                                <h3 className="text-lg font-bold mb-4 text-white">Trade Log</h3>
                                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3">Time</th>
                                                <th className="px-4 py-3">Action</th>
                                                <th className="px-4 py-3">Price</th>
                                                <th className="px-4 py-3">Reason</th>
                                                <th className="px-4 py-3 text-right">Profit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.trades.map((trade: any, i: number) => (
                                                <tr key={i} className="border-b border-slate-800 hover:bg-slate-800/20">
                                                    <td className="px-4 py-3 text-slate-300">
                                                        {new Date(trade.timestamp).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${trade.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {trade.action}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-white">
                                                        ${trade.price.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-400 truncate max-w-xs">
                                                        {trade.reason}
                                                    </td>
                                                    <td className={`px-4 py-3 text-right font-bold ${trade.profit > 0 ? 'text-emerald-400' : trade.profit < 0 ? 'text-red-400' : 'text-slate-500'
                                                        }`}>
                                                        {trade.profit ? `$${trade.profit.toFixed(2)}` : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800 border-dashed p-12 text-center">
                            <Activity className="w-16 h-16 text-slate-600 mb-4" />
                            <h3 className="text-xl font-bold text-slate-400 mb-2">Ready to Backtest</h3>
                            <p className="text-slate-500 max-w-md">
                                Configure your strategy parameters on the left and click "Run Backtest" to see how your strategy would have performed on historical data.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
