const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'clinic_data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data generator
function getInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  const todayStr = new Date().toISOString().split('T')[0];

  return {
    clinic: {
      name: "Sanjeevani Health & Family Clinic",
      tagline: "Instant QR Appointments & Real-Time OPD Queue",
      doctorName: "Dr. Rahul Sharma",
      specialization: "General Physician & Consultant",
      qualifications: "MBBS, MD (General Medicine)",
      experience: "12+ Years Experience",
      consultationFee: 500,
      phone: "+91 98765 43210",
      address: "Shop 4, Ground Floor, Royal Arcade, Near Metro Gate 2, City Center",
      timings: "Mon – Sat: 10:00 AM – 2:00 PM, 5:00 PM – 8:00 PM | Sun: Closed",
      qrUrl: "http://localhost:5173"
    },
    admin: {
      email: "admin@clinic.com",
      passwordHash: adminPasswordHash,
      name: "Reception Desk",
      role: "admin"
    },
    doctor: {
      id: "doc-1",
      name: "Dr. Rahul Sharma",
      specialization: "General Physician",
      qualification: "MBBS, MD",
      fee: 500,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      morningHours: { start: "10:00 AM", end: "02:00 PM" },
      eveningHours: { start: "05:00 PM", end: "08:00 PM" },
      slotDuration: 20, // minutes
      isAvailable: true,
      roomNumber: "Consultation Room 1"
    },
    queue: {
      date: todayStr,
      currentToken: "A-021",
      currentTokenId: "apt-21",
      status: "Active",
      lastTokenNumber: 29
    },
    appointments: [
      {
        id: "apt-20",
        tokenNumber: "A-020",
        patientName: "Vikram Malhotra",
        mobile: "9876500020",
        age: 45,
        gender: "Male",
        problemDescription: "Routine blood pressure checkup and prescription refill",
        date: todayStr,
        timeSlot: "10:00 AM",
        status: "Completed",
        paymentStatus: "PAID",
        paymentMethod: "Pay Now (Online)",
        amount: 500,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        completedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "apt-21",
        tokenNumber: "A-021",
        patientName: "Sunita Verma",
        mobile: "9876500021",
        age: 38,
        gender: "Female",
        problemDescription: "Severe migraine and nausea since morning",
        date: todayStr,
        timeSlot: "10:20 AM",
        status: "Now Serving",
        paymentStatus: "PAID",
        paymentMethod: "Pay Now (Online)",
        amount: 500,
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
      },
      {
        id: "apt-22",
        tokenNumber: "A-022",
        patientName: "Anil Kapoor",
        mobile: "9876500022",
        age: 52,
        gender: "Male",
        problemDescription: "Joint stiffness in knees and lower back discomfort",
        date: todayStr,
        timeSlot: "10:40 AM",
        status: "Completed",
        paymentStatus: "PAID",
        paymentMethod: "Pay at Clinic",
        amount: 500,
        createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString()
      },
      {
        id: "apt-23",
        tokenNumber: "A-023",
        patientName: "Pooja Hegde",
        mobile: "9876500023",
        age: 26,
        gender: "Female",
        problemDescription: "Skin allergy and rashes after consuming seafood",
        date: todayStr,
        timeSlot: "11:00 AM",
        status: "Completed",
        paymentStatus: "PAID",
        paymentMethod: "Pay Now (Online)",
        amount: 500,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "apt-24",
        tokenNumber: "A-024",
        patientName: "Ramesh Gupta",
        mobile: "9876500024",
        age: 61,
        gender: "Male",
        problemDescription: "Chronic cough and mild chest tightness",
        date: todayStr,
        timeSlot: "11:20 AM",
        status: "Completed",
        paymentStatus: "PAID",
        paymentMethod: "Pay at Clinic",
        amount: 500,
        createdAt: new Date(Date.now() - 2800000).toISOString()
      },
      {
        id: "apt-25",
        tokenNumber: "A-025",
        patientName: "Meera Nair",
        mobile: "9876500025",
        age: 33,
        gender: "Female",
        problemDescription: "Acid reflux and stomach burning sensation after meals",
        date: todayStr,
        timeSlot: "11:40 AM",
        status: "Waiting",
        paymentStatus: "PAID",
        paymentMethod: "Pay Now (Online)",
        amount: 500,
        createdAt: new Date(Date.now() - 2000000).toISOString()
      },
      {
        id: "apt-26",
        tokenNumber: "A-026",
        patientName: "Deepak Sharma",
        mobile: "9876500026",
        age: 29,
        gender: "Male",
        problemDescription: "Sore throat, difficulty swallowing, body pain",
        date: todayStr,
        timeSlot: "12:00 PM",
        status: "Waiting",
        paymentStatus: "PAY_AT_CLINIC",
        paymentMethod: "Pay at Clinic",
        amount: 500,
        createdAt: new Date(Date.now() - 1500000).toISOString()
      },
      {
        id: "apt-27",
        tokenNumber: "A-027",
        patientName: "Rahul Kumar",
        mobile: "9876543219",
        age: 28,
        gender: "Male",
        problemDescription: "Fever, headache and weakness for the last 2 days",
        date: todayStr,
        timeSlot: "12:20 PM",
        status: "Waiting",
        paymentStatus: "PAY_AT_CLINIC",
        paymentMethod: "Pay at Clinic",
        amount: 500,
        createdAt: new Date(Date.now() - 900000).toISOString()
      },
      {
        id: "apt-28",
        tokenNumber: "A-028",
        patientName: "Kavita Joshi",
        mobile: "9876500028",
        age: 41,
        gender: "Female",
        problemDescription: "Dizziness and ear pain since yesterday",
        date: todayStr,
        timeSlot: "12:40 PM",
        status: "Waiting",
        paymentStatus: "PAID",
        paymentMethod: "Pay Now (Online)",
        amount: 500,
        createdAt: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: "apt-29",
        tokenNumber: "A-029",
        patientName: "Sanjay Patel",
        mobile: "9876500029",
        age: 50,
        gender: "Male",
        problemDescription: "Blood sugar evaluation and weakness",
        date: todayStr,
        timeSlot: "01:00 PM",
        status: "Waiting",
        paymentStatus: "PAY_AT_CLINIC",
        paymentMethod: "Pay at Clinic",
        amount: 500,
        createdAt: new Date(Date.now() - 300000).toISOString()
      }
    ]
  };
}

