import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await authService.login(email, password);
    
    if (result.success) {
      setUser(result.user);
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
  
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="row shadow-lg rounded-2 overflow-hidden login-wrapper w-100" style={{ maxWidth: '960px' }}>
          {/* Form Section */}
          <div className="col-md-6 p-5 bg-white d-flex flex-column justify-content-center">
            <div className="login-card mx-auto" style={{ maxWidth: 420, width: '100%' }}>
              <h1 className="text-primary mb-3">Welcome Back</h1>
              <p className="text-secondary mb-4">Please enter your credentials to log in.</p>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-4">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                <div className="mt-3 text-center">
                  <p className="text-secondary mb-0">
                    Don’t have an account?{' '}
                    <a href="/signup" className="text-primary">Sign up</a>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Image Section */}
          <div className="col-md-6 p-0">
            <img src="/AIDOC.webp" alt="Login illustration" className="img-fluid h-100 w-100 object-fit-cover" />
          </div>
        </div>
      </div>
  );
}

export default Login;
