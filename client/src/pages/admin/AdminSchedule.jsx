import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Clock, 
  Calendar, 
  DollarSign, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function AdminSchedule() {
  const { refreshQueue } = useSocket();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [doctor, setDoctor] = useState({
    name: 'Dr. Rahul Sharma',
    specialization: 'General Physician',
    qualification: 'MBBS, MD',
    fee: 500,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    slotDuration: 20,
    isAvailable: true,
    roomNumber: 'Consultation Room 1'
  });

  useEffect(() => {
    fetch('/api/clinic')
      .then(res => res.json())
      .then(data => {
        if (data.doctor) setDoctor(data.doctor);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('clinic_admin_token');
      const res = await fetch('/api/doctor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(doctor)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSuccessMsg('Doctor schedule and configuration saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      await refreshQueue();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    setDoctor(prev => {
      const days = [...(prev.workingDays || [])];
      const idx = days.indexOf(day);
      if (idx !== -1) {
        days.splice(idx, 1);
      } else {
        days.push(day);
      }
      return { ...prev, workingDays: days };
    });
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-500">Loading doctor settings...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
          Doctor Schedule & OPD Settings
        </h1>
        <p className="text-xs text-slate-500">
          Configure doctor availability, working days, timings, consultation fee, and slot duration
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        
        {/* Availability Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Doctor OPD Availability Status</p>
            <p className="text-xs text-slate-500">
              {doctor.isAvailable 
                ? 'Doctor is Available: Slots open for booking & live queue active' 
                : 'Doctor is On Leave: New slots immediately blocked for booking'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDoctor(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
            className={`p-1 rounded-full transition-colors ${
              doctor.isAvailable ? 'text-brand-600' : 'text-slate-400'
            }`}
          >
            {doctor.isAvailable ? (
              <ToggleRight className="w-10 h-10 fill-brand-600 text-white" />
            ) : (
              <ToggleLeft className="w-10 h-10 fill-slate-300 text-white" />
            )}
          </button>
        </div>

        {/* Doctor Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Full Name</label>
            <input
              type="text"
              value={doctor.name}
              onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
            <input
              type="text"
              value={doctor.specialization}
              onChange={(e) => setDoctor({ ...doctor, specialization: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee (₹)</label>
            <input
              type="number"
              value={doctor.fee}
              onChange={(e) => setDoctor({ ...doctor, fee: Number(e.target.value) })}
              required
              min={0}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Slot Duration (Mins)</label>
            <input
              type="number"
              value={doctor.slotDuration || 20}
              onChange={(e) => setDoctor({ ...doctor, slotDuration: Number(e.target.value) })}
              required
              min={10}
              max={60}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Room</label>
            <input
              type="text"
              value={doctor.roomNumber || 'Room 102'}
              onChange={(e) => setDoctor({ ...doctor, roomNumber: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Working Days */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Working Days (OPD Schedule)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {daysOfWeek.map((day) => {
              const isChecked = (doctor.workingDays || []).includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    isChecked
                      ? 'border-brand-600 bg-brand-50 text-brand-800 ring-1 ring-brand-500/20'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timings Note */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <p className="font-bold text-slate-800 mb-1">Default Daily OPD Shifts:</p>
          <p>• Morning Shift: 10:00 AM – 2:00 PM (20-min slots auto generated)</p>
          <p>• Evening Shift: 5:00 PM – 8:00 PM (20-min slots auto generated)</p>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Configuration...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save & Update Clinic Schedule</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
}
