'use client';

import React, { useState } from 'react';
import { CheckResult, TierScore } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TierAccordionProps {
  tierScores: Record<string, TierScore>;
  details: CheckResult[];
}

const TierAccordion: React.FC<TierAccordionProps> = ({ tierScores, details }) => {
  const [openTiers, setOpenTiers] = useState<Record<string, boolean>>({
    tier1: true,
  });

  const toggleTier = (id: string) => {
    setOpenTiers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'full_credit':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Present</span>;
      case 'partial_credit':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Partial</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Missing</span>;
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(tierScores).map(([id, score]) => {
        const isOpen = openTiers[id];
        const tierNum = parseInt(id.replace('tier', ''));
        const tierDetails = details.filter(d => d.check_id.startsWith(`T${tierNum}_`));

        return (
          <div key={id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleTier(id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tier {tierNum}</span>
                <span className="text-lg font-bold text-slate-900">{score.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-500">{score.earned}/{score.available} pts</span>
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-navy-dark rounded-full transition-all duration-500"
                      style={{ width: `${score.pct}%` }}
                    />
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </button>
            
            {isOpen && (
              <div className="border-t border-slate-100">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest font-bold">
                    <tr>
                      <th className="px-4 py-3">Tag</th>
                      <th className="px-4 py-3">Field</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tierDetails.map((check) => (
                      <tr key={check.check_id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 font-mono text-slate-900">{check.fix_tag}</td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900">{check.field_name}</div>
                          {check.asset_class_limitation && (
                            <div className="text-[10px] text-amber-600 font-bold uppercase mt-0.5">{check.asset_class_limitation}</div>
                          )}
                        </td>
                        <td className="px-4 py-4">{getStatusPill(check.status)}</td>
                        <td className="px-4 py-4 text-slate-500 text-xs leading-relaxed max-w-xs">{check.evidence || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TierAccordion;
