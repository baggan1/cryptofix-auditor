# RoE document template

Produce `audits/SLUG/roe_document.md` using these 11 sections exactly.
Replace all [bracketed] placeholders with real data from the scored_report
and extraction_result files. Be direct — never soften real gaps.

---

## SECTION 1 — Executive summary

```
# Rules of Engagement — EXCHANGE_NAME FIX API
## Institutional readiness audit

Audit date: [scored_report.audit_date]
Auditor: Opound LLC — Navilla Bagga
Spec source: [extraction_result.spec_source]
Asset classes: [extraction_result.asset_classes_audited]

Overall score: [XX] / 100 — [Grade]

Tier | Score | Available | %
-----|-------|-----------|---
1 Order lifecycle | XX | 40 | XX%
2 Execution quality & TCA | XX | 25 | XX%
3 Post-trade & allocation | XX | 25 | XX%
4 AML & Travel Rule | XX | 10 | XX%

Informational Tiers:
5 DAWG Extensions | [Tier 5 present count] checks present
6 Drop Copy readiness | [XX] / 10
7 Market Data | [XX] / 10
8 Admin & Session | [XX] / 10

Recommendation: [1-2 sentences. Is this exchange ready for direct institutional
OMS connectivity? What are the primary blockers? What is the priority fix?]

Critical gaps (top 3 by points_lost):
- [check_id] | [field_name] | [points_lost] pts | [one-line impact]
- [check_id] | [field_name] | [points_lost] pts | [one-line impact]
- [check_id] | [field_name] | [points_lost] pts | [one-line impact]
```

---

## SECTION 2 — Session configuration

```
FIX version: [from spec]
Transport: TCP/TLS [version — flag if < TLS 1.2]

Connection parameters:
TargetCompID: [from spec]
SenderCompID: [client-assigned]
Host: [from spec]
Port: [from spec]
Sandbox: [Y/N — hostname if available]

Authentication: [HMAC-SHA256 / Ed25519 / API key+passphrase]
Logon tags: [tag 553/554/96 etc — from spec]
ResetOnLogon (141): [Y/N — document behavior]

Session management:
Heartbeat interval (108): [X sec] — configurable? [Y/N]
Missed heartbeat threshold: [X missed = disconnect]
Cancel-on-Disconnect: [Y/N] — scope: [session/account]
Message recovery: [X hours via ResendRequest 35=2, or "Not supported"]
Forced session reset: [schedule if applicable]

[Mark any undocumented parameter: NOT DOCUMENTED — verify before production]
```

---

## SECTION 3 — Tier scorecard

For each tier, produce a table of all checks with columns:
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence

Status icons: [P] Full credit / [~] Partial / [X] Missing

Tier 1 (Order Lifecycle): 40 pts
Tier 2 (Execution Quality): 25 pts
Tier 3 (Post-trade/RFQ): 25 pts
Tier 4 (AML/Travel Rule): 10 pts
Tier 5 (DAWG Extensions): Informational
Tier 6 (Drop Copy): 10 pts / Separate Score
Tier 7 (Market Data): 10 pts / Separate Score
Tier 8 (Admin/Session): 10 pts / Separate Score

---

## SECTION 4 — Gap analysis & remediation

For each check where status != full_credit, ordered by points_lost descending:

```
### [check_id] — [field_name] (tag [fix_tag]) — [points_lost] pts lost

Status: [Partial / Missing]
Evidence: [evidence string or "Not documented"]
Asset class limitation: [if any]

Institutional impact:
[Use institutional_gap_if_missing from rubric. Adapt to this exchange.]

TradFi reference: [Use tradfi_reference from rubric]

Recommended remediation:
[Specific steps. Include tag number, expected values, message context.]

Workaround: [REST/WebSocket alternative, or "No FIX-native workaround."]

Effort: [S < 1 week / M 1-4 weeks / L > 1 month]
```

---

## SECTION 5 — Custom tag dictionary

Table of all non-standard tags (numbers > 5000) found in the spec:
Tag # | Field Name | Data Type | Valid Values | Messages | Notes

If none found: "No custom tags — standard FIX tags only."

---

## SECTION 6 — Order types matrix

Table: Order Type | FIX OrdType | Spot | Futures | Perps | Options | Notes

Order types to check: Market(1), Limit(2), Stop(3), StopLimit(4),
TakeProfit(R), TakeProfitLimit(T), TrailingStop(U), TrailingStopLimit(V),
Iceberg(tag 1138)

TIF table: GTC(1), IOC(3), FOK(4), GTD(6), Day(0) — by asset class

Use: [P] Present / [~] Partial / [X] Not documented / N/A

---

## SECTION 7 — UAT checklist

UAT environment: [hostname, port, credentials process from spec]

Phase 1 — Session: Logon, heartbeat, TestRequest echo, clean logout,
reconnect sequence resume, Cancel-on-Disconnect trigger test

Phase 2 — Order lifecycle: Market NOS, Limit NOS, IOC, FOK, GTD,
Iceberg, SelfTradePrevention modes

Phase 3 — Modify/cancel: Amend price, amend qty, cancel by ClOrdID,
cancel by OrigClOrdID, cancel reject (tag 58 reason), mass cancel

Phase 4 — Execution quality: Partial fill fields (31/32/14/151),
TransactTime precision, LastLiquidityInd (851), LastCapacity (29),
ExecID uniqueness across sessions

Phase 5 — Recovery: ResendRequest gap-fill, reconnect mid-fill,
OrderStatusRequest (35=H)

Phase 6 — Allocation (if applicable): NoAllocs/AllocAccount routing,
sub-account isolation

Sign-off: Phases 1-3 and 5 required before go-live.
Phase 4 gaps flagged as known — remediation timeline TBD with exchange.

---

## SECTION 8 — DAWG Extensions (Informational)

Assess specific support for DAWG standardized FIX tags:
- ISO 24165 DTI (SecurityIDSource=Y)
- CurrencyCodeSource (tag 2897)
- DIGITAL security type (167=DIGITAL)
- Wallet PartySubID (803)

[Detailed evidence for each T5 check from scored_report]

---

## SECTION 9 — Drop Copy Infrastructure

Drop Copy evaluation (0–10 scale):
- Score: [XX] / 10
- Status: [Production Ready / Partial / Absent]

Dedicated session: [Y/N - endpoint info]
Scope coverage: [FIX Only / All Channels / Undocumented]

Checks:
[Table of T6_DC checks with evidence]

---

## SECTION 10 — Market Data Analysis

Evaluation of FIX book-building (L2) and order-by-order (L3) capabilities.

- Score: [XX] / 10
- Status: [Production Ready / Partial / Basic]

[Table of T7_ Market Data checks with evidence]

---

## SECTION 11 — Admin & Session Analysis

Baseline FIX connectivity and risk control assessment (Cancel-on-Disconnect).

- Score: [XX] / 10
- Status: [High Reliability / Medium / Low]

[Table of T8_ Admin/Session checks with evidence]

Prepared by: Opound LLC — navilla.bagga@gmail.com
Version: 2.0.0 | Date: [audit_date]
