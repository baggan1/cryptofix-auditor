# Rules of Engagement — Kraken FIX API
## Institutional readiness audit

Audit date: 2026-04-13
Auditor: Opound LLC — Navilla Bagga
Spec source: https://docs.kraken.com/api/docs/guides/fix-intro/
Asset classes: spot, futures

Overall score: 58 / 100 — Partial

Tier | Score | Available | %
-----|-------|-----------|---
1 Order lifecycle | 28.5 | 35 | 81%
2 Execution quality & TCA | 12 | 25 | 48%
3 Post-trade & allocation | 10.5 | 25 | 42%
4 AML & Travel Rule | 6 | 15 | 40%

Recommendation:
Kraken FIX API is suitable for spot electronic execution with moderate institutional requirements. The core order lifecycle is largely complete (81%), but significant fragmentation remains in institutional post-trade reporting and multi-venue compliance data. The primary blockers are the absence of institutional fill tagging (LastCapacity, LastMkt) and standard post-trade allocation message support. Priority fix remains implementing tag 29/30 on fills.

Critical gaps (top 3 by points_lost):
- T2_001 | LastCapacity | 5 pts | Institutions cannot determine if execution was agent/principal for best-ex reporting.
- T2_002 | LastMkt / Execution Venue | 5 pts | Multi-venue TCA is blocked as venue identification is missing from ERs.
- T3_002 | AllocationInstruction | 5 pts | Block trade allocation must be handled via manual/out-of-band instructions, increasing operational risk.

---

## SECTION 2 — Session configuration

FIX version: FIX 4.4
Transport: TCP/TLS 1.2+

Connection parameters:
TargetCompID: Kraken
SenderCompID: [client-assigned]
Host: fix.kraken.com
Port: 443
Sandbox: Y — demo-fix.kraken.com

Authentication: API Key + Signature (HMAC-SHA256)
Logon tags: 553 (Username), 554 (Password), 9002 (Nonce)
ResetOnLogon (141): Y (standard behavior)

Session management:
Heartbeat interval (108): 30 sec — Configurable [Y]
Missed heartbeat threshold: 3 missed = disconnect
Cancel-on-Disconnect: Y — scope: [session/account] via custom Tag 8674
Message recovery: Supported — via ResendRequest (35=2).
Forced session reset: Daily reset at 00:00 UTC.

---

## SECTION 3 — Tier scorecard

Status icons: [P] Full credit / [~] Partial / [X] Missing

### Tier 1 (9 checks, 35 pts)
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---|---|---|---|---|---|---
T1_001 | 35=D | NewOrderSingle | [P] | 5 | 5 | Supports Market (OrdType=1), Limit (OrdType=2), StopLoss (OrdType=3), and StopLossLimit (OrdType=4). Required tags 11, 38, 40, 44, 54, 55, 59, 60 provided.
T1_002 | 35=8 | ExecutionReport | [P] | 5 | 5 | Covers New (150=0), Partial Fill (150=1), Fill (150=2), Cancel (150=4), and Reject (150=8). Documents all required status transitions.
T1_003 | 59 | TimeInForce | [P] | 5 | 5 | Suppports GTC (1), IOC (3), FOK (4), and GTD (6) for Spot. FOK support on Futures confirmed via recent changelog parity update.
T1_004 | 1138 | DisplayQty (Iceberg) | [~] | 1.5 | 3 | Tag 1138 supported on Spot NOS. Explicit constraint: visible quantity must be at least 1/15 of total OrderQty.
T1_005 | 7928 | STP | [~] | 2 | 4 | Tag 7928 supports all 3 modes: 0 (Cancel Both), 1 (Cancel Newest), 2 (Cancel Oldest). However, STP is documented as Spot Only.
T1_006 | 35=F | OrderCancelRequest | [P] | 3 | 3 | Supports cancel via ClOrdID (11) and OrigClOrdID (41). Standard OrderCancelReject (35=9) provided.
T1_007 | 35=q | MassCancel + COD | [P] | 4 | 4 | OrderMassCancelRequest (35=q) supported. Cancel-on-Disconnect (COD) implemented via custom Tag 8674 (ExpireTime) or session-level config.
T1_008 | 35=G | Amend | [~] | 2 | 4 | Order amendment via 35=G supported for Spot. Specifically marked as '( Spot Only )' in unified docs.
T1_009 | 35=H | OrderStatusRequest | [~] | 1 | 2 | OrderStatusRequest (35=H) supported for Spot accounts. Explicitly marked as '( Spot Only )'.

