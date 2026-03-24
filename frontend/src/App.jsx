import React, { useContext } from 'react'; // 1. Add useContext
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext'; // 2. Import your Context
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import Booking from './pages/Booking';
import Menu from './pages/Menu';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  // 3. Extract the user from context
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/profile" element={<Profile />} />

      {/* 4. Protected Admin route using 'role' */}
      <Route
        path="/admin"
        element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />}
      />
    </Routes>
  );
}