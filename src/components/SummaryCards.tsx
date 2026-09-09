import React, { useState } from 'react';
import { 
  Wallet, 
  Layers, 
  Building2, 
  Coins, 
  BarChart3,
  Table as TableIcon,
  LayoutGrid,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info,
  ArrowDownRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { SummaryStats, ProgramAllocationRow } from '../types';
import { formatRupiah, formatCompactRupiah, formatNumber } from '../utils/formatters';
import * as XLSX from 'xlsx';

interface SummaryCardsProps {
  stats: SummaryStats;
  alokasiColName: string | null;
  targetColName: string | null;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  stats,
  alokasiColName,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'cards'>('matrix');
  const [copied, setCopied] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({
    '019.01': true,
    '019.07': true,
  });

  const matrix = stats.apbnMatrix;
  const totalAlokasi = matrix ? matrix.totalAlokasi : stats.totalAlokasi;

  const toggleUnit = (unitCode: string) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitCode]: !prev[unitCode],
    }));
  };

  const handleExportExcel = () => {
    if (!matrix) return;
    const exportRows: any[] = [];
    
    // Header rows
    matrix.matrixRows.forEach((unit) => {
      exportRows.push({
        'KODE': unit.code,
        'UNIT ESELON I / PROGRAM': unit.name,
        'BELANJA PEGAWAI (RM) (4)': unit.belanjaPegawaiRM,
        'OPS RM (5)': unit.belanjaOpsRM,
        'OPS PNBP (6)': unit.belanjaOpsPNBP,
        'OPS BLU (7)': unit.belanjaOpsBLU,
        'TOTAL OPS (8)=(5)+(6)+(7)': unit.totalBelanjaOps,
        'NON OPS RM (9)': unit.belanjaNonOpsRM,
        'NON OPS PNBP (10)': unit.belanjaNonOpsPNBP,
        'NON OPS BLU (11)': unit.belanjaNonOpsBLU,
        'NON OPS SBSN (12)': unit.belanjaNonOpsSBSN,
        'TOTAL NON OPS (13)=(9)+(10)+(11)+(12)': unit.totalBelanjaNonOps,
        'TOTAL ALOKASI': unit.totalAlokasiRow,
      });

      if (unit.children) {
        unit.children.forEach((prog) => {
          exportRows.push({
            'KODE': prog.code,
            'UNIT ESELON I / PROGRAM': `  ${prog.name}`,
            'BELANJA PEGAWAI (RM) (4)': prog.belanjaPegawaiRM,
            'OPS RM (5)': prog.belanjaOpsRM,
            'OPS PNBP (6)': prog.belanjaOpsPNBP,
            'OPS BLU (7)': prog.belanjaOpsBLU,
            'TOTAL OPS (8)=(5)+(6)+(7)': prog.totalBelanjaOps,
            'NON OPS RM (9)': prog.belanjaNonOpsRM,
            'NON OPS PNBP (10)': prog.belanjaNonOpsPNBP,
            'NON OPS BLU (11)': prog.belanjaNonOpsBLU,
            'NON OPS SBSN (12)': prog.belanjaNonOpsSBSN,
            'TOTAL NON OPS (13)=(9)+(10)+(11)+(12)': prog.totalBelanjaNonOps,
            'TOTAL ALOKASI': prog.totalAlokasiRow,
          });
        });
      }
    });

    // Total row
    exportRows.push({
      'KODE': 'TOTAL',
      'UNIT ESELON I / PROGRAM': 'TOTAL KESELURUHAN',
      'BELANJA PEGAWAI (RM) (4)': matrix.totalBelanjaPegawaiRM,
      'OPS RM (5)': matrix.totalBelanjaOpsRM,
      'OPS PNBP (6)': matrix.totalBelanjaOpsPNBP,
      'OPS BLU (7)': matrix.totalBelanjaOpsBLU,
      'TOTAL OPS (8)=(5)+(6)+(7)': matrix.totalBelanjaOps,
      'NON OPS RM (9)': matrix.totalBelanjaNonOpsRM,
      'NON OPS PNBP (10)': matrix.totalBelanjaNonOpsPNBP,
      'NON OPS BLU (11)': matrix.totalBelanjaNonOpsBLU,
      'NON OPS SBSN (12)': matrix.totalBelanjaNonOpsSBSN,
      'TOTAL NON OPS (13)=(9)+(10)+(11)+(12)': matrix.totalBelanjaNonOps,
      'TOTAL ALOKASI': matrix.totalAlokasi,
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ringkasan APBN');
    XLSX.writeFile(wb, 'Ringkasan_Alokasi_Jenis_Belanja_Sumber_Dana.xlsx');
  };

  const handleCopyTable = () => {
    if (!matrix) return;
    let tsv = "KODE\tUNIT ESELON I / PROGRAM\tBELANJA PEGAWAI (RM)\tOPS RM\tOPS PNBP\tOPS BLU\tTOTAL OPS\tNON OPS RM\tNON OPS PNBP\tNON OPS BLU\tNON OPS SBSN\tTOTAL NON OPS\tTOTAL ALOKASI\n";
    matrix.matrixRows.forEach((unit) => {
      tsv += `${unit.code}\t${unit.name}\t${unit.belanjaPegawaiRM}\t${unit.belanjaOpsRM}\t${unit.belanjaOpsPNBP}\t${unit.belanjaOpsBLU}\t${unit.totalBelanjaOps}\t${unit.belanjaNonOpsRM}\t${unit.belanjaNonOpsPNBP}\t${unit.belanjaNonOpsBLU}\t${unit.belanjaNonOpsSBSN}\t${unit.totalBelanjaNonOps}\t${unit.totalAlokasiRow}\n`;
      if (unit.children) {
        unit.children.forEach((p) => {
          tsv += `${p.code}\t${p.name}\t${p.belanjaPegawaiRM}\t${p.belanjaOpsRM}\t${p.belanjaOpsPNBP}\t${p.belanjaOpsBLU}\t${p.totalBelanjaOps}\t${p.belanjaNonOpsRM}\t${p.belanjaNonOpsPNBP}\t${p.belanjaNonOpsBLU}\t${p.belanjaNonOpsSBSN}\t${p.totalBelanjaNonOps}\t${p.totalAlokasiRow}\n`;
        });
      }
    });
    tsv += `TOTAL\tTOTAL KESELURUHAN\t${matrix.totalBelanjaPegawaiRM}\t${matrix.totalBelanjaOpsRM}\t${matrix.totalBelanjaOpsPNBP}\t${matrix.totalBelanjaOpsBLU}\t${matrix.totalBelanjaOps}\t${matrix.totalBelanjaNonOpsRM}\t${matrix.totalBelanjaNonOpsPNBP}\t${matrix.totalBelanjaNonOpsBLU}\t${matrix.totalBelanjaNonOpsSBSN}\t${matrix.totalBelanjaNonOps}\t${matrix.totalAlokasi}\n`;

    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCell = (val: number, isHeader = false, isHighlighted = false) => {
    if (val === 0 || !val) {
      return <span className="text-slate-300 dark:text-slate-600 font-mono text-center block text-xs">-</span>;
    }
    return (
      <span className={`font-mono text-right block tracking-tight ${
        isHeader 
          ? 'font-bold text-slate-900 dark:text-white' 
          : isHighlighted 
            ? 'font-semibold text-slate-900 dark:text-slate-100' 
            : 'text-slate-700 dark:text-slate-300'
      }`}>
        {formatNumber(val)}
      </span>
    );
  };

  // Calculations for Point 5: Belanja Pegawai (RM) and Alokasi RM (Total RM - Belanja Pegawai)
  const totalRM = matrix?.sumberDana.RM || 0;
  const belanjaPegawaiRM = matrix?.totalBelanjaPegawaiRM || 0;
  const alokasiRMExPegawai = Math.max(0, totalRM - belanjaPegawaiRM);
  const totalPNBP = matrix?.sumberDana.PNBP || 0;
  const totalBLU = matrix?.sumberDana.BLU || 0;
  const totalSBSN = matrix?.sumberDana.SBSN || 0;

  return (
    <section id="summary-section" className="space-y-4">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-900 to-slate-800 text-white flex items-center justify-center font-black shadow-sm">
            <BarChart3 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Ringkasan Kalkulasi Data Terfilter
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Berdasarkan Jenis Belanja (Operasional & Non-Operasional) dan Sumber Dana APBN
            </p>
          </div>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              id="btn-view-matrix"
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 mr-1.5" />
              Tabel Matriks APBN
            </button>
            <button
              type="button"
              id="btn-view-cards"
              onClick={() => setActiveTab('cards')}
              className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
              Rekap
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyTable}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer text-xs font-medium"
            title="Salin tabel ringkasan ke clipboard (format TSV/Excel)"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Download ringkasan APBN ke Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Excel
          </button>
        </div>
      </div>

      {/* 5 Executive Metric Badges (Always Visible Mini-Ribbon) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Total Alokasi */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-sm border border-indigo-800/40">
          <div className="flex items-center justify-between text-xs text-indigo-200 font-semibold mb-1">
            <span className="flex items-center">
              <Wallet className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> 1. Total Alokasi
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">100%</span>
          </div>
          <div className="text-lg font-black font-mono mt-1 text-white">{formatRupiah(totalAlokasi)}</div>
          <div className="text-[11px] text-indigo-200 mt-1 flex items-center justify-between">
            <span>Ringkas: {formatCompactRupiah(totalAlokasi)}</span>
          </div>
        </div>

        {/* 2. Alokasi per Program */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <span className="flex items-center text-indigo-600 dark:text-indigo-400">
              <Layers className="w-3.5 h-3.5 mr-1.5" /> 2. Alokasi per Program
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 font-bold text-indigo-600 dark:text-indigo-400">
              {matrix?.programAllocations.length || 0} Prog
            </span>
          </div>
          <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
            {matrix?.programAllocations[0] ? formatCompactRupiah(matrix.programAllocations[0].totalAlokasi) : formatCompactRupiah(totalAlokasi)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate" title={matrix?.programAllocations[0]?.name || 'Utama'}>
            Terbesar: {matrix?.programAllocations[0]?.name.replace('Program ', '') || 'Dukungan Manajemen'}
          </div>
        </div>

        {/* 3. Alokasi Belanja OPS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <span className="flex items-center text-sky-600 dark:text-sky-400">
              <Building2 className="w-3.5 h-3.5 mr-1.5" /> 3. Belanja OPS
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 font-bold text-sky-600 dark:text-sky-400">
              {totalAlokasi > 0 && matrix ? ((matrix.totalOpsWithPegawai / totalAlokasi) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
            {formatCompactRupiah(matrix?.totalOpsWithPegawai || 0)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex justify-between">
            <span>Pegawai: {formatCompactRupiah(matrix?.totalBelanjaPegawaiRM || 0)}</span>
            <span>Layanan: {formatCompactRupiah(matrix?.totalBelanjaOps || 0)}</span>
          </div>
        </div>

        {/* 4. Alokasi Belanja NonOPS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <span className="flex items-center text-amber-600 dark:text-amber-400">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> 4. Belanja NonOPS
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 font-bold text-amber-600 dark:text-amber-400">
              {totalAlokasi > 0 && matrix ? ((matrix.totalBelanjaNonOps / totalAlokasi) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
            {formatCompactRupiah(matrix?.totalBelanjaNonOps || 0)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Teknis, Output, Modal & SBSN
          </div>
        </div>

        {/* 5. Alokasi Sumber Dana (with updated Belanja Pegawai RM & Alokasi RM) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <span className="flex items-center text-teal-600 dark:text-teal-400">
              <Coins className="w-3.5 h-3.5 mr-1.5" /> 5. Sumber Dana
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 font-bold text-teal-600 dark:text-teal-400">
              RM/PNBP/BLU/SBSN
            </span>
          </div>
          <div className="text-lg font-black font-mono text-slate-900 dark:text-white mt-1">
            {formatCompactRupiah(totalRM)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex justify-between">
            <span title="Belanja Pegawai (RM)">Peg: {formatCompactRupiah(belanjaPegawaiRM)}</span>
            <span title="Alokasi RM di luar Belanja Pegawai (Total RM - Pegawai)">RM: {formatCompactRupiah(alokasiRMExPegawai)}</span>
          </div>
        </div>
      </div>

      {/* Main Content: 1. Polished Executive Matriks APBN Table */}
      {activeTab === 'matrix' && matrix && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-xs text-left border-collapse min-w-[1050px]">
              {/* Executive Header Structure */}
              <thead>
                {/* Header Level 1: Category Groups */}
                <tr className="bg-slate-900 dark:bg-slate-950 text-white font-bold border-b border-slate-700 text-center">
                  <th rowSpan={3} className="px-3 py-3 border-r border-slate-700 w-24 align-middle tracking-wider">
                    KODE
                  </th>
                  <th rowSpan={3} className="px-4 py-3 border-r border-slate-700 min-w-[260px] text-left align-middle tracking-wider">
                    UNIT ESELON I / PROGRAM
                  </th>
                  <th colSpan={10} className="px-3 py-2.5 border-r border-slate-700 uppercase tracking-wider text-xs bg-slate-800/90 text-slate-100">
                    BERDASARKAN JENIS BELANJA / SUMBER DANA
                  </th>
                  <th rowSpan={3} className="px-3 py-3 border-l border-slate-700 w-36 align-middle bg-emerald-900/80 text-emerald-200 tracking-wider">
                    TOTAL ALOKASI
                  </th>
                </tr>

                {/* Header Level 2: Belanja Groups */}
                <tr className="text-white font-bold border-b border-slate-700 text-center text-[11px]">
                  {/* Belanja Pegawai */}
                  <th className="px-2 py-2 border-r border-slate-700 bg-indigo-950/90 text-indigo-200 w-28">
                    BELANJA PEGAWAI
                  </th>
                  {/* Belanja Operasional */}
                  <th colSpan={4} className="px-2 py-2 border-r border-slate-700 bg-sky-950/90 text-sky-200">
                    BELANJA OPERASIONAL
                  </th>
                  {/* Belanja Non Operasional */}
                  <th colSpan={5} className="px-2 py-2 border-r border-slate-700 bg-amber-950/90 text-amber-200">
                    BELANJA NON OPERASIONAL
                  </th>
                </tr>

                {/* Header Level 3: Sources of Funds */}
                <tr className="text-slate-200 font-bold border-b border-slate-700 text-center text-[11px]">
                  {/* Pegawai RM */}
                  <th className="px-2 py-1.5 border-r border-slate-700 bg-indigo-900/60 text-indigo-200 w-28">RM</th>
                  {/* Belanja Operasional */}
                  <th className="px-2 py-1.5 border-r border-slate-700 bg-sky-900/40 text-sky-200 w-24">RM</th>
                  <th className="px-2 py-1.5 border-r border-slate-700 bg-sky-900/40 text-sky-200 w-20">PNBP</th>
                  <th className="px-2 py-1.5 border-r border-slate-700 bg-sky-900/40 text-sky-200 w-20">BLU</th>
                  <th className="px-2 py-1.5 border-r border-slate-700 bg-sky-800/80 text-sky-100 font-extrabold w-28">TOTAL</th>
                  {/* Belanja Non Operasional */}
                  <th className="px-2 py-1.5 border-r border-slate-700 bg-amber-900/40 text-amber-200 w-24">RM</th>
                  <th className="px-2 py-1.5 border-r border-slate-700 bg-amber-900/40 text-amber-200 w-20">PNBP</th>
                  <th className="px-2 py-1.5 border-r border-slate-700 bg-amber-900/40 text-amber-200 w-20">BLU</th>
                  <th className="px-2 py-1.5 border-r border-slate-700 bg-amber-900/40 text-amber-200 w-20">SBSN</th>
                  <th className="px-2 py-1.5 border-r border-slate-700 bg-amber-800/80 text-amber-100 font-extrabold w-28">TOTAL</th>
                </tr>

                {/* Numbering row: (1), (2), (4), (5)... */}
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-300 dark:border-slate-700 text-center text-[10px]">
                  <th className="px-2 py-1 border-r border-slate-200 dark:border-slate-700">(1)</th>
                  <th className="px-2 py-1 border-r border-slate-200 dark:border-slate-700 text-left pl-4">(2)</th>
                  <th className="px-2 py-1 border-r border-slate-200 dark:border-slate-700 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300">(4)</th>
                  <th className="px-2 py-1 border-r border-slate-200 dark:border-slate-700">(5)</th>
                  <th className="px-2 py-1 border-r border-slate-200 dark:border-slate-700">(6)</th>
                  <th className="px-2 py-1 border-r border-slate-200 dark:border-slate-700">(7)</th>
                  <th className="px-2 py-1 border-r border-slate-200 dark:border-slate-700 font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 text-[9px]">(8)=(5)+(6)+(7)</th>
                  <th className="px-2 py-1 border-r border-slate-200 dark:border-slate-700">(9)</th>
                  <th className="px-2 py-1 border-r border-slate-200 dark:border-slate-700">(10)</th>
                  <th className="px-2 py-1 border-r border-slate-200 dark:border-slate-700">(11)</th>
                  <th className="px-2 py-1 border-r border-slate-200 dark:border-slate-700">(12)</th>
                  <th className="px-2 py-1 border-r border-slate-200 dark:border-slate-700 font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[9px]">(13)=(9)+(10)+(11)+(12)</th>
                  <th className="px-2 py-1 border-l border-slate-200 dark:border-slate-700 font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">(14)=(4)+(8)+(13)</th>
                </tr>
              </thead>

              {/* Body: Hierarchical Data Rows */}
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {matrix.matrixRows.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada data yang sesuai dengan filter saat ini.
                    </td>
                  </tr>
                ) : (
                  matrix.matrixRows.map((unit) => {
                    const isExpanded = expandedUnits[unit.code] ?? true;
                    return (
                      <React.Fragment key={unit.code}>
                        {/* Parent Row: Unit Eselon I (e.g. 019.01 Sekretariat Jenderal, 019.07 BSKJI) */}
                        <tr 
                          onClick={() => toggleUnit(unit.code)}
                          className="bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 font-bold text-slate-900 dark:text-white cursor-pointer transition-colors border-t border-b border-slate-300 dark:border-slate-700"
                        >
                          <td className="px-3 py-2.5 font-mono border-r border-slate-300 dark:border-slate-700 flex items-center justify-between">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold">
                              {unit.code}
                            </span>
                            {unit.children && unit.children.length > 0 && (
                              isExpanded 
                                ? <ChevronDown className="w-4 h-4 ml-1 text-slate-600 dark:text-slate-300" /> 
                                : <ChevronRight className="w-4 h-4 ml-1 text-slate-600 dark:text-slate-300" />
                            )}
                          </td>
                          <td className="px-4 py-2.5 border-r border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold">
                            {unit.name}
                          </td>
                          <td className="px-2 py-2.5 border-r border-slate-300 dark:border-slate-700 bg-indigo-50/40 dark:bg-indigo-950/20">
                            {renderCell(unit.belanjaPegawaiRM, true)}
                          </td>
                          <td className="px-2 py-2.5 border-r border-slate-300 dark:border-slate-700">
                            {renderCell(unit.belanjaOpsRM, true)}
                          </td>
                          <td className="px-2 py-2.5 border-r border-slate-300 dark:border-slate-700">
                            {renderCell(unit.belanjaOpsPNBP, true)}
                          </td>
                          <td className="px-2 py-2.5 border-r border-slate-300 dark:border-slate-700">
                            {renderCell(unit.belanjaOpsBLU, true)}
                          </td>
                          <td className="px-2 py-2.5 border-r border-slate-300 dark:border-slate-700 bg-sky-100/60 dark:bg-sky-950/40">
                            {renderCell(unit.totalBelanjaOps, true, true)}
                          </td>
                          <td className="px-2 py-2.5 border-r border-slate-300 dark:border-slate-700">
                            {renderCell(unit.belanjaNonOpsRM, true)}
                          </td>
                          <td className="px-2 py-2.5 border-r border-slate-300 dark:border-slate-700">
                            {renderCell(unit.belanjaNonOpsPNBP, true)}
                          </td>
                          <td className="px-2 py-2.5 border-r border-slate-300 dark:border-slate-700">
                            {renderCell(unit.belanjaNonOpsBLU, true)}
                          </td>
                          <td className="px-2 py-2.5 border-r border-slate-300 dark:border-slate-700">
                            {renderCell(unit.belanjaNonOpsSBSN, true)}
                          </td>
                          <td className="px-2 py-2.5 border-r border-slate-300 dark:border-slate-700 bg-amber-100/60 dark:bg-amber-950/40">
                            {renderCell(unit.totalBelanjaNonOps, true, true)}
                          </td>
                          <td className="px-3 py-2.5 border-l border-slate-300 dark:border-slate-700 bg-emerald-100/70 dark:bg-emerald-950/50 font-black text-slate-950 dark:text-emerald-100">
                            {renderCell(unit.totalAlokasiRow, true, true)}
                          </td>
                        </tr>

                        {/* Child Rows: Programs (e.g. 019.07.BD Program Riset, Inovasi, dan Standarisasi Industri) */}
                        {isExpanded && unit.children?.map((prog) => (
                          <tr 
                            key={prog.code}
                            className="bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 pl-6">
                              <span className="font-semibold text-indigo-600 dark:text-indigo-400 text-[11px]">
                                {prog.code}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 pl-6">
                              {prog.name}
                            </td>
                            <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 bg-indigo-50/20 dark:bg-indigo-950/10">
                              {renderCell(prog.belanjaPegawaiRM)}
                            </td>
                            <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800">
                              {renderCell(prog.belanjaOpsRM)}
                            </td>
                            <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800">
                              {renderCell(prog.belanjaOpsPNBP)}
                            </td>
                            <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800">
                              {renderCell(prog.belanjaOpsBLU)}
                            </td>
                            <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 bg-sky-50/50 dark:bg-sky-950/20 font-semibold">
                              {renderCell(prog.totalBelanjaOps, false, true)}
                            </td>
                            <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800">
                              {renderCell(prog.belanjaNonOpsRM)}
                            </td>
                            <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800">
                              {renderCell(prog.belanjaNonOpsPNBP)}
                            </td>
                            <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800">
                              {renderCell(prog.belanjaNonOpsBLU)}
                            </td>
                            <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800">
                              {renderCell(prog.belanjaNonOpsSBSN)}
                            </td>
                            <td className="px-2 py-2 border-r border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20 font-semibold">
                              {renderCell(prog.totalBelanjaNonOps, false, true)}
                            </td>
                            <td className="px-3 py-2 border-l border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/50 font-bold">
                              {renderCell(prog.totalAlokasiRow, true, true)}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>

              {/* Total Summary Footer Row */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-black border-t-2 border-slate-700">
                  <td className="px-3 py-3 font-mono text-center text-amber-400">TOTAL</td>
                  <td className="px-4 py-3 uppercase tracking-wider text-xs font-bold text-white">
                    TOTAL KESELURUHAN DATA TERFILTER
                  </td>
                  <td className="px-2 py-3 text-right font-mono bg-indigo-950 text-indigo-300">
                    {formatNumber(matrix.totalBelanjaPegawaiRM)}
                  </td>
                  <td className="px-2 py-3 text-right font-mono">
                    {formatNumber(matrix.totalBelanjaOpsRM)}
                  </td>
                  <td className="px-2 py-3 text-right font-mono">
                    {formatNumber(matrix.totalBelanjaOpsPNBP)}
                  </td>
                  <td className="px-2 py-3 text-right font-mono">
                    {formatNumber(matrix.totalBelanjaOpsBLU)}
                  </td>
                  <td className="px-2 py-3 text-right font-mono bg-sky-950 text-sky-300 font-bold">
                    {formatNumber(matrix.totalBelanjaOps)}
                  </td>
                  <td className="px-2 py-3 text-right font-mono">
                    {formatNumber(matrix.totalBelanjaNonOpsRM)}
                  </td>
                  <td className="px-2 py-3 text-right font-mono">
                    {formatNumber(matrix.totalBelanjaNonOpsPNBP)}
                  </td>
                  <td className="px-2 py-3 text-right font-mono">
                    {formatNumber(matrix.totalBelanjaNonOpsBLU)}
                  </td>
                  <td className="px-2 py-3 text-right font-mono">
                    {formatNumber(matrix.totalBelanjaNonOpsSBSN)}
                  </td>
                  <td className="px-2 py-3 text-right font-mono bg-amber-950 text-amber-300 font-bold">
                    {formatNumber(matrix.totalBelanjaNonOps)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono bg-emerald-700 text-white text-sm font-black">
                    {formatNumber(matrix.totalAlokasi)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* View 2: Detailed 5 Executive Cards breakdown */}
      {activeTab === 'cards' && matrix && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Total Alokasi & Komposisi Global */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Wallet className="w-4 h-4" />
              <span>1. Total Alokasi Anggaran</span>
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatRupiah(matrix.totalAlokasi)}
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Belanja Operasional (Pegawai + Ops):</span>
                <span className="font-bold font-mono">{formatRupiah(matrix.totalOpsWithPegawai)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Belanja Non-Operasional:</span>
                <span className="font-bold font-mono">{formatRupiah(matrix.totalBelanjaNonOps)}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Alokasi per Program */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <span className="flex items-center"><Layers className="w-4 h-4 mr-2" /> 2. Alokasi per Program</span>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full font-bold text-indigo-600 dark:text-indigo-400">
                {matrix.programAllocations.length} Program
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1 text-xs">
              {matrix.programAllocations.map((p) => (
                <div key={p.code} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">{p.code}</span>
                    <span className="text-slate-800 dark:text-slate-200">{p.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold">{formatCompactRupiah(p.totalAlokasi)}</div>
                    <div className="text-[10px] text-slate-400">{p.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Alokasi Belanja OPS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 font-bold text-sm">
              <Building2 className="w-4 h-4" />
              <span>3. Alokasi Belanja OPS</span>
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatRupiah(matrix.totalOpsWithPegawai)}
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Belanja Pegawai (RM):</span>
                <span className="font-mono font-semibold">{formatRupiah(matrix.totalBelanjaPegawaiRM)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">OPS RM:</span>
                <span className="font-mono font-semibold">{formatRupiah(matrix.totalBelanjaOpsRM)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">OPS PNBP:</span>
                <span className="font-mono font-semibold">{formatRupiah(matrix.totalBelanjaOpsPNBP)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">OPS BLU:</span>
                <span className="font-mono font-semibold">{formatRupiah(matrix.totalBelanjaOpsBLU)}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Alokasi Belanja NonOPS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>4. Alokasi Belanja NonOPS</span>
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {formatRupiah(matrix.totalBelanjaNonOps)}
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">NonOPS RM:</span>
                <span className="font-mono font-semibold">{formatRupiah(matrix.totalBelanjaNonOpsRM)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NonOPS PNBP:</span>
                <span className="font-mono font-semibold">{formatRupiah(matrix.totalBelanjaNonOpsPNBP)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NonOPS BLU:</span>
                <span className="font-mono font-semibold">{formatRupiah(matrix.totalBelanjaNonOpsBLU)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NonOPS SBSN:</span>
                <span className="font-mono font-semibold">{formatRupiah(matrix.totalBelanjaNonOpsSBSN)}</span>
              </div>
            </div>
          </div>

          {/* Card 5: Alokasi Sumber Dana (RM / PNBP / BLU / SBSN) with Belanja Pegawai (RM) & Alokasi RM (Total RM - Pegawai) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 md:col-span-2 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400 font-bold text-sm">
                <Coins className="w-4 h-4" />
                <span>5. Alokasi Sumber Dana (RM / PNBP / BLU / SBSN)</span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Alokasi RM = Total RM dikurangi Belanja Pegawai
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
              {/* 5.1 Belanja Pegawai (RM) */}
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40">
                <div className="text-[11px] text-indigo-700 dark:text-indigo-300 font-bold truncate">
                  Belanja Pegawai (RM)
                </div>
                <div className="text-sm sm:text-base font-black font-mono mt-1 text-indigo-950 dark:text-indigo-100">
                  {formatCompactRupiah(belanjaPegawaiRM)}
                </div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                  {totalAlokasi > 0 ? ((belanjaPegawaiRM / totalAlokasi) * 100).toFixed(1) : 0}% total
                </div>
              </div>

              {/* 5.2 Alokasi RM (Total RM - Belanja Pegawai) */}
              <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40">
                <div className="text-[11px] text-teal-700 dark:text-teal-300 font-bold truncate" title="Alokasi RM (Total RM dikurangi Belanja Pegawai)">
                  Alokasi RM
                </div>
                <div className="text-sm sm:text-base font-black font-mono mt-1 text-teal-950 dark:text-teal-100">
                  {formatCompactRupiah(alokasiRMExPegawai)}
                </div>
                <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                  {totalAlokasi > 0 ? ((alokasiRMExPegawai / totalAlokasi) * 100).toFixed(1) : 0}% total
                </div>
              </div>

              {/* 5.3 Total RM Keseluruhan */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-bold truncate">
                  Total RM
                </div>
                <div className="text-sm sm:text-base font-black font-mono mt-1 text-slate-900 dark:text-white">
                  {formatCompactRupiah(totalRM)}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                  {totalAlokasi > 0 ? ((totalRM / totalAlokasi) * 100).toFixed(1) : 0}% total
                </div>
              </div>

              {/* 5.4 PNBP */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-bold truncate">
                  PNBP
                </div>
                <div className="text-sm sm:text-base font-black font-mono mt-1 text-slate-900 dark:text-white">
                  {formatCompactRupiah(totalPNBP)}
                </div>
                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                  {totalAlokasi > 0 ? ((totalPNBP / totalAlokasi) * 100).toFixed(1) : 0}% total
                </div>
              </div>

              {/* 5.5 BLU */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-bold truncate">
                  BLU
                </div>
                <div className="text-sm sm:text-base font-black font-mono mt-1 text-slate-900 dark:text-white">
                  {formatCompactRupiah(totalBLU)}
                </div>
                <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
                  {totalAlokasi > 0 ? ((totalBLU / totalAlokasi) * 100).toFixed(1) : 0}% total
                </div>
              </div>

              {/* 5.6 SBSN */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-bold truncate">
                  SBSN
                </div>
                <div className="text-sm sm:text-base font-black font-mono mt-1 text-slate-900 dark:text-white">
                  {formatCompactRupiah(totalSBSN)}
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                  {totalAlokasi > 0 ? ((totalSBSN / totalAlokasi) * 100).toFixed(1) : 0}% total
                </div>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span>
                Belanja Pegawai: {formatRupiah(belanjaPegawaiRM)}
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-teal-500 mr-1.5"></span>
                Alokasi RM (ex. Pegawai): {formatRupiah(alokasiRMExPegawai)}
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-slate-400 mr-1.5"></span>
                Total RM: {formatRupiah(totalRM)}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
