# MarketMind AI - Fintech Product Architecture, Schema & SEBI Compliance Blueprint

This document specifies the end-to-end architecture, compliance protocols, schemas, and implementation roadmap for **MarketMind AI**, an educational stock research, forecasting, risk analysis, and simulation platform for Indian retail investors (NSE & BSE).

---

## Deliverable 1: Site Map and User Flows

### Site Map Structure

```
MarketMind AI (Web App)
├── Global Navigation & Utility Header
│   ├── NSE / BSE Market Ticker Tape (NIFTY 50, SENSEX, NIFTY BANK, INDIA VIX)
│   ├── Instant Symbol Search (with autocomplete & exchange tags)
│   ├── Currency & Exchange Selector (INR ₹ / USD $; NSE / BSE)
│   ├── Data Provenance & Last Updated Status Badge
│   ├── Data Error Reporting Button ("Report Data Discrepancy")
│   └── Beginner Glossary & Regulatory Disclaimers Trigger
│
├── Workspace Modules
│   ├── 1. Market Overview & Breadth
│   │   ├── Index Performance Cards (Day High/Low, Net & % Change)
│   │   ├── Advance / Decline Market Breadth Ratio
│   │   ├── India VIX Volatility Thermometer
│   │   ├── Sector Heatmap & Inflows
│   │   └── Top Movers (Gainers, Losers, Volume Outliers)
│   │
│   ├── 2. Analytics Bento Grid
│   │   ├── Portfolio / Index Equity Growth Curve
│   │   ├── Intraday Turnover & Liquidity Waves (FII vs DII vs Retail)
│   │   ├── Squarified Sector & Asset Allocation Treemap
│   │   └── Indian 10-Year Monthly Seasonality Radar (Budget, Monsoon, Diwali)
│   │
│   ├── 3. Stock Screener & Research Rankings
│   │   ├── Multi-Factor Filters (Valuation, Profitability, Health, Volatility, Momentum)
│   │   ├── Transparent Research Scoring Breakdown (0-100 pts)
│   │   ├── Penalty Deductions (High Leverage, High Beta, Drawdowns)
│   │   ├── Saved Screens Preset (Quality Compounders, Dividend Shields, Low-Beta Value)
│   │   └── CSV Export for Offline Retail Research
│   │
│   ├── 4. Stock Inspection & Filings Research
│   │   ├── Interactive Candlestick / Line Chart (SMA 20/50/200, Volume)
│   │   ├── 5-Year Audited Financial Statements (P&L, Balance Sheet, Cash Flow)
│   │   ├── Shareholding Pattern (Promoter, FII, DII, Public, Pledged %)
│   │   ├── Corporate Governance & Red-Flag Audit (Auditor remarks, Related-Party, Contingent Liabilities)
│   │   ├── Management Guidance vs Actual Delivery Tracker
│   │   └── Sector Peer Comparison Table
│   │
│   ├── 5. AI Research Assistant (Gemini 3.8 Flash)
│   │   ├── Deterministic Data Grounding (ratios calculated prior to prompt)
│   │   ├── 12-Section Institutional Due Diligence Report
│   │   ├── Working Source Links & Audit Disclaimers
│   │   └── Plain-Language Explanations of Technical Ratios
│   │
│   ├── 6. Probabilistic Scenario Forecasting (GBM Baseline)
│   │   ├── Multi-Horizon Scenario Corridors (1M, 3M, 6M, 12M)
│   │   ├── Probabilistic Fan Chart (Bear 10%, Base 50%, Bull 90%)
│   │   ├── Out-of-Sample Historical Backtest (MAPE vs Naive Persistence)
│   │   └── Public Model Track Record & Failed Forecast Log
│   │
│   ├── 7. Risk Management & Macro Stress Tests
│   │   ├── Annualized Historical Volatility & Market Beta
│   │   ├── Value at Risk (VaR 95% 1-Day & 1-Month)
│   │   ├── Maximum Historical Drawdown
│   │   ├── Holdings Correlation Matrix Heatmap
│   │   └── Historical Stress Shocks (2008 GFC, 2020 COVID, RBI Rate Spike, Oil $120)
│   │
│   ├── 8. Paper Trading Simulator (100% Virtual)
│   │   ├── Simulated Market & Limit Orders
│   │   ├── Indian Cash Delivery Statutory Taxes (STT, Stamp Duty, GST, Exchange charges)
│   │   ├── Active Portfolio Holdings & FIFO Cost Basis
│   │   ├── Realized & Unrealized P&L Tracker
│   │   └── Benchmark Comparison Curve (Portfolio vs NIFTY 50)
│   │
│   ├── 9. Personal Finance & Tax Calculators
│   │   ├── Revised Indian Capital Gains Tax (STCG 20% / LTCG 12.5% per Budget 2024)
│   │   ├── Systematic Investment Plan (SIP) Calculator with Inflation Adjustment
│   │   ├── Whole-Share Budget Allocator & Round-Trip Break-Even Calculator
│   │   └── IPO Tracker (Price Bands, Lot Sizes, Subscription Status, DRHP Red Flags)
│   │
│   └── 10. Corporate Actions & Regulatory Filings Hub
│       ├── Earnings Calendar & Quarterly Board Meetings
│       ├── Dividend, Bonus & Split Announcements
│       └── Sentiment Indication & Official BSE/NSE Hyperlinks
```

