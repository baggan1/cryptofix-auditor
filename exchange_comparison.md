# CryptoFIX Auditor: Exchange Comparison Matrix
## Kraken vs. Coinbase Exchange

| Metric | Kraken | Coinbase Exchange | Advantage |
| :--- | :--- | :--- | :--- |
| **Overall Score** | **58 / 100** | **55 / 100** | **Kraken (+3)** |
| Tier 1: Order Lifecycle | 28.5 / 35 | 32.0 / 35 | Coinbase (+3.5) |
| Tier 2: Execution Quality | 12.0 / 25 | 14.0 / 25 | Coinbase (+2.0) |
| Tier 3: Post-Trade & Session | 10.5 / 25 | 5.5 / 25 | Kraken (+5.0) |
| Tier 4: AML & Compliance | 6.0 / 15 | 3.0 / 15 | Kraken (+3.0) |
| Grade | Partial | Partial | -- |

---

### 1. Kraken Advantages (Higher Score)
Kraken outperforms Coinbase in areas related to **session reliability** and **regulatory data depth**.

*   **T3_005 (Session Management)**: Kraken supports standard `ResendRequest (35=2)`, enabling gap-fill and message recovery. Coinbase treats every connection as a fresh session, which increases the risk of missed execution data during disconnects.
*   **T4_004 (ExecInst)**: Kraken supports both `Post-Only (P)` and `Reduce-Only (E)` instructions with parity across spot and futures. Coinbase documents `Post-Only` but lacks `Reduce-Only` support for spot.
*   **T4_003 (ExecID persistence)**: Kraken's `ExecID` is queryable via REST for post-trade reconciliation; Coinbase lacks explicit guarantees of global uniqueness across historical sessions in its documentation.
*   **T1_004 (Iceberg Orders)**: Kraken maintains support for `DisplayQty (1138)`, whereas Coinbase officially removed this feature in May 2025.

### 2. Coinbase Advantages (Higher Score)
Coinbase provides superior **order management features** and **precision**.

*   **T2_005 (Timestamp Precision)**: Coinbase provides `TransactTime (60)` with microsecond precision (ISO 8601), meeting the rubric's highest standard. Kraken is limited to millisecond precision.
*   **T1_008 (Order Amendment)**: Coinbase supports a full `OrderCancelReplaceRequest (35=G)` workflow for spot. Kraken's amendment support is partially restricted in its unified documentation.
*   **T1_005 (Self-Trade Prevention)**: Coinbase supports more granular STP modes (D, O, N, B) at the order level via native tags.

### 3. Shared Industry Gaps (Both Scored No Credit)
Both exchanges fail to meet critical institutional standards in the following areas:

*   **Regulatory Reporting (T2_001/T2_002)**: Neither exchange provides `LastCapacity (29)` or `LastMkt (30)`. This lack of transparency force institutional users to manually reconcile "agency vs. principal" status and venue identifiers for MiFID II or equivalent reporting.
*   **Post-Trade Allocation (T3_002/T3_003)**: Neither exchange supports the `AllocationInstruction (35=J)` message. Large fund managers cannot use standard FIX workflows to allocate trades across sub-accounts post-execution.
*   **Compliance Hooks (T4_001/T4_002)**: Both lack the `Parties (453)` repeating group and on-chain wallet identifier mapping, creating a gap for automated AML/Travel Rule processing.
*   **Digital Asset Standards (Tier 5)**: Neither exchange has adopted **FIX EP273** (ratified) or **DAWG** digital asset identifier standards (DTI/ISO 24165).

---

### Institutional Recommendation

For an institution connecting from an equity-based OMS (e.g., Charles River or Bloomberg EMSX), **Kraken** currently presents fewer integration obstacles, primarily due to its support for standard FIX session management (`ResendRequest`). Traditional equity OMS systems are architected with the assumption that a FIX session is persistent and recoverable. Kraken’s ability to handle message gap-fills natively prevents the need for the institution to build custom, non-standard state-recovery logic (e.g., polling REST APIs for missed fills) that would be required for a Coinbase integration.

However, Kraken’s technical debt in timestamp precision and the lack of full order amendment flexibility on some tiers remain secondary friction points. Conversely, while Coinbase offers modern precision and better order management features, its "reset-on-logon" session model is a significant departure from standard institutional FIX practices. Institutions prioritizing regulatory reporting will find both venues equally challenging due to the mutual lack of `LastCapacity` and `LastMkt` tags, requiring custom "bridge" logic at the connectivity layer to populate these fields.
