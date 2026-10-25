/**
 * MarketMind AI - Automated Verification Test Suite
 * Tests financial deterministic calculations, Indian statutory taxation,
 * whole-share allocations, and scenario bounds.
 */

import {
  calculateIndianStatutoryCharges,
  calculateBreakEvenPrice,
  calculateWholeShareAllocation,
  calculateHistoricalMetrics,
  calculateValueAtRisk,
  computeResearchScore,
  runFinancialMathSelfTest
} from '../services/financialMath';

import { generateStockForecast } from '../services/forecastingEngine';
import { generateDailyHistory } from '../data/indianMarketData';

export function runAllFinancialTests(): { success: boolean; results: { test: string; passed: boolean; details?: string }[] } {
  const results: { test: string; passed: boolean; details?: string }[] = [];

  // Test 1: Indian Statutory Charges on ₹1,00,000 Buy
  try {
    const buyTax = calculateIndianStatutoryCharges(100000, true, 20);
    const sttExpected = 100; // 0.1% of 100,000
    const stampExpected = 15; // 0.015% of 100,000
    const passed = Math.abs(buyTax.stt - sttExpected) < 0.01 && Math.abs(buyTax.stampDuty - stampExpected) < 0.01;
    results.push({
      test: 'Indian Statutory Delivery Taxes (STT & Stamp Duty)',
      passed,
      details: `STT: ₹${buyTax.stt}, Stamp Duty: ₹${buyTax.stampDuty}, Total Taxes: ₹${buyTax.totalTaxesAndCharges}`
    });
  } catch (e: any) {
    results.push({ test: 'Indian Statutory Delivery Taxes', passed: false, details: e.message });
  }

  // Test 2: Whole Share Allocation with ₹50,000 budget on stock @ ₹2,985.40
  try {
    const alloc = calculateWholeShareAllocation(50000, 2985.40, 20);
    const gross = alloc.shares * 2985.40;
    const totalWithTaxes = gross + alloc.charges.totalTaxesAndCharges;
    const passed = alloc.shares === 16 && totalWithTaxes <= 50000 && alloc.unallocatedCash >= 0;
    results.push({
      test: 'Whole-Share Purchasing Budget Allocation',
      passed,
      details: `Allocated ${alloc.shares} shares, Outlay: ₹${alloc.totalOutlay}, Unallocated: ₹${alloc.unallocatedCash}`
    });
  } catch (e: any) {
    results.push({ test: 'Whole-Share Allocation', passed: false, details: e.message });
  }

  // Test 3: Round-trip Break-even price
  try {
    const bep = calculateBreakEvenPrice(10, 1000, 20);
    const passed = bep > 1000 && bep < 1010;
    results.push({
      test: 'Round-Trip Statutory Break-Even Price',
      passed,
      details: `Buy at ₹1,000.00 -> Break-Even Price: ₹${bep.toFixed(2)}`
    });
  } catch (e: any) {
    results.push({ test: 'Round-Trip Break-Even', passed: false, details: e.message });
  }

  // Test 4: Maximum Drawdown & Volatility
  try {
    const prices = [100, 120, 140, 105, 98, 130];
    const metrics = calculateHistoricalMetrics(prices);
    // Peak is 140, trough is 98 -> (98 - 140) / 140 = -0.30 (-30%)
    const passed = Math.abs(metrics.maxDrawdown - (-0.3)) < 0.02;
    results.push({
      test: 'Historical Maximum Drawdown Computation',
      passed,
      details: `Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(1)}%`
    });
  } catch (e: any) {
    results.push({ test: 'Max Drawdown', passed: false, details: e.message });
  }

  // Test 5: Geometric Brownian Motion Forecasting Ordering
  try {
    const history = generateDailyHistory(1000, 0.22, 0.12, 42);
    const forecast = generateStockForecast('TEST', history, 1000, 25, 22, 1.1);
    const sc = forecast.scenarios['12M'];
    const passed = sc.bearPrice < sc.basePrice && sc.basePrice < sc.bullPrice;
    results.push({
      test: 'Deterministic Scenario Monotonicity (Bear < Base < Bull)',
      passed,
      details: `Bear: ₹${sc.bearPrice} < Base: ₹${sc.basePrice} < Bull: ₹${sc.bullPrice}`
    });
  } catch (e: any) {
    results.push({ test: 'Forecasting Ordering', passed: false, details: e.message });
  }

  // Test 6: Multi-Factor Research Scoring Algorithm
  try {
    const score = computeResearchScore(
      {
        peRatio: 18,
        pbRatio: 2.5,
        evToEbitda: 12,
        dividendYield: 1.5,
        roe: 22,
        roce: 25,
        debtToEquity: 0.2,
        currentRatio: 1.8,
        eps: 55,
        sectorPe: 22,
        sectorPb: 3.0,
        marketCapCr: 500000,
        freeCashFlowYield: 3.5
      },
      {
        rsi14: 55,
        sma20: 1020,
        sma50: 1000,
        sma200: 950,
        beta: 0.9,
        historicalVolatilityAnnualized: 0.18,
        maxDrawdown52w: -0.12,
        cagr3y: 18,
        cagr5y: 20
      }
    );
    const passed = score.totalScore >= 70 && score.tier === 'High Research Potential';
    results.push({
      test: 'Multi-Factor Stock Research Scoring (Quality Firm)',
      passed,
      details: `Total Score: ${score.totalScore}/100, Tier: ${score.tier}`
    });
  } catch (e: any) {
    results.push({ test: 'Research Scoring', passed: false, details: e.message });
  }

  const allPassed = results.every(r => r.passed);
  return { success: allPassed, results };
}

// Execute self test immediately
const testOutput = runAllFinancialTests();
console.log(`[MarketMind Test Runner] All tests passed: ${testOutput.success}`);
testOutput.results.forEach(r => {
  console.log(`  ${r.passed ? '✓' : '✗'} ${r.test}: ${r.details || ''}`);
});
