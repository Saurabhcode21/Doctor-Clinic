require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const server = http.createServer(app);

const JWT_SECRET = process.env.JWT_SECRET || 'sanjeevani_clinic_secret_key_2026';
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Enable CORS for frontend Vite dev server (usually 5173) and production hosts
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

app.use(express.json());

// Setup Socket.IO for real-time queue synchronization
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

// Broadcast live queue status helper
function broadcastQueueUpdate(action = 'update', payload = {}) {
  const status = db.getQueueStatus();
  io.emit('queue:updated', {
    action,
    queue: status,
    payload,
    timestamp: new Date().toISOString()
  });
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`[Socket] New client connected: ${socket.id}`);
  
  // Immediately send current queue status to the newly connected client
  socket.emit('queue:status', db.getQueueStatus());

  // Allow patient or display board to join room
  socket.on('join:patient', (tokenNumber) => {
    socket.join(`patient:${tokenNumber}`);
    console.log(`[Socket] Client ${socket.id} joined token channel: ${tokenNumber}`);
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

// JWT Middleware for Admin routes
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
}

// ----------------- ROUTES ----------------- //

// 1. Clinic & Doctor Information
app.get('/api/clinic', (req, res) => {
  const clinic = db.getClinicInfo();
  const doctor = db.getDoctor();
  res.json({ clinic, doctor });
});

app.put('/api/clinic', authenticateAdmin, (req, res) => {
  const updated = db.updateClinicInfo(req.body);
  res.json({ success: true, clinic: updated });
});

app.put('/api/doctor', authenticateAdmin, (req, res) => {
  const updated = db.updateDoctor(req.body);
  res.json({ success: true, doctor: updated });
});

// 2. Doctor Schedule & Available Time Slots
app.get('/api/slots', (req, res) => {
  const dateStr = req.query.date || new Date().toISOString().split('T')[0];
  const slotsData = db.getAvailableSlots(dateStr);
  res.json(slotsData);
});

// 3. Appointments API
// Create appointment (Patient or Receptionist)
app.post('/api/appointments', (req, res) => {
  const { patientName, mobile, age, gender, problemDescription, additionalNotes, date, timeSlot, paymentMethod } = req.body;

  if (!patientName || !mobile || !age || !gender || !problemDescription || !date || !timeSlot) {
    return res.status(400).json({ error: 'Missing required fields for appointment booking' });
  }

  // Validate slot availability (Rule: slot cannot be double booked)
  const existingForSlot = db.getAppointments({ date }).find(
    a => a.timeSlot === timeSlot && a.status !== 'Cancelled'
  );
  if (existingForSlot) {
    return res.status(409).json({ error: 'This time slot was just booked by another patient. Please select another slot.' });
  }

  const appointment = db.createAppointment({
    patientName,
    mobile,
    age,
    gender,
    problemDescription,
    additionalNotes,
    date,
    timeSlot,
    paymentMethod: paymentMethod || 'Pay at Clinic'
  });

  // Broadcast real-time queue update
  broadcastQueueUpdate('appointment_created', { appointment });

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    appointment
  });
});

// Get appointments (with filtering & search)
app.get('/api/appointments', (req, res) => {
  const { date, status, paymentStatus, search, mobile } = req.query;
  
  if (mobile) {
    const list = db.getAppointmentByMobile(mobile);
    return res.json({ appointments: list });
  }

  const list = db.getAppointments({ date, status, paymentStatus, search });
  res.json({ appointments: list });
});

// Get specific appointment by token or ID
app.get('/api/appointments/:id', (req, res) => {
  const appointment = db.getAppointmentById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  // Include queue position info for this patient
  const todayStr = new Date().toISOString().split('T')[0];
  const queueStatus = db.getQueueStatus();

  let patientsAhead = 0;
  let queueState = 'Waiting';

  if (appointment.date === todayStr) {
    const waitingList = queueStatus.queueList.filter(a => a.status === 'Waiting');
    const indexInWaiting = waitingList.findIndex(a => a.tokenNumber === appointment.tokenNumber);
    if (indexInWaiting !== -1) {
      patientsAhead = indexInWaiting;
    }
    if (appointment.tokenNumber === queueStatus.currentToken) {
      queueState = 'Now Serving';
      patientsAhead = 0;
    } else if (appointment.status === 'Completed') {
      queueState = 'Completed';
    } else if (appointment.status === 'Cancelled') {
      queueState = 'Cancelled';
    } else if (patientsAhead <= 2 && patientsAhead >= 0) {
      queueState = 'Your Turn Soon';
    }
  }

  res.json({
    appointment,
    queue: {
      currentToken: queueStatus.currentToken,
      patientsAhead,
      queueState,
      totalToday: queueStatus.totalToday,
      queueList: queueStatus.queueList
    }
  });
});

