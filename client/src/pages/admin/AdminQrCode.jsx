import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Download, 
  Printer, 
  Share2, 
  ExternalLink, 
  Sparkles, 
  Stethoscope, 
  MapPin, 
  Phone,
  CheckCircle,
  Copy
} from 'lucide-react';

export default function AdminQrCode() {
  // Default to current browser origin or local network IP
  const defaultUrl = window.location.origin;
  const [targetUrl, setTargetUrl] = useState(defaultUrl);
  const [copied, setCopied] = useState(false);
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQr = () => {
    const svgElement = document.getElementById('clinic-qr-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 100, 100, 800, 800);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'Sanjeevani_Clinic_Reception_QR.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Clinic Reception QR Code
          </h1>
          <p className="text-xs text-slate-500">
            Print this poster or display at entrance/reception so patients can scan and book instantly
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadQr}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Standee (A4)</span>
          </button>
        </div>
      </div>

      {/* Target URL configuration */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          QR Code Destination URL:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="http://localhost:5173 or your clinic domain"
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          Tip: To test scanning with your physical mobile phone on the same Wi-Fi, enter your computer's local IP (e.g. <span className="font-mono text-slate-600">http://192.168.x.x:5173</span>).
        </p>
      </div>

      {/* Printable Poster Standee Container */}
      <div 
        ref={printRef}
        className="bg-white rounded-3xl p-8 border-2 border-slate-200 shadow-2xl text-center max-w-md mx-auto space-y-6 relative overflow-hidden"
      >
        
        {/* Subtle decorative badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-brand-50 text-brand-800 border border-brand-200">
          <Stethoscope className="w-3.5 h-3.5" />
          <span>SANJEEVANI HEALTH & WELLNESS CLINIC</span>
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Dr. Rahul Sharma
          </h2>
          <p className="text-xs font-bold text-brand-700 mt-0.5">
            MBBS, MD • General Physician & Consultant
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Consultation Fee: ₹500 • Instant Token & Live Queue
          </p>
        </div>

        {/* QR Code Frame */}
        <div className="p-5 bg-gradient-to-tr from-brand-50 via-teal-50 to-slate-50 rounded-3xl border-2 border-dashed border-brand-300 inline-block shadow-inner">
          <div className="bg-white p-4 rounded-2xl shadow-md">
            <QRCodeSVG
              id="clinic-qr-svg"
              value={targetUrl}
              size={220}
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        {/* Scan Callout */}
        <div className="space-y-1.5">
          <p className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-1.5">
            <span>📷 Scan to Book & Track Queue</span>
          </p>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            Open your smartphone camera & scan the code. No mobile app download required!
          </p>
        </div>

        {/* 3 Simple Steps */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[10px]">
          <div className="p-2 rounded-xl bg-slate-50 text-slate-700">
            <span className="font-black text-brand-600 block text-xs">1. Scan</span>
            <span>Scan QR Code</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 text-slate-700">
            <span className="font-black text-brand-600 block text-xs">2. Book</span>
            <span>Enter Symptoms</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 text-slate-700">
            <span className="font-black text-brand-600 block text-xs">3. Track</span>
            <span>Live Token Queue</span>
          </div>
        </div>

        {/* Clinic Footer details on poster */}
        <div className="pt-2 text-[10px] text-slate-400 space-y-0.5">
          <p>Shop 4, Royal Arcade, Near Metro Gate 2, City Center</p>
          <p className="font-semibold text-slate-600">Reception Helpline: +91 98765 43210</p>
        </div>

      </div>

    </div>
  );
}
