'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, Wallet, BarChart3, Newspaper, Settings, MessageCircle, Activity } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Trade', icon: TrendingUp },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/market', label: 'Market', icon: BarChart3 },
  { href: '/backtest', label: 'Backtest', icon: Activity },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/chat', label: 'AI Chat', icon: MessageCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-900 h-screen p-6 flex flex-col border-r border-slate-800">
      <h1 className="text-3xl font-bold text-emerald-400 mb-10">Crypto</h1>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
