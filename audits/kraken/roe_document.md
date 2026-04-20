# Rules of Engagement — Kraken FIX API
## Institutional readiness audit

Audit date: 2026-04-20
Auditor: Opound LLC — Navilla Bagga
Spec source: https://docs.kraken.com/api/docs/guides/fix-intro/
Asset classes: [spot, futures]

Overall score: 53 / 100 — Partial

| Tier | Score | Available | % |
| :--- | :--- | :--- | :--- |
| **1 Order lifecycle** | 33.4 | 40 | 84% |
| **2 Execution quality & TCA** | 11.5 | 25 | 46% |
| **3 Post-trade & allocation** | 0.0 | 25 | 0% |
| **4 AML & Travel Rule** | 8.0 | 10 | 80% |

**Informational Tiers:**
- **5 DAWG Extensions**: 0 checks present
- **6 Drop Copy readiness**: 0.5 / 10 (Not ready — session-level only)
- **7 Market Data**: 10 / 10 (Institutional ready)
- **8 Admin & Session**: 8.6 / 10 (High reliability)

### Recommendation
Kraken provides a highly reliable baseline for market discovery and session stability, but significant gaps remain in post-trade transparency (LastCapacity/LastMkt) and allocation routing. While "Partial", Kraken is ready for institutional market making and price discovery, though the lack of native FIX RFQ/Allocation limits its use for multi-account investment management without REST-based sidecars.

### Critical Gaps (Top 3)
- **T2_8_029** | LastCapacity | 5.0 pts | Execution reporting lacks capacity (Agent/Principal) transparency.
- **T2_8_030** | LastMkt | 4.0 pts | Missing execution venue identifier for multi-asset routing.
- **T2_8_528** | OrderCapacity | 4.0 pts | Regulatory capacity not captured on order entry.

---

## SECTION 2 — Session configuration

FIX version: 4.4
Transport: TCP/TLS 1.2+

**Connection parameters:**
- **TargetCompID**: KRAKEN-TRD (Trading) or KRAKEN-MD (Market Data)
- **SenderCompID**: [Client assigned]
- **Host**: fix-trd.kraken.com (Example)
- **Port**: 443
- **Sandbox**: Y — fix-trd-demo.kraken.com

**Authentication:** 
- HMAC-SHA512 based signature passed in tag 554 (Password).
- Logon tags: 553 (Username), 554 (Password), 5025 (Nonce - required).
- ResetSeqNumFlag (141): Supported (Y/N).

**Session management:**
- **Heartbeat interval (108)**: 60 sec (Recommended).
- **Cancel-on-Disconnect**: Y (Supported via custom tag 8674).
- **Message recovery**: Supported via ResendRequest (35=2). Recovery window not explicitly stated.

---

## SECTION 3 — Tier scorecard

### Tier 1 (Order Lifecycle): 33.4 / 40 pts
| Check ID | Tag | Field | Status | Pts | Max | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| T1_D_000 | 35=D | NOS | [P] | 3.0 | 3.0 | NOS fully documented for Spot and Prime. |
| T1_8_000 | 35=8 | ER | [P] | 3.0 | 3.0 | ER primary feedback mechanism. |
| T1_F_000 | 35=F | Cancel | [P] | 2.5 | 2.5 | Supported. |
| T1_G_000 | 35=G | Replace | [P] | 2.5 | 2.5 | Supported on Spot accounts. |
| ... | ... | ... | ... | ... | ... | ... |

### Tier 7 (Market Data): 10 / 10 pts
| Check ID | Tag | Field | Status | Pts | Max | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| T7_V_000 | 35=V | Request | [P] | 0.75 | 0.75 | 35=V documented in SLR-FIX spec. |
| T7_W_000 | 35=W | Snapshot | [P] | 1.0 | 1.0 | 35=W supported. |
| T7_X_000 | 35=X | Incremental | [P] | 1.0 | 1.0 | 35=X supported for book updates. |
| T7_x_000 | 35=x | SecList | [P] | 0.5 | 0.5 | InstrumentListRequest supported. |

