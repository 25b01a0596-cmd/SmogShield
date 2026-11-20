import React from "react";
import { HeartPulse, Leaf } from "lucide-react";
import type { AssessmentResponse } from "../types";

interface ImpactSectionProps {
  assessment: AssessmentResponse;
  adoptedRoutineIds: Record<string, boolean>;
  adoptedHackIds: Record<string, boolean>;
  adoptedAltIds: Record<string, boolean>;
  onSelectAll: () => void;
  onClearAll: () => void;
}

export const ImpactSection: React.FC<ImpactSectionProps> = ({
  assessment,
  adoptedRoutineIds,
  adoptedHackIds,
  adoptedAltIds,
  onSelectAll,
  onClearAll,
}) => {
  const { plan, telemetry } = assessment;
  const { impactSummary } = plan;

  // Calculate live adoption ratio for exposure mitigation (routine + indoor hacks)
  const exposureItems = [
    ...plan.dailyRoutineSchedule.map((r) => ({
      id: r.id,
      weight: Math.max(1, r.exposureReductionPct),
      adopted: Boolean(adoptedRoutineIds[r.id]),
    })),
    ...plan.indoorAirHacks.map((h) => ({
      id: h.id,
      weight: Math.max(1, h.exposureReductionPct),
      adopted: Boolean(adoptedHackIds[h.id]),
    })),
  ];

  const totalExposureWeight = exposureItems.reduce((acc, i) => acc + i.weight, 0);
  const activeExposureWeight = exposureItems
    .filter((i) => i.adopted)
    .reduce((acc, i) => acc + i.weight, 0);
  const exposureProgress =
    totalExposureWeight > 0 ? activeExposureWeight / totalExposureWeight : 0;

  const activeReductionPct = Math.round(
    impactSummary.maxExposureReductionPct * exposureProgress
  );

  const baselineExposure = impactSummary.baselineDailyPm25ExposureUg;
  const currentProjectedExposure = Number(
    (
      baselineExposure -
      (baselineExposure - impactSummary.protectedDailyPm25ExposureUg) *
        exposureProgress
    ).toFixed(1)
  );

  // Calculate exact weekly CO2 avoided from adopted routine blocks (5 days/wk) + adopted alternatives
  const routineWeeklyCo2 = plan.dailyRoutineSchedule
    .filter((r) => adoptedRoutineIds[r.id])
    .reduce((sum, r) => sum + r.emissionSavedKgCo2 * 5, 0);

  const alternativesWeeklyCo2 = plan.sustainableAlternatives
    .filter((a) => adoptedAltIds[a.id])
    .reduce((sum, a) => sum + a.weeklyCo2SavedKg, 0);

  const currentWeeklyCo2 = Number((routineWeeklyCo2 + alternativesWeeklyCo2).toFixed(1));
  const projectedAnnualCo2 = Math.round(currentWeeklyCo2 * 52);

  return (
    <section
      id="impact"
      className="bg-white border border-slate-200 rounded-lg p-6 space-y-6 scroll-mt-20"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            04. Direct Health & Environmental Impact
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Live recalculation based on the routine blocks, indoor protocols, and swaps you have toggled active.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline underline-offset-2 cursor-pointer"
          >
            Enable all measures
          </button>
          <span aria-hidden="true" className="text-slate-300">
            ·
          </span>
          <button
            type="button"
            onClick={onClearAll}
            className="text-slate-600 hover:text-slate-900 font-medium hover:underline underline-offset-2 cursor-pointer"
          >
            Reset toggles
          </button>
        </div>
      </div>

      {/* Quantified Outcome Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
          <div className="text-xs font-medium text-slate-500">
            Projected 24h Inhaled PM2.5
          </div>
          <div className="mt-1 flex items-baseline">
            <span className="text-2xl font-mono font-bold tabular-nums text-slate-900">
              {currentProjectedExposure}
            </span>
            <span className="text-xs font-mono text-slate-500 ml-1.5">µg/m³ avg</span>
          </div>
          <div className="text-xs font-mono tabular-nums text-emerald-700 mt-1">
            Down from {baselineExposure.toFixed(1)} µg/m³ (-{activeReductionPct}%)
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
          <div className="text-xs font-medium text-slate-500">
            Weekly Emissions Avoided
          </div>
          <div className="mt-1 flex items-baseline">
            <span className="text-2xl font-mono font-bold tabular-nums text-slate-900">
              {currentWeeklyCo2.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-slate-500 ml-1.5">kg CO₂e/wk</span>
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-600 mt-1">
            {projectedAnnualCo2.toLocaleString()} kg CO₂e annualized
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
          <div className="text-xs font-medium text-slate-500">
            Full-Plan Potential
          </div>
          <div className="mt-1 flex items-baseline">
            <span className="text-2xl font-mono font-bold tabular-nums text-slate-900">
              {impactSummary.maxExposureReductionPct}%
            </span>
            <span className="text-xs font-mono text-slate-500 ml-1.5">max cut</span>
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Calibrated to {telemetry.cityName} ({telemetry.aqiCategory})
          </div>
        </div>
      </div>

      {/* Baseline vs. With Plan Comparison Bars */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-semibold text-slate-700">
          Baseline vs. Protected Comparison
        </h3>
        <div className="space-y-4">
          {impactSummary.comparisonMetrics.map((metric) => {
            const maxVal = Math.max(metric.baselineValue, metric.withPlanValue, 1);
            const baselinePct = (metric.baselineValue / maxVal) * 100;
            const currentVal = Number(
              (
                metric.baselineValue -
                (metric.baselineValue - metric.withPlanValue) * exposureProgress
              ).toFixed(1)
            );
            const currentPct = (currentVal / maxVal) * 100;

            return (
              <div key={metric.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800">{metric.label}</span>
                  <span className="font-mono tabular-nums text-slate-600">
                    {metric.baselineValue} →{" "}
                    <strong className="text-slate-900">{currentVal}</strong> {metric.unit}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-100 rounded-xs overflow-hidden">
                    <div
                      className="h-full bg-slate-400 transition-transform duration-200 origin-left"
                      style={{ transform: `scaleX(${baselinePct / 100})` }}
                      title={`Baseline: ${metric.baselineValue} ${metric.unit}`}
                    />
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-xs overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-transform duration-200 origin-left"
                      style={{ transform: `scaleX(${currentPct / 100})` }}
                      title={`With active plan: ${currentVal} ${metric.unit}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-6 text-xs text-slate-500 pt-1">
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-2 bg-slate-400 inline-block rounded-xs" />
              Unmitigated Baseline
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-2 bg-blue-600 inline-block rounded-xs" />
              With Your Active Plan
            </span>
          </div>
        </div>
      </div>

      {/* Health & Environmental Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <HeartPulse className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
            <span>Direct Respiratory & Cardiovascular Impact</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {impactSummary.respiratoryHealthImpact}
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Leaf className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
            <span>Local Airshed & Environmental Impact</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {impactSummary.environmentalImpact}
          </p>
        </div>
      </div>
    </section>
  );
};
