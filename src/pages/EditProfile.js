import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function EditProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  useEffect(() => {
    const doctor = JSON.parse(localStorage.getItem('doctor'));
    if (!doctor) {
      navigate('/login');
    } else {
      setName(doctor.name);
    }
  }, [navigate]);

  const handleSave = () => {
    const doctor = { name };
    localStorage.setItem('doctor', JSON.stringify(doctor));
    alert('Profile updated');
  };

  return (
    <div>
      <h2>Edit Profile</h2>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

export default EditProfile;