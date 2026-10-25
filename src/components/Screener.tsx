/**
 * MarketMind AI - Stock Screener & Transparent Research Rankings
 * Filters Indian equities across Valuation, Profitability, Financial Health, Volatility, and Momentum.
 * Displays transparent multi-factor score breakdown (0-100) with penalty deductions.
 */

import React, { useState, useMemo } from 'react';
import {
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  TrendingUp,
  ShieldCheck,
  Search,
  Sparkles,
  Download
} from 'lucide-react';
import { StockQuote, ResearchScoreBreakdown } from '../types/market';
import { computeResearchScore } from '../services/financialMath';

interface ScreenerProps {
  stocks: StockQuote[];
  onSelectStock: (stock: StockQuote) => void;
  currencySymbol: string;
}

export const Screener: React.FC<ScreenerProps> = ({
  stocks,
  onSelectStock,
  currencySymbol,
}) => {
  // Filters
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [valuationFilter, setValuationFilter] = useState<'ALL' | 'VALUE' | 'REASONABLE' | 'GROWTH'>('ALL');
  const [minRoe, setMinRoe] = useState<number>(0);
  const [maxDebtToEquity, setMaxDebtToEquity] = useState<number>(5.0);
  const [volatilityFilter, setVolatilityFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [expandedStockSymbol, setExpandedStockSymbol] = useState<string | null>(null);

  // Compute research score for each stock and apply filters
  const scoredStocks = useMemo(() => {
    return stocks.map(stock => {
      const breakdown = computeResearchScore(stock.fundamentals, stock.technicals);
      return {
        stock,
        breakdown
      };
    });
  }, [stocks]);

  // Unique sectors
  const sectorList = useMemo(() => {
    return ['ALL', ...Array.from(new Set(stocks.map(s => s.sector)))];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return scoredStocks.filter(({ stock, breakdown }) => {
      if (selectedSector !== 'ALL' && stock.sector !== selectedSector) return false;
      if (stock.fundamentals.roe < minRoe) return false;
      if (stock.fundamentals.debtToEquity > maxDebtToEquity) return false;

      // Valuation
      if (valuationFilter === 'VALUE' && stock.fundamentals.peRatio > 20) return false;
      if (valuationFilter === 'REASONABLE' && (stock.fundamentals.peRatio < 20 || stock.fundamentals.peRatio > 35)) return false;
      if (valuationFilter === 'GROWTH' && stock.fundamentals.peRatio <= 35) return false;

      // Volatility
      const vol = stock.technicals.historicalVolatilityAnnualized;
      if (volatilityFilter === 'LOW' && vol > 0.19) return false;
      if (volatilityFilter === 'MEDIUM' && (vol <= 0.19 || vol > 0.28)) return false;
      if (volatilityFilter === 'HIGH' && vol <= 0.28) return false;

      return true;
    }).sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore);
  }, [scoredStocks, selectedSector, minRoe, maxDebtToEquity, valuationFilter, volatilityFilter]);

  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Symbol',
      'Name',
      'Sector',
      'Price (INR)',
      'Day Change %',
      'Research Score',
      'Valuation Score',
      'Profitability Score',
      'Health Score',
      'Momentum Score',
      'PE Ratio',
      'PB Ratio',
      'ROE %',
      'Debt to Equity',
      'Operating Margin %',
      'Annualized Volatility %'
    ];

    const rows = filteredStocks.map(({ stock, breakdown }, idx) => [
      idx + 1,
      `"${stock.symbol}"`,
      `"${stock.name.replace(/"/g, '""')}"`,
      `"${stock.sector.replace(/"/g, '""')}"`,
      stock.currentPrice.toFixed(2),
      stock.dayChangePercent.toFixed(2),
      breakdown.totalScore.toFixed(1),
      breakdown.valuationScore.toFixed(1),
      breakdown.profitabilityScore.toFixed(1),
      breakdown.healthScore.toFixed(1),
      breakdown.momentumScore.toFixed(1),
      stock.fundamentals.peRatio.toFixed(2),
      stock.fundamentals.pbRatio.toFixed(2),
      stock.fundamentals.roe.toFixed(2),
      stock.fundamentals.debtToEquity.toFixed(2),
      stock.financialHistory?.[0]
        ? ((stock.financialHistory[0].ebitdaCr / stock.financialHistory[0].revenueCr) * 100).toFixed(2)
        : 'N/A',
      (stock.technicals.historicalVolatilityAnnualized * 100).toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MarketMind_Screened_Stocks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header & Mandatory Research Disclaimer */}
      <div className="bg-[#12151f] border border-[#202433] rounded-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase px-1.5 py-0.5 bg-[#1b2234] text-[#60a5fa] border border-[#2b354e] rounded flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Quantitative Screener
            </span>
            <span className="text-xs text-[#787b86]">Institutional Multi-Factor Factor Scoring Engine</span>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181d2a] hover:bg-[#202638] text-[#e6e8ee] border border-[#262f44] rounded text-xs font-mono font-semibold transition"
          >
            <Download className="w-3.5 h-3.5 text-[#60a5fa]" />
            Export CSV
          </button>
        </div>

        <h1 className="text-base font-bold text-[#e6e8ee] tracking-tight font-sans">
          Stock Screening &amp; Transparent Factor Rankings
        </h1>
        <p className="text-xs text-[#787b86] mt-0.5 max-w-3xl leading-relaxed">
          Screen Indian equities across Valuation (25%), Profitability (25%), Financial Health (25%), and Momentum/Stability (25%), with rule-based deductions for extreme debt or systemic volatility.
        </p>

        {/* Prominent Regulatory Label */}
        <div className="mt-3 p-2.5 bg-[#161a26] border border-[#232a3d] rounded text-xs text-[#a0a5b5] flex items-center gap-2 font-mono text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
          <span>
            <strong className="text-[#e6e8ee]">Educational Notice:</strong> Ranked companies are labeled as <em>Research Candidates</em> for study and simulated paper-testing, NOT guaranteed returns or personalized recommendations.
          </span>
        </div>
      </div>

      {/* Filter Controls Panel */}
      <div className="bg-[#12151f] border border-[#202433] rounded-md p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
        {/* Sector Filter */}
        <div>
          <label className="text-[#787b86] block mb-1 text-[11px]">Sector:</label>
          <select
            value={selectedSector}
            onChange={e => setSelectedSector(e.target.value)}
            className="w-full bg-[#0c0e14] border border-[#202534] rounded px-2.5 py-1 text-[#d1d4dc] focus:outline-none focus:border-[#3b82f6] text-xs"
          >
            {sectorList.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Valuation Tier */}
        <div>
          <label className="text-[#787b86] block mb-1 text-[11px]">Valuation (P/E):</label>
          <select
            value={valuationFilter}
            onChange={e => setValuationFilter(e.target.value as any)}
            className="w-full bg-[#0c0e14] border border-[#202534] rounded px-2.5 py-1 text-[#d1d4dc] focus:outline-none focus:border-[#3b82f6] text-xs"
          >
            <option value="ALL">All Valuations</option>
            <option value="VALUE">Value (P/E &lt; 20)</option>
            <option value="REASONABLE">Fair (P/E 20 - 35)</option>
            <option value="GROWTH">Premium (P/E &gt; 35)</option>
          </select>
        </div>

        {/* Minimum ROE */}
        <div>
          <label className="text-[#787b86] block mb-1 text-[11px]">Min ROE: <span className="text-[#60a5fa]">{minRoe}%</span></label>
          <input
            type="range"
            min={0}
            max={35}
            step={5}
            value={minRoe}
            onChange={e => setMinRoe(Number(e.target.value))}
            className="w-full accent-[#3b82f6] cursor-pointer"
          />
        </div>

        {/* Max Debt / Equity */}
        <div>
          <label className="text-[#787b86] block mb-1 text-[11px]">Max Debt/Equity: <span className="text-[#60a5fa]">{maxDebtToEquity.toFixed(1)}</span></label>
          <input
            type="range"
            min={0.2}
            max={5.0}
            step={0.2}
            value={maxDebtToEquity}
            onChange={e => setMaxDebtToEquity(Number(e.target.value))}
            className="w-full accent-[#3b82f6] cursor-pointer"
          />
        </div>

        {/* Volatility */}
        <div>
          <label className="text-slate-400 block mb-1.5 font-medium">Volatility (Beta &amp; &sigma;):</label>
          <select
            value={volatilityFilter}
            onChange={e => setVolatilityFilter(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500 font-sans"
          >
            <option value="ALL">All Volatility Ranges</option>
            <option value="LOW">Low Volatility (&lt; 19%)</option>
            <option value="MEDIUM">Moderate (19% - 28%)</option>
            <option value="HIGH">High Volatility (&gt; 28%)</option>
          </select>
        </div>
      </div>

      {/* Screened Candidates Table */}
      <div className="bg-[#12151f] border border-[#202433] rounded-md overflow-hidden">
        <div className="px-4 py-2.5 bg-[#161a26] border-b border-[#202534] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#e6e8ee] uppercase tracking-wider font-mono text-xs">
              {filteredStocks.length} Screened Research Candidates
            </span>
            <span className="text-[#787b86] text-[10px] font-mono hidden sm:inline">• Click candidate to inspect score factor decomposition</span>
          </div>
        </div>

        <div className="divide-y divide-[#181d2a]">
          {filteredStocks.map(({ stock, breakdown }, index) => {
            const isExpanded = expandedStockSymbol === stock.symbol;
            const isUp = stock.dayChange >= 0;

            return (
              <div key={stock.symbol} className="transition">
                {/* Main Row */}
                <div
                  onClick={() => setExpandedStockSymbol(isExpanded ? null : stock.symbol)}
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/50 transition ${
                    isExpanded ? 'bg-slate-800/40' : ''
                  }`}
                >
                  {/* Stock Info */}
                  <div className="flex items-center gap-4 min-w-[220px]">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-indigo-400 shrink-0">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-white text-sm">{stock.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {stock.exchange}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[180px]">{stock.name}</div>
                      <div className="text-[10px] text-slate-500">{stock.sector}</div>
                    </div>
                  </div>

                  {/* Price & Change */}
                  <div className="font-mono text-left md:text-right min-w-[120px]">
                    <div className="text-sm font-bold text-white">
                      {currencySymbol}{stock.currentPrice.toFixed(2)}
                    </div>
                    <div className={`text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? '+' : ''}{stock.dayChangePercent.toFixed(2)}%
                    </div>
                  </div>

                  {/* Key Metrics Quick Columns */}
                  <div className="grid grid-cols-4 gap-4 text-xs font-mono text-slate-300 min-w-[320px]">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-sans">P/E</span>
                      <span className="font-bold text-white">{stock.fundamentals.peRatio}x</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-sans">ROE</span>
                      <span className="font-bold text-emerald-400">{stock.fundamentals.roe}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-sans">D/E</span>
                      <span className="font-bold text-white">{stock.fundamentals.debtToEquity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-sans">Volatility</span>
                      <span className="font-bold text-amber-400">{(stock.technicals.historicalVolatilityAnnualized * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Research Score Pill & Tier */}
                  <div className="flex items-center gap-3 justify-between md:justify-end min-w-[170px]">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-[10px] text-slate-400 font-sans uppercase">Research Score:</span>
                        <span className="text-sm font-black font-mono text-cyan-400">
                          {breakdown.totalScore}/100
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          breakdown.tier === 'High Research Potential'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : breakdown.tier === 'Moderate Consideration'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {breakdown.tier}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Score Breakdown & Action Bar */}
                {isExpanded && (
                  <div className="p-5 bg-slate-950 border-t border-slate-800/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
                      <div>
                        <span className="font-bold text-white">Mathematical Scoring Breakdown for {stock.symbol}</span>
                        <p className="text-[11px] text-slate-400">Contributions out of 25 maximum points per pillar, less deductions.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onSelectStock(stock);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Deep Research &rarr;
                        </button>
                      </div>
                    </div>

                    {/* 4 Pillars Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase block mb-1">1. Profitability</span>
                        <div className="text-base font-bold font-mono text-emerald-400">
                          {breakdown.profitabilityScore} <span className="text-slate-500 text-xs font-normal">/ 25 pts</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">ROE {stock.fundamentals.roe}%, ROCE {stock.fundamentals.roce}%</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase block mb-1">2. Valuation</span>
                        <div className="text-base font-bold font-mono text-cyan-400">
                          {breakdown.valuationScore} <span className="text-slate-500 text-xs font-normal">/ 25 pts</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">P/E {stock.fundamentals.peRatio}x vs Sector {stock.fundamentals.sectorPe}x</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase block mb-1">3. Financial Health</span>
                        <div className="text-base font-bold font-mono text-indigo-400">
                          {breakdown.healthScore} <span className="text-slate-500 text-xs font-normal">/ 25 pts</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">Debt/Equity {stock.fundamentals.debtToEquity}, Current Ratio {stock.fundamentals.currentRatio}</span>
                      </div>

                      <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase block mb-1">4. Momentum / Stability</span>
                        <div className="text-base font-bold font-mono text-purple-400">
                          {breakdown.momentumScore} <span className="text-slate-500 text-xs font-normal">/ 25 pts</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">RSI {stock.technicals.rsi14}, 3Y CAGR +{stock.technicals.cagr3y}%</span>
                      </div>
                    </div>

                    {/* Applied Penalties */}
                    {breakdown.penalties.length > 0 ? (
                      <div className="p-3 bg-rose-950/20 border border-rose-500/25 rounded-lg text-xs">
                        <span className="font-semibold text-rose-400 block mb-1">Penalties Deducted:</span>
                        <ul className="space-y-1">
                          {breakdown.penalties.map((p, i) => (
                            <li key={i} className="flex items-center justify-between text-slate-300">
                              <span>• {p.reason}</span>
                              <span className="font-mono font-bold text-rose-400">-{p.deduction} pts</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>No severe financial distress or volatility penalties triggered.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
