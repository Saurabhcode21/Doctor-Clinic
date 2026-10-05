import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  CreditCard, 
  Wallet, 
  Stethoscope, 
  ShieldCheck, 
  HelpCircle,
  Loader2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import PaymentModal from '../../components/PaymentModal';

export default function BookAppointment() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Wizard step: 1 = Details, 2 = Schedule, 3 = Summary & Pay
  const [step, setStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    mobile: '',
    age: '',
    gender: 'Male',
    problemDescription: '',
    additionalNotes: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '',
    paymentMethod: 'Pay at Clinic' // 'Pay Now' or 'Pay at Clinic'
  });

  const [errors, setErrors] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Load clinic & doctor details
  useEffect(() => {
    fetch('/api/clinic')
      .then(res => res.json())
      .then(data => {
        if (data.doctor) setDoctorInfo(data.doctor);
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch available slots whenever date changes
  useEffect(() => {
    if (!formData.date) return;
    setLoadingSlots(true);
    fetch(`/api/slots?date=${formData.date}`)
      .then(res => res.json())
      .then(data => {
        setAvailableSlots(data.slots || []);
        // If current selected slot is not available or empty, pick the first available one
        const firstAvail = (data.slots || []).find(s => s.isAvailable);
        if (firstAvail && !formData.timeSlot) {
          setFormData(prev => ({ ...prev, timeSlot: firstAvail.time }));
        }
      })
      .catch(err => console.error('Error fetching slots:', err))
      .finally(() => setLoadingSlots(false));
  }, [formData.date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Step 1 Validation
  const validateStep1 = () => {
    const errs = {};
    if (!formData.patientName.trim()) {
      errs.patientName = 'Please enter patient full name';
    }
    if (!formData.mobile.trim() || formData.mobile.replace(/\D/g, '').length < 10) {
      errs.mobile = 'Please enter valid 10-digit mobile number';
    }
    if (!formData.age || Number(formData.age) < 1 || Number(formData.age) > 120) {
      errs.age = 'Please enter valid age';
    }
    if (!formData.problemDescription.trim()) {
      errs.problemDescription = 'Please describe your symptoms or problem';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!formData.timeSlot) {
      setErrors({ timeSlot: 'Please select an available appointment time slot' });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Final confirmation
  const handleFinalSubmit = async (onlinePaymentDetails = null) => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: doctorInfo?.fee || 500,
        paymentMethod: onlinePaymentDetails ? 'Pay Now' : formData.paymentMethod
      };

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      // If online payment was chosen, record simulated payment
      if (onlinePaymentDetails && data.appointment?.id) {
        await fetch('/api/payments/mock-online-pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appointmentId: data.appointment.id,
            paymentMethod: onlinePaymentDetails.method || 'Online UPI'
          })
        });
      }

      // Navigate to confirmation page
      navigate(`/confirmation/${data.appointment.id}`);
    } catch (err) {
      alert(err.message || 'Error booking appointment');
      setSubmitting(false);
    }
  };

  // Handle Pay button click on Step 3
  const handleConfirmAction = () => {
    if (formData.paymentMethod === 'Pay Now') {
      setShowPaymentModal(true);
    } else {
      handleFinalSubmit();
    }
  };

  // Preset Date Buttons
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Wizard Header & Progress Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button 
                onClick={handleBack}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-base font-bold text-slate-900">
              {step === 1 && t('step1')}
              {step === 2 && t('step2')}
              {step === 3 && t('step3')}
            </h2>
          </div>
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
            Step {step} of 3
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-brand-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* ---------------- STEP 1: PATIENT INFORMATION ---------------- */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Patient Details</h3>
            <p className="text-xs text-slate-500">Enter patient name and symptoms for Dr. Rahul Sharma</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('fullName')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                placeholder="e.g., Rahul Kumar"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.patientName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.patientName && <p className="text-xs text-rose-500 mt-1">{errors.patientName}</p>}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t('mobileNumber')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">+91</span>
              <input
                type="tel"
                name="mobile"
                maxLength={10}
                value={formData.mobile}
                onChange={handleChange}
                placeholder="98765 43210"
                className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.mobile ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {errors.mobile && <p className="text-xs text-rose-500 mt-1">{errors.mobile}</p>}
            <p className="text-[11px] text-slate-400 mt-0.5">Used to track appointment & send queue alerts</p>
          </div>

          {/* Age & Gender in a grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('age')} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g., 28"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  errors.age ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                }`}
              />
              {errors.age && <p className="text-xs text-rose-500 mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('gender')} <span className="text-rose-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Male">{t('male')}</option>
                <option value="Female">{t('female')}</option>
                <option value="Other">{t('other')}</option>
              </select>
            </div>
          </div>

          {/* Health Information: Symptoms / Problem description */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {t('healthProblem')} <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="problemDescription"
              rows={3}
              value={formData.problemDescription}
              onChange={handleChange}
              placeholder={t('problemPlaceholder')}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                errors.problemDescription ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
              }`}
            ></textarea>
            {errors.problemDescription && (
              <p className="text-xs text-rose-500 mt-0.5">{errors.problemDescription}</p>
            )}
            <div className="flex items-start gap-1.5 mt-1 text-[11px] text-slate-500">
              <HelpCircle className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
              <span>{t('problemHint')}</span>
            </div>
          </div>

          {/* Optional Additional Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t('additionalNotes')}
            </label>
            <input
              type="text"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              placeholder={t('notesPlaceholder')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={handleNext}
            className="w-full mt-4 py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
          >
            <span>{t('nextStep')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      )}

      {/* ---------------- STEP 2: DOCTOR & SCHEDULE SELECTION ---------------- */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
          
          {/* Doctor Header */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dr. Rahul Sharma</h3>
              <p className="text-xs text-brand-700 font-medium">General Physician & Consultant</p>
              <p className="text-[11px] text-slate-500">Consultation Duration: 20 mins • Fee: ₹500</p>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {t('selectDate')}
            </label>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, date: todayStr }))}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  formData.date === todayStr
                    ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Today ({new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
              </button>
              
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, date: tomorrowStr }))}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  formData.date === tomorrowStr
                    ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tomorrow ({tomorrow.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})
              </button>
            </div>

            <div className="relative">
              <input
                type="date"
                name="date"
                min={todayStr}
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Available Slots Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                {t('availableSlots')}
              </label>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded bg-white border border-slate-300"></span> Available
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-slate-200"></span> Booked
                </span>
              </div>
            </div>

            {loadingSlots ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                <span className="text-xs">Checking real-time doctor slots...</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center">
                Doctor is not available or slots are full on this date.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = formData.timeSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => setFormData(prev => ({ ...prev, timeSlot: slot.time }))}
                      className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                        !slot.isAvailable
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through text-[11px]'
                          : isSelected
                          ? 'border-brand-600 bg-brand-600 text-white font-bold shadow-sm shadow-brand-500/25 scale-[1.02]'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-slate-50 font-medium text-xs'
                      }`}
                    >
                      {slot.time}
                      {!slot.isAvailable && (
                        <span className="block text-[9px] font-normal no-underline text-slate-400">
                          Booked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {errors.timeSlot && (
              <p className="text-xs text-rose-500 mt-2">{errors.timeSlot}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleBack}
              className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              {t('back')}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!formData.timeSlot}
              className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{t('summaryTitle')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ---------------- STEP 3: APPOINTMENT SUMMARY & PAYMENT METHOD ---------------- */}
      {step === 3 && (
        <div className="space-y-4">
          
          {/* Summary Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">{t('summaryTitle')}</h3>
              <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                Ready for Token
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('patient')}:</span>
                <span className="font-bold text-slate-800">{formData.patientName} ({formData.age}y, {formData.gender})</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Contact:</span>
                <span className="font-semibold text-slate-800">+91 {formData.mobile}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('doctor')}:</span>
                <span className="font-bold text-slate-800">Dr. Rahul Sharma</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('date')} & {t('time')}:</span>
                <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                  {new Date(formData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {formData.timeSlot}
                </span>
              </div>

              <div className="py-1">
                <span className="text-slate-500 block mb-0.5">Symptoms:</span>
                <p className="font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  {formData.problemDescription}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold text-slate-800">{t('consultationFee')}:</span>
                <span className="text-xl font-black text-slate-900">₹{doctorInfo?.fee || 500}</span>
              </div>
            </div>

          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              {t('paymentMethod')}
            </h4>

            {/* Option 1: Pay Now (Online) */}
            <div
              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Pay Now' }))}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                formData.paymentMethod === 'Pay Now'
                  ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{t('payNowOnline')}</p>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Instant Confirmed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {t('payNowDesc')}
                  </p>
                  <p className="text-[11px] text-brand-700 font-semibold mt-1">
                    Status: Payment Successful → Appointment Confirmed
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Pay at Clinic */}
            <div
              onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Pay at Clinic' }))}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                formData.paymentMethod === 'Pay at Clinic'
                  ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{t('payAtClinic')}</p>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      Pay at Counter
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {t('payAtClinicDesc')}
                  </p>
                  <p className="text-[11px] text-amber-700 font-semibold mt-1">
                    Status: Appointment Reserved → Pay at Clinic (Pending)
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="py-3.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              {t('back')}
            </button>
            <button
              type="button"
              onClick={handleConfirmAction}
              disabled={submitting}
              className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-700 hover:to-teal-600 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Appointment Token...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {formData.paymentMethod === 'Pay Now' 
                      ? 'Proceed to Pay ₹500 & Get Token' 
                      : 'Confirm Booking (Pay at Clinic)'}
                  </span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* Online Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={doctorInfo?.fee || 500}
        patientName={formData.patientName}
        onPaymentSuccess={(details) => {
          setShowPaymentModal(false);
          handleFinalSubmit(details);
        }}
      />

    </div>
  );
}
