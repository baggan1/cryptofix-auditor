import React from 'react';
import { GapSummaryItem } from '@/lib/types';
import { TriangleAlert } from 'lucide-react';

interface GapTableProps {
  gaps: GapSummaryItem[];
}

const GapTable: React.FC<GapTableProps> = ({ gaps }) => {
  if (gaps.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <TriangleAlert className="w-4 h-4 text-amber-500" />
          Top Priority Institutional Gaps
        </h3>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{gaps.length} Gaps</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest font-bold border-b border-slate-100">
            <tr>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Field</th>
              <th className="px-4 py-3 text-right">Impact</th>
              <th className="px-4 py-3">Recommendation / Gap Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
              {gaps.map((gap) => {
                const tagDisplay = gap.fix_tag || (gap as any).message_type || gap.check_id || '—';
                const fieldDisplay = gap.field_name || (gap as any).message_name || '—';
                
                return (
                  <tr key={gap.check_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="font-bold text-slate-900">T{gap.tier}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-slate-800">
                        {fieldDisplay}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 uppercase mt-0.5">
                        Tag {tagDisplay}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-red-600 font-bold">-{gap.points_lost} pts</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {gap.evidence || 'No documentation found in specification.'}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default GapTable;
