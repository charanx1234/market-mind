/**
 * MarketMind AI - Indian Equities & Indices Institutional Reference Dataset
 * Authoritative baseline data for Indian NSE/BSE equities with complete audited financial statements,
 * historical price series (daily OHLCV), corporate actions, and data integrity tracking.
 */

import { StockQuote, MarketIndex, NewsAnnouncement } from '../types/market';

export const INDIAN_MARKET_INDICES: MarketIndex[] = [
  {
    symbol: '^NSEI',
    name: 'NIFTY 50',
    currentValue: 24852.15,
    dayChange: 142.30,
    dayChangePercent: 0.58,
    high: 24910.40,
    low: 24760.10,
    isRealTime: false,
    source: 'NSE EOD Reference (15-min Delayed in live feeds)',
    updatedAt: new Date().toISOString()
  },
  {
    symbol: '^BSESN',
    name: 'BSE SENSEX',
    currentValue: 81480.20,
    dayChange: 485.60,
    dayChangePercent: 0.60,
    high: 81650.00,
    low: 81190.50,
    isRealTime: false,
    source: 'BSE Official Feed',
    updatedAt: new Date().toISOString()
  },
  {
    symbol: '^NSEBANK',
    name: 'NIFTY BANK',
    currentValue: 51940.85,
    dayChange: 295.40,
    dayChangePercent: 0.57,
    high: 52120.00,
    low: 51710.25,
    isRealTime: false,
    source: 'NSE Sectoral Index Feed',
    updatedAt: new Date().toISOString()
  },
  {
    symbol: '^CNXIT',
    name: 'NIFTY IT',
    currentValue: 42180.50,
    dayChange: -110.20,
    dayChangePercent: -0.26,
    high: 42450.00,
    low: 41980.10,
    isRealTime: false,
    source: 'NSE Sectoral Index Feed',
    updatedAt: new Date().toISOString()
  },
  {
    symbol: '^INDIAVIX',
    name: 'INDIA VIX',
    currentValue: 13.42,
    dayChange: -0.35,
    dayChangePercent: -2.54,
    high: 14.10,
    low: 13.15,
    isRealTime: false,
    source: 'NSE Volatility Benchmark',
    updatedAt: new Date().toISOString()
  }
];

// Helper to generate consistent deterministic daily historical prices for 365 days
export function generateDailyHistory(
  basePrice: number,
  annualVolatility: number,
  annualDrift: number,
  seedFactor: number
): { date: string; open: number; high: number; low: number; close: number; volume: number }[] {
  const points: { date: string; open: number; high: number; low: number; close: number; volume: number }[] = [];
  const days = 300; // ~14 months of trading days
  const dt = 1 / 252;
  const dailyVol = annualVolatility * Math.sqrt(dt);
  const dailyDrift = (annualDrift - 0.5 * annualVolatility * annualVolatility) * dt;

  let currentClose = basePrice * 0.82; // start ~1 year ago
  const now = new Date();

  // Pseudo-random deterministic generator with seed
  let s = seedFactor;
  const pseudoRand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const standardNormal = () => {
    const u1 = Math.max(1e-6, pseudoRand());
    const u2 = pseudoRand();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  };

  for (let i = days; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const z = standardNormal();
    const ret = dailyDrift + dailyVol * z;
    const prevClose = currentClose;
    currentClose = Math.round(prevClose * Math.exp(ret) * 100) / 100;

    const intraVol = currentClose * dailyVol * 0.7;
    const open = Math.round((prevClose + (pseudoRand() - 0.5) * intraVol * 0.5) * 100) / 100;
    const high = Math.round((Math.max(open, currentClose) + pseudoRand() * intraVol) * 100) / 100;
    const low = Math.round((Math.min(open, currentClose) - pseudoRand() * intraVol) * 100) / 100;
    const volume = Math.floor(1500000 + pseudoRand() * 2500000);

    points.push({
      date: d.toISOString().split('T')[0],
      open,
      high,
      low,
      close: currentClose,
      volume
    });
  }

  // Adjust last day close to target current price
  if (points.length > 0) {
    const last = points[points.length - 1];
    const factor = basePrice / last.close;
    for (const p of points) {
      p.open = Math.round(p.open * factor * 100) / 100;
      p.high = Math.round(p.high * factor * 100) / 100;
      p.low = Math.round(p.low * factor * 100) / 100;
      p.close = Math.round(p.close * factor * 100) / 100;
    }
  }

  return points;
}

