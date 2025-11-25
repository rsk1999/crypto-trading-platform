'use client';
import { useEffect, useState } from 'react';
import { alertsAPI } from '@/lib/api';
import { Bell, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        coin: 'bitcoin',
        target_price: '',
        condition: 'above',
    });

    const fetchAlerts = async () => {
        try {
            const response = await alertsAPI.get();
            setAlerts(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleAddAlert = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await alertsAPI.add({
                coin: formData.coin,
                target_price: parseFloat(formData.target_price),
                condition: formData.condition,
                alert_type: 'price',
                base_price: null,
            });
            setFormData({ coin: 'bitcoin', target_price: '', condition: 'above' });
            fetchAlerts();
        } catch (error) {
            console.error('Error adding alert:', error);
        }
    };

    const handleDeleteAlert = async (index: number) => {
        try {
            await alertsAPI.delete(index);
            fetchAlerts();
        } catch (error) {
            console.error('Error deleting alert:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-2xl text-slate-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
                <Bell className="w-8 h-8 text-emerald-400" />
                <h1 className="text-4xl font-bold text-emerald-400">Settings</h1>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Add Alert Form */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Plus className="w-6 h-6 text-emerald-400" />
                        Add Price Alert
                    </h2>
                    <form onSubmit={handleAddAlert} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Coin</label>
                            <select
                                value={formData.coin}
                                onChange={(e) => setFormData({ ...formData, coin: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                            >
                                <option value="bitcoin">Bitcoin</option>
                                <option value="ethereum">Ethereum</option>
                                <option value="solana">Solana</option>
                                <option value="pepe">PEPE</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Target Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.target_price}
                                onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                                placeholder="50000"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Condition</label>
                            <select
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                            >
                                <option value="above">Above</option>
                                <option value="below">Below</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            Add Alert
                        </button>
                    </form>
                </div>

                {/* Active Alerts */}
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                    <h2 className="text-2xl font-bold mb-6">Active Alerts</h2>
                    {alerts.length === 0 ? (
                        <p className="text-slate-400 text-center py-8">No active alerts. Create one to get started!</p>
                    ) : (
                        <div className="space-y-3">
                            {alerts.map((alert: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex items-center justify-between hover:border-emerald-500/30 transition-colors"
                                >
                                    <div>
                                        <p className="font-semibold text-white uppercase">{alert.coin}</p>
                                        <p className="text-sm text-slate-400">
                                            Alert when price goes {alert.condition} ${alert.target_price.toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteAlert(idx)}
                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5 text-red-400" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
