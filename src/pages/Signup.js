import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Generate username from first and last name if not provided
    const username = formData.username || 
      `${formData.firstName.toLowerCase()}_${formData.lastName.toLowerCase()}`.replace(/\s/g, '_');

    const signupData = {
      email: formData.email,
      password: formData.password,
      profile: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: username,
        isPatient: false,
        isDoctor: true,
        profilePicture: null,
        phoneNumber: formData.phoneNumber || null,
        specialization: formData.specialization || null
      }
    };

    const result = await authService.signup(signupData);
    
    if (result.success) {
      alert('Account created successfully!');
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="page-container">
      <h2>Sign Up</h2>
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
          {error}
        </div>
      )}
      <form onSubmit={handleSignup} className="form">
        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChange={handleChange}
          required
          disabled={loading}
          minLength="2"
          maxLength="50"
        />
        
        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChange={handleChange}
          required
          disabled={loading}
          minLength="2"
          maxLength="50"
        />
        
        <label>Username (optional)</label>
        <input
          type="text"
          name="username"
          placeholder="Enter a username (auto-generated if empty)"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
          pattern="^[a-zA-Z0-9_-]+$"
          minLength="3"
          maxLength="30"
        />
        
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
        
        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
          minLength="6"
        />
        
        <label>Phone Number (optional)</label>
        <input
          type="tel"
          name="phoneNumber"
          placeholder="Enter your phone number"
          value={formData.phoneNumber}
          onChange={handleChange}
          disabled={loading}
        />
        
        <label>Specialization (optional)</label>
        <input
          type="text"
          name="specialization"
          placeholder="e.g., Cardiology, Pediatrics"
          value={formData.specialization}
          onChange={handleChange}
          disabled={loading}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default Signup;