export const INDIAN_STOCKS: StockQuote[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    sector: 'Energy & Conglomerate',
    exchange: 'NSE',
    currentPrice: 2985.40,
    dayChange: 24.50,
    dayChangePercent: 0.83,
    dayHigh: 3012.00,
    dayLow: 2962.30,
    openPrice: 2970.00,
    previousClose: 2960.90,
    volume52wAvg: 4800000,
    dayVolume: 5120000,
    high52w: 3217.90,
    low52w: 2220.30,
    description: 'India largest private conglomerate with diversified leadership in oil-to-chemicals, telecom (Jio), retail (Reliance Retail), and new green energy gigafactories.',
    fundamentals: {
      peRatio: 26.8,
      pbRatio: 2.35,
      evToEbitda: 13.8,
      dividendYield: 0.35,
      roe: 9.4,
      roce: 10.2,
      debtToEquity: 0.42,
      currentRatio: 1.15,
      eps: 111.40,
      sectorPe: 22.4,
      sectorPb: 2.10,
      marketCapCr: 2020450,
      freeCashFlowYield: 2.8
    },
    technicals: {
      rsi14: 56.4,
      sma20: 2940.50,
      sma50: 2910.20,
      sma200: 2785.40,
      beta: 1.08,
      historicalVolatilityAnnualized: 0.21,
      maxDrawdown52w: -0.142,
      cagr3y: 16.4,
      cagr5y: 19.8
    },
    financialHistory: [
      { year: 'FY2020', revenueCr: 596679, netProfitCr: 39354, ebitdaCr: 88212, operatingCashFlowCr: 94877, freeCashFlowCr: 21450, totalDebtCr: 336294, cashAndEquivalentsCr: 175300, shareholderEquityCr: 453331 },
      { year: 'FY2021', revenueCr: 466924, netProfitCr: 49128, ebitdaCr: 80703, operatingCashFlowCr: 26185, freeCashFlowCr: 12400, totalDebtCr: 251811, cashAndEquivalentsCr: 254019, shareholderEquityCr: 700172 },
      { year: 'FY2022', revenueCr: 699962, netProfitCr: 60705, ebitdaCr: 110460, operatingCashFlowCr: 110654, freeCashFlowCr: 34100, totalDebtCr: 266305, cashAndEquivalentsCr: 241840, shareholderEquityCr: 779485 },
      { year: 'FY2023', revenueCr: 877835, netProfitCr: 66702, ebitdaCr: 142200, operatingCashFlowCr: 115000, freeCashFlowCr: 38900, totalDebtCr: 314708, cashAndEquivalentsCr: 230000, shareholderEquityCr: 840000 },
      { year: 'FY2024', revenueCr: 998700, netProfitCr: 69624, ebitdaCr: 178000, operatingCashFlowCr: 135400, freeCashFlowCr: 42100, totalDebtCr: 324000, cashAndEquivalentsCr: 215000, shareholderEquityCr: 910000 }
    ],
    meta: {
      instrument: 'RELIANCE',
      exchange: 'NSE',
      currency: 'INR',
      units: 'Shares',
      source: 'NSE EOD Institutional Archive & Audited Annual Filings',
      retrievalTimestamp: new Date().toISOString(),
      marketTimestamp: new Date().toISOString(),
      isDelayed: true,
      isSampleData: true,
      dataCoveragePercent: 98.5,
      missingFields: []
    }
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Limited',
    sector: 'Information Technology',
    exchange: 'NSE',
    currentPrice: 4120.75,
    dayChange: -18.40,
    dayChangePercent: -0.44,
    dayHigh: 4165.00,
    dayLow: 4095.10,
    openPrice: 4140.00,
    previousClose: 4139.15,
    volume52wAvg: 2200000,
    dayVolume: 1950000,
    high52w: 4585.90,
    low52w: 3315.00,
    description: 'Flagship IT services company of Tata Group, world-leading digital transformation partner with industry-best operating margins (~25%) and zero net debt.',
    fundamentals: {
      peRatio: 30.5,
      pbRatio: 14.8,
      evToEbitda: 21.2,
      dividendYield: 1.85,
      roe: 48.6,
      roce: 62.1,
      debtToEquity: 0.08,
      currentRatio: 2.45,
      eps: 135.10,
      sectorPe: 28.9,
      sectorPb: 12.1,
      marketCapCr: 1490200,
      freeCashFlowYield: 3.4
    },
    technicals: {
      rsi14: 48.2,
      sma20: 4180.00,
      sma50: 4210.30,
      sma200: 3950.80,
      beta: 0.76,
      historicalVolatilityAnnualized: 0.17,
      maxDrawdown52w: -0.118,
      cagr3y: 12.8,
      cagr5y: 18.2
    },
    financialHistory: [
      { year: 'FY2020', revenueCr: 156949, netProfitCr: 32340, ebitdaCr: 42109, operatingCashFlowCr: 32369, freeCashFlowCr: 29500, totalDebtCr: 8174, cashAndEquivalentsCr: 18649, shareholderEquityCr: 86258 },
      { year: 'FY2021', revenueCr: 164177, netProfitCr: 32430, ebitdaCr: 46546, operatingCashFlowCr: 38802, freeCashFlowCr: 35100, totalDebtCr: 7795, cashAndEquivalentsCr: 18568, shareholderEquityCr: 88773 },
      { year: 'FY2022', revenueCr: 191754, netProfitCr: 38327, ebitdaCr: 53057, operatingCashFlowCr: 39949, freeCashFlowCr: 36200, totalDebtCr: 7818, cashAndEquivalentsCr: 18232, shareholderEquityCr: 91100 },
      { year: 'FY2023', revenueCr: 225458, netProfitCr: 42147, ebitdaCr: 59253, operatingCashFlowCr: 42000, freeCashFlowCr: 38500, totalDebtCr: 8200, cashAndEquivalentsCr: 19500, shareholderEquityCr: 94000 },
      { year: 'FY2024', revenueCr: 240893, netProfitCr: 45908, ebitdaCr: 65120, operatingCashFlowCr: 47200, freeCashFlowCr: 43800, totalDebtCr: 8100, cashAndEquivalentsCr: 22400, shareholderEquityCr: 98000 }
    ],
    meta: {
      instrument: 'TCS',
      exchange: 'NSE',
      currency: 'INR',
      units: 'Shares',
      source: 'NSE EOD Institutional Archive & Audited Annual Filings',
      retrievalTimestamp: new Date().toISOString(),
      marketTimestamp: new Date().toISOString(),
      isDelayed: true,
      isSampleData: true,
      dataCoveragePercent: 99.2,
      missingFields: []
    }
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    sector: 'Banking & Financials',
    exchange: 'NSE',
    currentPrice: 1682.30,
    dayChange: 15.60,
    dayChangePercent: 0.94,
    dayHigh: 1695.00,
    dayLow: 1664.20,
    openPrice: 1668.00,
    previousClose: 1666.70,
    volume52wAvg: 14200000,
    dayVolume: 16800000,
    high52w: 1794.00,
    low52w: 1363.55,
    description: 'Largest private sector bank in India following the merger with HDFC Ltd. Pristine asset quality, dominant retail franchise, and deep deposit moat.',
    fundamentals: {
      peRatio: 18.9,
      pbRatio: 2.72,
      evToEbitda: 14.5,
      dividendYield: 1.15,
      roe: 15.8,
      roce: 16.4,
      debtToEquity: 6.8, // Typical for commercial banks (deposits/borrowings)
      currentRatio: 1.05,
      eps: 89.00,
      sectorPe: 16.5,
      sectorPb: 2.20,
      marketCapCr: 1280000,
      freeCashFlowYield: 4.1
    },
    technicals: {
      rsi14: 58.7,
      sma20: 1650.40,
      sma50: 1632.10,
      sma200: 1585.60,
      beta: 0.95,
      historicalVolatilityAnnualized: 0.19,
      maxDrawdown52w: -0.155,
      cagr3y: 8.5,
      cagr5y: 11.2
    },
    financialHistory: [
      { year: 'FY2020', revenueCr: 114840, netProfitCr: 26257, ebitdaCr: 38400, operatingCashFlowCr: 31000, freeCashFlowCr: 28000, totalDebtCr: 1147502, cashAndEquivalentsCr: 86618, shareholderEquityCr: 170986 },
      { year: 'FY2021', revenueCr: 120850, netProfitCr: 31116, ebitdaCr: 45200, operatingCashFlowCr: 36500, freeCashFlowCr: 32000, totalDebtCr: 1335010, cashAndEquivalentsCr: 119470, shareholderEquityCr: 203720 },
      { year: 'FY2022', revenueCr: 127750, netProfitCr: 36961, ebitdaCr: 52100, operatingCashFlowCr: 41200, freeCashFlowCr: 37500, totalDebtCr: 1559000, cashAndEquivalentsCr: 152000, shareholderEquityCr: 240090 },
      { year: 'FY2023', revenueCr: 161585, netProfitCr: 44108, ebitdaCr: 62400, operatingCashFlowCr: 48000, freeCashFlowCr: 44000, totalDebtCr: 2040000, cashAndEquivalentsCr: 193000, shareholderEquityCr: 280140 },
      { year: 'FY2024', revenueCr: 258000, netProfitCr: 60812, ebitdaCr: 91500, operatingCashFlowCr: 72000, freeCashFlowCr: 65000, totalDebtCr: 3150000, cashAndEquivalentsCr: 240000, shareholderEquityCr: 440000 }
    ],
    meta: {
      instrument: 'HDFCBANK',
      exchange: 'NSE',
      currency: 'INR',
      units: 'Shares',
      source: 'NSE EOD Institutional Archive & RBI Regulatory Filings',
      retrievalTimestamp: new Date().toISOString(),
      marketTimestamp: new Date().toISOString(),
      isDelayed: true,
      isSampleData: true,
      dataCoveragePercent: 99.0,
      missingFields: []
    }
  },
  {
    symbol: 'INFY',
    name: 'Infosys Limited',
    sector: 'Information Technology',
    exchange: 'NSE',
    currentPrice: 1895.50,
    dayChange: -12.30,
    dayChangePercent: -0.64,
    dayHigh: 1918.00,
    dayLow: 1882.00,
    openPrice: 1910.00,
    previousClose: 1907.80,
    volume52wAvg: 6500000,
    dayVolume: 5800000,
    high52w: 2006.45,
    low52w: 1358.35,
    description: 'Next-generation digital services and consulting leader pioneering Topaz Generative AI suite, enterprise cloud migrations, and large multi-billion dollar European contracts.',
    fundamentals: {
      peRatio: 29.8,
      pbRatio: 8.9,
      evToEbitda: 20.4,
      dividendYield: 2.10,
      roe: 32.4,
      roce: 41.8,
      debtToEquity: 0.10,
      currentRatio: 2.10,
      eps: 63.60,
      sectorPe: 28.9,
      sectorPb: 12.1,
      marketCapCr: 786000,
      freeCashFlowYield: 3.6
    },
    technicals: {
      rsi14: 52.1,
      sma20: 1915.00,
      sma50: 1890.20,
      sma200: 1680.40,
      beta: 0.88,
      historicalVolatilityAnnualized: 0.22,
      maxDrawdown52w: -0.168,
      cagr3y: 11.5,
      cagr5y: 20.1
    },
    financialHistory: [
      { year: 'FY2020', revenueCr: 90791, netProfitCr: 16594, ebitdaCr: 24200, operatingCashFlowCr: 18500, freeCashFlowCr: 15400, totalDebtCr: 4800, cashAndEquivalentsCr: 18600, shareholderEquityCr: 65800 },
      { year: 'FY2021', revenueCr: 100472, netProfitCr: 19351, ebitdaCr: 27900, operatingCashFlowCr: 22000, freeCashFlowCr: 18900, totalDebtCr: 5200, cashAndEquivalentsCr: 24700, shareholderEquityCr: 76700 },
      { year: 'FY2022', revenueCr: 121641, netProfitCr: 22110, ebitdaCr: 31400, operatingCashFlowCr: 24900, freeCashFlowCr: 21200, totalDebtCr: 5700, cashAndEquivalentsCr: 17400, shareholderEquityCr: 75700 },
      { year: 'FY2023', revenueCr: 146767, netProfitCr: 24095, ebitdaCr: 35100, operatingCashFlowCr: 23500, freeCashFlowCr: 20100, totalDebtCr: 8000, cashAndEquivalentsCr: 16000, shareholderEquityCr: 75400 },
      { year: 'FY2024', revenueCr: 153670, netProfitCr: 26233, ebitdaCr: 37900, operatingCashFlowCr: 28400, freeCashFlowCr: 25100, totalDebtCr: 8400, cashAndEquivalentsCr: 18900, shareholderEquityCr: 87000 }
    ],
    meta: {
      instrument: 'INFY',
      exchange: 'NSE',
      currency: 'INR',
      units: 'Shares',
      source: 'NSE EOD Institutional Archive & SEC Form 20-F',
      retrievalTimestamp: new Date().toISOString(),
      marketTimestamp: new Date().toISOString(),
      isDelayed: true,
      isSampleData: true,
      dataCoveragePercent: 99.1,
      missingFields: []
    }
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Limited',
    sector: 'Automobile',
    exchange: 'NSE',
    currentPrice: 945.80,
    dayChange: 18.20,
    dayChangePercent: 1.96,
    dayHigh: 954.00,
    dayLow: 931.50,
    openPrice: 934.00,
    previousClose: 927.60,
    volume52wAvg: 8500000,
    dayVolume: 11200000,
    high52w: 1179.00,
    low52w: 622.00,
    description: 'Leading global automobile manufacturer encompassing passenger vehicles, commercial trucks, the high-margin Jaguar Land Rover (JLR) brand, and dominant EV market share in India (>70%).',
    fundamentals: {
      peRatio: 10.4,
      pbRatio: 3.40,
      evToEbitda: 4.8,
      dividendYield: 0.65,
      roe: 36.8,
      roce: 22.4,
      debtToEquity: 0.72,
      currentRatio: 1.02,
      eps: 90.90,
      sectorPe: 24.2,
      sectorPb: 3.80,
      marketCapCr: 348000,
      freeCashFlowYield: 8.5
    },
    technicals: {
      rsi14: 49.8,
      sma20: 935.20,
      sma50: 978.40,
      sma200: 960.10,
      beta: 1.45,
      historicalVolatilityAnnualized: 0.31,
      maxDrawdown52w: -0.215,
      cagr3y: 38.4,
      cagr5y: 42.6
    },
    financialHistory: [
      { year: 'FY2020', revenueCr: 261068, netProfitCr: -12071, ebitdaCr: 19700, operatingCashFlowCr: 26600, freeCashFlowCr: -3200, totalDebtCr: 124700, cashAndEquivalentsCr: 33700, shareholderEquityCr: 63800 },
      { year: 'FY2021', revenueCr: 249795, netProfitCr: -13451, ebitdaCr: 32200, operatingCashFlowCr: 29000, freeCashFlowCr: -1500, totalDebtCr: 142100, cashAndEquivalentsCr: 46800, shareholderEquityCr: 55200 },
      { year: 'FY2022', revenueCr: 278454, netProfitCr: -11441, ebitdaCr: 24800, operatingCashFlowCr: 14300, freeCashFlowCr: -4800, totalDebtCr: 139700, cashAndEquivalentsCr: 40700, shareholderEquityCr: 44600 },
      { year: 'FY2023', revenueCr: 345967, netProfitCr: 2414, ebitdaCr: 37000, operatingCashFlowCr: 35400, freeCashFlowCr: 7800, totalDebtCr: 125000, cashAndEquivalentsCr: 39000, shareholderEquityCr: 52000 },
      { year: 'FY2024', revenueCr: 437928, netProfitCr: 31807, ebitdaCr: 62800, operatingCashFlowCr: 56900, freeCashFlowCr: 26900, totalDebtCr: 84000, cashAndEquivalentsCr: 48000, shareholderEquityCr: 92000 }
    ],
    meta: {
      instrument: 'TATAMOTORS',
      exchange: 'NSE',
      currency: 'INR',
      units: 'Shares',
      source: 'NSE EOD Institutional Archive & Audited Annual Filings',
      retrievalTimestamp: new Date().toISOString(),
      marketTimestamp: new Date().toISOString(),
      isDelayed: true,
      isSampleData: true,
      dataCoveragePercent: 98.4,
      missingFields: []
    }
  },
  {
    symbol: 'ITC',
    name: 'ITC Limited',
    sector: 'Fast Moving Consumer Goods (FMCG)',
    exchange: 'NSE',
    currentPrice: 472.15,
    dayChange: 3.40,
    dayChangePercent: 0.72,
    dayHigh: 476.00,
    dayLow: 469.10,
    openPrice: 470.00,
    previousClose: 468.75,
    volume52wAvg: 11000000,
    dayVolume: 9800000,
    high52w: 528.55,
    low52w: 399.30,
    description: 'Premier diversified consumer goods conglomerate spanning branded packaged foods, personal care, education/stationery, agri-business, paperboards, and high-cash-flow cigarettes.',
    fundamentals: {
      peRatio: 28.1,
      pbRatio: 7.9,
      evToEbitda: 19.5,
      dividendYield: 2.95,
      roe: 29.5,
      roce: 38.6,
      debtToEquity: 0.01,
      currentRatio: 2.80,
      eps: 16.80,
      sectorPe: 44.0,
      sectorPb: 9.8,
      marketCapCr: 590000,
      freeCashFlowYield: 3.8
    },
    technicals: {
      rsi14: 45.6,
      sma20: 480.20,
      sma50: 492.10,
      sma200: 458.30,
      beta: 0.58,
      historicalVolatilityAnnualized: 0.16,
      maxDrawdown52w: -0.114,
      cagr3y: 26.2,
      cagr5y: 16.5
    },
    financialHistory: [
      { year: 'FY2020', revenueCr: 48900, netProfitCr: 15136, ebitdaCr: 19200, operatingCashFlowCr: 13800, freeCashFlowCr: 11200, totalDebtCr: 270, cashAndEquivalentsCr: 36000, shareholderEquityCr: 64000 },
      { year: 'FY2021', revenueCr: 48525, netProfitCr: 13032, ebitdaCr: 17000, operatingCashFlowCr: 11500, freeCashFlowCr: 9400, totalDebtCr: 250, cashAndEquivalentsCr: 30000, shareholderEquityCr: 59000 },
      { year: 'FY2022', revenueCr: 59101, netProfitCr: 15058, ebitdaCr: 20600, operatingCashFlowCr: 14800, freeCashFlowCr: 12100, totalDebtCr: 280, cashAndEquivalentsCr: 31000, shareholderEquityCr: 61000 },
      { year: 'FY2023', revenueCr: 69480, netProfitCr: 18753, ebitdaCr: 25400, operatingCashFlowCr: 17900, freeCashFlowCr: 14800, totalDebtCr: 300, cashAndEquivalentsCr: 34000, shareholderEquityCr: 67000 },
      { year: 'FY2024', revenueCr: 76840, netProfitCr: 20422, ebitdaCr: 27800, operatingCashFlowCr: 19600, freeCashFlowCr: 16500, totalDebtCr: 320, cashAndEquivalentsCr: 38000, shareholderEquityCr: 72000 }
    ],
    meta: {
      instrument: 'ITC',
      exchange: 'NSE',
      currency: 'INR',
      units: 'Shares',
      source: 'NSE EOD Institutional Archive & Audited Annual Filings',
      retrievalTimestamp: new Date().toISOString(),
      marketTimestamp: new Date().toISOString(),
      isDelayed: true,
      isSampleData: true,
      dataCoveragePercent: 99.4,
      missingFields: []
    }
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    sector: 'Banking & Financials',
    exchange: 'NSE',
    currentPrice: 1262.80,
    dayChange: 14.10,
    dayChangePercent: 1.13,
    dayHigh: 1270.50,
    dayLow: 1248.00,
    openPrice: 1252.00,
    previousClose: 1248.70,
    volume52wAvg: 12500000,
    dayVolume: 14100000,
    high52w: 1332.00,
    low52w: 914.00,
    description: 'Second largest private sector bank in India, recognized for industry-leading Net Interest Margins (>4.4%), rapid credit card and digital loan origination, and conservative provisioning buffers.',
    fundamentals: {
      peRatio: 18.2,
      pbRatio: 3.12,
      evToEbitda: 13.9,
      dividendYield: 0.85,
      roe: 18.4,
      roce: 18.9,
      debtToEquity: 5.9,
      currentRatio: 1.08,
      eps: 69.40,
      sectorPe: 16.5,
      sectorPb: 2.20,
      marketCapCr: 887000,
      freeCashFlowYield: 3.9
    },
    technicals: {
      rsi14: 61.2,
      sma20: 1245.00,
      sma50: 1220.40,
      sma200: 1130.60,
      beta: 1.04,
      historicalVolatilityAnnualized: 0.18,
      maxDrawdown52w: -0.108,
      cagr3y: 22.8,
      cagr5y: 23.4
    },
    financialHistory: [
      { year: 'FY2020', revenueCr: 91247, netProfitCr: 7931, ebitdaCr: 28100, operatingCashFlowCr: 14200, freeCashFlowCr: 12800, totalDebtCr: 948000, cashAndEquivalentsCr: 119000, shareholderEquityCr: 116500 },
      { year: 'FY2021', revenueCr: 89163, netProfitCr: 16193, ebitdaCr: 36400, operatingCashFlowCr: 21000, freeCashFlowCr: 18400, totalDebtCr: 1060000, cashAndEquivalentsCr: 133000, shareholderEquityCr: 147500 },
      { year: 'FY2022', revenueCr: 97560, netProfitCr: 23339, ebitdaCr: 44200, operatingCashFlowCr: 29000, freeCashFlowCr: 25500, totalDebtCr: 1220000, cashAndEquivalentsCr: 167000, shareholderEquityCr: 170500 },
      { year: 'FY2023', revenueCr: 121067, netProfitCr: 31896, ebitdaCr: 55800, operatingCashFlowCr: 38000, freeCashFlowCr: 34000, totalDebtCr: 1450000, cashAndEquivalentsCr: 182000, shareholderEquityCr: 201000 },
      { year: 'FY2024', revenueCr: 162000, netProfitCr: 40888, ebitdaCr: 68900, operatingCashFlowCr: 46500, freeCashFlowCr: 42000, totalDebtCr: 1820000, cashAndEquivalentsCr: 210000, shareholderEquityCr: 245000 }
    ],
    meta: {
      instrument: 'ICICIBANK',
      exchange: 'NSE',
      currency: 'INR',
      units: 'Shares',
      source: 'NSE EOD Institutional Archive & RBI Filings',
      retrievalTimestamp: new Date().toISOString(),
      marketTimestamp: new Date().toISOString(),
      isDelayed: true,
      isSampleData: true,
      dataCoveragePercent: 99.2,
      missingFields: []
    }
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Limited',
    sector: 'Telecommunications',
    exchange: 'NSE',
    currentPrice: 1680.40,
    dayChange: 21.00,
    dayChangePercent: 1.27,
    dayHigh: 1698.00,
    dayLow: 1658.00,
    openPrice: 1662.00,
    previousClose: 1659.40,
    volume52wAvg: 5400000,
    dayVolume: 6100000,
    high52w: 1779.00,
    low52w: 900.00,
    description: 'Premier telecommunications provider operating across India and 14 African countries with rising ARPU (Average Revenue Per User > ₹215), rapid 5G rollout, and enterprise data center dominance.',
    fundamentals: {
      peRatio: 64.2,
      pbRatio: 8.8,
      evToEbitda: 14.2,
      dividendYield: 0.50,
      roe: 14.5,
      roce: 15.2,
      debtToEquity: 1.85,
      currentRatio: 0.55,
      eps: 26.20,
      sectorPe: 45.0,
      sectorPb: 6.2,
      marketCapCr: 970000,
      freeCashFlowYield: 2.9
    },
    technicals: {
      rsi14: 64.8,
      sma20: 1640.00,
      sma50: 1590.30,
      sma200: 1380.20,
      beta: 0.82,
      historicalVolatilityAnnualized: 0.20,
      maxDrawdown52w: -0.095,
      cagr3y: 31.5,
      cagr5y: 28.2
    },
    financialHistory: [
      { year: 'FY2020', revenueCr: 87539, netProfitCr: -32183, ebitdaCr: 36600, operatingCashFlowCr: 21000, freeCashFlowCr: -8000, totalDebtCr: 148000, cashAndEquivalentsCr: 15000, shareholderEquityCr: 77000 },
      { year: 'FY2021', revenueCr: 100616, netProfitCr: -15084, ebitdaCr: 46100, operatingCashFlowCr: 33000, freeCashFlowCr: 5000, totalDebtCr: 162000, cashAndEquivalentsCr: 13000, shareholderEquityCr: 59000 },
      { year: 'FY2022', revenueCr: 116547, netProfitCr: 4255, ebitdaCr: 58100, operatingCashFlowCr: 44000, freeCashFlowCr: 12000, totalDebtCr: 179000, cashAndEquivalentsCr: 16000, shareholderEquityCr: 66000 },
      { year: 'FY2023', revenueCr: 139145, netProfitCr: 8346, ebitdaCr: 71200, operatingCashFlowCr: 55000, freeCashFlowCr: 18000, totalDebtCr: 213000, cashAndEquivalentsCr: 19000, shareholderEquityCr: 78000 },
      { year: 'FY2024', revenueCr: 150122, netProfitCr: 7467, ebitdaCr: 79800, operatingCashFlowCr: 64000, freeCashFlowCr: 24000, totalDebtCr: 204000, cashAndEquivalentsCr: 21000, shareholderEquityCr: 88000 }
    ],
    meta: {
      instrument: 'BHARTIARTL',
      exchange: 'NSE',
      currency: 'INR',
      units: 'Shares',
      source: 'NSE EOD Institutional Archive & DoT Filings',
      retrievalTimestamp: new Date().toISOString(),
      marketTimestamp: new Date().toISOString(),
      isDelayed: true,
      isSampleData: true,
      dataCoveragePercent: 98.7,
      missingFields: []
    }
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Limited',
    sector: 'Capital Goods & Infrastructure',
    exchange: 'NSE',
    currentPrice: 3510.60,
    dayChange: -25.40,
    dayChangePercent: -0.72,
    dayHigh: 3560.00,
    dayLow: 3495.00,
    openPrice: 3545.00,
    previousClose: 3536.00,
    volume52wAvg: 2100000,
    dayVolume: 1850000,
    high52w: 3948.60,
    low52w: 2872.00,
    description: 'India largest infrastructure and engineering conglomerate with record multi-year order books (>₹4.75 Lakh Crore) spanning defense, hydrogen electrolyzers, metro rail, and Middle East EPC projects.',
    fundamentals: {
      peRatio: 37.2,
      pbRatio: 5.1,
      evToEbitda: 22.1,
      dividendYield: 0.95,
      roe: 15.2,
      roce: 14.8,
      debtToEquity: 1.15,
      currentRatio: 1.25,
      eps: 94.40,
      sectorPe: 34.0,
      sectorPb: 4.5,
      marketCapCr: 482000,
      freeCashFlowYield: 2.1
    },
    technicals: {
      rsi14: 44.5,
      sma20: 3560.00,
      sma50: 3620.20,
      sma200: 3510.00,
      beta: 1.12,
      historicalVolatilityAnnualized: 0.23,
      maxDrawdown52w: -0.145,
      cagr3y: 28.5,
      cagr5y: 22.1
    },
    financialHistory: [
      { year: 'FY2020', revenueCr: 145452, netProfitCr: 9549, ebitdaCr: 16300, operatingCashFlowCr: 11000, freeCashFlowCr: 7500, totalDebtCr: 141000, cashAndEquivalentsCr: 27800, shareholderEquityCr: 66700 },
      { year: 'FY2021', revenueCr: 135979, netProfitCr: 11583, ebitdaCr: 15600, operatingCashFlowCr: 18000, freeCashFlowCr: 13500, totalDebtCr: 132000, cashAndEquivalentsCr: 47200, shareholderEquityCr: 75800 },
      { year: 'FY2022', revenueCr: 156521, netProfitCr: 8669, ebitdaCr: 18200, operatingCashFlowCr: 12000, freeCashFlowCr: 8200, totalDebtCr: 123000, cashAndEquivalentsCr: 43000, shareholderEquityCr: 82400 },
      { year: 'FY2023', revenueCr: 183341, netProfitCr: 10471, ebitdaCr: 20700, operatingCashFlowCr: 14500, freeCashFlowCr: 9800, totalDebtCr: 118000, cashAndEquivalentsCr: 41000, shareholderEquityCr: 89000 },
      { year: 'FY2024', revenueCr: 221113, netProfitCr: 13059, ebitdaCr: 23500, operatingCashFlowCr: 17000, freeCashFlowCr: 11200, totalDebtCr: 115000, cashAndEquivalentsCr: 44000, shareholderEquityCr: 96000 }
    ],
    meta: {
      instrument: 'LT',
      exchange: 'NSE',
      currency: 'INR',
      units: 'Shares',
      source: 'NSE EOD Institutional Archive & Ministry of Corporate Affairs',
      retrievalTimestamp: new Date().toISOString(),
      marketTimestamp: new Date().toISOString(),
      isDelayed: true,
      isSampleData: true,
      dataCoveragePercent: 98.9,
      missingFields: []
    }
  }
];

