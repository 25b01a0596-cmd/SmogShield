import React, { useMemo, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  Info,
  Shield,
  ShieldCheck,
  Thermometer,
  Wind,
} from "lucide-react";
import type { CityTelemetry, SmogSurvivalPlan } from "../types";

interface TelemetryOverviewProps {
  telemetry: CityTelemetry;
  plan: SmogSurvivalPlan;
}

function getAqiTone(category: CityTelemetry["aqiCategory"]) {
  switch (category) {
    case "Good":
      return {
        textClass: "text-emerald-700",
        surfaceClass: "bg-emerald-50/70 border-emerald-200",
        Icon: ShieldCheck,
      };
    case "Moderate":
      return {
        textClass: "text-amber-700",
        surfaceClass: "bg-amber-50/70 border-amber-200",
        Icon: Info,
      };
    case "Unhealthy for Sensitive Groups":
    case "Unhealthy":
      return {
        textClass: "text-orange-700",
        surfaceClass: "bg-orange-50/70 border-orange-200",
        Icon: AlertTriangle,
      };
    case "Very Unhealthy":
    case "Hazardous":
      return {
        textClass: "text-rose-700",
        surfaceClass: "bg-rose-50/70 border-rose-200",
        Icon: AlertOctagon,
      };
  }
}

