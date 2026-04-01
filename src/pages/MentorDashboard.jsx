import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, BarChart2, Settings, LogOut, Bell,
  Star, CheckCircle2, Plus, Loader2, AlertCircle, Clock,
  ClipboardList, UserCheck, MessageSquare, Inbox, StopCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUserDisplayName, clearUserSession } from '../utils/jwt';
import { mentorshipApi } from '../services/api/mentorshipApi';


const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TABS = [
  { id: 'overview',     label: 'Overview',         icon: BarChart2 },
  { id: 'sessions',     label: 'Sessions',          icon: Clock },
  { id: 'requests',     label: 'Requests',          icon: Inbox },
  { id: 'profile',      label: 'My Profile',        icon: UserCheck },
  { id: 'availability', label: 'Availability',      icon: Calendar },
  { id: 'feedback',     label: 'Session Feedback',  icon: ClipboardList },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 rounded-xl transition-all font-semibold text-left ${active ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
      <Icon size={20} className="mr-3 shrink-0" /> {label}
    </button>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl font-semibold text-sm ${
        type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      {message}
    </motion.div>
  );
}

// ── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ profileData, slots }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-400 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-500/20"
        >
          <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-5 inline-block border border-white/30">
              {profileData ? (profileData.is_verified ? '✅ Verified Mentor' : '⏳ Awaiting Verification') : '👤 Profile Setup Needed'}
            </span>
            <h2 className="text-2xl font-extrabold mb-2">
              {profileData ? 'Your mentor profile is live' : 'Set up your mentor profile'}
            </h2>
            <p className="text-emerald-100 font-medium max-w-lg">
              {profileData
                ? profileData.is_verified
                  ? 'You are a verified mentor. Set your availability so students can book sessions.'
                  : 'Your profile is under review. You can set your availability once verified.'
                : 'Create your mentor profile to start guiding students on their career journeys.'}
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
            <div className="w-11 h-11 bg-yellow-400 text-white rounded-full flex items-center justify-center shadow-md">
              <Star size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Rating</p>
              <p className="text-2xl font-extrabold text-slate-800">—</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <div className="w-11 h-11 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Availability Slots</p>
              <p className="text-2xl font-extrabold text-slate-800">{slots.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mentor List */}
      <VerifiedMentorsList />
    </div>
  );
}