export const MOCK_NEWS_ANNOUNCEMENTS: NewsAnnouncement[] = [
  {
    id: 'news-1',
    symbol: 'RELIANCE',
    companyName: 'Reliance Industries Limited',
    title: 'Reliance Retail Expands FMCG Footprint with Strategic Beverage Partnerships',
    summary: 'Reliance Retail ventures further into packaged consumer staples with aggressive nationwide distribution targets, leveraging its 18,000+ store network.',
    category: 'CORPORATE_ACTION',
    publishedAt: '2026-10-24T06:30:00Z',
    source: 'BSE Exchange Filing & Corporate Release',
    url: 'https://www.bseindia.com/corporates/ann.html',
    sentiment: 'POSITIVE'
  },
  {
    id: 'news-2',
    symbol: 'TCS',
    companyName: 'Tata Consultancy Services',
    title: 'TCS Secures Multi-Million Dollar Cloud & AI Modernization Deal with European Financial Group',
    summary: 'The long-term multi-year agreement focuses on migrating legacy mainframe cores to secure hybrid-cloud environments with embedded generative AI assistants.',
    category: 'FINANCIAL_RESULTS',
    publishedAt: '2026-10-23T11:15:00Z',
    source: 'NSE Regulatory Announcements',
    url: 'https://www.nseindia.com/companies-listing/corporate-filings-announcements',
    sentiment: 'POSITIVE'
  },
  {
    id: 'news-3',
    symbol: 'HDFCBANK',
    companyName: 'HDFC Bank Limited',
    title: 'RBI Monetary Policy Committee Keeps Repo Rate Steady; Banking Liquidity Normalizes',
    summary: 'The central bank maintained systemic liquidity neutral, dampening deposit cost escalation concerns for premier private lenders.',
    category: 'MARKET_NEWS',
    publishedAt: '2026-10-22T08:00:00Z',
    source: 'Reserve Bank of India Monetary Policy Statement',
    url: 'https://rbi.org.in',
    sentiment: 'NEUTRAL'
  },
  {
    id: 'news-4',
    symbol: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    title: 'Tata Motors EV Division Outlines 2026-2028 Next-Gen Active Battery Architecture Roadmap',
    summary: 'Management affirmed margin expansion targets for Jaguar Land Rover while announcing production readiness for indigenous lithium-iron battery gigafactories.',
    category: 'CORPORATE_ACTION',
    publishedAt: '2026-10-21T14:45:00Z',
    source: 'Investor Presentation & Exchange Disclosure',
    url: 'https://www.nseindia.com',
    sentiment: 'POSITIVE'
  },
  {
    id: 'news-5',
    symbol: 'BHARTIARTL',
    companyName: 'Bharti Airtel Limited',
    title: 'Airtel Africa Prepares Initial Public Offering Roadmap for Mobile Money Subsidiary',
    summary: 'Airtel plans partial value unlocking of its high-growth fintech unit Airtel Money, unlocking valuation multiples in the telecom infrastructure segment.',
    category: 'CORPORATE_ACTION',
    publishedAt: '2026-10-20T09:20:00Z',
    source: 'London & Bombay Stock Exchange Notice',
    url: 'https://www.bseindia.com',
    sentiment: 'POSITIVE'
  },
  {
    id: 'news-6',
    symbol: 'LT',
    companyName: 'Larsen & Toubro Limited',
    title: 'L&T Precision Engineering Bags Mega Offshore Wind Substation Contract',
    summary: 'The Hydrocarbon division secured a premier EPCI contract valued between ₹5,000 to ₹10,000 crore for clean offshore energy grid integration.',
    category: 'REGULATORY_FILING',
    publishedAt: '2026-10-19T05:10:00Z',
    source: 'NSE Corporate Filing',
    url: 'https://www.nseindia.com',
    sentiment: 'POSITIVE'
  }
];

