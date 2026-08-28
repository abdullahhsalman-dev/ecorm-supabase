"use client";

import { useState } from "react";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
}

export function AnalyticsChart({ data, title = "Weekly Revenue", subtitle = "Sales performance over the last 7 days" }: AnalyticsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG dimensions
  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-xl border border-neutral-100 bg-white">
        <p className="text-sm text-neutral-400">No chart data available</p>
      </div>
    );
  }

  // Calculate scales
  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 1000); // Floor max value to 1000 for scale
  const minVal = 0;
  const range = maxVal - minVal;

  // Generate SVG coordinates
  const points = data.map((point, index) => {
    const x = paddingX + (index * (width - 2 * paddingX)) / (data.length - 1);
    // Invert Y axis for SVG (0,0 is top-left)
    const y = height - paddingY - ((point.value - minVal) * (height - 2 * paddingY)) / range;
    return { x, y, label: point.label, value: point.value };
  });

  // Construct Line path (d attribute)
  const linePath = points.reduce((path, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
  }, "");

  // Construct Area path (d attribute going to baseline)
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  // Grid lines
  const gridLinesCount = 4;
  const gridLines = Array.from({ length: gridLinesCount }).map((_, i) => {
    const y = paddingY + (i * (height - 2 * paddingY)) / (gridLinesCount - 1);
    const value = maxVal - (i * range) / (gridLinesCount - 1);
    return { y, value };
  });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-bold text-neutral-800">{title}</h3>
          <p className="text-xs text-neutral-400">{subtitle}</p>
        </div>
        {hoveredIndex !== null && (
          <div className="text-right">
            <span className="text-xs font-semibold text-neutral-400">
              {points[hoveredIndex].label}:
            </span>{" "}
            <span className="text-sm font-bold text-[#FF3D6E]">
              Rs. {points[hoveredIndex].value.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* SVG Responsive Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Definitions for Gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3D6E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FF3D6E" stopOpacity="0.0" />
            </linearGradient>
            <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#FF3D6E" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, i) => (
            <g key={i} className="opacity-40">
              <line
                x1={paddingX}
                y1={line.y}
                x2={width - paddingX}
                y2={line.y}
                stroke="#E5E5E5"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 8}
                y={line.y + 4}
                className="text-[9px] font-semibold text-neutral-400"
                textAnchor="end"
              >
                {line.value >= 1000 
                  ? `${(line.value / 1000).toFixed(0)}k` 
                  : line.value.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Area under the line */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#chartGradient)"
              className="transition-all duration-300"
            />
          )}

          {/* Line Path */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#FF3D6E"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#shadow)"
              className="transition-all duration-300"
            />
          )}

          {/* Interaction Dots and Overlay columns */}
          {points.map((p, i) => (
            <g key={i}>
              {/* Invisible touch column for easier hover */}
              <rect
                x={p.x - 20}
                y={paddingY}
                width={40}
                height={height - 2 * paddingY}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />

              {/* Data Node circle marker */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? 6 : 4}
                fill={hoveredIndex === i ? "#FF3D6E" : "#FFFFFF"}
                stroke="#FF3D6E"
                strokeWidth={hoveredIndex === i ? 3 : 2}
                className="transition-all duration-150 pointer-events-none"
              />

              {/* X Axis Labels */}
              {i % 1 === 0 && (
                <text
                  x={p.x}
                  y={height - paddingY + 16}
                  className="text-[9px] font-bold text-neutral-400 fill-current"
                  textAnchor="middle"
                >
                  {p.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
