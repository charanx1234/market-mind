/**
 * MarketMind AI - Stock Detail & Comprehensive Audited Financials Modal
 * Detailed inspection view with interactive chart, technical metrics,
 * 5-year audited financial statement trends, and direct workspace routing.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  Brain,
  Calculator,
  Wallet,
  Calendar,
  Layers,
  ShieldAlert,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { StockQuote, OHLCV } from '../types/market';
import { StockChart } from './StockChart';

interface StockDetailModalProps {
  stock: StockQuote | null;
  onClose: () => void;
  onNavigateToTab: (tab: any) => void;
  currencySymbol: string;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  onClose,
  onNavigateToTab,
  currencySymbol,
}) => {
  const [history, setHistory] = useState<OHLCV[]>([]);
  const [activeTab, setActiveTab] = useState<'chart' | 'financials' | 'ratios'>('chart');

  useEffect(() => {
    if (stock) {
      fetch(`/api/market/history/${stock.symbol}`)
        .then(res => res.json())
        .then(json => {
          if (json.success) setHistory(json.data);
        })
        .catch(() => {});
    }
  }, [stock]);

  if (!stock) return null;

  const isUp = stock.dayChange >= 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#12151f] border border-[#202433] rounded-md w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#1c212f] flex items-start justify-between gap-4 bg-[#0e111a]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono font-bold text-lg text-[#e6e8ee]">{stock.symbol}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#161a26] text-[#787b86] font-mono border border-[#222738]">
                {stock.exchange}
              </span>
              <span className="text-xs text-[#787b86] font-medium">
                {stock.sector}
              </span>
            </div>
            <h2 className="text-xs font-semibold text-[#a0a5b5]">{stock.name}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right font-mono">
              <div className="text-xl font-extrabold text-[#e6e8ee]">
                {currencySymbol}{stock.currentPrice.toFixed(2)}
              </div>
              <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${isUp ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isUp ? '+' : ''}{stock.dayChange.toFixed(2)} ({isUp ? '+' : ''}{stock.dayChangePercent.toFixed(2)}%)
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded text-[#787b86] hover:text-[#e6e8ee] hover:bg-[#181d2a] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs Bar */}
        <div className="px-4 pt-2 border-b border-[#1c212f] flex items-center gap-3 text-xs font-mono">
          <button
            onClick={() => setActiveTab('chart')}
            className={`pb-2 transition border-b-2 ${
              activeTab === 'chart'
                ? 'border-[#3b82f6] text-[#e6e8ee] font-bold'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            Interactive Chart &amp; Technicals
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`pb-2 transition border-b-2 ${
              activeTab === 'financials'
                ? 'border-[#3b82f6] text-[#e6e8ee] font-bold'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            5-Year Audited Statements
          </button>
          <button
            onClick={() => setActiveTab('ratios')}
            className={`pb-2 transition border-b-2 ${
              activeTab === 'ratios'
                ? 'border-[#3b82f6] text-[#e6e8ee] font-bold'
                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc]'
            }`}
          >
            Valuation &amp; Risk Ratios
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'chart' && (
            <div className="space-y-4">
              {history.length > 0 ? (
                <StockChart data={history} symbol={stock.symbol} currencySymbol={currencySymbol} />
              ) : (
                <div className="py-20 text-center text-xs text-slate-500">Loading historical prices...</div>
              )}

              {/* Key Technical & 52-Week Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-sans">52-Week High</span>
                  <div className="text-white font-bold text-sm mt-0.5">{currencySymbol}{stock.high52w.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-sans">52-Week Low</span>
                  <div className="text-white font-bold text-sm mt-0.5">{currencySymbol}{stock.low52w.toFixed(2)}</div>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-sans">RSI (14-Day)</span>
                  <div className="text-cyan-400 font-bold text-sm mt-0.5">{stock.technicals.rsi14}</div>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-sans">52W Max Drawdown</span>
                  <div className="text-rose-400 font-bold text-sm mt-0.5">{(stock.technicals.maxDrawdown52w * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Audited Income Statement &amp; Cash Flow Trends (Figures in ₹ Crores):
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="text-left pb-2">Line Item (₹ Cr)</th>
                      {stock.financialHistory.map(f => (
                        <th key={f.year} className="pb-2">{f.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr>
                      <td className="text-left py-2 font-bold text-slate-300 font-sans">Total Revenue</td>
                      {stock.financialHistory.map(f => (
                        <td key={f.year} className="py-2 text-white font-semibold">
                          ₹{f.revenueCr.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="text-left py-2 font-bold text-slate-300 font-sans">Operating EBITDA</td>
                      {stock.financialHistory.map(f => (
                        <td key={f.year} className="py-2 text-emerald-400">
                          ₹{f.ebitdaCr.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="text-left py-2 font-bold text-slate-300 font-sans">Net Profit (PAT)</td>
                      {stock.financialHistory.map(f => (
                        <td key={f.year} className={`py-2 font-bold ${f.netProfitCr >= 0 ? 'text-white' : 'text-rose-400'}`}>
                          ₹{f.netProfitCr.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="text-left py-2 font-bold text-slate-300 font-sans">Free Cash Flow</td>
                      {stock.financialHistory.map(f => (
                        <td key={f.year} className="py-2 text-cyan-400">
                          ₹{f.freeCashFlowCr.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="text-left py-2 font-bold text-slate-300 font-sans">Total Debt</td>
                      {stock.financialHistory.map(f => (
                        <td key={f.year} className="py-2 text-amber-400">
                          ₹{f.totalDebtCr.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="text-left py-2 font-bold text-slate-300 font-sans">Shareholder Equity</td>
                      {stock.financialHistory.map(f => (
                        <td key={f.year} className="py-2 text-slate-300">
                          ₹{f.shareholderEquityCr.toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ratios' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-sans">P/E Multiple</span>
                <div className="text-base font-bold text-white mt-1">{stock.fundamentals.peRatio}x</div>
                <span className="text-[10px] text-slate-500 font-sans">Sector: {stock.fundamentals.sectorPe}x</span>
              </div>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-sans">Price-to-Book (P/B)</span>
                <div className="text-base font-bold text-white mt-1">{stock.fundamentals.pbRatio}x</div>
                <span className="text-[10px] text-slate-500 font-sans">Sector: {stock.fundamentals.sectorPb}x</span>
              </div>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-sans">Return on Equity (ROE)</span>
                <div className="text-base font-bold text-emerald-400 mt-1">{stock.fundamentals.roe}%</div>
                <span className="text-[10px] text-slate-500 font-sans">ROCE: {stock.fundamentals.roce}%</span>
              </div>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-sans">Debt / Equity</span>
                <div className="text-base font-bold text-white mt-1">{stock.fundamentals.debtToEquity}</div>
                <span className="text-[10px] text-slate-500 font-sans">Current Ratio: {stock.fundamentals.currentRatio}</span>
              </div>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-sans">Earnings Per Share (EPS)</span>
                <div className="text-base font-bold text-white mt-1">{currencySymbol}{stock.fundamentals.eps.toFixed(2)}</div>
                <span className="text-[10px] text-slate-500 font-sans">Diluted TTM</span>
              </div>
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-500 uppercase font-sans">Market Beta</span>
                <div className="text-base font-bold text-cyan-400 mt-1">{stock.technicals.beta}</div>
                <span className="text-[10px] text-slate-500 font-sans">vs NIFTY 50 Benchmark</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-3 border-t border-[#1c212f] bg-[#0e111a] flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] text-[#555a6d] font-mono">
            Data Source: {stock.meta.source} • Verified NSE Sandbox
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToTab('stock-research');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2234] hover:bg-[#232c44] text-[#60a5fa] border border-[#2b3754] rounded text-xs font-mono font-semibold transition"
            >
              <Brain className="w-3.5 h-3.5" />
              Full Research Dossier
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigateToTab('paper-trading');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#089981] hover:bg-[#07826d] text-white rounded text-xs font-mono font-semibold transition"
            >
              <Wallet className="w-3.5 h-3.5" />
              Simulate Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
