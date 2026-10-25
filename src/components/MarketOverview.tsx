/**
 * MarketMind AI - Market Overview Component
 * Comprehensive snapshot of Indian equities, benchmark index movements,
 * market breadth, volatility gauge (INDIA VIX), and top movers.
 */

import React from 'react';
import { TrendingUp, TrendingDown, Activity, ArrowUpRight, BarChart3, AlertCircle } from 'lucide-react';
import { MarketIndex, StockQuote } from '../types/market';

interface MarketOverviewProps {
  indices: MarketIndex[];
  stocks: StockQuote[];
  onSelectStock: (stock: StockQuote) => void;
  currencySymbol: string;
  onNavigateToBento?: () => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  indices,
  stocks,
  onSelectStock,
  currencySymbol,
  onNavigateToBento,
}) => {
  // Compute Top Gainers, Losers, and Volume leaders
  const sortedByChange = [...stocks].sort((a, b) => b.dayChangePercent - a.dayChangePercent);
  const topGainers = sortedByChange.slice(0, 4);
  const topLosers = [...sortedByChange].reverse().slice(0, 4);
  const mostActive = [...stocks].sort((a, b) => b.dayVolume - a.dayVolume).slice(0, 4);

  // Sector aggregated performance
  const sectors = React.useMemo(() => {
    const map = new Map<string, { totalChange: number; count: number }>();
    stocks.forEach(s => {
      const cur = map.get(s.sector) || { totalChange: 0, count: 0 };
      map.set(s.sector, { totalChange: cur.totalChange + s.dayChangePercent, count: cur.count + 1 });
    });
    return Array.from(map.entries()).map(([sector, data]) => ({
      name: sector,
      avgChange: data.totalChange / data.count,
      count: data.count
    }));
  }, [stocks]);

  const indiaVix = indices.find(i => i.symbol === '^INDIAVIX')?.currentValue || 13.42;

  return (
    <div className="space-y-6">
      {/* Educational Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wide">
              Educational Simulation
            </span>
            <span className="text-xs text-slate-400">NSE / BSE End-of-Day Research Sandbox</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Personal Indian Stock Market Research & Simulation Platform
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Analyze audited financial statements, examine deterministic scenario bounds without AI hallucinations, evaluate portfolio risks, and test strategies with virtual money.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 shrink-0 font-mono text-xs">
          <Activity className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase">Systemic Volatility (INDIA VIX)</div>
            <div className="text-white font-bold">{indiaVix.toFixed(2)} • {indiaVix < 15 ? 'Low / Stable' : 'Elevated'}</div>
          </div>
        </div>
      </div>

      {/* Index Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indices.filter(idx => idx.symbol !== '^INDIAVIX').map(idx => {
          const isUp = idx.dayChange >= 0;
          return (
            <div
              key={idx.symbol}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">{idx.name}</span>
                <span className="font-mono text-[10px]">{idx.symbol}</span>
              </div>
              <div className="text-xl font-extrabold font-mono text-white">
                {idx.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-xs">
                <span
                  className={`flex items-center gap-1 font-semibold font-mono ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isUp ? '+' : ''}{idx.dayChange.toFixed(2)} ({isUp ? '+' : ''}{idx.dayChangePercent.toFixed(2)}%)
                </span>
                <span className="text-[10px] text-slate-400">Day High: {idx.high.toLocaleString('en-IN')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bento Grid Feature Spotlight Banner */}
      {onNavigateToBento && (
        <div
          onClick={onNavigateToBento}
          className="cursor-pointer bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-lg group"
        >
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-emerald-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Interactive Analytics Bento Grid</span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase">
                  Live View
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore real-time squarified sector treemaps, institutional turnover waves, and historical monthly seasonality radar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 font-mono shrink-0">
            <span>Open Bento &rarr;</span>
          </div>
        </div>
      )}

      {/* Sector Performance Strip */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
            Sectoral Momentum Overview
          </span>
          <span className="text-[11px] text-slate-400">Weighted Average Daily Change</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {sectors.map(sec => {
            const isUp = sec.avgChange >= 0;
            return (
              <div
                key={sec.name}
                className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 text-center"
              >
                <div className="text-[11px] text-slate-400 truncate mb-1" title={sec.name}>
                  {sec.name}
                </div>
                <div
                  className={`text-sm font-bold font-mono ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? '+' : ''}{sec.avgChange.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Movers: Gainers, Losers, and Most Active */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
              <TrendingUp className="w-4 h-4" /> Top Gainers
            </span>
            <span className="text-[10px] text-slate-400 font-mono">NSE Cash</span>
          </div>
          <div className="divide-y divide-slate-800/60 mt-1">
            {topGainers.map(stock => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 rounded-lg px-2 -mx-2 transition"
              >
                <div>
                  <div className="font-bold font-mono text-white text-xs">{stock.symbol}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{stock.name}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-semibold text-white">
                    {currencySymbol}{stock.currentPrice.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-400">
                    +{stock.dayChangePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
              <TrendingDown className="w-4 h-4" /> Top Losers
            </span>
            <span className="text-[10px] text-slate-400 font-mono">NSE Cash</span>
          </div>
          <div className="divide-y divide-slate-800/60 mt-1">
            {topLosers.map(stock => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 rounded-lg px-2 -mx-2 transition"
              >
                <div>
                  <div className="font-bold font-mono text-white text-xs">{stock.symbol}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{stock.name}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-semibold text-white">
                    {currencySymbol}{stock.currentPrice.toFixed(2)}
                  </div>
                  <div className="text-[11px] font-semibold text-rose-400">
                    {stock.dayChangePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active by Volume */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
              <BarChart3 className="w-4 h-4" /> Active by Volume
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Shares Traded</span>
          </div>
          <div className="divide-y divide-slate-800/60 mt-1">
            {mostActive.map(stock => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock)}
                className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 rounded-lg px-2 -mx-2 transition"
              >
                <div>
                  <div className="font-bold font-mono text-white text-xs">{stock.symbol}</div>
                  <div className="text-[10px] text-slate-400">Vol: {(stock.dayVolume / 100000).toFixed(1)} Lakhs</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-semibold text-white">
                    {currencySymbol}{stock.currentPrice.toFixed(2)}
                  </div>
                  <div className={`text-[11px] font-semibold ${stock.dayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stock.dayChange >= 0 ? '+' : ''}{stock.dayChangePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
