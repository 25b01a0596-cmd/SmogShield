import React, { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  GraduationCap,
  HardHat,
  Laptop,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import type {
  CityCandidate,
  DailyRoutineType,
  VulnerabilityFlags,
} from "../types";

interface ParameterSidebarProps {
  cityInput: string;
  onCityInputChange: (val: string) => void;
  selectedCandidate: CityCandidate | null;
  onSelectCandidate: (candidate: CityCandidate | null) => void;
  routine: DailyRoutineType;
  onRoutineChange: (routine: DailyRoutineType) => void;
  vulnerabilities: VulnerabilityFlags;
  onToggleVulnerability: (key: keyof VulnerabilityFlags) => void;
  onSubmit: (overrideCity?: string, overrideCandidate?: CityCandidate | null) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  adoptionStats: {
    hasPlan: boolean;
    adoptedCount: number;
    totalCount: number;
    currentExposureReductionPct: number;
    currentWeeklyCo2Kg: number;
  };
}

const ROUTINES: Array<{
  value: DailyRoutineType;
  label: string;
  hint: string;
  Icon: React.FC<{ className?: string }>;
}> = [
  {
    value: "Work from Home",
    label: "Work from Home",
    hint: "Indoor filtration & timed ventilation",
    Icon: Laptop,
  },
  {
    value: "Office Commuter",
    label: "Office Commuter",
    hint: "Transit timing & corridor protection",
    Icon: Briefcase,
  },
  {
    value: "Student",
    label: "Student",
    hint: "Campus transit & outdoor sports windows",
    Icon: GraduationCap,
  },
  {
    value: "Outdoor Worker",
    label: "Outdoor Worker",
    hint: "Respirator protocol & exertion pacing",
    Icon: HardHat,
  },
];

const QUICK_CITIES = [
  "New Delhi",
  "Lahore",
  "Beijing",
  "Los Angeles",
  "London",
  "Mexico City",
];

export const ParameterSidebar: React.FC<ParameterSidebarProps> = ({
  cityInput,
  onCityInputChange,
  selectedCandidate,
  onSelectCandidate,
  routine,
  onRoutineChange,
  vulnerabilities,
  onToggleVulnerability,
  onSubmit,
  isLoading,
  inputRef,
  adoptionStats,
}) => {
  const [suggestions, setSuggestions] = useState<CityCandidate[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const query = cityInput.trim();
    if (query.length < 2 || (selectedCandidate && query === selectedCandidate.name)) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCities(true);
      try {
        const res = await fetch(`/api/cities/suggest?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = (await res.json()) as { results?: CityCandidate[] };
          setSuggestions(data.results ?? []);
          setShowDropdown((data.results ?? []).length > 0);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearchingCities(false);
      }
    }, 240);

    return () => clearTimeout(timer);
  }, [cityInput, selectedCandidate]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    onSubmit();
  };

  return (
    <aside className="w-full lg:w-[360px] shrink-0">
      <div className="bg-white border border-slate-200 rounded-lg p-5 lg:sticky lg:top-22 space-y-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            Assessment Parameters
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Configure your city, daily schedule, and household sensitivities to
            calibrate live telemetry and protection steps.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* City Input */}
          <div ref={dropdownContainerRef} className="relative space-y-2">
            <label
              htmlFor="city-input"
              className="block text-xs font-semibold text-slate-700"
            >
              City or Metropolitan Area
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                id="city-input"
                type="text"
                value={cityInput}
                onChange={(e) => {
                  onSelectCandidate(null);
                  onCityInputChange(e.target.value);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                placeholder="e.g. New Delhi, Los Angeles, London"
                autoComplete="off"
                className="w-full pl-9 pr-9 py-2.5 text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
              />
              {isSearchingCities && (
                <Loader2
                  className="w-4 h-4 text-slate-400 animate-spin absolute right-3 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
              )}
            </div>

            {selectedCandidate && (
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  Locked: {selectedCandidate.name}
                  {selectedCandidate.admin1 ? `, ${selectedCandidate.admin1}` : ""},{" "}
                  {selectedCandidate.country}
                </span>
              </p>
            )}

            {/* Autocomplete dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <ul
                role="listbox"
                aria-label="City matches"
                className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100"
              >
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCandidate(item);
                        onCityInputChange(item.name);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="font-medium text-slate-900 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-500 truncate shrink-0">
                        {[item.admin1, item.country].filter(Boolean).join(", ")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Quick select inline text links */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1 text-xs text-slate-500">
              <span>Quick select:</span>
              {QUICK_CITIES.map((city, idx) => (
                <React.Fragment key={city}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCandidate(null);
                      onCityInputChange(city);
                      setShowDropdown(false);
                    }}
                    className="text-slate-700 hover:text-blue-600 hover:underline underline-offset-2 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {city}
                  </button>
                  {idx < QUICK_CITIES.length - 1 && (
                    <span aria-hidden="true" className="text-slate-300">
                      ·
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Daily Routine Selector */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-slate-700">
              Primary Daily Routine
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {ROUTINES.map(({ value, label, hint, Icon }) => {
                const active = routine === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onRoutineChange(value)}
                    aria-pressed={active}
                    className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors flex items-start gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                      active
                        ? "bg-blue-50/80 border-blue-600 text-slate-900"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        active ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium leading-tight whitespace-nowrap truncate">
                        {label}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-snug">
                        {hint}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Household Vulnerabilities */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-slate-700">
              Household Health Sensitivities
            </span>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={vulnerabilities.children}
                  onChange={() => onToggleVulnerability("children")}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm leading-tight">
                  <span className="block font-medium text-slate-900">
                    Children at home
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    Higher breathing rate per body weight; stricter play-hour caps
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={vulnerabilities.elderly}
                  onChange={() => onToggleVulnerability("elderly")}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm leading-tight">
                  <span className="block font-medium text-slate-900">
                    Elderly (65+) at home
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    Cardiovascular PM2.5 sensitivity & bedroom air-cleaning focus
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 p-2.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={vulnerabilities.asthma}
                  onChange={() => onToggleVulnerability("asthma")}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                <span className="text-sm leading-tight">
                  <span className="block font-medium text-slate-900">
                    Asthma / respiratory condition
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">
                    Triggers NO₂/O₃ bronchodilator & tight-seal N95 thresholds
                  </span>
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || cityInput.trim().length < 2}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Analyzing Air Quality...</span>
              </>
            ) : (
              <span>Generate Survival Plan</span>
            )}
          </button>
        </form>

        {/* Live Adoption Tracker */}
        {adoptionStats.hasPlan && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Active Plan Adoption
              </span>
              <span className="font-mono tabular-nums text-slate-600">
                {adoptionStats.adoptedCount} / {adoptionStats.totalCount} active
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-transform duration-200 origin-left"
                style={{
                  transform: `scaleX(${
                    adoptionStats.totalCount > 0
                      ? adoptionStats.adoptedCount / adoptionStats.totalCount
                      : 0
                  })`,
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="text-[11px] text-slate-500">
                  Exposure Reduction
                </div>
                <div className="text-lg font-mono font-semibold tabular-nums text-slate-900">
                  -{adoptionStats.currentExposureReductionPct}%
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">
                  Weekly CO₂ Avoided
                </div>
                <div className="text-lg font-mono font-semibold tabular-nums text-emerald-700">
                  {adoptionStats.currentWeeklyCo2Kg.toFixed(1)} kg
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
