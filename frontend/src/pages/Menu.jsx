import React, { useState, useEffect, useContext } from 'react';
import API from '../scripts/api';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { ShoppingBag, Plus, Minus, X, ChevronRight, Clock, Star, Lock, MessageSquare, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);

  const [selectedItemReviews, setSelectedItemReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeItemName, setActiveItemName] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Main Course", "Beverages", "Starters", "Desserts", "Chai & Gosips", "Dosti Combos"];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const handleViewReviews = async (item) => {
    try {
      // Ensure the path is correct based on your server.js setup
      const { data } = await API.get(`/menu/reviews/${item._id}`);
      setSelectedItemReviews(data);
      setActiveItemName(item.name);
      setShowReviewModal(true);
    } catch (err) {
      console.error("Error fetching reviews", err);
    }
  };

  // --- RESTRICTED ADD TO CART ---
  const addToCart = (item) => {
    // 1. Check if user is logged in
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    // 2. Original Logic
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
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    if (cart.length === 0) return;

    try {
      const orderData = {
        items: cart.map(item => ({
          menuId: item._id,
          quantity: item.qty
        }))
      };

      await API.post('/order', orderData);
      setCart([]);
      setIsCartOpen(false);
      navigate('/profile');
    } catch (err) {
      console.error(err);
    }
  };

  const totalPrice = cart.reduce((a, c) => a + c.price * c.qty, 0);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900 pb-20">
      <Navbar />

      {showReviewModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-lg shadow-2xl relative max-h-[80vh] flex flex-col">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-6 right-6 hover:text-orange-600"><X /></button>

            <h3 className="text-3xl font-black uppercase tracking-tighter mb-6">
              Reviews for <span className="text-orange-600">{activeItemName}</span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {selectedItemReviews.length === 0 ? (
                <p className="text-gray-400 italic text-center py-10">No reviews yet for this item.</p>
              ) : (
                selectedItemReviews.map((rev, index) => (
                  <div key={index} className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-sm uppercase">{rev.userName}</span>
                      <div className="flex text-orange-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">"{rev.comment}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- LOGIN REQUIRED POPUP --- */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-10 rounded-[3rem] w-full max-w-sm text-center shadow-2xl relative">
            <button
              onClick={() => setShowLoginPopup(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>

            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
            </div>

            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Wait a <span className="text-orange-600">sec!</span></h3>
            <p className="text-gray-500 font-medium text-sm mb-8">You need to be logged in to add items to your bucket and place orders.</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-lg shadow-orange-100"
              >
                Login Now
              </button>
              <button
                onClick={() => setShowLoginPopup(false)}
                className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header Section */}

        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
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

        {/* --- SEARCH & FILTER SECTION --- */}
        <div className="flex flex-col lg:flex-row gap-6 mb-16 items-center">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search your favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white border border-gray-100 rounded-full shadow-sm focus:ring-2 focus:ring-orange-500 outline-none font-bold transition-all"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 w-full no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat ? "bg-orange-600 text-white shadow-lg" : "bg-white text-gray-400 border border-gray-100 hover:border-orange-600"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div key={item._id} className="group bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col">
                <div className="relative h-72 overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                  <button onClick={() => handleViewReviews(item)} className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-full hover:bg-orange-600 hover:text-white transition-all shadow-lg">
                    <MessageSquare size={18} />
                  </button>
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {item.category || 'Popular'}
                  </div>
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-black tracking-tight">{item.name}</h3>
                    <span className="text-2xl font-black text-orange-600">₹{item.price}</span>
                  </div>
                  <p className="text-gray-400 font-medium text-sm leading-relaxed mb-6 flex-1">{item.description}</p>

                  <div className="flex items-center gap-4 mb-8 text-[10px] font-black uppercase text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={12} /> 15-20 Min</span>
                    <button onClick={() => handleViewReviews(item)} className="flex items-center gap-1 text-orange-500 hover:underline">
                      <Star size={12} fill="currentColor" /> See Feedback
                    </button>
                  </div>

                  <button onClick={() => addToCart(item)} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-2xl font-black text-gray-300 uppercase italic">No items found matching your search</p>
            </div>
          )}
        </div>
      </div>

      {/* --- CART DRAWER --- */}
      {
        isCartOpen && (
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
                        <button onClick={() => removeFromCart(item)} className="p-1 hover:text-orange-600 transition-colors"><Minus size={16} /></button>
                        <span className="font-black text-sm w-4 text-center">{item.qty}</span>
                        <button onClick={() => addToCart(item)} className="p-1 hover:text-orange-600 transition-colors"><Plus size={16} /></button>
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
        )
      }
    </div >
  );
};

export default Menu;