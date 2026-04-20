# Rules of Engagement — Coinbase Exchange FIX API
## Institutional readiness audit

Audit date: 2026-04-20
Auditor: Opound LLC — Navilla Bagga
Spec source: multi-url: connectivity, order-entry-messages5, drop-copy, tpsl-orders, market-data
Asset classes: [spot]

Overall score: 49 / 100 — Basic

| Tier | Score | Available | % |
| :--- | :--- | :--- | :--- |
| **1 Order lifecycle** | 33.4 | 40 | 84% |
| **2 Execution quality & TCA** | 11.5 | 25 | 46% |
| **3 Post-trade & allocation** | 0.0 | 25 | 0% |
| **4 AML & Travel Rule** | 4.0 | 10 | 40% |

**Informational Tiers:**
- **5 DAWG Extensions**: 0 checks present
- **6 Drop Copy readiness**: 10.5 / 11 (Institutional ready)
- **7 Market Data**: 10 / 10 (Institutional ready)
- **8 Admin & Session**: 8.3 / 10 (High reliability)

### Recommendation
Coinbase Exchange provides some of the most robust infrastructure endpoints in crypto (dedicated Drop Copy, L3 order-by-order Market Data) but suffers from high "TradFi Gaps" in execution transparency. The lack of standard fields like `LastCapacity (29)` and `LastMkt (30)` makes automated TCA and regulatory reporting more difficult. However, for HFT and market markers requiring raw book access and session stability, Coinbase is "Production Ready" at the infrastructure layer.

### Critical Gaps (Top 3)
- **T2_8_029** | LastCapacity | 5.0 pts | Missing agent/principal transparency on fills.
- **T2_8_030** | LastMkt | 4.0 pts | Missing execution venue MIC code (critical for multi-venue TCA).
- **T2_8_528** | OrderCapacity | 4.0 pts | Missing regulatory capacity on order entry.

---

## SECTION 2 — Session configuration

FIX version: 5.0 SP2 (FIXT 1.1 session layer)
Transport: TCP/TLS 1.2+

**Connection parameters:**
- **TargetCompID**: COINBASE (Example)
- **SenderCompID**: [Client assigned]
- **Host**: fix.exchange.coinbase.com (Trading) 
- **Port**: 4198
- **Drop Copy Host**: fix-dc.exchange.coinbase.com
- **Drop Copy Port**: 6122

**Authentication:** 
- HMAC-SHA256 signature passed in tag 96 (RawData).
- Logon tags: 553 (Username/API Key), 554 (Passphrase), 96 (Signature).

**Session management:**
- **Heartbeat interval (108)**: Required on logon.
- **Fresh Session Model**: Sequence numbers always reset to 1 after disconnect. `ResendRequest (35=2)` is NOT supported.
- **Maintenance**: Hard reset every Saturday at 1 PM ET.

---

## SECTION 3 — Tier scorecard

### Tier 1 (Order Lifecycle): 33.4 / 40 pts
| Check ID | Tag | Field | Status | Pts | Max | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| T1_D_000 | 35=D | NOS | [P] | 3.0 | 3.0 | Fully documented. Supports batch (U6). |
| T1_8_000 | 35=8 | ER | [P] | 3.0 | 3.0 | Standard feedback loop. |
| T1_F_000 | 35=F | Cancel | [P] | 2.5 | 2.5 | Supported. |
| T1_G_000 | 35=G | Replace | [P] | 2.5 | 2.5 | Supported (Price/Qty). |

### Tier 7 (Market Data): 10 / 10 pts
| Check ID | Tag | Field | Status | Pts | Max | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| T7_V_000 | 35=V | Request | [P] | 0.75 | 0.75 | Subscribe/Unsubscribe documented. |
| T7_X_000 | 35=X | Incremental | [P] | 1.0 | 1.0 | L3 order-by-order updates supported. |
| T7_X_278 | 278 | MDEntryID | [P] | 0.4 | 0.4 | Required for order tracking. |

---

## SECTION 4 — Gap analysis & remediation

### T2_8_851 — LastLiquidityInd (tag 851) — 1.5 pts lost
**Status**: Partial (Proprietary Tag)
**Evidence**: Coinbase uses `AggressorIndicator (1057)` instead of standard 851.
**Institutional impact**: Break in standard TCA pipelines expecting 851.
**Remediation**: Coinbase should map 1057 internal state back to FIX-standard Tag 851 for institutional parity.

### T8_RR_000 — ResendRequest (35=2) — 0.375 pts lost
**Status**: Partial (Unsupported)
**Evidence**: Fresh session model required.
**Institutional impact**: High-speed clients must implement a local persistent buffer to recover missing state as the exchange will not replay sequences.

---

## SECTION 5 — Custom tag dictionary
| Tag # | Field Name | Data Type | Valid Values | Messages | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1057 | AggressorIndicator | Boolean | Y=Taker, N=Maker | 35=8 | Proprietary maker/taker flag. |
| 9406 | DropCopyFlag | char | Y=Yes | 35=A | Required for DC logon. |
| 3000 | SelfTradePrevention | char | C=Cancel oldest | 35=D | Risk management. |

---

## SECTION 6 — Order types matrix
| Order Type | FIX OrdType | Spot | Notes |
| :--- | :--- | :--- | :--- |
| Market | 1 | [P] | |
| Limit | 2 | [P] | |
| Stop | 3 | [P] | |
| Stop Limit | 4 | [P] | |
| Batch | U6 | [P] | Institutional extension. |
| TPSL | O | [P] | Complex trigger types. |

---

## SECTION 7 — UAT checklist
**Phase 1 — Connectivity**: TLS 1.2 handshake, HMAC signature validation, DC logon.
**Phase 2 — Order Batching**: Submit `NewOrderBatch (35=U6)`, reconcile multiple `ExecutionReports`.
**Phase 3 — Drop Copy**: Place order via REST API, verify report delivery on FIX DC session.
**Phase 4 — L3 Feed**: Build local order book from `35=W` snapshot and `35=X` updates using `MDEntryID`.

---

## SECTION 8 — DAWG Extensions (Informational)
Coinbase FIX 5.0 SP2 provides a modern foundation but lacks DAWG-ratified digital asset extensions like Tag 167=DIGITAL or ISO 24165 DTIs. Asset identification is purely symbol-based (e.g., BTC-USD).

---

## SECTION 9 — Drop Copy Analysis
**Score**: 10.5 / 11
**Status**: Institutional Ready
Coinbase provides a "Gold Standard" drop copy implementation for crypto, using a dedicated endpoint and session isolation. The feed includes all execution reports irrespective of the entry channel (FIX, REST, or Web).

---

## SECTION 10 — Market Data Analysis
**Score**: 10 / 10
**Status**: Institutional Ready
The Market Data feed is an institutional-grade L3 (order-by-order) stream. The use of unique `MDEntryIDs` allows for perfect book reconciliation, placing Coinbase at the top tier for crypto market data.

---

## SECTION 11 — Admin & Session Analysis
**Score**: 8.3 / 10
**Status**: High Reliability
The fresh-session model ensures high-speed connectivity with minimal overhead, though the lack of `ResendRequest` puts the burden of state recovery on the client's infrastructure.

Prepared by: Opound LLC — navilla.bagga@gmail.com
Version: 2.0.0 | Date: 2026-04-20
