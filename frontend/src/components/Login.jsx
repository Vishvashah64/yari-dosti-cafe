import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../scripts/api';
// 1. Added useLocation to the imports
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);

  const navigate = useNavigate();
  // 2. Initialize useLocation
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      login(data); // Save to Context & LocalStorage

      // 3. Logic to check the current URL path
      if (location.pathname === '/admin/login') {
        // Redirect to admin dashboard if logged in via admin URL
        navigate('/admin');
      } else {
        // Redirect to menu page for normal login
        navigate('/menu');
      }

    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        setError(errorData.errors.join(' '));
      } else {
        setError(errorData?.message || 'Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* 4. UI Polish: Show "Admin Login" if on the admin route */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {location.pathname === '/admin/login' ? 'Admin Login' : 'Welcome Back'}
        </h2>
        <p className="text-center text-gray-500 mb-8">
          {location.pathname === '/admin/login' ? 'System Management Access' : 'Grab your coffee and settle in.'}
        </p>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
              placeholder="friend@yaridosti.com"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <div className='flex items-center justify-between'>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="text-right mt-2">
                <Link to="/forgot-password" name="forgot-password" className="text-xs text-orange-600 font-bold hover:underline">
                  Forgot Password
                </Link>
              </div>
            </div>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition pr-12"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg">
            Sign In
          </button>
        </form>

        {/* 5. Hide "Create Account" for Admin login for better security/UX */}
        {location.pathname !== '/admin/login' && (
          <p className="mt-6 text-center text-sm text-gray-600">
            New to the cafe? <Link to="/register" className="text-orange-600 font-bold hover:underline">Create an account</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;