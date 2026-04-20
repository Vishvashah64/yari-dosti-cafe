import React, { useState, useEffect, useContext } from 'react';
import API from '../scripts/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  Star, Mail, ShoppingBag, Clock,
  MapPin, Phone, X, CheckCircle, DollarSign, Printer, Loader2, Trash2,
  IndianRupee
} from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [activeTab, setActiveTab] = useState('orders');

  // Payment & Editing State
  const [showPayModal, setShowPayModal] = useState(null);
  const [paymentStep, setPaymentStep] = useState('qr');
  const [txnId, setTxnId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    address: user?.address || '',
    phone: user?.phone || ''
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [paymentMode, setPaymentMode] = useState(null); // Keeps track if user picks QR or COD
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleCodVerify = async () => {
    try {
      await API.post('/order/verify-otp', { orderId: showPayModal._id, otp });
      alert("Order Verified & Confirmed!");
      setShowPayModal(null); // Close modal
      setPaymentMode(null);  // Reset
      fetchProfileData();    // Refresh orders
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [ordersRes, bookingsRes] = await Promise.all([
        API.get('/order/myorders'),
        API.get('/booking/my-bookings')
      ]);
      setOrders(ordersRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put('/auth/profile', editData);
      setTimeout(() => setShowSuccessPopup(false), 3000);
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      alert("Update failed.");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError('');

    try {
      await API.put('/auth/update-password', passwordData);

      // Close the input modal and show the success popup
      setShowPasswordModal(false);
      setShowSuccessPopup(true);

      // Reset the input fields
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

      // Automatically hide success popup after 3 seconds
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.errors
        ? err.response.data.errors.join(' ')
        : err.response?.data?.message || "Update failed";

      setPasswordError(errorMsg);
    }
  };

  // --- CANCEL ORDER LOGIC ---
  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        await API.delete(`/order/${orderId}/cancel`);
        alert("Order Cancelled!");
        fetchProfileData();
      } catch (err) {
        alert(err.response?.data?.message || "Cancellation failed.");
      }
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Cancel this booking?")) {
      try {
        await API.delete(`/booking/${bookingId}`);
        fetchProfileData();
      } catch (err) { alert("Cancellation failed"); }
    }
  };

  // --- SECURE PAYMENT WITH TXN ID ---
  const handleConfirmPayment = async (orderId) => {
    if (txnId.trim().length < 8) {
      return alert("Please enter a valid Transaction ID / UTR Number.");
    }

    try {
      // Sending txnId to backend for admin verification
      await API.put(`/order/${orderId}/pay`, { transactionId: txnId });

      setPaymentStep('success');

      setTimeout(() => {
        setShowPayModal(null);
        setPaymentStep('qr');
        setTxnId('');
        fetchProfileData();
      }, 2500);
    } catch (err) {
      alert("Submission failed. Please check your connection.");
    }
  };

  const submitFeedback = async (orderId, rating) => {
    try {
      await API.put(`/order/${orderId}/feedback`, {
        rating: Number(rating),
        comment: feedbackComment
      });

      alert("Thanks for your feedback!");
      setFeedbackComment(''); // Reset comment
      fetchProfileData(); // Refresh to see the change instantly
    } catch (err) {
      console.error("Feedback error:", err);
      alert(err.response?.data?.message || "Error saving feedback.");
    }
  };

  const printBill = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Receipt - Yari Dosti Cafe</title></head>
        <body style="font-family: 'Courier New', monospace; padding: 20px; width: 300px; color: #333;">
          <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px;">
            <h2 style="margin: 0;">YARI DOSTI CAFE</h2>
            <p style="font-size: 12px;">Customer: ${user.name}</p>
          </div>
          <p style="font-size: 11px; margin-top: 10px;">Order ID: #${order._id.slice(-6).toUpperCase()}</p>
          <div style="border-bottom: 1px solid #eee; margin-bottom: 10px;">
            ${order.items.map(i => `
              <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px;">
                <span>${i.name} x${i.qty || i.quantity}</span>
                <span>₹${(i.price * (i.qty || i.quantity))}</span>
              </div>
            `).join('')}
          </div>
          <div style="border-bottom: 2px dashed #000; padding-bottom: 10px; display: flex; justify-content: space-between; font-weight: bold; font-size: 18px;">
            <span>TOTAL:</span>
            <span>₹${order.totalAmount || order.totalPrice}</span>
          </div>
          <p style="text-align: center; font-size: 12px; margin-top: 20px;">Paid via UPI. Visit again!</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-orange-600">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center text-white text-4xl font-black italic shadow-lg shadow-orange-200">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">{user?.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-gray-500 text-sm font-medium">
              <span className="flex items-center gap-1"><Mail size={14} /> {user?.email}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {user?.address || 'Ahmedabad, Gujarat'}</span>
              <span className="flex items-center gap-1"><Phone size={14} /> {user?.phone || 'Add Contact'}</span>
            </div>
          </div>
          <div className='flex gap-3'>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-6 py-3 bg-white text-gray-900 border-2 border-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all"
            >
              Change Password
            </button>
            <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all">
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="flex gap-8 border-b border-gray-100 mb-8">
          <button onClick={() => setActiveTab('orders')} className={`pb-4 font-black text-sm uppercase tracking-widest ${activeTab === 'orders' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400'}`}>My Orders</button>
          <button onClick={() => setActiveTab('bookings')} className={`pb-4 font-black text-sm uppercase tracking-widest ${activeTab === 'bookings' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-400'}`}>My Bookings</button>
        </div>

        {activeTab === 'orders' ? (
          <div className="grid gap-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6">
                  <div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID: #{order._id.slice(-6).toUpperCase()}</span>
                    <h3 className="text-xl font-bold text-gray-800">{order.items.map(i => i.name).join(', ')}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{order.status}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order.paymentStatus === 'Paid' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>{order.paymentStatus}</span>
                    </div>
                  </div>

                  <div className="text-center md:text-right flex flex-col items-center md:items-end gap-3">
                    <p className="text-2xl font-black text-gray-900 italic">₹{order.totalAmount || order.totalPrice}</p>

                    <div className="flex gap-2">
                      {/* CANCEL BUTTON: Only if Pending and Unpaid */}
                      {order.status === 'Pending' && order.paymentStatus !== 'Paid' && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all border border-red-100"
                        >
                          <Trash2 size={18} /> CANCEL
                        </button>
                      )}

                      {order.paymentStatus !== 'Paid' ? (
                        <button
                          onClick={() => setShowPayModal(order)}
                          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-black transition-all shadow-lg shadow-green-100"
                        >
                          <IndianRupee size={18} /> PAY NOW
                        </button>
                      ) : (
                        <button
                          onClick={() => printBill(order)}
                          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black hover:bg-orange-600 transition-all"
                        >
                          <Printer size={18} /> PRINT BILL
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {(order.paymentStatus === 'Paid' || order.paymentStatus === 'Pending Verification') && (
                  <div className="border-t border-gray-50 pt-4 text-center">
                    {!order.feedback?.rating ? (
                      <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl">
                        <p className="text-xs font-black text-gray-400 uppercase italic text-center">Rate your meal</p>

                        {/* Stars */}
                        <div className="flex justify-center gap-2">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              onClick={() => submitFeedback(order._id, num)}
                              className="text-gray-300 hover:text-orange-500 transition-colors"
                            >
                              <Star size={24} fill="currentColor" />
                            </button>
                          ))}
                        </div>

                        {/* Comment Input */}
                        <input
                          type="text"
                          placeholder="Write a review (optional)..."
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          className="w-full p-3 rounded-xl border border-gray-200 text-sm font-medium"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-green-600 font-bold text-sm">
                        <CheckCircle size={20} />
                        <span>Rated {order.feedback.rating}/5 stars</span>
                        {order.feedback.comment && (
                          <p className="text-gray-500 italic text-xs mt-1">"{order.feedback.comment}"</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {bookings.map(book => (
              <div key={book._id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative">
                <p className="text-xl font-bold text-gray-800 italic uppercase">{book.date} @ {book.time}</p>
                <p className="text-gray-500 font-medium">{book.guests} Guest(s)</p>

                {/* Display Assigned Table */}
                {book.status === 'Confirmed' && (
                  <div className="mt-2 text-green-600 font-black text-xs uppercase bg-green-50 px-3 py-1 rounded-lg w-fit">
                    Table Assigned: {book.tableNumber || 'Please ask counter'}
                  </div>
                )}

                {/* Status and Cancel Button */}
                <div className="flex justify-between items-center mt-4">
                  <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${book.status === 'Confirmed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {book.status}
                  </div>

                  {book.status === 'Pending' && (
                    <button
                      onClick={() => handleCancelBooking(book._id)}
                      className="text-red-500 text-xs font-bold hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SECURE PAYMENT MODAL --- */}
      {/* --- REPLACED PAYMENT MODAL --- */}
      {showPayModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-md">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm text-center shadow-2xl relative">
            <button onClick={() => { setShowPayModal(null); setPaymentMode(null); }} className="absolute top-6 right-6 text-gray-400 hover:text-red-500"><X /></button>

            {!paymentMode && (
              <>
                <h3 className="text-2xl font-black italic mb-2 uppercase">Payment Method</h3>
                <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">Total: ₹{showPayModal.totalAmount || showPayModal.totalPrice}</p>
                <div className="flex flex-col gap-3">
                  <button onClick={() => setPaymentMode('QR')} className="w-full p-4 bg-orange-600 text-white rounded-2xl font-black hover:bg-black transition-all">PAY VIA ONLINE UPI</button>
                  <button onClick={async () => {
                    try {
                      await API.post(`/order/${showPayModal._id}/send-otp`);
                      setPaymentMode('COD');
                    } catch (err) { alert("Failed to send OTP."); }
                  }} className="w-full p-4 bg-gray-100 text-gray-800 rounded-2xl font-black">CASH ON DELIVERY</button>
                </div>
              </>
            )}

            {paymentMode === 'QR' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-2xl font-black italic mb-2 uppercase">Secure <span className="text-orange-600">UPI</span></h3>
                <p className="text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest">Total Amount: ₹{showPayModal.totalAmount || showPayModal.totalPrice}</p>

                {/* Direct Payment Button */}
                {(() => {
                  const upiId = "vishvashah64@okhdfcbank";
                  const name = "Yari Dosti Cafe";
                  const amount = showPayModal.totalAmount || showPayModal.totalPrice;
                  const note = `Order_${showPayModal._id.slice(-6)}`;
                  // Enhanced UPI Link for reliability
                  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}&tr=${showPayModal._id.slice(-6)}`;

                  return (
                    <div className="mb-6">
                      <a href={upiLink} className="flex items-center justify-between p-4 bg-gray-900 text-white rounded-2xl hover:bg-orange-600 transition-all group shadow-lg">
                        <div className="text-left">
                          <span className="block font-black text-xs uppercase">Pay Directly</span>
                          <span className="text-[9px] text-gray-400 group-hover:text-white uppercase font-bold">Opens GPay / PhonePe / Paytm</span>
                        </div>
                        <IndianRupee size={20} />
                      </a>
                    </div>
                  );
                })()}

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-[1px] bg-gray-100"></div>
                  <span className="text-[9px] font-black text-gray-300 uppercase">Or Scan Below</span>
                  <div className="flex-1 h-[1px] bg-gray-100"></div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-[2rem] border-2 border-dashed border-orange-100 mb-6 flex justify-center">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=vishvashah64@okhdfcbank%26pn=YariDostiCafe%26am=${showPayModal.totalAmount || showPayModal.totalPrice}%26cu=INR`} className="w-32 h-32" alt="QR" />
                </div>

                <div className="space-y-3">
                  <input type="text" placeholder="12-Digit Transaction ID" value={txnId} onChange={(e) => setTxnId(e.target.value)} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-center outline-none focus:ring-2 focus:ring-orange-500" />
                  <button onClick={() => handleConfirmPayment(showPayModal._id)} className="w-full py-4 bg-orange-600 text-white rounded-[2rem] font-black uppercase tracking-tighter">Confirm Payment</button>
                </div>
              </div>
            )}

            {paymentMode === 'COD' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-2xl font-black italic mb-2 uppercase">Verify COD</h3>
                <p className="text-xs font-bold text-gray-400 mb-6">Enter OTP sent to your email.</p>
                <input type="text" maxLength={6} placeholder="000000" onChange={(e) => setOtp(e.target.value)} className="w-full mb-6 p-4 bg-gray-100 rounded-2xl text-center text-2xl font-black tracking-[0.5em]" />
                <button onClick={handleCodVerify} className="w-full py-4 bg-green-600 text-white rounded-[2rem] font-black">CONFIRM ORDER</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditing && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl">
            <h3 className="text-2xl font-black mb-8 italic text-center uppercase tracking-tighter">Update <span className="text-orange-600">Dosti</span> Account</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="text" placeholder="Name" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" />
              <input type="text" placeholder="Phone" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold" />
              <textarea placeholder="Address" value={editData.address} onChange={(e) => setEditData({ ...editData, address: e.target.value })} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold h-24" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Close</button>
                <button type="submit" className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- UPDATE PASSWORD MODAL --- */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative">
            <h3 className="text-2xl font-black mb-2 italic text-center uppercase tracking-tighter">
              Update <span className="text-orange-600">Password</span>
            </h3>
            <p className="text-center text-gray-400 text-xs font-bold uppercase mb-6">Secure your account</p>

            {/* --- ERROR MESSAGE DISPLAY --- */}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-lg animate-pulse">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError(''); // Clear error on close
                  }}
                  className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-orange-600 transition-all shadow-lg"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SUCCESS POPUP --- */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xs p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900">Success!</h3>
            <p className="text-center text-gray-500 text-sm font-bold mt-2">
              Your password has been updated.
            </p>
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="mt-6 w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
            >
              Awesome
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;