import React, { useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  SkipForward, 
  Play, 
  Clock, 
  User, 
  Phone, 
  Activity, 
  AlertCircle,
  RotateCw,
  Search,
  Check
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { playChime } from '../../utils/audio';

export default function AdminQueue() {
  const { queueStatus, refreshQueue } = useSocket();
  const [loadingAction, setLoadingAction] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const currentToken = queueStatus.currentToken || 'A-021';
  const queueList = queueStatus.queueList || [];
  const currentPatient = queueList.find(a => a.tokenNumber === currentToken);

  // Receptionist action: Call Next Patient
  const handleCallNext = async () => {
    setLoadingAction(true);
    try {
      const res = await fetch('/api/queue/call-next', { method: 'POST' });
      const data = await res.json();
      playChime();
      await refreshQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Start Consultation
  const handleStartConsultation = async () => {
    if (!currentPatient) return;
    setLoadingAction(true);
    try {
      await fetch(`/api/appointments/${currentPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Now Serving' })
      });
      playChime();
      await refreshQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Mark Completed
  const handleCompleteCurrent = async () => {
    if (!currentPatient) return;
    setLoadingAction(true);
    try {
      await fetch(`/api/appointments/${currentPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed', completedAt: new Date().toISOString() })
      });
      await refreshQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Skip Current Patient (moves to waiting end or skipped)
  const handleSkipCurrent = async () => {
    if (!currentPatient) return;
    setLoadingAction(true);
    try {
      await fetch(`/api/appointments/${currentPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Waiting', isSkipped: true })
      });
      // Call next
      await handleCallNext();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Set specific token to Now Serving
  const handleServeSpecificToken = async (tokenNumber) => {
    setLoadingAction(true);
    try {
      await fetch('/api/queue/set-serving', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenNumber })
      });
      playChime();
      await refreshQueue();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Announce / Ring Bell
  const handleAnnounce = async () => {
    playChime();
    await fetch('/api/queue/chime', { method: 'POST' });
  };

  const filteredQueue = queueList.filter(item => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.tokenNumber.toLowerCase().includes(q) ||
      (item.patientName && item.patientName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            OPD Queue Commander
          </h1>
          <p className="text-xs text-slate-500">
            Live receptionist control desk • Changes broadcast instantly to patient phones
          </p>
        </div>

        <button
          onClick={handleAnnounce}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold hover:bg-teal-100 transition-colors shadow-xs"
        >
          <Volume2 className="w-4 h-4" />
          <span>Announce / Ding-Dong</span>
        </button>
      </div>

      {/* Active Patient Hero Card (Section 10 Requirements) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs uppercase font-extrabold tracking-widest text-teal-300">
              Current Patient In Room
            </span>
          </div>
          <span className="text-xs text-slate-400 font-medium">Room 102 (Dr. Rahul Sharma)</span>
        </div>

        {currentPatient ? (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className="bg-white text-slate-900 font-black text-4xl sm:text-5xl px-5 py-2.5 rounded-2xl shadow-lg tracking-wider">
                  {currentPatient.tokenNumber}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {currentPatient.patientName}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {currentPatient.age} years • {currentPatient.gender} • Slot: {currentPatient.timeSlot}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      currentPatient.paymentStatus === 'PAID' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    }`}>
                      {currentPatient.paymentStatus === 'PAID' ? 'PAID' : 'PAY AT CLINIC (PENDING)'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Health Symptoms Box */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-1">
                Patient Problem / Symptoms:
              </span>
              <p className="text-slate-100 font-medium italic leading-relaxed">
                "{currentPatient.problemDescription}"
              </p>
            </div>

            {/* Reception Controls: Start, Complete, Skip, Call Next */}
            <div className="pt-2 flex items-center gap-2.5 flex-wrap">
              
              <button
                onClick={handleStartConsultation}
                disabled={loadingAction}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Consultation</span>
              </button>

              <button
                onClick={handleCompleteCurrent}
                disabled={loadingAction}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark Complete</span>
              </button>

              <button
                onClick={handleSkipCurrent}
                disabled={loadingAction}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>

              <button
                onClick={handleCallNext}
                disabled={loadingAction}
                className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-teal-400/20 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Call Next Patient →</span>
              </button>

            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-slate-300 font-medium">No patient currently in the room.</p>
            <button
              onClick={handleCallNext}
              disabled={loadingAction}
              className="px-6 py-3 rounded-2xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-sm shadow-md transition-all"
            >
              Call Next Waiting Patient →
            </button>
          </div>
        )}
      </div>

      {/* Full Queue Desk List */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-base">
              Today's Live Sequence
            </h3>
            <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
              {queueList.length} Total
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search token or patient..."
              className="w-full sm:w-56 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Table of Patients in Sequence */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Token</th>
                <th className="py-2.5 px-3">Patient Details</th>
                <th className="py-2.5 px-3">Slot</th>
                <th className="py-2.5 px-3">Symptoms</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.map((item) => {
                const isCurrent = item.tokenNumber === currentToken;
                const isDone = item.status === 'Completed';

                return (
                  <tr 
                    key={item.tokenNumber}
                    className={`hover:bg-slate-50 transition-colors ${
                      isCurrent ? 'bg-brand-50/60 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <span className={`font-black text-sm px-2.5 py-1 rounded-lg ${
                        isCurrent 
                          ? 'bg-brand-600 text-white shadow-xs' 
                          : isDone 
                          ? 'text-slate-400 line-through' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {item.tokenNumber}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{item.patientName}</p>
                      <p className="text-[11px] text-slate-500">{item.age}y, {item.gender}</p>
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-600">
                      {item.timeSlot}
                    </td>

                    <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate" title={item.problemDescription}>
                      {item.problemDescription}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.paymentStatus === 'PAID' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Now Serving' ? 'bg-brand-100 text-brand-800' :
                        item.status === 'Completed' ? 'bg-slate-100 text-slate-500' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {!isCurrent && !isDone && (
                        <button
                          onClick={() => handleServeSpecificToken(item.tokenNumber)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors"
                        >
                          Call Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
