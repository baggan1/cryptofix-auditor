import React from 'react';

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-navy-dark tracking-tight mb-12 border-b border-slate-200 pb-4">
        Methodology
      </h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Scoring framework</h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-slate-600 mb-6 leading-relaxed">
              The CryptoFIX Audit uses a tiered weighted scoring model consisting of 27 mandatory checks, totaling 100 points. 
              Exchanges are evaluated on presence, conformance, and documentation quality.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tier 1</div>
                <div className="font-bold text-slate-900">Order Lifecycle (35pts)</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tier 2</div>
                <div className="font-bold text-slate-900">Execution Quality / TCA (25pts)</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tier 3</div>
                <div className="font-bold text-slate-900">Post-Trade Allocation (25pts)</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Tier 4</div>
                <div className="font-bold text-slate-900">AML / Travel Rule (15pts)</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Tier 5 — DAWG extensions</h2>
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6">
            <p className="text-slate-700 leading-relaxed italic">
              Tier 5 checks evaluate support for Digital Asset Working Group (DAWG) extensions and EP273 standards. 
              These are <strong>informational only</strong> and are not included in the primary 100-point score, representing 
              forward-looking institutional readiness for future FIX technical committee ratifications.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Provenance</h2>
          <p className="text-slate-600 leading-relaxed">
            Rubric built from 15 years of FIX protocol implementation at <strong>Wellington Management</strong> (9 years, 20+ broker certifications, ATDL dark pools) 
            and <strong>Solidus Labs</strong> (25+ institutional crypto exchange onboardings). 
            Referenced against FIX Trading Community Digital Assets Working Group Gap Analysis v0.2 (May 2022) and EP273.
          </p>
        </section>

        <section className="pt-8 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Disclaimer</h2>
          <p className="text-slate-500 text-sm italic mb-6">
            Scores are indicative and based on a point-in-time review of public documentation and certification environments. 
            Independent verification against current exchange Rules of Engagement is recommended.
          </p>
          <div className="text-sm font-bold text-navy-dark">
            Opound LLC — <a href="mailto:navilla@opound.com" className="hover:underline">navilla@opound.com</a>
          </div>
        </section>
      </div>
    </div>
  );
}
