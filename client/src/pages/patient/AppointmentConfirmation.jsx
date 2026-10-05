import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Clock,
  Calendar,
  User,
  Phone,
  AlertTriangle,
  ArrowRight,
  Share2,
  Printer,
  Stethoscope,
  Sparkles,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';

export default function AppointmentConfirmation() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    // Fetch appointment by ID
    fetch(`/api/appointments/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.appointment) setAppointment(data.appointment);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500 text-sm">
        Loading appointment pass...
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-slate-200 text-center">
        <h3 className="font-bold text-slate-800 text-base mb-2">Appointment Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">We could not locate this appointment slip.</p>
        <Link to="/" className="text-xs font-semibold text-brand-600 hover:underline">
          Return to Clinic Home
        </Link>
      </div>
    );
  }

  const isPaid = appointment.paymentStatus === 'PAID';

  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6">

      {/* Success Badge */}
      <div className="text-center mb-5">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner ring-4 ring-emerald-50">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          {t('appointmentConfirmed')}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Your OPD booking has been registered in the clinic system
        </p>
      </div>

      {/* Main Token Pass Slip */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden relative">

        {/* Token Header Banner */}
        <div className="bg-gradient-to-r from-brand-700 to-teal-600 p-6 text-white text-center relative">
          <p className="text-xs uppercase font-extrabold tracking-widest text-teal-200">
            {t('yourToken')}
          </p>
          <div className="mt-1 inline-block bg-white text-brand-900 font-black text-4xl sm:text-5xl px-6 py-2 rounded-2xl shadow-lg shadow-brand-900/20 tracking-wider">
            {appointment.tokenNumber}
          </div>
          <p className="text-[11px] text-teal-100 mt-2 font-medium">
            Please show this token number at the reception desk
          </p>
        </div>

        {/* Jagged / Ticket Divider */}
        <div className="relative h-4 bg-slate-100 flex items-center justify-between px-2">
          <div className="w-4 h-4 bg-slate-50 rounded-full -ml-4 border border-slate-200"></div>
          <div className="flex-1 border-b-2 border-dashed border-slate-300 mx-2"></div>
          <div className="w-4 h-4 bg-slate-50 rounded-full -mr-4 border border-slate-200"></div>
        </div>

        {/* Appointment Details Body */}
        <div className="p-6 space-y-4">

          {/* Patient & Doctor */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('patient')}</span>
              <p className="font-extrabold text-slate-800 text-sm">{appointment.patientName}</p>
              <p className="text-slate-500">{appointment.age} yrs, {appointment.gender}</p>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('doctor')}</span>
              <p className="font-extrabold text-slate-800 text-sm">Dr. Rahul Sharma</p>
              <p className="text-slate-500">General Physician</p>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span className="font-semibold text-slate-800">
                {new Date(appointment.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-brand-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5" />
              <span>{appointment.timeSlot}</span>
            </div>
          </div>

          {/* Payment Status Box */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${isPaid
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}>
            {isPaid ? (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Wallet className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <p className="font-bold flex items-center gap-1.5">
                <span>{isPaid ? 'Payment Successful (PAID)' : 'Pay at Clinic (Pending)'}</span>
                <span className="font-extrabold">₹{appointment.amount || 500}</span>
              </p>
              <p className="text-[11px] mt-0.5 opacity-90 leading-tight">
                {isPaid
                  ? 'Consultation fee paid online. Direct entry when token called.'
                  : 'Please pay ₹500 at the reception desk with Cash or UPI before meeting the doctor.'}
              </p>
            </div>
          </div>

          {/* Symptoms summary */}
          <div className="text-xs border-t border-slate-100 pt-3">
            <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Symptoms / Problem</span>
            <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              "{appointment.problemDescription}"
            </p>
          </div>

        </div>

        {/* Slip Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200/80 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>

          <Link
            to={`/queue?token=${appointment.tokenNumber}`}
            className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5 transition-all text-center"
          >
            <span>{t('trackQueueNow')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* Helpful instruction tip */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-600 text-xs text-center">
        Tip: Bookmark this page or note down Token <strong className="text-slate-900">{appointment.tokenNumber}</strong>. You can check the live OPD queue at any time.
      </div>

    </div>
  );
}
