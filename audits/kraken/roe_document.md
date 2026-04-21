# Rules of Engagement — Kraken FIX API
## Institutional readiness audit

Audit date: 2026-04-20
Auditor: Opound LLC — Navilla Bagga
Spec source: https://docs.kraken.com/api/docs/category/fix-api
Asset classes: [spot, futures]

Overall score: 72.1 / 100 — Near-institutional

Tier | Score | Available | %
-----|-------|-----------|---
1 Order lifecycle | 35.1 | 55 | 64%
2 Execution quality & TCA | 15.0 | 15 | 100%
3 Post-trade & allocation | 12.1 | 15 | 81%
8 Admin & Session | 9.9 | 15 | 66%

Informational Tiers:
5 DAWG Extensions | 0 checks present
6 Drop Copy readiness | 0.0 / 5
7 Market Data | 2.8 / 5

Recommendation: Kraken's FIX 4.4 implementation is robust and supports standard institutional workflows for Spot. The Futures gateway lacks Order Cancel/Replace (35=G), which may require OMS-side logic for Cancel-Replace imitation. Cancel-on-Disconnect (Tag 9001) is a strong institutional feature.

Critical gaps (top 3 by points_lost):
- T4_453 | Parties Group | 4.0 pts | Parties group (453) missing from execution messages prevents side-level attribution.
- T2_8_375 | ContraTrader | 2.0 pts | Missing contra-party identifier prevents full audit trail and TCA.
- T3_J_000 | AllocationInstruction | 2.0 pts | Lack of 35=J support forces external allocation workflows.

---

## SECTION 2 — Session configuration

FIX version: FIX 4.4
Transport: TCP/TLS 1.2+

Connection parameters:
TargetCompID: Kraken (Spot), KrakenFutures (Futures)
SenderCompID: [client-assigned API key]
Host: fix.kraken.com (Spot), fix-futures.kraken.com (Futures)
Port: 443
Sandbox: NO (UAT available via separate request)

Authentication: API Key + RSA signature or HMAC
Logon tags: 98 (EncryptMethod), 553 (Username), 554 (Password)
ResetOnLogon (141): Supported (Y/N)

Session management:
Heartbeat interval (108): 30 sec (default)
Missed heartbeat threshold: 3 missed = disconnect
Cancel-on-Disconnect: YES — scope: session (Tag 9001 in Logon)
Message recovery: Supported via ResendRequest (35=2)
Forced session reset: NO — 24/7 session supported.

---

## SECTION 3 — Tier scorecard

Tier 1 (Order Lifecycle): 35.1 / 55
- [P] 35=D NOS | Full credit | Documented for all asset classes.
- [~] 35=G Replace | Partial credit | Spot only.

Tier 2 (Execution Quality): 15.0 / 15
- [P] 29 LastCapacity | Full credit | Agency/Principal supported.
- [~] 851 LastLiquidityInd | Partial credit | Custom tag 5050 used.

Tier 3 (Post-trade/RFQ): 12.1 / 15
- [P] 35=AE TCR | Full credit | Links to fill ExecID.
- [X] 35=J Alloc | Missing | Not supported.

---

## SECTION 4 — Gap analysis & remediation

### T1_G_000 — Order Cancel/Replace Request (tag 35=G) — 1.0 pts lost
Status: Partial
Evidence: Replace (35=G) is only supported on the Spot gateway.
Institutional impact: High for algo desks. Forces a 'Cancel-then-New' pattern on Futures which loses order priority.
Recommended remediation: Standardize 35=G across Spot and Futures gateways.
Workaround: Cancel + New Order.
Effort: L

---

## SECTION 5 — Custom tag dictionary

Tag # | Field Name | Data Type | Valid Values | Messages | Notes
------|------------|-----------|--------------|----------|-------
5050 | LiquidityInd | int | 1=Maker, 2=Taker | 35=8 | Maps to standard tag 851.
9001 | CancelOnDisconnect | char | Y, N | 35=A | Enables CoD for the session.

---

## SECTION 6 — Order types matrix

Order Type | FIX OrdType | Spot | Futures
-----------|-------------|------|--------
Market | 1 | [P] | [P]
Limit | 2 | [P] | [P]
Stop | 3 | [P] | [P]
Stop Limit | 4 | [P] | [P]

TIF table: GTC(1), IOC(3), FOK(4).

---

## SECTION 8 — DAWG Extensions (Informational)
- ISO 24165 DTI: No credit.
- CurrencyCodeSource: No credit.
- DIGITAL security type: No credit.

---

## SECTION 9 — Drop Copy Infrastructure

Drop Copy evaluation: 0.0 / 5
Status: Absent
Kraken does not provide a dedicated Drop Copy session type. Risk and compliance systems must receive ExecReports over the primary trading session.

---

## SECTION 10 — Market Data Analysis

Market Data evaluation: 2.8 / 5
Status: Partial
Supports 35=V (Request), 35=W (Snapshot), and 35=X (Incremental) for L2 book updates. L3 order-level data is limited.

---

## SECTION 11 — Admin & Session Analysis

Admin & Session evaluation: 9.9 / 15
Status: High Reliability
Cancel-on-Disconnect (Tag 9001) and standard FIX 4.4 session management provide a stable foundation for institutional connectivity.

Prepared by: Opound LLC — navilla.bagga@gmail.com
Version: 2.0.0 | Date: 2026-04-20
