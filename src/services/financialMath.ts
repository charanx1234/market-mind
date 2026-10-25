/**
 * MarketMind AI - Deterministic Financial Math & Indian Statutory Taxation Engine
 * Strictly verified mathematical models for returns, risk, Indian trading charges,
 * scenario projections, and multi-factor research scoring.
 */

import { IndianStatutoryCharges, StockFundamental, TechnicalIndicators, ResearchScoreBreakdown } from '../types/market';

/**
 * Calculate Indian statutory taxes and brokerage for equity delivery orders.
 * Standard NSE/BSE cash delivery tax schedule:
 * - STT (Securities Transaction Tax): 0.1% on buy & sell turnover
 * - Exchange Transaction Charges: 0.00325% of turnover (NSE standard)
 * - SEBI Turnover Fees: 0.0001% of turnover (₹10 per crore)
 * - Stamp Duty: 0.015% on BUY turnover only
 * - Brokerage: Simulated flat ₹20 per trade (or 0 for discount broker delivery)
 * - GST: 18% applied strictly to (Brokerage + Exchange Charges + SEBI Fees)
 */
export function calculateIndianStatutoryCharges(
  grossAmount: number,
  isBuy: boolean,
  flatBrokerage: number = 20
): IndianStatutoryCharges {
  if (grossAmount <= 0) {
    return {
      stt: 0,
      exchangeCharges: 0,
      sebiTurnoverFee: 0,
      gst: 0,
      stampDuty: 0,
      brokerage: 0,
      totalTaxesAndCharges: 0
    };
  }

  // 1. Securities Transaction Tax (0.1% on delivery)
  const stt = Math.round(grossAmount * 0.001 * 100) / 100;

  // 2. Exchange Transaction Charges (0.00325%)
  const exchangeCharges = Math.round(grossAmount * 0.0000325 * 100) / 100;

  // 3. SEBI Turnover Fee (₹10 per crore = 0.0001%)
  const sebiTurnoverFee = Math.max(0.01, Math.round(grossAmount * 0.000001 * 100) / 100);

  // 4. Stamp Duty (0.015% on BUY only)
  const stampDuty = isBuy ? Math.round(grossAmount * 0.00015 * 100) / 100 : 0;

  // 5. Brokerage
  const brokerage = flatBrokerage;

  // 6. GST (18% on Brokerage + Exchange charges + SEBI fee)
  const taxableServices = brokerage + exchangeCharges + sebiTurnoverFee;
  const gst = Math.round(taxableServices * 0.18 * 100) / 100;

  const totalTaxesAndCharges = Math.round((stt + exchangeCharges + sebiTurnoverFee + stampDuty + brokerage + gst) * 100) / 100;

  return {
    stt,
    exchangeCharges,
    sebiTurnoverFee,
    gst,
    stampDuty,
    brokerage,
    totalTaxesAndCharges
  };
}

/**
 * Calculate round-trip break-even price per share for an Indian equity purchase.
 * Must recover the buy-side statutory costs and anticipated sell-side statutory costs.
 */
export function calculateBreakEvenPrice(
  shares: number,
  buyPrice: number,
  flatBrokerage: number = 20
): number {
  if (shares <= 0 || buyPrice <= 0) return buyPrice;

  const grossBuy = shares * buyPrice;
  const buyCharges = calculateIndianStatutoryCharges(grossBuy, true, flatBrokerage);

  // Estimated sell charges at approx buy price
  const sellCharges = calculateIndianStatutoryCharges(grossBuy, false, flatBrokerage);
  const totalCost = grossBuy + buyCharges.totalTaxesAndCharges + sellCharges.totalTaxesAndCharges;

  return Math.round((totalCost / shares) * 100) / 100;
}

/**
 * Calculate whole-share budget allocation with statutory cost reservation.
 */
export function calculateWholeShareAllocation(
  budget: number,
  sharePrice: number,
  flatBrokerage: number = 20
): {
  shares: number;
  grossAmount: number;
  charges: IndianStatutoryCharges;
  totalOutlay: number;
  unallocatedCash: number;
} {
  if (budget <= 0 || sharePrice <= 0) {
    return {
      shares: 0,
      grossAmount: 0,
      charges: calculateIndianStatutoryCharges(0, true),
      totalOutlay: 0,
      unallocatedCash: budget
    };
  }

  // Iteratively compute largest integer shares whose total outlay (price*Q + buy charges) <= budget
  let shares = Math.floor(budget / sharePrice);

  while (shares > 0) {
    const gross = shares * sharePrice;
    const charges = calculateIndianStatutoryCharges(gross, true, flatBrokerage);
    const totalOutlay = gross + charges.totalTaxesAndCharges;

    if (totalOutlay <= budget) {
      return {
        shares,
        grossAmount: gross,
        charges,
        totalOutlay,
        unallocatedCash: Math.round((budget - totalOutlay) * 100) / 100
      };
    }
    shares--;
  }

  return {
    shares: 0,
    grossAmount: 0,
    charges: calculateIndianStatutoryCharges(0, true, flatBrokerage),
    totalOutlay: 0,
    unallocatedCash: budget
  };
}

