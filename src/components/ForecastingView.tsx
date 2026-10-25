/**
 * MarketMind AI - Scenario Forecasting Laboratory
 * Modular deterministic forecasting pipeline with multi-horizon scenario corridors (1M, 3M, 6M, 12M),
 * out-of-sample walk-forward validation (MAPE vs Random Walk Benchmark), and fan-chart visualization.
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldAlert,
  Percent,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { StockQuote, StockForecastResult, OHLCV } from '../types/market';
import { StockChart } from './StockChart';

interface ForecastingViewProps {
  stocks: StockQuote[];
  selectedStock: StockQuote | null;
  onSelectStock: (stock: StockQuote) => void;
  currencySymbol: string;
}

export const ForecastingView: React.FC<ForecastingViewProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  currencySymbol,
}) => {
  const [currentSymbol, setCurrentSymbol] = useState<string>(selectedStock?.symbol || 'RELIANCE');
  const [forecast, setForecast] = useState<StockForecastResult | null>(null);
  const [history, setHistory] = useState<OHLCV[]>([]);
  const [selectedHorizon, setSelectedHorizon] = useState<'1M' | '3M' | '6M' | '12M'>('6M');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedStock && selectedStock.symbol !== currentSymbol) {
      setCurrentSymbol(selectedStock.symbol);
    }
  }, [selectedStock]);

  useEffect(() => {
    fetchForecastData(currentSymbol);
  }, [currentSymbol]);

  const fetchForecastData = async (sym: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [forecastRes, historyRes] = await Promise.all([
        fetch(`/api/forecast/${sym}`),
        fetch(`/api/market/history/${sym}`),
      ]);

      const forecastJson = await forecastRes.json();
      const historyJson = await historyRes.json();

      if (forecastJson.success) {
        setForecast(forecastJson.data);
      } else {
        setError(forecastJson.error || 'Failed to generate forecast');
      }

      if (historyJson.success) {
        setHistory(historyJson.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with forecasting service');
    } finally {
      setIsLoading(false);
    }
  };

  const activeStock = stocks.find(s => s.symbol === currentSymbol) || stocks[0];
  const activeScenario = forecast?.scenarios[selectedHorizon];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Statistical Scenario Lab
            </span>
            <span className="text-xs text-slate-400">Strictly Deterministic • Zero LLM Hallucinations</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Probabilistic Scenario Forecasts & Uncertainty Corridors
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Uses Geometric Brownian Motion, historical volatility, and sector valuation bounds. Compares results against an out-of-sample benchmark.
          </p>
        </div>

        {/* Stock Selector */}
        <div className="flex items-center gap-3">
          <select
            value={currentSymbol}
            onChange={e => {
              const sym = e.target.value;
              setCurrentSymbol(sym);
              const s = stocks.find(stk => stk.symbol === sym);
              if (s) onSelectStock(s);
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-cyan-500 font-mono"
          >
            {stocks.map(s => (
              <option key={s.symbol} value={s.symbol}>
                {s.symbol} - {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchForecastData(currentSymbol)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Computing...' : 'Recalculate'}
          </button>
        </div>
      </div>

      {/* Mandatory Provenance & Cutoff Metadata Bar */}
      {forecast && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Generation: <strong className="text-slate-200">{forecast.generationTimestamp.slice(0, 19).replace('T', ' ')} UTC</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Data Cutoff: <strong className="text-slate-200">{forecast.dataCutoffTimestamp}</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Uncertainty Rating:</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                forecast.uncertaintyRating === 'Low'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : forecast.uncertaintyRating === 'Moderate'
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {forecast.uncertaintyRating} Uncertainty
            </span>
          </div>
        </div>
      )}

      {/* Horizon Selector Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 w-fit">
        {(['1M', '3M', '6M', '12M'] as const).map(h => {
          const isSelected = selectedHorizon === h;
          return (
            <button
              key={h}
              onClick={() => setSelectedHorizon(h)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition font-mono ${
                isSelected
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {h} Horizon ({h === '1M' ? '21 Days' : h === '3M' ? '63 Days' : h === '6M' ? '126 Days' : '252 Days'})
            </button>
          );
        })}
      </div>

      {/* Probabilistic Fan Chart Visualizer */}
      {history.length > 0 && forecast && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Historical Price & Projected Uncertainty Corridor
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Reference Price: {currencySymbol}{forecast.currentReferencePrice.toFixed(2)}
            </span>
          </div>
          <StockChart
            data={history}
            symbol={currentSymbol}
            currencySymbol={currencySymbol}
            forecastCorridor={forecast.fanChartSeries.filter(f => f.baseProjection !== undefined)}
            showForecastOverlay={true}
          />
        </div>
      )}

      {/* Scenario Breakdown Cards (Bear, Base, Bull) */}
      {activeScenario && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bear Case */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" /> Bear Scenario (10th Percentile)
              </span>
              <span className="text-[10px] font-mono text-slate-400">-1.282 &sigma; Shock</span>
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {currencySymbol}{activeScenario.bearPrice.toFixed(2)}
            </div>
            <div className="text-xs font-bold font-mono text-rose-400 mt-1">
              {activeScenario.bearReturnPercent >= 0 ? '+' : ''}{activeScenario.bearReturnPercent.toFixed(1)}% Estimated Return
            </div>
            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-rose-500/20 leading-relaxed font-sans">
              Reflects adverse market conditions, compressed sector valuation multiples, and slowing revenue growth rates.
            </p>
          </div>

          {/* Base Case (Median) */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-3 py-0.5 rounded-bl-xl uppercase font-mono">
              Median Expected
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Base Scenario (50th Percentile)
              </span>
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {currencySymbol}{activeScenario.basePrice.toFixed(2)}
            </div>
            <div className="text-xs font-bold font-mono text-cyan-400 mt-1">
              {activeScenario.baseReturnPercent >= 0 ? '+' : ''}{activeScenario.baseReturnPercent.toFixed(1)}% Estimated Return
            </div>
            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800 leading-relaxed font-sans">
              Continuation of historical return drift anchored by Indian risk-free baseline and steady operating margin realization.
            </p>
          </div>

          {/* Bull Case */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Bull Scenario (90th Percentile)
              </span>
              <span className="text-[10px] font-mono text-slate-400">+1.282 &sigma; Tailwind</span>
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {currencySymbol}{activeScenario.bullPrice.toFixed(2)}
            </div>
            <div className="text-xs font-bold font-mono text-emerald-400 mt-1">
              +{activeScenario.bullReturnPercent.toFixed(1)}% Estimated Return
            </div>
            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-emerald-500/20 leading-relaxed font-sans">
              Expansionary macroeconomic liquidity, strong earnings surprises, and premium valuation multiple re-rating.
            </p>
          </div>
        </div>
      )}

      {/* Out-of-Sample Historical Backtest & Benchmark Evaluation */}
      {forecast && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Out-of-Sample Model Evaluation & Benchmark Comparison
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Evaluation period: {forecast.evaluation.evaluationPeriod} ({forecast.evaluation.outOfSampleDays} unseen trading days)
              </p>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
              No Lookahead Bias
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-sans">Model Out-of-Sample MAPE</div>
              <div className="text-lg font-bold text-white mt-1">{forecast.evaluation.mapePercent}%</div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5">Mean Absolute Percentage Error</div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-sans">Benchmark Persistence MAPE</div>
              <div className="text-lg font-bold text-slate-300 mt-1">{forecast.evaluation.benchmarkMapePercent}%</div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5">Naive Random Walk Persistence</div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-sans">Directional Accuracy</div>
              <div className="text-lg font-bold text-cyan-400 mt-1">{forecast.evaluation.directionalAccuracyPercent}%</div>
              <div className="text-[10px] text-slate-400 font-sans mt-0.5">Up/Down Trajectory Alignment</div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans">
            <span className="font-semibold text-white">Evaluation Conclusion: </span>
            {forecast.evaluation.evaluationConclusion}
          </div>
        </div>
      )}

      {/* Assumptions & Limitations Checklist */}
      {forecast && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="font-bold text-cyan-400 uppercase tracking-wider block mb-2 text-[11px]">
              Forecasting Model Assumptions
            </span>
            <ul className="space-y-1.5 text-slate-300">
              {forecast.assumptions.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5"></span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="font-bold text-amber-400 uppercase tracking-wider block mb-2 text-[11px]">
              Limitations & Structural Uncertainty
            </span>
            <ul className="space-y-1.5 text-slate-300">
              {forecast.limitations.map((l, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                  <span>{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
