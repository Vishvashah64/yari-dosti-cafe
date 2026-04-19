import React, { useState, useEffect } from 'react';
import API from '../scripts/api';
import {
  TrendingUp, ShoppingBag, CheckCircle,
  Clock, DollarSign, MessageSquare, Star, ChevronRight,
  BarChart3, Plus, Trash2, Edit3, Upload, Utensils, Hash, Loader2, Check,
  Calendar
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [bookings, setBookings] = useState([]); // Book the table
  const [tableInputs, setTableInputs] = useState({});
  const [view, setView] = useState('orders');
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Main Course', description: '', image: null });

  // --- 1. DATA FETCHING ---
  const fetchData = async () => {
    try {
      const [orderRes, menuRes, bookingRes] = await Promise.all([
        API.get('/order/all'),
        API.get('/menu'),
        API.get('/booking/all') // Add this
      ]);
      setOrders(orderRes.data);
      setMenuItems(menuRes.data);
      setBookings(bookingRes.data); // Add this
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- 2. PAYMENT & ORDER ACTIONS (THE FIX) ---
  const verifyPayment = async (orderId) => {
    try {
      // 1. Send BOTH the status 'Paid' and a unique ID
      const response = await API.put(`/order/${orderId}/pay`, {
        paymentStatus: 'Paid',
        transactionId: `VERIFIED_${Date.now()}`
      });

      if (response.status === 200) {
        // 2. Refresh the whole list from the database to confirm it's saved
        fetchData();
        console.log("Database update confirmed!");
      }
    } catch (err) {
      console.error("Update failed", err);
      alert("Could not update database.");
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/order/${orderId}/status`, { status: newStatus });

      // Auto-verify payment if marked as Completed
      if (newStatus === 'Completed') {
        await verifyPayment(orderId);
      }

      fetchData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  // --- 3. MENU MANAGEMENT ACTIONS ---
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('description', formData.description);
    if (formData.image) data.append('image', formData.image);

    try {
      if (isEditing) {
        await API.put(`/menu/${isEditing}`, data);
      } else {
        await API.post('/menu', data);
      }
      setFormData({ name: '', price: '', category: 'Main Course', description: '', image: null });
      setIsEditing(null);
      fetchData();
    } catch (err) {
      alert("Failed to save menu item");
    }
  };
  
  const deleteMenuItem = async (id) => {
    if (window.confirm("Delete this item forever?")) {
      try {
        await API.delete(`/menu/${id}`);
        fetchData();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  // Update booking status 
  const updateBookingStatus = async (bookingId, newStatus, tableNumber) => {
    try {
      await API.put(`/booking/${bookingId}/status`, { status: newStatus, tableNumber });
      fetchData();
    } catch (err) { alert("Failed"); }
  };

  const startEdit = (item) => {
    setIsEditing(item._id);
    setFormData({ name: item.name, price: item.price, category: item.category, description: item.description, image: null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 4. ANALYTICS LOGIC ---
  const totalRevenue = orders.filter(o => o.paymentStatus === 'Paid').reduce((acc, curr) => acc + (curr.totalAmount || curr.totalPrice || 0), 0);
  const pendingOrders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled').length;
  const ratedOrders = orders.filter(o => o.feedback && o.feedback.rating > 0);
  const avgRating = ratedOrders.length > 0 ? (ratedOrders.reduce((acc, curr) => acc + curr.feedback.rating, 0) / ratedOrders.length).toFixed(1) : "5.0";

  const chartData = orders.filter(o => o.paymentStatus === 'Paid').slice(-7).map(o => ({
    name: new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
    amount: o.totalAmount || o.totalPrice || 0
  }));

  const pieData = [
    { name: 'Pending', value: orders.filter(o => o.status === 'Pending').length, color: '#f97316' },
    { name: 'Preparing', value: orders.filter(o => o.status === 'Preparing').length, color: '#3b82f6' },
    { name: 'Completed', value: orders.filter(o => o.status === 'Completed').length, color: '#22c55e' },
  ];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
      <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
      <div className="font-black text-orange-600 italic tracking-widest uppercase">Syncing Yari Dosti Data...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* SIDEBAR */}
      <aside className="w-72 bg-gray-900 p-8 text-white sticky top-0 h-screen shadow-2xl">
        <div className="mb-12">
          <h1 className="text-2xl font-black tracking-tighter text-orange-500 italic">YARI DOSTI <span className="text-white block text-[10px] tracking-widest opacity-50 uppercase mt-1 not-italic">Admin Central</span></h1>
        </div>
        <nav className="space-y-2">
          <AdminNavLink active={view === 'overview'} onClick={() => setView('overview')} icon={<TrendingUp size={20} />} label="Analytics" />
          <AdminNavLink active={view === 'orders'} onClick={() => setView('orders')} icon={<ShoppingBag size={20} />} label="Live Orders" />
          <AdminNavLink active={view === 'bookings'} onClick={() => setView('bookings')} icon={<Calendar size={20} />} label="Bookings" /> {/* ADDED */}
          <AdminNavLink active={view === 'menu'} onClick={() => setView('menu')} icon={<Utensils size={20} />} label="Manage Menu" />
          <AdminNavLink active={view === 'feedback'} onClick={() => setView('feedback')} icon={<MessageSquare size={20} />} label="User Reviews" />
        </nav>
      </aside>

      {/* MAIN VIEW */}
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard label="Revenue" value={`₹${totalRevenue}`} icon={<DollarSign className="text-green-500" />} />
          <StatCard label="Live Orders" value={pendingOrders} icon={<Clock className="text-orange-500" />} />
          <StatCard label="Completed" value={orders.filter(o => o.status === 'Completed').length} icon={<CheckCircle className="text-blue-500" />} />
          <StatCard label="Avg Rating" value={avgRating} icon={<Star className="text-yellow-500" fill="currentColor" />} />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">

          {/* ANALYTICS SECTION */}
          {view === 'overview' && (
            <div className="p-10">
              <HeaderTitle title="Performance" subtitle="Weekly Revenue Trend" icon={<BarChart3 size={24} />} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 min-h-[350px] bg-gray-50/50 p-6 rounded-[2rem]">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs><linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.3} /><stop offset="95%" stopColor="#f97316" stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="amount" stroke="#f97316" strokeWidth={4} fill="url(#colorAmt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-gray-50/50 p-6 rounded-[2rem]">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS SECTION (THE FIX IS HERE) */}
          {view === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Customer</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Transaction ID</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Bill</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Payment Status</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition">
                      <td className="p-6">
                        <p className="text-xs font-mono font-bold text-gray-300">#{order._id.slice(-6).toUpperCase()}</p>
                        <p className="font-bold text-gray-800 text-lg">{order.userId?.name || 'Walk-in'}</p>
                        <p className="text-[10px] text-gray-400 italic">{order.items.map(i => `${i.name} (x${i.qty || i.quantity})`).join(', ')}</p>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-blue-600 font-mono text-xs font-bold bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 w-fit">
                          <Hash size={12} /> {order.transactionId || 'CASH/DIRECT'}
                        </div>
                      </td>
                      <td className="p-6 font-black text-2xl italic text-gray-900">₹{order.totalAmount || order.totalPrice}</td>
                      <td className="p-6">
                        {order.paymentStatus === 'Paid' ? (
                          <span className="bg-green-100 text-green-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                            <Check size={12} /> Paid
                          </span>
                        ) : (
                          <button
                            onClick={() => verifyPayment(order._id)}
                            className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase transition-all shadow-sm border border-red-100"
                          >
                            Verify Payment
                          </button>
                        )}
                      </td>
                      <td className="p-6">
                        <select
                          className="bg-gray-100 border-none rounded-xl text-xs font-black p-3 cursor-pointer focus:ring-2 focus:ring-orange-500"
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* BOOKINGS VIEW - The part you requested */}
          {view === 'bookings' && (
            <div className="overflow-x-auto">
              <HeaderTitle title="Table Bookings" subtitle="Manage table assignments" icon={<Calendar size={24} />} />
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Customer</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Time</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Guests</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase text-gray-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map(booking => (
                    <tr key={booking._id} className="hover:bg-gray-50/50">
                      <td className="p-6 font-bold">{booking.userId?.name || 'Unknown'}</td>
                      <td className="p-6 text-sm">{booking.date} - {booking.time}</td>
                      <td className="p-6">{booking.guests}</td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-6">
                        {booking.status === 'Pending' ? (
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Table #"
                              className="w-16 p-2 rounded-lg border text-xs"
                              onChange={(e) => setTableInputs({ ...tableInputs, [booking._id]: e.target.value })}
                            />
                            <button
                              onClick={() => updateBookingStatus(booking._id, 'Confirmed', tableInputs[booking._id])}
                              className="bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-green-700"
                            >Confirm</button>
                          </div>
                        ) : (
                          <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                            Table: {booking.tableNumber || "N/A"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MENU SECTION */}
          {view === 'menu' && (
            <div className="p-10">
              <HeaderTitle title="Manage Menu" subtitle="Add or Update Dishes" icon={<Plus size={24} />} />
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-[2rem] h-fit">
                  <form onSubmit={handleMenuSubmit} className="space-y-4">
                    <input type="text" placeholder="Dish Name" required className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold shadow-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <input type="number" placeholder="Price (₹)" required className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold shadow-sm" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                    <select className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold shadow-sm" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      <option>Main Course</option><option>Starters</option><option>Beverages</option><option>Desserts</option>
                    </select>
                    <textarea placeholder="Description" className="w-full bg-white border-none rounded-2xl p-4 text-sm font-bold shadow-sm h-24" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    <label className="flex flex-col items-center justify-center w-full bg-white border-2 border-dashed rounded-2xl p-4 cursor-pointer hover:border-orange-500">
                      <Upload size={20} className="text-gray-400 mb-2" />
                      <span className="text-[10px] font-black text-gray-400">{formData.image ? formData.image.name : 'Upload Image'}</span>
                      <input type="file" className="hidden" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} />
                    </label>
                    <button className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-orange-700">{isEditing ? 'UPDATE ITEM' : 'ADD ITEM'}</button>
                  </form>
                </div>
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.map((item) => (
                    <div key={item._id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
                      <img src={item.image} alt="" className="w-20 h-20 rounded-2xl object-cover bg-gray-100" />
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-orange-500 uppercase">{item.category}</p>
                        <h4 className="font-bold text-gray-800">{item.name}</h4>
                        <p className="font-black text-lg text-gray-900">₹{item.price}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => startEdit(item)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Edit3 size={18} /></button>
                        <button onClick={() => deleteMenuItem(item._id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FEEDBACK SECTION */}
          {view === 'feedback' && (
            <div className="p-8 grid md:grid-cols-2 gap-6">
              {ratedOrders.length > 0 ? ratedOrders.map(order => (
                <div key={order._id} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <p className="font-bold text-gray-800 uppercase text-xs tracking-tighter">{order.userId?.name || 'Anonymous'}</p>
                    <div className="flex text-yellow-500">{[...Array(order.feedback.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                  </div>
                  <p className="text-sm text-gray-600 italic font-medium leading-relaxed">"{order.feedback.comment || 'The food was great!'}"</p>
                </div>
              )) : <p className="col-span-2 text-center text-gray-400 py-10 font-bold uppercase">No reviews yet.</p>}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

// --- HELPER SUB-COMPONENTS ---

const AdminNavLink = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
    <div className="flex items-center gap-4">{icon} {label}</div>
    {active && <ChevronRight size={16} />}
  </button>
);

const HeaderTitle = ({ title, subtitle, icon }) => (
  <div className="flex items-center gap-3 mb-10">
    <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">{icon}</div>
    <div>
      <h2 className="text-xl font-black italic">{title}</h2>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{subtitle}</p>
    </div>
  </div>
);

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-default">
    <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">{icon}</div>
    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
    <h3 className="text-2xl font-black text-gray-900 mt-1 italic">{value}</h3>
  </div>
);

export default AdminDashboard;