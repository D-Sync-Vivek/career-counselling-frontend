import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Map, Video, Settings, LogOut,
  Bell, User, Brain, Zap, Sparkles, ChevronRight, CheckCircle2,
  Lock, ArrowRight, Target,Users, UserCheck,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserDisplayName, clearUserSession } from '../utils/jwt';
import confetti from 'canvas-confetti';
import { toast } from 'react-toastify';

import ActiveRoadmap from '../components/sections/ActiveRoadmap';
import { parentStudentApi } from '../services/api/parentStudentApi';
import { roadmapApi } from '../services/api/roadmapApi';
import { mentorshipApi } from '../services/api/mentorshipApi';

// ============================================================================
// 1. SPLIT TEXT ANIMATION 
// ============================================================================
const SplitText = ({ text, className = '' }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      className={className}
    >
      {text.split(' ').map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 200 } },
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// ============================================================================
// 2. FAST BLUR TEXT ANIMATION
// ============================================================================
const BlurText = ({ text, delay = 0, className = "" }) => {
  const words = text.split(" ");
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ visible: { transition: { staggerChildren: 0.015, delayChildren: delay } } }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, filter: "blur(10px)", y: 5 },
            visible: { opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.2 } },
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// ============================================================================
// 3. SHINY HOVER OUTLINE
// ============================================================================
const ShinyOverlay = () => (
  <>
    <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/50 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.4)_inset] transition-all duration-500 pointer-events-none z-20" />
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-20 pointer-events-none"
      initial={{ x: '-150%' }}
      whileHover={{ x: '150%' }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </>
);

// ============================================================================
// HELPER HOOKS & COMPONENTS
// ============================================================================
function useProgress() {
  const [progress, setProgress] = useState({
    profileDone: localStorage.getItem('harmony_profile_done') === 'true',
    personalityDone: localStorage.getItem('harmony_personality_done') === 'true',
    aptitudeDone: localStorage.getItem('harmony_aptitude_done') === 'true',
    assessmentsDone: false,
    selectedCareer: null,
  });

  useEffect(() => {
    // 1. Sync synchronous local storage items
    const career = (() => { try { return JSON.parse(localStorage.getItem('harmony_selected_career')); } catch { return null; } })();
    
    // 2. Add an API call here to fetch the user's actual DB status
    // Example: apiClient.get('/api/v1/profiles/me').then(data => { ... })
    // For now, we will safely update the assessments check based on existing storage
    setProgress(prev => ({
      ...prev,
      assessmentsDone: prev.personalityDone && prev.aptitudeDone,
      selectedCareer: career
    }));

  }, []);

  return progress;
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`group flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-left ${
      active 
        ? 'bg-blue-50 text-blue-600' 
        : 'text-slate-500 hover:bg-blue-50/50 hover:text-blue-600 hover:translate-x-1'
    }`}>
      <Icon size={20} className={`mr-3 shrink-0 transition-transform duration-300 ${!active && 'group-hover:scale-110'}`} /> 
      {label}
    </button>
  );
}

