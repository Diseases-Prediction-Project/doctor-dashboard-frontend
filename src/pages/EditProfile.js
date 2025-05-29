import React, { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { usersService } from '../services/users';
import { profileService } from '../services/profile';

const EditProfile = () => {
  const currentUser = authService.getCurrentUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Profile state
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    specialization: '',
    username: ''
  });

  // Load user profile on mount
  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    }
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (currentUser && currentUser.profile) {
        // Use data from current user if available
        setProfile({
          firstName: currentUser.profile.firstName || '',
          lastName: currentUser.profile.lastName || '',
          email: currentUser.email || '',
          phoneNumber: currentUser.profile.phoneNumber || '',
          specialization: currentUser.profile.specialization || '',
          username: currentUser.profile.username || ''
        });
      } else if (currentUser && currentUser.id) {
        // Fetch fresh data from backend
        const result = await usersService.getCurrentUser(currentUser.id);
        if (result.success && result.data.profile) {
          setProfile({
            firstName: result.data.profile.firstName || '',
            lastName: result.data.profile.lastName || '',
            email: result.data.email || '',
            phoneNumber: result.data.profile.phoneNumber || '',
            specialization: result.data.profile.specialization || '',
            username: result.data.profile.username || ''
          });
        }
      }
    } catch (err) {
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile input change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Update profile via API
      if (currentUser && currentUser.profile && currentUser.profile.id) {
        const profileData = {
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber || null,
          specialization: profile.specialization || null,
          username: profile.username
        };

        const result = await profileService.updateProfile(currentUser.profile.id, profileData);
        
        if (result.success) {
          // Update local storage with new profile data
          const updatedUser = {
            ...currentUser,
            profile: {
              ...currentUser.profile,
              ...profileData
            }
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          setSuccess('Profile updated successfully!');
          
          // Hide success message after 3 seconds
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(result.error || 'Failed to update profile');
        }
      }
    } catch (err) {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p style={{ textAlign: 'center' }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="heading">Edit Profile</h1>
      
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
      
      <form onSubmit={handleSubmit} className="form-container">
        <section className="section">
          <h2>Profile Information</h2>
          
          <label>
            First Name*
            <input
              type="text"
              name="firstName"
              value={profile.firstName}
              onChange={handleProfileChange}
              required
              disabled={saving}
              minLength="2"
              maxLength="50"
            />
          </label>
          
          <label>
            Last Name*
            <input
              type="text"
              name="lastName"
              value={profile.lastName}
              onChange={handleProfileChange}
              required
              disabled={saving}
              minLength="2"
              maxLength="50"
            />
          </label>
          
          <label>
            Email
            <input
              type="email"
              name="email"
              value={profile.email}
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small style={{ color: '#666' }}>Email cannot be changed</small>
          </label>
          
          <label>
            Username
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleProfileChange}
              required
              disabled={saving}
              pattern="^[a-zA-Z0-9_-]+$"
              minLength="3"
              maxLength="30"
            />
            <small style={{ color: '#666' }}>Letters, numbers, underscores, and hyphens only</small>
          </label>
          
          <label>
            Phone Number
            <input
              type="tel"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleProfileChange}
              disabled={saving}
              placeholder="+1234567890"
            />
          </label>
          
          <label>
            Specialization
            <input
              type="text"
              name="specialization"
              value={profile.specialization}
              onChange={handleProfileChange}
              disabled={saving}
              placeholder="e.g., Cardiology, Pediatrics"
            />
          </label>
        </section>

        <div style={{ marginTop: '20px' }}>
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
      
      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>Profile Summary</h3>
        <p style={{ margin: '5px 0' }}><strong>Full Name:</strong> Dr. {profile.firstName} {profile.lastName}</p>
        <p style={{ margin: '5px 0' }}><strong>Email:</strong> {profile.email}</p>
        <p style={{ margin: '5px 0' }}><strong>Phone:</strong> {profile.phoneNumber || 'Not provided'}</p>
        <p style={{ margin: '5px 0' }}><strong>Specialization:</strong> {profile.specialization || 'Not specified'}</p>
        <p style={{ margin: '5px 0' }}><strong>Account Type:</strong> Doctor</p>
      </div>
    </div>
  );
};

export default EditProfile;