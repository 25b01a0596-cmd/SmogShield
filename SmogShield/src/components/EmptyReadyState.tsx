import React from "react";
import { ArrowUpRight, Wind } from "lucide-react";
import type { DailyRoutineType, VulnerabilityFlags } from "../types";

interface EmptyReadyStateProps {
  onRunPreset: (
    city: string,
    routine: DailyRoutineType,
    vulnerabilities: VulnerabilityFlags
  ) => void;
}

const SAMPLE_SCENARIOS: Array<{
  city: string;
  context: string;
  routine: DailyRoutineType;
  vulnerabilities: VulnerabilityFlags;
  householdSummary: string;
}> = [
  {
    city: "New Delhi",
    context: "High particulate winter inversion corridor",
    routine: "Office Commuter",
    vulnerabilities: { children: true, elderly: false, asthma: true },
    householdSummary: "Children & asthma at home",
  },
  {
    city: "Los Angeles",
    context: "Basin ozone & highway NO₂ traffic belt",
    routine: "Outdoor Worker",
    vulnerabilities: { children: false, elderly: false, asthma: false },
    householdSummary: "Standard adult baseline",
  },
  {
    city: "London",
    context: "Urban roadside particulates & damp seasonal air",
    routine: "Work from Home",
    vulnerabilities: { children: false, elderly: true, asthma: false },
    householdSummary: "Elderly (65+) at home",
  },
];

const DELIVERABLES = [
  {
    index: "01.",
    title: "Low-Emission Daily Routine",
    detail:
      "Chronological schedule aligning errands, transit, and exertion with hourly air quality dips while reducing personal vehicle emissions.",
  },
  {
    index: "02.",
    title: "Indoor Air Quality Hacks",
    detail:
      "Targeted filtration, source-control, sealing, and cross-ventilation protocols tailored to children, elderly adults, or asthma care.",
  },
  {
    index: "03.",
    title: "Sustainable Alternatives",
    detail:
      "Practical city-relevant swaps across commuting, cooking, and home energy that lower both local particulate exposure and CO₂ output.",
  },
  {
    index: "04.",
    title: "Health & Environmental Impact",
    detail:
      "Quantified baseline vs. protected daily PM2.5 inhalation estimates alongside weekly and annual avoided emissions.",
  },
];

export const EmptyReadyState: React.FC<EmptyReadyStateProps> = ({
  onRunPreset,
}) => {
  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Wind className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
            <span>Live Atmospheric Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Personalized Exposure Mitigation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
            Calibrate your daily routine to your city&apos;s air quality.
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
            Enter any city in the parameter panel to retrieve live PM2.5, PM10,
            NO₂, ozone, and 24-hour forecast curves, then generate a structured
            survival and low-emission action plan for your household.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <h2 className="text-xs font-semibold text-slate-700 mb-3">
            Run an Instant Sample Scenario
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_SCENARIOS.map((scenario) => (
              <button
                key={scenario.city}
                type="button"
                onClick={() =>
                  onRunPreset(
                    scenario.city,
                    scenario.routine,
                    scenario.vulnerabilities
                  )
                }
                className="group text-left p-4 bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-600 rounded-md transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {scenario.city}
                  </span>
                  <ArrowUpRight
                    className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-snug">
                  {scenario.context}
                </p>
                <div className="mt-3 text-xs text-slate-500">
                  <span>{scenario.routine}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{scenario.householdSummary}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DELIVERABLES.map((item) => (
          <div
            key={item.index}
            className="bg-white border border-slate-200 rounded-lg p-5 space-y-2"
          >
            <div className="text-sm font-semibold text-slate-900">
              <span className="font-mono text-blue-600 mr-2">{item.index}</span>
              {item.title}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {item.detail}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};
