import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

function Signup({ setUser }) {
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
      setUser(result.user);
      alert('Account created successfully!');
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="main_login">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="row shadow-lg rounded-2 overflow-hidden login-wrapper w-100" style={{ maxWidth: '960px' }}>
          {/* Image Section */}
          <div className="col-md-4 p-0">
            <img src="/AIDOC.webp" alt="Health Illustration" className="img-fluid h-100 w-100 object-fit-cover" />
          </div>
          {/* Form Section */}
          <div className="col-md-8 p-5 bg-white d-flex flex-column justify-content-center">
            <div className="login-card mx-auto" style={{ maxWidth: 420, width: '100%' }}>
              <h1 className="text-primary mb-3">Create Account</h1>
              <p className="text-secondary mb-4">Fill in the details to sign up.</p>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSignup}>
                <div className="mb-3">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Username (optional)</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Phone Number (optional)</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className="form-control"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-4">
                  <label>Specialization (optional)</label>
                  <input
                    type="text"
                    name="specialization"
                    className="form-control"
                    value={formData.specialization}
                    onChange={handleChange}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>

                <div className="mt-3 text-center">
                  <p className="text-secondary mb-0">
                    Already have an account?{' '}
                    <a href="/login" className="text-primary">Login</a>
                  </p>
                </div>
              </form>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}

export default Signup;