/**
 * MarketMind Terminal - Main Application Coordinator
 * Production-quality Indian financial research & simulated execution platform.
 * Realism & Data Integrity: NSE/BSE delayed market data, deterministic quantitative math,
 * audited financial statements, multi-factor screener, virtual paper trading, and strategy backtester.
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { MainTerminalDashboard } from './components/MainTerminalDashboard';
import { StockResearchPage } from './components/StockResearchPage';
import { Screener } from './components/Screener';
import { PaperTrading } from './components/PaperTrading';
import { Backtesting } from './components/Backtesting';
import { GovernanceRedFlags } from './components/GovernanceRedFlags';
import { PersonalFinance } from './components/PersonalFinance';
import { IPOTracker } from './components/IPOTracker';
import { MarketAnalyticsBentoView } from './components/MarketAnalyticsBentoView';
import { RiskDashboard } from './components/RiskDashboard';
import { InvestmentCalculator } from './components/InvestmentCalculator';
import { NewsAnnouncements } from './components/NewsAnnouncements';
import { StockDetailModal } from './components/StockDetailModal';
import { BeginnerGlossaryModal } from './components/BeginnerGlossaryModal';
import { SettingsModal } from './components/SettingsModal';
import { DataErrorReportModal } from './components/DataErrorReportModal';
import { StockQuote, MarketIndex, PaperTradingState, Exchange, Currency } from './types/market';
import { INDIAN_MARKET_INDICES, INDIAN_STOCKS } from './data/indianMarketData';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [indices, setIndices] = useState<MarketIndex[]>(INDIAN_MARKET_INDICES);
  const [stocks, setStocks] = useState<StockQuote[]>(INDIAN_STOCKS);
  const [selectedStock, setSelectedStock] = useState<StockQuote>(INDIAN_STOCKS[0]);
  const [exchange, setExchange] = useState<Exchange>('NSE');
  const [currency, setCurrency] = useState<Currency>('INR');

  // Modal visibility states
  const [isStockDetailOpen, setIsStockDetailOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isErrorReportOpen, setIsErrorReportOpen] = useState(false);

  // Paper trading portfolio state
  const [portfolio, setPortfolio] = useState<PaperTradingState>({
    initialCash: 1000000,
    cashBalance: 1000000,
    holdings: [],
    transactions: [],
    realizedPnl: 0,
    totalPortfolioValue: 1000000,
    historicalValues: [],
    lastUpdated: new Date().toISOString()
  });

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  // Load live or server-cached market data on boot
  useEffect(() => {
    fetch('/api/market/indices')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data?.length > 0) {
          setIndices(json.data);
        }
      })
      .catch(() => {});

    fetch('/api/market/stocks')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data?.length > 0) {
          setStocks(json.data);
          if (!selectedStock) setSelectedStock(json.data[0]);
        }
      })
      .catch(() => {});

    fetch('/api/paper-trading/portfolio')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setPortfolio(json.data);
        }
      })
      .catch(() => {});
  }, []);

  // Update and persist paper trading portfolio
  const handleUpdatePortfolio = async (updated: PaperTradingState) => {
    setPortfolio(updated);
    try {
      await fetch('/api/paper-trading/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('Failed to persist portfolio to server, keeping in local memory:', err);
    }
  };

  // Reset virtual paper trading account
  const handleResetPortfolio = async () => {
    try {
      const res = await fetch('/api/paper-trading/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startingCash: 1000000 }),
      });
      const json = await res.json();
      if (json.success) {
        setPortfolio(json.data);
      }
    } catch {
      setPortfolio({
        initialCash: 1000000,
        cashBalance: 1000000,
        holdings: [],
        transactions: [],
        realizedPnl: 0,
        totalPortfolioValue: 1000000,
        historicalValues: [],
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const handleStockClick = (stock: StockQuote) => {
    setSelectedStock(stock);
    setIsStockDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0c0e14] text-[#d1d4dc] flex flex-col font-sans selection:bg-[#3b82f6]/30 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar
        indices={indices}
        stocks={stocks}
        selectedStock={selectedStock}
        onSelectStock={stock => {
          setSelectedStock(stock);
          setIsStockDetailOpen(true);
        }}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenErrorReport={() => setIsErrorReportOpen(true)}
        currencySymbol={currencySymbol}
        portfolioValue={portfolio.totalPortfolioValue}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          portfolioValue={portfolio.totalPortfolioValue}
          currencySymbol={currencySymbol}
        />

        {/* Content View Area */}
        <main className="flex-1 p-2 sm:p-4 lg:p-5 overflow-y-auto">
          {/* Mobile Tab Navigation Strip */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-xs font-mono">
            {(
              [
                ['overview', 'Terminal'],
                ['stock-research', 'Research'],
                ['screener', 'Screener'],
                ['paper-trading', 'Trading'],
                ['backtesting', 'Backtest'],
                ['personal-finance', 'Tax/Finance'],
                ['governance', 'Governance'],
                ['ipos', 'IPOs'],
                ['bento', 'Bento'],
                ['risk', 'Risk'],
                ['news', 'Filings'],
              ] as const
            ).map(([tabKey, label]) => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey as NavTab)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition ${
                  activeTab === tabKey
                    ? 'bg-[#181d2a] text-[#60a5fa] border border-[#2b354e] font-bold'
                    : 'bg-[#12151f] border border-[#1e2332] text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab 1: Main Dashboard (TradingView & Zerodha Kite inspired) */}
          {activeTab === 'overview' && (
            <MainTerminalDashboard
              indices={indices}
              stocks={stocks}
              selectedStock={selectedStock}
              onSelectStock={setSelectedStock}
              onOpenResearchPage={stock => {
                setSelectedStock(stock);
                setActiveTab('stock-research');
              }}
              portfolio={portfolio}
              onUpdatePortfolio={handleUpdatePortfolio}
              currencySymbol={currencySymbol}
            />
          )}

          {/* Tab 2: Detailed Company Research & AI Institutional Memorandum */}
          {activeTab === 'stock-research' && (
            <StockResearchPage
              stocks={stocks}
              selectedStock={selectedStock}
              onSelectStock={setSelectedStock}
              currencySymbol={currencySymbol}
              onNavigateToPaperTrading={() => setActiveTab('paper-trading')}
            />
          )}

          {/* Tab 3: Stock Screener */}
          {activeTab === 'screener' && (
            <Screener
              stocks={stocks}
              onSelectStock={stock => {
                setSelectedStock(stock);
                setActiveTab('stock-research');
              }}
              currencySymbol={currencySymbol}
            />
          )}

          {/* Tab 4: Paper Trading Simulator */}
          {activeTab === 'paper-trading' && (
            <PaperTrading
              portfolio={portfolio}
              stocks={stocks}
              currencySymbol={currencySymbol}
              onUpdatePortfolio={handleUpdatePortfolio}
              onResetPortfolio={handleResetPortfolio}
            />
          )}

          {/* Tab 5: Strategy Backtester */}
          {activeTab === 'backtesting' && (
            <Backtesting
              stocks={stocks}
              selectedStock={selectedStock}
              onSelectStock={setSelectedStock}
              currencySymbol={currencySymbol}
            />
          )}

          {/* Tab 6: Tax & Personal Finance */}
          {activeTab === 'personal-finance' && (
            <PersonalFinance
              stocks={stocks}
              currencySymbol={currencySymbol}
            />
          )}

          {/* Tab 7: Governance & Red Flags */}
          {activeTab === 'governance' && (
            <GovernanceRedFlags
              stocks={stocks}
              selectedStock={selectedStock}
              onSelectStock={setSelectedStock}
              currencySymbol={currencySymbol}
            />
          )}

          {/* Tab 8: IPO Radar & DRHP */}
          {activeTab === 'ipos' && (
            <IPOTracker
              currencySymbol={currencySymbol}
            />
          )}

          {/* Tab 9: Analytics Bento */}
          {activeTab === 'bento' && (
            <MarketAnalyticsBentoView
              portfolio={portfolio}
              stocks={stocks}
              indices={indices}
              currencySymbol={currencySymbol}
            />
          )}

          {/* Tab 10: Risk & Stress Tests */}
          {activeTab === 'risk' && (
            <RiskDashboard
              portfolio={portfolio}
              stocks={stocks}
              currencySymbol={currencySymbol}
            />
          )}

          {/* Tab 11: Hypothetical Calculator */}
          {activeTab === 'calculator' && (
            <InvestmentCalculator
              stocks={stocks}
              selectedStock={selectedStock}
              onSelectStock={setSelectedStock}
              currencySymbol={currencySymbol}
            />
          )}

          {/* Tab 12: Corporate News & Filings */}
          {activeTab === 'news' && (
            <NewsAnnouncements
              stocks={stocks}
              onSelectStock={stock => {
                setSelectedStock(stock);
                setActiveTab('stock-research');
              }}
            />
          )}
        </main>
      </div>

      {/* Stock Detailed Inspection Modal (triggered from search or quick clicks) */}
      {isStockDetailOpen && (
        <StockDetailModal
          stock={selectedStock}
          onClose={() => setIsStockDetailOpen(false)}
          onNavigateToTab={tab => {
            setActiveTab(tab as NavTab);
            setIsStockDetailOpen(false);
          }}
          currencySymbol={currencySymbol}
        />
      )}

      {/* Beginner Financial Glossary Modal */}
      <BeginnerGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Settings & Diagnostics Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        exchange={exchange}
        currency={currency}
        onUpdateExchange={setExchange}
        onUpdateCurrency={setCurrency}
        onResetPortfolio={handleResetPortfolio}
      />

      {/* Data Error Reporting & Audit Modal */}
      <DataErrorReportModal
        isOpen={isErrorReportOpen}
        onClose={() => setIsErrorReportOpen(false)}
        stocks={stocks}
        selectedStock={selectedStock}
      />
    </div>
  );
}
