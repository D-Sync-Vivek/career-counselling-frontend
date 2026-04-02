import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, Video, Settings, LogOut,
  Bell, User, Brain, Zap, Sparkles, ChevronRight, CheckCircle2,
  Lock, ArrowRight, Target, Users, UserCheck, Loader2, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getUserDisplayName, clearUserSession } from '../utils/jwt';
import { getSelectedCareer } from '../services/api/careerApi';
import { roadmapApi } from '../services/api/roadmapApi';
import { parentStudentApi } from '../services/api/parentStudentApi';
import { mentorshipApi } from '../services/api/mentorshipApi';
import { apiClient } from '../services/api/apiClient';

import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { SplitText, BlurText, ShinyOverlay } from '../components/ui/Animations';

// ============================================================================
// HELPER HOOKS & COMPONENTS
// ============================================================================

function useUserProgress() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/v1/auth/users/me');
      setUserData(response);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const progress = {
    profileDone: userData?.progress?.profile_done ?? false,
    personalityDone: userData?.progress?.personality_done ?? false,
    aptitudeDone: userData?.progress?.aptitude_done ?? false,
    assessmentsDone:
      (userData?.progress?.personality_done ?? false) &&
      (userData?.progress?.aptitude_done ?? false),
    personalityData: userData?.personality_data ?? null,
    aptiData: userData?.apti_data ?? null,
  };

  return { progress, loading, refetch: fetchUserData };
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-left ${
        active
          ? 'bg-blue-50 text-blue-600'
          : 'text-slate-500 hover:bg-blue-50/50 hover:text-blue-600 hover:translate-x-1'
      }`}
    >
      <Icon size={20} className={`mr-3 shrink-0 transition-transform duration-300 ${!active && 'group-hover:scale-110'}`} />
      {label}
    </button>
  );
}

function PhaseStep({ number, label, status, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5 hover:scale-105 transition-transform duration-300 cursor-default">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all duration-300 ${
        status === 'done'   ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30' :
        status === 'active' ? `${color} border-transparent text-white shadow-lg scale-110` :
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

// Score bar for aptitude display
function ScoreBar({ label, value, max = 100, color = 'bg-blue-500' }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-800">{value}/{max}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}

// Completed test card for personality
function PersonalityCompletedCard({ personalityData }) {
  const dominantTraits = personalityData?.dominant_traits ?? [];
  return (
    <div className="flex-1 bg-white rounded-3xl border border-emerald-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100">
          <Brain size={20} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-sm text-slate-800">Personality Test</p>
          <p className="text-xs text-emerald-600 font-bold">✅ Completed</p>
        </div>
        <CheckCircle2 size={20} className="text-emerald-500" />
      </div>
      {dominantTraits.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {dominantTraits.slice(0, 3).map((trait, i) => (
            <span key={i} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs font-bold rounded-full border border-violet-200">
              {trait}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Completed test card for aptitude
function AptitudeCompletedCard({ aptiData }) {
  const q = aptiData?.quantitative ?? 0;
  const l = aptiData?.logical ?? 0;
  const v = aptiData?.verbal ?? 0;
  const max = aptiData?.max_score ?? 15;
  return (
    <div className="flex-1 bg-white rounded-3xl border border-emerald-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100">
          <Zap size={20} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-sm text-slate-800">Aptitude Test</p>
          <p className="text-xs text-emerald-600 font-bold">✅ Completed</p>
        </div>
        <CheckCircle2 size={20} className="text-emerald-500" />
      </div>
      <div className="mt-1">
        <ScoreBar label="Quantitative" value={q} max={max} color="bg-blue-400" />
        <ScoreBar label="Logical" value={l} max={max} color="bg-violet-400" />
        <ScoreBar label="Verbal" value={v} max={max} color="bg-emerald-400" />
      </div>
    </div>
  );
}

function ActiveRoadmap() {
  const navigate = useNavigate();
  return (
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <h4 className="text-xl font-bold text-white mb-2">Roadmap is Active</h4>
        <p className="text-white/70 text-sm">You are currently tracking this career path.</p>
        <button
          onClick={() => navigate('/roadmap')}
          className="mt-4 px-6 py-2 bg-white text-emerald-600 font-bold rounded-xl text-sm"
        >
          View Roadmap
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function Dashboard() {
  const navigate = useNavigate();
  const name = getUserDisplayName();

  const { progress, loading, refetch } = useUserProgress();

  const [inviteCode, setInviteCode] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  // Fetch Selected Career
  useEffect(() => {
    async function fetchSavedCareer() {
      try {
        const response = await getSelectedCareer();
        if (response?.career_title) {
          setSelectedCareer({ title: response.career_title });
        }
      } catch (err) {
        console.error('Dashboard: Failed to fetch saved career', err);
      }
    }
    fetchSavedCareer();
  }, []);

  // Fetch Invite Code
  useEffect(() => {
    const getInviteCode = async () => {
      try {
        const response = await parentStudentApi.getStudentInviteCode();
        setInviteCode(response.invite_code);
      } catch (error) {
        console.error('Error fetching invite code:', error);
      }
    };
    getInviteCode();
  }, []);

  // Fetch Mentors
  useEffect(() => {
    if (selectedCareer) {
      const fetchMentors = async () => {
        setLoadingMentors(true);
        try {
          const mentors = await mentorshipApi.getRecommendedMentors(selectedCareer.title);
          setRecommendedMentors(mentors);
        } catch (error) {
          console.error('Mentor fetch failed', error);
        } finally {
          setLoadingMentors(false);
        }
      };
      fetchMentors();
    }
  }, [selectedCareer]);

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  const startJourney = async () => {
    try {
      await roadmapApi.startRoadmap();
      toast.success('Your career journey has started!');
    } catch (error) {
      console.error('Error starting roadmap:', error);
      toast.error('Failed to start roadmap.');
    }
  };

  const handlePersonalityClick = () => {
    if (!progress.profileDone) return;
    navigate('/personality-test');
  };

  const handleAptitudeClick = () => {
    if (!progress.profileDone) return;
    navigate('/aptitude-test');
  };

  const currentPhase = !progress.profileDone ? 1
    : !progress.assessmentsDone ? 2
    : !selectedCareer ? 3
    : 4;

  const overallPct = [
    progress.profileDone,
    progress.personalityDone,
    progress.aptitudeDone,
    !!selectedCareer,
  ].filter(Boolean).length * 25;

  const springTransition = { type: 'spring', stiffness: 400, damping: 25 };

  const fireConfetti = () => {
    confetti({ particleCount: 75, angle: 60, spread: 70, origin: { x: 0, y: 0.8 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#ffffff'] });
    confetti({ particleCount: 75, angle: 120, spread: 70, origin: { x: 1, y: 0.8 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#ffffff'] });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-blue-500" />
          <p className="text-slate-500 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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
            <NavItem icon={User} label="My Profile" onClick={() => navigate('/profile-creation')} />
            <NavItem icon={Brain} label="Personality" onClick={handlePersonalityClick} />
            <NavItem icon={Zap} label="Aptitude Test" onClick={handleAptitudeClick} />
            <NavItem icon={Sparkles} label="Career Matches" onClick={() => navigate('/career-recommendations')} />
            <NavItem icon={Map} label="My Roadmap" onClick={() => navigate('/roadmap')} />
            <NavItem icon={Video} label="Mentorship" />
            <NavItem icon={Settings} label="Settings" />
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
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:translate-x-1 rounded-xl transition-all duration-300 font-semibold group"
          >
            <LogOut size={20} className="mr-3 group-hover:scale-110 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-8">

        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <SplitText text={`Welcome back, ${name}!`} className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex flex-wrap" />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="text-slate-500 font-medium mt-1">
              {currentPhase === 1 && "Let's start by building your profile — it only takes 5 minutes."}
              {currentPhase === 2 && "Your profile is set. Time to complete your assessments."}
              {currentPhase === 3 && "Assessments done! Let's discover your perfect career matches."}
              {currentPhase === 4 && "Your roadmap is ready. Start your journey today!"}
            </motion.p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile logout button */}
            <button
              onClick={handleLogout}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold text-sm"
            >
              <LogOut size={16} /> Out
            </button>
            <button className="relative p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:scale-105 shadow-sm">
              <Bell size={20} className="text-slate-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-extrabold text-sm">
              {name[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Journey Progress Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-slate-800">Your AI Career Journey</h2>
            <span className="text-sm font-bold text-blue-600">{overallPct}% complete</span>
          </div>
          <div className="flex items-center">
            <PhaseStep number="1" label="Build Profile" status={progress.profileDone ? 'done' : currentPhase === 1 ? 'active' : 'locked'} color="bg-gradient-to-r from-blue-500 to-sky-400" />
            <div className={`flex-1 h-1 rounded-full mx-2 ${progress.profileDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <PhaseStep number="2" label="Assessments" status={progress.assessmentsDone ? 'done' : currentPhase === 2 ? 'active' : 'locked'} color="bg-gradient-to-r from-violet-500 to-purple-400" />
            <div className={`flex-1 h-1 rounded-full mx-2 ${progress.assessmentsDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <PhaseStep number="3" label="Career Path" status={selectedCareer ? 'done' : currentPhase === 3 ? 'active' : 'locked'} color="bg-gradient-to-r from-amber-500 to-orange-400" />
            <div className={`flex-1 h-1 rounded-full mx-2 ${selectedCareer ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <PhaseStep number="4" label="My Roadmap" status={currentPhase === 4 ? 'active' : currentPhase > 4 ? 'done' : 'locked'} color="bg-gradient-to-r from-emerald-500 to-teal-400" />
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Phase 1 Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -8 }} transition={springTransition}
            className={`group md:col-span-2 rounded-3xl p-8 relative overflow-hidden ${progress.profileDone ? 'bg-gradient-to-br from-emerald-600 to-teal-500' : 'bg-gradient-to-br from-blue-600 to-sky-400'} text-white shadow-lg`}
          >
            <ShinyOverlay />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/30">
                  {progress.profileDone ? '✅ Phase 1 — Complete' : '📋 Phase 1 — Build Your Profile'}
                </span>
                <h2 className="text-2xl font-extrabold mb-2">{progress.profileDone ? 'Profile Complete' : 'Start by building your profile'}</h2>
                <p className="text-white/80 font-medium max-w-md">{progress.profileDone ? 'Your background and interests have been captured.' : 'Answer questions about your background and aspirations. Takes ~5 minutes.'}</p>
              </div>
              {!progress.profileDone && (
                <button onClick={() => navigate('/profile-creation')} className="mt-6 flex items-center gap-2 px-6 py-3.5 bg-white text-blue-600 font-extrabold rounded-2xl shadow-sm w-fit">
                  Build My Profile <ArrowRight size={20} />
                </button>
              )}
            </div>
          </motion.div>

          {/* Assessment Cards */}
          <div className="space-y-4 flex flex-col h-full">
            {/* Personality Card */}
            {progress.personalityDone ? (
              <PersonalityCompletedCard personalityData={progress.personalityData} />
            ) : (
              <div
                onClick={handlePersonalityClick}
                className={`flex-1 bg-white rounded-3xl border p-6 shadow-sm transition-all group ${
                  progress.profileDone ? 'hover:border-violet-300 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                } border-slate-100`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-100">
                    <Brain size={20} className="text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-sm text-slate-800">Personality Test</p>
                    <p className="text-xs text-slate-400">35 questions · ~10 min</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </div>
            )}

            {/* Aptitude Card */}
            {progress.aptitudeDone ? (
              <AptitudeCompletedCard aptiData={progress.aptiData} />
            ) : (
              <div
                onClick={handleAptitudeClick}
                className={`flex-1 bg-white rounded-3xl border p-6 shadow-sm transition-all group ${
                  progress.profileDone ? 'hover:border-blue-300 cursor-pointer' : 'opacity-60 cursor-not-allowed'
                } border-slate-100`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100">
                    <Zap size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-extrabold text-sm text-slate-800">Aptitude Test</p>
                    <p className="text-xs text-slate-400">15 questions · ~8 min</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
              </div>
            )}
          </div>

          {/* Career Matches Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -8 }} transition={springTransition}
            className={`group rounded-3xl p-8 relative overflow-hidden shadow-sm cursor-pointer ${
              selectedCareer
                ? 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white'
                : progress.assessmentsDone
                ? 'bg-gradient-to-br from-amber-500 to-orange-400 text-white'
                : 'bg-white border border-slate-100 text-slate-900'
            }`}
            onClick={() => progress.assessmentsDone && !selectedCareer && navigate('/career-recommendations')}
          >
            {progress.assessmentsDone && <ShinyOverlay />}
            <div className="relative z-10">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/30">
                {selectedCareer ? '✅ Career Selected' : '✨ Phase 3'}
              </span>
              <h3 className="text-xl font-extrabold mb-2">{selectedCareer ? selectedCareer.title : 'AI Career Matches'}</h3>
              <p className="text-sm mb-4 opacity-80">{selectedCareer ? 'Your chosen path is active.' : 'Unlock recommendations.'}</p>
              {!selectedCareer && progress.assessmentsDone && (
                <button className="px-5 py-3 bg-white text-amber-600 font-extrabold rounded-2xl text-sm">See My Matches</button>
              )}
            </div>
          </motion.div>

          {/* Roadmap Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -8 }} transition={springTransition}
            className={`group md:col-span-2 rounded-3xl p-8 relative overflow-hidden ${selectedCareer ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white' : 'bg-white border border-slate-100'}`}
          >
            {selectedCareer && <ShinyOverlay />}
            <div className="relative z-10">
              <h3 className="text-2xl font-extrabold mb-2">Your Career Roadmap</h3>
              {selectedCareer ? (
                <>
                  <p className="text-slate-400 mb-6">Your step-by-step roadmap is ready. Start your journey today!</p>
                  <button onClick={startJourney} className="flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 font-extrabold rounded-2xl">
                    Start My Journey <ArrowRight size={20} />
                  </button>
                </>
              ) : (
                <p className="text-slate-500">Select a career to generate your roadmap.</p>
              )}
            </div>
          </motion.div>

          {/* Parent Invite */}
          <div className="rounded-3xl p-8 bg-white border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-slate-800 mb-4">Share with Parents</h3>
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
              <p className="font-bold text-slate-800 tracking-widest">{inviteCode || 'Loading...'}</p>
              <button
                onClick={() => { navigator.clipboard.writeText(inviteCode); toast.success('Copied!'); }}
                className="text-blue-500 font-bold"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Mentor Section */}
        {selectedCareer && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mt-6">
            <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 mb-6">
              <Users className="text-blue-500" size={24} /> Recommended Mentors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loadingMentors ? (
                <Loader2 className="animate-spin" />
              ) : (
                recommendedMentors.map(mentor => (
                  <div key={mentor.id} className="bg-slate-50 p-5 rounded-2xl border hover:border-blue-200 transition-all">
                    <h4 className="font-bold">{mentor.full_name}</h4>
                    <p className="text-xs text-blue-500 font-bold">{mentor.expertise}</p>
                    <button
                      onClick={() => navigate(`/mentorship/${mentor.id}`)}
                      className="mt-4 w-full py-2 bg-white rounded-xl text-sm font-bold border"
                    >
                      View Profile
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Global Journey Completion */}
        {overallPct === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onMouseEnter={fireConfetti}
            className="mt-6 bg-gradient-to-r from-blue-600 to-sky-400 rounded-3xl p-8 text-white text-center shadow-lg cursor-pointer"
          >
            <h2 className="text-2xl font-extrabold mb-2">You've completed the full journey!</h2>
            <p className="text-blue-100">Your roadmap is live. Make your dream a reality.</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}