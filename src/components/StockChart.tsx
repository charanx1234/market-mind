/**
 * MarketMind AI - High-Fidelity SVG Stock Chart Component
 * Supports Candlestick, Line, Moving Averages (20, 50, 200 SMA), Volume bars,
 * interactive crosshair tooltips, and Forecast Corridor projections.
 */

import React, { useState, useMemo } from 'react';
import { OHLCV } from '../types/market';

interface StockChartProps {
  data: OHLCV[];
  symbol: string;
  currencySymbol?: string;
  forecastCorridor?: {
    date: string;
    baseProjection?: number;
    bullBand?: number;
    bearBand?: number;
  }[];
  showForecastOverlay?: boolean;
}

export const StockChart: React.FC<StockChartProps> = ({
  data,
  symbol,
  currencySymbol = '₹',
  forecastCorridor,
  showForecastOverlay = false,
}) => {
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(false);
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Filter data based on selected time range
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    let sliceDays = data.length;
    if (timeRange === '1M') sliceDays = 22;
    else if (timeRange === '3M') sliceDays = 66;
    else if (timeRange === '6M') sliceDays = 130;
    else if (timeRange === '1Y') sliceDays = 252;
    return data.slice(-sliceDays);
  }, [data, timeRange]);

  // Calculate Simple Moving Averages
  const sma20 = useMemo(() => calculateSMA(filteredData, 20), [filteredData]);
  const sma50 = useMemo(() => calculateSMA(filteredData, 50), [filteredData]);
  const sma200 = useMemo(() => calculateSMA(filteredData, 200), [filteredData]);

  // Combined price min and max (including forecast if enabled)
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (filteredData.length === 0) return { minPrice: 0, maxPrice: 100, maxVolume: 100 };
    let min = Math.min(...filteredData.map(d => d.low));
    let max = Math.max(...filteredData.map(d => d.high));
    const maxVol = Math.max(...filteredData.map(d => d.volume));

    if (showForecastOverlay && forecastCorridor && forecastCorridor.length > 0) {
      forecastCorridor.forEach(f => {
        if (f.bullBand && f.bullBand > max) max = f.bullBand;
        if (f.bearBand && f.bearBand < min) min = f.bearBand;
      });
    }

    const padding = (max - min) * 0.08 || 10;
    return {
      minPrice: Math.max(0, min - padding),
      maxPrice: max + padding,
      maxVolume: maxVol * 1.2
    };
  }, [filteredData, showForecastOverlay, forecastCorridor]);

  // SVG dimensions
  const svgWidth = 840;
  const svgHeight = 420;
  const paddingLeft = 10;
  const paddingRight = 65;
  const paddingTop = 25;
  const priceHeight = 310;
  const volumeHeight = 70;
  const gap = 15;
  const volumeTop = paddingTop + priceHeight + gap;

  const totalPoints = filteredData.length + (showForecastOverlay && forecastCorridor ? forecastCorridor.length : 0);
  const chartDrawableWidth = svgWidth - paddingLeft - paddingRight;
  const stepX = totalPoints > 1 ? chartDrawableWidth / (totalPoints - 1) : chartDrawableWidth;

  // Coordinate mappers
  const getY = (price: number) => {
    return paddingTop + priceHeight - ((price - minPrice) / (maxPrice - minPrice || 1)) * priceHeight;
  };

  const getVolY = (vol: number) => {
    return volumeTop + volumeHeight - (vol / (maxVolume || 1)) * volumeHeight;
  };

  const activePoint = hoverIndex !== null && hoverIndex < filteredData.length ? filteredData[hoverIndex] : filteredData[filteredData.length - 1];

  return (
    <div className="bg-[#0e111a] border border-[#1f2434] rounded p-3 select-none">
      {/* Chart Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-[#1c212f] text-xs">
        {/* Active Point Stats */}
        {activePoint && (
          <div className="flex flex-wrap items-center gap-3 font-mono text-[#a0a5b5] text-[11px]">
            <span className="text-[#e6e8ee] font-sans font-semibold">{activePoint.date}</span>
            <span>O: <span className="text-[#d1d4dc]">{currencySymbol}{activePoint.open.toFixed(2)}</span></span>
            <span>H: <span className="text-[#089981]">{currencySymbol}{activePoint.high.toFixed(2)}</span></span>
            <span>L: <span className="text-[#f23645]">{currencySymbol}{activePoint.low.toFixed(2)}</span></span>
            <span>C: <span className="text-[#e6e8ee] font-bold">{currencySymbol}{activePoint.close.toFixed(2)}</span></span>
            <span className="text-[#787b86]">Vol: {(activePoint.volume / 100000).toFixed(1)}L</span>
          </div>
        )}

        {/* Timeframe & Overlay Toggles */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Chart Type */}
          <div className="bg-[#12151f] border border-[#202534] rounded p-0.5 flex">
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                chartType === 'candlestick' ? 'bg-[#22293b] text-[#60a5fa] font-bold' : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                chartType === 'line' ? 'bg-[#22293b] text-[#60a5fa] font-bold' : 'text-[#787b86] hover:text-[#d1d4dc]'
              }`}
            >
              Line
            </button>
          </div>

          {/* Indicator Toggles */}
          <div className="flex items-center gap-1 bg-[#12151f] border border-[#202534] px-1.5 py-0.5 rounded">
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition ${
                showSMA20 ? 'bg-[#f59e0b]/20 text-[#fbbf24] border border-[#f59e0b]/40' : 'text-[#555a6d]'
              }`}
            >
              20 SMA
            </button>
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition ${
                showSMA50 ? 'bg-[#06b6d4]/20 text-[#22d3ee] border border-[#06b6d4]/40' : 'text-[#555a6d]'
              }`}
            >
              50 SMA
            </button>
            <button
              onClick={() => setShowSMA200(!showSMA200)}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition ${
                showSMA200 ? 'bg-[#a855f7]/20 text-[#c084fc] border border-[#a855f7]/40' : 'text-[#555a6d]'
              }`}
            >
              200 SMA
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="bg-[#12151f] border border-[#202534] rounded p-0.5 flex">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  timeRange === t ? 'bg-[#22293b] text-[#60a5fa] font-bold' : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto cursor-crosshair"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
            const index = Math.round((mouseX - paddingLeft) / stepX);
            if (index >= 0 && index < filteredData.length) {
              setHoverIndex(index);
            }
          }}
        >
          {/* Price Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = paddingTop + priceHeight * ratio;
            const price = maxPrice - (maxPrice - minPrice) * ratio;
            return (
              <g key={ratio}>
                <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                <text x={svgWidth - paddingRight + 8} y={y + 4} fill="#64748b" fontSize="10" fontFamily="monospace">
                  {currencySymbol}{price.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Volume Baseline Line */}
          <line x1={paddingLeft} y1={volumeTop} x2={svgWidth - paddingRight} y2={volumeTop} stroke="#1e293b" />
          <text x={svgWidth - paddingRight + 8} y={volumeTop + 12} fill="#475569" fontSize="9" fontFamily="monospace">
            VOL
          </text>

          {/* Volume Bars */}
          {filteredData.map((d, i) => {
            const x = paddingLeft + i * stepX;
            const y = getVolY(d.volume);
            const h = volumeTop + volumeHeight - y;
            const isUp = d.close >= d.open;
            return (
              <rect
                key={`vol-${i}`}
                x={x - 1.5}
                y={y}
                width={3}
                height={Math.max(1, h)}
                fill={isUp ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}
              />
            );
          })}

          {/* Candlesticks or Line Mode */}
          {chartType === 'candlestick' ? (
            filteredData.map((d, i) => {
              const x = paddingLeft + i * stepX;
              const openY = getY(d.open);
              const closeY = getY(d.close);
              const highY = getY(d.high);
              const lowY = getY(d.low);
              const isUp = d.close >= d.open;
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));
              const color = isUp ? '#10b981' : '#f43f5e';

              return (
                <g key={`candle-${i}`}>
                  {/* High-Low Wick */}
                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth={1} />
                  {/* Real Body */}
                  <rect
                    x={x - 2.5}
                    y={bodyTop}
                    width={5}
                    height={bodyHeight}
                    fill={color}
                    rx={0.5}
                  />
                </g>
              );
            })
          ) : (
            <>
              {/* Shaded Area */}
              <path
                d={buildAreaPath(filteredData, paddingLeft, stepX, getY, paddingTop + priceHeight)}
                fill="url(#chartGradient)"
                opacity={0.4}
              />
              {/* Price Line */}
              <path
                d={buildLinePath(filteredData.map(d => d.close), paddingLeft, stepX, getY)}
                fill="none"
                stroke="#6366f1"
                strokeWidth={2}
              />
            </>
          )}

          {/* Moving Averages */}
          {showSMA20 && sma20.some(v => v !== null) && (
            <path
              d={buildSMAPath(sma20, paddingLeft, stepX, getY)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={1.5}
              opacity={0.9}
            />
          )}
          {showSMA50 && sma50.some(v => v !== null) && (
            <path
              d={buildSMAPath(sma50, paddingLeft, stepX, getY)}
              fill="none"
              stroke="#06b6d4"
              strokeWidth={1.5}
              opacity={0.9}
            />
          )}
          {showSMA200 && sma200.some(v => v !== null) && (
            <path
              d={buildSMAPath(sma200, paddingLeft, stepX, getY)}
              fill="none"
              stroke="#a855f7"
              strokeWidth={1.5}
              opacity={0.9}
            />
          )}

          {/* Forecast Corridor Overlay (Monte Carlo Fan) */}
          {showForecastOverlay && forecastCorridor && forecastCorridor.length > 0 && (
            <g>
              {/* Uncertainty Corridor Shading */}
              <path
                d={buildFanCorridorPath(
                  filteredData.length - 1,
                  paddingLeft,
                  stepX,
                  getY,
                  forecastCorridor
                )}
                fill="rgba(99, 102, 241, 0.15)"
                stroke="rgba(99, 102, 241, 0.3)"
                strokeDasharray="2 2"
              />
              {/* Forecast Base Projection Line */}
              <path
                d={buildFanLinePath(
                  filteredData.length - 1,
                  filteredData[filteredData.length - 1].close,
                  paddingLeft,
                  stepX,
                  getY,
                  forecastCorridor.map(f => f.baseProjection || filteredData[filteredData.length - 1].close)
                )}
                fill="none"
                stroke="#818cf8"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </g>
          )}

          {/* Interactive Crosshair */}
          {hoverIndex !== null && hoverIndex < filteredData.length && (
            <g>
              <line
                x1={paddingLeft + hoverIndex * stepX}
                y1={paddingTop}
                x2={paddingLeft + hoverIndex * stepX}
                y2={volumeTop + volumeHeight}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
              <line
                x1={paddingLeft}
                y1={getY(filteredData[hoverIndex].close)}
                x2={svgWidth - paddingRight}
                y2={getY(filteredData[hoverIndex].close)}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
              <circle
                cx={paddingLeft + hoverIndex * stepX}
                cy={getY(filteredData[hoverIndex].close)}
                r={4}
                fill="#6366f1"
                stroke="#ffffff"
                strokeWidth={1.5}
              />
            </g>
          )}

          {/* Gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Legend & Provenance Note */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span> 20 SMA
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span> 50 SMA
          </span>
          {showForecastOverlay && (
            <span className="flex items-center gap-1 text-indigo-400 font-medium">
              <span className="w-2.5 h-0.5 bg-indigo-400 inline-block border-b border-dashed"></span> Forecast Corridor
            </span>
          )}
        </div>
        <span className="font-mono text-slate-400">
          Exchange: NSE • Currency: {currencySymbol} (INR) • Daily EOD Close
        </span>
      </div>
    </div>
  );
};

