'use client';
import { useEffect, useState } from 'react';
import { pricesAPI } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CandlestickChartProps {
    coin: string;
}

export default function CandlestickChart({ coin }: CandlestickChartProps) {
    const [data, setData] = useState<any[]>([]);
    const [timeframe, setTimeframe] = useState('1h');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            try {
                const response = await pricesAPI.getHistorical(coin, timeframe);
                const klines = response.data.data;

                // Transform data for candlestick visualization
                const chartData = klines.map((k: any) => {
                    const open = parseFloat(k[1]);
                    const close = parseFloat(k[4]);
                    const high = parseFloat(k[2]);
                    const low = parseFloat(k[3]);

                    return {
                        time: new Date(k[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        timestamp: k[0],
                        open,
                        close,
                        high,
                        low,
                        body: [Math.min(open, close), Math.max(open, close)],
                        wick: [low, high],
                        isGreen: close >= open,
                        volume: parseFloat(k[5]),
                    };
                });

                setData(chartData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setLoading(false);
            }
        };

        fetchChartData();
        const interval = setInterval(fetchChartData, 60000);
        return () => clearInterval(interval);
    }, [coin, timeframe]);

    const timeframes = [
        { value: '1h', label: '1H' },
        { value: '4h', label: '4H' },
        { value: '1d', label: '1D' },
        { value: '1w', label: '1W' },
    ];

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <div className="text-slate-400 animate-pulse">Loading chart...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Timeframe Selector */}
            <div className="flex gap-2 mb-4">
                {timeframes.map((tf) => (
                    <button
                        key={tf.value}
                        onClick={() => setTimeframe(tf.value)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${timeframe === tf.value
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        {tf.label}
                    </button>
                ))}
            </div>

            {/* Candlestick Chart */}
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8' }}
                        domain={['dataMin - 100', 'dataMax + 100']}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        formatter={(value: any, name: string) => {
                            if (name === 'body' || name === 'wick') return null;
                            return [`$${value.toLocaleString()}`, name];
                        }}
                    />

                    {/* Wicks (High-Low) */}
                    <Bar dataKey="wick" fill="transparent">
                        {data.map((entry, index) => (
                            <Cell
                                key={`wick-${index}`}
                                stroke={entry.isGreen ? '#10b981' : '#ef4444'}
                                strokeWidth={2}
                            />
                        ))}
                    </Bar>

                    {/* Candle Bodies (Open-Close) */}
                    <Bar dataKey="body" barSize={20}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`body-${index}`}
                                fill={entry.isGreen ? '#10b981' : '#ef4444'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Chart Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                    <span className="text-slate-400">High: </span>
                    <span className="text-green-400 font-semibold">
                        ${Math.max(...data.map(d => d.high)).toLocaleString()}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400">Low: </span>
                    <span className="text-red-400 font-semibold">
                        ${Math.min(...data.map(d => d.low)).toLocaleString()}
                    </span>
                </div>
                <div>
                    <span className="text-slate-400">Latest: </span>
                    <span className="text-slate-300 font-semibold">
                        ${data[data.length - 1]?.close.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
