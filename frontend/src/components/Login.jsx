import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../scripts/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', { email, password });
      login(data); // Save to Context & LocalStorage
      navigate('/'); // Redirect to Home
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Welcome Back</h2>
        <p className="text-center text-gray-500 mb-8">Grab your coffee and settle in.</p>
        
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
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg">
            Sign In
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          New to the cafe? <Link to="/register" className="text-orange-600 font-bold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;