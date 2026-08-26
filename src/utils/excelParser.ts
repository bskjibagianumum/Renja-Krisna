import * as XLSX from 'xlsx';
import { ExcelRow, FileMetadata, TARGET_FILTER_CONFIGS, ColumnMapping } from '../types';
import { parseNumericValue } from './formatters';

export interface ParseResult {
  data: ExcelRow[];
  headers: string[];
  columnMapping: ColumnMapping;
  alokasiKey: string | null;
  targetKey: string | null;
  metadata: FileMetadata;
  workbook: XLSX.WorkBook;
}

// Normalizes column names for matching (e.g., "Unit Eselon 2", "unit_eselon2", "unit eselon2" -> "uniteselon2")
export function normalizeColName(name: string): string {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[_\s\-\/\.]+/g, '');
}

export function detectColumnMapping(headers: string[]): {
  columnMapping: ColumnMapping;
  alokasiKey: string | null;
  targetKey: string | null;
} {
  const columnMapping: ColumnMapping = {};
  let alokasiKey: string | null = null;
  let targetKey: string | null = null;

  // 1. Detect target filters
  TARGET_FILTER_CONFIGS.forEach((cfg) => {
    // Exact or normalized match among aliases
    const foundHeader = headers.find((h) => {
      const normH = normalizeColName(h);
      return cfg.aliases.some((alias) => normalizeColName(alias) === normH);
    });

    if (foundHeader) {
      columnMapping[cfg.key] = foundHeader;
    } else {
      // Fallback partial matching
      const partialHeader = headers.find((h) => {
        const normH = normalizeColName(h);
        return cfg.aliases.some((alias) => normH.includes(normalizeColName(alias)) || normalizeColName(alias).includes(normH));
      });
      if (partialHeader) {
        columnMapping[cfg.key] = partialHeader;
      }
    }
  });

  // 2. Detect Alokasi Komponen column
  const alokasiCandidates = [
    'alokasi_komponen_0',
    'alokasi_komponen',
    'alokasi',
    'alokasi_0',
    'total_alokasi',
    'pagu',
    'jumlah_anggaran',
    'anggaran',
    'nilai_alokasi'
  ];
  const foundAlokasi = headers.find((h) => {
    const normH = normalizeColName(h);
    return alokasiCandidates.some((c) => normalizeColName(c) === normH);
  }) || headers.find((h) => {
    const normH = normalizeColName(h);
    return normH.includes('alokasi') || normH.includes('pagu') || normH.includes('anggaran');
  });
  alokasiKey = foundAlokasi || null;

  // 3. Detect Target Komponen column
  const targetCandidates = [
    'target_komponen_0',
    'target_komponen',
    'target',
    'target_0',
    'total_target',
    'jumlah_target',
    'volume',
    'output_target'
  ];
  const foundTarget = headers.find((h) => {
    const normH = normalizeColName(h);
    return targetCandidates.some((c) => normalizeColName(c) === normH);
  }) || headers.find((h) => {
    const normH = normalizeColName(h);
    return normH.includes('target') || normH.includes('volume');
  });
  targetKey = foundTarget || null;

  return { columnMapping, alokasiKey, targetKey };
}

