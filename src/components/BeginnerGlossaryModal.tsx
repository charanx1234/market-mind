/**
 * MarketMind AI - Beginner Financial Concepts & Ratio Glossary
 * Plain-language definitions for foundational technical terms.
 */

import React, { useState } from 'react';
import { X, BookOpen, Search, HelpCircle, CheckCircle2 } from 'lucide-react';

interface BeginnerGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GlossaryItem {
  term: string;
  category: 'Valuation' | 'Risk' | 'Profitability' | 'Indian Market';
  shortExplanation: string;
  detailedFormula: string;
  beginnerExample: string;
}

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: 'Price-to-Earnings (P/E) Ratio',
    category: 'Valuation',
    shortExplanation: 'How much investors pay for every ₹1 of profit the company earns.',
    detailedFormula: 'Market Price Per Share ÷ Earnings Per Share (EPS)',
    beginnerExample: 'If a stock trades at ₹1,000 and earns ₹50 per share, its P/E is 20x. Comparing this to the sector average (e.g. 25x) shows whether the market considers it relatively cheap or expensive.'
  },
  {
    term: 'Price-to-Book (P/B) Ratio',
    category: 'Valuation',
    shortExplanation: 'Compares the market value of a company to its physical net worth (book value).',
    detailedFormula: 'Market Cap ÷ (Total Assets - Total Liabilities)',
    beginnerExample: 'A P/B under 1.0 means the stock trades below the net accounting value of its assets, common in cyclical banks or industrial turnaround situations.'
  },
  {
    term: 'Market Beta (&beta;)',
    category: 'Risk',
    shortExplanation: 'Measures how violently a stock swings compared to the broader index (NIFTY 50).',
    detailedFormula: 'Covariance(Stock Return, Benchmark Return) ÷ Variance(Benchmark Return)',
    beginnerExample: 'A beta of 1.0 moves in tandem with the market. A beta of 1.4 means if NIFTY jumps 10%, this stock typically rallies ~14%, but when NIFTY drops 10%, it may plummet ~14%.'
  },
  {
    term: 'Annualized Historical Volatility (&sigma;)',
    category: 'Risk',
    shortExplanation: 'The standard deviation of daily percentage price changes scaled over a 252-day trading year.',
    detailedFormula: 'Standard Deviation of Daily Log Returns × √252',
    beginnerExample: 'A stock with 18% volatility moves predictably in narrow corridors, while a 40% volatility stock experiences wide, rapid swings.'
  },
  {
    term: 'Maximum Historical Drawdown (MDD)',
    category: 'Risk',
    shortExplanation: 'The biggest drop an investor could have suffered from a peak high down to a trough low.',
    detailedFormula: '(Trough Value - Peak Value) ÷ Peak Value',
    beginnerExample: 'If an equity dropped from ₹2,000 to ₹1,400 during a crash, its drawdown was -30%. It demonstrates the psychological downside risk you must be prepared to endure.'
  },
  {
    term: 'Return on Equity (ROE)',
    category: 'Profitability',
    shortExplanation: 'Measures how efficiently management generates profits from the money shareholders invested.',
    detailedFormula: 'Net Income (Profit After Tax) ÷ Total Shareholder Equity × 100',
    beginnerExample: 'An ROE of 20% means for every ₹100 of net equity in the company, management generates ₹20 of net profit annually.'
  },
  {
    term: 'Free Cash Flow (FCF)',
    category: 'Profitability',
    shortExplanation: 'Actual cold hard cash left over after paying all operating bills and capital investments.',
    detailedFormula: 'Operating Cash Flow - Capital Expenditures (Capex)',
    beginnerExample: 'Unlike paper accounting profits, free cash flow cannot be faked. It pays dividends, buys back shares, and reduces bank debt.'
  },
  {
    term: 'Value at Risk (VaR 95%)',
    category: 'Risk',
    shortExplanation: 'The estimated maximum loss you might expect over a time horizon under 95% of normal market conditions.',
    detailedFormula: 'Portfolio Value × 1.645 × Daily/Monthly Volatility',
    beginnerExample: 'A 1-day 95% VaR of ₹15,000 on a ₹10,00,000 portfolio means on 95 out of 100 days, your daily loss is not expected to exceed ₹15,000.'
  },
  {
    term: 'Securities Transaction Tax (STT)',
    category: 'Indian Market',
    shortExplanation: 'Direct statutory tax levied by the Government of India on all equity delivery trades.',
    detailedFormula: '0.1% on total purchase and sell delivery turnover',
    beginnerExample: 'When buying or selling ₹1,00,000 worth of NSE shares, ₹100 is automatically deducted as STT.'
  },
  {
    term: 'Geometric Brownian Motion (GBM)',
    category: 'Risk',
    shortExplanation: 'The mathematical model used to forecast probabilistic price corridors without guessing or fabricating numbers.',
    detailedFormula: 'S_t = S_0 × exp((&mu; - 0.5&sigma;²)t + &sigma;√t × Z)',
    beginnerExample: 'Instead of claiming a stock WILL be ₹3,450, GBM calculates a range (e.g. Bear: ₹2,600, Base: ₹3,100, Bull: ₹3,600) based on historical volatility and drift.'
  }
];

export const BeginnerGlossaryModal: React.FC<BeginnerGlossaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const filtered = GLOSSARY_ITEMS.filter(item => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return item.term.toLowerCase().includes(q) || item.shortExplanation.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Beginner Financial Concept Glossary</h2>
              <p className="text-xs text-slate-400">Plain-language explanations of financial ratios, risk metrics, and Indian taxes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-3 bg-slate-900/80 text-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search concepts (e.g. Beta, P/E, STT, Volatility)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'Valuation', 'Risk', 'Profitability', 'Indian Market'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Glossary Items List */}
        <div className="p-5 overflow-y-auto space-y-4 divide-y divide-slate-800/80 flex-1">
          {filtered.map((item, idx) => (
            <div key={item.term} className={idx > 0 ? 'pt-4' : ''}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-bold text-white text-sm font-sans">{item.term}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-indigo-300 font-medium mb-2">
                {item.shortExplanation}
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                <div className="font-mono text-slate-400 text-[11px]">
                  <strong className="text-slate-300 font-sans">Formula: </strong>{item.detailedFormula}
                </div>
                <div className="text-slate-300 text-[11px] leading-relaxed font-sans">
                  <strong className="text-emerald-400 font-sans">Real-World Example: </strong>{item.beginnerExample}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
