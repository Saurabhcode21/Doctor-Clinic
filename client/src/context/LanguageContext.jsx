import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    clinicTagline: "Instant QR Appointments & Live OPD Queue",
    bookAppointment: "Book Appointment",
    trackAppointment: "Track My Queue",
    findMyBooking: "Find by Mobile / Token",
    consultationFee: "Consultation Fee",
    clinicTimings: "Clinic Timings",
    clinicAddress: "Clinic Address",
    experience: "Experience",
    rating: "Patient Rating",
    liveOpdStatus: "Live OPD Status",
    nowServing: "Now Serving",
    totalToday: "Today's Patients",
    waitingQueue: "In Waiting Queue",
    step1: "Patient Details",
    step2: "Select Slot",
    step3: "Payment",
    fullName: "Full Name",
    mobileNumber: "Mobile Number",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    healthProblem: "What problem or symptoms are you experiencing?",
    problemPlaceholder: "e.g., Fever, headache, weakness, body pain for 2 days",
    problemHint: "Describe your symptoms in your own words. No medical terms required.",
    additionalNotes: "Additional Notes (Optional)",
    notesPlaceholder: "Any known allergies, ongoing medicines, etc.",
    nextStep: "Proceed to Schedule",
    back: "Back",
    selectDate: "Select Appointment Date",
    availableSlots: "Available Time Slots",
    booked: "Booked",
    slotSelected: "Selected Slot",
    summaryTitle: "Appointment Summary",
    patient: "Patient",
    doctor: "Doctor",
    date: "Date",
    time: "Time",
    paymentMethod: "Payment Method",
    payNowOnline: "Pay Now (Online)",
    payNowDesc: "UPI (Google Pay, PhonePe, Paytm), Card or NetBanking. Instant confirmation.",
    payAtClinic: "Pay at Clinic",
    payAtClinicDesc: "Pay with Cash or UPI directly at the clinic reception counter.",
    confirmAndBook: "Confirm & Generate Token",
    appointmentConfirmed: "Appointment Confirmed!",
    yourToken: "Your Token Number",
    trackQueueNow: "Track Live Queue",
    saveSlip: "Save / Download Slip",
    currentlyServing: "Currently Serving",
    patientsBeforeYou: "Patients Ahead of You",
    yourStatus: "Status",
    statusWaiting: "Waiting in Queue",
    statusYourTurn: "Your Turn Soon!",
    statusNowServing: "Now Serving - Please Enter Room",
    statusCompleted: "Consultation Completed",
    adminLogin: "Staff Login",
    callNextPatient: "Call Next Patient",
    adminDashboard: "Clinic Desk",
    refresh: "Refresh"
  },
  hi: {
    clinicTagline: "त्वरित QR अपॉइंटमेंट और लाइव OPD कतार",
    bookAppointment: "अपॉइंटमेंट बुक करें",
    trackAppointment: "मेरी कतार ट्रैक करें",
    findMyBooking: "मोबाइल / टोकन से खोजें",
    consultationFee: "परामर्श शुल्क",
    clinicTimings: "क्लीनिक का समय",
    clinicAddress: "क्लीनिक का पता",
    experience: "अनुभव",
    rating: "मरीजों की रेटिंग",
    liveOpdStatus: "लाइव OPD स्थिति",
    nowServing: "वर्तमान में देख रहे हैं",
    totalToday: "आज के कुल मरीज",
    waitingQueue: "कतार में प्रतीक्षारत",
    step1: "मरीज की जानकारी",
    step2: "समय चुनें",
    step3: "भुगतान",
    fullName: "पूरा नाम",
    mobileNumber: "मोबाइल नंबर",
    age: "उम्र",
    gender: "लिंग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    healthProblem: "आपको क्या समस्या या लक्षण महसूस हो रहे हैं?",
    problemPlaceholder: "जैसे: 2 दिन से बुखार, सिरदर्द, कमजोरी",
    problemHint: "अपनी समस्या सरल शब्दों में लिखें। डॉक्टरी नाम लिखना आवश्यक नहीं है।",
    additionalNotes: "अतिरिक्त जानकारी (वैकल्पिक)",
    notesPlaceholder: "पुरानी बीमारी, दवाई या एलर्जी की जानकारी",
    nextStep: "समय चुनने के लिए आगे बढ़ें",
    back: "पीछे जाएं",
    selectDate: "अपॉइंटमेंट की तारीख चुनें",
    availableSlots: "उपलब्ध समय स्लॉट",
    booked: "बुक हो चुका",
    slotSelected: "चुना हुआ स्लॉट",
    summaryTitle: "अपॉइंटमेंट सारांश",
    patient: "मरीज",
    doctor: "डॉक्टर",
    date: "तारीख",
    time: "समय",
    paymentMethod: "भुगतान का तरीका",
    payNowOnline: "अभी ऑनलाइन भुगतान करें",
    payNowDesc: "UPI (गूगल पे, फोनपे, पेटीएम), कार्ड। तुरंत पक्का।",
    payAtClinic: "क्लीनिक पर भुगतान करें",
    payAtClinicDesc: "क्लीनिक काउंटर पर नकद (Cash) या QR से दें।",
    confirmAndBook: "पुष्टि करें और टोकन लें",
    appointmentConfirmed: "अपॉइंटमेंट पक्की हो गई!",
    yourToken: "आपका टोकन नंबर",
    trackQueueNow: "लाइव कतार देखें",
    saveSlip: "पर्ची सेव / डाउनलोड करें",
    currentlyServing: "वर्तमान में देख रहे हैं",
    patientsBeforeYou: "आपसे पहले मरीज",
    yourStatus: "स्थिति",
    statusWaiting: "कतार में प्रतीक्षारत",
    statusYourTurn: "जल्द आपकी बारी आने वाली है!",
    statusNowServing: "आपकी बारी है - कृपया कमरे में आएं",
    statusCompleted: "परामर्श पूरा हुआ",
    adminLogin: "स्टाफ लॉगिन",
    callNextPatient: "अगला मरीज बुलाएं",
    adminDashboard: "क्लीनिक डेस्क",
    refresh: "रिफ्रेश"
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('clinic_lang') || 'en';
  });

  const toggleLang = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    localStorage.setItem('clinic_lang', next);
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