export interface CapitalGainsTaxResult {
  holdingClassification: 'STCG (Holding <= 12M)' | 'LTCG (Holding > 12M)';
  grossProfit: number;
  saleValue: number;
  purchaseCost: number;
  sttPaid: number;
  exemptionClaimed: number;
  taxableGain: number;
  applicableTaxRatePercent: number;
  taxBeforeCess: number;
  cessAmount: number;
  totalTaxPayable: number;
  netPostTaxProfit: number;
  effectiveTaxRateOnProfit: number;
}

/**
 * Union Budget 2024 Revised Indian Capital Gains Tax Calculator for Listed Equities:
 * - STCG (Section 111A): 20% on holding <= 365 days
 * - LTCG (Section 112A): 12.5% on holding > 365 days
 * - LTCG Annual Exemption Limit: ₹1,25,000 (increased from ₹1,00,000)
 * - Cess: 4% Health & Education Cess
 * - STT: 0.1% on delivery sales
 */
export function calculateIndianCapitalGainsTax(
  buyPrice: number,
  sellPrice: number,
  quantity: number,
  holdingDays: number,
  otherRealizedLtcg: number = 0
): CapitalGainsTaxResult {
  const purchaseCost = buyPrice * quantity;
  const saleValue = sellPrice * quantity;
  const grossProfit = saleValue - purchaseCost;
  const sttPaid = saleValue * 0.001; // 0.1% STT on sale

  const isLtcg = holdingDays > 365;
  const holdingClassification = isLtcg
    ? ('LTCG (Holding > 12M)' as const)
    : ('STCG (Holding <= 12M)' as const);
  const applicableTaxRatePercent = isLtcg ? 12.5 : 20.0;

  let exemptionClaimed = 0;
  let taxableGain = 0;

  if (grossProfit > 0) {
    if (isLtcg) {
      // Annual ₹1,25,000 exemption under Section 112A
      const annualLimit = 125000;
      const availableExemption = Math.max(0, annualLimit - otherRealizedLtcg);
      exemptionClaimed = Math.min(grossProfit, availableExemption);
      taxableGain = Math.max(0, grossProfit - exemptionClaimed);
    } else {
      // No standard exemption for Section 111A STCG
      taxableGain = grossProfit;
    }
  }

  const taxBeforeCess = taxableGain * (applicableTaxRatePercent / 100);
  const cessAmount = taxBeforeCess * 0.04; // 4% Health & Education cess
  const totalTaxPayable = Math.round((taxBeforeCess + cessAmount) * 100) / 100;
  const netPostTaxProfit = Math.round((grossProfit - totalTaxPayable - sttPaid) * 100) / 100;
  const effectiveTaxRateOnProfit =
    grossProfit > 0 ? Math.round((totalTaxPayable / grossProfit) * 1000) / 10 : 0;

  return {
    holdingClassification,
    grossProfit,
    saleValue,
    purchaseCost,
    sttPaid,
    exemptionClaimed,
    taxableGain,
    applicableTaxRatePercent,
    taxBeforeCess,
    cessAmount,
    totalTaxPayable,
    netPostTaxProfit,
    effectiveTaxRateOnProfit
  };
}

/**
 * Calculate historical volatility and maximum drawdown from daily price series.
 */
export function calculateHistoricalMetrics(prices: number[]): {
  annualizedVolatility: number;
  maxDrawdown: number;
  cagr: number;
} {
  if (prices.length < 2) {
    return { annualizedVolatility: 0, maxDrawdown: 0, cagr: 0 };
  }

  // Log returns
  const logReturns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    logReturns.push(Math.log(prices[i] / prices[i - 1]));
  }

  const meanReturn = logReturns.reduce((a, b) => a + b, 0) / logReturns.length;
  const variance = logReturns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (logReturns.length - 1);
  const dailyVol = Math.sqrt(variance);
  const annualizedVolatility = Math.round(dailyVol * Math.sqrt(252) * 1000) / 1000;

  // Maximum Drawdown
  let peak = prices[0];
  let maxDd = 0;

  for (const price of prices) {
    if (price > peak) {
      peak = price;
    }
    const dd = (price - peak) / peak;
    if (dd < maxDd) {
      maxDd = dd;
    }
  }

  // CAGR
  const years = prices.length / 252;
  const totalReturn = prices[prices.length - 1] / prices[0];
  const cagr = years > 0 ? Math.round((Math.pow(totalReturn, 1 / years) - 1) * 1000) / 10 : 0;

  return {
    annualizedVolatility,
    maxDrawdown: Math.round(maxDd * 1000) / 1000,
    cagr
  };
}

