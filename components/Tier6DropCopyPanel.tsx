import React from 'react';
import { Tier6Results } from '@/lib/types';
import { ShieldCheck, Activity } from 'lucide-react';

interface Tier6DropCopyPanelProps {
  results?: Tier6Results;
}

const Tier6DropCopyPanel: React.FC<Tier6DropCopyPanelProps> = ({ results }) => {
  if (!results) return null;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 5) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getStatusDot = (status: string) => {
    if (status === 'full_credit') return 'bg-emerald-500';
    if (status === 'partial_credit') return 'bg-amber-500';
    return 'bg-red-400';
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-white">
        <h3 className="font-bold text-slate-900 flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-indigo-600" />
          {results.label}
        </h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getScoreColor(results.score)}`}>
          <span className="text-xs font-bold uppercase tracking-wider">Score:</span>
          <span className="text-sm font-black">{results.score}/{results.max_score}</span>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex gap-4 mb-6 p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-indigo-900 mb-1">Institutional consolidated feed</h4>
            <p className="text-sm text-indigo-800/80 leading-relaxed">
              {results.summary}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Compliance & Risk Checks</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {results.checks.map((check) => (
              <div key={check.check_id} className="group flex flex-col p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{check.check_id}</span>
                  <div className={`h-2 w-2 rounded-full ${getStatusDot(check.status)}`} />
                </div>
                <div className="text-xs font-bold text-slate-800 mb-1">{check.field_name || check.message_name}</div>
                <div className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                  {check.evidence || 'No documentation found.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tier6DropCopyPanel;
