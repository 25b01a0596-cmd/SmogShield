import React, { useState } from "react";
import { Check } from "lucide-react";
import type { IndoorHack } from "../types";

interface IndoorHacksSectionProps {
  hacks: IndoorHack[];
  adoptedIds: Record<string, boolean>;
  onToggleAdopt: (id: string) => void;
}

type CategoryFilter =
  | "All"
  | "Filtration"
  | "Ventilation"
  | "Source Control"
  | "Humidity & Surfaces";

const CATEGORIES: CategoryFilter[] = [
  "All",
  "Filtration",
  "Ventilation",
  "Source Control",
  "Humidity & Surfaces",
];

export const IndoorHacksSection: React.FC<IndoorHacksSectionProps> = ({
  hacks,
  adoptedIds,
  onToggleAdopt,
}) => {
  const [filter, setFilter] = useState<CategoryFilter>("All");

  const filtered =
    filter === "All" ? hacks : hacks.filter((h) => h.category === filter);

  return (
    <section
      id="indoor-air"
      className="bg-white border border-slate-200 rounded-lg p-6 space-y-5 scroll-mt-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            02. Indoor Air Quality Protocols
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Practical indoor filtration, sealing, and source-control measures calibrated for your household.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-md self-start">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                filter === cat
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          No protocols under {filter}. Select &ldquo;All&rdquo; to view all indoor air actions.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((hack) => {
            const isAdopted = Boolean(adoptedIds[hack.id]);
            return (
              <article
                key={hack.id}
                className={`p-4 rounded-md border transition-colors flex flex-col justify-between gap-4 ${
                  isAdopted
                    ? "bg-blue-50/40 border-blue-300"
                    : "bg-slate-50/60 border-slate-200"
                }`}
              >
                <div className="space-y-2">
                  {/* Unboxed quiet metadata line */}
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="truncate">
                      <span className="font-medium text-slate-700">
                        {hack.category}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span
                        className={
                          hack.priority === "Essential"
                            ? "font-semibold text-blue-700"
                            : ""
                        }
                      >
                        {hack.priority}
                      </span>
                      <span aria-hidden="true"> · </span>
                      <span>{hack.costTier}</span>
                    </div>
                    <span className="font-mono tabular-nums text-slate-600 shrink-0">
                      -{hack.exposureReductionPct}% indoor PM
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900">
                    {hack.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    {hack.steps}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 leading-snug">
                    {hack.effectivenessNote}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleAdopt(hack.id)}
                    aria-pressed={isAdopted}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors shrink-0 cursor-pointer whitespace-nowrap ${
                      isAdopted
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{isAdopted ? "Applied" : "Apply"}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
