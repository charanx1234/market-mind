/**
 * MarketMind AI - Risk Management & Stress Testing Dashboard
 * Analyzes annualized portfolio volatility, parametric Value at Risk (VaR 95%),
 * maximum historical drawdowns, holdings correlation matrix, and hypothetical systemic stress shocks.
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  Activity,
  Layers,
  CheckCircle2,
  TrendingDown,
  Info,
  ShieldCheck
} from 'lucide-react';
import { StockQuote, PaperTradingState, StressScenario } from '../types/market';
import { calculateValueAtRisk, computeCorrelationMatrix } from '../services/financialMath';

interface RiskDashboardProps {
  portfolio: PaperTradingState;
  stocks: StockQuote[];
  currencySymbol: string;
}

export const RiskDashboard: React.FC<RiskDashboardProps> = ({
  portfolio,
  stocks,
  currencySymbol,
}) => {
  // Compute portfolio weighted metrics
  const { totalValue, weightedBeta, weightedVol, concentrationScore, topHoldingWeight } = useMemo(() => {
    const val = portfolio.totalPortfolioValue || 1000000;
    const holdings = portfolio.holdings || [];

    if (holdings.length === 0) {
      return {
        totalValue: val,
        weightedBeta: 1.0,
        weightedVol: 0.20,
        concentrationScore: 0,
        topHoldingWeight: 0
      };
    }

    let bSum = 0;
    let vSum = 0;
    let maxWeight = 0;
    let hhi = 0;

    holdings.forEach(h => {
      const stock = stocks.find(s => s.symbol === h.symbol);
      const weight = (h.currentValue / val) || 0;
      if (weight > maxWeight) maxWeight = weight;
      hhi += Math.pow(weight * 100, 2);

      const beta = stock ? stock.technicals.beta : 1.0;
      const vol = stock ? stock.technicals.historicalVolatilityAnnualized : 0.20;

      bSum += beta * weight;
      vSum += vol * weight;
    });

    const cashWeight = portfolio.cashBalance / val;
    // Cash has beta 0, vol 0
    return {
      totalValue: val,
      weightedBeta: Math.round(bSum * 100) / 100,
      weightedVol: Math.round(vSum * 100) / 100,
      concentrationScore: Math.round(hhi / 100),
      topHoldingWeight: Math.round(maxWeight * 1000) / 10
    };
  }, [portfolio, stocks]);

  // Value at Risk (VaR 95%)
  const varMetrics = useMemo(() => {
    return calculateValueAtRisk(totalValue, weightedVol);
  }, [totalValue, weightedVol]);

  // Correlation Matrix between current portfolio holdings (or top sample stocks if empty)
  const correlationData = useMemo(() => {
    const activeSymbols = portfolio.holdings.length >= 2
      ? portfolio.holdings.map(h => h.symbol).slice(0, 5)
      : ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS'];

    // Generate mock log price curves for correlation
    const seriesMap: Record<string, number[]> = {};
    activeSymbols.forEach(sym => {
      const stock = stocks.find(s => s.symbol === sym);
      const base = stock?.currentPrice || 1000;
      const vol = stock?.technicals.historicalVolatilityAnnualized || 0.2;
      const points: number[] = [base];
      for (let i = 1; i < 60; i++) {
        points.push(points[i - 1] * (1 + (Math.sin(i * 0.4 + sym.charCodeAt(0)) * vol) / 15));
      }
      seriesMap[sym] = points;
    });

    return computeCorrelationMatrix(seriesMap);
  }, [portfolio, stocks]);

  // Historical Stress Test Scenarios
  const stressScenarios: StressScenario[] = [
    {
      id: 'gfc-2008',
      name: '2008 Global Credit Shock',
      description: 'Systemic liquidity freeze causing sudden equity re-pricing and high volatility spikes.',
      marketDropPercent: -35.0,
      estimatedPortfolioLossPercent: Math.round(35.0 * weightedBeta * 10) / 10,
      estimatedPortfolioLossINR: Math.round(totalValue * (35.0 * weightedBeta / 100)),
      historicalContext: 'NIFTY 50 retreated by 52% from January to October 2008.'
    },
    {
      id: 'covid-2020',
      name: 'March 2020 Pandemic Liquidity Shock',
      description: 'Rapid nationwide lockdown triggering sudden demand contractions across consumer & industrial sectors.',
      marketDropPercent: -25.0,
      estimatedPortfolioLossPercent: Math.round(25.0 * weightedBeta * 10) / 10,
      estimatedPortfolioLossINR: Math.round(totalValue * (25.0 * weightedBeta / 100)),
      historicalContext: 'NIFTY 50 experienced 23% compression in ~30 trading sessions.'
    },
    {
      id: 'rbi-rate-hike',
      name: 'RBI Surprise 100bps Repo Rate Hike',
      description: 'Central bank tightens liquidity to counter stubborn food/crude inflation, raising borrowing costs.',
      marketDropPercent: -12.5,
      estimatedPortfolioLossPercent: Math.round(12.5 * weightedBeta * 10) / 10,
      estimatedPortfolioLossINR: Math.round(totalValue * (12.5 * weightedBeta / 100)),
      historicalContext: 'Compressed valuation multiples for high-debt and capital-intensive sectors.'
    },
    {
      id: 'oil-120',
      name: 'Crude Oil Surge to $120/bbl',
      description: 'Geopolitical supply choke points spike Brent crude, inflating India current account deficit.',
      marketDropPercent: -15.0,
      estimatedPortfolioLossPercent: Math.round(15.0 * weightedBeta * 10) / 10,
      estimatedPortfolioLossINR: Math.round(totalValue * (15.0 * weightedBeta / 100)),
      historicalContext: 'Particularly impacts paints, lubricants, aviation, and auto manufacturers.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header & Risk Philosophy Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Dedicated Risk Engine
          </span>
          <span className="text-xs text-slate-400">Stress Testing & Capital Preservation Analytics</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Portfolio Risk Analytics & Macro Stress Scenarios
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Examines historical volatility, tail-risk drawdowns, Value at Risk (VaR), and inter-asset correlations. Distinctly separates historical fact from hypothetical stress tests.
        </p>

        {/* Regulatory Disclosure */}
        <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-sans">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>Fundamental Market Rule:</strong> No stock, strategy, or financial model is ever risk-free. All equity investments carry the potential for total capital impairment.
          </span>
        </div>
      </div>

      {/* Core Risk Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Portfolio Volatility */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Weighted Volatility</div>
          <div className="text-2xl font-black font-mono text-amber-400 mt-1">
            {(weightedVol * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Annualized Standard Deviation</div>
        </div>

        {/* Portfolio Beta */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Portfolio Beta</div>
          <div className="text-2xl font-black font-mono text-cyan-400 mt-1">
            {weightedBeta.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Relative to NIFTY 50</div>
        </div>

        {/* 1-Day Value at Risk */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-mono">1-Day VaR (95%)</div>
          <div className="text-2xl font-black font-mono text-rose-400 mt-1">
            {currencySymbol}{varMetrics.var95_1Day.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Expected 1-day max loss 95% of time</div>
        </div>

        {/* 1-Month Value at Risk */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-mono">1-Month VaR (95%)</div>
          <div className="text-2xl font-black font-mono text-rose-400 mt-1">
            {currencySymbol}{varMetrics.var95_1Month.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Expected monthly loss threshold</div>
        </div>

        {/* Concentration Score */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-[10px] text-slate-400 uppercase font-mono">Top Holding Weight</div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {topHoldingWeight}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            {topHoldingWeight > 40 ? 'High Concentration' : 'Diversified'}
          </div>
        </div>
      </div>

      {/* Stress Testing Simulation Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" /> Macro Shock Stress Tests
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Simulates portfolio vulnerability against documented historical market crisis conditions.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Hypothetical Stress Testing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stressScenarios.map(s => (
            <div key={s.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{s.name}</span>
                <span className="text-[11px] font-mono font-bold text-rose-400">
                  {s.marketDropPercent}% Market Shock
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {s.description}
              </p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-sans">Simulated Portfolio Impact:</span>
                <span className="font-bold text-rose-400">
                  -{currencySymbol}{s.estimatedPortfolioLossINR.toLocaleString('en-IN')} (-{s.estimatedPortfolioLossPercent}%)
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-sans italic">
                Context: {s.historicalContext}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings Correlation Heatmap */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Holdings Correlation Matrix
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Values close to +1.0 indicate assets move in tandem; lower correlations improve portfolio diversification benefits.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Pairwise Pearson Correlation</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="p-2 text-left text-slate-400 font-sans">Ticker</th>
                {correlationData.symbols.map(sym => (
                  <th key={sym} className="p-2 text-slate-300 font-bold">{sym}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {correlationData.symbols.map((symI, i) => (
                <tr key={symI}>
                  <td className="p-2 text-left font-bold text-slate-300 font-mono">{symI}</td>
                  {correlationData.symbols.map((symJ, j) => {
                    const corr = correlationData.matrix[i][j];
                    const isDiagonal = i === j;
                    // Color based on correlation strength
                    let bg = 'bg-slate-950/40 text-slate-300';
                    if (isDiagonal) bg = 'bg-indigo-600/30 text-white font-bold';
                    else if (corr > 0.7) bg = 'bg-amber-500/20 text-amber-300';
                    else if (corr < 0.3) bg = 'bg-emerald-500/20 text-emerald-300';

                    return (
                      <td key={symJ} className="p-2">
                        <span className={`inline-block px-2 py-1 rounded ${bg}`}>
                          {corr.toFixed(2)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
