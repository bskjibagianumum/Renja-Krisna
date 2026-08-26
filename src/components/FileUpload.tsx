import React, { useRef, useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  X
} from 'lucide-react';

interface FileUploadProps {
  onFileLoaded: (file: File) => Promise<void>;
  onLoadSample: () => void;
  isLoading: boolean;
  isCompactModal?: boolean;
  onCloseModal?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileLoaded,
  onLoadSample,
  isLoading,
  isCompactModal = false,
  onCloseModal,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processSelectedFile(file);
  };

  const processSelectedFile = async (file: File) => {
    setErrorMessage(null);
    const validExtensions = ['.xlsx', '.xls', '.csv', '.xlsm'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setErrorMessage('Format file tidak didukung. Harap upload file Excel (.xlsx, .xls) atau .csv');
      return;
    }

    try {
      await onFileLoaded(file);
      if (onCloseModal) onCloseModal();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Gagal memproses file Excel. Pastikan format file valid.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processSelectedFile(file);
    }
  };

  const content = (
    <div className="w-full">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        id="excel-file-input"
        accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drag and Drop Zone */}
      <div
        id="excel-drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-emerald-400 hover:bg-slate-50/80 dark:hover:bg-slate-800'
        } ${isLoading ? 'pointer-events-none opacity-70' : ''}`}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm ${
            isDragOver 
              ? 'bg-emerald-600 text-white' 
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
          }`}>
            {isLoading ? (
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
              {isLoading ? 'Membaca dan Memproses File...' : 'Upload File Excel (.xlsx / .xls)'}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Tarik dan lepas (drag & drop) file Excel Anda di sini, atau klik untuk memilih file dari komputer.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 dark:text-slate-500">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">.xlsx</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">.xls</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">.csv</span>
            <span>• Sheet pertama dibaca otomatis</span>
          </div>

          <button
            type="button"
            id="btn-select-file"
            className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Pilih File Excel
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <div>
            <p className="font-semibold">Terjadi Kesalahan</p>
            <p className="text-xs mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Demo sample trigger & Column specs */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3 text-left">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              Gunakan data dummy laporan_renja (87).xlsx?
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Muat data simulasi Renja APBN Kemenperin dengan format resmi dan rasakan fiturnya seketika.
            </p>
          </div>
        </div>
        <button
          type="button"
          id="btn-load-demo-data"
          onClick={() => {
            onLoadSample();
            if (onCloseModal) onCloseModal();
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition-colors shrink-0"
        >
          <FileCheck className="w-4 h-4 mr-1.5" />
          Muat Dummy laporan_renja (87).xlsx
        </button>
      </div>

      {/* Expected Format Legend */}
      <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5 text-left">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
          Kolom yang Didukung Otomatis:
        </p>
        <div className="flex flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-400">
          {[
            'unit eselon1',
            'unit eselon2',
            'type_komponen',
            'sumber_dana',
            'program',
            'kegiatan',
            'kro',
            'ro',
            'propinsi',
            'kabupaten',
            'lokasi ro',
            'komponen',
            'alokasi_komponen_0',
            'target_komponen_0',
          ].map((col) => (
            <span
              key={col}
              className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                col.includes('alokasi') || col.includes('target')
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold'
                  : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300'
              }`}
            >
              {col}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded text-[11px] text-slate-400 dark:text-slate-500 italic">
            + semua kolom kustom lainnya
          </span>
        </div>
      </div>
    </div>
  );

  if (isCompactModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
              <UploadCloud className="w-5 h-5 mr-2 text-emerald-600" />
              Upload File Excel Baru
            </h2>
            {onCloseModal && (
              <button
                onClick={onCloseModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-4 shadow-xs">
          <FileSpreadsheet className="w-9 h-9" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Dashboard Interaktif Analisis Excel
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Unggah data RKA-K/L atau file Excel kustom untuk menganalisis alokasi komponen, target, cascading filter multi-select, serta grafik visualisasi.
        </p>
      </div>

      {content}
    </div>
  );
};
