export interface FilterConfig {
  key: string;
  label: string;
  aliases: string[];
}

export const TARGET_FILTER_CONFIGS: FilterConfig[] = [
  { key: 'unit_eselon1', label: 'Unit Eselon 1', aliases: ['unit eselon1', 'unit_eselon1', 'unit eselon 1', 'unit_eselon_1', 'unit_eselon_i', 'unit eselon i', 'eselon1', 'eselon 1', 'eselon_1', 'eselon i', 'unit_utama', 'unit utama', 'kode_unit_eselon1', 'nama_unit_eselon1'] },
  { key: 'unit_eselon2', label: 'Unit Eselon 2', aliases: ['unit eselon2', 'unit_eselon2', 'unit eselon 2', 'unit_eselon_2', 'unit_eselon_ii', 'unit eselon ii', 'eselon2', 'eselon 2', 'eselon_2', 'eselon ii', 'unit_kerja'] },
  { key: 'type_komponen', label: 'Type Komponen', aliases: ['type_komponen', 'tipe_komponen', 'type komponen', 'tipe komponen'] },
  { key: 'sumber_dana', label: 'Sumber Dana', aliases: ['sumber_dana', 'sumber dana', 'sumberdana', 'sumber_anggaran', 'sumber anggaran', 'kode_sumber_dana', 'nama_sumber_dana', 'dana', 'jenis_sumber_dana'] },
  { key: 'program', label: 'Program', aliases: ['program', 'nama_program', 'kode_program'] },
  { key: 'kegiatan', label: 'Kegiatan', aliases: ['kegiatan', 'nama_kegiatan', 'kode_kegiatan'] },
  { key: 'kro', label: 'KRO', aliases: ['kro', 'kode_kro', 'nama_kro', 'klasifikasi_ro'] },
  { key: 'ro', label: 'RO', aliases: ['ro', 'kode_ro', 'nama_ro', 'rincian_output'] },
  { key: 'propinsi', label: 'Propinsi', aliases: ['propinsi', 'provinsi', 'nama_provinsi', 'kode_provinsi'] },
  { key: 'kabupaten', label: 'Kabupaten', aliases: ['kabupaten', 'kabupaten/kota', 'kab_kota', 'nama_kabupaten', 'kota'] },
  { key: 'lokasi_ro', label: 'Lokasi RO', aliases: ['lokasi ro', 'lokasi_ro', 'lokasi', 'lokasi_kegiatan'] },
  { key: 'komponen', label: 'Komponen', aliases: ['komponen', 'nama_komponen', 'kode_komponen'] },
];

export interface ColumnMapping {
  // mapped key in standard format -> actual column header in Excel
  [key: string]: string;
}

export type ExcelRow = Record<string, any>;

export interface FilterState {
  [filterKey: string]: string[];
}

export interface ProgramAllocationRow {
  code: string;
  name: string;
  unitCode?: string;
  unitName?: string;
  isUnitHeader?: boolean;
  // Belanja Pegawai
  belanjaPegawaiRM: number;
  // Belanja Operasional
  belanjaOpsRM: number;
  belanjaOpsPNBP: number;
  belanjaOpsBLU: number;
  totalBelanjaOps: number;
  // Belanja Non Operasional
  belanjaNonOpsRM: number;
  belanjaNonOpsPNBP: number;
  belanjaNonOpsBLU: number;
  belanjaNonOpsSBSN: number;
  totalBelanjaNonOps: number;
  // Total Row
  totalAlokasiRow: number;
  children?: ProgramAllocationRow[];
}

export interface ApbnSummaryMatrix {
  // 1. Total Alokasi
  totalAlokasi: number;
  
  // 2. Alokasi per Program
  programAllocations: {
    code: string;
    name: string;
    unitCode?: string;
    unitName?: string;
    totalAlokasi: number;
    percentage: number;
    rowCount: number;
  }[];

  // 3. Alokasi Belanja OPS
  totalBelanjaPegawaiRM: number;
  totalBelanjaOpsRM: number;
  totalBelanjaOpsPNBP: number;
  totalBelanjaOpsBLU: number;
  totalBelanjaOps: number; // (RM + PNBP + BLU)
  totalOpsWithPegawai: number; // Pegawai RM + Belanja Ops

  // 4. Alokasi Belanja NonOPS
  totalBelanjaNonOpsRM: number;
  totalBelanjaNonOpsPNBP: number;
  totalBelanjaNonOpsBLU: number;
  totalBelanjaNonOpsSBSN: number;
  totalBelanjaNonOps: number; // (RM + PNBP + BLU + SBSN)

  // 5. Alokasi Sumber Dana
  sumberDana: {
    RM: number;
    belanjaPegawaiRM?: number;
    alokasiRM?: number; // total RM dikurangi belanja pegawai
    PNBP: number;
    BLU: number;
    SBSN: number;
    lainnya: number;
    total: number;
  };

  // Matrix rows hierarchical
  matrixRows: ProgramAllocationRow[];
}

export interface SummaryStats {
  totalRows: number;
  filteredRows: number;
  totalAlokasi: number;
  totalTarget: number;
  avgAlokasi: number;
  maxAlokasi: number;
  percentageFiltered: number;
  apbnMatrix?: ApbnSummaryMatrix;
}

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  sheetNames: string[];
  activeSheet: string;
  totalRows: number;
  totalColumns: number;
  uploadedAt: Date;
}
