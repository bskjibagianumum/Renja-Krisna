import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { FileUpload } from './components/FileUpload';
import { FilterPanel } from './components/FilterPanel';
import { SummaryCards } from './components/SummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { DataTable } from './components/DataTable';
import { ColumnMappingModal } from './components/ColumnMappingModal';
import { LoginModal } from './components/LoginModal';
import { useFilterEngine } from './hooks/useFilterEngine';
import { ExcelRow, FileMetadata, ColumnMapping, AuthUser } from './types';
import { parseExcelFile, parseSampleData } from './utils/excelParser';
import { SAMPLE_EXCEL_DATA } from './utils/sampleData';
import { Sliders, RefreshCw, UploadCloud, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [alokasiKey, setAlokasiKey] = useState<string | null>(null);
  const [targetKey, setTargetKey] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [workbook, setWorkbook] = useState<any>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showMappingModal, setShowMappingModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [authNotification, setAuthNotification] = useState<string | null>(null);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('krisna_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('krisna_auth_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setAuthNotification(`Selamat datang, ${user.displayName}! Anda berhasil masuk.`);
    setTimeout(() => setAuthNotification(null), 4000);
  };

  const handleLogout = () => {
    const prevName = currentUser?.displayName || 'Pengguna';
    setCurrentUser(null);
    try {
      localStorage.removeItem('krisna_auth_user');
    } catch (e) {
      console.error(e);
    }
    setAuthNotification(`Sesi kerja ${prevName} telah diakhiri.`);
    setTimeout(() => setAuthNotification(null), 3000);
  };

  // Dark mode class toggle
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Use the Filter Engine
  const {
    filterState,
    filteredData,
    filterOptionsMap,
    summaryStats,
    activeFiltersCount,
    setFilterValues,
    toggleFilterValue,
    resetFilters,
  } = useFilterEngine(data, columnMapping, alokasiKey, targetKey);

  // Handle Uploading a new File
  const handleFileLoaded = async (file: File) => {
    setIsLoading(true);
    try {
      setCurrentFile(file);
      const parsed = await parseExcelFile(file);
      setData(parsed.data);
      setHeaders(parsed.headers);
      setColumnMapping(parsed.columnMapping);
      setAlokasiKey(parsed.alokasiKey);
      setTargetKey(parsed.targetKey);
      setMetadata(parsed.metadata);
      setWorkbook(parsed.workbook);
      resetFilters();
      setShowUploadModal(false);
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sheet Change
  const handleSheetChange = async (sheetName: string) => {
    if (!currentFile && !metadata) return;
    setIsLoading(true);
    try {
      if (currentFile) {
        const parsed = await parseExcelFile(currentFile, sheetName);
        setData(parsed.data);
        setHeaders(parsed.headers);
        setColumnMapping(parsed.columnMapping);
        setAlokasiKey(parsed.alokasiKey);
        setTargetKey(parsed.targetKey);
        setMetadata(parsed.metadata);
        setWorkbook(parsed.workbook);
        resetFilters();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Load Sample Data
  const handleLoadSample = () => {
    setIsLoading(true);
    setCurrentFile(null);
    setTimeout(() => {
      const parsed = parseSampleData(SAMPLE_EXCEL_DATA);
      setData(parsed.data);
      setHeaders(parsed.headers);
      setColumnMapping(parsed.columnMapping);
      setAlokasiKey(parsed.alokasiKey);
      setTargetKey(parsed.targetKey);
      setMetadata(parsed.metadata);
      setWorkbook(parsed.workbook);
      resetFilters();
      setIsLoading(false);
    }, 150);
  };

  // Save manual column mapping
  const handleSaveMapping = (
    newMapping: ColumnMapping,
    newAlokasiKey: string | null,
    newTargetKey: string | null
  ) => {
    setColumnMapping(newMapping);
    setAlokasiKey(newAlokasiKey);
    setTargetKey(newTargetKey);

    // Recompute numeric helper fields
    setData((prev) =>
      prev.map((row) => {
        const clean = { ...row };
        if (newAlokasiKey && clean[newAlokasiKey] !== undefined) {
          clean[`__numeric_${newAlokasiKey}`] = Number(clean[newAlokasiKey]) || 0;
        }
        if (newTargetKey && clean[newTargetKey] !== undefined) {
          clean[`__numeric_${newTargetKey}`] = Number(clean[newTargetKey]) || 0;
        }
        return clean;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Navigation */}
      <Navbar
        metadata={metadata}
        onUploadClick={() => setShowUploadModal(true)}
        onLoadSample={handleLoadSample}
        onResetFilters={resetFilters}
        hasActiveFilters={activeFiltersCount > 0}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onSheetChange={handleSheetChange}
        currentUser={currentUser}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />

      {/* Floating Notification Toast */}
      {authNotification && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center space-x-2.5 px-4 py-3 rounded-2xl bg-slate-900/90 dark:bg-slate-100/95 text-white dark:text-slate-900 shadow-xl border border-slate-700/50 dark:border-slate-300 backdrop-blur-md text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
            <span>{authNotification}</span>
          </div>
        </div>
      )}

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {data.length === 0 ? (
          /* Empty State / Initial Upload View */
          <div className="mt-8">
            <FileUpload
              onFileLoaded={handleFileLoaded}
              onLoadSample={handleLoadSample}
              isLoading={isLoading}
            />
          </div>
        ) : (
          /* Active Dashboard View */
          <>
            {/* Quick Utility Bar: File Name, Configure Mapping, Upload Again */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-slate-500 dark:text-slate-400">File Aktif:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {metadata?.fileName || 'Data Excel'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-300">
                  {data.length.toLocaleString('id-ID')} baris data dimuat
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowMappingModal(true)}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors font-medium"
                  title="Sesuaikan pemetaan nama kolom"
                >
                  <Sliders className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  <span>Pemetaan Kolom</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 font-semibold transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5 mr-1" />
                  <span>Ganti File Excel</span>
                </button>
              </div>
            </div>

            {/* 1. Cascading Filter Section */}
            <FilterPanel
              columnMapping={columnMapping}
              filterState={filterState}
              filterOptionsMap={filterOptionsMap}
              activeFiltersCount={activeFiltersCount}
              onSetFilterValues={setFilterValues}
              onToggleFilterValue={toggleFilterValue}
              onResetFilters={resetFilters}
            />

            {/* 2. Summary Cards Section */}
            <SummaryCards
              stats={summaryStats}
              alokasiColName={alokasiKey}
              targetColName={targetKey}
            />

            {/* 3. Analytical Charts Section */}
            <AnalyticsCharts
              data={filteredData}
              columnMapping={columnMapping}
              alokasiColName={alokasiKey}
              targetColName={targetKey}
            />

            {/* 4. Interactive Data Table Section */}
            <DataTable
              data={filteredData}
              headers={headers}
              alokasiColName={alokasiKey}
              targetColName={targetKey}
              fileName={metadata?.fileName || 'data_komponen'}
            />
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Excel Dashboard & Filter Analisis • Pemrosesan Client-Side dengan SheetJS</span>
          <span>Dibuat dengan Google AI Studio</span>
        </div>
      </footer>

      {/* Upload File Modal (when triggered from navbar/body) */}
      {showUploadModal && (
        <FileUpload
          onFileLoaded={handleFileLoaded}
          onLoadSample={handleLoadSample}
          isLoading={isLoading}
          isCompactModal={true}
          onCloseModal={() => setShowUploadModal(false)}
        />
      )}

      {/* Column Mapping Modal */}
      <ColumnMappingModal
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        headers={headers}
        currentMapping={columnMapping}
        alokasiColName={alokasiKey}
        targetColName={targetKey}
        onSaveMapping={handleSaveMapping}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
