import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { appointmentService } from '../services/appointments';
import { usersService } from '../services/users';
import { dateTimeUtils } from '../utils/dateTime';

const Dashboard = () => {
  const user = authService.getCurrentUser();
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    todayCount: 0,
    weekCount: 0
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch today's appointments
      const todayResult = await appointmentService.getTodayAppointments();
      if (!todayResult.success) {
        throw new Error(todayResult.error);
      }

      // Fetch upcoming appointments (next 7 days)
      const upcomingResult = await appointmentService.getUpcomingAppointments();
      if (!upcomingResult.success) {
        throw new Error(upcomingResult.error);
      }

      // Process appointments and fetch patient details
      const todayAppointments = todayResult.data.data || todayResult.data.items || [];
      const upcomingAppointments = upcomingResult.data.data || upcomingResult.data.items || [];
      
      const todayWithPatients = await enrichAppointmentsWithPatientData(todayAppointments);
      const upcomingWithPatients = await enrichAppointmentsWithPatientData(upcomingAppointments);

      setTodayAppointments(todayWithPatients);
      setUpcomingAppointments(upcomingWithPatients);
      
      // Calculate stats
      setStats({
        todayCount: todayWithPatients.length,
        weekCount: upcomingWithPatients.length
      });
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const enrichAppointmentsWithPatientData = async (appointments) => {
    const enrichedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        try {
          const patientResult = await usersService.getCurrentUser(appointment.patientId);
          if (patientResult.success) {
            return {
              ...appointment,
              patient: patientResult.data,
              status: dateTimeUtils.getAppointmentStatus(
                appointment.appointmentStartDate,
                appointment.appointmentEndDate
              ),
              duration: dateTimeUtils.calculateDuration(
                appointment.appointmentStartDate,
                appointment.appointmentEndDate
              )
            };
          }
        } catch (err) {
          console.error('Failed to fetch patient data:', err);
        }
        return appointment;
      })
    );
    return enrichedAppointments;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return '#3498db'; // Blue
      case 'ongoing':
        return '#2ecc71'; // Green
      case 'completed':
        return '#95a5a6'; // Gray
      default:
        return '#34495e'; // Dark gray
    }
  };

  const renderAppointmentCard = (appointment) => (
    <div 
      key={appointment.id} 
      className="appointment-card"
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '10px',
        borderLeft: `4px solid ${getStatusColor(appointment.status)}`,
        backgroundColor: appointment.status === 'ongoing' ? '#f0f9ff' : '#fff'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: '0 0 5px 0' }}>
            {appointment.patient?.email || 'Patient'}
          </h4>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
            {dateTimeUtils.formatTime(appointment.appointmentStartDate)} - 
            {dateTimeUtils.formatTime(appointment.appointmentEndDate)}
            <span style={{ marginLeft: '10px', color: '#999' }}>
              ({dateTimeUtils.formatDuration(appointment.duration)})
            </span>
          </p>
          {appointment.notes && (
            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#555' }}>
              <strong>Notes:</strong> {appointment.notes}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            backgroundColor: getStatusColor(appointment.status),
            color: 'white',
            textTransform: 'capitalize'
          }}>
            {appointment.status}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container">
        <p style={{ textAlign: 'center' }}>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="heading">
        Welcome to your Dashboard, Dr. {user?.profile?.lastName || user?.email?.split('@')[0] || 'Doctor'}
      </h1>
      
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

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Today's Appointments</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0', color: '#1abc9c' }}>
            {stats.todayCount}
          </p>
        </div>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Next 7 Days</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '0', color: '#3498db' }}>
            {stats.weekCount}
          </p>
        </div>
      </div>

      <hr style={{ margin: '30px 0' }} />

      <h2 className="heading" style={{ fontSize: '20px' }}>Today's Appointments</h2>
      {todayAppointments.length === 0 ? (
        <p className="text">No appointments scheduled for today.</p>
      ) : (
        <div style={{ marginBottom: '30px' }}>
          {todayAppointments.map(renderAppointmentCard)}
        </div>
      )}

      <h2 className="heading" style={{ fontSize: '20px', marginTop: '30px' }}>Upcoming Appointments</h2>
      {upcomingAppointments.length === 0 ? (
        <p className="text">No upcoming appointments in the next 7 days.</p>
      ) : (
        <div>
          {upcomingAppointments.slice(0, 5).map(renderAppointmentCard)}
          {upcomingAppointments.length > 5 && (
            <p style={{ textAlign: 'center', color: '#666', marginTop: '10px' }}>
              And {upcomingAppointments.length - 5} more appointments...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;