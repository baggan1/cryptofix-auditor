'use client';

import React from 'react';
import { BarChart3, CheckCircle, AlertTriangle, XCircle, Info, ExternalLink } from 'lucide-react';
import { CheckResult } from '@/lib/types';

interface Tier7MarketDataPanelProps {
  results: {
    label: string;
    score: number;
    max_score: number;
    checks: CheckResult[];
    summary: string;
  };
}

const Tier7MarketDataPanel: React.FC<Tier7MarketDataPanelProps> = ({ results }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'full_credit': return <CheckCircle className="w-4 h-4 text-[#C8963E]" />;
      case 'partial_credit': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <XCircle className="w-4 h-4 text-slate-300" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'full_credit': return 'bg-[#C8963E]/5 border-[#C8963E]/20';
      case 'partial_credit': return 'bg-amber-50 border-amber-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="mt-8 border border-blue-200 rounded-xl overflow-hidden bg-white shadow-sm print:shadow-none">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide uppercase">Tier 7 Audit</h3>
            <p className="text-xs text-blue-100 opacity-90">{results.label}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{results.score}<span className="text-sm opacity-60 ml-0.5">/ {results.max_score}</span></div>
          <p className="text-[10px] text-blue-200 uppercase font-medium tracking-tighter">Market Data Readiness</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50/30 border-b border-blue-100 italic text-[11px] text-blue-800 flex gap-2 items-start">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Market Data readiness is scored separately from the main Institutional Readiness Score. 
          Buy-side institutions require FIX market data for book building and real-time execution monitoring.
        </p>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.checks.map((check) => (
            <div 
              key={check.check_id}
              className={`p-3 rounded-lg border flex gap-3 transition-colors ${getStatusBg(check.status)}`}
            >
              <div className="mt-0.5">{getStatusIcon(check.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">{check.check_id}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    check.status === 'full_credit' ? 'bg-[#C8963E]/10 text-[#B08332]' : 
                    check.status === 'partial_credit' ? 'bg-amber-100 text-amber-700' : 
                    'bg-slate-200 text-slate-600'
                  }`}>
                    {check.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 leading-tight mb-1 truncate">{check.field_name} {check.fix_tag ? `(${check.fix_tag})` : ''}</h4>
                <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed italic mb-2">
                  {check.evidence || "No evidence documented in specification."}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-2 uppercase tracking-wide">
            Institutional Rationale
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Market Data messages allow buy-side firms to bypass WebSocket/REST feeds and maintain uniform connectivity for both trading and book maintenance. 
            <strong> L3 order-by-order data</strong> is the institutional gold standard for price transparency and best execution analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Tier7MarketDataPanel;