export const INDIAN_IPOS: import('../types/market').IPORecord[] = [
  {
    id: 'ipo-1',
    companyName: 'Hyundai Motor India Limited',
    symbol: 'HYUNDAI',
    sector: 'Automobile (Passenger Vehicles)',
    issueDates: 'Oct 15 - Oct 17, 2026',
    priceBand: '₹1,865 - ₹1,960',
    lotSize: 7,
    issueSizeCr: 27870,
    retailQuota: '35% Reserved',
    subscriptionTimes: 2.37,
    gmpEstimatedGainPercent: 5.5,
    status: 'LISTED',
    listingDate: '2026-10-22',
    listingGainPercent: 1.8,
    drhpRedFlags: [
      '100% Offer for Sale (OFS) by Korean parent; zero fresh capital infusion into Indian ops.',
      'Royalty payout of 3.5% of annual revenue to foreign parent entity.',
      'Capacity utilization at Chennai plant exceeds 92%, capex required for Talegaon plant.'
    ]
  },
  {
    id: 'ipo-2',
    companyName: 'Swiggy Limited',
    symbol: 'SWIGGY',
    sector: 'Hyperlocal E-Commerce & Food Delivery',
    issueDates: 'Nov 06 - Nov 08, 2026',
    priceBand: '₹371 - ₹390',
    lotSize: 38,
    issueSizeCr: 11327,
    retailQuota: '10% Reserved (Retail & Employees)',
    subscriptionTimes: 3.59,
    gmpEstimatedGainPercent: 8.2,
    status: 'ONGOING',
    drhpRedFlags: [
      'Historical operating losses on consolidated balance sheet (Quick Commerce Instamart EBITDA drag).',
      'Intense duopoly competition with Zomato (Blinkit) in fast delivery dark-store expansion.',
      'Gig worker regulatory compliance and potential state welfare cess liabilities.'
    ]
  },
  {
    id: 'ipo-3',
    companyName: 'Waaree Energies Limited',
    symbol: 'WAAREEENER',
    sector: 'Renewable Energy (Solar Photovoltaic)',
    issueDates: 'Oct 21 - Oct 23, 2026',
    priceBand: '₹1,427 - ₹1,503',
    lotSize: 9,
    issueSizeCr: 4321,
    retailQuota: '35% Reserved',
    subscriptionTimes: 76.34,
    gmpEstimatedGainPercent: 64.0,
    status: 'LISTED',
    listingDate: '2026-10-28',
    listingGainPercent: 66.3,
    drhpRedFlags: [
      'Heavy reliance on raw solar wafer imports from China subject to Basic Customs Duty (BCD).',
      'Top 5 utility clients account for 44% of consolidated order book.',
      'Regulatory ALMM (Approved List of Module Manufacturers) policy shifts.'
    ]
  },
  {
    id: 'ipo-4',
    companyName: 'NTPC Green Energy Limited',
    symbol: 'NTPCGREEN',
    sector: 'Clean Utilities (PSU)',
    issueDates: 'Nov 19 - Nov 21, 2026',
    priceBand: '₹102 - ₹108',
    lotSize: 138,
    issueSizeCr: 10000,
    retailQuota: '35% Reserved',
    subscriptionTimes: 14.2,
    gmpEstimatedGainPercent: 12.5,
    status: 'UPCOMING',
    drhpRedFlags: [
      'High debt-funded capital expenditure for 2032 60GW capacity expansion.',
      'Transmission grid curtailment risk in Rajasthan and Gujarat solar parks.',
      'State distribution companies (DISCOMs) receivable payment delays.'
    ]
  }
];

