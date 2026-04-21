import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MethodologyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-navy-dark transition-colors gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to audits
        </Link>
      </div>

      <h1 className="text-4xl font-extrabold text-navy-dark tracking-tight mb-12 border-b border-slate-200 pb-4">
        Methodology <span className="text-slate-300 font-light">v2.0</span>
      </h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-dark text-white text-sm">1</span>
            Scoring framework
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <p className="text-slate-600 mb-8 leading-relaxed">
              "The CryptoFIX Auditor uses a two-level scoring model: first evaluating
              whether a FIX message type is documented, then scoring the essential tags
              required within that message. This mirrors how institutional OMS and
              compliance teams actually evaluate exchange connectivity."
            </p>

            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Main readiness score (0–100)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">TIER 1</div>
                  <div className="text-xs font-black text-navy-dark bg-white px-2 py-0.5 rounded shadow-sm">55 PTS</div>
                </div>
                <div className="font-bold text-slate-900 mb-2">Order Lifecycle</div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Message types: 35=D (NewOrderSingle), 35=8 (ExecutionReport),
                  35=F (CancelRequest), 35=G (Amend), 35=9 (CancelReject),
                  35=Q (DontKnowTrade), unsolicited cancel. Essential tags scored
                  within each message type.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">TIER 2</div>
                  <div className="text-xs font-black text-navy-dark bg-white px-2 py-0.5 rounded shadow-sm">15 PTS</div>
                </div>
                <div className="font-bold text-slate-900 mb-2">Execution Quality & TCA</div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tags within 35=8 ExecutionReport: LastCapacity (29), LastMkt (30),
                  OrderCapacity (528), TransactTime precision (60), LastLiquidityInd (851),
                  ContraTrader (375). Required for MiFID II best-execution and TCA.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">TIER 3</div>
                  <div className="text-xs font-black text-navy-dark bg-white px-2 py-0.5 rounded shadow-sm">15 PTS</div>
                </div>
                <div className="font-bold text-slate-900 mb-2">Post-trade, Allocation & RFQ</div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Message types: 35=AE (TradeCaptureReport), 35=J (AllocationInstruction),
                  35=P (AllocationAck), 35=R (RequestForQuote), 35=S (Quote),
                  35=AJ (QuoteResponse). Essential for institutional block trade workflows.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">TIER 8</div>
                  <div className="text-xs font-black text-navy-dark bg-white px-2 py-0.5 rounded shadow-sm">15 PTS</div>
                </div>
                <div className="font-bold text-slate-900 mb-2">Admin & Session Management</div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Standard header, 35=A (Logon with auth), 35=0 (Heartbeat),
                  35=2 (ResendRequest/gap-fill), 35=5 (Logout), 35=3/35=j (Rejects),
                  35=4 (SequenceReset), Cancel-on-Disconnect. Session reliability
                  is a prerequisite for all other tiers.
                </p>
              </div>
            </div>

            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Audience-specific sub-scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative p-6 bg-white border border-slate-100 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-sm font-bold text-slate-900">Compliance & Drop Copy</div>
                    <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">0–15 PTS</div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    "For compliance service providers, AML platforms, and prime brokers.
                    Tier 4 (AML & Travel Rule, 10 pts): Parties group (453/448/452),
                    wallet attribution, ExecID audit trail, ExecInst compliance flags —
                    evaluated in 35=8 or 35=AE context.
                    Tier 6 (Drop Copy, 5 pts): Dedicated DC session, CopyMsgIndicator (797),
                    cross-session FIX order coverage."
                  </p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative p-6 bg-white border border-slate-100 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-sm font-bold text-slate-900">Market Data</div>
                    <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">0–5 PTS</div>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    "For buy-side institutions and algo execution desks.
                    Tier 7: 35=V (MarketDataRequest), 35=W (FullRefresh snapshot),
                    35=X (IncrementalRefresh — L2 or L3), 35=Y (Reject),
                    35=x (SecurityListRequest), trading session status.
                    L3 order-level data (MDEntryID tag 278) is flagged as above baseline."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-dark text-white text-sm">2</span>
            Tier 5: FIX DAWG extensions (informational)
          </h2>
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-bl-full -mr-8 -mt-8"></div>
            <p className="text-slate-700 leading-relaxed text-sm relative z-10">
              "Tier 5 checks evaluate support for FIX Trading Community Digital Assets
              Working Group (DAWG) standards, including ratified EP273 extensions
              and draft proposals. These checks are informational only and do not
              affect any score."
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div>
                <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3">Ratified (EP273)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  SecurityIDSource=Y (tag 22/456, ISO 24165 DTI),
                  CurrencyCodeSource (tag 2897), SettlCurrencyCodeSource (tag 2899),
                  SecurityType=DIGITAL (tag 167).
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3">Draft (pending ratification)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Wallet identifier via PartySubIDType (tag 803),
                  Symbol + SecAltIDGrp DTI pairs (tags 55 + 454/455/456).
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-purple-100 text-[10px] text-purple-400 font-bold uppercase tracking-widest">
              Reference: FIX Trading Community — <a href="https://fiximate.fixtrading.org/" className="underline">fiximate.fixtrading.org</a>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-dark text-white text-sm">3</span>
            Provenance
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 leading-relaxed">
              "Rubric built from 15+ years of FIX protocol implementation at
              Wellington Management (9 years, 20+ broker-dealer certifications,
              ATDL, dark pool ATS connectivity, MiFID II trade reporting) and
              Solidus Labs (Lead TPM, 25+ institutional crypto exchange onboardings,
              digital asset FIX standard design)."
            </p>
            <h4 className="text-sm font-bold text-slate-900 mt-6 mb-3">Referenced against:</h4>
            <ul className="text-xs text-slate-500 space-y-2 list-disc pl-5">
              <li>FIX Trading Community FIXimate tag reference — fiximate.fixtrading.org</li>
              <li>FIX DAWG Gap Analysis v0.2 (May 2022) and EP273 ratified extensions</li>
              <li>CME iLink3 FIX 5.0 specification</li>
              <li>Coinbase Exchange FIX API (FIX 5.0 SP2)</li>
              <li>Kraken FIX API (FIX 4.4)</li>
              <li>ASX 24 Drop Copy Specification v2.05</li>
              <li>FINRA TRACE FIX Specification v1.5</li>
            </ul>
          </div>
        </section>

        <section className="pt-8 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white text-sm">4</span>
            Disclaimer
          </h2>
          <p className="text-slate-500 text-sm italic mb-8 leading-relaxed">
            "Scores are indicative assessments based on publicly available FIX API
            documentation. Independent verification against exchange RoE documentation
            and UAT testing is recommended before production connectivity."
          </p>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 px-8 bg-navy-dark rounded-2xl text-white">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Auditor Contact</div>
              <div className="font-bold">Opound LLC — navilla.bagga@gmail.com</div>
            </div>
            <div className="text-right md:text-left">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Version Control</div>
              <div className="font-bold">CryptoFIX Auditor v2.0 — April 2026</div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-navy-dark transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to audits
        </Link>
      </div>
    </div>
  );
}
