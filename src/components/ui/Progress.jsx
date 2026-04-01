import React from 'react';
import { motion } from 'framer-motion';

export function Progress({ value = 0, className = "" }) {
  // Ensure value stays between 0 and 100
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`w-full bg-slate-100 rounded-full h-3 overflow-hidden ${className}`}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${safeValue}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gradient-to-r from-blue-500 to-sky-400 h-full rounded-full"
      />
    </div>
  );
}