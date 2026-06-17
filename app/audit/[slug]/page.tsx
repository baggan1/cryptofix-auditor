import React from 'react';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { ScoredReport } from '@/lib/types';
import ScoreGauge from '@/components/ScoreGauge';
import TierAccordion from '@/components/TierAccordion';
import GapTable from '@/components/GapTable';
import Tier5Panel from '@/components/Tier5Panel';
import { FileText, Mail, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { getScoredReport } from '@/lib/audits';
import DownloadAuditButton from '@/components/DownloadAuditButton';

export async function generateStaticParams() {
  return [
    { slug: 'kraken' },
    { slug: 'coinbase-exchange' },
    { slug: 'coinbase-derivatives' },
  ];
}

export default async function AuditPage({ params }: { params: { slug: string } }) {
  const report = await getScoredReport(params.slug);
  if (!report) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header Info */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-navy-dark text-white text-[10px] font-bold rounded uppercase tracking-wider">Certified Audit</span>
              <span className="text-sm text-slate-400 font-medium">Draft v1.1 Analysis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
              {report.exchange_name} <span className="text-slate-400">Readiness Score</span>
            </h1>
            {params.slug === 'coinbase-derivatives' && (
              <div className="bg-amber-50 border-amber-200 text-amber-800 text-sm p-3 rounded-lg mt-4 mb-4">
                Coinbase Derivatives Exchange is a CFTC-regulated Designated Contract Market. FIX connectivity requires approved firm onboarding. Audit based on public documentation only.
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                <span className="text-slate-400">Audited:</span> {report.audit_date}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DownloadAuditButton 
              exchangeName={report.exchange_name} 
              auditSlug={params.slug} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 space-y-12">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Overall Score</h3>
            <ScoreGauge score={report.total_score} grade={report.grade} />
            <div className="mt-8 space-y-6">
              {/* Main Tiers: 1, 2, 3, 8 */}
              {Object.entries(report.tier_scores).map(([key, tier]) => (
                <div key={key}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{tier.label}</span>
                    <span className="text-sm font-bold text-slate-900">{tier.earned.toFixed(1)}/{tier.available}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-navy-dark rounded-full transition-all duration-1000" style={{ width: `${tier.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Sub-scores */}
            <div className="mt-12 pt-8 border-t border-slate-100 space-y-6">
              {/* Compliance & Drop Copy Panel */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Compliance & Drop Copy
                    </span>
                    <div className="text-sm font-bold text-slate-700 mt-0.5">
                      {report.compliance_sub_score?.label}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-800">
                      {report.compliance_sub_score?.total.toFixed(1)}
                      <span className="text-xs font-bold text-slate-400 ml-1">
                        /{report.compliance_sub_score?.max}
                      </span>
                    </span>
                    <div className="text-[11px] font-bold mt-0.5"
                      style={{
                        color: (report.compliance_sub_score?.total ?? 0) >= 12
                          ? '#C8963E' : (report.compliance_sub_score?.total ?? 0) >= 7
                          ? '#F59E0B' : '#EF4444'
                      }}>
                      {report.compliance_sub_score?.grade}
                    </div>
                  </div>
                </div>
                {/* Sub-tier rows */}
                {Object.entries(report.compliance_sub_score?.tiers ?? {}).map(([key, t]) => (
                  <div key={key} className="flex items-center justify-between px-5 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{t.label}</span>
                    <span className="text-sm font-mono font-bold text-slate-700">
                      {t.earned.toFixed(1)}/{t.available}
                      <span className="text-slate-400 ml-1 text-xs">({t.pct}%)</span>
                    </span>
                  </div>
                ))}
                <div className="px-5 py-3 bg-slate-50/50">
                  <p className="text-[10px] text-slate-500 italic">
                    {report.compliance_sub_score?.audience}
                  </p>
                </div>
              </div>

              {/* Market Data Panel */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Market Data
                    </span>
                    <div className="text-sm font-bold text-slate-700 mt-0.5">
                      {report.market_data_sub_score?.label}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-800">
                      {report.market_data_sub_score?.total.toFixed(1)}
                      <span className="text-xs font-bold text-slate-400 ml-1">
                        /{report.market_data_sub_score?.max}
                      </span>
                    </span>
                    <div className="text-[11px] font-bold mt-0.5"
                      style={{
                        color: (report.market_data_sub_score?.total ?? 0) >= 4
                          ? '#C8963E' : (report.market_data_sub_score?.total ?? 0) >= 2
                          ? '#F59E0B' : '#EF4444'
                      }}>
                      {report.market_data_sub_score?.grade}
                    </div>
                  </div>
                </div>
                <div className="px-5 py-3 bg-slate-50/50">
                  <p className="text-[10px] text-slate-500 italic">
                    {report.market_data_sub_score?.audience}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <GapTable gaps={report.gap_summary.filter(gap => [1, 2, 3, 8].includes(gap.tier))} />
        </div>
        <div className="lg:col-span-7 space-y-12">
          <TierAccordion tierScores={report.tier_scores} details={report.full_detail} />
          
          {/* Compliance & Drop Copy detail */}
          <div className="mt-4">
            <TierAccordion
              tier={{
                tier: 4,
                label: "AML & Travel Rule",
                score: report.compliance_sub_score?.tiers?.tier4?.earned ?? 0,
                available: report.compliance_sub_score?.tiers?.tier4?.available ?? 10,
                details: report.full_detail?.filter(c => c.tier === 4) ?? []
              }}
              headerStyle="compliance"
              note="Part of Compliance sub-score. Tags evaluated in 35=8, 35=AE, or 35=AR context."
            />
            <div className="h-4" />
            <TierAccordion
              tier={{
                tier: 6,
                label: "Drop Copy — Consolidated Execution Feed",
                score: report.compliance_sub_score?.tiers?.tier6?.earned ?? 0,
                available: report.compliance_sub_score?.tiers?.tier6?.available ?? 5,
                details: report.full_detail?.filter(c => c.tier === 6) ?? []
              }}
              headerStyle="compliance"
              note="Part of Compliance sub-score. FIX-placed orders only."
            />
          </div>

          {/* Market Data detail */}
          <div className="mt-4">
            <TierAccordion
              tier={{
                tier: 7,
                label: "Market Data & RFQ",
                score: report.market_data_sub_score?.total ?? 0,
                available: report.market_data_sub_score?.max ?? 5,
                details: report.full_detail?.filter(c => c.tier === 7) ?? []
              }}
              headerStyle="market"
              note="Market Data sub-score. Includes price discovery, book building, and RFQ workflow messages."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
