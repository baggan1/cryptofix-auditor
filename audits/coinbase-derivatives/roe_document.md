# Rules of Engagement — Coinbase Derivatives Exchange FIX API
## Institutional readiness audit

Audit date: 2026-04-17
Auditor: Opound LLC — Navilla Bagga
Spec source: docs.cdp.coinbase.com/derivatives/fix/*
Asset classes: futures, options

### Regulatory Framework
This is a CFTC-regulated Designated Contract Market (DCM). This regulatory structure informs many of the specific FIX 4.4 tag requirements and institutional workflows (such as CTICode inclusion and firm onboarding requirements rather than self-serve). Firm onboarding is required (not self-serve).

Overall score: 64 / 100 — Partial

Tier | Score | Available | %
-----|-------|-----------|---
1 Order lifecycle | 30.5 | 35 | 87%
2 Execution quality & TCA | 14.5 | 25 | 58%
3 Post-trade & allocation | 10.5 | 25 | 42%
4 AML & Travel Rule | 8.5 | 15 | 57%

Recommendation:
Coinbase Derivatives Exchange provides a TradFi-standard FIX 4.4 implementation natively suited for CFTC-regulated markets. It supports institutional requirements reasonably well. Notable positives are full SelfTradePrevention and partial OrderCapacity mappings. However, there are still some fragmentation issues in block allocations and complete post-trade TCA data.

Critical gaps (top 3 by points_lost):
- T2_002 | LastMkt / Execution Venue | 5 pts
- T3_002 | AllocationInstruction | 5 pts
- T3_004 | SettlType | 4 pts

---

## SECTION 2 — Session configuration

FIX version: FIX 4.4
Transport: TCP/TLS 1.2+

Connection parameters:
TargetCompID: CoinbaseDerivatives
SenderCompID: [client-assigned]

---

## SECTION 3 — Tier scorecard
(Refer to scored_report.json for exact check status and evidence)

## SECTION 4 — DAWG Digital Asset FIX Extensions — Forward-Looking Assessment

These extend standard TradFi logic into the DAWG space.
