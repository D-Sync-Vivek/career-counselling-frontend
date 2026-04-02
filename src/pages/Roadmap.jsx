import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, ChevronDown, ChevronUp, CheckCircle2, Zap,
  Target, BookOpen, Flag, AlertCircle, Clock, BarChart2, Brain,
  ExternalLink, RefreshCw, Layers, Users, UserCheck,
  Wand2, MessageSquare, Sparkles, Circle, CheckCircle, Map
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// API Service Imports
import { roadmapApi } from '../services/api/roadmapApi';
import { getSelectedCareer } from '../services/api/careerApi';

// ============================================================================
// CONSTANTS & META DATA
// ============================================================================

const IMPORTANCE_META = {
  CRITICAL:       { label: 'Critical',        bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    gradient: 'from-rose-500 to-pink-400' },
  STRATEGIC:      { label: 'Strategic',       bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   gradient: 'from-amber-500 to-orange-400' },
  SPECIALIZATION: { label: 'Specialization',  bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  gradient: 'from-violet-500 to-purple-400' },
};

const PHASE_GRADIENTS = [
  'from-blue-600 to-sky-400',
  'from-violet-600 to-purple-400',
  'from-emerald-600 to-teal-400',
  'from-amber-600 to-orange-400',
  'from-rose-600 to-pink-400',
];

