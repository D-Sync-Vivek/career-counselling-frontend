import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { assessmentApi } from '../services/api/reportApi'; 

export default function PsychometricTestModal({ 
  moduleName, 
  moduleTitle, 
  isAlreadyCompleted, 
  userId,
  onClose,
  onComplete 
}) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]); 
  const [loading, setLoading] = useState(!isAlreadyCompleted);
  const [submitting, setSubmitting] = useState(false);
  
  // 👉 NEW: Controls the success screen at the end
  const [testFinished, setTestFinished] = useState(false);

  useEffect(() => {
    if (isAlreadyCompleted) return;

    assessmentApi.getQuestions(moduleName)
      .then((data) => {
        setQuestions(data.questions);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load questions", err);
        setLoading(false);
      });
  }, [moduleName, isAlreadyCompleted]);

  // 👉 NEW: Back Button Logic
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleAnswer = (score) => {
    const currentQ = questions[currentIndex];
    
    // Safely update or replace the answer for the current index
    const newAnswers = [...answers];
    newAnswers[currentIndex] = { question_id: currentQ.id, score };
    setAnswers(newAnswers);

    // Go to next question or submit
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitTest(newAnswers);
    }
  };

const submitTest = async (finalAnswers) => {
    setSubmitting(true);
    try {
      // 1. Clean the answers
      const validAnswers = finalAnswers.filter(a => a && a.question_id !== undefined && a.score !== undefined);

      // 2. BULLETPROOF USER ID EXTRACTOR
      let safeUserId = userId || localStorage.getItem('user_id');

      // If it's STILL missing, extract it directly from the secure JWT token!
      if (!safeUserId) {
        const token = localStorage.getItem('token') || localStorage.getItem('access_token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          // Check all common backend ID names
          safeUserId = payload.user_id || payload.id || payload.sub; 
        }
      }

      if (!safeUserId) {
        throw new Error("Critical: Cannot extract User ID from session. Please log out and log back in.");
      }

      console.log("SENDING TO BACKEND:", JSON.stringify({ 
        user_id: safeUserId, 
        answers: validAnswers 
      }, null, 2));

      // 3. Make API Call
      await assessmentApi.submitScore(moduleName, safeUserId, validAnswers);
      
      // 4. Show Success Screen
      setTestFinished(true); 
    } catch (err) {
      console.error("Full Backend Error:", err);
      const errorData = err.response?.data || err.data || err;
      const errorDetails = errorData.detail ? JSON.stringify(errorData.detail, null, 2) : err.message;
      alert(`FastAPI Validation Error:\n${errorDetails}`); 
    }
    setSubmitting(false);
  };

  // ─── STATE 1: ALREADY COMPLETED (From Dashboard) ────────────────────────
  if (isAlreadyCompleted && !testFinished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">{moduleTitle} Complete!</h2>
          <p className="text-slate-500 mb-8">You have already submitted your answers for this assessment. Your data is saved.</p>
          <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── STATE 2: LOADING OR SUBMITTING ─────────────────────────────────────
  if (loading || submitting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center shadow-2xl">
          <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
          <p className="font-bold text-slate-600">
            {submitting ? 'Analyzing and saving your responses...' : 'Loading questions...'}
          </p>
        </div>
      </div>
    );
  }

  // ─── STATE 3: SUCCESS SCREEN (Just Finished) ────────────────────────────
  if (testFinished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
            className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 size={50} />
          </motion.div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Response Saved!</h2>
          <p className="text-slate-500 mb-8 font-medium">
            Your {moduleTitle} assessment has been successfully analyzed and stored in your profile.
          </p>
          <button 
            onClick={onComplete} // Triggers the dashboard to refresh
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-500/30"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── STATE 4: TAKING THE TEST ───────────────────────────────────────────
  const currentQ = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-6">
      <motion.div 
        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-[2rem] max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header & Progress Bar */}
        <div className="p-6 md:p-8 border-b border-slate-100 relative">
          
          {/* 👉 NEW: Back Button */}
          {currentIndex > 0 && (
            <button 
              onClick={handleBack}
              className="absolute left-6 md:left-8 top-6 md:top-8 text-slate-400 hover:text-slate-700 flex items-center gap-1 text-sm font-bold transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          <div className="flex flex-col items-center mb-6 mt-8 md:mt-0">
            <h2 className="text-xl font-black text-slate-800">{moduleTitle}</h2>
            <span className="text-sm font-bold text-slate-400 mt-1">Question {currentIndex + 1} of {questions.length}</span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question Area */}
        <div className="p-6 md:p-10 flex-1 overflow-y-auto bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
            >
              <h3 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight mb-10 text-center">
                "{currentQ?.text}"
              </h3>

              {/* 1-5 Likert Scale Buttons */}
              <div className="space-y-3">
                {[
                  { score: 5, label: "Strongly Agree", color: "hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 border-slate-200" },
                  { score: 4, label: "Agree", color: "hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 border-slate-200" },
                  { score: 3, label: "Neutral", color: "hover:border-blue-400 hover:bg-blue-50 text-slate-700 border-slate-200" },
                  { score: 2, label: "Disagree", color: "hover:border-orange-300 hover:bg-orange-50/50 text-slate-700 border-slate-200" },
                  { score: 1, label: "Strongly Disagree", color: "hover:border-red-500 hover:bg-red-50 text-slate-700 border-slate-200" },
                ].map((option) => (
                  <button
                    key={option.score}
                    onClick={() => handleAnswer(option.score)}
                    className={`w-full p-4 md:p-5 rounded-2xl border-2 bg-white font-bold text-left transition-all flex justify-between items-center group ${option.color} shadow-sm hover:shadow-md`}
                  >
                    <span>{option.label}</span>
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-5 bg-white border-t border-slate-100 text-center">
          <button onClick={onClose} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
            Cancel Assessment
          </button>
        </div>
      </motion.div>
    </div>
  );
}