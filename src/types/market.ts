/**
 * MarketMind AI - Core Type Definitions
 * Strict types for market data, forecasting, risk analysis, paper trading, and AI reports.
 */

export type Exchange = 'NSE' | 'BSE';
export type Currency = 'INR' | 'USD';

export interface DataIntegrityMeta {
  instrument: string;
  exchange: Exchange;
  currency: Currency;
  units: string;
  source: string;
  retrievalTimestamp: string;
  marketTimestamp: string;
  isDelayed: boolean;
  isSampleData: boolean;
  dataCoveragePercent: number;
  missingFields: string[];
}

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FinancialStatementYear {
  year: string;
  revenueCr: number;
  netProfitCr: number;
  ebitdaCr: number;
  operatingCashFlowCr: number;
  freeCashFlowCr: number;
  totalDebtCr: number;
  cashAndEquivalentsCr: number;
  shareholderEquityCr: number;
}

export interface StockFundamental {
  peRatio: number;
  pbRatio: number;
  evToEbitda: number;
  dividendYield: number;
  roe: number; // Return on equity %
  roce: number; // Return on capital employed %
  debtToEquity: number;
  currentRatio: number;
  eps: number; // Earnings per share in INR
  sectorPe: number;
  sectorPb: number;
  marketCapCr: number;
  freeCashFlowYield: number;
}

export interface TechnicalIndicators {
  rsi14: number;
  sma20: number;
  sma50: number;
  sma200: number;
  beta: number; // Market beta against NIFTY 50
  historicalVolatilityAnnualized: number; // e.g. 0.24 for 24%
  maxDrawdown52w: number; // e.g. -0.18 for -18%
  cagr3y: number; // 3-year compound annual growth rate %
  cagr5y: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  sector: string;
  exchange: Exchange;
  currentPrice: number;
  dayChange: number;
  dayChangePercent: number;
  dayHigh: number;
  dayLow: number;
  openPrice: number;
  previousClose: number;
  volume52wAvg: number;
  dayVolume: number;
  high52w: number;
  low52w: number;
  description: string;
  fundamentals: StockFundamental;
  technicals: TechnicalIndicators;
  financialHistory: FinancialStatementYear[];
  shareholding?: ShareholdingPattern;
  redFlags?: RedFlagCheck;
  guidance?: ManagementGuidanceItem[];
  meta: DataIntegrityMeta;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  currentValue: number;
  dayChange: number;
  dayChangePercent: number;
  high: number;
  low: number;
  isRealTime: boolean;
  source: string;
  updatedAt: string;
}

export interface ForecastScenario {
  horizon: '1M' | '3M' | '6M' | '12M';
  horizonDays: number;
  targetDate: string;
  basePrice: number;
  baseReturnPercent: number;
  bullPrice: number;
  bullReturnPercent: number;
  bearPrice: number;
  bearReturnPercent: number;
  confidenceInterval95: [number, number]; // [lower, upper]
  modelDrift: number;
  modelVolatility: number;
}

export interface HistoricalEvaluation {
  evaluationPeriod: string;
  outOfSampleDays: number;
  mapePercent: number; // Mean absolute percentage error
  directionalAccuracyPercent: number;
  benchmarkMapePercent: number; // Simple Random Walk/B&H benchmark
  evaluationConclusion: string;
}

export interface StockForecastResult {
  symbol: string;
  generationTimestamp: string;
  dataCutoffTimestamp: string;
  currentReferencePrice: number;
  scenarios: Record<'1M' | '3M' | '6M' | '12M', ForecastScenario>;
  evaluation: HistoricalEvaluation;
  assumptions: string[];
  limitations: string[];
  uncertaintyRating: 'Low' | 'Moderate' | 'High' | 'Very High';
  isSufficientEvidence: boolean;
  statusMessage: string;
  fanChartSeries: {
    date: string;
    historicalClose?: number;
    baseProjection?: number;
    bullBand?: number;
    bearBand?: number;
  }[];
}

export interface ResearchScoreBreakdown {
  profitabilityScore: number; // 0-25
  valuationScore: number; // 0-25
  healthScore: number; // 0-25
  momentumScore: number; // 0-25
  penalties: {
    reason: string;
    deduction: number;
  }[];
  totalScore: number; // 0-100
  tier: 'High Research Potential' | 'Moderate Consideration' | 'Elevated Risk Profile';
  missingInputs: string[];
}

export interface IndianStatutoryCharges {
  stt: number; // Securities Transaction Tax (0.1% on delivery)
  exchangeCharges: number; // NSE ~0.00325%
  sebiTurnoverFee: number; // ₹10 per crore (0.0001%)
  gst: number; // 18% on (brokerage + exchange charges + sebi fee)
  stampDuty: number; // 0.015% on buy
  brokerage: number; // Flat simulated ₹20 or ₹0 for delivery
  totalTaxesAndCharges: number;
}

export interface HypotheticalInvestmentPlan {
  budget: number;
  stockSymbol: string;
  stockPrice: number;
  holdingPeriod: string;
  wholeShares: number;
  grossStockCost: number;
  statutoryCharges: IndianStatutoryCharges;
  totalOutlay: number;
  unallocatedCash: number;
  breakEvenPrice: number;
  scenarios: {
    bear: { price: number; finalValue: number; netPnl: number; netReturnPercent: number };
    base: { price: number; finalValue: number; netPnl: number; netReturnPercent: number };
    bull: { price: number; finalValue: number; netPnl: number; netReturnPercent: number };
  };
  concentrationRiskExplanation: string;
  assumptions: string[];
}

