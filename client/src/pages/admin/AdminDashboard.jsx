import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  Wallet, 
  ArrowRight, 
  UserPlus, 
  Volume2, 
  Activity, 
  ChevronRight,
  Sparkles,
  Phone,
  Loader2
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { playChime } from '../../utils/audio';

export default function AdminDashboard() {
  const { queueStatus, refreshQueue } = useSocket();
  const [callingNext, setCallingNext] = useState(false);
  const [announcing, setAnnouncing] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);

  // Walk-in form state
  const [walkInData, setWalkInData] = useState({
    patientName: '',
    mobile: '',
    age: '',
    gender: 'Male',
    problemDescription: '',
    paymentMethod: 'Pay at Clinic'
  });
  const [submittingWalkIn, setSubmittingWalkIn] = useState(false);

  const handleCallNext = async () => {
    setCallingNext(true);
    try {
      const res = await fetch('/api/queue/call-next', { method: 'POST' });
      const data = await res.json();
      playChime();
      await refreshQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setCallingNext(false);
    }
  };

  const handleAnnounceChime = async () => {
    setAnnouncing(true);
    try {
      await fetch('/api/queue/chime', { method: 'POST' });
      playChime();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setAnnouncing(false), 500);
    }
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    if (!walkInData.patientName || !walkInData.mobile || !walkInData.age || !walkInData.problemDescription) {
      alert('Please fill all required fields');
      return;
    }
    setSubmittingWalkIn(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...walkInData,
          date: todayStr,
          timeSlot: 'Walk-In Instant'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add walk-in');

      setShowWalkInModal(false);
      setWalkInData({
        patientName: '',
        mobile: '',
        age: '',
        gender: 'Male',
        problemDescription: '',
        paymentMethod: 'Pay at Clinic'
      });
      await refreshQueue();
      alert(`Walk-In Patient Registered! Token: ${data.appointment?.tokenNumber}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingWalkIn(false);
    }
  };

  // Find currently serving patient details
  const currentToken = queueStatus.currentToken || 'A-021';
  const currentPatient = queueStatus.queueList?.find(a => a.tokenNumber === currentToken);

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Quick Actions */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
            Live OPD Reception Desk
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            Today's Queue Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Serving token updates instantly to all patient screens and waiting hall display
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowWalkInModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
          >
            <UserPlus className="w-4 h-4 text-slate-500" />
            <span>+ Walk-In Patient</span>
          </button>

          <button
            onClick={handleAnnounceChime}
            disabled={announcing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors"
            title="Play OPD Calling Chime"
          >
            <Volume2 className="w-4 h-4" />
            <span>Sound Chime</span>
          </button>

          <button
            onClick={handleCallNext}
            disabled={callingNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white text-xs font-extrabold shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            {callingNext ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Call Next Patient →</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid (Matches Section 9 Overview) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Today */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Today's Total</span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">
            {queueStatus.totalToday || 42}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Registered OPDs</span>
        </div>

        {/* Currently Serving */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-teal-300">Now Serving</span>
            <Activity className="w-4 h-4 text-brand-400 animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-brand-300 tracking-wider">
            {currentToken}
          </p>
          <span className="text-[11px] text-slate-300 font-medium">Consultation Room 1</span>
        </div>

        {/* Waiting */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Waiting</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">
            {queueStatus.waitingCount !== undefined ? queueStatus.waitingCount : 14}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">In waiting area</span>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">
            {queueStatus.completedCount !== undefined ? queueStatus.completedCount : 20}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Consulted & closed</span>
        </div>

      </div>

      {/* Revenue Collections Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Online Payments Card */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800">Online Payments (Paid)</p>
              <p className="text-xl font-black text-emerald-950">
                ₹{queueStatus.onlinePaymentsSum ? queueStatus.onlinePaymentsSum.toLocaleString('en-IN') : '8,500'}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
            Directly Credited
          </span>
        </div>

        {/* Pay at Clinic Pending Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800">Pay at Clinic (To Collect)</p>
              <p className="text-xl font-black text-amber-950">
                ₹{queueStatus.clinicPaymentsSum ? queueStatus.clinicPaymentsSum.toLocaleString('en-IN') : '3,000'}
              </p>
            </div>
          </div>
          <Link
            to="/admin/appointments?paymentStatus=PAY_AT_CLINIC"
            className="text-[11px] font-bold text-amber-800 bg-white hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
          >
            Collect at Counter →
          </Link>
        </div>

      </div>

      {/* Active Patient in Room Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 className="font-black text-slate-900 text-base">
              Patient Currently with Doctor ({currentToken})
            </h3>
          </div>
          <Link
            to="/admin/queue"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <span>Full Queue Desk</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {currentPatient ? (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-slate-900">{currentPatient.patientName}</span>
                <span className="text-xs text-slate-500">({currentPatient.age}y, {currentPatient.gender})</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  currentPatient.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {currentPatient.paymentStatus === 'PAID' ? 'PAID' : 'PAY AT CLINIC'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <strong className="text-slate-700">Symptoms:</strong> {currentPatient.problemDescription}
              </p>
              <p className="text-[11px] text-slate-400">
                Scheduled Slot: {currentPatient.timeSlot}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCallNext}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Mark Done & Call Next
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs">
            No patient currently inside. Click "Call Next Patient" to advance the OPD queue.
          </div>
        )}
      </div>

      {/* Walk-In Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add Walk-In Patient</h3>
              <button onClick={() => setShowWalkInModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={walkInData.patientName}
                  onChange={(e) => setWalkInData({ ...walkInData, patientName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={walkInData.mobile}
                    onChange={(e) => setWalkInData({ ...walkInData, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    placeholder="42"
                    value={walkInData.age}
                    onChange={(e) => setWalkInData({ ...walkInData, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={walkInData.gender}
                  onChange={(e) => setWalkInData({ ...walkInData, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Symptoms / Problem</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. High fever and sore throat"
                  value={walkInData.problemDescription}
                  onChange={(e) => setWalkInData({ ...walkInData, problemDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWalkIn}
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20"
                >
                  {submittingWalkIn ? 'Generating Token...' : 'Generate Next Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
