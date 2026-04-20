# FIX extraction instructions

Read `cryptofix_master_rubric.json` first. Understand every check_id,
field_name, and scoring_logic before reading any spec page.

## Scoring rules
- `full_credit` — field explicitly documented with expected values and behavior
- `partial_credit` — mentioned but ambiguous, incomplete, or asset-class-limited
- `no_credit` — absent, or not clearly documented
- Default to `partial_credit` when unsure. Never infer from related fields.

## If spec_source is a URL
1. Fetch the intro/overview page first
2. Identify all linked sub-pages (NOS, ER, Cancel, Amend, Market Data, Session, Admin)
3. Fetch each sub-page individually — do not rely on the overview alone
4. Look for and fetch a "Rules of Engagement" or "Dictionary Downloads" link if present
5. If spot and futures have separate specs, fetch both

## If spec_source is a PDF filename
1. Read the file from the workspace
2. Extract all FIX tag documentation from the text
3. Use page numbers as evidence references

## Output format
Write `audits/SLUG/extraction_result.json` with this structure:
```json
{
  "exchange_name": "",
  "spec_source": "",
  "asset_classes_audited": [],
  "extraction_date": "",
  "extractor_notes": "",
  "checks": [
    {
      "check_id": "T1_001",
      "fix_tag": "35=D",
      "field_name": "NewOrderSingle",
      "status": "full_credit",
      "points_available": 5,
      "evidence": "",
      "asset_class_limitation": null,
      "custom_tag_notes": null
    }
  ]
}
```
Include all checks (T1 through T8). Never skip a check_id.
Use `no_credit` with `evidence: null` if nothing found.
