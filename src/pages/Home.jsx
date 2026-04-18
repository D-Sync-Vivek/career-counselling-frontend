import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Component Imports
import CloudBackground from '../components/layout/CloudBackground';
import Hero from '../components/sections/Hero'; 
import AppShowcase from '../components/sections/AppShowcase'; 
import RoleSelection from '../components/sections/RoleSelection';
import Features from '../components/sections/Features';
import Footer from '../components/layout/Footer';
import LanguageSelector from '../components/LanguageSelector';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#f0f9ff] overflow-x-hidden text-slate-900 font-sans">
      
      {/* FIXED CLOUD BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <CloudBackground />
      </div>

      {/* FLOATING TOP-RIGHT CORNER (Language + Login) */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="absolute top-6 right-6 md:top-8 md:right-12 z-50 flex items-center gap-5 bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-sm"
      >
        <LanguageSelector />
        <div className="w-[2px] h-6 bg-slate-300/60 rounded-full"></div>
        <Link 
          to="/signin" 
          className="text-slate-700 hover:text-blue-600 font-extrabold transition-colors pr-3"
        >
          Login
        </Link>
      </motion.div>

      <div className="relative z-10 flex flex-col w-full">
        
        {/* HERO SECTION - Animated on page load */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="min-h-screen flex flex-col justify-center pt-16 md:pt-24 pb-0"
        >
          <Hero />
        </motion.section>

        {/* INTERACTIVE TOGGLE SHOWCASE - Animated when scrolled into view */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <AppShowcase />
        </motion.div>

        {/* MAIN CONTENT SECTION - Staggered slide up */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-32 lg:-mt-48 pb-16 md:pb-24 flex flex-col gap-12 md:gap-16 lg:gap-24"
        >
          <RoleSelection />
          <Features />
        </motion.section>
        
        {/* FOOTER */}
        <div className="relative z-20 w-full mt-auto">
          <Footer />
        </div>

      </div>
    </div>
  );
}