import React from 'react';
import Navbar from '../components/Navbar';
import {
  Clock, Users, Utensils, ArrowRight,
  BubblesIcon, Heart, Coffee, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-orange-100 font-sans">
      <Navbar />

      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047"
            className="w-full h-full object-cover"
            alt="Cafe Aesthetic"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80"></div>
        </div>

        <div className="relative z-10 text-center px-6">
          <span className="text-orange-500 font-black tracking-[0.5em] uppercase text-sm mb-4 block animate-bounce">
            Est. 2024 • Ahmedabad
          </span>
          <h1 className="text-6xl md:text-[10rem] font-black text-white leading-none tracking-tighter mb-8">
            YARI <span className="text-transparent stroke-white" style={{ WebkitTextStroke: '2px white' }}>DOSTI</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto mb-10 font-medium italic">
            "Where conversations brew longer than our coffee."
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link to="/menu" className="group bg-orange-600 hover:bg-white text-white hover:text-orange-600 px-10 py-5 rounded-full font-black text-lg transition-all flex items-center gap-3 shadow-2xl">
              EXPLORE MENU <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link to="/booking" className="px-10 py-5 rounded-full font-black text-lg text-white border-2 border-white/30 hover:bg-white/10 backdrop-blur-md transition-all">
              RESERVE A SPOT
            </Link>
          </div>
        </div>

        {/* Decorative Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-[1px] h-20 bg-gradient-to-b from-orange-500 to-transparent"></div>
          <p className="text-[10px] text-white font-black uppercase tracking-widest vertical-text">Scroll</p>
        </div>
      </section>

      {/* 2. THE PHILOSOPHY (STORY) */}
      <section className="py-32 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <img
            src="https://th.bing.com/th/id/OIP.o5tSLtj5gakRICh8JeP1kgHaE7?w=274&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3"
            className="rounded-[3rem] shadow-2xl z-10 relative"
            alt="Cafe Vibe"
          />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-orange-100 rounded-[3rem] -z-0"></div>
        </div>
        <div>
          <h2 className="text-5xl font-black text-gray-900 leading-tight mb-8 uppercase italic tracking-tighter">
            More than just a <span className="text-orange-600">Cafe</span>. It's an Emotion.
          </h2>
          <p className="text-xl text-gray-500 leading-relaxed mb-8">
            Yari Dosti was born from a simple idea: late-night conversations and high-quality snacks shouldn't be expensive. We created a sanctuary for friends to disconnect from their screens and reconnect with each other.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Heart className="text-orange-600" />
              <span className="font-bold text-gray-800">100% Homemade</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="text-orange-600" />
              <span className="font-bold text-gray-800">Community First</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE "VIBE" GALLERY */}
      <section className="bg-gray-900 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-white text-5xl font-black mb-4 uppercase">The Aesthetic</h2>
            <p className="text-gray-400 font-medium">Capture the moments. Share the dosti.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px]">
            <div className="bg-gray-800 rounded-3xl overflow-hidden row-span-2">
              <img src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=2070" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Gallery" />
            </div>
            <div className="bg-gray-800 rounded-3xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Gallery" />
            </div>
            <div className="bg-gray-800 rounded-3xl overflow-hidden col-span-2">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Gallery" />
            </div>
            <div className="bg-gray-800 rounded-3xl overflow-hidden col-span-2">
              <img src="https://th.bing.com/th/id/OIP.o5tSLtj5gakRICh8JeP1kgHaE7?w=274&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Gallery" />
            </div>
            <div className="bg-gray-800 rounded-3xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?q=80&w=2070" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="Gallery" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES (TRUST) */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 text-center">
            {[
              { icon: <Coffee />, title: "Premium Beans", desc: "Sourced from the hills of Coorg." },
              { icon: <Clock />, title: "Open Late", desc: "Your 11 PM chai spot." },
              { icon: <ShieldCheck />, title: "Hygiene First", desc: "Grade A kitchen standards." },
              { icon: <BubblesIcon />, title: "Insta Ready", desc: "Every corner is a photo-op." }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all transform group-hover:-rotate-12">
                  {React.cloneElement(f.icon, { size: 32 })}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h4>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FOOTER CALL TO ACTION */}
      <section className="bg-orange-600 py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            READY TO MAKE <br /> SOME MEMORIES?
          </h2>
          <div className="flex gap-4">
            <Link to="/booking" className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
              Book A Table
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;