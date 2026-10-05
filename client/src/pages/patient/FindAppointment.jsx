import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Phone, Calendar, Clock, ArrowRight, Loader2, User, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function FindAppointment() {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      // Check if it looks like a token or phone
      let url = `/api/appointments?search=${encodeURIComponent(query.trim())}`;
      if (/^\d{10}$/.test(query.trim())) {
        url = `/api/appointments?mobile=${query.trim()}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setResults(data.appointments || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6">
      
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-5">
        <h1 className="text-xl font-black text-slate-900 mb-1">
          {t('findMyBooking')}
        </h1>
        <p className="text-xs text-slate-500 mb-4">
          Enter your 10-digit registered mobile number or Token number (e.g. A-027) to retrieve your OPD pass
        </p>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Mobile No or Token (e.g. 9876543219)"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find'}
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Search Results ({results?.length || 0})
          </h2>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
              Searching appointments...
            </div>
          ) : results && results.length > 0 ? (
            results.map((apt) => (
              <div 
                key={apt.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                      {apt.tokenNumber}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{apt.patientName}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {apt.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {apt.timeSlot}
                    </span>
                  </div>
                  <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    apt.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                    apt.status === 'Now Serving' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {apt.status} • {apt.paymentStatus}
                  </span>
                </div>

                <Link
                  to={`/queue?token=${apt.tokenNumber}`}
                  className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1 transition-colors shrink-0 shadow-sm"
                >
                  <span>Track</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500 text-xs">
              No appointments found matching "{query}".
            </div>
          )}
        </div>
      )}

    </div>
  );
}
