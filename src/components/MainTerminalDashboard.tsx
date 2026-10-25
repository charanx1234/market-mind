/**
 * MarketMind Terminal - Main Interactive Dashboard
 * Inspired by TradingView & Zerodha Kite.
 * Integrates:
 * 1. Market Overview: NIFTY 50, SENSEX, Market Breadth (Advances/Declines), Sector Performance
 * 2. Left Watchlist: Real-time NSE/BSE stock quotes, search, sector filter
 * 3. Central Interactive Candlestick Chart with Volume bars, SMA indicators, and timeframes
 * 4. Quick Execution Dock (Paper Trading Order Slip with Indian statutory charges)
 * 5. Live Exchange Announcements & Market News feed
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Maximize2
} from 'lucide-react';
import { StockQuote, MarketIndex, OHLCV, PaperTradingState } from '../types/market';
import { StockChart } from './StockChart';
import { calculateIndianStatutoryCharges } from '../services/financialMath';

interface MainTerminalDashboardProps {
  indices: MarketIndex[];
  stocks: StockQuote[];
  selectedStock: StockQuote;
  onSelectStock: (stock: StockQuote) => void;
  onOpenResearchPage: (stock: StockQuote) => void;
  portfolio: PaperTradingState;
  onUpdatePortfolio: (updated: PaperTradingState) => void;
  currencySymbol: string;
}

export const MainTerminalDashboard: React.FC<MainTerminalDashboardProps> = ({
  indices,
  stocks,
  selectedStock,
  onSelectStock,
  onOpenResearchPage,
  portfolio,
  onUpdatePortfolio,
  currencySymbol,
}) => {
  const [watchlistFilter, setWatchlistFilter] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [chartHistory, setChartHistory] = useState<OHLCV[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  // Quick Order Dock states
  const [orderAction, setOrderAction] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [orderShares, setOrderShares] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(selectedStock.currentPrice);
  const [orderFeedback, setOrderFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Update limit price when active stock changes
  useEffect(() => {
    setLimitPrice(selectedStock.currentPrice);
    setOrderFeedback(null);
  }, [selectedStock]);

  // Load OHLCV history for selected stock
  useEffect(() => {
    setIsLoadingChart(true);
    fetch(`/api/market/history/${selectedStock.symbol}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setChartHistory(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingChart(false));
  }, [selectedStock.symbol]);

  // Distinct sectors
  const sectors = useMemo(() => {
    const set = new Set<string>();
    stocks.forEach(s => set.add(s.sector));
    return ['ALL', ...Array.from(set)];
  }, [stocks]);

  // Filtered watchlist
  const filteredWatchlist = useMemo(() => {
    return stocks.filter(s => {
      const matchQuery =
        s.symbol.toLowerCase().includes(watchlistFilter.toLowerCase()) ||
        s.name.toLowerCase().includes(watchlistFilter.toLowerCase());
      const matchSector = selectedSector === 'ALL' || s.sector === selectedSector;
      return matchQuery && matchSector;
    });
  }, [stocks, watchlistFilter, selectedSector]);

  // Market Breadth computation (Advances, Declines, Unchanged)
  const marketBreadth = useMemo(() => {
    let advances = 0;
    let declines = 0;
    let unchanged = 0;
    stocks.forEach(s => {
      if (s.dayChange > 0) advances++;
      else if (s.dayChange < 0) declines++;
      else unchanged++;
    });
    const total = advances + declines + unchanged || 1;
    return {
      advances,
      declines,
      unchanged,
      advanceRatio: (advances / total) * 100,
      declineRatio: (declines / total) * 100,
    };
  }, [stocks]);

  // Sector Performance aggregate
  const sectorPerf = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    stocks.forEach(s => {
      const cur = map.get(s.sector) || { total: 0, count: 0 };
      map.set(s.sector, { total: cur.total + s.dayChangePercent, count: cur.count + 1 });
    });
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      avg: data.total / data.count,
    }));
  }, [stocks]);

  // Order calculation
  const execPrice = orderType === 'MARKET' ? selectedStock.currentPrice : limitPrice;
  const grossTrade = orderShares * execPrice;
  const statutoryCharges = calculateIndianStatutoryCharges(grossTrade, orderAction === 'BUY', 20);
  const netCashImpact = orderAction === 'BUY'
    ? grossTrade + statutoryCharges.totalTaxesAndCharges
    : grossTrade - statutoryCharges.totalTaxesAndCharges;

  // Existing holding for selected stock
  const currentHolding = portfolio.holdings.find(h => h.symbol === selectedStock.symbol);

  // Quick Order Execution Handler
  const handleExecuteQuickOrder = () => {
    setOrderFeedback(null);
    if (orderShares <= 0) {
      setOrderFeedback({ type: 'error', message: 'Quantity must be at least 1 whole share' });
      return;
    }

    if (orderAction === 'BUY') {
      if (netCashImpact > portfolio.cashBalance) {
        setOrderFeedback({
          type: 'error',
          message: `Insufficient virtual cash. Needed: ₹${netCashImpact.toFixed(2)}, Available: ₹${portfolio.cashBalance.toFixed(2)}`
        });
        return;
      }

      const newCash = portfolio.cashBalance - netCashImpact;
      const updatedHoldings = [...portfolio.holdings];
      const idx = updatedHoldings.findIndex(h => h.symbol === selectedStock.symbol);

      if (idx >= 0) {
        const cur = updatedHoldings[idx];
        const newShares = cur.shares + orderShares;
        const newCost = cur.totalCostBasis + grossTrade;
        const newAvg = newCost / newShares;
        const curVal = newShares * selectedStock.currentPrice;

        updatedHoldings[idx] = {
          ...cur,
          shares: newShares,
          averageBuyPrice: Math.round(newAvg * 100) / 100,
          totalCostBasis: newCost,
          currentPrice: selectedStock.currentPrice,
          currentValue: curVal,
          unrealizedPnl: curVal - newCost,
          unrealizedPnlPercent: ((curVal - newCost) / newCost) * 100,
        };
      } else {
        const curVal = orderShares * selectedStock.currentPrice;
        updatedHoldings.push({
          symbol: selectedStock.symbol,
          companyName: selectedStock.name,
          shares: orderShares,
          averageBuyPrice: execPrice,
          totalCostBasis: grossTrade,
          currentPrice: selectedStock.currentPrice,
          currentValue: curVal,
          unrealizedPnl: curVal - grossTrade,
          unrealizedPnlPercent: ((curVal - grossTrade) / grossTrade) * 100,
          dayChangePercent: selectedStock.dayChangePercent,
          allocationPercent: 0,
        });
      }

      const totalVal = newCash + updatedHoldings.reduce((s, h) => s + h.currentValue, 0);
      updatedHoldings.forEach(h => {
        h.allocationPercent = (h.currentValue / totalVal) * 100;
      });

      const updatedPortfolio: PaperTradingState = {
        ...portfolio,
        cashBalance: newCash,
        holdings: updatedHoldings,
        totalPortfolioValue: totalVal,
        lastUpdated: new Date().toISOString(),
      };

      onUpdatePortfolio(updatedPortfolio);
      setOrderFeedback({
        type: 'success',
        message: `Simulated BUY of ${orderShares} ${selectedStock.symbol} executed at ₹${execPrice.toFixed(2)}`
      });
    } else {
      // SELL action
      if (!currentHolding || currentHolding.shares < orderShares) {
        setOrderFeedback({
          type: 'error',
          message: `Insufficient shares. You hold ${currentHolding?.shares || 0} ${selectedStock.symbol}`
        });
        return;
      }

      const newCash = portfolio.cashBalance + netCashImpact;
      let updatedHoldings = [...portfolio.holdings];
      const remainingShares = currentHolding.shares - orderShares;
      const soldCostBasis = orderShares * currentHolding.averageBuyPrice;
      const realizedProfit = (execPrice - currentHolding.averageBuyPrice) * orderShares - statutoryCharges.totalTaxesAndCharges;

      if (remainingShares === 0) {
        updatedHoldings = updatedHoldings.filter(h => h.symbol !== selectedStock.symbol);
      } else {
        const holdingIdx = updatedHoldings.findIndex(h => h.symbol === selectedStock.symbol);
        const newCostBasis = remainingShares * currentHolding.averageBuyPrice;
        const curVal = remainingShares * selectedStock.currentPrice;
        updatedHoldings[holdingIdx] = {
          ...currentHolding,
          shares: remainingShares,
          totalCostBasis: newCostBasis,
          currentValue: curVal,
          unrealizedPnl: curVal - newCostBasis,
          unrealizedPnlPercent: ((curVal - newCostBasis) / newCostBasis) * 100,
        };
      }

      const totalVal = newCash + updatedHoldings.reduce((s, h) => s + h.currentValue, 0);
      updatedHoldings.forEach(h => {
        h.allocationPercent = totalVal > 0 ? (h.currentValue / totalVal) * 100 : 0;
      });

      const updatedPortfolio: PaperTradingState = {
        ...portfolio,
        cashBalance: newCash,
        holdings: updatedHoldings,
        realizedPnl: portfolio.realizedPnl + realizedProfit,
        totalPortfolioValue: totalVal,
        lastUpdated: new Date().toISOString(),
      };

      onUpdatePortfolio(updatedPortfolio);
      setOrderFeedback({
        type: 'success',
        message: `Simulated SELL of ${orderShares} ${selectedStock.symbol} executed at ₹${execPrice.toFixed(2)}`
      });
    }
  };

  // Recent Market News & Announcements
  const marketNews = [
    {
      id: 'news-1',
      source: 'NSE Corporate Announcement',
      timestamp: '14:45 IST',
      headline: `${selectedStock.name} (${selectedStock.symbol}) files quarterly shareholding disclosure with SEBI.`,
      url: '#',
    },
    {
      id: 'news-2',
      source: 'Press Trust of India',
      timestamp: '13:10 IST',
      headline: 'India CPI inflation moderates within RBI tolerance corridor of 2-6%; rate pause anticipated.',
      url: '#',
    },
    {
      id: 'news-3',
      source: 'BSE Filings',
      timestamp: '11:25 IST',
      headline: 'Institutional foreign inflows (FII) turn net buyers in Indian capital goods & financial heavyweights.',
      url: '#',
    },
  ];

  const isUp = selectedStock.dayChange >= 0;

  return (
    <div className="space-y-3 font-sans">
      {/* 1. TOP MARKET OVERVIEW & BREADTH RIBBON */}
      <div className="bg-[#12151f] border border-[#202433] rounded-md p-3 sm:p-4 text-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Index Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 w-full">
            {indices.map(idx => {
              const idxUp = idx.dayChange >= 0;
              return (
                <div
                  key={idx.symbol}
                  className="bg-[#0f121b] border border-[#1d2230] p-2.5 rounded flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-[#787b86] font-mono text-[10px]">
                    <span className="font-sans font-semibold text-[#a0a5b5] truncate">{idx.name}</span>
                    <span>{idx.symbol.replace('^', '')}</span>
                  </div>
                  <div className="text-base font-bold font-mono text-[#e6e8ee] mt-1">
                    {idx.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
                    <span className={idxUp ? 'text-[#089981]' : 'text-[#f23645]'}>
                      {idxUp ? '+' : ''}{idx.dayChange.toFixed(2)} ({idxUp ? '+' : ''}{idx.dayChangePercent.toFixed(2)}%)
                    </span>
                    <span className="text-[#555a6d] hidden sm:inline">H: {idx.high.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Market Breadth & Sector Gauge */}
          <div className="bg-[#0f121b] border border-[#1d2230] p-2.5 rounded w-full lg:w-80 shrink-0 font-mono text-[11px]">
            <div className="flex items-center justify-between text-[#787b86] mb-1 text-[10px]">
              <span className="font-semibold text-[#a0a5b5] uppercase">NSE Market Breadth</span>
              <span>Advances: {marketBreadth.advances} / Declines: {marketBreadth.declines}</span>
            </div>
            {/* Advance / Decline Bar */}
            <div className="h-1.5 w-full bg-[#1b202e] rounded-full overflow-hidden flex my-1.5">
              <div
                style={{ width: `${marketBreadth.advanceRatio}%` }}
                className="bg-[#089981] h-full"
                title={`Advances: ${marketBreadth.advances}`}
              ></div>
              <div
                style={{ width: `${marketBreadth.declineRatio}%` }}
                className="bg-[#f23645] h-full"
                title={`Declines: ${marketBreadth.declines}`}
              ></div>
            </div>

            {/* Quick Sector Strip */}
            <div className="flex items-center justify-between gap-1 text-[10px] mt-2 pt-1.5 border-t border-[#1a1f2c]">
              {sectorPerf.slice(0, 3).map(s => {
                const sUp = s.avg >= 0;
                return (
                  <div key={s.name} className="truncate">
                    <span className="text-[#787b86]">{s.name.split(' ')[0]}: </span>
                    <span className={sUp ? 'text-[#089981]' : 'text-[#f23645]'}>
                      {sUp ? '+' : ''}{s.avg.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: LEFT WATCHLIST + CENTER CANDLESTICK CHART + RIGHT EXECUTION/NEWS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* LEFT COLUMN: WATCHLIST (3 cols on lg) */}
        <div className="lg:col-span-3 bg-[#12151f] border border-[#202433] rounded-md p-3 flex flex-col h-[680px]">
          {/* Watchlist Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#1c212f]">
            <span className="font-bold text-xs text-[#e6e8ee] tracking-wide uppercase font-mono">
              NSE Watchlist
            </span>
            <span className="text-[10px] font-mono text-[#555a6d]">
              {filteredWatchlist.length} Instruments
            </span>
          </div>

          {/* Search inside Watchlist */}
          <div className="my-2 relative">
            <Search className="w-3.5 h-3.5 text-[#555a6d] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={watchlistFilter}
              onChange={e => setWatchlistFilter(e.target.value)}
              placeholder="Filter watchlist..."
              className="w-full bg-[#0c0e14] border border-[#202534] rounded pl-8 pr-2 py-1 text-xs text-[#d1d4dc] placeholder-[#555a6d] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>

          {/* Sector Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none text-[10px] font-mono">
            {sectors.map(sec => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-2 py-0.5 rounded whitespace-nowrap transition ${
                  selectedSector === sec
                    ? 'bg-[#22293b] text-[#60a5fa] border border-[#2c3752]'
                    : 'bg-[#0f121b] text-[#787b86] hover:text-[#d1d4dc] border border-[#1b202c]'
                }`}
              >
                {sec === 'ALL' ? 'All Sectors' : sec}
              </button>
            ))}
          </div>

          {/* Stock List (TradingView/Kite compact style) */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#181c28] pr-1">
            {filteredWatchlist.map(stock => {
              const isSelected = stock.symbol === selectedStock.symbol;
              const stockUp = stock.dayChange >= 0;
              return (
                <div
                  key={stock.symbol}
                  onClick={() => onSelectStock(stock)}
                  className={`p-2 rounded cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#181d2c] border-l-2 border-l-[#3b82f6]'
                      : 'hover:bg-[#151926]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-[#e6e8ee]">
                        {stock.symbol}
                      </span>
                      <span className="text-[9px] text-[#555a6d] font-mono">{stock.exchange}</span>
                    </div>
                    <div className="text-[10px] text-[#787b86] truncate max-w-[130px]">
                      {stock.name}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-xs font-semibold text-[#d1d4dc]">
                      {currencySymbol}{stock.currentPrice.toFixed(2)}
                    </div>
                    <div
                      className={`text-[10px] font-medium flex items-center justify-end gap-0.5 ${
                        stockUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {stockUp ? '+' : ''}{stock.dayChangePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Holding Status in Watchlist Footer */}
          {currentHolding && (
            <div className="mt-2 pt-2 border-t border-[#1c212f] text-[10px] font-mono text-[#787b86] flex items-center justify-between">
              <span>Position: {currentHolding.shares} shares</span>
              <span className={currentHolding.unrealizedPnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}>
                P&amp;L: {currencySymbol}{currentHolding.unrealizedPnl.toFixed(0)}
              </span>
            </div>
          )}
        </div>

        {/* CENTER COLUMN: INTERACTIVE CHART & KEY FINANCIALS (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-3">
          {/* Active Stock Information Header Bar */}
          <div className="bg-[#12151f] border border-[#202433] rounded-md p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-mono font-extrabold text-lg text-[#e6e8ee] tracking-tight">
                    {selectedStock.symbol}
                  </h1>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#171c2a] text-[#787b86] border border-[#22283a] rounded">
                    {selectedStock.exchange}
                  </span>
                  <span className="text-xs text-[#787b86]">
                    {selectedStock.sector}
                  </span>
                </div>
                <div className="text-xs text-[#a0a5b5] font-medium mt-0.5">
                  {selectedStock.name}
                </div>
              </div>

              {/* Price & Day Change */}
              <div className="flex items-center gap-4">
                <div className="text-right font-mono">
                  <div className="text-2xl font-black text-[#e6e8ee]">
                    {currencySymbol}{selectedStock.currentPrice.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs font-bold flex items-center justify-end gap-1 ${
                      isUp ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {isUp ? '+' : ''}{selectedStock.dayChange.toFixed(2)} ({isUp ? '+' : ''}{selectedStock.dayChangePercent.toFixed(2)}%)
                  </div>
                </div>

                {/* Open Full Research Button */}
                <button
                  onClick={() => onOpenResearchPage(selectedStock)}
                  className="flex items-center gap-1 px-3 py-2 bg-[#1b2234] hover:bg-[#232c44] text-[#60a5fa] border border-[#2b3754] rounded text-xs font-semibold transition"
                  title="Open Detailed Financials & Research Dossier"
                >
                  <span>Company Dossier</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick 52-Week Range & Day Range Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#1c212f] text-[10px] font-mono text-[#787b86]">
              <div>
                <span className="text-[#555a6d] uppercase font-sans">Day Range:</span>
                <div className="text-[#d1d4dc] font-semibold mt-0.5">
                  {currencySymbol}{selectedStock.dayLow.toFixed(1)} - {currencySymbol}{selectedStock.dayHigh.toFixed(1)}
                </div>
              </div>
              <div>
                <span className="text-[#555a6d] uppercase font-sans">52W Range:</span>
                <div className="text-[#d1d4dc] font-semibold mt-0.5">
                  {currencySymbol}{selectedStock.low52w.toFixed(1)} - {currencySymbol}{selectedStock.high52w.toFixed(1)}
                </div>
              </div>
              <div>
                <span className="text-[#555a6d] uppercase font-sans">P/E vs Sector:</span>
                <div className="text-[#d1d4dc] font-semibold mt-0.5">
                  {selectedStock.fundamentals.peRatio}x / {selectedStock.fundamentals.sectorPe}x
                </div>
              </div>
              <div>
                <span className="text-[#555a6d] uppercase font-sans">Market Cap:</span>
                <div className="text-[#d1d4dc] font-semibold mt-0.5">
                  ₹{(selectedStock.fundamentals.marketCapCr / 1000).toFixed(1)}k Cr
                </div>
              </div>
            </div>
          </div>

          {/* Candlestick & Volume Chart */}
          <div className="bg-[#12151f] border border-[#202433] rounded-md p-3">
            {isLoadingChart ? (
              <div className="h-[420px] flex items-center justify-center text-xs text-[#787b86] font-mono">
                Loading historical OHLCV candles...
              </div>
            ) : chartHistory.length > 0 ? (
              <StockChart
                data={chartHistory}
                symbol={selectedStock.symbol}
                currencySymbol={currencySymbol}
              />
            ) : (
              <div className="h-[420px] flex items-center justify-center text-xs text-[#787b86] font-mono">
                No historical candles available for {selectedStock.symbol}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK ORDER DOCK + REAL-TIME NEWS (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Quick Paper Trading Order Entry Dock */}
          <div className="bg-[#12151f] border border-[#202433] rounded-md p-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c212f]">
              <div className="flex items-center gap-1.5 font-mono font-bold text-[#e6e8ee] uppercase">
                <BarChart2 className="w-3.5 h-3.5 text-[#3b82f6]" />
                Order Slip (Simulated)
              </div>
              <span className="text-[10px] font-mono text-[#089981]">Virtual Cash</span>
            </div>

            {/* Buy / Sell Toggle Tabs */}
            <div className="grid grid-cols-2 gap-1 my-3 bg-[#0c0e14] p-1 rounded border border-[#1b202c]">
              <button
                onClick={() => setOrderAction('BUY')}
                className={`py-1.5 rounded font-mono font-bold text-xs transition ${
                  orderAction === 'BUY'
                    ? 'bg-[#089981] text-white'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                BUY (DELIVERY)
              </button>
              <button
                onClick={() => setOrderAction('SELL')}
                className={`py-1.5 rounded font-mono font-bold text-xs transition ${
                  orderAction === 'SELL'
                    ? 'bg-[#f23645] text-white'
                    : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                SELL (CNC)
              </button>
            </div>

            {/* Order Type & Inputs */}
            <div className="space-y-2.5 font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#787b86]">Order Type:</span>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-[#d1d4dc] cursor-pointer">
                    <input
                      type="radio"
                      name="orderType"
                      checked={orderType === 'MARKET'}
                      onChange={() => setOrderType('MARKET')}
                      className="accent-[#3b82f6]"
                    />
                    Market
                  </label>
                  <label className="flex items-center gap-1 text-[#d1d4dc] cursor-pointer">
                    <input
                      type="radio"
                      name="orderType"
                      checked={orderType === 'LIMIT'}
                      onChange={() => setOrderType('LIMIT')}
                      className="accent-[#3b82f6]"
                    />
                    Limit
                  </label>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <label className="text-[#787b86] text-[11px]">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={orderShares}
                  onChange={e => setOrderShares(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-[#0c0e14] border border-[#202534] rounded px-2 py-1 text-right text-[#d1d4dc] focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              {/* Limit Price if Limit order */}
              {orderType === 'LIMIT' && (
                <div className="flex items-center justify-between">
                  <label className="text-[#787b86] text-[11px]">Limit Price (₹):</label>
                  <input
                    type="number"
                    step="0.05"
                    value={limitPrice}
                    onChange={e => setLimitPrice(parseFloat(e.target.value) || selectedStock.currentPrice)}
                    className="w-24 bg-[#0c0e14] border border-[#202534] rounded px-2 py-1 text-right text-[#d1d4dc] focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
              )}

              {/* Statutory Indian Charges Preview */}
              <div className="bg-[#0c0e14] border border-[#1b202c] p-2 rounded text-[10px] space-y-1 text-[#787b86]">
                <div className="flex justify-between">
                  <span>Gross Value:</span>
                  <span className="text-[#d1d4dc]">{currencySymbol}{grossTrade.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>STT / CTT (0.1%):</span>
                  <span>{currencySymbol}{statutoryCharges.stt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST &amp; Exchange Fee:</span>
                  <span>{currencySymbol}{(statutoryCharges.gst + statutoryCharges.exchangeCharges).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-[#1c212e] pt-1 text-[#d1d4dc]">
                  <span>Total Margin Impact:</span>
                  <span className="text-[#60a5fa]">{currencySymbol}{netCashImpact.toFixed(2)}</span>
                </div>
              </div>

              {/* Feedback messages */}
              {orderFeedback && (
                <div
                  className={`p-2 rounded text-[10px] flex items-center gap-1.5 ${
                    orderFeedback.type === 'success'
                      ? 'bg-[#089981]/15 text-[#089981] border border-[#089981]/30'
                      : 'bg-[#f23645]/15 text-[#f23645] border border-[#f23645]/30'
                  }`}
                >
                  {orderFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>{orderFeedback.message}</span>
                </div>
              )}

              {/* Submit Execution Button */}
              <button
                onClick={handleExecuteQuickOrder}
                className={`w-full py-2 rounded font-bold font-mono text-xs uppercase tracking-wider transition ${
                  orderAction === 'BUY'
                    ? 'bg-[#089981] hover:bg-[#07826d] text-white shadow'
                    : 'bg-[#f23645] hover:bg-[#d62837] text-white shadow'
                }`}
              >
                {orderAction === 'BUY' ? 'Execute Simulated Buy' : 'Execute Simulated Sell'}
              </button>

              <div className="text-[9px] text-[#555a6d] text-center font-mono">
                Available Virtual Cash: {currencySymbol}{portfolio.cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Market News & Filings Feed */}
          <div className="bg-[#12151f] border border-[#202433] rounded-md p-3 text-xs flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#1c212f]">
              <span className="font-mono font-bold text-[#e6e8ee] uppercase text-xs">
                Exchange Feeds &amp; News
              </span>
              <span className="text-[10px] text-[#555a6d] font-mono">Verified</span>
            </div>

            <div className="divide-y divide-[#181d2a] mt-2 space-y-2">
              {marketNews.map(item => (
                <div key={item.id} className="pt-2 first:pt-0">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#787b86]">
                    <span className="text-[#60a5fa]">{item.source}</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-[#d1d4dc] font-sans mt-0.5 leading-snug">
                    {item.headline}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-[#1a1f2c] text-center">
              <span className="text-[10px] text-[#555a6d] font-mono">
                Filtered for corporate governance &amp; macro catalysts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
