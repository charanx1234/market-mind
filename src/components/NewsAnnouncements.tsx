/**
 * MarketMind AI - Corporate Actions, Exchange Disclosures & News Hub
 * Tracks official corporate announcements, board meetings, dividend notices, and regulatory filings.
 */

import React, { useState } from 'react';
import {
  Newspaper,
  ExternalLink,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock
} from 'lucide-react';
import { NewsAnnouncement, StockQuote } from '../types/market';
import { MOCK_NEWS_ANNOUNCEMENTS } from '../data/indianMarketData';

interface NewsAnnouncementsProps {
  stocks: StockQuote[];
  onSelectStock: (stock: StockQuote) => void;
}

export const NewsAnnouncements: React.FC<NewsAnnouncementsProps> = ({
  stocks,
  onSelectStock,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL');

  const filteredNews = MOCK_NEWS_ANNOUNCEMENTS.filter(item => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (selectedSymbol !== 'ALL' && item.symbol !== selectedSymbol) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Newspaper className="w-3.5 h-3.5 text-indigo-400" /> Corporate Disclosures
            </span>
            <span className="text-xs text-slate-400">NSE &amp; BSE Regulatory Filings Archive</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Exchange Announcements &amp; Material Corporate Actions
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Real-time auditable corporate filings, board meeting results, dividend declarations, and capital allocation notices.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Categories</option>
            <option value="FINANCIAL_RESULTS">Financial Results</option>
            <option value="CORPORATE_ACTION">Corporate Actions</option>
            <option value="REGULATORY_FILING">Regulatory Filings</option>
            <option value="MARKET_NEWS">Macro Market News</option>
          </select>

          <select
            value={selectedSymbol}
            onChange={e => setSelectedSymbol(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Companies</option>
            {stocks.map(s => (
              <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredNews.map(item => {
          const associatedStock = stocks.find(s => s.symbol === item.symbol);
          return (
            <div
              key={item.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {item.symbol && (
                    <button
                      onClick={() => associatedStock && onSelectStock(associatedStock)}
                      className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[11px] hover:bg-indigo-500/30 transition"
                    >
                      {item.symbol}
                    </button>
                  )}
                  <span className="text-slate-400 font-medium">{item.companyName}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {item.publishedAt.slice(0, 10)}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.sentiment === 'POSITIVE'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : item.sentiment === 'CAUTIONARY'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.sentiment}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                  {item.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">
                  Source: {item.source}
                </span>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition text-[11px]"
                >
                  <span>Official Disclosure</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
