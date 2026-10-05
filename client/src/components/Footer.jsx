import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, QrCode, Search, CalendarPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-slate-200 mt-12 pb-20 sm:pb-8 text-slate-600 text-xs">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">Sanjeevani Health & Family Clinic</h4>
            <p className="text-slate-500 mb-3 leading-relaxed">
              Dr. Rahul Sharma (MBBS, MD) — Dedicated to compassionate family healthcare, zero-wait OPD booking, and real-time live queue tracking.
            </p>
            <div className="flex items-center gap-2 text-brand-700 font-medium">
              <Phone className="w-3.5 h-3.5" />
              <span>+91 98765 43210</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">{t('clinicTimings')}</h4>
            <div className="space-y-1.5 text-slate-500">
              <p><span className="font-medium text-slate-700">Mon - Sat:</span> 10:00 AM – 2:00 PM</p>
              <p><span className="font-medium text-slate-700">Evening:</span> 5:00 PM – 8:00 PM</p>
              <p className="text-rose-600 font-medium">Sunday: Closed</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-2">{t('clinicAddress')}</h4>
            <p className="text-slate-500 leading-relaxed flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>Shop 4, Ground Floor, Royal Arcade, Near Metro Gate 2, City Center</span>
            </p>
            <div className="mt-3">
              <Link 
                to="/find" 
                className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-800 font-semibold text-xs"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t('findMyBooking')}</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <p>© 2026 Sanjeevani Clinic. QR Code OPD & Queue Management System.</p>
          <div className="flex items-center gap-4">
            <Link to="/queue" className="hover:text-brand-600 transition-colors">Live Queue</Link>
            <Link to="/book" className="hover:text-brand-600 transition-colors">Book OPD</Link>
            <Link to="/admin/login" className="hover:text-brand-600 transition-colors">Staff Portal</Link>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Quick Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-around shadow-lg">
        <Link 
          to="/book" 
          className="flex flex-col items-center text-xs font-semibold text-brand-600"
        >
          <CalendarPlus className="w-5 h-5 mb-0.5" />
          <span>{t('bookAppointment')}</span>
        </Link>
        <Link 
          to="/queue" 
          className="flex flex-col items-center text-xs font-semibold text-slate-600 hover:text-brand-600"
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span>{t('trackAppointment')}</span>
        </Link>
        <Link 
          to="/find" 
          className="flex flex-col items-center text-xs font-semibold text-slate-600 hover:text-brand-600"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Search</span>
        </Link>
      </div>
    </footer>
  );
}
