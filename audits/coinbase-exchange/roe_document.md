# Rules of Engagement — Coinbase Exchange FIX API
## Institutional readiness audit

Audit date: 2026-04-13T20:55:00Z
Auditor: Opound LLC — Navilla Bagga
Spec source: multi-url
Asset classes: spot

Overall score: 55 / 100 — Partial

Tier | Score | Available | %
-----|-------|-----------|---
1 Order lifecycle | 32 | 35 | 91%
2 Execution quality & TCA | 14 | 25 | 56%
3 Post-trade & allocation | 5.5 | 25 | 22%
4 AML & Travel Rule | 3 | 15 | 20%

Recommendation:
Coinbase Exchange FIX 5.0 API is suitable for high-frequency prop trading and basic electronic execution, but falls short of institutional prime brokerage and MiFID II compliance standards. The primary blockers are the absence of post-trade allocation (NoAllocs), venue tagging (LastMkt), and execution capacity (LastCapacity) fields. Priority fix should be implementing standard LastCapacity (29) and LastMkt (30) fields to enable regulatory TCA reporting.

Critical gaps (top 3 by points_lost):
- T2_001 | LastCapacity | 5 pts | Institutions cannot determine agency vs principal execution for regulatory reporting.
- T2_002 | LastMkt / Execution Venue | 5 pts | Multi-venue TCA is impossible without explicit market identification on fills.
- T3_001 | NoAllocs / AllocAccount — sub-account order routing | 5 pts | Fund managers cannot route orders to specific fund sleeves under one master account.

---

## SECTION 2 — Session configuration

FIX version: FIXT 1.1 (Session), FIX 5.0 (Application)
Transport: TCP/TLS 1.2 minimum (TLS 1.3 preferred)

Connection parameters:
TargetCompID: Coinbase
SenderCompID: [client-assigned]
Host: fix.exchange.coinbase.com
Port: 4198
Sandbox: Y — fix-public.sandbox.exchange.coinbase.com

Authentication: API Key + Passphrase + Signature (HMAC-SHA256)
Logon tags: 553 (Username), 554 (Password), 9406 (Passphrase), 9407 (Timestamp)
ResetOnLogon (141): Y — Resets sequence numbers to 1 on every successful logon.

Session management:
Heartbeat interval (108): 30 sec — NOT configurable
Missed heartbeat threshold: 3 missed = disconnect
Cancel-on-Disconnect: Y — scope: [session/profile] via tag 8013
Message recovery: Not supported — Every reconnection is a fresh session.
Forced session reset: Weekly Saturday reset (standard maintenance window)

---

## SECTION 3 — Tier scorecard

Status icons: [P] Full credit / [~] Partial / [X] Missing

### Tier 1 (9 checks, 35 pts)
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---|---|---|---|---|---|---
T1_001 | 35=D | NewOrderSingle | [P] | 5 | 5 | Supported (35=D) with Limit, Market, Stop.
T1_002 | 35=8 | ExecutionReport | [P] | 5 | 5 | All standard status transitions documented.
T1_003 | 59 | TimeInForce | [P] | 5 | 5 | GTC, IOC, FOK, GTD supported.
T1_004 | 1138 | DisplayQty (Iceberg) | [X] | 0 | 3 | Support removed May 27, 2025.
T1_005 | 7928 | STP | [P] | 4 | 4 | Tag 7928 supports D, O, N, B modes.
T1_006 | 35=F | OrderCancelRequest | [P] | 3 | 3 | Supported by ClOrdID and OrderID.
T1_007 | 35=q | MassCancel + COD | [P] | 4 | 4 | 35=q and COD (8013) both supported.
T1_008 | 35=G | Amend | [P] | 4 | 4 | Supported for price/qty modification.
T1_009 | 35=H | OrderStatusRequest | [P] | 2 | 2 | Documented and supported.

