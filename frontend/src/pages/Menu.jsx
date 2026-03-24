import React, { useState, useEffect, useContext } from 'react';
import API from '../scripts/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, Plus, Minus, X, ChevronRight, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await API.get('/menu');
        setMenuItems(data);
      } catch (err) { console.error(err); }
    };
    fetchMenu();
  }, []);

  const addToCart = (item) => {
    const exist = cart.find((x) => x._id === item._id);
    if (exist) {
      setCart(cart.map((x) => x._id === item._id ? { ...exist, qty: exist.qty + 1 } : x));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (item) => {
    const exist = cart.find((x) => x._id === item._id);
    if (exist.qty === 1) {
      setCart(cart.filter((x) => x._id !== item._id));
    } else {
      setCart(cart.map((x) => x._id === item._id ? { ...exist, qty: exist.qty - 1 } : x));
    }
  };

  const handleCheckout = async () => {
    if (!user) return alert("Please login first!");
    if (cart.length === 0) return alert("Your bag is empty!");
    
    try {
      const orderData = {
        items: cart.map(item => ({
          menuId: item._id,
          quantity: item.qty
        }))
      };

      await API.post('/order', orderData);
      alert("Order Placed Successfully!");
      setCart([]);
      setIsCartOpen(false);
      navigate('/profile'); 
    } catch (err) {
      alert("Order Failed: " + err.response?.data?.message);
    }
  };

  const totalPrice = cart.reduce((a, c) => a + c.price * c.qty, 0);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-orange-600 font-black uppercase tracking-[0.3em] text-sm">Deliciously Crafted</span>
            <h2 className="text-7xl font-black tracking-tighter uppercase leading-none mt-2">
              Our <span className="text-orange-600 italic">Menu</span>
            </h2>
          </div>
          
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="group relative flex items-center gap-4 bg-white px-8 py-4 shadow-2xl rounded-full border border-gray-100 hover:bg-black hover:text-white transition-all duration-500"
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase opacity-50">Your Bag</span>
              <span className="font-black text-lg">₹{totalPrice}</span>
            </div>
            <div className="relative">
              <ShoppingBag className="group-hover:scale-110 transition-transform" />
              <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cart.reduce((a, c) => a + c.qty, 0)}
              </span>
            </div>
          </button>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {menuItems.map(item => (
            <div key={item._id} className="group bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col">
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={item.image} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={item.name} 
                />
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {item.category || 'Popular'}
                </div>
              </div>

              {/* Content */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-black tracking-tight">{item.name}</h3>
                  <span className="text-2xl font-black text-orange-600">₹{item.price}</span>
                </div>

                {/* --- DESCRIPTION --- */}
                <p className="text-gray-400 font-medium text-sm leading-relaxed mb-6 flex-1">
                  {item.description || "Freshly prepared with the finest ingredients and a touch of our signature spices."}
                </p>

                <div className="flex items-center gap-4 mb-8 text-[10px] font-black uppercase text-gray-400">
                  <span className="flex items-center gap-1"><Clock size={12}/> 15-20 Min</span>
                  <span className="flex items-center gap-1 text-orange-500"><Star size={12} fill="currentColor"/> 4.8</span>
                </div>

                <button 
                  onClick={() => addToCart(item)} 
                  className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg shadow-gray-200"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- PREMIUM CART DRAWER --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" 
            onClick={() => setIsCartOpen(false)}
          ></div>
          
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            {/* Drawer Header */}
            <div className="p-10 flex justify-between items-center border-b border-gray-50">
              <div>
                <h3 className="text-4xl font-black tracking-tighter uppercase italic">My <span className="text-orange-600">Order</span></h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Yari Dosti Cafe</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <ShoppingBag size={80} strokeWidth={1} />
                  <p className="mt-4 font-black uppercase tracking-widest">Bag is Empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item._id} className="flex gap-6 items-center">
                    <img src={item.image} className="w-20 h-20 rounded-2xl object-cover shadow-md" alt="" />
                    <div className="flex-1">
                      <p className="font-black text-lg leading-tight">{item.name}</p>
                      <p className="text-orange-600 font-bold text-sm">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <button onClick={() => removeFromCart(item)} className="p-1 hover:text-orange-600 transition-colors"><Minus size={16}/></button>
                      <span className="font-black text-sm w-4 text-center">{item.qty}</span>
                      <button onClick={() => addToCart(item)} className="p-1 hover:text-orange-600 transition-colors"><Plus size={16}/></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-10 bg-gray-50 border-t border-gray-100">
              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-sm font-bold text-gray-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-400 uppercase tracking-widest">
                  <span>Service Fee</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-3xl font-black mt-4">
                  <span>Total</span>
                  <span className="text-orange-600">₹{totalPrice}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout} 
                disabled={cart.length === 0}
                className="w-full py-6 bg-black text-white rounded-[2rem] font-black text-lg hover:bg-orange-600 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-xl"
              >
                PROCEED TO CHECKOUT <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;