export async function parseExcelFile(file: File, sheetIndexOrName?: number | string): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    throw new Error('File Excel tidak memiliki sheet yang valid.');
  }

  let activeSheet = sheetNames[0];
  if (typeof sheetIndexOrName === 'number' && sheetNames[sheetIndexOrName]) {
    activeSheet = sheetNames[sheetIndexOrName];
  } else if (typeof sheetIndexOrName === 'string' && sheetNames.includes(sheetIndexOrName)) {
    activeSheet = sheetIndexOrName;
  }

  const worksheet = workbook.Sheets[activeSheet];
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

  if (rawRows.length === 0) {
    throw new Error('Sheet yang dipilih kosong atau tidak berisi data.');
  }

  // Extract all unique headers across all rows
  const headerSet = new Set<string>();
  rawRows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key && key.trim()) headerSet.add(key.trim());
    });
  });
  const headers = Array.from(headerSet);

  const { columnMapping, alokasiKey, targetKey } = detectColumnMapping(headers);

  // Clean and parse rows (normalize numeric fields)
  const cleanedData: ExcelRow[] = rawRows.map((row, index) => {
    const cleanRow: ExcelRow = { __rowId: index + 1 };
    headers.forEach((h) => {
      let val = row[h];
      if (val === undefined || val === null) {
        cleanRow[h] = '';
      } else {
        cleanRow[h] = typeof val === 'string' ? val.trim() : val;
      }
    });

    // Ensure alokasi & target have numeric representations
    if (alokasiKey && cleanRow[alokasiKey] !== undefined) {
      const num = parseNumericValue(cleanRow[alokasiKey]);
      cleanRow[`__numeric_${alokasiKey}`] = num;
      cleanRow[alokasiKey] = num;
    }
    if (targetKey && cleanRow[targetKey] !== undefined) {
      const num = parseNumericValue(cleanRow[targetKey]);
      cleanRow[`__numeric_${targetKey}`] = num;
      cleanRow[targetKey] = num;
    }

    return cleanRow;
  });

  const metadata: FileMetadata = {
    fileName: file.name,
    fileSize: file.size,
    sheetNames,
    activeSheet,
    totalRows: cleanedData.length,
    totalColumns: headers.length,
    uploadedAt: new Date()
  };

  return {
    data: cleanedData,
    headers,
    columnMapping,
    alokasiKey,
    targetKey,
    metadata,
    workbook
  };
}

export function parseSampleData(sampleData: ExcelRow[]): ParseResult {
  const headerSet = new Set<string>();
  sampleData.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key && !key.startsWith('__')) headerSet.add(key.trim());
    });
  });
  const headers = Array.from(headerSet);

  const { columnMapping, alokasiKey, targetKey } = detectColumnMapping(headers);

  const cleanedData: ExcelRow[] = sampleData.map((row, index) => {
    const cleanRow: ExcelRow = { __rowId: index + 1, ...row };
    if (alokasiKey && cleanRow[alokasiKey] !== undefined) {
      const num = parseNumericValue(cleanRow[alokasiKey]);
      cleanRow[`__numeric_${alokasiKey}`] = num;
      cleanRow[alokasiKey] = num;
    }
    if (targetKey && cleanRow[targetKey] !== undefined) {
      const num = parseNumericValue(cleanRow[targetKey]);
      cleanRow[`__numeric_${targetKey}`] = num;
      cleanRow[targetKey] = num;
    }
    return cleanRow;
  });

  // Create mock workbook for sheet operations
  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Komponen Anggaran');

  const metadata: FileMetadata = {
    fileName: 'laporan_renja (87).xlsx',
    fileSize: 45200,
    sheetNames: ['Data Komponen Anggaran'],
    activeSheet: 'Data Komponen Anggaran',
    totalRows: cleanedData.length,
    totalColumns: headers.length,
    uploadedAt: new Date()
  };

  return {
    data: cleanedData,
    headers,
    columnMapping,
    alokasiKey,
    targetKey,
    metadata,
    workbook
  };
}

