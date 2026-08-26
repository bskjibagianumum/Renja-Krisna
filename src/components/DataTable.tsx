import React, { useState, useMemo } from 'react';
import { 
  Table, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Download, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Columns,
  Eye
} from 'lucide-react';
import { ExcelRow } from '../types';
import { formatRupiah, formatNumber } from '../utils/formatters';
import { exportToExcel, exportToCSV, copyToClipboard } from '../utils/excelParser';

interface DataTableProps {
  data: ExcelRow[];
  headers: string[];
  alokasiColName: string | null;
  targetColName: string | null;
  fileName?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export const DataTable: React.FC<DataTableProps> = ({
  data,
  headers,
  alokasiColName,
  targetColName,
  fileName = 'data_komponen'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  // Filter by search term
  const searchedData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase().trim();

    return data.filter((row) => {
      return headers.some((h) => {
        const val = row[h];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, headers]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return searchedData;

    const isAlokasi = sortColumn === alokasiColName;
    const isTarget = sortColumn === targetColName;
    const numericKey = isAlokasi ? `__numeric_${alokasiColName}` : isTarget ? `__numeric_${targetColName}` : null;

    return [...searchedData].sort((a, b) => {
      let valA = numericKey && a[numericKey] !== undefined ? a[numericKey] : a[sortColumn];
      let valB = numericKey && b[numericKey] !== undefined ? b[numericKey] : b[sortColumn];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA);
      const strB = String(valB);
      return sortDirection === 'asc'
        ? strA.localeCompare(strB, 'id-ID', { numeric: true, sensitivity: 'base' })
        : strB.localeCompare(strA, 'id-ID', { numeric: true, sensitivity: 'base' });
    });
  }, [searchedData, sortColumn, sortDirection, alokasiColName, targetColName]);

  // Handle Sort Header Click
  const handleSort = (col: string) => {
    if (sortColumn === col) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalRows = sortedData.length;
  const isAll = pageSize === -1;
  const totalPages = isAll ? 1 : Math.ceil(totalRows / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const paginatedData = useMemo(() => {
    if (isAll) return sortedData;
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safeCurrentPage, pageSize, isAll]);

  // Export handlers
  const handleExportExcel = () => {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    exportToExcel(
      sortedData, 
      `${baseName}_filtered_${new Date().toISOString().slice(0, 10)}.xlsx`,
      alokasiColName,
      targetColName
    );
  };

  const handleExportCSV = () => {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    exportToCSV(
      sortedData, 
      `${baseName}_filtered_${new Date().toISOString().slice(0, 10)}.csv`,
      alokasiColName,
      targetColName
    );
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(sortedData, alokasiColName, targetColName);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section id="table-section" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      
      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Title & Stats */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tabel Data Komponen
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                {totalRows.toLocaleString('id-ID')} Baris
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan seluruh kolom Excel dengan fitur sorting, pencarian, dan ekspor
            </p>
          </div>
        </div>

        {/* Action Controls: Search & Exports */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-2">
          
          {/* Search Table */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="input-table-search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari di tabel..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Export to Excel */}
          <button
            type="button"
            id="btn-export-excel"
            onClick={handleExportExcel}
            className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-colors shadow-2xs cursor-pointer"
            title="Ekspor data terfilter ke file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
            <span>Excel</span>
          </button>

          {/* Download CSV */}
          <button
            type="button"
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Download file CSV"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>CSV</span>
          </button>

          {/* Copy TSV */}
          <button
            type="button"
            id="btn-copy-data"
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer"
            title="Salin data ke clipboard (format TSV/Spreadsheet)"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                <span>Salin</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto custom-scrollbar max-h-[600px] relative border-b border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead className="bg-slate-50 dark:bg-slate-800/90 sticky top-0 z-10 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 shadow-xs">
            <tr>
              <th className="py-3 px-3 font-bold text-center w-12 text-slate-400 bg-slate-50 dark:bg-slate-800">
                #
              </th>
              {headers.map((header) => {
                const isAlokasi = header === alokasiColName;
                const isTarget = header === targetColName;
                const isCurrentSort = sortColumn === header;

                return (
                  <th
                    key={header}
                    id={`th-${header.replace(/[^a-zA-Z0-9]/g, '_')}`}
                    onClick={() => handleSort(header)}
                    className={`py-3 px-3.5 font-bold cursor-pointer select-none transition-colors whitespace-nowrap ${
                      isAlokasi
                        ? 'bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-950'
                        : isTarget
                        ? 'bg-blue-100/60 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-950'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <span>{header}</span>
                      <span className="shrink-0 text-slate-400">
                        {isCurrentSort ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 font-bold" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Search className="w-8 h-8 opacity-30" />
                    <p className="text-sm font-medium">Tidak ada data yang sesuai dengan filter atau pencarian</p>
                    <p className="text-xs">Coba reset filter atau ubah kata kunci pencarian</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => {
                const globalRowIndex = isAll ? rowIdx + 1 : (safeCurrentPage - 1) * pageSize + rowIdx + 1;
                return (
                  <tr
                    key={row.__rowId || rowIdx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Row Index */}
                    <td className="py-2.5 px-3 text-center text-[11px] text-slate-400 font-mono">
                      {globalRowIndex}
                    </td>

                    {/* Columns */}
                    {headers.map((header) => {
                      const isAlokasi = header === alokasiColName;
                      const isTarget = header === targetColName;
                      const cellValue = row[header];

                      if (isAlokasi) {
                        const numericVal = row[`__numeric_${header}`] ?? Number(cellValue) ?? 0;
                        return (
                          <td
                            key={header}
                            className="py-2.5 px-3.5 font-semibold text-emerald-700 dark:text-emerald-300 font-mono whitespace-nowrap bg-emerald-50/30 dark:bg-emerald-950/20"
                          >
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100/80 dark:bg-emerald-900/60">
                              {formatRupiah(numericVal)}
                            </span>
                          </td>
                        );
                      }

                      if (isTarget) {
                        const numericVal = row[`__numeric_${header}`] ?? Number(cellValue) ?? 0;
                        return (
                          <td
                            key={header}
                            className="py-2.5 px-3.5 font-semibold text-blue-700 dark:text-blue-300 font-mono whitespace-nowrap bg-blue-50/30 dark:bg-blue-950/20"
                          >
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100/80 dark:bg-blue-900/60">
                              {formatNumber(numericVal)}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td key={header} className="py-2.5 px-3.5 whitespace-nowrap max-w-xs truncate" title={String(cellValue ?? '')}>
                          {cellValue === null || cellValue === undefined || cellValue === '' ? (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          ) : (
                            String(cellValue)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination & Size Controls */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        
        {/* Info Rows */}
        <div className="flex items-center space-x-2">
          <span>Menampilkan</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {totalRows === 0 ? '0' : isAll ? `1 - ${totalRows}` : `${(safeCurrentPage - 1) * pageSize + 1} - ${Math.min(safeCurrentPage * pageSize, totalRows)}`}
          </span>
          <span>dari</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {totalRows.toLocaleString('id-ID')}
          </span>
          <span>data baris</span>
        </div>

        {/* Page Size & Navigation */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Page Size Selector */}
          <div className="flex items-center space-x-1.5">
            <span>Baris per halaman:</span>
            <select
              id="select-page-size"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-200 font-medium focus:ring-1.5 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={-1}>Semua ({totalRows})</option>
            </select>
          </div>

          {/* Page Buttons */}
          {!isAll && totalPages > 1 && (
            <div className="flex items-center space-x-1">
              <button
                type="button"
                id="btn-page-first"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Halaman Pertama"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                id="btn-page-prev"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={safeCurrentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-2 py-1 font-semibold text-slate-800 dark:text-slate-200">
                {safeCurrentPage} / {totalPages}
              </span>

              <button
                type="button"
                id="btn-page-next"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                id="btn-page-last"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Halaman Terakhir"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>

    </section>
  );
};
