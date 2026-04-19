import React, { useState } from 'react';
import API from '../scripts/api';
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, Lock, ArrowLeft, Loader2, EyeOff, Eye } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '' });
  const navigate = useNavigate();

  // 1. Send OTP Request
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email: formData.email });
      setStep(2);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/verify-otp', { email: formData.email, otp: formData.otp });
      setStep(3);
      setError('');
    } catch (err) {
      setError('Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  // 3. Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/reset-password', { email: formData.email, newPassword: formData.newPassword });
      alert("Password updated! Please login.");
      navigate('/login');
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.errors) {
        setError(errorData.errors.join(' '));
      } else {
        setError(errorData?.message || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')} className="mb-4 text-gray-400 hover:text-orange-600 flex items-center gap-1 text-sm font-bold">
          <ArrowLeft size={16} /> Back
        </button>

        <h2 className="text-2xl font-black text-gray-800 mb-2">
          {step === 1 ? "Reset Password" : step === 2 ? "Verify OTP" : "New Password"}
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {step === 1 ? "Enter your email to receive a verification code." :
            step === 2 ? `Code sent to ${formData.email}` : "Enter your new secure password."}
        </p>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-xs font-bold">{error}</div>}

        {/* STEP 1: EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input type="email" required placeholder="Enter your email" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <button disabled={loading} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input type="text" maxLength={6} required placeholder="000000" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 text-center tracking-[1em] text-xl font-bold" onChange={(e) => setFormData({ ...formData, otp: e.target.value })} />
            </div>
            <button disabled={loading} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition">Verify</button>
          </form>
        )}

        {/* STEP 3: NEW PASSWORD */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="New Password"
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-orange-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button disabled={loading} className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;