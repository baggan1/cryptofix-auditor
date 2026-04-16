# CryptoFIX Auditor

The CryptoFIX Auditor is a tool designed to assess the institutional readiness of crypto exchange FIX API implementations. It audits specifications against a master rubric of 27 checks across four tiers, ranging from basic order lifecycles to advanced compliance like the Travel Rule.

## What This Tool Does
- **Extraction:** Automatically parses FIX API documentation (URLs or PDFs) to identify supported fields and tags.
- **Scoring:** Calculates scores based on a weighted rubric to determine a "grade" (e.g., Institutional Grade, Near-institutional).
- **Reporting:** Generates a professional "Rules of Engagement" (RoE) document detailing gaps and remediation steps.

## How to Run an Audit
Audits follow the `/cryptofix-audit-pipeline` workflow.

### Via URL
Provide the URL to the exchange's official FIX API documentation. The tool will crawl the introduction and all relevant sub-pages (Session, Order Entry, Market Data).

### Via PDF
Upload the FIX specification PDF to the workspace and provide the filename.

## File Naming Conventions
For multi-exchange audits, please use the following convention to keep the workspace organized:
- `extraction_{exchange}_{date}.json`
- `report_{exchange}_{date}.json`
- `roe_{exchange}_{date}.md`

## Contact
**Opound LLC**
Navilla Bagga — [navilla@opound.com](mailto:navilla@opound.com)