### Tier 2 (8 checks, 25 pts)
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---|---|---|---|---|---|---
T2_001 | 29 | LastCapacity | [X] | 0 | 5 | Not documented in Spot implementation.
T2_002 | 30 | LastMkt | [X] | 0 | 5 | Not documented in Spot implementation.
T2_003 | 31 | LastPx | [P] | 3 | 3 | Provided in all fill reports.
T2_004 | 32 | LastQty | [P] | 3 | 3 | Provided in all fill reports.
T2_005 | 60 | TransactTime | [P] | 4 | 4 | Microsecond precision confirmed.
T2_006 | 851 | LastLiquidityInd | [~] | 2 | 4 | Uses custom Tag 1057 (AggressorIndicator). Scored partial_credit as functionally equivalent per rubric.
T2_007 | 375 | ContraTrader | [X] | 0 | 3 | Not documented in Spot implementation.
T2_008 | 14 | CumQty | [P] | 2 | 2 | Standard field in execution reports.

### Tier 3 (6 checks, 25 pts)
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---|---|---|---|---|---|---
T3_001 | 78/79 | NoAllocs / AllocAccount | [X] | 0 | 5 | Not supported on spot order entry.
T3_002 | 35=J | AllocationInstruction | [X] | 0 | 5 | Message type not supported.
T3_003 | 35=AK | AllocationInstructionAck | [X] | 0 | 3 | Message type not supported.
T3_004 | 63 | SettlType | [X] | 0 | 4 | Not documented for spot.
T3_005 | Ses | Session Management | [~] | 2.5 | 5 | ResendRequest (35=2) not supported.
T3_006 | 58 | Text | [P] | 3 | 3 | Provided on all rejections.

### Tier 4 (4 checks, 15 pts)
Check ID | FIX Tag | Field | Status | Pts Earned | Pts Available | Evidence
---|---|---|---|---|---|---
T4_001 | 453 | Parties group | [X] | 0 | 5 | Not documented for spot.
T4_002 | cst | Wallet attribution | [X] | 0 | 4 | No mechanism documented.
T4_003 | 17 | ExecID | [~] | 1.5 | 3 | Unique per session, but no global guarantee.
T4_004 | 18 | ExecInst | [~] | 1.5 | 3 | Supports Post-Only but not Reduce-Only.

---

## SECTION 4 — Gap analysis & remediation

### T2_001 — LastCapacity (tag 29) — 5 pts lost
Status: Missing
Evidence: Not documented in Spot implementation.
Institutional impact: TradFi prime brokers and institutional asset managers require LastCapacity to report if they traded against the venue (principal) or other participants (agency). Missing this blocks MiFID II RTS 27/28 reporting.
TradFi reference: FIX 4.4 tag 29; MiFID II RTS 27 Article 3(1)(f).
Recommended remediation: Implement tag 29 in ExecutionReport (35=8) with values 1 (Agent), 4 (Cross principal), or 5 (Principal).
Workaround: No FIX-native workaround.
Effort: S < 1 week

### T2_002 — LastMkt / Execution Venue (tag 30) — 5 pts lost
Status: Missing
Evidence: Not documented in Spot implementation.
Institutional impact: Multi-venue TCA and best-execution analysis depend on knowing exactly which engine or venue provided the fill.
TradFi reference: ISO 10383 MIC codes; FIX 4.4 tag 30.
Recommended remediation: Implement tag 30 in ExecutionReport with value 'XCOB' (Coinbase MIC code).
Workaround: No FIX-native workaround.
Effort: S < 1 week

### T3_001 — NoAllocs / AllocAccount — 5 pts lost
Status: Missing
Evidence: Not documented in NOS for Spot.
Institutional impact: Institutions managing multi-fund portfolios cannot route orders to specific fund sleeves under a master account. This breaks fund-level P&L tracking.
TradFi reference: FIX 4.4 tags 78/79.
Recommended remediation: Supported NoAllocs repeating group in NewOrderSingle to allow account routing at entry.
Workaround: Use multiple API keys (one per sub-account), which is operationally heavy.
Effort: M 1-4 weeks

---

## SECTION 5 — Custom tag dictionary

Tag # | Field Name | Data Type | Valid Values | Messages | Notes
---|---|---|---|---|---
1057 | AggressorIndicator | Boolean | Y (Taker), N (Maker) | ER | Non-standard tag for maker/taker (LastLiquidityInd).
8013 | CancelOrdersOnDisconnect | Char | S (Session), Y (Profile) | Logon | Coinbase-specific COD control.
9406 | Passphrase | String | Client-defined | Logon | Part of authentication header.