### Tier 2 (8 checks, 25 pts)
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---|---|---|---|---|---|---
T2_001 | 29 | LastCapacity | [X] | 0 | 5 | Not documented.
T2_002 | 30 | LastMkt | [X] | 0 | 5 | Tag 30 absent from documentation.
T2_003 | 31 | LastPx | [P] | 3 | 3 | Tag 31 present in ER fill messages with precision matching instrument tick size.
T2_004 | 32 | LastQty | [P] | 3 | 3 | Tag 32 present in all partial and full fill ExecutionReports.
T2_005 | 60 | TransactTime | [~] | 2 | 4 | TransactTime (60) provided with millisecond precision (3 decimal places). Rubric requires microsecond (6 places) for full credit.
T2_006 | 851 | LastLiquidityInd | [~] | 2 | 4 | Liquidity indicator present but uses custom Tag 5050 (m=maker, t=taker) instead of standard Tag 851.
T2_007 | 375 | ContraTrader | [X] | 0 | 3 | Not documented.
T2_008 | 14 | CumQty | [P] | 2 | 2 | Tag 14 (CumQty) and Tag 151 (LeavesQty) provided and consistent in ExecReports.

### Tier 3 (6 checks, 25 pts)
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---|---|---|---|---|---|---
T3_001 | 78/79 | NoAllocs / AllocAccount | [~] | 2.5 | 5 | NoAllocs (78) and AllocAccount (79) are documented in the FIX data dictionary as part of account structures, but not explicitly supported in public NOS for standard clients.
T3_002 | 35=J | AllocationInstruction | [X] | 0 | 5 | Message type not supported.
T3_003 | 35=AK | AllocationInstructionAck | [X] | 0 | 3 | Message type not supported.
T3_004 | 63 | SettlType | [X] | 0 | 4 | Tag 63 not supported for per-order settlement.
T3_005 | Ses | Session Management | [P] | 5 | 5 | Logon (35=A), Logout (35=5), Heartbeat (35=0), and ResendRequest (35=2) all supported. Gap-fill (35=4) behavior documented.
T3_006 | 58 | Text | [P] | 3 | 3 | Tag 58 populated on all rejects (35=3, 35=j, 35=9). Provides human-readable descriptions of failure.

### Tier 4 (4 checks, 15 pts)
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---|---|---|---|---|---|---
T4_001 | 453 | Parties group | [X] | 0 | 5 | Parties repeating group not implemented in public FIX spec.
T4_002 | cst | Wallet attribution | [X] | 0 | 4 | No documented mechanism for wallet attribution via FIX.
T4_003 | 17 | ExecID | [P] | 3 | 3 | ExecID (17) is unique per execution and queryable via REST for post-trade recon.
T4_004 | 18 | ExecInst | [P] | 3 | 3 | Supports Post-Only (P) and Reduce-Only (E) via Tag 18. Both Spot and Futures parity confirmed.

---

## SECTION 4 — Gap analysis & remediation

### T2_001 — LastCapacity (tag 29) — 5 pts lost
Status: Missing
Evidence: Not documented.
Institutional impact: Without LastCapacity, institutions cannot determine if they were filled against exchange inventory (principal) vs. other market participants (agency). Regulatory reporting under MiFID II RTS 27/28 requires this field. Prime brokers will flag its absence.
TradFi reference: FIX 4.4 tag 29; MiFID II RTS 27 Article 3(1)(f); CME iLink3 tag 29.
Recommended remediation: Implement tag 29 on fills; explicitly document if all fills are pure Agency (1).
Workaround: No FIX-native workaround.
Effort: S < 1 week

### T2_002 — LastMkt / Execution Venue (tag 30) — 5 pts lost
Status: Missing
Evidence: Tag 30 absent from ER documentation.
Institutional impact: Without venue tagging, institutions cannot determine where their fill occurred — especially when exchanges route to external liquidity or internalize. Best-execution analysis becomes meaningless.
TradFi reference: FIX 4.4 tag 30; MiFID II RTS 27 Article 3; ISO 10383 MIC codes for traditional venues.
Recommended remediation: Implement tag 30 with value 'XKRA' (Kraken MIC code).
Workaround: No FIX-native workaround.
Effort: S < 1 week

### T3_002 — AllocationInstruction (35=J) — 5 pts lost
Status: Missing
Evidence: Message type not supported.
Institutional impact: Without 35=J, block trade allocation must occur via proprietary API or manual process. This breaks the end-to-end FIX workflow that institutional prime brokers require.
TradFi reference: FIX 4.4 35=J; required by prime brokers (Goldman Sachs PB, Morgan Stanley PB) for block allocation.
Recommended remediation: Implement 35=J for block trade decomposition.
Workaround: Manual allocation via web portal or REST API.
Effort: L > 1 month

