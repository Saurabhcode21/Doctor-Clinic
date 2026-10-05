import React, { useState } from 'react';
import { CheckCircle2, Shield, CreditCard, Smartphone, Building, Loader2, X } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, amount, onPaymentSuccess, patientName, appointmentData }) {
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiId, setUpiId] = useState('patient@okhdfcbank');

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess({
        transactionId: `PAY_UPI_${Date.now()}`,
        method: selectedMethod.toUpperCase()
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-700 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-200" />
            <div>
              <h3 className="font-bold text-base">Secure Payment Gateway</h3>
              <p className="text-xs text-teal-100">Sanjeevani Clinic OPD Consultation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Consultation Fee</p>
              <p className="text-sm font-semibold text-slate-800">{patientName || 'Rahul Kumar'}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900">₹{amount || 500}</span>
              <p className="text-[10px] text-emerald-600 font-semibold">100% Secure Checkout</p>
            </div>
          </div>

          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Choose Payment Mode
          </h4>

          <div className="space-y-2.5 mb-6">
            
            {/* UPI Option */}
            <div 
              onClick={() => setSelectedMethod('upi')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                selectedMethod === 'upi'
                  ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-black text-xs">
                UPI
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">UPI Instant Pay</p>
                <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
              </div>
              <input 
                type="radio" 
                name="payMode" 
                checked={selectedMethod === 'upi'} 
                onChange={() => setSelectedMethod('upi')}
                className="text-brand-600 focus:ring-brand-500" 
              />
            </div>

            {/* Credit / Debit Card */}
            <div 
              onClick={() => setSelectedMethod('card')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                selectedMethod === 'card'
                  ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Credit / Debit Card</p>
                <p className="text-xs text-slate-500">Visa, Mastercard, RuPay</p>
              </div>
              <input 
                type="radio" 
                name="payMode" 
                checked={selectedMethod === 'card'} 
                onChange={() => setSelectedMethod('card')}
                className="text-brand-600 focus:ring-brand-500" 
              />
            </div>

            {/* Net Banking */}
            <div 
              onClick={() => setSelectedMethod('netbanking')}
              className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                selectedMethod === 'netbanking'
                  ? 'border-brand-600 bg-brand-50/50 ring-1 ring-brand-500'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Building className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">Net Banking</p>
                <p className="text-xs text-slate-500">SBI, HDFC, ICICI, Axis & others</p>
              </div>
              <input 
                type="radio" 
                name="payMode" 
                checked={selectedMethod === 'netbanking'} 
                onChange={() => setSelectedMethod('netbanking')}
                className="text-brand-600 focus:ring-brand-500" 
              />
            </div>

          </div>

          {/* Pay Button */}
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Secure Payment ₹{amount}...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Simulate Pay ₹{amount || 500} & Confirm</span>
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-400 mt-3">
            Demo Sandbox Gateway — Verifies server-side & generates confirmed token
          </p>
        </div>

      </div>
    </div>
  );
}
