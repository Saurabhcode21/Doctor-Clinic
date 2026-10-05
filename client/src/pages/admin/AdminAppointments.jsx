import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  UserX, 
  CreditCard, 
  Wallet, 
  FileText, 
  Loader2,
  Eye,
  Check,
  RotateCw
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export default function AdminAppointments() {
  const { refreshQueue } = useSocket();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (paymentFilter !== 'ALL') params.set('paymentStatus', paymentFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/appointments?${params.toString()}`);
      const data = await res.json();
      setAppointments(data.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, paymentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  // Mark payment as PAID at receptionist counter
  const handleMarkPaymentPaid = async (appointmentId, method = 'Cash at Counter') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/payments/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, paymentMethod: method })
      });
      if (!res.ok) throw new Error('Failed to update payment');
      await fetchAppointments();
      await refreshQueue();
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(prev => ({ ...prev, paymentStatus: 'PAID', paymentMethod: method }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Update status (Cancelled, No-Show, Completed, Waiting)
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchAppointments();
      await refreshQueue();
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Appointment Directory
          </h1>
          <p className="text-xs text-slate-500">
            Search, verify counter payments, manage statuses, and view symptom notes
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, mobile (e.g. 98765...), or token (A-027)..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors shrink-0"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-slate-100 text-xs">
          
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 font-medium text-xs focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Waiting">Waiting</option>
              <option value="Now Serving">Now Serving</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-Show">No-Show</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 font-medium text-xs focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">PAID</option>
              <option value="PAY_AT_CLINIC">Pay at Clinic (Pending)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Total Records: {appointments.length}
          </span>
          <span className="text-[11px] text-slate-400">
            Click any row or view icon to inspect private symptoms
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
            <span>Loading appointments...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No appointments matched your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Symptoms Preview</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => {
                  const isPaid = apt.paymentStatus === 'PAID';

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-black text-xs text-brand-900 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          {apt.tokenNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{apt.patientName}</p>
                        <p className="text-[11px] text-slate-500">{apt.age}y, {apt.gender}</p>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-600">
                        +91 {apt.mobile}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{apt.date}</p>
                        <p className="text-[11px] text-slate-500 font-semibold">{apt.timeSlot}</p>
                      </td>

                      <td className="py-3 px-4 max-w-[180px] truncate text-slate-600" title={apt.problemDescription}>
                        {apt.problemDescription}
                      </td>

                      <td className="py-3 px-4">
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isPaid 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {apt.paymentStatus}
                          </span>
                          {!isPaid && (
                            <button
                              onClick={() => handleMarkPaymentPaid(apt.id, 'Cash at Counter')}
                              disabled={actionLoading}
                              className="block mt-1 text-[10px] font-bold text-brand-600 hover:text-brand-800 underline"
                            >
                              Collect ₹500
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          apt.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                          apt.status === 'Now Serving' ? 'bg-brand-100 text-brand-800' :
                          apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {apt.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAppointment(apt)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                            title="View Full Patient Record"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {apt.status === 'Waiting' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'Cancelled')}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                              title="Cancel Appointment"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Patient Record Modal (Private Medical Details) */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-extrabold text-brand-700 uppercase tracking-wider">
                  Patient Medical OPD Record
                </span>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Token: {selectedAppointment.tokenNumber}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name</span>
                  <p className="font-bold text-slate-800 text-sm">{selectedAppointment.patientName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Age & Gender</span>
                  <p className="font-bold text-slate-800">{selectedAppointment.age} yrs • {selectedAppointment.gender}</p>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Phone</span>
                  <p className="font-bold text-slate-800">+91 {selectedAppointment.mobile}</p>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Scheduled Slot</span>
                  <p className="font-bold text-slate-800">{selectedAppointment.timeSlot}</p>
                </div>
              </div>

              {/* Private Symptoms description */}
              <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-200/80">
                <span className="text-brand-800 text-[10px] uppercase font-black block mb-1">
                  Private Problem / Symptoms Described by Patient:
                </span>
                <p className="text-slate-800 font-medium leading-relaxed italic">
                  "{selectedAppointment.problemDescription}"
                </p>
                {selectedAppointment.additionalNotes && (
                  <p className="text-slate-500 mt-2 text-[11px]">
                    <strong>Notes:</strong> {selectedAppointment.additionalNotes}
                  </p>
                )}
              </div>

              {/* Payment Section */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Payment Status</span>
                  <p className="font-bold text-slate-800 text-xs">
                    {selectedAppointment.paymentStatus} ({selectedAppointment.paymentMethod || 'Counter'})
                  </p>
                </div>
                {selectedAppointment.paymentStatus !== 'PAID' ? (
                  <button
                    onClick={() => handleMarkPaymentPaid(selectedAppointment.id, 'Cash at Counter')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    Mark Paid (₹500)
                  </button>
                ) : (
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                    <Check className="w-4 h-4" /> Received
                  </span>
                )}
              </div>

              {/* Status Actions */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'No-Show')}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Mark No-Show
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAppointment.id, 'Completed')}
                  className="px-3 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Mark Completed
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
