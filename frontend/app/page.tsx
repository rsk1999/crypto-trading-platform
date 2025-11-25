'use client';
import { useEffect, useState } from 'react';
import { pricesAPI, tradesAPI } from '@/lib/api';
import CandlestickChart from '@/components/CandlestickChart';

export default function TradePage() {
  const [prices, setPrices] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await pricesAPI.getCurrent('bitcoin,ethereum,solana,pepe');
        setPrices(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching prices:', error);
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const currentPrice = prices?.[selectedCoin]?.usd;
    if (!currentPrice) {
      alert('Price not available');
      return;
    }

    setExecuting(true);
    try {
      const response = await tradesAPI.execute({
        coin: selectedCoin,
        side: tradeType,
        amount: parseFloat(amount),
        price: currentPrice,
      });

      if (response.data.success) {
        alert(response.data.message);
        setAmount('');
      } else {
        alert(response.data.message || 'Trade failed');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error executing trade');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-2xl text-slate-400">Loading...</div>
      </div>
    );
  }

  const coinMap: any = {
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    solana: 'Solana',
    pepe: 'PEPE',
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-emerald-400">Trade</h1>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {prices && Object.entries(prices).map(([coin, data]: [string, any]) => (
          <div key={coin} className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-lg font-semibold text-slate-400 mb-2 uppercase">{coin}</h3>
            <p className="text-3xl font-bold text-white">${data.usd.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-xl font-bold mb-4">Price Chart</h2>
          <CandlestickChart coin={selectedCoin} />
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-xl font-bold mb-4">Order Form</h2>

          {/* Buy/Sell Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${tradeType === 'buy'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
            >
              Buy
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${tradeType === 'sell'
                ? 'bg-red-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
            >
              Sell
            </button>
          </div>

          <form onSubmit={handleTrade} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Coin</label>
              <select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
              >
                <option value="bitcoin">Bitcoin</option>
                <option value="ethereum">Ethereum</option>
                <option value="solana">Solana</option>
                <option value="pepe">PEPE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Amount ({selectedCoin.toUpperCase()})
              </label>
              <input
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>

            {prices?.[selectedCoin] && amount && (
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-sm text-slate-400">Total Cost</p>
                <p className="text-xl font-bold text-white">
                  ${(parseFloat(amount) * prices[selectedCoin].usd).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={executing}
              className={`w-full font-semibold py-3 rounded-lg transition-colors ${tradeType === 'buy'
                ? 'bg-emerald-500 hover:bg-emerald-600'
                : 'bg-red-500 hover:bg-red-600'
                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {executing ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${coinMap[selectedCoin]}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