### Core User Flow

```
[Retail Investor Lands on Platform]
       │
       ▼
[Market Overview / Bento Dashboard] ──► Inspect Index Breadth & VIX
       │
       ├──► Search Stock (e.g. RELIANCE, TCS) ──► Stock Detail Modal
       │                                            │
       │                                            ├── Check 5Y Audited Financials
       │                                            ├── Check Shareholding & Pledges
       │                                            ├── Inspect Red Flags & Guidance
       │                                            ├── Peer Comparison within Sector
       │                                            └── Launch AI Analyst / Forecast
       │
       ├──► Stock Screener ──► Apply Filters ──► View Research Scores ──► Export CSV
       │
       ├──► Scenario Forecasting ──► Select Horizon (1M-12M) ──► Review Out-of-Sample MAPE
       │
       ├──► Risk & Stress Tests ──► View VaR 95% & Correlation Matrix ──► Macro Shock Simulation
       │
       ├──► Hypothetical Tax / Budget Calculator ──► Compute STCG/LTCG & Whole-Share Limits
       │
       └──► Paper Trading Simulator ──► Execute Virtual Order with STT & GST ──► Track NAV
```

---

## Deliverable 2: Database and Data-Source Schema

### Data Sources
1. **Exchange Feeds**: NSE & BSE EOD Archive / Authorized Licensed Vendor API (with fallback sandbox).
2. **Corporate Filings**: Ministry of Corporate Affairs (MCA), BSE Corporate Filings, NSE Company Announcements.
3. **Macro Baselines**: Reserve Bank of India (RBI Repo Rate ~6.5%), Ministry of Statistics and Programme Implementation (MOSPI).

### Relational / Document Database Schema

