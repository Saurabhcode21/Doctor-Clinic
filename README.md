# 🏥 Sanjeevani Clinic — QR-Based Appointment & Queue Management System

A mobile-first, real-time **Doctor Appointment & Live OPD Queue Management System** built with **React (Vite), Node.js, Express, Socket.IO, and Tailwind CSS**.

Designed to eliminate physical crowding and long waiting queues in doctor clinics by enabling patients to scan a reception QR code, book appointment slots, choose payment options, receive a live token, and track the OPD queue in real-time on their mobile phones without downloading any app.

---

## 🌟 Key Features

### 1. Patient Experience (Mobile-First)
- **Scan QR Code**: Scan the QR code at the clinic reception or entrance with any smartphone camera.
- **Bilingual Support**: Instant toggle between **English** and **Hindi (हिंदी)**.
- **Doctor & Clinic Profile**: View Dr. Rahul Sharma's credentials, consultation fee (₹500), timings, address, and live OPD status.
- **Symptom / Problem Description**: Designed to capture what the patient is feeling (e.g. *"Fever, headache and weakness for 2 days"*) without requiring medical self-diagnosis.
- **Real-Time Slot Booking**: Select Date (Today / Tomorrow / custom date) and choose from 20-minute available doctor slots.
- **Payment Options**:
  - **Option 1: Pay Now (Online)**: Pay consultation fee online via simulated UPI (Google Pay, PhonePe, Paytm), Cards, or NetBanking. Status: `PAID → Confirmed`.
  - **Option 2: Pay at Clinic**: Reserve slot without online payment. Status: `PAY_AT_CLINIC (Pending at Reception Counter)`.
- **Unique Token Pass**: Generates unique tokens like `A-027` with printable pass slip and instant tracking CTA.
- **Real-Time Live Queue Tracking**:
  - Displays: **Currently Serving (A-021)**, **Your Token (A-027)**, **Patients Ahead of You (5)**.
  - Live sequence board with served checkmarks (`✓`), Now Serving indicator, and your position (`← YOU`).
  - Audio bell chime synthesizer (Web Audio API) when your token is announced or called!
- **Find Lost Booking**: Lookup any past or active token using just a 10-digit mobile number or Token ID.

### 2. Reception & Clinic Staff Portal (`/admin`)
- **Secure Staff Authentication**: Session JWT auth with 1-click test credentials.
- **Live Queue Commander**:
  - Current patient in consultation room with full symptoms, age, and payment status.
  - **Call Next Patient**: 1-click button that advances the queue (`A-021 → Completed`, `A-022 → Now Serving`) and instantly updates all patient mobile screens via **Socket.IO**!
  - **Start Consultation**, **Mark Completed**, and **Skip Patient**.
  - **Sound Announce Chime (Ding-Dong)**.
- **Dashboard Overview**:
  - Today's Appointments (e.g. 42), Currently Serving, Waiting (14), Completed (20), Cancelled (3).
  - Online Payments Collected (`₹8,500`) vs Pay at Clinic Pending (`₹3,000`).
  - **+ Walk-In Patient**: Instantly add walk-in patients who arrive at the counter without a smartphone.
- **Appointment Management**:
  - Search by patient name, mobile, or token.
  - Filter by date, status, and payment status.
  - **Collect & Mark Paid**: 1-click payment verification for Pay at Clinic patients paying cash or counter UPI.
  - View private patient medical symptom notes.
- **Doctor Schedule Management**:
  - Working days, morning & evening shift hours, consultation fee, and slot duration (20 minutes).
  - Availability toggle (if doctor is on leave, slots immediately lock).
- **Printable Reception QR Code Poster**:
  - High-resolution SVG QR code.
  - One-click **Download PNG** or **Print A4 Standee Poster** for reception desk and waiting hall!
  - Customizable URL (supports local Wi-Fi IP e.g. `http://192.168.1.15:5173` so doctor and patients can test scanning with real smartphones).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on Node.js v24)
- **npm**: v9+

### 1. Start Both Backend & Frontend
From the root directory, simply run:
```bash
npm run dev
```

This starts:
- **Backend API & WebSocket Server**: `http://localhost:5000`
- **Frontend Vite Dev Server**: `http://localhost:5173`

---

## 🔑 Default Credentials

- **Admin / Receptionist Portal**: `http://localhost:5173/admin/login`
- **Email**: `admin@clinic.com`
- **Password**: `admin123`
*(Auto-fill button available on the login page for 1-click testing)*

---

## 📱 Testing the Full Flow

1. Open `http://localhost:5173` in your browser (or on a mobile device on the same Wi-Fi).
2. Click **Book Appointment** → Enter name (e.g. Rahul Kumar), Mobile (9876543219), Age (28), and symptoms (*"Fever, headache and weakness for 2 days"*).
3. Select an available time slot (e.g. 12:20 PM).
4. Choose **Pay Now** or **Pay at Clinic** → Confirm booking.
5. Receive your Token Number (e.g. **A-027**).
6. Click **Track Live Queue**:
   - Notice *Currently Serving: A-021*, *Your Token: A-027*, *Patients Ahead: 5*.
7. In another tab, open `http://localhost:5173/admin/queue` (login with `admin@clinic.com` / `admin123`).
8. Click **Call Next Patient →**:
   - Watch the patient tab update in real-time without refreshing!
   - Hear the audio chime trigger!

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, QRCode.react |
| **Backend** | Node.js, Express.js, Socket.IO, JWT, Bcrypt.js |
| **Audio** | Web Audio API Synthesizer (Zero external file dependencies) |
| **Database** | Persistent JSON store with atomic file writes & seed generator (`server/data/clinic_data.json`) |

---

## 🚢 Production Deployment Guide

The application supports unified single-port deployment where Express serves the optimized React production bundle, API endpoints, and live WebSockets all together on one port.

### 1. Build & Run Locally for Production
```bash
# 1. Install all dependencies
npm run install:all

# 2. Build the production React bundle into client/dist
npm run build

# 3. Start unified production server (serves frontend + backend + WebSockets)
npm run start:prod
```
The app will be live at `http://localhost:5000`.

### 2. Environment Variables
Create a `.env` file in the `server/` directory (see [server/.env.example](file:///e:/Doctor%20Clinic/server/.env.example)):
```ini
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_strong_random_secret_here
CORS_ORIGIN=*
CLINIC_BASE_URL=https://clinic.yourdomain.com
```

### 3. Deploying with Docker
```bash
docker compose up -d --build
```
This builds both frontend and backend, sets up volume persistence for `clinic_data.json`, and exposes port `5000`.

### 4. Deploying to PaaS (Render, Railway, Heroku)
- **Build Command**: `npm run install:all && npm run build`
- **Start Command**: `node server/server.js`
- **Port**: Set automatically by PaaS (`process.env.PORT`)
- **Important**: Add a **Persistent Disk/Volume** mounted to `/app/server/data` so clinic appointments and queue history persist across restarts and redeployments.

