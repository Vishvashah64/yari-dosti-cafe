import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../scripts/api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/register', formData);
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Join the Dosti</h2>
        <p className="text-center text-gray-500 mb-8">Start your journey with Yari Dosti Cafe.</p>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Full Name"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required 
          />
          <input 
            type="email" 
            placeholder="Email Address"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required 
          />
          <input 
            type="password" 
            placeholder="Create Password"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required 
          />
          <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors mt-4">
            Register Now
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Already a member? <Link to="/login" className="text-orange-600 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;