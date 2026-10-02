import React, { useState, useRef, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  RotateCcw, 
  UploadCloud, 
  Moon, 
  Sun, 
  Sparkles,
  Layers,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { FileMetadata, AuthUser } from '../types';
import { formatFileSize } from '../utils/formatters';

interface NavbarProps {
  metadata: FileMetadata | null;
  onUploadClick: () => void;
  onLoadSample: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSheetChange?: (sheetName: string) => void;
  currentUser: AuthUser | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  metadata,
  onUploadClick,
  onLoadSample,
  onResetFilters,
  hasActiveFilters,
  darkMode,
  onToggleDarkMode,
  onSheetChange,
  currentUser,
  onOpenLoginModal,
  onLogout
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <header id="app-navbar" className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand & File Info */}
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/30">
                <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Dashboard dan Analisis
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  Renja KRISNA
                </span>
              </div>
              {metadata ? (
                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[160px] sm:max-w-xs" title={metadata.fileName}>
                    {metadata.fileName}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(metadata.fileSize)}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {metadata.totalRows.toLocaleString('id-ID')} baris
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Multi-Select Cascading Filter & Agregasi Anggaran
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Sheet Selector (if multiple sheets exist) */}
            {metadata && metadata.sheetNames.length > 1 && onSheetChange && (
              <div className="hidden md:flex items-center space-x-1.5 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-1 rounded-xl">
                <Layers className="w-4 h-4 text-slate-400 ml-1.5" />
                <select
                  id="sheet-selector"
                  value={metadata.activeSheet}
                  onChange={(e) => onSheetChange(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none pr-2 py-1 cursor-pointer"
                  title="Pilih Sheet Excel"
                >
                  {metadata.sheetNames.map((sheet) => (
                    <option key={sheet} value={sheet} className="dark:bg-slate-800">
                      {sheet}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reset Filters Shortcut */}
            {metadata && (
              <button
                type="button"
                id="btn-navbar-reset-filter"
                onClick={onResetFilters}
                disabled={!hasActiveFilters}
                className={`inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  hasActiveFilters
                    ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 shadow-xs cursor-pointer active:scale-95'
                    : 'text-slate-400 dark:text-slate-600 bg-slate-100/50 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-800/50 cursor-not-allowed opacity-50'
                }`}
                title="Kembalikan semua filter ke kondisi awal"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Reset Filter</span>
              </button>
            )}

            {/* Load Sample Data Button */}
            <button
              type="button"
              id="btn-navbar-load-sample"
              onClick={onLoadSample}
              className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Muat data sampel simulasi"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500 dark:text-indigo-400" />
              <span className="hidden sm:inline">Data Sampel</span>
              <span className="sm:hidden">Sampel</span>
            </button>

            {/* Upload Excel Button */}
            <button
              type="button"
              id="btn-navbar-upload"
              onClick={onUploadClick}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
              title="Upload file Excel (.xlsx / .xls)"
            >
              <UploadCloud className="w-4 h-4 mr-1.5" />
              <span>Upload Excel</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              id="btn-toggle-darkmode"
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              aria-label="Toggle theme"
              title={darkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Vertical Separator */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

            {/* User Login Menu / Profile Dropdown */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  id="btn-user-profile-menu"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 transition-all cursor-pointer text-left shadow-2xs"
                  title="Menu Pengguna Renja KRISNA"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    SJ
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                      {currentUser.displayName}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>@{currentUser.username}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Card */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95">
                    {/* User Header Profile */}
                    <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-emerald-500/20">
                          SJ
                        </div>
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {currentUser.displayName}
                          </h4>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                            @{currentUser.username}
                          </p>
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Aktif & Terverifikasi
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="px-4 py-2.5 space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold block">Peran / Hak Akses</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {currentUser.role}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold block">Unit Kerja</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {currentUser.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500">
                        <span>Waktu Masuk</span>
                        <span className="font-mono">{currentUser.loginAt}</span>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <div className="px-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        id="btn-logout"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                id="btn-navbar-login"
                onClick={onOpenLoginModal}
                className="inline-flex items-center px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs active:scale-95 transition-all cursor-pointer"
                title="Masuk sebagai user Renja KRISNA"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                <span>Login</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
