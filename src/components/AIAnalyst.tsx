/**
 * MarketMind AI - AI Analyst Workspace (Powered by Gemini 3.8 Flash)
 * Complete 12-section institutional research report built on top of deterministic
 * financial calculations, audited statement trends, and transparent scenario bounds.
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { StockQuote, AIAnalystReport } from '../types/market';

interface AIAnalystProps {
  stocks: StockQuote[];
  selectedStock: StockQuote | null;
  onSelectStock: (stock: StockQuote) => void;
  currencySymbol: string;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  currencySymbol,
}) => {
  const [currentSymbol, setCurrentSymbol] = useState<string>(selectedStock?.symbol || 'RELIANCE');
  const [report, setReport] = useState<AIAnalystReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportSource, setReportSource] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync with selectedStock prop if changed externally
  useEffect(() => {
    if (selectedStock && selectedStock.symbol !== currentSymbol) {
      setCurrentSymbol(selectedStock.symbol);
    }
  }, [selectedStock]);

  // Fetch report whenever currentSymbol changes
  useEffect(() => {
    fetchReport(currentSymbol);
  }, [currentSymbol]);

  const fetchReport = async (sym: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-analyst/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: sym }),
      });
      const json = await res.json();
      if (json.success) {
        setReport(json.data);
        setReportSource(json.source || 'gemini-3.8-flash');
      } else {
        setError(json.error || 'Failed to generate report');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching analyst report');
    } finally {
      setIsLoading(false);
    }
  };

  const activeStock = stocks.find(s => s.symbol === currentSymbol) || stocks[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Stock Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Brain className="w-3.5 h-3.5 text-indigo-400" /> AI Analyst Workspace
            </span>
            <span className="text-xs text-slate-400">12-Section Institutional Due Diligence Report</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Comprehensive Corporate Research & Scenario Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic financial metrics calculated first; AI reasons over facts, communicates uncertainty, and explains trade-offs.
          </p>
        </div>

        {/* Stock Selector Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Target Company:</label>
            <select
              value={currentSymbol}
              onChange={e => {
                const sym = e.target.value;
                setCurrentSymbol(sym);
                const s = stocks.find(stk => stk.symbol === sym);
                if (s) onSelectStock(s);
              }}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              {stocks.map(s => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchReport(currentSymbol)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-indigo-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Model Grounding & Provenance Notice */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
          <span>Engine: <strong className="text-white font-mono">{reportSource === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Deterministic Institutional Engine'}</strong></span>
          <span className="text-slate-500">•</span>
          <span>Data Grounding: <strong className="text-slate-200">Audited Financials + Historical Price Series</strong></span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>Target: {activeStock?.exchange}:{activeStock?.symbol}</span>
          <span>•</span>
          <span>Ref Price: {currencySymbol}{activeStock?.currentPrice.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Deterministic Financial Anchor Cards */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-mono">P/E vs Sector</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {report.deterministicMetrics.peRatio}x
            </div>
            <div className="text-[10px] text-slate-400">Sector: {activeStock.fundamentals.sectorPe}x</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Return on Equity</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">
              {report.deterministicMetrics.roe}%
            </div>
            <div className="text-[10px] text-slate-400">ROCE: {report.deterministicMetrics.roce}%</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Debt / Equity</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {report.deterministicMetrics.debtToEquity}
            </div>
            <div className="text-[10px] text-slate-400">
              {report.deterministicMetrics.debtToEquity < 0.5 ? 'Conservative' : 'Leveraged'}
            </div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Historical Volatility</div>
            <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
              {(report.deterministicMetrics.annualizedVolatility * 100).toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400">Annualized 252d</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Market Beta</div>
            <div className="text-base font-bold font-mono text-cyan-400 mt-0.5">
              {report.deterministicMetrics.beta}
            </div>
            <div className="text-[10px] text-slate-400">vs NIFTY 50</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-mono">3Y Price CAGR</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              +{report.deterministicMetrics.cagr3y}%
            </div>
            <div className="text-[10px] text-slate-400">Compounded Growth</div>
          </div>
        </div>
      )}

      {/* Complete 12-Section Institutional Report Body */}
      {report && (
        <div className="space-y-6">
          {/* Section 1 & 2: Overview & Latest Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" /> 1. Company Overview & Business Model
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {report.section1_Overview}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" /> 2. Latest Financial Performance
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {report.section2_FinancialPerformance}
              </p>
            </div>
          </div>

          {/* Section 3 & 4: Revenue/Profit/Debt Trends & Valuation Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" /> 3. Revenue, Profit, Debt & Cash Flow Trends
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {report.section3_RevenueProfitDebtCashFlowTrends}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" /> 4. Valuation Metrics & Sector Benchmark
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {report.section4_ValuationWithSectorComparison}
              </p>
            </div>
          </div>

          {/* Section 5 & 6: Historical Price Behavior & Corporate Announcements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" /> 5. Historical Price Performance & Volatility
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {report.section5_HistoricalPriceAndVolatility}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" /> 6. Relevant News & Corporate Announcements
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {report.section6_NewsAndAnnouncements}
              </p>
            </div>
          </div>

          {/* Section 7 & 8: Positive & Negative Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Positive Factors */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> 7. Positive Catalysts & Strengths
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.section7_PositiveFactors?.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Negative Factors */}
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-rose-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" /> 8. Negative Factors & Headwinds
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.section8_NegativeFactors?.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5"></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 9: Key Risks & Potential Warning Signs */}
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" /> 9. Key Risks & Warning Signs
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300">
              {report.section9_KeyRisksAndWarningSigns?.map((r, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-900/60 rounded-lg border border-slate-800">
                  <span className="text-amber-400 font-bold font-mono">0{i + 1}.</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 10: Scenario Corridors (Bull, Base, Bear) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" /> 10. Probabilistic Scenarios (Bull, Base, Bear)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" /> Bullish Scenario (+90th Percentile)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {report.section10_ScenariosBullBaseBear?.bull}
                </p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div className="text-xs font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Base-Case Scenario (Median)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {report.section10_ScenariosBullBaseBear?.base}
                </p>
              </div>

              <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-xl">
                <div className="text-xs font-bold text-rose-400 mb-1 flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" /> Bearish Scenario (-10th Percentile)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {report.section10_ScenariosBullBaseBear?.bear}
                </p>
              </div>
            </div>
          </div>

          {/* Section 11: Forecast Horizon, Assumptions & Uncertainty */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Info className="w-4 h-4" /> 11. Forecast Assumptions, Mathematical Limitations & Uncertainty
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {report.section11_ForecastAssumptionsAndUncertainty}
            </p>
          </div>

          {/* Section 12: Sources with Working Links & Missing Data / Integrity Disclaimers */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <ExternalLink className="w-4 h-4 text-indigo-400" /> 12. Working Reference Sources & Integrity Disclaimers
            </div>

            {/* Working Sources */}
            <div>
              <div className="text-[11px] font-semibold text-slate-300 mb-2">Verified Factual Data Sources:</div>
              <div className="flex flex-wrap gap-2">
                {report.section12_SourcesAndReliabilityDisclaimers?.sources?.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-mono text-indigo-300 hover:text-white hover:border-indigo-500 transition"
                  >
                    <span>{s.name}</span>
                    <span className="text-slate-400 text-[10px]">({s.date})</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* Missing Data Disclosure */}
            {report.section12_SourcesAndReliabilityDisclaimers?.missingDataItems?.length > 0 && (
              <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 text-xs">
                <span className="text-amber-400 font-semibold block mb-1">Missing / Unreported Data Items:</span>
                <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                  {report.section12_SourcesAndReliabilityDisclaimers.missingDataItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strict Regulatory Caution */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-200 font-semibold">Educational Simulation & Testing Sandbox</strong>
                <span>{report.section12_SourcesAndReliabilityDisclaimers?.reliabilityCaution}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