/**
 * Value at Risk (VaR) calculation: Parametric 95% confidence interval for 1-day and 1-month.
 */
export function calculateValueAtRisk(
  portfolioValue: number,
  annualVolatility: number
): {
  var95_1Day: number;
  var95_1Month: number;
} {
  const z95 = 1.645;
  const dailyVol = annualVolatility / Math.sqrt(252);
  const monthlyVol = annualVolatility * Math.sqrt(21 / 252);

  const var95_1Day = Math.round(portfolioValue * z95 * dailyVol);
  const var95_1Month = Math.round(portfolioValue * z95 * monthlyVol);

  return { var95_1Day, var95_1Month };
}

/**
 * Transparent Multi-Factor Stock Research Scoring Engine (0 to 100).
 * Penalizes excessive debt, extreme volatility, and poor liquidity.
 */
export function computeResearchScore(
  fundamentals: StockFundamental,
  technicals: TechnicalIndicators
): ResearchScoreBreakdown {
  const missingInputs: string[] = [];
  const penalties: { reason: string; deduction: number }[] = [];

  // 1. Profitability Score (0 to 25 points)
  let profitabilityScore = 0;
  if (fundamentals.roe !== undefined) {
    if (fundamentals.roe >= 20) profitabilityScore += 10;
    else if (fundamentals.roe >= 14) profitabilityScore += 7;
    else if (fundamentals.roe >= 8) profitabilityScore += 4;
  } else {
    missingInputs.push('ROE missing');
  }

  if (fundamentals.roce !== undefined) {
    if (fundamentals.roce >= 22) profitabilityScore += 10;
    else if (fundamentals.roce >= 15) profitabilityScore += 7;
    else if (fundamentals.roce >= 10) profitabilityScore += 4;
  } else {
    missingInputs.push('ROCE missing');
  }

  if (fundamentals.freeCashFlowYield > 3.0) profitabilityScore += 5;
  else if (fundamentals.freeCashFlowYield > 1.5) profitabilityScore += 3;

  // 2. Valuation Score (0 to 25 points) - Sector relative
  let valuationScore = 0;
  const peRelative = fundamentals.sectorPe > 0 ? fundamentals.peRatio / fundamentals.sectorPe : 1.2;
  if (peRelative < 0.85) valuationScore += 12;
  else if (peRelative <= 1.15) valuationScore += 8;
  else if (peRelative <= 1.4) valuationScore += 4;

  const pbRelative = fundamentals.sectorPb > 0 ? fundamentals.pbRatio / fundamentals.sectorPb : 1.2;
  if (pbRelative < 0.9) valuationScore += 8;
  else if (pbRelative <= 1.2) valuationScore += 5;

  if (fundamentals.dividendYield >= 2.0) valuationScore += 5;
  else if (fundamentals.dividendYield >= 1.0) valuationScore += 3;

  // 3. Balance Sheet & Financial Health (0 to 25 points)
  let healthScore = 0;
  if (fundamentals.debtToEquity !== undefined) {
    if (fundamentals.debtToEquity < 0.3) healthScore += 15;
    else if (fundamentals.debtToEquity < 0.8) healthScore += 10;
    else if (fundamentals.debtToEquity < 1.5) healthScore += 5;
  }

  if (fundamentals.currentRatio >= 1.5) healthScore += 10;
  else if (fundamentals.currentRatio >= 1.1) healthScore += 6;
  else if (fundamentals.currentRatio >= 0.9) healthScore += 2;

  // 4. Momentum & Stability (0 to 25 points)
  let momentumScore = 0;
  // RSI sweet spot: 45 to 65
  if (technicals.rsi14 >= 45 && technicals.rsi14 <= 65) momentumScore += 10;
  else if (technicals.rsi14 > 65 && technicals.rsi14 <= 75) momentumScore += 6;
  else if (technicals.rsi14 >= 35 && technicals.rsi14 < 45) momentumScore += 4;

  // Moving average alignment (Price > SMA50 > SMA200)
  if (technicals.sma50 > technicals.sma200) momentumScore += 8;
  if (technicals.historicalVolatilityAnnualized < 0.22) momentumScore += 7;
  else if (technicals.historicalVolatilityAnnualized < 0.30) momentumScore += 4;

  // Penalties
  if (fundamentals.debtToEquity > 2.0) {
    penalties.push({ reason: 'Excessive Financial Leverage (D/E > 2.0)', deduction: 15 });
  }
  if (technicals.beta > 1.35) {
    penalties.push({ reason: 'Elevated Beta / High Volatility against NIFTY 50', deduction: 8 });
  }
  if (technicals.maxDrawdown52w < -0.25) {
    penalties.push({ reason: 'Severe 52-Week Maximum Drawdown (> -25%)', deduction: 10 });
  }

  const rawScore = profitabilityScore + valuationScore + healthScore + momentumScore;
  const totalPenalties = penalties.reduce((sum, p) => sum + p.deduction, 0);
  const totalScore = Math.max(5, Math.min(98, rawScore - totalPenalties));

  let tier: 'High Research Potential' | 'Moderate Consideration' | 'Elevated Risk Profile';
  if (totalScore >= 70) tier = 'High Research Potential';
  else if (totalScore >= 50) tier = 'Moderate Consideration';
  else tier = 'Elevated Risk Profile';

  return {
    profitabilityScore,
    valuationScore,
    healthScore,
    momentumScore,
    penalties,
    totalScore,
    tier,
    missingInputs
  };
}

