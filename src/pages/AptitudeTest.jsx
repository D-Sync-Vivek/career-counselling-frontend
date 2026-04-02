import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Loader2, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { apiClient } from '../services/api/apiClient';
import { getAptitudePool, submitAssessment } from '../services/api/assessmentApi';
import { getCurrentUser } from '../utils/jwt'; // FIXED: Changed getUserId to getCurrentUser

// ─── Result Screen ────────────────────────────────────────────────────────────

function ScoreCard({ label, value, max, color, bgColor, icon: Icon }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bgColor} rounded-2xl p-6 border`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <p className="font-extrabold text-slate-800 text-sm">{label}</p>
          <p className="text-2xl font-black text-slate-900">{value}<span className="text-sm font-semibold text-slate-400">/{max}</span></p>
        </div>
      </div>
      <div className="w-full h-2.5 bg-white/70 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
      <p className="text-xs font-bold text-slate-500 mt-1.5 text-right">{pct}%</p>
    </motion.div>
  );
}

function AptitudeResultScreen({ aptiData }) {
  const navigate = useNavigate();

  const q = aptiData?.quantitative ?? 0;
  const l = aptiData?.logical ?? 0;
  const v = aptiData?.verbal ?? 0;
  const max = aptiData?.max_score ?? 15;
  const total = q + l + v;
  const totalMax = max * 3;

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
            <span className="font-bold text-emerald-700 text-sm">Aptitude Test Completed</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-sky-400 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold">Your Aptitude Results</h1>
                  <p className="text-white/70 text-sm">Your scores have been recorded in your profile.</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-white/60 text-sm font-semibold">Total Score</p>
                <p className="text-4xl font-black">{total}<span className="text-lg font-semibold text-white/60">/{totalMax}</span></p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="font-extrabold text-slate-800 mb-5 text-lg">Score Breakdown</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <ScoreCard label="Quantitative" value={q} max={max} color="bg-blue-500" bgColor="bg-blue-50 border-blue-100" icon={Zap} />
              <ScoreCard label="Logical" value={l} max={max} color="bg-violet-500" bgColor="bg-violet-50 border-violet-100" icon={Zap} />
              <ScoreCard label="Verbal" value={v} max={max} color="bg-emerald-500" bgColor="bg-emerald-50 border-emerald-100" icon={Zap} />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-extrabold rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/career-recommendations')}
                className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 text-slate-700 font-extrabold rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
              >
                View Career Matches →
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── UI Helpers ────────────────────────────────────────────────────────────────

function OptionButton({ text, selected, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 font-medium transition-all duration-200 ${
        selected
          ? 'border-blue-500 bg-blue-50 text-blue-800'
          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/40'
      }`}
    >
      {text}
    </motion.button>
  );
}

function CategoryBadge({ category }) {
  const map = {
    quantitative: { label: 'Quantitative', cls: 'bg-blue-100 text-blue-700' },
    logical: { label: 'Logical', cls: 'bg-violet-100 text-violet-700' },
    verbal: { label: 'Verbal', cls: 'bg-emerald-100 text-emerald-700' },
  };
  const { label, cls } = map[category?.toLowerCase()] ?? { label: category, cls: 'bg-slate-100 text-slate-700' };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${cls}`}>{label}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AptitudeTest() {
  const navigate = useNavigate();
  const user = getCurrentUser(); // FIXED: Using user object
  const userId = user?.userId;

  const [status, setStatus] = useState('loading'); 
  const [aptiData, setAptiData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [targetGrade, setTargetGrade] = useState('10');

  useEffect(() => {
    async function init() {
      try {
        const me = await apiClient.get('/api/v1/auth/users/me');

        if (me.progress?.aptitude_done) {
          setAptiData(me.apti_data ?? {});
          setStatus('completed');
          localStorage.setItem('harmony_aptitude_done', 'true');
          return;
        }

        const grade = me?.profile?.grade ?? me?.basic_info?.grade ?? localStorage.getItem('harmony_target_grade') ?? '10';
        setTargetGrade(grade);

        const pool = await getAptitudePool(grade);
        setQuestions(pool?.questions ?? pool ?? []);
        setStatus('testing');
      } catch (err) {
        console.error('AptitudeTest init error:', err);
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
    if (currentIndex < totalQuestions - 1) setCurrentIndex(i => i + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
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
        moduleKey: 'aptitude',
        payload: { answers, target_grade: targetGrade },
      });
      
      localStorage.setItem('harmony_aptitude_done', 'true'); // FIXED: Sync Dashboard status
      toast.success('Aptitude test submitted!');
      
      const me = await apiClient.get('/api/v1/auth/users/me');
      setAptiData(me.apti_data ?? {});
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
          <Loader2 size={40} className="animate-spin text-blue-500" />
          <p className="text-slate-500 font-semibold">Checking your progress...</p>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    return <AptitudeResultScreen aptiData={aptiData} />;
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-slate-500 font-semibold mb-4">No questions available.</p>
          <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors">
          <ArrowLeft size={18} /> Dashboard
        </button>
        <div className="flex items-center gap-3">
          {currentQuestion?.category && <CategoryBadge category={currentQuestion.category} />}
          <span className="text-sm font-bold text-slate-500">{currentIndex + 1} / {totalQuestions}</span>
          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full" />
          </div>
        </div>
      </div>

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
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Zap size={16} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Aptitude</span>
                  {currentQuestion?.difficulty && (
                    <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      currentQuestion.difficulty === 'hard' ? 'bg-red-100 text-red-600' :
                      currentQuestion.difficulty === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                  )}
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
                      <OptionButton key={i} text={optLabel} selected={answers[qId] === optValue} onClick={() => handleAnswer(qId, optValue)} />
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={handlePrev} disabled={currentIndex === 0} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-semibold rounded-2xl disabled:opacity-40 hover:bg-slate-50 transition-colors">
                  <ArrowLeft size={16} /> Previous
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button onClick={handleNext} disabled={!answers[currentQuestion?.id ?? currentIndex]} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-extrabold rounded-2xl disabled:opacity-40 hover:bg-blue-700 transition-colors">
                    Next →
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={!allAnswered || submitting} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white font-extrabold rounded-2xl disabled:opacity-40 hover:bg-emerald-600 transition-colors">
                    {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : '✅ Submit Test'}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-white border-t border-slate-100 p-4 flex justify-center gap-1.5 flex-wrap">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === currentIndex ? 'bg-blue-600 scale-125' : answers[q?.id ?? i] ? 'bg-emerald-400' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}