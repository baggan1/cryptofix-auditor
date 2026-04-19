'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ExchangeSelector from '@/components/ExchangeSelector';
import { ShieldCheck, BarChart3, FileText, Zap, CheckCircle2 } from 'lucide-react';

const PROGRESS_STEPS = [
  "Fetching FIX specification",
  "Extracting 27 fields",
  "Scoring against rubric",
  "Building report"
];

export default function Home() {
  const router = useRouter();
  const [selectedExchange, setSelectedExchange] = useState('');
  const [url, setUrl] = useState('');
  const [pastedSpec, setPastedSpec] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [errorText, setErrorText] = useState('');

  const handleRunAudit = async () => {
    setErrorText('');
    setCurrentStep(null);

    if (selectedExchange) {
      setLoading(true);
      setCurrentStep(3); // Just show "Building report" roughly
      setTimeout(() => {
        router.push(`/audit/${selectedExchange}`);
      }, 500);
      return;
    }

    if (url || pastedSpec) {
      setLoading(true);
      try {
        // Step 0 & 1: Fetching & Extracting via /api/ingest
        sessionStorage.removeItem('live_audit_report');
        sessionStorage.removeItem('liveAuditResult');
        setCurrentStep(0);
        
        const ingestRes = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            exchange_name: url ? new URL(url).hostname.replace('www.', '') : 'Pasted-Spec-Exchange',
            spec_source: url || pastedSpec,
            asset_classes: 'spot, futures',
            is_pasted: !!pastedSpec && !url
          })
        });

        setCurrentStep(1);

        if (!ingestRes.ok) {
          const errData = await ingestRes.json().catch(() => ({}));
          throw new Error(`Extraction failed: ${errData.error || ingestRes.statusText}. ${errData.rawPreview ? 'Raw preview: ' + errData.rawPreview.slice(0, 200) : ''}`);
        }

        const extractionResult = await ingestRes.json();
        
        // Step 2: Scoring
        setCurrentStep(2);
        const scoreRes = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(extractionResult)
        });

        if (!scoreRes.ok) {
          const errData = await scoreRes.json();
          throw new Error(errData.error || 'Scoring failed');
        }

        const scoreData = await scoreRes.json();

        // Step 3: Building report
        setCurrentStep(3);
        await new Promise(r => setTimeout(r, 500)); // Brief pause for UX

        // Hydrate sessionStorage for client-side routing persistence
        sessionStorage.setItem('live_audit_report', JSON.stringify(scoreData.report));
        
        router.push(`/audit/live`);
      } catch (error: any) {
        console.error(error);
        setErrorText(error.message || 'Error occurred during audit.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col pb-24">
      {/* Hero Section */}
      <section className="bg-navy-dark text-white flex flex-col items-center justify-center pt-24 pb-16 px-4 text-center relative">
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
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100 relative">
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
                if (val) {
                  setSelectedExchange('');
                  setPastedSpec('');
                }
              }}
              onRunAudit={handleRunAudit}
              loading={loading}
            />

            {!selectedExchange && (
              <details className="mt-3">
                <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
                  ↳ Or paste spec content directly (for JavaScript-rendered sites)
                </summary>
                <textarea
                  className="mt-2 w-full h-40 p-3 text-sm border border-slate-300 
                    rounded-lg font-mono resize-y focus:outline-none 
                    focus:ring-2 focus:ring-[#10B981]"
                  placeholder="Paste FIX spec text here (copy from browser, PDF, or API docs)..."
                  value={pastedSpec}
                  onChange={(e) => {
                    setPastedSpec(e.target.value);
                    if (e.target.value) setUrl('');
                  }}
                />
              </details>
            )}

            {errorText && (
              <div className="mt-8 text-center text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl font-medium max-w-lg mx-auto">
                {errorText}
              </div>
            )}

            {loading && currentStep !== null && !errorText && (
              <div className="mt-8 flex flex-col items-center max-w-sm mx-auto bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm">
                <div className="w-full space-y-4">
                  {PROGRESS_STEPS.map((step, idx) => {
                    const isDone = currentStep > idx;
                    const isActive = currentStep === idx;
                    const isPending = currentStep < idx;
                    
                    return (
                      <div key={idx} className={`flex items-center gap-3 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                        {isDone ? (
                           <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : isActive ? (
                           <div className="w-5 h-5 border-2 border-navy-dark/30 border-t-navy-dark rounded-full animate-spin flex-shrink-0" />
                        ) : (
                           <div className="w-5 h-5 border-2 border-slate-200 rounded-full flex-shrink-0" />
                        )}
                        <span className={`text-sm font-medium ${isActive ? 'text-navy-dark font-bold' : 'text-slate-500'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-6 text-xs text-slate-400 font-medium uppercase tracking-widest text-center">
                  This takes 15-30 seconds
                </p>
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
    </div>
  );
}
