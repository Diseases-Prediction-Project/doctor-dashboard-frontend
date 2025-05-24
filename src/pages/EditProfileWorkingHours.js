import React, { useState, useEffect } from 'react';

const EditProfileWorkingHours = () => {
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
  });

  // Working hours state (for each day)
  const [workingHours, setWorkingHours] = useState({
    Monday: { open: '', close: '' },
    Tuesday: { open: '', close: '' },
    Wednesday: { open: '', close: '' },
    Thursday: { open: '', close: '' },
    Friday: { open: '', close: '' },
    Saturday: { open: '', close: '' },
    Sunday: { open: '', close: '' },
  });

  // Load initial data from localStorage or API
  useEffect(() => {
    const storedProfile = localStorage.getItem('doctorProfile');
    const storedHours = localStorage.getItem('doctorHours');
    if (storedProfile) setProfile(JSON.parse(storedProfile));
    if (storedHours) setWorkingHours(JSON.parse(storedHours));
  }, []);

  // Handle profile input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle working hours input change
  const handleHoursChange = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage or send to API here
    localStorage.setItem('doctorProfile', JSON.stringify(profile));
    localStorage.setItem('doctorHours', JSON.stringify(workingHours));
    alert('Profile and working hours saved!');
  };

  return (
    <div className="container">
      <h1 className="heading">Edit Profile & Working Hours</h1>
      <form onSubmit={handleSubmit}>
        {/* Profile Section */}
        <section className="section">
          <h2>Profile Information</h2>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              required
            />
          </label>
          <label>
            Phone:
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleProfileChange}
            />
          </label>
          <label>
            Specialty:
            <input
              type="text"
              name="specialty"
              value={profile.specialty}
              onChange={handleProfileChange}
            />
          </label>
        </section>

        {/* Working Hours Section */}
        <section className="section">
          <h2>Working Hours</h2>
          {Object.keys(workingHours).map(day => (
            <div key={day} className="working-hour-row">
              <label>{day}:</label>
              <input
                type="time"
                value={workingHours[day].open}
                onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                required
              />
              <span>to</span>
              <input
                type="time"
                value={workingHours[day].close}
                onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                required
              />
            </div>
          ))}
        </section>

        <button type="submit" className="btn">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProfileWorkingHours;
  