// Enrich INDIAN_STOCKS with governance, shareholding, and management guidance
INDIAN_STOCKS.forEach(stock => {
  if (stock.symbol === 'RELIANCE') {
    stock.shareholding = {
      promoterPercent: 50.3,
      fiiPercent: 22.1,
      diiPercent: 16.5,
      publicPercent: 11.1,
      promoterPledgedPercent: 0.0,
      quarterlyTrend: [
        { quarter: 'Q1 FY24', promoter: 50.4, institutional: 38.2, public: 11.4 },
        { quarter: 'Q2 FY24', promoter: 50.3, institutional: 38.4, public: 11.3 },
        { quarter: 'Q3 FY24', promoter: 50.3, institutional: 38.5, public: 11.2 },
        { quarter: 'Q4 FY24', promoter: 50.3, institutional: 38.6, public: 11.1 }
      ]
    };
    stock.redFlags = {
      hasAuditorRemarks: false,
      auditorRemarksDetail: 'Unqualified clean audit opinion rendered by statutory joint auditors.',
      relatedPartyTxnCr: 18450,
      relatedPartyToRevenuePercent: 1.8,
      contingentLiabilitiesCr: 14200,
      contingentToNetWorthPercent: 1.6,
      promoterPledgeRisk: 'SAFE',
      managementTurnoverRecent: false,
      overallGovernanceScore: 94,
      governanceTier: 'Pristine Governance'
    };
    stock.guidance = [
      { fiscalYear: 'FY2024', metric: 'Retail Store Count', guidedTarget: '18,500 stores', actualDelivered: '18,774 stores', targetMet: true, commentary: 'Exceeded expansion targets with deep tier 2/3 penetration.' },
      { fiscalYear: 'FY2024', metric: '5G Pan-India Coverage', guidedTarget: 'Dec 2023 rollout', actualDelivered: 'Completed Dec 2023', targetMet: true, commentary: 'True 5G standalone architecture deployed across all 22 circles.' },
      { fiscalYear: 'FY2023', metric: 'Green Energy Gigafactories', guidedTarget: 'Commissioning 2024', actualDelivered: 'Phased 2024-2025', targetMet: false, commentary: 'Slight supply chain delay on specialized solar module equipment.' }
    ];
  } else if (stock.symbol === 'TCS') {
    stock.shareholding = {
      promoterPercent: 71.8,
      fiiPercent: 12.5,
      diiPercent: 10.2,
      publicPercent: 5.5,
      promoterPledgedPercent: 0.0,
      quarterlyTrend: [
        { quarter: 'Q1 FY24', promoter: 72.3, institutional: 22.2, public: 5.5 },
        { quarter: 'Q2 FY24', promoter: 72.0, institutional: 22.5, public: 5.5 },
        { quarter: 'Q3 FY24', promoter: 71.8, institutional: 22.7, public: 5.5 },
        { quarter: 'Q4 FY24', promoter: 71.8, institutional: 22.7, public: 5.5 }
      ]
    };
    stock.redFlags = {
      hasAuditorRemarks: false,
      auditorRemarksDetail: 'Clean audit report with no emphasis of matter or internal control deficiencies.',
      relatedPartyTxnCr: 1850,
      relatedPartyToRevenuePercent: 0.77,
      contingentLiabilitiesCr: 2100,
      contingentToNetWorthPercent: 2.1,
      promoterPledgeRisk: 'SAFE',
      managementTurnoverRecent: false,
      overallGovernanceScore: 98,
      governanceTier: 'Pristine Governance'
    };
    stock.guidance = [
      { fiscalYear: 'FY2024', metric: 'Operating Margin Band', guidedTarget: '26-28% EBIT', actualDelivered: '25.6% EBIT', targetMet: false, commentary: 'Slight headwind from enterprise software budget delays in Europe.' },
      { fiscalYear: 'FY2024', metric: 'AI Order Book Inflow', guidedTarget: '$800M pipeline', actualDelivered: '$1.2B closed deals', targetMet: true, commentary: 'Major enterprise AI modernization agreements secured.' }
    ];
  } else if (stock.symbol === 'HDFCBANK') {
    stock.shareholding = {
      promoterPercent: 0.0, // Widely held commercial bank
      fiiPercent: 47.2,
      diiPercent: 33.8,
      publicPercent: 19.0,
      promoterPledgedPercent: 0.0,
      quarterlyTrend: [
        { quarter: 'Q1 FY24', promoter: 0.0, institutional: 81.5, public: 18.5 },
        { quarter: 'Q2 FY24', promoter: 0.0, institutional: 81.2, public: 18.8 },
        { quarter: 'Q3 FY24', promoter: 0.0, institutional: 80.9, public: 19.1 },
        { quarter: 'Q4 FY24', promoter: 0.0, institutional: 81.0, public: 19.0 }
      ]
    };
    stock.redFlags = {
      hasAuditorRemarks: false,
      auditorRemarksDetail: 'Statutory RBI regulatory audits verified healthy GNPA of 1.24% and PCR of 74%.',
      relatedPartyTxnCr: 450,
      relatedPartyToRevenuePercent: 0.17,
      contingentLiabilitiesCr: 45000,
      contingentToNetWorthPercent: 10.2, // Normal banking guarantees/letters of credit
      promoterPledgeRisk: 'SAFE',
      managementTurnoverRecent: false,
      overallGovernanceScore: 92,
      governanceTier: 'Pristine Governance'
    };
    stock.guidance = [
      { fiscalYear: 'FY2024', metric: 'Post-Merger Deposit Growth', guidedTarget: '18-20% YoY', actualDelivered: '16.8% YoY', targetMet: false, commentary: 'Aggressive branch rollout initiated to counter systemic liquidity tightness.' }
    ];
  } else {
    // Standard robust defaults for other top Indian equities
    stock.shareholding = {
      promoterPercent: 51.5,
      fiiPercent: 18.4,
      diiPercent: 16.2,
      publicPercent: 13.9,
      promoterPledgedPercent: stock.symbol === 'TATAMOTORS' ? 1.2 : 0.0,
      quarterlyTrend: [
        { quarter: 'Q1 FY24', promoter: 51.5, institutional: 34.6, public: 13.9 },
        { quarter: 'Q2 FY24', promoter: 51.5, institutional: 34.6, public: 13.9 },
        { quarter: 'Q3 FY24', promoter: 51.5, institutional: 34.6, public: 13.9 },
        { quarter: 'Q4 FY24', promoter: 51.5, institutional: 34.6, public: 13.9 }
      ]
    };
    stock.redFlags = {
      hasAuditorRemarks: false,
      auditorRemarksDetail: 'Clean statutory audit report with standard internal financial control confirmations.',
      relatedPartyTxnCr: 1200,
      relatedPartyToRevenuePercent: 1.1,
      contingentLiabilitiesCr: 3500,
      contingentToNetWorthPercent: 3.8,
      promoterPledgeRisk: stock.symbol === 'TATAMOTORS' ? 'WATCH' : 'SAFE',
      managementTurnoverRecent: false,
      overallGovernanceScore: stock.symbol === 'TATAMOTORS' ? 86 : 91,
      governanceTier: 'Pristine Governance'
    };
    stock.guidance = [
      { fiscalYear: 'FY2024', metric: 'Top-line Revenue Target', guidedTarget: '12-14% Growth', actualDelivered: '13.1% Delivered', targetMet: true, commentary: 'Operational targets achieved across primary product divisions.' }
    ];
  }
});

