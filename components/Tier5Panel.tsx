import React from 'react';
import { Tier5Results } from '@/lib/types';
import { Info } from 'lucide-react';

interface Tier5PanelProps {
  results?: Tier5Results;
}

const Tier5Panel: React.FC<Tier5PanelProps> = ({ results }) => {
  if (!results) return null;

  return (
    <div className="bg-tier5-bg border border-tier5-border rounded-lg overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-tier5-border flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-600" />
          {results.label}
        </h3>
        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Informational
        </span>
      </div>
      <div className="p-4 bg-white/50">
        <p className="text-sm text-slate-600 mb-4 font-medium italic">
          {results.summary}. These checks evaluate support for emerging Digital Asset standards and do not affect the readiness score.
        </p>
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div className="grid grid-cols-[80px_1fr_100px_1fr] gap-4 px-4 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div>Check ID</div>
            <div>Field / Context</div>
            <div>Status</div>
            <div>Evidence</div>
          </div>
          <div className="divide-y divide-slate-100">
            {results.checks.map((check) => (
              <div key={check.check_id} className="grid grid-cols-[80px_1fr_100px_1fr] gap-4 px-4 py-3 text-sm items-start hover:bg-slate-50/50 transition-colors">
                <span className="font-mono text-slate-500 text-xs">
                  {check.check_id}
                </span>
                <span className="font-medium text-slate-800">
                  {check.title || check.check_id}
                </span>
                <span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                    ${check.status === 'full_credit'
                      ? 'bg-green-100 text-green-800'
                      : check.status === 'partial_credit'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'}`}>
                    {check.status === 'full_credit' ? 'Present'
                      : check.status === 'partial_credit' ? 'Partial'
                      : 'Missing'}
                  </span>
                </span>
                <span className="text-slate-500 text-xs italic leading-relaxed">
                  {check.evidence || 'No mention found in documentation.'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tier5Panel;
