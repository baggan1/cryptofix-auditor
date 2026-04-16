'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ExchangeSelector from '@/components/ExchangeSelector';
import { ShieldCheck, BarChart3, FileText, Zap } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [selectedExchange, setSelectedExchange] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleRunAudit = async () => {
    if (selectedExchange) {
      // Pre-loaded audit
      setLoading(true);
      setStatus('Loading static report...');
      setTimeout(() => {
        router.push(`/audit/${selectedExchange}`);
      }, 500);
      return;
    }

    if (url) {
      // Manual audit flow
      setLoading(true);
      try {
        setStatus('Fetching spec...');
        // In a real app, we'd call /api/ingest and /api/score here
        // For the scaffold MVP, we'll simulate the steps as requested
        
        await new Promise(r => setTimeout(r, 800));
        setStatus('Extracting fields...');
        await new Promise(r => setTimeout(r, 1200));
        setStatus('Scoring...');
        await new Promise(r => setTimeout(r, 800));
        setStatus('Generating report...');
        await new Promise(r => setTimeout(r, 500));
        
        // Redirect to a placeholder or dynamic slug
        // For now, let's just go to a dynamic audit page (Phase 2 logic)
        router.push(`/audit/manual?url=${encodeURIComponent(url)}`);
      } catch (error) {
        console.error(error);
        setStatus('Error occurred during audit.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-navy-dark text-white pt-24 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0,transparent_50%)]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[10px] font-bold uppercase tracking-widest mb-6 backdrop-blur-sm border border-white/10">
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            V1.1 Protocol Analysis
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            CryptoFIX Institutional <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-white opacity-90">Readiness Auditor</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Score any crypto exchange FIX implementation against TradFi institutional standards. 
            Built on 15 years of FIX protocol experience at Wellington Management and Solidus Labs.
          </p>
        </div>
      </section>

      {/* Selector Section */}
      <section className="-mt-16 px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-100">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Select Target Exchange</h3>
              <p className="text-slate-500 font-medium">Choose a certified audit or input a documentation URL to begin analysis.</p>
            </div>
            
            <ExchangeSelector
              selectedExchange={selectedExchange}
              onSelect={(id) => {
                setSelectedExchange(id);
                if (id) setUrl('');
              }}
              url={url}
              onUrlChange={(val) => {
                setUrl(val);
                if (val) setSelectedExchange('');
              }}
              onRunAudit={handleRunAudit}
              loading={loading}
            />

            {loading && (
              <div className="mt-8 flex flex-col items-center">
                <div className="w-full max-w-md h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-navy-dark animate-progress-indeterminate" />
                </div>
                <p className="text-sm font-bold text-navy-dark animate-pulse uppercase tracking-widest">{status}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck className="w-8 h-8 text-navy-dark" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">Institutional Grade</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Evaluated against the same standards used by the world&apos;s largest asset managers and prime brokers.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                <BarChart3 className="w-8 h-8 text-navy-dark" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">32-Check Matrix</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Deep analysis across Order Lifecycle, Execution Quality, Post-Trade, and AML/Compliance fields.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mb-6 shadow-sm">
                <FileText className="w-8 h-8 text-navy-dark" />
              </div>
              <h4 className="text-xl font-bold mb-3 text-slate-900">Full RoE Generation</h4>
              <p className="text-slate-500 text-sm leading-relaxed">
                Download a complete Rules of Engagement document with gap analysis and remediation roadmaps.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @keyframes progress-indeterminate {
          0% { transform: translateX(-100%); width: 30%; }
          50% { transform: translateX(100%); width: 70%; }
          100% { transform: translateX(300%); width: 30%; }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