export const TelemetryOverview: React.FC<TelemetryOverviewProps> = ({
  telemetry,
  plan,
}) => {
  const [chartMetric, setChartMetric] = useState<"pm25" | "usAqi">("pm25");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const tone = getAqiTone(telemetry.aqiCategory);
  const StatusIcon = tone.Icon;

  const forecast = telemetry.hourlyForecast;

  const chartData = useMemo(() => {
    const width = 760;
    const height = 210;
    const padLeft = 44;
    const padRight = 18;
    const padTop = 20;
    const padBottom = 32;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    if (forecast.length === 0) {
      return null;
    }

    const values = forecast.map((p) => (chartMetric === "pm25" ? p.pm25 : p.usAqi));
    const whoLineVal = chartMetric === "pm25" ? 15 : 50;
    const rawMax = Math.max(...values, whoLineVal * 1.2, 20);
    const maxVal = Math.ceil(rawMax / 10) * 10;

    const getX = (i: number) =>
      forecast.length === 1
        ? padLeft + plotW / 2
        : padLeft + (i / (forecast.length - 1)) * plotW;

    const getY = (val: number) =>
      padTop + plotH - Math.min(1, Math.max(0, val / maxVal)) * plotH;

    const points = forecast.map((p, i) => ({
      x: getX(i),
      y: getY(chartMetric === "pm25" ? p.pm25 : p.usAqi),
      data: p,
    }));

    const linePath = points
      .map((pt, idx) => `${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(" ");

    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
      padTop + plotH
    ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`;

    // Find lowest 3-hour window to highlight as best ventilation/outdoor band
    let bestStart = 0;
    let bestSum = Infinity;
    if (values.length >= 3) {
      for (let i = 0; i <= values.length - 3; i++) {
        const s = values[i] + values[i + 1] + values[i + 2];
        if (s < bestSum) {
          bestSum = s;
          bestStart = i;
        }
      }
    }

    const bestBandX1 = getX(bestStart);
    const bestBandX2 = getX(Math.min(values.length - 1, bestStart + 2));

    return {
      width,
      height,
      padLeft,
      padRight,
      padTop,
      padBottom,
      plotW,
      plotH,
      maxVal,
      whoY: getY(whoLineVal),
      whoLabel: chartMetric === "pm25" ? "WHO 24h (15)" : "Good (50)",
      points,
      linePath,
      areaPath,
      bestBandX1,
      bestBandX2,
      yTicks: [0, Math.round(maxVal * 0.5), maxVal],
    };
  }, [forecast, chartMetric]);

  const activePoint =
    chartData && hoverIdx !== null && chartData.points[hoverIdx]
      ? chartData.points[hoverIdx]
      : null;

  return (
    <section id="telemetry" className="space-y-6 scroll-mt-20">
      {/* City Header & Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
              <span>{telemetry.regionLabel}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {telemetry.latitude.toFixed(2)}°, {telemetry.longitude.toFixed(2)}°
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                Observed {telemetry.observationTime.replace("T", " ")} ({telemetry.timezone})
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {telemetry.cityName} Air Quality Briefing
            </h1>
          </div>

          <div
            className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-md border shrink-0 ${tone.surfaceClass}`}
          >
            <StatusIcon className={`w-4 h-4 shrink-0 ${tone.textClass}`} aria-hidden="true" />
            <div className="text-sm font-semibold whitespace-nowrap">
              <span className={`font-mono tabular-nums ${tone.textClass}`}>
                US AQI {telemetry.usAqi}
              </span>
              <span className="text-slate-400 mx-1.5" aria-hidden="true">
                ·
              </span>
              <span className={tone.textClass}>{telemetry.aqiCategory}</span>
            </div>
          </div>
        </div>

        {/* 4-column Tabular Telemetry Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
          <div>
            <div className="text-xs font-medium text-slate-500">Fine Particulates (PM2.5)</div>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-semibold tabular-nums text-slate-900">
                {telemetry.pm25.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1.5">µg/m³</span>
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-500 mt-1">
              {telemetry.whoPm25Ratio}× WHO 24h guideline
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500">Coarse Dust (PM10)</div>
            <div className="mt-1 flex items-baseline">
              <span className="text-2xl font-mono font-semibold tabular-nums text-slate-900">
                {telemetry.pm10.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-slate-500 ml-1.5">µg/m³</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 truncate">
              Primary: {telemetry.dominantPollutant}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500">Traffic NO₂ / Ozone O₃</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-mono font-semibold tabular-nums text-slate-900">
                {telemetry.no2.toFixed(0)}
                <span className="text-slate-400 font-normal mx-1">/</span>
                {telemetry.o3.toFixed(0)}
              </span>
              <span className="text-xs font-mono text-slate-500">µg/m³</span>
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-500 mt-1">
              SO₂ {telemetry.so2.toFixed(1)} · CO {telemetry.co} µg/m³
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500">Local Dispersion</div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-2xl font-mono font-semibold tabular-nums text-slate-900 inline-flex items-center gap-1">
                <Wind className="w-4 h-4 text-slate-400" aria-hidden="true" />
                {telemetry.windSpeedKmh}
              </span>
              <span className="text-xs font-mono text-slate-500">km/h</span>
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-500 mt-1 inline-flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              <span>
                {telemetry.temperatureC}°C · {telemetry.humidityPct}% RH
              </span>
            </div>
          </div>
        </div>

        {/* 24-Hour Exposure Curve Chart */}
        {chartData && (
          <div className="pt-5 border-t border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  24-Hour Air Quality Trajectory
                </h2>
                <p className="text-xs text-slate-500">
                  Shaded green band marks the lowest-exposure window for essential outdoor errands or ventilation.
                </p>
              </div>
              <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-md self-start">
                <button
                  type="button"
                  onClick={() => setChartMetric("pm25")}
                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                    chartMetric === "pm25"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  PM2.5 (µg/m³)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMetric("usAqi")}
                  className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                    chartMetric === "usAqi"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  US AQI
                </button>
              </div>
            </div>

            <div className="relative bg-slate-50/70 border border-slate-200 rounded-md p-3">
              {activePoint && (
                <div className="absolute top-3 right-3 z-10 bg-white border border-slate-200 rounded-sm px-2.5 py-1.5 text-xs font-mono tabular-nums text-slate-800 shadow-xs pointer-events-none">
                  <span>{activePoint.data.hourLabel}</span>
                  <span className="text-slate-300 mx-1.5">|</span>
                  <span className="font-semibold text-blue-700">
                    PM2.5 {activePoint.data.pm25.toFixed(1)} µg/m³
                  </span>
                  <span className="text-slate-300 mx-1.5">|</span>
                  <span>AQI {activePoint.data.usAqi}</span>
                </div>
              )}

              <svg
                viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                className="w-full h-auto overflow-visible cursor-crosshair select-none"
                role="img"
                aria-label="24-hour air quality forecast chart"
                onMouseLeave={() => setHoverIdx(null)}
              >
                <defs>
                  <linearGradient id="aqAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Lowest exposure window band */}
                <rect
                  x={chartData.bestBandX1}
                  y={chartData.padTop}
                  width={Math.max(12, chartData.bestBandX2 - chartData.bestBandX1)}
                  height={chartData.plotH}
                  fill="#10B981"
                  fillOpacity="0.12"
                />

                {/* Horizontal Y ticks */}
                {chartData.yTicks.map((tick) => {
                  const y =
                    chartData.padTop +
                    chartData.plotH -
                    (tick / chartData.maxVal) * chartData.plotH;
                  return (
                    <g key={tick}>
                      <line
                        x1={chartData.padLeft}
                        y1={y}
                        x2={chartData.width - chartData.padRight}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeWidth="1"
                      />
                      <text
                        x={chartData.padLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-slate-400 text-[10px]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {tick}
                      </text>
                    </g>
                  );
                })}

                {/* WHO / Good reference line */}
                {chartData.whoY >= chartData.padTop && (
                  <g>
                    <line
                      x1={chartData.padLeft}
                      y1={chartData.whoY}
                      x2={chartData.width - chartData.padRight}
                      y2={chartData.whoY}
                      stroke="#059669"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={chartData.padLeft + 6}
                      y={chartData.whoY - 5}
                      className="fill-emerald-700 text-[10px]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {chartData.whoLabel}
                    </text>
                  </g>
                )}

                {/* Area and line */}
                <path d={chartData.areaPath} fill="url(#aqAreaFill)" />
                <path
                  d={chartData.linePath}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* X-axis labels every 4 hours */}
                {chartData.points.map((pt, i) => {
                  if (i % 4 !== 0 && i !== chartData.points.length - 1) return null;
                  return (
                    <text
                      key={pt.data.time}
                      x={pt.x}
                      y={chartData.height - 8}
                      textAnchor="middle"
                      className="fill-slate-500 text-[10px]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {pt.data.hourLabel}
                    </text>
                  );
                })}

                {/* Crosshair hover indicator */}
                {activePoint && (
                  <g>
                    <line
                      x1={activePoint.x}
                      y1={chartData.padTop}
                      x2={activePoint.x}
                      y2={chartData.padTop + chartData.plotH}
                      stroke="#475569"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={activePoint.x}
                      cy={activePoint.y}
                      r="4.5"
                      fill="#2563EB"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Invisible interactive columns */}
                {chartData.points.map((pt, i) => {
                  const colW = chartData.plotW / Math.max(1, chartData.points.length);
                  return (
                    <rect
                      key={`hit-${pt.data.time}`}
                      x={pt.x - colW / 2}
                      y={chartData.padTop}
                      width={colW}
                      height={chartData.plotH}
                      fill="transparent"
                      onMouseEnter={() => setHoverIdx(i)}
                      onFocus={() => setHoverIdx(i)}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Clinical Summary + Mask + Safe Window */}
        <div className="pt-5 border-t border-slate-200 space-y-5">
          <p className="text-sm text-slate-700 leading-relaxed">{plan.citySummary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Shield className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                <span>Respiratory Mask Protocol</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {plan.maskProtocol.recommendedGrade}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {plan.maskProtocol.whenToWear}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fit note: {plan.maskProtocol.fitCheckNote}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                <span>Outdoor Exposure Windows</span>
              </div>
              <div className="text-sm font-semibold text-slate-900">
                Best: {plan.safeOutdoorWindows.bestWindow}
                <span className="text-slate-400 font-normal mx-2">·</span>
                Avoid: {plan.safeOutdoorWindows.avoidWindow}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {plan.safeOutdoorWindows.rationale}
              </p>
            </div>
          </div>

          {plan.householdAlerts.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-slate-700">
                Household Sensitivity Alerts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {plan.householdAlerts.map((alert) => (
                  <div
                    key={alert.group}
                    className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-md space-y-1"
                  >
                    <div className="text-xs font-semibold text-amber-900">
                      {alert.group}
                    </div>
                    <div className="text-xs text-slate-700 font-medium">
                      {alert.thresholdNote}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {alert.protectiveProtocol}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