```typescript
// 1. Instruments & Audited Financials
interface InstrumentDocument {
  symbol: string;                  // Primary Key (e.g. 'RELIANCE')
  isin: string;                    // International Securities Identification Number
  exchange: 'NSE' | 'BSE';
  name: string;
  sector: string;
  industry: string;
  currentPrice: number;
  dayChange: number;
  dayChangePercent: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  high52w: number;
  low52w: number;
  marketCapCr: number;
  
  // Audited Fundamentals
  fundamentals: {
    peRatio: number;
    pbRatio: number;
    evToEbitda: number;
    dividendYield: number;
    roe: number;
    roce: number;
    debtToEquity: number;
    currentRatio: number;
    eps: number;
    sectorPe: number;
    sectorPb: number;
    freeCashFlowYield: number;
  };

  // Ownership Pattern
  shareholding: {
    promoterPercent: number;
    fiiPercent: number;
    diiPercent: number;
    publicPercent: number;
    promoterPledgedPercent: number;
    quarterlyTrend: { quarter: string; promoter: number; institutional: number }[];
  };

  // Corporate Governance & Red-Flag Audit
  redFlags: {
    hasAuditorRemarks: boolean;
    auditorRemarksSummary?: string;
    hasRelatedPartyTransactions: boolean;
    relatedPartyExposureCr: number;
    contingentLiabilitiesCr: number;
    contingentLiabilitiesToNetWorthPct: number;
    promoterPledgeRiskLevel: 'SAFE' | 'ELEVATED' | 'CRITICAL';
    managementTurnoverRecent: boolean;
    overallRiskTier: 'LOW_RISK' | 'MODERATE_MONITOR' | 'HIGH_RED_FLAG';
  };

  // Multi-Year Management Guidance Verification
  managementTrackRecord: {
    fiscalYear: string;
    guidanceMetric: string;
    guidedTarget: string;
    actualDelivered: string;
    targetMet: boolean;
    variancePercent: number;
  }[];

  meta: {
    source: string;
    retrievedAt: string;
    marketTimestamp: string;
    isDelayed: boolean;
    isSampleData: boolean;
    coveragePercent: number;
  };
}

// 2. Probabilistic Forecasts & Public Track Record
interface ForecastTrackRecord {
  id: string;
  symbol: string;
  generatedDate: string;
  targetHorizon: '1M' | '3M' | '6M' | '12M';
  referencePriceAtForecast: number;
  projectedBearPrice: number;
  projectedBasePrice: number;
  projectedBullPrice: number;
  actualPriceAtTargetDate?: number;
  realizedErrorPercent?: number;
  wasWithinCorridor?: boolean;
  status: 'PENDING_EVALUATION' | 'VERIFIED_CORRECT' | 'MISSED_RANGE';
  driftAssumed: number;
  volatilityAssumed: number;
}

// 3. User Paper Trading & Portfolio Storage
interface PaperTradingPortfolio {
  userId: string;
  cashBalance: number;
  initialCapital: number;
  holdings: {
    symbol: string;
    shares: number;
    avgBuyPrice: number;
    costBasis: number;
    currentPrice: number;
    unrealizedPnl: number;
  }[];
  orders: {
    orderId: string;
    timestamp: string;
    symbol: string;
    action: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    shares: number;
    price: number;
    sttPaid: number;
    stampDutyPaid: number;
    gstPaid: number;
    exchangeChargesPaid: number;
    netCashImpact: number;
  }[];
  realizedPnl: number;
}

// 4. Data Error Reporting Tickets
interface DataErrorTicket {
  ticketId: string;
  symbol: string;
  reportedField: string;
  displayedValue: string;
  userClaimedValue?: string;
  sourceCited?: string;
  reportedAt: string;
  status: 'LOGGED' | 'INVESTIGATING' | 'RECTIFIED' | 'INVALID';
}
```

---

## Deliverable 3: UI Wireframes for Main Pages

### Wireframe 1: Market Dashboard & Overview
```
+---------------------------------------------------------------------------------------+
|  [LOGO] MarketMind AI     [Search: RELIANCE, TCS...]    [Glossary] [Settings] [Report] |
|  NIFTY 50: 24,852 (+0.58%) | SENSEX: 81,480 (+0.60%) | INDIA VIX: 13.42 (Low Risk)    |
+---------------------------------------------------------------------------------------+
| SIDEBAR   | [DISCLAIMER BANNER: Educational Research Only - Not SEBI Buy Advice]       |
|           |                                                                           |
| Overview  | [4 Index Cards]                                                           |
| Bento     | +-------------------+ +-------------------+ +-------------------+         |
| Screener  | | NIFTY 50: 24,852  | | BSE SENSEX: 81,480| | NIFTY BANK: 51,940|         |
| Analysis  | +-------------------+ +-------------------+ +-------------------+         |
| Forecast  |                                                                           |
| Risk      | [Analytics Bento Grid: Live Equity Curve + Inflow Waves + Treemap + Radar] |
| Paper     |                                                                           |
| Taxes/SIP | [Sector Heatmap Strip] [Market Breadth: 1,420 Advances / 810 Declines]    |
| Red Flags |                                                                           |
| IPOs      | [Top Gainers (4)]   [Top Losers (4)]   [Active by Volume (4)]             |
+-----------+---------------------------------------------------------------------------+
```

### Wireframe 2: Stock Inspection & Governance Red-Flag Audit Page
```
+---------------------------------------------------------------------------------------+
|  TCS: ₹4,120.75 (-0.44%) | IT Services | NSE | 52W: ₹3,315 - ₹4,585 | Source: NSE EOD  |
+---------------------------------------------------------------------------------------+
| [Tabs: Chart & Indicators | 5Y Audited Statements | Governance & Red Flags | Peers]   |
|                                                                                       |
| +-----------------------------------------------------------------------------------+ |
| | Interactive Candlestick / Line Chart (SMA 20, 50, 200, Volume, Crosshair)         | |
| +-----------------------------------------------------------------------------------+ |
|                                                                                       |
| [Shareholding Pattern Bar]: Promoter: 71.8% | FII: 12.5% | DII: 10.2% | Public: 5.5%  |
| Promoter Pledge: 0.0% (Pristine - Zero Debt Pledging)                                |
|                                                                                       |
| [Corporate Governance Red-Flag Check]:                                                |
| - Auditor Remarks: Clean (No modifications / No going-concern qualifications) [✓]     |
| - Related-Party Transactions: 1.2% of Revenue (Within statutory limits) [✓]           |
| - Contingent Liabilities: ₹2,100 Cr (2.1% of Net Worth - Low risk) [✓]                |
|                                                                                       |
| [Management Guidance Tracker]: FY24 Target: 10-12% CC Growth -> Delivered: 8.5%       |
+---------------------------------------------------------------------------------------+
```

