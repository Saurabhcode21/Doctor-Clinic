import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Patient Pages
import LandingPage from './pages/patient/LandingPage';
import BookAppointment from './pages/patient/BookAppointment';
import AppointmentConfirmation from './pages/patient/AppointmentConfirmation';
import QueueTracker from './pages/patient/QueueTracker';
import FindAppointment from './pages/patient/FindAppointment';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQueue from './pages/admin/AdminQueue';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminSchedule from './pages/admin/AdminSchedule';
import AdminQrCode from './pages/admin/AdminQrCode';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-brand-500 selection:text-white">
              <Navbar />

              <main className="flex-1">
                <Routes>
                  {/* Patient Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/book" element={<BookAppointment />} />
                  <Route path="/confirmation/:id" element={<AppointmentConfirmation />} />
                  <Route path="/queue" element={<QueueTracker />} />
                  <Route path="/find" element={<FindAppointment />} />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="queue" element={<AdminQueue />} />
                    <Route path="appointments" element={<AdminAppointments />} />
                    <Route path="schedule" element={<AdminSchedule />} />
                    <Route path="qrcode" element={<AdminQrCode />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
