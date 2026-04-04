import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Calendar, Star, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mentorshipApi } from '../services/api/mentorshipApi';

export default function Mentorship() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all verified mentors
    mentorshipApi.listMentors()
      .then(setMentors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold mb-8 transition-colors">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            <Users size={32} className="text-blue-500" /> Professional Mentors
          </h1>
          <p className="text-slate-500 text-lg font-medium">Connect with industry experts to accelerate your career journey.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <Loader2 size={40} className="animate-spin text-blue-500" />
            <p className="font-bold">Loading mentor profiles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <motion.div 
                key={mentor.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col h-full hover:shadow-xl hover:shadow-blue-500/5 transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {mentor.full_name?.[0] || 'M'}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{mentor.full_name || "Verified Mentor"}</h3>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-black uppercase tracking-widest">{mentor.rating || 'New'}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Expertise</p>
                  <p className="text-sm font-bold text-slate-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg inline-block">
                    {mentor.expertise}
                  </p>
                </div>

                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 flex-grow">
                  {mentor.bio || "Experienced professional ready to provide data-driven career guidance and technical mentorship."}
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/mentorship/${mentor.id}`)}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar size={18} /> Book Session
                  </button>
                  <button
                    onClick={() => navigate(`/mentorship/${mentor.id}`)}
                    className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    View Full Profile
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}