// Load or initialize database
class ClinicDatabase {
  constructor() {
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = getInitialData();
        this.save();
      }
    } catch (err) {
      console.error('Failed to load clinic data, re-initializing...', err);
      this.data = getInitialData();
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving data to file:', err);
    }
  }

  getClinicInfo() {
    return this.data.clinic;
  }

  updateClinicInfo(updates) {
    this.data.clinic = { ...this.data.clinic, ...updates };
    this.save();
    return this.data.clinic;
  }

  getDoctor() {
    return this.data.doctor;
  }

  updateDoctor(updates) {
    this.data.doctor = { ...this.data.doctor, ...updates };
    this.save();
    return this.data.doctor;
  }

  getAdmin() {
    return this.data.admin;
  }

  getQueue() {
    const todayStr = new Date().toISOString().split('T')[0];
    if (this.data.queue.date !== todayStr) {
      // New day, reset or align queue
      this.data.queue.date = todayStr;
      this.save();
    }
    return this.data.queue;
  }

  getAppointments(filters = {}) {
    let list = [...this.data.appointments];
    if (filters.date) {
      list = list.filter(a => a.date === filters.date);
    }
    if (filters.status && filters.status !== 'ALL') {
      list = list.filter(a => a.status === filters.status);
    }
    if (filters.paymentStatus && filters.paymentStatus !== 'ALL') {
      list = list.filter(a => a.paymentStatus === filters.paymentStatus);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(a => 
        (a.patientName && a.patientName.toLowerCase().includes(q)) ||
        (a.mobile && a.mobile.includes(q)) ||
        (a.tokenNumber && a.tokenNumber.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getAppointmentById(id) {
    return this.data.appointments.find(a => a.id === id || a.tokenNumber.toLowerCase() === id.toLowerCase());
  }

  getAppointmentByMobile(mobile) {
    const clean = mobile.replace(/[^0-9]/g, '');
    return this.data.appointments.filter(a => a.mobile.replace(/[^0-9]/g, '').includes(clean));
  }

  // Generate next token e.g. A-030
  generateNextToken() {
    this.data.queue.lastTokenNumber = (this.data.queue.lastTokenNumber || 29) + 1;
    const num = this.data.queue.lastTokenNumber;
    const tokenStr = `A-${String(num).padStart(3, '0')}`;
    this.save();
    return tokenStr;
  }

  createAppointment(details) {
    const tokenNumber = this.generateNextToken();
    const id = `apt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
    
    const newAppointment = {
      id,
      tokenNumber,
      patientName: details.patientName.trim(),
      mobile: details.mobile.trim(),
      age: Number(details.age),
      gender: details.gender,
      problemDescription: details.problemDescription.trim(),
      additionalNotes: (details.additionalNotes || '').trim(),
      date: details.date,
      timeSlot: details.timeSlot,
      status: "Waiting",
      paymentStatus: details.paymentMethod === 'Pay Now' ? 'PAID' : 'PAY_AT_CLINIC',
      paymentMethod: details.paymentMethod === 'Pay Now' ? 'Pay Now (Online)' : 'Pay at Clinic',
      amount: details.amount || this.data.clinic.consultationFee,
      createdAt: new Date().toISOString()
    };

    this.data.appointments.push(newAppointment);
    this.save();
    return newAppointment;
  }

  updateAppointment(id, updates) {
    const index = this.data.appointments.findIndex(a => a.id === id || a.tokenNumber === id);
    if (index === -1) return null;
    this.data.appointments[index] = { ...this.data.appointments[index], ...updates };
    this.save();
    return this.data.appointments[index];
  }

  // Live queue actions
  callNextPatient() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppts = this.data.appointments
      .filter(a => a.date === todayStr)
      .sort((a, b) => a.tokenNumber.localeCompare(b.tokenNumber));

    // Mark current serving as Completed if any
    const current = todayAppts.find(a => a.status === 'Now Serving');
    if (current) {
      current.status = 'Completed';
      current.completedAt = new Date().toISOString();
    }

    // Find next Waiting patient
    const nextPatient = todayAppts.find(a => a.status === 'Waiting');
    if (nextPatient) {
      nextPatient.status = 'Now Serving';
      nextPatient.servedAt = new Date().toISOString();
      this.data.queue.currentToken = nextPatient.tokenNumber;
      this.data.queue.currentTokenId = nextPatient.id;
    } else {
      this.data.queue.currentToken = "None";
      this.data.queue.currentTokenId = null;
    }

    this.save();
    return {
      currentToken: this.data.queue.currentToken,
      nextPatient,
      completedPatient: current
    };
  }

  setCurrentServingToken(tokenNumber) {
    const todayStr = new Date().toISOString().split('T')[0];
    const target = this.data.appointments.find(a => a.tokenNumber === tokenNumber && a.date === todayStr);

    // Any currently serving patient moves to completed or waiting
    this.data.appointments.forEach(a => {
      if (a.date === todayStr && a.status === 'Now Serving' && a.tokenNumber !== tokenNumber) {
        a.status = 'Waiting';
      }
    });

    if (target) {
      target.status = 'Now Serving';
      target.servedAt = new Date().toISOString();
      this.data.queue.currentToken = target.tokenNumber;
      this.data.queue.currentTokenId = target.id;
    } else {
      this.data.queue.currentToken = tokenNumber;
      this.data.queue.currentTokenId = null;
    }

    this.save();
    return this.getQueueStatus();
  }

  getQueueStatus() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppts = this.data.appointments
      .filter(a => a.date === todayStr)
      .sort((a, b) => a.tokenNumber.localeCompare(b.tokenNumber));

    const currentToken = this.data.queue.currentToken;
    const currentPatient = todayAppts.find(a => a.tokenNumber === currentToken);

    // Build the visual queue representation:
    // list of appointments showing served checkmarks, now serving, and waiting
    const queueList = todayAppts.map(apt => {
      return {
        tokenNumber: apt.tokenNumber,
        id: apt.id,
        status: apt.status,
        patientName: apt.patientName,
        timeSlot: apt.timeSlot,
        paymentStatus: apt.paymentStatus,
        problemDescription: apt.problemDescription,
        age: apt.age,
        gender: apt.gender,
        isCurrent: apt.tokenNumber === currentToken
      };
    });

    return {
      date: todayStr,
      currentToken: this.data.queue.currentToken,
      currentPatient: currentPatient || null,
      totalToday: todayAppts.length,
      waitingCount: todayAppts.filter(a => a.status === 'Waiting').length,
      completedCount: todayAppts.filter(a => a.status === 'Completed').length,
      cancelledCount: todayAppts.filter(a => a.status === 'Cancelled').length,
      onlinePaymentsSum: todayAppts
        .filter(a => a.paymentStatus === 'PAID' && a.paymentMethod.includes('Online'))
        .reduce((sum, a) => sum + (a.amount || 500), 0),
      clinicPaymentsSum: todayAppts
        .filter(a => a.paymentStatus === 'PAY_AT_CLINIC')
        .reduce((sum, a) => sum + (a.amount || 500), 0),
      queueList
    };
  }

  // Get available slots for a given date
  getAvailableSlots(dateStr) {
    const doctor = this.data.doctor;
    if (!doctor.isAvailable) {
      return { available: false, message: "Doctor is unavailable on this date", slots: [] };
    }

    // Default morning & evening slots
    const allSlots = [
      "10:00 AM", "10:20 AM", "10:40 AM", "11:00 AM", "11:20 AM", "11:40 AM",
      "12:00 PM", "12:20 PM", "12:40 PM", "01:00 PM", "01:20 PM", "01:40 PM",
      "05:00 PM", "05:20 PM", "05:40 PM", "06:00 PM", "06:20 PM", "06:40 PM",
      "07:00 PM", "07:20 PM", "07:40 PM"
    ];

    const bookedAppointments = this.data.appointments.filter(
      a => a.date === dateStr && a.status !== 'Cancelled'
    );
    const bookedSlotMap = {};
    bookedAppointments.forEach(a => {
      bookedSlotMap[a.timeSlot] = true;
    });

    const slotsWithStatus = allSlots.map(time => ({
      time,
      isBooked: !!bookedSlotMap[time],
      isAvailable: !bookedSlotMap[time]
    }));

    return {
      available: true,
      doctor: {
        name: doctor.name,
        specialization: doctor.specialization,
        fee: doctor.fee
      },
      slots: slotsWithStatus
    };
  }
}

const db = new ClinicDatabase();
module.exports = db;
