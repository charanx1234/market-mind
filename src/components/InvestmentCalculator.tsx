/**
 * MarketMind AI - Hypothetical Investment & Indian Statutory Cost Calculator
 * Computes whole-share allocation, Indian delivery tax schedule (STT, GST, Stamp Duty),
 * unallocated cash, break-even price, and multi-scenario probabilistic returns.
 */

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  IndianRupee,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { StockQuote } from '../types/market';
import {
  calculateWholeShareAllocation,
  calculateIndianStatutoryCharges,
  calculateBreakEvenPrice
} from '../services/financialMath';

interface InvestmentCalculatorProps {
  stocks: StockQuote[];
  selectedStock: StockQuote | null;
  onSelectStock: (stock: StockQuote) => void;
  currencySymbol: string;
}

export const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  currencySymbol,
}) => {
  const [budgetInput, setBudgetInput] = useState<number>(50000); // default ₹50,000
  const [selectedSymbol, setSelectedSymbol] = useState<string>(selectedStock?.symbol || 'RELIANCE');
  const [holdingPeriod, setHoldingPeriod] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');
  const [showTaxFormulas, setShowTaxFormulas] = useState<boolean>(false);

  const activeStock = stocks.find(s => s.symbol === selectedSymbol) || stocks[0];

  // Whole share allocation with statutory cost reservation
  const allocation = useMemo(() => {
    return calculateWholeShareAllocation(budgetInput, activeStock.currentPrice, 20);
  }, [budgetInput, activeStock]);

  // Round-trip break-even calculation
  const breakEvenPrice = useMemo(() => {
    return calculateBreakEvenPrice(allocation.shares, activeStock.currentPrice, 20);
  }, [allocation, activeStock]);

  // Scenario returns based on historical volatility & holding period
  const scenarios = useMemo(() => {
    const tYears = holdingPeriod === '1M' ? 21 / 252 : holdingPeriod === '3M' ? 63 / 252 : holdingPeriod === '6M' ? 126 / 252 : 1;
    const vol = activeStock.technicals.historicalVolatilityAnnualized;
    const drift = Math.max(-0.15, Math.min(0.25, activeStock.technicals.cagr3y / 100));

    // Base Case (drift)
    const baseReturnPct = drift * tYears;
    // Bull Case (drift + 1.282 * vol * sqrt(t))
    const bullReturnPct = drift * tYears + 1.282 * vol * Math.sqrt(tYears);
    // Bear Case (drift - 1.282 * vol * sqrt(t))
    const bearReturnPct = drift * tYears - 1.282 * vol * Math.sqrt(tYears);

    const calcOutcome = (returnPct: number) => {
      const targetSharePrice = activeStock.currentPrice * (1 + returnPct);
      const grossExitProceeds = allocation.shares * targetSharePrice;
      const exitCharges = calculateIndianStatutoryCharges(grossExitProceeds, false, 20);
      const netExitCash = grossExitProceeds - exitCharges.totalTaxesAndCharges;
      const netPnlINR = netExitCash - allocation.totalOutlay;
      const netReturnPct = allocation.totalOutlay > 0 ? (netPnlINR / allocation.totalOutlay) * 100 : 0;

      return {
        targetSharePrice,
        grossExitProceeds,
        exitCharges,
        netExitCash,
        netPnlINR,
        netReturnPct
      };
    };

    return {
      bear: calcOutcome(bearReturnPct),
      base: calcOutcome(baseReturnPct),
      bull: calcOutcome(bullReturnPct)
    };
  }, [holdingPeriod, activeStock, allocation]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5 text-indigo-400" /> Hypothetical Investment Planner
          </span>
          <span className="text-xs text-slate-400">Indian Market Statutory Delivery Pricing</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Virtual Budget Allocation & Scenario Outcome Calculator
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Calculates whole-share purchasing limits under Indian cash-delivery trading rules, itemizes real exchange taxes (STT, Stamp Duty, GST), and determines exact round-trip break-even levels.
        </p>
      </div>

      {/* Input Controls Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Budget Input */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Simulated Budget ({currencySymbol}):
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">
              {currencySymbol}
            </span>
            <input
              type="number"
              min={1000}
              step={5000}
              value={budgetInput}
              onChange={e => setBudgetInput(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 mt-2">
            {[10000, 25000, 50000, 100000, 250000].map(amt => (
              <button
                key={amt}
                onClick={() => setBudgetInput(amt)}
                className={`text-[10px] font-mono px-2 py-1 rounded transition ${
                  budgetInput === amt
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ₹{(amt / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        {/* Stock Selection */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Target Equity Instrument:
          </label>
          <select
            value={selectedSymbol}
            onChange={e => {
              const sym = e.target.value;
              setSelectedSymbol(sym);
              const s = stocks.find(stk => stk.symbol === sym);
              if (s) onSelectStock(s);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-white focus:outline-none focus:border-indigo-500"
          >
            {stocks.map(s => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} • {currencySymbol}{s.currentPrice.toFixed(2)} ({s.name})
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Reference Price: {currencySymbol}{activeStock.currentPrice.toFixed(2)} per share
          </span>
        </div>

        {/* Holding Period */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Hypothetical Holding Period:
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['1M', '3M', '6M', '1Y'] as const).map(p => (
              <button
                key={p}
                onClick={() => setHoldingPeriod(p)}
                className={`py-2 rounded-xl text-xs font-bold transition font-mono ${
                  holdingPeriod === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Evaluates statistical drift and volatility over {holdingPeriod === '1M' ? '1 Month' : holdingPeriod === '3M' ? '3 Months' : holdingPeriod === '6M' ? '6 Months' : '1 Year'}
          </span>
        </div>
      </div>

      {/* Allocation & Transaction Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Whole Share Allocation Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Whole-Share Purchase Allocation
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-indigo-400 px-2 py-0.5 rounded">
              NSE Cash Delivery
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-sans">Whole Shares Quantities</span>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {allocation.shares} <span className="text-xs font-normal text-slate-400">shares</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Fractional shares not permitted</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-sans">Gross Equity Cost</span>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {currencySymbol}{allocation.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{allocation.shares} × {currencySymbol}{activeStock.currentPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Breakdown Lines */}
          <div className="space-y-2 text-xs font-mono pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-slate-300">
              <span>Indian Statutory Taxes &amp; Brokerage:</span>
              <span className="font-bold text-amber-400">+{currencySymbol}{allocation.charges.totalTaxesAndCharges.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Total Outlay Required:</span>
              <span className="font-bold text-white">{currencySymbol}{allocation.totalOutlay.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Unallocated Cash Remaining:</span>
              <span className="font-bold text-emerald-400">{currencySymbol}{allocation.unallocatedCash.toFixed(2)}</span>
            </div>
          </div>

          {/* Break-even Indicator */}
          <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xl text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-300 font-semibold">Round-Trip Break-Even Target:</span>
              <span className="font-mono font-bold text-white text-sm">
                {currencySymbol}{breakEvenPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Asset must appreciate by +{(((breakEvenPrice - activeStock.currentPrice) / activeStock.currentPrice) * 100).toFixed(2)}% to absorb both buy-side and sell-side statutory taxes.
            </p>
          </div>
        </div>

        {/* Indian Statutory Charges Itemization */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Indian Statutory Cost Schedule (Buy Side)
            </span>
            <button
              onClick={() => setShowTaxFormulas(!showTaxFormulas)}
              className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-sans"
            >
              <Info className="w-3.5 h-3.5" />
              {showTaxFormulas ? 'Hide Formulas' : 'View Formulas'}
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono divide-y divide-slate-800/60">
            <div className="flex items-center justify-between pt-1.5 text-slate-300">
              <div>
                <span>Securities Transaction Tax (STT):</span>
                {showTaxFormulas && <span className="text-[10px] text-slate-500 block font-sans">0.1% on delivery turnover</span>}
              </div>
              <span className="font-bold text-white">{currencySymbol}{allocation.charges.stt.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between pt-1.5 text-slate-300">
              <div>
                <span>Exchange Transaction Charges:</span>
                {showTaxFormulas && <span className="text-[10px] text-slate-500 block font-sans">0.00325% (NSE Cash)</span>}
              </div>
              <span className="font-bold text-white">{currencySymbol}{allocation.charges.exchangeCharges.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between pt-1.5 text-slate-300">
              <div>
                <span>Stamp Duty:</span>
                {showTaxFormulas && <span className="text-[10px] text-slate-500 block font-sans">0.015% on BUY delivery</span>}
              </div>
              <span className="font-bold text-white">{currencySymbol}{allocation.charges.stampDuty.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between pt-1.5 text-slate-300">
              <div>
                <span>Simulated Brokerage:</span>
                {showTaxFormulas && <span className="text-[10px] text-slate-500 block font-sans">Flat simulated ₹20 fee</span>}
              </div>
              <span className="font-bold text-white">{currencySymbol}{allocation.charges.brokerage.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between pt-1.5 text-slate-300">
              <div>
                <span>Goods &amp; Services Tax (GST):</span>
                {showTaxFormulas && <span className="text-[10px] text-slate-500 block font-sans">18% on Brokerage + Txn + SEBI</span>}
              </div>
              <span className="font-bold text-white">{currencySymbol}{allocation.charges.gst.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between pt-2 text-amber-300 font-bold border-t border-slate-700">
              <span>Total Buy-Side Charges:</span>
              <span>{currencySymbol}{allocation.charges.totalTaxesAndCharges.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Outcomes (Bear, Base, Bull) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Hypothetical Net Outcome by Horizon ({holdingPeriod})
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Net of both buy and sell statutory fees
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bear Outcome */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <TrendingDown className="w-4 h-4" /> Bear Outcome (-10th Percentile)
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {currencySymbol}{scenarios.bear.netExitCash.toFixed(2)}
            </div>
            <div className="text-xs font-bold font-mono text-rose-400 mt-1">
              Net P&amp;L: {currencySymbol}{scenarios.bear.netPnlINR.toFixed(2)} ({scenarios.bear.netReturnPct.toFixed(1)}%)
            </div>
            <div className="mt-3 text-[11px] text-slate-400 pt-3 border-t border-rose-500/20 font-mono">
              Exit Price: {currencySymbol}{scenarios.bear.targetSharePrice.toFixed(2)}
            </div>
          </div>

          {/* Base Outcome */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-4 h-4" /> Base-Case Outcome (Median)
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {currencySymbol}{scenarios.base.netExitCash.toFixed(2)}
            </div>
            <div className={`text-xs font-bold font-mono mt-1 ${scenarios.base.netPnlINR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              Net P&amp;L: {currencySymbol}{scenarios.base.netPnlINR.toFixed(2)} ({scenarios.base.netReturnPct >= 0 ? '+' : ''}{scenarios.base.netReturnPct.toFixed(1)}%)
            </div>
            <div className="mt-3 text-[11px] text-slate-400 pt-3 border-t border-slate-800 font-mono">
              Exit Price: {currencySymbol}{scenarios.base.targetSharePrice.toFixed(2)}
            </div>
          </div>

          {/* Bull Outcome */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4" /> Bullish Outcome (+90th Percentile)
            </span>
            <div className="text-xl font-bold font-mono text-white">
              {currencySymbol}{scenarios.bull.netExitCash.toFixed(2)}
            </div>
            <div className="text-xs font-bold font-mono text-emerald-400 mt-1">
              Net P&amp;L: +{currencySymbol}{scenarios.bull.netPnlINR.toFixed(2)} (+{scenarios.bull.netReturnPct.toFixed(1)}%)
            </div>
            <div className="mt-3 text-[11px] text-slate-400 pt-3 border-t border-emerald-500/20 font-mono">
              Exit Price: {currencySymbol}{scenarios.bull.targetSharePrice.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Downside & Single-Stock Concentration Caution */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-200">Portfolio Concentration Risk Warning:</span>
          <p className="leading-relaxed">
            Allocating 100% of your simulated budget into a single equity ({activeStock.symbol}) exposes the position to severe idiosyncratic company risk. If the business experiences an adverse regulatory event, accounting restatement, or cyclical earnings contraction, maximum historical drawdowns can exceed {(activeStock.technicals.maxDrawdown52w * 100).toFixed(1)}%. Real-world portfolios benefit significantly from diversified sector allocation.
          </p>
        </div>
      </div>
    </div>
  );
};
