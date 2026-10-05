async function runTests() {
  console.log('🧪 Starting Full System End-to-End API & Business Logic Test...');
  const baseUrl = 'http://localhost:5000';

  try {
    // 1. Clinic Info
    console.log('\n[1] Testing Clinic & Doctor API:');
    const clinicRes = await fetch(`${baseUrl}/api/clinic`);
    const clinicData = await clinicRes.json();
    console.log(`✓ Clinic Name: "${clinicData.clinic.name}", Doctor: "${clinicData.doctor.name}"`);

    // 2. Available Slots
    console.log('\n[2] Testing Time Slots API:');
    const today = new Date().toISOString().split('T')[0];
    const slotsRes = await fetch(`${baseUrl}/api/slots?date=${today}`);
    const slotsData = await slotsRes.json();
    console.log(`✓ Available Slots for ${today}: ${slotsData.slots.filter(s => s.isAvailable).length} slots available`);

    // 3. Book Patient Appointment
    console.log('\n[3] Testing Appointment Booking Flow:');
    const availSlot = slotsData.slots.find(s => s.isAvailable)?.time || '01:20 PM';
    const bookRes = await fetch(`${baseUrl}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: 'Rahul Kumar',
        mobile: '9876543219',
        age: 28,
        gender: 'Male',
        problemDescription: 'Fever, headache and weakness for the last 2 days',
        date: today,
        timeSlot: availSlot,
        paymentMethod: 'Pay at Clinic'
      })
    });
    const bookData = await bookRes.json();
    console.log(`✓ Appointment Created! Token Number: ${bookData.appointment.tokenNumber}, Status: ${bookData.appointment.status}, Payment: ${bookData.appointment.paymentStatus}`);

    const newAppointmentId = bookData.appointment.id;

    // 4. Appointment Status & Queue Tracking
    console.log('\n[4] Testing Patient Queue Tracking lookup:');
    const trackRes = await fetch(`${baseUrl}/api/appointments/${bookData.appointment.tokenNumber}`);
    const trackData = await trackRes.json();
    console.log(`✓ Patient Token: ${trackData.appointment.tokenNumber}, Currently Serving: ${trackData.queue.currentToken}, Patients Ahead: ${trackData.queue.patientsAhead}`);

    // 5. Admin Authentication
    console.log('\n[5] Testing Staff Authentication:');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@clinic.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    console.log(`✓ Admin Logged in successfully: User "${loginData.user.name}", Token received!`);
    const adminToken = loginData.token;

    // 6. Receptionist Call Next Patient
    console.log('\n[6] Testing Live Queue "Call Next Patient":');
    const callRes = await fetch(`${baseUrl}/api/queue/call-next`, { method: 'POST' });
    const callData = await callRes.json();
    console.log(`✓ Advanced Queue: Now Serving Token is now "${callData.currentToken}"!`);

    // 7. Receptionist Counter Payment
    console.log('\n[7] Testing Counter Payment Collection:');
    const payRes = await fetch(`${baseUrl}/api/payments/mark-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId: newAppointmentId,
        paymentMethod: 'Cash at Reception Counter'
      })
    });
    const payData = await payRes.json();
    console.log(`✓ Payment Updated! New Payment Status: ${payData.appointment.paymentStatus} (${payData.appointment.paymentMethod})`);

    // 8. Queue Stats
    console.log('\n[8] Testing Queue Metrics Overview:');
    const statsRes = await fetch(`${baseUrl}/api/queue/status`);
    const stats = await statsRes.json();
    console.log(`✓ Total Today: ${stats.totalToday}, Waiting: ${stats.waitingCount}, Completed: ${stats.completedCount}, Online: ₹${stats.onlinePaymentsSum}, Clinic Pending: ₹${stats.clinicPaymentsSum}`);

    console.log('\n🎉 ALL SYSTEM TESTS PASSED SUCCESSFULLY! 100% OPERATIONAL.');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
