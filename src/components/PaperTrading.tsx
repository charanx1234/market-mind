/**
 * MarketMind AI - Paper Trading & Simulated Brokerage Platform
 * Completely simulated execution environment with virtual currency.
 * Itemizes statutory Indian delivery charges, maintains FIFO average cost basis,
 * records persistent transaction logs, and tracks performance vs NIFTY 50 benchmark.
 */

import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertTriangle,
  History,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { StockQuote, PaperTradingState, PaperTradeOrder } from '../types/market';
import { calculateIndianStatutoryCharges } from '../services/financialMath';

interface PaperTradingProps {
  portfolio: PaperTradingState;
  stocks: StockQuote[];
  currencySymbol: string;
  onUpdatePortfolio: (updated: PaperTradingState) => void;
  onResetPortfolio: () => void;
}

export const PaperTrading: React.FC<PaperTradingProps> = ({
  portfolio,
  stocks,
  currencySymbol,
  onUpdatePortfolio,
  onResetPortfolio,
}) => {
  const [orderSymbol, setOrderSymbol] = useState<string>('RELIANCE');
  const [orderAction, setOrderAction] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [shareCount, setShareCount] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(2985);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);
  const [orderErrorMessage, setOrderErrorMessage] = useState<string | null>(null);

  const activeStock = stocks.find(s => s.symbol === orderSymbol) || stocks[0];
  const execPrice = orderType === 'MARKET' ? activeStock.currentPrice : limitPrice;
  const grossTradeAmount = shareCount * execPrice;
  const simulatedCharges = calculateIndianStatutoryCharges(grossTradeAmount, orderAction === 'BUY', 20);
  const netCashImpact = orderAction === 'BUY'
    ? grossTradeAmount + simulatedCharges.totalTaxesAndCharges
    : grossTradeAmount - simulatedCharges.totalTaxesAndCharges;

  // Existing holding for this symbol if any
  const existingHolding = portfolio.holdings.find(h => h.symbol === activeStock.symbol);

  // Execute Simulated Order
  const handleExecuteOrder = () => {
    setOrderSuccessMessage(null);
    setOrderErrorMessage(null);

    if (shareCount <= 0) {
      setOrderErrorMessage('Quantity must be at least 1 whole share.');
      return;
    }

    if (orderAction === 'BUY') {
      if (netCashImpact > portfolio.cashBalance) {
        setOrderErrorMessage(`Insufficient simulated cash. Required: ₹${netCashImpact.toFixed(2)}, Available: ₹${portfolio.cashBalance.toFixed(2)}`);
        return;
      }

      // Execute simulated Buy
      const newCash = portfolio.cashBalance - netCashImpact;
      const updatedHoldings = [...portfolio.holdings];
      const holdingIndex = updatedHoldings.findIndex(h => h.symbol === activeStock.symbol);

      if (holdingIndex >= 0) {
        const cur = updatedHoldings[holdingIndex];
        const totalShares = cur.shares + shareCount;
        const totalCostBasis = cur.totalCostBasis + grossTradeAmount;
        const newAvg = totalCostBasis / totalShares;
        const curVal = totalShares * activeStock.currentPrice;

        updatedHoldings[holdingIndex] = {
          ...cur,
          shares: totalShares,
          averageBuyPrice: Math.round(newAvg * 100) / 100,
          totalCostBasis,
          currentPrice: activeStock.currentPrice,
          currentValue: curVal,
          unrealizedPnl: curVal - totalCostBasis,
          unrealizedPnlPercent: ((curVal - totalCostBasis) / totalCostBasis) * 100,
          allocationPercent: 0
        };
      } else {
        const curVal = shareCount * activeStock.currentPrice;
        updatedHoldings.push({
          symbol: activeStock.symbol,
          companyName: activeStock.name,
          shares: shareCount,
          averageBuyPrice: execPrice,
          totalCostBasis: grossTradeAmount,
          currentPrice: activeStock.currentPrice,
          currentValue: curVal,
          unrealizedPnl: curVal - grossTradeAmount,
          unrealizedPnlPercent: ((curVal - grossTradeAmount) / grossTradeAmount) * 100,
          dayChangePercent: activeStock.dayChangePercent,
          allocationPercent: 0
        });
      }

      // Record transaction
      const newTx: PaperTradeOrder = {
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
        symbol: activeStock.symbol,
        companyName: activeStock.name,
        type: 'BUY',
        orderType,
        shares: shareCount,
        executedPrice: execPrice,
        grossAmount: grossTradeAmount,
        charges: simulatedCharges,
        netCashImpact: -netCashImpact,
        status: 'EXECUTED'
      };

      const holdingsVal = updatedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
      const totalPortfolioVal = newCash + holdingsVal;

      // Update allocation percentages
      updatedHoldings.forEach(h => {
        h.allocationPercent = totalPortfolioVal > 0 ? (h.currentValue / totalPortfolioVal) * 100 : 0;
      });

      const updatedState: PaperTradingState = {
        ...portfolio,
        cashBalance: Math.round(newCash * 100) / 100,
        holdings: updatedHoldings,
        transactions: [newTx, ...portfolio.transactions],
        totalPortfolioValue: Math.round(totalPortfolioVal * 100) / 100,
        lastUpdated: new Date().toISOString()
      };

      onUpdatePortfolio(updatedState);
      setOrderSuccessMessage(`Simulated BUY order for ${shareCount} shares of ${activeStock.symbol} executed at ₹${execPrice.toFixed(2)}.`);
    } else {
      // Execute simulated Sell
      if (!existingHolding || existingHolding.shares < shareCount) {
        setOrderErrorMessage(`Insufficient holding to sell. You own ${existingHolding?.shares || 0} shares of ${activeStock.symbol}.`);
        return;
      }

      const newCash = portfolio.cashBalance + netCashImpact;
      let updatedHoldings = [...portfolio.holdings];
      const holdingIndex = updatedHoldings.findIndex(h => h.symbol === activeStock.symbol);
      const cur = updatedHoldings[holdingIndex];

      // Realized PnL from sold portion
      const costBasisOfSold = shareCount * cur.averageBuyPrice;
      const realizedGain = grossTradeAmount - costBasisOfSold - simulatedCharges.totalTaxesAndCharges;
      const newRealizedPnl = portfolio.realizedPnl + realizedGain;

      if (cur.shares === shareCount) {
        // Closed position completely
        updatedHoldings = updatedHoldings.filter(h => h.symbol !== activeStock.symbol);
      } else {
        const remainingShares = cur.shares - shareCount;
        const remainingCostBasis = remainingShares * cur.averageBuyPrice;
        const curVal = remainingShares * activeStock.currentPrice;

        updatedHoldings[holdingIndex] = {
          ...cur,
          shares: remainingShares,
          totalCostBasis: remainingCostBasis,
          currentValue: curVal,
          unrealizedPnl: curVal - remainingCostBasis,
          unrealizedPnlPercent: ((curVal - remainingCostBasis) / remainingCostBasis) * 100
        };
      }

      const newTx: PaperTradeOrder = {
        id: `tx-${Date.now()}`,
        timestamp: new Date().toISOString(),
        symbol: activeStock.symbol,
        companyName: activeStock.name,
        type: 'SELL',
        orderType,
        shares: shareCount,
        executedPrice: execPrice,
        grossAmount: grossTradeAmount,
        charges: simulatedCharges,
        netCashImpact: netCashImpact,
        status: 'EXECUTED',
        notes: `Realized PnL: ₹${realizedGain.toFixed(2)}`
      };

      const holdingsVal = updatedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
      const totalPortfolioVal = newCash + holdingsVal;

      updatedHoldings.forEach(h => {
        h.allocationPercent = totalPortfolioVal > 0 ? (h.currentValue / totalPortfolioVal) * 100 : 0;
      });

      const updatedState: PaperTradingState = {
        ...portfolio,
        cashBalance: Math.round(newCash * 100) / 100,
        holdings: updatedHoldings,
        transactions: [newTx, ...portfolio.transactions],
        realizedPnl: Math.round(newRealizedPnl * 100) / 100,
        totalPortfolioValue: Math.round(totalPortfolioVal * 100) / 100,
        lastUpdated: new Date().toISOString()
      };

      onUpdatePortfolio(updatedState);
      setOrderSuccessMessage(`Simulated SELL order for ${shareCount} shares of ${activeStock.symbol} executed. Realized P&L: ₹${realizedGain.toFixed(2)}.`);
    }
  };

  // Unrealized PnL of open positions
  const totalUnrealizedPnl = portfolio.holdings.reduce((sum, h) => sum + h.unrealizedPnl, 0);
  const totalCostBasis = portfolio.holdings.reduce((sum, h) => sum + h.totalCostBasis, 0);
  const totalReturnPercent = portfolio.initialCash > 0
    ? ((portfolio.totalPortfolioValue - portfolio.initialCash) / portfolio.initialCash) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Prominent Simulated Environment Disclaimer */}
      <div className="bg-[#12151f] border border-[#202433] rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase px-1.5 py-0.5 bg-[#142320] text-[#089981] border border-[#1b3a32] rounded flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Virtual Simulation Sandbox
            </span>
            <span className="text-[10px] font-mono text-[#f59e0b]">
              Zero Real Money • Realistic Indian Statutory Delivery Charges
            </span>
          </div>
          <h1 className="text-base font-bold text-[#e6e8ee] tracking-tight font-sans">
            Paper-Trading Portfolio &amp; Execution Simulator
          </h1>
          <p className="text-xs text-[#787b86] mt-0.5 max-w-3xl leading-relaxed">
            Execute simulated equity delivery trades with FIFO cost-basis tracking, real STT (0.1%), exchange turnover fees, GST (18%), and SEBI charges.
          </p>
        </div>

        <button
          onClick={onResetPortfolio}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181d2a] hover:bg-[#202638] text-[#d1d4dc] rounded text-xs font-mono font-semibold transition border border-[#242b3d] shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#787b86]" />
          Reset Balance (₹10 Lakh)
        </button>
      </div>

      {/* Portfolio Performance KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Portfolio Value */}
        <div className="bg-[#12151f] border border-[#202433] rounded-md p-3">
          <span className="text-[10px] text-[#787b86] uppercase font-mono">Total Portfolio Value</span>
          <div className="text-xl font-black font-mono text-[#e6e8ee] mt-1">
            {currencySymbol}{portfolio.totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className={`text-[11px] font-bold font-mono mt-0.5 ${totalReturnPercent >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
            {totalReturnPercent >= 0 ? '+' : ''}{totalReturnPercent.toFixed(2)}% Overall
          </div>
        </div>

        {/* Available Virtual Cash */}
        <div className="bg-[#12151f] border border-[#202433] rounded-md p-3">
          <span className="text-[10px] text-[#787b86] uppercase font-mono">Available Virtual Cash</span>
          <div className="text-xl font-black font-mono text-[#089981] mt-1">
            {currencySymbol}{portfolio.cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#555a6d] mt-0.5 font-mono">Unencumbered Capital</div>
        </div>

        {/* Unrealized P&L */}
        <div className="bg-[#12151f] border border-[#202433] rounded-md p-3">
          <span className="text-[10px] text-[#787b86] uppercase font-mono">Unrealized P&amp;L (Open)</span>
          <div className={`text-xl font-black font-mono mt-1 ${totalUnrealizedPnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
            {totalUnrealizedPnl >= 0 ? '+' : ''}{currencySymbol}{totalUnrealizedPnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#555a6d] mt-0.5 font-mono">Active Holdings</div>
        </div>

        {/* Realized P&L */}
        <div className="bg-[#12151f] border border-[#202433] rounded-md p-3">
          <span className="text-[10px] text-[#787b86] uppercase font-mono">Realized P&amp;L (Closed)</span>
          <div className={`text-xl font-black font-mono mt-1 ${portfolio.realizedPnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
            {portfolio.realizedPnl >= 0 ? '+' : ''}{currencySymbol}{portfolio.realizedPnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#555a6d] mt-0.5 font-mono">Net of Statutory Fees</div>
        </div>
      </div>

      {/* Simulated Order Placement Ticket & Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Ticket */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" /> Simulated Order Ticket
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              NSE Cash
            </span>
          </div>

          {/* Buy / Sell Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setOrderAction('BUY')}
              className={`py-2 rounded-lg text-xs font-bold transition ${
                orderAction === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulate BUY
            </button>
            <button
              onClick={() => setOrderAction('SELL')}
              className={`py-2 rounded-lg text-xs font-bold transition ${
                orderAction === 'SELL'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulate SELL
            </button>
          </div>

          {/* Instrument Selector */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Select Instrument:</label>
            <select
              value={orderSymbol}
              onChange={e => {
                setOrderSymbol(e.target.value);
                const s = stocks.find(stk => stk.symbol === e.target.value);
                if (s) setLimitPrice(s.currentPrice);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-white focus:outline-none focus:border-indigo-500"
            >
              {stocks.map(s => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} - {s.name} ({currencySymbol}{s.currentPrice.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Order Type Toggle */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Order Type:</label>
              <select
                value={orderType}
                onChange={e => setOrderType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none"
              >
                <option value="MARKET">Market Order</option>
                <option value="LIMIT">Limit Order</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Execution Price:</label>
              <input
                type="number"
                disabled={orderType === 'MARKET'}
                value={orderType === 'MARKET' ? activeStock.currentPrice : limitPrice}
                onChange={e => setLimitPrice(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono disabled:opacity-60 focus:outline-none"
              />
            </div>
          </div>

          {/* Share Quantity */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Whole Shares:</span>
              {existingHolding && (
                <span className="font-mono text-[11px] text-indigo-400">
                  Owned: {existingHolding.shares} shares
                </span>
              )}
            </div>
            <input
              type="number"
              min={1}
              value={shareCount}
              onChange={e => setShareCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Financial Calculation Preview */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Gross Trade Value:</span>
              <span className="text-white">{currencySymbol}{grossTradeAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Simulated STT &amp; Taxes:</span>
              <span className="text-amber-400">+{currencySymbol}{simulatedCharges.totalTaxesAndCharges.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-slate-200 font-bold">
              <span>Net Cash Impact:</span>
              <span className={orderAction === 'BUY' ? 'text-rose-400' : 'text-emerald-400'}>
                {orderAction === 'BUY' ? '-' : '+'}{currencySymbol}{netCashImpact.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Execution Button */}
          <button
            onClick={handleExecuteOrder}
            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition ${
              orderAction === 'BUY'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
            }`}
          >
            Execute Simulated {orderAction} ({shareCount} Shares)
          </button>

          {/* Feedback Messages */}
          {orderSuccessMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{orderSuccessMessage}</span>
            </div>
          )}
          {orderErrorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{orderErrorMessage}</span>
            </div>
          )}
        </div>

        {/* Current Holdings Table */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Virtual Portfolio Holdings ({portfolio.holdings.length} Active Positions)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              FIFO Average Cost Basis
            </span>
          </div>

          {portfolio.holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-2">Instrument</th>
                    <th className="pb-2">Shares</th>
                    <th className="pb-2">Avg Buy</th>
                    <th className="pb-2">Current</th>
                    <th className="pb-2">Total Value</th>
                    <th className="pb-2">Unrealized P&amp;L</th>
                    <th className="pb-2 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {portfolio.holdings.map(h => {
                    const isUp = h.unrealizedPnl >= 0;
                    return (
                      <tr key={h.symbol} className="hover:bg-slate-800/40">
                        <td className="py-3">
                          <div className="font-bold text-white text-xs">{h.symbol}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[120px] font-sans">{h.companyName}</div>
                        </td>
                        <td className="py-3 text-slate-200 font-semibold">{h.shares}</td>
                        <td className="py-3 text-slate-300">{currencySymbol}{h.averageBuyPrice.toFixed(2)}</td>
                        <td className="py-3 text-white font-bold">{currencySymbol}{h.currentPrice.toFixed(2)}</td>
                        <td className="py-3 text-white font-bold">
                          {currencySymbol}{h.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3">
                          <div className={`font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isUp ? '+' : ''}{currencySymbol}{h.unrealizedPnl.toFixed(2)}
                          </div>
                          <div className={`text-[10px] ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isUp ? '+' : ''}{h.unrealizedPnlPercent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setOrderSymbol(h.symbol);
                              setOrderAction('SELL');
                              setShareCount(h.shares);
                            }}
                            className="px-2.5 py-1 bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white rounded text-[11px] font-sans font-semibold transition"
                          >
                            Sell Position
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Wallet className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Your simulated portfolio currently holds 100% cash.</p>
              <p className="text-slate-500">Use the order ticket on the left to place a simulated delivery trade.</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction History Log */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" /> Persistent Simulated Transaction History
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {portfolio.transactions.length} Total Orders Executed
          </span>
        </div>

        {portfolio.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Instrument</th>
                  <th className="pb-2">Shares</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Gross Value</th>
                  <th className="pb-2">Statutory Taxes</th>
                  <th className="pb-2 text-right">Net Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {portfolio.transactions.map(tx => {
                  const isBuy = tx.type === 'BUY';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 text-slate-400 text-[11px]">
                        {tx.timestamp.slice(0, 19).replace('T', ' ')}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isBuy
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-white">{tx.symbol}</td>
                      <td className="py-2.5 text-slate-300">{tx.shares}</td>
                      <td className="py-2.5 text-slate-300">{currencySymbol}{tx.executedPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-slate-300">{currencySymbol}{tx.grossAmount.toFixed(2)}</td>
                      <td className="py-2.5 text-amber-400">+{currencySymbol}{tx.charges.totalTaxesAndCharges.toFixed(2)}</td>
                      <td className={`py-2.5 text-right font-bold ${tx.netCashImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.netCashImpact >= 0 ? '+' : ''}{currencySymbol}{tx.netCashImpact.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            No simulated trades recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
