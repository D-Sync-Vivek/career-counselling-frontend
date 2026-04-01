import React from 'react';
import { Check } from 'lucide-react';

export function Checkbox({ checked, onCheckedChange, id, disabled = false }) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        peer shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${checked 
          ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
          : 'bg-white border-slate-300 text-transparent hover:border-emerald-400'
        }
      `}
    >
      <Check size={16} strokeWidth={3} className={checked ? "opacity-100" : "opacity-0"} />
    </button>
  );
}