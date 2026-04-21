# Rules of Engagement — Coinbase Derivatives Exchange FIX API
## Institutional readiness audit

Audit date: 2026-04-21
Auditor: Opound LLC — Navilla Bagga
Spec source: multi-url
Asset classes: [futures, options]

Overall score: 61 / 100 — Partial

Tier | Score | Available | %
-----|-------|-----------|---
1 Order lifecycle | 36.1 | 55 | 66%
2 Execution quality & TCA | 15.0 | 15 | 100%
3 Post-trade & allocation | 0.0 | 15 | 0%
4 AML & Travel Rule | 10.0 | 10 | 100%

Informational Tiers:
5 DAWG Extensions | 0 checks present
6 Drop Copy readiness | 5.0 / 5
7 Market Data | 5.0 / 5
8 Admin & Session | 9.6 / 15

Recommendation: Coinbase Derivatives Exchange offers a robust FIX 4.4 implementation with strong institutional features for derivatives, including ResendRequest support and AML/Parties group support. However, it lacks native institutional post-trade (35=AE/J) and RFQ messages. It is highly ready for low-latency execution but requires custom reconciliation logic for back-office workflows.

Critical gaps (top 3 by points_lost):
- T3_AE_000 | TradeCaptureReport | 2.0 pts | Institutional post-trade reporting (35=AE) is not supported; relies on execution feed (35=8).
- T3_J_000 | AllocationInstruction | 2.0 pts | No support for native FIX allocations (35=J).
- T1_Q_000 | DontKnowTrade | 1.5 pts | DK messages (35=Q) not documented for derivatives workflow.

---

## SECTION 2 — Session configuration

FIX version: FIX 4.4
Transport: TCP/TLS 1.2

Connection parameters:
TargetCompID: COIND
SenderCompID: [SubFirmID] + [SessionID] (e.g. ABC001)
Host: cde-fix.coinbase.com
Port: 443 (typical for TLS)
Sandbox: Y — cde-fix-sandbox.coinbase.com

Authentication: API Key + Passphrase
Logon tags: 553 (Username), 554 (Password), 50 (SenderSubID), 57 (TargetSubID)
ResetOnLogon (141): Supported.

Session management:
Heartbeat interval (108): 30 sec (default)
Missed heartbeat threshold: 2 missed = disconnect
Cancel-on-Disconnect: Y — Configurable via session policy
Message recovery: Supported — ResendRequest (35=2) is fully supported for sequence gaps.
Forced session reset: Weekly by exchange.

---

## SECTION 3 — Tier scorecard

### Tier 1 (Order Lifecycle): 36.1 / 55 pts [~]
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---------|---------|-------|--------|------------|---------------|---------
T1_D_000 | | NOS | [P] | 3.0 | 3.0 | Full message table for NOS documented.
T1_D_167 | 167 | SecurityType | [P] | 0.7 | 0.7 | Supports FUT and OPT values.
T1_8_000 | | ExecutionReport | [P] | 2.0 | 2.0 | Comprehensive ExecType list (0,F,H,L etc).

### Tier 2 (Execution Quality): 15.0 / 15 pts [P]
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---------|---------|-------|--------|------------|---------------|---------
T2_8_060 | 60 | TransactTime | [P] | 3.0 | 3.0 | Microsecond precision supported.
T2_8_031 | 31 | LastPx | [P] | 3.0 | 3.0 | Fill price provided on executions.

### Tier 3 (Post-trade/RFQ): 0.0 / 15 pts [X]
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---------|---------|-------|--------|------------|---------------|---------
T3_AE_000 | | TradeCaptureReport | [X] | 0.0 | 2.0 | Not supported; use 35=8 for fills.
T3_J_000 | | AllocationInstruction | [X] | 0.0 | 2.0 | Not supported.

### Tier 4 (AML/Travel Rule): 10.0 / 10 pts [P]
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---------|---------|-------|--------|------------|---------------|---------
T4_453 | 453 | Parties Group | [P] | 4.0 | 4.0 | Supports Executing Firm(1) and Client ID(3).
T4_017 | 17 | ExecID Uniqueness | [P] | 2.0 | 2.0 | Globally unique execution identifiers.

---

## SECTION 4 — Gap analysis & remediation

### T3_AE_000 — TradeCaptureReport (35=AE) — 2.0 pts lost
Status: Missing
Evidence: Institutional post-trade/RFQ message types not found in derivatives spec. RELIES ON 35=8.
Institutional impact: High. Lacks asynchronous consolidated trade reporting; firms must aggregate fills from individual order entry or drop copy sessions manually.
TradFi reference: Standard for clearing and large-scale reconciliation.
Recommended remediation: Implement 35=AE/AR flow for back-office consolidation.
Workaround: Use Drop Copy feed for consolidated fill tracking.
Effort: L > 1 month

---

## SECTION 5 — Custom tag dictionary

Tag # | Field Name | Data Type | Valid Values | Messages | Notes
------|------------|-----------|--------------|----------|------
7928 | SelfMatchPreventionID | String | [Client ID] | 35=D | Unique ID for SMP grouping.
8000 | SelfMatchPreventionStrategy | Char | N, O, Q | 35=D | N=Cancel Aggressor, O=Cancel Resting, Q=Both.

---

## SECTION 6 — Order types matrix

Order Type | FIX OrdType | Spot | Futures | Notes
-----------|-------------|------|---------|------
Market | 1 | N/A | [P] | Supported.
Limit | 2 | N/A | [P] | Supported.
Stop | 3 | N/A | [P] | Supports Stop Triggered status.
Iceberg | 1138 | N/A | [X] | Not documented.

---

## SECTION 9 — Drop Copy Infrastructure

Drop Copy evaluation (0–5 scale):
- Score: 5.0 / 5
- Status: Production Ready
- Scope: FIX execution stream across all firm sessions.

---

## SECTION 11 — Admin & Session Analysis

- Score: 9.6 / 15
- Status: High Reliability
- Key Strengths: Full **ResendRequest (35=2)** support for message recovery, allowing institutions to handle network gaps without full sequence resets.

Prepared by: Opound LLC — navilla.bagga@gmail.com
Version: 2.0.0 | Date: 2026-04-21