### Tier 8 (Admin & Session): 8.6 / 10 pts
| Check ID | Tag | Field | Status | Pts | Max | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| T8_A_000 | 35=A | Logon | [P] | 1.0 | 1.0 | HMAC-512 auth documented. |
| T8_HB_COD | 8674 | COD | [P] | 0.5 | 0.5 | Custom tag 8674 documented. |
| T8_RR_000 | 35=2 | Resend | [P] | 0.75 | 0.75 | 35=2 documented. |

---

## SECTION 4 — Gap analysis & remediation

### T2_8_029 — LastCapacity (tag 29) — 5.0 pts lost
**Status**: Missing
**Evidence**: Tag 29 not documented in response messages.
**Institutional impact**: Execution reporting lacks capacity (Agent/Principal) transparency.
**TradFi reference**: Required for regulatory reporting (MiFID II / CAT).
**Remediation**: Implement Tag 29 in ExecutionReport (35=8) to indicate whether the exchange filled the order as principal or agent.

### T7_X_278 — MDEntryID (tag 278) — 0.4 pts lost
**Status**: Missing
**Evidence**: Order-level (L3) MDEntryID not documented for FIX incremental refreshes.
**Institutional impact**: Limits ability to track specific orders in the book for algo execution.
**Remediation**: Surface unique MDEntryIDs in 35=X messages to support full L3 book building.

---

## SECTION 5 — Custom tag dictionary
| Tag # | Field Name | Data Type | Valid Values | Messages | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 8674 | CancelOrdersOnDisconnect | int | 0=Cancel, 1=Keep | 35=A/0 | Critical risk control. |
| 5025 | Nonce | string | Unique timestamp | 35=A | Anti-replay authentication. |
| 5050 | MakerTaker | char | M=Maker, T=Taker | 35=8 | Alternative to Tag 851. |
| 5001 | Leverage | float | 1-5 | 35=D | Marginal trading metadata. |

---

## SECTION 6 — Order types matrix
| Order Type | FIX OrdType | Spot | Futures | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Market | 1 | [P] | [P] | |
| Limit | 2 | [P] | [P] | |
| Stop | 3 | [P] | [P] | |
| Stop Limit | 4 | [P] | [P] | |
| Take Profit | R | [P] | [P] | Custom Kraken extension. |
| Trailing Stop | U | [P] | [P] | Custom Kraken extension. |

---

## SECTION 7 — UAT checklist
**Phase 1 — Session**: Logon with HMAC signature, Nonce validation, COD toggle test.
**Phase 2 — Order lifecycle**: NOS with Take Profit extensions, Partial fill verification via Tag 32/31.
**Phase 3 — Modify/cancel**: Amend price/qty (Spot only), Mass cancel by Symbol.
**Phase 4 — Market Data**: Snapshot reconciliation with Incremental refreshes, InstrumentList sync.

---

## SECTION 8 — DAWG Extensions (Informational)
Kraken does not currently implement DAWG (Digital Asset Working Group) ratified extensions like ISO 24165 DTIs or standard Wallet ID sub-groups. Routing is handled via the standard Parties group (453) in Kraken Prime.

---

## SECTION 9 — Drop Copy Analysis
**Score**: 0.5 / 10
**Status**: Absent (Session-level only)
Kraken does not provide a dedicated Drop Copy session type. Institutional clients receive execution reports on the order-entry session. While functionally equivalent for basic tracking, it prevents a "Golden Copy" feed from a separate infrastructure layer favored by compliance systems.

---

## SECTION 10 — Market Data Analysis
Evaluation of FIX book-building (L2) and order-by-order (L3) capabilities.
- **Score**: 10 / 10
- **Status**: Production Ready
Kraken's market data feed is robust, supporting full snapshots and efficient incremental refreshes. Reference data is easily discovered via Security List (35=x).

---

## SECTION 11 — Admin & Session Analysis
Baseline FIX connectivity and risk control assessment (Cancel-on-Disconnect).
- **Score**: 8.6 / 10
- **Status**: High Reliability
Kraken implements a secure, signature-based logon process with mandatory anti-replay protection (Nonce). Cancel-on-Disconnect is fully supported via custom tagging, providing a strong risk baseline for institutional traders.

Prepared by: Opound LLC — navilla.bagga@gmail.com
Version: 2.0.0 | Date: 2026-04-20