---

## SECTION 6 — Order types matrix

Order Type | FIX OrdType | Spot | Futures | Notes
---|---|---|---|---
Market | 1 | [P] | [X] | Spot Only.
Limit | 2 | [P] | [X] | Spot Only.
Stop | 3 | [P] | [X] | Spot Only.
StopLimit | 4 | [P] | [X] | Spot Only.
Iceberg | 1138 | [X] | [X] | Feature removed May 2025.

TIF table | Spot | Futures | Notes
---|---|---|---
GTC(1) | [P] | [X] | Spot Only.
IOC(3) | [P] | [X] | Spot Only.
FOK(4) | [P] | [X] | Spot Only.
GTD(6) | [P] | [X] | Spot Only.

---

## SECTION 7 — UAT checklist

UAT environment: fix-public.sandbox.exchange.coinbase.com:4198

Phase 1 — Session: Logon (with signature), heartbeat, Missed Heartbeat Disconnect, Cancel-on-Disconnect (Tag 8013).
Phase 2 — Order lifecycle: Market NOS, Limit NOS, IOC, FOK, GTD, SelfTradePrevention (Tag 7928).
Phase 3 — Modify/cancel: Amend price/qty (35=G), cancel by ClOrdID, cancel batch, OrderStatusRequest (35=H).
Phase 4 — Execution quality: Partial fill tags (31/32/14/151), TransactTime (60) precision, AggressorIndicator (1057) validation.
Phase 5 — Recovery: Reconnect sequence reset (141=Y behavior), Fresh session state verification.

Sign-off: Phases 1-3 required for Spot go-live.
Phase 4 gaps (LastCapacity, LastMkt) are flagged as known — manual TCA reconciliation required.

Prepared by: Opound LLC — Navilla Bagga
Version: 1.0 | Date: 2026-04-13T20:55:00Z

---

## SECTION 8 — DAWG Digital Asset FIX Extensions — Forward-Looking Assessment

This section evaluates the exchange against the **Digital Asset Working Group (DAWG)** extensions, including ratified **FIX EP273** standards and upcoming proposals. These checks are informational and do not affect the current readiness score. 

**Note for Coinbase Exchange:** As Coinbase uses **FIX 5.0 SP2**, it is theoretically prepared to adopt EP273-ratified tags. However, current documentation shows that these fields have not yet been implemented in the public spec.

Check ID | Title | Status | Evidence | Institutional Impact
---|---|---|---|---
T5_001 | SecurityIDSource=Y (DTI) | [X] No Credit | Tag 22 not found in NewOrderSingle or Dictionary | **ISO 24165 (DTI)** is the standard for unique digital asset identification. Absence blocks automated instrument mapping and cross-venue reconciliation.
T5_002 | CurrencySource=Y (DTI) | [X] No Credit | Tags 2897/2899 (EP273) are missing from spec | **Tags 2897/2899** allow disambiguation between legacy ISO 4217 and digital assets. Absence requires custom mapping logic in OMS/EMS.
T5_003 | SecurityType=DIGITAL | [X] No Credit | Tag 167 does not list 'DIGITAL' as supported | **SecurityType(167)=DIGITAL** provides a standard taxonomy for digital assets, essential for regulatory reporting and risk management.
T5_004 | WalletID (803=32) | [X] No Credit | Tag 803 (PartySubIDType) is not documented | Identification of wallet addresses via **PartySubIDType(803)=32** is critical for FATF Travel Rule compliance and on-chain settlement.
T5_005 | DTI Pairs Support | [X] No Credit | SecAltIDGrp (454-456) not implemented for DTI | Explicit DTI pairing in the **SecurityAltIDGrp** ensures deterministic asset mapping in multi-leg or derivative structures.

These checks are based on FIX EP273 (T5_001–T5_003, ratified) and draft DAWG proposals (T5_004–T5_005, pending ratification). They do not affect the institutional readiness score.
