import React, { useState } from 'react';
import { 
  Sliders, 
  Check, 
  X, 
  AlertCircle, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { TARGET_FILTER_CONFIGS, ColumnMapping } from '../types';

interface ColumnMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  currentMapping: ColumnMapping;
  alokasiColName: string | null;
  targetColName: string | null;
  onSaveMapping: (
    newMapping: ColumnMapping,
    newAlokasiKey: string | null,
    newTargetKey: string | null
  ) => void;
}

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  isOpen,
  onClose,
  headers,
  currentMapping,
  alokasiColName,
  targetColName,
  onSaveMapping,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>({ ...currentMapping });
  const [alokasiKey, setAlokasiKey] = useState<string | null>(alokasiColName);
  const [targetKey, setTargetKey] = useState<string | null>(targetColName);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveMapping(mapping, alokasiKey, targetKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Pemetaan Kolom Excel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sesuaikan kolom pada file Excel Anda dengan parameter filter dan kalkulasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 custom-scrollbar">
          
          {/* Alokasi & Target Settings */}
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Kolom Perhitungan Agregasi
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kolom Alokasi Anggaran (alokasi_komponen_0)
                </label>
                <select
                  value={alokasiKey || ''}
                  onChange={(e) => setAlokasiKey(e.target.value || null)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-1.5 focus:ring-emerald-500"
                >
                  <option value="">-- Tidak Dipetakan --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kolom Target Output (target_komponen_0)
                </label>
                <select
                  value={targetKey || ''}
                  onChange={(e) => setTargetKey(e.target.value || null)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-1.5 focus:ring-emerald-500"
                >
                  <option value="">-- Tidak Dipetakan --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 10 Filter Column Mappings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              10 Filter Utama
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TARGET_FILTER_CONFIGS.map((cfg) => {
                const selectedHeader = mapping[cfg.key] || '';
                return (
                  <div key={cfg.key} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {cfg.label} <span className="text-slate-400 font-mono text-[10px]">({cfg.key})</span>
                    </label>
                    <select
                      value={selectedHeader}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMapping((prev) => {
                          const next = { ...prev };
                          if (val) next[cfg.key] = val;
                          else delete next[cfg.key];
                          return next;
                        });
                      }}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:ring-1.5 focus:ring-emerald-500"
                    >
                      <option value="">-- Tidak Terdeteksi --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Pemetaan</span>
          </button>
        </div>

      </div>
    </div>
  );
};
