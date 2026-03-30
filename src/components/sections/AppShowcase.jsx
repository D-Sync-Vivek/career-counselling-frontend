import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

export default function AppShowcase() {
  const containerRef = useRef(null);

  // State to track which dashboard is currently selected
  const [activeTab, setActiveTab] = useState('student');

  // Define our tabs and map them to your exact image filenames
  const tabs = [
    { id: 'student', label: 'Student Dashboard', image: '/cc.jpeg' },
    { id: 'mentor', label: 'Mentor Dashboard', image: '/bb.jpeg' },
    { id: 'parent', label: 'Parent Dashboard', image: '/aa.jpeg' },
  ];

  // Scroll animations for the entire window
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"] 
  });

  const scale = useTransform(scrollYProgress, [0, 0.8], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.8], [80, 0]);

  return (
    // 👉 ADDED style={{ position: 'relative' }} right here to fix the console warning!
    <section 
      ref={containerRef} 
      className="relative h-[120vh] w-full z-20"
      style={{ position: 'relative' }} 
    >
      
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden px-6 lg:px-12 pointer-events-none">
        
        <motion.div 
          style={{ scale, opacity, y }}
          className="relative w-full max-w-6xl aspect-[16/9] rounded-2xl md:rounded-[2rem] border border-white/40 bg-white/30 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
        >
          {/* Top Window Bar (Mac OS style) */}
          <div className="h-12 w-full bg-white/40 border-b border-white/30 flex items-center px-4 md:px-6 gap-2 backdrop-blur-md z-20">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            
            {/* Interactive Toggle Tabs */}
            <div className="mx-auto flex space-x-2 md:space-x-4 bg-white/50 p-1 rounded-full">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 md:px-5 md:py-1.5 rounded-full text-[10px] md:text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-[#3b82f6] text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="w-[44px]"></div> 
          </div>

          {/* Dashboard Image Display Area */}
          <div className="flex-1 w-full bg-slate-100 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeTab} // The key tells Framer Motion to animate when the tab changes
                src={tabs.find(t => t.id === activeTab).image}
                alt={`${activeTab} dashboard preview`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            </AnimatePresence>
          </div>

        </motion.div>
        
      </div>
    </section>
  );
}