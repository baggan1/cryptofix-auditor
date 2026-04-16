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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.checks.map((check) => (
            <div key={check.check_id} className="flex items-start gap-3 p-3 bg-white border border-tier5-border rounded-md">
              <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                check.status === 'full_credit' ? 'bg-green-500' : 
                check.status === 'partial_credit' ? 'bg-amber-500' : 'bg-red-300'
              }`} />
              <div>
                <div className="font-bold text-slate-900 text-sm">{check.check_id}</div>
                <div className="text-xs text-slate-500 leading-relaxed mt-1">
                  {check.evidence || 'No mention found in documentation.'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tier5Panel;
