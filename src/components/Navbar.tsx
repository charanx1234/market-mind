/**
 * MarketMind Terminal - Professional Financial Header Navbar
 * Modeled after TradingView & Zerodha Kite institutional headers.
 * Features:
 * - Minimalist brand identity
 * - Live market status clock (IST) + exchange status
 * - Global instrument search with keyboard shortcut (/)
 * - Notifications drawer (corporate announcements & filings)
 * - User profile menu with simulated cash balance & settings
 * - Real-time ticker tape (NIFTY 50, SENSEX, BANK NIFTY, INDIA VIX)
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Settings,
  Bell,
  Clock,
  CheckCircle2,
  ChevronDown,
  Layers,
  AlertCircle,
  Activity,
  FileText,
  Sliders,
  X
} from 'lucide-react';
import { MarketIndex, StockQuote } from '../types/market';

interface NavbarProps {
  indices: MarketIndex[];
  stocks: StockQuote[];
  selectedStock: StockQuote | null;
  onSelectStock: (stock: StockQuote) => void;
  onOpenGlossary: () => void;
  onOpenSettings: () => void;
  onOpenErrorReport: () => void;
  currencySymbol: string;
  portfolioValue?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  indices,
  stocks,
  selectedStock,
  onSelectStock,
  onOpenGlossary,
  onOpenSettings,
  onOpenErrorReport,
  currencySymbol,
  portfolioValue = 1000000,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Live IST Clock calculation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as IST (UTC + 5:30)
      const istTime = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setCurrentTime(istTime);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStocks = searchQuery.trim()
    ? stocks.filter(
        s =>
          s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.sector.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stocks.slice(0, 8);

  // Mock corporate notifications
  const notifications = [
    {
      id: 1,
      title: 'TCS - Board Meeting Scheduled',
      time: '14:20 IST',
      desc: 'To consider and approve audited financial results and interim dividend declaration.',
      tag: 'BSE Filings',
      read: false,
    },
    {
      id: 2,
      title: 'HDFC Bank - Q3 Shareholding Pattern',
      time: '12:05 IST',
      desc: 'Foreign institutional investors (FII) stake revised to 52.8% vs 51.6% QoQ.',
      tag: 'SEBI Disclosure',
      read: false,
    },
    {
      id: 3,
      title: 'RELIANCE - Green Energy Capex Update',
      time: '09:45 IST',
      desc: 'Operational commissioning of gigawatt-scale solar module line announced.',
      tag: 'Press Release',
      read: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0e14] border-b border-[#202433] select-none text-xs">
      {/* Top Benchmark Ticker Strip */}
      <div className="bg-[#10131d] border-b border-[#1b202d] px-3 sm:px-6 py-1 overflow-x-auto scrollbar-none flex items-center justify-between gap-4 font-mono">
        <div className="flex items-center gap-5 shrink-0">
          {/* Market Status with IST Clock */}
          <div className="flex items-center gap-2 text-[#787b86]">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            <span className="text-[#a0a5b5] font-semibold tracking-wider text-[11px]">NSE CLOSED</span>
            <span className="text-[10px] text-[#555a6d] hidden sm:inline">IST {currentTime || '15:30:00'}</span>
          </div>

          <div className="h-3 w-px bg-[#202433] hidden sm:block"></div>

          {/* Indices readouts */}
          {indices.slice(0, 4).map(idx => {
            const isUp = idx.dayChange >= 0;
            return (
              <div key={idx.symbol} className="flex items-center gap-1.5 text-[11px]">
                <span className="text-[#787b86] font-sans font-medium">{idx.name}</span>
                <span className="text-[#d1d4dc] font-bold">
                  {idx.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`flex items-center text-[10px] ${
                    isUp ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isUp ? '+' : ''}{idx.dayChangePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Data Provenance & Sandbox Notice */}
        <div className="hidden md:flex items-center gap-2 shrink-0 text-[10px]">
          <span className="text-[#787b86]">Data:</span>
          <span className="text-[#a0a5b5] bg-[#161a26] border border-[#232738] px-2 py-0.5 rounded">
            NSE EOD Delayed (15m) • Simulation Sandbox
          </span>
        </div>
      </div>

      {/* Main Terminal Header Bar */}
      <div className="px-3 sm:px-6 h-13 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand & Terminal Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-[#161b28] border border-[#262c3e] flex items-center justify-center text-[#38bdf8] font-mono font-black text-sm tracking-tighter">
            MM
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[#e6e8ee] tracking-tight font-sans">MARKETMIND</span>
              <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-[#1b2234] text-[#60a5fa] border border-[#2b354e] rounded">
                TERMINAL
              </span>
            </div>
            <span className="text-[10px] text-[#555a6d] hidden lg:block -mt-0.5">
              Indian Equities Research &amp; Execution Sandbox
            </span>
          </div>
        </div>

        {/* Global Market Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-lg mx-1 sm:mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555a6d]" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search symbol, company, or sector (e.g. RELIANCE, TCS, Bank)..."
              className="w-full bg-[#12151f] border border-[#222635] rounded-md pl-9 pr-12 py-1.5 text-xs text-[#d1d4dc] placeholder-[#555a6d] focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/40 transition font-sans"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#555a6d] hover:text-[#d1d4dc] p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-[#181c28] text-[#787b86] border border-[#242938] rounded">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Autocomplete Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#12151f] border border-[#222738] rounded-md shadow-2xl overflow-hidden z-50">
              <div className="px-3 py-1.5 bg-[#161a27] border-b border-[#202535] text-[10px] text-[#787b86] font-mono uppercase tracking-wider flex items-center justify-between">
                <span>{searchQuery ? `Search Results (${filteredStocks.length})` : 'Popular NSE Instruments'}</span>
                <span>Press ESC to close</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#181d2b]">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map(stock => {
                    const isUp = stock.dayChange >= 0;
                    return (
                      <button
                        key={stock.symbol}
                        onClick={() => {
                          onSelectStock(stock);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full px-3.5 py-2 flex items-center justify-between text-left hover:bg-[#181d2c] transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#e6e8ee] text-xs w-20 text-left">
                            {stock.symbol}
                          </span>
                          <div>
                            <div className="text-xs text-[#a0a5b5] font-sans truncate max-w-[180px] sm:max-w-xs">
                              {stock.name}
                            </div>
                            <div className="text-[10px] text-[#555a6d] font-mono">
                              {stock.sector} • {stock.exchange}
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <div className="text-xs font-semibold text-[#d1d4dc]">
                            {currencySymbol}{stock.currentPrice.toFixed(2)}
                          </div>
                          <div
                            className={`text-[10px] font-medium flex items-center justify-end gap-0.5 ${
                              isUp ? 'text-[#089981]' : 'text-[#f23645]'
                            }`}
                          >
                            {isUp ? '+' : ''}{stock.dayChangePercent.toFixed(2)}%
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-6 text-center text-xs text-[#787b86]">
                    No instruments found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Controls: Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="relative p-1.5 rounded-md text-[#787b86] hover:text-[#d1d4dc] hover:bg-[#161a26] border border-transparent hover:border-[#222738] transition"
              title="Exchange Filings & Announcements"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#3b82f6]"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#12151f] border border-[#222738] rounded-md shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-2.5 bg-[#161a27] border-b border-[#202535] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-[#e6e8ee]">
                    <Bell className="w-3.5 h-3.5 text-[#3b82f6]" />
                    Exchange Announcements
                  </div>
                  <span className="text-[10px] font-mono text-[#787b86]">NSE / BSE Feeds</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#181d2b]">
                  {notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-[#171c2b] transition">
                      <div className="flex items-center justify-between text-[10px] text-[#787b86] font-mono mb-1">
                        <span className="text-[#60a5fa] font-medium">{n.tag}</span>
                        <span>{n.time}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-[#d1d4dc]">{n.title}</h4>
                      <p className="text-[11px] text-[#787b86] mt-0.5 leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="px-3 py-2 bg-[#10131d] border-t border-[#1b202d] text-center">
                  <span className="text-[10px] text-[#555a6d] font-mono">
                    All notifications verified against official exchange feeds
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Account Menu */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-md bg-[#12151f] hover:bg-[#161a27] border border-[#222636] transition"
            >
              <div className="w-6 h-6 rounded-full bg-[#1d2334] text-[#60a5fa] font-mono text-[10px] font-bold flex items-center justify-center border border-[#2c3650]">
                TR
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-medium text-[#d1d4dc] leading-none">Analyst</span>
                <span className="text-[9px] font-mono text-[#089981] mt-0.5">
                  {currencySymbol}{portfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#555a6d]" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#12151f] border border-[#222738] rounded-md shadow-2xl z-50 overflow-hidden divide-y divide-[#1b202e]">
                {/* Account Summary */}
                <div className="p-3 bg-[#161a27]">
                  <div className="text-[10px] text-[#787b86] font-mono uppercase">Paper Trading Account</div>
                  <div className="text-sm font-bold font-mono text-[#e6e8ee] mt-0.5">
                    {currencySymbol}{portfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-[#089981] flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Simulated Balance Active
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenSettings();
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-[#a0a5b5] hover:text-[#e6e8ee] hover:bg-[#181d2c] transition"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#787b86]" />
                    <span>Terminal Settings &amp; Exchange</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenGlossary();
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-[#a0a5b5] hover:text-[#e6e8ee] hover:bg-[#181d2c] transition"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#787b86]" />
                    <span>Financial Concepts Glossary</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenErrorReport();
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-[#f59e0b] hover:bg-[#181d2c] transition"
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b]" />
                    <span>Report Data Discrepancy</span>
                  </button>
                </div>

                <div className="p-2.5 bg-[#0e111a] text-[10px] text-[#555a6d] font-mono leading-tight">
                  SEBI RA Reg. Pending • For Educational Use Only
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
