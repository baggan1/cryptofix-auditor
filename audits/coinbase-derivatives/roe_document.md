# Rules of Engagement — Coinbase Derivatives Exchange FIX API
## Institutional readiness audit

Audit date: 2026-04-20
Auditor: Opound LLC — Navilla Bagga
Spec source: multi-url: order-entry, session, header-trailer, code-sets, drop-copy, market-data, overview
Asset classes: [futures, options]

Overall score: 54 / 100 — Partial

| Tier | Score | Available | % |
| :--- | :--- | :--- | :--- |
| **1 Order lifecycle** | 34.1 | 40 | 85% |
| **2 Execution quality & TCA** | 11.5 | 25 | 46% |
| **3 Post-trade & allocation** | 0.0 | 25 | 0% |
| **4 AML & Travel Rule** | 8.0 | 10 | 80% |

**Informational Tiers:**
- **5 DAWG Extensions**: 0 checks present
- **6 Drop Copy readiness**: 9.5 / 11 (High — Includes Parties 453)
- **7 Market Data**: 10 / 10 (Institutional ready)
- **8 Admin & Session**: 9.0 / 10 (High reliability)

### Recommendation
Coinbase Derivatives Exchange (CDE) offers a more "TradFi-native" session layer than the core Coinbase Spot Exchange. By supporting standard `ResendRequest (35=2)` and the full `Parties (453)` repeating group, CDE integrates more seamlessly with existing institutional execution management systems (EMS). The primary gaps are the lack of native FIX-based trade capture (35=AE) and allocation instructions, which remains a consistent limitation across the Coinbase ecosystem.

### Critical Gaps (Top 3)
- **T3_AE_000** | Post-trade | 2.0 pts | No standard 35=AE Trade Capture Report for clearing sync.
- **T3_J_000** | Allocation | 2.0 pts | No native FIX allocation instructions; must be handled via portal or out-of-band.
- **T2_8_029** | LastCapacity | 5.0 pts | Missing agent/principal transparency on execution reports.

---

## SECTION 2 — Session configuration

FIX version: 4.4
Transport: TCP/TLS 1.2+

**Connection parameters:**
- **TargetCompID**: [Assigned by CDE]
- **SenderCompID**: SubFirmID (3 chars) + SessionID (3 digits)
- **Host**: fix.derivatives.coinbase.com (Example)
- **Port**: 5111

**Authentication:** 
- HMAC-SHA256 signature passed in tag 96 (RawData).
- Logon tags: 553 (Username), 554 (Password), 96 (Signature).
- **SenderSubID (50)**: Required as the unique end-trader identifier.

**Session management:**
- **Sequence numbers**: Reset **weekly** based on a pre-configured schedule.
- **Message recovery**: Standard `ResendRequest (35=2)` and `SequenceReset (35=4)` are fully supported.
- **Order state recovery**: Custom messages `Last ExecId Request (35=F1)` and `Event Resend Request (35=F3)` provide non-standard synchronization shortcuts.

---

## SECTION 3 — Tier scorecard

### Tier 1 (Order Lifecycle): 34.1 / 40 pts
| Check ID | Tag | Field | Status | Pts | Max | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| T1_D_000 | 35=D | NOS | [P] | 3.0 | 3.0 | Primary entry for FUT/OPT. |
| T1_D_167 | 167 | SecType | [P] | 0.7 | 0.7 | Mandatory FUT/OPT values. |
| T1_8_000 | 35=8 | ER | [P] | 3.0 | 3.0 | Supports all CDE state changes. |
| ... | ... | ... | ... | ... | ... | ... |

### Tier 4 (AML & Identity): 8 / 10 pts
| Check ID | Tag | Field | Status | Pts | Max | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| T4_453 | 453 | Parties | [P] | 4.0 | 4.0 | FULL support for regulatory roles (1, 3, 7, 12, 38). |
| T4_017 | 17 | ExecID | [P] | 2.0 | 2.0 | Globally unique identifiers. |

---

## SECTION 4 — Gap analysis & remediation

### T2_8_851 — LastLiquidityInd (tag 851) — 1.5 pts lost
**Status**: Partial (Proprietary Tag)
**Evidence**: CDE uses `AggressorIndicator (1057)` instead of standard 851.
**Institutional impact**: Requires custom mapping in TCA systems.
**Remediation**: Expose internal aggressor state via standard tag 851 for drop-in EMS compatibility.

### T1_q_000 — OrderMassCancelRequest (35=q) — (Failed)
**Status**: Missing
**Evidence**: No support for mass-cancel-by-portfolio or symbol found in FIX specs.
**Institutional impact**: High-risk during volatility or technical failure; requires sequential cancels which increases latency.

---

## SECTION 5 — Custom tag dictionary
| Tag # | Field Name | Data Type | Valid Values | Messages | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1057 | AggressorIndicator | Boolean | Y=Taker, N=Maker | 35=8 | Primary maker/taker flag. |
| 7928 | SelfMatchPreventionID | string | Client assigned | 35=D | Groups orders for SMP. |
| 8000 | SMPStrategy | int | 1=Aggressor, 2=Resting, 3=Both | 35=D | Execution risk control. |

---

## SECTION 6 — Order types matrix
| Order Type | FIX OrdType | Futures | Options | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Market | 1 | [P] | [P] | |
| Limit | 2 | [P] | [P] | |
| Stop | 3 | [P] | [P] | Triggered by Last Trade. |
| Stop Limit | 4 | [P] | [P] | |

---

## SECTION 7 — UAT checklist
**Phase 1 — Connectivity**: FIX 4.4 Logon with HMAC-256, verification of SenderSubID (50) persistence.
**Phase 2 — Derivatives**: NOS with SecurityType=FUT, validation of MaturityMonthYear (200) processing.
**Phase 3 — Identity**: Verify Parties (453) group roles in ExecutionReports for clearing downstream.
**Phase 4 — Risk Control**: Test SMPStrategy=3 (Cancel Both) via intentional self-trade.

---

## SECTION 8 — DAWG Extensions (Informational)
CDE maintains standard TradFi asset identifiers (Symbol/SecurityType) and does not utilize DAWG-ratified digital asset extensions like ISO 24165 DTIs or Tag 167=DIGITAL.

---

## SECTION 9 — Drop Copy Analysis
**Score**: 9.5 / 11
**Status**: High Readiness
CDE's drop copy is superior to standard crypto offerings by including the full `Parties (453)` group, ensuring that multi-trader institutional desks can reconstruct exactly which entering trader initiated each fill for internal audit.

---

## SECTION 10 — Market Data Analysis
**Score**: 10 / 10
**Status**: Institutional Ready
Comprehensive L2/L3 support with a full range of entry types including Open Interest, clearing price, and trading session status.

---

## SECTION 11 — Admin & Session Analysis
**Score**: 9.0 / 10
**Status**: High Reliability
By adhering to standard FIX 4.4 session protocol (ResendRequest/SequenceReset), CDE provides the most predictable connectivity layer in the Coinbase family. The weekly reset cycle provides a good balance between state stability and system maintenance.

Prepared by: Opound LLC — navilla.bagga@gmail.com
Version: 2.0.0 | Date: 2026-04-20
