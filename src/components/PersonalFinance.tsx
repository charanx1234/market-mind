/**
 * MarketMind AI - Personal Finance & Indian Capital Gains Tax Calculator
 * Compliant with Union Budget 2024 Amendments:
 * - STCG Section 111A: 20% on equity held <= 12 months
 * - LTCG Section 112A: 12.5% on equity held > 12 months with ₹1,25,000 annual exemption
 * - 4% Health & Education Cess, 0.1% STT on sale
 * - Systematic Investment Plan (SIP) compounding & inflation-adjusted real purchasing power planner
 */

import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Receipt,
  TrendingUp,
  Coins,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  PiggyBank,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { StockQuote } from '../types/market';
import { calculateIndianCapitalGainsTax } from '../services/financialMath';

interface PersonalFinanceProps {
  stocks: StockQuote[];
  currencySymbol: string;
}

export const PersonalFinance: React.FC<PersonalFinanceProps> = ({
  stocks,
  currencySymbol
}) => {
  const [activeTab, setActiveTab] = useState<'tax' | 'sip'>('tax');

  // Tax Calculator Inputs
  const [buyPrice, setBuyPrice] = useState<number>(1000);
  const [sellPrice, setSellPrice] = useState<number>(1450);
  const [quantity, setQuantity] = useState<number>(100);
  const [holdingDays, setHoldingDays] = useState<number>(400); // Default > 365 => LTCG
  const [otherRealizedLtcg, setOtherRealizedLtcg] = useState<number>(0);

  // Quick preset loader
  const handleSelectPresetStock = (symbol: string) => {
    const s = stocks.find(item => item.symbol === symbol);
    if (s) {
      setSellPrice(Math.round(s.currentPrice));
      setBuyPrice(Math.round(s.currentPrice * 0.75));
    }
  };

  // Compute Indian Capital Gains Tax using the validated mathematical service
  const taxResult = useMemo(() => {
    return calculateIndianCapitalGainsTax(buyPrice, sellPrice, quantity, holdingDays, otherRealizedLtcg);
  }, [buyPrice, sellPrice, quantity, holdingDays, otherRealizedLtcg]);

  // SIP Planner Inputs
  const [monthlySip, setMonthlySip] = useState<number>(15000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12); // 12% Nifty historical CAGR
  const [sipYears, setSipYears] = useState<number>(15);
  const [stepUpPercent, setStepUpPercent] = useState<number>(10); // 10% annual step-up
  const [inflationRate, setInflationRate] = useState<number>(6); // 6% long-term CPI inflation

  // Multi-year SIP calculation projection
  const sipProjection = useMemo(() => {
    const totalMonths = sipYears * 12;
    const monthlyRate = expectedReturnRate / 100 / 12;
    let accumulatedValue = 0;
    let totalInvested = 0;
    let currentMonthlyContribution = monthlySip;

    const yearlyMilestones: {
      year: number;
      invested: number;
      nominalValue: number;
      realValue: number;
      gains: number;
    }[] = [];

    for (let m = 1; m <= totalMonths; m++) {
      // Step up monthly contribution every 12 months
      if (m > 1 && (m - 1) % 12 === 0 && stepUpPercent > 0) {
        currentMonthlyContribution += Math.round(currentMonthlyContribution * (stepUpPercent / 100));
      }

      totalInvested += currentMonthlyContribution;
      accumulatedValue = (accumulatedValue + currentMonthlyContribution) * (1 + monthlyRate);

      if (m % 12 === 0) {
        const year = m / 12;
        // Inflation discount factor: (1 + inflation)^year
        const inflationFactor = Math.pow(1 + inflationRate / 100, year);
        const realValue = accumulatedValue / inflationFactor;

        yearlyMilestones.push({
          year,
          invested: Math.round(totalInvested),
          nominalValue: Math.round(accumulatedValue),
          realValue: Math.round(realValue),
          gains: Math.round(accumulatedValue - totalInvested)
        });
      }
    }

    const finalMilestone = yearlyMilestones[yearlyMilestones.length - 1] || {
      invested: 0,
      nominalValue: 0,
      realValue: 0,
      gains: 0
    };

    return {
      yearlyMilestones,
      totalInvested: finalMilestone.invested,
      finalNominalValue: finalMilestone.nominalValue,
      finalRealValue: finalMilestone.realValue,
      totalGains: finalMilestone.gains
    };
  }, [monthlySip, expectedReturnRate, sipYears, stepUpPercent, inflationRate]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider flex items-center gap-1">
            <Calculator className="w-3.5 h-3.5 text-indigo-400" /> Module 5: Personal Finance
          </span>
          <span className="text-xs text-slate-400">Tax Optimization & Long-Term Wealth Architecture</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Indian Capital Gains Tax (Budget 2024) & SIP Compounder
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          Model taxes on Indian equity sales with statutory precision under revised Finance Act rules, and simulate real purchasing-power growth factoring in inflation and step-up compounding.
        </p>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'tax'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" /> Capital Gains Tax (STCG 20% / LTCG 12.5%)
          </button>
          <button
            onClick={() => setActiveTab('sip')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'sip'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <PiggyBank className="w-4 h-4" /> SIP Compounding & Real Wealth Planner
          </button>
        </div>
      </div>

      {/* TAB 1: CAPITAL GAINS TAX CALCULATOR */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          {/* Statutory Rule Callout */}
          <div className="p-4 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white">Union Budget 2024 Statutory Guidelines for Listed Indian Equities:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300 font-mono text-[11px]">
                <li><strong>Short-Term Capital Gains (Section 111A):</strong> Taxed at <strong>20.0%</strong> (increased from 15%) for holding period &le; 12 months.</li>
                <li><strong>Long-Term Capital Gains (Section 112A):</strong> Taxed at <strong>12.5%</strong> (increased from 10%) for holding period &gt; 12 months.</li>
                <li><strong>LTCG Exemption Limit:</strong> <strong>₹1,25,000</strong> per financial year (increased from ₹1,00,000).</li>
                <li><strong>Mandatory Cess:</strong> 4% Health & Education Cess applied on gross tax amount.</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Form Column */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-400" /> Trade Inputs
                </h2>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>Preset:</span>
                  <button
                    onClick={() => handleSelectPresetStock('RELIANCE')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 hover:bg-slate-700 font-mono text-[10px]"
                  >
                    RELIANCE
                  </button>
                  <button
                    onClick={() => handleSelectPresetStock('TCS')}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 hover:bg-slate-700 font-mono text-[10px]"
                  >
                    TCS
                  </button>
                </div>
              </div>

              {/* Buy Price */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Buy Price Per Share ({currencySymbol}):</label>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={e => setBuyPrice(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Sell Price */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Sale / Current Price Per Share ({currencySymbol}):</label>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={e => setSellPrice(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs text-slate-400 block mb-1">Quantity (Number of Shares):</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Holding Period */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">Holding Period:</label>
                  <span className="text-xs font-mono text-indigo-400 font-semibold">
                    {holdingDays} Days ({Math.round(holdingDays / 30)} Months)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="1825"
                  value={holdingDays}
                  onChange={e => setHoldingDays(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span className={holdingDays <= 365 ? 'text-amber-400 font-bold' : ''}>&le; 365 Days (STCG 20%)</span>
                  <span className={holdingDays > 365 ? 'text-emerald-400 font-bold' : ''}>&gt; 365 Days (LTCG 12.5%)</span>
                </div>
              </div>

              {/* Other Realized LTCG this fiscal year */}
              {holdingDays > 365 && (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Other LTCG Realized this FY ({currencySymbol}):
                  </label>
                  <input
                    type="number"
                    value={otherRealizedLtcg}
                    onChange={e => setOtherRealizedLtcg(Math.max(0, Number(e.target.value)))}
                    placeholder="Already claimed exemption (Max ₹1.25L)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Remaining exemption: {currencySymbol}{Math.max(0, 125000 - otherRealizedLtcg).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            {/* Results Output Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-400" /> Capital Gains Breakdown
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {taxResult.holdingClassification}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block font-mono">Gross Gain / Profit</span>
                    <span className={`text-lg font-bold font-mono ${taxResult.grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {currencySymbol}{taxResult.grossProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block font-mono">Applicable Tax Rate</span>
                    <span className="text-lg font-bold font-mono text-indigo-400">
                      {taxResult.applicableTaxRatePercent}%
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase text-slate-400 block font-mono">Total Tax + Cess</span>
                    <span className="text-lg font-bold font-mono text-rose-400">
                      {currencySymbol}{taxResult.totalTaxPayable.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Detailed Tax Computation Ledger */}
                <div className="bg-slate-950/80 rounded-xl border border-slate-800 divide-y divide-slate-800/80 text-xs font-mono">
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-400">Total Sale Proceeds ({quantity} shares &times; {currencySymbol}{sellPrice})</span>
                    <span className="text-white font-semibold">{currencySymbol}{taxResult.saleValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-400">Total Purchase Cost ({quantity} shares &times; {currencySymbol}{buyPrice})</span>
                    <span className="text-slate-300">({currencySymbol}{taxResult.purchaseCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })})</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-400">Securities Transaction Tax (STT 0.1% on sale)</span>
                    <span className="text-slate-300">{currencySymbol}{taxResult.sttPaid.toFixed(2)}</span>
                  </div>
                  {taxResult.exemptionClaimed > 0 && (
                    <div className="p-3 flex justify-between items-center bg-emerald-950/20">
                      <span className="text-emerald-400 font-semibold">Section 112A Statutory Exemption Claimed</span>
                      <span className="text-emerald-400 font-bold">- {currencySymbol}{taxResult.exemptionClaimed.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-400">Net Taxable Gain Subject to Tax</span>
                    <span className="text-white font-semibold">{currencySymbol}{taxResult.taxableGain.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-400">Base Capital Gains Tax</span>
                    <span className="text-rose-400">{currencySymbol}{taxResult.taxBeforeCess.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-400">Health & Education Cess (4% on Tax)</span>
                    <span className="text-rose-400">{currencySymbol}{taxResult.cessAmount.toFixed(2)}</span>
                  </div>
                  <div className="p-3 flex justify-between items-center bg-slate-900 font-bold text-sm">
                    <span className="text-white">Net Post-Tax Profit In-Hand</span>
                    <span className="text-emerald-400">
                      {currencySymbol}{taxResult.netPostTaxProfit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-950 rounded-lg text-xs text-slate-400 flex items-center justify-between">
                  <span>Effective Tax Rate on Profit:</span>
                  <span className="font-mono text-white font-bold">{taxResult.effectiveTaxRateOnProfit.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SIP COMPOUNDING & REAL WEALTH PLANNER */}
      {activeTab === 'sip' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controls */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-400" /> SIP Parameters
              </h2>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Starting Monthly Investment ({currencySymbol}):
                </label>
                <input
                  type="number"
                  value={monthlySip}
                  onChange={e => setMonthlySip(Math.max(500, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">Expected Annual CAGR Return:</label>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{expectedReturnRate}%</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="20"
                  step="0.5"
                  value={expectedReturnRate}
                  onChange={e => setExpectedReturnRate(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-[10px] text-slate-500 block">NIFTY 50 20-Year historical CAGR has hovered between 12% to 14%.</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">Investment Horizon:</label>
                  <span className="text-xs font-mono text-indigo-400 font-bold">{sipYears} Years</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="35"
                  value={sipYears}
                  onChange={e => setSipYears(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">Annual Step-Up (% Increase / Year):</label>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{stepUpPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={stepUpPercent}
                  onChange={e => setStepUpPercent(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <span className="text-[10px] text-slate-500 block">Increasing your SIP with annual salary increments supercharges compounding.</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-slate-400">Expected Inflation Rate:</label>
                  <span className="text-xs font-mono text-amber-400 font-bold">{inflationRate}%</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={inflationRate}
                  onChange={e => setInflationRate(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <span className="text-[10px] text-slate-500 block">Discounts future nominal wealth to real present purchasing power.</span>
              </div>
            </div>

            {/* Projections & Milestone Chart */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 block font-mono">Total Invested</span>
                  <span className="text-base font-bold font-mono text-white mt-1 block">
                    {currencySymbol}{Math.round(sipProjection.totalInvested / 100000).toLocaleString('en-IN')} L
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 block font-mono">Estimated Gains</span>
                  <span className="text-base font-bold font-mono text-emerald-400 mt-1 block">
                    {currencySymbol}{Math.round(sipProjection.totalGains / 100000).toLocaleString('en-IN')} L
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 block font-mono">Nominal Maturity</span>
                  <span className="text-base font-bold font-mono text-cyan-400 mt-1 block">
                    {currencySymbol}{Math.round(sipProjection.finalNominalValue / 100000).toLocaleString('en-IN')} L
                  </span>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 block font-mono">Real Value ({inflationRate}%)</span>
                  <span className="text-base font-bold font-mono text-indigo-300 mt-1 block">
                    {currencySymbol}{Math.round(sipProjection.finalRealValue / 100000).toLocaleString('en-IN')} L
                  </span>
                </div>
              </div>

              {/* Compounding Milestones Table */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Compounding Trajectory by Year
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">CAGR {expectedReturnRate}%</span>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                        <th className="py-2.5 px-3">Year</th>
                        <th className="py-2.5 px-3">Total Invested</th>
                        <th className="py-2.5 px-3">Nominal Wealth</th>
                        <th className="py-2.5 px-3">Real Purchasing Power</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {sipProjection.yearlyMilestones.map(m => (
                        <tr key={m.year} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-bold text-white">Year {m.year}</td>
                          <td className="py-2.5 px-3 text-slate-300">{currencySymbol}{m.invested.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 text-cyan-400 font-semibold">{currencySymbol}{m.nominalValue.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-3 text-indigo-300 font-semibold">{currencySymbol}{m.realValue.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-3 bg-slate-950 rounded-lg text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Compound Interest Rule:</span> In the final 5 years of an investment lifecycle, accumulated returns typically generate more wealth annually than the sum of all monthly deposits.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
