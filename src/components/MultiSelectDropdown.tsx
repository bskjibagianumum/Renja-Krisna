import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronDown, 
  Search, 
  X, 
  Check, 
  CheckSquare, 
  Square,
  Filter
} from 'lucide-react';
import { FilterOption } from '../hooks/useFilterEngine';

interface MultiSelectDropdownProps {
  id: string;
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  onToggleValue: (value: string) => void;
  disabled?: boolean;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  id,
  label,
  options,
  selectedValues,
  onChange,
  onToggleValue,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alignRight, setAlignRight] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Compute smart positioning (align right if near right edge, open upward if near bottom edge)
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // Check if dropdown would overflow the right edge (using ~290px popover width)
      if (rect.left + 290 > windowWidth - 16) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }

      // Check if dropdown would overflow the bottom edge (~280px height) and there is enough room above
      if (rect.bottom + 280 > windowHeight && rect.top > 290) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }

      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Filter options by search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase().trim();
    return options.filter((opt) => opt.value.toLowerCase().includes(term));
  }, [options, searchTerm]);

  // Quick Select All visible options
  const handleSelectAllVisible = () => {
    const visibleValues = filteredOptions.map((opt) => opt.value);
    const combined = Array.from(new Set([...selectedValues, ...visibleValues]));
    onChange(combined);
  };

  // Clear all selections for this filter
  const handleClearAll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange([]);
  };

  const selectedCount = selectedValues.length;
  const isAllSelected = filteredOptions.length > 0 && filteredOptions.every((opt) => selectedValues.includes(opt.value));

  return (
    <div className={`relative w-full text-left transition-all ${isOpen ? 'z-50' : 'z-10'}`} ref={dropdownRef} id={`container-${id}`}>
      {/* Label above dropdown */}
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 truncate" title={label}>
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled || options.length === 0}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl border transition-all duration-150 cursor-pointer ${
          disabled || options.length === 0
            ? 'bg-slate-100/70 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-60'
            : selectedCount > 0
            ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-500/80 dark:border-emerald-600/80 text-emerald-950 dark:text-emerald-100 shadow-xs ring-1 ring-emerald-500/30 font-semibold'
            : 'bg-white dark:bg-slate-800/90 border-slate-300 dark:border-slate-700/90 text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-800 shadow-2xs'
        }`}
      >
        <div className="flex items-center space-x-1.5 truncate pr-1">
          <Filter className={`w-3.5 h-3.5 shrink-0 ${selectedCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
          <span className="truncate font-medium">
            {selectedCount === 0 ? (
              <span className="text-slate-400 dark:text-slate-500 font-normal">
                {options.length === 0 ? 'Tidak tersedia' : `Semua (${options.length})`}
              </span>
            ) : selectedCount === 1 ? (
              <span className="font-semibold">{selectedValues[0]}</span>
            ) : (
              <span className="font-semibold">{selectedCount} terpilih</span>
            )}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0 ml-1">
          {selectedCount > 0 ? (
            <span className="inline-flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
              {selectedCount}
            </span>
          ) : null}
          {selectedCount > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClearAll}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  handleClearAll();
                }
              }}
              className="p-0.5 rounded-full hover:bg-emerald-200/80 dark:hover:bg-emerald-800/80 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer inline-flex items-center justify-center"
              title="Hapus filter ini"
              aria-label="Hapus filter ini"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''}`} />
        </div>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div 
          id={`dropdown-menu-${id}`}
          className={`absolute z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/50 border border-slate-200 dark:border-slate-700/80 py-2.5 w-72 sm:w-80 max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md ${
            openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${
            alignRight ? 'right-0' : 'left-0'
          }`}
        >
          {/* Search Box */}
          <div className="px-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                id={`search-input-${id}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Cari ${label.toLowerCase()}...`}
                className="w-full pl-8.5 pr-7 py-1.5 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-transparent focus:border-emerald-500/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions (Select All / Clear All) */}
          <div className="flex items-center justify-between px-3.5 py-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              id={`btn-select-all-${id}`}
              onClick={handleSelectAllVisible}
              className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center cursor-pointer transition-colors"
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              Pilih Semua ({filteredOptions.length})
            </button>
            {selectedCount > 0 && (
              <button
                type="button"
                id={`btn-clear-all-${id}`}
                onClick={() => onChange([])}
                className="font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 cursor-pointer transition-colors"
              >
                Kosongkan ({selectedCount})
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto px-1.5 py-1 space-y-0.5 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                {searchTerm ? 'Tidak ada hasil yang sesuai' : 'Tidak ada data'}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    id={`opt-${id}-${opt.value.replace(/[^a-zA-Z0-9]/g, '_')}`}
                    onClick={() => onToggleValue(opt.value)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 font-semibold'
                        : opt.count === 0
                        ? 'text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate pr-2">
                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" />
                        )}
                      </div>
                      <span className="truncate" title={opt.value}>
                        {opt.value}
                      </span>
                    </div>

                    <span
                      className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isSelected
                          ? 'bg-emerald-200/80 dark:bg-emerald-800/80 text-emerald-900 dark:text-emerald-100 font-bold'
                          : opt.count === 0
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {opt.count}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer showing total available */}
          <div className="px-3.5 pt-2 pb-0.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 flex justify-between font-medium">
            <span>Total {options.length} pilihan</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedCount} terpilih</span>
          </div>
        </div>
      )}
    </div>
  );
};
