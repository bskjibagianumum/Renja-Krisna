import React, { useState } from 'react';
import { 
  Filter, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  X, 
  SlidersHorizontal,
  Layers,
  Sparkles
} from 'lucide-react';
import { MultiSelectDropdown } from './MultiSelectDropdown';
import { FilterConfig, FilterState, TARGET_FILTER_CONFIGS, ColumnMapping } from '../types';
import { FilterOption } from '../hooks/useFilterEngine';

interface FilterPanelProps {
  columnMapping: ColumnMapping;
  filterState: FilterState;
  filterOptionsMap: Record<string, FilterOption[]>;
  activeFiltersCount: number;
  onSetFilterValues: (filterKey: string, values: string[]) => void;
  onToggleFilterValue: (filterKey: string, value: string) => void;
  onResetFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  columnMapping,
  filterState,
  filterOptionsMap,
  activeFiltersCount,
  onSetFilterValues,
  onToggleFilterValue,
  onResetFilters,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Collect all active filter tags for the chip display
  const activeTags: { key: string; label: string; value: string }[] = [];
  TARGET_FILTER_CONFIGS.forEach((cfg) => {
    const selected = filterState[cfg.key] || [];
    selected.forEach((val) => {
      activeTags.push({
        key: cfg.key,
        label: cfg.label,
        value: val,
      });
    });
  });

  return (
    <section id="filter-section" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-all relative z-30">
      
      {/* Filter Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl">
        
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Filter Data (Multi-Select & Cascading)
              </h2>
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  {activeFiltersCount} Filter Aktif ({activeTags.length} Nilai)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilihan filter saling terhubung dinamis. Anda dapat memilih lebih dari satu nilai per filter.
            </p>
          </div>
        </div>

        {/* Action Buttons: Reset Filter & Collapse */}
        <div className="flex items-center space-x-2">
          
          <button
            type="button"
            id="btn-reset-filter"
            onClick={onResetFilters}
            disabled={activeFiltersCount === 0}
            className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              activeFiltersCount > 0
                ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 cursor-pointer active:scale-98'
                : 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60'
            }`}
            title="Reset semua filter ke kondisi awal"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>Reset Filter</span>
          </button>

          <button
            type="button"
            id="btn-toggle-collapse-filter"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Tampilkan Filter' : 'Sembunyikan Filter'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

        </div>

      </div>

      {/* Filter Body (12 Filters Grid) */}
      {!isCollapsed && (
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {TARGET_FILTER_CONFIGS.map((cfg) => {
              const options = filterOptionsMap[cfg.key] || [];
              const selectedValues = filterState[cfg.key] || [];
              const isColAvailable = Boolean(columnMapping[cfg.key]);

              return (
                <div key={cfg.key} className="w-full">
                  <MultiSelectDropdown
                    id={`filter-${cfg.key}`}
                    label={cfg.label}
                    options={options}
                    selectedValues={selectedValues}
                    onChange={(values) => onSetFilterValues(cfg.key, values)}
                    onToggleValue={(value) => onToggleFilterValue(cfg.key, value)}
                    disabled={!isColAvailable}
                  />
                  {!isColAvailable && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 italic block mt-0.5">
                      (Kolom tidak ditemukan di sheet)
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Tags Chips */}
          {activeTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center">
                  <Tag className="w-3 h-3 mr-1.5 text-emerald-500" />
                  Filter Aktif:
                </span>
                <button
                  type="button"
                  onClick={onResetFilters}
                  className="text-xs text-rose-500 hover:text-rose-700 hover:underline font-medium"
                >
                  Hapus Semua ({activeTags.length})
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                {activeTags.map((tag) => (
                  <span
                    key={`${tag.key}-${tag.value}`}
                    className="inline-flex items-center px-2 py-1 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 group"
                  >
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400 mr-1">
                      {tag.label}:
                    </span>
                    <span className="truncate max-w-[150px] font-medium" title={tag.value}>
                      {tag.value}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleFilterValue(tag.key, tag.value)}
                      className="ml-1.5 p-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-600 dark:text-emerald-300 transition-colors"
                      title="Hapus nilai ini"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </section>
  );
};
