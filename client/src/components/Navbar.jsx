import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, ShieldCheck, Languages, UserCheck, Stethoscope, QrCode } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { lang, toggleLang, t } = useLanguage();
  const { isAuthenticated, logout, user } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-base leading-tight tracking-tight">
                Sanjeevani Clinic
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                OPD LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-tight">
              Dr. Rahul Sharma • General Physician
            </p>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Socket live indicator */}
          <div 
            title={connected ? "Real-time queue sync active" : "Reconnecting to server..."}
            className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
          >
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-[11px]">{connected ? 'Live Sync' : 'Connecting'}</span>
          </div>

          {/* Hindi / English Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            title="Toggle Hindi / English"
          >
            <Languages className="w-3.5 h-3.5 text-brand-600" />
            <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* Admin link or Dashboard */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/admin/dashboard"
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Desk
              </Link>
              <button
                onClick={logout}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-brand-700 hover:bg-slate-100 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">{t('adminLogin')}</span>
            </Link>
          )}

        </div>
      </div>
    </header>
  );
}
