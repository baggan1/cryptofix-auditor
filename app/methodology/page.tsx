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

      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-navy-dark tracking-tight mb-2">
          CryptoFIX Institutional Readiness Auditor — Methodology
        </h1>
        <p className="text-lg text-slate-500">How exchanges are evaluated against TradFi institutional standards</p>
      </div>

      <div className="space-y-16">
        {/* Section 1 — Two-level scoring model */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-dark text-white text-sm">1</span>
            Two-level scoring model
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <p className="text-slate-600 leading-relaxed mb-4">
              The CryptoFIX rubric uses a two-level model:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600 mb-6">
              <li><strong>Message type presence</strong> — is the FIX message documented?</li>
              <li><strong>Essential tag coverage</strong> — are the required tags present within that message?</li>
            </ol>
            <p className="text-slate-600 leading-relaxed">
              This mirrors how institutional OMS teams and connectivity engineers actually evaluate an exchange's FIX spec:
              first confirm the message exists, then verify the specific fields needed for their workflow.
            </p>
          </div>
        </section>

        {/* Section 2 — Main readiness score (0–100) */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-dark text-white text-sm">2</span>
            Main readiness score (0–100)
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Four tiers contribute to the institutional readiness score. Tier 1 carries the most weight because
            order lifecycle capability is the primary determinant of whether an exchange can support direct institutional connectivity.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TIER 1</div>
                <div className="text-xs font-black text-navy-dark bg-white px-3 py-1 rounded shadow-sm">55 PTS</div>
              </div>
              <div className="font-bold text-lg text-slate-900 mb-2">Order Lifecycle</div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Message types:</strong> 35=D (NewOrderSingle), 35=8 (ExecutionReport),
                35=F (CancelRequest), 35=G (Amend/CancelReplace),
                35=9 (CancelReject), 35=Q (DontKnowTrade),
                unsolicited cancel (35=8 with 150=4)
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TIER 2</div>
                <div className="text-xs font-black text-navy-dark bg-white px-3 py-1 rounded shadow-sm">15 PTS</div>
              </div>
              <div className="font-bold text-lg text-slate-900 mb-2">Execution Quality & TCA</div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                <strong>Tags within 35=8 ExecutionReport:</strong> LastCapacity (29), LastMkt (30), OrderCapacity (528),
                LastPx/LastQty (31/32), TransactTime precision (60), LastLiquidityInd (851), ContraTrader (375)
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Required for MiFID II best-execution, TCA, and fee reconciliation.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TIER 3</div>
                <div className="text-xs font-black text-navy-dark bg-white px-3 py-1 rounded shadow-sm">15 PTS</div>
              </div>
              <div className="font-bold text-lg text-slate-900 mb-2">Post-Trade & Allocation</div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                <strong>Message types:</strong> 35=AE (TradeCaptureReport),
                35=AR (TradeCaptureReportAck), 35=J (AllocationInstruction),
                35=P (AllocationInstructionAck)
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Essential for institutional block trade confirmation and post-trade allocation workflows.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TIER 8</div>
                <div className="text-xs font-black text-navy-dark bg-white px-3 py-1 rounded shadow-sm">15 PTS</div>
              </div>
              <div className="font-bold text-lg text-slate-900 mb-2">Admin & Session Management</div>
              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                Standard header, 35=A (Logon + auth), 35=0 (Heartbeat),
                35=2 (ResendRequest / message recovery), 35=5 (Logout),
                35=3/35=j (Rejects), 35=4 (SequenceReset),
                Cancel-on-Disconnect (COD)
              </p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Session reliability is a prerequisite for all other tiers.</p>
            </div>
          </div>
        </section>

        {/* Section 3 — Audience-specific sub-scores */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-dark text-white text-sm">3</span>
            Audience-specific sub-scores
          </h2>
          <p className="text-slate-500 mb-8">Two supplementary scored panels provide audience-specific assessments that do not affect the main 100-point score.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C8963E] to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative p-8 bg-white border border-slate-200 rounded-2xl h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-lg font-bold text-slate-900">Compliance & Drop Copy</div>
                  <div className="text-xs font-black text-[#C8963E] bg-[#C8963E]/10 px-3 py-1 rounded">0–15 PTS</div>
                </div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">For: Compliance service providers, AML platforms, prime brokers</div>
                <div className="space-y-6">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 mb-1">Tier 4 — AML & Travel Rule (10 pts)</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Tags in 35=8, 35=AE, or 35=AR context: Parties (453/448/452) for VASP ID,
                      wallet attribution, ExecID audit trail (17), ExecInst flags (18).
                    </p>
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 mb-1">Tier 6 — Drop Copy (5 pts)</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Dedicated FIX session, CopyMsgIndicator (797), dedicated endpoint, cross-session order coverage.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative p-8 bg-white border border-slate-200 rounded-2xl h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-lg font-bold text-slate-900">Market Data & RFQ</div>
                  <div className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded">0–5 PTS</div>
                </div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">For: Buy-side institutions, algo execution desks</div>
                <div className="space-y-6">
                  <div>
                    <h5 className="font-bold text-sm text-slate-800 mb-1">Tier 7 — Market Data & RFQ</h5>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      35=V/W/X/Y (subscribe/snapshot/incremental), 35=x (security list), 35=h/f (session status).
                      L2 vs L3 (tag 278) noted.
                    </p>
                    <h5 className="font-bold text-xs text-slate-800 mb-1 uppercase tracking-tight">RFQ Workflow:</h5>
                    <p className="text-xs text-slate-600 leading-relaxed font-mono">
                      35=AH (RFQ Request), 35=R (RequestForQuote), 35=S (Quote), 35=AJ (QuoteResponse), 35=AI (QuoteStatusReport)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 — Tier 5: DAWG extensions (informational, 0 pts) */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-dark text-white text-sm">4</span>
            Tier 5: DAWG extensions
          </h2>
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-bl-full -mr-8 -mt-8"></div>
            <div className="relative z-10">
              <p className="text-slate-700 leading-relaxed mb-8">
                Tier 5 evaluates support for FIX Trading Community Digital Assets Working Group (DAWG) extensions.
                These checks are informational only and do not affect any score.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3">Ratified (EP273)</h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                    <li>SecurityIDSource=Y (tag 22/456, ISO 24165 DTI)</li>
                    <li>CurrencyCodeSource (tag 2897)</li>
                    <li>SettlCurrencyCodeSource (tag 2899)</li>
                    <li>SecurityType=DIGITAL (tag 167)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-3">Draft</h4>
                  <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                    <li>Wallet identifier via PartySubIDType (tag 803)</li>
                    <li>Symbol + SecAltIDGrp DTI pairs (tags 55 + 454/455/456)</li>
                  </ul>
                </div>
              </div>
              <p className="mt-8 text-[11px] text-slate-500 italic">
                Note: EP273 tags were published for FIX 5.0 SP2. FIX 4.4 exchanges (e.g. Coinbase Derivatives) cannot implement these extensions directly.
              </p>
              <div className="mt-6 pt-6 border-t border-purple-100 text-[10px] text-purple-400 font-bold uppercase tracking-widest">
                Reference: FIX Trading Community — <a href="https://fiximate.fixtrading.org/" className="underline">fiximate.fixtrading.org</a>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 — Provenance */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-dark text-white text-sm">5</span>
            Provenance
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <p className="text-slate-700 font-bold mb-6">Built from 12+ years of FIX protocol implementation:</p>

            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Wellington Management Company (9 years, 30+ certifications)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ATDL algo strategy construction, dark pool ATS connectivity (Liquidnet, Luminex, Instinet), EMS (Bloomberg EMSX, Tradeweb,MarketAxess, etc),
                  MiFID II trade reporting, TWAP/VWAP/IS/POV execution algorithms, CME Self-Match Prevention,
                  TBA/MBS netting via DTCC/FICC, FIX Onboarding, FIX Post-trade STP.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Solidus Labs (Lead TPM, 25+ onboardings)</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Digital Asset FIX standard design, AML/surveillance platform delivery, first FIX-native
                  implementation of digital asset trade compliance for institutional crypto exchanges.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Official FIX References:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-[11px] text-slate-500 font-medium">
                <li>• FIX Trading Community FIXimate: fiximate.fixtrading.org</li>
                <li>• FIX DAWG Gap Analysis v0.2 and EP273</li>
                <li>• CME iLink3 FIX 5.0 specification</li>
                <li>• ASX 24 Drop Copy Specification v2.05</li>
                <li>• FINRA TRACE FIX Specification v1.5</li>
                <li>• Coinbase Exchange FIX API (FIX 5.0 SP2)</li>
                <li>• Kraken FIX API (FIX 4.4)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 6 — Disclaimer */}
        <section>
          <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Disclaimer</h2>
            <p className="text-sm text-slate-500 italic leading-relaxed mb-8">
              Scores are indicative assessments based on publicly available FIX API documentation.
              Exchanges may support undocumented functionality. Independent verification against exchange
              RoE documentation and UAT testing is recommended before production connectivity decisions.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 px-10 bg-navy-dark rounded-xl text-white">
              <div className="text-center md:text-left">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Auditor Provider</div>
                <div className="font-bold">Opound LLC</div>
                <div className="text-xs text-slate-300">navilla@opound.com</div>
              </div>
              <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-slate-700 pt-6 md:pt-0 md:pl-10">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Platform Version</div>
                <div className="font-bold">CryptoFIX Auditor v2.0</div>
                <div className="text-xs text-slate-300">fix.opound.com</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-16 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-navy-dark transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to audits
        </Link>
      </div>
    </div>
  );
}
