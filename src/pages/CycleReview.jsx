import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, Sparkles, CheckCircle2, ChevronRight, Brain } from 'lucide-react';
import { toast } from 'react-hot-toast';

// API Imports
import { roadmapApi } from '../services/api/roadmapApi';
import { apiClient } from '../services/api/apiClient'; // Needed for manual API calls if necessary
import PsychometricTestModal from './PsychometricTestModal';
import { getUserDisplayName } from '../utils/jwt';

export default function CycleReview() {
  const navigate = useNavigate();
  const userName = getUserDisplayName();
  
  // ── STATE MANAGEMENT ──────────────────────────────────────────────
  const [step, setStep] = useState(1); // 1 = Reflection, 2 = Tests, 3 = Generating
  const [reflection, setReflection] = useState('');
  
  // Test Tracking State
  const [activeTest, setActiveTest] = useState(null);
  const [testsCompleted, setTestsCompleted] = useState({
    interest: false,
    eq: false,
    orientation: false
  });
  
  // User Data State
  const [userId, setUserId] = useState(null);

  // Grab the User ID on mount so the modals work properly
  useEffect(() => {
    apiClient.get('/api/v1/auth/users/me')
      .then(data => setUserId(data.id || data.user_id))
      .catch(err => console.error("Failed to load user", err));
  }, []);

  // ── STEP 1: REFLECTION LOGIC ──────────────────────────────────────
  const handleReflectionNext = () => {
    if (reflection.trim().length < 10) {
      toast.error("Please share a bit more detail to help the AI!");
      return;
    }
    setStep(2);
  };

  // ── STEP 2: TEST LOGIC ────────────────────────────────────────────
  const handleTestComplete = (testName) => {
    setActiveTest(null);
    setTestsCompleted(prev => ({ ...prev, [testName]: true }));
    toast.success(`Awesome! ${testName.toUpperCase()} data updated.`);
  };

  // 👉 FIXED: Deleted the infinite-looping useEffect from here!

  // ── STEP 3: AI GENERATION LOGIC ───────────────────────────────────
  const generateNextPhase = async () => {
    setStep(3); // Show loading screen
    
    try {
      // 1. Generate the next 6-month roadmap (Langchain triggers here!)
      const newRoadmapData = await roadmapApi.generateRoadmap();      
      
      // 2. Save it (this automatically archives the old phase in your new backend code)
      await roadmapApi.saveRoadmap(newRoadmapData);
      
      // 3. Start it (marks it as active)
      await roadmapApi.startRoadmap();
      
      toast.success("Phase 2 Successfully Unlocked! 🚀", { duration: 4000 });
      
      // Send them to the roadmap to see their new tasks!
      navigate('/roadmap');

    } catch (err) {
      console.error(err);
      toast.error("Failed to generate the next phase.");
      setStep(2); // Kick them back so they can try again
    }
  };

  // ── RENDERERS ─────────────────────────────────────────────────────

  if (step === 3) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/40 to-slate-900 z-0" />
        <div className="relative z-10 flex flex-col items-center">
          <Loader2 className="animate-spin text-blue-500 mb-8" size={60} />
          <h2 className="text-3xl md:text-4xl font-black mb-4">Architecting Your Next 6 Months...</h2>
          <p className="text-slate-400 font-medium max-w-md leading-relaxed">
            The AI is analyzing your reflection, processing your updated psychometric scores, checking your current grade level, and adjusting your path accordingly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        className="bg-white max-w-2xl w-full p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100"
      >
        
        {/* Step 1: Qualitative Reflection */}
        {step === 1 && (
          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <Sparkles size={30} />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-3 tracking-tight">Cycle Review</h1>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                You've completed 6 months of tasks! Before we generate your next phase, tell the AI Mentor how it went. This context will dramatically shape your next set of tasks.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                    What did you love? What did you hate?
                  </label>
                  <textarea 
                    rows="6"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="e.g., I really loved the Python coding tasks, but I got bored doing the UI/UX design tasks. I want to focus more on backend logic for this next phase."
                    className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 transition-shadow resize-none"
                  />
                </div>

                <button 
                  onClick={handleReflectionNext}
                  className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
                >
                  Continue Calibration <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Step 2: Quantitative Retesting */}
        {step === 2 && (
          <AnimatePresence mode="wait">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <Brain size={30} />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-3 tracking-tight">Recalibrating You</h1>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                A lot changes in 6 months! Your Aptitude and Personality are relatively fixed, but we need fresh data on your Interests, EQ, and Orientation Style to build an accurate Phase 2.
              </p>

              <div className="space-y-4 mb-8">
                {/* Interest Test Button */}
                <button 
                  onClick={() => !testsCompleted.interest && setActiveTest('interest')}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                    testsCompleted.interest 
                    ? 'bg-emerald-50 border-emerald-200 cursor-default' 
                    : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md text-left'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${testsCompleted.interest ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {testsCompleted.interest ? <CheckCircle2 size={20} /> : <span className="font-black text-sm">1</span>}
                    </div>
                    <div>
                      <h3 className={`font-bold ${testsCompleted.interest ? 'text-emerald-700' : 'text-slate-800'}`}>Career Interests</h3>
                      <p className="text-xs text-slate-400 font-medium">{testsCompleted.interest ? 'Data Synced' : '~5 mins'}</p>
                    </div>
                  </div>
                  {!testsCompleted.interest && <ChevronRight size={20} className="text-slate-300" />}
                </button>

                {/* EQ Test Button */}
                <button 
                  onClick={() => !testsCompleted.eq && setActiveTest('eq')}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                    testsCompleted.eq 
                    ? 'bg-emerald-50 border-emerald-200 cursor-default' 
                    : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md text-left'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${testsCompleted.eq ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {testsCompleted.eq ? <CheckCircle2 size={20} /> : <span className="font-black text-sm">2</span>}
                    </div>
                    <div>
                      <h3 className={`font-bold ${testsCompleted.eq ? 'text-emerald-700' : 'text-slate-800'}`}>Emotional Quotient</h3>
                      <p className="text-xs text-slate-400 font-medium">{testsCompleted.eq ? 'Data Synced' : '~5 mins'}</p>
                    </div>
                  </div>
                  {!testsCompleted.eq && <ChevronRight size={20} className="text-slate-300" />}
                </button>

                {/* Orientation Test Button */}
                <button 
                  onClick={() => !testsCompleted.orientation && setActiveTest('orientation')}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                    testsCompleted.orientation 
                    ? 'bg-emerald-50 border-emerald-200 cursor-default' 
                    : 'bg-white border-slate-100 hover:border-blue-300 hover:shadow-md text-left'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${testsCompleted.orientation ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      {testsCompleted.orientation ? <CheckCircle2 size={20} /> : <span className="font-black text-sm">3</span>}
                    </div>
                    <div>
                      <h3 className={`font-bold ${testsCompleted.orientation ? 'text-emerald-700' : 'text-slate-800'}`}>Orientation Style</h3>
                      <p className="text-xs text-slate-400 font-medium">{testsCompleted.orientation ? 'Data Synced' : '~5 mins'}</p>
                    </div>
                  </div>
                  {!testsCompleted.orientation && <ChevronRight size={20} className="text-slate-300" />}
                </button>
              </div>

              {/* 👉 FIXED: Replaced the auto-loop with a manual trigger button! */}
              <div className="mt-8">
                {testsCompleted.interest && testsCompleted.eq && testsCompleted.orientation ? (
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    onClick={generateNextPhase}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-1"
                  >
                    <Sparkles size={20} /> Generate Phase 2 Roadmap
                  </motion.button>
                ) : (
                  <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 py-4 rounded-xl border border-slate-100">
                    Complete all 3 modules above to unlock Phase 2
                  </div>
                )}
              </div>

            </motion.div>
          </AnimatePresence>
        )}

      </motion.div>

      {/* Psychometric Test Modal Renderer */}
      <AnimatePresence>
        {activeTest && (
          <PsychometricTestModal
            moduleName={activeTest}
            moduleTitle={
              activeTest === 'eq' ? 'Emotional Quotient' : 
              activeTest === 'orientation' ? 'Orientation Style' : 'Career Interests'
            }
            isAlreadyCompleted={false} // We force it to false because we WANT them to retake it!
            userId={userId}
            onClose={() => setActiveTest(null)}
            onComplete={() => handleTestComplete(activeTest)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}