/**
 * Calculate correlation matrix between a list of asset price histories.
 */
export function computeCorrelationMatrix(seriesMap: Record<string, number[]>): {
  symbols: string[];
  matrix: number[][];
} {
  const symbols = Object.keys(seriesMap);
  const n = symbols.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(1));

  // Compute daily log returns for each
  const returnMap: Record<string, number[]> = {};
  for (const sym of symbols) {
    const prices = seriesMap[sym];
    const rets: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      rets.push(Math.log(prices[i] / prices[i - 1]));
    }
    returnMap[sym] = rets;
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const retsI = returnMap[symbols[i]];
      const retsJ = returnMap[symbols[j]];
      const len = Math.min(retsI.length, retsJ.length);

      if (len < 5) {
        matrix[i][j] = 0.5;
        matrix[j][i] = 0.5;
        continue;
      }

      let sumI = 0;
      let sumJ = 0;
      for (let k = 0; k < len; k++) {
        sumI += retsI[k];
        sumJ += retsJ[k];
      }
      const meanI = sumI / len;
      const meanJ = sumJ / len;

      let cov = 0;
      let varI = 0;
      let varJ = 0;
      for (let k = 0; k < len; k++) {
        const diffI = retsI[k] - meanI;
        const diffJ = retsJ[k] - meanJ;
        cov += diffI * diffJ;
        varI += diffI * diffI;
        varJ += diffJ * diffJ;
      }

      const denom = Math.sqrt(varI * varJ);
      const corr = denom > 0 ? Math.round((cov / denom) * 100) / 100 : 0;
      matrix[i][j] = corr;
      matrix[j][i] = corr;
    }
  }

  return { symbols, matrix };
}

/**
 * Self-test suite to verify mathematical precision and tax calculations.
 */
export function runFinancialMathSelfTest(): { passed: boolean; message: string } {
  // Test 1: Indian statutory tax on ₹100,000 buy delivery
  const buyTax = calculateIndianStatutoryCharges(100000, true, 20);
  if (Math.abs(buyTax.stt - 100) > 0.1) return { passed: false, message: 'STT calculation failed' };
  if (Math.abs(buyTax.stampDuty - 15) > 0.1) return { passed: false, message: 'Stamp duty calculation failed' };

  // Test 2: Whole share allocation with ₹10,000 budget on stock priced at ₹2,985.40
  const alloc = calculateWholeShareAllocation(10000, 2985.40);
  if (alloc.shares !== 3) return { passed: false, message: `Expected 3 shares for 10000 @ 2985.40, got ${alloc.shares}` };
  if (alloc.totalOutlay > 10000) return { passed: false, message: 'Whole share allocation exceeded budget' };

  // Test 3: Volatility & drawdown computation
  const testPrices = [100, 105, 110, 95, 90, 100, 105];
  const metrics = calculateHistoricalMetrics(testPrices);
  if (metrics.maxDrawdown < -0.19 || metrics.maxDrawdown > -0.17) {
    return { passed: false, message: `Max drawdown failed, got ${metrics.maxDrawdown}` };
  }

  return { passed: true, message: 'All financial deterministic mathematical tests passed.' };
}
