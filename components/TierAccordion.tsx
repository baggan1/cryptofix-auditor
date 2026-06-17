'use client';

import React, { useState } from 'react';
import { ScoredCheckResult, TierScore } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SingleTier {
  tier: number;
  label: string;
  score: number;
  available: number;
  details: ScoredCheckResult[];
  is_informational?: boolean;
}

interface TierAccordionProps {
  tierScores?: Record<string, TierScore>;
  details?: ScoredCheckResult[];
  tier?: SingleTier;
  headerStyle?: 'compliance' | 'market';
  note?: string;
}

const TierAccordion: React.FC<TierAccordionProps> = ({ 
  tierScores, 
  details, 
  tier,
  headerStyle,
  note
}) => {
  const [openTiers, setOpenTiers] = useState<Record<string, boolean>>(
    tierScores ? { tier1: true } : {}
  );

  const toggleTier = (id: string) => {
    setOpenTiers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'full_credit':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C8963E]/10 text-[#B08332]">Present</span>;
      case 'partial_credit':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Partial</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Missing</span>;
    }
  };

  const items = tierScores 
    ? Object.entries(tierScores).map(([id, score]) => ({
        id,
        tierNum: parseInt(id.replace('tier', '')),
        label: score.label,
        score: score.earned,
        available: score.available,
        pct: score.pct,
        is_informational: score.is_informational,
        details: details?.filter(d => d.tier === parseInt(id.replace('tier', ''))) ?? []
      }))
    : tier 
    ? [{
        id: `tier${tier.tier}`,
        tierNum: tier.tier,
        label: tier.label,
        score: tier.score,
        available: tier.available,
        pct: (tier.score / (tier.available || 1)) * 100,
        is_informational: tier.is_informational,
        details: tier.details
      }]
    : [];

  const getHeaderClass = () => {
    switch (headerStyle) {
      case 'compliance':
        return 'bg-slate-100 border-l-4 border-l-amber-400';
      case 'market':
        return 'bg-slate-100 border-l-4 border-l-blue-400';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = openTiers[item.id];
        
        return (
          <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleTier(item.id)}
              className={`w-full flex items-center justify-between p-4 text-left hover:bg-opacity-80 transition-colors ${getHeaderClass()}`}
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tier {item.tierNum}</span>
                <span className="text-lg font-bold text-slate-900">{item.label}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  {item.is_informational ? (
                    <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded uppercase tracking-wider">
                      Informational
                    </span>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-slate-500">{item.score.toFixed(1)}/{item.available} pts</span>
                      <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-navy-dark rounded-full transition-all duration-500"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </button>
            
            {isOpen && (
              <div className="border-t border-slate-100">
                {note && (
                  <p className="text-xs text-slate-500 italic px-4 pb-2 pt-2">{note}</p>
                )}
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
                        // Group checks by message_type
                        const grouped = item.details.reduce((acc, check) => {
                          const key = check.message_type || 'other';
                          if (!acc[key]) acc[key] = { message: null, tags: [] };
                          if (check.level === 'message') {
                            acc[key].message = check;
                          } else {
                            acc[key].tags.push(check);
                          }
                          return acc;
                        }, {} as Record<string, { message: ScoredCheckResult | null, tags: ScoredCheckResult[] }>);

                        return Object.entries(grouped).map(([msgType, group]) => {
                          return (
                            <React.Fragment key={msgType}>
                              {/* Message Header Row */}
                              <tr className="bg-slate-50/80">
                                <td className="px-4 py-3 font-bold text-navy-dark">
                                  {msgType}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="font-bold text-slate-900">{group.message?.message_name || group.tags[0]?.message_name || '—'}</div>
                                  <div className="text-[10px] text-slate-400 font-semibold tracking-tight uppercase">Message Documentation</div>
                                </td>
                                <td className="px-4 py-3">{group.message ? getStatusPill(group.message.status) : '-'}</td>
                                <td className="px-4 py-3 text-[11px] text-slate-500 italic">{group.message?.evidence?.substring(0, 80) || '-'}</td>
                              </tr>
                              {/* Tag Rows */}
                              {group.tags.map((tag) => (
                                <tr key={tag.check_id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-3 pl-8 font-mono text-slate-600 text-xs">
                                    {tag.fix_tag || '-'}
                                  </td>
                                  <td className="px-4 py-3 pl-8">
                                    <div className="font-medium text-slate-800">{tag.field_name || tag.message_name || '—'}</div>
                                    {tag.asset_class_limitation && (
                                      <div className="text-[9px] text-amber-600 font-bold uppercase mt-0.5">{tag.asset_class_limitation}</div>
                                    )}
                                  </td>
                                  <td className="px-4 py-3">{getStatusPill(tag.status)}</td>
                                  <td className="px-4 py-3 text-slate-500 text-[11px] leading-relaxed max-w-xs">{tag.evidence || '-'}</td>
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
