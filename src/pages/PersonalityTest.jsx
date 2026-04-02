import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Loader2, Brain } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { apiClient } from '../services/api/apiClient';
import { getModuleQuestions, submitAssessment } from '../services/api/assessmentApi';
import { getCurrentUser } from '../utils/jwt'; // FIXED: Changed getUserId to getCurrentUser

// ─── Result Screen ────────────────────────────────────────────────────────────

function PersonalityResultScreen({ personalityData }) {
  const navigate = useNavigate();
  const dominantTraits = personalityData?.dominant_traits ?? [];
  const rawScores = personalityData?.raw_scores ?? {};

  const traitColors = [
    'from-violet-500 to-purple-400',
    'from-blue-500 to-sky-400',
    'from-emerald-500 to-teal-400',
    'from-amber-500 to-orange-400',
    'from-pink-500 to-rose-400',
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-full">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <span className="font-bold text-emerald-700 text-sm">Personality Test Completed</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-violet-600 to-purple-500 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Brain size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold">Your Personality Profile</h1>
                <p className="text-white/70 text-sm">Your results have been securely saved to your profile.</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {dominantTraits.length > 0 && (
              <div className="mb-8">
                <h2 className="font-extrabold text-slate-800 mb-4 text-lg">Your Dominant Traits</h2>
                <div className="flex flex-wrap gap-3">
                  {dominantTraits.map((trait, i) => (
                    <motion.span
                      key={trait}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`px-5 py-2.5 bg-gradient-to-r ${traitColors[i % traitColors.length]} text-white font-bold rounded-2xl text-sm shadow-sm`}
                    >
                      {trait}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(rawScores).length > 0 && (
              <div className="mb-8">
                <h2 className="font-extrabold text-slate-800 mb-4 text-lg">Score Breakdown</h2>
                <div className="space-y-4">
                  {Object.entries(rawScores).map(([trait, score], i) => {
                    const max = 35;
                    const pct = Math.min(Math.round((score / max) * 100), 100);
                    return (
                      <div key={trait}>
                        <div className="flex justify-between text-sm font-semibold mb-1.5">
                          <span className="text-slate-700 capitalize">{trait}</span>
                          <span className="text-slate-500">{score} / {max}</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                            className={`h-full bg-gradient-to-r ${traitColors[i % traitColors.length]} rounded-full`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-violet-600 text-white font-extrabold rounded-2xl hover:bg-violet-700 transition-all active:scale-95 shadow-lg shadow-violet-200"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/aptitude-test')}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-700 font-extrabold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                Go to Aptitude Test
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Question / Option Components ─────────────────────────────────────────────

function OptionButton({ text, selected, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 font-medium transition-all duration-200 ${
        selected
          ? 'border-violet-500 bg-violet-50 text-violet-800'
          : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50/40'
      }`}
    >
      {text}
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PersonalityTest() {
  const navigate = useNavigate();
  const user = getCurrentUser(); // FIXED: Using user object
  const userId = user?.userId;

  const [status, setStatus] = useState('loading'); 
  const [personalityData, setPersonalityData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const me = await apiClient.get('/api/v1/auth/users/me');

        if (me.progress?.personality_done) {
          setPersonalityData(me.personality_data ?? {});
          setStatus('completed');
          // Ensure local storage is in sync
          localStorage.setItem('harmony_personality_done', 'true');
          return;
        }

        const data = await getModuleQuestions('personality');
        setQuestions(data?.questions ?? data ?? []);
        setStatus('testing');
      } catch (err) {
        console.error('PersonalityTest init error:', err);
        toast.error('Failed to load test. Please try again.');
        setStatus('testing'); 
      }
    }

    init();
  }, []);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;
  const allAnswered = totalQuestions > 0 && Object.keys(answers).length === totalQuestions;

  const handleAnswer = (questionId, optionValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionValue }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await submitAssessment({
        userId,
        moduleKey: 'personality',
        payload: { answers },
      });
      
      localStorage.setItem('harmony_personality_done', 'true');
      toast.success('Personality test submitted!');
      
      const me = await apiClient.get('/api/v1/auth/users/me');
      setPersonalityData(me.personality_data ?? {});
      setStatus('completed');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-violet-500" />
          <p className="text-slate-500 font-semibold">Checking your progress...</p>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    return <PersonalityResultScreen personalityData={personalityData} />;
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-slate-500 font-semibold mb-4">No questions available.</p>
          <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Dashboard
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-500">
            {currentIndex + 1} / {totalQuestions}
          </span>
          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Brain size={16} className="text-violet-600" />
                  </div>
                  <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Personality</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-8 leading-relaxed">
                  {currentQuestion?.question_text ?? currentQuestion?.text ?? currentQuestion?.question ?? ''}
                </h2>
                <div className="space-y-3">
                  {(currentQuestion?.options ?? []).map((opt, i) => {
                    const optValue = typeof opt === 'string' ? opt : opt.value ?? opt.text ?? opt.label;
                    const optLabel = typeof opt === 'string' ? opt : opt.text ?? opt.label ?? opt.value;
                    const qId = currentQuestion?.id ?? currentIndex;
                    return (
                      <OptionButton
                        key={i}
                        text={optLabel}
                        selected={answers[qId] === optValue}
                        onClick={() => handleAnswer(qId, optValue)}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-2xl disabled:opacity-40 hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft size={16} /> Previous
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={!answers[currentQuestion?.id ?? currentIndex]}
                    className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white font-extrabold rounded-2xl disabled:opacity-40 hover:bg-violet-700 transition-colors"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!allAnswered || submitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-extrabold rounded-2xl disabled:opacity-40 hover:bg-emerald-600 transition-colors"
                  >
                    {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : '✅ Submit Test'}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Answer dots */}
      <div className="bg-white border-t border-slate-100 p-4 flex justify-center gap-1.5 flex-wrap">
        {questions.map((q, i) => {
          const qId = q?.id ?? i;
          return (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentIndex ? 'bg-violet-600 scale-125' :
                answers[qId] ? 'bg-emerald-400' :
                'bg-slate-200'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}