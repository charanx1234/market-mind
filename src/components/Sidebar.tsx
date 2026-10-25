/**
 * MarketMind Terminal - Professional Sidebar Navigation
 * Minimalist dark terminal dock with clean typography, icon alignment,
 * and virtual account summary.
 */

import React from 'react';
import {
  LayoutDashboard,
  Filter,
  FileText,
  TrendingUp,
  Calculator,
  ShieldAlert,
  Wallet,
  FlaskConical,
  Newspaper,
  BarChart3,
  FileCheck,
  Receipt,
  Sparkles
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'stock-research'
  | 'screener'
  | 'paper-trading'
  | 'backtesting'
  | 'personal-finance'
  | 'governance'
  | 'ipos'
  | 'bento'
  | 'risk'
  | 'calculator'
  | 'news';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  portfolioValue: number;
  currencySymbol: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  portfolioValue,
  currencySymbol,
}) => {
  const mainNav: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Main Terminal', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'stock-research', label: 'Stock Research & AI', icon: <FileText className="w-4 h-4 text-[#60a5fa]" />, badge: 'Dossier' },
    { id: 'screener', label: 'Stock Screener', icon: <Filter className="w-4 h-4" />, badge: 'Quant' },
    { id: 'paper-trading', label: 'Paper Trading', icon: <Wallet className="w-4 h-4 text-[#089981]" />, badge: 'Virtual' },
    { id: 'backtesting', label: 'Strategy Backtest', icon: <FlaskConical className="w-4 h-4" /> },
  ];

  const analysisNav: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'personal-finance', label: 'Tax & Personal Finance', icon: <Receipt className="w-4 h-4" />, badge: 'Budget 24' },
    { id: 'governance', label: 'Governance & Red Flags', icon: <FileCheck className="w-4 h-4" />, badge: 'Audit' },
    { id: 'ipos', label: 'IPO Radar & DRHP', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'bento', label: 'Analytics Bento', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'risk', label: 'Risk & Stress Tests', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'news', label: 'Exchange Filings', icon: <Newspaper className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 shrink-0 bg-[#0c0e14] border-r border-[#1f2434] p-3 flex flex-col justify-between hidden md:flex select-none text-xs">
      <div className="space-y-4">
        {/* Core Terminal Views */}
        <div>
          <div className="px-2.5 pb-1.5 text-[9px] font-bold text-[#555a6d] uppercase tracking-wider font-mono">
            Trading &amp; Execution
          </div>
          <nav className="space-y-0.5">
            {mainNav.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#181d2a] text-[#e6e8ee] border-l-2 border-[#3b82f6] font-semibold'
                      : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#12151f]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#161a26] text-[#60a5fa] border border-[#222738]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Fundamental & Regulatory Research */}
        <div>
          <div className="px-2.5 pb-1.5 text-[9px] font-bold text-[#555a6d] uppercase tracking-wider font-mono">
            Research &amp; Compliance
          </div>
          <nav className="space-y-0.5">
            {analysisNav.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#181d2a] text-[#e6e8ee] border-l-2 border-[#3b82f6] font-semibold'
                      : 'text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#12151f]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#161a26] text-[#787b86] border border-[#222738]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Simulated Virtual Portfolio Status Card */}
      <div className="p-3 bg-[#11141e] border border-[#1f2434] rounded text-xs font-mono">
        <div className="flex items-center justify-between text-[#787b86] text-[10px] mb-1">
          <span className="flex items-center gap-1.5 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-[#089981]"></span>
            Paper Portfolio
          </span>
          <span className="text-[9px] text-[#555a6d] uppercase">Simulated</span>
        </div>
        <div className="text-base font-black text-[#e6e8ee]">
          {currencySymbol}{portfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
        </div>
        <div className="mt-2 text-[10px] text-[#555a6d] flex items-center justify-between border-t border-[#1a1f2c] pt-1.5">
          <span>Zero Real Risk</span>
          <button
            onClick={() => onSelectTab('paper-trading')}
            className="text-[#60a5fa] hover:underline font-medium font-sans"
          >
            Order Book &rarr;
          </button>
        </div>
      </div>
    </aside>
  );
};