function VerifiedMentorsList() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMentors().then(setMentors).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center gap-3 text-slate-500 py-4">
      <Loader2 size={18} className="animate-spin text-emerald-500" /><span className="font-medium">Loading mentor network...</span>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-lg font-extrabold text-slate-800 mb-5 flex items-center gap-2">
        <Users size={18} className="text-emerald-500" /> Verified Mentor Network
      </h3>
      {mentors.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No verified mentors yet.</p>
          <p className="text-sm font-medium mt-1">Once admin approves profiles, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mentors.map((m, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                {m.full_name?.[0] || 'M'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">{m.full_name || m.email || 'Mentor'}</p>
                <p className="text-xs text-slate-400 font-medium truncate">{m.expertise || 'Expertise not listed'}</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">Verified</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── SESSIONS TAB ─────────────────────────────────────────────────────────────
function useCountdown(secondsInit) {
  const [secs, setSecs] = useState(secondsInit);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs(s => s - 1), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(Math.abs(secs) / 3600);
  const m = Math.floor((Math.abs(secs) % 3600) / 60);
  const s = Math.abs(secs) % 60;
  const pad = n => String(n).padStart(2, '0');
  return secs <= 0 ? 'Live Now' : `${h}h ${pad(m)}m ${pad(s)}s`;
}

function SessionCard({ session, onEnd, endingId }) {
  const countdown = useCountdown(session.seconds_until_start);
  const isLive = session.is_live || session.seconds_until_start <= 0;
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const token = localStorage.getItem('token');
  const wsUrl = `${BASE_URL.replace(/^http/, 'ws')}/api/v1/mentorship/sessions/${session.session_id}/chat/?token=${token}`;

  return (
    <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-colors ${isLive ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isLive ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
        <MessageSquare size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800">{session.other_party_name}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {new Date(session.scheduled_at).toLocaleString()}
        </p>
      </div>
      <div className="text-right shrink-0">
        {isLive ? (
          <div className="flex items-center gap-2">
            <a
              href={wsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all"
            >
              Join Chat
            </a>
            <button
              onClick={() => onEnd(session.session_id)}
              disabled={endingId === session.session_id}
              className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-1"
            >
              {endingId === session.session_id ? <Loader2 size={12} className="animate-spin" /> : <StopCircle size={12} />} End
            </button>
          </div>
        ) : (
          <span className="text-sm font-extrabold text-emerald-600 tabular-nums">{countdown}</span>
        )}
      </div>
    </div>
  );
}

function SessionsTab({ toast }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [endingId, setEndingId] = useState(null);

  useEffect(() => {
    getUpcomingSessions().then(setSessions).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleEnd(sessionId) {
    setEndingId(sessionId);
    try {
      await endSession(sessionId);
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      toast('Session ended. Student redirected to feedback.', 'success');
    } catch (err) {
      toast(err.message || 'Failed to end session', 'error');
    } finally {
      setEndingId(null);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-extrabold text-slate-800 mb-5 flex items-center gap-2">
          <Clock size={18} className="text-emerald-500" /> Upcoming & Live Sessions
        </h3>
        {loading ? (
          <div className="flex items-center gap-3 text-slate-400 py-6"><Loader2 size={18} className="animate-spin" /><span className="font-medium">Loading sessions...</span></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Clock size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No upcoming sessions.</p>
            <p className="text-sm font-medium mt-1">Approve student requests to create sessions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => <SessionCard key={s.session_id} session={s} onEnd={handleEnd} endingId={endingId} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ── REQUESTS TAB ──────────────────────────────────────────────────────────────
function RequestsTab({ toast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    getPendingRequests().then(setRequests).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleApprove(requestId) {
    setApprovingId(requestId);
    try {
      await approveRequest(requestId);
      setRequests(prev => prev.filter(r => r.request_id !== requestId));
      toast('Request approved! Session created.', 'success');
    } catch (err) {
      toast(err.message || 'Failed to approve request', 'error');
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-extrabold text-slate-800 mb-5 flex items-center gap-2">
          <Inbox size={18} className="text-emerald-500" /> Pending Student Requests
        </h3>
        {loading ? (
          <div className="flex items-center gap-3 text-slate-400 py-6"><Loader2 size={18} className="animate-spin" /><span className="font-medium">Loading requests...</span></div>
        ) : requests.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Inbox size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No pending requests.</p>
            <p className="text-sm font-medium mt-1">Students who book your slots will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.request_id} className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  {r.student_name?.[0] || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm">{r.student_name}</p>
                  <p className="text-xs text-slate-500 font-medium">{r.time_slot}</p>
                </div>
                <button
                  onClick={() => handleApprove(r.request_id)}
                  disabled={approvingId === r.request_id}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shrink-0"
                >
                  {approvingId === r.request_id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────
function ProfileTab({ profileData, onProfileCreated, toast }) {
  const [expertise, setExpertise] = useState(profileData?.expertise || '');
  const [bio, setBio] = useState(profileData?.bio || '');
  const [yearsExperience, setYearsExperience] = useState(profileData?.years_experience || 0);
  const [loading, setLoading] = useState(true); // Set to true to indicate loading initially

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMentorProfile(); // Fetch the profile
        if (data) {
          setExpertise(data.expertise || '');
          setBio(data.bio || '');
          setYearsExperience(data.years_experience || 0);
          onProfileCreated(data); // Update parent state with fetched data
        }
      } catch (err) {
        console.error("Error fetching mentor profile:", err);
        // If there's an error fetching, it likely means no profile exists, so we don't pre-fill.
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [onProfileCreated]); // Dependency on onProfileCreated

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await upsertMentorProfile({ expertise, bio, years_experience: yearsExperience });
      // Ensure local storage and parent state are updated with the latest info
      onProfileCreated({ ...profileData, expertise, bio, years_experience: yearsExperience, is_verified: profileData?.is_verified || false, mentor_id: res.mentor_id || profileData?.mentor_id });
      toast('Profile saved successfully!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to save profile', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-xl"
    >
      <h3 className="text-xl font-extrabold text-slate-900 mb-2">
        {profileData ? 'Manage Mentor Profile' : 'Create Mentor Profile'}
      </h3>
      <p className="text-slate-500 font-medium mb-6">
        {profileData ? 'Update your expertise, bio, and experience.' : 'Tell students what you specialize in. Be specific — students search by skills.'}
      </p>
      {loading ? ( // Conditionally render loader
        <div className="flex items-center justify-center py-10 gap-3 text-slate-500">
          <Loader2 size={24} className="animate-spin text-emerald-500" />
          <span className="font-semibold text-lg">Loading profile...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Your Areas of Expertise</label>
            <textarea
              value={expertise}
              onChange={e => setExpertise(e.target.value)}
              placeholder="e.g., Software Engineering, Python, Machine Learning, System Design, Interview Prep"
              rows={4}
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm resize-none"
            />
            <p className="text-xs text-slate-400 font-medium mt-1.5">Separate skills with commas</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Short Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell students a bit about yourself and your mentoring style."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Years of Experience</label>
            <input
              type="number"
              value={yearsExperience}
              onChange={e => setYearsExperience(parseInt(e.target.value) || 0)}
              placeholder="e.g., 5"
              min="0"
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !expertise.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-lg rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 size={20} className="animate-spin" /> Saving...</> : <><UserCheck size={20} /> Save Changes</>}
          </button>
        </form>
      )}

      {profileData && !profileData.is_verified && (
          <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-amber-700">
              Your profile is under review. Once an admin verifies it, you'll be able to set availability and receive student bookings.
            </p>
          </div>
        )}
    </motion.div>
  );
}

// ── AVAILABILITY TAB ──────────────────────────────────────────────────────────
function AvailabilityTab({ mentorId, profileData, toast }) {
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ day_of_week: 0, start_time: '09:00', end_time: '11:00' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!mentorId) { setLoadingSlots(false); return; }
    getMentorAvailability(mentorId)
      .then(setSlots)
      .catch(console.error)
      .finally(() => setLoadingSlots(false));
  }, [mentorId]);

  async function handleAdd(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Backend expects day_of_week 1–7 (1=Mon), but form stores 0-indexed
      const slot = { ...form, day_of_week: form.day_of_week + 1 };
      const res = await setAvailability([slot]);
      setSlots(prev => [...prev, { ...form, id: res?.id || Date.now() }]);
      setAdding(false);
      toast('Availability slot added!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to set availability', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const isVerified = profileData?.is_verified;

  return (
    <div className="space-y-6 max-w-2xl">
      {!profileData && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <AlertCircle size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm font-semibold text-amber-700">Create your mentor profile first before setting availability.</p>
        </div>
      )}
      {profileData && !isVerified && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <Clock size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm font-semibold text-amber-700">Your profile is awaiting admin verification. Availability can be set once verified.</p>
        </div>
      )}

      {/* Current Slots */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Calendar size={18} className="text-emerald-500" /> Weekly Availability
          </h3>
          {isVerified && (
            <button
              onClick={() => setAdding(v => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all shadow-sm"
            >
              <Plus size={16} /> Add Slot
            </button>
          )}
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {adding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAdd}
              className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 mb-5 space-y-4 overflow-hidden"
            >
              <h4 className="font-extrabold text-slate-800 text-sm">New Availability Slot</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Day</label>
                  <select
                    value={form.day_of_week}
                    onChange={e => setForm(f => ({ ...f, day_of_week: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Start Time</label>
                  <input
                    type="time" value={form.start_time}
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">End Time</label>
                  <input
                    type="time" value={form.end_time}
                    onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAdding(false)} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Save Slot
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Slot List */}
        {loadingSlots ? (
          <div className="flex items-center gap-3 text-slate-400 py-6"><Loader2 size={18} className="animate-spin" /><span className="font-medium">Loading slots...</span></div>
        ) : slots.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No availability slots set.</p>
            {isVerified && <p className="text-sm font-medium mt-1">Click "Add Slot" to set when students can book you.</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, i) => (
              <div key={slot.id || i} className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  {DAYS[slot.day_of_week]?.slice(0,3) || slot.day_of_week}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{DAYS[slot.day_of_week] || `Day ${slot.day_of_week}`}</p>
                  <p className="text-xs text-slate-500 font-medium">{slot.start_time} — {slot.end_time}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-white border border-emerald-200 px-3 py-1 rounded-full">Active</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── FEEDBACK TAB ──────────────────────────────────────────────────────────────
function FeedbackTab({ toast }) {
  const [form, setForm] = useState({ session_id: '', notes: '', action_items: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitMentorFeedback(form);
      setForm({ session_id: '', notes: '', action_items: '' });
      toast('Feedback submitted successfully!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm";

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <ClipboardList size={24} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Post-Session Feedback</h3>
            <p className="text-sm text-slate-500 font-medium">Submit notes and action items after a session.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Session ID <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.session_id}
              onChange={e => setForm(f => ({ ...f, session_id: e.target.value }))}
              placeholder="Paste session UUID from booking confirmation"
              required
              className={inputCls}
            />
            <p className="text-xs text-slate-400 font-medium mt-1.5">You receive this when a student books a session with you</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Session Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="What was covered? Key discussions, student progress observations..."
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Action Items for Student</label>
            <textarea
              value={form.action_items}
              onChange={e => setForm(f => ({ ...f, action_items: e.target.value }))}
              placeholder="Specific tasks or goals for the student to complete before the next session..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-slate-400 font-medium mt-1.5">These items will influence the student's AI roadmap</p>
          </div>

          <button
            type="submit"
            disabled={submitting || !form.session_id.trim()}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-lg rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : <><CheckCircle2 size={20} /> Submit Feedback</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MentorDashboard() {
  const navigate = useNavigate();
  
  // 1. GATEKEEPER: Check role before doing ANYTHING
  const user = getCurrentUser();
  const name = getUserDisplayName();
  const isMentor = localStorage.getItem('role') === 'mentor';

  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [slots, setSlots] = useState([]);
  const [toast, setToast] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);

  const mentorId = localStorage.getItem('harmony_mentor_id') || '';

  useEffect(() => {
    // 2. REDIRECT: If not a mentor, stop them immediately
    if (!isMentor) {
      console.warn("Unauthorized access attempt to Mentor Dashboard");
      setIsAuthorized(false);
      // Redirect to their correct home after 2 seconds
      const timer = setTimeout(() => {
        navigate(localStorage.getItem('role') === 'parent' ? '/parent-dashboard' : '/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }

    // 3. SECURE FETCH: Only fetch if authorized
    if (mentorId && isMentor) {
      mentorshipApi.getMentorAvailability(mentorId).then(setSlots).catch(() => {});
      setProfileData(JSON.parse(localStorage.getItem('harmony_mentor_profile') || 'null'));
    }
  }, [mentorId, isMentor, navigate]);

  // 4. UNAUTHORIZED UI: Show a friendly error instead of a white screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 font-medium max-w-md">
          You are currently logged in as a <b>{localStorage.getItem('role')}</b>. 
          Only verified Mentors can access this area.
        </p>
        <p className="text-slate-400 text-sm mt-4 italic">Redirecting you to your dashboard...</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-8 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg"
        >
          Go Home Now
        </button>
      </div>
    );
  }

  function showToast(message, type) {
    setToast({ message, type });
  }

  function handleLogout() {
    clearUserSession();
    navigate('/');
  }

  function handleProfileCreated(data) {
    setProfileData(data);
    localStorage.setItem('harmony_mentor_profile', JSON.stringify(data));
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between fixed h-screen z-20">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-100 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center shadow-md mr-3">
              <span className="text-white text-sm">💼</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">Harmony Pro</span>
          </div>
          <nav className="px-4 space-y-1">
            {TABS.map(tab => (
              <NavItem key={tab.id} icon={tab.icon} label={tab.label} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
            ))}
            <NavItem icon={Settings} label="Settings" />
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold">
            <LogOut size={20} className="mr-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {name}! 👋</h1>
            <p className="text-slate-500 font-medium mt-1">
              {TABS.find(t => t.id === activeTab)?.label} — Mentor Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 shadow-sm">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-extrabold text-sm">
              {name[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'overview'     && <OverviewTab profileData={profileData} slots={slots} />}
            {activeTab === 'sessions'     && <SessionsTab toast={showToast} />}
            {activeTab === 'requests'     && <RequestsTab toast={showToast} />}
            {activeTab === 'profile'      && <ProfileTab profileData={profileData} onProfileCreated={handleProfileCreated} toast={showToast} />}
            {activeTab === 'availability' && <AvailabilityTab mentorId={mentorId} profileData={profileData} toast={showToast} />}
            {activeTab === 'feedback'     && <FeedbackTab toast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key={toast.message} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}

