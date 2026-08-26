import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { 
  BarChart2, 
  PieChart as PieIcon, 
  MapPin, 
  Building2, 
  Building,
  Coins,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ExcelRow, ColumnMapping } from '../types';
import { formatCompactRupiah, formatRupiah, formatNumber } from '../utils/formatters';

interface AnalyticsChartsProps {
  data: ExcelRow[];
  columnMapping: ColumnMapping;
  alokasiColName: string | null;
  targetColName: string | null;
}

const COLOR_PALETTE = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#d97706', // Amber
  '#7c3aed', // Purple
  '#e11d48', // Rose
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
  '#ea580c', // Orange
  '#10b981', // Light Emerald
  '#6366f1', // Light Indigo
];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  data,
  columnMapping,
  alokasiColName,
  targetColName,
}) => {
  const [activeTab, setActiveTab] = useState<'program' | 'sumber' | 'eselon1' | 'tipe' | 'eselon' | 'propinsi'>('program');
  const [isExpanded, setIsExpanded] = useState(true);

  const alokasiKey = alokasiColName ? `__numeric_${alokasiColName}` : null;
  const targetKey = targetColName ? `__numeric_${targetColName}` : null;

  // 1. Alokasi per Program
  const programData = useMemo(() => {
    const col = columnMapping['program'];
    if (!col) return [];

    const map = new Map<string, { alokasi: number; target: number; count: number }>();
    data.forEach((row) => {
      const prog = String(row[col] || 'Lainnya').trim();
      const alokasi = (alokasiKey && row[alokasiKey]) || (alokasiColName ? Number(row[alokasiColName]) || 0 : 0);
      const target = (targetKey && row[targetKey]) || (targetColName ? Number(row[targetColName]) || 0 : 0);

      const existing = map.get(prog) || { alokasi: 0, target: 0, count: 0 };
      map.set(prog, {
        alokasi: existing.alokasi + alokasi,
        target: existing.target + target,
        count: existing.count + 1,
      });
    });

    return Array.from(map.entries())
      .map(([name, val]) => ({
        name: name.length > 28 ? name.substring(0, 26) + '...' : name,
        fullName: name,
        alokasi: val.alokasi,
        target: val.target,
        count: val.count,
      }))
      .sort((a, b) => b.alokasi - a.alokasi);
  }, [data, columnMapping, alokasiKey, alokasiColName, targetKey, targetColName]);

  // 2. Alokasi per Sumber Dana
  const sumberDanaData = useMemo(() => {
    const col = columnMapping['sumber_dana'];
    if (!col) return [];

    const map = new Map<string, { alokasi: number; count: number }>();
    data.forEach((row) => {
      const sumber = String(row[col] || 'Tanpa Keterangan').trim();
      const alokasi = (alokasiKey && row[alokasiKey]) || (alokasiColName ? Number(row[alokasiColName]) || 0 : 0);

      const existing = map.get(sumber) || { alokasi: 0, count: 0 };
      map.set(sumber, {
        alokasi: existing.alokasi + alokasi,
        count: existing.count + 1,
      });
    });

    return Array.from(map.entries())
      .map(([name, val]) => ({
        name,
        alokasi: val.alokasi,
        count: val.count,
      }))
      .sort((a, b) => b.alokasi - a.alokasi);
  }, [data, columnMapping, alokasiKey, alokasiColName]);

  // 3. Alokasi per Unit Eselon 1
  const eselon1Data = useMemo(() => {
    const col = columnMapping['unit_eselon1'];
    if (!col) return [];

    const map = new Map<string, { alokasi: number; count: number }>();
    data.forEach((row) => {
      const unit = String(row[col] || 'Lainnya').trim();
      const alokasi = (alokasiKey && row[alokasiKey]) || (alokasiColName ? Number(row[alokasiColName]) || 0 : 0);

      const existing = map.get(unit) || { alokasi: 0, count: 0 };
      map.set(unit, {
        alokasi: existing.alokasi + alokasi,
        count: existing.count + 1,
      });
    });

    return Array.from(map.entries())
      .map(([name, val]) => ({
        name: name.length > 25 ? name.substring(0, 23) + '...' : name,
        fullName: name,
        alokasi: val.alokasi,
        count: val.count,
      }))
      .sort((a, b) => b.alokasi - a.alokasi);
  }, [data, columnMapping, alokasiKey, alokasiColName]);

  // 4. Alokasi per Tipe Komponen
  const tipeData = useMemo(() => {
    const col = columnMapping['type_komponen'];
    if (!col) return [];

    const map = new Map<string, { alokasi: number; count: number }>();
    data.forEach((row) => {
      const tipe = String(row[col] || 'Tanpa Tipe').trim();
      const alokasi = (alokasiKey && row[alokasiKey]) || (alokasiColName ? Number(row[alokasiColName]) || 0 : 0);

      const existing = map.get(tipe) || { alokasi: 0, count: 0 };
      map.set(tipe, {
        alokasi: existing.alokasi + alokasi,
        count: existing.count + 1,
      });
    });

    return Array.from(map.entries())
      .map(([name, val]) => ({
        name,
        alokasi: val.alokasi,
        count: val.count,
      }))
      .sort((a, b) => b.alokasi - a.alokasi);
  }, [data, columnMapping, alokasiKey, alokasiColName]);

  // 5. Alokasi per Unit Eselon 2
  const eselonData = useMemo(() => {
    const col = columnMapping['unit_eselon2'];
    if (!col) return [];

    const map = new Map<string, { alokasi: number; count: number }>();
    data.forEach((row) => {
      const unit = String(row[col] || 'Lainnya').trim();
      const alokasi = (alokasiKey && row[alokasiKey]) || (alokasiColName ? Number(row[alokasiColName]) || 0 : 0);

      const existing = map.get(unit) || { alokasi: 0, count: 0 };
      map.set(unit, {
        alokasi: existing.alokasi + alokasi,
        count: existing.count + 1,
      });
    });

    return Array.from(map.entries())
      .map(([name, val]) => ({
        name: name.length > 25 ? name.substring(0, 23) + '...' : name,
        fullName: name,
        alokasi: val.alokasi,
        count: val.count,
      }))
      .sort((a, b) => b.alokasi - a.alokasi)
      .slice(0, 8);
  }, [data, columnMapping, alokasiKey, alokasiColName]);

  // 6. Alokasi per Propinsi
  const propinsiData = useMemo(() => {
    const col = columnMapping['propinsi'];
    if (!col) return [];

    const map = new Map<string, { alokasi: number; count: number }>();
    data.forEach((row) => {
      const prop = String(row[col] || 'Lainnya').trim();
      const alokasi = (alokasiKey && row[alokasiKey]) || (alokasiColName ? Number(row[alokasiColName]) || 0 : 0);

      const existing = map.get(prop) || { alokasi: 0, count: 0 };
      map.set(prop, {
        alokasi: existing.alokasi + alokasi,
        count: existing.count + 1,
      });
    });

    return Array.from(map.entries())
      .map(([name, val]) => ({
        name,
        alokasi: val.alokasi,
        count: val.count,
      }))
      .sort((a, b) => b.alokasi - a.alokasi)
      .slice(0, 8);
  }, [data, columnMapping, alokasiKey, alokasiColName]);

  if (data.length === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700 max-w-xs">
          <p className="font-bold text-slate-100 mb-1">{item.fullName || item.name}</p>
          <div className="space-y-1">
            <p className="flex justify-between text-emerald-400 font-semibold">
              <span>Alokasi:</span>
              <span className="ml-3">{formatRupiah(item.alokasi)}</span>
            </p>
            {item.target !== undefined && (
              <p className="flex justify-between text-blue-300">
                <span>Target:</span>
                <span className="ml-3">{formatNumber(item.target)}</span>
              </p>
            )}
            <p className="flex justify-between text-slate-400">
              <span>Frekuensi Data:</span>
              <span className="ml-3">{item.count} baris</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section id="charts-section" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      
      {/* Header & Tabs */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Visualisasi Analitik Alokasi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grafik interaktif distribusi anggaran komponen berdasarkan data terpilih
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart Tab Selector */}
          <div className="flex flex-wrap items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium gap-1">
            <button
              id="tab-chart-program"
              onClick={() => { setActiveTab('program'); setIsExpanded(true); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'program'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Program</span>
            </button>

            <button
              id="tab-chart-sumber"
              onClick={() => { setActiveTab('sumber'); setIsExpanded(true); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'sumber'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Sumber Dana</span>
            </button>

            <button
              id="tab-chart-eselon1"
              onClick={() => { setActiveTab('eselon1'); setIsExpanded(true); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'eselon1'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Eselon 1</span>
            </button>

            <button
              id="tab-chart-tipe"
              onClick={() => { setActiveTab('tipe'); setIsExpanded(true); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'tipe'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Tipe</span>
            </button>

            <button
              id="tab-chart-eselon"
              onClick={() => { setActiveTab('eselon'); setIsExpanded(true); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'eselon'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Eselon 2</span>
            </button>

            <button
              id="tab-chart-propinsi"
              onClick={() => { setActiveTab('propinsi'); setIsExpanded(true); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'propinsi'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Propinsi</span>
            </button>
          </div>

          {/* Expand/Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Sembunyikan Grafik' : 'Tampilkan Grafik'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {isExpanded && (
        <div className="p-4 sm:p-6">
          
          {activeTab === 'program' && (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Alokasi Anggaran Berdasarkan Program</span>
                <span>Satuan: Rupiah</span>
              </div>
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={programData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 11 }} height={45} />
                    <YAxis tickFormatter={(val) => formatCompactRupiah(val)} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="alokasi" fill="#059669" radius={[6, 6, 0, 0]} name="Alokasi Komponen" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'sumber' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sumberDanaData}
                      dataKey="alokasi"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {sumberDanaData.map((entry, index) => (
                        <Cell key={`cell-sumber-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Proporsi Sumber Dana
                </h4>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {sumberDanaData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate pr-2">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length] }} 
                        />
                        <span className="truncate text-slate-700 dark:text-slate-300" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                        {formatCompactRupiah(item.alokasi)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eselon1' && (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Alokasi Anggaran Berdasarkan Unit Eselon 1</span>
                <span>Satuan: Rupiah</span>
              </div>
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eselon1Data} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" tickFormatter={(val) => formatCompactRupiah(val)} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="alokasi" fill="#7c3aed" radius={[0, 6, 6, 0]} name="Alokasi Komponen" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'tipe' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tipeData}
                      dataKey="alokasi"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                    >
                      {tipeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Proporsi Tipe Komponen
                </h4>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                  {tipeData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate pr-2">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: COLOR_PALETTE[idx % COLOR_PALETTE.length] }} 
                        />
                        <span className="truncate text-slate-700 dark:text-slate-300" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                        {formatCompactRupiah(item.alokasi)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'eselon' && (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Top Unit Eselon 2 berdasarkan Alokasi</span>
                <span>Satuan: Rupiah</span>
              </div>
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={eselonData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" tickFormatter={(val) => formatCompactRupiah(val)} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="alokasi" fill="#2563eb" radius={[0, 6, 6, 0]} name="Alokasi Komponen" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'propinsi' && (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Distribusi Alokasi Berdasarkan Propinsi</span>
                <span>Satuan: Rupiah</span>
              </div>
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={propinsiData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 11 }} height={45} />
                    <YAxis tickFormatter={(val) => formatCompactRupiah(val)} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="alokasi" fill="#d97706" radius={[6, 6, 0, 0]} name="Alokasi Komponen" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      )}

    </section>
  );
};

