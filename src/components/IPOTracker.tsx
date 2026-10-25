/**
 * MarketMind AI - Indian IPO Tracker & DRHP Forensic Analysis
 * Tracks upcoming, active, and listed IPOs on NSE/BSE with subscription numbers,
 * issue sizes, price bands, lot calculations, and DRHP red-flag disclosures.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  Layers
} from 'lucide-react';
import { IPORecord } from '../types/market';
import { INDIAN_IPOS } from '../data/indianMarketData';

interface IPOTrackerProps {
  currencySymbol: string;
}

export const IPOTracker: React.FC<IPOTrackerProps> = ({ currencySymbol }) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'ONGOING' | 'LISTED'>('ALL');
  const [expandedIpoId, setExpandedIpoId] = useState<string | null>('ipo-1');

  const filteredIpos = INDIAN_IPOS.filter(ipo => {
    if (statusFilter === 'ALL') return true;
    return ipo.status === statusFilter;
  });

  const getStatusBadge = (status: IPORecord['status']) => {
    switch (status) {
      case 'ONGOING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Bidding Open
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Calendar className="w-3.5 h-3.5" /> Upcoming Issue
          </span>
        );
      case 'LISTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Listed on Exchange
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Module 5: Primary Markets
              </span>
              <span className="text-xs text-slate-400">NSE / BSE Mainboard Initial Public Offerings</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Indian IPO Tracker & DRHP Red-Flag Radar
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Track subscription status, lot sizes, retail reservations, and forensic risk factors extracted from SEBI Draft Red Herring Prospectus (DRHP) filings.
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['ALL', 'ONGOING', 'UPCOMING', 'LISTED'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  statusFilter === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'ALL' ? 'All Issues' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Regulatory Disclosure regarding GMP */}
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">SEBI Retail Advisory on Grey Market Premium (GMP):</span> GMP estimates are unofficial, speculative indicators reported in unorganized parallel markets and are not recognized or backed by SEBI, NSE, or BSE. Always base investment decisions on business fundamentals, debt obligations, and DRHP risk disclosures.
          </div>
        </div>
      </div>

      {/* IPO List Grid */}
      <div className="space-y-4">
        {filteredIpos.map(ipo => {
          const isExpanded = expandedIpoId === ipo.id;
          return (
            <div
              key={ipo.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition shadow-md hover:border-slate-700"
            >
              {/* Main Summary Header */}
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {getStatusBadge(ipo.status)}
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {ipo.symbol}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">• {ipo.sector}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{ipo.companyName}</h2>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> {ipo.issueDates}
                    </span>
                    <span>Issue: {currencySymbol}{ipo.issueSizeCr.toLocaleString('en-IN')} Cr</span>
                  </div>
                </div>

                {/* Primary Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right font-mono">
                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">Price Band</span>
                    <span className="text-sm font-bold text-white">{ipo.priceBand}</span>
                  </div>

                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">Lot Size / Min App</span>
                    <span className="text-sm font-bold text-indigo-400">{ipo.lotSize} Shares</span>
                  </div>

                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">Subscription</span>
                    <span className="text-sm font-bold text-emerald-400">{ipo.subscriptionTimes.toFixed(2)}x</span>
                  </div>

                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-sans block">
                      {ipo.status === 'LISTED' ? 'Listing Day Gain' : 'Estimated GMP'}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        (ipo.listingGainPercent ?? ipo.gmpEstimatedGainPercent) >= 0
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {(ipo.listingGainPercent ?? ipo.gmpEstimatedGainPercent) >= 0 ? '+' : ''}
                      {(ipo.listingGainPercent ?? ipo.gmpEstimatedGainPercent).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Accordion Toggle */}
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setExpandedIpoId(isExpanded ? null : ipo.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{isExpanded ? 'Hide DRHP Red Flags' : 'DRHP Red Flags'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expandable DRHP Red-Flag Inspection */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Key Risk Factors & Red Flags Extracted from Prospectus (DRHP)
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">SEBI ICDR Regulations</span>
                    </div>

                    <div className="space-y-2">
                      {ipo.drhpRedFlags.map((flag, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/70 text-xs text-slate-300"
                        >
                          <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{flag}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
                      <span>Retail Category Allocation: <strong>{ipo.retailQuota}</strong></span>
                      <span className="italic">Always review the full RHP document on SEBI/NSE portals before bidding.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