export interface StressScenario {
  id: string;
  name: string;
  description: string;
  marketDropPercent: number;
  estimatedPortfolioLossPercent: number;
  estimatedPortfolioLossINR: number;
  historicalContext: string;
}

export interface PortfolioRiskReport {
  portfolioVolatilityAnnualized: number;
  portfolioBeta: number;
  valueAtRisk95_1DayINR: number;
  valueAtRisk95_1MonthINR: number;
  maxHistoricalDrawdown: number;
  concentrationScore: number; // 0 to 100 (higher = more concentrated)
  liquidityScore: 'Excellent' | 'Good' | 'Fair' | 'Caution';
  holdingsCorrelation: {
    symbols: string[];
    matrix: number[][];
  };
  stressTests: StressScenario[];
  keyRiskWarnings: string[];
}

export interface PaperTradeOrder {
  id: string;
  timestamp: string;
  symbol: string;
  companyName: string;
  type: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT';
  shares: number;
  limitPrice?: number;
  executedPrice: number;
  grossAmount: number;
  charges: IndianStatutoryCharges;
  netCashImpact: number;
  status: 'EXECUTED' | 'CANCELLED';
  notes?: string;
}

export interface PaperTradeHolding {
  symbol: string;
  companyName: string;
  shares: number;
  averageBuyPrice: number;
  totalCostBasis: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  dayChangePercent: number;
  allocationPercent: number;
}

export interface PaperTradingState {
  initialCash: number;
  cashBalance: number;
  holdings: PaperTradeHolding[];
  transactions: PaperTradeOrder[];
  realizedPnl: number;
  totalPortfolioValue: number;
  historicalValues: { date: string; portfolioValue: number; benchmarkNifty: number }[];
  lastUpdated: string;
}

export interface BacktestResult {
  strategyName: string;
  symbol: string;
  startDate: string;
  endDate: string;
  trainEndDate: string;
  initialCapital: number;
  finalCapital: number;
  strategyTotalReturn: number;
  benchmarkTotalReturn: number;
  annualizedVolatility: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  winRatePercent: number;
  profitFactor: number;
  slippageAssumedPercent: number;
  equityCurve: { date: string; strategyEquity: number; benchmarkEquity: number }[];
  trades: {
    date: string;
    action: 'BUY' | 'SELL';
    price: number;
    shares: number;
    pnl?: number;
    returnPercent?: number;
  }[];
  outOfSampleMape: number;
  overfittingWarning: string;
}

export interface NewsAnnouncement {
  id: string;
  symbol?: string;
  companyName?: string;
  title: string;
  summary: string;
  category: 'FINANCIAL_RESULTS' | 'CORPORATE_ACTION' | 'REGULATORY_FILING' | 'MARKET_NEWS';
  publishedAt: string;
  source: string;
  url: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'CAUTIONARY';
}

export interface AIAnalystReport {
  symbol: string;
  companyName: string;
  reportDate: string;
  deterministicMetrics: {
    currentPrice: number;
    peRatio: number;
    pbRatio: number;
    roe: number;
    roce: number;
    debtToEquity: number;
    annualizedVolatility: number;
    beta: number;
    cagr3y: number;
    freeCashFlowCr: number;
  };
  section1_Overview: string;
  section2_FinancialPerformance: string;
  section3_RevenueProfitDebtCashFlowTrends: string;
  section4_ValuationWithSectorComparison: string;
  section5_HistoricalPriceAndVolatility: string;
  section6_NewsAndAnnouncements: string;
  section7_PositiveFactors: string[];
  section8_NegativeFactors: string[];
  section9_KeyRisksAndWarningSigns: string[];
  section10_ScenariosBullBaseBear: {
    bull: string;
    base: string;
    bear: string;
  };
  section11_ForecastAssumptionsAndUncertainty: string;
  section12_SourcesAndReliabilityDisclaimers: {
    sources: { name: string; url: string; date: string }[];
    missingDataItems: string[];
    reliabilityCaution: string;
  };
}

export interface ShareholdingPattern {
  promoterPercent: number;
  fiiPercent: number;
  diiPercent: number;
  publicPercent: number;
  promoterPledgedPercent: number;
  quarterlyTrend: { quarter: string; promoter: number; institutional: number; public: number }[];
}

export interface RedFlagCheck {
  hasAuditorRemarks: boolean;
  auditorRemarksDetail?: string;
  relatedPartyTxnCr: number;
  relatedPartyToRevenuePercent: number;
  contingentLiabilitiesCr: number;
  contingentToNetWorthPercent: number;
  promoterPledgeRisk: 'SAFE' | 'WATCH' | 'CRITICAL';
  managementTurnoverRecent: boolean;
  overallGovernanceScore: number; // 0-100 (higher = safer)
  governanceTier: 'Pristine Governance' | 'Standard Compliance' | 'Elevated Red Flags';
}

export interface ManagementGuidanceItem {
  fiscalYear: string;
  metric: string;
  guidedTarget: string;
  actualDelivered: string;
  targetMet: boolean;
  commentary: string;
}

export interface IPORecord {
  id: string;
  companyName: string;
  symbol: string;
  sector: string;
  issueDates: string;
  priceBand: string;
  lotSize: number;
  issueSizeCr: number;
  retailQuota: string;
  subscriptionTimes: number;
  gmpEstimatedGainPercent: number;
  status: 'UPCOMING' | 'ONGOING' | 'LISTED';
  listingDate?: string;
  listingGainPercent?: number;
  drhpRedFlags: string[];
}

export interface DataErrorTicket {
  ticketId: string;
  symbol: string;
  fieldName: string;
  displayedValue: string;
  userCorrection: string;
  sourceReference: string;
  timestamp: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'VERIFIED';
}

