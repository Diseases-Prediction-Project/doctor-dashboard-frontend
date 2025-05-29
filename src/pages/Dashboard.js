import React from 'react';
import { authService } from '../services/auth';

const Dashboard = () => {
  const user = authService.getCurrentUser();
  
  // Placeholder data (you can replace with real API data later)
  const upcomingAppointments = [
    { id: 1, patient: 'John Doe', time: '2025-05-18 10:00 AM' },
    { id: 2, patient: 'Jane Smith', time: '2025-05-18 11:30 AM' },
    { id: 3, patient: 'Michael Lee', time: '2025-05-18 02:00 PM' },
  ];

  const totalAppointments = 34; // Example number
  const totalPatients = 12; // Example number

  return (
    <div className="container">
      <h1 className="heading">Welcome to your Dashboard, Dr. {user?.email?.split('@')[0] || 'Doctor'}</h1>
      <p className="text">
        Here you can easily manage your appointments, review patient information, and keep track of your daily schedule.
      </p>
      <p className="text">
        Use the navigation links above to update your profile, add new appointments manually, and set your working hours.
      </p>
      <p className="text" style={{ fontStyle: 'italic', color: '#666' }}>
        Stay organized and provide the best care for your patients!
      </p>

      <hr style={{ margin: '30px 0' }} />

      <h2 className="heading" style={{ fontSize: '20px' }}>Upcoming Appointments</h2>
      {upcomingAppointments.length === 0 ? (
        <p className="text">No upcoming appointments.</p>
      ) : (
        <ul className="list">
          {upcomingAppointments.map((appt) => (
            <li key={appt.id} className="list-item">
              <strong>{appt.patient}</strong> - {appt.time}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
