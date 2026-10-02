import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  FileSpreadsheet,
  Sun,
  Moon
} from 'lucide-react';
import { AuthUser } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  darkMode,
  onToggleDarkMode
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMsg('Harap masukkan username dan kata sandi.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (cleanUsername.toLowerCase() === 'setiyo_jatmiko' && cleanPassword === '@Renjakrisna') {
        const user: AuthUser = {
          username: 'setiyo_jatmiko',
          displayName: 'Setiyo Jatmiko',
          role: 'Administrator Perencanaan & Anggaran',
          unit: 'BSKJI - Kementerian Perindustrian',
          loginAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        
        setSuccess(true);
        setIsSubmitting(false);

        setTimeout(() => {
          onLoginSuccess(user);
        }, 500);
      } else {
        setIsSubmitting(false);
        setErrorMsg('Username atau kata sandi tidak sesuai. Silakan periksa kembali.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Decorative ambient background blur lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-0"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none -z-0"></div>

      {/* Top Bar Navigation */}
      <header className="w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                Dashboard dan Analisis Renja KRISNA
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Badan Standardisasi dan Kebijakan Jasa Industri (BSKJI)
              </div>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            aria-label="Toggle theme"
            title={darkMode ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Login Centerpiece */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10 my-4">
        <div className="w-full max-w-md">
          
          {/* Card Container */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden transition-all">
            
            {/* Header Badge & Title */}
            <div className="p-6 sm:p-8 pb-4 text-center border-b border-slate-100 dark:border-slate-800/70 bg-gradient-to-b from-slate-50/70 to-transparent dark:from-slate-800/30">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/25 mb-4 ring-4 ring-emerald-500/10">
                <ShieldCheck className="w-7 h-7" />
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Menu Login
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                Silakan masuk untuk mengakses dasbor analisis anggaran dan matriks Renja KRISNA.
              </p>
            </div>

            {/* Form Area */}
            <div className="p-6 sm:p-8 pt-6 space-y-4">
              
              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start space-x-2.5 text-xs text-rose-700 dark:text-rose-300 animate-shake">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                  <span className="font-semibold">Login berhasil! Mengalihkan ke sistem...</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Username Input */}
                <div>
                  <label 
                    htmlFor="screen-login-username" 
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="screen-login-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username..."
                      disabled={isSubmitting || success}
                      autoComplete="username"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-2xs"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label 
                    htmlFor="screen-login-password" 
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="screen-login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      disabled={isSubmitting || success}
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-2xs font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Option */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                    <span>Ingat sesi di perangkat ini</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="btn-screen-submit-login"
                  disabled={isSubmitting || success}
                  className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Memverifikasi Kredensial...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      <span>Masuk ke Dashboard</span>
                    </>
                  )}
                </button>

              </form>

            </div>

            {/* Feature Highlights Footer inside Card */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Portal Renja Terintegrasi</span>
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Kemenperin RI
              </span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md py-4 text-center text-xs text-slate-500 dark:text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <span>Badan Standardisasi dan Kebijakan Jasa Industri (BSKJI) • Kementerian Perindustrian</span>
          <span>Sistem Analisis Renja KRISNA</span>
        </div>
      </footer>
    </div>
  );
};
