import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const springConfig = { damping: 25, stiffness: 200 }; 
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [-15, 15]), springConfig);
  const translateX = useSpring(useTransform(mouseX, [-1, 1], [-20, 20]), springConfig);
  const translateY = useSpring(useTransform(mouseY, [-1, 1], [-20, 20]), springConfig);

  return (
    <div className="relative w-full flex flex-col items-center" onMouseMove={handleMouseMove}>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* LEFT SIDE: Text Content */}
        <div className="flex flex-col justify-center items-start gap-6 text-left mt-[-5vh] z-20">
          
          {/* ✅ TRANSLATION SAFE: Rendered as standard continuous text nodes */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] font-extrabold text-slate-900 tracking-tight leading-[1.1] flex flex-col items-start"
          >
            <span className="block">Discover Your True</span>
            
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="block mt-2 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#0ea5e9]"
            >
              Career Trajectory
            </motion.span>
          </motion.h1>

          {/* ✅ TRANSLATION SAFE: Uses Framer Motion's filter to recreate the BlurText effect without breaking the string */}
          <motion.p 
            initial={{ opacity: 0, filter: "blur(12px)", y: 15 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-lg md:text-xl text-slate-800 max-w-lg leading-relaxed font-semibold bg-white/20 backdrop-blur-[2px] p-4 rounded-2xl shadow-sm border border-white/40 block mt-2"
          >
            Guided AI analysis that takes you from confusion to clarity. Join as a student, mentor, or parent to map out the future.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 mt-2"
          >
            <Link to="/signin" className="px-8 py-4 bg-[#3b82f6] text-white text-center font-bold rounded-full hover:scale-105 hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all z-20 w-fit">
              Start Your Journey
            </Link>
          </motion.div>
        </div>

        {/* RIGHT SIDE: Interactive Visual/Robot */}
        <div className="flex justify-center items-center relative h-full w-full" style={{ perspective: 1000 }}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ rotateX, rotateY, x: translateX, y: translateY }}
            className="relative z-10 -mt-16 lg:-mt-24 w-full flex justify-center cursor-pointer hover:scale-105 transition-transform duration-300"
            whileTap={{ scale: 0.95 }} 
          >
            <img 
              src="/robo.png" 
              alt="AI Mascot" 
              className="w-full max-w-[450px] lg:max-w-[550px] object-contain -scale-x-100" 
              style={{ filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.15)) hue-rotate(210deg) saturate(1.2)' }}
            />
          </motion.div>
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#3b82f6]/15 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
        </div>
      </div>

      <motion.div 
        className="mt-20 lg:mt-32 flex flex-col items-center z-20"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <span className="text-xs mb-2 uppercase tracking-widest font-extrabold text-slate-600/90">Scroll to Explore</span>
        <div className="w-[2px] h-10 bg-gradient-to-b from-slate-500/90 to-transparent rounded-full shadow-md" />
      </motion.div>
    </div>
  );
}