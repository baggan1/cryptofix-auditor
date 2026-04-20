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
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/10 text-[#10B981]">Present</span>;
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
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-[#f8fafc] text-slate-500 uppercase text-[10px] tracking-widest font-bold border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3">Tag / Level</th>
                        <th className="px-4 py-3">Field / Context</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Evidence / Gaps</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(() => {
                        // Grouping by message_type
                        const msgGroups: Record<string, CheckResult[]> = {};
                        tierDetails.forEach(d => {
                          if (!msgGroups[d.message_type]) msgGroups[d.message_type] = [];
                          msgGroups[d.message_type].push(d);
                        });

                        return Object.entries(msgGroups).map(([msgType, checks]) => {
                          const msgCheck = checks.find(c => c.level === 'message');
                          const tagChecks = checks.filter(c => c.level === 'tag');

                          return (
                            <React.Fragment key={msgType}>
                              {/* Message Header Row */}
                              <tr className="bg-slate-50/80">
                                <td className="px-4 py-3 font-bold text-navy-dark">
                                  {msgType}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-bold text-slate-900">{msgCheck?.message_name || checks[0].message_name}</div>
                                  <div className="text-[10px] text-slate-400 font-semibold tracking-tight uppercase">Message Documentation</div>
                                </td>
                                <td className="px-4 py-3">{msgCheck ? getStatusPill(msgCheck.status) : '-'}</td>
                                <td className="px-4 py-3 text-[11px] text-slate-500 italic">{msgCheck?.evidence?.substring(0, 80) || '-'}</td>
                              </tr>
                              {/* Tag Rows */}
                              {tagChecks.map((check) => (
                                <tr key={check.check_id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-3 pl-8 font-mono text-slate-600 text-xs">
                                    {check.tag_number || '-'}
                                  </td>
                                  <td className="px-4 py-3 pl-8">
                                    <div className="font-medium text-slate-800">{check.tag_name}</div>
                                    {check.asset_class_limitation && (
                                      <div className="text-[9px] text-amber-600 font-bold uppercase mt-0.5">{check.asset_class_limitation}</div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">{getStatusPill(check.status)}</td>
                                  <td className="px-4 py-3 text-slate-500 text-[11px] leading-relaxed max-w-xs">{check.evidence || '-'}</td>
                                </tr>
                              ))}
                            </React.Fragment>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TierAccordion;