function PhaseStep({ number, label, status, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5 hover:scale-105 transition-transform duration-300 cursor-default">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all duration-300 ${
        status === 'done'    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30' :
        status === 'active'  ? `${color} border-transparent text-white shadow-lg scale-110` :
        'bg-slate-100 border-slate-200 text-slate-400'
      }`}>
        {status === 'done' ? <CheckCircle2 size={18} /> : status === 'locked' ? <Lock size={14} /> : number}
      </div>
      <span className={`text-xs font-bold text-center leading-tight w-16 transition-colors duration-300 ${
        status === 'done' ? 'text-emerald-600' : status === 'active' ? 'text-slate-900' : 'text-slate-400'
      }`}>{label}</span>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================
export default function Dashboard() {
  const navigate = useNavigate();
  const name = getUserDisplayName();
  const progress = useProgress();

  const [inviteCode, setInviteCode] = useState(null);
  const [roadmapStatus, setRoadmapStatus] = useState('overview'); // Can be 'overview', 'active', 'completed'
// Fetch user progress from backend on login to fix "Local Storage Amnesia"
  useEffect(() => {
    const checkUserProgress = async () => {
      try {
        const { apiClient } = await import('../services/api/apiClient');
        const response = await apiClient.get('/api/v1/auth/users/me');
        let stateChanged = false;

        // Restore Profile Status
        if (response.progress.profile_done) {
          localStorage.setItem('harmony_profile_done', 'true');
          stateChanged = true;
        }
        
        // Restore Aptitude Status
        if (response.progress.aptitude_done) {
          localStorage.setItem('harmony_aptitude_done', 'true');
          stateChanged = true;
        }

        // Restore Personality Status
        if (response.progress.personality_done) {
          localStorage.setItem('harmony_personality_done', 'true');
          stateChanged = true;
        }

        // If we restored anything, trigger a reload so the UI catches up instantly
        if (stateChanged) {
          window.location.reload(); 
        }

      } catch (error) {
        console.error("No existing profile found or error fetching progress:", error);
      }
    };

    // Only run the DB check if the browser's local storage looks empty
    if (!localStorage.getItem('harmony_profile_done')) {
      checkUserProgress();
    }
  }, []);
  // Fetch invite code on component mount
  useEffect(() => {
    const getInviteCode = async () => {
      try {
        const response = await parentStudentApi.getStudentInviteCode();
        setInviteCode(response.invite_code);
      } catch (error) {
        console.error("Error fetching invite code:", error);
        toast.error("Failed to fetch invite code.");
      }
    };
    getInviteCode();
  }, []);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
const [loadingMentors, setLoadingMentors] = useState(false);

useEffect(() => {
  if (progress.selectedCareer) {
    const fetchMentors = async () => {
      setLoadingMentors(true);
      try {
        // We call our API bundle
        const mentors = await mentorshipApi.getRecommendedMentors(progress.selectedCareer.title);
        setRecommendedMentors(mentors);
      } catch (error) {
        console.error("Mentor fetch failed", error);
      } finally {
        setLoadingMentors(false);
      }
    };
    fetchMentors();
  }
}, [progress.selectedCareer]);

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  const startJourney = async () => {
    try {
      await roadmapApi.startRoadmap();
      setRoadmapStatus('active');
      toast.success("Your career journey has started!");
    } catch (error) {
      console.error("Error starting roadmap:", error);
      toast.error("Failed to start roadmap.");
    }
  };

  const currentPhase = !progress.profileDone ? 1
    : !progress.assessmentsDone ? 2
    : !progress.selectedCareer ? 3
    : 4;

  const overallPct = [
    progress.profileDone,
    progress.personalityDone,
    progress.aptitudeDone,
    !!progress.selectedCareer,
  ].filter(Boolean).length * 25;

  const springTransition = { type: "spring", stiffness: 400, damping: 25 };

  const fireConfetti = () => {
    confetti({
      particleCount: 75,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.8 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ffffff']
    });
    confetti({
      particleCount: 75,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.8 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ffffff']
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-x-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between fixed h-screen z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-100 mb-6 cursor-pointer group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-400 rounded-lg flex items-center justify-center shadow-md mr-3 group-hover:shadow-blue-500/30 group-hover:scale-105 transition-all">
              <span className="text-white text-sm">🤖</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">Harmony</span>
          </div>
          <nav className="px-4 space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" active />
            <NavItem icon={User}            label="My Profile"     onClick={() => navigate('/profile-creation')} />
            <NavItem icon={Brain}           label="Personality"    onClick={() => navigate('/personality-test')} />
            <NavItem icon={Zap}             label="Aptitude Test"  onClick={() => navigate('/aptitude-test')} />
            <NavItem icon={Sparkles}        label="Career Matches" onClick={() => navigate('/career-recommendations')} />
            <NavItem icon={Map}             label="My Roadmap"     onClick={() => navigate('/roadmap')} />
            <NavItem icon={Video}           label="Mentorship"     />
            <NavItem icon={Settings}        label="Settings"       />
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="px-4 py-3 mb-2 group cursor-pointer">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Journey Progress</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${overallPct}%` }} className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full" />
            </div>
            <div className="text-xs font-bold text-slate-500 mt-1">{overallPct}% complete</div>
          </div>
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:translate-x-1 rounded-xl transition-all duration-300 font-semibold group">
            <LogOut size={20} className="mr-3 group-hover:scale-110 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <SplitText 
              text={`Welcome back, ${name}!`} 
              className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex flex-wrap" 
            />
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
              className="text-slate-500 font-medium mt-1"
            >
              {currentPhase === 1 && "Let's start by building your profile — it only takes 5 minutes."}
              {currentPhase === 2 && "Your profile is set. Time to complete your assessments."}
              {currentPhase === 3 && "Assessments done! Let's discover your perfect career matches."}
              {currentPhase === 4 && "Your roadmap is ready. Start your journey today!"}
            </motion.p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:scale-105 hover:shadow-md transition-all duration-300 shadow-sm">
              <Bell size={20} className="text-slate-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer flex items-center justify-center text-white font-extrabold text-sm">
              {name[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Journey Progress Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-slate-800">Your AI Career Journey</h2>
            <span className="text-sm font-bold text-blue-600">{overallPct}% complete</span>
          </div>
          <div className="flex items-center">
            <PhaseStep number="1" label="Build Profile" status={progress.profileDone ? 'done' : currentPhase === 1 ? 'active' : 'locked'} color="bg-gradient-to-r from-blue-500 to-sky-400" />
            <div className={`flex-1 h-1 rounded-full mx-2 ${progress.profileDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <PhaseStep number="2" label="Assessments" status={progress.assessmentsDone ? 'done' : currentPhase === 2 ? 'active' : 'locked'} color="bg-gradient-to-r from-violet-500 to-purple-400" />
            <div className={`flex-1 h-1 rounded-full mx-2 ${progress.assessmentsDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <PhaseStep number="3" label="Career Path" status={progress.selectedCareer ? 'done' : currentPhase === 3 ? 'active' : 'locked'} color="bg-gradient-to-r from-amber-500 to-orange-400" />
            <div className={`flex-1 h-1 rounded-full mx-2 ${progress.selectedCareer ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <PhaseStep number="4" label="My Roadmap" status={currentPhase === 4 ? 'active' : currentPhase > 4 ? 'done' : 'locked'} color="bg-gradient-to-r from-emerald-500 to-teal-400" />
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ===================== DIV 1: Phase 1 ===================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -8 }}
            transition={springTransition}
            className={`group md:col-span-2 rounded-3xl p-8 relative overflow-hidden transition-shadow duration-300 hover:shadow-2xl ${
              progress.profileDone ? 'bg-gradient-to-br from-emerald-600 to-teal-500' : 'bg-gradient-to-br from-blue-600 to-sky-400'
            } text-white shadow-lg`}
          >
            <ShinyOverlay /> 
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/30">
                  {progress.profileDone ? '✅ Phase 1 — Complete' : '📋 Phase 1 — Build Your Profile'}
                </span>
                {progress.profileDone ? (
                  <>
                    <BlurText text="Profile Complete" className="text-2xl font-extrabold mb-2" />
                    <BlurText text="Your profile has been built. Your background, interests, and aspirations have been captured." delay={0.2} className="text-white/80 font-medium max-w-md block" />
                  </>
                ) : (
                  <>
                    <BlurText text="Start by building your profile" className="text-2xl font-extrabold mb-2" />
                    <BlurText text="Answer questions about your background, academics, lifestyle, interests, aspirations, and financial situation. Takes ~5 minutes." delay={0.2} className="text-blue-50 font-medium max-w-md block" />
                  </>
                )}
              </div>
              {!progress.profileDone && (
                <button onClick={() => navigate('/profile-creation')} className="mt-6 flex items-center gap-2 px-6 py-3.5 bg-white text-blue-600 font-extrabold rounded-2xl shadow-sm hover:scale-105 hover:shadow-lg transition-all duration-300 w-fit text-base">
                  Build My Profile <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Assessment Mini Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 flex flex-col h-full">
            <div onClick={() => progress.profileDone && navigate('/personality-test')} className={`flex-1 bg-white rounded-3xl border p-6 shadow-sm transition-all duration-300 group ${progress.profileDone ? 'hover:border-violet-300 hover:shadow-[0_8px_30px_rgb(139,92,246,0.12)] hover:-translate-y-1 cursor-pointer' : 'opacity-60 cursor-not-allowed'} ${progress.personalityDone ? 'border-emerald-200' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${progress.profileDone && 'group-hover:scale-110 group-hover:-rotate-3'} ${progress.personalityDone ? 'bg-emerald-100' : 'bg-violet-100'}`}>
                  <Brain size={20} className={progress.personalityDone ? 'text-emerald-600' : 'text-violet-600'} />
                </div>
                <div className="flex-1">
                  <p className={`font-extrabold text-sm transition-colors duration-300 ${progress.profileDone && 'group-hover:text-violet-600'} text-slate-800`}>Personality Test</p>
                  <p className="text-xs font-medium text-slate-400">35 questions · ~10 min</p>
                </div>
                {progress.personalityDone ? <CheckCircle2 size={20} className="text-emerald-500" /> : !progress.profileDone ? <Lock size={16} className="text-slate-300" /> : <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />}
              </div>
            </div>
            <div onClick={() => progress.profileDone && navigate('/aptitude-test')} className={`flex-1 bg-white rounded-3xl border p-6 shadow-sm transition-all duration-300 group ${progress.profileDone ? 'hover:border-blue-300 hover:shadow-[0_8px_30px_rgb(59,130,246,0.12)] hover:-translate-y-1 cursor-pointer' : 'opacity-60 cursor-not-allowed'} ${progress.aptitudeDone ? 'border-emerald-200' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${progress.profileDone && 'group-hover:scale-110 group-hover:rotate-3'} ${progress.aptitudeDone ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                  <Zap size={20} className={progress.aptitudeDone ? 'text-emerald-600' : 'text-blue-600'} />
                </div>
                <div className="flex-1">
                  <p className={`font-extrabold text-sm transition-colors duration-300 ${progress.profileDone && 'group-hover:text-blue-600'} text-slate-800`}>Aptitude Test</p>
                  <p className="text-xs font-medium text-slate-400">15 questions · ~8 min</p>
                </div>
                {progress.aptitudeDone ? <CheckCircle2 size={20} className="text-emerald-500" /> : !progress.profileDone ? <Lock size={16} className="text-slate-300" /> : <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-transform" />}
              </div>
            </div>
          </motion.div>

          {/* ===================== DIV 2: Phase 3 ===================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -8 }}
            transition={springTransition}
            className={`group rounded-3xl p-8 relative overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-2xl ${
              progress.assessmentsDone
                ? progress.selectedCareer ? 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white' : 'bg-gradient-to-br from-amber-500 to-orange-400 text-white'
                : 'bg-white border border-slate-100 text-slate-900'
            }`}
            onClick={() => progress.assessmentsDone && !progress.selectedCareer && navigate('/career-recommendations')}
            style={{ cursor: progress.assessmentsDone && !progress.selectedCareer ? 'pointer' : 'default' }}
          >
            {progress.assessmentsDone && <ShinyOverlay />} 
            {!progress.assessmentsDone ? (
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Lock size={24} className="text-slate-400" />
                </div>
                <BlurText text="AI Career Matches" className="font-extrabold text-slate-800 mb-2 text-lg block" />
                <BlurText text="Complete both assessments to unlock your personalised career recommendations." delay={0.2} className="text-slate-500 text-sm font-medium block" />
              </div>
            ) : (
              <>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 group-hover:scale-125 transition-transform duration-700" />
                <div className="relative z-10">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/30">
                    {progress.selectedCareer ? '✅ Career Selected' : '✨ Phase 3 — Ready!'}
                  </span>
                  <BlurText text={progress.selectedCareer ? progress.selectedCareer.title : 'Discover Your Career Path'} className="text-xl font-extrabold mb-2 block" />
                  <BlurText text={progress.selectedCareer ? progress.selectedCareer.rationale : 'AI has analysed your complete profile. Tap to see your top 5 career matches.'} delay={0.2} className="text-white/80 font-medium text-sm mb-4 block" />
                  
                  {!progress.selectedCareer && (
                    <button onClick={() => navigate('/career-recommendations')} className="flex items-center gap-2 px-5 py-3 bg-white text-amber-600 font-extrabold rounded-2xl text-sm hover:scale-105 hover:shadow-lg transition-all shadow-sm">
                      <Sparkles size={16} /> See My Matches
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>

          {/* ===================== DIV 3: Phase 4 ===================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -8 }}
            transition={springTransition}
            className={`group md:col-span-2 rounded-3xl p-8 relative overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-2xl ${
              progress.selectedCareer && roadmapStatus === 'overview' ? 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white cursor-pointer' : 'bg-white border border-slate-100 text-slate-900'
            }`}
          >
            {progress.selectedCareer && <ShinyOverlay />} 
            {!progress.selectedCareer ? (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Lock size={24} className="text-slate-400" />
                </div>
                <div>
                  <BlurText text="Your Career Roadmap" className="font-extrabold text-slate-800 mb-2 text-lg block" />
                  <BlurText text="Select a career from the AI recommendations to generate your personalised step-by-step roadmap." delay={0.2} className="text-slate-500 text-sm font-medium block" />
                </div>
              </div>
            ) : (
              <>
                {roadmapStatus === 'overview' && (
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/20">
                        🗺️ Phase 4 — Roadmap Ready
                      </span>
                      <BlurText text="Your Roadmap is Ready!" className="text-2xl font-extrabold mb-2 text-white block" />
                      <BlurText text="Your personalised week-by-week career roadmap is ready. Start your journey today!" delay={0.2} className="text-slate-400 font-medium max-w-lg block" />
                      <button onClick={startJourney} className="mt-6 flex items-center gap-2 px-6 py-3.5 bg-white text-emerald-600 font-extrabold rounded-2xl shadow-sm hover:scale-105 hover:shadow-lg transition-all duration-300 w-fit text-base">
                        Start My Journey <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                    <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg ml-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      <Target size={32} className="text-white" />
                    </div>
                  </div>
                )}
                {roadmapStatus === 'active' && <ActiveRoadmap />}
              </>
            )}
          </motion.div>

          {/* ===================== Parent Invite Section ===================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
            className="md:col-span-1 rounded-3xl p-8 relative overflow-hidden bg-white border border-slate-100 shadow-sm"
          >
            <h3 className="font-extrabold text-slate-800 mb-4">Share Profile with Parents</h3>
            {inviteCode ? (
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800 tracking-widest text-lg">{inviteCode}</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(inviteCode);
                    toast.success("Invite code copied!");
                  }}
                  className="ml-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Copy
                </button>
              </div>
            ) : (
              <p className="text-slate-500">Loading invite code...</p>
            )}
          </motion.div>

        </div>
        
            {progress.selectedCareer && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="md:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mt-6"
  >
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Users className="text-blue-500" size={24} /> Recommended Mentors
        </h3>
        <p className="text-slate-500 font-medium mt-1">
          Connect with experts who can help you become a {progress.selectedCareer.title}
        </p>
      </div>
    </div>

    {loadingMentors ? (
      <div className="flex items-center gap-3 py-8 text-slate-400">
        <Loader2 className="animate-spin" /> <span>Finding your matches...</span>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendedMentors.length > 0 ? (
          recommendedMentors.map((mentor) => (
            <div key={mentor.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-blue-200 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {mentor.full_name?.[0] || 'M'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{mentor.full_name || 'Verified Mentor'}</h4>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-tighter">{mentor.expertise}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                {mentor.bio || "Industry professional with expertise in " + mentor.expertise}
              </p>
              <button 
                onClick={() => navigate(`/mentorship/${mentor.id}`)}
                className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all flex items-center justify-center gap-2"
              >
                View Profile <ChevronRight size={16} />
              </button>
            </div>
          ))
        ) : (
          <div className="md:col-span-3 py-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
             <UserCheck size={40} className="mx-auto text-slate-300 mb-3" />
             <p className="text-slate-500 font-semibold">No direct matches for this niche yet.</p>
             <button onClick={() => navigate('/mentorship')} className="mt-2 text-blue-500 font-bold text-sm">Browse all mentors</button>
          </div>
        )}
      </div>
    )}
  </motion.div>
)}
        {/* ===================== DIV 4: Motivation Footer ===================== */}
        {overallPct === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, rotate: [0, -2, 2.5, -1.5, 1, 0] }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onMouseEnter={fireConfetti} 
            className="group mt-6 bg-gradient-to-r from-blue-600 to-sky-400 rounded-3xl p-8 text-white text-center shadow-lg cursor-pointer relative overflow-hidden"
          >
            <ShinyOverlay /> 
            <div className="relative z-10 flex flex-col items-center">
              <BlurText text="You've completed the full journey!" className="text-2xl font-extrabold mb-2 block" />
              <BlurText text="Your career roadmap is live. Start with Phase 1 and make your dream a reality." delay={0.2} className="text-blue-100 font-medium block" />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}