// Helper function to compute SMA series
function calculateSMA(data: OHLCV[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      result.push(sum / period);
    }
  }
  return result;
}

function buildLinePath(
  values: number[],
  paddingLeft: number,
  stepX: number,
  getY: (p: number) => number
): string {
  if (values.length === 0) return '';
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${paddingLeft + i * stepX} ${getY(v)}`)
    .join(' ');
}

function buildAreaPath(
  data: OHLCV[],
  paddingLeft: number,
  stepX: number,
  getY: (p: number) => number,
  bottomY: number
): string {
  if (data.length === 0) return '';
  const linePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${paddingLeft + i * stepX} ${getY(d.close)}`)
    .join(' ');
  const lastX = paddingLeft + (data.length - 1) * stepX;
  return `${linePath} L ${lastX} ${bottomY} L ${paddingLeft} ${bottomY} Z`;
}

function buildSMAPath(
  sma: (number | null)[],
  paddingLeft: number,
  stepX: number,
  getY: (p: number) => number
): string {
  let path = '';
  let started = false;
  sma.forEach((v, i) => {
    if (v !== null) {
      const x = paddingLeft + i * stepX;
      const y = getY(v);
      if (!started) {
        path += `M ${x} ${y}`;
        started = true;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
  });
  return path;
}

function buildFanLinePath(
  startIndex: number,
  startPrice: number,
  paddingLeft: number,
  stepX: number,
  getY: (p: number) => number,
  projections: number[]
): string {
  let path = `M ${paddingLeft + startIndex * stepX} ${getY(startPrice)}`;
  projections.forEach((p, i) => {
    const x = paddingLeft + (startIndex + 1 + i) * stepX;
    path += ` L ${x} ${getY(p)}`;
  });
  return path;
}

function buildFanCorridorPath(
  startIndex: number,
  paddingLeft: number,
  stepX: number,
  getY: (p: number) => number,
  corridor: { bullBand?: number; bearBand?: number }[]
): string {
  if (corridor.length === 0) return '';
  const topPoints: string[] = [];
  const bottomPoints: string[] = [];

  corridor.forEach((c, i) => {
    const x = paddingLeft + (startIndex + 1 + i) * stepX;
    if (c.bullBand) topPoints.push(`L ${x} ${getY(c.bullBand)}`);
    if (c.bearBand) bottomPoints.unshift(`L ${x} ${getY(c.bearBand)}`);
  });

  const firstX = paddingLeft + (startIndex + 1) * stepX;
  const startTopY = getY(corridor[0].bullBand || 100);
  return `M ${firstX} ${startTopY} ${topPoints.join(' ')} ${bottomPoints.join(' ')} Z`;
}
