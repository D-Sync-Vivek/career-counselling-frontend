import { MessageCircle, ExternalLink, Star, GraduationCap } from 'lucide-react';

const StudentCard = ({ student }) => {
  return (
    <div className="relative group bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
      {/* Avatar & Identity Section */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {/* Squircle Student Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[1.5rem] flex items-center justify-center text-white text-xl font-black shadow-lg">
            {student.full_name?.charAt(0)}
          </div>
        </div>
        <div>
          <h4 className="font-black text-slate-800 leading-tight">{student.full_name}</h4>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Connected</p>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;