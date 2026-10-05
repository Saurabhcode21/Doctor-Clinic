import React from 'react';
import { NavLink, Outlet, Navigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListOrdered, 
  CalendarDays, 
  Clock, 
  QrCode, 
  LogOut, 
  ExternalLink,
  Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function AdminLayout() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const { queueStatus, connected } = useSocket();

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Authenticating staff session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/queue', label: "Today's Queue", icon: ListOrdered, badge: queueStatus.waitingCount },
    { to: '/admin/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/admin/schedule', label: 'Doctor Schedule', icon: Clock },
    { to: '/admin/qrcode', label: 'QR Code Poster', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Top Admin Sub-bar */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="font-bold flex items-center gap-1.5 text-teal-400">
            <Stethoscope className="w-3.5 h-3.5" />
            Clinic Reception Desk
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Dr. Rahul Sharma (General Medicine)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span>{connected ? 'Socket Live' : 'Offline'}</span>
          </div>

          <Link
            to="/queue"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-teal-300 hover:text-white transition-colors"
          >
            <span>Patient Board</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 ml-2"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 overflow-x-auto flex items-center gap-1 py-1.5 scrollbar-none">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Main Admin Content Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

    </div>
  );
}
