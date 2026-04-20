# Rules of Engagement — Kraken FIX API
## Institutional readiness audit

Audit date: 2026-04-20
Auditor: Opound LLC — Navilla Bagga
Spec source: https://docs.kraken.com/api/docs/guides/fix-intro/
Asset classes: [spot, futures]

Overall score: 51 / 100 — Partial

Tier | Score | Available | %
-----|-------|-----------|---
1 Order lifecycle | 33.4 | 40 | 84%
2 Execution quality & TCA | 10 | 25 | 40%
3 Post-trade & allocation | 0 | 25 | 0%
4 AML & Travel Rule | 8 | 10 | 80%

Recommendation: Kraken's FIX API is suitable for simple order entry but lacks the post-trade and TCA instrumentation required for institutional-grade OMS integration. The primary blocker is the absence of TradeCaptureReport (35=AE) and Allocation messages. Priority fix: Implement Tag 453 (Parties) and support for AllocationInstruction (35=J).

Critical gaps (top 3 by points_lost):
- T2_8_029 | LastCapacity | 5.0 pts | Absence of Tag 29 prevents automated regulatory reporting of execution capacity.
- T2_8_030 | LastMkt | 4.0 pts | Lack of ISO MIC venue identification complicates multi-venue TCA.
- T3_AE_000 | TradeCaptureReport | 2.0 pts | Institutional trade reconciliation must be performed via rest, breaking FIX-native workflows.

---

## SECTION 2 — Session configuration

FIX version: FIX 4.4
Transport: TCP/TLS 1.2+

Connection parameters:
TargetCompID: Kraken (Standard) / KrakenPrime (Prime)
SenderCompID: [client-assigned]
Host: fix.kraken.com
Port: 443
Sandbox: N/A - Demo environment available upon request

Authentication: HMAC-SHA256 signature calculated from current timestamp and API Secret.
Logon tags: Tag 553 (Username/API Key), Tag 554 (Password/Signature), Tag 13416 (Nonce).
ResetOnLogon (141): Y — Session seq numbers reset at UTC 00:00.

Session management:
Heartbeat interval (108): 30 sec — configurable: N
Missed heartbeat threshold: 3 missed = disconnect
Cancel-on-Disconnect: Y — scope: Account-level or Session-level via Tag 8674.
Message recovery: ResendRequest (35=2) supported for current session only.
Forced session reset: Mandatory reset at UTC 00:00 daily.

---

## SECTION 3 — Tier scorecard

### Tier 1: Order Lifecycle (Score: 33.4/40)
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---|---|---|---|---|---|---
T1_D_000 | null | NewOrderSingle | [P] Full | 3.0 | 3.0 | NOS fully documented.
T1_D_011 | 11 | ClOrdID | [P] Full | 0.7 | 0.7 | Tag 11 is required.
T1_D_055 | 55 | Symbol | [P] Full | 0.7 | 0.7 | Tag 55 used for instrument.
T1_D_167 | 167 | SecurityType | [X] Missing | 0.0 | 0.7 | Tag 167 not documentation.
T1_G_000 | null | OrderCancelReplaceRequest | [P] Full | 2.0 | 2.0 | Supported on Spot.

### Tier 2: Execution Quality & TCA (Score: 10/25)
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---|---|---|---|---|---|---
T2_8_029 | 29 | LastCapacity | [X] Missing | 0.0 | 5.0 | Tag 29 not documented.
T2_8_060 | 60 | TransactTime | [~] Partial | 1.5 | 3.0 | Millisecond precision instead of microsecond.
T2_8_851 | 851 | LastLiquidityInd | [~] Partial | 1.5 | 3.0 | Uses custom Tag 5050.

### Tier 3: Post-Trade & Allocation (Score: 0/25)
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---|---|---|---|---|---|---
T3_AE_000 | null | TradeCaptureReport | [X] Missing | 0.0 | 2.0 | Not supported in FIX.
T3_J_000 | null | AllocationInstruction | [X] Missing | 0.0 | 2.0 | Not supported in FIX.

### Tier 4: AML & Travel Rule (Score: 8/10)
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---|---|---|---|---|---|---
T4_453 | 453 | Parties Group | [P] Full | 4.0 | 4.0 | Documented in Kraken Prime NOS FIX.
T4_WAL | null | Wallet Attribution | [X] Missing | 0.0 | 2.0 | No documented mechanism.
T4_017 | 17 | ExecID Uniqueness | [P] Full | 2.0 | 2.0 | Globally unique.

---

## SECTION 4 — Gap analysis & remediation

### T2_8_029 — LastCapacity (tag 29) — 5.0 pts lost
Status: Missing
Evidence: Not documented
Institutional impact: Essential for MiFID II and CFTC recordkeeping. Without Tag 29, the OMS cannot automatically verify if an execution was processed as Agency or Principal.
TradFi reference: ISO 15022 / FIX 4.4 Standard.
Recommended remediation: Populate Tag 29 in ExecutionReport (35=8) with valid values: 1=Agent, 3=Principal.
Workaround: No FIX-native workaround.
Effort: M 1-4 weeks

### T3_AE_000 — TradeCaptureReport (35=AE) — 2.0 pts lost
Status: Missing
Evidence: Not documented
Institutional impact: Direct market access (DMA) requires real-time trade capture to bypass execution-only report delays.
TradFi reference: FIX EP211.
Recommended remediation: Implement TradeCaptureReport to echo all execution details for EOD reconciliation.
Workaround: Use REST /trades endpoint.
Effort: L > 1 month

---

## SECTION 5 — Custom tag dictionary

Tag # | Field Name | Data Type | Valid Values | Messages | Notes
---|---|---|---|---|---
5050 | LastLiquidityInd | Char | m=Maker, t=Taker | 35=8 | Non-standard alternative to Tag 851.
8674 | ExpireTime | Int | Seconds | 35=A | Used for session-level Cancel-on-Disconnect.
13416 | Nonce | String | Unique number | 35=A | Required for secure authentication.

---

## SECTION 6 — Order types matrix

Order Type | FIX OrdType | Spot | Futures | Perps | Options | Notes
---|---|---|---|---|---|---
Market | 1 | [P] | [P] | [P] | [X] | Standard support.
Limit | 2 | [P] | [P] | [P] | [X] | Standard support.
Stop | 3 | [P] | [P] | [P] | [X] | Spot only for advanced triggers.
StopLimit | 4 | [P] | [P] | [P] | [X] | 
Iceberg | 1138 | [P] | [X] | [X] | [X] | Tag 1138 DisplayQty.

TIF table: GTC(1), IOC(3), FOK(4), GTD(6) — Supported on all asset classes (Spot/Futures).

---

## SECTION 7 — UAT checklist

UAT environment: demo-fix.kraken.com:443

Phase 1 — Session: Logon with HMAC, heartbeat echo, COD trigger test.
Phase 2 — Order lifecycle: NOS with Tag 11 uniqueness, side validation.
Phase 3 — Modify/cancel: Cancel by OrigClOrdID, verify rejection Tag 58.
Phase 4 — Execution quality: Verify Tag 5050 maker/taker flags, timestamp ms precision.
Phase 5 — Recovery: Sequence jump test using ResendRequest.
Phase 6 — Allocation: Verify Tag 453 on Prime accounts.

Prepared by: Opound LLC — navilla.bagga@gmail.com
Version: 1.0 | Date: 2026-04-20
