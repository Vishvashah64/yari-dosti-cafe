import React, { useState, useContext } from 'react';
import API from '../scripts/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';

const Booking = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: 2
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Please login to book a table.");
      return;
    }
    
    setLoading(true);
    try {
      await API.post('/booking', formData);
      setSuccess(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl text-center border border-orange-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Table Reserved!</h2>
          <p className="text-gray-500 mb-8">We've saved a spot for you, {user.name}. See you at the cafe!</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Visuals */}
        <div className="hidden lg:block">
          <h2 className="text-6xl font-black text-gray-900 mb-6 leading-tight">
            Reserve Your <br />
            <span className="text-orange-600 font-serif italic uppercase">Perfect Spot.</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Whether it's a birthday celebration or a casual dosti hangout, we ensure the best vibes and the freshest chai.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm">
              <h4 className="font-bold text-orange-600 mb-1 italic">Private Corner</h4>
              <p className="text-sm text-gray-500">For quiet talks & work.</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm">
              <h4 className="font-bold text-orange-600 mb-1 italic">Lounge Area</h4>
              <p className="text-sm text-gray-500">For the big dosti groups.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-gray-100">
          <h3 className="text-2xl font-bold mb-8 text-gray-800">Booking Details</h3>
          
          {error && <p className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-medium">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase ml-2 flex items-center gap-2">
                  <Calendar size={14} /> Date
                </label>
                <input 
                  type="date" 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 uppercase ml-2 flex items-center gap-2">
                  <Clock size={14} /> Time
                </label>
                <input 
                  type="time" 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase ml-2 flex items-center gap-2">
                <Users size={14} /> Number of Guests
              </label>
              <select 
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-medium appearance-none"
                onChange={(e) => setFormData({...formData, guests: e.target.value})}
              >
                {[2, 3, 4, 5, 6, 8, 10].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-bold text-lg hover:bg-orange-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Reserve Table Now'}
            </button>
          </form>
          
          <p className="text-center text-xs text-gray-400 mt-6 px-4">
            By booking, you agree to our 15-minute wait policy. For larger groups, please contact us directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Booking;