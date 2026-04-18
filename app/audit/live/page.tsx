'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScoredReport } from '@/lib/types';
import ScoreGauge from '@/components/ScoreGauge';
import TierAccordion from '@/components/TierAccordion';
import GapTable from '@/components/GapTable';
import Tier5Panel from '@/components/Tier5Panel';
import { FileText, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LiveAuditPreview() {
  const router = useRouter();
  const [report, setReport] = useState<ScoredReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem('live_audit_report');
    if (data) {
      setReport(JSON.parse(data));
    } else {
      // If we landed here without state, push back home
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-navy-dark rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!report) return null; // handled by redirect

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded uppercase tracking-wider">Live Audit</span>
              <span className="text-sm text-slate-400 font-medium">Draft v1.1 Analysis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
              {report.exchange_name} <span className="text-slate-400">Readiness Score</span>
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                <span className="text-slate-400">Audited:</span> {report.audit_date} (Session Ephemeral)
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              disabled
              className="px-6 h-12 bg-white border border-slate-200 text-slate-400 rounded-xl font-bold flex items-center gap-2 shadow-sm cursor-not-allowed opacity-60"
              title="RoE download only available on static certified audits"
            >
              <FileText className="w-4 h-4" />
              Download RoE document
            </button>
            <button className="px-6 h-12 bg-navy-dark text-white rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-navy-dark/10">
              <Mail className="w-4 h-4" />
              Email Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-12">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Overall Score</h3>
            <ScoreGauge score={report.total_score} grade={report.grade} />
            <div className="mt-8 space-y-6">
              {Object.entries(report.tier_scores).map(([key, tier], index) => (
                <div key={key}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tier {index + 1}: {tier.label}</span>
                    <span className="text-sm font-bold text-slate-900">{tier.earned}/{tier.available}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-navy-dark rounded-full transition-all" style={{ width: `${tier.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <GapTable gaps={report.gap_summary} />
        </div>
        <div className="lg:col-span-7 space-y-12">
          <TierAccordion tierScores={report.tier_scores} details={report.full_detail} />
          {report.tier5_results && <Tier5Panel results={report.tier5_results} />}
        </div>
      </div>
    </div>
  );
}
