'use client';

import React from 'react';
import { ShieldCheck, AlertCircle, XCircle } from 'lucide-react';

interface SeparateTierPanelProps {
  label: string;
  score: number;
  maxScore: number;
  grade: string;
  pct: number;
}

const SeparateTierPanel: React.FC<SeparateTierPanelProps> = ({ label, score, maxScore, grade, pct }) => {
  const getColor = () => {
    if (score >= 8) return '#10B981'; // emerald-500
    if (score >= 5) return '#F59E0B'; // amber-500
    return '#EF4444'; // red-500
  };

  const getBgColor = () => {
    if (score >= 8) return 'bg-emerald-50 border-emerald-200';
    if (score >= 5) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getIcon = () => {
    if (score >= 8) return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
    if (score >= 5) return <AlertCircle className="w-5 h-5 text-amber-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const textColor = score >= 8 ? 'text-emerald-900' : score >= 5 ? 'text-amber-900' : 'text-red-900';

  return (
    <div className={`p-4 rounded-xl border-2 mb-4 transition-all hover:shadow-md ${getBgColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            {getIcon()}
          </div>
          <div>
            <h4 className={`font-bold text-sm uppercase tracking-tight ${textColor}`}>
              {label}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 border border-current opacity-70 ${textColor}`}>
                {grade}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-black ${textColor}`}>
            {score.toFixed(1)}
            <span className="text-[10px] opacity-40 ml-1 uppercase font-bold tracking-tighter self-end mb-1">/ {maxScore}</span>
          </div>
          <div className="w-24 h-1.5 bg-white/50 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${pct}%`, backgroundColor: getColor() }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeparateTierPanel;
