/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { YekSalai } from "../types";
import { yumnakRepository } from "../data/repository";
import { Search, ChevronDown, Check, AlertCircle, Info } from "lucide-react";

interface YumnakSelectProps {
  label: string;
  helperText?: string;
  value: { surname: string; yek: string };
  onChange: (value: { surname: string; yek: string }) => void;
  required?: boolean;
}

const ALL_YEK_SALAIS: YekSalai[] = [
  "Mangang",
  "Luwang",
  "Khuman",
  "Angom",
  "Moirang",
  "Kha-Nganba",
  "Chenglei"
];

export const YumnakSelect: React.FC<YumnakSelectProps> = ({
  label,
  helperText,
  value,
  onChange,
  required = true
}) => {
  const [searchTerm, setSearchTerm] = useState(value.surname || "");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [resolvedYeks, setResolvedYeks] = useState<YekSalai[]>([]);
  const [isCustomSurname, setIsCustomSurname] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const allSurnames = yumnakRepository.getAllSurnames();

  // Handle external value changes (e.g. from state resets or going back/forth)
  useEffect(() => {
    if (value.surname !== searchTerm) {
      setSearchTerm(value.surname);
      const matches = yumnakRepository.getYeksForSurname(value.surname);
      setResolvedYeks(matches);
      setIsCustomSurname(value.surname !== "" && matches.length === 0);
    }
  }, [value.surname]);

  // Handle outside clicks to close the dropdown list
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter autocomplete suggestions based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions(allSurnames.slice(0, 8)); // Top 8 by default
      setResolvedYeks([]);
      setIsCustomSurname(false);
      return;
    }

    const filtered = allSurnames.filter((s) =>
      s.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
    );
    setSuggestions(filtered);

    const matches = yumnakRepository.getYeksForSurname(searchTerm);
    setResolvedYeks(matches);
    
    // If user typed something not matching any known surname
    if (searchTerm.trim().length > 1 && filtered.length === 0 && matches.length === 0) {
      setIsCustomSurname(true);
    } else {
      setIsCustomSurname(matches.length === 0 && searchTerm.trim() !== "");
    }
  }, [searchTerm]);

  const handleSelectSurname = (surnameName: string) => {
    setSearchTerm(surnameName);
    setIsOpen(false);
    
    const yeks = yumnakRepository.getYeksForSurname(surnameName);
    setResolvedYeks(yeks);
    setIsCustomSurname(false);

    if (yeks.length === 1) {
      // Single matches: auto-select the Yek for optimal speed
      onChange({ surname: surnameName, yek: yeks[0] });
    } else if (yeks.length > 1) {
      // Multi-Yek: ask the user to select. Temporarily wipe selected Yek until confirmed.
      onChange({ surname: surnameName, yek: "" });
    } else {
      onChange({ surname: surnameName, yek: "" });
    }
  };

  const handleSelectYek = (yek: YekSalai) => {
    onChange({ surname: searchTerm, yek });
  };

  const handleCustomSurnameBlur = () => {
    if (isCustomSurname && searchTerm.trim() !== "" && value.surname !== searchTerm) {
      onChange({ surname: searchTerm, yek: value.yek });
    }
  };

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Label and Helper Info */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {helperText && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {helperText}
          </p>
        )}
      </div>

      {/* Autocomplete Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={16} />
        </div>
        <input
          id={`search-input-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
          type="text"
          placeholder="Type or select a Meitei yumnak (e.g. Laishram, Thangjam...)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            onChange({ surname: e.target.value, yek: "" }); // Reset yek until resolved
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={handleCustomSurnameBlur}
          className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <ChevronDown size={16} />
        </button>

        {/* Suggestion Dropdown Panel */}
        {isOpen && suggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-1.5 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {suggestions.map((sug) => {
              const yeks = yumnakRepository.getYeksForSurname(sug);
              return (
                <li key={sug}>
                  <button
                    type="button"
                    onClick={() => handleSelectSurname(sug)}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center transition-colors text-slate-700 dark:text-slate-200"
                  >
                    <span className="font-medium">{sug}</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                      {yeks.join(", ")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Yek Resolution Display / Selection Block */}
      {searchTerm.trim() !== "" && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-lg space-y-3">
          {/* Case A: Single-Yek Auto resolved */}
          {resolvedYeks.length === 1 && (
            <div className="flex items-start gap-2.5 text-sm text-emerald-600 dark:text-emerald-400">
              <Check size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Clan Resolved Automatically</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                  Surname <strong>{searchTerm}</strong> is associated with the <strong>{resolvedYeks[0]}</strong> Salai in the traditional records.
                </p>
              </div>
            </div>
          )}

          {/* Case B: Multi-Yek Ambiguity - Selection required */}
          {resolvedYeks.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 text-sm text-amber-600 dark:text-amber-400">
                <Info size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Multiple Clan Associations Found</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    <strong>{searchTerm}</strong> can belong to multiple Yek Salais under different Sageis (lineages). Please select the correct clan:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-3">
                {resolvedYeks.map((yek) => {
                  const isSelected = value.yek === yek;
                  return (
                    <button
                      key={yek}
                      type="button"
                      onClick={() => handleSelectYek(yek)}
                      className={`px-3 py-2 text-xs font-semibold rounded-md border text-center transition-all ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-300"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {yek}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Case C: Unknown / Custom Surname - Fallback selection of all 7 Salais */}
          {isCustomSurname && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-sm text-indigo-600 dark:text-indigo-400">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Manual Clan Specification Required</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    <strong>&ldquo;{searchTerm}&rdquo;</strong> was not found in our pre-mapped database. Please specify the Yek Salai manually to proceed:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {ALL_YEK_SALAIS.map((yek) => {
                  const isSelected = value.yek === yek;
                  return (
                    <button
                      key={yek}
                      type="button"
                      onClick={() => handleSelectYek(yek)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-md border text-center transition-all ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-300"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {yek}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
