# Rules of Engagement — Coinbase Exchange FIX API
## Institutional readiness audit

Audit date: 2026-04-21
Auditor: Opound LLC — Navilla Bagga
Spec source: multi-url
Asset classes: [spot]

Overall score: 60 / 100 — Partial

Tier | Score | Available | %
-----|-------|-----------|---
1 Order lifecycle | 36.1 | 55 | 66%
2 Execution quality & TCA | 15.0 | 15 | 100%
3 Post-trade & allocation | 0.0 | 15 | 0%
4 AML & Travel Rule | 2.0 | 10 | 20%

Informational Tiers:
5 DAWG Extensions | 0 checks present
6 Drop Copy readiness | 5.0 / 5
7 Market Data | 5.0 / 5
8 Admin & Session | 8.5 / 15

Recommendation: Coinbase Exchange provides a high-performance FIX 5.0 interface suitable for low-latency execution and real-time market data, but lacks institutional post-trade (Tiers 3/4) and recovery (Tier 8) features. The primary blocker is the lack of ResendRequest support and native Trade Capture Reports, necessitating custom reconciliation logic via REST APIs.

Critical gaps (top 3 by points_lost):
- T4_453 | Parties Group | 4.0 pts | No AML/Party identification (tag 448/452) documented in FIX application layer.
- T3_AE_000 | TradeCaptureReport | 2.0 pts | Post-trade reconciliation messages (35=AE) missing; fills must be tracked via ExecutionReports.
- T3_J_000 | AllocationInstruction | 2.0 pts | No native FIX support for trade allocation (35=J) or multi-account splitting.

---

## SECTION 2 — Session configuration

FIX version: FIX 5.0 SP2 (FIXT 1.1 session layer)
Transport: TCP/TLS 1.2 [Production requirement]

Connection parameters:
TargetCompID: COINBASE
SenderCompID: [Client-assigned API Key]
Host: fix.exchange.coinbase.com
Port: 6121 (Order Entry), 6122 (Drop Copy)
Sandbox: Y — fix-public.sandbox.exchange.coinbase.com

Authentication: API key + Passphrase (signed via HMAC-SHA256 in tag 96)
Logon tags: 553 (Username/API Key), 96 (RawData/Signature), 554 (Password/Passphrase)
ResetOnLogon (141): Y — Mandatory. Every logon starts with SeqNum 1.

Session management:
Heartbeat interval (108): 30 sec — Configurable (recommended range 15-60)
Missed heartbeat threshold: 2 missed = disconnect
Cancel-on-Disconnect: Y — Session-level configuration (default: True)
Message recovery: Not supported — ResendRequest (35=2) is explicitly blocked. Gaps require a full session reset.
Forced session reset: Weekly Saturday maintenance at 1:00 PM ET.

---

## SECTION 3 — Tier scorecard

### Tier 1 (Order Lifecycle): 36.1 / 55 pts [~]
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---------|---------|-------|--------|------------|---------------|---------
T1_D_000 | | NOS | [P] | 3.0 | 3.0 | Supported as per FIX 5.0 spec.
T1_D_011 | 11 | ClOrdID | [P] | 0.7 | 0.7 | Tag 11 documented in 35=D.
T1_D_055 | 55 | Symbol | [P] | 0.7 | 0.7 | Tag 55 documented in 35=D.
T1_8_000 | | ExecutionReport | [P] | 2.0 | 2.0 | Primary message for fill/state reporting.
T1_Q_000 | | DontKnowTrade | [X] | 0.0 | 1.5 | Message 35=Q not found in spec.

### Tier 2 (Execution Quality): 15.0 / 15 pts [P]
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---------|---------|-------|--------|------------|---------------|---------
T2_8_031 | 31 | LastPx | [P] | 3.0 | 3.0 | Fill price provided on executions.
T2_8_032 | 32 | LastQty | [P] | 3.0 | 3.0 | Fill quantity provided on executions.
T2_8_851 | 851 | LastLiquidityInd | [~] | 1.5 | 3.0 | Uses custom tag 1057 (AggressorIndicator) as functional equivalent.

### Tier 3 (Post-trade/RFQ): 0.5 / 15 pts [X]
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---------|---------|-------|--------|------------|---------------|---------
T3_AE_000 | | TradeCaptureReport | [X] | 0.0 | 2.0 | Not supported in FIX layer.
T3_J_000 | | AllocationInstruction | [X] | 0.0 | 2.0 | Not supported in FIX layer.

