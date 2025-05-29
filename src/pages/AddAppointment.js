import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentService } from '../services/appointments';
import { usersService } from '../services/users';
import { authService } from '../services/auth';
import { dateTimeUtils } from '../utils/dateTime';

function AddAppointment() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form fields
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    startTime: '',
    duration: '30', // Default 30 minutes
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const result = await usersService.getAllPatients({ pageSize: 100 });
      if (result.success) {
        setPatients(result.data.items || []);
      } else {
        setError('Failed to load patients');
      }
    } catch (err) {
      setError('Failed to load patients');
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const calculateEndTime = (date, startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':');
    const startDate = new Date(date);
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return endDate;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate form data
      if (!formData.patientId || !formData.date || !formData.startTime) {
        throw new Error('Please fill in all required fields');
      }

      // Calculate start and end dates
      const startDate = new Date(formData.date);
      const [hours, minutes] = formData.startTime.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endDate = calculateEndTime(formData.date, formData.startTime, parseInt(formData.duration));

      // Validate appointment time
      const validation = dateTimeUtils.validateAppointmentTime(startDate, endDate);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Check if appointment is in the past
      if (dateTimeUtils.isPastAppointment(startDate)) {
        throw new Error('Cannot create appointments in the past');
      }

      // Prepare appointment data
      const appointmentData = {
        patientId: formData.patientId,
        doctorId: currentUser.id,
        appointmentStartDate: startDate.toISOString(),
        appointmentEndDate: endDate.toISOString(),
        notes: formData.notes || null
      };

      // Check for conflicts
      const conflictResult = await appointmentService.checkConflicts(
        currentUser.id,
        startDate,
        endDate
      );

      if (conflictResult.success && conflictResult.hasConflicts) {
        throw new Error('This time slot conflicts with another appointment');
      }

      // Create appointment
      const result = await appointmentService.createAppointment(appointmentData);
      
      if (result.success) {
        setSuccess('Appointment created successfully!');
        // Reset form
        setFormData({
          patientId: '',
          date: '',
          startTime: '',
          duration: '30',
          notes: ''
        });
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Generate time options (8 AM to 5:30 PM in 30-minute intervals)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip times after 5:30 PM to ensure appointments end by 6 PM
        if (hour === 17 && minute > 30) continue;
        
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const label = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        });
        options.push({ value: time, label });
      }
    }
    return options;
  };

  if (loadingPatients) {
    return (
      <div className="container">
        <p style={{ textAlign: 'center' }}>Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="heading">Add New Appointment</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          color: '#c00', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          backgroundColor: '#efe', 
          color: '#0a0', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px' 
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>Patient*</label>
        <select
          name="patientId"
          value={formData.patientId}
          onChange={handleChange}
          required
          disabled={loading}
        >
          <option value="">Select a patient</option>
          {patients.map(patient => (
            <option key={patient.id} value={patient.id}>
              {patient.email} {patient.profile && `(${patient.profile.firstName} ${patient.profile.lastName})`}
            </option>
          ))}
        </select>

        <label>Date*</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          min={getMinDate()}
          required
          disabled={loading}
        />

        <label>Start Time*</label>
        <select
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          required
          disabled={loading}
        >
          <option value="">Select time</option>
          {generateTimeOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label>Duration*</label>
        <select
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          required
          disabled={loading}
        >
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">1 hour</option>
        </select>

        <label>Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Add any notes about this appointment..."
          disabled={loading}
        />

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Creating...' : 'Add Appointment'}
        </button>
      </form>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
          <strong>Note:</strong> Appointments must be scheduled between 8:00 AM and 6:00 PM.
        </p>
      </div>
    </div>
  );
}

export default AddAppointment;