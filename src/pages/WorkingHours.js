
// src/pages/WorkingHours.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function WorkingHours() {
  const navigate = useNavigate();
  const [open, setOpen] = useState('09:00');
  const [close, setClose] = useState('17:00');

  useEffect(() => {
    const doctor = JSON.parse(localStorage.getItem('doctor'));
    if (!doctor) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSave = () => {
    alert(`Working hours updated: ${open} - ${close}`);
  };

  return (
    <div>
      <h2>Set Working Hours</h2>
      <label>Open Time: <input type="time" value={open} onChange={e => setOpen(e.target.value)} /></label>
      <label>Close Time: <input type="time" value={close} onChange={e => setClose(e.target.value)} /></label>
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

export default WorkingHours;