export function prepareExportData(
  rows: ExcelRow[],
  alokasiKey?: string | null,
  targetKey?: string | null
): Record<string, any>[] {
  if (!rows || rows.length === 0) return [];

  const headerSet = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((k) => {
      if (!k.startsWith('__')) {
        headerSet.add(k);
      }
    });
  });
  const headers = Array.from(headerSet);

  return rows.map((row) => {
    const clean: Record<string, any> = {};
    headers.forEach((k) => {
      const val = row[k];
      const isAlokasi = alokasiKey && k === alokasiKey;
      const isTarget = targetKey && k === targetKey;
      const hasNumeric = row[`__numeric_${k}`] !== undefined;

      if (isAlokasi || isTarget || hasNumeric) {
        const numVal = row[`__numeric_${k}`] !== undefined ? row[`__numeric_${k}`] : parseNumericValue(val);
        clean[k] = typeof numVal === 'number' && !isNaN(numVal) ? numVal : 0;
      } else if (typeof val === 'number') {
        clean[k] = val;
      } else if (typeof val === 'string' && val.trim() !== '') {
        const normK = normalizeColName(k);
        const isLikelyNum =
          normK.includes('alokasi') ||
          normK.includes('target') ||
          normK.includes('pagu') ||
          normK.includes('anggaran') ||
          normK.includes('jumlah') ||
          normK.includes('total') ||
          normK.includes('volume') ||
          normK.includes('realisasi') ||
          normK.includes('biaya');

        if (isLikelyNum) {
          const parsed = parseNumericValue(val);
          clean[k] = isNaN(parsed) ? val : parsed;
        } else {
          clean[k] = val;
        }
      } else {
        clean[k] = val ?? '';
      }
    });
    return clean;
  });
}

export function exportToExcel(
  rows: ExcelRow[], 
  fileName: string = 'export_data.xlsx',
  alokasiKey?: string | null,
  targetKey?: string | null
) {
  const exportable = prepareExportData(rows, alokasiKey, targetKey);
  if (exportable.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(exportable);

  // Set numeric cell types and formatting so Excel enables formulas like SUM() seamlessly
  if (worksheet['!ref']) {
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const headers: string[] = [];

    // Get column header names
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      const cell = worksheet[cellAddress];
      headers[C] = cell ? String(cell.v || '') : '';
    }

    // Format data rows
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerName = headers[C];
      const normH = normalizeColName(headerName);
      const isAlokasi = alokasiKey && headerName === alokasiKey;
      const isTarget = targetKey && headerName === targetKey;
      const isCurrency = isAlokasi || normH.includes('alokasi') || normH.includes('pagu') || normH.includes('anggaran') || normH.includes('biaya') || normH.includes('realisasi');
      const isCount = isTarget || normH.includes('target') || normH.includes('volume') || normH.includes('jumlah') || normH.includes('total');

      for (let R = 1; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        if (!cell) continue;

        if (typeof cell.v === 'number') {
          cell.t = 'n';
          if (isCurrency || isCount) {
            cell.z = '#,##0'; // Excel number format with thousands separator
          }
        } else if (typeof cell.v === 'string' && (isCurrency || isCount || isAlokasi || isTarget)) {
          const num = parseNumericValue(cell.v);
          cell.t = 'n';
          cell.v = num;
          cell.z = '#,##0';
        }
      }
    }

    // Auto-fit column widths
    const colWidths = headers.map((h) => {
      let maxLen = h.length;
      exportable.slice(0, 100).forEach((row) => {
        const val = row[h];
        const valStr = val !== null && val !== undefined ? (typeof val === 'number' ? val.toLocaleString('id-ID') : String(val)) : '';
        if (valStr.length > maxLen) maxLen = valStr.length;
      });
      return { wch: Math.min(Math.max(maxLen + 4, 12), 65) };
    });
    worksheet['!cols'] = colWidths;
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Komponen Terfilter');
  XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}

export function exportToCSV(
  rows: ExcelRow[], 
  fileName: string = 'export_data.csv',
  alokasiKey?: string | null,
  targetKey?: string | null
) {
  const exportable = prepareExportData(rows, alokasiKey, targetKey);
  const worksheet = XLSX.utils.json_to_sheet(exportable);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(
  rows: ExcelRow[],
  alokasiKey?: string | null,
  targetKey?: string | null
): Promise<boolean> {
  try {
    const exportable = prepareExportData(rows, alokasiKey, targetKey);
    if (exportable.length === 0) return false;

    const headers = Object.keys(exportable[0]);
    const tsvRows = [
      headers.join('\t'),
      ...exportable.map((row) => headers.map((h) => String(row[h] ?? '')).join('\t'))
    ];
    const text = tsvRows.join('\n');

    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}