// Update appointment (Status, Payment status, rescheduling)
app.put('/api/appointments/:id', (req, res) => {
  const updated = db.updateAppointment(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  // If status changed to Now Serving or Completed, sync queue
  if (req.body.status === 'Now Serving') {
    db.setCurrentServingToken(updated.tokenNumber);
  }

  broadcastQueueUpdate('appointment_updated', { appointment: updated });
  res.json({ success: true, appointment: updated });
});

// 4. Live Queue API
app.get('/api/queue/status', (req, res) => {
  const status = db.getQueueStatus();
  res.json(status);
});

// Receptionist action: Call Next Patient
app.post('/api/queue/call-next', (req, res) => {
  const result = db.callNextPatient();
  broadcastQueueUpdate('call_next', result);

  if (result.nextPatient) {
    // Notify specific patient channel
    io.to(`patient:${result.nextPatient.tokenNumber}`).emit('patient:called', {
      tokenNumber: result.nextPatient.tokenNumber,
      message: 'It is your turn now! Please proceed to the doctor consultation room.'
    });
  }

  res.json({ success: true, ...result, queue: db.getQueueStatus() });
});

// Receptionist action: Set specific serving token
app.post('/api/queue/set-serving', (req, res) => {
  const { tokenNumber } = req.body;
  if (!tokenNumber) {
    return res.status(400).json({ error: 'Token number is required' });
  }
  const queue = db.setCurrentServingToken(tokenNumber);
  broadcastQueueUpdate('set_serving', { tokenNumber });
  res.json({ success: true, queue });
});

// Receptionist action: Play chime / re-announce current token
app.post('/api/queue/chime', (req, res) => {
  const status = db.getQueueStatus();
  io.emit('queue:announce', {
    currentToken: status.currentToken,
    currentPatient: status.currentPatient
  });
  res.json({ success: true, message: 'Chime broadcasted' });
});

// 5. Payment Simulation & Gateway Integration
app.post('/api/payments/mock-online-pay', (req, res) => {
  const { appointmentId, paymentMethod = 'UPI / NetBanking' } = req.body;
  const appointment = db.getAppointmentById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const transactionId = `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  const updated = db.updateAppointment(appointment.id, {
    paymentStatus: 'PAID',
    paymentMethod: `Online (${paymentMethod})`,
    transactionId,
    paidAt: new Date().toISOString()
  });

  broadcastQueueUpdate('payment_updated', { appointment: updated });
  res.json({
    success: true,
    transactionId,
    message: 'Payment verified and appointment marked as PAID',
    appointment: updated
  });
});

// Mark Pay at Clinic as Paid (counter payment)
app.post('/api/payments/mark-paid', (req, res) => {
  const { appointmentId, paymentMethod = 'Cash at Counter' } = req.body;
  const appointment = db.getAppointmentById(appointmentId);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const transactionId = `CLINIC_${Date.now()}`;
  const updated = db.updateAppointment(appointment.id, {
    paymentStatus: 'PAID',
    paymentMethod: paymentMethod,
    transactionId,
    paidAt: new Date().toISOString()
  });

  broadcastQueueUpdate('payment_updated', { appointment: updated });
  res.json({ success: true, appointment: updated });
});

// 6. Admin Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const admin = db.getAdmin();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (email.toLowerCase() !== admin.email.toLowerCase()) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isMatch = bcrypt.compareSync(password, admin.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { email: admin.email, name: admin.name, role: admin.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    token,
    user: {
      email: admin.email,
      name: admin.name,
      role: admin.role
    }
  });
});

app.get('/api/auth/me', authenticateAdmin, (req, res) => {
  res.json({ user: req.user });
});

// Production: Serve static client build if dist folder exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Static] Serving frontend from ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start Server
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🏥 Doctor Clinic & Queue Management Backend`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready for live queue tracking`);
  console.log(`===============================================`);
});
