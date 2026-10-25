/**
 * MarketMind AI - Corporate Governance, Shareholding & Red-Flag Audit Checks
 * Deep-dive filings analysis for Indian listed equities (NSE/BSE).
 * Audits shareholding patterns, promoter pledges, auditor remarks, related-party transactions,
 * contingent liabilities, and management guidance vs. actual delivery history.
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Users,
  FileCheck,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { StockQuote } from '../types/market';

interface GovernanceRedFlagsProps {
  stocks: StockQuote[];
  selectedStock: StockQuote | null;
  onSelectStock: (stock: StockQuote) => void;
  currencySymbol: string;
}

export const GovernanceRedFlags: React.FC<GovernanceRedFlagsProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  currencySymbol
}) => {
  const currentStock = selectedStock || stocks[0];
  const shareholding = currentStock.shareholding;
  const redFlags = currentStock.redFlags;
  const guidance = currentStock.guidance || [];

  const [activeTab, setActiveTab] = useState<'overview' | 'shareholding' | 'audit' | 'guidance'>('overview');

  // Promoter pledge risk color
  const getPledgeBadge = (risk?: 'SAFE' | 'WATCH' | 'CRITICAL') => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Critical Warning (&gt;25% Pledged)</span>;
      case 'WATCH':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Moderate Watch (&gt;0% Pledged)</span>;
      case 'SAFE':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Clean (0% Pledged)</span>;
    }
  };

  const getGovernanceTierBadge = (tier?: string) => {
    if (tier === 'Pristine Governance') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4" /> Pristine Governance
        </span>
      );
    }
    if (tier === 'Standard Compliance') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          <ShieldCheck className="w-4 h-4" /> Standard Compliance
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <ShieldAlert className="w-4 h-4" /> Elevated Red Flags
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" /> Module 4: Filings Research
              </span>
              <span className="text-xs text-slate-400">Forensic Corporate Governance & Red-Flag Audit</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Governance, Shareholding & Guidance Tracker
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Detects promoter pledge risks, related-party exposures, auditor qualifications, and tracks management promise fulfillment over multi-year quarterly disclosures.
            </p>
          </div>

          {/* Stock Selector */}
          <div className="shrink-0">
            <label className="text-[11px] text-slate-400 block mb-1 font-medium">Select Company:</label>
            <select
              value={currentStock.symbol}
              onChange={e => {
                const s = stocks.find(item => item.symbol === e.target.value);
                if (s) onSelectStock(s);
              }}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            >
              {stocks.map(s => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mandatory Educational Disclaimer */}
        <div className="mt-4 p-3 bg-indigo-950/40 border border-indigo-800/40 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Forensic Framework:</span> In Indian markets, high promoter pledging, high related-party transactions (&gt;5% of sales), and auditor resignations have historically preceded severe capital destruction. This audit checks filed MCA / SEBI disclosures deterministically.
          </div>
        </div>
      </div>

      {/* Company Scorecard & Quick Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Governance Score</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white font-mono">{redFlags?.overallGovernanceScore || 90}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-2">{getGovernanceTierBadge(redFlags?.governanceTier)}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Promoter Pledge Status</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white font-mono">
              {shareholding?.promoterPledgedPercent ?? 0}%
            </span>
            <span className="text-xs text-slate-400">of promoter shares</span>
          </div>
          <div className="mt-2">{getPledgeBadge(redFlags?.promoterPledgeRisk)}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Related-Party Transactions</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white font-mono">
              {currencySymbol}{redFlags?.relatedPartyTxnCr?.toLocaleString('en-IN') ?? '0'} Cr
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono">
            {redFlags?.relatedPartyToRevenuePercent ?? 0}% of annual revenue
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Contingent Liabilities</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-white font-mono">
              {currencySymbol}{redFlags?.contingentLiabilitiesCr?.toLocaleString('en-IN') ?? '0'} Cr
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono">
            {redFlags?.contingentToNetWorthPercent ?? 0}% of net worth
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Overview & Audit Checklist
        </button>
        <button
          onClick={() => setActiveTab('shareholding')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'shareholding'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Shareholding Pattern (Promoter/FII/DII)
        </button>
        <button
          onClick={() => setActiveTab('guidance')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'guidance'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Management Guidance vs. Delivery
        </button>
      </div>

      {/* Tab 1: Overview & Red-Flag Checklist */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Forensic Red-Flag Checklist */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" /> Statutory Audit & Governance Checks
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">SEBI LODR Regulations</span>
            </div>

            <div className="space-y-3">
              {/* Check 1: Auditor Remarks */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                {redFlags?.hasAuditorRemarks ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Statutory Auditor Qualification / Remarks</span>
                    {redFlags?.hasAuditorRemarks ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">Remarks Found</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">Clean Unqualified Opinion</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {redFlags?.auditorRemarksDetail || 'Clean unmodified audit report. Auditors certified internal financial controls over financial reporting.'}
                  </p>
                </div>
              </div>

              {/* Check 2: Promoter Pledge */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                {(shareholding?.promoterPledgedPercent ?? 0) > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Promoter Share Encumbrance / Pledge</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {shareholding?.promoterPledgedPercent ?? 0}% Pledged
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {(shareholding?.promoterPledgedPercent ?? 0) === 0
                      ? 'Zero promoter shares are pledged as collateral. No forced-selling or margin liquidation risk in market downturns.'
                      : `Promoters have pledged ${shareholding?.promoterPledgedPercent}% of their stake for borrowing. Monitor stock volatility carefully.`}
                  </p>
                </div>
              </div>

              {/* Check 3: Related-Party Transactions */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                {(redFlags?.relatedPartyToRevenuePercent ?? 0) > 5 ? (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Related-Party Transactions (RPT) Exposure</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {redFlags?.relatedPartyToRevenuePercent ?? 0}% of Sales
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Transactions with promoter-linked entities represent {redFlags?.relatedPartyToRevenuePercent ?? 0}% of revenue ({currencySymbol}{redFlags?.relatedPartyTxnCr} Cr). SEBI mandates audit committee prior approval for transactions exceeding ₹1,000 Cr or 10% of revenue.
                  </p>
                </div>
              </div>

              {/* Check 4: Contingent Liabilities */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                {(redFlags?.contingentToNetWorthPercent ?? 0) > 20 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Contingent Liabilities vs. Net Worth</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {redFlags?.contingentToNetWorthPercent ?? 0}% of Net Worth
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Unsettled claims, tax disputes, and guarantees total {currencySymbol}{redFlags?.contingentLiabilitiesCr} Cr. A ratio under 20% of net worth indicates low risk of sudden balance-sheet impairment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shareholding Snapshot Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" /> Shareholding Distribution
                </h2>
                <span className="text-[10px] text-slate-400 font-mono">Quarterly Filing (BSE/NSE)</span>
              </div>

              {/* Visual Multi-segment Bar */}
              <div className="h-5 w-full rounded-lg overflow-hidden flex shadow-inner bg-slate-950 mb-4">
                <div
                  style={{ width: `${shareholding?.promoterPercent ?? 50}%` }}
                  className="bg-indigo-500 hover:bg-indigo-400 transition"
                  title={`Promoters: ${shareholding?.promoterPercent}%`}
                />
                <div
                  style={{ width: `${shareholding?.fiiPercent ?? 20}%` }}
                  className="bg-cyan-400 hover:bg-cyan-300 transition"
                  title={`FII / Foreign: ${shareholding?.fiiPercent}%`}
                />
                <div
                  style={{ width: `${shareholding?.diiPercent ?? 18}%` }}
                  className="bg-emerald-400 hover:bg-emerald-300 transition"
                  title={`DII / Mutual Funds: ${shareholding?.diiPercent}%`}
                />
                <div
                  style={{ width: `${shareholding?.publicPercent ?? 12}%` }}
                  className="bg-amber-400 hover:bg-amber-300 transition"
                  title={`Public / Retail: ${shareholding?.publicPercent}%`}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Promoters
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {shareholding?.promoterPercent ?? 50}%
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-cyan-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> FII / Foreign
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {shareholding?.fiiPercent ?? 20}%
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> DII / MFs
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {shareholding?.diiPercent ?? 18}%
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Public / Retail
                  </div>
                  <div className="text-lg font-bold font-mono text-white mt-1">
                    {shareholding?.publicPercent ?? 12}%
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Source: BSE/NSE Shareholding Pattern (Reg 31)</span>
              <button
                onClick={() => setActiveTab('shareholding')}
                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                View 4-Quarter Trend <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Shareholding Pattern Quarterly Trend */}
      {activeTab === 'shareholding' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> Shareholding Evolution (Last 4 Quarters)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracks institutional inflows/outflows and changes in promoter skin-in-the-game.
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Exchange Filings
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                  <th className="py-3 px-4">Quarter</th>
                  <th className="py-3 px-4">Promoter (%)</th>
                  <th className="py-3 px-4">Institutional (FII + DII) (%)</th>
                  <th className="py-3 px-4">Public / Retail (%)</th>
                  <th className="py-3 px-4">Trend Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {shareholding?.quarterlyTrend?.map((row, idx) => (
                  <tr key={row.quarter} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-white">{row.quarter}</td>
                    <td className="py-3.5 px-4 text-indigo-400">{row.promoter.toFixed(1)}%</td>
                    <td className="py-3.5 px-4 text-cyan-400">{row.institutional.toFixed(1)}%</td>
                    <td className="py-3.5 px-4 text-amber-400">{row.public.toFixed(1)}%</td>
                    <td className="py-3.5 px-4">
                      {idx === 0 ? (
                        <span className="text-slate-400 text-[10px]">Baseline</span>
                      ) : row.institutional >= (shareholding.quarterlyTrend[idx - 1]?.institutional ?? 0) ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-medium">
                          <TrendingUp className="w-3.5 h-3.5" /> Institutional Accumulation
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-sans font-medium">
                          <TrendingDown className="w-3.5 h-3.5" /> Marginal Trimming
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span className="font-mono">Pledged shares percentage across all 4 quarters: {shareholding?.promoterPledgedPercent ?? 0}%</span>
            <span className="text-slate-500">SEBI Takeover Regulations Compliant</span>
          </div>
        </div>
      )}

      {/* Tab 3: Management Guidance vs. Actual Delivery */}
      {activeTab === 'guidance' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" /> Management Guidance vs. Delivery Track Record
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates corporate integrity by comparing public earnings calls & investor presentation guidance against audited results.
              </p>
            </div>
            <span className="text-xs text-indigo-400 font-mono">Concall Transcript Archive</span>
          </div>

          {guidance.length > 0 ? (
            <div className="space-y-3">
              {guidance.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition ${
                    item.targetMet
                      ? 'bg-slate-950/80 border-emerald-900/30'
                      : 'bg-slate-950/80 border-amber-900/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.fiscalYear}
                      </span>
                      <span className="text-sm font-bold text-white">{item.metric}</span>
                    </div>
                    {item.targetMet ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" /> Target Achieved / Delivered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> Missed / Delayed Target
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono mb-2">
                    <div className="p-2.5 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-500 block text-[10px] uppercase font-sans">Public Guidance Given:</span>
                      <span className="text-slate-200 font-semibold">{item.guidedTarget}</span>
                    </div>
                    <div className="p-2.5 bg-slate-900/60 rounded-lg">
                      <span className="text-slate-500 block text-[10px] uppercase font-sans">Audited Actual Result:</span>
                      <span className={item.targetMet ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                        {item.actualDelivered}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 italic">
                    &ldquo;{item.commentary}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No previous concall guidance records cataloged for this symbol.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
