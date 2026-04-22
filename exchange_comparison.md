# Institutional Exchange Comparison: Kraken vs. Coinbase Exchange

This document provides a side-by-side readiness assessment of Kraken and Coinbase Exchange FIX implementations against the CryptoFIX Master Rubric. 

## 1. Quantitative Score Comparison

| Metric | Kraken | Coinbase Exchange | Advantage |
| :--- | :---: | :---: | :--- |
| **Total Readiness Score** | **67.6** | **59.6** | **Kraken (+8.0)** |
| Tier 1: Order Lifecycle | 35.1 | 36.1 | Coinbase (+1.0) |
| Tier 2: Execution Quality | 15.0 | 15.0 | Tie |
| Tier 3: Post-trade & Allocation | 7.6 | 0.0 | Kraken (+7.6) |
| Tier 8: Admin & Session | 9.9 | 8.5 | Kraken (+1.4) |
| **Sub-Scores** | | | |
| Compliance (Tier 4/6) | 8.5 | 9.5 | Coinbase (+1.0) |
| Market Data (Tier 7) | 5.0 | 5.0 | Tie |

---

## 2. Kraken Institutional Advantages
*Where Kraken scores higher than Coinbase Exchange.*

| Check ID | Field / Message | Kraken | Coinbase | Institutional Rationale |
| :--- | :--- | :---: | :---: | :--- |
| **T3_AE_000** | TradeCaptureReport (35=AE) | **Full** | **None** | Essential for real-time middle-office reconciliation and post-trade processing. |
| **T4_453** | Parties Group (executions) | **Full** | **None** | Required for regulatory reporting (e.g., specifying the executing broker vs. clearing firm). |
| **T8_RR_000** | ResendRequest (35=2) | **Full** | **None** | Supports standard stateful recovery. Coinbase requires "fresh" sessions, complicating OMS state management. |
| **T3_R_000** | Request For Quote (35=R) | **Full** | **None** | Critical for block trading and institutional liquidity discovery outside the central limit order book. |

## 3. Coinbase Exchange Institutional Advantages
*Where Coinbase Exchange scores higher than Kraken.*

| Check ID | Field / Message | Coinbase | Kraken | Institutional Rationale |
| :--- | :---: | :---: | :---: | :--- |
| **T6_DC_000** | Dedicated Drop Copy Feed | **Full** | **None** | Vital for redundant compliance monitoring and real-time execution risk tracking on a separate session. |
| **T1_G_000** | OrderCancelReplace (35=G) | **Full** | **Part** | Full support for in-flight order modifications. Kraken's support is restricted to Spot only. |
| **T8_LOG_000** | Logon Authentication | **Full** | **Full** | *Coinbase documented session foundation slightly more comprehensively in terms of tag coverage.* |

## 4. Shared Industry Gaps (Both No Credit)
*Fields missing on both exchanges, representing broader crypto-to-FIX migration gaps.*

*   **T4_WAL (Wallet Attribution)**: Neither exchange currently supports the DAWG-drafted tag 803 or a documented custom field to associate FIX trades with on-chain wallet addresses.
*   **T1_Q_000 (DontKnowTrade)**: Neither exchange supports the 35=Q message type, which is standard in TradFi for rejecting trades that do not match the institutional firm's records.
*   **T2_8_375 (ContraTrader)**: Neither implementation identifies the individual counterparty trader or market maker providing liquidity, limiting advanced TCA (Transaction Cost Analysis).

---

## 5. Institutional Recommendation

**For institutions connecting from a standard equity OMS (e.g., Charles River (CRD) or Bloomberg EMSX), Kraken presents fewer integration obstacles.** Traditional OMS platforms are built with the expectation of stateful session management. Kraken's support for standard session recovery (ResendRequest) and post-trade transparency (Trade Capture Reports) allows institutional desks to use existing FIX logic without significant custom engineering. Coinbase’s "fresh session" requirement forces a deviation from standard FIX state handling that can complicate failover and recovery workflows in TradFi environments.

**However, for firms with strict compliance and risk auditing requirements, Coinbase Exchange provides superior infrastructure.** The existence of a dedicated Drop Copy session (Tier 6) is a prerequisite for many larger institutions to ensure that mid-office systems have a reliable, consolidated execution feed that is isolated from the trading session's bandwidth and latency concerns. While Kraken is easier to "plug in" to a trading terminal, Coinbase is more "institutionally hardened" for secondary reporting and risk monitoring.