const LEVEL_META = {
  BEGINNER:     { label: 'Beginner',     bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  INTERMEDIATE: { label: 'Intermediate', bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  ADVANCED:     { label: 'Advanced',     bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500'    },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function PhaseCard({ phase, index, totalPhases, onToggleTask }) {
  const [expanded, setExpanded] = useState(index === 0);
  const meta = IMPORTANCE_META[phase.importance] || IMPORTANCE_META.STRATEGIC;
  const gradient = PHASE_GRADIENTS[index % PHASE_GRADIENTS.length];
  
  const totalTasks = phase.tasks?.length || 0;
  const completedTasks = phase.tasks?.filter(t => t.status === 'Completed').length || 0;
  const progress = phase.progress_percentage || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {index < totalPhases - 1 && (
        <div className="absolute left-8 top-full h-6 w-0.5 bg-gradient-to-b from-slate-300 to-transparent z-10" />
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-4">
        {/* Phase Header */}
        <div className="w-full relative">
          <button 
            onClick={() => setExpanded(e => !e)} 
            className={`w-full text-left bg-gradient-to-r ${gradient} p-6 text-white relative overflow-hidden transition-all`}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shrink-0">
                  <span className="text-white font-extrabold text-lg">{index + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-bold border border-white/30 backdrop-blur-sm">
                      {meta.label}
                    </span>
                    <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-bold border border-white/30 backdrop-blur-sm">
                      {completedTasks}/{totalTasks} Tasks
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold">{phase.title || phase.phase_title}</h3>
                </div>
              </div>
              <div className="shrink-0 mt-1">
                {expanded ? <ChevronUp size={22} className="text-white/80" /> : <ChevronDown size={22} className="text-white/80" />}
              </div>
            </div>

            <div className="mt-4 relative z-10">
              <div className="flex justify-between items-center mb-1 text-[10px] font-bold uppercase tracking-wider text-white/90">
                <span>Phase Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                />
              </div>
            </div>
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-6 bg-white">
                <div>
                  <h4 className="flex items-center gap-2 font-extrabold text-slate-800 mb-4 text-sm uppercase tracking-wider">
                    <CheckCircle2 size={16} className="text-blue-500" /> Milestone Tasks
                  </h4>
                  <div className="grid gap-3">
                    {phase.tasks?.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onToggleTask(task.id, phase.id)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                          task.status === 'Completed' 
                          ? 'bg-emerald-50/50 border-emerald-100 text-slate-700' 
                          : 'bg-slate-50 border-slate-100 hover:border-blue-200 text-slate-600'
                        }`}
                      >
                        <div className="shrink-0">
                          {task.status === 'Completed' ? (
                            <CheckCircle size={24} className="text-emerald-500 fill-emerald-100" />
                          ) : (
                            <Circle size={24} className="text-slate-300 group-hover:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold text-sm ${task.status === 'Completed' ? 'line-through opacity-60' : ''}`}>
                            {task.title}
                          </p>
                          {task.description && <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {phase.milestone_project && (
                  <div className={`${meta.bg} ${meta.border} border rounded-2xl p-5`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Flag size={16} className={meta.text} />
                      <span className={`text-xs font-extrabold uppercase tracking-wider ${meta.text}`}>Milestone Project</span>
                    </div>
                    <p className={`font-bold text-base ${meta.text}`}>{phase.milestone_project}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN ROADMAP COMPONENT
// ============================================================================

export default function Roadmap() {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [career, setCareer] = useState('');

  const fetchRoadmapData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Try to get existing active roadmap
      const data = await roadmapApi.getActiveRoadmap();
      setRoadmap(data);
    } catch (e) {
      // 2. If no roadmap exists, get the selected career from DATABASE
      try {
        const selection = await getSelectedCareer();
        
        if (selection && selection.career_title) {
          setCareer(selection.career_title);
          // 3. Generate using the title from DB
          const generated = await roadmapApi.generateRoadmap(selection.career_title);
          await roadmapApi.saveRoadmap(generated);
          const active = await roadmapApi.getActiveRoadmap();
          setRoadmap(active);
        } else {
          setError('Please select a career recommendation first.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load roadmap. Ensure you have an active selection.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchRoadmapData();
  }, [fetchRoadmapData]);

  const handleToggleTask = async (taskId, phaseId) => {
    // Optimistic Update
    setRoadmap(prev => {
      if (!prev) return prev;
      const newPhases = prev.phases.map(p => {
        if (p.id !== phaseId) return p;
        const newTasks = p.tasks.map(t => {
          if (t.id !== taskId) return t;
          return { ...t, status: t.status === 'Completed' ? 'Not Started' : 'Completed' };
        });
        
        const completed = newTasks.filter(t => t.status === 'Completed').length;
        const pct = (completed / newTasks.length) * 100;
        return { ...p, tasks: newTasks, progress_percentage: pct };
      });

      const globalPct = newPhases.reduce((acc, p) => acc + p.progress_percentage, 0) / newPhases.length;
      return { ...prev, phases: newPhases, progress_percentage: globalPct };
    });

    try {
      const result = await roadmapApi.toggleTaskComplete(taskId);
      // Sync with server result for accuracy
      setRoadmap(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          progress_percentage: result.total_progress,
          phases: prev.phases.map(p => p.id === phaseId ? { ...p, progress_percentage: result.phase_progress } : p)
        };
      });
    } catch (err) {
      console.error("Task toggle failed", err);
    }
  };

  const globalProgress = roadmap?.progress_percentage || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 opacity-20 animate-ping absolute" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center relative">
              <Target size={36} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Syncing Roadmap...</h2>
          <Loader2 size={20} className="animate-spin text-blue-500 mx-auto mt-4" />
        </motion.div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-10 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">No active roadmap</h2>
          <p className="text-slate-500 font-medium mb-6">{error || 'Generate a roadmap to start tracking your journey.'}</p>
          <button onClick={() => navigate('/career-recommendations')} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            Find Career Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold">
          <ArrowLeft size={18} /> Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Target size={20} className="text-blue-500" />
          <span className="text-lg font-extrabold text-slate-800">Real-Time Career Track</span>
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
             <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tighter">Global Journey</div>
             <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${globalProgress}%` }} />
             </div>
             <div className="text-xs font-black text-blue-600">{Math.round(globalProgress)}%</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero Section with Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 text-white mb-8 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block border border-blue-500/30 text-blue-300">
                  Active Mission
                </span>
                <h1 className="text-4xl font-extrabold mb-2 tracking-tight">{roadmap.title}</h1>
                <p className="text-slate-400 font-medium">Level: {roadmap.student_level} | Status: {roadmap.status}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-blue-400">{Math.round(globalProgress)}%</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Complete</div>
              </div>
            </div>

            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-8">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${globalProgress}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                  <Layers size={12} /> Phases
                </div>
                <div className="text-lg font-bold">{roadmap.phases?.length || 0} Total</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-slate-500 text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Tasks
                </div>
                <div className="text-lg font-bold">
                  {roadmap.phases?.reduce((acc, p) => acc + p.tasks.filter(t => t.status === 'Completed').length, 0)} Done
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Learning Timeline */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-blue-500" />
              <h2 className="text-xl font-extrabold text-slate-800">Interactive Path</h2>
            </div>
            <div className="text-xs font-bold text-slate-400 flex items-center gap-1">
               <Sparkles size={12} /> Tasks sync automatically
            </div>
          </div>

          {roadmap.phases?.map((phase, i) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              index={i}
              totalPhases={roadmap.phases.length}
              onToggleTask={handleToggleTask}
            />
          ))}
        </div>

        {/* Floating Start CTA if overview */}
        {roadmap.status === 'Overview' && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-8 left-0 right-0 px-6 z-50 pointer-events-none"
          >
            <div className="max-w-md mx-auto pointer-events-auto">
              <button 
                onClick={async () => {
                   await roadmapApi.startRoadmap();
                   fetchRoadmapData();
                }}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg rounded-2xl shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 hover:-translate-y-1 transition-all"
              >
                🚀 INITIATE CAREER JOURNEY
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}