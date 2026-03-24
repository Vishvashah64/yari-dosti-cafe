import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Coffee, User, LogOut, ShoppingBag, ChevronDown, Clock } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <Coffee className="text-orange-600 group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-xl tracking-tight text-gray-800">Yari Dosti <span className="text-orange-600">Cafe</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-orange-600 transition">Home</Link>
            <Link to="/menu" className="hover:text-orange-600 transition">Menu</Link>
            <Link to="/booking" className="hover:text-orange-600 transition">Book Table</Link>
          </div>

          <div className="flex items-center gap-4 relative">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 hover:bg-orange-100 transition"
                >
                  <div className="w-7 h-7 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-sm font-bold text-gray-700">{user.name.split(' ')[0]}</span>
                  <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                    <Link to="/profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 transition">
                      <User size={18} className="text-orange-600" /> My Profile
                    </Link>
                    <Link to="/profile#orders" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 transition">
                      <Clock size={18} className="text-orange-600" /> Past Orders
                    </Link>
                    <hr className="my-2 border-gray-50" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition">
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-700 transition shadow-md">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;