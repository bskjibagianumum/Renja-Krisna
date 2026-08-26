import { useMemo, useState, useCallback } from 'react';
import { ExcelRow, FilterConfig, FilterState, SummaryStats, TARGET_FILTER_CONFIGS, ColumnMapping } from '../types';
import { calculateApbnSummary } from '../utils/apbnAggregator';

export interface FilterOption {
  value: string;
  count: number;
  selected: boolean;
}

export function useFilterEngine(
  data: ExcelRow[],
  columnMapping: ColumnMapping,
  alokasiKey: string | null,
  targetKey: string | null
) {
  const [filterState, setFilterState] = useState<FilterState>({});

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilterState({});
  }, []);

  // Update a single filter's selected values
  const setFilterValues = useCallback((filterKey: string, values: string[]) => {
    setFilterState((prev) => {
      if (values.length === 0) {
        const next = { ...prev };
        delete next[filterKey];
        return next;
      }
      return {
        ...prev,
        [filterKey]: values,
      };
    });
  }, []);

  // Toggle a single value in a filter
  const toggleFilterValue = useCallback((filterKey: string, value: string) => {
    setFilterState((prev) => {
      const current = prev[filterKey] || [];
      const exists = current.includes(value);
      const nextValues = exists ? current.filter((v) => v !== value) : [...current, value];

      if (nextValues.length === 0) {
        const next = { ...prev };
        delete next[filterKey];
        return next;
      }
      return {
        ...prev,
        [filterKey]: nextValues,
      };
    });
  }, []);

  // Check if a row matches active filters, optionally ignoring one filter key (for cascading options)
  const isRowMatching = useCallback(
    (row: ExcelRow, activeFilters: FilterState, ignoreKey?: string) => {
      for (const [filterKey, selectedValues] of Object.entries(activeFilters)) {
        if (ignoreKey && filterKey === ignoreKey) continue;
        if (!selectedValues || selectedValues.length === 0) continue;

        const actualCol = columnMapping[filterKey];
        if (!actualCol) continue;

        const cellValue = String(row[actualCol] ?? '').trim();
        if (!selectedValues.includes(cellValue)) {
          return false;
        }
      }
      return true;
    },
    [columnMapping]
  );

  // Filtered dataset based on ALL active filters
  const filteredData = useMemo(() => {
    const activeKeys = Object.keys(filterState).filter((k) => (filterState[k] || []).length > 0);
    if (activeKeys.length === 0) {
      return data;
    }
    return data.filter((row) => isRowMatching(row, filterState));
  }, [data, filterState, isRowMatching]);

  // Compute available cascading options for each filter config
  // (evaluates against all filters except the current one)
  const filterOptionsMap = useMemo(() => {
    const map: Record<string, FilterOption[]> = {};

    TARGET_FILTER_CONFIGS.forEach((config) => {
      const actualCol = columnMapping[config.key];
      if (!actualCol) {
        map[config.key] = [];
        return;
      }

      // Dataset filtered by all active filters EXCEPT this one
      const relevantRows = data.filter((row) => isRowMatching(row, filterState, config.key));

      // Aggregate counts for each distinct value
      const countMap = new Map<string, number>();
      relevantRows.forEach((row) => {
        const val = String(row[actualCol] ?? '').trim();
        if (val) {
          countMap.set(val, (countMap.get(val) || 0) + 1);
        }
      });

      const selected = new Set<string>(filterState[config.key] || []);

      // Also ensure any currently selected value is listed (even if 0 matches currently, though cascading allows it)
      selected.forEach((selVal: string) => {
        if (!countMap.has(selVal)) {
          countMap.set(selVal, 0);
        }
      });

      // Sort alphabetically or numerically
      const options: FilterOption[] = Array.from(countMap.entries())
        .map(([value, count]) => ({
          value,
          count,
          selected: selected.has(value),
        }))
        .sort((a, b) => {
          // Put selected first or sort naturally
          return a.value.localeCompare(b.value, 'id-ID', { numeric: true, sensitivity: 'base' });
        });

      map[config.key] = options;
    });

    return map;
  }, [data, columnMapping, filterState, isRowMatching]);

  // Calculate Summary Statistics
  const summaryStats: SummaryStats = useMemo(() => {
    const totalRows = data.length;
    const filteredRows = filteredData.length;

    let totalAlokasi = 0;
    let totalTarget = 0;
    let maxAlokasi = 0;

    const numericAlokasiKey = alokasiKey ? `__numeric_${alokasiKey}` : null;
    const numericTargetKey = targetKey ? `__numeric_${targetKey}` : null;

    filteredData.forEach((row) => {
      const alokasiVal = numericAlokasiKey && row[numericAlokasiKey] !== undefined ? row[numericAlokasiKey] : (alokasiKey ? Number(row[alokasiKey]) || 0 : 0);
      const targetVal = numericTargetKey && row[numericTargetKey] !== undefined ? row[numericTargetKey] : (targetKey ? Number(row[targetKey]) || 0 : 0);

      totalAlokasi += alokasiVal;
      totalTarget += targetVal;
      if (alokasiVal > maxAlokasi) {
        maxAlokasi = alokasiVal;
      }
    });

    const avgAlokasi = filteredRows > 0 ? totalAlokasi / filteredRows : 0;
    const percentageFiltered = totalRows > 0 ? (filteredRows / totalRows) * 100 : 100;

    // Calculate full APBN breakdown (5 points + hierarchical matrix)
    const apbnMatrix = calculateApbnSummary(filteredData, columnMapping, alokasiKey);

    return {
      totalRows,
      filteredRows,
      totalAlokasi,
      totalTarget,
      avgAlokasi,
      maxAlokasi,
      percentageFiltered,
      apbnMatrix,
    };
  }, [data.length, filteredData, columnMapping, alokasiKey, targetKey]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    return Object.keys(filterState).reduce((acc: number, key: string) => {
      const vals = filterState[key];
      return acc + (vals && vals.length > 0 ? 1 : 0);
    }, 0);
  }, [filterState]);

  return {
    filterState,
    filteredData,
    filterOptionsMap,
    summaryStats,
    activeFiltersCount,
    setFilterValues,
    toggleFilterValue,
    resetFilters,
  };
}
