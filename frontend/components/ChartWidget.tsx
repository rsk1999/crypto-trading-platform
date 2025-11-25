'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { pricesAPI } from '@/lib/api';

interface ChartWidgetProps {
    coin: string;
}

export default function ChartWidget({ coin }: ChartWidgetProps) {
    const [data, setData] = useState<any[]>([]);
    const [timeframe, setTimeframe] = useState('1h');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            try {
                const response = await pricesAPI.getHistorical(coin, timeframe);
                const klines = response.data.data;

                // Transform data for Recharts
                const chartData = klines.map((k: any) => ({
                    time: new Date(k[0]).toLocaleTimeString(),
                    price: parseFloat(k[4]), // Close price
                    high: parseFloat(k[2]),
                    low: parseFloat(k[3]),
                    volume: parseFloat(k[5]),
                }));

                setData(chartData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setLoading(false);
            }
        };

        fetchChartData();
        const interval = setInterval(fetchChartData, 60000); // Update every minute
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
                <div className="text-slate-400">Loading chart...</div>
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

            {/* Chart */}
            <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        tick={{ fill: '#94a3b8' }}
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
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#colorPrice)"
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Chart Info */}
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
                    <span className="text-slate-400">Avg Volume: </span>
                    <span className="text-slate-300 font-semibold">
                        ${(data.reduce((sum, d) => sum + d.volume, 0) / data.length).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                </div>
            </div>
        </div>
    );
}
