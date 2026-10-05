import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarPlus, 
  Clock, 
  MapPin, 
  Phone, 
  Award, 
  ShieldCheck, 
  Star, 
  ArrowRight, 
  Users, 
  Activity, 
  QrCode,
  CheckCircle,
  Stethoscope,
  HeartPulse
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';

export default function LandingPage() {
  const { t } = useLanguage();
  const { queueStatus, connected } = useSocket();
  const [clinicData, setClinicData] = useState(null);

  useEffect(() => {
    fetch('/api/clinic')
      .then(res => res.json())
      .then(data => setClinicData(data))
      .catch(err => console.error('Failed to load clinic data:', err));
  }, []);

  const doctor = clinicData?.doctor || {
    name: "Dr. Rahul Sharma",
    specialization: "General Physician & Consultant",
    qualification: "MBBS, MD (General Medicine)",
    fee: 500
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Clinic Hero Banner */}
      <div className="bg-gradient-to-br from-brand-700 via-brand-800 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-brand-900/20 relative overflow-hidden">
        
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-teal-400/10 rounded-full blur-xl pointer-events-none"></div>

        {/* Clinic Header */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              OPD OPEN NOW
            </span>
            <span className="text-xs text-brand-200/80 font-medium">Room 102</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Sanjeevani Clinic
          </h1>
          <p className="text-sm text-teal-100 font-medium mt-1">
            {t('clinicTagline')}
          </p>

          {/* Doctor Profile Card */}
          <div className="mt-5 pt-4 border-t border-white/15 flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-teal-300 shadow-inner">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                {doctor.name}
              </h2>
              <p className="text-xs text-teal-200 font-medium">{doctor.specialization}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-white/80">
                <span className="flex items-center gap-1 font-semibold text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> 4.9 (420+)
                </span>
                <span>•</span>
                <span>12+ Yrs Exp</span>
              </div>
            </div>
          </div>

          {/* Quick Fee Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs">
            <span className="text-teal-200">{t('consultationFee')}:</span>
            <span className="font-extrabold text-white text-sm">₹{doctor.fee}</span>
            <span className="text-white/60 text-[10px]">(Pay online or at clinic)</span>
          </div>
        </div>
      </div>

      {/* Live OPD Queue Status Pill */}
      <div className="mt-4 bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-brand-600">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              {t('liveOpdStatus')}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">{t('nowServing')}:</span>
              <span className="text-base font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-200">
                {queueStatus.currentToken || 'A-021'}
              </span>
            </div>
          </div>
        </div>

        <Link
          to="/queue"
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-xl transition-colors"
        >
          <span>Live Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Primary Mobile Action Buttons (User Friendly & Large) */}
      <div className="mt-5 space-y-3">
        
        {/* Book Appointment CTA */}
        <Link
          to="/book"
          className="group w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-700 hover:to-teal-600 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-brand-500/25 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="leading-tight font-extrabold">{t('bookAppointment')}</p>
              <p className="text-xs text-teal-100 font-medium">Select symptoms, slot & get token</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Track Live Queue CTA */}
        <Link
          to="/queue"
          className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 active:scale-[0.99] border-2 border-slate-200 text-slate-800 font-bold text-sm shadow-xs flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="leading-tight font-bold">{t('trackAppointment')}</p>
              <p className="text-[11px] text-slate-500 font-normal">Check currently serving token & wait time</p>
            </div>
          </div>
          <span className="text-xs text-brand-600 font-semibold">View →</span>
        </Link>

      </div>

      {/* Clinic Details & Timings Card */}
      <div className="mt-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-brand-600" />
          <span>Clinic Information</span>
        </h3>

        <div className="space-y-3 text-xs text-slate-600">
          
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">{t('clinicTimings')}</p>
              <p>Morning: 10:00 AM – 2:00 PM</p>
              <p>Evening: 5:00 PM – 8:00 PM (Mon – Sat)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">{t('clinicAddress')}</p>
              <p className="leading-relaxed">Shop 4, Ground Floor, Royal Arcade, Near Metro Gate 2, City Center</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Clinic Helpline</p>
              <p className="font-bold text-brand-700">+91 98765 43210</p>
            </div>
          </div>

        </div>

      </div>

      {/* QR Code Scanned Notice */}
      <div className="mt-5 p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
          <QrCode className="w-4 h-4" />
        </div>
        <p className="text-xs text-teal-900 font-medium">
          You are viewing the mobile appointment portal. No app download is required!
        </p>
      </div>

    </div>
  );
}