### Tier 4 (AML/Travel Rule): 2.0 / 10 pts [X]
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---------|---------|-------|--------|------------|---------------|---------
T4_453 | 453 | Parties Group | [X] | 0.0 | 4.0 | No party identification documented.
T4_017 | 17 | ExecID Uniqueness | [P] | 2.0 | 2.0 | UUID-based unique execution IDs.

### Tier 6 (Drop Copy): 5.0 / 5 pts [P] / Separate Score: 10/10
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---------|---------|-------|--------|------------|---------------|---------
T6_DC_000 | | Logon (Drop Copy) | [P] | 1.5 | 1.5 | Dedicated port 6122 for DC session.
T6_DC_9406| 9406| DropCopyFlag | [P] | 0.5 | 0.5 | Custom tag establishes DC session.

---

## SECTION 4 — Gap analysis & remediation

### T8_RR_000 — ResendRequest (35=2) — 0.8 pts lost
Status: Missing
Evidence: Resend Requests (35=2) not supported on Coinbase FIX 5.0.
Institutional impact: High risk during message gaps. Institutions cannot recover dropped execution reports without a full session reset, leading to potential out-of-sync states between the exchange and the firm's OMS.
TradFi reference: ResendRequest is a fundamental session recovery mechanism in the FIX protocol standard.
Recommended remediation: Implement standard FIX 35=2 support with a minimum 24-hour recovery window.
Workaround: Use REST `/fills` or `/orders` endpoints to reconcile state after a disconnect.
Effort: L > 1 month

### T4_453 — Parties Group (tag 453) — 4.0 pts lost
Status: Missing
Evidence: No AML/Party identification documented in FIX 5.0 spec.
Institutional impact: Compliance blocker for regulated entities. Prevents passing required sub-account or beneficial owner information during the trade lifecycle.
TradFi reference: Required for MiFID II and CFTC reporting.
Recommended remediation: Support NoPartyIDs(453) repeating group in NOS and ER messages.
Workaround: Map accounts at the API Key level in the Coinbase UI.
Effort: M 1-4 weeks

---

## SECTION 5 — Custom tag dictionary

Tag # | Field Name | Data Type | Valid Values | Messages | Notes
------|------------|-----------|--------------|----------|------
1057 | AggressorIndicator | Boolean | Y, N | 35=8 | Y=Taker, N=Maker. Functional equivalent of tag 851.
9406 | DropCopyFlag | Boolean | Y, N | 35=A | Used to signal a Drop Copy session in Logon.
1682 | MDSecurityTradingStatus | String | trading_disabled, etc. | 35=h | Coinbase-specific status field.

---

## SECTION 6 — Order types matrix

Order Type | FIX OrdType | Spot | Futures | Notes
-----------|-------------|------|---------|------
Market | 1 | [P] | N/A | Supported.
Limit | 2 | [P] | N/A | Supported.
Stop | 3 | [P] | N/A | Supported via TPSL extensions.
StopLimit | 4 | [P] | N/A | Supported via TPSL extensions.
Iceberg | 1138 | [X] | N/A | Not documented.

TIF table:
- GTC (1): Supported [P]
- IOC (3): Supported [P]
- FOK (4): Supported [P]
- GTD (6): Supported [P]

---

## SECTION 7 — UAT checklist

UAT environment: fix-public.sandbox.exchange.coinbase.com:6121

Phase 1 — Session: Logon with HMAC-SHA256, verify ResetSeqNumFlag(141)=Y behavior.
Phase 2 — Order lifecycle: Verify basic NOS (35=D) and ER (35=8) flows for Limit orders.
Phase 3 — Modify/cancel: Test OrderCancelReplaceRequest (35=G) for price/qty updates.
Phase 4 — Execution quality: Validate AggressorIndicator(1057) fills for maker/taker logic.
Phase 5 — Recovery: Test session forced disconnect; verify SeqNum reset to 1 on reconnect.

Sign-off: Phases 1-3 required. Phase 5 requires custom OMS logic due to lack of ResendRequest.

---

## SECTION 9 — Drop Copy Infrastructure

Drop Copy evaluation (0–5 scale):
- Score: 5.0 / 5
- Status: Production Ready
- Dedicated session: Y (Port 6122)
- Scope coverage: All Channels (FIX, REST, UI)

---

## SECTION 10 — Market Data Analysis

- Score: 5.0 / 5
- Status: Production Ready
- Feed types: Order-by-order (L3) via 35=X, Book-build via 35=W.

---

## SECTION 11 — Admin & Session Analysis

- Score: 8.5 / 15
- Status: Medium Reliability
- Key Gaps: Lack of ResendRequest (35=2) and hard mandatory reset on every logon.

Prepared by: Opound LLC — navilla.bagga@gmail.com
Version: 2.0.0 | Date: 2026-04-21
