import React from "react";
import { ArrowRight, Check } from "lucide-react";
import type { SustainableAlternative } from "../types";

interface AlternativesSectionProps {
  cityName: string;
  alternatives: SustainableAlternative[];
  adoptedIds: Record<string, boolean>;
  onToggleAdopt: (id: string) => void;
}

export const AlternativesSection: React.FC<AlternativesSectionProps> = ({
  cityName,
  alternatives,
  adoptedIds,
  onToggleAdopt,
}) => {
  return (
    <section
      id="alternatives"
      className="bg-white border border-slate-200 rounded-lg p-6 space-y-5 scroll-mt-20"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            03. Sustainable Daily Alternatives
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            City-adapted low-emission swaps in {cityName} that curb ambient fine particulates and greenhouse gases.
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
          {alternatives.filter((a) => adoptedIds[a.id]).length} / {alternatives.length} swaps selected
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
              <th className="py-2.5 pr-4 font-semibold">Habit Transition</th>
              <th className="py-2.5 px-4 font-semibold">Local Context & PM Impact</th>
              <th className="py-2.5 px-4 font-semibold text-right whitespace-nowrap">
                Annual CO₂ Saved
              </th>
              <th className="py-2.5 pl-4 font-semibold text-right whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {alternatives.map((alt) => {
              const isAdopted = Boolean(adoptedIds[alt.id]);
              return (
                <tr key={alt.id} className="align-top hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 pr-4 min-w-[230px]">
                    <div className="text-xs text-slate-500 line-through decoration-slate-400">
                      {alt.currentHabit}
                    </div>
                    <div className="mt-1 flex items-start gap-1.5 font-semibold text-slate-900">
                      <ArrowRight
                        className="w-3.5 h-3.5 text-blue-600 mt-1 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{alt.lowEmissionAlternative}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 min-w-[240px] space-y-1">
                    <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                      {alt.citySpecificTip}
                    </p>
                    <div className="text-xs text-emerald-700 font-medium">
                      {alt.pmReductionImpact}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                    <div className="font-semibold text-slate-900">
                      {alt.annualCo2SavedKg.toLocaleString()} kg
                    </div>
                    <div className="text-xs text-slate-500">
                      {alt.weeklyCo2SavedKg.toFixed(1)} kg/wk
                    </div>
                  </td>
                  <td className="py-4 pl-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleAdopt(alt.id)}
                      aria-pressed={isAdopted}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                        isAdopted
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{isAdopted ? "Committed" : "Commit"}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
