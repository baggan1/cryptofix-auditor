'use client';

import React, { useMemo } from 'react';
import { marked } from 'marked';
import { ScoredReport, GapSummaryItem, CheckResult } from '@/lib/types';
import Tier5Panel from './Tier5Panel';
import Tier6DropCopyPanel from './Tier6DropCopyPanel';
import Tier7MarketDataPanel from './Tier7MarketDataPanel';
import SeparateTierPanel from './SeparateTierPanel';
import { Shield, FileText, CheckCircle, AlertCircle, AlertTriangle, Printer, Download, Map, Activity, BarChart3, ShieldAlert } from 'lucide-react';

interface PrintReportProps {
  content: string;
  report: ScoredReport;
  exchangeName: string;
  gapImpacts: Record<string, string>;
}

const PrintReport: React.FC<PrintReportProps> = ({ content, report, exchangeName, gapImpacts }) => {
  const htmlContent = useMemo(() => {
    let md = content;

    // 1. Critical Gaps List to Table
    md = md.replace(/Critical gaps \(top 3 by points_lost\):\n((?:- .*?\n?)+)/g, (match: string, list: string) => {
      const rows = list.trim().split('\n').map((line: string) => {
        const parts = line.replace(/^\s*-\s*/, '').split('|').map((p: string) => p.trim());
        return `<tr><td>${parts[0]}</td><td>${parts[1]}</td><td>${parts[2]}</td></tr>`;
      }).join('');
      return `### Critical Gaps\n\n<table class="critical-gaps-table"><thead><tr><th>Check ID</th><th>Field</th><th>Impact</th></tr></thead><tbody>${rows}</tbody></table>\n\n`;
    });

    // 2. Metadata Block
    md = md.replace(/Audit date: (.*)\nAuditor: (.*)\nSpec source: (.*)\nAsset classes: (.*)/, (match: string, date: string, auditor: string, source: string, assets: string) => {
      return `<div class="metadata-block">
        <div class="meta-row"><span class="meta-label">Audit date</span><span class="meta-value">${date}</span></div>
        <div class="meta-row"><span class="meta-label">Auditor</span><span class="meta-value">${auditor}</span></div>
        <div class="meta-row"><span class="meta-label">Spec source</span><span class="meta-value">${source}</span></div>
        <div class="meta-row"><span class="meta-label">Asset classes</span><span class="meta-value">${assets}</span></div>
      </div>`;
    });

    // 3. Overall Score
    md = md.replace(/Overall score: (\d+) \/ 100 — (.*)/, (match: string, score: string, grade: string) => {
      return `<div class="overall-score-block">
        <div class="score-main">${score}</div>
        <div class="score-sub">
          <div class="score-denominator">out of 100</div>
          <div class="score-text">${grade}</div>
        </div>
      </div>`;
    });

    // 4. Section Headings & Breaks
    md = md.replace(/^## (SECTION (\d+) — (.*))/gm, (match: string, full: string, num: string) => {
      const className = `section-heading section-${num}`;
      return `<h2 class="${className}">${full}</h2>`;
    });

    // 5. Gap Analysis Cards (### T... — ... lost)
    md = md.replace(/(### [A-Z0-9]+_.*?\n)([\s\S]*?)(?=\n###|\n##|\n---|$(?![\s\S]))/g, (match: string, header: string, body: string) => {
      return `<div class="gap-card">\n\n${header}\n${body}\n\n</div>`;
    });

    // 6. Tier Table Wrapper
    md = md.replace(/(\nTier \| Score \| Available \| %.*?\n[\-\s|]+\n(?:.*?\n)+)/, (match: string) => {
      return `\n<div class="tier-scores-table-wrapper">\n\n${match}\n\n</div>\n`;
    });

    return marked.parse(md);
  }, [content]);

  // Split markdown for screen sections
  const mdSections = useMemo(() => {
    // Split by SECTION headings, using a positive lookahead to keep the heading with the content
    const sections = content.split(/(?=##?\s*SECTION\s+\d)/gi);
    return sections.map(s => s.trim());
  }, [content]);

  const getImpact = (gap: GapSummaryItem) => {
    if (gapImpacts[gap.check_id]) return gapImpacts[gap.check_id];
    if (gap.evidence) {
      return gap.evidence.length > 120 ? gap.evidence.substring(0, 117) + '...' : gap.evidence;
    }
    return 'Documented gap in institutional FIX standard implementation.';
  };

  const checksByTier = useMemo(() => {
    const tiers: Record<number, CheckResult[]> = {};
    report.full_detail.forEach(check => {
      const t = parseInt(check.check_id.substring(1, 2));
      if (!tiers[t]) tiers[t] = [];
      tiers[t].push(check);
    });
    return tiers;
  }, [report.full_detail]);

  // Helper to find a section by its number
  const getSectionByNum = (num: number) => {
    const prefix = `SECTION ${num}`;
    return mdSections.find(s => s.toUpperCase().includes(prefix)) || '';
  };

  // Helper to strip the heading from a section string
  const stripHeading = (sectionContent: string) => {
    return sectionContent.replace(/##?\s*SECTION\s+\d.*?(\n|$)/i, '').trim();
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Screen only banner */}
      <div className="no-print print:hidden bg-navy-dark text-white p-4 text-center sticky top-0 z-50">
        <p className="font-medium">
          RoE Document for <span className="font-bold">{exchangeName}</span>. 
          Use <kbd className="bg-white/10 px-1 rounded">Cmd+P</kbd> or <kbd className="bg-white/10 px-1 rounded">Ctrl+P</kbd> to Save as PDF.
        </p>
        <button 
          onClick={() => window.print()}
          className="mt-2 bg-white text-navy-dark px-4 py-1.5 rounded-md text-sm font-bold hover:bg-slate-100 transition-colors"
        >
          Print / Save as PDF
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 print:max-w-none print:p-0">
        {/* SCREEN VIEW */}
        <div className="no-print space-y-2">
          {/* PROBLEM 2: Metadata Block */}
          <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-2 text-sm mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Audit date</span>
            <span className="text-slate-800">{report.audit_date}</span>
            <span className="text-slate-500 font-medium">Auditor</span>
            <span className="text-slate-800">Opound LLC — Navilla Bagga</span>
            <span className="text-slate-500 font-medium">Spec source</span>
            <a href={report.spec_source} className="text-blue-600 hover:underline truncate" target="_blank" rel="noopener noreferrer">
              {report.spec_source}
            </a>
            <span className="text-slate-500 font-medium">Asset classes</span>
            <span className="text-slate-800">
              {report.asset_classes_audited?.join(', ') ?? 'spot'}
            </span>
          </div>

          {/* PROBLEM 3: Overall Score Hero */}
          <div className="flex items-center gap-8 p-6 mb-8 rounded-xl border border-slate-200 bg-white">
            <div className="flex-shrink-0 w-24 h-24 rounded-full flex flex-col items-center justify-center border-4"
              style={{
                borderColor: report.total_score >= 70 ? '#10B981' : report.total_score >= 50 ? '#F59E0B' : '#EF4444'
              }}>
              <span className="text-3xl font-bold text-slate-800">{report.total_score}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
            <div className="flex-1">
              <div className="text-xl font-semibold mb-3"
                style={{
                  color: report.total_score >= 70 ? '#059669' : report.total_score >= 50 ? '#D97706' : '#DC2626'
                }}>
                {report.grade}
              </div>
              <div className="space-y-2">
                {Object.entries(report.tier_scores)
                  .filter(([key]) => ['tier1', 'tier2', 'tier3', 'tier4'].includes(key))
                  .map(([key, tier]) => (
                    <div key={key} className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500 w-40 truncate">{tier.label}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-[#10B981] transition-all"
                          style={{width: `${tier.pct}%`}} />
                      </div>
                      <span className="text-slate-600 w-12 text-right font-mono text-xs">
                        {tier.earned}/{tier.available}
                      </span>
                    </div>
                ))}
              </div>

              {/* Informational / Separate Scores */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4">
                {report.tier5_results && (
                  <div className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-md border border-purple-100">
                    <span className="font-bold mr-1">Tier 5 (DAWG):</span> 
                    {report.tier5_results.checks.filter(c => c.status !== 'no_credit').length} present
                  </div>
                )}
                {report.tier7_results && (
                  <div className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100 flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    <span className="font-bold">Tier 7 (MD):</span> 
                    {report.tier7_results.score}/10
                  </div>
                )}
                {report.tier8_results && (
                  <div className="text-[10px] bg-slate-50 text-slate-700 px-2 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    <span className="font-bold">Tier 8 (Admin):</span> 
                    {report.tier8_results.score}/10
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PROBLEM 4 & 6 & 5 & 1: Structured Sections */}
          <div className="space-y-12">
            {/* SECTION 1: EXEC SUMMARY (Header + Intro from mdSections[0]) */}
            <section>
              <h2 className="text-xl font-semibold text-[#0A1628] mt-12 mb-4 pb-3 border-b-2 border-[#0A1628]">SECTION 1 — Executive Summary</h2>
              <div className="prose prose-slate max-w-none text-slate-700">
                <div dangerouslySetInnerHTML={{ __html: marked.parse(mdSections[0].split('\n\n').slice(5).join('\n\n')) }} />
              </div>
              
              {/* PROBLEM 1: Critical Gaps Table */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Critical Gaps</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse rounded-lg overflow-hidden border border-slate-200">
                    <thead className="bg-[#0A1628] text-white">
                      <tr>
                        <th className="text-left p-3 font-medium w-32">Check ID</th>
                        <th className="text-left p-3 font-medium w-48">Field</th>
                        <th className="text-center p-3 font-medium w-24">Pts Lost</th>
                        <th className="text-left p-3 font-medium">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {report.gap_summary.slice(0, 3).map((item, index) => (
                        <tr key={item.check_id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-3 font-mono text-xs text-slate-500">{item.check_id}</td>
                          <td className="p-3 font-medium text-slate-800">
                            {item.field_name || (item as any).field || '—'}
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Tag {item.fix_tag || (item as any).tag || '—'}
                            </div>
                          </td>
                          <td className="p-3 text-center text-red-600 font-bold">-{item.points_lost} pts</td>
                          <td className="p-3 text-slate-600 text-xs leading-relaxed">{getImpact(item)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* SECTION 2: SESSION CONFIG */}
            <section>
              <h2 className="text-xl font-semibold text-[#0A1628] mt-12 mb-4 pb-3 border-b-2 border-[#0A1628]">SECTION 2 — Session configuration</h2>
              <div className="report-content">
                <div dangerouslySetInnerHTML={{ __html: marked.parse(stripHeading(getSectionByNum(2))) }} />
              </div>
            </section>

            {/* PROBLEM 6: SECTION 3 — TIER SCORECARD */}
            <section>
              <h2 className="text-xl font-semibold text-[#0A1628] mt-12 mb-4 pb-3 border-b-2 border-[#0A1628]">SECTION 3 — Tier scorecard</h2>
              <div className="space-y-8 mt-6">
                {[1, 2, 3, 4].map(tierNum => (
                  <div key={tierNum}>
                    <h3 className="text-md font-bold text-slate-800 mb-3 ml-1">Tier {tierNum} Checks</h3>
                    <div className="overflow-x-auto mb-8">
                      <table className="w-full text-sm border-collapse border border-slate-200">
                        <thead>
                          <tr className="bg-[#0A1628] text-white">
                            <th className="text-left p-3 font-medium w-20">Check ID</th>
                            <th className="text-left p-3 font-medium w-20">FIX Tag</th>
                            <th className="text-left p-3 font-medium">Field</th>
                            <th className="text-center p-3 font-medium w-20">Status</th>
                            <th className="text-center p-3 font-medium w-16">Earned</th>
                            <th className="text-center p-3 font-medium w-16">Avail</th>
                            <th className="text-left p-3 font-medium">Evidence</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {checksByTier[tierNum]?.map((check, index) => (
                            <tr key={check.check_id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              <td className="p-3 font-mono text-xs text-slate-500">{check.check_id}</td>
                              <td className="p-3 font-mono text-xs">{check.fix_tag || (check.level === 'message' ? 'MSG' : '—')}</td>
                              <td className="p-3 font-medium text-slate-800">{check.field_name || check.message_name || '—'}</td>
                              <td className="p-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                  check.status === 'full_credit' ? 'bg-green-100 text-green-800' : 
                                  check.status === 'partial_credit' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {check.status === 'full_credit' ? 'Present' : check.status === 'partial_credit' ? 'Partial' : 'Missing'}
                                </span>
                              </td>
                              <td className="p-3 text-center font-mono text-sm">
                                {check.status === 'full_credit' ? check.points_available : check.status === 'partial_credit' ? check.points_available * 0.5 : 0}
                              </td>
                              <td className="p-3 text-center font-mono text-sm text-slate-400">{check.points_available}</td>
                              <td className="p-3 text-sm text-slate-600 leading-relaxed">{check.evidence ?? '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PROBLEM 5: SECTION 4 — GAP ANALYSIS */}
            <section>
              <h2 className="text-xl font-semibold text-[#0A1628] mt-12 mb-4 pb-3 border-b-2 border-[#0A1628]">SECTION 4 — Gap analysis & remediation</h2>
              <div className="grid grid-cols-1 gap-4 mt-6">
                {report.gap_summary?.map((gap) => (
                  <div key={gap.check_id} className="border border-slate-200 rounded-lg p-4 mb-2 border-l-4 border-l-red-400 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-mono text-sm text-slate-500 mr-2">{gap.check_id}</span>
                        <span className="font-semibold text-slate-800">{gap.field_name || (gap as any).field || '—'}</span>
                        <span className="ml-2 text-sm font-mono text-slate-500">Tag {gap.fix_tag || (gap as any).tag || '—'}</span>
                      </div>
                      <span className="text-sm font-medium text-red-600 flex-shrink-0 ml-4">-{gap.points_lost} pts</span>
                    </div>
                    {gap.evidence && (
                      <p className="text-sm text-slate-600 mb-2">
                        <span className="font-medium">Evidence: </span>{gap.evidence}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        gap.status === 'no_credit' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {gap.status === 'no_credit' ? 'Missing' : 'Partial'}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">Tier {gap.tier}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                       <p className="text-xs text-slate-500 leading-relaxed">
                          <span className="font-bold uppercase tracking-tighter mr-2">Institutional Impact:</span>
                          {getImpact(gap)}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PROBLEM A, B, C: SECTIONS 5-7 */}
            {[5, 6, 7].map(num => (
               <section key={num}>
                  <h2 className="text-xl font-semibold text-[#0A1628] mt-12 mb-4 pb-3 border-b-2 border-[#0A1628]">
                    {num === 5 ? 'SECTION 5 — Custom tag dictionary' : num === 6 ? 'SECTION 6 — Order types matrix' : 'SECTION 7 — UAT checklist'}
                  </h2>
                  <div className="report-content">
                    <div dangerouslySetInnerHTML={{ __html: marked.parse(stripHeading(getSectionByNum(num))) }} />
                  </div>
               </section>
            ))}

            {report.tier5_results && (
              <section>
                <div className="flex items-center gap-3 mt-12 mb-4 pb-3 border-b-2 border-[#0A1628]">
                  <h2 className="text-xl font-semibold text-[#0A1628]">SECTION 8 — DAWG Digital Asset FIX Extensions</h2>
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Forward-Looking assessment</span>
                </div>
                <div className="report-content mb-6">
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(stripHeading(getSectionByNum(8))) }} />
                </div>
                <Tier5Panel results={report.tier5_results} />
                
                {/* Tiers 6-8: separate scored panels */}
                <div className="mt-8 space-y-4">
                  {[6, 7, 8].map(tierNum => {
                    const tier = report.separate_tier_scores?.[`tier${tierNum}`];
                    if (!tier) return null;
                    return (
                      <SeparateTierPanel
                        key={tierNum}
                        label={tier.label}
                        score={tier.earned}
                        maxScore={tier.available}
                        grade={tier.grade}
                        pct={tier.pct}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* SECTION 9 (Drop Copy) */}
            {report.tier6_results && (
              <section>
                <div className="flex items-center gap-3 mt-12 mb-4 pb-3 border-b-2 border-[#0A1628]">
                  <h2 className="text-xl font-semibold text-[#0A1628]">SECTION 9 — Drop Copy Infrastructure</h2>
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Connectivity Audit</span>
                </div>
                <div className="report-content mb-6">
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(stripHeading(getSectionByNum(9))) }} />
                </div>
                <Tier6DropCopyPanel results={report.tier6_results} />
              </section>
            )}
            {/* SECTION 10 (Market Data) */}
            {report.tier7_results && (
              <section>
                <div className="flex items-center gap-3 mt-12 mb-4 pb-3 border-b-2 border-[#0A1628]">
                  <h2 className="text-xl font-semibold text-[#0A1628]">SECTION 10 — Market Data Analysis</h2>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Book Building & Discovery</span>
                </div>
                <div className="report-content mb-6">
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(stripHeading(getSectionByNum(10))) }} />
                </div>
                <Tier7MarketDataPanel results={report.tier7_results} />
              </section>
            )}

            {/* SECTION 11 (Admin & Session) */}
            {report.tier8_results && (
              <section>
                <div className="flex items-center gap-3 mt-12 mb-4 pb-3 border-b-2 border-[#0A1628]">
                  <h2 className="text-xl font-semibold text-[#0A1628]">SECTION 11 — Admin & Session Analysis</h2>
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Connectivity Baseline</span>
                </div>
                <div className="report-content mb-6">
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(stripHeading(getSectionByNum(11))) }} />
                </div>
                {/* Detailed panel for Tier 8 can be added here if needed, 
                    but using SeparateTierPanel for the overview per request */}
              </section>
            )}
          </div>
        </div>

        {/* PRINT VIEW */}
        <div className="hidden print:block">
          <div 
            className="prose prose-slate max-w-none 
              prose-headings:font-serif prose-headings:font-bold prose-headings:text-slate-900
              prose-p:font-serif prose-p:leading-relaxed prose-p:text-slate-800
              prose-strong:font-bold prose-strong:text-slate-900
              prose-code:font-mono prose-code:text-navy-dark prose-code:bg-slate-50 prose-code:px-1 prose-code:rounded
              print:prose-p:text-sm print:prose-headings:text-lg
              [&>h1]:text-3xl [&>h1]:border-b [&>h1]:border-slate-200 [&>h1]:pb-4 [&>h1]:mb-8
              [&>.section-heading]:text-xl [&>.section-heading]:border-b [&>.section-heading]:border-slate-100 [&>.section-heading]:pb-2 [&>.section-heading]:mt-12 [&>.section-heading]:mb-6
            "
            dangerouslySetInnerHTML={{ __html: htmlContent as string }}
          />
          
          <div className="mt-16 pt-8 border-t border-slate-200 text-xs text-slate-400 font-serif italic text-center print:mt-8">
            Generated by CryptoFIX Institutional Readiness Auditor — Opound LLC
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Screen versions */
        .report-content table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          border: 1px solid #E2E8F0;
        }
        .report-content th {
          background-color: #0A1628;
          color: white;
          padding: 10px 12px;
          text-align: left;
          font-weight: 500;
        }
        .report-content td {
          padding: 10px 12px;
          border-bottom: 1px solid #E2E8F0;
          vertical-align: top;
          color: #374151;
        }
        .report-content tr:nth-child(even) td {
          background-color: #F8FAFC;
        }
        .report-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #0A1628;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .report-content ul {
          list-style: disc;
          padding-left: 1.25rem;
          margin-bottom: 1rem;
        }
        .report-content li {
          font-size: 0.875rem;
          color: #374151;
          margin-bottom: 0.25rem;
          line-height: 1.6;
        }
        .report-content code {
          font-family: monospace;
          font-size: 0.8125rem;
          background: #F1F5F9;
          padding: 1px 5px;
          border-radius: 3px;
          color: #1E293B;
        }
        .report-content p {
          font-size: 0.9375rem;
          color: #374151;
          line-height: 1.7;
          margin-bottom: 0.75rem;
        }
        
        .metadata-block { margin: 16px 0; font-size: 14px; line-height: 1.6; }
        .meta-row { display: block; }
        .meta-label { font-weight: 600; color: #64748B; margin-right: 8px; }
        .meta-label::after { content: ":"; }
        .overall-score-block { margin: 20px 0; padding: 12px; border-left: 4px solid #F59E0B; background: #FFFBEB; }
        .score-main { font-size: 24px; font-weight: bold; color: #0A1628; }
        .score-sub { display: inline-flex; gap: 8px; align-items: baseline; }

        @media print {
          .no-print { display: none !important; }
          nav, footer { display: none !important; }
          .report-content th { background-color: #0A1628 !important; -webkit-print-color-adjust: exact; }

          @page { margin: 0.75in; size: A4; }

          body {
            background: white !important;
            color: #000000 !important;
            font-size: 11pt !important;
          }

          /* Force all text to black */
          .prose, .prose p, .prose span, .prose div, .prose h1, .prose h2, .prose h3, .prose table, .prose td, .prose th {
            color: #000000 !important;
          }

          .prose {
            max-width: none !important;
          }

          /* 1. METADATA BLOCK */
          .metadata-block {
            display: grid !important;
            grid-template-columns: 140px 1fr;
            gap: 4px 16px;
            margin: 16px 0 24px !important;
            font-size: 14px !important;
          }
          .meta-row { display: contents !important; }
          .meta-label { color: #64748B !important; font-weight: normal !important; }
          .meta-label::after { content: "" !important; }
          .meta-value { color: #000000 !important; }

          /* 2. OVERALL SCORE */
          .overall-score-block {
            margin: 24px 0 !important;
            padding: 16px !important;
            border: 1px solid #E2E8F0 !important;
            border-radius: 8px !important;
            display: flex !important;
            align-items: center !important;
            gap: 24px !important;
            background: transparent !important;
            border-left: 1px solid #E2E8F0 !important;
          }
          .score-main {
            font-size: 48px !important;
            font-weight: 700 !important;
            color: #0A1628 !important;
          }
          .score-denominator { font-size: 14px !important; color: #64748B !important; }
          .score-text { font-size: 18px !important; font-weight: 600 !important; color: #F59E0B !important; }

          /* 3. TIER SCORES TABLE */
          .tier-scores-table-wrapper table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .tier-scores-table-wrapper th:nth-child(1) { width: 200px !important; }
          .tier-scores-table-wrapper th:nth-child(2) { width: 80px !important; }
          .tier-scores-table-wrapper th:nth-child(3) { width: 80px !important; }
          .tier-scores-table-wrapper th:nth-child(4) { width: 60px !important; }
          
          table tr:nth-child(odd) { background-color: #F8FAFC !important; }
          table tr:nth-child(even) { background-color: #ffffff !important; }
          table thead tr { border-bottom: 2px solid #0A1628 !important; background: transparent !important; }
          table th, table td { padding: 8px !important; text-align: left !important; }

          /* 4. SECTION HEADINGS */
          h2.section-heading {
            margin-top: 40px !important;
            padding-top: 16px !important;
            border-top: 2px solid #0A1628 !important;
            border-bottom: none !important;
            font-size: 14pt !important;
            font-weight: 600 !important;
            color: #000000 !important;
            break-before: auto !important;
          }
          
          /* Specific page breaks for Section 4 and 7 */
          .section-4, .section-7 {
            page-break-before: always !important;
          }

          /* 5. GAP ANALYSIS ITEMS */
          .gap-card {
            border: 1px solid #E2E8F0 !important;
            border-radius: 6px !important;
            padding: 12px 16px !important;
            margin-bottom: 12px !important;
            page-break-inside: avoid !important;
          }
          .gap-card h3 { margin-top: 0 !important; border: none !important; }

          /* 7. CRITICAL GAPS TABLE */
          .critical-gaps-table {
            width: 100% !important;
            border-collapse: separate !important;
            border-spacing: 0 4px !important;
          }
          .critical-gaps-table td {
            padding: 8px !important;
            border-top: 1px solid #E2E8F0 !important;
            border-bottom: 1px solid #E2E8F0 !important;
          }
          .critical-gaps-table tr td:first-child {
            border-left: 3px solid #EF4444 !important;
          }
          .critical-gaps-table td:last-child {
            border-right: 1px solid #E2E8F0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintReport;
