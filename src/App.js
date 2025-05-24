// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddAppointment from './pages/AddAppointment';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EditProfileWorkingHours from './pages/EditProfileWorkingHours';
import './App.css';


function App() {
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const storedDoctor = localStorage.getItem('doctor');
    if (storedDoctor) {
      setDoctor(JSON.parse(storedDoctor));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('doctor');
    setDoctor(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="navbar" style={{ display: 'flex', gap: '10px', padding: '10px', backgroundColor: '#1abc9c', color: '#fff' }}>
        {doctor && (
          <>
            <Link style={{ color: 'white' }} to="/dashboard">Dashboard</Link>
                        <Link style={{ color: 'white' }} to="/edit-profile">Edit Profile</Link>
            <Link style={{ color: 'white' }} to="/add-appointment">Add Appointment</Link>

          </>
        )}
        {!doctor && (
          <>
            <Link style={{ color: 'white' }} to="/login">Login</Link>
            <Link style={{ color: 'white' }} to="/signup">Sign Up</Link>
          </>
        )}
        {doctor && (
          <>
            <span style={{ marginLeft: 'auto', color: '#fff' }}>
              Dr. {doctor.name.charAt(0).toUpperCase() + doctor.name.slice(1)}
            </span>
            <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
          </>
        )}
      </div>
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-appointment" element={<AddAppointment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/edit-profile" element={<EditProfileWorkingHours />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
