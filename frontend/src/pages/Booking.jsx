import React, { useState, useContext } from 'react';
import API from '../scripts/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, Users, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const Booking = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Calendar Logic States
  const [currMonth, setCurrMonth] = useState(new Date().getMonth());
  const [currYear, setCurrYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({ time: '19:00', guests: 2 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(currYear, currMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currYear, currMonth, 1).getDay();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const handlePrevMonth = () => {
    if (currMonth === 0) { setCurrYear(currYear - 1); setCurrMonth(11); }
    else { setCurrMonth(currMonth - 1); }
  };

  const handleNextMonth = () => {
    if (currMonth === 11) { setCurrYear(currYear + 1); setCurrMonth(0); }
    else { setCurrMonth(currMonth + 1); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setError("Please login to book a table."); return; }

    // Logic Fix: Prevent submission if date is somehow selected in the past
    const todayCheck = new Date();
    todayCheck.setHours(0, 0, 0, 0);
    if (selectedDate < todayCheck) {
      setError("Cannot book a table for a past date.");
      return;
    }

    setLoading(true);
    try {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      await API.post('/booking', { ...formData, date: formattedDate });
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
          <p className="text-gray-500 mb-8">We've saved a spot for you, {user.name}. See you on {selectedDate.toDateString()}!</p>
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

        {/* Left Side: Restored Visuals */}
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

        {/* Right Side: Optimized Custom Calendar Form */}
        <div className="bg-white p-6 md:p-8 rounded-[3rem] shadow-xl border border-gray-100 max-w-md mx-auto w-full">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Booking Details</h3>

          {error && <p className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-xs font-medium">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Custom Compact Calendar Grid */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase ml-2 flex items-center gap-2 tracking-widest">
                <Calendar size={14} className="text-orange-600" /> Select Date
              </label>

              <div className="bg-gray-50 p-4 rounded-[2rem] border border-gray-100">
                <div className="flex justify-between items-center mb-3 px-1">
                  <h4 className="font-black text-xs uppercase tracking-tighter">{monthNames[currMonth]} {currYear}</h4>
                  <div className="flex gap-1">
                    <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-white rounded-full transition-all"><ChevronLeft size={16} /></button>
                    <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-white rounded-full transition-all"><ChevronRight size={16} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <span key={day} className="text-[9px] font-black text-gray-300">{day}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateObj = new Date(currYear, currMonth, day);

                    // Logic Fix: Strictly normalize for mobile date comparison
                    const compareDate = new Date(dateObj);
                    compareDate.setHours(0, 0, 0, 0);

                    const isPast = compareDate < today;
                    const isSelected = selectedDate.toDateString() === dateObj.toDateString();

                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={isPast}
                        onClick={() => !isPast && setSelectedDate(dateObj)}
                        className={`aspect-square flex items-center justify-center text-xs font-bold rounded-xl transition-all
                          ${isPast ? "text-gray-200 cursor-not-allowed opacity-40" : "hover:bg-orange-100 text-gray-700"}
                          ${isSelected ? "bg-orange-600 text-white shadow-lg shadow-orange-100 scale-105" : ""}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 flex items-center gap-2 tracking-widest">
                  <Clock size={14} className="text-orange-600" /> Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-sm"
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 flex items-center gap-2 tracking-widest">
                  <Users size={14} className="text-orange-600" /> Guests
                </label>
                <select
                  value={formData.guests}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-sm appearance-none cursor-pointer"
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                    <option key={num} value={num}>{num} People</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Reserve Table Now'}
            </button>
          </form>

          <p className="text-center text-[10px] text-gray-400 mt-6 px-4 uppercase font-bold tracking-widest">
            15-minute wait policy applies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Booking;