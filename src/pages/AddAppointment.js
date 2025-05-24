import React, { useState } from 'react';

function AddAppointment() {
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientName || !date || !time) {
      setMessage('Please fill in all required fields');
      return;
    }

    const appointmentData = { patientName, date, time, notes };

    try {
      // Replace this with real API endpoint
      const response = await fetch('https://your-backend-api.com/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        setMessage('Appointment added successfully!');
        setPatientName('');
        setDate('');
        setTime('');
        setNotes('');
      } else {
        setMessage('Failed to add appointment');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    }
  };

  return (
    <div className="container">
      <h1 className="heading">Add New Appointment</h1>
      <form onSubmit={handleSubmit}>
        <label>Patient Name*</label>
        <input
          type="text"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          required
        />

        <label>Date*</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <label>Time*</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />

        <label>Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        ></textarea>

        <button type="submit" className="btn">Add Appointment</button>

        {message && <p className="text" style={{ marginTop: '15px' }}>{message}</p>}
      </form>
    </div>
  );
}

export default AddAppointment;