### Wireframe 3: Personal Finance, Indian Capital Gains Tax & SIP Planner
```
+---------------------------------------------------------------------------------------+
|  INDIAN RETAIL FINTECH CALCULATOR SUITE (Budget 2024 Tax Schedule)                     |
+---------------------------------------------------------------------------------------+
| [Tab 1: STCG / LTCG Equity Tax]                                                       |
| Purchase Price: ₹[10,000] | Sale Price: ₹[25,000] | Holding Period: [14 Months]       |
| Gain: ₹15,000 (Long Term)                                                             |
| Tax Calculation: Exempt limit ₹1,25,000 -> Tax Rate: 12.5% + 4% Health & Ed Cess     |
| Net Tax Payable: ₹0 (Under annual exemption)                                          |
|                                                                                       |
| [Tab 2: SIP & Wealth Planner]                                                         |
| Monthly Investment: ₹[10,000] | Duration: [10 Years] | Expected Return: [12% CAGR]     |
| Total Invested: ₹12,00,000 | Estimated Value: ₹23,23,391 | Net Profit: ₹11,23,391     |
+---------------------------------------------------------------------------------------+
```

---

## Deliverable 4: Phase-Wise Implementation Roadmap

| Phase | Core Focus & Features | Verification & Milestones |
| :--- | :--- | :--- |
| **Phase 1: Foundations** | Data adapter, live index ticker, daily OHLCV, 5-year audited financial statements, multi-factor screener with CSV export, interactive SVG charting. | All deterministic formulas pass test suite (`/api/tests`). End-to-end page loads < 1.5s. |
| **Phase 2: Governance & Filings** | Shareholding patterns (FII/DII/Promoter), governance red flags (pledges, auditor remarks, contingent liabilities), management guidance vs actual delivery tracker, peer comparisons. | Clean corporate filings integration with zero missing field errors. Disclaimers visible on all pages. |
| **Phase 3: Risk, Forecast & Simulation** | Probabilistic Geometric Brownian Motion forecasting corridors (1M-12M), out-of-sample backtesting with slippage and Indian STT/GST, Value at Risk, persistent paper trading broker. | Complete isolation between hypothetical models and real execution. Zero real money claims. |
| **Phase 4: Personal Finance & IPOs** | Revised Indian STCG/LTCG capital gains tax calculator (Budget 2024 rules), SIP wealth planner, IPO tracker with DRHP red-flag analysis, public model track record log, error reporting channel. | Automated compliance audit pass. Full SEBI educational disclosures active. |

---

## Deliverable 5: SEBI Compliance & Trust Checklist

1. **No Guaranteed Returns Prohibition**:
   - Zero usage of "sure-shot", "guaranteed", "multibagger", "100% win rate", or "risk-free".
   - Every scenario calculation explicitly presents **Bear Case downside loss possibilities** alongside base and bull projections.
2. **Mandatory Educational Disclaimer**:
   - Stamped on header, footer, modal views, and AI report downloads:
     > *"This platform is for personal financial education, strategy testing, and simulated research only. It does not provide personalized investment advice, stock recommendations, or portfolio management services. Indian equity and derivatives markets are subject to market risks. Please consult a SEBI-registered Investment Adviser before committing real capital."*
3. **Data Provenance Transparency**:
   - Every price and fundamental quote displays its licensed source, retrieval timestamp, market end-of-day timestamp, and delayed status. Sample or cached data is explicitly marked as sandbox data.
4. **Data Discrepancy Reporting Channel**:
   - Prominent "Report Data Error" button on all stock pages with immediate logging for editorial audit.
5. **Conflict of Interest & Operator Disclosures**:
   - The platform maintains a public change log and clearly states that neither the developers nor the models hold commercial brokerage compensation for orders placed in simulation.
