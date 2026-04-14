# Rules of Engagement — Kraken FIX API
## Institutional Readiness Audit

**Audit date:** 2026-04-13
**Auditor:** Opound LLC — Navilla Bagga
**Spec source:** https://docs.kraken.com/api/docs/guides/fix-intro/
**Asset classes audited:** [spot, futures]

### Overall score: 55 / 100 — Partial

| Tier | Label | Score | Available | % |
|------|-------|-------|-----------|---|
| 1 | Order lifecycle | 26.0 | 35 | 74% |
| 2 | Execution quality & TCA | 12.0 | 25 | 48% |
| 3 | Post-trade & allocation | 10.5 | 25 | 42% |
| 4 | AML & Travel Rule | 6.0 | 15 | 40% |

**Recommendation:** Kraken provides a robust and reliable FIX API for Spot trading suitable for prop-trading and algorithmic execution. However, it is currently **not institutional-grade** for Tier-1 prime brokerage or asset management integration. The significant parity gap between Spot and Derivatives, coupled with the absence of standard TradFi identifiers (LastCapacity, LastMkt) and post-trade allocation messages (35=J), requires significant custom engineering and REST-based workarounds.

**Critical gaps (highest weight items missing):**
- **T2_001 | LastCapacity | 5.0 pts lost |** Absence of agency vs. principal tagging prevents MiFID II best-execution audit.
- **T2_002 | LastMkt / Venue | 5.0 pts lost |** Lack of venue tagging prevents multi-venue TCA analysis and routing transparency.
- **T3_002 | AllocationInstruction | 5.0 pts lost |** Missing 35=J message prevents standard block trade allocation workflows.

---

## FIX Session Configuration

### Protocol version
- FIX version: 4.4
- Transport: TCP/TLS 1.2+
- Encryption: TLS 1.2 minimum; TLS 1.3 preferred.

### Connection parameters
| Parameter | Value | Notes |
|-----------|-------|-------|
| TargetCompID | Exchange-assigned | Provided by Kraken Support |
| SenderCompID | Client-assigned | Unique per API Key |
| Host / IP | fix.kraken.com | Global entry point |
| Port | 443 | Standard TLS port |
| Environment | Prod / UAT | Separate hostnames provided in spec |

### Authentication
- Method: HMAC-SHA256 (API Key + Signature)
- Logon fields: Tag 553 (Username) and Tag 554 (Password/Signature)
- Session reset behavior: ResetOnLogon (Tag 141) supported; resets both Sender and Target sequences to 1.

### Session management
| Parameter | Value | Notes |
|-----------|-------|-------|
| Heartbeat interval (tag 108) | 10–60 seconds | Configurable at Logon |
| Missed heartbeat threshold | 3 missed = disconnect | Standard behavior |
| Cancel-on-Disconnect | Supported | Scope: Session-level via Tag 8674 |
| Message recovery window | 24 hours | Via ResendRequest (35=2) |

---

## Institutional Readiness Scorecard

### Tier 1 — Order lifecycle (26.0 / 35 pts)

| Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence |
|----------|---------|-------|--------|-----------|--------------|---------|
| T1_001 | 35=D | NewOrderSingle | ✅ Present | 5 | 5 | Supports Market, Limit, Stop types; all core tags provided. |
| T1_002 | 35=8 | ExecutionReport | ✅ Present | 5 | 5 | Covers New, Partial Fill, Fill, Cancel, and Reject transitions. |
| T1_003 | 59 | TimeInForce | ⚠ Partial | 2.5 | 5 | GTC, IOC, FOK, GTD supported on Spot; Futures parity missing. |
| T1_004 | 1138 | DisplayQty (Iceberg) | ⚠ Partial | 1.5 | 3 | Tag 1138 supported on Spot only; 1/15 min ratio constraint. |
| T1_005 | 7928 | SelfTradePrevention | ⚠ Partial | 2 | 4 | All 3 modes supported but explicitly Spot Only. |
| T1_006 | 35=F | OrderCancelRequest | ✅ Present | 3 | 3 | Supports cancel by ClOrdID and OrigClOrdID. |
| T1_007 | 35=q | Mass Cancel + COD | ✅ Present | 4 | 4 | 35=q supported; COD via Tag 8674. |
| T1_008 | 35=G | OrderCancelReplace | ⚠ Partial | 2 | 4 | Amend supported but Spot Only. |
| T1_009 | 35=H | OrderStatusRequest | ⚠ Partial | 1 | 2 | Supported but Spot Only. |

### Tier 2 — Execution quality & TCA (12.0 / 25 pts)

| Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence |
|----------|---------|-------|--------|-----------|--------------|---------|
| T2_001 | 29 | LastCapacity | ❌ Missing | 0 | 5 | Not documented. |
| T2_002 | 30 | LastMkt / Venue | ❌ Missing | 0 | 5 | Not documented. |
| T2_003 | 31 | LastPx (fill price) | ✅ Present | 3 | 3 | Present in ER fill messages. |
| T2_004 | 32 | LastQty (fill quantity) | ✅ Present | 3 | 3 | Present in all fill ERs. |
| T2_005 | 60 | TransactTime | ⚠ Partial | 2 | 4 | Millisecond precision (3 places) only. |
| T2_006 | 851 | LastLiquidityInd | ⚠ Partial | 2 | 4 | Uses custom Tag 5050 instead of 851. |
| T2_007 | 375 | ContraTrader | ❌ Missing | 0 | 3 | Not documented. |
| T2_008 | 14 | CumQty | ✅ Present | 2 | 2 | Present and consistent with LeavesQty. |

### Tier 3 — Post-trade & allocation (10.5 / 25 pts)

| Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence |
|----------|---------|-------|--------|-----------|--------------|---------|
| T3_001 | 78/79 | NoAllocs / AllocAcc | ⚠ Partial | 2.5 | 5 | Present in data dictionary but restricted tier. |
| T3_002 | 35=J | AllocationInstruction | ❌ Missing | 0 | 5 | Message type not supported. |
| T3_003 | 35=AK | AllocationAck | ❌ Missing | 0 | 3 | Message type not supported. |
| T3_004 | 63 | SettlType | ❌ Missing | 0 | 4 | Tag 63 not supported. |
| T3_005 | Session | Session Management | ✅ Present | 5 | 5 | Complete session protocol documentation. |
| T3_006 | 58 | Text (Reject reason) | ✅ Present | 3 | 3 | Quality human-readable reject reasons. |

### Tier 4 — AML & Travel Rule (6.0 / 15 pts)

| Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence |
|----------|---------|-------|--------|-----------|--------------|---------|
| T4_001 | 453 | Parties group | ❌ Missing | 0 | 5 | Not implemented in public spec. |
| T4_002 | custom | Wallet Attribution | ❌ Missing | 0 | 4 | No documented mechanism. |
| T4_003 | 17 | ExecID | ✅ Present | 3 | 3 | Unique and queryable across sessions. |
| T4_004 | 18 | ExecInst | ✅ Present | 3 | 3 | Supports Post-Only and Reduce-Only. |

**Status legend:** ✅ Full credit | ⚠ Partial credit | ❌ Missing / no credit

---

## Gap Analysis & Remediation Roadmap

---
#### T2_001 — LastCapacity (FIX tag 29) — 5.0 pts lost

**Status:** Missing
**Evidence from spec:** Not documented

**Institutional impact:**
Without LastCapacity, institutions cannot determine if they were filled against exchange inventory (principal) vs. other market participants (agency). Regulatory reporting under MiFID II RTS 27/28 requires this field. Prime brokers will flag its absence.

**TradFi reference:**
FIX 4.4 tag 29; MiFID II RTS 27 Article 3(1)(f); CME iLink3 tag 29

**Recommended remediation:**
Implement Tag 29 in all ExecutionReport fill messages. Map matched client sub-orders to Agent (1) and any internalization or OTC desk fills to Principal (5).

**Workaround (if any):**
No FIX-native workaround — REST reconciliation required for venue-specific book analysis.

**Implementation effort:** M = 1–4 weeks

---
#### T2_002 — LastMkt / Execution Venue (FIX tag 30) — 5.0 pts lost

**Status:** Missing
**Evidence from spec:** Not documented

**Institutional impact:**
Without venue tagging, institutions cannot determine where their fill occurred — especially when exchanges route to external liquidity or internalize. Best-execution analysis becomes meaningless.

**TradFi reference:**
FIX 4.4 tag 30; MiFID II RTS 27 Article 3; ISO 10383 MIC codes for traditional venues

**Recommended remediation:**
Implement Tag 30 in ER messages using MIC-compliant codes (e.g., 'XKRAK' for lit book, 'XKOT' for OTC desk).

**Workaround (if any):**
No FIX-native workaround.

**Implementation effort:** S = < 1 week

---
#### T3_002 — AllocationInstruction (FIX tag 35=J) — 5.0 pts lost

**Status:** Missing
**Evidence from spec:** Not documented

**Institutional impact:**
Without 35=J, block trade allocation must occur via proprietary API or manual process. This breaks the end-to-end FIX workflow that institutional prime brokers require.

**TradFi reference:**
FIX 4.4 35=J; required by prime brokers (Goldman Sachs PB, Morgan Stanley PB) for block allocation

**Recommended remediation:**
Enable the AllocationInstruction (35=J) message to allow post-trade splitting of parent fills across sub-accounts.

**Workaround (if any):**
Manual allocation via Kraken Pro sub-account management UI or REST API block-allocation endpoints.

**Implementation effort:** L = > 1 month

---

## Custom & Non-Standard FIX Tags

