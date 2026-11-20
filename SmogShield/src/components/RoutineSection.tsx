import React from "react";
import { Check } from "lucide-react";
import type { DailyRoutineType, RoutineBlock } from "../types";

interface RoutineSectionProps {
  routineType: DailyRoutineType;
  schedule: RoutineBlock[];
  adoptedIds: Record<string, boolean>;
  onToggleAdopt: (id: string) => void;
}

export const RoutineSection: React.FC<RoutineSectionProps> = ({
  routineType,
  schedule,
  adoptedIds,
  onToggleAdopt,
}) => {
  return (
    <section id="routine" className="bg-white border border-slate-200 rounded-lg p-6 space-y-5 scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            01. Low-Emission Daily Routine
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Time-blocked schedule tailored for {routineType} to cut personal emissions and avoid peak smog layers.
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
          {schedule.filter((item) => adoptedIds[item.id]).length} / {schedule.length} blocks active
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {schedule.map((block) => {
          const isAdopted = Boolean(adoptedIds[block.id]);
          return (
            <div
              key={block.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="sm:w-40 shrink-0">
                <div className="text-xs font-mono font-semibold tabular-nums text-slate-900">
                  {block.timeWindow}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{block.phase}</div>
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900">
                  {block.action}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {block.whyItHelps}
                </p>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-mono tabular-nums text-slate-500 pt-1">
                  <span>-{block.exposureReductionPct}% exposure</span>
                  <span aria-hidden="true">·</span>
                  <span>{block.emissionSavedKgCo2.toFixed(1)} kg CO₂ saved/day</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleAdopt(block.id)}
                aria-pressed={isAdopted}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors shrink-0 self-start cursor-pointer whitespace-nowrap ${
                  isAdopted
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Check className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isAdopted ? "Adopted" : "Adopt"}</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
