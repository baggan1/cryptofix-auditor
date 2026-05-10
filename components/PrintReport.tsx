'use client';

import React, { useMemo } from 'react';
import { marked } from 'marked';
import { ScoredReport, GapSummaryItem, CheckResult } from '@/lib/types';
import Tier5Panel from './Tier5Panel';
import SeparateTierPanel from './SeparateTierPanel';
import { Shield, FileText, CheckCircle, AlertCircle, AlertTriangle, Printer, Download, Map, Activity, BarChart3, ShieldAlert, Check, Database } from 'lucide-react';

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
    md = md.replace(/Overall score: (\d+(\.\d+)?) \/ 100 — (.*)/, (match: string, score: string, dec: string, grade: string) => {
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

    // 5. Gap Analysis Cards
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

  const getSectionByNum = (num: number) => {
    const prefix = `SECTION ${num}`;
    return mdSections.find(s => s.toUpperCase().includes(prefix)) || '';
  };

  const stripHeading = (sectionContent: string) => {
    return sectionContent.replace(/##?\s*SECTION\s+\d.*?(\n|$)/i, '').trim();
  };

  const parseGapBlocks = (contentStr: string) => {
    const blocks = contentStr.split(/(?=### )/).filter(b => b.trim().startsWith('###'));
    return blocks.map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const titleLine = lines[0].replace(/^###\s*/, '');
      const data: Record<string, string> = { Title: titleLine };
      let currentKey = '';
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes(':') && !line.startsWith('http')) {
          const splitIdx = line.indexOf(':');
          currentKey = line.substring(0, splitIdx).trim();
          data[currentKey] = line.substring(splitIdx + 1).trim();
        } else if (currentKey) {
          data[currentKey] += ' ' + line;
        }
      }
      return data;
    });
  };

  const gapCardsData = useMemo(() => parseGapBlocks(stripHeading(getSectionByNum(4))), [mdSections]);

  const recommendationText = useMemo(() => {
    const match = content.match(/Recommendation:\s*([\s\S]*?)(?=\n\n|\nCritical gaps)/);
    return match ? match[1].trim() : '';
  }, [content]);

  const sessionConfigData = useMemo(() => {
    const section2 = stripHeading(getSectionByNum(2));
    const data = {
      connection: [] as { k: string, v: string }[],
      auth: [] as { k: string, v: string }[],
      session: [] as { k: string, v: string }[]
    };
    
    const lines = section2.split('\n');
    let currentSection = 'connection';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('##')) return;
      
      if (trimmed.toLowerCase().startsWith('fix version') || trimmed.toLowerCase().startsWith('transport')) {
        const splitIdx = trimmed.indexOf(':');
        if (splitIdx > -1) {
          data.connection.push({ k: trimmed.substring(0, splitIdx).trim(), v: trimmed.substring(splitIdx + 1).trim() });
        }
        return;
      }
      
      if (trimmed.toLowerCase().includes('authentication:')) {
        currentSection = 'auth';
        data.auth.push({ k: 'Method', v: trimmed.substring(trimmed.indexOf(':') + 1).trim() });
        return;
      }
      if (trimmed.toLowerCase().includes('session management:')) {
        currentSection = 'session';
        return;
      }
      if (trimmed.toLowerCase().includes('connection parameters:')) {
        currentSection = 'connection';
        return;
      }
      
      const splitIdx = trimmed.indexOf(':');
      if (splitIdx > -1) {
        const k = trimmed.substring(0, splitIdx).trim();
        const v = trimmed.substring(splitIdx + 1).trim();
        data[currentSection as keyof typeof data].push({ k, v });
      }
    });
    
    return data;
  }, [mdSections]);

  const SectionHeader = ({ num, title }: { num: number, title: string }) => (
    <div className="border-l-[3px] border-[#10B981] pl-4 mb-8 pb-3 border-b border-slate-200">
      <div className="font-mono text-xs font-bold text-[#10B981] tracking-widest uppercase mb-1">Section {num}</div>
      <h2 className="text-2xl font-bold text-[#0A1628] font-sans">{title}</h2>
    </div>
  );

  return (
    <div className="bg-[#f7f9fc] min-h-screen font-sans">
      {/* 1. Header / Meta Block */}
      <div className="bg-[#1F3178] w-full border-t-4 border-[#10B981] shadow-md sticky top-0 z-50">
        <div className="max-w-[1000px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-12 h-12 shadow-sm">
                <rect width="100" height="100" rx="25" fill="#10B981"/>
                <text x="50" y="53" fontFamily="sans-serif" fontWeight="bold" fontSize="60" fill="white" textAnchor="middle" dominantBaseline="middle">O</text>
              </svg>
              <div className="text-white flex flex-col justify-center">
                <span className="font-bold text-lg leading-tight tracking-tight whitespace-nowrap">Opound LLC</span>
                <span className="text-[11px] font-bold tracking-widest text-[#10B981] uppercase mt-0.5 font-mono whitespace-nowrap">CryptoFIX Auditor</span>
              </div>
            </div>
            <div className="hidden md:block w-px h-10 bg-white/20"></div>
            <div className="text-white text-xl font-bold tracking-tight whitespace-nowrap">
              {exchangeName}
            </div>
          </div>
          
          <div className="flex-1 flex justify-center md:justify-end text-sm w-full md:w-auto overflow-hidden">
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-slate-300 justify-start md:justify-end">
              <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 font-mono">Input Type</span><span className="text-white font-medium whitespace-nowrap">{report.inputType || 'Pre-loaded Spec'}</span></div>
              <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 font-mono">Audit Date</span><span className="text-white font-medium whitespace-nowrap">{report.audit_date}</span></div>
              <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 font-mono">Auditor</span><span className="text-white font-medium whitespace-nowrap">Navilla Bagga</span></div>
              <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 font-mono">Spec Source</span><a href={report.spec_source} target="_blank" rel="noreferrer" className="text-[#10B981] hover:underline truncate max-w-[120px]">{report.spec_source}</a></div>
              <div className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 font-mono">Asset Classes</span><span className="text-white font-medium capitalize whitespace-nowrap">{report.asset_classes_audited?.join(', ') ?? 'Spot'}</span></div>
            </div>
          </div>

          <button onClick={() => window.print()} className="print-hide flex-shrink-0 flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm">
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-6 py-12 print:max-w-none print:p-0 bg-white shadow-sm my-8 rounded-xl print:shadow-none print:my-0">
        {/* REPORT CONTENT */}
        <div className="space-y-12">
          
          {/* 2. Score Card */}
          <div className="score-card flex flex-col md:flex-row gap-8 p-8 rounded-2xl bg-[#0A1628] shadow-xl text-white relative overflow-hidden">
            {/* Decorative background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#10B981] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex flex-col items-center justify-center min-w-[240px] z-10">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90 drop-shadow-md">
                  <circle cx="100" cy="100" r="80" stroke="#1e293b" strokeWidth="14" fill="none" />
                  <circle cx="100" cy="100" r="80" stroke="#10B981" strokeWidth="14" fill="none" 
                    strokeDasharray={2 * Math.PI * 80} 
                    strokeDashoffset={2 * Math.PI * 80 - (report.total_score / 100) * 2 * Math.PI * 80} 
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold font-sans tracking-tighter text-white">{report.total_score.toFixed(1)}</span>
                    <span className="text-lg text-slate-400 font-mono font-medium ml-1">/100</span>
                  </div>
                </div>
              </div>
              <div className="rating-badge mt-4 px-5 py-1.5 rounded-full font-bold text-sm tracking-widest uppercase shadow-sm"
                style={{
                  backgroundColor: report.total_score >= 80 ? 'rgba(16, 185, 129, 0.15)' : report.total_score >= 40 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: report.total_score >= 80 ? '#10B981' : report.total_score >= 40 ? '#F59E0B' : '#EF4444',
                  border: `1px solid ${report.total_score >= 80 ? 'rgba(16, 185, 129, 0.3)' : report.total_score >= 40 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}>
                {report.grade}
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center z-10">
              <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-5 font-mono">Tier Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(report.tier_scores).filter(([k]) => k !== 'tier5').map(([key, tier]) => {
                  const pct = tier.available > 0 ? (tier.earned / tier.available) * 100 : 0;
                  const barColor = pct >= 80 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';
                  return (
                    <div key={key} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-end text-sm">
                        <span className="font-medium text-slate-200">{tier.label.split('—')[0].trim()}</span>
                        <span className="font-mono text-xs text-slate-400"><span className="text-white font-bold">{tier.earned.toFixed(1)}</span> / {tier.available}</span>
                      </div>
                      <div className="tier-bar-track bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="tier-bar-fill h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tag Chips */}
              <div className="mt-8 pt-5 border-t border-slate-700/50 flex flex-wrap gap-3">
                <div className="info-chip inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 shadow-sm">
                  <Shield className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Compliance & Drop Copy <span className="text-white font-bold ml-1">{report.compliance_sub_score.total}/{report.compliance_sub_score.max}</span></span>
                </div>
                <div className="info-chip inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 shadow-sm">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Market Data Readiness <span className="text-white font-bold ml-1">{report.market_data_sub_score.total}/{report.market_data_sub_score.max}</span></span>
                </div>
                {report.tier5_results && (
                  <div className="info-chip inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-full text-xs font-medium text-slate-300 shadow-sm">
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    <span>DAWG Extensions <span className="text-white font-bold ml-1">{report.tier5_results.checks.length} checks</span></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-[48px]">
            {/* SECTION 1: EXEC SUMMARY */}
            <section className="report-section">
              <SectionHeader num={1} title="Executive Summary" />
              
              {recommendationText && (
                <div className="bg-[#f0f4ff] border-l-[3px] border-[#1F3178] p-5 rounded-r-xl mb-8 shadow-sm">
                  <p className="text-[#1F3178] font-bold tracking-tight mb-2 uppercase text-xs font-mono">Recommendation</p>
                  <p className="text-slate-700 leading-relaxed font-sans">{recommendationText}</p>
                </div>
              )}
              
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 font-sans">Critical Gaps</h3>
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#0A1628] text-white font-sans text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-medium w-32">Check ID</th>
                        <th className="px-4 py-3 font-medium w-48">Field</th>
                        <th className="px-4 py-3 font-medium text-center w-24">Pts Lost</th>
                        <th className="px-4 py-3 font-medium">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {report.gap_summary.slice(0, 3).map((item, index) => (
                        <tr key={item.check_id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="px-4 py-4 font-mono text-xs text-slate-500 font-bold">{item.check_id}</td>
                          <td className="px-4 py-4 font-medium text-slate-800">
                            {item.field_name || (item as any).field || '—'}
                            <div className="text-[10px] text-slate-400 font-mono mt-1 font-bold">
                              Tag {item.fix_tag || (item as any).tag || '—'}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-red-600 font-bold font-mono">-{item.points_lost}</td>
                          <td className="px-4 py-4 text-slate-600 text-sm leading-relaxed">{getImpact(item)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* SECTION 2: SESSION CONFIG */}
            <section className="report-section">
              <SectionHeader num={2} title="Session configuration" />
              <div className="space-y-6">
                {Object.entries(sessionConfigData).map(([sectionKey, rows]) => {
                  if (rows.length === 0) return null;
                  const sectionTitle = sectionKey === 'connection' ? 'Connection' : sectionKey === 'auth' ? 'Authentication' : 'Session Management';
                  return (
                    <div key={sectionKey} className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                        <h4 className="text-[10px] font-bold text-[#10B981] uppercase tracking-widest font-mono">{sectionTitle}</h4>
                      </div>
                      <table className="w-full text-sm text-left m-0">
                        <tbody className="divide-y divide-slate-100">
                          {rows.map((row, idx) => (
                            <tr key={idx} className="bg-white">
                              <td className="px-4 py-3 font-medium text-slate-500 w-1/3 text-xs tracking-wide uppercase">{row.k}</td>
                              <td className="px-4 py-3 text-slate-800 font-medium font-sans">{row.v}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 3 — TIER SCORECARD */}
            <section className="report-section">
              <SectionHeader num={3} title="Tier scorecard" />
              <div className="space-y-10 mt-6">
                {[1, 2, 3, 8, 4, 6, 7].map(tierNum => {
                  if (!checksByTier[tierNum] || checksByTier[tierNum].length === 0) return null;
                  const earned = checksByTier[tierNum].reduce((a, b) => a + (b.status === 'full_credit' ? b.points_available : b.status === 'partial_credit' ? b.points_available * 0.5 : 0), 0);
                  const avail = checksByTier[tierNum].reduce((a, b) => a + b.points_available, 0);
                  return (
                    <div key={tierNum} className="mb-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-[#0A1628] font-sans">Tier {tierNum} Checks</h3>
                          {[4, 6].includes(tierNum) && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md uppercase tracking-wider">Compliance Sub-score</span>}
                          {tierNum === 7 && <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md uppercase tracking-wider">Market Data Sub-score</span>}
                        </div>
                        <div className="mt-3 sm:mt-0 text-sm font-mono font-bold bg-[#0A1628] text-white px-4 py-1.5 rounded-full shadow-sm">
                           {earned % 1 === 0 ? earned : earned.toFixed(1)} / {avail % 1 === 0 ? avail : avail.toFixed(1)} pts
                        </div>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-[#0A1628] text-white font-sans text-[11px] uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-3 font-medium whitespace-nowrap">Check ID</th>
                              <th className="px-4 py-3 font-medium whitespace-nowrap">Tag</th>
                              <th className="px-4 py-3 font-medium">Field</th>
                              <th className="px-4 py-3 font-medium text-center">Status</th>
                              <th className="px-4 py-3 font-medium text-right">Pts</th>
                              <th className="px-4 py-3 font-medium">Evidence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {checksByTier[tierNum]?.map((check, index) => {
                              const checkEarned = check.status === 'full_credit' ? check.points_available : check.status === 'partial_credit' ? check.points_available * 0.5 : 0;
                              return (
                                <tr key={check.check_id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 hover:bg-slate-50 transition-colors'}>
                                  <td className="px-4 py-4 font-mono text-[11px] text-slate-500 font-bold whitespace-nowrap">{check.check_id}</td>
                                  <td className="px-4 py-4 font-mono text-[11px] font-bold whitespace-nowrap">{check.fix_tag || (check.level === 'message' ? 'MSG' : '—')}</td>
                                  <td className="px-4 py-4 font-medium text-slate-800">{check.field_name || check.message_name || '—'}</td>
                                  <td className="px-4 py-4 text-center">
                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      check.status === 'full_credit' ? 'bg-emerald-100 text-emerald-700' : 
                                      check.status === 'partial_credit' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {check.status === 'full_credit' ? 'PASS' : check.status === 'partial_credit' ? 'PARTIAL' : 'FAIL'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-right font-mono text-xs whitespace-nowrap">
                                    <span className="font-bold text-slate-800">{checkEarned % 1 === 0 ? checkEarned : checkEarned.toFixed(1)}</span>
                                    <span className="text-slate-400"> / {check.points_available % 1 === 0 ? check.points_available : check.points_available.toFixed(1)}</span>
                                  </td>
                                  <td className="px-4 py-4 text-xs text-slate-600 leading-relaxed font-sans">{check.evidence ?? '—'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 4 — GAP ANALYSIS */}
            <section className="report-section">
              <SectionHeader num={4} title="Gap analysis & remediation" />
              <div className="space-y-6 mt-6">
                {gapCardsData.length > 0 ? gapCardsData.map((gap, idx) => (
                  <div key={idx} className="gap-card border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                    <div className={`w-2 flex-shrink-0 ${gap.Status?.toLowerCase().includes('partial') ? 'bg-amber-400' : 'bg-red-500'}`} />
                    <div className="p-6 flex-1">
                      <h3 className="font-bold text-lg text-[#0A1628] font-sans tracking-tight mb-5">{gap.Title}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Status</span>
                          <span className="font-medium text-slate-800">{gap.Status || 'Missing'}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Effort</span>
                          <div>
                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              gap.Effort?.trim() === 'H' ? 'bg-red-100 text-red-700' : gap.Effort?.trim() === 'M' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>{gap.Effort || 'L'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 md:col-span-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Institutional Impact</span>
                          <span className="text-slate-700 leading-relaxed">{gap['Institutional impact'] || gap['Impact'] || '—'}</span>
                        </div>
                        {(gap['TradFi Reference'] || gap['TradFi Ref']) && (
                          <div className="flex flex-col gap-1 md:col-span-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">TradFi Reference</span>
                            <span className="text-slate-700 leading-relaxed">{gap['TradFi Reference'] || gap['TradFi Ref']}</span>
                          </div>
                        )}
                        <div className="flex flex-col gap-1 md:col-span-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Recommended Remediation</span>
                          <span className="text-slate-700 leading-relaxed font-medium">{gap['Recommended remediation'] || gap['Remediation'] || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-500 italic">No gap analysis available in this report.</p>
                )}
              </div>
            </section>

            {/* SECTIONS 5-7 */}
            {[5, 6, 7].map(num => {
              const content = stripHeading(getSectionByNum(num));
              if (!content) return null;
              return (
                <section key={num} className="report-section">
                  <SectionHeader num={num} title={num === 5 ? 'Custom tag dictionary' : num === 6 ? 'Order types matrix' : 'UAT checklist'} />
                  <div className={`report-content prose prose-slate max-w-none font-sans ${num === 7 ? 'section-7-content' : ''}`}>
                    <div dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
                  </div>
                </section>
              );
            })}

            {report.tier5_results && (
              <section className="report-section">
                <div className="border-l-[3px] border-[#10B981] pl-4 mb-8 pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div>
                    <div className="font-mono text-xs font-bold text-[#10B981] tracking-widest uppercase mb-1">Section 8</div>
                    <h2 className="text-2xl font-bold text-[#0A1628] font-sans">DAWG Digital Asset FIX Extensions</h2>
                  </div>
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mt-2 sm:mt-0 sm:ml-4">Forward-Looking assessment</span>
                </div>
                <div className="report-content prose prose-slate max-w-none font-sans mb-8">
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(stripHeading(getSectionByNum(8))) }} />
                </div>
                <Tier5Panel results={report.tier5_results} />
                
                <div className="mt-8 space-y-4">
                  <SeparateTierPanel
                    label={report.compliance_sub_score.label}
                    score={report.compliance_sub_score.total}
                    maxScore={report.compliance_sub_score.max}
                    grade={report.compliance_sub_score.grade}
                    pct={(report.compliance_sub_score.total / report.compliance_sub_score.max) * 100}
                  />
                  <SeparateTierPanel
                    label={report.market_data_sub_score.label}
                    score={report.market_data_sub_score.total}
                    maxScore={report.market_data_sub_score.max}
                    grade={report.market_data_sub_score.grade}
                    pct={(report.market_data_sub_score.total / report.market_data_sub_score.max) * 100}
                  />
                </div>
              </section>
            )}

            {[9, 10, 11].map(sectionNum => {
              const content = stripHeading(getSectionByNum(sectionNum));
              if (!content) return null;
              return (
                <section key={sectionNum} className="report-section">
                  <SectionHeader num={sectionNum} title={sectionNum === 9 ? 'Drop Copy Analysis' : sectionNum === 10 ? 'Market Data Analysis' : 'Admin & Session Baseline'} />
                  <div className="report-content prose prose-slate max-w-none font-sans mb-6">
                    <div dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
                  </div>
                </section>
              );
            })}
          </div>
          
          {/* Print Footer */}
          <div className="report-footer hidden print:block mt-16 pt-8 border-t border-slate-200 text-[10px] text-slate-400 font-mono text-center">
            Prepared by Opound LLC — navilla.bagga@gmail.com | Generated by CryptoFIX Institutional Readiness Auditor | Version 2.0.0
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Hide global navbar and footer on report page */
        body > header, body > footer { display: none !important; }

        /* Screen versions */
        .report-content table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          margin-bottom: 2rem;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .report-content th {
          background-color: #0A1628;
          color: white;
          padding: 12px 16px;
          text-align: left;
          font-weight: 500;
          font-family: var(--font-ibm-sans), sans-serif;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .report-content td {
          padding: 12px 16px;
          border-bottom: 1px solid #E2E8F0;
          vertical-align: top;
          color: #334155;
        }
        .report-content tr:nth-child(even) td { background-color: #F8FAFC; }
        .report-content h3 { font-size: 1.125rem; font-weight: 700; color: #0A1628; margin-top: 2rem; margin-bottom: 1rem; font-family: var(--font-ibm-sans), sans-serif; }
        .report-content ul, .report-content ol { padding-left: 1.5rem; margin-bottom: 1.5rem; }
        .report-content li { font-size: 0.9375rem; color: #334155; margin-bottom: 0.5rem; line-height: 1.6; }
        .report-content code { font-family: var(--font-ibm-mono), monospace; font-size: 0.8125rem; background: #F1F5F9; padding: 2px 6px; border-radius: 4px; color: #0F172A; font-weight: 600; }
        .report-content p { font-size: 0.9375rem; color: #334155; line-height: 1.7; margin-bottom: 1rem; }
        
        .section-7-content ol { list-style: none; counter-reset: step; padding-left: 0; }
        .section-7-content ol > li { position: relative; padding-left: 3rem; margin-bottom: 1.5rem; font-weight: 500; }
        .section-7-content ol > li::before { 
          counter-increment: step; content: counter(step); 
          position: absolute; left: 0; top: -4px;
          width: 2rem; height: 2rem; background-color: #10B981; color: white;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: 0.875rem; font-family: var(--font-ibm-sans), sans-serif;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
        }

        @media print {
          /* Page setup */
          @page {
            size: A4;
            margin: 18mm 16mm 18mm 16mm;
          }

          /* Preserve background colors and borders in print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide the browser chrome prompt bar and print button */
          .print-hide,
          .print-prompt-bar {
            display: none !important;
          }

          /* Force body to standard print styling without overriding colors */
          body { 
            background: white !important; 
            font-size: 10pt !important; 
            font-family: var(--font-ibm-sans), sans-serif !important; 
          }

          /* Section page breaks */
          .report-section {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .report-section + .report-section {
            page-break-before: auto;
          }

          /* Force tables not to break across pages mid-row */
          tr {
            page-break-inside: avoid;
          }

          /* Gap analysis cards — keep each card together */
          .gap-card {
            page-break-inside: avoid;
          }

          /* Score card — keep on one page and invert to light theme */
          .score-card {
            page-break-inside: avoid;
            break-inside: avoid;
            background-color: #ffffff !important;
            color: #0f172a !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
          }

          /* Tier breakdown labels and values: dark text on white */
          .score-card * {
            color: #0f172a !important;
          }

          /* Tier progress bar track: light gray */
          .tier-bar-track {
            background-color: #e2e8f0 !important;
          }

          /* Tier progress bar fill: keep color but ensure visibility */
          .tier-bar-fill {
            opacity: 1 !important;
          }

          /* Informational chips: light border, dark text */
          .info-chip {
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1 !important;
            color: #0f172a !important;
          }

          /* PARTIAL badge: keep amber but on white */
          .rating-badge {
            background-color: #fef3c7 !important;
            color: #92400e !important;
            border: 1px solid #fcd34d !important;
          }

          /* SVG gauge arc and text: ensure visibility on white */
          .score-card svg text {
            fill: #0f172a !important;
          }
          /* Footer — print on every page */
          .report-footer {
            position: running(footer);
          }
        }
      `}</style>
    </div>
  );
};

export default PrintReport;