| Tag # | Field Name | Data Type | Valid Values | Applicable Messages | Notes |
|-------|-----------|-----------|-------------|-------------------|-------|
| 1138 | DisplayQty | Float | > 0 | NOS | Iceberg orders (Spot Only) |
| 5050 | LastLiquidityInd | Char | m, t | ER | Custom alternative to Tag 851 |
| 7928 | STP | Int | 0, 1, 2 | NOS | Self-Trade Prevention (Spot Only) |
| 8674 | ExpireTime | Int | Seconds | Logon / NOS | Used for Cancel-on-Disconnect duration |

---

## Order Types Support Matrix

| Order Type | FIX OrdType | Spot | Futures | Perps | Options | Notes |
|-----------|------------|------|---------|-------|---------|-------|
| Market | 1 | ✅ | ✅ | ✅ | ✅ | |
| Limit | 2 | ✅ | ✅ | ✅ | ✅ | |
| Stop-Loss | 3 | ✅ | ✅ | ✅ | ✅ | |
| Stop-Limit | 4 | ✅ | ✅ | ✅ | ✅ | |
| Take-Profit | R | ❌ | ❌ | ❌ | ❌ | |
| Take-Profit-Limit | T | ❌ | ❌ | ❌ | ❌ | |
| Trailing Stop | U | ❌ | ❌ | ❌ | ❌ | |
| Trailing Stop-Limit | V | ❌ | ❌ | ❌ | ❌ | |
| Iceberg / Reserve | — (tag 1138) | ✅ | ❌ | ❌ | ❌ | Spot Only |

**TIF support:**
| TIF | Value | Spot | Futures | Notes |
|-----|-------|------|---------|-------|
| GTC | 1 | ✅ | ✅ | |
| IOC | 3 | ✅ | ✅ | |
| FOK | 4 | ✅ | ❌ | Spot Only |
| GTD | 6 | ✅ | ❌ | Spot Only |
| Day | 0 | ❌ | ❌ | |

---

## UAT Connectivity Checklist

Use this checklist to validate institutional FIX connectivity before production go-live.
UAT environment: fix-demo.kraken.com:443

### Phase 1 — Session establishment
- [ ] Logon (35=A) with correct credentials — receive Logon ack
- [ ] Heartbeat exchange confirmed at configured interval
- [ ] TestRequest (35=1) / Heartbeat (35=0) echo verified
- [ ] Logout (35=5) cleanly terminates session
- [ ] Reconnect after clean disconnect — sequence numbers resume correctly
- [ ] Cancel-on-Disconnect: disconnect TCP without logout — verify all open orders canceled within 500ms

### Phase 2 — Order entry and lifecycle
- [ ] NewOrderSingle (35=D) — Market order — ExecutionReport (150=0 New, 150=2 Fill) received
- [ ] NewOrderSingle — Limit order — ER (150=0 New) received; order visible on book
- [ ] NewOrderSingle — IOC order — ER (150=0 New + 150=4 Cancel) or immediate fill
- [ ] NewOrderSingle — FOK order — ER full fill or immediate cancel (no partial)
- [ ] NewOrderSingle — GTD order — ER (150=0 New); verify expiry at configured time
- [ ] NewOrderSingle — Iceberg (tag 1138) — verify displayed qty on book
- [ ] SelfTradePrevention — send opposing orders from same account — verify STP mode behavior

### Phase 3 — Order modification and cancel
- [ ] OrderCancelReplaceRequest (35=G) — amend price — ER (150=5 Replaced) received
- [ ] OrderCancelReplaceRequest — amend qty — ER (150=5 Replaced) received
- [ ] OrderCancelRequest (35=F) by ClOrdID — ER (150=4 Canceled) received
- [ ] OrderCancelRequest by OrigClOrdID — verify alternate cancel identifier works
- [ ] OrderCancelReject (35=9) — attempt cancel of already-filled order — verify reject with reason in tag 58
- [ ] OrderMassCancelRequest (35=q) — cancel all open orders — verify all ERs (150=4) received

### Phase 4 — Execution quality fields
- [ ] Partial fill scenario — verify LastPx (31), LastQty (32), CumQty (14), LeavesQty (151) all present and consistent
- [ ] Verify TransactTime (60) precision — ⚠ Milliseconds (3 decimal places) detected
- [ ] Verify LastLiquidityInd — ⚠ Custom Tag 5050 (m/t) detected
- [ ] Verify LastCapacity (29) — ❌ Missing (Agent/Principal identification)
- [ ] Verify ExecID (17) uniqueness across multiple sessions

### Phase 5 — Session recovery
- [ ] Send ResendRequest (35=2) for last 10 messages — verify gap-fill or SeqReset response
- [ ] Disconnect mid-fill partial fill scenario — reconnect and verify position state reconcilable
- [ ] OrderStatusRequest (35=H) — query open order — verify full ER response

---

**Sign-off criteria:** All Phase 1–3 and Phase 5 items must pass before production go-live.
Phase 4 items flagged ⚠ (absent fields) are documented as known gaps.

**Prepared by:** Opound LLC — navilla.bagga@gmail.com
**Document version:** 1.0 | **Date:** 2026-04-13