---

## SECTION 5 — Custom tag dictionary

Tag # | Field Name | Data Type | Valid Values | Messages | Notes
---|---|---|---|---|---
5050 | LiquidityIndicator | Char | m (maker), t (taker) | ER | Non-standard tag for LastLiquidityInd.
8674 | ExpireTime | Int | Seconds | Logon | Kraken-specific COD timeout control.
9002 | Nonce | Int | Increasing int | Logon | Used for secure signature generation.

---

## SECTION 6 — Order types matrix

Order Type | FIX OrdType | Spot | Futures | Notes
---|---|---|---|---
Market | 1 | [P] | [P] | Supported.
Limit | 2 | [P] | [P] | Supported.
Stop | 3 | [P] | [P] | Supported (StopLoss).
StopLimit | 4 | [P] | [P] | Supported (StopLossLimit).
Iceberg | 1138 | [P] | [X] | Spot Only.

TIF table | Spot | Futures | Notes
---|---|---|---
GTC(1) | [P] | [P] | Supported.
IOC(3) | [P] | [P] | Supported.
FOK(4) | [P] | [P] | Supported (confirmed parity).
GTD(6) | [P] | [X] | Spot Only.

---

## SECTION 7 — UAT checklist

UAT environment: demo-fix.kraken.com:443

Phase 1 — Session: Logon with Nonce (9002), heartbeat echo, sequence recovery via ResendRequest (35=2), COD trigger via Tag 8674.
Phase 2 — Order lifecycle: NOS execution (Market/Limit), Iceberg ratio validation (Spot), STP mode validation (Spot), TIF (GTC/IOC/FOK).
Phase 3 — Modify/cancel: Amend (35=G) for Spot, Cancel by OrigClOrdID (41), Mass Cancel (35=q).
Phase 4 — Execution quality: Fill field validation (31/32/14/151), millisecond precision check on Tag 60, Custom Liquidity (Tag 5050) check.
Phase 5 — Recovery: Gap-fill behavior (35=4), OrderStatusRequest (35=H) Spot validation.

Sign-off: Phases 1-3 required for Spot go-live.
Derivatives go-live requires exclusion of GTD/Iceberg/Amend tests due to documented gaps.

Prepared by: Opound LLC — Navilla Bagga
Version: 1.1 | Date: 2026-04-13

---

## SECTION 8 — DAWG Digital Asset FIX Extensions — Forward-Looking Assessment

This section evaluates the exchange against the **Digital Asset Working Group (DAWG)** extensions, including ratified **FIX EP273** standards and upcoming proposals. These checks are informational and do not affect the current readiness score, but serve as a roadmap for institutional-grade digital asset connectivity.

Check ID | Title | Status | Evidence | Institutional Impact
---|---|---|---|---
T5_001 | SecurityIDSource=Y (DTI) | [X] No Credit | SecurityIDSource 22=Y/456=Y for DTI support (ISO 24165) not documented | **ISO 24165 (DTI)** is the standard for unique digital asset identification. Absence blocks automated instrument mapping and cross-venue reconciliation.
T5_002 | CurrencySource=Y (DTI) | [X] No Credit | CurrencySource Tags 2897/2899 missing | **Tags 2897/2899** allow disambiguation between legacy ISO 4217 and digital assets. Absence requires custom mapping logic in OMS/EMS.
T5_003 | SecurityType=DIGITAL | [X] No Credit | SecurityType 167=DIGITAL not documented | **SecurityType(167)=DIGITAL** provides a standard taxonomy for digital assets, essential for regulatory reporting and risk management.
T5_004 | WalletID (803=32) | [X] No Credit | Wallet identifier mapping, WalletID 803=32 not documented | Identification of wallet addresses via **PartySubIDType(803)=32** is critical for FATF Travel Rule compliance and on-chain settlement.
T5_005 | DTI Pairs Support | [X] No Credit | SecAltIDGrp (454-456) disambiguation not implemented for DTI | Explicit DTI pairing in the **SecurityAltIDGrp** ensures deterministic asset mapping in multi-leg or derivative structures.

These checks are based on FIX EP273 (T5_001–T5_003, ratified) and draft DAWG proposals (T5_004–T5_005, pending ratification). They do not affect the institutional readiness score.
