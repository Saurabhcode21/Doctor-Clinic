import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, Loader2, ArrowLeft, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@clinic.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@clinic.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Clinic Staff Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Receptionist & Doctor Live Queue Management
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Staff Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In to Clinic Desk'}
          </button>
        </form>

        {/* 1-Click Demo Credentials Pill */}
        <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 mb-1 font-medium">Default Staff Credentials:</p>
          <p className="text-xs font-bold text-slate-800">admin@clinic.com / admin123</p>
          <button
            type="button"
            onClick={handleDemoFill}
            className="mt-1 text-[11px] font-bold text-brand-600 hover:underline"
          >
            Auto-fill credentials
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Patient Portal</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
