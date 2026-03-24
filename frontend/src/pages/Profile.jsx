import React, { useState, useEffect, useContext } from 'react';
import API from '../scripts/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  Star, Mail, ShoppingBag, Clock,
  MapPin, Phone, X, CheckCircle, DollarSign, Printer, Loader2, Trash2
} from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
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
      alert("Profile Updated!");
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      alert("Update failed.");
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
      // 1. Send feedback to backend (ensure rating is a Number)
      await API.put(`/order/${orderId}/feedback`, { rating: Number(rating) });

      // 2. Alert the user
      alert("Thanks for the rating!");

      // 3. CRITICAL: Refresh the data so 'order.feedback.rating' is populated 
      // and the "Thank you" message appears instead of the stars.
      await fetchProfileData();
    } catch (err) {
      console.error("Feedback error:", err);
      alert("Error saving feedback. Please try again.");
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
          <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all">
            Edit Profile
          </button>
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
                          <DollarSign size={18} /> PAY NOW
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
                      <div className="flex items-center justify-center flex-col gap-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase italic">Rate your meal</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button key={num} onClick={() => submitFeedback(order._id, num)} className="text-gray-200 hover:text-orange-500 transition-colors">
                              <Star size={24} fill="currentColor" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm">
                        <CheckCircle size={16} /> Rated {order.feedback.rating}/5 stars
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
              <div key={book._id} className="bg-white p-6 rounded-[2rem] border-l-8 border-orange-500 shadow-sm">
                <p className="text-xl font-bold text-gray-800 italic uppercase">{book.date} @ {book.time}</p>
                <p className="text-gray-500 font-medium">{book.guests} Guest(s)</p>
                <div className="mt-4 px-3 py-1 bg-gray-50 w-fit rounded-lg text-[10px] font-black uppercase text-gray-400">{book.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- SECURE PAYMENT MODAL --- */}
      {showPayModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-md">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm text-center shadow-2xl relative">

            {paymentStep === 'qr' ? (
              <>
                <button onClick={() => setShowPayModal(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500"><X /></button>
                <h3 className="text-2xl font-black italic mb-2 uppercase">Scan & <span className="text-orange-600">Pay</span></h3>
                <p className="text-xs font-bold text-gray-400 mb-6 italic">Total Due: ₹{showPayModal.totalAmount || showPayModal.totalPrice}</p>

                <div className="bg-gray-50 p-6 rounded-[2.5rem] border-2 border-dashed border-orange-200 mb-6 flex justify-center shadow-inner">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=harsh6@okhdfcbank%26pn=YariDostiCafe%26am=${showPayModal.totalAmount || showPayModal.totalPrice}%26cu=INR`}
                    alt="UPI QR"
                    className="w-40 h-40"
                  />
                </div>

                <div className="text-left mb-6">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-2">UPI Transaction ID / UTR No.</label>
                  <input
                    type="text"
                    placeholder="Enter 12-digit Ref No."
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    className="w-full mt-1 p-4 bg-gray-100 border-none rounded-2xl font-bold focus:ring-2 ring-orange-500 outline-none text-sm"
                  />
                </div>

                <button
                  onClick={() => handleConfirmPayment(showPayModal._id)}
                  className="w-full py-5 bg-orange-600 text-white rounded-[2rem] font-black shadow-xl hover:bg-gray-900 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> SUBMIT PAYMENT
                </button>
                <p className="mt-4 text-[9px] text-gray-400 font-medium px-4">Wait for admin verification to unlock your official bill.</p>
              </>
            ) : (
              <div className="py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={48} />
                </div>
                <h3 className="text-2xl font-black mb-2 uppercase">Submitted!</h3>
                <p className="text-gray-500 font-bold px-4 text-sm">Transaction verification is in progress.</p>
                <div className="mt-8 flex justify-center">
                  <Loader2 className="animate-spin text-orange-200" size={32} />
                </div>
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
    </div>
  );
};

export default Profile;