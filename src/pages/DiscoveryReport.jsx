import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Target, Heart, Briefcase, 
  ChevronRight, Loader2, AlertCircle, CheckCircle2,Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Utils & API
import { getUserDisplayName } from '../utils/jwt';
import { reportApi } from '../services/api/reportApi';

// The Navigation Tabs (Matches your 5 dimensions + Career Matches)
const DIMENSIONS = [
  { id: 'personality', label: 'Personality', icon: Brain, color: 'bg-purple-500', hex: '#a855f7' },
  { id: 'aptitude', label: 'Aptitude', icon: Zap, color: 'bg-emerald-500', hex: '#10b981' },
  { id: 'emotional_quotient', label: 'Emotional Quotient', icon: Heart, color: 'bg-rose-500', hex: '#f43f5e' },
  { id: 'orientation_style', label: 'Orientation Style', icon: Target, color: 'bg-blue-500', hex: '#3b82f6' },
  { id: 'interest', label: 'Interests', icon: Briefcase, color: 'bg-amber-500', hex: '#f59e0b' },
  { id: 'career_matches', label: 'Career Matches', icon: CheckCircle2, color: 'bg-slate-900', hex: '#0f172a' }
];

export default function DiscoveryReport() {
  const navigate = useNavigate();
  const userName = getUserDisplayName();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personality');

  useEffect(() => {
    // Securely fetch the report for the logged-in user
    reportApi.getMyReport()
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load report.');
        setLoading(false);
      });
  }, []);

  // ─── LOADING & ERROR STATES ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-blue-600 animate-pulse" size={24} />
          </div>
        </div>
        <p className="font-bold text-slate-500 tracking-wide">Compiling your 30-page AI Discovery Report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[2.5rem] border border-red-100 text-center max-w-md shadow-xl"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">Report Not Found</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            {error || 'You need to complete all 5 psychometric assessments before generating this report.'}
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-4 bg-slate-900 text-white font-black rounded-2xl w-full hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
          >
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── DIMENSION RENDERER (Pages 4-26 of SRS) ─────────────────────────────

  const renderDimensionContent = (dimensionKey) => {
    // Handle the slight naming mismatch between DB and UI if necessary
    const data = report.five_dimensions_data[dimensionKey];
    if (!data) return (
      <div className="p-10 text-center text-slate-500 font-bold bg-white rounded-3xl border border-slate-100">
        Data not available for this dimension yet.
      </div>
    );

    // Format data for Recharts (1-9 scale)
    const chartData = data.traits.map(t => ({
      name: t.name,
      score: t.score
    }));

    const activeColorHex = DIMENSIONS.find(d => d.id === activeTab)?.hex || '#3b82f6';

    return (
      <div className="space-y-8 pb-12">
        {/* Header & Horizontal Bar Graph */}
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 capitalize">
            {dimensionKey.replace('_', ' ')} Profile
          </h2>
          <p className="text-slate-500 font-medium mb-10">Your detailed 1-9 scale psychometric breakdown.</p>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 9]} ticks={[0, 3, 6, 9]} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 13, fontWeight: 700, fill: '#334155'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={28}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={activeColorHex} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Trait Cards (Expert Analysis & Dev Plan) */}
        <div className="space-y-6">
          {data.traits.map((trait, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-slate-50 px-6 md:px-10 py-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-black text-slate-800">{trait.name}</h3>
                <div className="flex items-center gap-3">
                  <span className="hidden md:inline text-xs font-bold text-slate-400 uppercase tracking-widest">Score</span>
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-slate-800 shadow-sm notranslate">
                    {trait.score}<span className="text-slate-400 text-xs ml-0.5">/9</span>
                  </div>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-6 md:p-10 space-y-8">
                <div>
                  <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Meaning
                  </h4>
                  <p className="text-slate-700 font-semibold text-sm md:text-base bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50 leading-relaxed">
                    {trait.meaning}
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-purple-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" /> Expert Analysis
                  </h4>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {trait.expert_analysis}
                  </p>
                </div>
                <div>
                  <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Development Plan
                  </h4>
                  <ul className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    {trait.development_plan.map((plan, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm md:text-base text-slate-700 font-medium leading-relaxed">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 size={14} />
                        </div>
                        {plan}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // ─── CAREER MATCHES RENDERER (Pages 27-31 of SRS) ───────────────────────

  const renderCareerMatches = () => {
    // Check if the AI returned it as an array directly or inside a wrapper
    const matches = Array.isArray(report.career_matches_data) 
      ? report.career_matches_data 
      : report.career_matches_data?.recommended_careers;

    if (!matches || matches.length === 0) return (
      <div className="p-10 text-center text-slate-500 font-bold bg-white rounded-3xl border border-slate-100">
        No career matches found in the report.
      </div>
    );

    return (
      <div className="space-y-8 pb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-black text-slate-800">Your Top Career Fits</h2>
          <p className="text-slate-500 font-medium mt-2">Calculated based on your 5D profile and personal constraints.</p>
        </div>

        {matches.map((career, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden"
          >
            {/* The 0-100% Match Badge */}
            <div className="absolute top-6 right-6 md:top-10 md:right-10 text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center mb-1 shadow-lg shadow-emerald-500/20 bg-white">
                <span className="text-xl md:text-2xl font-black text-slate-800 notranslate">{career.overall_match_percentage}%</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">Overall Match</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-800 pr-24 md:pr-32 mb-8 leading-tight">
              {career.career_name}
            </h2>
            
            {/* AI Justification */}
            <div className="mb-10">
              <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Why this fits you perfectly</h4>
              <p className="text-slate-600 leading-relaxed font-medium md:text-lg">
                {career.justification}
              </p>
            </div>

            {/* Sub-Dimension Scores (Radar/Progress representation) */}
            <div className="bg-slate-50 rounded-[2rem] p-6 md:p-8 border border-slate-100 mb-8">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">5D Alignment Breakdown</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {Object.entries(career.dimension_scores).map(([dim, score]) => (
                  <div key={dim} className="flex flex-col">
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="capitalize text-slate-700">{dim.replace('_', ' ')}</span>
                      <span className="text-emerald-600 notranslate">{score}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} whileInView={{ width: `${score}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-emerald-500 rounded-full" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Fields */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Target size={14} /> Trending Roles:
              </span>
              <div className="flex flex-wrap gap-2">
                {career.trending_fields.map((field, i) => (
                  <span key={i} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform cursor-default">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  // ─── MAIN RENDER ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row font-sans text-slate-900">
      
      {/* Sidebar for Desktop */}
      <aside className="w-80 bg-white border-r border-slate-200 fixed h-screen overflow-y-auto hidden lg:flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 border-b border-slate-100">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors mb-6">
            <ChevronRight size={16} className="rotate-180" /> Back to Dashboard
          </button>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Comprehensive Report</p>
          <h1 className="text-2xl font-black text-slate-800 leading-tight">
            <span className="notranslate">{userName}'s</span> <br/>Career Discovery
          </h1>
        </div>
        <div className="p-5 space-y-2 flex-1">
          {DIMENSIONS.map((dim) => {
            const Icon = dim.icon;
            const isActive = activeTab === dim.id;
            return (
              <button
                key={dim.id}
                onClick={() => setActiveTab(dim.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                  isActive ? `${dim.color} text-white shadow-lg` : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                  {dim.label}
                </div>
                {isActive && <ChevronRight size={16} className="opacity-70" />}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-80 flex flex-col min-h-screen">
        
        {/* Mobile Header & Horizontal Scroll Tabs */}
        <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
          <div className="p-5 flex items-center justify-between">
            <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-slate-800">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h1 className="text-lg font-black text-slate-800 truncate px-4">
              <span className="notranslate">{userName}'s</span> Report
            </h1>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
          {/* Scrollable Tabs for Mobile */}
          <div className="flex overflow-x-auto hide-scrollbar px-5 pb-4 gap-2">
            {DIMENSIONS.map((dim) => {
              const isActive = activeTab === dim.id;
              return (
                <button
                  key={dim.id}
                  onClick={() => setActiveTab(dim.id)}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    isActive ? `${dim.color} text-white border-transparent shadow-md` : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {dim.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Render Area */}
        <div className="p-4 sm:p-6 md:p-10 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="max-w-5xl mx-auto w-full"
            >
              {activeTab === 'career_matches' 
                ? renderCareerMatches() 
                : renderDimensionContent(activeTab)
              }
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

    </div>
  );
}