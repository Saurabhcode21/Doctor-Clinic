import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  User, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  BellRing
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useLanguage } from '../../context/LanguageContext';
import { playChime, playYourTurnAlert } from '../../utils/audio';

export default function QueueTracker() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const { queueStatus, connected, refreshQueue, lastNotification } = useSocket();
  const { t } = useLanguage();

  const [myToken, setMyToken] = useState(tokenFromUrl || 'A-027');
  const [tokenInput, setTokenInput] = useState(myToken);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);

  // Sync token input with query param
  useEffect(() => {
    if (tokenFromUrl) {
      setMyToken(tokenFromUrl);
      setTokenInput(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  // Fetch patient details if token entered
  useEffect(() => {
    if (!myToken) return;
    fetch(`/api/appointments/${myToken}`)
      .then(res => res.json())
      .then(data => {
        if (data.appointment) {
          setPatientDetails(data.appointment);
        }
      })
      .catch(err => console.log('Appointment fetch note:', err));
  }, [myToken]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshQueue();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleApplyToken = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const clean = tokenInput.trim().toUpperCase();
    setMyToken(clean);
    setSearchParams({ token: clean });
  };

  // Determine positions and statuses
  const currentServingToken = queueStatus.currentToken || 'A-021';
  const queueList = queueStatus.queueList || [];

  // Find where myToken is in the queue
  const myIndexInWaiting = queueList
    .filter(a => a.status === 'Waiting')
    .findIndex(a => a.tokenNumber === myToken);

  const isNowServing = currentServingToken === myToken;
  const isMyTokenCompleted = queueList.find(a => a.tokenNumber === myToken)?.status === 'Completed';

  let patientsAhead = 0;
  let statusBadge = {
    label: t('statusWaiting'),
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Clock
  };

  if (isNowServing) {
    statusBadge = {
      label: t('statusNowServing'),
      color: 'bg-emerald-500 text-white border-emerald-600 animate-bounce-soft',
      icon: Sparkles
    };
    patientsAhead = 0;
  } else if (isMyTokenCompleted) {
    statusBadge = {
      label: t('statusCompleted'),
      color: 'bg-slate-200 text-slate-700 border-slate-300',
      icon: CheckCircle2
    };
    patientsAhead = 0;
  } else if (myIndexInWaiting !== -1) {
    patientsAhead = myIndexInWaiting;
    if (patientsAhead <= 2) {
      statusBadge = {
        label: t('statusYourTurn'),
        color: 'bg-orange-500 text-white border-orange-600',
        icon: BellRing
      };
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Live OPD Queue Header Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-brand-600">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              Live Clinic OPD Queue
            </h1>
            <p className="text-[11px] text-slate-500">
              Dr. Rahul Sharma • Room 102
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playChime();
            }}
            title={soundEnabled ? "Audio Bell ON" : "Audio Bell MUTED"}
            className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
              soundEnabled 
                ? 'bg-brand-50 border-brand-200 text-brand-700' 
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleManualRefresh}
            title="Refresh Live Queue"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real-time notification toast if token just called */}
      {lastNotification && (
        <div className="mb-4 p-3 rounded-xl bg-brand-600 text-white text-xs font-bold flex items-center gap-2 shadow-md animate-bounce-soft">
          <BellRing className="w-4 h-4 shrink-0" />
          <span>{lastNotification}</span>
        </div>
      )}

      {/* Main Now Serving & Your Token Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        
        {/* Currently Serving Box */}
        <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-lg text-center relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-brand-500/20 rounded-full blur-xl pointer-events-none"></div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
            {t('currentlyServing')}
          </p>
          <div className="text-3xl sm:text-4xl font-black text-brand-300 tracking-wider">
            {currentServingToken}
          </div>
          <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
            In Doctor Room
          </span>
        </div>

        {/* Your Token Box */}
        <div className={`rounded-3xl p-5 text-center border shadow-lg transition-all ${
          isNowServing 
            ? 'bg-emerald-600 text-white border-emerald-500 ring-4 ring-emerald-200' 
            : 'bg-white text-slate-900 border-slate-200'
        }`}>
          <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${
            isNowServing ? 'text-emerald-100' : 'text-slate-400'
          }`}>
            {t('yourToken')}
          </p>
          <div className={`text-3xl sm:text-4xl font-black tracking-wider ${
            isNowServing ? 'text-white' : 'text-slate-900'
          }`}>
            {myToken}
          </div>
          <p className={`mt-2 text-[10px] font-bold ${
            isNowServing ? 'text-emerald-100' : 'text-slate-500'
          }`}>
            {isNowServing 
              ? '🎉 PLEASE ENTER ROOM 102' 
              : `${t('patientsBeforeYou')}: ${myIndexInWaiting !== -1 ? myIndexInWaiting : 0}`}
          </p>
        </div>

      </div>

      {/* Status Bar Pill */}
      <div className={`rounded-2xl p-4 border shadow-sm mb-5 flex items-center justify-between ${statusBadge.color}`}>
        <div className="flex items-center gap-2.5">
          <statusBadge.icon className="w-5 h-5 shrink-0" />
          <div>
            <p className="text-xs uppercase font-extrabold tracking-wider opacity-80">
              {t('yourStatus')}
            </p>
            <p className="text-sm font-black leading-tight">
              {statusBadge.label}
            </p>
          </div>
        </div>

        {!isNowServing && !isMyTokenCompleted && (
          <div className="text-right">
            <span className="text-xs font-bold block opacity-80">{t('patientsBeforeYou')}</span>
            <span className="text-xl font-black">{patientsAhead}</span>
          </div>
        )}
      </div>

      {/* Patient Slip mini preview (if loaded) */}
      {patientDetails && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm mb-5 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-extrabold text-slate-800 text-sm">{patientDetails.patientName}</p>
              <p className="text-slate-500">{patientDetails.age} yrs • {patientDetails.gender} • Slot: {patientDetails.timeSlot}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
              patientDetails.paymentStatus === 'PAID' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {patientDetails.paymentStatus === 'PAID' ? 'Fee Paid' : 'Pay at Clinic'}
            </span>
          </div>
          <p className="mt-2 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
            Symptoms: {patientDetails.problemDescription}
          </p>
        </div>
      )}

      {/* Visual Live Queue Board (Matches user's exact specification) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <span>Live OPD Queue Board</span>
            <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
              {queueList.length} Registered
            </span>
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Updates live automatically</span>
        </div>

        {/* Queue Items List */}
        <div className="space-y-2">
          {queueList.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              No appointments scheduled for today yet.
            </div>
          ) : (
            queueList.map((item) => {
              const isCurrent = item.tokenNumber === currentServingToken;
              const isMe = item.tokenNumber === myToken;
              const isDone = item.status === 'Completed';

              return (
                <div
                  key={item.tokenNumber}
                  className={`p-3 rounded-2xl flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-brand-50 border-2 border-brand-500 shadow-sm ring-2 ring-brand-400/20'
                      : isMe
                      ? 'bg-teal-50/70 border-2 border-teal-400 shadow-sm'
                      : isDone
                      ? 'bg-slate-50 border border-slate-200/60 opacity-60'
                      : 'bg-white border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : isCurrent ? (
                        <div className="w-3.5 h-3.5 rounded-full bg-brand-600 animate-ping"></div>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                      )}
                    </div>

                    {/* Token Number */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm tracking-wide ${
                          isCurrent ? 'text-brand-900 text-base' : isDone ? 'text-slate-500 line-through' : 'text-slate-800'
                        }`}>
                          {item.tokenNumber}
                        </span>

                        {isCurrent && (
                          <span className="text-[10px] font-black uppercase text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                            Now Serving
                          </span>
                        )}

                        {isMe && (
                          <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full border border-teal-300">
                            ← YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Slot: {item.timeSlot} • {item.patientName ? item.patientName.split(' ')[0] : 'Patient'}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="text-right text-xs">
                    {isDone ? (
                      <span className="text-[11px] font-bold text-slate-400">Completed ✓</span>
                    ) : isCurrent ? (
                      <span className="text-[11px] font-bold text-brand-700">In Room</span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500">Waiting</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Switch or Lookup another Token Form */}
      <form onSubmit={handleApplyToken} className="mt-5 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Track a different Token / Patient?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="e.g. A-027"
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 uppercase font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Track Token
          </button>
        </div>
      </form>

    </div>
  );
}
